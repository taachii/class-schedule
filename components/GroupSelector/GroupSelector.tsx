import { useState, useEffect } from 'react';
import { useScheduleStore } from '@/store/scheduleStore';
import styles from './GroupSelector.module.css';

export default function GroupSelector() {
  const { activeGroups, setActiveGroups, semesters, activeSemesterId } = useScheduleStore();
  const [isOpen, setIsOpen] = useState(false);

  const activeSemester = semesters.find(s => s.id === activeSemesterId);
  const isClinical = activeSemester && activeSemester.year_number >= 3;
  const gsCount = activeSemester?.gs_count ?? 12;

  // Derive initial state from activeGroups array
  // We look for patterns like 'GS1', 'GC2', 'GK3'
  const initGs = activeGroups.find(g => g.startsWith('GS'))?.replace('GS', '') || '1';
  const initGc = activeGroups.find(g => g.startsWith('GC'))?.replace('GC', '') || '1';
  const initGk = activeGroups.find(g => g.startsWith('GK'))?.replace('GK', '') || '1';

  const [gs, setGs] = useState(parseInt(initGs));
  const [gc, setGc] = useState(parseInt(initGc));
  const [gk, setGk] = useState(isClinical ? parseInt(initGk) : null);

  // Synchronize internal state if external activeGroups changes
  useEffect(() => {
    setGs(parseInt(activeGroups.find(g => g.startsWith('GS'))?.replace('GS', '') || '1'));
    setGc(parseInt(activeGroups.find(g => g.startsWith('GC'))?.replace('GC', '') || '1'));
    if (isClinical) {
      setGk(parseInt(activeGroups.find(g => g.startsWith('GK'))?.replace('GK', '') || '1'));
    } else {
      setGk(null);
    }
  }, [activeGroups, isClinical]);

  const handleGsChange = (val: number) => {
    setGs(val);
    if (gc !== 2 * val - 1 && gc !== 2 * val) {
      const newGc = 2 * val - 1;
      setGc(newGc);
      if (gk !== null) setGk(2 * newGc - 1);
    }
  };

  const handleGcChange = (val: number) => {
    setGc(val);
    setGs(Math.ceil(val / 2));
    if (gk !== null && (gk !== 2 * val - 1 && gk !== 2 * val)) {
      setGk(2 * val - 1);
    }
  };

  const handleGkChange = (val: number) => {
    setGk(val);
    const newGc = Math.ceil(val / 2);
    setGc(newGc);
    setGs(Math.ceil(newGc / 2));
  };

  const handleSave = () => {
    const tree = ['GW', `GS${gs}`, `GC${gc}`];
    if (gk !== null) tree.push(`GK${gk}`);
    setActiveGroups(tree);
    setIsOpen(false);
  };

  // Generate options
  const gsOptions = Array.from({ length: gsCount }, (_, i) => i + 1);
  const gcOptions = [2 * gs - 1, 2 * gs];
  const gkOptions = gc ? [2 * gc - 1, 2 * gc] : [];

  // Find leaf group name to display on button
  const leafGroup = gk !== null ? `GK${gk}` : `GC${gc}`;

  return (
    <>
      <div className={styles.wrapper}>
        <button className={styles.triggerButton} onClick={() => setIsOpen(true)}>
          <span className={styles.icon}>⚙️</span> Moja Grupa: <strong>{leafGroup}</strong>
        </button>
      </div>

      {isOpen && (
        <div className={styles.modalOverlay} onClick={() => setIsOpen(false)}>
          <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3>Preferencje wyświetlania</h3>
              <button className={styles.closeBtn} onClick={() => setIsOpen(false)}>×</button>
            </div>
            
            <div className={styles.modalBody}>
              <p className={styles.helpText}>Wybierz swoją grupę. Pozostałe poziomy zaktualizują się automatycznie.</p>
              
              <div className={styles.formGroup}>
                <label>Grupa Seminaryjna (GS)</label>
                <select value={gs} onChange={e => handleGsChange(parseInt(e.target.value))}>
                  {gsOptions.map(num => (
                    <option key={num} value={num}>GS {num}</option>
                  ))}
                </select>
              </div>

              <div className={styles.formGroup}>
                <label>Grupa Ćwiczeniowa (GC)</label>
                <select value={gc} onChange={e => handleGcChange(parseInt(e.target.value))}>
                  {gcOptions.map(num => (
                    <option key={num} value={num}>GC {num}</option>
                  ))}
                </select>
                <div className={styles.altSelect}>
                  <small>Albo wybierz ręcznie spośród wszystkich:</small>
                  <select value={gc} onChange={e => handleGcChange(parseInt(e.target.value))} className={styles.smallSelect}>
                    {Array.from({ length: gsCount * 2 }, (_, i) => i + 1).map(num => (
                      <option key={num} value={num}>GC {num}</option>
                    ))}
                  </select>
                </div>
              </div>

              {isClinical && (
                <div className={styles.formGroup}>
                  <label>Grupa Kliniczna (GK)</label>
                  <select value={gk!} onChange={e => handleGkChange(parseInt(e.target.value))}>
                    {gkOptions.map(num => (
                      <option key={num} value={num}>GK {num}</option>
                    ))}
                  </select>
                  <div className={styles.altSelect}>
                    <small>Albo wybierz ręcznie spośród wszystkich:</small>
                    <select value={gk!} onChange={e => handleGkChange(parseInt(e.target.value))} className={styles.smallSelect}>
                      {Array.from({ length: gsCount * 4 }, (_, i) => i + 1).map(num => (
                        <option key={num} value={num}>GK {num}</option>
                      ))}
                    </select>
                  </div>
                </div>
              )}
            </div>

            <div className={styles.modalFooter}>
              <button className={styles.saveBtn} onClick={handleSave}>Zatwierdź grupę</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
