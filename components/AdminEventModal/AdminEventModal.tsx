'use client';

import { useState, useEffect } from 'react';
import { useScheduleStore } from '@/store/scheduleStore';
import type { EnrichedEvent } from '@/types/schedule';
import { addEventAction, updateEventAction, deleteEventAction, getProfessors } from '@/app/admin/actions';
import { Copy, Lock } from 'lucide-react';
import { getModeratorAllowedGroups, moderatorCanTouchGroups, RESTRICTED_EVENT_TYPES } from '@/lib/permissions';
import styles from './AdminEventModal.module.css';

interface Props {
  initialDate?: string;
  initialEvent?: EnrichedEvent | null;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AdminEventModal({ initialDate, initialEvent, onClose, onSuccess }: Props) {
  const { semesters, subjects, eventTypes, adminPassword, activeSemesterId, adminRole } = useScheduleStore();
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{type: 'success' | 'error', message: string} | null>(null);
  const [professors, setProfessors] = useState<any[]>([]);
  
  const isEditing = !!initialEvent;
  const isModerator = adminRole?.type === 'moderator';
  const moderatorAllowed = getModeratorAllowedGroups(isModerator ? adminRole?.group : null);

  // Czy aktualnie zalogowany użytkownik może modyfikować edytowane zajęcia?
  const canModify = !isEditing || !isModerator || (
    !RESTRICTED_EVENT_TYPES.includes(initialEvent!.type) &&
    moderatorCanTouchGroups(adminRole?.group, initialEvent!.target_groups)
  );
  const readOnlyReason = canModify ? null : (
    RESTRICTED_EVENT_TYPES.includes(initialEvent!.type)
      ? 'Wykłady i egzaminy może edytować tylko starosta roku.'
      : 'Te zajęcia należą do innej grupy – możesz je tylko podejrzeć.'
  );

  useEffect(() => {
    getProfessors().then(res => {
      if (res.success && res.data) setProfessors(res.data);
    });
    
    window.history.pushState({ isModal: 'admin' }, '');

    const handlePopState = () => {
      onClose();
    };
    
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [onClose]);

  const handleClose = () => {
    onClose();
    if (window.history.state?.isModal === 'admin') {
      window.history.back();
    }
  };

  const defaultSaved = (() => {
    if (initialEvent || typeof window === 'undefined') return null;
    try {
      const saved = localStorage.getItem('adminLastAddedEvent');
      if (saved) return JSON.parse(saved);
    } catch(e) {}
    return null;
  })();

  // Form state
  const [formData, setFormData] = useState({
    semester_id: initialEvent ? initialEvent.semester_id.toString() : (activeSemesterId?.toString() || semesters[0]?.id.toString() || ''),
    subject_key: initialEvent ? initialEvent.subject_key : (subjects[0]?.key || ''),
    type: initialEvent ? initialEvent.type : (adminRole?.type === 'moderator' ? 'S' : 'W'),
    time_start: initialEvent ? initialEvent.time_start.slice(0, 5) : '08:00',
    time_end: initialEvent ? initialEvent.time_end.slice(0, 5) : '09:30',
    location: initialEvent?.override_location || '',
    department: initialEvent?.department || '',
    professor: initialEvent?.override_professor_id || '',
    notes: initialEvent?.notes || '',
    exam_term: initialEvent?.exam_term || '',
    assessment_type: initialEvent?.assessment_type || '',
  });

  const getInitialDates = () => {
    if (initialEvent) return [initialEvent.date];
    const baseDateStr = initialDate || new Date().toISOString().split('T')[0];
    return [baseDateStr];
  };

  const [dates, setDates] = useState<string[]>(getInitialDates());

  const [seminarGroups, setSeminarGroups] = useState<string[]>(initialEvent?.target_groups?.filter(g => g.startsWith('GS') || g === 'GW') || []);
  const [exerciseGroups, setExerciseGroups] = useState<string[]>(initialEvent?.target_groups?.filter(g => g.startsWith('GC')) || []);
  const [clinicalGroups, setClinicalGroups] = useState<string[]>(initialEvent?.target_groups?.filter(g => g.startsWith('GK')) || []);

  const handleLoadPrevious = () => {
    if (!defaultSaved) return;
    setFormData({
      semester_id: defaultSaved.semester_id || activeSemesterId?.toString() || semesters[0]?.id.toString() || '',
      subject_key: defaultSaved.subject_key || subjects[0]?.key || '',
      type: defaultSaved.type || (adminRole?.type === 'moderator' ? 'S' : 'W'),
      time_start: defaultSaved.time_start || '08:00',
      time_end: defaultSaved.time_end || '09:30',
      location: defaultSaved.location || '',
      department: defaultSaved.department || '',
      professor: defaultSaved.professor || '',
      notes: defaultSaved.notes || '',
      exam_term: defaultSaved.exam_term || '',
      assessment_type: defaultSaved.assessment_type || '',
    });
    if (defaultSaved.dates && Array.isArray(defaultSaved.dates) && defaultSaved.dates.length > 0) {
      setDates(defaultSaved.dates);
    }
    setSeminarGroups(defaultSaved.seminarGroups || []);
    setExerciseGroups(defaultSaved.exerciseGroups || []);
    setClinicalGroups(defaultSaved.clinicalGroups || []);
  };

  const activeSemester = semesters.find(s => s.id === (parseInt(formData.semester_id) || activeSemesterId));
  const isClinical = activeSemester && activeSemester.year_number >= 3;
  const gsCount = activeSemester?.gs_count ?? 12;
  const gcCount = gsCount * 2;
  const gkCount = gsCount * 4;

  const gsList = ['GW', ...Array.from({length: gsCount}, (_, i) => `GS${i+1}`)];
  const gcList = Array.from({length: gcCount}, (_, i) => `GC${i+1}`);
  const gkList = Array.from({length: gkCount}, (_, i) => `GK${i+1}`);

  useEffect(() => {
    if (formData.type === 'W') {
      setSeminarGroups(['GW']);
      setExerciseGroups([]);
      setClinicalGroups([]);
    } else if (formData.type === 'S') {
      setSeminarGroups(prev => prev.filter(g => g !== 'GW'));
      setExerciseGroups([]);
      setClinicalGroups([]);
    } else if (formData.type === 'C' || formData.type === 'CSM') {
      setSeminarGroups([]);
    }
  }, [formData.type]);

  const isGroupDisabled = (g: string) => {
    if (g.startsWith('GK') && !isClinical) return true;
    if (formData.type === 'W' && g !== 'GW') return true;
    if (formData.type === 'S' && (g === 'GW' || g.startsWith('GC') || g.startsWith('GK'))) return true;
    if ((formData.type === 'C' || formData.type === 'CSM') && (g === 'GW' || g.startsWith('GS'))) return true;
    
    if (isModerator && !moderatorAllowed.has(g)) return true;
    
    return false;
  };

  const handleGroupToggle = (group: string, list: string[], setList: (l: string[]) => void, maxLimit: number) => {
    if (list.includes(group)) {
      setList(list.filter(g => g !== group));
    } else {
      if (adminRole?.type === 'moderator' && list.length >= maxLimit) {
        setStatus({ type: 'error', message: `Możesz zaznaczyć maksymalnie ${maxLimit} grupy tego typu.` });
        setTimeout(() => setStatus(null), 3000);
        return;
      }
      setList([...list, group]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminPassword || !canModify) return;

    setLoading(true);
    setStatus(null);

    // Walidacja dla moderatorów (serwer sprawdza to samo)
    if (isModerator) {
      const selected = [...seminarGroups, ...exerciseGroups, ...clinicalGroups];
      if (!moderatorCanTouchGroups(adminRole?.group, selected)) {
        setLoading(false);
        setStatus({ type: 'error', message: `Brak uprawnień. Zaznacz co najmniej jedną ze swoich grup (${Array.from(moderatorAllowed).filter(g => !g.startsWith('GK') || isClinical).join(', ')}).` });
        return;
      }
    }

    const basePayload = {
      ...formData,
      override_location: formData.location || (formData.type === 'W' ? 'MS Teams - online' : null),
      override_professor_id: formData.professor || null,
      semester_id: parseInt(formData.semester_id),
      target_groups: [...seminarGroups, ...exerciseGroups, ...clinicalGroups],
      exam_term: formData.type === 'E' ? (formData.exam_term || null) : null,
      assessment_type: formData.type !== 'E' ? (formData.assessment_type || null) : null,
      notes: formData.notes || null,
    };
    delete (basePayload as any).location;
    delete (basePayload as any).professor;

    let res;
    if (isEditing && initialEvent) {
      res = await updateEventAction(initialEvent.id, { ...basePayload, date: dates[0] }, adminPassword);
    } else {
      const payloads: any[] = [];
      const allSelectedGroups = [...seminarGroups, ...exerciseGroups, ...clinicalGroups];
      
      dates.forEach(d => {
        if (allSelectedGroups.length === 0) {
          payloads.push({ ...basePayload, date: d, target_groups: [] });
        } else {
          allSelectedGroups.forEach(g => {
            payloads.push({ ...basePayload, date: d, target_groups: [g] });
          });
        }
      });
      res = await addEventAction(payloads, adminPassword);
    }

    setLoading(false);
    if (res.success) {
      if (!isEditing) {
        try {
          localStorage.setItem('adminLastAddedEvent', JSON.stringify({
            ...formData,
            seminarGroups,
            exerciseGroups,
            clinicalGroups,
            dates
          }));
        } catch(e) {}
      }
      setStatus({ type: 'success', message: 'Zapisano pomyślnie!' });
      onSuccess();
      if (window.history.state?.isModal === 'admin') {
        window.history.back();
      }
    } else {
      setStatus({ type: 'error', message: res.error || 'Wystąpił błąd' });
    }
  };

  const handleDelete = async () => {
    if (!adminPassword || !initialEvent || !canModify) return;
    if (!confirm('Na pewno usunąć te zajęcia?')) return;

    setLoading(true);
    const res = await deleteEventAction(initialEvent.id, adminPassword);
    setLoading(false);

    if (res.success) {
      onSuccess();
    } else {
      setStatus({ type: 'error', message: res.error || 'Błąd usuwania' });
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const selectedSubject = subjects.find(s => s.key === formData.subject_key);
  const defaultLocation = formData.type === 'W' 
    ? 'MS Teams - online' 
    : (selectedSubject?.location || 'Brak domyślnej lokalizacji');

  return (
    <div className={styles.overlay} onClick={handleClose}>
      <div className={styles.card} onClick={e => e.stopPropagation()}>
        <button className={styles.closeBtn} onClick={handleClose}>✕</button>
        <div className={styles.header}>
          <h2>{isEditing ? (canModify ? 'Edytuj zajęcia' : 'Podgląd zajęć') : 'Dodaj zajęcia'}</h2>
        </div>

        {readOnlyReason && (
          <div className={styles.readOnlyNotice}>
            <Lock />
            <span>{readOnlyReason}</span>
          </div>
        )}
        
        {!isEditing && defaultSaved && (
          <div className={styles.loadPreviousWrapper}>
            <button type="button" onClick={handleLoadPrevious} className={styles.loadPreviousBtn} title="Wypełnij formularz danymi z poprzedniego dodania">
              <Copy />
              Wypełnij z poprzedniego dodania
            </button>
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <fieldset disabled={!canModify} className={styles.fieldset}>
          <div className={styles.row}>
            <div>
              <label className={styles.label}>Semestr</label>
              <select name="semester_id" value={formData.semester_id} onChange={handleChange} className={styles.select}>
                {semesters.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
              </select>
            </div>
            <div>
              <label className={styles.label}>Przedmiot</label>
              <select name="subject_key" value={formData.subject_key} onChange={handleChange} className={styles.select}>
                {subjects.map(s => <option key={s.key} value={s.key}>{s.label}</option>)}
              </select>
            </div>
          </div>

          <div className={styles.row}>
            <div>
              <label className={styles.label}>Typ zajęć</label>
              <select name="type" value={formData.type} onChange={handleChange} className={styles.select}>
                {eventTypes.map(t => {
                  if ((t.code === 'E' || t.code === 'W') && adminRole?.type === 'moderator') return null;
                  return <option key={t.code} value={t.code}>{t.label}</option>;
                })}
              </select>
            </div>
            <div>
              <label className={styles.label}>{isEditing ? 'Data' : 'Daty (możesz dodać wiele)'}</label>
              <div className={styles.datesContainer}>
                {dates.map((d, i) => (
                  <div key={i} className={styles.dateRow}>
                    <input type="date" value={d} onChange={(e) => {
                      const newDates = [...dates];
                      newDates[i] = e.target.value;
                      setDates(newDates);
                    }} className={styles.input} required />
                    {!isEditing && dates.length > 1 && (
                      <button type="button" onClick={() => {
                        setDates(dates.filter((_, idx) => idx !== i));
                      }} className={styles.removeDateBtn}>✕</button>
                    )}
                  </div>
                ))}
                {!isEditing && (
                  <button type="button" onClick={() => {
                    setDates([...dates, dates[dates.length - 1]]);
                  }} className={styles.addDateBtn}>+ Dodaj kolejną datę</button>
                )}
              </div>
            </div>
          </div>

          <div className={styles.row}>
            <div>
              <label className={styles.label}>Godzina rozpoczęcia</label>
              <input type="time" name="time_start" value={formData.time_start} onChange={handleChange} className={styles.input} required />
            </div>
            <div>
              <label className={styles.label}>Godzina zakończenia</label>
              <input type="time" name="time_end" value={formData.time_end} onChange={handleChange} className={styles.input} required />
            </div>
          </div>

          <label className={styles.label}>Grupy Seminaryjne / Wykładowe</label>
          <div className={styles.checkboxGrid}>
            {gsList.map(g => {
              const disabled = isGroupDisabled(g);
              return (
                <label key={g} className={`${styles.checkboxItem} ${disabled ? styles.disabled : ''}`}>
                  <input type="checkbox" checked={seminarGroups.includes(g)} onChange={() => handleGroupToggle(g, seminarGroups, setSeminarGroups, 2)} disabled={disabled} /> {g}
                </label>
              );
            })}
          </div>

          <label className={styles.label}>Grupy Ćwiczeniowe</label>
          <div className={styles.checkboxGrid}>
            {gcList.map(g => {
              const disabled = isGroupDisabled(g);
              return (
                <label key={g} className={`${styles.checkboxItem} ${disabled ? styles.disabled : ''}`}>
                  <input type="checkbox" checked={exerciseGroups.includes(g)} onChange={() => handleGroupToggle(g, exerciseGroups, setExerciseGroups, 4)} disabled={disabled} /> {g}
                </label>
              );
            })}
          </div>

          {isClinical && (
            <>
              <label className={styles.label}>
                Grupy Kliniczne 
              </label>
              <div className={styles.checkboxGrid}>
                {gkList.map(g => {
                  const disabled = isGroupDisabled(g);
                  return (
                    <label key={g} className={`${styles.checkboxItem} ${disabled ? styles.disabled : ''}`}>
                      <input type="checkbox" checked={clinicalGroups.includes(g)} onChange={() => handleGroupToggle(g, clinicalGroups, setClinicalGroups, 8)} disabled={disabled} /> {g}
                    </label>
                  );
                })}
              </div>
            </>
          )}

          <div className={styles.row}>
            <div>
              <label className={styles.label}>Zakład/Katedra (zostaw puste by użyć domyślnej)</label>
              <input type="text" name="department" value={formData.department} onChange={handleChange} className={styles.input} placeholder={selectedSubject?.department || 'Brak domyślnego zakładu'} />
            </div>
          </div>

          <div className={styles.row}>
            <div>
              <label className={styles.label}>Lokalizacja (adres)</label>
              <input type="text" name="location" value={formData.location} onChange={handleChange} className={styles.input} placeholder={defaultLocation} />
            </div>
            <div>
              <label className={styles.label}>Prowadzący</label>
              <select name="professor" value={formData.professor} onChange={handleChange} className={styles.input}>
                <option value="">-- Domyślny dla grupy z ustawień --</option>
                {professors.map((p: any) => (
                  <option key={p.id} value={p.id}>
                    {p.academic_title} {p.first_name} {p.last_name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {formData.type === 'E' ? (
            <div className={styles.row}>
              <div style={{ flex: 1 }}>
                <label className={styles.label}>Termin Egzaminu</label>
                <select name="exam_term" value={formData.exam_term} onChange={handleChange} className={styles.select}>
                  <option value="">- Wybierz termin -</option>
                  <option value="0">Termin 0</option>
                  <option value="I">Termin I</option>
                  <option value="II">Termin II</option>
                  <option value="III">Termin III</option>
                  <option value="IV">Termin IV</option>
                </select>
              </div>
            </div>
          ) : (
            <div className={styles.row}>
              <div style={{ flex: 1 }}>
                <label className={styles.label}>Typ zaliczenia na tych zajęciach (opcjonalnie)</label>
                <select name="assessment_type" value={formData.assessment_type} onChange={handleChange} className={styles.select}>
                  <option value="">- Brak zaliczenia -</option>
                  <option value="Kolokwium">Kolokwium</option>
                  <option value="Wejściówka">Wejściówka</option>
                  <option value="Kartkówka">Kartkówka</option>
                  <option value="Sprawdzian">Sprawdzian</option>
                </select>
              </div>
            </div>
          )}

          <div className={styles.row}>
            <div style={{ flex: 1 }}>
              <label className={styles.label}>Uwagi / Zagadnienia (opcjonalnie)</label>
              <input type="text" name="notes" value={formData.notes} onChange={handleChange} className={styles.input} placeholder="np. Zakres materiału, sala rezerwowa, co zabrać ze sobą" />
            </div>
          </div>

          </fieldset>

          {status && (
            <div className={`${styles.statusMessage} ${status.type === 'success' ? styles.statusSuccess : styles.statusError}`}>
              {status.message}
            </div>
          )}

          {canModify ? (
            <div className={styles.actions}>
              {isEditing && (
                <button type="button" className={styles.deleteBtn} onClick={handleDelete} disabled={loading}>
                  Usuń
                </button>
              )}
              <button type="submit" className={styles.submitBtn} disabled={loading}>
                {loading ? 'Zapisywanie...' : (isEditing ? 'Zapisz zmiany' : 'Dodaj zajęcia')}
              </button>
            </div>
          ) : (
            <div className={styles.actions}>
              <button type="button" className={styles.submitBtn} onClick={handleClose}>
                Zamknij
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
