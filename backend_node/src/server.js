/**
 * TRAMITAI — API REST
 * Levanta en http://localhost:3000
 *
 * Endpoints:
 *   GET  /                      → estado del servicio
 *   POST /api/pjud/nombre       → búsqueda por nombre (persona natural)
 *   GET  /api/cache/stats       → estadísticas del caché
 */

require('dotenv').config();
const express     = require('express');
const cors        = require('cors');
const rateLimit   = require('express-rate-limit');
const logger      = require('./utils/logger');
const cache       = require('./utils/cache');
const { buscarPorNombre } = require('./scrapers/pjud');
const { consultarDatosBasicos: siiDatosBasicos, consultarDeudaPublica: siiDeudas } = require('./scrapers/sii');
const { consultarDeudaSimple: tgrDeudaSimple } = require('./scrapers/tgr');
const { declararF29 } = require('./scrapers/f29-sii');

const app  = express();
const PORT = process.env.PORT || 3000;

// ─── CORS ─────────────────────────────────────────────────────────────────────
const ALLOWED_ORIGINS = [
  process.env.CORS_ORIGIN,          // ej: https://tramitai.vercel.app
  process.env.CORS_ORIGIN_PREVIEW,  // ej: https://tramitai-git-main-*.vercel.app
  'http://localhost:3001',
  'http://localhost:3000',
].filter(Boolean);

app.use(cors({
  origin: (origin, cb) => {
    if (!origin) return cb(null, true); // server-to-server / curl / dev
    if (ALLOWED_ORIGINS.some(o => origin.startsWith(o))) return cb(null, true);
    logger.warn('CORS rechazado', { origin });
    cb(new Error(`CORS: origen no permitido — ${origin}`));
  },
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'X-API-Key'],
}));

// ─── Autenticación por API Key ────────────────────────────────────────────────
const SCRAPER_API_KEY = process.env.SCRAPER_API_KEY;

function requireApiKey(req, res, next) {
  if (!SCRAPER_API_KEY) {
    logger.warn('SCRAPER_API_KEY no configurada — endpoint desprotegido en dev');
    return next();
  }
  const key = req.headers['x-api-key'];
  if (!key || key !== SCRAPER_API_KEY) {
    logger.warn('API Key inválida o ausente', { ip: req.ip });
    return res.status(401).json({ error: 'No autorizado.' });
  }
  next();
}

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(express.json());

// Rate limiting: máximo 10 req/minuto por IP (el scraping es lento de todas formas)
const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  message: { error: 'Demasiadas solicitudes. Espera un momento.' },
  skip: () => process.env.NODE_ENV === 'test',
});
app.use('/api', limiter);

// Logger de requests
app.use((req, _res, next) => {
  logger.info(`${req.method} ${req.path}`, { ip: req.ip, body: req.body });
  next();
});

// ─── Rutas ────────────────────────────────────────────────────────────────────

app.get('/', (_req, res) => {
  res.json({
    servicio: 'TRAMITAI API',
    version: '0.1.0',
    estado: 'operativo',
    endpoints: {
      'POST /api/pjud/nombre': 'Busca causas en el Poder Judicial por nombre de persona',
      'POST /api/sii/basicos': 'Consulta datos básicos del contribuyente en SII',
      'POST /api/sii/deudas':  'Consulta deuda pública del contribuyente en SII',
      'POST /api/sii/f29':     'Realiza declaración mensual de impuestos Formulario 29 en el SII',
      'POST /api/tgr/deuda':   'Consulta deuda fiscal en Tesorería General de la República',
      'GET  /api/cache/stats':  'Estadísticas del caché',
    },
  });
});

/**
 * POST /api/pjud/nombre
 *
 * Body JSON:
 * {
 *   "nombre": "Juan",
 *   "apellidoPaterno": "González",
 *   "apellidoMaterno": "",    // opcional
 *   "anio": "2023",           // opcional
 *   "competencia": "civil",   // civil | laboral | familia | cobranza | penal | suprema | apelaciones
 *   "corte": ""               // opcional: "C.A. de Santiago"
 * }
 */
