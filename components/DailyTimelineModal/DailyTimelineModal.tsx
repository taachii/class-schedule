import { useEffect, useRef, useState } from 'react';
import type { EnrichedEvent } from '@/types/schedule';
import { useScheduleStore } from '@/store/scheduleStore';
import styles from './DailyTimelineModal.module.css';

interface DailyTimelineModalProps {
  dateStr: string;
  events: EnrichedEvent[];
  onClose: () => void;
}

function useIsMobile(breakpoint = 768) {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= breakpoint);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, [breakpoint]);
  return isMobile;
}

export default function DailyTimelineModal({ dateStr, events, onClose }: DailyTimelineModalProps) {
  const bodyRef = useRef<HTMLDivElement>(null);
  const { eventTypes } = useScheduleStore();
  const [selectedEvent, setSelectedEvent] = useState<EnrichedEvent | null>(null);
  const isMobile = useIsMobile();

  // More space per minute on mobile so short events aren't crushed
  const PIXELS_PER_MINUTE = isMobile ? 2.6 : 1.8;
  const PIXELS_PER_HOUR = 60 * PIXELS_PER_MINUTE;

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    
    // Hardware back button support: push state on mount
    window.history.pushState({ isModal: 'timeline' }, '');
    
    return () => { 
      document.body.style.overflow = ''; 
      if (window.history.state?.isModal === 'timeline') {
        window.history.back();
      }
    };
  }, []);

  useEffect(() => {
    const handlePopState = () => {
      if (selectedEvent) {
        // If sub-modal is open, just close it and replenish the history state
        setSelectedEvent(null);
        window.history.pushState({ isModal: 'timeline' }, '');
      } else {
        // Close the main modal
        onClose();
      }
    };
    
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [selectedEvent, onClose]);

  // Auto-scroll to first event on mount
  useEffect(() => {
    if (bodyRef.current && events.length > 0) {
      const firstStart = Math.min(...events.map(e => {
        const [h, m] = e.time_start.split(':').map(Number);
        return (h - minHour) * PIXELS_PER_HOUR + m * PIXELS_PER_MINUTE;
      }));
      bodyRef.current.scrollTop = Math.max(0, firstStart - 20);
    }
  });

  const formatDate = (iso: string) => {
    const d = new Date(iso + 'T00:00:00');
    const dayName = d.toLocaleDateString('pl-PL', { weekday: 'long' });
    const rest = d.toLocaleDateString('pl-PL', { day: 'numeric', month: 'long', year: 'numeric' });
    return `${dayName.charAt(0).toUpperCase() + dayName.slice(1)}, ${rest}`;
  };

  const getTypeLabel = (code: string) =>
    eventTypes.find(t => t.code === code)?.label ?? code;

  // Timeline range: 1h before first event to 1h after last, clamped 6–23
  const rawMin = events.length > 0
    ? Math.min(...events.map(e => parseInt(e.time_start.split(':')[0])))
    : 8;
  const rawMax = events.length > 0
    ? Math.max(...events.map(e => {
        const [h, m] = e.time_end.split(':').map(Number);
        return m > 0 ? h + 1 : h;
      }))
    : 16;
  const minHour = Math.max(6, rawMin - 1);
  const maxHour = Math.min(23, rawMax + 1);
  const totalHours = maxHour - minHour;

  const getBlockStyle = (ev: EnrichedEvent): React.CSSProperties => {
    const [sH, sM] = ev.time_start.split(':').map(Number);
    const [eH, eM] = ev.time_end.split(':').map(Number);
    const topMin = (sH - minHour) * 60 + sM;
    const durMin = (eH - minHour) * 60 + eM - topMin;
    const height = durMin * PIXELS_PER_MINUTE;
    return {
      top: `${topMin * PIXELS_PER_MINUTE}px`,
      height: `${height}px`,
      '--ev-color': ev.subject.color,
    } as React.CSSProperties;
  };

  // Detect overlapping events for column layout
  const sorted = [...events].sort((a, b) => a.time_start.localeCompare(b.time_start));
  const columns: { ev: EnrichedEvent; col: number; totalCols: number }[] = [];
  const active: { ev: EnrichedEvent; col: number }[] = [];

  sorted.forEach(ev => {
    // Remove events that have ended
    const starts = ev.time_start;
    const stillActive = active.filter(a => a.ev.time_end > starts);
    active.length = 0;
    active.push(...stillActive);

    // Find first free column
    const usedCols = new Set(active.map(a => a.col));
    let col = 0;
    while (usedCols.has(col)) col++;
    active.push({ ev, col });
    columns.push({ ev, col, totalCols: 0 }); // totalCols filled later
  });

  // Second pass: compute totalCols for each group
  columns.forEach((item, idx) => {
    // Find all events that overlap with this one
    const overlapping = columns.filter(other =>
      other.ev.time_start < item.ev.time_end && other.ev.time_end > item.ev.time_start
    );
    const maxCol = Math.max(...overlapping.map(o => o.col)) + 1;
    overlapping.forEach(o => {
      const entry = columns.find(c => c.ev.id === o.ev.id);
      if (entry) entry.totalCols = Math.max(entry.totalCols, maxCol);
    });
  });

  const getDurationLabel = (ev: EnrichedEvent) => {
    const [sH, sM] = ev.time_start.split(':').map(Number);
    const [eH, eM] = ev.time_end.split(':').map(Number);
    const dur = (eH * 60 + eM) - (sH * 60 + sM);
    const h = Math.floor(dur / 60);
    const m = dur % 60;
    if (h > 0 && m > 0) return `${h}h ${m}min`;
    if (h > 0) return `${h}h`;
    return `${m}min`;
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <h2 className={styles.title}>Rozkład dnia</h2>
            <p className={styles.subtitle}>{formatDate(dateStr)}</p>
            {events.length > 0 && (
              <span className={styles.eventCount}>
                {events.length} {events.length === 1 ? 'zajęcie' : events.length < 5 ? 'zajęcia' : 'zajęć'}
              </span>
            )}
          </div>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Zamknij">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className={styles.body} ref={bodyRef}>
          {events.length === 0 ? (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>📭</div>
              <p>Brak zaplanowanych zajęć</p>
              <span>Ten dzień jest wolny od zajęć dydaktycznych.</span>
            </div>
          ) : (
            <div className={styles.timeline} style={{ height: `${totalHours * PIXELS_PER_HOUR}px` }}>
              {/* Hour grid */}
              {Array.from({ length: totalHours + 1 }).map((_, i) => {
                const hour = minHour + i;
                return (
                  <div key={hour} className={styles.hourRow} style={{ top: `${i * PIXELS_PER_HOUR}px` }}>
                    <span className={styles.hourLabel}>{String(hour).padStart(2, '0')}:00</span>
                    <div className={styles.hourLine} />
                  </div>
                );
              })}

              {/* 15-min sub-gridlines */}
              {Array.from({ length: totalHours * 4 }).map((_, i) => {
                if (i % 4 === 0) return null; // skip full hours, already drawn
                return (
                  <div
                    key={`q${i}`}
                    className={styles.quarterLine}
                    style={{ top: `${i * 15 * PIXELS_PER_MINUTE}px` }}
                  />
                );
              })}

              {/* Event blocks */}
              <div className={styles.eventsLayer}>
                {columns.map(({ ev, col, totalCols }) => {
                  const colWidth = 100 / Math.max(totalCols, 1);
                  
                  const [sH, sM] = ev.time_start.split(':').map(Number);
                  const [eH, eM] = ev.time_end.split(':').map(Number);
                  const durMin = (eH - minHour) * 60 + eM - ((sH - minHour) * 60 + sM);
                  const blockHeight = durMin * PIXELS_PER_MINUTE;
                  
                  const hasDepartment = !!(ev.department || ev.subject.department);
                  const hasLocation = !!ev.resolvedLocation;
                  const hasContact = !!ev.subject.contact;
                  const hasNotes = !!ev.notes;
                  const hasAnyMeta = true; // Because we always show professor fallback
                  const showMetaInline = blockHeight >= 120;

                  return (
                    <div
                      key={ev.id}
                      className={styles.eventBlock}
                      style={{
                        ...getBlockStyle(ev),
                        left: `${col * colWidth}%`,
                        width: `${colWidth - 1}%`,
                      }}
                    >
                      <div className={styles.eventInner}>
                        <div className={styles.eventTop}>
                          <span className={styles.eventTime}>{ev.timeStartShort} – {ev.timeEndShort} <span className={styles.eventDuration}>({getDurationLabel(ev)})</span></span>
                          <span className={styles.eventBadge}>{getTypeLabel(ev.type)}</span>
                        </div>
                        <h3 className={styles.eventName}>{ev.subject.label}</h3>
                        
                        {hasAnyMeta && (
                          showMetaInline ? (
                            <div className={styles.eventMeta}>
                              {(ev.department || ev.subject.department) && (
                                <span className={styles.metaItem}>
                                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
                                  {ev.department || ev.subject.department}
                                </span>
                              )}
                              {ev.resolvedLocation && (
                                <span className={styles.metaItem}>
                                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
                                  {ev.resolvedLocation}
                                </span>
                              )}
                              {ev.subject.contact && (
                                <span className={styles.metaItem}>
                                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                                  {ev.subject.contact}
                                </span>
                              )}
                              {ev.notes && (
                                <span className={styles.metaItem}>
                                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
                                  {ev.notes}
                                </span>
                              )}
                              <span className={styles.metaItem}>
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                                {ev.professor || 'Prowadzący: nie wyznaczono'}
                              </span>
                            </div>
                          ) : (
                            <button 
                              className={styles.expandBtn} 
                              onClick={(e) => { e.stopPropagation(); setSelectedEvent(ev); }}
                              title="Pokaż szczegóły"
                            >
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/></svg>
                              Szczegóły
                            </button>
                          )
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Current time indicator */}
              <CurrentTimeIndicator dateStr={dateStr} minHour={minHour} pxPerMin={PIXELS_PER_MINUTE} />
            </div>
          )}
        </div>
      </div>

      {/* Sub-modal for details */}
      {selectedEvent && (
        <div className={styles.subModalOverlay} onClick={(e) => { e.stopPropagation(); setSelectedEvent(null); }}>
          <div className={styles.subModal} onClick={e => e.stopPropagation()}>
            <div className={styles.subHeader} style={{ borderLeftColor: selectedEvent.subject.color }}>
              <div>
                <div className={styles.subTitle}>{selectedEvent.subject.label}</div>
                <div className={styles.subTime}>{selectedEvent.timeStartShort} – {selectedEvent.timeEndShort} <span className={styles.eventDuration}>({getDurationLabel(selectedEvent)})</span></div>
              </div>
              <button className={styles.closeBtn} onClick={() => setSelectedEvent(null)}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
            <div className={styles.subBody}>
              <span className={styles.eventBadge} style={{ '--ev-color': selectedEvent.subject.color } as any}>{getTypeLabel(selectedEvent.type)}</span>
              
              <div className={styles.subMetaList}>
                {(selectedEvent.department || selectedEvent.subject.department) && (
                  <div className={styles.subMetaItem}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
                    <span>{selectedEvent.department || selectedEvent.subject.department}</span>
                  </div>
                )}
                {selectedEvent.resolvedLocation && (
                  <div className={styles.subMetaItem}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
                    <span>{selectedEvent.resolvedLocation}</span>
                  </div>
                )}
                {selectedEvent.subject.contact && (
                  <div className={styles.subMetaItem}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                    <span>{selectedEvent.subject.contact}</span>
                  </div>
                )}
                {selectedEvent.notes && (
                  <div className={styles.subMetaItem}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
                    <span>{selectedEvent.notes}</span>
                  </div>
                )}
                <div className={styles.subMetaItem}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                  <span>{selectedEvent.professor || 'Prowadzący: nie wyznaczono'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function CurrentTimeIndicator({ dateStr, minHour, pxPerMin }: { dateStr: string; minHour: number; pxPerMin: number }) {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  if (todayStr !== dateStr) return null;

  const minutes = (now.getHours() - minHour) * 60 + now.getMinutes();
  if (minutes < 0) return null;

  return (
    <div className={styles.nowLine} style={{ top: `${minutes * pxPerMin}px` }}>
      <div className={styles.nowDot} />
      <div className={styles.nowRule} />
    </div>
  );
}
