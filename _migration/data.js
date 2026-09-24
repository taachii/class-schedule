/**
 * data.js — Schedule data for I Rok Lekarski, SUM Zabrze 2026/2027
 *
 * Each event object:
 *   id        : unique string
 *   subject   : subject key (anat, hist, biol, kpp, prof, jang, wf, fak)
 *   subjectFull: full display name
 *   type      : 'W' (wykład), 'S' (seminarium), 'C' (ćwiczenia), 'CSM', 'F' (fakultet)
 *   group     : e.g. 'GW', 'GS1', 'GĆ1', 'GĆ1,2'
 *   date      : 'YYYY-MM-DD'
 *   timeStart : 'HH:MM'
 *   timeEnd   : 'HH:MM'
 *   location  : string
 *   contact   : string (email or URL)
 *   notes     : string (optional)
 */

window.SCHEDULE_DATA = {};

/* -------------------------------------------------------
   HELPER: expand date arrays from the raw CSV
   ------------------------------------------------------- */
function makeEvent(overrides) {
  return Object.assign({
    id: '', subject: '', subjectFull: '', type: '',
    group: '', date: '', timeStart: '', timeEnd: '',
    location: '', contact: '', notes: ''
  }, overrides);
}

function eventsFromDates(base, dates) {
  return dates.map((d, i) => makeEvent(Object.assign({}, base, { id: base.id + '_' + i, date: d })));
}

/* -------------------------------------------------------
   SUBJECTS METADATA (for filter chips & colors)
   ------------------------------------------------------- */
window.SUBJECTS = [
  { key: 'anat', label: 'Anatomia', shortLabel: 'Anat.', cssClass: 'ev-anat', color: '#3b82f6' },
  { key: 'hist', label: 'Histologia, Cytofizjologia i Embr.', shortLabel: 'Hist.', cssClass: 'ev-hist', color: '#10b981' },
  { key: 'biol', label: 'Biologia Molekularna', shortLabel: 'Biol.', cssClass: 'ev-biol', color: '#f59e0b' },
  { key: 'kpp', label: 'Kwalifikowana Pierwsza Pomoc', shortLabel: 'KPP', cssClass: 'ev-kpp', color: '#ef4444' },
  { key: 'prof', label: 'Profesjonalizm i Humanizm', shortLabel: 'Prof.', cssClass: 'ev-prof', color: '#8b5cf6' },
  { key: 'jang', label: 'Język Angielski I', shortLabel: 'J.Ang.', cssClass: 'ev-jang', color: '#06b6d4' },
  { key: 'wf', label: 'Wychowanie Fizyczne', shortLabel: 'WF', cssClass: 'ev-wf', color: '#84cc16' },
  { key: 'fak', label: 'Przedmioty Fakultatywne', shortLabel: 'Fak.', cssClass: 'ev-fak', color: '#f97316' },
];

/* -------------------------------------------------------
   TYPE LABELS
   ------------------------------------------------------- */
window.TYPE_LABELS = {
  W: 'Wykład',
  S: 'Seminarium',
  C: 'Ćwiczenia',
  CSM: 'Ćwiczenia CSM',
  F: 'Fakultet',
};

/* =======================================================
   GW — OGÓLNOWYKŁADOWE (all groups)
   ======================================================= */
const gw_anat_dates = [
  '2026-10-07', '2026-10-14', '2026-10-21', '2026-10-28',
  '2026-11-04', '2026-11-18', '2026-11-25',
  '2026-12-02', '2026-12-09', '2026-12-16'
];
const gw_anat = eventsFromDates({
  id: 'gw_anat_w', subject: 'anat', subjectFull: 'Anatomia',
  type: 'W', group: 'GW',
  timeStart: '18:30', timeEnd: '20:00',
  location: 'Zabrze-Rokitnica, ul. Jordana 19',
  contact: 'anatomia-zabrze@sum.edu.pl'
}, gw_anat_dates);

const gw_hist = [
  makeEvent({ id: 'gw_hist_w1', subject: 'hist', subjectFull: 'Histologia, Cytofizjologia i Embriologia', type: 'W', group: 'GW', date: '2026-11-09', timeStart: '18:45', timeEnd: '21:00', location: 'Zabrze-Rokitnica, ul. Jordana 19', contact: 'histologiazab@sum.edu.pl' }),
  makeEvent({ id: 'gw_hist_w2', subject: 'hist', subjectFull: 'Histologia, Cytofizjologia i Embriologia', type: 'W', group: 'GW', date: '2026-12-21', timeStart: '14:45', timeEnd: '17:00', location: 'Zabrze-Rokitnica, ul. Jordana 19', contact: 'histologiazab@sum.edu.pl' }),
  makeEvent({ id: 'gw_hist_w3', subject: 'hist', subjectFull: 'Histologia, Cytofizjologia i Embriologia', type: 'W', group: 'GW', date: '2026-12-22', timeStart: '13:00', timeEnd: '15:15', location: 'Zabrze-Rokitnica, ul. Jordana 19', contact: 'histologiazab@sum.edu.pl' }),
  makeEvent({ id: 'gw_hist_w4', subject: 'hist', subjectFull: 'Histologia, Cytofizjologia i Embriologia', type: 'W', group: 'GW', date: '2027-01-07', timeStart: '10:30', timeEnd: '12:45', location: 'Zabrze-Rokitnica, ul. Jordana 19', contact: 'histologiazab@sum.edu.pl' }),
  makeEvent({ id: 'gw_hist_w5', subject: 'hist', subjectFull: 'Histologia, Cytofizjologia i Embriologia', type: 'W', group: 'GW', date: '2027-01-08', timeStart: '10:30', timeEnd: '12:45', location: 'Zabrze-Rokitnica, ul. Jordana 19', contact: 'histologiazab@sum.edu.pl' }),
];

const gw_biol_dates = ['2026-11-20', '2026-11-27', '2026-12-04', '2026-12-11', '2026-12-18'];
const gw_biol = eventsFromDates({
  id: 'gw_biol_w', subject: 'biol', subjectFull: 'Biologia Molekularna',
  type: 'W', group: 'GW', timeStart: '19:00', timeEnd: '21:15',
  location: 'Zabrze-Rokitnica, ul. Jordana 19', contact: 'biolmedzab@sum.edu.pl'
}, gw_biol_dates);

const gw_kpp = [
  makeEvent({ id: 'gw_kpp_w1', subject: 'kpp', subjectFull: 'Kwalifikowana Pierwsza Pomoc i Elementy Pielęgniarstwa', type: 'W', group: 'GW', date: '2026-12-21', timeStart: '17:15', timeEnd: '18:45', location: 'Zabrze-Rokitnica, ul. Jordana 19', contact: 'zrm@sum.edu.pl' }),
  makeEvent({ id: 'gw_kpp_w2', subject: 'kpp', subjectFull: 'Kwalifikowana Pierwsza Pomoc i Elementy Pielęgniarstwa', type: 'W', group: 'GW', date: '2026-12-22', timeStart: '15:30', timeEnd: '17:00', location: 'Zabrze-Rokitnica, ul. Jordana 19', contact: 'zrm@sum.edu.pl' }),
  makeEvent({ id: 'gw_kpp_w3', subject: 'kpp', subjectFull: 'Kwalifikowana Pierwsza Pomoc i Elementy Pielęgniarstwa', type: 'W', group: 'GW', date: '2027-01-07', timeStart: '13:00', timeEnd: '14:30', location: 'Zabrze-Rokitnica, ul. Jordana 19', contact: 'zrm@sum.edu.pl' }),
  makeEvent({ id: 'gw_kpp_w4', subject: 'kpp', subjectFull: 'Kwalifikowana Pierwsza Pomoc i Elementy Pielęgniarstwa', type: 'W', group: 'GW', date: '2027-01-08', timeStart: '13:00', timeEnd: '14:30', location: 'Zabrze-Rokitnica, ul. Jordana 19', contact: 'zrm@sum.edu.pl' }),
];

const gw_prof = [
  makeEvent({ id: 'gw_prof_w1', subject: 'prof', subjectFull: 'Profesjonalizm i Humanizm w Medycynie', type: 'W', group: 'GW', date: '2026-12-21', timeStart: '10:30', timeEnd: '12:00', location: 'Pl. Traugutta 2', contact: 'psychologiaihumanizacja@sum.edu.pl' }),
  makeEvent({ id: 'gw_prof_w2', subject: 'prof', subjectFull: 'Profesjonalizm i Humanizm w Medycynie (mgr Ewa Władyka)', type: 'W', group: 'GW', date: '2026-12-21', timeStart: '18:45', timeEnd: '21:00', location: 'Pl. Traugutta 2', contact: 'psychologiaihumanizacja@sum.edu.pl', notes: 'Prowadząca: mgr Ewa Władyka' }),
  makeEvent({ id: 'gw_prof_w3', subject: 'prof', subjectFull: 'Profesjonalizm i Humanizm w Medycynie (mgr Ewa Władyka)', type: 'W', group: 'GW', date: '2026-12-22', timeStart: '18:45', timeEnd: '21:00', location: 'Pl. Traugutta 2', contact: 'psychologiaihumanizacja@sum.edu.pl', notes: 'Prowadząca: mgr Ewa Władyka' }),
  makeEvent({ id: 'gw_prof_w4', subject: 'prof', subjectFull: 'Profesjonalizm i Humanizm w Medycynie', type: 'W', group: 'GW', date: '2026-11-12', timeStart: '18:45', timeEnd: '21:00', location: 'Pl. Traugutta 2', contact: 'psychologiaihumanizacja@sum.edu.pl' }),
  makeEvent({ id: 'gw_prof_w5', subject: 'prof', subjectFull: 'Profesjonalizm i Humanizm w Medycynie', type: 'W', group: 'GW', date: '2027-01-07', timeStart: '18:45', timeEnd: '21:00', location: 'Pl. Traugutta 2', contact: 'psychologiaihumanizacja@sum.edu.pl', notes: 'Prowadząca: mgr Ewa Władyka' }),
  makeEvent({ id: 'gw_prof_w6', subject: 'prof', subjectFull: 'Profesjonalizm i Humanizm w Medycynie (mgr Ewa Władyka)', type: 'W', group: 'GW', date: '2027-01-20', timeStart: '18:45', timeEnd: '21:00', location: 'Pl. Traugutta 2', contact: 'psychologiaihumanizacja@sum.edu.pl', notes: 'Prowadząca: mgr Ewa Władyka' }),
  makeEvent({ id: 'gw_prof_w7', subject: 'prof', subjectFull: 'Profesjonalizm i Humanizm w Medycynie (mgr Ewa Władyka)', type: 'W', group: 'GW', date: '2027-01-08', timeStart: '14:45', timeEnd: '17:00', location: 'Pl. Traugutta 2', contact: 'psychologiaihumanizacja@sum.edu.pl', notes: 'Prowadząca: mgr Ewa Władyka' }),
  makeEvent({ id: 'gw_prof_w8', subject: 'prof', subjectFull: 'Profesjonalizm i Humanizm w Medycynie', type: 'W', group: 'GW', date: '2027-01-08', timeStart: '18:45', timeEnd: '21:00', location: 'Pl. Traugutta 2', contact: 'psychologiaihumanizacja@sum.edu.pl' }),
  makeEvent({ id: 'gw_prof_w9', subject: 'prof', subjectFull: 'Profesjonalizm i Humanizm w Medycynie', type: 'W', group: 'GW', date: '2027-01-22', timeStart: '18:45', timeEnd: '21:00', location: 'Pl. Traugutta 2', contact: 'psychologiaihumanizacja@sum.edu.pl' }),
  makeEvent({ id: 'gw_prof_w10', subject: 'prof', subjectFull: 'Profesjonalizm i Humanizm w Medycynie', type: 'W', group: 'GW', date: '2027-01-29', timeStart: '18:00', timeEnd: '21:00', location: 'Pl. Traugutta 2', contact: 'psychologiaihumanizacja@sum.edu.pl' }),
];

