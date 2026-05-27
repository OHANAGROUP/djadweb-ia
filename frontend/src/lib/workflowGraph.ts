// frontend/src/lib/workflowGraph.ts

const TRANSICIONES_PERMITIDAS: Record<string, string[]> = {
  'inicial': ['inicial', 'obtener_rut', 'validar_acteco', 'verificar_requisitos'],
  'obtener_rut': ['obtener_rut', 'validar_acteco', 'verificar_requisitos', 'inicial'],
  'validar_acteco': ['validar_acteco', 'verificar_requisitos', 'acreditacion_actividades', 'obtener_rut'],
  'verificar_requisitos': ['verificar_requisitos', 'acreditacion_actividades', 'tramite_completo', 'validar_acteco'],
  'acreditacion_actividades': ['acreditacion_actividades', 'tramite_completo', 'verificar_requisitos'],
  'tramite_completo': ['tramite_completo', 'inicial']
};

/**
 * Verifica si una transición entre dos etapas de la máquina de estados es legal.
 * Mitiga loops cognitivos no permitidos y desvíos semánticos.
 */
export function verificarTransicionEstado(etapaActual: string, etapaPropuesta: string): boolean {
  if (!etapaActual || !etapaPropuesta) return false;
  
  const actualLower = etapaActual.toLowerCase();
  const propuestaLower = etapaPropuesta.toLowerCase();

  // Si son idénticas, la transición es legal (idempotencia)
  if (actualLower === propuestaLower) return true;
  
  const destinosValidos = TRANSICIONES_PERMITIDAS[actualLower];
  if (!destinosValidos) {
    // Si la etapa actual no está en el mapa, registrar y permitir de forma tolerante para MVP
    console.warn(`Etapa actual [${etapaActual}] no registrada en el grafo de control. Permitiendo transición.`);
    return true;
  }
  
  return destinosValidos.includes(propuestaLower);
}
