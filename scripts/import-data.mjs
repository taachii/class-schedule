/**
 * import-data.mjs — v3 (final)
 *
 * Podejście: "seminar_groups" = lista grup GS, dla których event jest widoczny.
 * Dotyczy WSZYSTKICH typów zajęć, w tym ćwiczeń.
 *
 * Dla ćwiczeń (GĆ):
 *   seminar_groups = zbiór GS-grup, w których tablicach ten event wystąpił
 *   exercise_groups = GĆ-grupy z pola "group" (informacja uzupełniająca)
 *
 * Dzięki temu zapytanie frontendowe jest zawsze proste:
 *   WHERE 'GW' = ANY(seminar_groups) OR 'GS1' = ANY(seminar_groups)
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { createContext, runInContext } from 'vm';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

const SUPABASE_URL = 'https://hysexmvdnycjnvlrmcbt.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY ?? '';
const SEMESTER_ID = 1;

if (!SUPABASE_SERVICE_KEY) { console.error('❌  Brak SUPABASE_SERVICE_KEY'); process.exit(1); }

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// ── 1. Wczytaj data.js ────────────────────────────────────────
console.log('📖  Wczytuję _migration/data.js...');
const code = readFileSync(join(__dirname, '..', '_migration', 'data.js'), 'utf-8');
const sandbox = { window: {}, console };
createContext(sandbox);
runInContext(code, sandbox);
const { SCHEDULE_DATA } = sandbox.window;
console.log(`✅  Wczytano ${Object.keys(SCHEDULE_DATA).length} grup.`);

// ── 2. Pomocnicze ─────────────────────────────────────────────
function expandNums(str) {
  const result = [];
  for (const part of str.split(',').map(s => s.trim())) {
    if (part.includes('-')) {
      const [from, to] = part.split('-').map(Number);
      for (let i = from; i <= to; i++) result.push(i);
    } else {
      const n = parseInt(part);
      if (!isNaN(n)) result.push(n);
    }
  }
  return result;
}

function parseExerciseGroups(groupStr) {
  const str = (groupStr ?? '').trim();
  if (str.startsWith('GĆ') || str.startsWith('GC')) {
    const nums = str.replace(/GĆ\s*|GC\s*/g, '').trim();
    return expandNums(nums).map(n => `GC${n}`);
  }
  return [];
}

// ── 3. Zbierz eventy + śledź w których GS-grupach wystąpiły ──
console.log('🔄  Zbieranie eventów...');

// contentKey → { event data, Set<gsGroupKey> }
const eventMap = new Map();

for (const [groupKey, events] of Object.entries(SCHEDULE_DATA)) {
  if (!Array.isArray(events)) continue;
  // Wyciągnij GS-klucz z nazwy tablicy (np. 'GS1', 'GW', null jeśli nie GS)
  const gsKey = /^GS\d+$/.test(groupKey) ? groupKey : (groupKey === 'GW' ? 'GW' : null);

  for (const ev of events) {
    if (!ev?.date) continue;
    const groupStr = (ev.group ?? '').trim();
    const exerciseGroups = parseExerciseGroups(groupStr);

    // Klucz treści — unikalny dla każdego fizycznego zajęcia
    const contentKey = [ev.subject, ev.type, ev.date, ev.timeStart, ev.timeEnd, groupStr].join('|');

    if (!eventMap.has(contentKey)) {
      eventMap.set(contentKey, {
        ev,
        gsKeys: new Set(),
        exerciseGroups,
        isLecture: groupStr === 'GW',
        seminarGroupsFromField: [], // GS-grupy z pola "group" (dla seminariów)
      });
    }

    const entry = eventMap.get(contentKey);

    // Jeśli to ćwiczenia (GĆ) — śledź, w której GS-tablicy wystąpiły
    if (exerciseGroups.length > 0 && gsKey && gsKey !== 'GW') {
      entry.gsKeys.add(gsKey);
    }

    // Jeśli to seminarium/wykład — parsuj GS-grupy z pola "group"
    if (exerciseGroups.length === 0 && !entry.isLecture) {
      const gsMatches = [...(groupStr.matchAll(/GS\s*(\d+)/g))].map(m => `GS${m[1]}`);
      gsMatches.forEach(g => entry.gsKeys.add(g));
    }
  }
}

// ── 4. Zbuduj rekordy do bazy ─────────────────────────────────
const rows = [];
let skipped = 0;

for (const { ev, gsKeys, exerciseGroups, isLecture } of eventMap.values()) {
  let seminarGroups;

  if (isLecture) {
    seminarGroups = ['GW'];
  } else if (exerciseGroups.length > 0) {
    // Ćwiczenia: seminarGroups = GS-grupy, w których tablicach event wystąpił
    seminarGroups = [...gsKeys].sort();
  } else {
    // Seminaria: seminarGroups z pola "group" (np. GS1+GS2)
    seminarGroups = [...gsKeys].sort();
  }

  if (seminarGroups.length === 0 && exerciseGroups.length === 0) {
    skipped++;
    continue;
  }

  rows.push({
    subject_key:     ev.subject,
    semester_id:     SEMESTER_ID,
    type:            ev.type,
    seminar_groups:  seminarGroups,
    exercise_groups: exerciseGroups,
    date:            ev.date,
    time_start:      ev.timeStart + ':00',
    time_end:        ev.timeEnd + ':00',
    location:        ev.location || null,
    notes:           ev.notes || null,
  });
}

console.log(`✅  Przygotowano ${rows.length} rekordów (pominięto ${skipped} bez grupy).`);

// ── 5. Insert ─────────────────────────────────────────────────
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

// ── 6. Wyczyść starą zawartość i wgraj nową ──────────────────
console.log('\n🗑️   Czyszczę tabelę events...');
const { error: delErr } = await supabase
  .from('events')
  .delete()
  .neq('id', '00000000-0000-0000-0000-000000000000');
if (delErr) { console.error('❌  Błąd czyszczenia:', delErr.message); process.exit(1); }

console.log('🚀  Importuję...\n');
try {
  await insertAll(rows);
  console.log(`\n✅  Gotowe! Wgrano ${rows.length} unikalnych zajęć.`);
} catch { process.exit(1); }
