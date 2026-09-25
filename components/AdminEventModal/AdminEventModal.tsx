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
  const { semesters, subjects, eventTypes, adminPassword, activeSemesterId } = useScheduleStore();
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
    date: initialEvent ? initialEvent.date : (initialDate || new Date().toISOString().split('T')[0]),
    time_start: initialEvent ? initialEvent.time_start.slice(0, 5) : '08:00',
    time_end: initialEvent ? initialEvent.time_end.slice(0, 5) : '09:30',
    location: initialEvent?.location || '',
    department: initialEvent?.department || '',
    professor: initialEvent?.professor || '',
    notes: initialEvent?.notes || '',
  });

  const [seminarGroups, setSeminarGroups] = useState<string[]>(initialEvent?.seminar_groups || []);
  const [exerciseGroups, setExerciseGroups] = useState<string[]>(initialEvent?.exercise_groups || []);

  const gsList = ['GW', ...Array.from({length: 12}, (_, i) => `GS${i+1}`)];
  const gcList = Array.from({length: 24}, (_, i) => `GC${i+1}`);

  const handleGroupToggle = (group: string, list: string[], setList: (l: string[]) => void) => {
    if (list.includes(group)) {
      setList(list.filter(g => g !== group));
    } else {
      setList([...list, group]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminPassword) return;

    setLoading(true);
    setStatus(null);

    const payload = {
      ...formData,
      location: formData.location || (formData.type === 'W' ? 'MS Teams - online' : null),
      semester_id: parseInt(formData.semester_id),
      seminar_groups: seminarGroups,
      exercise_groups: exerciseGroups,
    };

    let res;
    if (isEditing && initialEvent) {
      res = await updateEventAction(initialEvent.id, payload, adminPassword);
    } else {
      res = await addEventAction(payload, adminPassword);
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
              <label className={styles.label}>Data</label>
              <input type="date" name="date" value={formData.date} onChange={handleChange} className={styles.input} required />
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
            {gsList.map(g => (
              <label key={g} className={styles.checkboxItem}>
                <input type="checkbox" checked={seminarGroups.includes(g)} onChange={() => handleGroupToggle(g, seminarGroups, setSeminarGroups)} /> {g}
              </label>
            ))}
          </div>

          <label className={styles.label}>Grupy Ćwiczeniowe</label>
          <div className={styles.checkboxGrid}>
            {gcList.map(g => (
              <label key={g} className={styles.checkboxItem}>
                <input type="checkbox" checked={exerciseGroups.includes(g)} onChange={() => handleGroupToggle(g, exerciseGroups, setExerciseGroups)} /> {g}
              </label>
            ))}
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
