import { useScheduleStore } from '@/store/scheduleStore';
import { ACADEMIC_PERIODS } from '@/config/academicPeriods';
import styles from './InfoModal.module.css';

interface InfoModalProps {
  onClose: () => void;
}

export default function InfoModal({ onClose }: InfoModalProps) {
  const { semesters, activeSemesterId } = useScheduleStore();
  const activeSemester = semesters.find(s => s.id === activeSemesterId);
  const academicYearLabel = activeSemester?.academic_year_label || '';
  const periods = ACADEMIC_PERIODS[academicYearLabel] || [];

  const semesterPeriods = periods
    .filter(p => p.semester === activeSemester?.semester_no || p.semester === 'both')
    .sort((a, b) => a.startDate.localeCompare(b.startDate));

  const getPeriodColor = (type: string) => {
    switch (type) {
      case 'holiday':
      case 'break':
      case 'summer_holidays':
        return '#22c55e'; // Green
      case 'exam':
        return '#ef4444'; // Red
      case 'makeup_exam':
        return '#f59e0b'; // Amber/Yellow
      default:
        return 'transparent';
    }
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('pl-PL', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.card} onClick={e => e.stopPropagation()}>
        <button className={styles.closeBtn} onClick={onClose}>✕</button>
        <div className={styles.header}>
          <h2>Organizacja Roku</h2>
          <p className={styles.subtitle}>{activeSemester?.label}</p>
        </div>
        
        <div className={styles.body}>
          <div className={styles.legendSection}>
            <h3>Legenda kolorów</h3>
            <ul className={styles.legendList}>
              <li>
                <span className={styles.colorDot} style={{ borderColor: 'var(--border)' }}></span>
                <span>Zajęcia dydaktyczne</span>
              </li>
              <li>
                <span className={styles.colorDot} style={{ background: '#22c55e' }}></span>
                <span>Dni wolne / Przerwy</span>
              </li>
              <li>
                <span className={styles.colorDot} style={{ background: '#ef4444' }}></span>
                <span>Sesja egzaminacyjna</span>
              </li>
              <li>
                <span className={styles.colorDot} style={{ background: '#f59e0b' }}></span>
                <span>Sesja poprawkowa</span>
              </li>
            </ul>
          </div>

          <div className={styles.periodsSection}>
            <h3>Harmonogram</h3>
            {semesterPeriods.length > 0 ? (
              <ul className={styles.periodsList}>
                {semesterPeriods.map((p, idx) => (
                  <li key={idx}>
                    <span className={styles.periodColor} style={{ background: getPeriodColor(p.type) }}></span>
                    <div className={styles.periodInfo}>
                      <span className={styles.periodLabel}>{p.label}</span>
                      <span className={styles.periodDates}>{formatDate(p.startDate)} – {formatDate(p.endDate)}</span>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className={styles.empty}>Brak zdefiniowanych okresów dla tego semestru.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
