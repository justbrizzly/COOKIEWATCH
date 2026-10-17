const COLOR = { high: '#ef4444', medium: '#f59e0b', low: '#38bdf8' };
const $ = (id) => document.getElementById(id);
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

let tabId;
const openCards = new Set();

function render(s) {
  const t = s.totals;
  $('site').textContent = s.site || 'No website in this tab';

  let accent = '#22c55e', headline = 'No cookie tracking', sub = 'No third-party cookies exchanged on this page.';
  if (!s.site) { headline = 'Nothing to scan'; sub = 'Open a website to start monitoring.'; }
  else if (t.high) {
    accent = COLOR.high; headline = 'You are being tracked';
    sub = `${t.companies} ${t.companies === 1 ? 'company is' : 'companies are'} exchanging cookies with you here — ${t.high} of them high-risk trackers.`;
  } else if (t.companies) {
    accent = COLOR.medium; headline = 'Third-party cookies active';
    sub = `${t.companies} outside ${t.companies === 1 ? 'company is' : 'companies are'} reading or writing cookies.`;
  }
  document.documentElement.style.setProperty('--accent', accent);
  $('headline').textContent = headline;
  $('subline').textContent = sub;
  $('count').textContent = t.companies;
  const pct = Math.min(t.companies / 12, 1);
  $('bar').style.strokeDashoffset = String(169.6 * (1 - pct));

  $('s-known').textContent = t.known;
  $('s-domains').textContent = t.domains;
  $('s-sent').textContent = t.sent;
  $('s-set').textContent = t.set;

  if (!s.companies.length) {
    $('list').innerHTML = s.site ? `<div class="empty"><b>Clean so far</b>Keep browsing — new trackers appear here live.</div>` : '';
    return;
  }
  $('list').innerHTML = s.companies.map((c) => `
    <details class="card" data-k="${esc(c.company)}" style="--c:${COLOR[c.risk]}" ${openCards.has(c.company) ? 'open' : ''}>
      <summary>
        <div class="av">${esc(c.company.charAt(0))}</div>
        <div class="meta">
          <div class="name">${esc(c.company)}${c.known ? '' : '<span class="unk">unverified owner</span>'}</div>
          <div class="sub">${c.domains.length} domain${c.domains.length > 1 ? 's' : ''} · ${c.sent} sent · ${c.set} set</div>
        </div>
        <span class="tag">${esc(c.category)}</span>
      </summary>
      <div class="dom">${c.domains.map((d) => `
        <div>
          <div class="h"><code>${esc(d.host)}</code><span>${d.sent}↑ ${d.set}↓</span></div>
          <div class="chips">${d.names.map((n) => `<i>${esc(n)}</i>`).join('')}</div>
        </div>`).join('')}
      </div>
    </details>`).join('');
  for (const el of document.querySelectorAll('.card')) {
    el.addEventListener('toggle', () => (el.open ? openCards.add(el.dataset.k) : openCards.delete(el.dataset.k)));
  }
}

let lastJson = '';
async function load() {
  const s = await chrome.runtime.sendMessage({ type: 'cw:get', tabId });
  const j = JSON.stringify(s);
  if (j !== lastJson) { lastJson = j; render(s); }
}

(async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  const q = new URLSearchParams(location.search).get('tabId'); // used for preview/testing
  tabId = q ? Number(q) : tab?.id;
  const { overlay } = await chrome.storage.local.get('overlay');
  $('overlay').checked = overlay !== false;
  $('overlay').addEventListener('change', (e) => chrome.storage.local.set({ overlay: e.target.checked }));
  $('reset').addEventListener('click', async () => render(await chrome.runtime.sendMessage({ type: 'cw:reset', tabId })));
  await load();
  setInterval(load, 1500); // live refresh while popup is open
})();
