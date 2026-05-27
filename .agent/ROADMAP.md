# `.agent/ROADMAP.md` — Citizen Workflow OS | DJADWEB-IA® Runtime 2.0-GOLD

## 🎯 PROPÓSITO

Este documento define el protocolo soberano y estandarizado para integrar nuevos trámites, automatizaciones y flujos cognitivos dentro de DJADWEB-IA® utilizando el patrón arquitectónico:

* Citizen Workflow Operating System
* Runtime 2.0-GOLD
* Grafo Determinista de Estados
* Compliance Audit Layer
* Scraping Resiliente
* Observabilidad Vertical

Toda nueva automatización DEBE respetar este roadmap para garantizar:

* estabilidad operacional,
* idempotencia cognitiva,
* resiliencia ante portales estatales,
* observabilidad,
* auditabilidad forense,
* despliegue seguro en producción.

---

# 📂 MAPA MAESTRO DE RUTAS

## 1. Grafo de Workflow

Ruta obligatoria:

```text
frontend/src/lib/workflowGraph.ts
```

Responsabilidad:

* Registrar nuevos estados
* Validar transiciones legales
* Prevenir desvíos cognitivos
* Acotar loops semánticos

---

## 2. Scrapers y Extracción

Ruta obligatoria:

```text
backend_node/src/scrapers/
```

Ejemplos:

```text
backend_node/src/scrapers/pjud.js
backend_node/src/scrapers/sii.js
backend_node/src/scrapers/tgr.js
```

Responsabilidad:

* Automatización Playwright
* Parsing resiliente
* Retry/backoff
* WaitForSelector reactivo
* Gestión de timeouts

---

## 3. Cache, Retry y Utilidades

Ruta obligatoria:

```text
backend_node/src/utils/
```

Ejemplos:

```text
backend_node/src/utils/cache.js
backend_node/src/utils/withRetry.js
backend_node/src/utils/logger.js
```

Responsabilidad:

* Cache TTL
* Deduplicación
* Retry exponencial
* Instrumentación

---

## 4. Runtime Cognitivo

Ruta obligatoria:

```text
frontend/src/services/copilot.ts
```

Responsabilidad:

* Registro de tools
* Orquestación cognitiva
* SHA-256 idempotencia
* Correlation IDs
* MAX_TOOL_ITERATIONS
* Compliance logging

---

## 5. Prompts y Gobernanza Cognitiva

Ruta obligatoria:

```text
frontend/prompts/
```

Ejemplos:

```text
frontend/prompts/system.txt
frontend/prompts/tools/
```

Responsabilidad:

* Reglas del agente
* Definición semántica
* Restricciones
* Tool calling
* Memory governance

---

## 6. Endpoints API

Ruta obligatoria:

```text
frontend/src/app/api/
```

Ejemplos:

```text
frontend/src/app/api/health/route.ts
frontend/src/app/api/buscar/
```

Responsabilidad:

* Integración frontend/backend
* Health checks
* Keep-alive
* Rate limiting
* Correlation propagation

---

## 7. Tests End-to-End

Ruta obligatoria:

```text
backend_node/test-e2e.js
frontend/tests/e2e/
```

Responsabilidad:

* Smoke tests
* Error flows
* Cold-start resilience
* Cache hit validation
* Retry validation

---

## 8. Migraciones Supabase

Ruta obligatoria:

```text
supabase/migrations/
```

Ejemplos:

```text
001_initial.sql
005_runtime_soberano.sql
005_hardening_operacional.sql
006_openclaw_events.sql
```

Responsabilidad:

* Persistencia operacional
* Logs inmutables
* Eventos asíncronos
* Telemetría
* Índices críticos

---

# 🧩 PLANTILLA ESTÁNDAR DE IMPLEMENTACIÓN

# PASO 1 — DEFINIR WORKFLOW

Editar:

```text
frontend/src/lib/workflowGraph.ts
```

Agregar:

* nuevo estado
* transición válida
* transición terminal
* fallback semántico

Checklist:

* evitar loops
* evitar estados huérfanos
* validar caminos de recuperación

---

# PASO 2 — CREAR SCRAPER RESILIENTE

