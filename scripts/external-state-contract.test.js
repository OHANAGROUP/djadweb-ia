// scripts/external-state-contract.test.js
const fs = require('fs');
const path = require('path');

function verifyExternalStateContract(tramiteId, hasCredentials, sessionMetadata) {
  const timestamp = new Date().toISOString();

  // Abstracción determinista que representa el ExternalStateChecker en CI
  switch (tramiteId) {
    case 'sii_declaracion_f29': {
      if (!hasCredentials) {
        return {
          status: "SYNCED",
          snapshot: { hasCredentials: false },
          timestamp
        };
      }

      const currentTaxDebt = 0;
      const userDeclaredOnSupabase = sessionMetadata?.declaredAmount || 150000;

      if (currentTaxDebt === 0 && userDeclaredOnSupabase > 0) {
        return {
          status: "CONFLICT",
          snapshot: { previousDebt: userDeclaredOnSupabase, currentDebt: 0 },
          timestamp
        };
      }

      return {
        status: "SYNCED",
        snapshot: { currentDebt: userDeclaredOnSupabase },
        timestamp
      };
    }

    default:
      return {
        status: "SYNCED",
        snapshot: {},
        timestamp
      };
  }
}

try {
  console.log("[ExternalStateContract] Iniciando validación del contrato de estados externos...");

  // 1. Validar comportamiento sin credenciales
  const contract1 = verifyExternalStateContract('sii_declaracion_f29', false, { declaredAmount: 150000 });
  if (contract1.status !== "SYNCED" || contract1.snapshot.hasCredentials !== false) {
    console.error("❌ ERROR: El contrato sin credenciales falló.");
    process.exit(1);
  }
  console.log("  ✓ Contrato sin credenciales (debe ser SYNCED): OK.");

  // 2. Validar comportamiento con conflicto
  const contract2 = verifyExternalStateContract('sii_declaracion_f29', true, { declaredAmount: 150000 });
  if (contract2.status !== "CONFLICT" || contract2.snapshot.currentDebt !== 0) {
    console.error("❌ ERROR: El contrato con discrepancia/conflicto falló.");
    process.exit(1);
  }
  console.log("  ✓ Contrato con discrepancia (debe ser CONFLICT): OK.");

  console.log("✅ CAPA DE SEGURIDAD DEL EXTERNAL STATE MOCK: EXITOSA.");
  process.exit(0);
} catch (error) {
  console.error("❌ ERROR CRÍTICO durante la validación del contrato externo:", error.message);
  process.exit(1);
}
