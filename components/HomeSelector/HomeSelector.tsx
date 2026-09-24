'use client';

import { useScheduleStore } from '@/store/scheduleStore';
import styles from './HomeSelector.module.css';

const START_YEAR = 2026;
const ROMAN_NUMERALS = ['I', 'II', 'III', 'IV', 'V', 'VI'];

export default function HomeSelector() {
  const { setActiveYearNumber } = useScheduleStore();

  return (
    <div className={styles.wrapper}>
      <div className={styles.container}>
        <div className={styles.header}>
          <div className={styles.logoIcon}>
            <svg width="48" height="48" viewBox="0 0 36 36" fill="none">
              <rect width="36" height="36" rx="10" fill="url(#logoGradHome)" />
              <path d="M18 8v20M8 18h20" stroke="white" strokeWidth="3" strokeLinecap="round" />
              <defs>
                <linearGradient id="logoGradHome" x1="0" y1="0" x2="36" y2="36" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#4f8ef7" />
                  <stop offset="1" stopColor="#7c3aed" />
                </linearGradient>
              </defs>
            </svg>
          </div>
          <h1 className={styles.title}>Wybierz swój plan</h1>
          <p className={styles.subtitle}>Wydział Nauk Medycznych w Zabrzu</p>
        </div>

        <div className={styles.grid}>
          {[1, 2, 3, 4, 5, 6].map((year) => {
            const cohortStart = START_YEAR - year + 1;
            const cohortLabel = `${cohortStart}/${cohortStart + 1}`;
            return (
              <button
                key={year}
                className={styles.card}
                onClick={() => setActiveYearNumber(year)}
              >
                <div className={styles.cardContent}>
                  <h2 className={styles.yearTitle}>{ROMAN_NUMERALS[year - 1]} Rok</h2>
                  <p className={styles.cohortText}>Rocznik {cohortLabel}</p>
                </div>
                <div className={styles.cardArrow}>&rarr;</div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
