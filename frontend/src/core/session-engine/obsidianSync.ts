// frontend/src/services/obsidianSync.ts
/**
 * ObsidianSync — Motor de Sincronización para la Knowledge Layer de Obsidian.
 *
 * Escribe notas estructuradas en Markdown sobre el historial de sesiones,
 * reportes de auditoría y decisiones de diseño en el Obsidian Vault del proyecto.
 */

import * as fs from 'fs/promises'
import * as path from 'path'
import { Session, SessionEvent } from './sessionEngine'

const VAULT_ROOT = 'C:\\_AUTOMATIZAI\\03_PRODUCTOS\\tramita\\vault-tramita'

export class ObsidianSync {
  /**
   * Garantiza que el directorio del vault y sus subcarpetas existan.
   */
  private static async ensureDirectories() {
    const subfolders = ['sessions', 'trámites', 'audit', 'decisions', 'llm-logs']
    for (const folder of subfolders) {
      const fullPath = path.join(VAULT_ROOT, folder)
      await fs.mkdir(fullPath, { recursive: true })
    }
  }

  /**
   * Sincroniza una sesión completa y su Ledger de Eventos a una nota de Markdown.
   */
  public static async syncSession(session: Session, events: SessionEvent[]) {
    try {
      await ObsidianSync.ensureDirectories()

      const filePath = path.join(VAULT_ROOT, 'sessions', `session-${session.id}.md`)

      // Generar contenido Markdown
      const markdown = `---
type: session-log
id: ${session.id}
user_id: ${session.user_id}
tramite_id: ${session.tramite_id}
status: ${session.status}
progress: ${session.progress}%
started_at: ${session.started_at}
last_active_at: ${session.last_active_at}
---

# 📋 Bitácora de Sesión: ${session.tramite_id} — ID: \`${session.id}\`

## 🗂️ Metadatos Generales
- **Usuario**: \`${session.user_id}\`
- **Estado Actual**: \`${session.status.toUpperCase()}\`
- **Progreso**: \`${session.progress}%\`
- **Último Paso Completado**: \`${session.current_step}\`
- **Iniciada**: \`${new Date(session.started_at).toLocaleString('es-CL')}\`
- **Última Actividad**: \`${new Date(session.last_active_at).toLocaleString('es-CL')}\`

## 🧱 Ledger de Eventos (Event Store Chain)
A continuación se detalla la cadena cronológica append-only de eventos inyectados a Supabase. Cada nodo está enlazado criptográficamente por hash SHA-256.

| Índice | Fecha/Hora | Evento | Payload | Hash Criptográfico |
| :---: | :--- | :--- | :--- | :--- |
${events
  .map(
    e =>
      `| \`${e.event_index}\` | \`${new Date(e.timestamp).toLocaleTimeString('es-CL')}\` | **${
        e.type
      }** | \`${JSON.stringify(e.payload)}\` | \`${e.hash.slice(0, 16)}...\` |`
  )
  .join('\n')}

---
*Documento generado automáticamente por Tramita OS Engine.*
`

      await fs.writeFile(filePath, markdown, 'utf8')
      console.log(`[ObsidianSync] Sesión ${session.id} sincronizada correctamente en Markdown.`)
    } catch (err: any) {
      console.error('[ObsidianSync] Error sincronizando nota de sesión:', err.message)
    }
  }

  /**
   * Sincroniza un reporte de auditoría criptográfica.
   */
  public static async syncAuditReport(
    session: Session,
    integrity: { valid: boolean; errors: string[] }
  ) {
    try {
      await ObsidianSync.ensureDirectories()

      const filePath = path.join(VAULT_ROOT, 'audit', `audit-report-${session.id}.md`)

      const markdown = `---
type: audit-report
session_id: ${session.id}
valid_integrity: ${integrity.valid}
timestamp: ${new Date().toISOString()}
---

# 🔍 Reporte de Auditoría: Sesión \`${session.id}\`

- **Trámite**: \`${session.tramite_id}\`
- **Fecha de Verificación**: \`${new Date().toLocaleString('es-CL')}\`
- **Estado de Integridad**: ${
        integrity.valid
          ? '🟢 **VÁLIDO / SIN ALTERACIONES**'
          : '🔴 **CORRUPTO / POSIBLE MANIPULACIÓN**'
      }

## 📋 Detalle de Verificación Criptográfica
El AuditEngine verificó el ledger completo recalculando los hashes encadenados en base al Ledger de Supabase.

${
  integrity.valid
    ? '✓ Todos los hashes SHA-256 coinciden con el ledger de Supabase.\n✓ La secuencia anterior (`previous_hash` ➔ `hash`) es 100% contigua.'
    : `Se detectaron las siguientes inconsistencias en la cadena:\n\n${integrity.errors
        .map(e => `- ⚠️ ${e}`)
        .join('\n')}`
}

---
*Audit log firmado por Tramita AuditEngine.*
`

      await fs.writeFile(filePath, markdown, 'utf8')
    } catch (err: any) {
      console.error('[ObsidianSync] Error escribiendo reporte de auditoría:', err.message)
    }
  }
}