window.SCHEDULE_DATA['GW'] = [
  ...gw_anat, ...gw_hist, ...gw_biol, ...gw_kpp, ...gw_prof
];

/* =======================================================
   GS 1 (GĆ 1, GĆ 2)
   ======================================================= */

/* ---- ANATOMIA ---- */
const gs1_anat = [
  /* Intro */
  makeEvent({ id: 'gs1_anat_intro_s', subject: 'anat', subjectFull: 'Anatomia – Seminarium (Intro)', type: 'S', group: 'GS 1 + GS 2', date: '2026-10-05', timeStart: '08:00', timeEnd: '08:45', location: 'Zabrze-Rokitnica, ul. Jordana 19', contact: 'anatomia-zabrze@sum.edu.pl', notes: 'Zajęcia introdukcyjne' }),
  makeEvent({ id: 'gs1_anat_intro_c', subject: 'anat', subjectFull: 'Anatomia – Ćwiczenia (Intro)', type: 'C', group: 'GĆ 1-4', date: '2026-10-05', timeStart: '08:45', timeEnd: '10:15', location: 'Zabrze-Rokitnica, ul. Jordana 19', contact: 'anatomia-zabrze@sum.edu.pl', notes: 'Zajęcia introdukcyjne' }),

  /* Seminaria GS1 - Poniedziałki */
  ...eventsFromDates({ id: 'gs1_anat_s_pn', subject: 'anat', subjectFull: 'Anatomia – Seminarium', type: 'S', group: 'GS 1 + GS 2', timeStart: '08:00', timeEnd: '10:15', location: 'Zabrze-Rokitnica, ul. Jordana 19', contact: 'anatomia-zabrze@sum.edu.pl' },
    ['2026-10-19', '2026-11-16', '2026-12-07', '2027-01-18']),

  /* Seminaria GS1- Czwartki */
  ...eventsFromDates({ id: 'gs1_anat_s_czw', subject: 'anat', subjectFull: 'Anatomia – Seminarium', type: 'S', group: 'GS 1 + GS 2', timeStart: '08:00', timeEnd: '10:15', location: 'Zabrze-Rokitnica, ul. Jordana 19', contact: 'anatomia-zabrze@sum.edu.pl' },
    ['2026-10-22', '2026-11-19', '2026-12-10', '2027-01-21']),

  /* Ćwiczenia GĆ 1,2 – Poniedziałki */
  ...eventsFromDates({ id: 'gs1_anat_c_pn', subject: 'anat', subjectFull: 'Anatomia – Ćwiczenia', type: 'C', group: 'GĆ 1-4', timeStart: '08:00', timeEnd: '10:15', location: 'Zabrze-Rokitnica, ul. Jordana 19', contact: 'anatomia-zabrze@sum.edu.pl' },
    ['2026-10-12', '2026-10-26', '2026-11-02', '2026-11-23', '2026-11-30', '2026-12-14', '2027-01-11', '2027-01-25']),

  /* Ćwiczenia GĆ 1,2 – Czwartki */
  ...eventsFromDates({ id: 'gs1_anat_c_czw', subject: 'anat', subjectFull: 'Anatomia – Ćwiczenia', type: 'C', group: 'GĆ 1-4', timeStart: '08:00', timeEnd: '10:15', location: 'Zabrze-Rokitnica, ul. Jordana 19', contact: 'anatomia-zabrze@sum.edu.pl' },
    ['2026-10-15', '2026-10-29', '2026-11-05', '2026-11-26', '2026-12-03', '2026-12-17', '2027-01-14', '2027-01-28']),
];

const gs2_anat = [
  /* Intro */
  makeEvent({ id: 'gs2_anat_intro_s', subject: 'anat', subjectFull: 'Anatomia – Seminarium (Intro)', type: 'S', group: 'GS 1 + GS 2', date: '2026-10-05', timeStart: '08:00', timeEnd: '08:45', location: 'Zabrze-Rokitnica, ul. Jordana 19', contact: 'anatomia-zabrze@sum.edu.pl', notes: 'Zajęcia introdukcyjne' }),
  makeEvent({ id: 'gs2_anat_intro_c', subject: 'anat', subjectFull: 'Anatomia – Ćwiczenia (Intro)', type: 'C', group: 'GĆ 1-4', date: '2026-10-05', timeStart: '08:45', timeEnd: '10:15', location: 'Zabrze-Rokitnica, ul. Jordana 19', contact: 'anatomia-zabrze@sum.edu.pl', notes: 'Zajęcia introdukcyjne' }),

  /* Seminaria GS2 - Poniedziałi */
  ...eventsFromDates({ id: 'gs2_anat_s_pn', subject: 'anat', subjectFull: 'Anatomia – Seminarium', type: 'S', group: 'GS 1 + GS 2', timeStart: '08:00', timeEnd: '10:15', location: 'Zabrze-Rokitnica, ul. Jordana 19', contact: 'anatomia-zabrze@sum.edu.pl' },
    ['2026-10-19', '2026-11-16', '2026-12-07', '2027-01-18']),

  /* Seminaria GS2 - Czwartki */
  ...eventsFromDates({ id: 'gs2_anat_s_czw', subject: 'anat', subjectFull: 'Anatomia – Seminarium', type: 'S', group: 'GS 1 + GS 2', timeStart: '08:00', timeEnd: '10:15', location: 'Zabrze-Rokitnica, ul. Jordana 19', contact: 'anatomia-zabrze@sum.edu.pl' },
    ['2026-10-22', '2026-11-19', '2026-12-10', '2027-01-21']),

  /* Ćwiczenia GĆ 3,4 – Poniedziałki */
  ...eventsFromDates({ id: 'gs2_anat_c_pn', subject: 'anat', subjectFull: 'Anatomia – Ćwiczenia', type: 'C', group: 'GĆ 1-4', timeStart: '08:00', timeEnd: '10:15', location: 'Zabrze-Rokitnica, ul. Jordana 19', contact: 'anatomia-zabrze@sum.edu.pl' },
    ['2026-10-12', '2026-10-26', '2026-11-02', '2026-11-23', '2026-11-30', '2026-12-14', '2027-01-11', '2027-01-25']),

  /* Ćwiczenia GĆ 3,4 – Czwartki */
  ...eventsFromDates({ id: 'gs2_anat_c_czw', subject: 'anat', subjectFull: 'Anatomia – Ćwiczenia', type: 'C', group: 'GĆ 1-4', timeStart: '08:00', timeEnd: '10:15', location: 'Zabrze-Rokitnica, ul. Jordana 19', contact: 'anatomia-zabrze@sum.edu.pl' },
    ['2026-10-15', '2026-10-29', '2026-11-05', '2026-11-26', '2026-12-03', '2026-12-17', '2027-01-14', '2027-01-28']),
];

const gs3_anat = [
  /* Intro */
  makeEvent({ id: 'gs3_anat_intro_s', subject: 'anat', subjectFull: 'Anatomia – Seminarium (Intro)', type: 'S', group: 'GS 3 + GS 4', date: '2026-10-05', timeStart: '10:20', timeEnd: '11:05', location: 'Zabrze-Rokitnica, ul. Jordana 19', contact: 'anatomia-zabrze@sum.edu.pl', notes: 'Zajęcia introdukcyjne' }),
  makeEvent({ id: 'gs3_anat_intro_c', subject: 'anat', subjectFull: 'Anatomia – Ćwiczenia (Intro)', type: 'C', group: 'GĆ 5-8', date: '2026-10-05', timeStart: '11:05', timeEnd: '12:35', location: 'Zabrze-Rokitnica, ul. Jordana 19', contact: 'anatomia-zabrze@sum.edu.pl', notes: 'Zajęcia introdukcyjne' }),

  /* Seminaria GS3 - Poniedziałki */
  ...eventsFromDates({ id: 'gs3_anat_s_pn', subject: 'anat', subjectFull: 'Anatomia – Seminarium', type: 'S', group: 'GS 3 + GS 4', timeStart: '10:20', timeEnd: '12:35', location: 'Zabrze-Rokitnica, ul. Jordana 19', contact: 'anatomia-zabrze@sum.edu.pl' },
    ['2026-10-19', '2026-11-16', '2026-12-07', '2027-01-18']),

  /* Seminaria GS3 - Czwartki */
  ...eventsFromDates({ id: 'gs3_anat_s_czw', subject: 'anat', subjectFull: 'Anatomia – Seminarium', type: 'S', group: 'GS 3 + GS 4', timeStart: '10:20', timeEnd: '12:35', location: 'Zabrze-Rokitnica, ul. Jordana 19', contact: 'anatomia-zabrze@sum.edu.pl' },
    ['2026-10-22', '2026-11-19', '2026-12-10', '2027-01-21']),

  /* Ćwiczenia GĆ 5,6 – Poniedziałki */
  ...eventsFromDates({ id: 'gs3_anat_c_pn', subject: 'anat', subjectFull: 'Anatomia – Ćwiczenia', type: 'C', group: 'GĆ 5-8', timeStart: '10:20', timeEnd: '12:45', location: 'Zabrze-Rokitnica, ul. Jordana 19', contact: 'anatomia-zabrze@sum.edu.pl' },
    ['2026-10-12', '2026-10-26', '2026-11-02', '2026-11-23', '2026-11-30', '2026-12-14', '2027-01-11', '2027-01-25']),

  /* Ćwiczenia GĆ 5,6 – Czwartki */
  ...eventsFromDates({ id: 'gs3_anat_c_czw', subject: 'anat', subjectFull: 'Anatomia – Ćwiczenia', type: 'C', group: 'GĆ 5-8', timeStart: '10:20', timeEnd: '12:45', location: 'Zabrze-Rokitnica, ul. Jordana 19', contact: 'anatomia-zabrze@sum.edu.pl' },
    ['2026-10-15', '2026-10-29', '2026-11-05', '2026-11-26', '2026-12-03', '2026-12-17', '2027-01-14', '2027-01-28']),
];

