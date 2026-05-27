require('dotenv').config({ path: '.env.local' });
const { procesarMensajeChat } = require('./src/services/copilot.ts');
const { createAdminClient } = require('./src/lib/supabase-server.ts');

async function testLocal() {
  console.log('Iniciando prueba local de Copilot con Gemini...');
  try {
    const userId = 'c4c5ec58-e200-474f-834b-c6ee0ab75e49'; 
    const supabase = createAdminClient();
    
    // Crear una sesión limpia
    const { data: session } = await supabase.from('chat_sessions').insert({
      user_id: userId,
      title: 'Test Local Gemini',
      workflow_type: 'default',
      current_stage: 'inicial',
      confidence_score: 1.0,
      workflow_version: 'v2',
      missing_requirements: []
    }).select().single();
    
    console.log('Sesión:', session.id);
    
    const respuesta = await procesarMensajeChat(session.id, userId, '¿Me revisas mi deuda en TGR para el RUT 76.001.382-K?');
    console.log('\n✅ Respuesta Final:\n', respuesta);
  } catch (err) {
    console.error('❌ Error fatal:', err);
  }
}

testLocal();
