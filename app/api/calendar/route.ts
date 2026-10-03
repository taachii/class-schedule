import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import { NextResponse } from 'next/server';
import ical from 'ical-generator';
import { supabase } from '@/lib/supabase/client';
import type { ScheduleEvent, Subject } from '@/types/schedule';

dayjs.extend(utc);
dayjs.extend(timezone);

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const groupsStr = searchParams.get('groups');
  const yearStr = searchParams.get('year');

  if (!groupsStr || !yearStr) {
    return new Response('Brakujące parametry: groups, year', { status: 400 });
  }

  const targetGroups = groupsStr.split(',');
  const yearNumber = parseInt(yearStr, 10);

  try {
    // 1. Fetch semesters for the given year
    const { data: semesters, error: semError } = await supabase
      .from('semesters')
      .select('id, label')
      .eq('year_number', yearNumber);

    if (semError || !semesters) throw semError || new Error('Nie znaleziono semestrów');

    const semesterIds = semesters.map(s => s.id);

    // 2. Fetch events matching the groups and those semesters
    let query = supabase
      .from('events')
      .select(`
        *,
        subject:subjects(*)
      `)
      .in('semester_id', semesterIds)
      .overlaps('target_groups', targetGroups);

    const { data: eventsData, error: evError } = await query;
    if (evError) throw evError;

    const events = eventsData as ScheduleEvent[];

    // 3. Generate ICS
    const cal = ical({
      name: `WNMZ Zabrze - Rok ${yearNumber} - Grupa ${targetGroups[targetGroups.length - 1]}`,
      timezone: 'Europe/Warsaw'
    });

    for (const ev of events) {
      const subject = ev.subject as unknown as Subject;
      const location = ev.override_location || subject?.location || 'Brak sali';
      const professor = ''; // TODO: Resolve professors from target_groups in ICS
      const notes = ev.notes ? `\n📝 Uwagi: ${ev.notes}` : '';
      const department = ev.department || subject?.department ? `\n🏢 Zakład/Katedra: ${ev.department || subject?.department}` : '';

      // Pass dayjs objects directly to ical-generator so it preserves the timezone
      // instead of converting to native Date (which loses timezone and uses server UTC)
      const start = dayjs.tz(`${ev.date}T${ev.time_start}`, 'Europe/Warsaw');
      const end = dayjs.tz(`${ev.date}T${ev.time_end}`, 'Europe/Warsaw');

      cal.createEvent({
        start: start,
        end: end,
        timezone: 'Europe/Warsaw',
        summary: `[${ev.type}] ${subject?.label || 'Zajęcia'}`,
        description: `Zajęcia: ${subject?.label || 'Brak danych'}${department}${professor}${notes}`,
        location: location,
        url: 'https://class-schedule-wine.vercel.app'
      });
    }

    // 4. Return as standard ICS file
    return new Response(cal.toString(), {
      headers: {
        'Content-Type': 'text/calendar; charset=utf-8',
        'Content-Disposition': `attachment; filename="plan_${targetGroups[targetGroups.length - 1].toLowerCase()}_rok${yearNumber}.ics"`,
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    });

  } catch (error: any) {
    console.error('Błąd generowania ICS:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}
