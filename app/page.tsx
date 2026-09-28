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

  useEffect(() => {
    if (activeYearNumber === null) {
      document.title = 'Plan Zajęć – I Rok Lekarski | SUM Zabrze 2026/2027';
      return;
    }

    const yearLabel = ROMAN_NUMERALS[activeYearNumber - 1] || activeYearNumber;
    const semester = semesters.find(s => s.id === activeSemesterId);
    const semText = semester ? `| ${semester.label}` : '';
    const groupText = activeGroups.length > 0 ? `| ${activeGroups.join(', ')}` : '| Wszystkie grupy';

    document.title = `Plan Zajęć | Lekarski | ${yearLabel} Rok ${semText} ${groupText}`;
  }, [activeYearNumber, activeSemesterId, activeGroups, semesters]);

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
