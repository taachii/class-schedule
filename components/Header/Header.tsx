'use client';

import { useState } from 'react';
import { useScheduleStore } from '@/store/scheduleStore';
import InfoModal from '../InfoModal/InfoModal';
import ExportModal from '../ExportModal/ExportModal';
import styles from './Header.module.css';

export default function Header() {
  const { semesters, activeSemesterId, activeGroup, setActiveGroup, activeYearNumber, setActiveYearNumber, isAdmin } =
    useScheduleStore();
  const [isInfoOpen, setIsInfoOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);

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

        <div className={styles.right}>
          <button
            className={styles.backBtn}
            onClick={() => setIsExportOpen(true)}
            aria-label="Dodaj do kalendarza"
            title="Dodaj do kalendarza (WebCal / ICS)"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="url(#backGrad)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="16" y1="2" x2="16" y2="6"></line>
              <line x1="8" y1="2" x2="8" y2="6"></line>
              <line x1="3" y1="10" x2="21" y2="10"></line>
            </svg>
          </button>
          
          <button
            className={styles.backBtn}
            onClick={() => setIsInfoOpen(true)}
            aria-label="Informacje o roku akademickim"
            title="Organizacja roku akademickiego"
            style={{ marginLeft: '12px' }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="url(#backGrad)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="16" x2="12" y2="12"></line>
              <line x1="12" y1="8" x2="12.01" y2="8"></line>
            </svg>
          </button>
        </div>
      </div>
      {isInfoOpen && <InfoModal onClose={() => setIsInfoOpen(false)} />}
      {isExportOpen && <ExportModal onClose={() => setIsExportOpen(false)} />}
    </header>
  );
}
