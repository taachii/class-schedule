'use client';

import { useEffect } from 'react';
import { useScheduleStore } from '@/store/scheduleStore';
import Header from '@/components/Header/Header';
import GroupSelector from '@/components/GroupSelector/GroupSelector';
import SubjectFilters from '@/components/SubjectFilters/SubjectFilters';
import CalendarView from '@/components/CalendarView/CalendarView';
import EventModal from '@/components/EventModal/EventModal';
import HomeSelector from '@/components/HomeSelector/HomeSelector';
import Footer from '@/components/Footer/Footer';
import PdfExportView from '@/components/PdfExportView/PdfExportView';

const ROMAN_NUMERALS = ['I', 'II', 'III', 'IV', 'V', 'VI'];

export default function SchedulePage() {
  const { activeYearNumber, activeSemesterId, activeGroups, semesters, initialize, isLoading, error } = useScheduleStore();

  useEffect(() => {
    if (activeYearNumber !== null) {
      initialize();
    }
  }, [initialize, activeYearNumber]);
  let pageTitle = 'Plan WNMZ';
  if (activeYearNumber !== null) {
    const yearLabel = ROMAN_NUMERALS[activeYearNumber - 1] || activeYearNumber;
    const semester = semesters.find(s => s.id === activeSemesterId);
    const semText = semester ? `| ${semester.label}` : '';
    const filteredGroups = activeGroups.filter(g => g !== 'GW');
    const groupText = filteredGroups.length > 0 ? `| ${filteredGroups.join(', ')}` : '| Wszystkie grupy';
    pageTitle = `Plan Zajęć | Lekarski | ${yearLabel} Rok ${semText} ${groupText}`;
  }

  useEffect(() => {
    document.title = pageTitle;
    
    // Niezawodny bloker dla Next.js, który lubi nadpisywać title przy popstate / navigacji
    const interval = setInterval(() => {
      if (document.title !== pageTitle) {
        document.title = pageTitle;
      }
    }, 50);

    return () => clearInterval(interval);
  }, [pageTitle]);

  if (activeYearNumber === null) {
    return <HomeSelector />;
  }

  return (
    <>
      <div className="hideOnPrint">
        <Header />
        <GroupSelector />
        <main className="main-content">
          <SubjectFilters />
          {isLoading && (
            <div className="loading-state">
              <div className="loading-spinner" />
              <span>Ładowanie planu zajęć…</span>
            </div>
          )}
          {error && (
            <div className="error-state">
              <span>⚠️ {error}</span>
            </div>
          )}
          {!isLoading && !error && (
            <CalendarView />
          )}
        </main>
        <Footer />
        <EventModal />
      </div>
      <PdfExportView />
    </>
  );
}
