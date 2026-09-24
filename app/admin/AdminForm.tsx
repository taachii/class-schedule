'use client';

import { useState } from 'react';
import type { Semester, Subject, EventType } from '@/types/schedule';
import { addEventAction } from './actions';
import styles from './Admin.module.css';

interface Props {
  semesters: Semester[];
  subjects: Subject[];
  eventTypes: EventType[];
}

export default function AdminForm({ semesters, subjects, eventTypes }: Props) {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{type: 'success' | 'error', message: string} | null>(null);
  
  const [password, setPassword] = useState('');
  
  // Form state
  const [formData, setFormData] = useState({
    semester_id: semesters.length > 0 ? semesters[0].id.toString() : '',
    subject_key: subjects.length > 0 ? subjects[0].key : '',
    type: eventTypes.length > 0 ? eventTypes[0].code : 'W',
    date: new Date().toISOString().split('T')[0],
    time_start: '08:00',
    time_end: '09:30',
    location: '',
    notes: '',
  });

  const [seminarGroups, setSeminarGroups] = useState<string[]>([]);
  const [exerciseGroups, setExerciseGroups] = useState<string[]>([]);

  // Helpers to generate GS and GC checkboxes
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
    if (!password) {
      setStatus({ type: 'error', message: 'Wprowadź hasło administratora.' });
      return;
    }

    setLoading(true);
    setStatus(null);

    const payload = {
      ...formData,
      semester_id: parseInt(formData.semester_id),
      seminar_groups: seminarGroups,
      exercise_groups: exerciseGroups,
    };

    const res = await addEventAction(payload, password);

    setLoading(false);
    if (res.success) {
      setStatus({ type: 'success', message: 'Dodano zajęcia pomyślnie!' });
      // Nie resetujemy daty i przedmiotu by ułatwić masowe wprowadzanie!
      // setSeminarGroups([]);
      // setExerciseGroups([]);
    } else {
      setStatus({ type: 'error', message: res.error || 'Wystąpił błąd' });
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <form onSubmit={handleSubmit}>
      
      <div className={styles.row}>
        <div className={styles.formGroup}>
          <label className={styles.label}>Semestr</label>
          <select name="semester_id" value={formData.semester_id} onChange={handleChange} className={styles.select}>
            {semesters.map(s => (
              <option key={s.id} value={s.id}>{s.label}</option>
            ))}
          </select>
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>Przedmiot</label>
          <select name="subject_key" value={formData.subject_key} onChange={handleChange} className={styles.select}>
            {subjects.map(s => (
              <option key={s.key} value={s.key}>{s.label}</option>
            ))}
          </select>
        </div>
      </div>

      <div className={styles.row}>
        <div className={styles.formGroup}>
          <label className={styles.label}>Typ zajęć</label>
          <select name="type" value={formData.type} onChange={handleChange} className={styles.select}>
            {eventTypes.map(t => (
              <option key={t.code} value={t.code}>{t.label}</option>
            ))}
          </select>
        </div>
        <div className={styles.formGroup}>
          <label className={styles.label}>Data</label>
          <input type="date" name="date" value={formData.date} onChange={handleChange} className={styles.input} required />
        </div>
      </div>

      <div className={styles.row}>
        <div className={styles.formGroup}>
          <label className={styles.label}>Godzina rozpoczęcia</label>
          <input type="time" name="time_start" value={formData.time_start} onChange={handleChange} className={styles.input} required />
        </div>
        <div className={styles.formGroup}>
          <label className={styles.label}>Godzina zakończenia</label>
          <input type="time" name="time_end" value={formData.time_end} onChange={handleChange} className={styles.input} required />
        </div>
      </div>

      <div className={styles.formGroup}>
        <label className={styles.label}>Grupy Seminaryjne / Wykładowe (seminar_groups)</label>
        <div className={styles.checkboxGrid}>
          {gsList.map(g => (
            <label key={g} className={styles.checkboxItem}>
              <input 
                type="checkbox" 
                checked={seminarGroups.includes(g)} 
                onChange={() => handleGroupToggle(g, seminarGroups, setSeminarGroups)} 
              />
              {g}
            </label>
          ))}
        </div>
      </div>

      <div className={styles.formGroup}>
        <label className={styles.label}>Grupy Ćwiczeniowe (exercise_groups)</label>
        <div className={styles.checkboxGrid}>
          {gcList.map(g => (
            <label key={g} className={styles.checkboxItem}>
              <input 
                type="checkbox" 
                checked={exerciseGroups.includes(g)} 
                onChange={() => handleGroupToggle(g, exerciseGroups, setExerciseGroups)} 
              />
              {g}
            </label>
          ))}
        </div>
      </div>

      <div className={styles.row}>
        <div className={styles.formGroup}>
          <label className={styles.label}>Sala (opcjonalnie)</label>
          <input type="text" name="location" value={formData.location} onChange={handleChange} className={styles.input} />
        </div>
        <div className={styles.formGroup}>
          <label className={styles.label}>Hasło Admina</label>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} className={styles.input} required placeholder="Wymagane do zapisu" />
        </div>
      </div>

      <button type="submit" className={styles.submitBtn} disabled={loading}>
        {loading ? 'Dodawanie...' : 'Dodaj zajęcia'}
      </button>

      {status && (
        <div className={`${styles.statusMessage} ${status.type === 'success' ? styles.statusSuccess : styles.statusError}`}>
          {status.message}
        </div>
      )}

    </form>
  );
}
