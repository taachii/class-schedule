'use client';

import { useEffect } from 'react';
import { useScheduleStore } from '@/store/scheduleStore';
import Header from '@/components/Header/Header';
import SubjectFilters from '@/components/SubjectFilters/SubjectFilters';
import CalendarView from '@/components/CalendarView/CalendarView';
import EventModal from '@/components/EventModal/EventModal';

export default function SchedulePage() {
  const { initialize, isLoading, error } = useScheduleStore();

  useEffect(() => {
    initialize();
  }, [initialize]);

  return (
    <>
      <Header />
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
      <EventModal />
    </>
  );
}
