'use client';

import { useState, useEffect } from 'react';
import { useScheduleStore } from '@/store/scheduleStore';
import InfoModal from '../InfoModal/InfoModal';
import ExportModal from '../ExportModal/ExportModal';
import ModeratorsModal from '../ModeratorsModal/ModeratorsModal';
import { useRouter } from 'next/navigation';
import styles from './Header.module.css';

export default function Header() {
  const router = useRouter();
  const { semesters, activeSemesterId, activeGroup, setActiveGroup, activeYearNumber, setActiveYearNumber, adminRole, logoutAdmin } =
    useScheduleStore();
  const [isInfoOpen, setIsInfoOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isModsOpen, setIsModsOpen] = useState(false);

  const activeSemester = semesters.find(s => s.id === activeSemesterId);

  useEffect(() => {
    let newTitle = "Plan Zajęć";
    if (activeYearNumber) {
      newTitle += " | Kierunek lekarski";
      if (activeSemester) {
        const yearRoman = ['I', 'II', 'III', 'IV', 'V', 'VI'][activeYearNumber - 1] || activeYearNumber;
        newTitle += ` | ${yearRoman} Rok - ${activeSemester.label}`;
      }
    }
    document.title = newTitle;
  }, [activeYearNumber, activeSemester]);

  return (
    <>
      <header className={styles.header}>
        <div className={styles.inner}>
          <svg style={{ width: 0, height: 0, position: 'absolute' }} aria-hidden="true">
            <defs>
              <linearGradient id="backGrad" x1="0" y1="0" x2="24" y2="24" gradientUnits="userSpaceOnUse">
                <stop stopColor="#4f8ef7" />
                <stop offset="1" stopColor="#7c3aed" />
              </linearGradient>
            </defs>
          </svg>
          <div className={styles.left}>
            {activeYearNumber && (
              <button
                className={styles.backBtn}
                onClick={() => {
                  setActiveYearNumber(null);
                  if (adminRole && adminRole.type !== 'master') {
                    logoutAdmin();
                    router.push('/');
                  }
                }}
                aria-label="Wróć"
                title="Wróć do wyboru planu"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="url(#backGrad)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 12H5M12 19l-7-7 7-7" />
                </svg>
              </button>
            )}
            
            {!adminRole && (
              <button
                className={styles.backBtn}
                style={{ marginLeft: activeYearNumber ? '12px' : '0' }}
                onClick={() => router.push('/admin')}
                aria-label="Panel Administratora"
                title="Logowanie do Panelu Administratora"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="url(#backGrad)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                </svg>
              </button>
            )}
          </div>

          <div className={styles.center}>
            <div className={styles.brandText}>
              <h1 className={styles.title}>
                <span className={styles.titleGradient}>Plan Zajęć</span>
                {adminRole && <span className={styles.titleAdmin}> - Tryb Edycji</span>}
              </h1>
              {activeYearNumber && (
                <p className={styles.majorTitle}>Kierunek lekarski</p>
              )}
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
                {[...Array(activeSemester?.gs_count ?? 12)].map((_, i) => {
                  const prefix = activeSemester?.gs_prefix ?? 'GS';
                  const val = `${prefix}${i + 1}`;
                  const isDisabled = adminRole?.type === 'moderator' && adminRole.group !== val;
                  return <option key={val} value={val} disabled={isDisabled}>{prefix} {i + 1}</option>;
                })}
                <option value="GW" disabled={adminRole?.type === 'moderator'}>GW</option>
              </select>
            </div>
          </div>

          <div className={styles.right}>
            {(adminRole?.type === 'master' || adminRole?.type === 'admin') && (
              <button
                className={styles.backBtn}
                onClick={() => setIsModsOpen(true)}
                aria-label="Zarządzaj moderatorami"
                title="Zarządzaj moderatorami"
                style={{ marginRight: '12px' }}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="url(#backGrad)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                  <circle cx="9" cy="7" r="4"></circle>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                </svg>
              </button>
            )}
            {!adminRole && (
              <button
                className={styles.backBtn}
                onClick={() => setIsExportOpen(true)}
                aria-label="Subskrybuj kalendarz"
                title="Subskrybuj kalendarz"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="url(#backGrad)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                  <line x1="16" y1="2" x2="16" y2="6"></line>
                  <line x1="8" y1="2" x2="8" y2="6"></line>
                  <line x1="3" y1="10" x2="21" y2="10"></line>
                </svg>
              </button>
            )}
            
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
      </header>
      {isInfoOpen && <InfoModal onClose={() => setIsInfoOpen(false)} />}
      {isExportOpen && <ExportModal onClose={() => setIsExportOpen(false)} />}
      {isModsOpen && <ModeratorsModal onClose={() => setIsModsOpen(false)} />}
    </>
  );
}
