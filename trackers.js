// Domain -> [Company, Category]. Lookup walks up the hostname, so
// "stats.g.doubleclick.net" matches "doubleclick.net".
// Categories drive the risk level shown in the UI (see RISK below).

const DB = {
  // ── Google / Alphabet ─────────────────────────────
  'doubleclick.net': ['Google', 'Advertising'],
  'googlesyndication.com': ['Google', 'Advertising'],
  'googleadservices.com': ['Google', 'Advertising'],
  'googletagservices.com': ['Google', 'Advertising'],
  '2mdn.net': ['Google', 'Advertising'],
  'admob.com': ['Google', 'Advertising'],
  'google-analytics.com': ['Google', 'Analytics'],
  'app-measurement.com': ['Google', 'Analytics'],
  'googletagmanager.com': ['Google', 'Tag manager'],
  'google.com': ['Google', 'Advertising'],
  'youtube.com': ['Google', 'Social'],
  'youtube-nocookie.com': ['Google', 'Social'],

  // ── Meta ──────────────────────────────────────────
  'facebook.com': ['Meta', 'Social'],
  'facebook.net': ['Meta', 'Social'],
  'instagram.com': ['Meta', 'Social'],
  'atdmt.com': ['Meta', 'Advertising'],

  // ── Microsoft (incl. LinkedIn, Xandr) ─────────────
  'bing.com': ['Microsoft', 'Advertising'],
  'clarity.ms': ['Microsoft', 'Session replay'],
  'msn.com': ['Microsoft', 'Advertising'],
  'adnxs.com': ['Microsoft (Xandr)', 'Advertising'],
  'linkedin.com': ['Microsoft (LinkedIn)', 'Social'],
  'licdn.com': ['Microsoft (LinkedIn)', 'Social'],

  // ── Amazon ────────────────────────────────────────
  'amazon-adsystem.com': ['Amazon', 'Advertising'],
  'assoc-amazon.com': ['Amazon', 'Advertising'],

  // ── Social platforms ──────────────────────────────
  'twitter.com': ['X Corp', 'Social'],
  'x.com': ['X Corp', 'Social'],
  'ads-twitter.com': ['X Corp', 'Advertising'],
  't.co': ['X Corp', 'Social'],
  'tiktok.com': ['TikTok (ByteDance)', 'Social'],
  'byteoversea.com': ['TikTok (ByteDance)', 'Social'],
  'snapchat.com': ['Snap Inc.', 'Social'],
  'sc-static.net': ['Snap Inc.', 'Social'],
  'pinterest.com': ['Pinterest', 'Social'],
  'reddit.com': ['Reddit', 'Social'],
  'redditstatic.com': ['Reddit', 'Social'],
  'quora.com': ['Quora', 'Social'],
  'disqus.com': ['Disqus (Zeta Global)', 'Social'],
  'sharethis.com': ['ShareThis', 'Data broker'],
  'addthis.com': ['Oracle', 'Data broker'],

  // ── Ad tech / exchanges / DSPs ────────────────────
  'adsrvr.org': ['The Trade Desk', 'Advertising'],
  'criteo.com': ['Criteo', 'Advertising'],
  'criteo.net': ['Criteo', 'Advertising'],
  'bidswitch.net': ['Criteo (IPONWEB)', 'Advertising'],
  'taboola.com': ['Taboola', 'Content recommendation'],
  'outbrain.com': ['Outbrain', 'Content recommendation'],
  'mgid.com': ['MGID', 'Content recommendation'],
  'revcontent.com': ['Revcontent', 'Content recommendation'],
  'yahoo.com': ['Yahoo', 'Advertising'],
  'advertising.com': ['Yahoo', 'Advertising'],
  'rubiconproject.com': ['Magnite', 'Advertising'],
  'magnite.com': ['Magnite', 'Advertising'],
  'pubmatic.com': ['PubMatic', 'Advertising'],
  'casalemedia.com': ['Index Exchange', 'Advertising'],
  'indexww.com': ['Index Exchange', 'Advertising'],
  'openx.net': ['OpenX', 'Advertising'],
  'lijit.com': ['Sovrn', 'Advertising'],
  'sovrn.com': ['Sovrn', 'Advertising'],
  '3lift.com': ['TripleLift', 'Advertising'],
  'sharethrough.com': ['Sharethrough (Equativ)', 'Advertising'],
  'smartadserver.com': ['Equativ', 'Advertising'],
  'gumgum.com': ['GumGum', 'Advertising'],
  'teads.tv': ['Teads', 'Advertising'],
  '33across.com': ['33Across', 'Advertising'],
  'media.net': ['Media.net', 'Advertising'],
  'adform.net': ['Adform', 'Advertising'],
  'adroll.com': ['AdRoll (NextRoll)', 'Advertising'],
  'mathtag.com': ['MediaMath (Infillion)', 'Advertising'],
  'dotomi.com': ['Epsilon (Publicis)', 'Advertising'],
  'unrulymedia.com': ['Nexxen', 'Advertising'],
  'simpli.fi': ['Simpli.fi', 'Advertising'],
  'stackadapt.com': ['StackAdapt', 'Advertising'],
  'flashtalking.com': ['Flashtalking (Mediaocean)', 'Advertising'],
  'id5-sync.com': ['ID5', 'Data broker'],

  // ── Data brokers / identity graphs / DMPs ─────────
  'rlcdn.com': ['LiveRamp', 'Data broker'],
  'liveramp.com': ['LiveRamp', 'Data broker'],
  'pippio.com': ['LiveRamp', 'Data broker'],
  'crwdcntrl.net': ['Lotame', 'Data broker'],
  'agkn.com': ['TransUnion (Neustar)', 'Data broker'],
  'tapad.com': ['Experian (Tapad)', 'Data broker'],
  'bluekai.com': ['Oracle', 'Data broker'],
  'bkrtx.com': ['Oracle', 'Data broker'],
  'demdex.net': ['Adobe', 'Data broker'],
  'krxd.net': ['Salesforce', 'Data broker'],
  'quantserve.com': ['Quantcast', 'Data broker'],
  'quantcount.com': ['Quantcast', 'Data broker'],
  'quantcast.com': ['Quantcast', 'Data broker'],

  // ── Measurement / verification ────────────────────
  'scorecardresearch.com': ['Comscore', 'Analytics'],
  'imrworldwide.com': ['Nielsen', 'Analytics'],
  'moatads.com': ['Oracle (Moat)', 'Ad verification'],
  'doubleverify.com': ['DoubleVerify', 'Ad verification'],
  'adsafeprotected.com': ['Integral Ad Science', 'Ad verification'],

  // ── Adobe / Salesforce marketing clouds ───────────
  'omtrdc.net': ['Adobe', 'Analytics'],
  '2o7.net': ['Adobe', 'Analytics'],
  'everesttech.net': ['Adobe', 'Advertising'],
  'adobedtm.com': ['Adobe', 'Tag manager'],
  'marketo.net': ['Adobe (Marketo)', 'Marketing'],
  'mktoresp.com': ['Adobe (Marketo)', 'Marketing'],
  'pardot.com': ['Salesforce', 'Marketing'],
  'exacttarget.com': ['Salesforce', 'Marketing'],

  // ── Product analytics / session replay ────────────
  'hotjar.com': ['Hotjar (Contentsquare)', 'Session replay'],
  'fullstory.com': ['FullStory', 'Session replay'],
  'mouseflow.com': ['Mouseflow', 'Session replay'],
  'luckyorange.com': ['Lucky Orange', 'Session replay'],
  'crazyegg.com': ['Crazy Egg', 'Session replay'],
  'mixpanel.com': ['Mixpanel', 'Analytics'],
  'amplitude.com': ['Amplitude', 'Analytics'],
  'heapanalytics.com': ['Heap (Contentsquare)', 'Analytics'],
  'segment.com': ['Twilio Segment', 'Customer data platform'],
  'segment.io': ['Twilio Segment', 'Customer data platform'],
  'optimizely.com': ['Optimizely', 'Analytics'],
  'nr-data.net': ['New Relic', 'Analytics'],
  'matomo.cloud': ['Matomo', 'Analytics'],
  'tealiumiq.com': ['Tealium', 'Customer data platform'],
  'tiqcdn.com': ['Tealium', 'Tag manager'],
  'yandex.ru': ['Yandex', 'Analytics'],
  'yandex.com': ['Yandex', 'Analytics'],
  'baidu.com': ['Baidu', 'Analytics'],

  // ── Marketing automation / email ──────────────────
  'hubspot.com': ['HubSpot', 'Marketing'],
  'hubspot.net': ['HubSpot', 'Marketing'],
  'hs-analytics.net': ['HubSpot', 'Marketing'],
  'hs-scripts.com': ['HubSpot', 'Marketing'],
  'klaviyo.com': ['Klaviyo', 'Marketing'],
  'list-manage.com': ['Mailchimp (Intuit)', 'Marketing'],
  'bounceexchange.com': ['Wunderkind', 'Marketing'],
  'branch.io': ['Branch', 'Marketing'],
  'app.link': ['Branch', 'Marketing'],
  'appsflyer.com': ['AppsFlyer', 'Marketing'],

  // ── Functional (low risk) ─────────────────────────
  'cookielaw.org': ['OneTrust', 'Consent management'],
  'onetrust.com': ['OneTrust', 'Consent management'],
  'cookiebot.com': ['Usercentrics (Cookiebot)', 'Consent management'],
  'stripe.com': ['Stripe', 'Payments & fraud'],
  'stripe.network': ['Stripe', 'Payments & fraud'],
  'intercom.io': ['Intercom', 'Customer support'],
  'shopify.com': ['Shopify', 'E-commerce'],
};

export const RISK = {
  'Advertising': 'high',
  'Data broker': 'high',
  'Social': 'high',
  'Session replay': 'high',
  'Analytics': 'medium',
  'Marketing': 'medium',
  'Content recommendation': 'medium',
  'Ad verification': 'medium',
  'Customer data platform': 'medium',
  'Tag manager': 'low',
  'Consent management': 'low',
  'Payments & fraud': 'low',
  'Customer support': 'low',
  'E-commerce': 'low',
  'Unidentified': 'medium',
};

export function lookup(hostname) {
  const parts = hostname.toLowerCase().split('.');
  for (let i = 0; i < parts.length - 1; i++) {
    const hit = DB[parts.slice(i).join('.')];
    if (hit) return { company: hit[0], category: hit[1] };
  }
  return null;
}
