'use client';
import { useState, useEffect, useCallback, useRef } from 'react';

export type Alert = {
  id: string;
  user_id: string;
  type: string;
  title: string;
  description: string;
  data: any;
  read: boolean;
  created_at: string;
};

type UseAlertasReturn = {
  alerts: Alert[];
  unreadCount: number;
  loading: boolean;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  refresh: () => Promise<void>;
};

export function useAlertas(): UseAlertasReturn {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchAlerts = useCallback(async () => {
    try {
      const res = await fetch('/api/alertas?limit=50');
      if (res.status === 401) {
        setAlerts([]);
        setUnreadCount(0);
        return;
      }
      if (res.ok) {
        const data = await res.json();
        setAlerts(data.alerts || []);
      }
    } catch (e) {
      console.error('Error fetching alerts:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchUnreadCount = useCallback(async () => {
    try {
      const res = await fetch('/api/alertas/count');
      if (res.ok) {
        const data = await res.json();
        setUnreadCount(data.count || 0);
      }
    } catch (e) {
      console.error('Error fetching unread count:', e);
    }
  }, []);

  useEffect(() => {
    fetchAlerts();
    fetchUnreadCount();

    // Poll for unread count every 60 seconds
    intervalRef.current = setInterval(fetchUnreadCount, 60000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [fetchAlerts, fetchUnreadCount]);

  const markAsRead = useCallback(async (id: string) => {
    try {
      const res = await fetch('/api/alertas', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, read: true })
      });
      if (res.ok) {
        setAlerts(prev => prev.map(a => a.id === id ? { ...a, read: true } : a));
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (e) {
      console.error('Error marking alert as read:', e);
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    try {
      const res = await fetch('/api/alertas/leer-todas', { method: 'POST' });
      if (res.ok) {
        setAlerts(prev => prev.map(a => ({ ...a, read: true })));
        setUnreadCount(0);
      }
    } catch (e) {
      console.error('Error marking all as read:', e);
    }
  }, []);

  return { alerts, unreadCount, loading, markAsRead, markAllAsRead, refresh: fetchAlerts };
}
