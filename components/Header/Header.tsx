'use client';

import { useState, useEffect, useRef } from 'react';
import { useScheduleStore } from '@/store/scheduleStore';
import InfoModal from '../InfoModal/InfoModal';
import ExportModal from '../ExportModal/ExportModal';
import ModeratorsModal from '../ModeratorsModal/ModeratorsModal';
import ProfessorsModal from '../ProfessorsModal/ProfessorsModal';
import SubjectDefaultsModal from '../SubjectDefaultsModal/SubjectDefaultsModal';
import { useRouter } from 'next/navigation';
import styles from './Header.module.css';

export default function Header() {
  const router = useRouter();
  const { semesters, activeSemesterId, activeYearNumber, setActiveYearNumber, adminRole, logoutAdmin } =
    useScheduleStore();
  const [isInfoOpen, setIsInfoOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isModsOpen, setIsModsOpen] = useState(false);
  const [isProfessorsOpen, setIsProfessorsOpen] = useState(false);
  const [isSubjectsOpen, setIsSubjectsOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const openInfo = () => { setIsMenuOpen(false); setIsInfoOpen(true); };
  const openExport = () => { setIsMenuOpen(false); setIsExportOpen(true); };
  const openMods = () => { setIsMenuOpen(false); setIsModsOpen(true); };
  const openProfessors = () => { setIsMenuOpen(false); setIsProfessorsOpen(true); };
  const openSubjects = () => { setIsMenuOpen(false); setIsSubjectsOpen(true); };

  const activeSemester = semesters.find(s => s.id === activeSemesterId);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    }
    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuOpen]);



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
                className={`${styles.backBtn} ${styles.desktopOnlyPadlock}`}
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
              <h1 className="sr-only">Plan Zajęć – Kierunek Lekarski | Śląski Uniwersytet Medyczny w Zabrzu</h1>
              <div className={styles.title} aria-hidden="true">
                <span className={styles.titleGradient}>Plan Zajęć</span>
                {adminRole && <span style={{ color: '#ef4444' }}> Edycja</span>}
              </div>
              {activeYearNumber && (
                <p className={styles.majorTitle}>Kierunek lekarski</p>
              )}
              <p className={styles.subtitle}>
                {activeYearNumber ? `${['I', 'II', 'III', 'IV', 'V', 'VI'][activeYearNumber - 1]} Rok` : ''}
                {activeSemester ? `${activeYearNumber ? ' - ' : ''}${activeSemester.label}` : ''}
              </p>

            </div>
          </div>

          <div className={styles.right} ref={menuRef}>
            {/* Desktop Actions */}
            <div className={styles.desktopActions}>
              {adminRole && (
                <button
                  className={styles.backBtn}
                  onClick={() => setIsSubjectsOpen(true)}
                  aria-label="Przypisz prowadzących"
                  title="Przypisz prowadzących"
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="url(#backGrad)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                    <circle cx="9" cy="7" r="4"></circle>
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                    <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                  </svg>
                </button>
              )}
              {(adminRole?.type === 'master' || adminRole?.type === 'admin') && (
                  <button
                    className={styles.backBtn}
                    onClick={() => setIsProfessorsOpen(true)}
                    aria-label="Baza prowadzących"
                    title="Baza prowadzących"
                  >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="url(#backGrad)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <ellipse cx="12" cy="5" rx="9" ry="3"></ellipse>
                      <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"></path>
                      <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"></path>
                    </svg>
                  </button>
              )}
              {adminRole?.type === 'master' && (
                  <button
                    className={styles.backBtn}
                    onClick={() => setIsModsOpen(true)}
                    aria-label="Zarządzaj moderatorami"
                    title="Zarządzaj moderatorami"
                  >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="url(#backGrad)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                      <circle cx="12" cy="7" r="4"></circle>
                    </svg>
                  </button>
              )}
              {!adminRole && (
                <>
                  <button
                    className={styles.backBtn}
                    onClick={openExport}
                    aria-label="Eksportuj kalendarz"
                    title="Eksportuj kalendarz"
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
                    onClick={openInfo}
                    aria-label="Informacje o roku akademickim"
                    title="Organizacja roku akademickiego"
                  >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="url(#backGrad)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10"></circle>
                      <line x1="12" y1="16" x2="12" y2="12"></line>
                      <line x1="12" y1="8" x2="12.01" y2="8"></line>
                    </svg>
                  </button>
                </>
              )}
            </div>

            {/* Always visible mobile action for Non-Master Admin */}
            {adminRole && adminRole.type !== 'master' && (
              <button
                className={`${styles.backBtn} ${styles.mobileOnlyBtn}`}
                onClick={openSubjects}
                aria-label="Przypisz prowadzących"
                title="Przypisz prowadzących"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="url(#backGrad)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                  <circle cx="9" cy="7" r="4"></circle>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                </svg>
              </button>
            )}

            {/* Mobile Hamburger Button */}
            {(!adminRole || adminRole.type === 'master') && (
              <button 
                className={styles.hamburgerBtn}
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                aria-label="Otwórz menu"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="3" y1="12" x2="21" y2="12"></line>
                  <line x1="3" y1="6" x2="21" y2="6"></line>
                  <line x1="3" y1="18" x2="21" y2="18"></line>
                </svg>
              </button>
            )}

            {/* Mobile Dropdown Menu */}
            {isMenuOpen && (!adminRole || adminRole.type === 'master') && (
              <div className={styles.mobileMenu}>
                {adminRole && (
                  <button
                    className={styles.menuItem}
                    onClick={openSubjects}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="url(#backGrad)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                      <circle cx="9" cy="7" r="4"></circle>
                      <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                      <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                    </svg>
                    Przypisz prowadzących
                  </button>
                )}
                {(adminRole?.type === 'master' || adminRole?.type === 'admin') && (
                    <button
                      className={styles.menuItem}
                      onClick={openProfessors}
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="url(#backGrad)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <ellipse cx="12" cy="5" rx="9" ry="3"></ellipse>
                        <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"></path>
                        <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"></path>
                      </svg>
                      Baza prowadzących
                    </button>
                )}
                {adminRole?.type === 'master' && (
                    <button
                      className={styles.menuItem}
                      onClick={openMods}
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="url(#backGrad)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                        <circle cx="12" cy="7" r="4"></circle>
                      </svg>
                      Zarządzaj moderatorami
                    </button>
                )}
                {!adminRole && (
                  <>
                    <button
                      className={styles.menuItem}
                      onClick={() => { router.push('/admin'); setIsMenuOpen(false); }}
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="url(#backGrad)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                        <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                      </svg>
                      Panel Administratora
                    </button>
                    <button
                      className={styles.menuItem}
                      onClick={openExport}
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="url(#backGrad)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                        <line x1="16" y1="2" x2="16" y2="6"></line>
                        <line x1="8" y1="2" x2="8" y2="6"></line>
                        <line x1="3" y1="10" x2="21" y2="10"></line>
                      </svg>
                      Eksportuj kalendarz
                    </button>
                    <button
                      className={styles.menuItem}
                      onClick={openInfo}
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="url(#backGrad)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10"></circle>
                        <line x1="12" y1="16" x2="12" y2="12"></line>
                        <line x1="12" y1="8" x2="12.01" y2="8"></line>
                      </svg>
                      Organizacja roku
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </header>
      {isInfoOpen && <InfoModal onClose={() => setIsInfoOpen(false)} />}
      {isExportOpen && <ExportModal onClose={() => setIsExportOpen(false)} />}
      {isModsOpen && <ModeratorsModal onClose={() => setIsModsOpen(false)} />}
      {isProfessorsOpen && <ProfessorsModal onClose={() => setIsProfessorsOpen(false)} />}
      {isSubjectsOpen && <SubjectDefaultsModal onClose={() => setIsSubjectsOpen(false)} />}
    </>
  );
}