const gs4_anat = [
  /* Intro */
  makeEvent({ id: 'gs4_anat_intro_s', subject: 'anat', subjectFull: 'Anatomia – Seminarium (Intro)', type: 'S', group: 'GS 3 + GS 4', date: '2026-10-05', timeStart: '10:20', timeEnd: '11:05', location: 'Zabrze-Rokitnica, ul. Jordana 19', contact: 'anatomia-zabrze@sum.edu.pl', notes: 'Zajęcia introdukcyjne' }),
  makeEvent({ id: 'gs4_anat_intro_c', subject: 'anat', subjectFull: 'Anatomia – Ćwiczenia (Intro)', type: 'C', group: 'GĆ 5-8', date: '2026-10-05', timeStart: '11:05', timeEnd: '12:35', location: 'Zabrze-Rokitnica, ul. Jordana 19', contact: 'anatomia-zabrze@sum.edu.pl', notes: 'Zajęcia introdukcyjne' }),

  /* Seminaria GS4 - Poniedziałki */
  ...eventsFromDates({ id: 'gs4_anat_s_pn', subject: 'anat', subjectFull: 'Anatomia – Seminarium', type: 'S', group: 'GS 3 + GS 4', timeStart: '10:20', timeEnd: '12:35', location: 'Zabrze-Rokitnica, ul. Jordana 19', contact: 'anatomia-zabrze@sum.edu.pl' },
    ['2026-10-19', '2026-11-16', '2026-12-07', '2027-01-18']),

  /* Seminaria GS4 - Czwartki */
  ...eventsFromDates({ id: 'gs4_anat_s_czw', subject: 'anat', subjectFull: 'Anatomia – Seminarium', type: 'S', group: 'GS 3 + GS 4', timeStart: '10:20', timeEnd: '12:35', location: 'Zabrze-Rokitnica, ul. Jordana 19', contact: 'anatomia-zabrze@sum.edu.pl' },
    ['2026-10-22', '2026-11-19', '2026-12-10', '2027-01-21']),

  /* Ćwiczenia GĆ 7,8 – Poniedziałki */
  ...eventsFromDates({ id: 'gs4_anat_c_pn', subject: 'anat', subjectFull: 'Anatomia – Ćwiczenia', type: 'C', group: 'GĆ 5-8', timeStart: '10:20', timeEnd: '12:45', location: 'Zabrze-Rokitnica, ul. Jordana 19', contact: 'anatomia-zabrze@sum.edu.pl' },
    ['2026-10-12', '2026-10-26', '2026-11-02', '2026-11-23', '2026-11-30', '2026-12-14', '2027-01-11', '2027-01-25']),

  /* Ćwiczenia GĆ 7,8 – Czwartki */
  ...eventsFromDates({ id: 'gs4_anat_c_czw', subject: 'anat', subjectFull: 'Anatomia – Ćwiczenia', type: 'C', group: 'GĆ 5-8', timeStart: '10:20', timeEnd: '12:45', location: 'Zabrze-Rokitnica, ul. Jordana 19', contact: 'anatomia-zabrze@sum.edu.pl' },
    ['2026-10-15', '2026-10-29', '2026-11-05', '2026-11-26', '2026-12-03', '2026-12-17', '2027-01-14', '2027-01-28']),
];

const gs5_anat = [
  /* Intro */
  makeEvent({ id: 'gs5_anat_intro_s', subject: 'anat', subjectFull: 'Anatomia – Seminarium (Intro)', type: 'S', group: 'GS 5 + GS 6', date: '2026-10-05', timeStart: '12:40', timeEnd: '13:25', location: 'Zabrze-Rokitnica, ul. Jordana 19', contact: 'anatomia-zabrze@sum.edu.pl', notes: 'Zajęcia introdukcyjne' }),
  makeEvent({ id: 'gs5_anat_intro_c', subject: 'anat', subjectFull: 'Anatomia – Ćwiczenia (Intro)', type: 'C', group: 'GĆ 9-12', date: '2026-10-05', timeStart: '13:25', timeEnd: '14:55', location: 'Zabrze-Rokitnica, ul. Jordana 19', contact: 'anatomia-zabrze@sum.edu.pl', notes: 'Zajęcia introdukcyjne' }),

  /* Seminaria GS5 - Poniedziałki */
  ...eventsFromDates({ id: 'gs5_anat_s_pn', subject: 'anat', subjectFull: 'Anatomia – Seminarium', type: 'S', group: 'GS 5 + GS 6', timeStart: '12:40', timeEnd: '14:55', location: 'Zabrze-Rokitnica, ul. Jordana 19', contact: 'anatomia-zabrze@sum.edu.pl' },
    ['2026-10-19', '2026-11-16', '2026-12-07', '2027-01-18']),

  /* Seminaria GS5 - Czwartki */
  ...eventsFromDates({ id: 'gs5_anat_s_czw', subject: 'anat', subjectFull: 'Anatomia – Seminarium', type: 'S', group: 'GS 5 + GS 6', timeStart: '12:40', timeEnd: '14:55', location: 'Zabrze-Rokitnica, ul. Jordana 19', contact: 'anatomia-zabrze@sum.edu.pl' },
    ['2026-10-22', '2026-11-19', '2026-12-10', '2027-01-21']),

  /* Ćwiczenia GĆ 9,10 – Poniedziałki */
  ...eventsFromDates({ id: 'gs5_anat_c_pn', subject: 'anat', subjectFull: 'Anatomia – Ćwiczenia', type: 'C', group: 'GĆ 9-12', timeStart: '12:40', timeEnd: '14:55', location: 'Zabrze-Rokitnica, ul. Jordana 19', contact: 'anatomia-zabrze@sum.edu.pl' },
    ['2026-10-12', '2026-10-26', '2026-11-02', '2026-11-23', '2026-11-30', '2026-12-14', '2027-01-11', '2027-01-25']),

  /* Ćwiczenia GĆ 9,10 – Czwartki */
  ...eventsFromDates({ id: 'gs5_anat_c_czw', subject: 'anat', subjectFull: 'Anatomia – Ćwiczenia', type: 'C', group: 'GĆ 9-12', timeStart: '12:40', timeEnd: '14:55', location: 'Zabrze-Rokitnica, ul. Jordana 19', contact: 'anatomia-zabrze@sum.edu.pl' },
    ['2026-10-15', '2026-10-29', '2026-11-05', '2026-11-26', '2026-12-03', '2026-12-17', '2027-01-14', '2027-01-28']),
];

const gs6_anat = [
  /* Intro */
  makeEvent({ id: 'gs6_anat_intro_s', subject: 'anat', subjectFull: 'Anatomia – Seminarium (Intro)', type: 'S', group: 'GS 5 + GS 6', date: '2026-10-05', timeStart: '12:40', timeEnd: '13:25', location: 'Zabrze-Rokitnica, ul. Jordana 19', contact: 'anatomia-zabrze@sum.edu.pl', notes: 'Zajęcia introdukcyjne' }),
  makeEvent({ id: 'gs6_anat_intro_c', subject: 'anat', subjectFull: 'Anatomia – Ćwiczenia (Intro)', type: 'C', group: 'GĆ 9-12', date: '2026-10-05', timeStart: '13:25', timeEnd: '14:55', location: 'Zabrze-Rokitnica, ul. Jordana 19', contact: 'anatomia-zabrze@sum.edu.pl', notes: 'Zajęcia introdukcyjne' }),

  /* Seminaria GS6 - Poniedziałki */
  ...eventsFromDates({ id: 'gs6_anat_s_pn', subject: 'anat', subjectFull: 'Anatomia – Seminarium', type: 'S', group: 'GS 5 + GS 6', timeStart: '12:40', timeEnd: '14:55', location: 'Zabrze-Rokitnica, ul. Jordana 19', contact: 'anatomia-zabrze@sum.edu.pl' },
    ['2026-10-19', '2026-11-16', '2026-12-07', '2027-01-18']),

  /* Seminaria GS6 - Czwartki */
  ...eventsFromDates({ id: 'gs6_anat_s_czw', subject: 'anat', subjectFull: 'Anatomia – Seminarium', type: 'S', group: 'GS 5 + GS 6', timeStart: '12:40', timeEnd: '14:55', location: 'Zabrze-Rokitnica, ul. Jordana 19', contact: 'anatomia-zabrze@sum.edu.pl' },
    ['2026-10-22', '2026-11-19', '2026-12-10', '2027-01-21']),

  /* Ćwiczenia GĆ 11,12 – Poniedziałki */
  ...eventsFromDates({ id: 'gs6_anat_c_pn', subject: 'anat', subjectFull: 'Anatomia – Ćwiczenia', type: 'C', group: 'GĆ 9-12', timeStart: '12:40', timeEnd: '14:55', location: 'Zabrze-Rokitnica, ul. Jordana 19', contact: 'anatomia-zabrze@sum.edu.pl' },
    ['2026-10-12', '2026-10-26', '2026-11-02', '2026-11-23', '2026-11-30', '2026-12-14', '2027-01-11', '2027-01-25']),

  /* Ćwiczenia GĆ 11,12 – Czwartki */
  ...eventsFromDates({ id: 'gs6_anat_c_czw', subject: 'anat', subjectFull: 'Anatomia – Ćwiczenia', type: 'C', group: 'GĆ 9-12', timeStart: '12:40', timeEnd: '14:55', location: 'Zabrze-Rokitnica, ul. Jordana 19', contact: 'anatomia-zabrze@sum.edu.pl' },
    ['2026-10-15', '2026-10-29', '2026-11-05', '2026-11-26', '2026-12-03', '2026-12-17', '2027-01-14', '2027-01-28']),
];