Crear:

```text
backend_node/src/scrapers/[tramite].js
```

Obligatorio:

* Playwright Chromium
* waitForSelector reactivo
* withRetry()
* timeout granular
* manejo de CAPTCHA
* parsing defensivo
* logs estructurados

Patrón mínimo:

```js
return withRetry(async () => {
  await page.goto(url);
  await page.waitForSelector(selector, { timeout: 10000 });
});
```

---

# PASO 3 — REGISTRAR TOOL EN COPILOT

Editar:

```text
frontend/src/services/copilot.ts
```

Agregar:

* definición tool
* invocation policy
* telemetry
* compliance logging
* correlation_id propagation

Obligatorio:

* hash SHA-256
* MAX_TOOL_ITERATIONS
* cache awareness
* observabilidad

---

# PASO 4 — AJUSTAR SYSTEM PROMPT

Editar:

```text
frontend/prompts/system.txt
```

Agregar:

* intención semántica
* reglas del trámite
* límites
* fallbacks
* lenguaje ciudadano

---

# PASO 5 — CREAR TESTS E2E

Editar:

```text
backend_node/test-e2e.js
```

Agregar:

* caso exitoso
* parámetros inválidos
* timeout
* outage simulation
* cache hit
* retry validation

Objetivo:

```text
100% passing
0 flaky tests
```

---

# PASO 6 — CREAR MIGRACIÓN SI REQUIERE PERSISTENCIA

Crear:

```text
supabase/migrations/00X_[feature].sql
```

Obligatorio:

* índices
* RLS
* timestamps
* status tracking
* telemetry fields

---

# PASO 7 — DEPLOY

## Backend Render

Validar:

```text
render.yaml
```

Checklist:

* healthCheckPath
* chromium install
* env vars
* CORS_ORIGIN

---

## Frontend Vercel

Validar:

```text
NEXT_PUBLIC_SUPABASE_URL
SUPABASE_SERVICE_ROLE_KEY
SCRAPER_URL
SCRAPER_API_KEY
ANTHROPIC_API_KEY
```

Deploy:

```bash
npx vercel --prod
```

---

# 🛡️ REGLAS OBLIGATORIAS DE HARDENING

## 1. Retry Exponencial

OBLIGATORIO:

```text
withRetry()
```

Configuración:

* maxRetries: 3
* exponential backoff
* bypass errores estructurales

---

## 2. WaitForSelector Reactivo

PROHIBIDO:

```js
waitForTimeout(5000)
```

OBLIGATORIO:

```js
waitForSelector(selector)
```

---

## 3. SHA-256 Idempotencia

Archivo:

```text
frontend/src/services/copilot.ts
```

Objetivo:

* evitar loops cognitivos
* prevenir duplicación semántica
* blindar reasoning

---

## 4. Correlation IDs

OBLIGATORIO:

```text
X-Correlation-ID
```

Propagar:

* frontend
* backend
* scraper
* Supabase logs

---

## 5. MAX_TOOL_ITERATIONS

OBLIGATORIO:

```text
MAX_TOOL_ITERATIONS = 6
```

Objetivo:

* limitar costo
* evitar loops infinitos
* proteger tokens

---

## 6. compliance_audit_log INMUTABLE

OBLIGATORIO:

```text
prevent_audit_mutation trigger
```

PROHIBIDO:

* UPDATE
* DELETE

---

## 7. Cache TTL

OBLIGATORIO:

```text
cache.js
```

Objetivo:

* reducir carga PJUD/SII/TGR
* minimizar costos
* acelerar UX

---

## 8. Health Check Vertical

Endpoint:

```text
/api/health
```

Debe validar:

* Supabase
* Scraper Render
* latencia
* keepAlive ping

---

## 9. Keep-Alive Operacional

Activo vía:

```text
scripts/keepalive.js
```

Supervisor:

```text
PM2
```

Frecuencia:

```text
10 minutos
```

---

# 🔍 AUDITORÍA AUTOMÁTICA DEL CÓDIGO ACTUAL

## ✅ workflowGraph.ts

Estado:

```text
IMPLEMENTADO
```

