import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';

export async function POST() {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    const { error } = await supabase
      .from('alerts')
      .update({ read: true })
      .eq('user_id', user.id)
      .eq('read', false);

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Error marking all as read:', err);
    return NextResponse.json({ error: 'Error al marcar como leídas' }, { status: 500 });
  }
}
