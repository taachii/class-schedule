'use client';

import { useScheduleStore } from '@/store/scheduleStore';
import styles from './PdfExportView.module.css';

const DOW_NAMES = ['Poniedziałek', 'Wtorek', 'Środa', 'Czwartek', 'Piątek'];

function toIso(year: number, month: number, day: number) {
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

export default function PdfExportView() {
  const { currentYear, currentMonth, enrichedEvents, activeGroups, eventTypes } = useScheduleStore();

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  
  // Group days into weeks (Mon-Fri)
  const weeks: Array<Array<{ day: number; dateStr: string } | null>> = [];
  let currentWeek: Array<{ day: number; dateStr: string } | null> = [null, null, null, null, null];
  
  for (let d = 1; d <= daysInMonth; d++) {
    const dateObj = new Date(currentYear, currentMonth, d);
    const dow = dateObj.getDay(); // 0=Sun, 1=Mon, ..., 6=Sat
    
    if (dow >= 1 && dow <= 5) {
      currentWeek[dow - 1] = { 
        day: d, 
        dateStr: toIso(currentYear, currentMonth + 1, d) 
      };
    }
    
    if (dow === 0) { // Sunday ends the week
      // Only push if there are any days in this week belonging to the month
      if (currentWeek.some(day => day !== null)) {
        weeks.push(currentWeek);
        currentWeek = [null, null, null, null, null];
      }
    }
  }
  // Push the last week if it has days
  if (currentWeek.some(day => day !== null)) {
    weeks.push(currentWeek);
  }

  // Filter events for current month
  const monthEvents = enrichedEvents.filter(e => {
    const [y, m] = e.date.split('-');
    return parseInt(y) === currentYear && parseInt(m) === currentMonth + 1;
  });

  // Determine global min and max hours for the whole month to keep layout consistent across pages
  // Default to 8:00 - 16:00 if no events
  let minHour = 8;
  let maxHour = 16;

  if (monthEvents.length > 0) {
    const rawMin = Math.min(...monthEvents.map(e => parseInt(e.time_start.split(':')[0])));
    const rawMax = Math.max(...monthEvents.map(e => {
      const [h, m] = e.time_end.split(':').map(Number);
      return m > 0 ? h + 1 : h;
    }));
    minHour = Math.max(6, rawMin - 1); // Start slightly before
    maxHour = Math.min(22, rawMax + 1); // End slightly after
  }

  const totalHours = maxHour - minHour;
  const hoursList = Array.from({ length: totalHours }, (_, i) => minHour + i);

  const getEventStyle = (ev: any, col: number, totalCols: number): React.CSSProperties => {
    const [sH, sM] = ev.time_start.split(':').map(Number);
    const [eH, eM] = ev.time_end.split(':').map(Number);
    const startMin = (sH - minHour) * 60 + sM;
    const durMin = (eH - minHour) * 60 + eM - startMin;
    const totalMins = totalHours * 60;
    
    const topPercent = (startMin / totalMins) * 100;
    const heightPercent = (durMin / totalMins) * 100;

    const colWidth = 100 / totalCols;

    return {
      top: `${topPercent}%`,
      height: `${heightPercent}%`,
      left: `${col * colWidth}%`,
      width: `${colWidth}%`,
      '--ev-color': ev.subject?.color || '#eee',
      backgroundColor: ev.subject?.color || '#eee'
    } as React.CSSProperties;
  };

  const getTypeLabel = (code: string) => eventTypes.find(t => t.code === code)?.label ?? code;

  const monthName = new Date(currentYear, currentMonth).toLocaleDateString('pl-PL', { month: 'long', year: 'numeric' });
  const titleStr = `Plan zajęć - ${activeGroups.join(', ')} - ${monthName.charAt(0).toUpperCase() + monthName.slice(1)}`;

  return (
    <div className={`${styles.printOnly} printOnlyContainer`}>
      {weeks.map((week, wIdx) => {
        // Collect all events for this week
        const weekEventsByDay: Record<number, any[]> = { 0: [], 1: [], 2: [], 3: [], 4: [] };
        
        week.forEach((dayObj, dowIdx) => {
          if (dayObj) {
            weekEventsByDay[dowIdx] = monthEvents.filter(e => e.date === dayObj.dateStr);
          }
        });

        return (
          <div key={wIdx} className={styles.page}>
            <div className={styles.title}>{titleStr}</div>
            <div className={styles.subtitle}>
              Tydzień {wIdx + 1}: {week.find(d => d !== null)?.dateStr} - {week.slice().reverse().find(d => d !== null)?.dateStr}
            </div>

            <div className={styles.grid}>
              {/* Header row */}
              <div className={styles.headerCell}>Godzina</div>
              {DOW_NAMES.map((name, i) => (
                <div key={i} className={styles.headerCell}>
                  {name} {week[i] ? `(${week[i]!.day})` : ''}
                </div>
              ))}
              <div className={styles.headerCell}>Godzina</div>

              {/* Body */}
              <div className={styles.bodyRow}>
                {/* Left Hours */}
                <div className={styles.hourColumn}>
                  {hoursList.map(h => (
                    <div key={h} className={styles.hourCell}>{h}:00 - {h+1}:00</div>
                  ))}
                </div>

                {/* Days Columns */}
                {week.map((dayObj, dowIdx) => {
                  const dayEvents = weekEventsByDay[dowIdx] || [];
                  // Collision calculation
                  const sorted = [...dayEvents].sort((a, b) => a.time_start.localeCompare(b.time_start));
                  const columns: { ev: any; col: number; totalCols: number }[] = [];
                  const active: { ev: any; col: number }[] = [];

                  sorted.forEach(ev => {
                    const starts = ev.time_start;
                    const stillActive = active.filter(a => a.ev.time_end > starts);
                    active.length = 0;
                    active.push(...stillActive);

                    const usedCols = new Set(active.map(a => a.col));
                    let col = 0;
                    while (usedCols.has(col)) col++;
                    active.push({ ev, col });
                    columns.push({ ev, col, totalCols: 0 });
                  });

                  columns.forEach((item) => {
                    const overlapping = columns.filter(other =>
                      other.ev.time_start < item.ev.time_end && other.ev.time_end > item.ev.time_start
                    );
                    const maxCol = Math.max(...overlapping.map(o => o.col)) + 1;
                    item.totalCols = maxCol;
                  });

                  // Normalize totalCols
                  columns.forEach((item) => {
                    const overlapping = columns.filter(other =>
                      other.ev.time_start < item.ev.time_end && other.ev.time_end > item.ev.time_start
                    );
                    const localMax = Math.max(...overlapping.map(o => o.totalCols));
                    item.totalCols = localMax;
                  });

                  return (
                    <div key={dowIdx} className={styles.dayColumn}>
                      {/* Background grid lines */}
                      <div className={styles.gridLines}>
                        {hoursList.map(h => (
                          <div key={h} className={styles.gridLine}></div>
                        ))}
                      </div>

                      {/* Events */}
                      {columns.map(({ ev, col, totalCols }) => {
                        const isExam = ev.type === 'E';
                        const examTermInfo = isExam && ev.exam_term ? ` - Termin ${ev.exam_term}` : '';

                        return (
                          <div 
                            key={ev.id} 
                            className={styles.eventBlock}
                            style={getEventStyle(ev, col, totalCols)}
                          >
                            <div className={styles.eventTime}>{ev.time_start.slice(0,5)} - {ev.time_end.slice(0,5)}</div>
                            <div className={styles.eventName}>{ev.subject?.label}</div>
                            <div className={styles.eventMeta}>
                              {ev.resolvedLocation && <div>{ev.resolvedLocation}</div>}
                              {ev.resolvedProfessors && ev.resolvedProfessors.length > 0 && (
                                <div>{ev.resolvedProfessors[0].professor}</div>
                              )}
                            </div>
                            <div className={styles.eventBadge}>
                              {isExam ? `EGZAMIN${examTermInfo}` : getTypeLabel(ev.type)}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  );
                })}

                {/* Right Hours */}
                <div className={styles.hourColumn}>
                  {hoursList.map(h => (
                    <div key={h} className={styles.hourCell}>{h}:00 - {h+1}:00</div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
