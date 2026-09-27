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
  const { subjects, eventTypes, activeSubjectKeys, activeEventTypes, toggleSubject, resetSubjectFilters, clearSubjectFilters, toggleEventType, resetEventTypeFilters, clearEventTypeFilters } = useScheduleStore();

  if (!subjects.length) return null;

  return (
    <div className={styles.filterBar}>
      {/* Przedmioty */}
      <div className={styles.inner}>
        <button className={styles.reset} onClick={clearSubjectFilters}>
          Ukryj przedmioty
        </button>
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
        <button className={styles.reset} onClick={resetSubjectFilters}>
          Pokaż przedmioty
        </button>
      </div>

      {/* Typy zajęć */}
      <div className={styles.inner} style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid var(--border-subtle)' }}>
        <button className={styles.reset} onClick={clearEventTypeFilters}>
          Ukryj typy
        </button>
        <div className={styles.chips} role="group" aria-label="Filtry typów zajęć">
          {eventTypes.map(t => {
            const isActive = activeEventTypes.has(t.code);
            // Wyjątek: dla egzaminów chcemy mocno czerwony akcent, dla reszty uniwersalny (np. szary/niebieski)
            const color = t.code === 'E' ? '#dc2626' : '#64748b'; 
            return (
              <button
                key={t.code}
                className={`${styles.chip} ${isActive ? styles.active : ''}`}
                onClick={() => toggleEventType(t.code)}
                style={{
                  '--chip-bg': hexToRgba(color, 0.15),
                  '--chip-color': color,
                  '--chip-border': hexToRgba(color, 0.4),
                } as React.CSSProperties}
              >
                {t.label}
              </button>
            );
          })}
        </div>
        <button className={styles.reset} onClick={resetEventTypeFilters}>
          Pokaż typy
        </button>
      </div>
    </div>
  );
}
