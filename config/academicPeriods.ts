export type PeriodType = 'teaching' | 'holiday' | 'exam' | 'makeup_exam' | 'break' | 'summer_holidays';

export interface AcademicPeriod {
  type: PeriodType;
  startDate: string; // YYYY-MM-DD
  endDate: string;   // YYYY-MM-DD
  label: string;
  semester: 1 | 2 | 'both';
}

// Zmiany roczne w organizacji roku akademickiego.
export const ACADEMIC_PERIODS: Record<string, AcademicPeriod[]> = {
  '2026/2027': [
    // Semestr zimowy
    { type: 'teaching', startDate: '2026-10-01', endDate: '2027-01-31', label: 'Zajęcia dydaktyczne', semester: 1 },
    { type: 'exam', startDate: '2027-02-01', endDate: '2027-02-14', label: 'Sesja zimowa', semester: 1 },
    { type: 'break', startDate: '2027-02-15', endDate: '2027-02-21', label: 'Przerwa międzysemestralna', semester: 1 },
    { type: 'makeup_exam', startDate: '2027-02-22', endDate: '2027-03-07', label: 'Sesja poprawkowa (zimowa)', semester: 1 },
    { type: 'holiday', startDate: '2026-12-23', endDate: '2027-01-06', label: 'Przerwa świąteczna', semester: 1 },
    
    // Semestr letni
    { type: 'teaching', startDate: '2027-02-22', endDate: '2027-06-16', label: 'Zajęcia dydaktyczne', semester: 2 },
    { type: 'exam', startDate: '2027-06-17', endDate: '2027-06-30', label: 'Sesja letnia', semester: 2 },
    { type: 'summer_holidays', startDate: '2027-07-01', endDate: '2027-09-30', label: 'Wakacje', semester: 2 },
    { type: 'makeup_exam', startDate: '2027-09-01', endDate: '2027-09-14', label: 'Sesja poprawkowa (letnia)', semester: 2 },
    { type: 'holiday', startDate: '2027-03-26', endDate: '2027-03-29', label: 'Przerwa świąteczna (Wielkanoc)', semester: 2 },
  ]
};