const gs7_anat = [
  /* Intro */
  makeEvent({ id: 'gs7_anat_intro_s', subject: 'anat', subjectFull: 'Anatomia – Seminarium (Intro)', type: 'S', group: 'GS 7 + GS 8', date: '2026-10-05', timeStart: '15:00', timeEnd: '15:45', location: 'Zabrze-Rokitnica, ul. Jordana 19', contact: 'anatomia-zabrze@sum.edu.pl', notes: 'Zajęcia introdukcyjne' }),
  makeEvent({ id: 'gs7_anat_intro_c', subject: 'anat', subjectFull: 'Anatomia – Ćwiczenia (Intro)', type: 'C', group: 'GĆ 13-16', date: '2026-10-05', timeStart: '15:45', timeEnd: '17:15', location: 'Zabrze-Rokitnica, ul. Jordana 19', contact: 'anatomia-zabrze@sum.edu.pl', notes: 'Zajęcia introdukcyjne' }),

  /* Seminaria GS7 - Poniedziałki */
  ...eventsFromDates({ id: 'gs7_anat_s_pn', subject: 'anat', subjectFull: 'Anatomia – Seminarium', type: 'S', group: 'GS 7 + GS 8', timeStart: '15:00', timeEnd: '17:15', location: 'Zabrze-Rokitnica, ul. Jordana 19', contact: 'anatomia-zabrze@sum.edu.pl' },
    ['2026-10-19', '2026-11-16', '2026-12-07', '2027-01-18']),

  /* Seminaria GS7 - Czwartki */
  ...eventsFromDates({ id: 'gs7_anat_s_czw', subject: 'anat', subjectFull: 'Anatomia – Seminarium', type: 'S', group: 'GS 7 + GS 8', timeStart: '15:00', timeEnd: '17:15', location: 'Zabrze-Rokitnica, ul. Jordana 19', contact: 'anatomia-zabrze@sum.edu.pl' },
    ['2026-10-22', '2026-11-19', '2026-12-10', '2027-01-21']),

  /* Ćwiczenia GĆ 13,14 – Poniedziałki */
  ...eventsFromDates({ id: 'gs7_anat_c_pn', subject: 'anat', subjectFull: 'Anatomia – Ćwiczenia', type: 'C', group: 'GĆ 13-16', timeStart: '15:00', timeEnd: '17:15', location: 'Zabrze-Rokitnica, ul. Jordana 19', contact: 'anatomia-zabrze@sum.edu.pl' },
    ['2026-10-12', '2026-10-26', '2026-11-02', '2026-11-23', '2026-11-30', '2026-12-14', '2027-01-11', '2027-01-25']),

  /* Ćwiczenia GĆ 13,14 – Czwartki */
  ...eventsFromDates({ id: 'gs7_anat_c_czw', subject: 'anat', subjectFull: 'Anatomia – Ćwiczenia', type: 'C', group: 'GĆ 13-16', timeStart: '15:00', timeEnd: '17:15', location: 'Zabrze-Rokitnica, ul. Jordana 19', contact: 'anatomia-zabrze@sum.edu.pl' },
    ['2026-10-15', '2026-10-29', '2026-11-05', '2026-11-26', '2026-12-03', '2026-12-17', '2027-01-14', '2027-01-28']),
];

const gs8_anat = [
  /* Intro */
  makeEvent({ id: 'gs8_anat_intro_s', subject: 'anat', subjectFull: 'Anatomia – Seminarium (Intro)', type: 'S', group: 'GS 7 + GS 8', date: '2026-10-05', timeStart: '15:00', timeEnd: '15:45', location: 'Zabrze-Rokitnica, ul. Jordana 19', contact: 'anatomia-zabrze@sum.edu.pl', notes: 'Zajęcia introdukcyjne' }),
  makeEvent({ id: 'gs8_anat_intro_c', subject: 'anat', subjectFull: 'Anatomia – Ćwiczenia (Intro)', type: 'C', group: 'GĆ 13-16', date: '2026-10-05', timeStart: '15:45', timeEnd: '17:15', location: 'Zabrze-Rokitnica, ul. Jordana 19', contact: 'anatomia-zabrze@sum.edu.pl', notes: 'Zajęcia introdukcyjne' }),

  /* Seminaria GS8 - Poniedziałki */
  ...eventsFromDates({ id: 'gs8_anat_s_pn', subject: 'anat', subjectFull: 'Anatomia – Seminarium', type: 'S', group: 'GS 7 + GS 8', timeStart: '15:00', timeEnd: '17:15', location: 'Zabrze-Rokitnica, ul. Jordana 19', contact: 'anatomia-zabrze@sum.edu.pl' },
    ['2026-10-19', '2026-11-16', '2026-12-07', '2027-01-18']),

  /* Seminaria GS8 - Czwartki */
  ...eventsFromDates({ id: 'gs8_anat_s_czw', subject: 'anat', subjectFull: 'Anatomia – Seminarium', type: 'S', group: 'GS 7 + GS 8', timeStart: '15:00', timeEnd: '17:15', location: 'Zabrze-Rokitnica, ul. Jordana 19', contact: 'anatomia-zabrze@sum.edu.pl' },
    ['2026-10-22', '2026-11-19', '2026-12-10', '2027-01-21']),

  /* Ćwiczenia GĆ 15,16 – Poniedziałki */
  ...eventsFromDates({ id: 'gs8_anat_c_pn', subject: 'anat', subjectFull: 'Anatomia – Ćwiczenia', type: 'C', group: 'GĆ 13-16', timeStart: '15:00', timeEnd: '17:15', location: 'Zabrze-Rokitnica, ul. Jordana 19', contact: 'anatomia-zabrze@sum.edu.pl' },
    ['2026-10-12', '2026-10-26', '2026-11-02', '2026-11-23', '2026-11-30', '2026-12-14', '2027-01-11', '2027-01-25']),

  /* Ćwiczenia GĆ 15,16 – Czwartki */
  ...eventsFromDates({ id: 'gs8_anat_c_czw', subject: 'anat', subjectFull: 'Anatomia – Ćwiczenia', type: 'C', group: 'GĆ 13-16', timeStart: '15:00', timeEnd: '17:15', location: 'Zabrze-Rokitnica, ul. Jordana 19', contact: 'anatomia-zabrze@sum.edu.pl' },
    ['2026-10-15', '2026-10-29', '2026-11-05', '2026-11-26', '2026-12-03', '2026-12-17', '2027-01-14', '2027-01-28']),
];

const gs9_anat = [
  /* Intro */
  makeEvent({ id: 'gs9_anat_intro_s', subject: 'anat', subjectFull: 'Anatomia – Seminarium (Intro)', type: 'S', group: 'GS 9 + GS 10', date: '2026-10-06', timeStart: '8:00', timeEnd: '8:45', location: 'Zabrze-Rokitnica, ul. Jordana 19', contact: 'anatomia-zabrze@sum.edu.pl', notes: 'Zajęcia introdukcyjne' }),
  makeEvent({ id: 'gs9_anat_intro_c', subject: 'anat', subjectFull: 'Anatomia – Ćwiczenia (Intro)', type: 'C', group: 'GĆ 17-20', date: '2026-10-06', timeStart: '8:45', timeEnd: '10:15', location: 'Zabrze-Rokitnica, ul. Jordana 19', contact: 'anatomia-zabrze@sum.edu.pl', notes: 'Zajęcia introdukcyjne' }),

  /* Seminaria GS9 - Wtorki */
  ...eventsFromDates({ id: 'gs9_anat_s_wt', subject: 'anat', subjectFull: 'Anatomia – Seminarium', type: 'S', group: 'GS 9 + GS 10', timeStart: '8:00', timeEnd: '10:15', location: 'Zabrze-Rokitnica, ul. Jordana 19', contact: 'anatomia-zabrze@sum.edu.pl' },
    ['2026-10-20', '2026-11-17', '2026-12-08', '2027-01-19']),

  /* Seminaria GS9 - Piątki */
  ...eventsFromDates({ id: 'gs9_anat_s_pt', subject: 'anat', subjectFull: 'Anatomia – Seminarium', type: 'S', group: 'GS 9 + GS 10', timeStart: '8:00', timeEnd: '10:15', location: 'Zabrze-Rokitnica, ul. Jordana 19', contact: 'anatomia-zabrze@sum.edu.pl' },
    ['2026-10-23', '2026-11-20', '2026-12-11', '2027-01-22']),

  /* Ćwiczenia GĆ 17,18 – Wtorki */
  ...eventsFromDates({ id: 'gs9_anat_c_wt', subject: 'anat', subjectFull: 'Anatomia – Ćwiczenia', type: 'C', group: 'GĆ 17-20', timeStart: '8:00', timeEnd: '10:15', location: 'Zabrze-Rokitnica, ul. Jordana 19', contact: 'anatomia-zabrze@sum.edu.pl' },
    ['2026-10-13', '2026-10-27', '2026-11-03', '2026-11-24', '2026-12-01', '2026-12-15', '2027-01-12', '2027-01-26']),

  /* Ćwiczenia GĆ 17,18 – Piątki */
  ...eventsFromDates({ id: 'gs9_anat_c_pt', subject: 'anat', subjectFull: 'Anatomia – Ćwiczenia', type: 'C', group: 'GĆ 17-20', timeStart: '8:00', timeEnd: '10:15', location: 'Zabrze-Rokitnica, ul. Jordana 19', contact: 'anatomia-zabrze@sum.edu.pl' },
    ['2026-10-16', '2026-10-30', '2026-11-06', '2026-11-27', '2026-12-04', '2026-12-18', '2027-01-15', '2027-01-29']),
];

