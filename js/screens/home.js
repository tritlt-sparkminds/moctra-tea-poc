// C2 · Trang chủ — bố cục theo video tham chiếu (home.mp4), dùng nhận diện thương hiệu riêng
// Banner lớn + logo + ngôn ngữ/QR → thẻ chào hội viên → Pick up / Delivery → thẻ tích tem
// → lối tắt → banner khuyến mãi xếp dọc → footer
App.screens.home = ({ goTab }) => {
  const D = App.data;
  const I = App.icons.ic;
  const st = () => App.state.get();

  const heroes = [
    {
      bg: ['#E4F0EA', '#CFE3D9'], cup: 'p1',
      title: 'Ô Long', title2: 'Hoa Quế', tag: 'Trà rang · Hương ấm',
      date: 'Từ 02/11/2026', desc: 'Combo 1 ly Ô Long Hoa Quế (L)<br/>& 1 túi canvas Mộc Trà<br/>chỉ <b>129.000đ</b>',
      deeplink: 'Combo Ô Long Hoa Quế',
    },
    {
      bg: ['#F4EBDD', '#E7D6BC'], cup: 'p3',
      title: 'Hồng Trà', title2: 'Kem Mặn', tag: 'Đậm vị · Béo nhẹ',
      date: 'Từ 05/11/2026', desc: 'Mua 2 ly size L<br/>giảm ngay <b>20%</b><br/>cho hội viên',
      deeplink: 'Khuyến mãi Hồng Trà Kem Mặn',
    },
    {
      bg: ['#EAF0DE', '#D6E2C0'], cup: 'p4',
      title: 'Matcha', title2: 'Yến Mạch', tag: 'Matcha Uji · Thuần chay',
      date: 'Món mới', desc: 'Sữa yến mạch không đường<br/>thanh, nhẹ, ít calo<br/>chỉ <b>65.000đ</b>',
      deeplink: 'Chi tiết món Matcha Yến Mạch',
    },
  ];

  const el = App.ui.el(`
    <div class="home">
      <header class="home-nav">
        <span class="wm">${App.icons.logoMark('#1F3329', '#B08D57')}${App.config.brand.wordmark}</span>
        <button class="nav-bell tap" data-act="noti" aria-label="Thông báo">${I.bell}<i class="badge-dot"></i></button>
      </header>
      <div class="home-scroll">
        <section class="hero">
          <div class="hero-track">${heroes.map(heroHTML).join('')}</div>
          <div class="hero-dots">${heroes.map((_, i) => `<i class="${i === 0 ? 'on' : ''}"></i>`).join('')}</div>
          <div class="hero-top">
            <div class="pill-row">
              <button class="lang-pill tap" data-act="lang"><span class="lang">VN</span><svg viewBox="0 0 24 24" class="caret"><path d="M7 10l5 5 5-5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg><span class="flag"><svg viewBox="0 0 30 30"><circle cx="15" cy="15" r="15" fill="#DA251D"/><path d="M15 7.5l1.9 5.8h6.1l-4.9 3.6 1.9 5.8-5-3.6-5 3.6 1.9-5.8-4.9-3.6h6.1z" fill="#FFDD00"/></svg></span></button>
              <button class="scan-btn tap" data-act="qr" aria-label="Mã hội viên">${I.qr}</button>
            </div>
          </div>
        </section>

        <section class="panel">
          <div class="greet"></div>
          <div class="active-slot"></div>
          <div class="pd">
            <button class="pd-item tap" data-mode="pickup">${pickupArt()}<span>PICK UP</span></button>
            <i class="pd-div"></i>
            <button class="pd-item tap" data-mode="delivery">${deliveryArt()}<span>DELIVERY</span></button>
          </div>
          <div class="stamp-slot"></div>
          <hr class="panel-hr"/>
          <div class="quick">
            ${[
              ['voucher', I.voucherPct, 'Voucher'],
              ['refer', I.friends, 'Giới thiệu<br/>bạn bè'],
              ['points', I.gift, 'Điểm trà'],
              ['calo', I.calc, 'Tính<br/>calo'],
            ].map(([k, ic, t]) => `<button class="q tap" data-q="${k}"><span class="q-ic">${ic}</span><span class="q-t">${t}</span></button>`).join('')}
          </div>
        </section>

        <section class="promos">
          ${promoStamps()}
          ${promoRefer()}
          ${promoDelivery()}
        </section>

        <footer class="home-foot">${App.config.brand.wordmark} · CÙNG NHAU</footer>
      </div>
    </div>`);

  const scroller = el.querySelector('.home-scroll');
  const heroTrack = el.querySelector('.hero-track');
  const heroDots = [...el.querySelectorAll('.hero-dots i')];
  let heroIdx = 0;

  // ---------------- khối động ----------------
  function renderGreet() {
    const s = st();
    const m = D.member;
    el.querySelector('.greet').innerHTML = s.isMember
      ? `<div class="g-line"><b>Xin chào, ${m.name}</b><button class="g-chip tap" data-act="tier">${m.tier} ${I.chevron}</button></div>
         <div class="g-stats">
           <button class="tap" data-act="points"><b>${m.points.toLocaleString('vi-VN')}</b><small>ĐIỂM TRÀ</small></button>
           <button class="tap" data-act="vouchers"><b>2</b><small>VOUCHER</small></button>
         </div>
         <span class="g-avatar">${App.icons.logoMark('#F4EEE2', '#D9C29A')}</span>`
      : `<div class="g-line"><b>Xin chào, bạn</b><button class="g-chip guest tap" data-act="login">Đăng nhập ${I.chevron}</button></div>
         <div class="g-guest">Đăng nhập để tích điểm trà & nhận voucher thành viên mới</div>
         <span class="g-avatar">${App.icons.logoMark('#F4EEE2', '#D9C29A')}</span>`;
  }

  function renderStamp() {
    const have = App.memberStamps();
    const need = 10 - have;
    const nodes = Array.from({ length: 10 }, (_, i) => {
      const n = i + 1;
      const done = n <= have;
      return n % 2 === 0
        ? `<span class="sn big ${done ? 'done' : ''}">${I.cupMini}</span>`
        : `<span class="sn ${done ? 'done' : ''}"></span>`;
    }).join('');
    el.querySelector('.stamp-slot').innerHTML = `
      <button class="stamp tap" data-act="stamp">
        <span class="s-more">Xem thêm ${I.chevron}</span>
        <div class="s-title">Đặt thêm <em>${need}</em> ly để nhận <em>MUA 1 TẶNG 1</em></div>
        <div class="s-prog">
          <div class="s-track"><i style="width:${(have / 10) * 100}%"></i>${nodes}</div>
          <span class="s-count">(${have}/10)</span>
        </div>
        <span class="s-cta" data-act="order">ĐẶT HÀNG NGAY</span>
        <span class="s-art">
          <span class="s-cup">${App.art.product('p2', { shadow: false })}</span>
          <span class="s-ticket">MUA 1<br/>TẶNG 1</span>
        </span>
      </button>`;
  }

  function renderActive() {
    const slot = el.querySelector('.active-slot');
    const real = App.payment && App.payment.activeOrder();
    if (real) {
      const sto = D.stores.find((s) => s.id === real.storeId);
      const steps = ['Đã thanh toán', 'Đang pha chế', real.mode === 'pickup' ? 'Sẵn sàng' : 'Đang giao'];
      slot.innerHTML = `
        <button class="active-order tap" data-act="track" data-order="${real.id}">
          <span class="ao-status"><i class="live"></i>${steps[real.progress || 0]}</span>
          <span class="ao-mid"><b>Đơn #${real.code.slice(-6)}</b><small>${sto.name} · ${real.mode === 'pickup' ? 'Tự đến lấy' : 'Giao hàng'}</small></span>
          ${real.mode === 'pickup' ? `<span class="ao-code"><small>Mã lấy</small><b>${real.pickupCode}</b></span>` : ''}
        </button>`;
      return;
    }
    if (!st().hasActiveOrder) { slot.innerHTML = ''; return; }
    const o = D.activeOrder;
    const steps = ['Đã thanh toán', 'Đã nhận', 'Đang pha', 'Sẵn sàng', 'Hoàn tất'];
    const sto = D.stores.find((s) => s.id === o.storeId);
    slot.innerHTML = `
      <button class="active-order tap" data-act="track">
        <span class="ao-status"><i class="live"></i>${steps[o.step]}</span>
        <span class="ao-mid"><b>Đơn #${o.code}</b><small>${sto.name} · ~${o.eta} phút</small></span>
        <span class="ao-code"><small>Mã lấy</small><b>${o.pickupCode}</b></span>
      </button>`;
  }

  // ---------------- hero carousel ----------------
  function goHero(i, animated = true) {
    const n = heroes.length;
    heroIdx = (i + n) % n;
    heroTrack.style.transition = animated ? 'transform .6s cubic-bezier(.32,.72,0,1)' : 'none';
    heroTrack.style.transform = `translate3d(${-heroIdx * 100}%,0,0)`;
    heroDots.forEach((d, k) => d.classList.toggle('on', k === heroIdx));
    [...heroTrack.children].forEach((b, k) => b.classList.toggle('active', k === heroIdx));
  }
  let auto;
  const startAuto = () => { clearInterval(auto); auto = setInterval(() => goHero(heroIdx + 1), 5000); };
  const stopAuto = () => clearInterval(auto);

  (function heroSwipe() {
    let x0 = null, y0 = 0, dx = 0, t0 = 0, lock = null;
    const W = () => heroTrack.offsetWidth;
    const sc = () => el.getBoundingClientRect().width / el.offsetWidth || 1;
    heroTrack.addEventListener('pointerdown', (e) => {
      x0 = e.clientX; y0 = e.clientY; dx = 0; t0 = performance.now(); lock = null; stopAuto();
    });
    heroTrack.addEventListener('pointermove', (e) => {
      if (x0 === null) return;
      const mx = (e.clientX - x0) / sc(), my = (e.clientY - y0) / sc();
      if (lock === null && Math.hypot(mx, my) > 6) {
        lock = Math.abs(mx) > Math.abs(my) ? 'x' : 'y';
        if (lock === 'x') heroTrack.setPointerCapture(e.pointerId);
      }
      if (lock !== 'x') return;
      dx = mx;
      heroTrack.style.transition = 'none';
      heroTrack.style.transform = `translate3d(${-heroIdx * W() + dx}px,0,0)`;
    });
    const up = () => {
      if (x0 === null) return;
      x0 = null;
      if (lock === 'x') {
        const v = dx / Math.max(1, performance.now() - t0);
        if (dx < -W() * 0.15 || v < -0.4) goHero(heroIdx + 1);
        else if (dx > W() * 0.15 || v > 0.4) goHero(heroIdx - 1);
        else goHero(heroIdx);
        heroTrack.dataset.dragged = '1';
        setTimeout(() => delete heroTrack.dataset.dragged, 50);
      }
      startAuto();
    };
    heroTrack.addEventListener('pointerup', up);
    heroTrack.addEventListener('pointercancel', up);
  })();

  // parallax nhẹ cho banner khi cuộn
  // header cố định: ẩn khi ở đầu trang (trên banner), cuộn qua ngưỡng thì trượt xuống hiện ra
  const nav = el.querySelector('.home-nav');
  const SHOW_AT = 60;
  let ticking = false;
  let shown = false;
  function onScroll() {
    ticking = false;
    const y = Math.max(0, scroller.scrollTop);
    el.querySelector('.hero').style.setProperty('--py', `${y * 0.35}px`);
    const next = y > SHOW_AT;
    if (next !== shown) {
      shown = next;
      nav.classList.toggle('shown', shown);
    }
  }
  scroller.addEventListener('scroll', () => {
    if (!ticking) { ticking = true; requestAnimationFrame(onScroll); }
  }, { passive: true });

  // ---------------- tương tác ----------------
  el.addEventListener('click', (e) => {
    const t = e.target.closest('button, [data-act]');
    if (!t) return;
    App.ui.haptic(5);

    if (t.classList.contains('hb')) {
      if (heroTrack.dataset.dragged) return;
      return App.ui.toast(`Mở deep link: ${heroes[heroIdx].deeplink}`);
    }
    if (t.dataset.mode) {
      App.state.set({ orderMode: t.dataset.mode });
      return setTimeout(() => goTab('order'), 150);
    }
    if (t.dataset.promo) return App.ui.soon('C14', 'Chi tiết khuyến mãi');

    const q = t.dataset.q;
    if (q === 'voucher') return App.auth.require(() => App.nav.push(App.screens.rewards()), 'Đăng nhập để xem voucher của bạn');
    if (q === 'refer') return App.auth.require(() => App.nav.push(App.screens.refer()), 'Đăng nhập để lấy mã giới thiệu của bạn');
    if (q === 'points') return App.auth.require(() => App.nav.push(App.screens.points()), 'Đăng nhập để tích điểm trà');
    if (q === 'calo') return App.nav.push(App.screens.calories());

    switch (t.dataset.act) {
      case 'order': e.stopPropagation(); return goTab('order');
      case 'stamp': App.ui.haptic(5); return App.nav.push(App.screens.stamps({ onOrder: () => goTab('order') }));
      case 'login': return App.auth.require(null, 'Đăng nhập để nhận quà chào mừng hội viên mới');
      case 'tier': return App.nav.push(App.screens.tiers());
      case 'points': return App.nav.push(App.screens.points());
      case 'vouchers': return App.nav.push(App.screens.rewards());
      case 'qr': return App.auth.require(showQR, 'Đăng nhập để dùng mã hội viên');
      case 'lang': return showLang();
      case 'track': {
        const id = e.target.closest('[data-order]')?.dataset.order;
        return id ? App.nav.push(App.screens.tracking(id)) : App.ui.soon('C8', 'Theo dõi đơn (đơn demo · hãy đặt một đơn thật)');
      }
      case 'noti': return App.nav.push(App.screens.inbox());
    }
  });

  function showLang() {
    const cur = el.querySelector('.lang').textContent;
    const s = App.ui.sheet(`
      <div class="lang-sheet">
        <h4>Ngôn ngữ</h4>
        ${[['VN', 'Tiếng Việt'], ['EN', 'English']].map(([c, n]) => `
          <button class="lang-opt tap ${c === cur ? 'on' : ''}" data-c="${c}"><span>${n}</span>${c === cur ? App.icons.check : ''}</button>`).join('')}
      </div>`);
    s.el.querySelectorAll('.lang-opt').forEach((b) => b.addEventListener('click', () => {
      el.querySelector('.lang').textContent = b.dataset.c;
      s.close();
      if (b.dataset.c === 'EN') App.ui.toast('Bản tiếng Anh sẽ có khi dựng đa ngôn ngữ');
    }));
  }

  function showQR() {
    const m = D.member;
    let sec = 60;
    const s = App.ui.sheet(`
      <div class="qr-sheet">
        <div class="qr-head"><span class="tier-badge">${m.tier}</span><b>${m.name}</b><small>${m.phone}</small></div>
        <div class="qr-box">${App.art.qr(Date.now() % 1000)}</div>
        <p>Đưa mã này cho nhân viên để tích điểm khi mua tại quầy.</p>
        <div class="qr-timer">Mã tự làm mới sau <b>${sec}</b> giây</div>
      </div>`, { onClose: () => clearInterval(tick) });
    const tick = setInterval(() => {
      sec = sec <= 1 ? 60 : sec - 1;
      if (sec === 60) s.el.querySelector('.qr-box').innerHTML = App.art.qr(Date.now() % 1000);
      s.el.querySelector('.qr-timer b').textContent = sec;
    }, 1000);
  }

  // ---------------- HTML/art ----------------
  function heroHTML(h, i) {
    return `
      <button class="hb ${i === 0 ? 'active' : ''}" style="--b0:${h.bg[0]};--b1:${h.bg[1]}">
        <svg class="hb-pattern" viewBox="0 0 440 470" preserveAspectRatio="none">
          ${Array.from({ length: 9 }, (_, k) => `<path d="M0 ${60 + k * 48} C80 ${40 + k * 48} 140 ${84 + k * 48} 220 ${62 + k * 48} S360 ${40 + k * 48} 440 ${62 + k * 48}" fill="none" stroke="#fff" stroke-opacity=".45" stroke-width="1.2"/>`).join('')}
        </svg>
        <span class="hb-art">
          <span class="hb-leaf l1"></span><span class="hb-leaf l2"></span>
          ${App.art.product(h.cup)}
        </span>
        <span class="hb-copy">
          <span class="hb-title">${h.title}<em>${h.title2}</em></span>
          <span class="hb-tag">${h.tag}</span>
          <span class="hb-date">${h.date}</span>
          <span class="hb-desc">${h.desc}</span>
          <small class="hb-terms">*Điều khoản & điều kiện áp dụng.</small>
        </span>
      </button>`;
  }

  function pickupArt() {
    return `
    <svg viewBox="0 0 80 100" class="pd-art">
      <path d="M14 22 H66 L60 92 Q59 96 55 96 H25 Q21 96 20 92 Z" fill="#fff" stroke="#2E4A3B" stroke-width="2"/>
      <path d="M16 40 H64" stroke="#2E4A3B" stroke-width="1.4" opacity=".35"/>
      <path d="M17 52 H63 L61.5 72 H18.5 Z" fill="#E4F0EA"/>
      <path d="M10 22 Q10 16 16 15 H64 Q70 16 70 22 Z" fill="#E4F0EA" stroke="#2E4A3B" stroke-width="2"/>
      <path d="M20 15 Q22 6 40 5 Q58 6 60 15" fill="#fff" stroke="#2E4A3B" stroke-width="2"/>
      <path d="M40 46 C49 52 51 63 40 76 C29 63 31 52 40 46Z" fill="#B08D57"/>
      <path d="M40 50 V73" stroke="#fff" stroke-width="1.2"/>
    </svg>`;
  }

  function deliveryArt() {
    return `
    <svg viewBox="0 0 80 100" class="pd-art">
      <path d="M28 28 Q28 10 40 10 Q52 10 52 28" fill="none" stroke="#2E4A3B" stroke-width="2.4" stroke-linecap="round"/>
      <path d="M12 26 H62 V94 H12 Z" fill="#fff" stroke="#2E4A3B" stroke-width="2"/>
      <path d="M62 26 L72 32 V90 L62 94 Z" fill="#E4F0EA" stroke="#2E4A3B" stroke-width="2" stroke-linejoin="round"/>
      <path d="M37 46 C46 52 48 63 37 76 C26 63 28 52 37 46Z" fill="#B08D57"/>
      <path d="M37 50 V73" stroke="#fff" stroke-width="1.2"/>
    </svg>`;
  }

  function promoStamps() {
    const cups = Array.from({ length: 5 }, (_, i) => `<span class="pc ${i === 4 ? 'ghost' : ''}">${i === 4 ? '<em>-30%</em>' : App.icons.logoMark('#F4EEE2', '#D9C29A')}</span>`).join('');
    return `
      <button class="promo tap" data-promo="stamps" style="background:linear-gradient(120deg,#E6F1EC,#CBE2D8)">
        <span class="pr-left">
          <span class="pr-frame">${cups}</span>
          <span class="pr-tag">GIẢM<br/>30%</span>
        </span>
        <span class="pr-right">
          <span class="pr-script">Ô Long Hoa Quế</span>
          <span class="pr-head">Sưu tập tem,<br/>mở giải thưởng</span>
          <span class="pr-date">Từ 02/11 đến 30/11/2026</span>
          <span class="pr-btn">KHÁM PHÁ THÊM</span>
        </span>
        <small class="pr-terms">*Điều kiện và điều khoản áp dụng.</small>
      </button>`;
  }

  function promoRefer() {
    const tags = [['GIẢM 50%', '1 LY SIZE L'], ['MIỄN PHÍ', '1 LY SIZE L'], ['VOUCHER', '50.000đ'], ['VOUCHER', '100.000đ']];
    return `
      <button class="promo tap" data-promo="refer" style="background:linear-gradient(120deg,#F3EEE2,#E3D7C0)">
        <span class="pr-left">
          <span class="pr-frame tags">${tags.map(([a, b], i) => `<span class="vt" style="--r:${[-4, 3, 2, -3][i]}deg"><b>${a}</b><small>${b}</small></span>`).join('')}</span>
        </span>
        <span class="pr-right">
          <span class="pr-script">Ô Long Hoa Quế</span>
          <span class="pr-head">Nhận phần thưởng<br/>cho mỗi lượt giới thiệu</span>
          <span class="pr-date">Từ 02/11 đến 30/11/2026</span>
        </span>
        <small class="pr-terms">*Điều kiện và điều khoản áp dụng.</small>
      </button>`;
  }

  function promoDelivery() {
    return `
      <button class="promo dark tap" data-promo="delivery" style="background:linear-gradient(120deg,#1F3329,#2E4A3B)">
        <svg class="pr-path" viewBox="0 0 408 166" preserveAspectRatio="none"><path d="M150 150 C200 120 210 70 260 60 S350 40 390 20" fill="none" stroke="#fff" stroke-opacity=".5" stroke-width="1.5" stroke-dasharray="3 6"/></svg>
        <span class="pr-dcopy">
          <span class="pr-dh">RA MẮT<br/>DỊCH VỤ GIAO HÀNG</span>
          <span class="pr-ds">Giao trong bán kính 5 km<br/>từ các cửa hàng ${App.config.brand.name}</span>
          <span class="pr-dbtn">ĐẶT GIAO NGAY</span>
        </span>
        <span class="pr-dart">
          <span class="c1">${App.art.product('p2', { shadow: false })}</span>
          <span class="c2">${App.art.product('p1', { shadow: false })}</span>
        </span>
        <span class="pr-scooter">${I.scooter}</span>
      </button>`;
  }

  // ---------------- lifecycle ----------------
  let unsub;
  renderGreet(); renderStamp(); renderActive();

  return {
    el,
    theme: () => 'dark',
    show() {
      App.device.setTheme('dark');
      startAuto();
      unsub = App.state.subscribe(() => { renderGreet(); renderStamp(); renderActive(); });
    },
    hide() { stopAuto(); unsub && unsub(); },
  };
};
