import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase-server'
import Navbar from '@/components/Navbar'
import nextDynamic from 'next/dynamic'
import type { SearchRecord, Subscription, Plan } from '@/lib/types'
import { PLAN_QUOTAS, PLAN_PRICES } from '@/lib/types'

const FlowWidget = nextDynamic(() => import('@/components/FlowWidget'), { ssr: false })
import OutcomesList from '@/components/OutcomesList'

async function getData() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const [{ data: profile }, { data: subscription }, { data: searches }, { data: quota }, { data: outcomes }] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', user.id).single(),
    supabase.from('subscriptions').select('*').eq('user_id', user.id).single(),
    supabase.from('searches').select('id, user_id, params, result, ai_summary, created_at')
      .eq('user_id', user.id).order('created_at', { ascending: false }).limit(20),
    supabase.rpc('get_monthly_search_count', { p_user_id: user.id }),
    supabase.from('tramite_outcomes').select('status, total_steps')
      .eq('user_id', user.id),
  ])

  const completedCount = outcomes?.filter((o: any) => o.status === 'completed').length || 0
  const inProgressCount = outcomes?.filter((o: any) => o.status === 'in_progress').length || 0
  const totalStepsCompleted = outcomes?.filter((o: any) => o.status === 'completed').reduce((sum: number, o: any) => sum + (o.total_steps || 0), 0) || 0
  const timeSavedMin = totalStepsCompleted * 8 // ~8 min por paso ahorrado

  return { user, profile, subscription, searches: searches || [], monthlyCount: quota || 0, completedCount, inProgressCount, timeSavedMin }
}

