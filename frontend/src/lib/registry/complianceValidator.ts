import { TramiteDefinition } from './types'

export class ComplianceError extends Error {
  constructor(message: string) {
    super(`[Compliance Runtime Error] ${message}`)
    this.name = 'ComplianceError'
  }
}

/**
 * Valida un trámite contra las reglas del Protocolo Legal.
 * Si el trámite viola las reglas de "Ceguera Operativa" o "Falta de Consentimiento", lanza un error fatal.
 */
export function validateTramiteCompliance(tramite: TramiteDefinition) {
  // Regla 1: Trámites mutativos deben requerir consentimiento
  const hasMutativeSteps = tramite.steps.some(s => s.type === 'action' || s.type === 'validation')
  
  if (hasMutativeSteps && !tramite.requiresExplicitConsent) {
    throw new ComplianceError(`El trámite '${tramite.id}' tiene pasos mutativos pero requiresExplicitConsent es false.`)
  }

  // Regla 2: Si requiere consentimiento, debe haber un disclaimer legal explícito
  if (tramite.requiresExplicitConsent && (!tramite.legalDisclaimer || tramite.legalDisclaimer.trim() === '')) {
    throw new ComplianceError(`El trámite '${tramite.id}' requiere consentimiento explícito pero no tiene un 'legalDisclaimer' definido.`)
  }

  // Regla 3: Pasos mutativos deben tener advertencias de doble chequeo
  tramite.steps.forEach((step, index) => {
    if (step.type === 'action' || step.type === 'validation') {
      if (!step.warnings || step.warnings.length === 0) {
        throw new ComplianceError(`El trámite '${tramite.id}' falla en el paso ${index + 1} ('${step.id}'). Los pasos de tipo 'action' o 'validation' DEBEN tener al menos una advertencia ('warnings') indicando al usuario que revise antes de proceder.`)
      }
    }
  })

  // Trámite válido
  return true
}

/**
 * Valida un array completo de trámites
 */
export function validateRegistry(tramites: TramiteDefinition[]) {
  tramites.forEach(validateTramiteCompliance)
  return true
}
