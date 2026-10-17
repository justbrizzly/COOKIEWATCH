# 🍪 COOKIEWATCH

**See who's tracking you, live, by name.**

COOKIEWATCH is a Chrome extension that watches every cookie your browser exchanges with outside companies. When a third party reads or plants a cookie on the page you're visiting, COOKIEWATCH flags it and tells you which company is behind it: Google, Meta, LinkedIn, LiveRamp, and many more.

<img width="380" height="659" alt="image" src="https://github.com/user-attachments/assets/04669feb-f8bd-469e-a609-e7b9a3821a41" />

---

## Features

- **Live tracking detection.** Every request from the page is checked. If an outside domain receives your cookies, or tries to set new ones, COOKIEWATCH catches it as it happens.
- **Names the company.** A built-in database of about 150 tracker domains maps each one to the company that owns it. For example, `doubleclick.net` is Google, `rlcdn.com` is LiveRamp and `adnxs.com` is Microsoft (Xandr). Domains that aren't in the database are still flagged and labeled **unverified owner**.
- **Risk ratings.** Each company is color-coded by what it does:
  - 🔴 **High:** advertising, data brokers, social media pixels, session replay
  - 🟠 **Medium:** analytics, marketing, content recommendation, ad verification
  - 🔵 **Low:** consent banners, payments and fraud checks, customer support
- **Toolbar badge.** The icon shows how many companies are tracking you on the current tab. It turns red when a high-risk tracker is present.
- **On-page widget.** A floating pill in the corner of the page shows the tracker count. Click it to see the full list. A pop-up alert ("Meta is tracking you") appears the moment a high-risk company shows up. You can turn the widget off with one switch.
- **Detailed popup.** For each company you can see which domains it used, how many cookies were sent and set, and the cookie names involved.
- **Few false alarms.**
  - The site's own cookies are ignored.
  - Cookies from the company that owns the site are ignored, so Meta isn't flagged on facebook.com.
  - Partitioned cookies, which can't follow you between sites, are not counted when they are set.

## Privacy

COOKIEWATCH runs entirely in your browser.

- **Nothing leaves your machine.** It has no servers, no analytics and no network calls of its own.
- **Cookie values are never read or stored.** Only cookie names are kept.
- **Nothing is saved long term.** Results for each tab are held only for the current browser session and are wiped when the tab closes.

## Install

1. Download or clone this repository.
2. Open `chrome://extensions` in Chrome.
3. Turn on **Developer mode** (top-right corner).
4. Click **Load unpacked** and select the `cookie-watch` folder.
5. Pin COOKIEWATCH from the puzzle-piece menu so the badge is always visible.

This also works in other Chromium browsers, such as Edge, Brave, Arc and Opera.

## What it does not catch

COOKIEWATCH detects **cookie-based** tracking, which is the main way companies follow you across sites. It cannot see:

- **Browser fingerprinting.** This identifies you from your device's settings and uses no cookies.
- **Server-to-server data sharing.** This happens after you leave the page, on the companies' own servers.
- **CNAME cloaking.** This is a tracker hidden behind the site's own subdomain, such as `metrics.example.com` secretly pointing to Adobe.

A clean result means no third-party cookie tracking was found. It does not mean no tracking of any kind.

COOKIEWATCH **reports** tracking. It does not **block** it.

## Permissions

| Permission | Why it's needed |
|---|---|
| `webRequest` + all sites | To check request and response headers for cookies |
| `webNavigation` | To reset results when you go to a new page |
| `tabs` | To link each request to the tab it came from |
| `storage` | To keep each tab's results and your widget setting |

## Project structure

```
cookie-watch/
├── manifest.json   Extension config (Manifest V3)
├── background.js   Detection engine: header monitoring, per-tab state, badge
├── trackers.js     Domain → company database and risk levels
├── psl.js          Works out which domains count as the same site
├── content.js      On-page floating widget (isolated in a Shadow DOM)
├── popup.html/css/js  Toolbar popup interface
└── icons/
```

## Contributing

To add a tracker, add a line to `trackers.js`:

```js
'example-tracker.com': ['Company Name', 'Advertising'],
```

Valid categories are listed in the `RISK` table in the same file.

---

*Made by your friendly neighborhood bear Brizzly 🐻*
