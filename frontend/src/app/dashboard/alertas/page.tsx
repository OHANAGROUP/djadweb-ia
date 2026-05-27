'use client';
import { useAlertas } from '@/hooks/useAlertas';
import AlertCard from '@/components/AlertCard';
import { useRouter } from 'next/navigation';

export default function AlertasPage() {
  const { alerts, unreadCount, loading, markAsRead, markAllAsRead } = useAlertas();
  const router = useRouter();

  return (
    <div style={{ padding: '32px', maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#1a1a1a', margin: 0 }}>Alertas</h1>
          <p style={{ fontSize: '14px', color: '#666', marginTop: '4px' }}>
            {unreadCount > 0 ? `Tienes ${unreadCount} alerta${unreadCount !== 1 ? 's' : ''} sin leer` : 'No hay alertas sin leer'}
          </p>
        </div>
        <button
          onClick={() => router.push('/dashboard')}
          style={{
            padding: '8px 20px',
            borderRadius: '8px',
            border: '1px solid #ddd',
            background: '#fff',
            cursor: 'pointer',
            fontSize: '13px'
          }}
        >
          ← Volver al Dashboard
        </button>
      </div>

      {unreadCount > 0 && (
        <button
          onClick={markAllAsRead}
          style={{
            padding: '8px 16px',
            borderRadius: '8px',
            border: 'none',
            background: '#E65100',
            color: '#fff',
            cursor: 'pointer',
            fontSize: '13px',
            fontWeight: 600,
            marginBottom: '16px'
          }}
        >
          Marcar todas como leidas
        </button>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>Cargando alertas...</div>
      ) : alerts.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '60px 20px',
          background: '#fff',
          borderRadius: '16px',
          border: '1px solid #eee'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔔</div>
          <h3 style={{ fontSize: '18px', color: '#333', margin: '0 0 8px' }}>No hay alertas aun</h3>
          <p style={{ fontSize: '14px', color: '#999', margin: 0 }}>
            Las alertas apareceran aqui cuando haya novedades sobre tus causas, deudas o tramites.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {alerts.map(alert => (
            <AlertCard key={alert.id} alert={alert} onMarkRead={markAsRead} />
          ))}
        </div>
      )}
    </div>
  );
}
