import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Subject, ScheduleEvent, Semester, EventType, EnrichedEvent, AdminRole, Professor, SubjectGroupDefault } from '@/types/schedule';
import { fetchEventsForGroup, fetchSubjects, fetchSemesters, fetchEventTypes, fetchGroupUpdate, fetchProfessors, fetchSubjectGroupDefaults } from '@/lib/supabase/queries';

interface ScheduleStore {
  // ── Reference data ──────────────────────────────────────────
  semesters: Semester[];
  subjects: Subject[];
  eventTypes: EventType[];
  professors: Professor[];
  subjectDefaults: SubjectGroupDefault[];

  // ── Active filters / navigation ──────────────────────────────
  activeYearNumber: number | null;
  activeSemesterId: number | null;
  activeGroups: string[]; // e.g. ['GW', 'GS1', 'GC1']
  currentYear: number;
  currentMonth: number; // 0-indexed (0 = January)
  activeSubjectKeys: Set<string>;
  activeEventTypes: Set<string>;

  // ── Event data ───────────────────────────────────────────────
  events: ScheduleEvent[];
  lastUpdated: string | null;
  isLoading: boolean;
  error: string | null;

  // ── Derived / computed ───────────────────────────────────────
  enrichedEvents: EnrichedEvent[];

  // ── Actions ──────────────────────────────────────────────────
  initialize: (forcedSemesterId?: number) => Promise<void>;
  setActiveYearNumber: (year: number | null, semesterId?: number) => void;
  setActiveGroups: (groups: string[]) => void;
  setMonth: (year: number, month: number) => void;
  toggleSubject: (key: string) => void;
  resetSubjectFilters: () => void;
  clearSubjectFilters: () => void;
  toggleEventType: (typeCode: string) => void;
  resetEventTypeFilters: () => void;
  clearEventTypeFilters: () => void;
  setActiveSemester: (semesterId: number) => void;

  // ── Admin ────────────────────────────────────────────────────
  adminRole: AdminRole | null;
  adminPassword: string | null;
  setAdminAuth: (role: AdminRole, password: string) => void;
  logoutAdmin: () => void;

  // ── Debug ────────────────────────────────────────────────────
  debugTime: Date | null;
  setDebugTime: (d: Date | null) => void;
}

function enrichEvents(
  events: ScheduleEvent[], 
  subjects: Subject[],
  professors: Professor[],
  defaults: SubjectGroupDefault[],
  activeGroups: string[]
): EnrichedEvent[] {
  const subjectMap = new Map(subjects.map(s => [s.key, s]));
  const profMap = new Map(professors.map(p => [p.id, p]));

  return events.map(ev => {
    const subject = subjectMap.get(ev.subject_key) ?? (ev.subject as Subject);
    
    let resolvedLocation = ev.override_location ?? subject?.location ?? '';
    const resolvedProfessors: { group: string; professor: string; email?: string }[] = [];

    // Find which of our active groups are targeted by this event
    const intersectingGroups = ev.target_groups.filter(g => activeGroups.includes(g));

    if (ev.override_professor_id) {
      const p = profMap.get(ev.override_professor_id);
      if (p) {
        resolvedProfessors.push({ group: 'Wszystkie', professor: `${p.academic_title || ''} ${p.first_name} ${p.last_name}`.trim(), email: p.email || undefined });
      }
    } else {
      // Loop over the specific active groups that intersect with the event
      for (const group of intersectingGroups) {
        const def = defaults.find(d => d.subject_key === ev.subject_key && d.semester_id === ev.semester_id && d.group_key === group);
        if (def && def.professor_id) {
          const p = profMap.get(def.professor_id);
          if (p) {
            resolvedProfessors.push({ group, professor: `${p.academic_title || ''} ${p.first_name} ${p.last_name}`.trim(), email: p.email || undefined });
          }
        }

      }
    }

    return {
      ...ev,
      subject,
      resolvedLocation,
      resolvedProfessors,
      timeStartShort: ev.time_start.slice(0, 5),
      timeEndShort: ev.time_end.slice(0, 5),
    };
  });
}

