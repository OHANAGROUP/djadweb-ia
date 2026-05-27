'use client';
import { useState, useRef, useEffect } from 'react';
import ChatMessage from './ChatMessage';

type Message = {
  role: 'user' | 'assistant' | 'system';
  content: string;
};

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'Hola! Soy tu asistente burocratico. Puedo ayudarte a consultar causas judiciales, datos del SII, deudas TGR y mas. Que necesitas saber?' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMsg: Message = { role: 'user', content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: input,
          sessionId,
          history: messages.slice(1).map(m => ({ role: m.role, content: m.content }))
        })
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Error del asistente');
      }

      const data = await res.json();
      if (data.sessionId && !sessionId) setSessionId(data.sessionId);

      setMessages(prev => [...prev, { role: 'assistant', content: data.content }]);
    } catch (err: any) {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Lo siento, ocurrio un error. Intenta de nuevo mas tarde.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Chat FAB */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          width: '60px',
          height: '60px',
          borderRadius: '30px',
          background: 'linear-gradient(135deg, #E65100, #FF8F00)',
          color: '#fff',
          border: 'none',
          cursor: 'pointer',
          boxShadow: '0 4px 20px rgba(230,81,0,0.4)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '24px',
          zIndex: 1000,
          transition: 'transform 0.2s'
        }}
        title="Asistente DJADWEB-IA"
      >
        {isOpen ? '✕' : '💬'}
      </button>

      {/* Chat Panel */}
      {isOpen && (
        <div
          style={{
            position: 'fixed',
            bottom: '96px',
            right: '24px',
            width: '380px',
            height: '600px',
            maxHeight: 'calc(100vh - 140px)',
            background: '#fff',
            borderRadius: '16px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
            display: 'flex',
            flexDirection: 'column',
            zIndex: 1000,
            overflow: 'hidden',
            border: '1px solid rgba(0,0,0,0.08)'
          }}
        >
          {/* Header */}
          <div style={{
            padding: '16px 20px',
            background: '#0A0A0E',
            color: '#fff',
            fontWeight: 600,
            fontSize: '14px'
          }}>
            <span style={{ color: '#E65100' }}>◆</span> DJADWEB-IA Asistente
          </div>

          {/* Messages */}
          <div style={{
            flex: 1,
            overflowY: 'auto',
            padding: '16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            background: '#F8F8FA'
          }}>
            {messages.map((msg, i) => (
              <ChatMessage key={i} message={msg} />
            ))}
            {loading && (
              <div style={{
                alignSelf: 'flex-start',
                background: '#fff',
                borderRadius: '12px 12px 12px 4px',
                padding: '10px 16px',
                fontSize: '13px',
                color: '#999',
                boxShadow: '0 1px 4px rgba(0,0,0,0.06)'
              }}>
                Escribiendo...
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form onSubmit={handleSubmit} style={{
            padding: '12px 16px',
            borderTop: '1px solid #eee',
            display: 'flex',
            gap: '8px',
            background: '#fff'
          }}>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Escribe tu consulta..."
              disabled={loading}
              style={{
                flex: 1,
                padding: '10px 14px',
                borderRadius: '24px',
                border: '1px solid #ddd',
                fontSize: '13px',
                outline: 'none'
              }}
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              style={{
                padding: '10px 18px',
                borderRadius: '24px',
                background: loading || !input.trim() ? '#ccc' : '#E65100',
                color: '#fff',
                border: 'none',
                cursor: loading || !input.trim() ? 'default' : 'pointer',
                fontSize: '13px',
                fontWeight: 600
              }}
            >
              Enviar
            </button>
          </form>
        </div>
      )}
    </>
  );
}
