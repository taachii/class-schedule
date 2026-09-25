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
  groupKey: string
): Promise<ScheduleEvent[]> {
  const isLectureGroup = groupKey === 'GW';

  let query = supabase
    .from('events')
    .select(`
      *,
      subject:subjects(*)
    `)
    .eq('semester_id', semesterId);

  if (isLectureGroup) {
    // GW tab: only show events that are explicitly for all (GW in seminar_groups)
    query = query.contains('seminar_groups', ['GW']);
  } else {
    // Determine which GC groups belong to this GS group
    // e.g. GS1 -> GC1, GC2
    const gsNumber = parseInt(groupKey.replace('GS', ''));
    if (!isNaN(gsNumber)) {
      const gc1 = `GC${gsNumber * 2 - 1}`;
      const gc2 = `GC${gsNumber * 2}`;
      
      query = query.or(
        `seminar_groups.cs.{"GW"},seminar_groups.cs.{"${groupKey}"},exercise_groups.cs.{"${gc1}"},exercise_groups.cs.{"${gc2}"}`
      );
    } else {
      query = query.or(
        `seminar_groups.cs.{"GW"},seminar_groups.cs.{"${groupKey}"}`
      );
    }
  }

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
