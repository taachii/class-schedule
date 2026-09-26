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
          <div className={styles.credits}>
            Stworzone przez: <strong>Adam Chyt</strong> (lekarski Rok I)
          </div>
          <a href="mailto:a.chyt@365.sum.edu.pl" className={styles.bugReport}>
            Znalazłeś błąd? Napisz na maila uczelnianego
          </a>
        </div>

        {/* Środek - Aktualizacja */}
        <div className={styles.center}>
          <div className={styles.updateInfo}>
            Ostatnia aktualizacja dla {activeGroup}:<br />
            <strong>{lastUpdated ? formatDate(lastUpdated) : 'Brak danych'}</strong>
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
            ☕ Postaw wirtualną kawę
          </a>
        </div>

      </div>
    </footer>
  );
}