const gs10_anat = [
  /* Intro */
  makeEvent({ id: 'gs10_anat_intro_s', subject: 'anat', subjectFull: 'Anatomia – Seminarium (Intro)', type: 'S', group: 'GS 9 + GS 10', date: '2026-10-06', timeStart: '8:00', timeEnd: '8:45', location: 'Zabrze-Rokitnica, ul. Jordana 19', contact: 'anatomia-zabrze@sum.edu.pl', notes: 'Zajęcia introdukcyjne' }),
  makeEvent({ id: 'gs10_anat_intro_c', subject: 'anat', subjectFull: 'Anatomia – Ćwiczenia (Intro)', type: 'C', group: 'GĆ 17-20', date: '2026-10-06', timeStart: '8:45', timeEnd: '10:15', location: 'Zabrze-Rokitnica, ul. Jordana 19', contact: 'anatomia-zabrze@sum.edu.pl', notes: 'Zajęcia introdukcyjne' }),

  /* Seminaria GS10 - Wtorki */
  ...eventsFromDates({ id: 'gs10_anat_s_wt', subject: 'anat', subjectFull: 'Anatomia – Seminarium', type: 'S', group: 'GS 9 + GS 10', timeStart: '8:00', timeEnd: '10:15', location: 'Zabrze-Rokitnica, ul. Jordana 19', contact: 'anatomia-zabrze@sum.edu.pl' },
    ['2026-10-20', '2026-11-17', '2026-12-08', '2027-01-19']),

  /* Seminaria GS10 - Piątki */
  ...eventsFromDates({ id: 'gs10_anat_s_pt', subject: 'anat', subjectFull: 'Anatomia – Seminarium', type: 'S', group: 'GS 9 + GS 10', timeStart: '8:00', timeEnd: '10:15', location: 'Zabrze-Rokitnica, ul. Jordana 19', contact: 'anatomia-zabrze@sum.edu.pl' },
    ['2026-10-23', '2026-11-20', '2026-12-11', '2027-01-22']),

  /* Ćwiczenia GĆ 19,20 – Wtorki */
  ...eventsFromDates({ id: 'gs10_anat_c_wt', subject: 'anat', subjectFull: 'Anatomia – Ćwiczenia', type: 'C', group: 'GĆ 17-20', timeStart: '8:00', timeEnd: '10:15', location: 'Zabrze-Rokitnica, ul. Jordana 19', contact: 'anatomia-zabrze@sum.edu.pl' },
    ['2026-10-13', '2026-10-27', '2026-11-03', '2026-11-24', '2026-12-01', '2026-12-15', '2027-01-12', '2027-01-26']),

  /* Ćwiczenia GĆ 19,20 – Piątki */
  ...eventsFromDates({ id: 'gs10_anat_c_pt', subject: 'anat', subjectFull: 'Anatomia – Ćwiczenia', type: 'C', group: 'GĆ 17-20', timeStart: '8:00', timeEnd: '10:15', location: 'Zabrze-Rokitnica, ul. Jordana 19', contact: 'anatomia-zabrze@sum.edu.pl' },
    ['2026-10-16', '2026-10-30', '2026-11-06', '2026-11-27', '2026-12-04', '2026-12-18', '2027-01-15', '2027-01-29']),
];

const gs11_anat = [
  /* Intro */
  makeEvent({ id: 'gs11_anat_intro_s', subject: 'anat', subjectFull: 'Anatomia – Seminarium (Intro)', type: 'S', group: 'GS 11 + GS 12', date: '2026-10-06', timeStart: '10:20', timeEnd: '11:05', location: 'Zabrze-Rokitnica, ul. Jordana 19', contact: 'anatomia-zabrze@sum.edu.pl', notes: 'Zajęcia introdukcyjne' }),
  makeEvent({ id: 'gs11_anat_intro_c', subject: 'anat', subjectFull: 'Anatomia – Ćwiczenia (Intro)', type: 'C', group: 'GĆ 21-24', date: '2026-10-06', timeStart: '11:05', timeEnd: '12:35', location: 'Zabrze-Rokitnica, ul. Jordana 19', contact: 'anatomia-zabrze@sum.edu.pl', notes: 'Zajęcia introdukcyjne' }),

  /* Seminaria GS11 - Wtorki */
  ...eventsFromDates({ id: 'gs11_anat_s_wt', subject: 'anat', subjectFull: 'Anatomia – Seminarium', type: 'S', group: 'GS 11 + GS 12', timeStart: '10:20', timeEnd: '12:35', location: 'Zabrze-Rokitnica, ul. Jordana 19', contact: 'anatomia-zabrze@sum.edu.pl' },
    ['2026-10-20', '2026-11-17', '2026-12-08', '2027-01-19']),

  /* Seminaria GS11 - Piątki */
  ...eventsFromDates({ id: 'gs11_anat_s_pt', subject: 'anat', subjectFull: 'Anatomia – Seminarium', type: 'S', group: 'GS 11 + GS 12', timeStart: '10:20', timeEnd: '12:35', location: 'Zabrze-Rokitnica, ul. Jordana 19', contact: 'anatomia-zabrze@sum.edu.pl' },
    ['2026-10-23', '2026-11-20', '2026-12-11', '2027-01-22']),

  /* Ćwiczenia GĆ 21,22 – Wtorki */
  ...eventsFromDates({ id: 'gs11_anat_c_wt', subject: 'anat', subjectFull: 'Anatomia – Ćwiczenia', type: 'C', group: 'GĆ 21-24', timeStart: '10:20', timeEnd: '12:35', location: 'Zabrze-Rokitnica, ul. Jordana 19', contact: 'anatomia-zabrze@sum.edu.pl' },
    ['2026-10-13', '2026-10-27', '2026-11-03', '2026-11-24', '2026-12-01', '2026-12-15', '2027-01-12', '2027-01-26']),

  /* Ćwiczenia GĆ 21,22 – Piątki */
  ...eventsFromDates({ id: 'gs11_anat_c_pt', subject: 'anat', subjectFull: 'Anatomia – Ćwiczenia', type: 'C', group: 'GĆ 21-24', timeStart: '10:20', timeEnd: '12:35', location: 'Zabrze-Rokitnica, ul. Jordana 19', contact: 'anatomia-zabrze@sum.edu.pl' },
    ['2026-10-16', '2026-10-30', '2026-11-06', '2026-11-27', '2026-12-04', '2026-12-18', '2027-01-15', '2027-01-29']),
];

const gs12_anat = [
  /* Intro */
  makeEvent({ id: 'gs12_anat_intro_s', subject: 'anat', subjectFull: 'Anatomia – Seminarium (Intro)', type: 'S', group: 'GS 11 + GS 12', date: '2026-10-06', timeStart: '10:20', timeEnd: '11:05', location: 'Zabrze-Rokitnica, ul. Jordana 19', contact: 'anatomia-zabrze@sum.edu.pl', notes: 'Zajęcia introdukcyjne' }),
  makeEvent({ id: 'gs12_anat_intro_c', subject: 'anat', subjectFull: 'Anatomia – Ćwiczenia (Intro)', type: 'C', group: 'GĆ 21-24', date: '2026-10-06', timeStart: '11:05', timeEnd: '12:35', location: 'Zabrze-Rokitnica, ul. Jordana 19', contact: 'anatomia-zabrze@sum.edu.pl', notes: 'Zajęcia introdukcyjne' }),

  /* Seminaria GS12 - Wtorki */
  ...eventsFromDates({ id: 'gs12_anat_s_wt', subject: 'anat', subjectFull: 'Anatomia – Seminarium', type: 'S', group: 'GS 11 + GS 12', timeStart: '10:20', timeEnd: '12:35', location: 'Zabrze-Rokitnica, ul. Jordana 19', contact: 'anatomia-zabrze@sum.edu.pl' },
    ['2026-10-20', '2026-11-17', '2026-12-08', '2027-01-19']),

  /* Seminaria GS12 - Piątki */
  ...eventsFromDates({ id: 'gs12_anat_s_pt', subject: 'anat', subjectFull: 'Anatomia – Seminarium', type: 'S', group: 'GS 11 + GS 12', timeStart: '10:20', timeEnd: '12:35', location: 'Zabrze-Rokitnica, ul. Jordana 19', contact: 'anatomia-zabrze@sum.edu.pl' },
    ['2026-10-23', '2026-11-20', '2026-12-11', '2027-01-22']),

  /* Ćwiczenia GĆ 23,24 – Wtorki */
  ...eventsFromDates({ id: 'gs12_anat_c_wt', subject: 'anat', subjectFull: 'Anatomia – Ćwiczenia', type: 'C', group: 'GĆ 21-24', timeStart: '10:20', timeEnd: '12:35', location: 'Zabrze-Rokitnica, ul. Jordana 19', contact: 'anatomia-zabrze@sum.edu.pl' },
    ['2026-10-13', '2026-10-27', '2026-11-03', '2026-11-24', '2026-12-01', '2026-12-15', '2027-01-12', '2027-01-26']),

  /* Ćwiczenia GĆ 23.24 – Piątki */
  ...eventsFromDates({ id: 'gs12_anat_c_pt', subject: 'anat', subjectFull: 'Anatomia – Ćwiczenia', type: 'C', group: 'GĆ 21-24', timeStart: '10:20', timeEnd: '12:35', location: 'Zabrze-Rokitnica, ul. Jordana 19', contact: 'anatomia-zabrze@sum.edu.pl' },
    ['2026-10-16', '2026-10-30', '2026-11-06', '2026-11-27', '2026-12-04', '2026-12-18', '2027-01-15', '2027-01-29']),
];

/* ---- HISTOLOGIA ---- */
const gs1_hist = [
  /* Seminaria GS1 - Wtorki */
  ...eventsFromDates({ id: 'gs1_hist_s', subject: 'hist', subjectFull: 'Histologia, Cytofizjologia i Embriologia – Seminarium', type: 'S', group: 'GS1', timeStart: '17:15', timeEnd: '20:15', location: 'Zabrze-Rokitnica, ul. Jordana 19', contact: 'histologiazab@sum.edu.pl' },
    ['2026-10-13', '2026-10-20']),
  /* Ćwiczenia GĆ 1,2 - Wtorki */
  makeEvent({ id: 'gs1_hist_c_intro', subject: 'hist', subjectFull: 'Histologia, Cytofizjologia i Embriologia – Ćwiczenia (Intro)', type: 'C', group: 'GĆ 1,2', date: '2026-10-06', timeStart: '18:00', timeEnd: '20:15', location: 'Zabrze-Rokitnica, ul. Jordana 19', contact: 'histologiazab@sum.edu.pl', notes: 'Zajęcia introdukcyjne' }),

  ...eventsFromDates({ id: 'gs1_hist_c', subject: 'hist', subjectFull: 'Histologia, Cytofizjologia i Embriologia – Ćwiczenia', type: 'C', group: 'GĆ 1,2', timeStart: '17:15', timeEnd: '20:15', location: 'Zabrze-Rokitnica, ul. Jordana 19', contact: 'histologiazab@sum.edu.pl' },
    ['2026-10-27', '2026-11-03', '2026-11-17', '2026-11-24', '2026-12-01', '2026-12-08', '2026-12-15', '2027-01-12']),
];

