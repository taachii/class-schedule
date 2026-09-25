import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_KEY!;
  return createClient(url, key);
}

export async function POST(request: Request) {
  try {
    const { password } = await request.json();

    if (!password) {
      return NextResponse.json({ error: 'Hasło jest wymagane.' }, { status: 400 });
    }

    const supabaseAdmin = getSupabaseAdmin();
    // We fetch the matching admin key
    const { data, error } = await supabaseAdmin
      .from('admin_keys')
      .select('*')
      .eq('pass_key', password)
      .single();

    if (error || !data) {
      return NextResponse.json({ error: 'Nieprawidłowe hasło.' }, { status: 401 });
    }

    const roleData = {
      type: data.role,
      group: data.assigned_group,
      year: data.assigned_year,
      name: data.name,
      email: data.email,
    };

    return NextResponse.json({ role: roleData });
  } catch (err) {
    console.error('Auth error:', err);
    return NextResponse.json({ error: 'Wystąpił błąd podczas logowania.' }, { status: 500 });
  }
}
