'use client';

import { useScheduleStore } from '@/store/scheduleStore';
import styles from './Header.module.css';

export default function Header() {
  const { activeView, setActiveView, semesters, activeSemesterId, setActiveSemester } =
    useScheduleStore();

  const activeSemester = semesters.find(s => s.id === activeSemesterId);

  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <div className={styles.brand}>
          <div className={styles.logoIcon}>
            <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
              <rect width="36" height="36" rx="10" fill="url(#logoGrad)" />
              <path d="M18 8v20M8 18h20" stroke="white" strokeWidth="3" strokeLinecap="round" />
              <defs>
                <linearGradient id="logoGrad" x1="0" y1="0" x2="36" y2="36" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#4f8ef7" />
                  <stop offset="1" stopColor="#7c3aed" />
                </linearGradient>
              </defs>
            </svg>
          </div>
          <div className={styles.brandText}>
            <h1 className={styles.title}>Plan Zajęć</h1>
            <p className={styles.subtitle}>
              I Rok Lekarski · SUM Zabrze
              {activeSemester ? ` · ${activeSemester.label}` : ''}
            </p>
          </div>
        </div>

        <div className={styles.controls}>
          {/* Semester selector (shown when multiple semesters available) */}
          {semesters.length > 1 && (
            <select
              className={styles.semesterSelect}
              value={activeSemesterId ?? ''}
              onChange={e => setActiveSemester(Number(e.target.value))}
              aria-label="Wybór semestru"
            >
              {semesters.map(s => (
                <option key={s.id} value={s.id}>{s.label}</option>
              ))}
            </select>
          )}

          {/* View toggle */}
          <div className={styles.viewToggle} role="group" aria-label="Wybór widoku">
            <button
              className={`${styles.viewBtn} ${activeView === 'calendar' ? styles.active : ''}`}
              onClick={() => setActiveView('calendar')}
              aria-pressed={activeView === 'calendar'}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="4" width="18" height="18" rx="2" />
                <path d="M16 2v4M8 2v4M3 10h18" />
              </svg>
              Kalendarz
            </button>
            <button
              className={`${styles.viewBtn} ${activeView === 'list' ? styles.active : ''}`}
              onClick={() => setActiveView('list')}
              aria-pressed={activeView === 'list'}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" />
              </svg>
              Lista
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
