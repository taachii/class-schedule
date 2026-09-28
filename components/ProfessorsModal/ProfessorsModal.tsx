import { useState, useEffect } from 'react';
import { useScheduleStore } from '@/store/scheduleStore';
import { getProfessors, addProfessor, updateProfessor, deleteProfessor } from '@/app/admin/actions';
import styles from './ProfessorsModal.module.css';

interface Professor {
  id: string;
  academic_title: string;
  first_name: string;
  last_name: string;
  email: string;
}

export default function ProfessorsModal({ onClose }: { onClose: () => void }) {
  const { adminPassword } = useScheduleStore();
  const [professors, setProfessors] = useState<Professor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({ id: '', academic_title: '', first_name: '', last_name: '', email: '' });
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    fetchProfessors();
  }, []);

  useEffect(() => {
    window.history.pushState({ isModal: 'professors' }, '');
  }, []);

  useEffect(() => {
    const handlePopState = () => onClose();
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [onClose]);

  const handleClose = () => {
    onClose();
    if (window.history.state?.isModal === 'professors') {
      window.history.back();
    }
  };

  const fetchProfessors = async () => {
    setLoading(true);
    const res = await getProfessors();
    if (res.success && res.data) {
      setProfessors(res.data);
    } else {
      setError(res.error || 'Błąd pobierania prowadzących');
    }
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminPassword) return;
    setLoading(true);
    setError('');

    const payload = {
      academic_title: formData.academic_title,
      first_name: formData.first_name,
      last_name: formData.last_name,
      email: formData.email
    };

    let res;
    if (isEditing) {
      res = await updateProfessor(formData.id, payload, adminPassword);
    } else {
      res = await addProfessor(payload, adminPassword);
    }

    if (res.success) {
      setFormData({ id: '', academic_title: '', first_name: '', last_name: '', email: '' });
      setIsEditing(false);
      fetchProfessors();
    } else {
      setError(res.error || 'Wystąpił błąd zapisu');
      setLoading(false);
    }
  };

  const handleEdit = (p: Professor) => {
    setFormData(p);
    setIsEditing(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Na pewno usunąć tego prowadzącego?')) return;
    if (!adminPassword) return;
    setLoading(true);
    const res = await deleteProfessor(id, adminPassword);
    if (res.success) {
      fetchProfessors();
    } else {
      setError(res.error || 'Błąd usuwania');
      setLoading(false);
    }
  };

  const cancelEdit = () => {
    setFormData({ id: '', academic_title: '', first_name: '', last_name: '', email: '' });
    setIsEditing(false);
  };

  return (
    <div className={styles.overlay} onClick={handleClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <div className={styles.header}>
          <h2>Baza Prowadzących</h2>
          <button className={styles.closeBtn} onClick={handleClose}>✕</button>
        </div>

        <div className={styles.content}>
          {error && <div className={styles.error}>{error}</div>}
          
          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.formRow}>
              <input
                type="text"
                placeholder="Tytuł (np. dr hab. n. med.)"
                value={formData.academic_title}
                onChange={e => setFormData({ ...formData, academic_title: e.target.value })}
                className={styles.input}
              />
              <input
                type="text"
                placeholder="Imię"
                value={formData.first_name}
                onChange={e => setFormData({ ...formData, first_name: e.target.value })}
                required
                className={styles.input}
              />
              <input
                type="text"
                placeholder="Nazwisko"
                value={formData.last_name}
                onChange={e => setFormData({ ...formData, last_name: e.target.value })}
                required
                className={styles.input}
              />
            </div>
            <div className={styles.formRow}>
              <input
                type="email"
                placeholder="E-mail (opcjonalnie)"
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
                className={styles.input}
              />
              <button type="submit" className={styles.submitBtn} disabled={loading}>
                {loading ? 'Zapisywanie...' : isEditing ? 'Zapisz zmiany' : 'Dodaj prowadzącego'}
              </button>
              {isEditing && (
                <button type="button" onClick={cancelEdit} className={styles.cancelBtn}>Anuluj</button>
              )}
            </div>
          </form>

          <div className={styles.list}>
            {loading && professors.length === 0 ? (
              <p>Ładowanie...</p>
            ) : professors.length === 0 ? (
              <p>Brak dodanych prowadzących.</p>
            ) : (
              professors.map(p => (
                <div key={p.id} className={styles.card}>
                  <div className={styles.cardInfo}>
                    <strong>{p.academic_title} {p.first_name} {p.last_name}</strong>
                    {p.email && <span className={styles.email}>{p.email}</span>}
                  </div>
                  <div className={styles.actions}>
                    <button onClick={() => handleEdit(p)} className={styles.editBtn}>Edytuj</button>
                    <button onClick={() => handleDelete(p.id)} className={styles.deleteBtn}>Usuń</button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
