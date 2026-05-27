/**
 * Scraper SII - Servicio de Impuestos Internos de Chile
 *
 * NOTA: El SII chileno usa Clave Unica (gobierno) o Clave Tributaria (SII)
 * para operaciones autenticadas. Este scraper usa endpoints PUBLICOS
 * que solo requieren RUT para consultas basicas.
 *
 * Para consultas autenticadas (deudas detalladas, guias de despacho,
 * IVA, etc.) se necesita integracion con Clave Unica, lo cual requiere
 * un flujo OAuth 2.0 que no esta implementado en este scraper.
 */

const { chromium } = require('playwright');
const cheerio = require('cheerio');
const logger = require('../utils/logger');
const cache = require('../utils/cache');

const SII_BASE = 'https://zeus.sii.cl';
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
      if (
        err.message.includes('no es válido') || 
        err.message.includes('no registrado') || 
        err.message.includes('No registrado') || 
        err.message.includes('no está registrado')
      ) {
        throw err;
      }
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

/**
 * Consulta datos basicos de una empresa por RUT (publico, sin auth)
 * Usa el portal publico SII: https://zeus.sii.cl/cvc/stc/stc.html
 */
async function consultarDatosBasicos(rut) {
  const rutNorm = normalizeRut(rut);
  const cacheKey = `sii:basicos:${rutNorm}`;
  const cached = cache.get(cacheKey);
  if (cached) { logger.info('SII cache hit', { rut: rutNorm }); return cached; }

  try {
    const datos = await withRetry(async () => {
      let browser;
      try {
        browser = await chromium.launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] });
        const context = await browser.newContext({
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          locale: 'es-CL',
          timezoneId: 'America/Santiago'
        });
        const page = await context.newPage();

        logger.info('Navegando a SII noauthz...', { rut: rutNorm });
        await page.goto('https://www2.sii.cl/stc/noauthz', { waitUntil: 'networkidle', timeout: TIMEOUT });
        await page.waitForTimeout(1000);

        // Escribir el RUT usando el native setter para integrarse con Vue/React reactivo
        logger.info('Escribiendo RUT y gatillando eventos...', { rut: rutNorm });
        await page.evaluate((rutVal) => {
          const input = document.querySelector('input.rut-form');
          if (!input) throw new Error('No se encontró el campo de RUT en SII');
          
          const descriptor = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value');
          if (descriptor && descriptor.set) {
            descriptor.set.call(input, rutVal);
          } else {
            input.value = rutVal;
          }
          input.dispatchEvent(new Event('input', { bubbles: true }));
          input.dispatchEvent(new Event('change', { bubbles: true }));
          input.dispatchEvent(new Event('blur', { bubbles: true }));
        }, rutNorm);

        await page.waitForTimeout(500);

        // Verificar si se levantó error de validación inmediato
        const validationError = await page.evaluate(() => {
          const el = document.querySelector('.input-errors');
          if (el && window.getComputedStyle(el).display !== 'none') {
            return el.innerText.trim();
          }
          return null;
        });

        if (validationError) {
          throw new Error(`Validación de RUT fallida: ${validationError}`);
        }

        // Hacer click en Consultar
        logger.info('Haciendo click en Consultar...');
        await page.click('input[name="Consultar"]');

        // Esperar a que cargue la respuesta o aparezca error
        logger.info('Esperando respuesta del SII...');
        
        // Esperar a que se cargue la sección de resultados o aparezca un error de validación posterior
        await page.waitForFunction(() => {
          const text = document.body.innerText;
          return text.includes('Nombre o Razón Social:') || text.includes('no es válido') || text.includes('no está registrado') || text.includes('ocurrió un error');
        }, { timeout: 15000 }).catch(() => {});

        const bodyText = await page.evaluate(() => document.body.innerText);

        // Verificar errores
        if (bodyText.includes('El Rut ingresado no es válido') || bodyText.includes('no es válido')) {
          throw new Error('El RUT ingresado no es válido en el Servicio de Impuestos Internos.');
        }
        if (bodyText.includes('no registrado') || bodyText.includes('No registrado') || bodyText.includes('no está registrado')) {
          throw new Error('El RUT consultado no registra actividades o no está registrado en las bases de datos del SII.');
        }

        if (!bodyText.includes('Nombre o Razón Social:')) {
          throw new Error('No se pudo obtener respuesta del SII o la consulta expiró.');
        }

        const matchValue = (regex) => {
          const m = bodyText.match(regex);
          return m ? m[1].trim() : '';
        };

        const res = {
          rut: matchValue(/RUT Contribuyente:\s*(.+)/i) || rutNorm,
          razonSocial: matchValue(/Nombre o Razón Social:\s*(.+)/i),
          inicioActividades: matchValue(/Fecha de Inicio de Actividades:\s*(.+)/i),
          estado: matchValue(/Contribuyente presenta Inicio de Actividades:\s*(.+)/i) === 'SI' ? 'Vigente con Inicio de Actividades' : 'Sin Inicio de Actividades',
          actividad: 'Consultar portal para actividades detalladas',
          direccion: '',
          comuna: ''
        };

        logger.info('Datos SII extraídos con éxito:', res);
        return res;
      } finally {
        if (browser) await browser.close();
      }
    }, `SII_BASICOS:${rutNorm}`);

    cache.set(cacheKey, datos, 86400); // Cache 24h
    return datos;
  } catch (err) {
    logger.error('SII consultarDatosBasicos error', { rut: rutNorm, error: err.message });
    throw new Error('Error al consultar datos basicos SII: ' + err.message);
  }
}

