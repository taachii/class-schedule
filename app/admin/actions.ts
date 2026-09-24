'use server';

import { createClient } from '@supabase/supabase-js';

// Używamy Service Key, by ominąć RLS i mieć pewność, że wstawienie zadziała
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY!;

const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

export async function addEventAction(eventData: any, password: string) {
  // Proste zabezpieczenie hasłem (odczytywane ze zmiennych środowiskowych)
  const adminPassword = process.env.ADMIN_PASSWORD || 'secret';
  
  if (password !== adminPassword) {
    return { success: false, error: 'Nieprawidłowe hasło administratora.' };
  }

  if (!SUPABASE_SERVICE_KEY) {
    return { success: false, error: 'Brak SUPABASE_SERVICE_KEY w zmiennych środowiskowych serwera.' };
  }

  // Wymuszenie formatu czasu (dodanie :00 jeśli brakuje sekund)
  const formatTime = (t: string) => (t.length === 5 ? `${t}:00` : t);

  const newEvent = {
    ...eventData,
    time_start: formatTime(eventData.time_start),
    time_end: formatTime(eventData.time_end),
  };

  const { data, error } = await supabaseAdmin.from('events').insert([newEvent]);

  if (error) {
    console.error('Błąd dodawania zajęć:', error);
    return { success: false, error: error.message };
  }

  return { success: true, data };
}
