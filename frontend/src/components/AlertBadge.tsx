'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function AlertBadge() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let cancelled = false;

    const fetchCount = async () => {
      try {
        const res = await fetch('/api/alertas/count');
        if (res.ok && !cancelled) {
          const data = await res.json();
          setCount(data.count || 0);
        }
      } catch {
        // Silently fail - badge just won't show
      }
    };

    fetchCount();
    const interval = setInterval(fetchCount, 60000);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  if (count === 0) return null;

  return (
    <Link href="/dashboard/alertas" style={{ position: 'relative', textDecoration: 'none' }}>
      <span style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: '20px',
        height: '20px',
        borderRadius: '10px',
        background: '#E65100',
        color: '#fff',
        fontSize: '11px',
        fontWeight: 700,
        padding: '0 6px',
        cursor: 'pointer'
      }}>
        {count > 99 ? '99+' : count}
      </span>
    </Link>
  );
}
