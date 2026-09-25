import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY!;
const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

export async function GET(request: Request) {
  try {
    // Only fetch moderators
    const { data, error } = await supabaseAdmin
      .from('admin_keys')
      .select('id, name, email, assigned_group, assigned_year')
      .eq('role', 'moderator')
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
    const { id, newPassword } = await request.json();

    if (!id || !newPassword) {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from('admin_keys')
      .update({ pass_key: newPassword })
      .eq('id', id)
      .eq('role', 'moderator'); // only allow resetting moderator passwords

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
