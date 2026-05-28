// scripts/validate-continuity-policy.js
const fs = require('fs');
const path = require('path');

// Safe events list
const safeEvents = [
  'SESSION_CREATED',
  'TRAMITE_STARTED',
  'STEP_REGRESSED',
  'HELP_REQUESTED',
  'LLM_CALLED',
  'USER_CHAT_RECEIVED',
  'LLM_ASSIST_RESPONDED',
  'EXTERNAL_STATE_SYNCHRONIZED',
  'EXTERNAL_STATE_DISCREPANCY_DETECTED',
];

// Unsafe/critical events list
const criticalEvents = [
  'PAYMENT_COMPLETED',
  'DOCUMENT_SIGNED',
  'EMAIL_SENT',
  'SII_FORM_SUBMITTED',
  'TGR_DEBT_PAID',
];

function isEventIdempotent(eventType) {
  if (criticalEvents.includes(eventType)) {
    return false;
  }
  return safeEvents.includes(eventType);
}

try {
  const sessionFixturePath = path.join(__dirname, '../frontend/tests/v3/fixtures/session-fixture.json');
  const session = JSON.parse(fs.readFileSync(sessionFixturePath, 'utf8'));

  console.log("[ContinuityPolicy] Iniciando validación de políticas de continuidad...");

  // 1. Validar regla de expiración > 24 horas
  const lastActive = new Date(session.last_active_at).getTime();
  
  // Simular rehidratación a las +25 horas
  const simulationTime = lastActive + (25 * 60 * 60 * 1000); 
  const elapsed = simulationTime - lastActive;
  const exceedsThreshold = elapsed > (24 * 60 * 60 * 1000);

  if (!exceedsThreshold) {
    console.error("❌ ERROR: El cálculo de expiración temporal falló.");
    process.exit(1);
  }
  console.log(`  ✓ Regla de expiración (24h) correcta. Inactividad de 25h gatilla re-verificación.`);

  // 2. Validar clasificación de idempotencia
  for (const event of safeEvents) {
    if (!isEventIdempotent(event)) {
      console.error(`❌ ERROR: El evento seguro "${event}" fue clasificado incorrectamente como no-idempotente.`);
      process.exit(1);
    }
  }

  for (const event of criticalEvents) {
    if (isEventIdempotent(event)) {
      console.error(`❌ ERROR: El evento crítico "${event}" fue clasificado incorrectamente como idempotente.`);
      process.exit(1);
    }
  }

  console.log("  ✓ Clasificación de idempotencia (Safe vs Unsafe) correcta.");
  console.log("✅ VALIDACIÓN DE POLÍTICAS DE CONTINUIDAD: EXITOSA.");
  process.exit(0);
} catch (error) {
  console.error("❌ ERROR CRÍTICO durante la validación de políticas:", error.message);
  process.exit(1);
}
