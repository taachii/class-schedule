import AdminForm from './AdminForm';
import { fetchAllSemesters, fetchEventTypes } from '@/lib/supabase/queries';
import { supabase } from '@/lib/supabase/client';
import type { Subject } from '@/types/schedule';
import styles from './Admin.module.css';

// Admin page is a server component that fetches initial data needed for dropdowns
export default async function AdminPage() {
  const semesters = await fetchAllSemesters();
  const eventTypes = await fetchEventTypes();
  
  // Fetch all subjects directly
  const { data: subjectsData } = await supabase.from('subjects').select('*').order('label');
  const subjects = (subjectsData ?? []) as Subject[];

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1>Panel Administratora</h1>
        <p>Dodawanie nowych zajęć do harmonogramu</p>
      </div>
      <div className={styles.container}>
        <AdminForm semesters={semesters} eventTypes={eventTypes} subjects={subjects} />
      </div>
    </div>
  );
}
