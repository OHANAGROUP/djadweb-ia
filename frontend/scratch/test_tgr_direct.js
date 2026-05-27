const fetch = require('node-fetch');

async function testTGR() {
  console.log('⏳ Consultando deudas en TGR a través del Scraper en Render...');
  try {
    const res = await fetch('https://djadwebia-scraper.onrender.com/api/tgr/deuda', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': 'fdccdef4b312c22691b15f07bd0ca589856129187eaf60e2923a0f7fe5410864',
      },
      body: JSON.stringify({ rut: '13301638-4' }),
    });

    if (!res.ok) {
      console.error('❌ Error HTTP:', res.status, res.statusText);
      console.error(await res.text());
      return;
    }

    const data = await res.json();
    console.log('\n✅ RESULTADO OBTENIDO:');
    console.log(JSON.stringify(data, null, 2));
  } catch (err) {
    console.error('❌ Error de conexión:', err.message);
  }
}

testTGR();
