import { useEffect } from 'react';
import { useScheduleStore } from '@/store/scheduleStore';
import styles from './ExportModal.module.css';

interface ExportModalProps {
  onClose: () => void;
}

export default function ExportModal({ onClose }: ExportModalProps) {
  const { activeGroup, activeYearNumber } = useScheduleStore();
  
  useEffect(() => {
    window.history.pushState({ isModal: 'export' }, '');
    const handlePopState = () => onClose();
    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
      if (window.history.state?.isModal === 'export') {
        window.history.back();
      }
    };
  }, [onClose]);

  if (!activeYearNumber) {
    return null;
  }

  // The base URL for the API
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
  const apiUrl = `/api/calendar?group=${activeGroup}&year=${activeYearNumber}`;
  const fullApiUrl = `${baseUrl}${apiUrl}`;
  
  // WebCal URL (replaces https:// with webcal://)
  const webcalUrl = fullApiUrl.replace(/^https?:\/\//, 'webcal://');

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.card} onClick={e => e.stopPropagation()}>
        <button className={styles.closeBtn} onClick={onClose}>✕</button>
        <div className={styles.header}>
          <h2>Zasubskrybuj plan</h2>
          <p className={styles.subtitle}>Grupa {activeGroup} • Rok {activeYearNumber}</p>
        </div>
        
        <div className={styles.body}>
          <div className={styles.section}>
            <h3>📱 Apple Calendar (domyślny iOS/macOS)</h3>
            <p>Kliknij poniższy przycisk, aby dodać dynamiczną subskrypcję do Kalendarza Apple. Plan będzie aktualizował się sam, gdy tylko zajdą zmiany!</p>
            <a href={webcalUrl} className={styles.primaryBtn}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
              Subskrybuj w Apple Calendar
            </a>
          </div>

          <div className={styles.section}>
            <h3>🌐 Google Calendar (wszystkie systemy)</h3>
            <p>Z tego sposobu mogą skorzystać użytkownicy Androida, jak i posiadacze sprzętu Apple, którzy preferują aplikację Google Calendar:</p>
            <ol className={styles.steps}>
              <li>Skopiuj poniższy link subskrypcji.</li>
              <li>Otwórz Google Calendar w przeglądarce <b>na komputerze</b> (nie w aplikacji mobilnej).</li>
              <li>Po lewej stronie przy <b>Inne kalendarze</b> kliknij <b>+</b> i wybierz <b>Z adresu URL</b>.</li>
              <li>Wklej skopiowany link i kliknij <b>Dodaj kalendarz</b>. Pojawi się on automatycznie na Twoim telefonie.</li>
            </ol>
            
            <div className={styles.copyBox}>
              <input type="text" readOnly value={fullApiUrl} className={styles.copyInput} />
              <button 
                className={styles.copyBtn} 
                onClick={() => {
                  navigator.clipboard.writeText(fullApiUrl);
                  alert('Skopiowano do schowka!');
                }}
              >
                Kopiuj
              </button>
            </div>
          </div>

          <div className={styles.divider}>lub</div>

          <div className={styles.section}>
            <h3>⬇️ Jednorazowe pobranie (.ics)</h3>
            <p>Możesz też pobrać tradycyjny plik .ics z planem na tę chwilę. Pamiętaj jednak, że ta wersja nie będzie się automatycznie aktualizować!</p>
            <a href={fullApiUrl} download className={styles.secondaryBtn}>
              Pobierz plik .ics
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
