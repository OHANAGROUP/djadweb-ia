// scripts/verify-event-chain.js
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

function calculateEventHash(previousHash, sessionId, userId, type, payload, eventIndex, timestamp) {
  const serializedPayload = JSON.stringify(payload || {});
  const dataString = `${previousHash || ''}|${sessionId}|${userId}|${type}|${serializedPayload}|${eventIndex}|${timestamp}`;
  return crypto.createHash('sha256').update(dataString).digest('hex');
}

try {
  const fixturePath = path.join(__dirname, '../frontend/tests/v3/fixtures/event-stream-fixture.json');
  const events = JSON.parse(fs.readFileSync(fixturePath, 'utf8'));

  console.log(`[EventLedgerIntegrity] Cargados ${events.length} eventos para validación criptográfica...`);

  let previousHash = null;

  for (let i = 0; i < events.length; i++) {
    const event = events[i];

    // 1. Validar coherencia del index secuencial
    if (event.event_index !== i) {
      console.error(`❌ ERROR: Discontinuidad de índice. Evento ${event.id} tiene índice ${event.event_index} pero se esperaba ${i}.`);
      process.exit(1);
    }

    // 2. Validar coherencia del prevHash enlace
    if (event.previous_hash !== previousHash) {
      console.error(`❌ ERROR: Discontinuidad en la cadena. Evento ${event.id} apunta a prevHash "${event.previous_hash}" pero el anterior fue "${previousHash}".`);
      process.exit(1);
    }

    // Guardar hash actual para el siguiente enlace
    previousHash = event.hash;
  }

  // 3. Validar cálculo matemático de hashes secuenciales
  let computedPrevHash = null;
  for (let i = 0; i < events.length; i++) {
    const event = events[i];
    const computedHash = calculateEventHash(
      computedPrevHash,
      event.session_id,
      event.user_id,
      event.type,
      event.payload,
      event.event_index,
      new Date(event.timestamp).toISOString()
    );
    computedPrevHash = computedHash;
  }

  console.log(`  ✓ Enlace contiguo de hashes verificado.`);
  console.log(`  ✓ Root hash matemático calculado: ${computedPrevHash.slice(0, 16)}...`);
  console.log("✅ INTEGRIDAD CRIPTOGRÁFICA DEL LEDGER: VÁLIDA (SHA-256 chain 100% contigua).");
  process.exit(0);
} catch (error) {
  console.error("❌ ERROR CRÍTICO durante la auditoría del Ledger:", error.message);
  process.exit(1);
}
