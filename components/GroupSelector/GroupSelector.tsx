import { useScheduleStore } from '@/store/scheduleStore';
import styles from './GroupSelector.module.css';
import { useEffect, useRef, useState, useCallback } from 'react';

export default function GroupSelector() {
  const { activeGroups, setActiveGroups, semesters, activeSemesterId } = useScheduleStore();
  const [isOpen, setIsOpen] = useState(false);
  
  const activeSemester = semesters.find(s => s.id === activeSemesterId);
  const isClinical = activeSemester && activeSemester.year_number >= 3;
  const gsCount = activeSemester?.gs_count ?? 12;

  // Global selections
  const globalGs = parseInt(activeGroups.find(g => g.startsWith('GS'))?.replace('GS', '') || '1');
  const globalGc = parseInt(activeGroups.find(g => g.startsWith('GC'))?.replace('GC', '') || '1');
  const globalGk = isClinical ? parseInt(activeGroups.find(g => g.startsWith('GK'))?.replace('GK', '') || '1') : null;

  // Local state for the modal
  const [localGs, setLocalGs] = useState<number | null>(globalGs);
  const [localGc, setLocalGc] = useState<number | null>(globalGc);
  const [localGk, setLocalGk] = useState<number | null>(globalGk);

  // Refs for auto-scrolling
  const gsRef = useRef<HTMLDivElement>(null);
  const gcRef = useRef<HTMLDivElement>(null);
  const gkRef = useRef<HTMLDivElement>(null);

  const handleClose = useCallback(() => {
    setIsOpen(false);
    if (window.history.state?.isModal === 'group-selector') {
      window.history.back();
    }
  }, []);

  const openModal = () => {
    setLocalGs(globalGs);
    setLocalGc(globalGc);
    setLocalGk(globalGk);
    setIsOpen(true);
    window.history.pushState({ isModal: 'group-selector' }, '');
  };

  useEffect(() => {
    const handlePopState = () => {
      setIsOpen(false);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Auto-scroll to selected items when modal opens
  useEffect(() => {
    if (!isOpen) return;
    const timeout = setTimeout(() => {
      const scrollCenter = (container: HTMLElement | null) => {
        if (!container) return;
        const activeEl = container.querySelector(`.${styles.active}`) as HTMLElement;
        if (activeEl) {
          container.scrollTo({
            left: activeEl.offsetLeft - container.offsetWidth / 2 + activeEl.offsetWidth / 2,
            behavior: 'smooth'
          });
        }
      };
      scrollCenter(gsRef.current);
      scrollCenter(gcRef.current);
      if (isClinical) scrollCenter(gkRef.current);
    }, 50);
    return () => clearTimeout(timeout);
  }, [isOpen, isClinical]);

  const save = (gs: number, gc: number, gk: number | null) => {
    const tree = ['GW', `GS${gs}`, `GC${gc}`];
    if (gk !== null) tree.push(`GK${gk}`);
    setActiveGroups(tree);
  };

  const handleGsChange = (val: number) => {
    setLocalGs(val);
    setLocalGc(null);
    setLocalGk(null);
  };

  const handleGcChange = (val: number) => {
    const newGs = Math.ceil(val / 2);
    setLocalGs(newGs);
    setLocalGc(val);
    
    if (isClinical) {
      setLocalGk(null);
    } else {
      save(newGs, val, null);
    }
  };

  const handleGkChange = (val: number) => {
    const newGc = Math.ceil(val / 2);
    const newGs = Math.ceil(newGc / 2);
    setLocalGs(newGs);
    setLocalGc(newGc);
    setLocalGk(val);
    save(newGs, newGc, val);
  };

  const gsOptions = Array.from({ length: gsCount }, (_, i) => i + 1);
  const gcOptions = localGs ? [localGs * 2 - 1, localGs * 2] : [];
  const gkOptions = localGc ? [localGc * 2 - 1, localGc * 2] : [];

  return (
    <>
      <div className={styles.triggerContainer}>
        <button className={styles.triggerBtn} onClick={openModal}>
          <div className={styles.triggerIconWrapper}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
              <circle cx="9" cy="7" r="4"></circle>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
            </svg>
          </div>
          <div className={styles.triggerText}>
            <span className={styles.triggerLabel}>Wybierz grupę</span>
            <span className={styles.triggerValue}>
              GS {globalGs} • GC {globalGc}
              {isClinical && ` • GK ${globalGk}`}
            </span>
          </div>
          <div className={styles.chevron}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
          </div>
        </button>
      </div>

      {isOpen && (
        <div className={styles.modalOverlay} onClick={handleClose}>
          <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3>Ustawienia grupy</h3>
              <button className={styles.closeBtn} onClick={handleClose}>✕</button>
            </div>
            
            <div className={styles.modalBody}>
              <div className={styles.tier}>
                <span className={styles.tierLabel}>Grupa Seminaryjna (GS)</span>
                <div className={styles.pillsScroll} ref={gsRef}>
                  {gsOptions.map(num => (
                    <button
                      key={`gs-${num}`}
                      className={`${styles.pill} ${num === localGs ? styles.active : ''}`}
                      onClick={() => handleGsChange(num)}
                    >
                      GS {num}
                    </button>
                  ))}
                </div>
              </div>

              {localGs && (
                <div className={styles.tier}>
                  <span className={styles.tierLabel}>Grupa Ćwiczeniowa (GC)</span>
                  <div className={styles.pillsScrollCentered}>
                    {gcOptions.map(num => (
                      <button
                        key={`gc-${num}`}
                        className={`${styles.pill} ${num === localGc ? styles.active : ''}`}
                        onClick={() => handleGcChange(num)}
                      >
                        GC {num}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {isClinical && localGc && (
                <div className={styles.tier}>
                  <span className={styles.tierLabel}>Grupa Kliniczna (GK)</span>
                  <div className={styles.pillsScrollCentered}>
                    {gkOptions.map(num => (
                      <button
                        key={`gk-${num}`}
                        className={`${styles.pill} ${num === localGk ? styles.active : ''}`}
                        onClick={() => handleGkChange(num)}
                      >
                        GK {num}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
