'use client';

import { useScheduleStore } from '@/store/scheduleStore';
import styles from './Header.module.css';

export default function Header() {
  const { semesters, activeSemesterId, activeGroup, setActiveGroup, activeYearNumber, setActiveYearNumber, isAdmin } =
    useScheduleStore();

  const activeSemester = semesters.find(s => s.id === activeSemesterId);

  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <div className={styles.left}>
          <button 
            className={styles.backBtn} 
            onClick={() => setActiveYearNumber(null)}
            aria-label="Wróć"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="url(#backGrad)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <defs>
                <linearGradient id="backGrad" x1="0" y1="0" x2="24" y2="24" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#4f8ef7" />
                  <stop offset="1" stopColor="#7c3aed" />
                </linearGradient>
              </defs>
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
          </button>
        </div>

        <div className={styles.center}>
          <div className={styles.brandText}>
            <h1 className={styles.title}>
              Plan Zajęć
              {isAdmin && <span style={{ color: '#ef4444' }}> - Tryb Edycji</span>}
            </h1>
            <p className={styles.subtitle}>
              {activeYearNumber ? `${['I', 'II', 'III', 'IV', 'V', 'VI'][activeYearNumber - 1]} Rok` : ''}
              {activeSemester ? `${activeYearNumber ? ' - ' : ''}${activeSemester.label}` : ''}
            </p>
          </div>
        </div>

        <div className={styles.right}>
          <select
            className={`${styles.semesterSelect} ${styles.groupSelectMobile}`}
            value={activeGroup ?? ''}
            onChange={e => setActiveGroup(e.target.value)}
            aria-label="Wybór grupy"
          >
            {[...Array(12)].map((_, i) => (
              <option key={`GS${i + 1}`} value={`GS${i + 1}`}>GS {i + 1}</option>
            ))}
            <option value="GW">GW</option>
          </select>
        </div>
      </div>
    </header>
  );
}
