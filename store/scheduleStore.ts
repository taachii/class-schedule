import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Subject, ScheduleEvent, Semester, EventType, GroupKey, EnrichedEvent } from '@/types/schedule';
import { fetchEventsForGroup, fetchSubjects, fetchSemesters, fetchEventTypes } from '@/lib/supabase/queries';

// Replaced by dynamic year selection

interface ScheduleStore {
  // ── Reference data ──────────────────────────────────────────
  semesters: Semester[];
  subjects: Subject[];
  eventTypes: EventType[];

  // ── Active filters / navigation ──────────────────────────────
  activeYearNumber: number | null;
  activeSemesterId: number | null;
  activeGroup: GroupKey;
  currentYear: number;
  currentMonth: number; // 0-indexed (0 = January)
  activeSubjectKeys: Set<string>;

  // ── Event data ───────────────────────────────────────────────
  events: ScheduleEvent[];
  isLoading: boolean;
  error: string | null;

  // ── Derived / computed ───────────────────────────────────────
  enrichedEvents: EnrichedEvent[];

  // ── Actions ──────────────────────────────────────────────────
  initialize: (forcedSemesterId?: number) => Promise<void>;
  setActiveYearNumber: (year: number | null, semesterId?: number) => void;
  setActiveGroup: (group: GroupKey) => void;
  setMonth: (year: number, month: number) => void;
  toggleSubject: (key: string) => void;
  resetSubjectFilters: () => void;
  clearSubjectFilters: () => void;
  setActiveSemester: (semesterId: number) => void;

  // ── Admin ────────────────────────────────────────────────────
  isAdmin: boolean;
  adminPassword: string | null;
  setAdminAuth: (password: string) => void;
  logoutAdmin: () => void;
}

function enrichEvents(events: ScheduleEvent[], subjects: Subject[]): EnrichedEvent[] {
  const subjectMap = new Map(subjects.map(s => [s.key, s]));
  return events.map(ev => {
    const subject = subjectMap.get(ev.subject_key) ?? (ev.subject as Subject);
    return {
      ...ev,
      subject,
      resolvedLocation: ev.location ?? subject?.location ?? '',
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
  activeYearNumber: null,
  activeSemesterId: null,
  activeGroup: 'GS1',
  currentYear: new Date().getFullYear(),
  currentMonth: new Date().getMonth(),
  activeSubjectKeys: new Set(),
  events: [],
  isLoading: false,
  error: null,
  enrichedEvents: [],

  // ── initialize ───────────────────────────────────────────────
  initialize: async (forcedSemesterId?: number) => {
    const { activeYearNumber } = get();
    if (activeYearNumber === null) return;
    
    set({ isLoading: true, error: null });
    try {
      const [semesters, eventTypes] = await Promise.all([
        fetchSemesters(activeYearNumber),
        fetchEventTypes(),
      ]);

      // Pick the current semester by date
      const now = new Date();
      const currentSemester = semesters.find(s => {
        const academicYear = parseInt(s.academic_year_label.split('/')[0]);
        const isWinter = s.semester_no === 1;
        // Winter: Oct–Jan, Summer: Feb–Jun (rough)
        if (isWinter) return now.getMonth() >= 9 || now.getMonth() <= 0;
        return now.getMonth() >= 1 && now.getMonth() <= 5;
      }) ?? semesters[0];

      const semesterId = forcedSemesterId ?? currentSemester?.id ?? semesters[0]?.id;
      const subjects = semesterId ? await fetchSubjects(semesterId) : [];
      const events = semesterId ? await fetchEventsForGroup(semesterId, 'GS1') : [];
      const enrichedEvents = enrichEvents(events, subjects);

      set({
        semesters,
        eventTypes,
        subjects,
        activeSemesterId: semesterId ?? null,
        events,
        enrichedEvents,
        activeSubjectKeys: new Set(subjects.map(s => s.key)),
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

  // ── setActiveGroup ───────────────────────────────────────────
  setActiveGroup: async (group: GroupKey) => {
    const { activeSemesterId, subjects } = get();
    if (!activeSemesterId) return;
    set({ activeGroup: group, isLoading: true, error: null });
    try {
      const events = await fetchEventsForGroup(activeSemesterId, group);
      const enrichedEvents = enrichEvents(events, subjects);
      set({ events, enrichedEvents, isLoading: false });
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
    }
  },

  // ── setActiveSemester ────────────────────────────────────────
  setActiveSemester: async (semesterId: number) => {
    const { activeGroup } = get();
    set({ activeSemesterId: semesterId, isLoading: true, error: null });
    try {
      const [subjects, events] = await Promise.all([
        fetchSubjects(semesterId),
        fetchEventsForGroup(semesterId, activeGroup),
      ]);
      const enrichedEvents = enrichEvents(events, subjects);
      set({
        subjects,
        events,
        enrichedEvents,
        activeSubjectKeys: new Set(subjects.map(s => s.key)),
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

  // ── Admin ────────────────────────────────────────────────────
  isAdmin: false,
  adminPassword: null,
  setAdminAuth: (password) => set({ isAdmin: true, adminPassword: password }),
  logoutAdmin: () => set({ isAdmin: false, adminPassword: null }),
}), {
  name: 'class-schedule-storage',
  partialize: (state) => ({
    activeYearNumber: state.activeYearNumber,
    activeSemesterId: state.activeSemesterId,
    activeGroup: state.activeGroup,
  }),
}));
