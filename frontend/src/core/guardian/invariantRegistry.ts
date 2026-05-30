// src/core/guardian/invariantRegistry.ts
/**
 * InvariantRegistry — Single Source of Truth (SSoT) de Reglas e Invariantes del Sistema.
 *
 * Registra, evalúa y formaliza las reglas críticas del Workflow OS.
 */

import { Session, SessionEvent } from '@/core/session-engine/sessionEngine'

export interface Invariant {
  id: string
  domain: 'continuity' | 'idempotency' | 'drift' | 'rollback'
  severity: 'soft' | 'hard' | 'critical'
  condition: (
    state: Session,
    event: { type: string; payload?: any; events: SessionEvent[] }
  ) => boolean
  violationAction: 'block' | 'rollback' | 'warn'
  description: string
}

export interface InvariantViolation {
  invariantId: string
  domain: 'continuity' | 'idempotency' | 'drift' | 'rollback'
  severity: 'soft' | 'hard' | 'critical'
  violationAction: 'block' | 'rollback' | 'warn'
  description: string
}

export class InvariantRegistry {
  private invariants: Invariant[] = []

  constructor() {
    this.registerDefaultInvariants()
  }

  /**
   * Registra una nueva invariante en caliente.
   */
  public register(invariant: Invariant): void {
    this.invariants.push(invariant)
  }

  /**
   * Carga las reglas operacionales no-negociables de Tramita OS.
   */
  private registerDefaultInvariants(): void {
    // R1 — Idempotency is absolute
    this.register({
      id: 'R1_ABS_IDEMPOTENCY',
      domain: 'idempotency',
      severity: 'critical',
      description: 'Ningún evento UNSAFE puede ejecutarse dos veces. Si se detecta duplicación -> BLOCK automático.',
      violationAction: 'block',
      condition: (state, event) => {
        const unsafeTypes = ['PAYMENT_COMPLETED', 'DOCUMENT_SIGNED', 'SII_FORM_SUBMITTED', 'TGR_DEBT_PAID']
        if (unsafeTypes.includes(event.type)) {
          const transactionId = event.payload?.transactionId || event.payload?.eventId || event.payload?.id
          if (transactionId) {
            const duplicate = event.events.some(e => {
              const tid = e.payload?.transactionId || e.payload?.eventId || e.payload?.id
              return tid === transactionId && e.type === event.type
            })
            if (duplicate) return false // Violado
          }
        }
        return true
      },
    })

    // R2 — Drift is terminal
    this.register({
      id: 'R2_TERMINAL_DRIFT',
      domain: 'drift',
      severity: 'critical',
      description: 'Si EXTERNAL_DRIFT + STATE_DRIFT simultáneo -> FREEZE SESSION.',
      violationAction: 'block',
      condition: (state, event) => {
        const hasExternalDrift = state.session_metadata?.requiresStepRegression === true

        let hasStateDrift = false
        const stepEvents = event.events.filter(e => e.type === 'STEP_ADVANCED' || e.type === 'TRAMITE_STARTED')
        if (stepEvents.length > 0) {
          const lastEvent = stepEvents[stepEvents.length - 1]
          const expectedStep =
            lastEvent.type === 'STEP_ADVANCED'
              ? lastEvent.payload.currentStep
              : lastEvent.payload.starting_step

          if (state.current_step !== expectedStep) {
            hasStateDrift = true
          }
        }

        if (hasExternalDrift && hasStateDrift) {
          return false // Violado
        }
        return true
      },
    })

    // R3 — Continuity override rule
    this.register({
      id: 'R3_CONTINUITY_OVERRIDE',
      domain: 'continuity',
      severity: 'critical',
      description: 'Si requires_revalidation = true -> ningún flujo puede continuar sin la verificación de ExternalStateChecker.',
      violationAction: 'block',
      condition: (state, event) => {
        const isProgressingEvent = [
          'STEP_ADVANCED',
          'TRAMITE_STARTED',
          '__ACTION__NEXT__',
          '__ACTION__PREV__',
        ].includes(event.type)

        if (state.requires_revalidation === true && isProgressingEvent) {
          return false // Violado
        }
        return true
      },
    })

    // R4 — Rollback safety
    this.register({
      id: 'R4_ROLLBACK_SAFETY',
      domain: 'rollback',
      severity: 'critical',
      description: 'Nunca borrar eventos. Solo mover punteros.',
      violationAction: 'rollback',
      condition: (state, event) => {
        return true
      },
    })

    // R5 — Causal Precomputation Rule
    this.register({
      id: 'R5_CAUSAL_PRECOMPUTATION',
      domain: 'drift',
      severity: 'critical',
      description: 'Todo estado ejecutable debe existir previamente en el grafo causal simulado.',
      violationAction: 'block',
      condition: (state, event) => {
        if (event.payload?.precomputed === false) {
          return false // Violación
        }
        return true
      },
    })

    // R6 — Safe Branch Selection Rule
    this.register({
      id: 'R6_SAFE_BRANCH_SELECTION',
      domain: 'drift',
      severity: 'critical',
      description: 'Solo ramas con riskScore < threshold pueden ser ejecutadas en LIVE mode.',
      violationAction: 'block',
      condition: (state, event) => {
        if (event.payload?.simulatedRisk !== undefined && event.payload?.simulatedRisk >= 50) {
          return false // Violación
        }
        return true
      },
    })
  }

  /**
   * Evalúa el estado actual de la sesión y del evento propuesto.
   */
  public evaluate(
    state: Session,
    event: { type: string; payload?: any; events: SessionEvent[] }
  ): InvariantViolation[] {
    const violations: InvariantViolation[] = []
    for (const inv of this.invariants) {
      const passed = inv.condition(state, event)
      if (!passed) {
        violations.push({
          invariantId: inv.id,
          domain: inv.domain,
          severity: inv.severity,
          violationAction: inv.violationAction,
          description: inv.description,
        })
      }
    }
    return violations
  }
}
