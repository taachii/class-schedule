// Deklaratywny opis serwera. Nie dotyka Discorda, więc można go testować i wypisać w --dry-run.

import { allGroups, gcOfGk, gkOfGc, gsOfGc, toRoman } from './groups.js';
import { buildTags, MAX_TAGS, MAX_TAG_LEN } from './subjects.js';

export const LIMITS = { channels: 500, perCategory: 50, roles: 250, onboardingOptions: 50 };

// ── Nazwy ────────────────────────────────────────────────────────────────────
export const N = {
  catInfo: '📌 INFORMACJE',
  catGeneral: '💬 OGÓLNE',
  catAdmin: '🛠️ ADMINISTRACJA',
  catGs: (n) => `🟦 GS${n}`,
  catArchive: (year) => `📦 ARCHIWUM · ROK ${toRoman(year)}`,

  rules: 'regulamin',
  yearNews: '📢-ogłoszenia-roku',
  plan: 'plan-zajęć',
  starosci: 'starostowie',
  botLog: 'bot-log',

  gsNews: (n) => `📢-gs${n}-ogłoszenia`,
  gsChat: (n) => `gs${n}-czat`,
  gsVoice: (n) => `GS${n}`,
  gcChat: (m) => `gc${m}-czat`,
  gcVoice: (m) => `GC${m}`,
  gcForum: (m) => `📚-gc${m}-przedmioty`,
  gcArchivedForum: (m, year) => `📚-gc${m}-rok-${toRoman(year).toLowerCase()}`,
  gkNews: (k) => `📢-gk${k}-ogłoszenia`,
  gkChat: (k) => `gk${k}-czat`,

  indexPost: '📌 Spis przedmiotów',
};

export const ROLE = {
  admin: 'Admin',
  stRok: 'Starosta Roku',
  stGs: 'Starosta GS',
  stGc: 'Starosta GC',
  stGk: 'Starosta GK',
  gs: (n) => `GS${n}`,
  gc: (m) => `GC${m}`,
  gk: (k) => `GK${k}`,
};

// ── Uprawnienia ──────────────────────────────────────────────────────────────
const WRITE = ['SendMessages', 'SendMessagesInThreads', 'CreatePublicThreads', 'CreatePrivateThreads'];
const EVERYONE = '@everyone';
const role = (name) => `role:${name}`;
const user = (id) => `user:${id}`;
const ow = (target, allow = [], deny = []) => ({ target, allow, deny });

/** Łączy listy nadpisań; późniejsze wpisy dla tego samego celu wygrywają w konflikcie allow/deny. */
export function mergeOverwrites(...lists) {
  const map = new Map();
  for (const o of lists.flat()) {
    const cur = map.get(o.target) ?? { target: o.target, allow: new Set(), deny: new Set() };
    for (const p of o.allow) { cur.deny.delete(p); cur.allow.add(p); }
    for (const p of o.deny) { cur.allow.delete(p); cur.deny.add(p); }
    map.set(o.target, cur);
  }
  return [...map.values()].map((o) => ({ target: o.target, allow: [...o.allow], deny: [...o.deny] }));
}

const starostaUsers = (starosci, key) => (starosci?.[key] ?? []).filter(Boolean).map(String);
const announcerOverwrites = (ids) =>
  ids.map((id) => ow(user(id), ['ViewChannel', 'SendMessages', 'ManageMessages', 'MentionEveryone']));

// ── Plan ─────────────────────────────────────────────────────────────────────
/**
 * @param {object} p
 * @param {number} p.year        rok studiów 1–6
 * @param {1|2}    p.semester    aktualny semestr (1 zimowy, 2 letni)
 * @param {object} p.config      config/server.json
 * @param {Array}  p.subjects    wynik fetchSubjects
 * @param {object} p.starosci    config/starosci.json
 */
