// src/core/causal-engine/scenarioSimulator.ts
/**
 * ScenarioSimulator — Motor de Simulación de Futuros Posibles y Poda Causal.
 *
 * Explora en seco (dry-run) las ramificaciones de transiciones a partir de acciones candidatas,
 * aplicando el InvariantRegistry para detectar y podar caminos inseguros o prohibidos.
 */

import { Session, SessionEvent } from '@/core/session-engine/sessionEngine'
import { InvariantRegistry, InvariantViolation } from '@/core/guardian/invariantRegistry'
import { CausalNode, CausalEdge, CausalGraphBuilder, CausalGraph } from './causalGraphBuilder'

export interface SimulatedPath {
  nodes: CausalNode[]
  edges: CausalEdge[]
  violations: InvariantViolation[]
  riskScore: number
  passed: boolean
}

export class ScenarioSimulator {
  private invariantRegistry: InvariantRegistry

  constructor() {
    this.invariantRegistry = new InvariantRegistry()
  }

  /**
   * Explora recursivamente el espacio de futuros de la sesión en base a un pool de acciones candidatas.
   */
  public simulateScenarios(
    session: Session,
    events: SessionEvent[],
    candidateActions: string[] = ['__ACTION__NEXT__', '__ACTION__PREV__', 'PAYMENT_COMPLETED', 'EXTERNAL_STATE_SYNCHRONIZED']
  ): SimulatedPath[] {
    const paths: SimulatedPath[] = []
    const rootNode = CausalGraphBuilder.createRootNode(session, [])

    for (const action of candidateActions) {
      // 1. Predecir mutaciones hipotéticas basadas en la acción
      let nextStep = session.current_step
      let nextProgress = session.progress
      let nextStatus: 'active' | 'paused' | 'completed' = session.status as any

      if (action === '__ACTION__NEXT__') {
        nextStep = 'declaration' // Simulación determinista simple
        nextProgress = 25
      } else if (action === '__ACTION__PREV__') {
        nextStep = 'onboarding'
        nextProgress = 0
      } else if (action === 'PAYMENT_COMPLETED') {
        nextStep = 'signature'
        nextProgress = 50
      } else if (action === 'EXTERNAL_STATE_SYNCHRONIZED') {
        nextStep = 'declaration'
        nextProgress = 25
      }

      // 2. Crear estado de sesión hipotético para validar contra invariantes
      const simulatedSession: Session = {
        ...session,
        current_step: nextStep,
        progress: nextProgress,
        status: nextStatus,
      }

      // 3. Evaluar Invariantes en seco (Dry-run logic)
      const violations = this.invariantRegistry.evaluate(simulatedSession, {
        type: action,
        payload: { transactionId: `sim-tx-${Date.now()}` },
        events,
      })

      const passed = violations.length === 0
      const criticalViolations = violations.filter(v => v.severity === 'critical')
      const riskScore = passed
        ? 0
        : criticalViolations.length * 50 + (violations.length - criticalViolations.length) * 10

      // Formatear snapshots
      const invariantsSnapshot = violations.map(v => ({
        id: v.invariantId,
        passed: false,
        violationAction: v.violationAction,
        description: v.description,
      }))

      // 4. Derivar nodo e edge en el grafo
      const { node, edge } = CausalGraphBuilder.deriveNode(
        rootNode,
        action,
        {
          currentStep: nextStep,
          progress: nextProgress,
          status: nextStatus,
        },
        invariantsSnapshot
      )

      paths.push({
        nodes: [rootNode, node],
        edges: [edge],
        violations,
        riskScore,
        passed,
      })
    }

    return paths
  }
}
