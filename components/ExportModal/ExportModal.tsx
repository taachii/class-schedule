import { useEffect } from 'react';
import { useScheduleStore } from '@/store/scheduleStore';
import styles from './ExportModal.module.css';

interface ExportModalProps {
  onClose: () => void;
}

export default function ExportModal({ onClose }: ExportModalProps) {
  const { activeGroups, activeYearNumber, currentYear, currentMonth, semesters, activeSemesterId } = useScheduleStore();
  const filteredGroups = activeGroups.filter(g => g !== 'GW');
  const groupLabel = filteredGroups.length > 0 ? filteredGroups.join(' • ') : 'Wszystkie grupy';
  
  useEffect(() => {
    window.history.pushState({ isModal: 'export' }, '');
  }, []);

  useEffect(() => {
    const handlePopState = () => onClose();
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [onClose]);

  const handleClose = () => {
    onClose();
    if (window.history.state?.isModal === 'export') {
      window.history.back();
    }
  };

  if (!activeYearNumber) {
    return null;
  }

  // The base URL for the API
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
  const apiUrl = `/api/calendar?groups=${activeGroups.join(',')}&year=${activeYearNumber}`;
  const fullApiUrl = `${baseUrl}${apiUrl}`;
  
  // WebCal URL (replaces https:// with webcal://)
  const webcalUrl = fullApiUrl.replace(/^https?:\/\//, 'webcal://');

  const handlePrint = () => {
    handleClose();
    setTimeout(() => {
      const originalTitle = document.title;
      const monthName = new Date(currentYear, currentMonth).toLocaleDateString('pl-PL', { month: 'long', year: 'numeric' });
      const monthCapitalized = monthName.charAt(0).toUpperCase() + monthName.slice(1);
      
      const safeGroups = filteredGroups.length > 0 ? filteredGroups.join('_').replace(/[^a-zA-Z0-9_]/g, '') : 'Wszystkie';
      const semester = semesters.find(s => s.id === activeSemesterId);
      const semShort = semester?.label.toLowerCase().includes('letni') ? 'SL' : 'SZ';
      
      const programStr = 'Lek'; // TODO: Update to LekDent or Rat when dynamic program selection is added
      const newTitle = `Plan_${programStr}_R${activeYearNumber}_${semShort}_${safeGroups}_${monthCapitalized}`.replace(/\s+/g, '_');
      
      document.title = newTitle;
      window.print();
      
      const resetTitle = () => {
        document.title = originalTitle;
        window.removeEventListener('afterprint', resetTitle);
      };
      window.addEventListener('afterprint', resetTitle);
      setTimeout(resetTitle, 3000);
    }, 100);
  };

  return (
    <div className={styles.overlay} onClick={handleClose}>
      <div className={styles.card} onClick={e => e.stopPropagation()}>
        <button className={styles.closeBtn} onClick={handleClose}>✕</button>
        <div className={styles.header}>
          <h2>Wyeksportuj plan</h2>
          <p className={styles.subtitle}>Grupy: {groupLabel} • Rok {activeYearNumber}</p>
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
            <h3>📄 PDF / ICS</h3>
            <p>Plik .ics można zaimportować w Google Calendar lub Apple Calendar, aby mieć podgląd planu całego semestru. PDF z kolei służy do wydrukowania obecnego miesiąca (1 tydzień na stronę A4).</p>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={handlePrint} className={styles.secondaryBtn} style={{ flex: 1, backgroundColor: '#4f8ef7', color: 'white', border: 'none' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: 8, verticalAlign: 'middle' }}><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>
                Pobierz plik PDF
              </button>
              <a href={fullApiUrl} download className={styles.secondaryBtn} style={{ flex: 1 }}>
                Pobierz plik .ics
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
