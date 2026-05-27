'use client';

type Alert = {
  id: string;
  type: string;
  title: string;
  description: string;
  data: any;
  read: boolean;
  created_at: string;
};

const ALERT_ICONS: Record<string, string> = {
  nueva_causa: '⚖️',
  vencimiento_deuda: '⚠️',
  cambio_estado: '🔄',
  actualizacion_semanal: '📊',
  oportunidad: '💡',
  default: '🔔'
};

function getTimeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const hours = Math.floor(diff / 3600000);
  if (hours < 1) return 'hace minutos';
  if (hours < 24) return `hace ${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `hace ${days}d`;
  return new Date(dateStr).toLocaleDateString('es-CL');
}

export default function AlertCard({ alert, onMarkRead }: { alert: Alert; onMarkRead: (id: string) => void }) {
  const icon = ALERT_ICONS[alert.type] || ALERT_ICONS.default;

  return (
    <div
      onClick={() => !alert.read && onMarkRead(alert.id)}
      style={{
        padding: '14px 16px',
        background: alert.read ? '#fff' : '#FFF8F0',
        borderRadius: '12px',
        border: `1px solid ${alert.read ? '#eee' : '#FFDCC0'}`,
        cursor: alert.read ? 'default' : 'pointer',
        transition: 'all 0.2s',
        display: 'flex',
        gap: '12px',
        alignItems: 'flex-start'
      }}
    >
      <span style={{ fontSize: '20px' }}>{icon}</span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
          <strong style={{ fontSize: '14px', color: '#1a1a1a' }}>
            {alert.read ? alert.title : <>{alert.title}</>}
          </strong>
          <span style={{ fontSize: '11px', color: '#999' }}>{getTimeAgo(alert.created_at)}</span>
        </div>
        <p style={{ fontSize: '13px', color: '#666', margin: 0, lineHeight: '1.4' }}>
          {alert.description}
        </p>
      </div>
      {!alert.read && (
        <span style={{
          width: '8px',
          height: '8px',
          borderRadius: '4px',
          background: '#E65100',
          flexShrink: 0,
          marginTop: '6px'
        }} />
      )}
    </div>
  );
}
