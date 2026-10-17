import { lookup, RISK } from './trackers.js';
import { siteOf } from './psl.js';

// tabId -> { url, site, owner, companies: { key: Company } }
const tabs = {};
const ready = chrome.storage.session.get('tabs').then((s) => Object.assign(tabs, s.tabs || {}));

let persistTimer;
function persist() {
  clearTimeout(persistTimer);
  persistTimer = setTimeout(() => chrome.storage.session.set({ tabs }), 400);
}

function freshTab(url) {
  let site = null;
  try {
    const u = new URL(url);
    if (u.protocol === 'http:' || u.protocol === 'https:') site = siteOf(u.hostname);
  } catch {}
  return { url, site, owner: site ? lookup(site)?.company || null : null, companies: {} };
}

async function tabState(tabId) {
  if (tabs[tabId]) return tabs[tabId];
  try {
    const t = await chrome.tabs.get(tabId);
    if (!tabs[tabId]) tabs[tabId] = freshTab(t.url || t.pendingUrl || '');
  } catch {
    return null;
  }
  return tabs[tabId];
}

const RANK = { high: 0, medium: 1, low: 2 };

export function summarize(tab) {
  if (!tab) return { site: null, companies: [], totals: { companies: 0, known: 0, domains: 0, sent: 0, set: 0 } };
  const companies = Object.values(tab.companies).map((c) => {
    const domains = Object.entries(c.domains).map(([host, d]) => ({ host, ...d }));
    const sent = domains.reduce((a, d) => a + d.sent, 0);
    const set = domains.reduce((a, d) => a + d.set, 0);
    return { ...c, domains, sent, set, risk: RISK[c.category] || 'medium' };
  });
  companies.sort((a, b) => RANK[a.risk] - RANK[b.risk] || Number(b.known) - Number(a.known) || (b.sent + b.set) - (a.sent + a.set));
  return {
    site: tab.site,
    companies,
    totals: {
      companies: companies.length,
      known: companies.filter((c) => c.known).length,
      high: companies.filter((c) => c.risk === 'high').length,
      domains: companies.reduce((a, c) => a + c.domains.length, 0),
      sent: companies.reduce((a, c) => a + c.sent, 0),
      set: companies.reduce((a, c) => a + c.set, 0),
    },
  };
}

function prettyName(site) {
  const base = site.split('.')[0];
  return base.charAt(0).toUpperCase() + base.slice(1);
}

async function record(details, kind, names) {
  if (details.tabId < 0 || !names.length || details.type === 'main_frame') return;
  await ready;
  const tab = await tabState(details.tabId);
  if (!tab?.site) return;

  let host;
  try {
    const u = new URL(details.url);
    if (u.protocol !== 'http:' && u.protocol !== 'https:') return;
    host = u.hostname.toLowerCase();
  } catch { return; }

  const site = siteOf(host);
  if (site === tab.site) return; // first-party

  const info = lookup(host);
  if (info && tab.owner && info.company === tab.owner) return; // same owner as the site you're on

  const key = info ? info.company : site;
  let isNew = false;
  let c = tab.companies[key];
  if (!c) {
    isNew = true;
    c = tab.companies[key] = {
      company: info ? info.company : prettyName(site),
      category: info ? info.category : 'Unidentified',
      known: !!info,
      firstSeen: Date.now(),
      domains: {},
    };
  }
  const d = (c.domains[host] ||= { sent: 0, set: 0, names: [] });
  d[kind] += 1;
  for (const n of names) {
    if (d.names.length >= 15) break;
    if (!d.names.includes(n)) d.names.push(n);
  }

  persist();
  refresh(details.tabId, isNew ? c.company : null);
}

// ── Badge + on-page widget updates (throttled per tab) ───────────────
const pending = {};
function refresh(tabId, newCompany) {
  const p = (pending[tabId] ||= { timer: null, fresh: [] });
  if (newCompany) p.fresh.push(newCompany);
  if (p.timer) return;
  p.timer = setTimeout(() => {
    const fresh = p.fresh;
    delete pending[tabId];
    const s = summarize(tabs[tabId]);
    paintBadge(tabId, s);
    chrome.tabs.sendMessage(tabId, { type: 'cw:update', summary: s, fresh }, { frameId: 0 }).catch(() => {});
  }, newCompany ? 150 : 600);
}

function paintBadge(tabId, s) {
  const n = s.totals.companies;
  chrome.action.setBadgeText({ tabId, text: n ? String(n) : '' }).catch(() => {});
  const color = s.totals.high ? '#ef4444' : n ? '#f59e0b' : '#22c55e';
  chrome.action.setBadgeBackgroundColor({ tabId, color }).catch(() => {});
  chrome.action.setBadgeTextColor?.({ tabId, color: '#ffffff' }).catch(() => {});
}

// ── Listeners (registered synchronously so the worker wakes for them) ─
chrome.webRequest.onBeforeSendHeaders.addListener(
  (d) => {
    const h = d.requestHeaders?.find((x) => x.name.toLowerCase() === 'cookie');
    if (!h?.value) return;
    const names = h.value.split(';').map((p) => p.split('=')[0].trim()).filter(Boolean);
    record(d, 'sent', names);
  },
  { urls: ['<all_urls>'] },
  ['requestHeaders', 'extraHeaders']
);

chrome.webRequest.onHeadersReceived.addListener(
  (d) => {
    const names = [];
    for (const h of d.responseHeaders || []) {
      if (h.name.toLowerCase() !== 'set-cookie' || !h.value) continue;
      // Chrome may fold multiple Set-Cookie headers into one value separated by newlines
      for (const line of h.value.split('\n')) {
        if (/;\s*partitioned/i.test(line)) continue; // CHIPS cookies can't follow you across sites
        if (/;\s*max-age=0/i.test(line) || /expires=thu, 01 jan 1970/i.test(line)) continue; // deletions
        const n = line.split('=')[0].trim();
        if (n) names.push(n);
      }
    }
    if (names.length) record(d, 'set', names);
  },
  { urls: ['<all_urls>'] },
  ['responseHeaders', 'extraHeaders']
);

chrome.webNavigation.onCommitted.addListener(async (d) => {
  if (d.frameId !== 0) return;
  await ready;
  tabs[d.tabId] = freshTab(d.url);
  persist();
  paintBadge(d.tabId, summarize(tabs[d.tabId]));
});

chrome.tabs.onRemoved.addListener(async (tabId) => {
  await ready;
  delete tabs[tabId];
  persist();
});

chrome.runtime.onMessage.addListener((msg, sender, reply) => {
  (async () => {
    await ready;
    const tabId = msg.tabId ?? sender.tab?.id;
    if (msg.type === 'cw:get') {
      const tab = tabId != null ? await tabState(tabId) : null;
      reply(summarize(tab));
    } else if (msg.type === 'cw:reset' && tabId != null) {
      const t = await tabState(tabId);
      if (t) t.companies = {};
      persist();
      const s = summarize(tabs[tabId]);
      paintBadge(tabId, s);
      chrome.tabs.sendMessage(tabId, { type: 'cw:update', summary: s, fresh: [] }, { frameId: 0 }).catch(() => {});
      reply(s);
    }
  })();
  return true;
});

chrome.runtime.onInstalled.addListener(async () => {
  const { overlay } = await chrome.storage.local.get('overlay');
  if (overlay === undefined) chrome.storage.local.set({ overlay: true });
});
