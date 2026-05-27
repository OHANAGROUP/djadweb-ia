// Cargamos variables de entorno manualmente desde .env.local
require('dotenv').config({ path: '.env.local' });

// Para evitar errores en modulos que usan TS paths, podemos ejecutar esto con ts-node.
// Pero como estamos en un entorno con Next.js, ts-node puede dar problemas con @/lib/...
// Vamos a usar ts-node y registrar los paths
const tsConfigPaths = require('tsconfig-paths');
const tsConfig = require('../tsconfig.json');
tsConfigPaths.register({
  baseUrl: './',
  paths: tsConfig.compilerOptions.paths
});

require('ts-node').register({
  transpileOnly: true,
  compilerOptions: {
    module: 'commonjs'
  }
});

const { procesarMensajeChat } = require('./src/services/copilot');

async function testLocal() {
  console.log('Iniciando prueba local de Copilot...');
  try {
    // Usamos el ID de usuario que acabamos de crear en BD
    const userId = 'c4c5ec58-e200-474f-834b-c6ee0ab75e49'; 
    const sessionId = 'sesion-test-123'; // Esto fallará si no hay sesión, así que mejor no pasamos o creamos una
    
    // Mejor aún, usamos supabase-admin localmente para crear una sesión
    const { createAdminClient } = require('./src/lib/supabase-server');
    const supabase = createAdminClient();
    
    const { data: session } = await supabase.from('chat_sessions').insert({
      user_id: userId,
      title: 'Test',
      workflow_type: 'default'
    }).select().single();
    
    if (!session) {
      console.error('Error creando sesión');
      return;
    }
    
    console.log('Sesión creada:', session.id);
    const respuesta = await procesarMensajeChat(session.id, userId, '¿Me revisas mi deuda en TGR para el RUT 76.001.382-K?');
    console.log('\nRespuesta del Copiloto:\n', respuesta);
  } catch (err) {
    console.error('Error fatal:', err);
  }
}

testLocal();
