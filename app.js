/**
 * app.js — Schedule App Logic
 * Handles: group tabs, calendar rendering, list view, event modal, filters
 */

/* ===========================
   STATE
   =========================== */
const state = {
  activeGroup: 'GS1',
  activeView: 'calendar',
  currentYear: 2026,
  currentMonth: 9,   // 0-indexed → October
  activeSubjects: new Set(SUBJECTS.map(s => s.key)),
};

/* ===========================
   CONSTANTS
   =========================== */
const MONTH_NAMES_PL = [
  'Styczeń', 'Luty', 'Marzec', 'Kwiecień', 'Maj', 'Czerwiec',
  'Lipiec', 'Sierpień', 'Wrzesień', 'Październik', 'Listopad', 'Grudzień'
];

const DAY_NAMES_PL = ['Pon', 'Wt', 'Śr', 'Czw', 'Pt', 'Sob', 'Nd'];

/* ===========================
   DOM REFS
   =========================== */
const $ = id => document.getElementById(id);
const groupTabs = $('groupTabs');
const subjectFilters = $('subjectFilters');
const filterReset = $('filterReset');
const calendarGrid = $('calendarGrid');
const calMonthTitle = $('calMonthTitle');
const prevMonthBtn = $('prevMonth');
const nextMonthBtn = $('nextMonth');
const listGroups = $('listGroups');
const viewCalendar = $('view-calendar');
const viewList = $('view-list');
const modalOverlay = $('modalOverlay');
const modalClose = $('modalClose');
const comingSoon = $('comingSoonOverlay');
const btnCalendar = $('btnCalendar');
const btnList = $('btnList');

/* ===========================
   INIT
   =========================== */
function init() {
  buildSubjectFilters();
  bindGroupTabs();
  bindViewToggle();
  bindCalendarNav();
  bindModal();
  renderCurrentGroup();
}

/* ===========================
   SUBJECT FILTER CHIPS
   =========================== */
function buildSubjectFilters() {
  subjectFilters.innerHTML = '';
  SUBJECTS.forEach(s => {
    const btn = document.createElement('button');
    btn.className = 'filter-chip active';
    btn.textContent = s.shortLabel;
    btn.dataset.subject = s.key;
    // Set CSS variables for the active state colors
    btn.style.setProperty('--chip-bg', hexToRgba(s.color, 0.2));
    btn.style.setProperty('--chip-color', s.color);
    btn.style.setProperty('--chip-border', hexToRgba(s.color, 0.5));
    btn.addEventListener('click', () => toggleSubjectFilter(s.key));
    subjectFilters.appendChild(btn);
  });

  filterReset.addEventListener('click', () => {
    state.activeSubjects = new Set(SUBJECTS.map(s => s.key));
    updateFilterChips();
    renderCurrentGroup();
  });
}

function toggleSubjectFilter(key) {
  if (state.activeSubjects.has(key)) {
    state.activeSubjects.delete(key);
  } else {
    state.activeSubjects.add(key);
  }
  updateFilterChips();
  renderCurrentGroup();
}

function updateFilterChips() {
  subjectFilters.querySelectorAll('.filter-chip').forEach(btn => {
    const isActive = state.activeSubjects.has(btn.dataset.subject);
    btn.classList.toggle('active', isActive);
  });
}

/* ===========================
   GROUP TABS
   =========================== */
function bindGroupTabs() {
  groupTabs.querySelectorAll('.group-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      const g = tab.dataset.group;
      state.activeGroup = g;
      groupTabs.querySelectorAll('.group-tab').forEach(t => {
        t.classList.remove('active');
        t.setAttribute('aria-selected', 'false');
      });
      tab.classList.add('active');
      tab.setAttribute('aria-selected', 'true');
      renderCurrentGroup();
    });
  });
}

/* ===========================
   VIEW TOGGLE
   =========================== */
function bindViewToggle() {
  btnCalendar.addEventListener('click', () => switchView('calendar'));
  btnList.addEventListener('click', () => switchView('list'));
}

function switchView(view) {
  state.activeView = view;
  btnCalendar.classList.toggle('active', view === 'calendar');
  btnList.classList.toggle('active', view === 'list');
  btnCalendar.setAttribute('aria-pressed', String(view === 'calendar'));
  btnList.setAttribute('aria-pressed', String(view === 'list'));
  viewCalendar.classList.toggle('hidden', view !== 'calendar');
  viewList.classList.toggle('hidden', view !== 'list');
  renderCurrentGroup();
}

/* ===========================
   RENDER DISPATCHER
   =========================== */
function renderCurrentGroup() {
  const data = SCHEDULE_DATA[state.activeGroup];

  if (data === null) {
    // Coming soon
    comingSoon.classList.remove('hidden');
    return;
  }
  comingSoon.classList.add('hidden');

  const filtered = data.filter(ev => state.activeSubjects.has(ev.subject));

  if (state.activeView === 'calendar') {
    renderCalendar(filtered);
  } else {
    renderList(filtered);
  }
}

