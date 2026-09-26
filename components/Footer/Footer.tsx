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
        
        {/* Lewa strona - Twórca i kontakt */}
        <div className={styles.left}>
          <div className={styles.brand}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="16" y1="2" x2="16" y2="6"></line>
              <line x1="8" y1="2" x2="8" y2="6"></line>
              <line x1="3" y1="10" x2="21" y2="10"></line>
            </svg>
            <span>Plany Zajęć WNMZ</span>
          </div>
          <p className={styles.copyright}>
            &copy; {new Date().getFullYear()} Adam Chyt, lekarski Rok I.<br />Wszelkie prawa zastrzeżone.
          </p>
          <a href="mailto:a.chyt@365.sum.edu.pl" className={styles.linkWithIcon}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
              <polyline points="22,6 12,13 2,6"></polyline>
            </svg>
            Zgłoś błąd / Kontakt
          </a>
        </div>

        {/* Środek - Aktualizacja */}
        <div className={styles.center}>
          <div className={styles.updateBadge}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12 6 12 12 16 14"></polyline>
            </svg>
            <span>Ostatnia aktualizacja dla {activeGroup}</span>
          </div>
          <div className={styles.updateTime}>
            {lastUpdated ? formatDate(lastUpdated) : 'Brak danych'}
          </div>
        </div>

        {/* Prawa strona - Kawa / Linki */}
        <div className={styles.right}>
          <a 
            href="https://buycoffee.to/adamchyt" 
            target="_blank" 
            rel="noopener noreferrer" 
            className={styles.coffeeBtn}
            title="Wesprzyj utrzymanie serwerów i domeny"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 8h1a4 4 0 0 1 0 8h-1"></path>
              <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"></path>
              <line x1="6" y1="1" x2="6" y2="4"></line>
              <line x1="10" y1="1" x2="10" y2="4"></line>
              <line x1="14" y1="1" x2="14" y2="4"></line>
            </svg>
            Postaw wirtualną kawę
          </a>
        </div>

      </div>
    </footer>
  );
}
