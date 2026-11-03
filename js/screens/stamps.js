// Bộ sưu tập tem (chiến dịch tích tem) + Phần thưởng của tôi
// Mở từ dải "Nhận phần thưởng bằng cách thu thập tem" ở Menu và thẻ tem ở Trang chủ.
(() => {
  const st = () => App.state.get();
  const back = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 5l-7 7 7 7"/></svg>';
  const chev = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 5l7 7-7 7"/></svg>';
  const gift = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect x="3.5" y="8.5" width="17" height="4" rx="1"/><path d="M5 12.5v7a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-7M12 8.5v12"/><path d="M12 8.5c-1-3-5-4.3-5.6-2.2C6 8 9.5 8.5 12 8.5zm0 0c1-3 5-4.3 5.6-2.2.4 1.7-3.1 2.2-5.6 2.2z"/></svg>';

  // ---------- cấu hình chiến dịch (sau này lấy từ Admin) ----------
  const CAMPAIGN = {
    name: 'Sip, Collect, Unlock',
    audience: 'Người dùng mới',
    title: 'Mỗi ly<br/>một tem',
    sub: 'Uống thêm, nhận thêm',
    endsAt: '01/12/2026 23:59',
    total: 10,
    milestones: [
      { at: 0, tag: 'QUÀ CHÀO', rewards: [{ title: 'Giảm 50%', sub: 'Cho 1 ly bất kỳ' }, { title: 'Mua 1 Tặng 1 Trà Trái Cây', sub: 'Áp dụng nhóm Trà Trái Cây' }] },
      { at: 3, tag: 'MUA 1<br/>TẶNG 1', rewards: [{ title: 'Mua 1 Tặng 1 Trà Sữa', sub: 'Áp dụng nhóm Trà Sữa Nguyên Lá' }] },
      { at: 5, tag: 'MUA 3<br/>TẶNG 1', rewards: [{ title: 'Mua 3 Tặng 1', sub: 'Áp dụng toàn menu đồ uống' }] },
      { at: 8, tag: 'LY<br/>MIỄN PHÍ', rewards: [{ title: 'Ly miễn phí size Lớn', sub: 'Lài Sữa, Ô Long Đào hoặc Hồng Trà Kem Mây' }] },
      { at: 10, tag: 'QUÀ<br/>EXPLORER', rewards: [{ title: 'Bộ quà Mộc Trà Explorer', sub: 'Túi vải + huy hiệu lá trà · nhận tại quầy' }] },
    ],
  };

  App.data.stampCampaign = CAMPAIGN; // dùng chung cho C6
  const stamps = () => (App.memberStamps());
  const claimed = () => st().claimedMilestones || [];
  const eligible = () => CAMPAIGN.milestones.filter((m) => m.at <= stamps() && !claimed().includes(m.at));
  const now = () => {
    const d = new Date(); const p = (n) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`;
  };

  // ly trên bệ (tem)
  function cupSVG(done) {
    return done
      ? `<path d="M-9 -30 h18 l-2 26 h-14z" fill="#E9D3AE"/><path d="M-8.4 -22 h16.8 l-1.4 18 h-14z" fill="#B9773A"/><rect x="-11" y="-34" width="22" height="5" rx="2" fill="#F6EEDF"/><circle cy="-13" r="3.6" fill="#1F3329"/>`
      : `<path d="M-9 -30 h18 l-2 26 h-14z" fill="#5B7568"/><rect x="-11" y="-34" width="22" height="5" rx="2" fill="#7D968A"/><circle cy="-13" r="3.6" fill="#45604F"/>`;
  }

  // ======================================================
  App.screens.stamps = ({ onOrder } = {}) => {
    const total = CAMPAIGN.total;
    const ms = Object.fromEntries(CAMPAIGN.milestones.map((m) => [m.at, m]));

    const el = App.ui.el(`
      <section class="stp">
        <header class="stp-nav"><button class="stp-back" data-act="back" aria-label="Quay lại">${back}</button><h1>Bộ sưu tập tem</h1><span></span></header>
        <div class="stp-scroll">
          <div class="stp-hero">
            <svg class="stp-leaves" viewBox="0 0 440 760" preserveAspectRatio="none">
              <g fill="#0F2019" opacity=".55">
                <path d="M-20 250 C 40 210, 90 230, 110 290 C 60 300, 10 290, -20 250Z"/>
                <path d="M-10 330 C 50 320, 80 350, 80 400 C 30 390, 0 370, -10 330Z"/>
                <path d="M460 470 C 400 450, 350 480, 340 530 C 390 530, 440 510, 460 470Z"/>
                <path d="M460 560 C 410 560, 380 600, 390 640 C 430 630, 455 600, 460 560Z"/>
              </g>
            </svg>
            <div class="stp-brand">${App.icons.logoMark('#D9B77A', '#D9B77A')}</div>
            <h2 class="stp-title"><small>✦ ${CAMPAIGN.name} ✦</small>${CAMPAIGN.title}</h2>
            <p class="stp-sub">${CAMPAIGN.sub}</p>
            <button class="stp-vault" data-act="vault">${gift}<span>Kho quà</span><i class="vault-dot"></i></button>
            <div class="stp-map">
              <svg class="road" viewBox="0 0 440 620">
                <defs>
                  <linearGradient id="roadG" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#3D6151"/><stop offset="1" stop-color="#2A4A3B"/></linearGradient>
                </defs>
                <path class="r-shadow" d="M70 40 C 330 20, 420 120, 320 175 S 60 230, 110 330 S 400 390, 330 470 S 120 520, 220 585" fill="none" stroke="#0C1914" stroke-width="78" stroke-linecap="round" transform="translate(0 14)"/>
                <path class="r-body" d="M70 40 C 330 20, 420 120, 320 175 S 60 230, 110 330 S 400 390, 330 470 S 120 520, 220 585" fill="none" stroke="url(#roadG)" stroke-width="78" stroke-linecap="round"/>
                <path class="r-line" d="M70 40 C 330 20, 420 120, 320 175 S 60 230, 110 330 S 400 390, 330 470 S 120 520, 220 585" fill="none" stroke="#9FB8A9" stroke-opacity=".45" stroke-width="2" stroke-dasharray="6 9"/>
                <path class="r-done" d="M70 40 C 330 20, 420 120, 320 175 S 60 230, 110 330 S 400 390, 330 470 S 120 520, 220 585" fill="none" stroke="#D9B77A" stroke-width="3" stroke-linecap="round"/>
                <g class="stairs" transform="translate(330 520)">
                  ${[0, 1, 2, 3, 4].map((i) => `<rect x="${i * 10}" y="${50 - i * 12}" width="${60 - i * 10}" height="12" fill="${i % 2 ? '#E9C98F' : '#D9B77A'}"/>`).join('')}
                </g>
                <g class="pods"></g>
              </svg>
              <button class="stp-explorer" data-act="explorer"><span>Phần thưởng<br/>Mộc Trà Explorer</span>${chev}</button>
            </div>
          </div>

          <div class="stp-summary">
            <button class="stp-count" data-act="count">Bạn đã tích luỹ <b>${stamps()}</b> tem ${chev}</button>
            <p>Chương trình có hiệu lực đến ${CAMPAIGN.endsAt}</p>
            <button class="stp-claim" data-act="claim"></button>
            <button class="stp-order" data-act="order">ĐẶT NGAY</button>
          </div>

          <div class="stp-rules">
            <h3><i></i>Thể lệ chương trình<i></i></h3>
            <ol>
              <li>Chương trình “${CAMPAIGN.name}” dành cho người dùng mới của Mộc Trà, diễn ra từ 07:00 ngày 03/10/2026 đến ${CAMPAIGN.endsAt}.</li>
              <li>Vui lòng cập nhật ứng dụng lên phiên bản mới nhất trước khi tham gia.</li>
              <li>Mỗi ly đồ uống thanh toán qua app Mộc Trà được cộng 1 tem sau khi đơn hoàn tất. Hộp trà và quà lưu niệm không được tính tem.</li>
              <li>Đơn dùng voucher đồ uống miễn phí hoặc giảm 100% không được tính tem.</li>
              <li>Khi đạt mốc, bấm <b>“Nhận Thưởng”</b> để nhận quà vào Kho quà:
                <ul>${CAMPAIGN.milestones.map((m) => `<li><b>${m.at} tem:</b> ${m.rewards.map((r) => r.title).join(' + ')}</li>`).join('')}</ul>
              </li>
              <li>Voucher có hiệu lực 14 ngày kể từ ngày nhận. Phần thưởng chưa nhận sẽ hết hạn sau 5 ngày kể từ khi chương trình kết thúc.</li>
              <li>Mộc Trà có quyền thu hồi phần thưởng của tài khoản có dấu hiệu gian lận (nhiều tài khoản trên một thiết bị, đơn ảo…).</li>
              <li>Mộc Trà có quyền điều chỉnh thể lệ; thay đổi sẽ được thông báo trên ứng dụng.</li>
            </ol>
          </div>
        </div>
      </section>`);

    const $ = (s) => el.querySelector(s);
    const scroller = $('.stp-scroll');
    const roadPath = $('.r-body');

    // đặt 10 bệ ly dọc con đường
    function buildPods() {
      const L = roadPath.getTotalLength();
      const have = stamps();
      const pods = [];
      for (let i = 1; i <= total; i++) {
        const pt = roadPath.getPointAtLength(L * ((i - 0.5) / total));
        const done = i <= have;
        const m = ms[i];
        const next = i === have + 1;
        pods.push(`
          <g class="pod ${done ? 'done' : ''} ${next ? 'next' : ''} ${m ? 'ms' : ''}" data-pod="${i}" transform="translate(${pt.x.toFixed(1)} ${pt.y.toFixed(1)})" style="--d:${i * 70}ms">
            <g class="pod-in">
              ${next ? '<ellipse class="pod-ring" rx="30" ry="11" fill="none" stroke="#D9B77A" stroke-width="2"/>' : ''}
              <ellipse cy="5" rx="22" ry="8" fill="#16302A"/>
              <rect x="-22" y="-3" width="44" height="8" fill="${done ? '#C9D8CF' : '#8FA89B'}"/>
              <ellipse cy="-3" rx="22" ry="8" fill="${done ? '#EEF3EF' : '#B4C6BB'}"/>
              <g class="cup">${cupSVG(done)}</g>
              ${m ? `<g class="tkt" transform="translate(16 -46) rotate(-8)">
                  <rect x="0" y="0" width="54" height="26" rx="3" fill="${done ? '#E8B97A' : '#D9B77A'}"/>
                  <circle cx="0" cy="13" r="4" fill="#1A3329"/><circle cx="54" cy="13" r="4" fill="#1A3329"/>
                  <foreignObject x="3" y="2" width="48" height="22"><div class="tkt-t" xmlns="http://www.w3.org/1999/xhtml">${m.tag}</div></foreignObject>
                </g>
                <text class="ord" x="-30" y="-30">${i}</text>` : ''}
            </g>
          </g>`);
      }
      $('.pods').innerHTML = pods.join('');
      // phần đường đã đi (vàng)
      const done = $('.r-done');
      const frac = have ? (have - 0.5) / total : 0;
      done.style.strokeDasharray = `${L}`;
      done.style.strokeDashoffset = `${L}`;
      requestAnimationFrame(() => requestAnimationFrame(() => {
        done.style.transition = 'stroke-dashoffset 1.4s .4s cubic-bezier(.4,0,.2,1)';
        done.style.strokeDashoffset = `${L * (1 - frac)}`;
      }));
    }

    function renderClaim() {
      const el2 = $('.stp-claim');
      const n = eligible().length;
      el2.disabled = !st().isMember ? false : n === 0;
      el2.textContent = !st().isMember ? 'Đăng nhập để nhận thưởng' : n ? `Nhận Thưởng (${n})` : 'Đã nhận hết thưởng hiện có';
      el2.classList.toggle('ready', st().isMember && n > 0);
      $('.vault-dot').classList.toggle('on', (st().rewards || []).some((r) => !r.used));
    }

    function milestoneSheet(m) {
      const have = stamps();
      const status = claimed().includes(m.at) ? '<span class="ms-st ok">Đã nhận</span>'
        : have >= m.at ? '<span class="ms-st go">Đủ điều kiện · bấm Nhận Thưởng</span>'
        : `<span class="ms-st">Cần thêm ${m.at - have} tem</span>`;
      App.ui.sheet(`
        <div class="ms-sheet">
          <span class="ms-eyebrow">Mốc ${m.at} tem</span>
          ${m.rewards.map((r) => `<div class="ms-r"><span class="ms-ic">${gift}</span><div><b>${r.title}</b><small>${r.sub}</small></div></div>`).join('')}
          ${status}
        </div>`);
    }

    async function claim() {
      if (!st().isMember) return App.auth.require(() => { renderClaim(); }, 'Đăng nhập để nhận quà Sip, Collect, Unlock');
      const list = eligible();
      if (!list.length) return;
      App.ui.haptic(15);
      const at = now();
      const got = list.flatMap((m) => m.rewards.map((r, i) => ({ id: `r${m.at}-${i}`, ...r, at, used: false })));
      App.state.set({
        claimedMilestones: [...claimed(), ...list.map((m) => m.at)],
        rewards: [...(st().rewards || []), ...got],
      });
      renderClaim();
      const sh = App.ui.sheet(`
        <div class="claim-sheet">
          <div class="cs-burst">${Array.from({ length: 12 }, (_, i) => `<i style="--a:${i * 30}deg"></i>`).join('')}<span>${gift}</span></div>
          <h3>Chúc mừng!</h3>
          <p>Bạn nhận được ${got.length} phần thưởng, đã lưu vào Kho quà.</p>
          <div class="cs-list">${got.map((r, i) => `<div class="cs-t" style="--i:${i}"><b>${r.title}</b><small>${r.sub}</small></div>`).join('')}</div>
          <button class="cs-btn">XEM KHO QUÀ</button>
        </div>`);
      sh.el.querySelector('.cs-btn').onclick = () => { sh.close(); setTimeout(() => App.nav.push(App.screens.rewards({ onUse })), 250); };
    }

    // dùng voucher → quay về Menu
    async function onUse(r) {
      App.state.set({ appliedReward: r.id });
      await App.nav.pop();
      await App.nav.pop();
      onOrder && onOrder();
      App.ui.toast(`Đã chọn “${r.title}” · áp dụng khi thanh toán`);
    }

    el.addEventListener('click', (e) => {
      const pod = e.target.closest('[data-pod]');
      if (pod && ms[+pod.dataset.pod]) return milestoneSheet(ms[+pod.dataset.pod]);
      const act = e.target.closest('[data-act]')?.dataset.act;
      switch (act) {
        case 'back': return App.nav.pop();
        case 'vault': return App.nav.push(App.screens.rewards({ onUse }));
        case 'explorer': return milestoneSheet(ms[10]);
        case 'count': return milestoneSheet(CAMPAIGN.milestones.find((m) => m.at > stamps()) || ms[10]);
        case 'claim': return claim();
        case 'order': App.nav.pop(); return onOrder && onOrder();
      }
    });

    // header: trong suốt trên hero → trắng khi cuộn
    let solid = false;
    scroller.addEventListener('scroll', () => {
      const s = scroller.scrollTop > 60;
      if (s === solid) return;
      solid = s;
      el.classList.toggle('solid', s);
      App.device.setTheme(s ? 'dark' : 'light');
    }, { passive: true });

    renderClaim();
    return {
      el,
      get statusBar() { return solid ? 'dark' : 'light'; },
      onEnter() { requestAnimationFrame(buildPods); },
      // quay lại (VD: sau khi đăng nhập) → cập nhật số tem + vẽ lại bệ ly
      onResume() { renderClaim(); $('.stp-count b').textContent = stamps(); buildPods(); },
    };
  };

  // ======================================================
  // Phần thưởng của tôi (Kho quà)
  // ======================================================
  // voucher mẫu cho hội viên (khớp thông báo "Bạn vừa nhận voucher mới")
  const DAY = 86400000;
  const fmtAt = (ms) => { const d = new Date(ms); const p = (n) => String(n).padStart(2, '0'); return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`; };
  const fmtD = (ms) => { const d = new Date(ms); const p = (n) => String(n).padStart(2, '0'); return `${p(d.getDate())}/${p(d.getMonth() + 1)}/${d.getFullYear()}`; };
  function mockVouchers() {
    const now = Date.now();
    return [
      { id: 'mv-50', title: 'Giảm 50%', sub: 'Cho 1 ly bất kỳ · quà hội viên mới', at: fmtAt(now - DAY), exp: now + 13 * DAY, used: false, rule: { type: 'pct1', pct: 50 } },
      { id: 'mv-ship', title: 'Miễn phí giao hàng', sub: 'Đơn giao hàng dưới 99.000đ', at: fmtAt(now - 3 * DAY), exp: now + 6 * DAY, used: false, rule: { type: 'ship' } },
      { id: 'mv-20k', title: 'Giảm 20.000đ', sub: 'Cho đơn từ 150.000đ', at: fmtAt(now - 5 * DAY), exp: now + 2 * DAY, used: false, rule: { type: 'flat', amount: 20000, min: 150000 } },
      { id: 'mv-tue', title: 'Thứ Ba vui vẻ · Giảm 15%', sub: 'Ngày thành viên · 1 ly đồ uống', at: fmtAt(now - 2 * DAY), exp: now + 20 * DAY, used: false, rule: { type: 'pct1', pct: 15 } },
      { id: 'mv-b1g1', title: 'Mua 1 Tặng 1 Trà Sữa', sub: 'Áp dụng nhóm Trà Sữa Nguyên Lá', at: fmtAt(now - 20 * DAY), exp: now + 10 * DAY, used: true, usedAt: now - 12 * DAY, usedOn: 'Đơn #651429 · Mộc Trà Bàu Cát', rule: { type: 'b1g1', cat: 'milk', catName: 'Trà Sữa Nguyên Lá' } },
      { id: 'mv-bday', title: 'Ly miễn phí sinh nhật', sub: 'Quà sinh nhật hạng Lá Vàng', at: fmtAt(now - 40 * DAY), exp: now - 10 * DAY, used: true, usedAt: now - 30 * DAY, usedOn: 'Mua tại quầy · Mộc Trà Nguyễn Huệ', rule: { type: 'freeAny' } },
    ];
  }
  // gắn voucher mẫu một lần khi là hội viên
  function seedVouchers(d) {
    if (!d.isMember || d.vouchersSeeded) return;
    const have = new Set((d.rewards || []).map((r) => r.id));
    App.state.set({ vouchersSeeded: true, rewards: [...mockVouchers().filter((v) => !have.has(v.id)), ...(d.rewards || [])] });
  }
  seedVouchers(st());
  App.state.subscribe(seedVouchers);

  // con dấu tròn Mộc Trà: vòng chữ "MỘC TRÀ · TRÀ NGUYÊN LÁ", logo ở giữa, băng chữ trạng thái
  let sealSeq = 0;
  function seal(text, color) {
    const id = 'seal' + ++sealSeq;
    return `<svg viewBox="0 0 100 100" aria-label="${text}">
      <defs><path id="${id}" d="M50 50 m-36 0 a36 36 0 1 1 72 0 a36 36 0 1 1 -72 0"/></defs>
      <g fill="none" stroke="${color}"><circle cx="50" cy="50" r="46" stroke-width="3"/><circle cx="50" cy="50" r="40" stroke-width="1" stroke-dasharray="2 2.4"/><circle cx="50" cy="50" r="27" stroke-width="1.6"/></g>
      <text font-size="8.6" font-weight="800" letter-spacing="2.2" fill="${color}" font-family="Be Vietnam Pro, sans-serif"><textPath href="#${id}" startOffset="2%">MỘC TRÀ ★ TRÀ NGUYÊN LÁ ★</textPath></text>
      <g transform="translate(50 42) scale(.62)"><path d="M0 -18 C11 -11 13 3 0 18 C-13 3 -11 -11 0 -18Z" fill="${color}"/><path d="M0 -12 V14" stroke="#fff" stroke-width="1.6"/></g>
      <rect x="14" y="54" width="72" height="17" rx="2" fill="#fff" stroke="${color}" stroke-width="2"/>
      <text x="50" y="66.5" text-anchor="middle" font-size="11" font-weight="900" letter-spacing="1.2" fill="${color}" font-family="Be Vietnam Pro, sans-serif">${text}</text>
    </svg>`;
  }

  App.screens.rewards = ({ onUse } = {}) => {
    let tab = 'new';
    const el = App.ui.el(`
      <section class="rw">
        <header class="stp-nav solid-always"><button class="stp-back" data-act="back">${back}</button><h1>Voucher của tôi</h1><span></span></header>
        <nav class="rw-tabs"><button data-tab="new" class="on"></button><button data-tab="used"></button><i></i></nav>
        <div class="rw-list"></div>
      </section>`);
    const list = el.querySelector('.rw-list');
    const ticketArt = `<svg viewBox="0 0 24 24" fill="none" stroke="#9A6B2F" stroke-width="1.4" stroke-linejoin="round"><path d="M6.5 7h11l-1.5 13.2a1 1 0 0 1-1 .8H9a1 1 0 0 1-1-.8z"/><path d="M5.5 7h13M9 4h6l1 3H8z"/><path d="M13.6 12.2a2.2 2.2 0 1 0 0 3.1" stroke-linecap="round"/></svg>`;
    // mặc định khi dùng voucher: chọn cho đơn tiếp theo rồi về Menu
    const use = onUse || (async (r) => { App.state.set({ appliedReward: r.id }); await App.nav.popToRoot(); App.goTab && App.goTab('order'); App.ui.toast(`Đã chọn “${r.title}” · áp dụng khi thanh toán`); });

    function render() {
      const all = (st().rewards || []).slice().reverse();
      const fresh = all.filter((r) => !r.used && !(r.exp && r.exp < Date.now()));
      const used = all.filter((r) => r.used || (r.exp && r.exp < Date.now()));
      el.querySelector('[data-tab="new"]').textContent = `Chưa sử dụng (${fresh.length})`;
      el.querySelector('[data-tab="used"]').textContent = `Đã sử dụng (${used.length})`;
      const rs = tab === 'new' ? fresh : used;
      list.innerHTML = rs.length ? rs.map((r, i) => {
        const soon = r.exp && !r.used && r.exp - Date.now() < 3 * DAY;
        const expired = !r.used && r.exp && r.exp < Date.now();
        return `
        <div class="rw-card ${tab === 'used' ? 'used' : ''}" style="--i:${i}">
          <span class="rw-tkt">${ticketArt}</span>
          <div class="rw-info">
            <b>${r.title}</b><small>${r.sub}</small>
            ${tab === 'used'
              ? `<em>${r.used ? `Đã dùng ${r.usedAt ? fmtD(r.usedAt) : ''}${r.usedOn ? ` · ${r.usedOn}` : ''}` : `Hết hạn ${fmtD(r.exp)}`}</em>`
              : `<em class="${soon ? 'soon' : ''}">${r.exp ? `HSD ${fmtD(r.exp)}${soon ? ' · sắp hết hạn' : ''}` : `Nhận ${r.at}`}</em>`}
          </div>
          ${tab === 'used'
            ? `<span class="rw-stamp">${seal(r.used ? 'ĐÃ DÙNG' : 'HẾT HẠN', r.used ? '#B5462E' : '#8E908A')}</span>`
            : `<button class="rw-use" data-use="${r.id}">${st().appliedReward === r.id ? 'ĐANG CHỌN' : 'SỬ DỤNG'}</button>`}
        </div>`;
      }).join('')
        : `<div class="rw-empty"><span>${gift}</span><b>${tab === 'new' ? 'Chưa có voucher khả dụng' : 'Chưa có voucher đã sử dụng'}</b><p>${tab === 'new' ? 'Đổi điểm trà hoặc đạt mốc tem để nhận thêm voucher.' : 'Voucher đã dùng hoặc hết hạn sẽ hiển thị ở đây.'}</p></div>`;
    }

    el.addEventListener('click', (e) => {
      if (e.target.closest('[data-act="back"]')) return App.nav.pop();
      const t = e.target.closest('[data-tab]');
      if (t) {
        tab = t.dataset.tab;
        el.querySelectorAll('[data-tab]').forEach((b) => b.classList.toggle('on', b === t));
        el.querySelector('.rw-tabs i').style.transform = `translateX(${t.offsetLeft - 20}px)`;
        el.querySelector('.rw-tabs i').style.width = `${t.offsetWidth}px`;
        return render();
      }
      const u = e.target.closest('[data-use]');
      if (u) {
        App.ui.haptic(10);
        const r = (st().rewards || []).find((x) => x.id === u.dataset.use);
        return use(r);
      }
    });

    render();
    return {
      el, statusBar: 'dark', onResume: render,
      onEnter() { requestAnimationFrame(() => { const t = el.querySelector('[data-tab="new"]'); const i = el.querySelector('.rw-tabs i'); i.style.width = `${t.offsetWidth}px`; }); },
    };
  };
})();