const gs2_hist = [
  /* Seminaria GS2 - Piątki */
  ...eventsFromDates({ id: 'gs2_hist_s', subject: 'hist', subjectFull: 'Histologia, Cytofizjologia i Embriologia – Seminarium', type: 'S', group: 'GS2', timeStart: '15:00', timeEnd: '18:00', location: 'Zabrze-Rokitnica, ul. Jordana 19', contact: 'histologiazab@sum.edu.pl' },
    ['2026-10-16', '2026-10-23']),
  /* Ćwiczenia GĆ 3,4 - Piątki */
  makeEvent({ id: 'gs2_hist_c_intro', subject: 'hist', subjectFull: 'Histologia, Cytofizjologia i Embriologia – Ćwiczenia (Intro)', type: 'C', group: 'GĆ 3,4', date: '2026-10-09', timeStart: '15:00', timeEnd: '18:15', location: 'Zabrze-Rokitnica, ul. Jordana 19', contact: 'histologiazab@sum.edu.pl', notes: 'Zajęcia introdukcyjne' }),

  ...eventsFromDates({ id: 'gs2_hist_c', subject: 'hist', subjectFull: 'Histologia, Cytofizjologia i Embriologia – Ćwiczenia', type: 'C', group: 'GĆ 3,4', timeStart: '15:00', timeEnd: '18:00', location: 'Zabrze-Rokitnica, ul. Jordana 19', contact: 'histologiazab@sum.edu.pl' },
    ['2026-10-30', '2026-11-06', '2026-11-20', '2026-11-27', '2026-12-04', '2026-12-11', '2026-12-18', '2027-01-15']),
];

const gs3_hist = [
  /* Seminaria GS3 - Wtorki */
  ...eventsFromDates({ id: 'gs3_hist_s', subject: 'hist', subjectFull: 'Histologia, Cytofizjologia i Embriologia – Seminarium', type: 'S', group: 'GS3', timeStart: '11:05', timeEnd: '14:05', location: 'Zabrze-Rokitnica, ul. Jordana 19', contact: 'histologiazab@sum.edu.pl' },
    ['2026-10-13', '2026-10-20']),
  /* Ćwiczenia GĆ 5,6 - Wtorki */
  makeEvent({ id: 'gs3_hist_c_intro', subject: 'hist', subjectFull: 'Histologia, Cytofizjologia i Embriologia – Ćwiczenia (Intro)', type: 'C', group: 'GĆ 5,6', date: '2026-10-06', timeStart: '11:50', timeEnd: '14:05', location: 'Zabrze-Rokitnica, ul. Jordana 19', contact: 'histologiazab@sum.edu.pl', notes: 'Zajęcia introdukcyjne' }),

  ...eventsFromDates({ id: 'gs3_hist_c', subject: 'hist', subjectFull: 'Histologia, Cytofizjologia i Embriologia – Ćwiczenia', type: 'C', group: 'GĆ 5,6', timeStart: '11:05', timeEnd: '14:05', location: 'Zabrze-Rokitnica, ul. Jordana 19', contact: 'histologiazab@sum.edu.pl' },
    ['2026-10-27', '2026-11-03', '2026-11-17', '2026-11-24', '2026-12-01', '2026-12-08', '2026-12-15', '2027-01-12']),
];

const gs4_hist = [
  /* Seminaria GS4 - Środy */
  ...eventsFromDates({ id: 'gs4_hist_s', subject: 'hist', subjectFull: 'Histologia, Cytofizjologia i Embriologia – Seminarium', type: 'S', group: 'GS4', timeStart: '11:05', timeEnd: '14:05', location: 'Zabrze-Rokitnica, ul. Jordana 19', contact: 'histologiazab@sum.edu.pl' },
    ['2026-10-14', '2026-10-21']),
  /* Ćwiczenia GĆ 7,8 - Środy */
  makeEvent({ id: 'gs4_hist_c_intro', subject: 'hist', subjectFull: 'Histologia, Cytofizjologia i Embriologia – Ćwiczenia (Intro)', type: 'C', group: 'GĆ 7,8', date: '2026-10-07', timeStart: '11:50', timeEnd: '14:05', location: 'Zabrze-Rokitnica, ul. Jordana 19', contact: 'histologiazab@sum.edu.pl', notes: 'Zajęcia introdukcyjne' }),

  ...eventsFromDates({ id: 'gs4_hist_c', subject: 'hist', subjectFull: 'Histologia, Cytofizjologia i Embriologia – Ćwiczenia', type: 'C', group: 'GĆ 7,8', timeStart: '11:05', timeEnd: '14:05', location: 'Zabrze-Rokitnica, ul. Jordana 19', contact: 'histologiazab@sum.edu.pl' },
    ['2026-10-28', '2026-11-04', '2026-11-18', '2026-11-25', '2026-12-02', '2026-12-09', '2026-12-16', '2027-01-13']),
];

const gs5_hist = [
  /* Seminaria GS5 - Wtorki */
  ...eventsFromDates({ id: 'gs5_hist_s', subject: 'hist', subjectFull: 'Histologia, Cytofizjologia i Embriologia – Seminarium', type: 'S', group: 'GS5', timeStart: '14:10', timeEnd: '17:10', location: 'Zabrze-Rokitnica, ul. Jordana 19', contact: 'histologiazab@sum.edu.pl' },
    ['2026-10-13', '2026-10-20']),
  /* Ćwiczenia GĆ 9,10 - Wtorki */
  makeEvent({ id: 'gs5_hist_c_intro', subject: 'hist', subjectFull: 'Histologia, Cytofizjologia i Embriologia – Ćwiczenia (Intro)', type: 'C', group: 'GĆ 9,10', date: '2026-10-06', timeStart: '14:55', timeEnd: '17:10', location: 'Zabrze-Rokitnica, ul. Jordana 19', contact: 'histologiazab@sum.edu.pl', notes: 'Zajęcia introdukcyjne' }),

  ...eventsFromDates({ id: 'gs5_hist_c', subject: 'hist', subjectFull: 'Histologia, Cytofizjologia i Embriologia – Ćwiczenia', type: 'C', group: 'GĆ 9,10', timeStart: '14:10', timeEnd: '17:10', location: 'Zabrze-Rokitnica, ul. Jordana 19', contact: 'histologiazab@sum.edu.pl' },
    ['2026-10-27', '2026-11-03', '2026-11-17', '2026-11-24', '2026-12-01', '2026-12-08', '2026-12-15', '2027-01-12']),
];

const gs6_hist = [
  /* Seminaria GS6 - Środy */
  ...eventsFromDates({ id: 'gs6_hist_s', subject: 'hist', subjectFull: 'Histologia, Cytofizjologia i Embriologia – Seminarium', type: 'S', group: 'GS6', timeStart: '8:00', timeEnd: '11:00', location: 'Zabrze-Rokitnica, ul. Jordana 19', contact: 'histologiazab@sum.edu.pl' },
    ['2026-10-14', '2026-10-21']),
  /* Ćwiczenia GĆ 11,12 - Środy */
  makeEvent({ id: 'gs6_hist_c_intro', subject: 'hist', subjectFull: 'Histologia, Cytofizjologia i Embriologia – Ćwiczenia (Intro)', type: 'C', group: 'GĆ 11,12', date: '2026-10-07', timeStart: '8:45', timeEnd: '11:00', location: 'Zabrze-Rokitnica, ul. Jordana 19', contact: 'histologiazab@sum.edu.pl', notes: 'Zajęcia introdukcyjne' }),

  ...eventsFromDates({ id: 'gs6_hist_c', subject: 'hist', subjectFull: 'Histologia, Cytofizjologia i Embriologia – Ćwiczenia', type: 'C', group: 'GĆ 11,12', timeStart: '8:00', timeEnd: '11:00', location: 'Zabrze-Rokitnica, ul. Jordana 19', contact: 'histologiazab@sum.edu.pl' },
    ['2026-10-28', '2026-11-04', '2026-11-18', '2026-11-25', '2026-12-02', '2026-12-09', '2026-12-16', '2027-01-13']),
];

const gs7_hist = [
  /* Seminaria GS7 - Poniedziałki */
  ...eventsFromDates({ id: 'gs7_hist_s', subject: 'hist', subjectFull: 'Histologia, Cytofizjologia i Embriologia – Seminarium', type: 'S', group: 'GS7', timeStart: '11:05', timeEnd: '14:05', location: 'Zabrze-Rokitnica, ul. Jordana 19', contact: 'histologiazab@sum.edu.pl' },
    ['2026-10-12', '2026-10-19']),
  /* Ćwiczenia GĆ 13,14 - Poniedziałki */
  makeEvent({ id: 'gs7_hist_c_intro', subject: 'hist', subjectFull: 'Histologia, Cytofizjologia i Embriologia – Ćwiczenia (Intro)', type: 'C', group: 'GĆ 13,14', date: '2026-10-05', timeStart: '11:50', timeEnd: '14:05', location: 'Zabrze-Rokitnica, ul. Jordana 19', contact: 'histologiazab@sum.edu.pl', notes: 'Zajęcia introdukcyjne' }),

  ...eventsFromDates({ id: 'gs7_hist_c', subject: 'hist', subjectFull: 'Histologia, Cytofizjologia i Embriologia – Ćwiczenia', type: 'C', group: 'GĆ 13,14', timeStart: '11:05', timeEnd: '14:05', location: 'Zabrze-Rokitnica, ul. Jordana 19', contact: 'histologiazab@sum.edu.pl' },
    ['2026-10-26', '2026-11-02', '2026-11-16', '2026-11-23', '2026-11-30', '2026-12-07', '2026-12-14', '2027-01-11']),
];

const gs8_hist = [
  /* Seminaria GS8 - Wtorki */
  ...eventsFromDates({ id: 'gs8_hist_s', subject: 'hist', subjectFull: 'Histologia, Cytofizjologia i Embriologia – Seminarium', type: 'S', group: 'GS8', timeStart: '8:00', timeEnd: '11:00', location: 'Zabrze-Rokitnica, ul. Jordana 19', contact: 'histologiazab@sum.edu.pl' },
    ['2026-10-13', '2026-10-20']),
  /* Ćwiczenia GĆ 15,16 - Wtorki */
  makeEvent({ id: 'gs8_hist_c_intro', subject: 'hist', subjectFull: 'Histologia, Cytofizjologia i Embriologia – Ćwiczenia (Intro)', type: 'C', group: 'GĆ 15,16', date: '2026-10-06', timeStart: '8:45', timeEnd: '11:00', location: 'Zabrze-Rokitnica, ul. Jordana 19', contact: 'histologiazab@sum.edu.pl', notes: 'Zajęcia introdukcyjne' }),

  ...eventsFromDates({ id: 'gs8_hist_c', subject: 'hist', subjectFull: 'Histologia, Cytofizjologia i Embriologia – Ćwiczenia', type: 'C', group: 'GĆ 15,16', timeStart: '8:00', timeEnd: '11:00', location: 'Zabrze-Rokitnica, ul. Jordana 19', contact: 'histologiazab@sum.edu.pl' },
    ['2026-10-27', '2026-11-03', '2026-11-17', '2026-11-24', '2026-12-01', '2026-12-08', '2026-12-15', '2027-01-12']),
];