export function buildPlan({ year, semester = 1, config, subjects, starosci = {} }) {
  const gsCount = config.gsCount ?? 12;
  const clinicalFromYear = config.clinicalFromYear ?? 3;
  const clinical = year >= clinicalFromYear;
  const colors = config.colors ?? {};
  const groups = allGroups(gsCount, year, clinicalFromYear);
  const warnings = [];
  const errors = [];

  // Role (kolejność = od najwyższej)
  const roles = [
    { name: ROLE.admin, color: colors[ROLE.admin], hoist: true, permissions: ['Administrator'] },
    { name: ROLE.stRok, color: colors[ROLE.stRok], hoist: true },
    { name: ROLE.stGs, color: colors[ROLE.stGs], hoist: true },
    { name: ROLE.stGc, color: colors[ROLE.stGc], hoist: true },
    { name: ROLE.stGk, color: colors[ROLE.stGk], hoist: true },
  ];
  for (const g of groups) roles.push({ name: ROLE.gs(g.gs) });
  for (const g of groups) for (const c of g.gc) roles.push({ name: ROLE.gc(c.gc) });
  if (clinical) for (const g of groups) for (const c of g.gc) for (const k of c.gk) roles.push({ name: ROLE.gk(k) });

  // Kategorie
  const readOnlyEveryone = ow(EVERYONE, ['ViewChannel', 'AddReactions', 'ReadMessageHistory'], WRITE);
  const categories = [];

  categories.push({
    name: N.catInfo,
    overwrites: [readOnlyEveryone],
    channels: [
      { type: 'text', name: N.rules, topic: 'Regulamin serwera.' },
      {
        type: 'announcement',
        name: N.yearNews,
        topic: 'Ogłoszenia dla CAŁEGO roku. Piszą tylko starości roku.',
        overwrites: [
          ow(role(ROLE.stRok), ['SendMessages', 'ManageMessages', 'MentionEveryone']),
          ...announcerOverwrites(starostaUsers(starosci, 'rok')),
        ],
      },
      { type: 'text', name: N.plan, topic: `Plan zajęć: ${config.planUrl ?? 'https://planwnmz.pl'}` },
    ],
  });

  categories.push({
    name: N.catGeneral,
    overwrites: [ow(EVERYONE, ['ViewChannel', 'SendMessages', 'SendMessagesInThreads', 'CreatePublicThreads'])],
    channels: [
      { type: 'text', name: 'ogólny', topic: 'Rozmowy całego roku.' },
      { type: 'text', name: 'pytania', topic: 'Pytania organizacyjne i do starostów.' },
      { type: 'text', name: 'nauka', topic: 'Wspólna nauka, materiały ogólne.' },
      { type: 'text', name: 'ankiety', topic: 'Ankiety i głosowania roku.' },
      { type: 'text', name: 'off-topic' },
      { type: 'voice', name: 'Ogólny' },
      { type: 'voice', name: 'Nauka 1' },
      { type: 'voice', name: 'Nauka 2' },
    ],
  });

  const forums = [];
  for (const g of groups) {
    const n = g.gs;
    const catOw = [ow(EVERYONE, [], ['ViewChannel']), ow(role(ROLE.gs(n)), ['ViewChannel'])];
    const gsStar = starostaUsers(starosci, ROLE.gs(n));
    const channels = [
      {
        type: 'announcement',
        name: N.gsNews(n),
        topic: `Ogłoszenia dla całej GS${n}.`,
        overwrites: [ow(role(ROLE.gs(n)), ['AddReactions'], WRITE), ...announcerOverwrites(gsStar)],
      },
      { type: 'text', name: N.gsChat(n), topic: `Czat GS${n}.` },
      { type: 'voice', name: N.gsVoice(n) },
    ];

    for (const c of g.gc) {
      const m = c.gc;
      const only = [ow(role(ROLE.gs(n)), [], ['ViewChannel']), ow(role(ROLE.gc(m)), ['ViewChannel'])];
      const gcStar = starostaUsers(starosci, ROLE.gc(m));
      channels.push(
        { type: 'text', name: N.gcChat(m), topic: `Czat GC${m}.`, overwrites: only },
        { type: 'voice', name: N.gcVoice(m), overwrites: only }
      );

      const gkTags = c.gk.map((k) => ROLE.gk(k));
      const t = buildTags(subjects, config, gkTags);
      warnings.push(...t.warnings.map((w) => `[GC${m}] ${w}`));
      errors.push(...t.errors.map((e) => `[GC${m}] ${e}`));

      const posts = subjects
        .filter((s) => s.semesters.length === 0 || s.semesters.some((x) => x <= semester))
        .map((s) => ({ key: s.key, title: s.label.slice(0, 100), tag: t.subjectTag[s.key], semesters: s.semesters }));

      const forum = {
        type: 'forum',
        name: N.gcForum(m),
        gc: m,
        topic: `Forum przedmiotowe GC${m}. Każdy post musi mieć tag przedmiotu.`,
        tags: t.tags,
        posts,
        semester,
        overwrites: [
          ...only,
          ow(role(ROLE.gc(m)), ['SendMessages', 'SendMessagesInThreads', 'AddReactions']),
          ...gcStar.map((id) => ow(user(id), ['ManageThreads', 'ManageMessages'])),
        ],
      };
      channels.push(forum);
      forums.push(forum);

      for (const k of c.gk) {
        const onlyGk = [ow(role(ROLE.gs(n)), [], ['ViewChannel']), ow(role(ROLE.gk(k)), ['ViewChannel'])];
        const gkStar = starostaUsers(starosci, ROLE.gk(k));
        channels.push(
          {
            type: 'announcement',
            name: N.gkNews(k),
            topic: `Ogłoszenia GK${k}.`,
            overwrites: [...onlyGk, ow(role(ROLE.gk(k)), ['AddReactions'], WRITE), ...announcerOverwrites(gkStar)],
          },
          { type: 'text', name: N.gkChat(k), topic: `Czat GK${k}.`, overwrites: onlyGk },
        );
      }
    }
    categories.push({ name: N.catGs(n), overwrites: catOw, channels });
  }

  categories.push({
    name: N.catAdmin,
    overwrites: [
      ow(EVERYONE, [], ['ViewChannel']),
      ...[ROLE.stRok, ROLE.stGs, ROLE.stGc, ROLE.stGk].map((r) => ow(role(r), ['ViewChannel', 'SendMessages'])),
    ],
    channels: [
      { type: 'text', name: N.starosci, topic: 'Kanał starostów.' },
      {
        type: 'text',
        name: N.botLog,
        topic: 'Logi skryptu discord-setup.',
        overwrites: [ROLE.stRok, ROLE.stGs, ROLE.stGc, ROLE.stGk].map((r) => ow(role(r), [], ['ViewChannel'])),
      },
    ],
  });

  // Pełne (jawne) nadpisania kanałów = kategoria + własne
  for (const cat of categories) {
    for (const ch of cat.channels) ch.overwrites = mergeOverwrites(cat.overwrites, ch.overwrites ?? []);
  }

  // Role starostów do nadania
  const memberRoles = [];
  const addMember = (id, r) => memberRoles.push({ userId: String(id), role: r });
  for (const [key, ids] of Object.entries(starosci ?? {})) {
    if (!Array.isArray(ids)) continue;
    const r =
      key === 'rok' ? ROLE.stRok
      : /^GS\d+$/.test(key) ? ROLE.stGs
      : /^GC\d+$/.test(key) ? ROLE.stGc
      : /^GK\d+$/.test(key) ? ROLE.stGk
      : null;
    if (!r) { warnings.push(`starosci.json: nieznany klucz "${key}" – pomijam.`); continue; }
    if (r === ROLE.stGk && !clinical) continue;
    ids.filter(Boolean).forEach((id) => addMember(id, r));
  }

  // Onboarding
  const options = [];
  for (const g of groups) {
    for (const c of g.gc) {
      if (clinical) {
        for (const k of c.gk) {
          options.push({
            title: ROLE.gk(k),
            description: `${ROLE.gc(c.gc)} · ${ROLE.gs(g.gs)}`,
            roles: [ROLE.gk(k), ROLE.gc(c.gc), ROLE.gs(g.gs)],
          });
        }
      } else {
        options.push({ title: ROLE.gc(c.gc), description: ROLE.gs(g.gs), roles: [ROLE.gc(c.gc), ROLE.gs(g.gs)] });
      }
    }
  }
  const onboarding = {
    title: clinical ? 'Twoja grupa kliniczna (GK)' : 'Twoja grupa ćwiczeniowa (GC)',
    options,
    defaultChannels: [N.rules, N.yearNews, N.plan, 'ogólny', 'pytania', 'nauka', 'ankiety', 'off-topic'],
  };

  return { year, semester, clinical, roles, categories, forums, memberRoles, onboarding, warnings, errors };
}

