import { useScheduleStore } from '@/store/scheduleStore';
import styles from './GroupSelector.module.css';
import { useEffect, useRef } from 'react';

export default function GroupSelector() {
  const { activeGroups, setActiveGroups, semesters, activeSemesterId } = useScheduleStore();
  
  const activeSemester = semesters.find(s => s.id === activeSemesterId);
  const isClinical = activeSemester && activeSemester.year_number >= 3;
  const gsCount = activeSemester?.gs_count ?? 12;

  // Extract current selections
  const currentGs = parseInt(activeGroups.find(g => g.startsWith('GS'))?.replace('GS', '') || '1');
  const currentGc = parseInt(activeGroups.find(g => g.startsWith('GC'))?.replace('GC', '') || '1');
  const currentGk = isClinical ? parseInt(activeGroups.find(g => g.startsWith('GK'))?.replace('GK', '') || '1') : null;

  // Refs for auto-scrolling
  const gsRef = useRef<HTMLDivElement>(null);
  const gcRef = useRef<HTMLDivElement>(null);
  const gkRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to selected items on mount
  useEffect(() => {
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
  }, [currentGs, currentGc, currentGk, isClinical]);

  const handleGsChange = (val: number) => {
    let newGc = currentGc;
    let newGk = currentGk;
    
    // Auto-select first GC in this GS if current GC doesn't belong to it
    if (newGc !== 2 * val - 1 && newGc !== 2 * val) {
      newGc = 2 * val - 1;
      if (isClinical) newGk = 2 * newGc - 1;
    }
    
    save(val, newGc, newGk);
  };

  const handleGcChange = (val: number) => {
    const newGs = Math.ceil(val / 2);
    let newGk = currentGk;
    
    // Auto-select first GK in this GC if current GK doesn't belong to it
    if (isClinical && newGk !== null && (newGk !== 2 * val - 1 && newGk !== 2 * val)) {
      newGk = 2 * val - 1;
    }
    
    save(newGs, val, newGk);
  };

  const handleGkChange = (val: number) => {
    const newGc = Math.ceil(val / 2);
    const newGs = Math.ceil(newGc / 2);
    save(newGs, newGc, val);
  };

  const save = (gs: number, gc: number, gk: number | null) => {
    const tree = ['GW', `GS${gs}`, `GC${gc}`];
    if (gk !== null) tree.push(`GK${gk}`);
    setActiveGroups(tree);
  };

  // Generate arrays for rendering
  const gsOptions = Array.from({ length: gsCount }, (_, i) => i + 1);
  const gcOptions = Array.from({ length: gsCount * 2 }, (_, i) => i + 1);
  const gkOptions = isClinical ? Array.from({ length: gsCount * 4 }, (_, i) => i + 1) : [];

  return (
    <div className={styles.container}>
      <div className={styles.tier}>
        <span className={styles.tierLabel}>Grupa Seminaryjna (GS)</span>
        <div className={styles.pillsScroll} ref={gsRef}>
          {gsOptions.map(num => (
            <button
              key={`gs-${num}`}
              className={`${styles.pill} ${num === currentGs ? styles.active : ''}`}
              onClick={() => handleGsChange(num)}
            >
              GS {num}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.tier}>
        <span className={styles.tierLabel}>Grupa Ćwiczeniowa (GC)</span>
        <div className={styles.pillsScroll} ref={gcRef}>
          {gcOptions.map(num => {
            const belongsToGs = Math.ceil(num / 2) === currentGs;
            return (
              <button
                key={`gc-${num}`}
                className={`${styles.pill} ${num === currentGc ? styles.active : ''} ${!belongsToGs ? styles.dimmed : ''}`}
                onClick={() => handleGcChange(num)}
              >
                GC {num}
              </button>
            );
          })}
        </div>
      </div>

      {isClinical && (
        <div className={styles.tier}>
          <span className={styles.tierLabel}>Grupa Kliniczna (GK)</span>
          <div className={styles.pillsScroll} ref={gkRef}>
            {gkOptions.map(num => {
              const belongsToGc = Math.ceil(num / 2) === currentGc;
              return (
                <button
                  key={`gk-${num}`}
                  className={`${styles.pill} ${num === currentGk ? styles.active : ''} ${!belongsToGc ? styles.dimmed : ''}`}
                  onClick={() => handleGkChange(num)}
                >
                  GK {num}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
