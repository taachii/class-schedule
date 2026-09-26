import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Subject, ScheduleEvent, Semester, EventType, GroupKey, EnrichedEvent, AdminRole } from '@/types/schedule';
import { fetchEventsForGroup, fetchSubjects, fetchSemesters, fetchEventTypes, fetchGroupUpdate } from '@/lib/supabase/queries';

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
  lastUpdated: string | null;
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
  adminRole: AdminRole | null;
  adminPassword: string | null;
  setAdminAuth: (role: AdminRole, password: string) => void;
  logoutAdmin: () => void;

  // ── Debug ────────────────────────────────────────────────────
  debugTime: Date | null;
  setDebugTime: (d: Date | null) => void;
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
      const [semesters, eventTypes] = await Promise.all([
        fetchSemesters(activeYearNumber),
        fetchEventTypes(),
      ]);

      const now = new Date();
      const currentSemester = semesters.find(s => {
        const isWinter = s.semester_no === 1;
        if (isWinter) return now.getMonth() >= 9 || now.getMonth() <= 1;
        return now.getMonth() >= 1 && now.getMonth() <= 8;
      }) ?? semesters[0];

      const semesterId = forcedSemesterId ?? currentSemester?.id ?? semesters[0]?.id;
      const activeSemester = semesters.find(s => s.id === semesterId);
      const subjects = semesterId ? await fetchSubjects(semesterId) : [];
      
      const { activeGroup } = get();
      const events = semesterId ? await fetchEventsForGroup(semesterId, activeGroup) : [];
      const lastUpdated = semesterId ? await fetchGroupUpdate(semesterId, activeGroup) : null;
      const enrichedEvents = enrichEvents(events, subjects);

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
        subjects,
        activeSemesterId: semesterId ?? null,
        events,
        lastUpdated,
        enrichedEvents,
        activeSubjectKeys: new Set(subjects.map(s => s.key)),
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

  // ── setActiveGroup ───────────────────────────────────────────
  setActiveGroup: async (group: GroupKey) => {
    const { activeSemesterId, subjects } = get();
    if (!activeSemesterId) return;
    set({ activeGroup: group, isLoading: true, error: null });
    try {
      const [events, lastUpdated] = await Promise.all([
        fetchEventsForGroup(activeSemesterId, group),
        fetchGroupUpdate(activeSemesterId, group)
      ]);
      const enrichedEvents = enrichEvents(events, subjects);
      set({ events, enrichedEvents, lastUpdated, isLoading: false });
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
    }
  },

  // ── setActiveSemester ────────────────────────────────────────
  setActiveSemester: async (semesterId: number) => {
    const { activeGroup, semesters } = get();
    set({ activeSemesterId: semesterId, isLoading: true, error: null });
    try {
      const [subjects, events, lastUpdated] = await Promise.all([
        fetchSubjects(semesterId),
        fetchEventsForGroup(semesterId, activeGroup),
        fetchGroupUpdate(semesterId, activeGroup)
      ]);
      const enrichedEvents = enrichEvents(events, subjects);
      
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
        events,
        lastUpdated,
        enrichedEvents,
        activeSubjectKeys: new Set(subjects.map(s => s.key)),
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
    activeGroup: state.activeGroup,
  }),
}));
