// SVG icons + logo dùng chung
App.icons = {
  logoMark(color = '#F4EEE2', accent = '#D9C29A') {
    // Lá trà trong vòng tròn — logo placeholder của thương hiệu riêng
    return `
    <svg viewBox="0 0 92 92" class="logo-mark" aria-label="logo">
      <circle cx="46" cy="46" r="43" fill="none" stroke="${accent}" stroke-width="1.5"/>
      <circle cx="46" cy="46" r="37" fill="none" stroke="${color}" stroke-opacity=".25" stroke-width="1"/>
      <path d="M46 20 C62 30 66 50 46 72 C26 50 30 30 46 20 Z" fill="${color}"/>
      <path d="M46 26 L46 70" stroke="${accent}" stroke-width="1.6" stroke-linecap="round"/>
      <path d="M46 40 L37 33 M46 50 L35 43 M46 40 L55 33 M46 50 L57 43 M46 60 L39 55 M46 60 L53 55"
        stroke="${accent}" stroke-width="1.2" stroke-linecap="round"/>
    </svg>`;
  },

  signal: `<svg width="19" height="12" viewBox="0 0 19 12"><rect x="0" y="8" width="3.2" height="4" rx="1"/><rect x="5" y="5.5" width="3.2" height="6.5" rx="1"/><rect x="10" y="3" width="3.2" height="9" rx="1"/><rect x="15" y="0" width="3.2" height="12" rx="1"/></svg>`,
  wifi: `<svg width="17" height="12" viewBox="0 0 17 12"><path d="M8.5 2.3c2.4 0 4.6.9 6.3 2.5l1.2-1.2C14 1.6 11.4.6 8.5.6S3 1.6 1 3.6l1.2 1.2c1.7-1.6 3.9-2.5 6.3-2.5z"/><path d="M8.5 5.6c1.5 0 2.9.6 3.9 1.5l1.2-1.2C12.3 4.6 10.5 3.9 8.5 3.9s-3.8.7-5.1 2l1.2 1.2c1-.9 2.4-1.5 3.9-1.5z"/><path d="M8.5 8.9c.7 0 1.3.3 1.7.7L8.5 11.4 6.8 9.6c.4-.4 1-.7 1.7-.7z"/></svg>`,
  battery: `<svg width="28" height="13" viewBox="0 0 28 13"><rect x=".5" y=".5" width="24" height="12" rx="3.8" fill="none" stroke="currentColor" stroke-opacity=".38"/><rect x="2" y="2" width="21" height="9" rx="2.4"/><path d="M26 4.5v4c.8-.3 1.4-1.1 1.4-2s-.6-1.7-1.4-2z" fill-opacity=".45"/></svg>`,

  arrowRight: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>`,
  check: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>`,
  locationArrow: `<svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M21 3L3 10.5l7.5 3 3 7.5z"/></svg>`,

  // icon nét 24px, dùng currentColor
  ic: {
    bag: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M5 8h14l-1 12.2a1 1 0 0 1-1 .8H7a1 1 0 0 1-1-.8z"/><path d="M9 8V6.5a3 3 0 0 1 6 0V8"/></svg>`,
    scooter: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><circle cx="6" cy="17" r="2.6"/><circle cx="18" cy="17" r="2.6"/><path d="M8.6 17h6.8l2-7H20M13 6h3l1.4 4M4 13h6l2 4"/><rect x="3" y="8" width="6" height="5" rx="1"/></svg>`,
    chevron: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 5l7 7-7 7"/></svg>`,
    qr: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect x="3.5" y="3.5" width="6.5" height="6.5" rx="1"/><rect x="14" y="3.5" width="6.5" height="6.5" rx="1"/><rect x="3.5" y="14" width="6.5" height="6.5" rx="1"/><path d="M14 14h2.5v2.5H14zM18 18h2.5v2.5H18zM14 18.5v2M20.5 14v2"/></svg>`,
    pin: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/></svg>`,
    cup: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M6 8h12l-1.4 12.2a1 1 0 0 1-1 .8H8.4a1 1 0 0 1-1-.8z"/><path d="M5 8h14M13 8l1.5-5h3"/></svg>`,
    reorder: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12a8 8 0 0 1 13.7-5.6L20 8.5"/><path d="M20 4v4.5h-4.5"/><path d="M20 12a8 8 0 0 1-13.7 5.6L4 15.5"/><path d="M4 20v-4.5h4.5"/></svg>`,
    ticket: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M3.5 7.5a1 1 0 0 1 1-1h15a1 1 0 0 1 1 1V10a2 2 0 0 0 0 4v2.5a1 1 0 0 1-1 1h-15a1 1 0 0 1-1-1V14a2 2 0 0 0 0-4z"/><path d="M14.5 6.5v11" stroke-dasharray="1.6 2"/></svg>`,
    store: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M4 9.5V20h16V9.5"/><path d="M3 9.5L5 4h14l2 5.5a2.6 2.6 0 0 1-4.5 1.6 2.6 2.6 0 0 1-4.5 0 2.6 2.6 0 0 1-4.5 0A2.6 2.6 0 0 1 3 9.5z"/><path d="M10 20v-5h4v5"/></svg>`,
    gift: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect x="3.5" y="8.5" width="17" height="4" rx="1"/><path d="M5 12.5v7a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-7M12 8.5v12"/><path d="M12 8.5c-1-3-5-4.3-5.6-2.2C6 8 9.5 8.5 12 8.5zm0 0c1-3 5-4.3 5.6-2.2.4 1.7-3.1 2.2-5.6 2.2z"/></svg>`,
    plus: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>`,
    voucherPct: `<svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M4 9a1.5 1.5 0 0 1 1.5-1.5h21A1.5 1.5 0 0 1 28 9v4a3 3 0 0 0 0 6v4a1.5 1.5 0 0 1-1.5 1.5h-21A1.5 1.5 0 0 1 4 23v-4a3 3 0 0 0 0-6z"/><path d="M12.5 20l7-8"/><circle cx="12.5" cy="12.5" r="1.4"/><circle cx="19.5" cy="19.5" r="1.4"/></svg>`,
    friends: `<svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><circle cx="13" cy="11" r="5"/><path d="M4 27c.8-5 4.4-8 9-8s8.2 3 9 8"/><path d="M20 6.5a5 5 0 0 1 0 9M23.5 19.5c2.5 1.2 4.1 3.8 4.5 7"/></svg>`,
    calc: `<svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="4" width="22" height="24" rx="3"/><path d="M10 10h5M12.5 7.5v5M18 10h5M10 19l4 4M14 19l-4 4"/><path d="M20 24c0-3 1.5-5 4-6-0.2 3-1.5 5-4 6z"/></svg>`,
    cupMini: `<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round"><path d="M4 5h8l-.9 8.2a.8.8 0 0 1-.8.8H5.7a.8.8 0 0 1-.8-.8z"/><path d="M3.5 5h9M8 5l1-3h2"/></svg>`,
    bell: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M6 16V11a6 6 0 0 1 12 0v5l1.5 2h-15z"/><path d="M10 20.5a2 2 0 0 0 4 0"/></svg>`,
  },

  tab: {
    home: `<svg viewBox="0 0 26 26" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"><path d="M4 11.5L13 4l9 7.5V21a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1z"/><path class="accent" d="M10 17.5h6" stroke-linecap="round" stroke-width="2.2"/></svg>`,
    order: `<svg viewBox="0 0 26 26" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M6.5 8h13l-1.6 13.2a1 1 0 0 1-1 .8H9.1a1 1 0 0 1-1-.8z"/><path d="M5.5 8h15"/><path d="M14.5 8l1.5-5h3"/><path d="M8 13.5h10"/></svg>`,
    orders: `<svg viewBox="0 0 26 26" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M6 3.5h14v19l-2.4-1.6-2.3 1.6-2.3-1.6-2.3 1.6-2.3-1.6L6 22.5z"/><path d="M9.5 9h7M9.5 13h7M9.5 17h4"/></svg>`,
    offers: `<svg viewBox="0 0 26 26" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><rect x="3.5" y="9" width="19" height="5" rx="1"/><path d="M5 14v7.5a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1V14M13 9v13.5"/><path d="M13 9c-1-3.5-5.5-5-6.3-2.6C6 8.6 10 9 13 9zm0 0c1-3.5 5.5-5 6.3-2.6C20 8.6 16 9 13 9z"/></svg>`,
    account: `<svg viewBox="0 0 26 26" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"><circle cx="13" cy="9" r="4.5"/><path d="M4.5 22c.8-4.4 4.2-7 8.5-7s7.7 2.6 8.5 7"/></svg>`,
  },
};
