import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/client';

export async function POST(request: Request) {
  try {
    const { password } = await request.json();

    if (!password) {
      return NextResponse.json({ error: 'Hasło jest wymagane.' }, { status: 400 });
    }

    // We fetch the matching admin key
    const { data, error } = await supabase
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
