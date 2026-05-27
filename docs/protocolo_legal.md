# Protocolo Legal de Interacción con Sistemas Estatales

Este documento rige la arquitectura de producto, diseño técnico y modelo operativo de **Tramita** frente a los servicios del Estado de Chile (SII, TGR, PJUD, entre otros). Su objetivo es garantizar la viabilidad a largo plazo del producto, mitigando el riesgo legal, técnico y regulatorio asociado a la manipulación de credenciales sensibles y la automatización de trámites.

---

## 1. Naturaleza del Sistema

**Tramita opera estrictamente como un "Sistema Operativo de Trámites" (Capa Cognitiva y Copiloto Procedimental).**
- **SÍ ES:** Un orquestador estructurado que reduce la fricción cognitiva, acompaña al usuario paso a paso y emite heurísticas de asistencia táctica sobre las interfaces oficiales.
- **NO ES:** Un "Bot" de RPA ciego, un ejecutor delegado de trámites, ni un sistema de web scraping masivo desatendido.

---

## 2. Límites de Automatización (La Línea Roja)

Para cumplir con la Ley 19.628 (Protección a la Vida Privada) y los Términos de Servicio (TOS) del Estado, se establecen las siguientes reglas operativas inquebrantables:

### 🟢 Lo que está PERMITIDO (Zona Segura y Escalable)
1. **Asistencia Procedimental:** Guiar al usuario mediante el Flow Engine (UI de paso a paso).
2. **Redirección Estructurada:** Proveer al usuario los *deep links* (enlaces directos) exactos hacia los formularios oficiales.
3. **Live Guidance (Copilot):** Proveer asistencia táctica al usuario mediante heurísticas (ej: "Haz click en el botón azul de la izquierda") mientras el usuario opera en la sesión oficial.
4. **Verificación de Estado Público:** Utilizar APIs o scrapers **no autenticados** para validar estados públicos (ej: consulta de deudas públicas TGR, causas públicas PJUD) siempre que el usuario haya iniciado la consulta.

### 🟡 Lo que requiere ALERTA (Zona de Fricción)
1. **Scraping Autenticado (Lectura):** Si en el futuro se requiriese conectar credenciales para extraer un RCV o Cartola, esto solo puede ocurrir bajo:
   - Consentimiento explícito e individual del usuario (firma de mandato o T&C claros).
   - Ejecución `On-Demand` (el usuario gatilla el sync, no el sistema en background infinito).
   - Uso de infraestructura encriptada (AES-256-GCM) sin persistir la clave más allá de lo estrictamente acordado.

### 🔴 Lo que está PROHIBIDO (Zona Roja)
1. **Ejecución de Trámites Mutativos sin Confirmación:** El sistema **NUNCA** ejecutará un "Submit", "Aceptar", o firmará una declaración (como Inicio de Actividades o Declaración de IVA) en nombre del usuario de forma automática en background. El click final siempre debe ser físico y humano.
2. **Extracción de Datos Masiva (Bulk Scraping):** El sistema nunca extraerá datos de contribuyentes para crear bases de datos secundarias, minería de datos, ni violará las defensas anti-bot para extraer volúmenes injustificados de las plataformas estatales.
3. **Persistencia de Sesión Delegada Insegura:** Secuestrar tokens de sesión o mantener credenciales en texto plano para operar sin que el usuario esté consciente.

---

## 3. Modelo Operativo de la Capa Cognitiva

Dado que el producto debe aislarse de los fallos de las webs gubernamentales, Tramita seguirá este flujo:

1. **Intención:** El usuario declara qué necesita hacer (NLP / Selección).
2. **Estructuración:** El sistema carga la `TramiteDefinition` del Registry.
3. **Ejecución Asistida:** 
   - El sistema le dice al usuario a dónde ir.
   - El usuario abre la pestaña.
   - El usuario marca "Listo" o pide ayuda específica al Live Guidance Engine (`__ACTION__HELP__`).
4. **Cierre:** El sistema marca el trámite como completado en su bitácora local (`is_completed`), logrando la sensación de avance, pero dejando la responsabilidad civil y tributaria de la acción ejecutada en las manos del contribuyente, como dicta la ley.

---

## 4. Gestión de Credenciales Tributarias

Cualquier módulo que reciba Clave Tributaria (SII) o Clave Única responderá al siguiente protocolo criptográfico:

1. **Encriptación en Tránsito y Reposo:** Toda credencial se encripta inmediatamente en el backend Node usando `crypto.ts` (AES-256-GCM).
2. **Aislamiento:** La base de datos (Supabase) guarda el Payload cifrado de la clave (`encrypted_data`), pero la llave de desencriptación (`APP_SECRET`) reside exclusivamente en las variables de entorno del servidor. La base de datos en sí misma es ciega a las contraseñas.
3. **Derecho al Olvido:** El usuario tiene control total sobre el borrado de sus credenciales (botón de revocación en la UI que purga el registro permanentemente).

---

Este protocolo blinda a Tramita. Nos permite escalar de forma agresiva como SaaS resolviendo el dolor real (ansiedad e incomprensión de los trámites) sin arriesgar la operación legal de la empresa.