/* ===========================
   CALENDAR
   =========================== */
function bindCalendarNav() {
  prevMonthBtn.addEventListener('click', () => {
    state.currentMonth--;
    if (state.currentMonth < 0) { state.currentMonth = 11; state.currentYear--; }
    renderCurrentGroup();
  });
  nextMonthBtn.addEventListener('click', () => {
    state.currentMonth++;
    if (state.currentMonth > 11) { state.currentMonth = 0; state.currentYear++; }
    renderCurrentGroup();
  });
}

function renderCalendar(events) {
  calMonthTitle.textContent = `${MONTH_NAMES_PL[state.currentMonth]} ${state.currentYear}`;
  calendarGrid.innerHTML = '';

  // Headers
  DAY_NAMES_PL.forEach((day, i) => {
    const cell = document.createElement('div');
    cell.className = 'cal-header-cell' + (i >= 5 ? ' weekend' : '');
    cell.textContent = day;
    calendarGrid.appendChild(cell);
  });

  // Days in month
  const firstDay = new Date(state.currentYear, state.currentMonth, 1);
  // JS: 0=Sun, convert to Mon-based
  let startDow = firstDay.getDay();
  startDow = startDow === 0 ? 6 : startDow - 1;

  const daysInMonth = new Date(state.currentYear, state.currentMonth + 1, 0).getDate();
  const daysInPrev = new Date(state.currentYear, state.currentMonth, 0).getDate();

  const today = new Date();
  const todayStr = toIso(today.getFullYear(), today.getMonth() + 1, today.getDate());

  // Event lookup by date
  const byDate = {};
  events.forEach(ev => {
    if (!byDate[ev.date]) byDate[ev.date] = [];
    byDate[ev.date].push(ev);
  });

  // Fill grid: prev month padding + current month + next month padding
  const totalCells = Math.ceil((startDow + daysInMonth) / 7) * 7;

  for (let i = 0; i < totalCells; i++) {
    const cell = document.createElement('div');
    cell.className = 'cal-day';

    let day, month, year, dateStr, isOther = false;
    if (i < startDow) {
      day = daysInPrev - startDow + i + 1;
      month = state.currentMonth === 0 ? 12 : state.currentMonth;
      year = state.currentMonth === 0 ? state.currentYear - 1 : state.currentYear;
      isOther = true;
    } else if (i >= startDow + daysInMonth) {
      day = i - startDow - daysInMonth + 1;
      month = state.currentMonth === 11 ? 1 : state.currentMonth + 2;
      year = state.currentMonth === 11 ? state.currentYear + 1 : state.currentYear;
      isOther = true;
    } else {
      day = i - startDow + 1;
      month = state.currentMonth + 1;
      year = state.currentYear;
    }
    dateStr = toIso(year, month, day);

    if (isOther) cell.classList.add('other-month');
    if (dateStr === todayStr) cell.classList.add('today');
    const dow = (startDow + (day - 1)) % 7; // not quite right for prev/next; use Date instead
    const d = new Date(year, month - 1, day);
    const dayOfWeek = d.getDay();
    if (dayOfWeek === 0 || dayOfWeek === 6) cell.classList.add('weekend');

    // Day number
    const numEl = document.createElement('div');
    numEl.className = 'cal-day-num';
    numEl.textContent = day;
    cell.appendChild(numEl);

    // Events for this date
    const dayEvents = (byDate[dateStr] || [])
      .sort((a, b) => a.timeStart.localeCompare(b.timeStart));

    const evContainer = document.createElement('div');
    evContainer.className = 'cal-events';
    dayEvents.forEach(ev => {
      const chip = document.createElement('div');
      chip.className = `cal-event ev-${ev.subject}`;
      chip.title = `${ev.subjectFull} (${ev.timeStart}–${ev.timeEnd})`;
      chip.textContent = `${ev.timeStart} ${getSubjectShort(ev.subject)}`;
      chip.textContent += ` [${ev.type}]`;
      chip.addEventListener('click', () => openModal(ev));
      evContainer.appendChild(chip);
    });

    cell.appendChild(evContainer);
    calendarGrid.appendChild(cell);
  }
}

/* ===========================
   LIST VIEW
   =========================== */
