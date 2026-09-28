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

export default function SchedulePage() {
  const { activeYearNumber, initialize, isLoading, error } = useScheduleStore();

  useEffect(() => {
    if (activeYearNumber !== null) {
      initialize();
    }
  }, [initialize, activeYearNumber]);

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
