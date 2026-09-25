// TypeScript types for the class schedule application

export interface AcademicYear {
  year_number: number; // 1-6
  label: string;       // 'I Rok', 'II Rok'...
}

export interface Semester {
  id: number;
  year_number: number;
  semester_no: 1 | 2;
  label: string;              // 'Semestr Zimowy 2026/2027'
  academic_year_label: string; // '2026/2027'
}

export interface Subject {
  key: string;        // 'anat', 'hist'...
  year_number: number;
  label: string;      // 'Anatomia'
  short_label: string; // 'Anat.'
  color: string;      // '#3b82f6'
  contact: string | null;
  location: string | null;
  department: string | null;
}

export interface EventType {
  code: string; // 'W', 'S', 'C', 'CSM', 'F'
  label: string; // 'Wykład', 'Seminarium'...
}

export interface ScheduleEvent {
  id: string;
  subject_key: string;
  semester_id: number;
  type: string;
  seminar_groups: string[];   // ['GS1', 'GS2'] or ['GW']
  exercise_groups: string[];  // ['GC1', 'GC2'] or []
  date: string;               // 'YYYY-MM-DD'
  time_start: string;         // 'HH:MM:SS'
  time_end: string;           // 'HH:MM:SS'
  location: string | null;
  professor: string | null;
  notes: string | null;
  // Joined fields
  subject?: Subject;
}

// Enriched event with resolved subject data (used in UI)
export interface EnrichedEvent extends ScheduleEvent {
  subject: Subject;
  resolvedLocation: string;
  timeStartShort: string; // 'HH:MM'
  timeEndShort: string;   // 'HH:MM'
}

// Group identifier used in tabs
export type GroupKey = string; // 'GS1'...'GS12' | 'GW'

export interface GroupTab {
  key: GroupKey;
  label: string;
  type: 'seminar' | 'lecture';
}
