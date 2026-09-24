'use client';

import { useScheduleStore } from '@/store/scheduleStore';
import styles from './SubjectFilters.module.css';

function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

export default function SubjectFilters() {
  const { subjects, activeSubjectKeys, toggleSubject, resetSubjectFilters, clearSubjectFilters } = useScheduleStore();

  if (!subjects.length) return null;

  return (
    <div className={styles.filterBar}>
      <div className={styles.inner}>
        <span className={styles.label}>Filtruj przedmioty:</span>
        <div className={styles.chips} role="group" aria-label="Filtry przedmiotów">
          {subjects.map(s => {
            const isActive = activeSubjectKeys.has(s.key);
            return (
              <button
                key={s.key}
                className={`${styles.chip} ${isActive ? styles.active : ''}`}
                onClick={() => toggleSubject(s.key)}
                style={{
                  '--chip-bg': hexToRgba(s.color, 0.2),
                  '--chip-color': s.color,
                  '--chip-border': hexToRgba(s.color, 0.5),
                } as React.CSSProperties}
              >
                {s.short_label}
              </button>
            );
          })}
        </div>
        <div className={styles.controls}>
          <button className={styles.reset} onClick={resetSubjectFilters}>
            Pokaż wszystko
          </button>
          <button className={styles.reset} onClick={clearSubjectFilters}>
            Ukryj wszystko
          </button>
        </div>
      </div>
    </div>
  );
}
