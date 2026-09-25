import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_KEY!;
  return createClient(url, key);
}

export async function GET(request: Request) {
  try {
    // Only fetch moderators
    const supabaseAdmin = getSupabaseAdmin();
    const { data, error } = await supabaseAdmin
      .from('admin_keys')
      .select('id, name, email, role, assigned_group, assigned_year')
      .in('role', ['admin', 'moderator'])
      .order('assigned_year', { ascending: true })
      .order('assigned_group', { ascending: true });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ moderators: data });
  } catch (err) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { id, newPassword, password } = await request.json();

    if (!id || !newPassword || !password) {
      return NextResponse.json({ error: 'Missing parameters or password' }, { status: 400 });
    }

    const supabaseAdmin = getSupabaseAdmin();
    
    // Verify password and role
    const { data: authData } = await supabaseAdmin
      .from('admin_keys')
      .select('role, assigned_year')
      .eq('pass_key', password)
      .single();

    if (!authData || (authData.role !== 'master' && authData.role !== 'admin')) {
      return NextResponse.json({ error: 'Unauthorized. Only Master or Admin can generate codes.' }, { status: 403 });
    }

    // If it's an admin, verify they are modifying a moderator from their year
    if (authData.role === 'admin') {
      const { data: targetMod } = await supabaseAdmin
        .from('admin_keys')
        .select('assigned_year')
        .eq('id', id)
        .single();
      
      if (!targetMod || targetMod.assigned_year !== authData.assigned_year) {
         return NextResponse.json({ error: 'Unauthorized. You can only modify moderators for your assigned year.' }, { status: 403 });
      }
    }

    const { error } = await supabaseAdmin
      .from('admin_keys')
      .update({ pass_key: newPassword })
      .eq('id', id)
      .in('role', ['admin', 'moderator']);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