function renderList(events) {
  listGroups.innerHTML = '';

  // Group by subject
  const bySubject = {};
  SUBJECTS.forEach(s => { bySubject[s.key] = []; });
  events.forEach(ev => {
    if (bySubject[ev.subject]) bySubject[ev.subject].push(ev);
  });

  SUBJECTS.forEach(subj => {
    const evs = bySubject[subj.key];
    if (!evs.length) return;

    const block = document.createElement('div');
    block.className = 'list-subject-block';

    // Sort by date then time
    evs.sort((a, b) => a.date.localeCompare(b.date) || a.timeStart.localeCompare(b.timeStart));

    // Header
    const hdr = document.createElement('div');
    hdr.className = 'list-subject-header';
    hdr.innerHTML = `
      <div class="subject-color-bar" style="background:${subj.color}"></div>
      <div class="list-subject-title">${subj.label}</div>
      <div class="list-subject-meta">${evs.length} zajęć</div>
      <div class="list-subject-toggle">▼</div>
    `;
    hdr.addEventListener('click', () => block.classList.toggle('collapsed'));
    block.appendChild(hdr);

    // Table
    const tableWrapper = document.createElement('div');
    const table = document.createElement('table');
    table.className = 'list-events-table';
    table.innerHTML = `
      <thead>
        <tr>
          <th>Data</th>
          <th>Dzień</th>
          <th>Godziny</th>
          <th>Typ</th>
          <th>Grupa</th>
          <th>Miejsce</th>
          <th>Uwagi</th>
        </tr>
      </thead>
      <tbody id="tbody-${subj.key}"></tbody>
    `;
    tableWrapper.appendChild(table);
    block.appendChild(tableWrapper);
    listGroups.appendChild(block);

    const tbody = table.querySelector('tbody');
    evs.forEach(ev => {
      const d = new Date(ev.date);
      const dateDisp = d.toLocaleDateString('pl-PL', { day: '2-digit', month: '2-digit', year: 'numeric' });
      const dayName = d.toLocaleDateString('pl-PL', { weekday: 'long' });
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${dateDisp}</td>
        <td style="text-transform:capitalize">${dayName}</td>
        <td>${ev.timeStart}–${ev.timeEnd}</td>
        <td><span class="type-badge t-${ev.type}">${TYPE_LABELS[ev.type] || ev.type}</span></td>
        <td>${ev.group}</td>
        <td>${ev.location}</td>
        <td>${ev.notes || '—'}</td>
      `;
      tr.style.cursor = 'pointer';
      tr.addEventListener('click', () => openModal(ev));
      tbody.appendChild(tr);
    });
  });

  if (!listGroups.children.length) {
    listGroups.innerHTML = '<div style="text-align:center;padding:48px;color:var(--text-muted)">Brak zajęć spełniających kryteria filtrowania.</div>';
  }
}

/* ===========================
   MODAL
   =========================== */
function bindModal() {
  modalClose.addEventListener('click', closeModal);
  modalOverlay.addEventListener('click', e => { if (e.target === modalOverlay) closeModal(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });
}

function openModal(ev) {
  const subj = SUBJECTS.find(s => s.key === ev.subject);
  const color = subj ? subj.color : '#4f8ef7';

  // Type badge
  const typeBadge = $('modalTypeBadge');
  typeBadge.textContent = TYPE_LABELS[ev.type] || ev.type;
  typeBadge.className = 'modal-type-badge';
  typeBadge.style.background = hexToRgba(color, 0.2);
  typeBadge.style.color = color;

  $('modalTitle').textContent = ev.subjectFull;
  $('modalHeader').style.borderBottom = `2px solid ${hexToRgba(color, 0.4)}`;

  // Date
  const d = new Date(ev.date);
  const dayName = d.toLocaleDateString('pl-PL', { weekday: 'long' });
  const dateStr = d.toLocaleDateString('pl-PL', { day: '2-digit', month: 'long', year: 'numeric' });
  $('modalDate').textContent = `${dayName.charAt(0).toUpperCase() + dayName.slice(1)}, ${dateStr}`;

  // Body
  const body = $('modalBody');
  body.innerHTML = '';

  const rows = [
    { icon: '🕐', label: 'Godziny', value: `${ev.timeStart} – ${ev.timeEnd}` },
    { icon: '👥', label: 'Grupa', value: ev.group },
    { icon: '📍', label: 'Miejsce', value: ev.location },
    { icon: '✉️', label: 'Kontakt', value: ev.contact, isEmail: true },
  ];
  if (ev.notes) rows.push({ icon: '📝', label: 'Uwagi', value: ev.notes });

  rows.forEach(row => {
    const div = document.createElement('div');
    div.className = 'modal-info-row';
    const valHtml = row.isEmail
      ? `<a class="modal-info-link" href="mailto:${row.value}">${row.value}</a>`
      : row.value;
    div.innerHTML = `
      <div class="modal-info-icon">${row.icon}</div>
      <div class="modal-info-content">
        <div class="modal-info-label">${row.label}</div>
        <div class="modal-info-value">${valHtml}</div>
      </div>
    `;
    body.appendChild(div);
  });

  modalOverlay.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  modalOverlay.classList.remove('open');
  document.body.style.overflow = '';
}

/* ===========================
   HELPERS
   =========================== */
function toIso(year, month, day) {
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

function getSubjectShort(key) {
  const s = SUBJECTS.find(s => s.key === key);
  return s ? s.shortLabel : key;
}

function hexToRgba(hex, alpha) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

/* ===========================
   BOOT
   =========================== */
document.addEventListener('DOMContentLoaded', init);