Validado:

* transiciones deterministas
* control semántico
* rechazo de estados ilegales

Ruta:

```text
frontend/src/lib/workflowGraph.ts
```

---

## ✅ copilot.ts

Estado:

```text
IMPLEMENTADO
```

Validado:

* SHA-256
* advisory locks
* MAX_TOOL_ITERATIONS
* compliance logging
* correlation_id
* telemetry

Ruta:

```text
frontend/src/services/copilot.ts
```

---

## ✅ server.js

Estado:

```text
IMPLEMENTADO
```

Validado:

* API routes
* health checks
* scraper endpoints
* cache integration

Ruta:

```text
backend_node/server.js
```

---

## ✅ task.md

Estado:

```text
ACTUALIZADO
```

Validado:

* roadmap operacional
* métricas deployment
* runtime hardening

---

## ✅ walkthrough.md

Estado:

```text
ACTUALIZADO
```

Validado:

* documentación técnica
* despliegue
* observabilidad
* runtime hardening

---

## ⚠️ AUDIT: REVISAR

Archivo:

```text
frontend/prompts/system.txt
```

Observación:
No existe evidencia explícita confirmada de:

* reglas anti-loop
* correlation awareness
* fallback semántico ciudadano

Acción sugerida:
Agregar:

```text
- control de reasoning loops
- policy de retries
- graceful degradation
```

---

## ⚠️ AUDIT: REVISAR

Archivo:

```text
frontend/tests/e2e/
```

Observación:
La suite principal existe en:

```text
backend_node/test-e2e.js
```

Pero no hay evidencia completa de:

```text
frontend/tests/e2e/
```

Acción sugerida:
Agregar:

* Playwright frontend tests
* degraded UI validation
* async alert flow validation

---

## ⚠️ AUDIT: REVISAR

Archivo:

```text
backend_node/src/utils/logger.js
```

Observación:
No hay confirmación explícita de:

* structured JSON logs
* correlation propagation
* severity levels

Acción sugerida:
Implementar:

```text
logger.info()
logger.warn()
logger.error()
```

Formato:

```json
{
  "correlation_id": "",
  "tool": "",
  "runtime_ms": 0
}
```

---

# 🚀 CHECKLIST FINAL ANTES DE PRODUCCIÓN

## Backend

* [ ] Retry exponencial
* [ ] waitForSelector
* [ ] Health endpoint
* [ ] Chromium install
* [ ] Correlation IDs

---

## Frontend

* [ ] MAX_TOOL_ITERATIONS
* [ ] SHA-256
* [ ] UI degradada
* [ ] KeepAlive endpoint
* [ ] Tool telemetry

---

## Supabase

* [ ] compliance_audit_log
* [ ] openclaw_events
* [ ] índices
* [ ] RLS
* [ ] triggers inmutables

---

## Infraestructura

* [ ] Render healthy
* [ ] Vercel healthy
* [ ] PM2 keepalive online
* [ ] DNS operativo
* [ ] Variables env sincronizadas

---

# 🗃️ LOG DE CAMBIOS - OBSIDIAN

Formato obligatorio:

```markdown
## [YYYY-MM-DD] - [Nombre Trámite]

Agente: [Nombre Agente]

Archivos:
- frontend/src/lib/workflowGraph.ts
- frontend/src/services/copilot.ts
- backend_node/src/scrapers/[tramite].js
- backend_node/test-e2e.js
- supabase/migrations/[migration].sql

Métricas:
- latency_ms:
- error_rate:
- retries_triggered:
- cache_hit_rate:

Commit:
- [hash]

Estado:
✅ Deployed

Tags:
#automatizai
#ciudad-workflow-os
#runtime-2gold
#observabilidad
```

---

# 🧠 PRINCIPIO RECTOR DEL RUNTIME 2.0-GOLD

Toda automatización integrada en DJADWEB-IA® debe:

* reducir ansiedad ciudadana,
* resistir portales estatales inestables,
* operar de forma determinista,
* mantener trazabilidad forense,
* evitar loops cognitivos,
* degradarse elegantemente,
* preservar soberanía operacional.

FIN DEL ROADMAP.