/**
 * Consulta deuda fiscal por RUT (experimental)
 * NOTA: Para deudas detalladas con monto exacto se necesita Clave Unica.
 * Esta funcion usa el portal publico de consulta SII si esta disponible.
 */
async function consultarDeudaPublica(rut) {
  const rutNorm = normalizeRut(rut);
  const cacheKey = `sii:deuda:${rutNorm}`;
  const cached = cache.get(cacheKey);
  if (cached) { logger.info('SII deuda cache hit', { rut: rutNorm }); return cached; }

  try {
    const result = await withRetry(async () => {
      let browser;
      try {
        browser = await chromium.launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] });
        const context = await browser.newContext();
        const page = await context.newPage();

        // Intento de consulta publica de deuda en SII
        await page.goto('https://www.sii.cl/valores_y_fechas/', { waitUntil: 'networkidle', timeout: TIMEOUT });
        await page.waitForTimeout(2000);

        const html = await page.content();
        const $ = cheerio.load(html);

        return {
          rut: rutNorm,
          consultadoEn: new Date().toISOString(),
          fuente: 'SII - Portal Publico',
          deudaDisponible: false,
          mensaje: 'Para consultar deudas detalladas se necesita Clave Unica. Puedes hacerlo directamente en https://www.sii.cl/ o consultar el TGR para deudas fiscales.',
          urlOficial: 'https://www.sii.cl/'
        };
      } finally {
        if (browser) await browser.close();
      }
    }, `SII_DEUDA:${rutNorm}`);

    cache.set(cacheKey, result, 3600);
    return result;
  } catch (err) {
    logger.error('SII consultarDeudaPublica error', { rut: rutNorm, error: err.message });
    return {
      rut: rutNorm,
      error: 'No se pudo consultar deuda SII',
      sugerencia: 'Intenta en https://www.sii.cl/ con tu Clave Unica'
    };
  }
}

// CLI test
if (require.main === module) {
  (async () => {
    const rut = process.argv[2] || '11111111-1';
    try {
      console.log('Consultando datos basicos SII para RUT:', rut);
      const datos = await consultarDatosBasicos(rut);
      console.log(JSON.stringify(datos, null, 2));
    } catch (e) {
      console.error('Error:', e.message);
    }
  })();
}

module.exports = { consultarDatosBasicos, consultarDeudaPublica };
