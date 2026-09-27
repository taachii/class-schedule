'use client';

import { useScheduleStore } from '@/store/scheduleStore';
import { Eye, EyeOff } from 'lucide-react';
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

  const allSubjectsVisible = activeSubjectKeys.size === subjects.length;
  const noSubjectsVisible = activeSubjectKeys.size === 0;

  const allEventTypesVisible = activeEventTypes.size === eventTypes.length;
  const noEventTypesVisible = activeEventTypes.size === 0;

  return (
    <div className={styles.filterBar}>
      {/* Przedmioty */}
      <div className={styles.inner}>
        <button className={`${styles.iconBtn} ${noSubjectsVisible ? styles.activeIcon : ''}`} onClick={clearSubjectFilters} title="Ukryj przedmioty">
          <EyeOff size={18} />
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
        <button className={`${styles.iconBtn} ${allSubjectsVisible ? styles.activeIcon : ''}`} onClick={resetSubjectFilters} title="Pokaż przedmioty">
          <Eye size={18} />
        </button>
      </div>

      {/* Typy zajęć */}
      <div className={styles.inner} style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid var(--border-subtle)' }}>
        <button className={`${styles.iconBtn} ${noEventTypesVisible ? styles.activeIcon : ''}`} onClick={clearEventTypeFilters} title="Ukryj typy">
          <EyeOff size={18} />
        </button>
        <div className={styles.chips} role="group" aria-label="Filtry typów zajęć">
          {eventTypes.map(t => {
            const isActive = activeEventTypes.has(t.code);
            const color = '#64748b'; 
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
        <button className={`${styles.iconBtn} ${allEventTypesVisible ? styles.activeIcon : ''}`} onClick={resetEventTypeFilters} title="Pokaż typy">
          <Eye size={18} />
        </button>
      </div>
    </div>
  );
}
