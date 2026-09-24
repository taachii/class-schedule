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
            <svg width="240" viewBox="0 15 230 60" fill="none" stroke="url(#sumGradient)" strokeWidth="6" strokeLinecap="butt">
              <defs>
                <linearGradient id="sumGradient" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#ec4899" />
                  <stop offset="100%" stopColor="#7c3aed" />
                </linearGradient>
              </defs>
              <path d="M 15 40 A 18 18 0 0 0 51 40" />
              <path d="M 35 40 A 18 18 0 0 1 71 40" />
              <path d="M 85 22 V 40 A 18 18 0 0 0 121 40 V 22" />
              <path d="M 135 58 V 40 A 18 18 0 0 1 171 40 V 58" />
              <path d="M 171 40 A 18 18 0 0 1 207 40" />
              <path d="M 207 50 V 66 M 199 58 H 215" strokeWidth="4" />
            </svg>
          </div>
          <p className={styles.subtitle}>Wydział Nauk Medycznych w Zabrzu</p>
          <h1 className={styles.title}>Plany zajęć dla kierunku lekarskiego</h1>
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
