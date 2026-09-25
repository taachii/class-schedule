'use client';

import { useState, useEffect } from 'react';
import { useScheduleStore } from '@/store/scheduleStore';
import type { EnrichedEvent } from '@/types/schedule';
import { addEventAction, updateEventAction, deleteEventAction } from '@/app/admin/actions';
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
  
  const isEditing = !!initialEvent;

  useEffect(() => {
    window.history.pushState({ isModal: 'admin' }, '');
    
    const handlePopState = () => {
      onClose();
    };
    
    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
      if (window.history.state?.isModal === 'admin') {
        window.history.back();
      }
    };
  }, [onClose]);

  // Form state
  const [formData, setFormData] = useState({
    semester_id: initialEvent ? initialEvent.semester_id.toString() : (activeSemesterId?.toString() || (semesters[0]?.id.toString() ?? '')),
    subject_key: initialEvent ? initialEvent.subject_key : (subjects[0]?.key ?? ''),
    type: initialEvent ? initialEvent.type : 'W',
    time_start: initialEvent ? initialEvent.time_start.slice(0, 5) : '08:00',
    time_end: initialEvent ? initialEvent.time_end.slice(0, 5) : '09:30',
    location: initialEvent?.location || '',
    department: initialEvent?.department || '',
    professor: initialEvent?.professor || '',
    notes: initialEvent?.notes || '',
  });

  const [dates, setDates] = useState<string[]>(
    initialEvent ? [initialEvent.date] : [initialDate || new Date().toISOString().split('T')[0]]
  );

  const [seminarGroups, setSeminarGroups] = useState<string[]>(initialEvent?.seminar_groups || []);
  const [exerciseGroups, setExerciseGroups] = useState<string[]>(initialEvent?.exercise_groups || []);

  const activeSemester = semesters.find(s => s.id === (parseInt(formData.semester_id) || activeSemesterId));
  const gsCount = activeSemester?.gs_count ?? 12;
  const gcCount = activeSemester?.gc_count ?? 24;
  const gsPrefix = activeSemester?.gs_prefix ?? 'GS';
  const gcPrefix = activeSemester?.gc_prefix ?? 'GC';

  const gsList = ['GW', ...Array.from({length: gsCount}, (_, i) => `${gsPrefix}${i+1}`)];
  const gcList = Array.from({length: gcCount}, (_, i) => `${gcPrefix}${i+1}`);

  useEffect(() => {
    if (formData.type === 'W') {
      setSeminarGroups(['GW']);
      setExerciseGroups([]);
    } else if (formData.type === 'S') {
      setSeminarGroups(prev => prev.filter(g => g !== 'GW'));
      setExerciseGroups([]);
    } else if (formData.type === 'C' || formData.type === 'CSM') {
      setSeminarGroups([]);
    }
  }, [formData.type]);

  const isGroupDisabled = (g: string) => {
    if (adminRole?.type === 'moderator' && g === 'GW') return true;
    if (formData.type === 'W') return g !== 'GW';
    if (formData.type === 'S') return g === 'GW' || g.startsWith('GC');
    if (formData.type === 'C' || formData.type === 'CSM') return g === 'GW' || g.startsWith('GS');
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
    if (!adminPassword) return;

    setLoading(true);
    setStatus(null);

    // Validation for moderators
    if (adminRole?.type === 'moderator' && adminRole.group) {
      // e.g. 'GS3' -> match 'GS3', or 'GC5', 'GC6'
      const modGs = adminRole.group;
      const modGsNum = parseInt(modGs.replace(/[^0-9]/g, ''));
      const allowedGc1 = `${gcPrefix}${modGsNum * 2 - 1}`;
      const allowedGc2 = `${gcPrefix}${modGsNum * 2}`;
      
      const hasAccess = 
        seminarGroups.includes(modGs) || 
        exerciseGroups.includes(allowedGc1) || 
        exerciseGroups.includes(allowedGc2);

      if (!hasAccess) {
        setLoading(false);
        setStatus({ type: 'error', message: `Brak uprawnień. Musisz uwzględnić swoją grupę (${modGs} lub ${allowedGc1}/${allowedGc2}).` });
        return;
      }
    }

    const basePayload = {
      ...formData,
      location: formData.location || (formData.type === 'W' ? 'MS Teams - online' : null),
      semester_id: parseInt(formData.semester_id),
      seminar_groups: seminarGroups,
      exercise_groups: exerciseGroups,
    };

    let res;
    if (isEditing && initialEvent) {
      res = await updateEventAction(initialEvent.id, { ...basePayload, date: dates[0] }, adminPassword);
    } else {
      const payloads = dates.map(d => ({ ...basePayload, date: d }));
      res = await addEventAction(payloads, adminPassword);
    }

    setLoading(false);
    if (res.success) {
      setStatus({ type: 'success', message: 'Zapisano pomyślnie!' });
      onSuccess();
    } else {
      setStatus({ type: 'error', message: res.error || 'Wystąpił błąd' });
    }
  };

  const handleDelete = async () => {
    if (!adminPassword || !initialEvent) return;
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
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.card} onClick={e => e.stopPropagation()}>
        <button className={styles.closeBtn} onClick={onClose}>✕</button>
        <div className={styles.header}>
          <h2>{isEditing ? 'Edytuj zajęcia' : 'Dodaj zajęcia'}</h2>
        </div>
        
        <form onSubmit={handleSubmit}>
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
                {eventTypes.map(t => <option key={t.code} value={t.code}>{t.label}</option>)}
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
              <input type="text" name="professor" value={formData.professor} onChange={handleChange} className={styles.input} placeholder="Imię i nazwisko prowadzącego" />
            </div>
          </div>

          {status && (
            <div className={`${styles.statusMessage} ${status.type === 'success' ? styles.statusSuccess : styles.statusError}`}>
              {status.message}
            </div>
          )}

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
        </form>
      </div>
    </div>
  );
}
