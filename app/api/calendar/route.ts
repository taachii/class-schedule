import { NextResponse } from 'next/server';
import ical from 'ical-generator';
import { supabase } from '@/lib/supabase/client';
import type { ScheduleEvent, Subject } from '@/types/schedule';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const group = searchParams.get('group');
  const yearStr = searchParams.get('year');

  if (!group || !yearStr) {
    return new Response('Brakujące parametry: group, year', { status: 400 });
  }

  const yearNumber = parseInt(yearStr, 10);

  try {
    // 1. Fetch semesters for the given year
    const { data: semesters, error: semError } = await supabase
      .from('semesters')
      .select('id, label')
      .eq('year_number', yearNumber);

    if (semError || !semesters) throw semError || new Error('Nie znaleziono semestrów');

    const semesterIds = semesters.map(s => s.id);

    // 2. Fetch events matching the group and those semesters
    const isLectureGroup = group === 'GW';
    
    let query = supabase
      .from('events')
      .select(`
        *,
        subject:subjects(*)
      `)
      .in('semester_id', semesterIds);

    if (isLectureGroup) {
      query = query.contains('seminar_groups', ['GW']);
    } else {
      query = query.or(`seminar_groups.cs.{"GW"},seminar_groups.cs.{"${group}"}`);
    }

    const { data: eventsData, error: evError } = await query;
    if (evError) throw evError;

    const events = eventsData as ScheduleEvent[];

    // 3. Generate ICS
    const cal = ical({
      name: `WNMZ Zabrze - Rok ${yearNumber} - Grupa ${group}`,
      timezone: 'Europe/Warsaw'
    });

    for (const ev of events) {
      const subject = ev.subject as unknown as Subject;
      const location = ev.location || subject?.location || 'Brak sali';
      const professor = ev.professor ? `\n👨‍🏫 Prowadzący: ${ev.professor}` : '';
      const notes = ev.notes ? `\n📝 Uwagi: ${ev.notes}` : '';
      const department = ev.department || subject?.department ? `\n🏢 Zakład/Katedra: ${ev.department || subject?.department}` : '';

      // Create proper Date objects using date and time fields
      const startStr = `${ev.date}T${ev.time_start}`;
      const endStr = `${ev.date}T${ev.time_end}`;

      cal.createEvent({
        start: new Date(startStr),
        end: new Date(endStr),
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
        'Content-Disposition': `attachment; filename="plan_${group.toLowerCase()}_rok${yearNumber}.ics"`,
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    });

  } catch (error: any) {
    console.error('Błąd generowania ICS:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}
