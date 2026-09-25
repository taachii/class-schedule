'use client';

import { useState } from 'react';
import { useScheduleStore } from '@/store/scheduleStore';
import InfoModal from '../InfoModal/InfoModal';
import styles from './Header.module.css';

export default function Header() {
  const { semesters, activeSemesterId, activeGroup, setActiveGroup, activeYearNumber, setActiveYearNumber, isAdmin } =
    useScheduleStore();
  const [isInfoOpen, setIsInfoOpen] = useState(false);

  const activeSemester = semesters.find(s => s.id === activeSemesterId);

  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <div className={styles.left}>
          <button
            className={styles.backBtn}
            onClick={() => setActiveYearNumber(null)}
            aria-label="Wróć"
            title="Wróć do wyboru planu"
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
              <span className={styles.titleGradient}>Plan Zajęć</span>
              {isAdmin && <span className={styles.titleAdmin}> - Tryb Edycji</span>}
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
          <button
            className={styles.backBtn}
            onClick={() => setIsInfoOpen(true)}
            aria-label="Informacje o roku akademickim"
            title="Organizacja roku akademickiego"
            style={{ marginLeft: '12px' }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="url(#infoGrad)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <defs>
                <linearGradient id="infoGrad" x1="0" y1="0" x2="24" y2="24" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#ef4444" />
                  <stop offset="1" stopColor="#f59e0b" />
                </linearGradient>
              </defs>
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="16" x2="12" y2="12"></line>
              <line x1="12" y1="8" x2="12.01" y2="8"></line>
            </svg>
          </button>
        </div>
      </div>
      {isInfoOpen && <InfoModal onClose={() => setIsInfoOpen(false)} />}
    </header>
  );
}
