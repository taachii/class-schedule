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

const ROMAN_YEARS = ['I', 'II', 'III', 'IV', 'V', 'VI'];

export default function ModeratorsModal({ onClose }: ModeratorsModalProps) {
  const [moderators, setModerators] = useState<Moderator[]>([]);
  const [loading, setLoading] = useState(true);
  const [resettingId, setResettingId] = useState<string | null>(null);
  const [newPasswords, setNewPasswords] = useState<Record<string, string>>({});
  const [activeTabYear, setActiveTabYear] = useState<number>(1);

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

  const generateComplexString = (length: number) => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  const handleGenerateCode = async (mod: Moderator) => {
    const yearNum = mod.assigned_year;
    const randomStr = generateComplexString(8);
    
    const randomCode = mod.role === 'admin' 
      ? `R${yearNum}-${randomStr}`
      : `R${yearNum}-${mod.assigned_group}-${randomStr}`;

    setResettingId(mod.id);
    try {
      const res = await fetch('/api/admin/moderators', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: mod.id, newPassword: randomCode }),
      });
      if (res.ok) {
        setNewPasswords(prev => ({ ...prev, [mod.id]: randomCode }));
      } else {
        const data = await res.json();
        alert('Błąd: ' + data.error);
      }
    } catch (err) {
      alert('Błąd sieci.');
    }
    setResettingId(null);
  };

  const availableYears = [1, 2, 3, 4, 5, 6];

  const currentMods = moderators.filter(m => m.assigned_year === activeTabYear);
  const adminMod = currentMods.find(m => m.role === 'admin');
  const gsMods = currentMods.filter(m => m.role === 'moderator').sort((a, b) => {
    const numA = parseInt(a.assigned_group?.replace('GS', '') || '0');
    const numB = parseInt(b.assigned_group?.replace('GS', '') || '0');
    return numA - numB;
  });

  const renderModRow = (mod: Moderator) => (
    <div key={mod.id} className={styles.moderatorRow} style={mod.role === 'admin' ? { borderColor: 'rgba(239, 68, 68, 0.3)', background: 'rgba(239, 68, 68, 0.05)' } : {}}>
      <div className={styles.modInfo}>
        <div className={styles.modName}>
          {mod.name || 'Brak imienia'} 
          <span className={styles.modBadge} style={mod.role === 'admin' ? { background: 'rgba(239, 68, 68, 0.15)', color: '#ef4444' } : {}}>
            {mod.role === 'admin' ? `Admin Roku` : mod.assigned_group}
          </span>
        </div>
        <div className={styles.modDetails}>
          {mod.email || 'Brak emaila'}
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
            onClick={() => handleGenerateCode(mod)}
            disabled={resettingId === mod.id}
          >
            {resettingId === mod.id ? 'Generowanie...' : 'Generuj nowy kod'}
          </button>
        )}
      </div>
    </div>
  );

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
            <>
              <div className={styles.tabs}>
                {availableYears.map(year => (
                  <button
                    key={year}
                    className={`${styles.tab} ${activeTabYear === year ? styles.active : ''}`}
                    onClick={() => setActiveTabYear(year)}
                  >
                    Rok {ROMAN_YEARS[year - 1] || year}
                  </button>
                ))}
              </div>
              <div className={styles.tabContent}>
                {!adminMod && gsMods.length === 0 ? (
                  <div className={styles.loading} style={{ padding: 0 }}>Brak jakichkolwiek przypisanych moderatorów na tym roku.</div>
                ) : (
                  <>
                    {adminMod ? renderModRow(adminMod) : <div className={styles.loading} style={{ padding: 0, fontSize: '0.9rem' }}>Brak przypisanego Starosty Roku (Admina)</div>}
                    {gsMods.length > 0 ? (
                      <div className={styles.gsList}>
                        {gsMods.map(renderModRow)}
                      </div>
                    ) : (
                      <div className={styles.loading} style={{ padding: 0, fontSize: '0.9rem' }}>Brak przypisanych moderatorów GS w tym roku.</div>
                    )}
                  </>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
