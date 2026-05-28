// tests/v3/utils/supabase-mock.ts
import { vi } from 'vitest'
import { Session, SessionEvent } from '@/core/session-engine/sessionEngine'

export class MockSupabaseDatabase {
  public sessions: Map<string, Session> = new Map()
  public events: Map<string, SessionEvent[]> = new Map()
  public credentials: Map<string, any[]> = new Map()

  public reset() {
    this.sessions.clear()
    this.events.clear()
    this.credentials.clear()
  }
}

export function createMockSupabaseClient(db: MockSupabaseDatabase) {
  // A completely chainable mock for Supabase
  const client: any = {
    from: (table: string) => {
      let chain: any = {}

      chain.select = (columns: string = '*') => {
        return {
          eq: (column: string, value: any) => {
            return {
              single: async () => {
                if (table === 'tramite_sessions') {
                  const s = db.sessions.get(value)
                  if (!s) return { data: null, error: { message: 'Not found' } }
                  return { data: { ...s }, error: null }
                }
                return { data: null, error: { message: 'Not found' } }
              },
              eq: (col2: string, val2: any) => {
                return {
                  limit: async (lim: number) => {
                    return { data: [], error: null }
                  }
                }
              },
              order: (col: string, opt?: { ascending: boolean }) => {
                const evs = db.events.get(value) || []
                const sorted = [...evs].sort((a, b) => {
                  return opt?.ascending ? a.event_index - b.event_index : b.event_index - a.event_index
                })
                return {
                  limit: async (lim: number) => {
                    return { data: sorted.slice(0, lim), error: null }
                  },
                  async then(resolve: any) {
                    resolve({ data: sorted, error: null })
                  }
                }
              }
            }
          },
          order: (col: string, opt?: { ascending: boolean }) => {
            return {
              order: (col2: string, opt2?: { ascending: boolean }) => {
                return { data: [], error: null }
              },
              eq: (col2: string, val2: any) => {
                if (table === 'tramite_session_events') {
                  const evs = db.events.get(val2) || []
                  const sorted = [...evs].sort((a, b) => {
                    return opt?.ascending ? a.event_index - b.event_index : b.event_index - a.event_index
                  })
                  return {
                    async then(resolve: any) {
                      resolve({ data: sorted, error: null })
                    }
                  }
                }
                return { data: [], error: null }
              }
            }
          }
        }
      }

      chain.insert = (values: any[]) => {
        return {
          select: () => {
            return {
              single: async () => {
                if (table === 'tramite_sessions') {
                  const session = {
                    id: values[0].id || 'e3e8f815-321a-4c28-9844-f805d0f784a9',
                    user_id: values[0].user_id,
                    tramite_id: values[0].tramite_id,
                    status: values[0].status || 'active',
                    current_step: values[0].current_step,
                    progress: values[0].progress || 0,
                    started_at: new Date().toISOString(),
                    last_active_at: new Date().toISOString(),
                    session_metadata: values[0].session_metadata || {},
                    created_at: new Date().toISOString()
                  } as Session
                  db.sessions.set(session.id, session)
                  return { data: session, error: null }
                }

                if (table === 'tramite_session_events') {
                  const event = {
                    id: values[0].id || 'evt-' + Math.random().toString(36).substr(2, 9),
                    session_id: values[0].session_id,
                    user_id: values[0].user_id,
                    type: values[0].type,
                    payload: values[0].payload || {},
                    event_index: values[0].event_index,
                    previous_hash: values[0].previous_hash,
                    hash: values[0].hash,
                    timestamp: values[0].timestamp || new Date().toISOString()
                  } as SessionEvent

                  const existing = db.events.get(event.session_id) || []
                  existing.push(event)
                  db.events.set(event.session_id, existing)
                  return { data: event, error: null }
                }

                return { data: null, error: { message: 'Insert not supported' } }
              }
            }
          }
        }
      }

      chain.update = (values: any) => {
        return {
          eq: (col: string, val: any) => {
            return {
              select: () => {
                return {
                  single: async () => {
                    if (table === 'tramite_sessions') {
                      const s = db.sessions.get(val)
                      if (!s) return { data: null, error: { message: 'Not found' } }
                      const updated = { ...s, ...values }
                      db.sessions.set(val, updated)
                      return { data: updated, error: null }
                    }
                    return { data: null, error: null }
                  }
                }
              },
              async then(resolve: any) {
                if (table === 'tramite_sessions') {
                  const s = db.sessions.get(val)
                  if (s) {
                    const updated = { ...s, ...values }
                    db.sessions.set(val, updated)
                    resolve({ data: updated, error: null })
                    return
                  }
                }
                resolve({ data: null, error: null })
              }
            }
          }
        }
      }

      return chain
    }
  }

  return client as any
}
