# 🚀 TRAMITA — Guía de Deploy

> Stack: **Next.js 14** en Vercel + **Scraper Node.js** en Render + **Supabase** (DB + Auth)

---

## 1. Supabase (10 min)

1. Crear proyecto en https://supabase.com (gratis)
2. Ir a **SQL Editor** → pegar y ejecutar en orden las migraciones ubicadas en `supabase/migrations/`:
   - `001_initial.sql` (Esquema base de perfiles, suscripciones y cuotas)
   - `002_sii_tgr.sql` (Credenciales cifradas, historial del SII y TGR)
   - `003_chat_history.sql` (Sesiones y mensajes de chat del Flow Engine)
   - `010_outcome_tracking.sql` (Outcome Tracking — resultados medibles por trámite)
3. Ir a **Settings → API** → copiar:
   - `URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon key` → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role key` → `SUPABASE_SERVICE_ROLE_KEY`
4. Ir a **Authentication → URL Configuration** → agregar:
   - Site URL: `https://tramita.vercel.app`
   - Redirect URLs: `https://tramita.vercel.app/api/auth/callback`

---

## 2. Backend Scraper en Render (15 min)

El scraper Node.js **no puede** correr en Vercel (Playwright es demasiado pesado para serverless).
Debe deployarse como **Web Service** en Render.

1. Ir a https://render.com → New → Web Service
2. Conectar el repo → Root Directory: `03_PRODUCTOS/tramita/backend_node`
3. Build Command: `npm install && npx playwright install chromium`
4. Start Command: `npm start`
5. Variables de entorno:
   ```
   NODE_ENV=production
   SCRAPER_API_KEY=<genera con: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))">
   CORS_ORIGIN=https://tramita.vercel.app
   ```
6. Plan: Free (750 h/mes) o Starter ($7/mes para no dormir)

> ⚠️ El plan gratuito de Render duerme tras 15 min de inactividad. El primer request tarda ~30s en despertar.
> Para producción real usar el plan Starter ($7/mes).

---

## 3. Frontend en Vercel (10 min)

1. Ir a https://vercel.com → New Project
2. Importar el repo → Root Directory: `03_PRODUCTOS/tramita/frontend`
3. Framework: **Next.js** (autodetectado)
4. Agregar todas las variables de entorno del `.env.example`:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `SCRAPER_URL` (la URL de Render del paso 2)
   - `SCRAPER_API_KEY` (el mismo valor generado en el paso 2)
   - `GEMINI_API_KEY` (para el Flow Engine)
   - `NEXT_PUBLIC_APP_URL=https://tramita.vercel.app`
5. Deploy → esperar ~2 min

---

## 4. MercadoPago (30 min — opcional para MVP)

1. Ir a https://www.mercadopago.cl/developers/panel/credentials
2. Crear aplicación
3. Copiar **Access Token** y **Public Key** de PRODUCCIÓN
4. Agregar a Vercel: `MP_ACCESS_TOKEN`, `MP_PUBLIC_KEY`
5. Configurar Webhook en MP Developers:
   - URL: `https://tramita.vercel.app/api/webhooks/mercadopago`
   - Eventos: `payment`

> Para el MVP puedes lanzar sin pagos y activar planes manualmente en Supabase SQL Editor:
> ```sql
> UPDATE subscriptions SET plan = 'basic', status = 'active'
> WHERE user_id = 'UUID-del-usuario';
> ```

---

## 5. Desarrollo local

```bash
# Terminal 1 — Scraper
cd backend_node
cp .env.example .env   # configurar SCRAPER_API_KEY
npm install
npx playwright install chromium
npm run dev

# Terminal 2 — Frontend
cd frontend
cp .env.example .env.local   # configurar variables
npm install
npm run dev   # corre en localhost:3001
```

---

## 6. Variables de entorno — resumen completo

| Variable | Dónde obtener | Requerida |
|----------|--------------|-----------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Settings → API | ✅ |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → Settings → API | ✅ |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Settings → API | ✅ |
| `SCRAPER_URL` | URL del Web Service en Render | ✅ |
| `SCRAPER_API_KEY` | Generar aleatorio (compartido con backend) | ✅ |
| `GEMINI_API_KEY` | AI Studio / Google Cloud | Para Flow Engine |
| `MP_ACCESS_TOKEN` | mercadopago.cl/developers | Para cobrar |
| `MP_PUBLIC_KEY` | mercadopago.cl/developers | Para cobrar |
| `NEXT_PUBLIC_APP_URL` | Tu dominio Vercel | ✅ |

---

## 7. Checklist de lanzamiento

- [ ] Todas las migraciones SQL ejecutadas en Supabase (001 a 010)
- [ ] Redirect URLs configuradas en Supabase Auth
- [ ] Scraper deployado en Render y respondiendo `GET /`
- [ ] Frontend deployado en Vercel sin errores de build
- [ ] Registro de usuario funciona y crea perfil + suscripción free
- [ ] Flow Engine responde y guía trámites correctamente
- [ ] Dominio personalizado configurado en Vercel (opcional)
- [ ] Webhook MercadoPago configurado (si activaste pagos)

---

## 8. Estructura del proyecto

```
tramita/
├── backend_node/          ← Scraper PJUD (Express + Playwright) → Render
│   ├── src/scrapers/pjud.js
│   └── src/server.js
├── frontend/              ← App Next.js 14 → Vercel
│   ├── src/app/           ← Pages (App Router)
│   ├── src/lib/           ← Supabase clients, types, registry
│   ├── src/services/      ← Flow Engine
│   └── src/components/    ← Navbar, FlowWidget, OutcomesList
├── supabase/
│   └── migrations/
│       ├── 001_initial.sql
│       ├── 002_sii_tgr.sql
│       ├── 003_chat_history.sql
│       └── 010_outcome_tracking.sql
└── assets/                ← Logos y brand assets
```
