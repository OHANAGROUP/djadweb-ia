import { TramiteDefinition } from './types'

export const TRAMITES: TramiteDefinition[] = [
  {
    id: 'sii_inicio_actividades',
    institution: 'SII',
    goal: 'Realizar Inicio de Actividades',
    description: 'Guía paso a paso para formalizar tu negocio o servicios profesionales ante el Servicio de Impuestos Internos.',
    category: 'empresa',
    frictionScore: 8,
    monetizationTier: 'pro',
    requiresExplicitConsent: true,
    legalDisclaimer: 'Declaro entender que la ejecución de este trámite es mi responsabilidad tributaria directa. Tramita actúa solo como asistente procedimental.',
    steps: [
      {
        id: 'info_inicio_rapido',
        title: 'Resumen del Trámite en 60 segundos',
        type: 'information',
        instruction: 'El Inicio de Actividades es la declaración formal ante el SII de que comenzarás actividades económicas. Requerirás:\n1. Clave Única o Tributaria.\n2. Saber qué Códigos de Actividad Económica utilizarás.\n3. Acreditar un Domicilio Tributario.\nEste proceso es gratuito y se realiza 100% online.',
        warnings: ['Te guiaremos paso a paso, tú realizarás la declaración en el portal oficial.']
      },
      {
        id: 'nav_sii_inicio',
        title: 'Ingresar al portal del SII',
        type: 'navigation',
        instruction: 'Ingresa a sii.cl y dirígete a "Servicios Online". Luego selecciona "RUT e Inicio de actividades".',
        context: 'https://homer.sii.cl/'
      },
      {
        id: 'login_sii_inicio',
        title: 'Autenticación con Clave Única o Tributaria',
        type: 'login',
        instruction: 'Si eres Persona Natural (independiente), ingresa con tu Clave Única o Tributaria. Si vas a iniciar actividades para una Empresa (SpA, EIRL, SRL) que ya constituiste en Tu Empresa en Un Día, ingresa con el RUT de la empresa y su Clave Tributaria (o con tu RUT si eres el representante legal).',
        warnings: ['Asegúrate de estar autenticado con el RUT correcto (el tuyo o el de tu empresa).']
      },
      {
        id: 'action_inicio_ingreso',
        title: 'Abrir formulario de Inicio de Actividades',
        type: 'action',
        instruction: 'Dentro de "RUT e Inicio de actividades", selecciona "Inicio de actividades" y luego haz clic en "Ingresar inicio de actividades".',
        warnings: ['Verifica que estás actuando bajo el RUT correcto antes de proceder.']
      },
      {
        id: 'action_inicio_actividades',
        title: 'Seleccionar Código de Actividad Económica',
        type: 'action',
        instruction: 'Selecciona la actividad económica según el listado oficial del SII. El SII define los códigos de actividades económicas. Selecciona la que corresponda a tu actividad real.',
        context: 'https://www.sii.cl/ayudas/ayudas_por_servicios/1956-codigos-1959.html',
        warnings: ['Verifica si tu actividad requiere acreditar título profesional o permiso especial.']
      },
      {
        id: 'action_inicio_domicilio',
        title: 'Declarar Domicilio Tributario',
        type: 'action',
        instruction: 'Declara el domicilio tributario según los requisitos oficiales del SII. Deberás indicar tu rol en la propiedad (propietario, arrendatario, cedido).',
        context: 'https://www.sii.cl/preguntas_frecuentes/rut_e_inicio_de_actividades/001_102_0946.htm',
        warnings: ['El SII podría requerir adjuntar documentación comprobatoria según el tipo de ocupación.']
      },
      {
        id: 'validation_inicio',
        title: 'Confirmar y Enviar',
        type: 'validation',
        instruction: 'Revisa el resumen de tus actividades, domicilio y régimen tributario sugerido. Si todo está correcto, presiona "Enviar" y guarda el comprobante de Declaración de Inicio de Actividades.',
        warnings: ['Verifica exhaustivamente todos los datos ingresados antes de confirmar.']
      }
    ]
  },
  {
    id: 'sii_declaracion_f29',
    institution: 'SII',
    goal: 'Declarar IVA (Formulario 29)',
    description: 'Guía paso a paso para realizar la declaración mensual de impuestos en el SII.',
    category: 'tributario',
    frictionScore: 7,
    monetizationTier: 'free',
    requiresExplicitConsent: true,
    legalDisclaimer: 'Declaro entender que soy el único responsable de la exactitud de mi Formulario 29. Tramita no verifica los montos declarados.',
    steps: [
      {
        id: 'nav_sii',
        title: 'Ingresar al portal del SII',
        type: 'navigation',
        instruction: 'Ingresa a la página oficial del SII (sii.cl) y dirígete al menú "Servicios Online".',
        context: 'https://homer.sii.cl/'
      },
      {
        id: 'login_sii',
        title: 'Iniciar sesión',
        type: 'login',
        instruction: 'Ingresa con el RUT y Clave Tributaria de la empresa (o tu RUT personal si eres persona natural con inicio de actividades).',
        warnings: ['No uses la Clave Única para trámites de empresa si no tienes delegación.']
      },
      {
        id: 'nav_f29',
        title: 'Ir a Declaración Mensual',
        type: 'navigation',
        instruction: 'En el menú de "Servicios Online", selecciona "Impuestos Mensuales" > "Declaración mensual (F29)" > "Declarar IVA (F29)".'
      },
      {
        id: 'action_f29',
        title: 'Seleccionar periodo y revisar propuesta',
        type: 'action',
        instruction: 'Selecciona el mes a declarar. El SII mostrará una propuesta basada en tu Registro de Compras y Ventas (RCV). Revisa que las ventas cuadren con tus boletas y facturas emitidas.',
        warnings: ['Verifica facturas de compra pendientes de acuse de recibo antes de aceptar la propuesta.']
      },
      {
        id: 'validation_f29',
        title: 'Enviar y Pagar',
        type: 'validation',
        instruction: 'Si los montos son correctos, presiona "Enviar Declaración". Si hay pago asociado, el sistema te redirigirá a Tesorería o al portal de pagos de tu banco.',
        warnings: ['Comprueba que el monto a pagar coincida con tu cálculo contable.']
      }
    ]
  },
  {
    id: 'sii_certificado_situacion_tributaria',
    institution: 'SII',
    goal: 'Obtener certificado de situación tributaria',
    description: 'Guía para descargar el certificado oficial que acredita el estado de un contribuyente.',
    category: 'tributario',
    frictionScore: 2,
    monetizationTier: 'free',
    requiresExplicitConsent: true,
    legalDisclaimer: 'Entiendo que estoy descargando documentación oficial de mi situación tributaria.',
    steps: [
      {
        id: 'nav_sii_cert',
        title: 'Ingresar al portal del SII',
        type: 'navigation',
        instruction: 'Ingresa a sii.cl y ve a "Servicios Online".'
      },
      {
        id: 'login_sii_cert',
        title: 'Iniciar sesión',
        type: 'login',
        instruction: 'Autentícate con RUT y clave.'
      },
      {
        id: 'action_cert',
        title: 'Descargar Certificado',
        type: 'action',
        instruction: 'Navega a "Situación Tributaria" > "Certificados" y genera tu documento. El archivo se descargará en formato PDF.',
        warnings: ['Este documento es público, pero maneja información sensible de tu estado tributario.']
      }
    ]
  },
  {
    id: 'tgr_consulta_deuda',
    institution: 'TGR',
    goal: 'Consultar y Pagar Deuda Fiscal',
    description: 'Guía para verificar el estado de tus deudas fiscales, contribuciones o multas en la Tesorería General de la República.',
    category: 'tributario',
    frictionScore: 6,
    monetizationTier: 'free',
    requiresExplicitConsent: true,
    legalDisclaimer: 'Comprendo que el pago final lo efectuaré en las pasarelas oficiales de la TGR y que Tramita actúa solo de puente informativo.',
    steps: [
      {
        id: 'info_tgr_rapido',
        title: 'Resumen del Trámite en 60 segundos',
        type: 'information',
        instruction: 'Este trámite te permite conocer deudas vencidas con el Fisco (ej. IVA no pagado, contribuciones atrasadas, multas laborales). Requerirás:\n1. Clave Única o Clave Tributaria (SII).\n2. El RUT del deudor.\nTramita no ejecuta el pago, solo te guía hasta la pasarela oficial del Estado.',
        warnings: ['Si tienes deuda vencida hace mucho tiempo, podría estar en etapa de Cobranza Judicial.']
      },
      {
        id: 'nav_tgr',
        title: 'Ingresar al portal de la TGR',
        type: 'navigation',
        instruction: 'Ingresa a tgr.cl y dirígete al menú "Pagos y Deudas". Luego selecciona "Pago de impuestos y deudas fiscales".',
        context: 'https://www.tgr.cl/pagos-y-deudas/'
      },
      {
        id: 'login_tgr',
        title: 'Iniciar Sesión',
        type: 'login',
        instruction: 'Haz clic en "Ingresar". Puedes usar tu Clave Única (recomendado para personas naturales) o tu Clave Tributaria del SII (recomendado para empresas).',
        warnings: ['Para deudas de empresa, siempre ingresa con las credenciales o representación de la empresa.']
      },
      {
        id: 'action_tgr_cert',
        title: 'Revisar Certificado de Deudas',
        type: 'action',
        instruction: 'Una vez dentro, el sistema consolidará todas tus deudas fiscales. Podrás ver Folios, montos originales y multas/intereses acumulados.',
        context: 'Revisa cuidadosamente el origen de cada deuda (ej. F29, Impuesto a la Renta, Multa Dirección del Trabajo).',
        warnings: ['Revisa detalladamente el origen de cada deuda antes de proceder al pago.']
      },
      {
        id: 'validation_tgr',
        title: 'Generar Cupón de Pago o Pagar Online',
        type: 'validation',
        instruction: 'Selecciona las deudas que deseas saldar. Puedes pagarlas inmediatamente a través del portal (Webpay/Bancos) o generar un "Cupón de Pago" para ir físicamente a un banco/Sencillito.',
        warnings: ['La TGR ofrece convenios de pago si no puedes pagar el total. Busca la opción "Convenios de Pago" en el menú principal si lo necesitas.']
      }
    ]
  },
  {
    id: 'pjud_consulta_causas',
    institution: 'PJUD',
    goal: 'Revisar Causas Judiciales Públicas',
    description: 'Consulta causas en los juzgados civiles, laborales o penales a través de la Oficina Judicial Virtual.',
    category: 'legal',
    frictionScore: 5,
    monetizationTier: 'free',
    requiresExplicitConsent: true,
    legalDisclaimer: 'Reconozco que estoy accediendo a bases de datos públicas del Poder Judicial. Tramita no es responsable de la exactitud de los resultados legales.',
    steps: [
      {
        id: 'info_pjud_rapido',
        title: 'Resumen del Trámite en 60 segundos',
        type: 'information',
        instruction: 'La Oficina Judicial Virtual permite consultar cualquier causa pública en tribunales chilenos. Requerirás:\n1. El RUT o el Nombre de la persona o empresa que deseas buscar.\n2. Conocer aproximadamente en qué año pudo iniciarse la causa.\nNo necesitas Clave Única para causas públicas (Civil, Laboral, Cobranza, Penal). Solo se requiere clave para causas de Familia o causas reservadas.',
        warnings: ['Tramita te guiará para que uses el buscador público del PJUD.']
      },
      {
        id: 'nav_pjud',
        title: 'Acceder a la Oficina Judicial Virtual',
        type: 'navigation',
        instruction: 'Ingresa a oficinajudicialvirtual.pjud.cl. En el menú superior o lateral, busca el icono de una lupa que dice "Consulta Unificada de Causas" o "Consulta de Causas".',
        context: 'https://oficinajudicialvirtual.pjud.cl/'
      },
      {
        id: 'action_pjud_busqueda',
        title: 'Realizar Búsqueda por RUT',
        type: 'action',
        instruction: 'Selecciona la pestaña de búsqueda por "RUT" o "Nombre". Ingresa el RUT sin puntos y con guion. Selecciona el tribunal de interés (ej. "Todos", "Corte Suprema", "Civil", "Laboral").',
        warnings: ['Te recomendamos buscar primero en "Juzgados Civiles" y "Cobranza Laboral", que son los más comunes para empresas.']
      },
      {
        id: 'validation_pjud',
        title: 'Interpretar Resultados',
        type: 'validation',
        instruction: 'Si aparecen resultados, verás el "RIT" (Rol Interno del Tribunal) y el año. Haz clic en la carpeta de la causa para ver el historial de movimientos (cuaderno principal).',
        warnings: ['Un resultado en "Cobranza Laboral" generalmente indica que la Inspección del Trabajo o una AFP demandó a la empresa por no pago de cotizaciones o finiquitos.']
      }
    ]
  },
  {
    id: 'sii_termino_giro',
    institution: 'SII',
    goal: 'Término de Giro',
    description: 'Proceso formal para notificar al SII el cese definitivo de actividades comerciales.',
    category: 'tributario',
    frictionScore: 10,
    monetizationTier: 'pro',
    requiresExplicitConsent: true,
    legalDisclaimer: 'Declaro entender que este trámite cierra comercialmente a la empresa y no es reversible sin una Petición Administrativa. Tramita solo asiste en la navegación.',
    steps: [
      {
        id: 'nav_termino',
        title: 'Ingresar al portal del SII',
        type: 'navigation',
        instruction: 'Navega a sii.cl > "Servicios Online" > "Término de Giro".',
        context: 'https://homer.sii.cl/'
      },
      {
        id: 'login_termino',
        title: 'Iniciar sesión como empresa',
        type: 'login',
        instruction: 'Ingresa con RUT y Clave Tributaria de la empresa.'
      },
      {
        id: 'action_termino_form',
        title: 'Completar formulario de Término de Giro',
        type: 'action',
        instruction: 'El sistema solicitará justificar el término y declarar existencias, activos inmovilizados y balance final.',
        warnings: ['Verifica con tu contador que el balance final esté cuadrado antes de ingresarlo.']
      },
      {
        id: 'validation_termino_envio',
        title: 'Enviar Declaración',
        type: 'validation',
        instruction: 'Confirma los montos y envía el formulario. Podrías quedar citado a fiscalización.',
        warnings: ['Revisa los folios anulados y la documentación física que debes destruir o conservar.']
      }
    ]
  },
  {
    id: 'sii_peticion_administrativa',
    institution: 'SII',
    goal: 'Peticiones Administrativas',
    description: 'Solicita al SII corregir giros, reversar multas, o actualizar información que no se puede hacer por formulario normal.',
    category: 'tributario',
    frictionScore: 8,
    monetizationTier: 'pro',
    requiresExplicitConsent: true,
    legalDisclaimer: 'Entiendo que la Petición Administrativa entra a revisión de un fiscalizador humano del SII.',
    steps: [
      {
        id: 'nav_peticion',
        title: 'Ingresar al portal del SII',
        type: 'navigation',
        instruction: 'Ve a "Servicios Online" > "Peticiones Administrativas y otras solicitudes".'
      },
      {
        id: 'login_peticion',
        title: 'Iniciar sesión',
        type: 'login',
        instruction: 'Autentícate con RUT y Clave Tributaria.'
      },
      {
        id: 'action_peticion',
        title: 'Redactar Petición y Adjuntar Antecedentes',
        type: 'action',
        instruction: 'Selecciona la materia (Ej: "Corregir RUT", "Condonación de Multas"). Redacta la solicitud claramente y adjunta PDF probatorios.',
        warnings: ['Una petición mal redactada puede ser rechazada de plano.']
      },
      {
        id: 'validation_peticion',
        title: 'Enviar y Guardar Folio',
        type: 'validation',
        instruction: 'Envía la petición y guarda el número de folio para hacerle seguimiento en la sección "Estado de Peticiones".',
        warnings: ['Guarda el comprobante PDF.']
      }
    ]
  },
  {
    id: 'muni_patente_comercial',
    institution: 'MUNICIPALIDAD',
    goal: 'Pago de Patente Comercial',
    description: 'Paga tu patente semestral obligatoria para poder operar legalmente un local o empresa en tu comuna.',
    category: 'municipal',
    frictionScore: 7,
    monetizationTier: 'free',
    requiresExplicitConsent: true,
    legalDisclaimer: 'El pago debe realizarse directamente en el portal de la municipalidad correspondiente.',
    steps: [
      {
        id: 'info_patente',
        title: 'Busca el portal de tu Municipalidad',
        type: 'information',
        instruction: 'Cada municipalidad tiene su propio sistema. Deberás buscar en Google "Pago Patente Comercial [Tu Comuna]".'
      },
      {
        id: 'nav_patente',
        title: 'Ingresar al portal municipal',
        type: 'navigation',
        instruction: 'Navega al sitio web de tu municipalidad y busca "Pagos Online" > "Patentes Comerciales".'
      },
      {
        id: 'action_patente',
        title: 'Consultar RUT / Rol',
        type: 'action',
        instruction: 'Ingresa el RUT de la empresa o el Rol de la Patente Comercial para buscar tu deuda vigente.',
        warnings: ['Si la patente no aparece, podría estar bloqueada por deuda de aseo u otra causa.']
      },
      {
        id: 'validation_patente',
        title: 'Pagar',
        type: 'validation',
        instruction: 'Selecciona las cuotas (usualmente semestrales) y paga a través de Webpay o la pasarela municipal.',
        warnings: ['El certificado de patente pagada es obligatorio para operar.']
      }
    ]
  },
  {
    id: 'dt_constancia_laboral',
    institution: 'DT',
    goal: 'Dejar Constancia Laboral',
    description: 'Emitir una constancia en la Inspección del Trabajo (ausencia laboral, despido, falta del empleador).',
    category: 'laboral',
    frictionScore: 6,
    monetizationTier: 'free',
    requiresExplicitConsent: true,
    legalDisclaimer: 'Las constancias laborales tienen valor probatorio para juicios. Toda declaración debe ser verídica.',
    steps: [
      {
        id: 'nav_dt',
        title: 'Ingresar a Mi DT',
        type: 'navigation',
        instruction: 'Ingresa a midt.dirtrab.cl',
        context: 'https://midt.dirtrab.cl/'
      },
      {
        id: 'login_dt',
        title: 'Autenticación',
        type: 'login',
        instruction: 'Ingresa usando tu Clave Única.'
      },
      {
        id: 'action_dt',
        title: 'Redactar Constancia',
        type: 'action',
        instruction: 'Ve a la sección "Trámites y Servicios" > "Constancias Laborales". Selecciona el tipo (empleador/trabajador) y redacta los hechos de forma objetiva.',
        warnings: ['Asegúrate de detallar fecha, hora, y hechos concretos.']
      },
      {
        id: 'validation_dt',
        title: 'Emitir Certificado',
        type: 'validation',
        instruction: 'Confirma la declaración y descarga el PDF con la constancia oficial timbrada.',
        warnings: ['Revisa la previsualización antes de emitir definitivamente.']
      }
    ]
  },
  {
    id: 'rc_certificado_vigencia',
    institution: 'REGISTRO_CIVIL',
    goal: 'Certificado de Vigencia (Tu Empresa en un Día)',
    description: 'Descarga el certificado que acredita que una empresa constituida por RES está vigente y no ha sido disuelta.',
    category: 'empresa',
    frictionScore: 3,
    monetizationTier: 'free',
    requiresExplicitConsent: true,
    legalDisclaimer: 'Entiendo que estoy accediendo a información pública de una empresa.',
    steps: [
      {
        id: 'nav_tuempresa',
        title: 'Ingresar al portal de Tu Empresa en un Día',
        type: 'navigation',
        instruction: 'Ingresa a www.registrodeempresasysociedades.cl.',
        context: 'https://www.registrodeempresasysociedades.cl/'
      },
      {
        id: 'action_vigencia',
        title: 'Buscar Certificados',
        type: 'action',
        instruction: 'En el home, baja hasta "Obtener Certificados" y escribe el RUT de la empresa sin puntos y con guion.',
        warnings: ['Este trámite es público y no requiere clave única si tienes el RUT de la empresa.']
      },
      {
        id: 'validation_vigencia',
        title: 'Descargar PDF',
        type: 'validation',
        instruction: 'Elige "Certificado de Vigencia" o "Anotaciones" y descarga el PDF firmado electrónicamente.',
        warnings: ['Verifica la fecha de emisión del certificado, ya que bancos suelen pedir menos de 30 días.']
      }
    ]
  }
]

export function getTramiteById(id: string): TramiteDefinition | undefined {
  return TRAMITES.find(t => t.id === id)
}

export function getAllTramites(): Partial<TramiteDefinition>[] {
  return TRAMITES.map(t => ({ 
    id: t.id, 
    goal: t.goal, 
    description: t.description, 
    institution: t.institution,
    category: t.category,
    frictionScore: t.frictionScore,
    monetizationTier: t.monetizationTier
  }))
}

// Ejecutar validador de cumplimiento en tiempo de compilación / carga del módulo
import { validateRegistry } from './complianceValidator'
validateRegistry(TRAMITES)