const PLAN_LABELS: Record<Plan, { label: string; color: string }> = {
  free:    { label: 'Gratis',  color: 'var(--gray-400)' },
  basic:   { label: 'Básico',  color: 'var(--judicial-blue)' },
  premium: { label: 'Premium', color: 'var(--brand-orange)' },
}

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const { user, profile, subscription, searches, monthlyCount, completedCount, inProgressCount, timeSavedMin } = await getData()
  const plan = (subscription?.plan || 'free') as Plan
  const quota = PLAN_QUOTAS[plan]
  const planLabel = PLAN_LABELS[plan]

  return (
    <>
      <Navbar />
      <div className="container" style={{ padding: '40px 20px' }}>
        <div style={{ marginBottom: 36 }}>
          <h1 style={{ fontWeight: 800, fontSize: 'clamp(1.4rem, 3vw, 1.8rem)', marginBottom: 4 }}>
            Hola, {profile?.nombre_completo?.split(' ')[0] || user.email?.split('@')[0]} 👋
          </h1>
          <p style={{ fontSize: 14, color: 'var(--gray-500)' }}>{user.email}</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20, marginBottom: 36 }}>
          <div className="card" style={{ padding: '24px' }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--gray-400)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>Plan actual</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <span style={{ fontSize: 22, fontWeight: 800, color: planLabel.color }}>{planLabel.label}</span>
              {subscription?.status === 'active' && plan !== 'free' && (
                <span className="badge badge-activa">Activo</span>
              )}
            </div>
            {plan === 'free' && (
              <Link href="#planes" className="btn btn-primary btn-sm">Mejorar plan 🚀</Link>
            )}
          </div>

          <div className="card" style={{ padding: '24px' }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--gray-400)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>Tu impacto con Tramita</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 16 }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 28, fontWeight: 800, color: '#10B981' }}>{completedCount}</div>
                <div style={{ fontSize: 11, color: 'var(--gray-500)' }}>Completados</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 28, fontWeight: 800, color: '#F59E0B' }}>{inProgressCount}</div>
                <div style={{ fontSize: 11, color: 'var(--gray-500)' }}>En progreso</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 28, fontWeight: 800, color: '#2563EB' }}>~{timeSavedMin}<span style={{ fontSize: 14 }}>m</span></div>
                <div style={{ fontSize: 11, color: 'var(--gray-500)' }}>Tiempo ahorrado</div>
              </div>
            </div>
            <Link href="/buscar" className="btn btn-ghost btn-sm" style={{ marginTop: 4 }}>Ir al catálogo 🔎</Link>
          </div>

          <div className="card" style={{ padding: '24px' }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--gray-400)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>Alertas proactivas</div>
            {quota.alerts ? (
              <div>
                <p style={{ fontSize: 14, color: 'var(--gray-600)', marginBottom: 12 }}>
                  Activa alertas para recibir notificaciones automáticas cuando aparezca algo nuevo.
                </p>
                <Link href="/dashboard/alertas" className="btn btn-primary btn-sm">Ver alertas 🔔</Link>
              </div>
            ) : (
              <div>
                <p style={{ fontSize: 14, color: 'var(--gray-500)', marginBottom: 12 }}>
                  Las alertas están disponibles en el plan Premium.
                </p>
                <Link href="#planes" className="btn btn-ghost btn-sm">Ver Premium ✨</Link>
              </div>
            )}
          </div>
        </div>

        <div style={{ marginBottom: 40 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <h2 style={{ fontWeight: 800, fontSize: 18 }}>Mis Trámites</h2>
            <Link href="/buscar" className="btn btn-primary btn-sm">Ver Catálogo</Link>
          </div>

          {/* @ts-ignore - outcomes fetched from server */}
          <OutcomesList userId={user.id} />

          <h3 style={{ fontWeight: 700, fontSize: 15, marginTop: 32, marginBottom: 12 }}>Historial de búsquedas</h3>
          {searches.length === 0 ? (
            <div className="card" style={{ padding: '32px 24px', textAlign: 'center' }}>
              <p style={{ fontSize: 14, color: 'var(--gray-500)', margin: 0 }}>
                Aún no tienes búsquedas. Explora el <Link href="/buscar" style={{ color: 'var(--judicial-blue)' }}>Catálogo</Link> para empezar.
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {searches.map((s: SearchRecord) => (
                <SearchHistoryItem key={s.id} search={s} />
              ))}
            </div>
          )}
        </div>

        {plan === 'free' && (
          <div id="planes" className="card" style={{ padding: '32px 28px' }}>
            <h2 style={{ fontWeight: 800, fontSize: 20, marginBottom: 6 }}>Sube tu plan</h2>
            <p style={{ fontSize: 14, color: 'var(--gray-500)', marginBottom: 28 }}>
              Desbloquea consultas ilimitadas, alertas y resúmenes con automatización.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
              {(['basic', 'premium'] as const).map(p => (
                <div key={p} className="card" style={{
                  padding: '24px 20px',
                  border: p === 'premium' ? '2px solid var(--brand-orange)' : undefined,
                }}>
                  <div style={{ fontWeight: 800, fontSize: 16, marginBottom: 4, textTransform: 'capitalize' }}>{p}</div>
                  <div style={{ fontSize: 22, fontWeight: 800, marginBottom: 16 }}>{PLAN_PRICES[p].label}</div>
                  <a href={`/api/pago/crear?plan=${p}`} className="btn btn-primary" style={{ width: '100%' }}>
                    {p === 'basic' ? 'Elegir Básico' : 'Elegir Premium ✨'}
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <FlowWidget />
    </>
  )
}

function SearchHistoryItem({ search }: { search: SearchRecord }) {
  const params = typeof search.params === 'string' ? JSON.parse(search.params) : search.params
  return (
    <Link href={`/buscar/resultado?id=${search.id}`} className="card" style={{
      padding: '16px 20px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      textDecoration: 'none',
      color: 'inherit',
    }}>
      <div>
        <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 2 }}>
          {params.rut || params.nombre || 'Búsqueda'}
        </div>
        <div style={{ fontSize: 12, color: 'var(--gray-500)' }}>
          {new Date(search.created_at).toLocaleDateString('es-CL', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
      <span style={{ color: 'var(--gray-400)', fontSize: 18 }}>→</span>
    </Link>
  )
}
