export type PeriodType = 'teaching' | 'holiday' | 'exam' | 'makeup_exam' | 'break' | 'summer_holidays';

export interface AcademicPeriod {
  type: PeriodType;
  startDate: string; // YYYY-MM-DD
  endDate: string;   // YYYY-MM-DD
  label: string;
}

// Zmiany roczne w organizacji roku akademickiego.
// Okresy nakładające się (np. przerwa świąteczna w trakcie zajęć dydaktycznych) 
// są rozwiązywane poprzez priorytety w komponencie (te wymienione niżej mają wyższy priorytet).
export const ACADEMIC_PERIODS: Record<string, AcademicPeriod[]> = {
  '2026/2027': [
    // Semestr zimowy
    { type: 'teaching', startDate: '2026-10-01', endDate: '2027-01-31', label: 'Zajęcia dydaktyczne' },
    { type: 'exam', startDate: '2027-02-01', endDate: '2027-02-14', label: 'Sesja zimowa' },
    { type: 'break', startDate: '2027-02-15', endDate: '2027-02-21', label: 'Przerwa międzysemestralna' },
    { type: 'makeup_exam', startDate: '2027-02-22', endDate: '2027-03-07', label: 'Sesja poprawkowa (zimowa)' },
    { type: 'holiday', startDate: '2026-12-23', endDate: '2027-01-06', label: 'Przerwa świąteczna' },
    
    // Semestr letni
    { type: 'teaching', startDate: '2027-02-22', endDate: '2027-06-16', label: 'Zajęcia dydaktyczne' },
    { type: 'exam', startDate: '2027-06-17', endDate: '2027-06-30', label: 'Sesja letnia' },
    { type: 'summer_holidays', startDate: '2027-07-01', endDate: '2027-09-30', label: 'Wakacje' },
    { type: 'makeup_exam', startDate: '2027-09-01', endDate: '2027-09-14', label: 'Sesja poprawkowa (letnia)' },
    { type: 'holiday', startDate: '2027-03-26', endDate: '2027-03-29', label: 'Przerwa świąteczna (Wielkanoc)' },
  ]
};
