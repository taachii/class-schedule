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
  const { data } = await supabaseAdmin.from('admin_keys').select('id, role').eq('pass_key', password).single();
  if (data) {
    return { isValid: true, role: data.role };
  }
  return { isValid: false };
}

async function touchGroups(supabaseAdmin: any, semesterId: number, targetGroups: string[]) {
  const groupsToTouch = new Set<string>();
  
  if (targetGroups) {
    targetGroups.forEach(g => {
      groupsToTouch.add(g);
      
      let num = parseInt(g.replace(/[^0-9]/g, ''));
      if (isNaN(num)) return;
      
      if (g.startsWith('GK')) {
        const gcNum = Math.ceil(num / 2);
        const gsNum = Math.ceil(gcNum / 2);
        const prefix = g.replace(/[0-9]/g, '').replace('K', '');
        groupsToTouch.add(`${prefix}C${gcNum}`);
        groupsToTouch.add(`${prefix}S${gsNum}`);
      } else if (g.startsWith('GC')) {
        const gsNum = Math.ceil(num / 2);
        const prefix = g.replace(/[0-9]/g, '').replace('C', 'S');
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
  const auth = await verifyAdminPassword(password);
  if (!auth.isValid) {
    return { success: false, error: 'Nieprawidłowe hasło administratora.' };
  }

  const eventsToCheck = Array.isArray(eventData) ? eventData : [eventData];
  const hasExams = eventsToCheck.some(ev => ev.type === 'E' || ev.type === 'W');
  if (hasExams && auth.role === 'moderator') {
    return { success: false, error: 'Tylko starosta może dodawać egzaminy i wykłady.' };
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
      await touchGroups(supabaseAdmin, ev.semester_id, ev.target_groups);
    }
  }

  return { success: true, data };
}

export async function deleteEventAction(id: string, password: string) {
  const auth = await verifyAdminPassword(password);
  if (!auth.isValid) {
    return { success: false, error: 'Nieprawidłowe hasło administratora.' };
  }

  const supabaseAdmin = getSupabaseAdmin();
  
  // Fetch event first to know which groups to touch
  const { data: eventToDel } = await supabaseAdmin.from('events').select('*').eq('id', id).single();
  
  if (eventToDel && (eventToDel.type === 'E' || eventToDel.type === 'W') && auth.role === 'moderator') {
    return { success: false, error: 'Tylko starosta może usuwać egzaminy i wykłady.' };
  }

  const { error } = await supabaseAdmin.from('events').delete().eq('id', id);

  if (error) {
    console.error('Błąd usuwania zajęć:', error);
    return { success: false, error: error.message };
  }

  if (eventToDel) {
    await touchGroups(supabaseAdmin, eventToDel.semester_id, eventToDel.target_groups);
  }

  return { success: true };
}

export async function updateEventAction(id: string, eventData: any, password: string) {
  const auth = await verifyAdminPassword(password);
  if (!auth.isValid) {
    return { success: false, error: 'Nieprawidłowe hasło administratora.' };
  }

  if ((eventData.type === 'E' || eventData.type === 'W') && auth.role === 'moderator') {
    return { success: false, error: 'Tylko starosta może edytować egzaminy i wykłady.' };
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
    await touchGroups(supabaseAdmin, ev.semester_id, ev.target_groups);
  }

  return { success: true, data };
}

export async function verifyPasswordAction(password: string) {
  const auth = await verifyAdminPassword(password);
  return auth.isValid;
}

// --- PROFESSORS MANAGEMENT ---

export async function getProfessors() {
  const supabaseAdmin = getSupabaseAdmin();
  const { data, error } = await supabaseAdmin.from('professors').select('*').order('last_name', { ascending: true });
  if (error) return { success: false, error: error.message };
  return { success: true, data };
}

export async function addProfessor(professor: any, password: string) {
  const auth = await verifyAdminPassword(password);
  if (!auth.isValid || auth.role !== 'master') {
    return { success: false, error: 'Brak uprawnień do zarządzania bazą profesorów' };
  }
  const supabaseAdmin = getSupabaseAdmin();
  const { data, error } = await supabaseAdmin.from('professors').insert(professor).select();
  if (error) return { success: false, error: error.message };
  return { success: true, data };
}

export async function updateProfessor(id: string, professor: any, password: string) {
  const auth = await verifyAdminPassword(password);
  if (!auth.isValid || auth.role !== 'master') {
    return { success: false, error: 'Brak uprawnień do edycji bazy profesorów' };
  }
  const supabaseAdmin = getSupabaseAdmin();
  const { data, error } = await supabaseAdmin.from('professors').update(professor).eq('id', id).select();
  if (error) return { success: false, error: error.message };
  return { success: true, data };
}

export async function deleteProfessor(id: string, password: string) {
  const auth = await verifyAdminPassword(password);
  if (!auth.isValid || auth.role !== 'master') {
    return { success: false, error: 'Brak uprawnień do usunięcia profesora' };
  }
  const supabaseAdmin = getSupabaseAdmin();
  const { error } = await supabaseAdmin.from('professors').delete().eq('id', id);
  if (error) return { success: false, error: error.message };
  return { success: true };
}

// --- SUBJECT GROUP DEFAULTS ---

export async function getSubjectDefaults(subjectKey: string, semesterId: number) {
  const supabaseAdmin = getSupabaseAdmin();
  const { data, error } = await supabaseAdmin
    .from('subject_group_defaults')
    .select('*')
    .eq('subject_key', subjectKey)
    .eq('semester_id', semesterId);
  if (error) return { success: false, error: error.message };
  return { success: true, data };
}

export async function saveSubjectDefault(payload: { subject_key: string, semester_id: number, group_key: string, professor_id: string | null }, password: string) {
  const auth = await verifyAdminPassword(password);
  if (!auth.isValid) return { success: false, error: 'Nieprawidłowe hasło' };

  // Sprawdzanie uprawnień moderatora
  if (auth.role?.type === 'moderator' && auth.role.group) {
    const modGs = auth.role.group;
    const modGsNum = parseInt(modGs.replace(/[^0-9]/g, ''));
    const g = payload.group_key;
    
    const allowedGc1 = `GC${modGsNum * 2 - 1}`;
    const allowedGc2 = `GC${modGsNum * 2}`;
    const allowedGk1 = `GK${modGsNum * 4 - 3}`;
    const allowedGk2 = `GK${modGsNum * 4 - 2}`;
    const allowedGk3 = `GK${modGsNum * 4 - 1}`;
    const allowedGk4 = `GK${modGsNum * 4}`;

    if (g !== modGs && g !== allowedGc1 && g !== allowedGc2 && g !== allowedGk1 && g !== allowedGk2 && g !== allowedGk3 && g !== allowedGk4) {
      return { success: false, error: 'Nie masz uprawnień do przypisywania prowadzącego dla tej grupy.' };
    }
  }

  const supabaseAdmin = getSupabaseAdmin();
  
  if (!payload.professor_id) {
    // Delete if no professor
    const { error } = await supabaseAdmin
      .from('subject_group_defaults')
      .delete()
      .eq('subject_key', payload.subject_key)
      .eq('semester_id', payload.semester_id)
      .eq('group_key', payload.group_key);
    if (error) return { success: false, error: error.message };
    return { success: true };
  }

  // Upsert
  const { data, error } = await supabaseAdmin
    .from('subject_group_defaults')
    .upsert({
      subject_key: payload.subject_key,
      semester_id: payload.semester_id,
      group_key: payload.group_key,
      professor_id: payload.professor_id
    }, { onConflict: 'subject_key,semester_id,group_key' })
    .select();

  if (error) return { success: false, error: error.message };
  return { success: true, data };
}
