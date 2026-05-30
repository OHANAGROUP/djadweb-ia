// src/core/guardian/proofLogger.ts
/**
 * ProofLogger — Generador de Certificados de Seguridad y Logs Verificables (Proof Logs).
 *
 * Registra cada evaluación formal de invariantes y la exporta al Obsidian Vault.
 */

import * as fs from 'fs/promises'
import * as path from 'path'
import { InvariantViolation } from './invariantRegistry'

export interface ProofLog {
  sessionId: string
  eventId: string
  eventType: string
  invariantsEvaluated: string[]
  passed: boolean
  violations: InvariantViolation[]
  hashStateBefore: string | null
  hashStateAfter: string | null
  timestamp: string
}

const VAULT_ROOT = 'C:\\_AUTOMATIZAI\\03_PRODUCTOS\\tramita\\vault-tramita'

export class ProofLogger {
  /**
   * Asegura la existencia del directorio de proofs en el Vault.
   */
  private static async ensureDirectories() {
    const proofFolder = path.join(VAULT_ROOT, 'proofs')
    await fs.mkdir(proofFolder, { recursive: true }).catch(() => {})
  }

  /**
   * Escribe y sincroniza una bitácora de seguridad formal en Obsidian.
   */
  public static async logProof(proof: ProofLog): Promise<void> {
    try {
      await ProofLogger.ensureDirectories()

      const filename = `proof-${proof.sessionId}-${Date.now()}.md`
      const filePath = path.join(VAULT_ROOT, 'proofs', filename)

      const markdown = `---
type: safety-proof-log
session_id: ${proof.sessionId}
event_id: ${proof.eventId}
event_type: ${proof.eventType}
passed: ${proof.passed}
timestamp: ${proof.timestamp}
---

# 🛡️ Safety Proof Log: Sesión \`${proof.sessionId}\`

## 📊 Resumen de Ejecución
- **ID Evento:** \`${proof.eventId}\`
- **Tipo de Evento:** \`${proof.eventType}\`
- **Estado de Seguridad (Proof):** ${proof.passed ? '🟢 **PASSED / SAFE**' : '🔴 **VIOLATED / UNSAFE**'}
- **Timestamp:** \`${new Date(proof.timestamp).toLocaleString('es-CL')}\`

## 🎛️ Invariantes Evaluadas
${proof.invariantsEvaluated.map(id => `- \`${id}\``).join('\n')}

${
  proof.passed
    ? '✓ Todas las invariantes de sistema se cumplen sin desviaciones.'
    : `## ⚠️ Violaciones Detectadas\n\n${proof.violations
        .map(
          v =>
            `- **[\`${v.invariantId}\`]** (${v.domain}) / Severity: \`${v.severity}\` / Action: \`${v.violationAction}\` - *${v.description}*`
        )
        .join('\n')}`
}

## 🔐 Estados Criptográficos
- **Hash Pre-Estado:** \`${proof.hashStateBefore || 'none'}\`
- **Hash Post-Estado:** \`${proof.hashStateAfter || 'none'}\`

---
*Safety Proof Log generado por Tramita OS Invariant Enforcement Core.*
`
      await fs.writeFile(filePath, markdown, 'utf8')
      console.log(`[ProofLogger] Safety Proof Log escrito correctamente para sesión ${proof.sessionId}`)
    } catch (err: any) {
      console.error('[ProofLogger] Error escribiendo log de seguridad en Obsidian:', err.message)
    }
  }
}
