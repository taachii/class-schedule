import { useState, useEffect } from 'react';
import { useScheduleStore } from '@/store/scheduleStore';
import { getProfessors, getSubjectDefaults, saveSubjectDefault } from '@/app/admin/actions';
import styles from './SubjectDefaultsModal.module.css';

interface SubjectDefaultsModalProps {
  onClose: () => void;
}

export default function SubjectDefaultsModal({ onClose }: SubjectDefaultsModalProps) {
  const { adminPassword, adminRole, semesters, activeSemesterId, subjects } = useScheduleStore();
  const [selectedSubject, setSelectedSubject] = useState<any>(null);
  const [professors, setProfessors] = useState<any[]>([]);
  const [defaults, setDefaults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [saveStatus, setSaveStatus] = useState('');

  const activeSemester = semesters.find(s => s.id === activeSemesterId);
  const isClinical = activeSemester && activeSemester.year_number >= 3;
  const gsCount = activeSemester?.gs_count ?? 12;
  const gcCount = gsCount * 2;
  const gkCount = gsCount * 4;

  // Build the list of all possible target groups
  const allGroups = [
    'GW',
    ...Array.from({length: gsCount}, (_, i) => `GS${i+1}`),
    ...Array.from({length: gcCount}, (_, i) => `GC${i+1}`),
    ...(isClinical ? Array.from({length: gkCount}, (_, i) => `GK${i+1}`) : [])
  ];

  useEffect(() => {
    if (selectedSubject) {
      fetchData(selectedSubject.key);
    }
  }, [selectedSubject]);

  const fetchData = async (subjKey: string) => {
    setLoading(true);
    const [profRes, defRes] = await Promise.all([
      getProfessors(),
      getSubjectDefaults(subjKey, activeSemesterId!)
    ]);

    if (profRes.success) setProfessors(profRes.data || []);
    if (defRes.success) setDefaults(defRes.data || []);
    
    setLoading(false);
  };

  const isGroupDisabled = (g: string) => {
    if (adminRole?.type === 'master' || adminRole?.type === 'admin') return false;
    if (adminRole?.type === 'moderator' && adminRole.group) {
      if (g === 'GW') return true;
      const modGs = adminRole.group;
      const modGsNum = parseInt(modGs.replace(/[^0-9]/g, ''));
      const allowedGc1 = `GC${modGsNum * 2 - 1}`;
      const allowedGc2 = `GC${modGsNum * 2}`;
      const allowedGk1 = `GK${modGsNum * 4 - 3}`;
      const allowedGk2 = `GK${modGsNum * 4 - 2}`;
      const allowedGk3 = `GK${modGsNum * 4 - 1}`;
      const allowedGk4 = `GK${modGsNum * 4}`;

      if (g !== modGs && g !== allowedGc1 && g !== allowedGc2 && g !== allowedGk1 && g !== allowedGk2 && g !== allowedGk3 && g !== allowedGk4) {
        return true;
      }
      return false;
    }
    return true;
  };

  const handleProfessorChange = async (groupKey: string, professorId: string) => {
    if (!adminPassword || !selectedSubject) return;
    setSaveStatus('Zapisywanie...');
    
    // Optymistyczny update
    const newDefaults = [...defaults];
    const idx = newDefaults.findIndex(d => d.group_key === groupKey);
    if (idx >= 0) {
      if (professorId === '') {
        newDefaults.splice(idx, 1);
      } else {
        newDefaults[idx].professor_id = professorId;
      }
    } else if (professorId !== '') {
      newDefaults.push({ group_key: groupKey, professor_id: professorId });
    }
    setDefaults(newDefaults);

    const payload = {
      subject_key: selectedSubject.key,
      semester_id: activeSemesterId!,
      group_key: groupKey,
      professor_id: professorId === '' ? null : professorId
    };

    const res = await saveSubjectDefault(payload, adminPassword);
    if (res.success) {
      setSaveStatus('Zapisano pomyślnie');
      setTimeout(() => setSaveStatus(''), 2000);
    } else {
      setSaveStatus('');
      setError(res.error || 'Błąd zapisu');
      fetchData(selectedSubject.key);
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <div className={styles.header}>
          <div>
            <h2>Przypisz prowadzących</h2>
            {selectedSubject && <p className={styles.subtitle}>{selectedSubject.label}</p>}
          </div>
          <button className={styles.closeBtn} onClick={onClose}>✕</button>
        </div>

        <div className={styles.content}>
          {error && <div className={styles.error}>{error}</div>}
          
          {!selectedSubject ? (
            <div className={styles.subjectList}>
              <p style={{marginBottom: 10, color: 'var(--text-secondary)'}}>Wybierz przedmiot z listy:</p>
              {subjects.map((s: any) => (
                <button key={s.key} className={styles.subjectBtn} onClick={() => setSelectedSubject(s)}>
                  {s.label}
                </button>
              ))}
            </div>
          ) : (
            <>
              <div className={styles.statusRow}>
                {loading ? <span>Ładowanie...</span> : <span>{saveStatus}</span>}
                <button className={styles.backBtn} onClick={() => setSelectedSubject(null)}>Wróć do wyboru przedmiotu</button>
              </div>

              {!loading && (
                <div className={styles.table}>
                  {allGroups.map(g => {
                    const disabled = isGroupDisabled(g);
                    if (disabled && adminRole?.type === 'moderator') return null;
                    
                    const currentDef = defaults.find(d => d.group_key === g);
                    
                    return (
                      <div key={g} className={`${styles.row} ${disabled ? styles.disabled : ''}`}>
                        <div className={styles.groupLabel}>{g}</div>
                        <select
                          className={styles.select}
                          disabled={disabled}
                          value={currentDef?.professor_id || ''}
                          onChange={(e) => handleProfessorChange(g, e.target.value)}
                        >
                          <option value="">-- Brak przypisania --</option>
                          {professors.map(p => (
                            <option key={p.id} value={p.id}>
                              {p.academic_title} {p.first_name} {p.last_name}
                            </option>
                          ))}
                        </select>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