const gs9_hist = [
  /* Seminaria GS9 - Poniedziałki */
  ...eventsFromDates({ id: 'gs9_hist_s', subject: 'hist', subjectFull: 'Histologia, Cytofizjologia i Embriologia – Seminarium', type: 'S', group: 'GS9', timeStart: '14:10', timeEnd: '17:10', location: 'Zabrze-Rokitnica, ul. Jordana 19', contact: 'histologiazab@sum.edu.pl' },
    ['2026-10-12', '2026-10-19']),
  /* Ćwiczenia GĆ 17,18 - Poniedziałki */
  makeEvent({ id: 'gs9_hist_c_intro', subject: 'hist', subjectFull: 'Histologia, Cytofizjologia i Embriologia – Ćwiczenia (Intro)', type: 'C', group: 'GĆ 17,18', date: '2026-10-05', timeStart: '14:55', timeEnd: '17:10', location: 'Zabrze-Rokitnica, ul. Jordana 19', contact: 'histologiazab@sum.edu.pl', notes: 'Zajęcia introdukcyjne' }),

  ...eventsFromDates({ id: 'gs9_hist_c', subject: 'hist', subjectFull: 'Histologia, Cytofizjologia i Embriologia – Ćwiczenia', type: 'C', group: 'GĆ 17,18', timeStart: '14:10', timeEnd: '17:10', location: 'Zabrze-Rokitnica, ul. Jordana 19', contact: 'histologiazab@sum.edu.pl' },
    ['2026-10-26', '2026-11-02', '2026-11-16', '2026-11-23', '2026-11-30', '2026-12-07', '2026-12-14', '2027-01-11']),
];

const gs10_hist = [
  /* Seminaria GS10 - Poniedziałki */
  ...eventsFromDates({ id: 'gs10_hist_s', subject: 'hist', subjectFull: 'Histologia, Cytofizjologia i Embriologia – Seminarium', type: 'S', group: 'GS10', timeStart: '17:15', timeEnd: '20:15', location: 'Zabrze-Rokitnica, ul. Jordana 19', contact: 'histologiazab@sum.edu.pl' },
    ['2026-10-12', '2026-10-19']),
  /* Ćwiczenia GĆ 19,20 - Poniedziałki */
  makeEvent({ id: 'gs10_hist_c_intro', subject: 'hist', subjectFull: 'Histologia, Cytofizjologia i Embriologia – Ćwiczenia (Intro)', type: 'C', group: 'GĆ 19,20', date: '2026-10-05', timeStart: '18:00', timeEnd: '20:15', location: 'Zabrze-Rokitnica, ul. Jordana 19', contact: 'histologiazab@sum.edu.pl', notes: 'Zajęcia introdukcyjne' }),

  ...eventsFromDates({ id: 'gs10_hist_c', subject: 'hist', subjectFull: 'Histologia, Cytofizjologia i Embriologia – Ćwiczenia', type: 'C', group: 'GĆ 19,20', timeStart: '17:15', timeEnd: '20:15', location: 'Zabrze-Rokitnica, ul. Jordana 19', contact: 'histologiazab@sum.edu.pl' },
    ['2026-10-26', '2026-11-02', '2026-11-16', '2026-11-23', '2026-11-30', '2026-12-07', '2026-12-14', '2027-01-11']),
];

const gs11_hist = [
  /* Seminaria GS11 - Czwartki */
  ...eventsFromDates({ id: 'gs11_hist_s', subject: 'hist', subjectFull: 'Histologia, Cytofizjologia i Embriologia – Seminarium', type: 'S', group: 'GS11', timeStart: '17:15', timeEnd: '20:15', location: 'Zabrze-Rokitnica, ul. Jordana 19', contact: 'histologiazab@sum.edu.pl' },
    ['2026-10-15', '2026-10-22']),
  /* Ćwiczenia GĆ 21,22 - Czwartki */
  makeEvent({ id: 'gs11_hist_c_intro', subject: 'hist', subjectFull: 'Histologia, Cytofizjologia i Embriologia – Ćwiczenia (Intro)', type: 'C', group: 'GĆ 21,22', date: '2026-10-08', timeStart: '18:00', timeEnd: '20:15', location: 'Zabrze-Rokitnica, ul. Jordana 19', contact: 'histologiazab@sum.edu.pl', notes: 'Zajęcia introdukcyjne' }),

  ...eventsFromDates({ id: 'gs11_hist_c', subject: 'hist', subjectFull: 'Histologia, Cytofizjologia i Embriologia – Ćwiczenia', type: 'C', group: 'GĆ 21,22', timeStart: '17:15', timeEnd: '20:15', location: 'Zabrze-Rokitnica, ul. Jordana 19', contact: 'histologiazab@sum.edu.pl' },
    ['2026-10-29', '2026-11-05', '2026-11-19', '2026-11-26', '2026-12-03', '2026-12-10', '2026-12-17', '2027-01-14']),
];

const gs12_hist = [
  /* Seminaria GS12 - Poniedziałki */
  ...eventsFromDates({ id: 'gs12_hist_s', subject: 'hist', subjectFull: 'Histologia, Cytofizjologia i Embriologia – Seminarium', type: 'S', group: 'GS12', timeStart: '8:00', timeEnd: '11:00', location: 'Zabrze-Rokitnica, ul. Jordana 19', contact: 'histologiazab@sum.edu.pl' },
    ['2026-10-12', '2026-10-19']),
  /* Ćwiczenia GĆ 23,24 - Poniedziałki */
  makeEvent({ id: 'gs12_hist_c_intro', subject: 'hist', subjectFull: 'Histologia, Cytofizjologia i Embriologia – Ćwiczenia (Intro)', type: 'C', group: 'GĆ 23,24', date: '2026-10-05', timeStart: '8:45', timeEnd: '11:00', location: 'Zabrze-Rokitnica, ul. Jordana 19', contact: 'histologiazab@sum.edu.pl', notes: 'Zajęcia introdukcyjne' }),

  ...eventsFromDates({ id: 'gs12_hist_c', subject: 'hist', subjectFull: 'Histologia, Cytofizjologia i Embriologia – Ćwiczenia', type: 'C', group: 'GĆ 23,24', timeStart: '8:00', timeEnd: '11:00', location: 'Zabrze-Rokitnica, ul. Jordana 19', contact: 'histologiazab@sum.edu.pl' },
    ['2026-10-26', '2026-11-02', '2026-11-16', '2026-11-23', '2026-11-30', '2026-12-07', '2026-12-14', '2027-01-11']),
];

/* ---- BIOLOGIA MOLEKULARNA ---- */
const gs1_biol = [
  /* Seminaria GS1 */
  ...eventsFromDates({ id: 'gs1_biol_s', subject: 'biol', subjectFull: 'Biologia Molekularna – Seminarium', type: 'S', group: 'GS1', timeStart: '11:05', timeEnd: '12:35', location: 'Zabrze-Rokitnica, ul. Jordana 19', contact: 'biolmedzab@sum.edu.pl' },
    ['2026-10-08', '2026-10-15', '2026-10-22', '2026-10-29', '2026-11-05', '2026-11-19', '2026-11-26', '2026-12-03', '2026-12-10', '2026-12-17', '2027-01-14', '2027-01-21']),
  /* Ćwiczenia GĆ 1,2 */
  ...eventsFromDates({ id: 'gs1_biol_c', subject: 'biol', subjectFull: 'Biologia Molekularna – Ćwiczenia', type: 'C', group: 'GĆ 1,2', timeStart: '12:35', timeEnd: '14:05', location: 'Zabrze-Rokitnica, ul. Jordana 19', contact: 'biolmedzab@sum.edu.pl' },
    ['2026-10-08', '2026-10-15', '2026-10-22', '2026-10-29', '2026-11-05', '2026-11-19', '2026-11-26', '2026-12-03', '2026-12-10', '2026-12-17', '2027-01-14', '2027-01-21']),
];

/* ---- KPP ---- */
const gs1_kpp = [
  /* Ćwiczenia CSM – ZRM */
  makeEvent({ id: 'gs1_kpp_csm_zrm1', subject: 'kpp', subjectFull: 'Kwalifikowana Pierwsza Pomoc – Ćwiczenia ZRM', type: 'CSM', group: 'GĆ 1,2', date: '2026-11-13', timeStart: '08:00', timeEnd: '11:45', location: 'CSM Zabrze, Pl. Dworcowy 3', contact: 'zrm@sum.edu.pl', notes: 'Zakład Ratownictwa Medycznego' }),
  makeEvent({ id: 'gs1_kpp_csm_zrm2', subject: 'kpp', subjectFull: 'Kwalifikowana Pierwsza Pomoc – Ćwiczenia ZRM', type: 'CSM', group: 'GĆ 1,2', date: '2026-11-20', timeStart: '08:00', timeEnd: '11:45', location: 'CSM Zabrze, Pl. Dworcowy 3', contact: 'zrm@sum.edu.pl', notes: 'Zakład Ratownictwa Medycznego' }),
  makeEvent({ id: 'gs1_kpp_csm_takt', subject: 'kpp', subjectFull: 'Kwalifikowana Pierwsza Pomoc – Medycyna Taktyczna', type: 'CSM', group: 'GĆ 1,2', date: '2026-11-27', timeStart: '08:00', timeEnd: '11:45', location: 'CSM Zabrze, Pl. Dworcowy 3', contact: 'zrm@sum.edu.pl', notes: 'Zakład Medycyny Taktycznej' }),
  /* Seminaria CSM – Kardioanestezja */
  makeEvent({ id: 'gs1_kpp_csm_kard1', subject: 'kpp', subjectFull: 'KPP – Seminarium (Kardioanestezja)', type: 'CSM', group: 'GS1', date: '2026-10-08', timeStart: '12:00', timeEnd: '13:30', location: 'CSM Zabrze, Pl. Dworcowy 3', contact: 'kardanest@sum.edu.pl' }),
  makeEvent({ id: 'gs1_kpp_csm_kard2', subject: 'kpp', subjectFull: 'KPP – Seminarium (Kardioanestezja)', type: 'CSM', group: 'GS1', date: '2026-10-15', timeStart: '12:00', timeEnd: '13:30', location: 'CSM Zabrze, Pl. Dworcowy 3', contact: 'kardanest@sum.edu.pl' }),
];

