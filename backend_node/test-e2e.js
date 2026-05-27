/**
 * Test E2E para TRAMITAI API
 *
 * Levanta el servidor, ejecuta tests contra los endpoints,
 * y valida funcionamiento básico incluyendo caché
 */

require('dotenv').config();
const http = require('http');
const { spawn } = require('child_process');

const BASE_URL = 'http://localhost:3000';
let serverProcess = null;

// ─── Utilidades ───────────────────────────────────────────────────────────

function makeRequest(method, path, body = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        ...(process.env.SCRAPER_API_KEY ? { 'X-API-Key': process.env.SCRAPER_API_KEY } : {})
      },
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve({ status: res.statusCode, body: json });
        } catch (e) {
          resolve({ status: res.statusCode, body: data });
        }
      });
    });

    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ─── Tests ────────────────────────────────────────────────────────────────

async function runTests() {
  console.log('\n🧪 TRAMITAI E2E Test Suite\n');
  console.log('═'.repeat(60));

  // Esperar a que el servidor esté listo
  console.log('⏳ Esperando que el servidor esté listo...');
  for (let i = 0; i < 10; i++) {
    try {
      await makeRequest('GET', '/');
      console.log('✅ Servidor listo\n');
      break;
    } catch (e) {
      if (i === 9) throw new Error('Servidor no respondió después de 10 intentos');
      await sleep(500);
    }
  }

  let passed = 0;
  let failed = 0;

  // Test 1: GET /
  try {
    console.log('Test 1: GET / (health check)');
    const res = await makeRequest('GET', '/');

    if (res.status === 200 && res.body.servicio === 'TRAMITAI API') {
      console.log('  ✅ Status: 200');
      console.log(`  ✅ Service name: ${res.body.servicio}`);
      console.log(`  ✅ Version: ${res.body.version}`);
      passed++;
    } else {
      console.log('  ❌ Respuesta inesperada');
      failed++;
    }
  } catch (err) {
    console.log(`  ❌ Error: ${err.message}`);
    failed++;
  }
  console.log();

  // Test 2: POST /api/pjud/nombre - búsqueda válida
  try {
    console.log('Test 2: POST /api/pjud/nombre (búsqueda válida)');
    const searchPayload = {
      nombre: 'Juan',
      apellidoPaterno: 'González',
      apellidoMaterno: 'Pérez',
      competencia: 'civil',
    };

    const res = await makeRequest('POST', '/api/pjud/nombre', searchPayload);

    if (res.status === 200) {
      console.log('  ✅ Status: 200');
      console.log(`  ✅ Cache: ${res.body._cache ? 'HIT' : 'MISS'}`);
      passed++;
    } else {
      console.log(`  ❌ Status inesperado: ${res.status}`);
      failed++;
    }
  } catch (err) {
    console.log(`  ❌ Error: ${err.message}`);
    failed++;
  }
  console.log();

  // Test 3: POST /api/pjud/nombre - falta nombre
  try {
    console.log('Test 3: POST /api/pjud/nombre (validación - falta nombre)');
    const invalidPayload = {
      apellidoPaterno: 'González',
    };

    const res = await makeRequest('POST', '/api/pjud/nombre', invalidPayload);

    if (res.status === 400 && res.body.error) {
      console.log('  ✅ Status: 400 (esperado)');
      console.log(`  ✅ Error message: ${res.body.error}`);
      passed++;
    } else {
      console.log(`  ❌ Debería retornar 400, obtuvo ${res.status}`);
      failed++;
    }
  } catch (err) {
    console.log(`  ❌ Error: ${err.message}`);
    failed++;
  }
  console.log();

  // Test 4: POST /api/pjud/nombre - falta apellido paterno
  try {
    console.log('Test 4: POST /api/pjud/nombre (validación - falta apellidoPaterno)');
    const invalidPayload = {
      nombre: 'Juan',
    };

    const res = await makeRequest('POST', '/api/pjud/nombre', invalidPayload);

    if (res.status === 400) {
      console.log('  ✅ Status: 400 (esperado)');
      passed++;
    } else {
      console.log(`  ❌ Debería retornar 400, obtuvo ${res.status}`);
      failed++;
    }
  } catch (err) {
    console.log(`  ❌ Error: ${err.message}`);
    failed++;
  }
  console.log();

  // Test 5: GET /api/cache/stats
  try {
    console.log('Test 5: GET /api/cache/stats');
    const res = await makeRequest('GET', '/api/cache/stats');

    if (res.status === 200 && typeof res.body.keys === 'number') {
      console.log('  ✅ Status: 200');
      console.log(`  ✅ Cache size: ${res.body.keys} entries`);
      passed++;
    } else {
      console.log('  ❌ Respuesta inesperada');
      failed++;
    }
  } catch (err) {
    console.log(`  ❌ Error: ${err.message}`);
    failed++;
  }
  console.log();

  // Test 6: Cache hit verification (misma búsqueda dos veces)
  try {
    console.log('Test 6: Cache hit verification');
    const searchPayload = {
      nombre: 'María',
      apellidoPaterno: 'López',
      competencia: 'laboral',
    };

    const res1 = await makeRequest('POST', '/api/pjud/nombre', searchPayload);
    const res2 = await makeRequest('POST', '/api/pjud/nombre', searchPayload);

    if (res1.status === 200 && res2.status === 200) {
      const isMiss1 = res1.body._cache === false;
      const isHit2 = res2.body._cache === true;

      if (isMiss1 && isHit2) {
        console.log('  ✅ Primera búsqueda: MISS');
        console.log('  ✅ Segunda búsqueda: HIT');
        passed++;
      } else {
        console.log(`  ❌ Cache behavior inesperado: 1=${res1.body._cache}, 2=${res2.body._cache}`);
        failed++;
      }
    } else {
      console.log('  ❌ Las búsquedas no retornaron 200');
      failed++;
    }
  } catch (err) {
    console.log(`  ❌ Error: ${err.message}`);
    failed++;
  }
  console.log();

  // Test 7: 404 para endpoint no existente
  try {
    console.log('Test 7: 404 para endpoint no existente');
    const res = await makeRequest('GET', '/api/inexistente');

    if (res.status === 404) {
      console.log('  ✅ Status: 404 (esperado)');
      passed++;
    } else {
      console.log(`  ❌ Debería retornar 404, obtuvo ${res.status}`);
      failed++;
    }
  } catch (err) {
    console.log(`  ❌ Error: ${err.message}`);
    failed++;
  }
  console.log();

  // Test 8: POST /api/sii/basicos - invalid RUT structure
  try {
    console.log('Test 8: POST /api/sii/basicos (RUT structure validation)');
    const res = await makeRequest('POST', '/api/sii/basicos', { rut: '123' });

    if (res.status === 503 || res.status === 400) {
      console.log(`  ✅ Status: ${res.status} (esperado para RUT inválido)`);
      console.log(`  ✅ Error message: ${res.body.error || res.body}`);
      passed++;
    } else {
      console.log(`  ❌ Obtuvo status inesperado: ${res.status}`);
      failed++;
    }
  } catch (err) {
    console.log(`  ❌ Error: ${err.message}`);
    failed++;
  }
  console.log();

  // Test 9: POST /api/tgr/deuda - invalid RUT structure
  try {
    console.log('Test 9: POST /api/tgr/deuda (RUT structure validation)');
    const res = await makeRequest('POST', '/api/tgr/deuda', { rut: '' });

    if (res.status === 400) {
      console.log('  ✅ Status: 400 (esperado por RUT faltante)');
      console.log(`  ✅ Error message: ${res.body.error}`);
      passed++;
    } else {
      console.log(`  ❌ Obtuvo status inesperado: ${res.status}`);
      failed++;
    }
  } catch (err) {
    console.log(`  ❌ Error: ${err.message}`);
    failed++;
  }
  console.log();

  // Test 10: POST /api/sii/f29 - exitoso con datos válidos de prueba (Modo Test)
  try {
    console.log('Test 10: POST /api/sii/f29 (flujo exitoso - Sin Movimiento)');
    const f29Payload = {
      rut: '76.001.382-K',
      periodo: '04-2026',
      codigos: []
    };

    const res = await makeRequest('POST', '/api/sii/f29', f29Payload);

    if (res.status === 200 && res.body.comprobante && res.body.estado === 'Recibida sin pago') {
      console.log('  ✅ Status: 200');
      console.log(`  ✅ Comprobante generado: ${res.body.comprobante}`);
      console.log(`  ✅ Estado de recepción: ${res.body.estado}`);
      passed++;
    } else {
      console.log(`  ❌ Obtuvo status inesperado: ${res.status} o respuesta incorrecta`, res.body);
      failed++;
    }
  } catch (err) {
    console.log(`  ❌ Error: ${err.message}`);
    failed++;
  }
  console.log();

  // Test 11: POST /api/sii/f29 - periodo no válido
  try {
    console.log('Test 11: POST /api/sii/f29 (validación de período incorrecto)');
    const f29Payload = {
      rut: '76.001.382-K',
      periodo: '13-2026',
      codigos: []
    };

    const res = await makeRequest('POST', '/api/sii/f29', f29Payload);

    if (res.status === 400 && res.body.detalle && res.body.detalle.includes('tributario no válido')) {
      console.log('  ✅ Status: 400 (esperado por período inválido)');
      console.log(`  ✅ Mensaje de error: ${res.body.detalle}`);
      passed++;
    } else {
      console.log(`  ❌ Debería retornar 400 por período inválido, obtuvo ${res.status}`);
      failed++;
    }
  } catch (err) {
    console.log(`  ❌ Error: ${err.message}`);
    failed++;
  }
  console.log();

  // ─── Resumen ───────────────────────────────────────────────────────────
  console.log('═'.repeat(60));
  console.log(`\n📊 Resultados: ${passed} passed, ${failed} failed\n`);

  if (failed === 0) {
    console.log('✅ Todos los tests pasaron!\n');
    process.exit(0);
  } else {
    console.log(`❌ ${failed} test(s) fallaron\n`);
    process.exit(1);
  }
}

// ─── Startup ───────────────────────────────────────────────────────────────

async function main() {
  try {
    // Levantar el servidor
    console.log('🚀 Levantando servidor...');
    serverProcess = spawn('node', ['src/server.js'], {
      stdio: 'pipe',
      cwd: process.cwd(),
      env: { ...process.env, NODE_ENV: 'test' },
    });

    serverProcess.stdout.on('data', (data) => {
      console.log(`[SERVER] ${data.toString().trim()}`);
    });

    serverProcess.stderr.on('data', (data) => {
      console.error(`[SERVER ERROR] ${data.toString().trim()}`);
    });

    // Dar tiempo al servidor para iniciar y luego ejecutar tests
    await sleep(2000);
    await runTests();

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    // Limpiar: matar el proceso del servidor
    if (serverProcess) {
      serverProcess.kill();
    }
  }
}

main();
