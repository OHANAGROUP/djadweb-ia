// src/core/causal-engine/causalExecutionEngine.ts
/**
 * CausalExecutionEngine — Orquestador del Multiverso Causal de Tramita OS.
 *
 * Simula todos los caminos futuros de la sesión activa, filtra las ramas inválidas
 * y clasifica las transiciones por su nivel de seguridad antes de la ejecución real.
 */

import { Session, SessionEvent } from '@/core/session-engine/sessionEngine'
import { ScenarioSimulator } from './scenarioSimulator'
import { ScenarioScorer, RankedScenario } from './scenarioScorer'
import { CausalGraph, CausalNode, CausalEdge } from './causalGraphBuilder'

export interface CausalExecutionResult {
  passed: boolean
  safestPath?: RankedScenario
  blockedPaths: RankedScenario[]
  fullGraph: CausalGraph
}

export class CausalExecutionEngine {
  private simulator: ScenarioSimulator

  constructor() {
    this.simulator = new ScenarioSimulator()
  }

  /**
   * Simula y evalúa el multiverso futuro a partir del estado real de la sesión.
   */
  public simulate(
    session: Session,
    events: SessionEvent[],
    proposedAction: string
  ): CausalExecutionResult {
    // 1. Simular ramificaciones candidatas
    const candidateActions = [
      proposedAction,
      '__ACTION__NEXT__',
      '__ACTION__PREV__',
      'PAYMENT_COMPLETED',
      'EXTERNAL_STATE_SYNCHRONIZED',
    ]
    // Remover duplicados para consistencia
    const actionPool = Array.from(new Set(candidateActions))

    const paths = this.simulator.simulateScenarios(session, events, actionPool)

    // 2. Puntuar y ordenar escenarios
    const simulations = paths.map(path => {
      const edge = path.edges[0]
      return {
        action: edge ? edge.action : 'unknown',
        path,
      }
    })

    const ranked = ScenarioScorer.rankScenarios(simulations)

    // 3. Estructurar el CausalGraph consolidado
    const nodesMap: Map<string, CausalNode> = new Map()
    const edges: CausalEdge[] = []

    for (const r of ranked) {
      for (const node of r.path.nodes) {
        nodesMap.set(node.id, node)
      }
      for (const edge of r.path.edges) {
        edges.push(edge)
      }
    }

    const fullGraph: CausalGraph = {
      nodes: Array.from(nodesMap.values()),
      edges,
    }

    const safestPath = ranked[0]
    const blockedPaths = ranked.filter(r => r.status === 'BLOCK')

    // R5 — Causal Precomputation Rule: El evento propuesto debe haber sido precomputado en el grafo
    const proposedSim = ranked.find(r => r.action === proposedAction)
    const passed = proposedSim ? proposedSim.status !== 'BLOCK' : false

    return {
      passed,
      safestPath,
      blockedPaths,
      fullGraph,
    }
  }
}