/* ---- PROFESJONALIZM ---- */
const gs1_prof = [
  /* Seminaria s.303 – Środy */
  ...eventsFromDates({ id: 'gs1_prof_s303', subject: 'prof', subjectFull: 'Profesjonalizm i Humanizm – Seminarium (s. 303)', type: 'S', group: 'GS1', timeStart: '08:00', timeEnd: '10:15', location: 'Pl. Traugutta 2, sala 303', contact: 'psychologiaihumanizacja@sum.edu.pl' },
    ['2026-11-18', '2026-11-25', '2026-12-02', '2026-12-09', '2026-12-16', '2027-01-13', '2027-01-20']),
  makeEvent({ id: 'gs1_prof_s303_ext', subject: 'prof', subjectFull: 'Profesjonalizm i Humanizm – Seminarium (s. 303)', type: 'S', group: 'GS1', date: '2027-01-27', timeStart: '08:00', timeEnd: '11:00', location: 'Pl. Traugutta 2, sala 303', contact: 'psychologiaihumanizacja@sum.edu.pl', notes: 'Zajęcia 3h (08:00–11:00)' }),
  /* Seminaria s.304 – Piątki */
  ...eventsFromDates({ id: 'gs1_prof_s304', subject: 'prof', subjectFull: 'Profesjonalizm i Humanizm – Seminarium (s. 304)', type: 'S', group: 'GS1', timeStart: '08:00', timeEnd: '10:15', location: 'Pl. Traugutta 2, sala 304', contact: 'psychologiaihumanizacja@sum.edu.pl' },
    ['2026-12-04', '2026-12-11', '2027-01-15']),
];

/* ---- JĘZYK ANGIELSKI ---- */
const jang_dates = {
  pn1: ['2026-10-05', '2026-10-12', '2026-10-19', '2026-10-26', '2026-11-02', '2026-11-16', '2026-11-23', '2026-12-14', '2026-12-18', '2027-01-25'],
  wt1: ['2026-10-06', '2026-10-13', '2026-10-20', '2026-10-27', '2026-11-03', '2026-11-17', '2026-11-24', '2026-12-01', '2026-12-08', '2027-01-12'],
  sr1: ['2026-10-07', '2026-10-14', '2026-10-21', '2026-10-28', '2026-11-04', '2026-11-18', '2026-11-25', '2026-12-02', '2026-12-09', '2027-01-13'],
  sr2: ['2026-10-07', '2026-10-14', '2026-10-28', '2026-11-04', '2026-11-18', '2026-11-25', '2026-12-02', '2026-12-09', '2026-12-16', '2027-01-13'],
  czw1: ['2026-10-08', '2026-10-15', '2026-10-22', '2026-10-29', '2026-11-05', '2026-11-19', '2026-11-26', '2026-12-03', '2026-12-10', '2027-01-14'],
  czw2: ['2026-10-08', '2026-10-15', '2026-10-29', '2026-11-05', '2026-11-19', '2026-11-26', '2026-12-03', '2026-12-10', '2026-12-17', '2027-01-14'],
  pt1: ['2026-10-09', '2026-10-16', '2026-10-23', '2026-10-30', '2026-11-06', '2026-11-20', '2026-11-27', '2026-12-04', '2026-12-11', '2027-01-15']
};

function getJang(groupName, datesKey, timeStart, timeEnd) {
  return eventsFromDates({
    id: groupName.replace(' ', '').toLowerCase() + '_jang', subject: 'jang', subjectFull: 'Język Angielski I',
    type: 'C', group: groupName, timeStart: timeStart, timeEnd: timeEnd,
    location: 'Zakład Komunikacji Międzynarodowej, Zabrze-Rokitnica, ul. Jordana 19',
    contact: 'jezykiobcezabrze@sum.edu.pl'
  }, jang_dates[datesKey]);
}

/* ---- WYCHOWANIE FIZYCZNE ---- */
const gs1_wf = eventsFromDates({
  id: 'gs1_wf', subject: 'wf', subjectFull: 'Wychowanie Fizyczne',
  type: 'C', group: 'GS1', timeStart: '08:00', timeEnd: '10:15',
  location: 'Zakład Adaptowanej Aktywności Fizycznej i Sportu, Zabrze-Rokitnica, ul. Jordana 19',
  contact: 'wf-azs@sum.edu.pl'
}, ['2026-10-09', '2026-10-16', '2026-10-23', '2026-10-30', '2026-11-06']);

/* ---- FAKULTETY ---- */
const gs1_fak1 = eventsFromDates({
  id: 'gs1_fak1', subject: 'fak', subjectFull: 'Fakultet 1: Psychologia zdrowia i radzenie sobie ze stresem',
  type: 'F', group: 'GS ½ 1 + GS ½ 2', timeStart: '10:30', timeEnd: '12:45',
  location: 'Aula, Zabrze-Rokitnica, ul. Jordana 19',
  contact: 'psychiatriatarnowskiegory@sum.edu.pl'
}, ['2026-10-20', '2026-10-27', '2026-11-03', '2026-11-10', '2026-11-17', '2026-11-24']);

const gs1_fak2 = eventsFromDates({
  id: 'gs1_fak2', subject: 'fak', subjectFull: 'Fakultet 2: Niepełnosprawność w medycynie',
  type: 'F', group: 'GS ½ 1 + GS ½ 2', timeStart: '10:30', timeEnd: '12:45',
  location: 'Aula, Zabrze-Rokitnica, ul. Jordana 19',
  contact: 'fizjozab@sum.edu.pl'
}, ['2026-12-01', '2026-12-08', '2026-12-15', '2027-01-12', '2027-01-19', '2027-01-26']);

/* ---- PAKOWANIE TERMINÓW ---- */

window.SCHEDULE_DATA['GS1'] = [
  ...gw_anat, ...gs1_anat,
  ...gw_hist, ...gs1_hist,
  ...gw_biol, //...gs1_biol,
  ...gw_kpp, //...gs1_kpp,
  ...gw_prof, //...gs1_prof,
  ...getJang('GS 1', 'wt1', '08:00', '10:15'),
];

window.SCHEDULE_DATA['GS2'] = [
  ...gw_anat, ...gs2_anat,
  ...gw_hist, ...gs2_hist,
  ...gw_biol, //...gs2_biol,
  ...gw_kpp, //...gs2_kpp,
  ...gw_prof, //...gs2_prof,
  ...getJang('GS 2', 'wt1', '10:30', '12:45'),

];

window.SCHEDULE_DATA['GS3'] = [
  ...gw_anat, ...gs3_anat,
  ...gw_hist, ...gs3_hist,
  ...gw_biol, //...gs3_biol,
  ...gw_kpp, //...gs3_kpp,
  ...gw_prof, //...gs3_prof,
  ...getJang('GS 3', 'pt1', '08:00', '10:15'),

];

window.SCHEDULE_DATA['GS4'] = [
  ...gw_anat, ...gs4_anat,
  ...gw_hist, ...gs4_hist,
  ...gw_biol, //...gs4_biol,
  ...gw_kpp, //...gs4_kpp,
  ...gw_prof, //...gs4_prof,
  ...getJang('GS 4', 'pt1', '10:15', '12:30'),

];

window.SCHEDULE_DATA['GS5'] = [
  ...gw_anat, ...gs5_anat,
  ...gw_hist, ...gs5_hist,
  ...gw_biol, //...gs5_biol,
  ...gw_kpp, //...gs5_kpp,
  ...gw_prof, //...gs5_prof,
  ...getJang('GS 5', 'sr1', '08:00', '10:15'),

];

window.SCHEDULE_DATA['GS6'] = [
  ...gw_anat, ...gs6_anat,
  ...gw_hist, ...gs6_hist,
  ...gw_biol, //...gs6_biol,
  ...gw_kpp, //...gs6_kpp,
  ...gw_prof, //...gs6_prof,
  ...getJang('GS 6', 'wt1', '12:45', '15:00'),

];

window.SCHEDULE_DATA['GS7'] = [
  ...gw_anat, ...gs7_anat,
  ...gw_hist, ...gs7_hist,
  ...gw_biol, //...gs7_biol,
  ...gw_kpp, //...gs7_kpp,
  ...gw_prof, //...gs7_prof,
  ...getJang('GS 7', 'pt1', '12:45', '15:00'),

];

window.SCHEDULE_DATA['GS8'] = [
  ...gw_anat, ...gs8_anat,
  ...gw_hist, ...gs8_hist,
  ...gw_biol, //...gs8_biol,
  ...gw_kpp, //...gs8_kpp,
  ...gw_prof, //...gs8_prof,
  ...getJang('GS 8', 'pn1', '10:15', '12:30'),

];

window.SCHEDULE_DATA['GS9'] = [
  ...gw_anat, ...gs9_anat,
  ...gw_hist, ...gs9_hist,
  ...gw_biol, //...gs9_biol,
  ...gw_kpp, //...gs9_kpp,
  ...gw_prof, //...gs9_prof,
  ...getJang('GS 9', 'czw2', '08:00', '10:15'),

];

window.SCHEDULE_DATA['GS10'] = [
  ...gw_anat, ...gs10_anat,
  ...gw_hist, ...gs10_hist,
  ...gw_biol, //...gs10_biol,
  ...gw_kpp, //...gs10_kpp,
  ...gw_prof, //...gs10_prof,
  ...getJang('GS 10', 'czw2', '10:30', '12:45'),

];

window.SCHEDULE_DATA['GS11'] = [
  ...gw_anat, ...gs11_anat,
  ...gw_hist, ...gs11_hist,
  ...gw_biol, //...gs11_biol,
  ...gw_kpp, //...gs11_kpp,
  ...gw_prof, //...gs11_prof,
  ...getJang('GS 11', 'sr2', '12:45', '15:00'),

];

window.SCHEDULE_DATA['GS12'] = [
  ...gw_anat, ...gs12_anat,
  ...gw_hist, ...gs12_hist,
  ...gw_biol, //...gs12_biol,
  ...gw_kpp, //...gs12_kpp,
  ...gw_prof, //...gs12_prof,
  ...getJang('GS 12', 'czw1', '12:45', '15:00'),

];