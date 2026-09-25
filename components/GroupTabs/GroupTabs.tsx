'use client';

import { useScheduleStore } from '@/store/scheduleStore';
import styles from './GroupTabs.module.css';

export default function GroupTabs() {
  const { activeGroup, setActiveGroup, adminRole, semesters, activeSemesterId } = useScheduleStore();
  const activeSemester = semesters.find(s => s.id === activeSemesterId);
  const gsCount = activeSemester?.gs_count ?? 12;
  const gsPrefix = activeSemester?.gs_prefix ?? 'GS';

  const GROUPS = [...Array(gsCount)].map((_, i) => ({
    key: `${gsPrefix}${i + 1}`,
    label: `${gsPrefix} ${i + 1}`,
    isSpecial: false
  }));
  GROUPS.push({ key: 'GW', label: 'GW', isSpecial: true });

  return (
    <nav className={styles.nav} aria-label="Grupy dziekańskie">
      <div className={styles.inner}>
        <div className={styles.tabs} role="tablist">
          {GROUPS.map(g => {
            const isDisabled = adminRole?.type === 'moderator' && adminRole.group !== g.key;
            return (
              <button
                key={g.key}
                role="tab"
                className={`${styles.tab} ${activeGroup === g.key ? styles.active : ''} ${g.isSpecial ? styles.special : ''}`}
                aria-selected={activeGroup === g.key}
                onClick={() => !isDisabled && setActiveGroup(g.key)}
                disabled={isDisabled}
                style={{ opacity: isDisabled ? 0.4 : 1, cursor: isDisabled ? 'not-allowed' : 'pointer' }}
              >
                {g.label}
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
