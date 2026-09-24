'use client';

import { useEffect, useState } from 'react';
import { useScheduleStore } from '@/store/scheduleStore';
import { fetchAllSemesters } from '@/lib/supabase/queries';
import type { Semester } from '@/types/schedule';
import styles from './HomeSelector.module.css';

const ROMAN_NUMERALS = ['I', 'II', 'III', 'IV', 'V', 'VI'];

export default function HomeSelector() {
  const { setActiveYearNumber } = useScheduleStore();
  const [allSemesters, setAllSemesters] = useState<Semester[]>([]);
  const [expandedYear, setExpandedYear] = useState<number | null>(null);

  useEffect(() => {
    fetchAllSemesters().then(setAllSemesters).catch(console.error);
  }, []);

  const handleYearClick = (year: number) => {
    setExpandedYear(expandedYear === year ? null : year);
  };

  const handleSemesterSelect = (year: number, semesterId: number) => {
    setActiveYearNumber(year, semesterId);
  };

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
            const isExpanded = expandedYear === year;
            const winterSemester = allSemesters.find(s => s.year_number === year && s.semester_no === 1);
            const summerSemester = allSemesters.find(s => s.year_number === year && s.semester_no === 2);

            return (
              <div key={year} className={styles.cardWrapper}>
                <button
                  className={`${styles.card} ${isExpanded ? styles.expandedCard : ''}`}
                  onClick={() => handleYearClick(year)}
                >
                  <div className={styles.cardContent}>
                    <h2 className={styles.yearTitle}>{ROMAN_NUMERALS[year - 1]} Rok</h2>
                  </div>
                  <div className={`${styles.cardArrow} ${isExpanded ? styles.rotatedArrow : ''}`}>
                    &darr;
                  </div>
                </button>

                {isExpanded && (
                  <div className={styles.accordionContent}>
                    <button
                      className={`${styles.semesterBtn} ${!winterSemester ? styles.disabledBtn : ''}`}
                      disabled={!winterSemester}
                      onClick={() => winterSemester && handleSemesterSelect(year, winterSemester.id)}
                    >
                      <span className={styles.semesterName}>Semestr Zimowy</span>
                      {!winterSemester && <span className={styles.badge}>Brak</span>}
                    </button>
                    
                    <button
                      className={`${styles.semesterBtn} ${!summerSemester ? styles.disabledBtn : ''}`}
                      disabled={!summerSemester}
                      onClick={() => summerSemester && handleSemesterSelect(year, summerSemester.id)}
                    >
                      <span className={styles.semesterName}>Semestr Letni</span>
                      {!summerSemester && <span className={styles.badge}>Brak</span>}
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
