'use client';

import { useState } from 'react';
import Link from 'next/link';
import SchedulePage from '../page';
import { useScheduleStore } from '@/store/scheduleStore';
import { verifyPasswordAction } from './actions';
import styles from './Admin.module.css';

export default function AdminPage() {
  const { adminRole, setAdminAuth, setActiveYearNumber, setActiveGroups } = useScheduleStore();
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [loginError, setLoginError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setLoginError('');
    
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      
      setLoading(false);
      
      if (res.ok && data.role) {
        setAdminAuth(data.role, password);
        if (data.role.year) {
          setActiveYearNumber(data.role.year);
        }
        if (data.role.group) {
          if (data.role.group.startsWith('GS')) {
            const gsNum = parseInt(data.role.group.replace('GS', ''));
            const gcNum = gsNum * 2 - 1;
            const groups = ['GW', data.role.group, `GC${gcNum}`];
            if (data.role.year && data.role.year >= 3) {
              groups.push(`GK${gcNum * 2 - 1}`);
            }
            setActiveGroups(groups);
          } else {
            setActiveGroups([data.role.group]);
          }
        }
      } else {
        setLoginError(data.error || 'Nieprawidłowe hasło');
      }
    } catch (err) {
      setLoading(false);
      setLoginError('Wystąpił błąd sieci.');
    }
  };

  if (adminRole) {
    return (
      <div className="admin-wrapper" style={{ borderTop: '4px solid #ef4444' }}>
        <SchedulePage />
      </div>
    );
  }

  return (
    <div className={styles.page} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <form onSubmit={handleLogin} className={styles.loginBox} style={{ background: 'var(--bg-surface)', padding: 40, borderRadius: 12, border: '1px solid var(--border)' }}>
        <h2>Panel Administratora</h2>
        <p style={{ color: 'var(--text-muted)' }}>Zaloguj się, aby uzyskać uprawnienia do edycji kalendarza.</p>
        <input 
          type="password" 
          value={password} 
          onChange={e => setPassword(e.target.value)} 
          className={styles.input} 
          placeholder="Hasło admina..." 
          required 
        />
        <button type="submit" className={styles.submitBtn} disabled={loading}>
          {loading ? 'Weryfikacja...' : 'Zaloguj i edytuj'}
        </button>
        <Link href="/" className={styles.backLink}>
          Wróć do przeglądania planu
        </Link>
        {loginError && <div className={`${styles.statusMessage} ${styles.statusError}`}>{loginError}</div>}
      </form>
    </div>
  );
}
