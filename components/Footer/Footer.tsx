import { useScheduleStore } from '@/store/scheduleStore';
import styles from './Footer.module.css';

export default function Footer() {
  const { lastUpdated, activeGroup } = useScheduleStore();

  const formatDate = (isoDate: string) => {
    const d = new Date(isoDate);
    const today = new Date();
    const isToday = d.getDate() === today.getDate() && d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear();
    
    const timeStr = d.toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' });
    if (isToday) return `Dzisiaj o ${timeStr}`;
    
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    if (d.getDate() === yesterday.getDate() && d.getMonth() === yesterday.getMonth() && d.getFullYear() === yesterday.getFullYear()) {
      return `Wczoraj o ${timeStr}`;
    }
    
    return d.toLocaleDateString('pl-PL', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <footer className={styles.footer}>
      <div className={styles.content}>
        <div className={styles.updateInfo}>
          Ostatnia aktualizacja dla {activeGroup}:{' '}
          <strong>{lastUpdated ? formatDate(lastUpdated) : 'Brak danych'}</strong>
        </div>
        <div className={styles.divider} />
        <div className={styles.credits}>
          Stworzone z pasją dla studentów WNMZ | © {new Date().getFullYear()}
        </div>
        <a href="mailto:bugreport@example.com" className={styles.bugReport}>
          Znalazłeś błąd? Zgłoś go tutaj.
        </a>
      </div>
    </footer>
  );
}
