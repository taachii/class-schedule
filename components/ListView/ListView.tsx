'use client';

import { useState } from 'react';
import { useScheduleStore } from '@/store/scheduleStore';
import type { EnrichedEvent } from '@/types/schedule';
import styles from './ListView.module.css';

export default function ListView() {
  const { enrichedEvents, subjects, activeSubjectKeys, eventTypes } = useScheduleStore();
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());

  const filtered = enrichedEvents.filter(ev => activeSubjectKeys.has(ev.subject_key));

  // Group by subject
  const bySubject: Record<string, EnrichedEvent[]> = {};
  subjects.forEach(s => { bySubject[s.key] = []; });
  filtered.forEach(ev => {
    if (bySubject[ev.subject_key]) bySubject[ev.subject_key].push(ev);
  });

  const toggleCollapse = (key: string) => {
    setCollapsed(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const visibleSubjects = subjects.filter(s => bySubject[s.key]?.length > 0);

  if (!visibleSubjects.length) {
    return (
      <div className={styles.empty}>Brak zajęć spełniających kryteria filtrowania.</div>
    );
  }

  return (
    <div className={styles.wrapper}>
      {visibleSubjects.map(subj => {
        const evs = [...bySubject[subj.key]].sort((a, b) =>
          a.date.localeCompare(b.date) || a.time_start.localeCompare(b.time_start)
        );
        const isCollapsed = collapsed.has(subj.key);

        return (
          <div key={subj.key} className={`${styles.block} ${isCollapsed ? styles.collapsed : ''}`}>
            <div className={styles.blockHeader} onClick={() => toggleCollapse(subj.key)}>
              <div className={styles.colorBar} style={{ background: subj.color }} />
              <div className={styles.blockTitle}>{subj.label}</div>
              <div className={styles.blockMeta}>{evs.length} zajęć</div>
              <div className={styles.toggle}>{isCollapsed ? '▶' : '▼'}</div>
            </div>

            {!isCollapsed && (
              <div className={styles.tableWrapper}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Data</th>
                      <th>Dzień</th>
                      <th>Godziny</th>
                      <th>Typ</th>
                      <th>Grupy</th>
                      <th>Miejsce</th>
                      <th>Uwagi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {evs.map(ev => {
                      const d = new Date(ev.date + 'T00:00:00');
                      const dateDisp = d.toLocaleDateString('pl-PL', {
                        day: '2-digit', month: '2-digit', year: 'numeric',
                      });
                      const dayName = d.toLocaleDateString('pl-PL', { weekday: 'long' });
                      const typeLabel = eventTypes.find(t => t.code === ev.type)?.label ?? ev.type;
                      const displayGroups = ev.exercise_groups.length > 0 ? ev.exercise_groups : ev.seminar_groups;
                      const groups = displayGroups.join(', ');

                      return (
                        <tr key={ev.id}>
                          <td>{dateDisp}</td>
                          <td style={{ textTransform: 'capitalize' }}>{dayName}</td>
                          <td>{ev.timeStartShort}–{ev.timeEndShort}</td>
                          <td>
                            <span
                              className={styles.typeBadge}
                              style={{ background: subj.color + '22', color: subj.color }}
                            >
                              {typeLabel}
                            </span>
                          </td>
                          <td>{groups}</td>
                          <td>{ev.resolvedLocation}</td>
                          <td>{ev.notes || '—'}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
