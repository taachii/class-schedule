'use client';

import { useState } from 'react';
import SchedulePage from '../page';
import { useScheduleStore } from '@/store/scheduleStore';
import { verifyPasswordAction } from './actions';
import styles from './Admin.module.css';

export default function AdminPage() {
  const { adminRole, setAdminAuth } = useScheduleStore();
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
        {loginError && <div className={`${styles.statusMessage} ${styles.statusError}`}>{loginError}</div>}
      </form>
    </div>
  );
}
