import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100);
    const offset = parseInt(searchParams.get('offset') || '0');
    const unreadOnly = searchParams.get('unread') === 'true';

    let query = supabase
      .from('alerts')
      .select('*', { count: 'exact' })
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (unreadOnly) {
      query = query.eq('read', false);
    }

    const { data: alerts, error, count } = await query;
    if (error) throw error;

    return NextResponse.json({ alerts, total: count, limit, offset });
  } catch (err) {
    console.error('Error fetching alerts:', err);
    return NextResponse.json({ error: 'Error al obtener alertas' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    const body = await req.json();
    const { alertId, action } = body;

    if (action === 'read_all') {
      const { error } = await supabase
        .from('alerts')
        .update({ read: true })
        .eq('user_id', user.id)
        .eq('read', false);
      if (error) throw error;
      return NextResponse.json({ success: true });
    }

    if (!alertId) {
      return NextResponse.json({ error: 'alertId requerido' }, { status: 400 });
    }

    const updates: Record<string, any> = {};
    if (action === 'read') updates.read = true;
    if (action === 'archive') updates.read = true;
    if (action === 'unread') updates.read = false;

    const { error } = await supabase
      .from('alerts')
      .update(updates)
      .eq('id', alertId)
      .eq('user_id', user.id);

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Error updating alert:', err);
    return NextResponse.json({ error: 'Error al actualizar alerta' }, { status: 500 });
  }
}
