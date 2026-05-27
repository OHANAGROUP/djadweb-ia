import { createClient } from '@/lib/supabase-server'
import { getTramiteById } from '@/lib/registry/tramites'

interface Outcome {
  id: string
  tramite_id: string
  institution: string
  category: string
  status: string
  steps_completed: number
  total_steps: number
  started_at: string
  completed_at: string | null
}

const STATUS_LABELS: Record<string, { label: string; color: string; bg: string }> = {
  completed:   { label: '✅ Completado', color: '#065F46', bg: '#D1FAE5' },
  in_progress: { label: '🔄 En progreso', color: '#92400E', bg: '#FEF3C7' },
  abandoned:   { label: '⏸️ Pausado', color: '#6B7280', bg: '#F3F4F6' },
}

export default async function OutcomesList({ userId }: { userId: string }) {
  const supabase = createClient()

  const { data: outcomes } = await supabase
    .from('tramite_outcomes')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(20)

  if (!outcomes || outcomes.length === 0) {
    return (
      <div className="card" style={{ padding: '32px 24px', textAlign: 'center', marginBottom: 16 }}>
        <div style={{ fontSize: 32, marginBottom: 12 }}>📋</div>
        <p style={{ fontSize: 14, color: 'var(--gray-500)', margin: 0 }}>
          Aún no has iniciado ningún trámite guiado. ¡Elige uno del catálogo!
        </p>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}>
      {(outcomes as Outcome[]).map((o) => {
        const tramite = getTramiteById(o.tramite_id)
        const statusInfo = STATUS_LABELS[o.status] || STATUS_LABELS.in_progress
        const progress = o.total_steps > 0 ? Math.round((o.steps_completed / o.total_steps) * 100) : 0

        return (
          <div key={o.id} className="card" style={{ padding: '16px 20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <div>
                <span style={{ fontWeight: 700, fontSize: 14 }}>{tramite?.goal || o.tramite_id}</span>
                <span className="badge badge-blue" style={{ marginLeft: 8 }}>{o.institution}</span>
              </div>
              <span style={{ fontSize: 11, fontWeight: 600, color: statusInfo.color, background: statusInfo.bg, padding: '3px 8px', borderRadius: 6 }}>
                {statusInfo.label}
              </span>
            </div>

            <div style={{ height: 5, background: 'var(--gray-200)', borderRadius: 99, overflow: 'hidden', marginBottom: 6 }}>
              <div style={{
                height: '100%',
                width: `${progress}%`,
                background: o.status === 'completed' ? '#10B981' : '#F59E0B',
                borderRadius: 99,
                transition: 'width .3s',
              }} />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--gray-400)' }}>
              <span>{o.steps_completed}/{o.total_steps} pasos</span>
              <span>
                {o.completed_at
                  ? `Completado: ${new Date(o.completed_at).toLocaleDateString('es-CL', { day: 'numeric', month: 'short' })}`
                  : `Iniciado: ${new Date(o.started_at).toLocaleDateString('es-CL', { day: 'numeric', month: 'short' })}`
                }
              </span>
            </div>
          </div>
        )
      })}
    </div>
  )
}
