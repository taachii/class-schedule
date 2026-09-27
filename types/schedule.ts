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
  gs_count: number;
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

export interface Professor {
  id: string;
  academic_title: string | null;
  first_name: string;
  last_name: string;
  email: string | null;
}

export interface SubjectGroupDefault {
  id: string;
  subject_key: string;
  semester_id: number;
  group_key: string;
  professor_id: string | null;
}

export interface ScheduleEvent {
  id: string;
  subject_key: string;
  semester_id: number;
  type: string;
  target_groups: string[];    // Zamiast seminar_groups / exercise_groups
  date: string;               // 'YYYY-MM-DD'
  time_start: string;         // 'HH:MM:SS'
  time_end: string;           // 'HH:MM:SS'
  override_location: string | null;
  override_professor_id: string | null;
  department: string | null;
  notes: string | null;
  exam_term?: string | null;
  assessment_type?: string | null;
  // Joined fields
  subject?: Subject;
}

// Enriched event with resolved subject data (used in UI)
export interface EnrichedEvent extends ScheduleEvent {
  subject: Subject;
  resolvedLocation: string;
  timeStartShort: string; // 'HH:MM'
  timeEndShort: string;   // 'HH:MM'
  resolvedProfessors?: { group: string; professor: string; email?: string }[]; // Lista prowadzących dla grup
}

// Group identifier used in tabs
export type GroupKey = string; // 'GS1'...'GS12' | 'GW'

export interface GroupTab {
  key: GroupKey;
  label: string;
  type: 'seminar' | 'lecture';
}

export type AdminRoleType = 'master' | 'admin' | 'moderator';

export interface AdminRole {
  type: AdminRoleType;
  group?: string | null;
  year?: number | null;
  name?: string | null;
  email?: string | null;
}
