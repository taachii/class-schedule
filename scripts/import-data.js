/**
 * import-data.js
 *
 * Migruje dane z _migration/data.js do Supabase.
 * Uruchom: node scripts/import-data.js
 *
 * Wymaga zmiennych środowiskowych:
 *   SUPABASE_URL  - Project URL
 *   SUPABASE_SERVICE_KEY - Secret Key (service_role)
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { createContext, runInContext } from 'vm';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

// ── Config ────────────────────────────────────────────────────
const SUPABASE_URL = process.env.SUPABASE_URL ?? 'https://hysexmvdnycjnvlrmcbt.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY ?? '';
const SEMESTER_ID = 1; // Semestr Zimowy 2026/2027

if (!SUPABASE_SERVICE_KEY) {
  console.error('❌  Podaj SUPABASE_SERVICE_KEY jako zmienną środowiskową.');
  console.error('    Przykład: $env:SUPABASE_SERVICE_KEY="twoj_klucz"; node scripts/import-data.js');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// ── 1. Wczytaj i uruchom data.js w sandboxowanym kontekście ──
console.log('📖  Wczytuję _migration/data.js...');

const dataJsPath = join(__dirname, '..', '_migration', 'data.js');
const dataJsCode = readFileSync(dataJsPath, 'utf-8');

// Symulujemy "window" — data.js zapisuje dane do window.SCHEDULE_DATA
const sandbox = { window: {}, console };
createContext(sandbox);
runInContext(dataJsCode, sandbox);

const { SCHEDULE_DATA, SUBJECTS } = sandbox.window;

if (!SCHEDULE_DATA || !SUBJECTS) {
  console.error('❌  Nie znaleziono SCHEDULE_DATA lub SUBJECTS w data.js.');
  process.exit(1);
}

console.log(`✅  Wczytano ${Object.keys(SCHEDULE_DATA).length} grup.`);

// ── 2. Parsowanie grupy → { seminarGroups, exerciseGroups } ──

/**
 * Parsuje pole "group" ze starego formatu na dwie tablice.
 *
 * Przykłady:
 *   'GW'           → { seminarGroups: ['GW'],             exerciseGroups: [] }
 *   'GS 1 + GS 2'  → { seminarGroups: ['GS1', 'GS2'],    exerciseGroups: [] }
 *   'GĆ 1-4'       → { seminarGroups: [],                 exerciseGroups: ['GC1','GC2','GC3','GC4'] }
 *   'GĆ 1,2'       → { seminarGroups: [],                 exerciseGroups: ['GC1','GC2'] }
 */
function parseGroup(groupStr) {
  if (!groupStr) return { seminarGroups: [], exerciseGroups: [] };

  const str = groupStr.trim();

  // GW — wykłady dla wszystkich
  if (str === 'GW') return { seminarGroups: ['GW'], exerciseGroups: [] };

  // GĆ (exercise groups) — obsługuje zakresy i listy
  if (str.startsWith('GĆ') || str.startsWith('GC')) {
    const nums = str.replace(/GĆ|GC/g, '').trim();
    const exerciseGroups = expandNums(nums).map(n => `GC${n}`);
    return { seminarGroups: [], exerciseGroups };
  }

  // GS (seminar groups) — obsługuje "GS 1 + GS 2" i "GS 1"
  if (str.startsWith('GS')) {
    const parts = str.split('+').map(p => {
      const match = p.match(/\d+/);
      return match ? `GS${match[0]}` : null;
    }).filter(Boolean);
    return { seminarGroups: parts, exerciseGroups: [] };
  }

  console.warn(`⚠️   Nieznany format grupy: "${str}" — pomijam`);
  return { seminarGroups: [], exerciseGroups: [] };
}

/**
 * Rozszerza ciąg numerów na tablicę.
 *   '1-4'  → [1, 2, 3, 4]
 *   '1,2'  → [1, 2]
 *   '13,14' → [13, 14]
 *   '17-20' → [17, 18, 19, 20]
 */
function expandNums(str) {
  const result = [];
  const parts = str.split(',').map(s => s.trim());
  for (const part of parts) {
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

// ── 3. Deduplikacja eventów po id ────────────────────────────
console.log('🔄  Deduplicuję eventy...');

const uniqueEvents = new Map();

for (const [groupKey, events] of Object.entries(SCHEDULE_DATA)) {
  if (!events) continue;
  for (const ev of events) {
    if (!uniqueEvents.has(ev.id)) {
      uniqueEvents.set(ev.id, ev);
    }
  }
}

console.log(`✅  Unikalnych eventów: ${uniqueEvents.size}`);

// ── 4. Mapowanie na nowy schemat DB ──────────────────────────
function mapEvent(ev) {
  const { seminarGroups, exerciseGroups } = parseGroup(ev.group);

  return {
    subject_key:     ev.subject,
    semester_id:     SEMESTER_ID,
    type:            ev.type,
    seminar_groups:  seminarGroups,
    exercise_groups: exerciseGroups,
    date:            ev.date,
    time_start:      ev.timeStart + ':00',  // 'HH:MM' → 'HH:MM:00'
    time_end:        ev.timeEnd + ':00',
    location:        ev.location || null,
    notes:           ev.notes || null,
  };
}

const rows = Array.from(uniqueEvents.values()).map(mapEvent);

// Walidacja — odfiltruj eventy bez grupy
const validRows = rows.filter(r =>
  r.seminar_groups.length > 0 || r.exercise_groups.length > 0
);
const skipped = rows.length - validRows.length;
if (skipped > 0) {
  console.warn(`⚠️   Pominięto ${skipped} eventów z nieznanym formatem grupy.`);
}

console.log(`📦  Przygotowano ${validRows.length} rekordów do wgrania.`);

// ── 5. Insert do Supabase w batchach ────────────────────────
const BATCH_SIZE = 100;

async function insertBatches(data) {
  let inserted = 0;
  for (let i = 0; i < data.length; i += BATCH_SIZE) {
    const batch = data.slice(i, i + BATCH_SIZE);
    const { error } = await supabase.from('events').insert(batch);
    if (error) {
      console.error(`❌  Błąd przy wgrywaniu batcha ${i}–${i + batch.length}:`, error.message);
      console.error('    Pierwszy rekord batcha:', JSON.stringify(batch[0], null, 2));
      throw error;
    }
    inserted += batch.length;
    console.log(`   ↳ Wgrano ${inserted}/${data.length}...`);
  }
}

// ── 6. Uruchom import ────────────────────────────────────────
console.log('\n🚀  Startuję import do Supabase...\n');

try {
  await insertBatches(validRows);
  console.log('\n✅  Import zakończony sukcesem!');
  console.log(`    Wgrano ${validRows.length} zajęć do tabeli "events".`);
} catch (err) {
  console.error('\n❌  Import nieudany:', err.message);
  process.exit(1);
}
