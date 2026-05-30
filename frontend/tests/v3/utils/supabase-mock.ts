// tests/v3/utils/supabase-mock.ts
import { vi } from 'vitest'
import { Session, SessionEvent } from '@/core/session-engine/sessionEngine'

export class MockSupabaseDatabase {
  public sessions: Map<string, Session> = new Map()
  public events: Map<string, SessionEvent[]> = new Map()
  public credentials: Map<string, any[]> = new Map()
  public executionLogs: Set<string> = new Set() // Track event execution logs in memory!
  public guardianStates: Map<string, any> = new Map()

  public reset() {
    this.sessions.clear()
    this.events.clear()
    this.credentials.clear()
    this.executionLogs.clear()
    this.guardianStates.clear()
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
                if (table === 'guardian_state') {
                  const s = db.guardianStates.get(value)
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
              },
              limit: (lim: number) => {
                return {
                  async then(resolve: any) {
                    if (table === 'event_execution_log') {
                      const hasLog = db.executionLogs.has(value)
                      resolve({ data: hasLog ? [{ event_id: value }] : [], error: null })
                      return
                    }
                    resolve({ data: [], error: null })
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
        const executeInsert = () => {
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
            return session
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
            return event
          }

          if (table === 'event_execution_log') {
            const log = values[0]
            db.executionLogs.add(log.event_id)
            return log
          }
          return null
        }

        return {
          select: () => {
            return {
              single: async () => {
                const res = executeInsert()
                return { data: res, error: null }
              }
            }
          },
          async then(resolve: any) {
            const res = executeInsert()
            resolve({ data: res, error: null })
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

      chain.upsert = (values: any) => {
        const executeUpsert = () => {
          if (table === 'guardian_state') {
            const list = Array.isArray(values) ? values : [values]
            for (const val of list) {
              db.guardianStates.set(val.session_id, val)
            }
          }
          return values
        }
        return {
          async then(resolve: any) {
            const data = executeUpsert()
            resolve({ data, error: null })
          }
        }
      }

      return chain
    }
  }

  return client as any
}
