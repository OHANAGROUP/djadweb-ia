// scripts/keepalive.js
const URL = 'https://dejadwebiar.vercel.app/api/health?ping=true';
const INTERVAL = 10 * 60 * 1000; // 10 minutos

console.log(`[Keep-Alive] Iniciando pinger para ${URL} cada 10 minutos...`);

async function ping() {
  try {
    const res = await fetch(URL);
    const json = await res.json();
    console.log(`[${new Date().toISOString()}] Ping exitoso! Status: ${json.status}, Latencia Scraper: ${json.services?.scraper?.latency_ms || 'N/A'}ms`);
  } catch (err) {
    console.error(`[${new Date().toISOString()}] Error en Ping: ${err.message}`);
  }
}

// Primer ping inmediato
ping();

// Intervalo recurrente
setInterval(ping, INTERVAL);
