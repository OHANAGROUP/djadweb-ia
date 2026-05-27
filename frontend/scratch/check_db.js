const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'process.env.NEXT_PUBLIC_SUPABASE_URL || ''',
  'process.env.SUPABASE_SERVICE_ROLE_KEY || '''
);

async function check() {
  const { data: sessions } = await supabase.from('chat_sessions').select('*').order('created_at', { ascending: false }).limit(1);
  console.log('Última sesión:', JSON.stringify(sessions, null, 2));

  if (sessions && sessions.length > 0) {
    const sessionId = sessions[0].id;
    const { data: messages } = await supabase.from('chat_messages').select('*').eq('session_id', sessionId).order('created_at', { ascending: true });
    console.log('\nMensajes:', JSON.stringify(messages, null, 2));

    const { data: logs } = await supabase.from('compliance_audit_log').select('*').eq('session_id', sessionId);
    console.log('\nLogs de cumplimiento:', JSON.stringify(logs, null, 2));
  }
}

check();
