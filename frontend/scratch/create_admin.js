const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'process.env.NEXT_PUBLIC_SUPABASE_URL || ''',
  'process.env.SUPABASE_SERVICE_ROLE_KEY || ''',
  { auth: { autoRefreshToken: false, persistSession: false } }
);

async function run() {
  console.log('Creando usuario...');
  const { data, error } = await supabase.auth.admin.createUser({
    email: 'ppalominos@hotmail.com',
    password: 'AdminDejadwebiar2026!',
    email_confirm: true,
    user_metadata: {
      nombre_completo: 'pablo francisco palominos naredo'
    }
  });

  if (error) {
    console.error('Error creating user:', error.message);
  } else {
    console.log('Usuario creado exitosamente con ID:', data.user.id);
  }
}

run();
