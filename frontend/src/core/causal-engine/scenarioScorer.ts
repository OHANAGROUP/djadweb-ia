// src/core/causal-engine/scenarioScorer.ts
/**
 * ScenarioScorer — Evaluador e Inteligencia de Puntuación de Futuros Cansales.
 *
 * Mide el impacto normativo, el riesgo operativo y la frustración del contribuyente en cada
 * rama del multiverso, ordenándolas de mayor a menor seguridad.
 */

import { SimulatedPath } from './scenarioSimulator'

export interface ScenarioScore {
  successProbability: number
  riskScore: number
  complianceScore: number
  costImpact: number
  userFrustrationIndex: number
}

export interface RankedScenario {
  action: string
  score: ScenarioScore
  path: SimulatedPath
  status: 'ALLOW' | 'BLOCK' | 'BRANCH_SAFE'
}

export class ScenarioScorer {
  /**
   * Puntuación multidimensional de un camino simulado.
   */
  public static scorePath(path: SimulatedPath, actionName: string): ScenarioScore {
    const totalViolations = path.violations.length
    const criticalViolations = path.violations.filter(v => v.severity === 'critical').length

    // 1. Success Probability
    let successProbability = 100
    if (criticalViolations > 0) {
      successProbability = 0
    } else if (totalViolations > 0) {
      successProbability = 50
    }

    // 2. Risk Score
    const riskScore = path.riskScore

    // 3. Compliance Score
    let complianceScore = 100 - totalViolations * 25
    if (complianceScore < 0) complianceScore = 0

    // 4. Cost Impact
    let costImpact = 0
    if (actionName === 'PAYMENT_COMPLETED') {
      costImpact = 15000 // Impacto financiero positivo de pago
    }

    // 5. User Frustration Index
    let userFrustrationIndex = 0
    if (totalViolations > 0) {
      userFrustrationIndex = 80 // Frustración alta si se bloquea o hay advertencias
    } else if (actionName === '__ACTION__PREV__') {
      userFrustrationIndex = 30 // Leve frustración al retroceder paso
    }

    return {
      successProbability,
      riskScore,
      complianceScore,
      costImpact,
      userFrustrationIndex,
    }
  }

  /**
   * Clasifica e indexa las ramas de mayor a menor seguridad operacional.
   */
  public static rankScenarios(simulations: { action: string; path: SimulatedPath }[]): RankedScenario[] {
    const ranked: RankedScenario[] = simulations.map(sim => {
      const score = ScenarioScorer.scorePath(sim.path, sim.action)
      
      let status: 'ALLOW' | 'BLOCK' | 'BRANCH_SAFE' = 'ALLOW'
      if (score.riskScore >= 50) {
        status = 'BLOCK'
      } else if (score.riskScore > 0) {
        status = 'BRANCH_SAFE'
      }

      return {
        action: sim.action,
        score,
        path: sim.path,
        status,
      }
    })

    // Ordenar: primero los permitidos con menor score de riesgo
    return ranked.sort((a, b) => {
      if (a.status !== b.status) {
        if (a.status === 'ALLOW') return -1
        if (b.status === 'ALLOW') return 1
        if (a.status === 'BRANCH_SAFE') return -1
        if (b.status === 'BRANCH_SAFE') return 1
      }
      return a.score.riskScore - b.score.riskScore
    })
  }
}
