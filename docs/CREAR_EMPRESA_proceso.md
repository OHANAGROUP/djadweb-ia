# Mapa de proceso — "Crear Empresa en un Día" en Chile
> Documentación en vivo para incorporar como feature en DJADWEB-IA®  
> Iniciado: 2026-05-23 | Estado: 🔴 En investigación

---

## Portales involucrados

| Portal | URL | Qué hace | Estado integración |
|--------|-----|----------|--------------------|
| Registro de Empresas y Sociedades (RES) | registrodeempresasysociedades.cl | Constitución legal | 🔴 Pendiente |
| Tu Empresa en un Día | tuempresaenundia.cl | Frontend del RES | 🔴 Pendiente |
| SII | sii.cl | RUT empresa + Inicio de actividades | 🔴 Pendiente |
| Registro de Comercio (CBRS) | conservador.cl | Opcional — sociedades complejas | 🔴 Pendiente |
| ChileAtiende | chileatiende.gob.cl | Info y derivación | 🔴 Pendiente |

---

## Flujo estándar — SpA (tipo recomendado para startups)

### PASO 1 — Preparación previa
**Portal:** ninguno (fuera de línea)  
**Qué necesitas tener listo:**
- [ ] RUT y Clave Única del/los socio(s)
- [ ] Nombre de la empresa (3 opciones por si alguno está tomado)
- [ ] Domicilio social (dirección física donde funciona la empresa)
- [ ] Giro o actividad económica (código SII según rubro)
- [ ] Capital inicial (puede ser $1 CLP en SpA)
- [ ] Distribución de acciones entre socios (si hay más de uno)

**Fricción conocida:** Elegir el código de giro SII correcto es confuso — hay cientos de códigos y no hay buscador amigable.

---

### PASO 2 — Constitución en RES
**Portal:** registrodeempresasysociedades.cl  
**Autenticación:** Clave Única  
**Tiempo estimado:** 30–60 min

**Formulario requerido:**
- Nombre de la sociedad
- Tipo de sociedad (SpA / EIRL / SRL / SA)
- Capital y distribución
- Objeto social / giro
- Administrador(es)
- Domicilio
- Firma electrónica de todos los socios (con Clave Única)

**Output:** RUT de empresa asignado automáticamente  
**Costo:** $0 para SpA, EIRL, SRL estándar  

**Fricción conocida:** Si hay más de un socio, todos deben firmar el mismo día desde sus propios accesos. Puede ser difícil coordinar.

---

### PASO 3 — Inicio de actividades en SII
**Portal:** sii.cl  
**Autenticación:** Clave Tributaria (distinta a Clave Única)  
**Tiempo estimado:** 15–30 min  
**Quién lo hace:** El representante legal o un contador autorizado

**Qué se declara:**
- Actividad económica (mismo código de giro)
- Fecha de inicio de actividades
- Domicilio tributario
- Tipo de contribuyente (1ª o 2ª categoría)
- Si emitirá boletas / facturas electrónicas

**Output:** La empresa puede emitir documentos tributarios (boletas, facturas)  

**Fricción conocida:** El SII tiene dos sistemas distintos: el portal general y el "Portal Emprendedor". Mucha gente no sabe cuál usar.

---

### PASO 4 — Configuración de facturación electrónica (opcional pero necesario para operar)
**Portal:** sii.cl — sección Factura Electrónica  
**Tiempo estimado:** 20–40 min

**Opciones:**
1. Sistema propio SII (gratuito, básico)
2. Software de terceros (Nubox, Defontana, etc.) — de pago

---

## Información a capturar en cada paso (para el feature)

Cuando Pablo vaya haciendo el proceso en vivo, documentar:

### Por cada pantalla/formulario:
- [ ] ¿Cuál es el portal exacto?
- [ ] ¿Qué campos pide?
- [ ] ¿Cuáles son obligatorios vs opcionales?
- [ ] ¿Qué validaciones tiene? (errores comunes)
- [ ] ¿Cuánto tiempo tomó ese paso?
- [ ] ¿Qué fricción encontró? (confusión, bugs, pasos innecesarios)
- [ ] Screenshot o descripción de la UI

---

## Feature idea para DJADWEB-IA®

### "Constituye tu empresa"
Un wizard guiado paso a paso que:
1. Explica en lenguaje simple qué tipo de empresa conviene según el caso
2. Prepara todos los datos antes de ir al portal (evita errores)
3. Abre el portal correcto con las instrucciones exactas para cada campo
4. Guía el inicio de actividades en SII
5. Genera checklist post-constitución (cuenta bancaria, timbre electrónico, etc.)

**Diferenciador:** DJADWEB-IA® no reemplaza el portal del Estado (no puede) pero actúa como **copiloto inteligente** que elimina la confusión en cada paso.

---

## Log en vivo — 2026-05-23

| Hora | Paso | Portal | Observación | Fricción |
|------|------|--------|-------------|----------|
| — | — | — | Proceso no iniciado aún | — |

*→ Ir completando esta tabla a medida que Pablo avanza*

---

## Recursos oficiales

- [Tu Empresa en un Día — RES](https://www.registrodeempresasysociedades.cl/Constituir/)
- [ChileAtiende — ficha del trámite](https://www.chileatiende.gob.cl/fichas/21409-tu-empresa-en-un-dia)
- [SII — Inicio de actividades](https://www.sii.cl/siieduca/aprende-con-nosotros/inicio-de-actividades-y-formalizacion-de-un-negocio.html)
- [SII — Portal Emprendedor](https://www.sii.cl/portales/emprendedor/4puntos_claves.html)
