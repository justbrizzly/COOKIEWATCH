// Minimal registrable-domain ("site") resolver. Covers common multi-part
// public suffixes; anything else falls back to the last two labels.
const MULTI = new Set([
  'co.uk', 'org.uk', 'ac.uk', 'gov.uk', 'me.uk', 'com.au', 'net.au', 'org.au',
  'co.jp', 'ne.jp', 'or.jp', 'co.nz', 'co.za', 'com.br', 'com.mx', 'com.cn',
  'com.tw', 'co.kr', 'co.in', 'com.sg', 'com.hk', 'co.il', 'com.tr', 'com.ar',
  'co.id', 'com.my', 'com.ph', 'com.vn', 'com.ua', 'com.pl', 'com.co',
  'github.io', 'herokuapp.com', 'appspot.com', 'blogspot.com', 'cloudfront.net',
  'vercel.app', 'netlify.app', 'pages.dev', 'workers.dev', 'web.app',
  'firebaseapp.com', 'azurewebsites.net', 'myshopify.com',
]);

export function siteOf(hostname) {
  const h = hostname.toLowerCase().replace(/\.$/, '');
  if (/^[\d.]+$/.test(h) || h.includes(':') || !h.includes('.')) return h;
  const p = h.split('.');
  const last2 = p.slice(-2).join('.');
  if (MULTI.has(last2) && p.length >= 3) return p.slice(-3).join('.');
  return last2;
}
