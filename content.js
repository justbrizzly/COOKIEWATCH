// On-page floating widget. Lives in a closed Shadow DOM so the site's CSS
// can't touch it and the site's scripts can't read it.
(() => {
  if (window.top !== window || window.__cookieWatch) return;
  window.__cookieWatch = true;

  let enabled = true;
  let dismissed = false;
  let open = false;
  let last = null;
  let host, root, els;

  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  const CSS = `
    :host { all: initial; }
    * { box-sizing: border-box; }
    .wrap { position: fixed; right: 18px; bottom: 18px; z-index: 2147483647;
      font: 500 13px/1.35 ui-sans-serif, -apple-system, "Segoe UI", Inter, Roboto, sans-serif;
      color: #e8ebf2; display: flex; flex-direction: column; align-items: flex-end; gap: 10px;
      opacity: 0; transform: translateY(12px); transition: opacity .25s ease, transform .25s ease; pointer-events: none; }
    .wrap.show { opacity: 1; transform: none; pointer-events: auto; }
    .pill { display: flex; align-items: center; gap: 10px; padding: 8px 8px 8px 12px; border-radius: 999px;
      background: rgba(14,16,22,.86); backdrop-filter: blur(14px) saturate(160%); -webkit-backdrop-filter: blur(14px) saturate(160%);
      border: 1px solid rgba(255,255,255,.08); box-shadow: 0 10px 30px rgba(0,0,0,.35), inset 0 1px 0 rgba(255,255,255,.05);
      cursor: pointer; user-select: none; }
    .dot { width: 9px; height: 9px; border-radius: 50%; background: var(--c); box-shadow: 0 0 0 0 var(--c); animation: ping 2.2s infinite; }
    @keyframes ping { 0% { box-shadow: 0 0 0 0 color-mix(in srgb, var(--c) 60%, transparent); } 70%,100% { box-shadow: 0 0 0 8px transparent; } }
    .label b { font-weight: 700; color: #fff; }
    .label small { display: block; color: #8b93a7; font-size: 11px; font-weight: 500; }
    .x { border: 0; background: rgba(255,255,255,.06); color: #8b93a7; width: 24px; height: 24px; border-radius: 50%;
      cursor: pointer; font-size: 14px; line-height: 24px; padding: 0; }
    .x:hover { background: rgba(255,255,255,.12); color: #fff; }
    .panel { width: 300px; max-height: 340px; overflow: auto; padding: 6px; border-radius: 16px;
      background: rgba(14,16,22,.92); backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px);
      border: 1px solid rgba(255,255,255,.08); box-shadow: 0 16px 40px rgba(0,0,0,.4); display: none; }
    .panel.open { display: block; animation: rise .2s ease; }
    @keyframes rise { from { opacity: 0; transform: translateY(6px); } }
    .row { display: flex; align-items: center; gap: 10px; padding: 9px 10px; border-radius: 10px; }
    .row:hover { background: rgba(255,255,255,.04); }
    .av { width: 28px; height: 28px; border-radius: 8px; display: grid; place-items: center; font-weight: 800; font-size: 12px;
      color: #fff; background: var(--c); flex: none; }
    .meta { flex: 1; min-width: 0; }
    .name { font-weight: 650; color: #fff; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .sub { color: #8b93a7; font-size: 11px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .tag { font-size: 10px; font-weight: 700; letter-spacing: .04em; text-transform: uppercase; padding: 3px 7px; border-radius: 6px;
      color: var(--c); background: color-mix(in srgb, var(--c) 14%, transparent); flex: none; }
    .new { position: absolute; }
    .toast { padding: 7px 12px; border-radius: 10px; background: rgba(239,68,68,.95); color: #fff; font-weight: 650; font-size: 12px;
      box-shadow: 0 8px 20px rgba(239,68,68,.35); animation: rise .2s ease; }
    .hint { color: #8b93a7; font-size: 11px; padding: 6px 10px 4px; }
  `;
  const COLOR = { high: '#ef4444', medium: '#f59e0b', low: '#38bdf8' };

  function build() {
    host = document.createElement('cookie-watch-widget');
    root = host.attachShadow({ mode: 'closed' });
    root.innerHTML = `<style>${CSS}</style>
      <div class="wrap">
        <div class="toasts"></div>
        <div class="panel"></div>
        <div class="pill" title="COOKIEWATCH — click for details">
          <span class="dot"></span><span class="label"></span>
          <button class="x" title="Hide on this page">×</button>
        </div>
      </div>`;
    els = {
      wrap: root.querySelector('.wrap'),
      pill: root.querySelector('.pill'),
      label: root.querySelector('.label'),
      panel: root.querySelector('.panel'),
      toasts: root.querySelector('.toasts'),
      x: root.querySelector('.x'),
    };
    els.pill.addEventListener('click', (e) => {
      if (e.target === els.x) return;
      open = !open;
      els.panel.classList.toggle('open', open);
    });
    els.x.addEventListener('click', () => { dismissed = true; render(); });
    (document.body || document.documentElement).appendChild(host);
  }

  function render(fresh = []) {
    if (!last) return;
    const n = last.totals.companies;
    const show = enabled && !dismissed && n > 0;
    if (!show) { if (els) els.wrap.classList.remove('show'); return; }
    if (!host) build();
    if (!host.isConnected) (document.body || document.documentElement).appendChild(host);

    const worst = last.totals.high ? 'high' : last.companies.some((c) => c.risk === 'medium') ? 'medium' : 'low';
    els.wrap.style.setProperty('--c', COLOR[worst]);
    els.pill.style.setProperty('--c', COLOR[worst]);
    const top = last.companies.slice(0, 2).map((c) => c.company).join(', ');
    els.label.innerHTML = `<b>${n} ${n === 1 ? 'company' : 'companies'}</b> tracking via cookies<small>${esc(top)}${n > 2 ? ` +${n - 2} more` : ''}</small>`;

    els.panel.innerHTML = last.companies.map((c) => `
      <div class="row" style="--c:${COLOR[c.risk]}">
        <div class="av">${esc(c.company.charAt(0))}</div>
        <div class="meta"><div class="name">${esc(c.company)}</div>
          <div class="sub">${esc(c.domains.map((d) => d.host).join(', '))}</div></div>
        <span class="tag">${esc(c.category)}</span>
      </div>`).join('') + `<div class="hint">Full breakdown in the toolbar popup.<br>Made by your friendly neighborhood bear Brizzly 🐻</div>`;
    els.panel.classList.toggle('open', open);
    els.wrap.classList.add('show');

    const named = fresh.filter((f) => last.companies.find((c) => c.company === f && c.risk === 'high'));
    for (const f of named.slice(0, 2)) {
      const t = document.createElement('div');
      t.className = 'toast';
      t.textContent = `${f} is tracking you`;
      els.toasts.appendChild(t);
      setTimeout(() => t.remove(), 3500);
    }
  }

  chrome.runtime.onMessage.addListener((msg) => {
    if (msg.type === 'cw:update') { last = msg.summary; render(msg.fresh || []); }
  });

  chrome.storage.onChanged.addListener((ch, area) => {
    if (area === 'local' && ch.overlay) { enabled = ch.overlay.newValue !== false; render(); }
  });

  const start = async () => {
    const { overlay } = await chrome.storage.local.get('overlay');
    enabled = overlay !== false;
    try { last = await chrome.runtime.sendMessage({ type: 'cw:get' }); } catch {}
    render();
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true });
  else start();
})();
