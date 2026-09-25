'use server';

import { createClient } from '@supabase/supabase-js';

// Używamy Service Key, by ominąć RLS i mieć pewność, że wstawienie zadziała
function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_KEY!;
  return createClient(url, key);
}

export async function addEventAction(eventData: any, password: string) {
  // Proste zabezpieczenie hasłem (odczytywane ze zmiennych środowiskowych)
  const adminPassword = process.env.ADMIN_PASSWORD || 'secret';
  
  if (password !== adminPassword) {
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

  const { data, error } = await supabaseAdmin.from('events').insert(eventsToInsert);

  if (error) {
    console.error('Błąd dodawania zajęć:', error);
    return { success: false, error: error.message };
  }

  return { success: true, data };
}

export async function deleteEventAction(id: string, password: string) {
  const adminPassword = process.env.ADMIN_PASSWORD || 'secret';
  if (password !== adminPassword) {
    return { success: false, error: 'Nieprawidłowe hasło administratora.' };
  }

  const supabaseAdmin = getSupabaseAdmin();
  const { error } = await supabaseAdmin.from('events').delete().eq('id', id);

  if (error) {
    console.error('Błąd usuwania zajęć:', error);
    return { success: false, error: error.message };
  }

  return { success: true };
}

export async function updateEventAction(id: string, eventData: any, password: string) {
  const adminPassword = process.env.ADMIN_PASSWORD || 'secret';
  if (password !== adminPassword) {
    return { success: false, error: 'Nieprawidłowe hasło administratora.' };
  }

  const formatTime = (t: string) => (t.length === 5 ? `${t}:00` : t);

  const updatedEvent = {
    ...eventData,
    time_start: formatTime(eventData.time_start),
    time_end: formatTime(eventData.time_end),
  };

  const supabaseAdmin = getSupabaseAdmin();
  const { data, error } = await supabaseAdmin.from('events').update(updatedEvent).eq('id', id);

  if (error) {
    console.error('Błąd edycji zajęć:', error);
    return { success: false, error: error.message };
  }

  return { success: true, data };
}

export async function verifyPasswordAction(password: string) {
  const adminPassword = process.env.ADMIN_PASSWORD || 'secret';
  return password === adminPassword;
}
