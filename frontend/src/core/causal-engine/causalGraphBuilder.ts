// src/core/causal-engine/causalGraphBuilder.ts
/**
 * CausalGraphBuilder — Generador del Grafo Causal del Flujo de Trámites.
 *
 * Mapea el espacio de estados y transiciones posibles a partir del estado de la sesión actual,
 * estructurando los nodos (estados predichos) y aristas (acciones causales) del multiverso.
 */

import { Session } from '@/core/session-engine/sessionEngine'

export interface InvariantSnapshot {
  id: string
  passed: boolean
  violationAction?: 'block' | 'rollback' | 'warn'
  description: string
}

export interface CausalNode {
  id: string
  sessionId: string
  currentStep: string
  progress: number
  status: 'active' | 'paused' | 'completed'
  hash: string
  timestamp: string
  invariantsSnapshot: InvariantSnapshot[]
}

export interface CausalEdge {
  from: string // ID del CausalNode origen
  to: string   // ID del CausalNode destino
  action: string // Comando de interacción o chat
  probability: number // 1.0 (determínista en v1)
  riskScore: number
}

export interface CausalGraph {
  nodes: CausalNode[]
  edges: CausalEdge[]
}

export class CausalGraphBuilder {
  /**
   * Crea un nodo inicial a partir del estado real de la sesión.
   */
  public static createRootNode(session: Session, invariants: InvariantSnapshot[] = []): CausalNode {
    return {
      id: `node-root-${session.id}`,
      sessionId: session.id,
      currentStep: session.current_step,
      progress: session.progress,
      status: session.status as any,
      hash: session.session_metadata?.lastValidHash || 'root-seed-hash',
      timestamp: session.last_active_at,
      invariantsSnapshot: invariants,
    }
  }

  /**
   * Predice y construye un nodo futuro dado un nodo origen y una mutación.
   */
  public static deriveNode(
    from: CausalNode,
    action: string,
    mutations: Partial<CausalNode>,
    invariants: InvariantSnapshot[] = []
  ): { node: CausalNode; edge: CausalEdge } {
    const nodeId = `node-derived-${from.sessionId}-${action.toLowerCase()}-${Date.now()}-${Math.round(Math.random() * 1000)}`
    
    const node: CausalNode = {
      id: nodeId,
      sessionId: from.sessionId,
      currentStep: mutations.currentStep || from.currentStep,
      progress: mutations.progress !== undefined ? mutations.progress : from.progress,
      status: mutations.status || from.status,
      hash: mutations.hash || `hash-derived-${action.toLowerCase()}-${Date.now().toString(36)}`,
      timestamp: new Date().toISOString(),
      invariantsSnapshot: invariants,
    }

    const criticalViolations = invariants.filter(inv => !inv.passed && inv.violationAction === 'block')
    const riskScore = invariants.length === 0
      ? 0
      : criticalViolations.length * 50 + (invariants.length - criticalViolations.length) * 10

    const edge: CausalEdge = {
      from: from.id,
      to: nodeId,
      action,
      probability: 1.0,
      riskScore,
    }

    return { node, edge }
  }
}
