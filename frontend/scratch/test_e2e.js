const fetch = require('node-fetch');
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'process.env.NEXT_PUBLIC_SUPABASE_URL || ''';
const supabaseKey = 'sb_publishable_g6-YofKpQE5D-wmqyPNUyw_YB8UVZr_';
const supabase = createClient(supabaseUrl, supabaseKey);

async function testE2E() {
  console.log('1. Iniciando sesión con la cuenta...');
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email: 'ppalominos@hotmail.com',
    password: 'AdminDejadwebiar2026!'
  });

  if (authError) {
    console.error('❌ Error de autenticación:', authError.message);
    return;
  }
  
  console.log('✅ Sesión iniciada correctamente. Token obtenido.');
  const token = authData.session.access_token;

  console.log('\n2. Enviando mensaje al Copiloto (API de Chat en Producción)...');
  const chatPayload = {
    messages: [
      { role: 'user', content: '¿Puedes buscar la deuda de TGR para el RUT 76.001.382-K?' }
    ]
  };

  try {
    const chatResponse = await fetch('https://dejadwebiar.vercel.app/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(chatPayload)
    });

    if (!chatResponse.ok) {
      console.error(`❌ Error en la API de Chat: ${chatResponse.status} ${chatResponse.statusText}`);
      const text = await chatResponse.text();
      console.error('Detalle:', text);
      return;
    }

    console.log('✅ Respuesta recibida del Copiloto:\n');
    
    // La respuesta de Vercel AI SDK es un stream. 
    // Vamos a leer los fragmentos de texto.
    const body = chatResponse.body;
    let fullResponse = '';
    
    for await (const chunk of body) {
      const text = chunk.toString();
      // El stream devuelve cosas como 0:"Hola", etc.
      // Hacemos una limpieza básica para ver el texto.
      const matches = text.match(/0:"([^"]+)"/g);
      if (matches) {
        matches.forEach(m => {
          try {
            fullResponse += JSON.parse(m.substring(2));
          } catch(e) {}
        });
      } else {
        fullResponse += text;
      }
    }
    
    console.log('--------------------------------------------------');
    console.log(fullResponse.replace(/0:"/g, '').replace(/"\n/g, '').replace(/\\n/g, '\n').substring(0, 1000) + '...');
    console.log('--------------------------------------------------');
    
  } catch (err) {
    console.error('❌ Excepción durante la petición de chat:', err);
  }
}

testE2E();