export const useScheduleStore = create<ScheduleStore>()(
  persist(
    (set, get) => ({
  // ── Initial state ────────────────────────────────────────────
  semesters: [],
  subjects: [],
  eventTypes: [],
  professors: [],
  subjectDefaults: [],
  activeYearNumber: null,
  activeSemesterId: null,
  activeGroups: ['GW', 'GS1', 'GC1'], // Default fallback
  currentYear: new Date().getFullYear(),
  currentMonth: new Date().getMonth(),
  activeSubjectKeys: new Set(),
  activeEventTypes: new Set(),
  events: [],
  lastUpdated: null,
  isLoading: false,
  error: null,
  enrichedEvents: [],

  // ── initialize ───────────────────────────────────────────────
  initialize: async (forcedSemesterId?: number) => {
    const { activeYearNumber } = get();
    if (activeYearNumber === null) return;
    
    set({ isLoading: true, error: null });
    try {
      const [semesters, eventTypes, professors] = await Promise.all([
        fetchSemesters(activeYearNumber),
        fetchEventTypes(),
        fetchProfessors(),
      ]);

      const now = new Date();
      const currentSemester = semesters.find(s => {
        const isWinter = s.semester_no === 1;
        if (isWinter) return now.getMonth() >= 9 || now.getMonth() <= 1;
        return now.getMonth() >= 1 && now.getMonth() <= 8;
      }) ?? semesters[0];

      const semesterId = forcedSemesterId ?? currentSemester?.id ?? semesters[0]?.id;
      const activeSemester = semesters.find(s => s.id === semesterId);
      
      const [subjects, subjectDefaults] = await Promise.all([
        semesterId ? fetchSubjects(semesterId) : Promise.resolve([]),
        semesterId ? fetchSubjectGroupDefaults(semesterId) : Promise.resolve([])
      ]);
      
      const { activeGroups } = get();
      const events = semesterId ? await fetchEventsForGroup(semesterId, activeGroups) : [];
      const lastUpdated = semesterId ? await fetchGroupUpdate(semesterId, activeGroups) : null;
      const enrichedEvents = enrichEvents(events, subjects, professors, subjectDefaults, activeGroups);

      // Snap month
      let snapYear = get().currentYear;
      let snapMonth = get().currentMonth;
      if (activeSemester) {
        const baseYear = parseInt(activeSemester.academic_year_label.split('/')[0]);
        if (activeSemester.semester_no === 1) { // Winter (Oct-Mar)
          if (snapYear < baseYear || (snapYear === baseYear && snapMonth < 9)) { snapYear = baseYear; snapMonth = 9; }
          if (snapYear > baseYear + 1 || (snapYear === baseYear + 1 && snapMonth > 2)) { snapYear = baseYear; snapMonth = 9; }
        } else { // Summer (Feb-Sep)
          if (snapYear < baseYear + 1 || (snapYear === baseYear + 1 && snapMonth < 1)) { snapYear = baseYear + 1; snapMonth = 1; }
          if (snapYear > baseYear + 1 || (snapYear === baseYear + 1 && snapMonth > 8)) { snapYear = baseYear + 1; snapMonth = 1; }
        }
      }

      set({
        semesters,
        eventTypes,
        professors,
        subjectDefaults,
        subjects,
        activeSemesterId: semesterId ?? null,
        events,
        lastUpdated,
        enrichedEvents,
        activeSubjectKeys: new Set(subjects.map(s => s.key)),
        activeEventTypes: new Set(eventTypes.map(t => t.code)),
        currentYear: snapYear,
        currentMonth: snapMonth,
        isLoading: false,
      });
    } catch (err: any) {
      set({ error: err.message ?? 'Błąd pobierania danych', isLoading: false });
    }
  },

  // ── setActiveYearNumber ────────────────────────────────────────
  setActiveYearNumber: (year: number | null, semesterId?: number) => {
    set({ activeYearNumber: year });
    if (year !== null) {
      get().initialize(semesterId);
    }
  },

  // ── setActiveGroups ───────────────────────────────────────────
  setActiveGroups: async (groups: string[]) => {
    const { activeSemesterId, subjects, professors, subjectDefaults } = get();
    if (!activeSemesterId) {
      set({ activeGroups: groups });
      return;
    }
    
    set({ activeGroups: groups, isLoading: true, error: null });
    try {
      const [events, lastUpdated] = await Promise.all([
        fetchEventsForGroup(activeSemesterId, groups),
        fetchGroupUpdate(activeSemesterId, groups)
      ]);
      const enrichedEvents = enrichEvents(events, subjects, professors, subjectDefaults, groups);
      set({ events, enrichedEvents, lastUpdated, isLoading: false });
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
    }
  },

  // ── setActiveSemester ────────────────────────────────────────
  setActiveSemester: async (semesterId: number) => {
    const { activeGroups, semesters, professors } = get();
    set({ activeSemesterId: semesterId, isLoading: true, error: null });
    try {
      const [subjects, subjectDefaults, events, lastUpdated] = await Promise.all([
        fetchSubjects(semesterId),
        fetchSubjectGroupDefaults(semesterId),
        fetchEventsForGroup(semesterId, activeGroups),
        fetchGroupUpdate(semesterId, activeGroups)
      ]);
      const enrichedEvents = enrichEvents(events, subjects, professors, subjectDefaults, activeGroups);
      
      const activeSemester = semesters.find(s => s.id === semesterId);
      let snapYear = get().currentYear;
      let snapMonth = get().currentMonth;
      if (activeSemester) {
        const baseYear = parseInt(activeSemester.academic_year_label.split('/')[0]);
        if (activeSemester.semester_no === 1) { // Winter (Oct-Mar)
          if (snapYear < baseYear || (snapYear === baseYear && snapMonth < 9)) { snapYear = baseYear; snapMonth = 9; }
          if (snapYear > baseYear + 1 || (snapYear === baseYear + 1 && snapMonth > 2)) { snapYear = baseYear; snapMonth = 9; }
        } else { // Summer (Feb-Sep)
          if (snapYear < baseYear + 1 || (snapYear === baseYear + 1 && snapMonth < 1)) { snapYear = baseYear + 1; snapMonth = 1; }
          if (snapYear > baseYear + 1 || (snapYear === baseYear + 1 && snapMonth > 8)) { snapYear = baseYear + 1; snapMonth = 1; }
        }
      }

      set({
        subjects,
        subjectDefaults,
        events,
        lastUpdated,
        enrichedEvents,
        activeSubjectKeys: new Set(subjects.map(s => s.key)),
        activeEventTypes: new Set(get().eventTypes.map(t => t.code)),
        currentYear: snapYear,
        currentMonth: snapMonth,
        isLoading: false,
      });
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
    }
  },

  setMonth: (year, month) => set({ currentYear: year, currentMonth: month }),

  toggleSubject: (key) => set(state => {
    const next = new Set(state.activeSubjectKeys);
    if (next.has(key)) next.delete(key);
    else next.add(key);
    return { activeSubjectKeys: next };
  }),

  resetSubjectFilters: () => set(state => ({
    activeSubjectKeys: new Set(state.subjects.map(s => s.key)),
  })),

  clearSubjectFilters: () => set({
    activeSubjectKeys: new Set(),
  }),

  toggleEventType: (typeCode) => set(state => {
    const next = new Set(state.activeEventTypes);
    if (next.has(typeCode)) next.delete(typeCode);
    else next.add(typeCode);
    return { activeEventTypes: next };
  }),

  resetEventTypeFilters: () => set(state => ({
    activeEventTypes: new Set(state.eventTypes.map(t => t.code)),
  })),

  clearEventTypeFilters: () => set({
    activeEventTypes: new Set(),
  }),

  // ── Admin ────────────────────────────────────────────────────
  adminRole: null,
  adminPassword: null,
  setAdminAuth: (role, password) => set({ adminRole: role, adminPassword: password }),
  logoutAdmin: () => set({ adminRole: null, adminPassword: null }),

  debugTime: null,
  setDebugTime: (debugTime) => set({ debugTime }),
}), {
  name: 'class-schedule-storage',
  partialize: (state) => ({
    activeYearNumber: state.activeYearNumber,
    activeSemesterId: state.activeSemesterId,
    activeGroups: state.activeGroups,
  }),
}));
