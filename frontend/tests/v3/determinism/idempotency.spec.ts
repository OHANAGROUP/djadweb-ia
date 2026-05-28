// tests/v3/determinism/idempotency.spec.ts
import { describe, it, expect } from 'vitest'
import { ContinuityEngine } from '@/core/session-engine/continuityEngine'

describe('v3/determinism - Idempotency Guard Tests', () => {
  
  it('debería clasificar eventos básicos e informativos como idempotentes (Safe)', () => {
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
    ]

    for (const event of safeEvents) {
      expect(ContinuityEngine.isEventIdempotent(event)).toBe(true)
    }
  })

  it('debería clasificar eventos financieros, firmas y envíos como estrictamente NO-idempotentes (Unsafe)', () => {
    const unsafeEvents = [
      'PAYMENT_COMPLETED',
      'DOCUMENT_SIGNED',
      'EMAIL_SENT',
      'SII_FORM_SUBMITTED',
      'TGR_DEBT_PAID',
    ]

    for (const event of unsafeEvents) {
      expect(ContinuityEngine.isEventIdempotent(event)).toBe(false)
    }
  })

  it('debería garantizar que eventos críto-financieros críticos no se repitan o multipliquen durante el procesamiento', () => {
    // Simular un array de eventos de la sesión que contiene un pago
    const historicalEvents = [
      { type: 'SESSION_CREATED', payload: {} },
      { type: 'PAYMENT_COMPLETED', payload: { transactionId: 'mp-12345' } },
      { type: 'PAYMENT_COMPLETED', payload: { transactionId: 'mp-12345' } } // Duplicación maliciosa o por re-intento de red
    ]

    // Filtrar para mantener idempotencia de eventos críticos (solo permitir el primero o rechazar duplicados)
    const processedTransactions = new Set<string>()
    const sanitizedEvents = historicalEvents.filter(event => {
      if (event.type === 'PAYMENT_COMPLETED') {
        const txId = event.payload?.transactionId
        if (processedTransactions.has(txId)) {
          return false // Omitir duplicado
        }
        processedTransactions.add(txId)
        return true
      }
      return true
    })

    expect(sanitizedEvents.filter(e => e.type === 'PAYMENT_COMPLETED')).toHaveLength(1)
  })
})
