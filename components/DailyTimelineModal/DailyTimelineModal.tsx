import { useEffect, useRef } from 'react';
import type { EnrichedEvent } from '@/types/schedule';
import styles from './DailyTimelineModal.module.css';

interface DailyTimelineModalProps {
  dateStr: string;
  events: EnrichedEvent[];
  onClose: () => void;
}

import { useScheduleStore } from '@/store/scheduleStore';

export default function DailyTimelineModal({ dateStr, events, onClose }: DailyTimelineModalProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { eventTypes } = useScheduleStore();

  // Prevent background scrolling
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  const formatDate = (date: string) => {
    const d = new Date(date);
    return d.toLocaleDateString('pl-PL', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  };

  // Determine timeline bounds
  const minHour = Math.min(7, ...events.map(e => parseInt(e.time_start.split(':')[0])));
  const maxHour = Math.max(20, ...events.map(e => parseInt(e.time_end.split(':')[0])));
  const totalHours = maxHour - minHour + 2; // +2 to add some padding at the end

  // Calculate event positions (1px = 1 minute)
  const PIXELS_PER_MINUTE = 1.2;
  const PIXELS_PER_HOUR = 60 * PIXELS_PER_MINUTE;

  const getEventStyle = (ev: EnrichedEvent) => {
    const [startH, startM] = ev.time_start.split(':').map(Number);
    const [endH, endM] = ev.time_end.split(':').map(Number);
    
    const startMinutes = (startH - minHour) * 60 + startM;
    const endMinutes = (endH - minHour) * 60 + endM;
    const duration = endMinutes - startMinutes;

    return {
      top: `${startMinutes * PIXELS_PER_MINUTE}px`,
      height: `${duration * PIXELS_PER_MINUTE}px`,
      background: `linear-gradient(135deg, var(--bg-${ev.subject.color}), var(--bg-${ev.subject.color}-end, var(--bg-${ev.subject.color})))`,
      borderColor: `var(--border-${ev.subject.color}, var(--bg-${ev.subject.color}))`
    };
  };

  const getEventTypeLabel = (code: string) => {
    return eventTypes.find(t => t.code === code)?.label ?? code;
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <div className={styles.header}>
          <div>
            <h2 className={styles.title}>Rozkład dnia</h2>
            <p className={styles.subtitle}>{formatDate(dateStr)}</p>
          </div>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Zamknij">✕</button>
        </div>

        <div className={styles.body} ref={containerRef}>
          {events.length === 0 ? (
            <div className={styles.emptyState}>
              <p>Brak zaplanowanych zajęć w tym dniu.</p>
            </div>
          ) : (
            <div className={styles.timelineContainer} style={{ height: `${totalHours * PIXELS_PER_HOUR}px` }}>
              {/* Render hour lines */}
              {Array.from({ length: totalHours }).map((_, i) => (
                <div key={i} className={styles.hourLine} style={{ top: `${i * PIXELS_PER_HOUR}px` }}>
                  <span className={styles.hourLabel}>{String(minHour + i).padStart(2, '0')}:00</span>
                  <div className={styles.line}></div>
                </div>
              ))}

              {/* Render events */}
              <div className={styles.eventsLayer}>
                {events.map(ev => (
                  <div key={ev.id} className={styles.eventBlock} style={getEventStyle(ev)}>
                    <div className={styles.eventContent}>
                      <div className={styles.eventHeader}>
                        <span className={styles.eventTime}>{ev.timeStartShort} - {ev.timeEndShort}</span>
                        <span className={styles.eventType}>{getEventTypeLabel(ev.type)}</span>
                      </div>
                      <h3 className={styles.eventName}>{ev.subject.label}</h3>
                      <div className={styles.eventDetails}>
                        {ev.resolvedLocation && (
                          <div className={styles.detailRow}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                            <span>{ev.resolvedLocation}</span>
                          </div>
                        )}
                        {ev.subject.contact && (
                          <div className={styles.detailRow}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
                            <span>{ev.subject.contact}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