// ── Walidacja limitów ────────────────────────────────────────────────────────
export function countChannels(plan) {
  return plan.categories.reduce((sum, c) => sum + 1 + c.channels.length, 0);
}

/** @param archivedYears  ile lat zarchiwizowano (każdy = 1 kategoria + 1 forum na GC) */
export function validatePlan(plan, { archivedYears = Math.max(0, plan.year - 1) } = {}) {
  const errors = [...plan.errors];
  const archived = archivedYears * (1 + plan.forums.length);
  const total = countChannels(plan) + archived;

  if (total > LIMITS.channels) errors.push(`Kanały: ${total} > ${LIMITS.channels}.`);
  for (const c of plan.categories) {
    if (c.channels.length > LIMITS.perCategory) errors.push(`Kategoria "${c.name}": ${c.channels.length} > ${LIMITS.perCategory} kanałów.`);
  }
  if (plan.roles.length > LIMITS.roles) errors.push(`Role: ${plan.roles.length} > ${LIMITS.roles}.`);
  if (plan.onboarding.options.length > LIMITS.onboardingOptions) {
    errors.push(`Onboarding: ${plan.onboarding.options.length} > ${LIMITS.onboardingOptions} opcji.`);
  }
  for (const f of plan.forums) {
    if (f.tags.length > MAX_TAGS) errors.push(`${f.name}: ${f.tags.length} tagów > ${MAX_TAGS}.`);
    for (const t of f.tags) if (t.length > MAX_TAG_LEN) errors.push(`${f.name}: tag "${t}" > ${MAX_TAG_LEN} znaków.`);
  }
  return {
    errors,
    stats: { channelsActive: countChannels(plan), channelsArchived: archived, channelsTotal: total, roles: plan.roles.length },
  };
}

// ── Archiwum ─────────────────────────────────────────────────────────────────
export function archiveCategorySpec(year) {
  return { name: N.catArchive(year), overwrites: [ow(EVERYONE, [], ['ViewChannel'])] };
}

export function archivedForumOverwrites(m) {
  return mergeOverwrites(
    [ow(EVERYONE, [], ['ViewChannel'])],
    [ow(role(ROLE.gc(m)), ['ViewChannel', 'ReadMessageHistory'], [...WRITE, 'AddReactions'])],
  );
}

export { gsOfGc, gcOfGk, gkOfGc };
