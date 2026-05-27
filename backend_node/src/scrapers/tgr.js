const { chromium } = require('playwright');
const cheerio = require('cheerio');
const logger = require('../utils/logger');
const cache = require('../utils/cache');

const TGR_BASE = 'https://www.tgr.cl';
const TIMEOUT = 30000;

function normalizeRut(rut) {
  return rut.replace(/[^0-9kK]/g, '').toUpperCase();
}

const CONFIG = {
  RETRY_MAX: 3,
  RETRY_BASE_MS: 1000
};

async function withRetry(fn, label = 'op') {
  for (let attempt = 1; attempt <= CONFIG.RETRY_MAX; attempt++) {
    try {
      return await fn();
    } catch (err) {
      const delay = CONFIG.RETRY_BASE_MS * Math.pow(2, attempt - 1);
      logger.warn(`[${label}] Intento ${attempt}/${CONFIG.RETRY_MAX} fallido — reintentando en ${delay}ms`, {
        error: err.message
      });
      if (attempt < CONFIG.RETRY_MAX) {
        await new Promise(resolve => setTimeout(resolve, delay));
      } else {
        throw err;
      }
    }
  }
}

async function consultarDeudaSimple(rut) {
  const rutNorm = normalizeRut(rut);
  const cacheKey = `tgr:deuda:${rutNorm}`;
  const cached = cache.get(cacheKey);
  if (cached) { logger.info('TGR cache hit', { rut: rutNorm }); return cached; }

  try {
    const resultado = await withRetry(async () => {
      let browser;
      try {
        browser = await chromium.launch({
          headless: true,
          args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
        });
        const context = await browser.newContext({
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        });
        const page = await context.newPage();
        
        await page.goto(`${TGR_BASE}/tramites/consulta-deuda`, { waitUntil: 'networkidle', timeout: TIMEOUT });
        await page.fill('input[name="rut"]', rutNorm);
        await page.click('button[type="submit"]');
        try {
          await page.waitForSelector('.deuda-item, table tbody tr, .alert, .mensaje, .no-deuda', { timeout: 10000 });
        } catch (_) {
          logger.warn('TGR waitForSelector timeout — continuing with current page content');
        }
        
        const html = await page.content();
        const $ = cheerio.load(html);
        
        const deudas = [];
        let totalDeuda = 0;
        
        $('.deuda-item, table tbody tr').each((i, row) => {
          const cols = $(row).find('td');
          if (cols.length >= 3) {
            const monto = parseInt($(cols[1]).text().replace(/[^0-9]/g, '')) || 0;
            deudas.push({
              concepto: $(cols[0]).text().trim(),
              monto,
              estado: $(cols[2]).text().trim()
            });
            totalDeuda += monto;
          }
        });
        
        return {
          rut: rutNorm,
          tieneDeuda: deudas.length > 0,
          totalDeuda,
          deudas
        };
      } finally {
        if (browser) await browser.close();
      }
    }, `TGR:${rutNorm}`);

    cache.set(cacheKey, resultado, 86400);
    return resultado;
  } catch (err) {
    logger.error('TGR consultarDeudaSimple error', { rut: rutNorm, error: err.message });
    throw new Error('Error al consultar TGR: ' + err.message);
  }
}

// CLI test
if (require.main === module) {
  (async () => {
    const rut = process.argv[2] || '11111111-1';
    try {
      const result = await consultarDeudaSimple(rut);
      console.log(JSON.stringify(result, null, 2));
    } catch (e) {
      console.error('Error:', e.message);
    }
  })();
}

module.exports = { consultarDeudaSimple };
