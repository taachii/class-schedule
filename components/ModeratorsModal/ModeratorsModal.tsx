import { useState, useEffect } from 'react';
import styles from './ModeratorsModal.module.css';

interface Moderator {
  id: string;
  name: string | null;
  email: string | null;
  assigned_group: string;
  assigned_year: number;
}

interface ModeratorsModalProps {
  onClose: () => void;
}

export default function ModeratorsModal({ onClose }: ModeratorsModalProps) {
  const [moderators, setModerators] = useState<Moderator[]>([]);
  const [loading, setLoading] = useState(true);
  const [resettingId, setResettingId] = useState<string | null>(null);
  const [newPasswords, setNewPasswords] = useState<Record<string, string>>({});

  useEffect(() => {
    fetch('/api/admin/moderators')
      .then(res => res.json())
      .then(data => {
        if (data.moderators) {
          setModerators(data.moderators);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleReset = async (id: string) => {
    const pwd = newPasswords[id];
    if (!pwd) return;

    setResettingId(id);
    try {
      const res = await fetch('/api/admin/moderators', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, newPassword: pwd }),
      });
      if (res.ok) {
        alert('Hasło zostało pomyślnie zmienione!');
        setNewPasswords(prev => ({ ...prev, [id]: '' }));
      } else {
        const data = await res.json();
        alert('Błąd: ' + data.error);
      }
    } catch (err) {
      alert('Błąd sieci.');
    }
    setResettingId(null);
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.card} onClick={e => e.stopPropagation()}>
        <div className={styles.header}>
          <h3 className={styles.title}>Zarządzanie Moderatorami</h3>
          <button className={styles.closeBtn} onClick={onClose}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>

        <div className={styles.body}>
          {loading ? (
            <div className={styles.loading}>Ładowanie danych...</div>
          ) : moderators.length === 0 ? (
            <div className={styles.loading}>Brak moderatorów w bazie.</div>
          ) : (
            moderators.map(mod => (
              <div key={mod.id} className={styles.moderatorRow}>
                <div className={styles.modInfo}>
                  <div className={styles.modName}>
                    {mod.name || 'Brak imienia'} 
                    <span className={styles.modBadge}>{mod.assigned_group}</span>
                  </div>
                  <div className={styles.modDetails}>
                    {mod.email || 'Brak emaila'} • Rok {mod.assigned_year}
                  </div>
                </div>
                <div className={styles.resetForm}>
                  <input 
                    type="text" 
                    placeholder="Nowe hasło..." 
                    className={styles.input}
                    value={newPasswords[mod.id] || ''}
                    onChange={e => setNewPasswords(prev => ({ ...prev, [mod.id]: e.target.value }))}
                  />
                  <button 
                    className={styles.resetBtn} 
                    onClick={() => handleReset(mod.id)}
                    disabled={resettingId === mod.id || !newPasswords[mod.id]}
                  >
                    Resetuj
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
