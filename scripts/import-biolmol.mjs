/**
 * import-biolmol.mjs
 *
 * Bezpieczny import zajęć z Biologii Molekularnej.
 * TYLKO dodaje nowe rekordy - NIE czyści istniejących danych!
 *
 * Jak czytać plan:
 *   Godziny (lewa kolumna) x Dzień tygodnia (PN/WT/ŚR/CZ/PT) = Grupa dla tych zajęć
 *   Kolumna UWAGI po prawej podaje konkretne daty np. "PN: 05.10, 19.10..."
 *   czyli we wszystkie te poniedziałki grupy z kolumny PN mają zajęcia o tej godzinie.
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://hysexmvdnycjnvlrmcbt.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY ?? '';
const SEMESTER_ID = 1;
const SUBJECT_KEY = 'biol'; // klucz w bazie

if (!SUPABASE_SERVICE_KEY) {
  console.error('❌  Brak SUPABASE_SERVICE_KEY');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// Pomocnicze: parsuj datę "DD.MM.YYYY" → "YYYY-MM-DD"
function parseDate(s) {
  const m = s.trim().match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})$/);
  if (!m) { console.warn('⚠️  Nie rozpoznano daty:', s); return null; }
  return `${m[3]}-${m[2].padStart(2,'0')}-${m[1].padStart(2,'0')}`;
}

function parseDateList(str) {
  return str.split(',').map(s => parseDate(s.trim())).filter(Boolean);
}

// Buduj rekord eventu
function ev(date, tStart, tEnd, type, seminarGroups, exerciseGroups = []) {
  return {
    subject_key:     SUBJECT_KEY,
    semester_id:     SEMESTER_ID,
    type,
    seminar_groups:  seminarGroups,
    exercise_groups: exerciseGroups,
    date,
    time_start:      tStart + ':00',
    time_end:        tEnd + ':00',
    location:        null,
    notes:           null,
  };
}

const events = [];

// ═══════════════════════════════════════════════════════════════════════════
// WYKŁADY  (Wyk. 19:00-21:15, GW, tylko piątki)
// UWAGI: PT: 20.11, 27.11, 04.12, 11.12, 18.12.2026
// ═══════════════════════════════════════════════════════════════════════════
const wykladDates = parseDateList('20.11.2026, 27.11.2026, 04.12.2026, 11.12.2026, 18.12.2026');
for (const d of wykladDates) {
  events.push(ev(d, '19:00', '21:15', 'W', ['GW']));
}

// ═══════════════════════════════════════════════════════════════════════════
// BLOKI SEMINARYJNO-ĆWICZENIOWE
//
// Strukturę czytam z tabeli:
//   Wiersz GODZINY  | PN     | WT      | ŚR | CZ     | PT
//   Sem. 8:00-9:30  | GS 5   | GS 7   |  - | GS 6   | GS 8
//   Ćw. 9:30-11:00  | GC9,10 | GC13,14|  - | GC11,12| GC15,16
//   Sem. 11:05-12:35| GS 1   | GS 9   |  - | GS 2   | GS 10
//   Ćw. 12:35-14:05 | GC1,2  | GC17,18|  - | GC3,4  | GC19,20
//   Sem. 14:10-15:40| GS 3   | GS 11  |  - | GS 4   | GS 12
//   Ćw. 15:40-17:10 | GC5,6  | GC21,22|  - | GC7,8  | GC23,24
//
// Drugi zestaw (krótsze seminaria, dłuższe ćwiczenia):
//   Sem. 8:00-8:45  | GS 5   | GS 7   |  - | GS 6   | GS 8
//   Ćw. 8:45-11:00  | GC9,10 | GC13,14|  - | GC11,12| GC15,16
//   Sem. 11:05-11:50| GS 1   | GS 9   |  - | GS 2   | GS 10
//   Ćw. 11:50-14:05 | GC1,2  | GC17,18|  - | GC3,4  | GC19,20
//   Sem. 14:10-14:55| GS 3   | GS 11  |  - | GS 4   | GS 12
//   Ćw. 14:55-17:10 | GC5,6  | GC21,22|  - | GC7,8  | GC23,24
//
// Daty z uwag (kolumna UWAGI po prawej):
//   Blok 1 (krótki): PN:05.10,19.10,26.10,02.11,09.11,16.11,23.11,30.11,07.12,14.12.2026
//                    WT:06.10,20.10,27.10,03.11,10.11,17.11,24.11,01.12,08.12,15.12.2026
//                    CZ:08.10,22.10,29.10,05.11,19.11,26.11,03.12,10.12,17.12.2026
//                    PT:09.10,23.10.2026
//   Blok 2 (długi):  PN:12.10,26.10,02.11,16.11,23.11,07.12.2026
//                    WT:13.10,27.10,03.11,17.11,24.11,08.12.2026
//                    CZ:15.10,29.10,05.11,19.11,26.11,10.12.2026
//                    PT:16.10,30.10,06.11,20.11,27.11,11.12.2026
//   Blok 3 (krótki): PN:11.01.2027 WT:12.01.2027 CZ:14.01.2027 PT:15.01.2027
//   Blok 4 (długi):  PN:18.01.2027 WT:19.01.2027 PT:22.01.2027
//
// ═══════════════════════════════════════════════════════════════════════════

// Mapa: dzień tygodnia → { gs_group_slot1, gc_slot1, gs_slot2, gc_slot2, gs_slot3, gc_slot3 }
const dayMap = {
  PN:  { s1:'GS5',  c1:['GC9','GC10'],  s2:'GS1', c2:['GC1','GC2'],   s3:'GS3',  c3:['GC5','GC6']   },
  WT:  { s1:'GS7',  c1:['GC13','GC14'], s2:'GS9', c2:['GC17','GC18'], s3:'GS11', c3:['GC21','GC22'] },
  CZ:  { s1:'GS6',  c1:['GC11','GC12'], s2:'GS2', c2:['GC3','GC4'],   s3:'GS4',  c3:['GC7','GC8']   },
  PT:  { s1:'GS8',  c1:['GC15','GC16'], s2:'GS10',c2:['GC19','GC20'], s3:'GS12', c3:['GC23','GC24'] },
};

// BLOK 1 i 3 (krótki): Sem 8:00-9:30, Ćw 9:30-11:00, Sem 11:05-12:35, itd.
function addBlokKrotki(dates, day) {
  const { s1, c1, s2, c2, s3, c3 } = dayMap[day];
  for (const d of dates) {
    events.push(ev(d, '08:00', '09:30', 'S', [s1]));
    events.push(ev(d, '09:30', '11:00', 'C', [s1], c1));
    events.push(ev(d, '11:05', '12:35', 'S', [s2]));
    events.push(ev(d, '12:35', '14:05', 'C', [s2], c2));
    events.push(ev(d, '14:10', '15:40', 'S', [s3]));
    events.push(ev(d, '15:40', '17:10', 'C', [s3], c3));
  }
}

// BLOK 2 i 4 (długi): Sem 8:00-8:45, Ćw 8:45-11:00, Sem 11:05-11:50, itd.
function addBlokDlugi(dates, day) {
  const { s1, c1, s2, c2, s3, c3 } = dayMap[day];
  for (const d of dates) {
    events.push(ev(d, '08:00', '08:45', 'S', [s1]));
    events.push(ev(d, '08:45', '11:00', 'C', [s1], c1));
    events.push(ev(d, '11:05', '11:50', 'S', [s2]));
    events.push(ev(d, '11:50', '14:05', 'C', [s2], c2));
    events.push(ev(d, '14:10', '14:55', 'S', [s3]));
    events.push(ev(d, '14:55', '17:10', 'C', [s3], c3));
  }
}

// ── BLOK 1 (krótki) ────────────────────────────────────────────────────────
addBlokKrotki(parseDateList('05.10.2026,19.10.2026,26.10.2026,02.11.2026,09.11.2026,16.11.2026,23.11.2026,30.11.2026,07.12.2026,14.12.2026'), 'PN');
addBlokKrotki(parseDateList('06.10.2026,20.10.2026,27.10.2026,03.11.2026,10.11.2026,17.11.2026,24.11.2026,01.12.2026,08.12.2026,15.12.2026'), 'WT');
addBlokKrotki(parseDateList('08.10.2026,22.10.2026,29.10.2026,05.11.2026,19.11.2026,26.11.2026,03.12.2026,10.12.2026,17.12.2026'),           'CZ');
addBlokKrotki(parseDateList('09.10.2026,23.10.2026'),                                                                                         'PT');

// ── BLOK 2 (długi) ─────────────────────────────────────────────────────────
addBlokDlugi(parseDateList('12.10.2026,26.10.2026,02.11.2026,16.11.2026,23.11.2026,07.12.2026'), 'PN');
addBlokDlugi(parseDateList('13.10.2026,27.10.2026,03.11.2026,17.11.2026,24.11.2026,08.12.2026'), 'WT');
addBlokDlugi(parseDateList('15.10.2026,29.10.2026,05.11.2026,19.11.2026,26.11.2026,10.12.2026'), 'CZ');
addBlokDlugi(parseDateList('16.10.2026,30.10.2026,06.11.2026,20.11.2026,27.11.2026,11.12.2026'), 'PT');

// ── BLOK 3 (krótki, styczeń 2027) ──────────────────────────────────────────
addBlokKrotki(['2027-01-11'], 'PN');
addBlokKrotki(['2027-01-12'], 'WT');
addBlokKrotki(['2027-01-14'], 'CZ');
addBlokKrotki(['2027-01-15'], 'PT');

// ── BLOK 4 (długi, styczeń 2027) ───────────────────────────────────────────
addBlokDlugi(['2027-01-18'], 'PN');
addBlokDlugi(['2027-01-19'], 'WT');
addBlokDlugi(['2027-01-22'], 'PT');

// ═══════════════════════════════════════════════════════════════════════════
console.log(`📋  Przygotowano ${events.length} rekordów (wykłady + seminaria + ćwiczenia).`);

// ── INSERT (bez czyszczenia!) ────────────────────────────────────────────────
const BATCH = 100;
async function insertAll(data) {
  let done = 0;
  for (let i = 0; i < data.length; i += BATCH) {
    const batch = data.slice(i, i + BATCH);
    const { error } = await supabase.from('events').insert(batch);
    if (error) {
      console.error(`\n❌  Błąd batcha ${i}:`, error.message);
      console.error('    Rekord:', JSON.stringify(batch[0], null, 2));
      throw error;
    }
    done += batch.length;
    process.stdout.write(`\r   ↳ Wgrano ${done}/${data.length}...`);
  }
  console.log('');
}

console.log('🚀  Importuję (bez czyszczenia istniejących danych)...\n');
try {
  await insertAll(events);
  console.log(`\n✅  Gotowe! Wgrano ${events.length} zajęć z Biologii Molekularnej.`);
} catch {
  process.exit(1);
}
