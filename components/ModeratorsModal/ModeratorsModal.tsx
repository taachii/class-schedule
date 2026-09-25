import { useState, useEffect } from 'react';
import styles from './ModeratorsModal.module.css';

interface Moderator {
  id: string;
  name: string | null;
  email: string | null;
  role: string;
  assigned_group: string | null;
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

  const handleGenerateCode = async (id: string, role: string) => {
    const randomCode = role === 'admin' 
      ? `ROK-ADMIN-${Math.random().toString(36).substring(2, 8).toUpperCase()}`
      : `MOD-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    setResettingId(id);
    try {
      const res = await fetch('/api/admin/moderators', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, newPassword: randomCode }),
      });
      if (res.ok) {
        setNewPasswords(prev => ({ ...prev, [id]: randomCode }));
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
                    <span className={styles.modBadge} style={mod.role === 'admin' ? { background: 'rgba(239, 68, 68, 0.15)', color: '#ef4444' } : {}}>
                      {mod.role === 'admin' ? `Admin Roku` : mod.assigned_group}
                    </span>
                  </div>
                  <div className={styles.modDetails}>
                    {mod.email || 'Brak emaila'} • Rok {mod.assigned_year}
                  </div>
                </div>
                <div className={styles.resetForm}>
                  {newPasswords[mod.id] ? (
                    <div style={{ background: '#111', padding: '6px 12px', borderRadius: '6px', border: '1px solid #333', fontFamily: 'monospace', color: '#10b981', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {newPasswords[mod.id]}
                      <button onClick={() => navigator.clipboard.writeText(newPasswords[mod.id])} style={{ background: 'transparent', border: 'none', color: '#888', cursor: 'pointer' }} title="Kopiuj">📋</button>
                    </div>
                  ) : (
                    <button 
                      className={styles.resetBtn} 
                      onClick={() => handleGenerateCode(mod.id, mod.role as string)}
                      disabled={resettingId === mod.id}
                    >
                      {resettingId === mod.id ? 'Generowanie...' : 'Generuj nowy kod'}
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
