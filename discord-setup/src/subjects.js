import { createClient } from '@supabase/supabase-js';

export const MAX_TAGS = 20;
export const MAX_TAG_LEN = 20;

/**
 * Pobiera przedmioty danego roku wraz z numerami semestrów (1 = zimowy, 2 = letni).
 * @returns {Promise<Array<{key:string,label:string,short_label:string|null,semesters:number[]}>>}
 */
export async function fetchSubjects({ url, anonKey, year }) {
  if (!url || !anonKey) {
    throw new Error('Brak NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY (sprawdź ../.env.local).');
  }
  const supabase = createClient(url, anonKey, { auth: { persistSession: false } });
  const { data, error } = await supabase
    .from('subjects')
    .select('key, label, short_label, year_number, subject_semesters(semesters(year_number, semester_no))')
    .eq('year_number', year)
    .order('label');
  if (error) throw error;

  return (data ?? []).map((s) => ({
    key: s.key,
    label: s.label,
    short_label: s.short_label ?? null,
    semesters: [
      ...new Set(
        (s.subject_semesters ?? [])
          .map((ss) => ss.semesters)
          .filter((sem) => sem && sem.year_number === year)
          .map((sem) => sem.semester_no),
      ),
    ].sort(),
  }));
}

const globToRegex = (glob) =>
  new RegExp('^' + glob.split('*').map((p) => p.replace(/[.+?^${}()|[\]\\]/g, '\\$&')).join('.*') + '$');

/** Nazwa tagu dla przedmiotu wg reguł: mergeTags → tagOverrides → label → short_label → przycięcie. */
export function tagNameFor(subject, { tagOverrides = {}, mergeTags = {} } = {}) {
  for (const [glob, name] of Object.entries(mergeTags)) {
    if (globToRegex(glob).test(subject.key)) return { name, merged: true };
  }
  if (tagOverrides[subject.key]) return { name: tagOverrides[subject.key] };
  if (subject.label.length <= MAX_TAG_LEN) return { name: subject.label };
  if (subject.short_label && subject.short_label.length <= MAX_TAG_LEN) return { name: subject.short_label };
  return { name: subject.label.slice(0, MAX_TAG_LEN - 1).trimEnd() + '…', truncated: true };
}

/**
 * Buduje listę tagów forum dla roku.
 * @param subjects   wynik fetchSubjects
 * @param config     { tagOverrides, mergeTags }
 * @param extraTags  dodatkowe tagi (np. GK5, GK6)
 */
export function buildTags(subjects, config = {}, extraTags = []) {
  const subjectTag = {};
  const tags = [];
  const warnings = [];
  const errors = [];

  for (const s of subjects) {
    const { name, truncated } = tagNameFor(s, config);
    if (name.length > MAX_TAG_LEN) {
      errors.push(`Tag "${name}" (${s.key}) ma ${name.length} znaków (max ${MAX_TAG_LEN}). Popraw tagOverrides.`);
    }
    if (truncated) {
      warnings.push(`Przycięto "${s.label}" → "${name}". Dodaj "${s.key}" do tagOverrides, żeby nadać ładną nazwę.`);
    }
    subjectTag[s.key] = name;
    if (!tags.includes(name)) tags.push(name);
  }
  for (const t of extraTags) if (!tags.includes(t)) tags.push(t);

  if (tags.length > MAX_TAGS) {
    errors.push(
      `Za dużo tagów: ${tags.length} (max ${MAX_TAGS}). Połącz część przedmiotów przez mergeTags w config/server.json.\n  ` +
        tags.join(', '),
    );
  }
  return { tags, subjectTag, warnings, errors };
}
