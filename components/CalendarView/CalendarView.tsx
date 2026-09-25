'use client';

import { useState } from 'react';
import { useScheduleStore } from '@/store/scheduleStore';
import { ACADEMIC_PERIODS, PeriodType } from '@/config/academicPeriods';
import type { EnrichedEvent } from '@/types/schedule';
import AdminEventModal from '../AdminEventModal/AdminEventModal';
import DailyTimelineModal from '../DailyTimelineModal/DailyTimelineModal';
import styles from './CalendarView.module.css';

const MONTH_NAMES_PL = [
  'Styczeń', 'Luty', 'Marzec', 'Kwiecień', 'Maj', 'Czerwiec',
  'Lipiec', 'Sierpień', 'Wrzesień', 'Październik', 'Listopad', 'Grudzień',
];
const DAY_NAMES_PL = ['Pon', 'Wt', 'Śr', 'Czw', 'Pt', 'Sob', 'Nd'];

function toIso(year: number, month: number, day: number): string {
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

// Check period priority - higher index = higher priority for overlapping ranges
const PERIOD_PRIORITIES: Record<PeriodType, number> = {
  teaching: 1,
  summer_holidays: 2,
  break: 3,
  exam: 4,
  makeup_exam: 5,
  holiday: 6
};

interface CalendarViewProps {
  onEventClick?: (event: EnrichedEvent) => void;
}

export default function CalendarView({ onEventClick }: CalendarViewProps) {
  const { enrichedEvents, activeSubjectKeys, currentYear, currentMonth, setMonth, isAdmin, initialize, semesters, activeSemesterId } = useScheduleStore();
  const [selectedEvent, setSelectedEvent] = useState<EnrichedEvent | null>(null);
  const [adminAddDate, setAdminAddDate] = useState<string | null>(null);
  const [timelineDate, setTimelineDate] = useState<string | null>(null);

  const filtered = enrichedEvents.filter(ev => activeSubjectKeys.has(ev.subject_key));
  const activeSemester = semesters.find(s => s.id === activeSemesterId);

  const academicYearLabel = activeSemester?.academic_year_label || '';
  const periods = ACADEMIC_PERIODS[academicYearLabel] || [];

  let minYear = currentYear, minMonth = 0;
  let maxYear = currentYear, maxMonth = 11;
  if (activeSemester) {
    const baseYear = parseInt(activeSemester.academic_year_label.split('/')[0]);
    if (activeSemester.semester_no === 1) {
      minYear = baseYear; minMonth = 9;
      maxYear = baseYear + 1; maxMonth = 2;
    } else {
      minYear = baseYear + 1; minMonth = 1;
      maxYear = baseYear + 1; maxMonth = 8;
    }
  }

  const isPrevDisabled = currentYear < minYear || (currentYear === minYear && currentMonth <= minMonth);
  const isNextDisabled = currentYear > maxYear || (currentYear === maxYear && currentMonth >= maxMonth);

  const prevMonth = () => {
    if (isPrevDisabled) return;
    let m = currentMonth - 1;
    let y = currentYear;
    if (m < 0) { m = 11; y--; }
    setMonth(y, m);
  };

  const nextMonth = () => {
    if (isNextDisabled) return;
    let m = currentMonth + 1;
    let y = currentYear;
    if (m > 11) { m = 0; y++; }
    setMonth(y, m);
  };

  const firstDay = new Date(currentYear, currentMonth, 1);
  let startDow = firstDay.getDay();
  startDow = startDow === 0 ? 6 : startDow - 1; // Mon-based

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const daysInPrev = new Date(currentYear, currentMonth, 0).getDate();

  const today = new Date();
  const todayStr = toIso(today.getFullYear(), today.getMonth() + 1, today.getDate());

  // Build date → events map
  const byDate: Record<string, EnrichedEvent[]> = {};
  filtered.forEach(ev => {
    if (!byDate[ev.date]) byDate[ev.date] = [];
    byDate[ev.date].push(ev);
  });

  const totalCells = Math.ceil((startDow + daysInMonth) / 7) * 7;
  const cells = [];

  for (let i = 0; i < totalCells; i++) {
    let day: number, month: number, year: number, isOther = false;

    if (i < startDow) {
      day = daysInPrev - startDow + i + 1;
      month = currentMonth === 0 ? 12 : currentMonth;
      year = currentMonth === 0 ? currentYear - 1 : currentYear;
      isOther = true;
    } else if (i >= startDow + daysInMonth) {
      day = i - startDow - daysInMonth + 1;
      month = currentMonth === 11 ? 1 : currentMonth + 2;
      year = currentMonth === 11 ? currentYear + 1 : currentYear;
      isOther = true;
    } else {
      day = i - startDow + 1;
      month = currentMonth + 1;
      year = currentYear;
    }

    const dateStr = toIso(year, month, day);
    const d = new Date(year, month - 1, day);
    const dow = d.getDay();
    const isWeekend = dow === 0 || dow === 6;
    const isToday = dateStr === todayStr;
    const dayEvents = (byDate[dateStr] ?? []).sort((a, b) =>
      a.time_start.localeCompare(b.time_start)
    );

    // Find active period for this date
    let activePeriod = null;
    let maxPriority = -1;
    for (const p of periods) {
      if (dateStr >= p.startDate && dateStr <= p.endDate) {
        const priority = PERIOD_PRIORITIES[p.type] || 0;
        if (priority > maxPriority) {
          maxPriority = priority;
          activePeriod = p;
        }
      }
    }

    const periodClass = activePeriod ? styles[`period_${activePeriod.type}`] : '';

    cells.push(
      <div
        key={dateStr + i}
        className={[
          styles.day,
          periodClass,
          isOther ? styles.otherMonth : '',
          isToday ? styles.today : '',
          isWeekend ? styles.weekend : '',
          styles.dayClickable
        ].filter(Boolean).join(' ')}
        onClick={() => {
          if (isAdmin) {
            setAdminAddDate(dateStr);
          } else {
            setTimelineDate(dateStr);
          }
        }}
      >
        <div className={styles.dayNum} title={activePeriod?.label}>{day}</div>
        <div className={styles.events}>
          {dayEvents.map(ev => (
            <div
              key={ev.id}
              className={styles.eventChip}
              style={{ '--ev-color': ev.subject.color } as React.CSSProperties}
              title={`${ev.subject.label} (${ev.timeStartShort}–${ev.timeEndShort})`}
              onClick={(e) => {
                if (isAdmin) {
                  e.stopPropagation();
                  setSelectedEvent(ev);
                }
                // For non-admins, it bubbles up to the day cell and opens the timeline
              }}
            >
                <span className={styles.chipTime}>{ev.timeStartShort} </span>
                <span className={styles.chipText}>{ev.subject.short_label} [{ev.type}]</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={styles.wrapper}>
      {/* Navigation */}
      <div className={styles.nav}>
        <button 
          className={styles.navBtn} 
          onClick={prevMonth} 
          disabled={isPrevDisabled}
          style={{ opacity: isPrevDisabled ? 0.3 : 1, cursor: isPrevDisabled ? 'not-allowed' : 'pointer' }}
          aria-label="Poprzedni miesiąc"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6"></polyline>
          </svg>
        </button>
        <h2 className={styles.monthTitle}>{MONTH_NAMES_PL[currentMonth]} {currentYear}</h2>
        <button 
          className={styles.navBtn} 
          onClick={nextMonth} 
          disabled={isNextDisabled}
          style={{ opacity: isNextDisabled ? 0.3 : 1, cursor: isNextDisabled ? 'not-allowed' : 'pointer' }}
          aria-label="Następny miesiąc"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6"></polyline>
          </svg>
        </button>
      </div>

      {/* Grid */}
      <div className={styles.gridWrapper}>
        <div className={styles.grid}>
          {DAY_NAMES_PL.map((d, i) => (
            <div key={d} className={`${styles.headerCell} ${i >= 5 ? styles.weekend : ''}`}>{d}</div>
          ))}
          {cells}
        </div>
      </div>

      {/* Admin Add Modal */}
      {isAdmin && adminAddDate && (
        <AdminEventModal 
          initialDate={adminAddDate} 
          onClose={() => setAdminAddDate(null)} 
          onSuccess={() => { setAdminAddDate(null); initialize(); }} 
        />
      )}

      {/* Daily Timeline Modal */}
      {!isAdmin && timelineDate && (
        <DailyTimelineModal
          dateStr={timelineDate}
          events={byDate[timelineDate] ?? []}
          onClose={() => setTimelineDate(null)}
        />
      )}

      {/* Admin Edit Modal */}
      {isAdmin && selectedEvent && (
        <AdminEventModal 
          initialEvent={selectedEvent} 
          onClose={() => setSelectedEvent(null)} 
          onSuccess={() => { setSelectedEvent(null); initialize(); }} 
        />
      )}

      {/* User View Modal */}
      {!isAdmin && selectedEvent && (
        <EventDetailModal event={selectedEvent} onClose={() => setSelectedEvent(null)} />
      )}
    </div>
  );
}

// Inline modal used within the calendar view
function EventDetailModal({ event, onClose }: { event: EnrichedEvent; onClose: () => void }) {
  const { eventTypes } = useScheduleStore();
  const typeLabel = eventTypes.find(t => t.code === event.type)?.label ?? event.type;
  const d = new Date(event.date + 'T00:00:00');
  const dayName = d.toLocaleDateString('pl-PL', { weekday: 'long' });
  const dateStr = d.toLocaleDateString('pl-PL', { day: '2-digit', month: 'long', year: 'numeric' });

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalCard} onClick={e => e.stopPropagation()}>
        <button className={styles.modalClose} onClick={onClose}>✕</button>
        <div className={styles.modalHeader} style={{ borderBottomColor: event.subject.color + '66' }}>
          <span
            className={styles.typeBadge}
            style={{ background: event.subject.color + '33', color: event.subject.color }}
          >
            {typeLabel}
          </span>
          <h3 className={styles.modalTitle}>{event.subject.label}</h3>
          <div className={styles.modalDate}>
            {dayName.charAt(0).toUpperCase() + dayName.slice(1)}, {dateStr}
          </div>
        </div>
        <div className={styles.modalBody}>
          {[
            { icon: '🕐', label: 'Godziny', value: `${event.timeStartShort} – ${event.timeEndShort}` },
            { 
              icon: '👥', 
              label: 'Grupy', 
              value: (event.exercise_groups.length > 0 ? event.exercise_groups : event.seminar_groups).join(', ') 
            },
            { icon: '📍', label: 'Miejsce', value: event.resolvedLocation },
            event.subject.contact ? { icon: '✉️', label: 'Kontakt', value: event.subject.contact, isEmail: true } : null,
            event.notes ? { icon: '📝', label: 'Uwagi', value: event.notes } : null,
          ].filter(Boolean).map((row: any) => (
            <div key={row.label} className={styles.infoRow}>
              <span className={styles.infoIcon}>{row.icon}</span>
              <div className={styles.infoContent}>
                <div className={styles.infoLabel}>{row.label}</div>
                <div className={styles.infoValue}>
                  {row.isEmail
                    ? <a href={`mailto:${row.value}`} className={styles.emailLink}>{row.value}</a>
                    : row.value}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
