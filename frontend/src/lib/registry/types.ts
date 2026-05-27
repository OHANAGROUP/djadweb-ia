export type StepType = 'navigation' | 'login' | 'action' | 'validation' | 'information'

export interface StepDefinition {
  id: string
  title: string
  type: StepType
  instruction: string
  // Opcional: Contexto extra para mostrar al usuario, enlaces, etc.
  context?: string
  // Opcional: Recomendaciones o advertencias
  warnings?: string[]
}

export interface TramiteDefinition {
  id: string
  institution: 'SII' | 'TGR' | 'PJUD' | 'MIXTO' | 'DT' | 'REGISTRO_CIVIL' | 'MUNICIPALIDAD'
  goal: string
  description: string
  
  // Metadata Comercial y UX
  category: 'tributario' | 'legal' | 'laboral' | 'municipal' | 'empresa' | 'personal'
  frictionScore: number // 1 al 10 (10 es lo más doloroso)
  monetizationTier: 'free' | 'pro'
  
  // Compliance Flags (Anti-Automatización Ciega)
  requiresExplicitConsent: boolean
  legalDisclaimer?: string
  steps: StepDefinition[]
}
