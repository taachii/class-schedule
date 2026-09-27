import { supabase } from './client';
import type { Subject, Semester, ScheduleEvent, EventType } from '@/types/schedule';

/**
 * Fetch all subjects for a given semester (via subject_semesters junction).
 */
export async function fetchSubjects(semesterId: number): Promise<Subject[]> {
  const { data, error } = await supabase
    .from('subject_semesters')
    .select('subjects(*)')
    .eq('semester_id', semesterId);

  if (error) throw error;
  return (data ?? []).map((row: any) => row.subjects as Subject);
}

/**
 * Fetch all semesters for a given year number.
 */
export async function fetchSemesters(yearNumber: number): Promise<Semester[]> {
  const { data, error } = await supabase
    .from('semesters')
    .select('*')
    .eq('year_number', yearNumber)
    .order('semester_no', { ascending: true });

  if (error) throw error;
  return data ?? [];
}

/**
 * Fetch all event types (reference table).
 */
export async function fetchEventTypes(): Promise<EventType[]> {
  const { data, error } = await supabase
    .from('event_types')
    .select('*');

  if (error) throw error;
  return data ?? [];
}

/**
 * Fetch events for a specific group within a semester.
 * Handles both seminar groups (GS1, GS2...) and the GW (all-lecture) group.
 *
 * @param semesterId  - The semester to query
 * @param groupKey    - e.g. 'GS1', 'GW'
 */
export async function fetchEventsForGroup(
  semesterId: number,
  targetGroups: string[]
): Promise<ScheduleEvent[]> {

  const query = supabase
    .from('events')
    .select(`
      *,
      subject:subjects(*)
    `)
    .eq('semester_id', semesterId)
    .overlaps('target_groups', targetGroups);

  const { data, error } = await query.order('date').order('time_start');

  if (error) throw error;
  return data ?? [];
}

/**
 * Fetch all available semesters in the system.
 */
export async function fetchAllSemesters(): Promise<Semester[]> {
  const { data, error } = await supabase
    .from('semesters')
    .select('*')
    .order('year_number', { ascending: true })
    .order('semester_no', { ascending: true });

  if (error) throw error;
  return data ?? [];
}

/**
 * Fetch all professors
 */
export async function fetchProfessors() {
  const { data, error } = await supabase.from('professors').select('*');
  if (error) throw error;
  return data ?? [];
}

/**
 * Fetch all subject group defaults for a semester
 */
export async function fetchSubjectGroupDefaults(semesterId: number) {
  const { data, error } = await supabase
    .from('subject_group_defaults')
    .select('*')
    .eq('semester_id', semesterId);
  if (error) throw error;
  return data ?? [];
}

export async function fetchGroupUpdate(semesterId: number, targetGroups: string[]): Promise<string | null> {
  const { data, error } = await supabase
    .from('group_updates')
    .select('updated_at')
    .eq('semester_id', semesterId)
    .in('group_key', targetGroups)
    .order('updated_at', { ascending: false })
    .limit(1);

  if (error || !data || data.length === 0) return null;
  return data[0].updated_at;
}