app.post('/api/pjud/nombre', requireApiKey, async (req, res) => {
  try {
    const { nombre, apellidoPaterno, apellidoMaterno, anio, competencia, corte } = req.body;

    // Validación básica
    if (!nombre || !apellidoPaterno) {
      return res.status(400).json({
        error: 'nombre y apellidoPaterno son requeridos',
      });
    }

    const params = {
      nombre: nombre.trim(),
      apellidoPaterno: apellidoPaterno.trim(),
      apellidoMaterno: (apellidoMaterno || '').trim(),
      anio: anio || '',
      competencia: (competencia || 'civil').toLowerCase(),
      corte: corte || '',
    };

    // Verificar caché
    const cached = cache.get(params);
    if (cached) {
      logger.info('Cache hit', { params });
      return res.json({ ...cached, _cache: true });
    }

    // Ejecutar scraper
    logger.info('Cache miss — iniciando scraper', { params });
    const resultado = await buscarPorNombre(params);

    // Guardar en caché
    cache.set(params, resultado);

    return res.json({ ...resultado, _cache: false });

  } catch (err) {
    logger.error('Error en búsqueda', { error: err.message, stack: err.stack });

    // Mensaje amigable al usuario
    if (err.message.includes('requerido')) {
      return res.status(400).json({ error: err.message });
    }
    if (err.message.includes('inválida')) {
      return res.status(400).json({ error: err.message });
    }

    return res.status(503).json({
      error: 'Error al consultar el Poder Judicial. El portal puede estar temporalmente no disponible.',
      detalle: process.env.NODE_ENV === 'development' ? err.message : undefined,
    });
  }
});

app.get('/api/cache/stats', (_req, res) => {
  res.json(cache.stats());
});

// 404
// ===== SII Routes =====
app.post('/api/sii/basicos', requireApiKey, async (req, res) => {
  try {
    const { rut } = req.body;
    if (!rut) return res.status(400).json({ error: 'RUT requerido' });
    logger.info('SII consulta basicos', { rut });
    const result = await siiDatosBasicos(rut);
    return res.json(result);
  } catch (err) {
    logger.error('Error SII basicos', { error: err.message });
    return res.status(503).json({ error: 'Error al consultar SII', detalle: process.env.NODE_ENV === 'development' ? err.message : undefined });
  }
});

app.post('/api/sii/deudas', requireApiKey, async (req, res) => {
  try {
    const { rut } = req.body;
    if (!rut) return res.status(400).json({ error: 'RUT requerido' });
    logger.info('SII consulta deuda publica', { rut });
    const result = await siiDeudas(rut);
    return res.json(result);
  } catch (err) {
    logger.error('Error SII deudas', { error: err.message });
    return res.status(503).json({ error: 'Error al consultar deudas SII', detalle: process.env.NODE_ENV === 'development' ? err.message : undefined });
  }
});

app.post('/api/sii/f29', requireApiKey, async (req, res) => {
  try {
    const { rut, periodo, codigos } = req.body;
    if (!rut || !periodo) {
      return res.status(400).json({ error: 'RUT y periodo son requeridos' });
    }
    logger.info('SII F29 declaracion solicitada', { rut, periodo, total_codigos: (codigos || []).length });
    const result = await declararF29({ rut, periodo, codigos });
    return res.json(result);
  } catch (err) {
    logger.error('Error F29 declaracion', { error: err.message });
    return res.status(err.message.includes('tributario no válido') ? 400 : 503).json({
      error: 'Error al declarar Formulario 29 en el SII',
      detalle: err.message
    });
  }
});

// ===== TGR Routes =====
app.post('/api/tgr/deuda', requireApiKey, async (req, res) => {
  try {
    const { rut } = req.body;
    if (!rut) return res.status(400).json({ error: 'RUT requerido' });
    logger.info('TGR consulta deuda', { rut });
    const result = await tgrDeudaSimple(rut);
    return res.json(result);
  } catch (err) {
    logger.error('Error TGR deuda', { error: err.message });
    return res.status(503).json({ error: 'Error al consultar TGR', detalle: process.env.NODE_ENV === 'development' ? err.message : undefined });
  }
});

// 404
app.use((_req, res) => {
  res.status(404).json({ error: 'Endpoint no encontrado' });
});

// ─── Start ────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  logger.info(`🚀 TRAMITAI API corriendo en http://localhost:${PORT}`);
});

module.exports = app;
