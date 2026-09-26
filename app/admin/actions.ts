'use server';

import { createClient } from '@supabase/supabase-js';

// Używamy Service Key, by ominąć RLS i mieć pewność, że wstawienie zadziała
function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_KEY!;
  return createClient(url, key);
}

async function verifyAdminPassword(password: string) {
  const supabaseAdmin = getSupabaseAdmin();
  const { data } = await supabaseAdmin.from('admin_keys').select('id').eq('pass_key', password).single();
  return !!data;
}

async function touchGroups(supabaseAdmin: any, semesterId: number, seminarGroups: string[], exerciseGroups: string[]) {
  const groupsToTouch = new Set<string>();
  
  if (seminarGroups) {
    seminarGroups.forEach(g => groupsToTouch.add(g));
  }
  
  if (exerciseGroups) {
    exerciseGroups.forEach(gc => {
      const num = parseInt(gc.replace(/[^0-9]/g, ''));
      if (!isNaN(num)) {
        const gsNum = Math.ceil(num / 2);
        const prefix = gc.replace(/[0-9]/g, '').replace('C', 'S');
        groupsToTouch.add(`${prefix}${gsNum}`);
      }
    });
  }

  const updates = Array.from(groupsToTouch).map(groupKey => ({
    semester_id: semesterId,
    group_key: groupKey,
    updated_at: new Date().toISOString()
  }));

  if (updates.length > 0) {
    await supabaseAdmin.from('group_updates').upsert(updates, { onConflict: 'semester_id, group_key' });
  }
}

export async function addEventAction(eventData: any, password: string) {
  const isValid = await verifyAdminPassword(password);
  if (!isValid) {
    return { success: false, error: 'Nieprawidłowe hasło administratora.' };
  }

  const key = process.env.SUPABASE_SERVICE_KEY;
  if (!key) {
    return { success: false, error: 'Brak SUPABASE_SERVICE_KEY w zmiennych środowiskowych serwera.' };
  }

  const supabaseAdmin = getSupabaseAdmin();

  const formatTime = (t: string) => (t.length === 5 ? `${t}:00` : t);

  const eventsToInsert = Array.isArray(eventData) 
    ? eventData.map((ev: any) => ({ ...ev, time_start: formatTime(ev.time_start), time_end: formatTime(ev.time_end) }))
    : [{ ...eventData, time_start: formatTime(eventData.time_start), time_end: formatTime(eventData.time_end) }];

  const { data, error } = await supabaseAdmin.from('events').insert(eventsToInsert).select();

  if (error) {
    console.error('Błąd dodawania zajęć:', error);
    return { success: false, error: error.message };
  }

  // Touch groups
  if (data && data.length > 0) {
    for (const ev of data) {
      await touchGroups(supabaseAdmin, ev.semester_id, ev.seminar_groups, ev.exercise_groups);
    }
  }

  return { success: true, data };
}

export async function deleteEventAction(id: string, password: string) {
  const isValid = await verifyAdminPassword(password);
  if (!isValid) {
    return { success: false, error: 'Nieprawidłowe hasło administratora.' };
  }

  const supabaseAdmin = getSupabaseAdmin();
  
  // Fetch event first to know which groups to touch
  const { data: eventToDel } = await supabaseAdmin.from('events').select('*').eq('id', id).single();
  
  const { error } = await supabaseAdmin.from('events').delete().eq('id', id);

  if (error) {
    console.error('Błąd usuwania zajęć:', error);
    return { success: false, error: error.message };
  }

  if (eventToDel) {
    await touchGroups(supabaseAdmin, eventToDel.semester_id, eventToDel.seminar_groups, eventToDel.exercise_groups);
  }

  return { success: true };
}

export async function updateEventAction(id: string, eventData: any, password: string) {
  const isValid = await verifyAdminPassword(password);
  if (!isValid) {
    return { success: false, error: 'Nieprawidłowe hasło administratora.' };
  }

  const formatTime = (t: string) => (t.length === 5 ? `${t}:00` : t);

  const updatedEvent = {
    ...eventData,
    time_start: formatTime(eventData.time_start),
    time_end: formatTime(eventData.time_end),
  };

  const supabaseAdmin = getSupabaseAdmin();
  const { data, error } = await supabaseAdmin.from('events').update(updatedEvent).eq('id', id).select();

  if (error) {
    console.error('Błąd edycji zajęć:', error);
    return { success: false, error: error.message };
  }

  if (data && data.length > 0) {
    const ev = data[0];
    await touchGroups(supabaseAdmin, ev.semester_id, ev.seminar_groups, ev.exercise_groups);
  }

  return { success: true, data };
}

export async function verifyPasswordAction(password: string) {
  return await verifyAdminPassword(password);
}
