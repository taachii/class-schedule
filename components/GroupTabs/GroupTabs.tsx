'use client';

import { useScheduleStore } from '@/store/scheduleStore';
import styles from './GroupTabs.module.css';

const GROUPS = [
  { key: 'GS1', label: 'GS 1' },
  { key: 'GS2', label: 'GS 2' },
  { key: 'GS3', label: 'GS 3' },
  { key: 'GS4', label: 'GS 4' },
  { key: 'GS5', label: 'GS 5' },
  { key: 'GS6', label: 'GS 6' },
  { key: 'GS7', label: 'GS 7' },
  { key: 'GS8', label: 'GS 8' },
  { key: 'GS9', label: 'GS 9' },
  { key: 'GS10', label: 'GS 10' },
  { key: 'GS11', label: 'GS 11' },
  { key: 'GS12', label: 'GS 12' },
  { key: 'GW', label: 'GW (Wykłady)', isSpecial: true },
];

export default function GroupTabs() {
  const { activeGroup, setActiveGroup } = useScheduleStore();

  return (
    <nav className={styles.nav} aria-label="Grupy dziekańskie">
      <div className={styles.inner}>
        <div className={styles.tabs} role="tablist">
          {GROUPS.map(g => (
            <button
              key={g.key}
              role="tab"
              className={`${styles.tab} ${activeGroup === g.key ? styles.active : ''} ${g.isSpecial ? styles.special : ''}`}
              aria-selected={activeGroup === g.key}
              onClick={() => setActiveGroup(g.key)}
            >
              {g.label}
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
}
