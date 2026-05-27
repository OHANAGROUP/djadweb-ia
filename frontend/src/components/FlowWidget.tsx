'use client';
import { useState, useRef, useEffect } from 'react';
import { TramiteDefinition, StepDefinition } from '@/lib/registry/types';
import { getTramiteById } from '@/lib/registry/tramites';
import { createClient } from '@/lib/supabase';

type Message = {
  role: 'user' | 'assistant' | 'system';
  content: string;
};

export default function FlowWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [input, setInput] = useState('');
  const [showInput, setShowInput] = useState(false);
  const [hasConsented, setHasConsented] = useState(false);
  const [completedOutcome, setCompletedOutcome] = useState<{ tramiteId: string; goal: string; totalSteps: number } | null>(null);
  
  // Auth & Pro State
  const [isPro, setIsPro] = useState(false);

  // Flow State
  const [tramiteId, setTramiteId] = useState<string | null>(null);
  const [stepId, setStepId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Check if user is PRO
    const checkPro = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase.from('profiles').select('is_pro').eq('id', user.id).single();
        if (data && data.is_pro) {
          setIsPro(true);
        }
      }
    };
    checkPro();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, stepId]);

  const currentTramite = tramiteId ? getTramiteById(tramiteId) : null;
  const currentStep = currentTramite?.steps.find(s => s.id === stepId);
  const stepIndex = currentStep ? currentTramite!.steps.findIndex(s => s.id === stepId) : 0;
  const totalSteps = currentTramite ? currentTramite.steps.length : 0;

  const isProTramite = currentTramite?.monetizationTier === 'pro';

  const handleNextStep = () => {
    // PAYWALL: Solo bloquea trámites PRO para usuarios no-PRO. Free tramites fluyen siempre.
    if (stepIndex === 0 && isProTramite && !isPro) {
      window.location.href = '/api/pago/crear';
      return;
    }
    sendAction('__ACTION__NEXT__', true);
  };

  const sendAction = async (actionText: string, isCommand = false) => {
    if (loading) return;
    setLoading(true);

    if (!isCommand) {
      setMessages(prev => [...prev, { role: 'user', content: actionText }]);
      setInput('');
    }

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: actionText, sessionId })
      });

      if (!res.ok) throw new Error('Error del servidor');
      const data = await res.json();

      if (data.sessionId && !sessionId) setSessionId(data.sessionId);

      if (data.type === 'flow_started' || data.type === 'step_advanced' || data.type === 'step_regressed') {
        setTramiteId(data.tramiteId);
        setStepId(data.stepId);
      } else if (data.type === 'chat') {
        setMessages(prev => [...prev, { role: 'assistant', content: data.content }]);
      } else if (data.type === 'flow_completed') {
        setCompletedOutcome({
          tramiteId: data.tramiteId,
          goal: currentTramite?.goal || 'Trámite',
          totalSteps: totalSteps,
        });
        setTramiteId(null);
        setStepId(null);
      } else if (data.type === 'error') {
        setMessages(prev => [...prev, { role: 'assistant', content: data.content }]);
      }

    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Ocurrió un error. Intenta más tarde.' }]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) sendAction(input, false);
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          position: 'fixed', bottom: '24px', right: '24px', width: '60px', height: '60px',
          borderRadius: '30px', background: 'linear-gradient(135deg, #1E3A8A, #2563EB)',
          color: '#fff', border: 'none', cursor: 'pointer',
          boxShadow: '0 4px 20px rgba(37,99,235,0.4)', display: 'flex', alignItems: 'center',
          justifyContent: 'center', fontSize: '24px', zIndex: 1000
        }}
      >
        {isOpen ? '✕' : '📋'}
      </button>

      {isOpen && (
        <div style={{
          position: 'fixed', bottom: '96px', right: '24px', width: '380px', height: '600px',
          maxHeight: 'calc(100vh - 140px)', background: '#fff', borderRadius: '16px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.15)', display: 'flex', flexDirection: 'column',
          zIndex: 1000, overflow: 'hidden', border: '1px solid rgba(0,0,0,0.08)'
        }}>
          {/* Header */}
          <div style={{ padding: '16px 20px', background: '#0A0A0E', color: '#fff', fontSize: '14px', fontWeight: 600 }}>
            <span style={{ color: '#3B82F6' }}>◆</span> Tramita · Guía de Trámites
          </div>

          <div style={{ flex: 1, overflowY: 'auto', background: '#F8F8FA', padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            
            {/* Pantalla Inicial */}
            {!currentTramite && messages.length === 0 && (
              <div style={{ background: '#fff', padding: '16px', borderRadius: '12px', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
                <h3 style={{ margin: '0 0 8px 0', fontSize: '15px' }}>Bienvenido a Tramita OS</h3>
                <p style={{ margin: 0, fontSize: '13px', color: '#555' }}>
                  Soy tu guía para realizar trámites en el Estado. Dime qué necesitas hacer, por ejemplo:
                  <br/><br/>
                  <em>"Necesito hacer inicio de actividades"</em><br/>
                  <em>"Quiero consultar deudas fiscales"</em><br/>
                  <em>"Revisar causas judiciales"</em>
                </p>
              </div>
            )}

            {/* Chat Contextual */}
            {messages.map((msg, i) => (
              <div key={i} style={{
                alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                background: msg.role === 'user' ? '#EFF6FF' : '#fff',
                color: msg.role === 'user' ? '#1E3A8A' : '#333',
                padding: '10px 14px', borderRadius: '12px', fontSize: '13px',
                maxWidth: '85%', boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
              }}>
                {msg.content}
              </div>
            ))}

            {/* Widget del Paso Actual */}
            {currentTramite && currentStep && (
              <div style={{
                background: '#fff', border: '1px solid #E5E7EB', borderRadius: '12px', overflow: 'hidden',
                boxShadow: '0 4px 12px rgba(0,0,0,0.05)', marginTop: '8px'
              }}>
                <div style={{ background: '#F3F4F6', padding: '10px 16px', fontSize: '12px', color: '#4B5563', borderBottom: '1px solid #E5E7EB', display: 'flex', justifyContent: 'space-between' }}>
                  <strong>{currentTramite.goal}</strong>
                  <span>Paso {stepIndex + 1} de {totalSteps}</span>
                </div>
                <div style={{ padding: '16px' }}>
                  <h4 style={{ margin: '0 0 8px 0', fontSize: '15px', color: '#111827' }}>{currentStep.title}</h4>
                  <p style={{ margin: '0 0 12px 0', fontSize: '13px', color: '#4B5563', lineHeight: '1.5' }}>
                    {currentStep.instruction}
                  </p>

                  {currentStep.warnings && currentStep.warnings.map((w, i) => (
                    <div key={i} style={{ background: '#FEF2F2', color: '#991B1B', padding: '8px 12px', borderRadius: '6px', fontSize: '12px', marginBottom: '12px', borderLeft: '3px solid #EF4444' }}>
                      ⚠️ {w}
                    </div>
                  ))}

                  {currentStep.context && (
                    <a href={currentStep.context} target="_blank" rel="noreferrer" style={{ display: 'inline-block', color: '#2563EB', fontSize: '13px', textDecoration: 'underline', marginBottom: '16px' }}>
                      Abrir enlace oficial ↗
                    </a>
                  )}

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '12px' }}>
                    
                    {(isProTramite && !isPro && stepIndex === 0) ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <div style={{ background: '#FEF3C7', border: '1px solid #FCD34D', borderRadius: '8px', padding: '12px', fontSize: '12px', color: '#92400E', lineHeight: '1.5' }}>
                          <strong>⭐ Trámite PRO</strong><br/>
                          Este flujo guiado te ahorra ~{totalSteps * 8} minutos y reduce errores costosos. Desbloquéalo para completarlo con asistencia paso a paso.
                        </div>
                        <button onClick={handleNextStep} disabled={loading} style={{ padding: '10px 12px', borderRadius: '8px', border: 'none', background: '#10B981', color: '#fff', fontSize: '13px', cursor: 'pointer', width: '100%', fontWeight: 600 }}>
                          💎 Desbloquear guía completa
                        </button>
                      </div>
                    ) : (
                      <>
                        {(stepIndex === 0 && currentTramite?.requiresExplicitConsent) && (
                          <label style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '12px', color: '#4B5563', marginBottom: '8px', background: '#F3F4F6', padding: '10px', borderRadius: '8px' }}>
                            <input type="checkbox" checked={hasConsented} onChange={(e) => setHasConsented(e.target.checked)} style={{ marginTop: '2px' }} />
                            <span>{currentTramite.legalDisclaimer}</span>
                          </label>
                        )}
                        
                        <button 
                          onClick={handleNextStep} 
                          disabled={loading || (stepIndex === 0 && currentTramite?.requiresExplicitConsent && !hasConsented)} 
                          style={{ padding: '10px 12px', borderRadius: '8px', border: 'none', background: (stepIndex === 0 && currentTramite?.requiresExplicitConsent && !hasConsented) ? '#9CA3AF' : '#1E3A8A', color: '#fff', fontSize: '13px', cursor: (stepIndex === 0 && currentTramite?.requiresExplicitConsent && !hasConsented) ? 'not-allowed' : 'pointer', width: '100%', fontWeight: 600 }}>
                          ✅ Listo, continuar al siguiente paso
                        </button>

                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button onClick={() => sendAction('__ACTION__HELP__', true)} disabled={loading} style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #FCA5A5', background: '#FEF2F2', color: '#B91C1C', fontSize: '12px', cursor: 'pointer', flex: 1, fontWeight: 500 }}>
                            ❌ No encuentro la opción
                          </button>
                          
                          <button onClick={() => setShowInput(!showInput)} disabled={loading} style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #D1D5DB', background: '#fff', color: '#374151', fontSize: '12px', cursor: 'pointer', flex: 1, fontWeight: 500 }}>
                            ❓ Tengo una duda
                          </button>
                        </div>
                        
                        {stepIndex > 0 && (
                          <button onClick={() => sendAction('__ACTION__PREV__', true)} disabled={loading} style={{ padding: '6px', border: 'none', background: 'transparent', color: '#6B7280', fontSize: '12px', cursor: 'pointer', textDecoration: 'underline', marginTop: '4px' }}>
                            Volver al paso anterior
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Pantalla de Outcome Completado */}
            {completedOutcome && (
              <div style={{
                background: '#fff', border: '2px solid #10B981', borderRadius: '12px', overflow: 'hidden',
                boxShadow: '0 4px 16px rgba(16, 185, 129, 0.15)', marginTop: '8px'
              }}>
                <div style={{ background: '#ECFDF5', padding: '20px', textAlign: 'center' }}>
                  <div style={{ fontSize: '40px', marginBottom: '8px' }}>✅</div>
                  <h3 style={{ margin: '0 0 4px 0', fontSize: '16px', color: '#065F46', fontWeight: 700 }}>
                    ¡Trámite Completado!
                  </h3>
                  <p style={{ margin: '0 0 12px 0', fontSize: '14px', color: '#047857', fontWeight: 600 }}>
                    {completedOutcome.goal}
                  </p>
                </div>
                <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#4B5563' }}>
                    <span>📋 Pasos completados</span>
                    <strong>{completedOutcome.totalSteps}/{completedOutcome.totalSteps}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#4B5563' }}>
                    <span>🕐 Tiempo estimado ahorrado</span>
                    <strong>~{completedOutcome.totalSteps * 8} min</strong>
                  </div>
                  <div style={{ height: '6px', background: '#D1FAE5', borderRadius: '99px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: '100%', background: '#10B981', borderRadius: '99px' }} />
                  </div>
                  <button 
                    onClick={() => { setCompletedOutcome(null); setMessages([]); setSessionId(null); setHasConsented(false); }}
                    style={{ padding: '10px 12px', borderRadius: '8px', border: 'none', background: '#1E3A8A', color: '#fff', fontSize: '13px', cursor: 'pointer', width: '100%', fontWeight: 600 }}
                  >
                    📋 Hacer otro trámite
                  </button>
                  <a href="/buscar" style={{ textAlign: 'center', fontSize: '12px', color: '#6B7280', textDecoration: 'underline' }}>
                    Ver catálogo completo →
                  </a>
                </div>
              </div>
            )}

            {loading && <div style={{ fontSize: '13px', color: '#999', padding: '8px' }}>Cargando...</div>}
            <div ref={messagesEndRef} />
          </div>

          {/* Área de Preguntas Contextuales (Toggleable) */}
          {(!currentTramite || showInput) && (
            <form onSubmit={handleSubmit} style={{ padding: '12px 16px', borderTop: '1px solid #eee', display: 'flex', gap: '8px', background: '#fff' }}>
              <input
                value={input} onChange={(e) => setInput(e.target.value)}
                placeholder={currentTramite ? "Escribe tu duda exacta..." : "Busca un trámite..."}
                disabled={loading}
                style={{ flex: 1, padding: '10px 14px', borderRadius: '24px', border: '1px solid #ddd', fontSize: '13px', outline: 'none' }}
              />
              <button type="submit" disabled={loading || !input.trim()} style={{ padding: '10px 18px', borderRadius: '24px', background: loading || !input.trim() ? '#ccc' : '#1E3A8A', color: '#fff', border: 'none', cursor: loading || !input.trim() ? 'default' : 'pointer', fontSize: '13px', fontWeight: 600 }}>
                Enviar
              </button>
            </form>
          )}
        </div>
      )}
    </>
  );
}
