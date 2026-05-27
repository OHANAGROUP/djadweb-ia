const fetch = require('node-fetch');
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'process.env.NEXT_PUBLIC_SUPABASE_URL || ''';
const supabaseKey = 'sb_publishable_g6-YofKpQE5D-wmqyPNUyw_YB8UVZr_';
const supabase = createClient(supabaseUrl, supabaseKey);

async function testE2E() {
  console.log('1. Iniciando sesión...');
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email: 'ppalominos@hotmail.com',
    password: 'AdminDejadwebiar2026!'
  });

  if (authError) return console.error('❌ Error de autenticación:', authError.message);
  
  const session = authData.session;
  console.log('✅ Token obtenido.');

  // Crear la cookie esperada por @supabase/ssr (formato estándar)
  const sessionString = JSON.stringify(session);
  const encodedSession = encodeURIComponent(sessionString);
  const cookieName = 'sb-luuicelooavahedkhlsw-auth-token';
  
  // Para cookies chunked (Next.js auth helpers hace esto a veces, pero enviamos el chunk 0)
  const cookieHeader = `${cookieName}=${encodedSession}`;

  console.log('\n2. Llamando a /api/chat...');
  
  // Como `procesarMensajeChat` busca la sesión, si no le pasamos sessionId creará una nueva.
  const chatPayload = {
    message: 'Quiero ver si el RUT 13.301.638-4 tiene deudas en la Tesorería General de la República.'
  };

  try {
    const chatResponse = await fetch('http://localhost:3001/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': cookieHeader
      },
      body: JSON.stringify(chatPayload)
    });

    if (!chatResponse.ok) {
      console.error(`❌ Error en la API: ${chatResponse.status}`);
      console.error(await chatResponse.text());
      return;
    }

    const data = await chatResponse.json();
    console.log('✅ Respuesta del Copiloto:\n');
    console.log('--------------------------------------------------');
    console.log(data.content);
    console.log('--------------------------------------------------');
    
  } catch (err) {
    console.error('❌ Excepción:', err);
  }
}

testE2E();
