// C11 · Hạng hội viên + Điểm trà (đổi điểm lấy voucher)
// Hạng: thanh mốc + thẻ vuốt ngang (nền đổi theo hạng) + quyền lợi từng hạng
// Điểm trà: số dư · xem chi tiết (điểm sắp hết hạn) · lịch sử điểm / quy đổi · lưới voucher · chi tiết & đổi
(() => {
  const st = () => App.state.get();
  const vnd = App.fmt.vnd;
  const back = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 5l-7 7 7 7"/></svg>';
  const info = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><circle cx="12" cy="12" r="8.5"/><path d="M12 11v5M12 8v.5" stroke-linecap="round"/></svg>';
  const leaf = '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M5 19C5 10 10 5 20 4c0 9-5 15-15 15z" opacity=".9"/><path d="M5 19l8-8" stroke="#fff" stroke-width="1.4" fill="none"/></svg>';
  const header = (t, right = '') => `<header class="ly-nav"><button class="ly-back" data-act="back" aria-label="Quay lại">${back}</button><h1>${t}</h1>${right || '<span></span>'}</header>`;
  const fmtD = (ms) => { const d = new Date(ms); const p = (n) => String(n).padStart(2, '0'); return `${p(d.getDate())}/${p(d.getMonth() + 1)}/${d.getFullYear()}`; };

  // ---------- hạng ----------
  const TIERS = [
    { id: 'non', name: 'Lá Non', at: 0, tone: ['#DCE7DD', '#B9CDBE'], ink: '#2E4A3B', bg: '#EEF3EE',
      perks: [] },
    { id: 'xanh', name: 'Lá Xanh', at: 500, tone: ['#9CC5A6', '#5E9A71'], ink: '#14351F', bg: '#E3EFE5',
      perks: [['Quyền lợi thăng hạng', 'Giảm 30% 1 ly nước', 'up'], ['Quà tặng sinh nhật', 'Free 1 ly nước size M', 'bday'], ['Ngày thành viên', 'Giảm 10% mỗi thứ Ba', 'day']] },
    { id: 'vang', name: 'Lá Vàng', at: 1000, tone: ['#E9C98F', '#C9963F'], ink: '#4A3008', bg: '#F6ECD9',
      perks: [['Quyền lợi thăng hạng', 'Giảm 50% 1 ly nước', 'up'], ['Quà tặng sinh nhật', 'Free 1 ly nước size L', 'bday'], ['Ngày thành viên', 'Giảm 15% mỗi thứ Ba', 'day'], ['Tích điểm nhanh', 'x1,2 điểm trà mỗi đơn', 'x']] },
    { id: 'ngoc', name: 'Lá Ngọc', at: 2000, tone: ['#2F5D4B', '#12261E'], ink: '#F3E6CC', bg: '#DDE7E2',
      perks: [['Quyền lợi thăng hạng', 'Free 1 ly nước bất kỳ', 'up'], ['Quà tặng sinh nhật', 'Free 2 ly nước size L', 'bday'], ['Ngày thành viên', 'Giảm 20% mỗi thứ Ba', 'day'], ['Freeship', 'Miễn phí giao hàng không giới hạn', 'ship'], ['Quà hằng quý', 'Hộp trà giới hạn mỗi quý', 'gift']] },
  ];
  const earned = () => (st().isMember ? (st().profile && st().profile.isNew ? 0 : 1280) : 0); // điểm tích luỹ (xét hạng)
  const curTierIdx = () => { const e = earned(); let i = 0; TIERS.forEach((t, k) => { if (e >= t.at) i = k; }); return i; };
  const perkIc = {
    up: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"><path d="M7 8h10l-1.3 12a1 1 0 0 1-1 .9H9.3a1 1 0 0 1-1-.9z"/><path d="M6 8h12M12.5 8l1.3-4.5h2.5"/><path d="M12 17v-5M9.8 14l2.2-2.2 2.2 2.2"/></svg>',
    bday: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"><rect x="4" y="11" width="16" height="9" rx="1.5"/><path d="M4 15c2 1.5 4 1.5 6 0s4-1.5 6 0 3 1 4 0M12 11V8M12 6.5c-.8-.8-.8-2 0-3 .8 1 .8 2.2 0 3z"/></svg>',
    day: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"><path d="M3.5 7.5a1 1 0 0 1 1-1h15a1 1 0 0 1 1 1V10a2 2 0 0 0 0 4v2.5a1 1 0 0 1-1 1h-15a1 1 0 0 1-1-1V14a2 2 0 0 0 0-4z"/><path d="M9.5 14.5l5-5M9.5 9.6h.1M14.5 14.4h.1" stroke-linecap="round"/></svg>',
    x: leaf, ship: App.icons.ic.scooter, gift: App.icons.ic.gift,
  };

  function tierCardHTML(t, i, cur) {
    const e = earned();
    const next = TIERS[i + 1];
    return `
      <div class="tc ${i === cur ? 'me' : ''}" data-i="${i}" style="--t1:${t.tone[0]};--t2:${t.tone[1]};--ink:${t.ink}">
        <svg class="tc-pat" viewBox="0 0 300 160"><g fill="none" stroke="currentColor" stroke-opacity=".18" stroke-width="1.2">${Array.from({ length: 6 }, (_, k) => `<path d="M${-20 + k * 60} 170 C ${20 + k * 60} 100, ${-10 + k * 60} 60, ${40 + k * 60} -10"/>`).join('')}</g></svg>
        <span class="tc-emb">${App.icons.logoMark(t.ink, t.ink)}</span>
        <h3>${t.name}</h3>
        <p>Điểm trà tích luỹ hiện tại: ${e.toLocaleString('vi-VN')}</p>
        <small>${i === cur ? (next ? `Hạng hiện tại · lên ${next.name} khi đạt ${next.at.toLocaleString('vi-VN')} điểm` : 'Hạng cao nhất · hiệu lực đến 31/12/2027') : e >= t.at ? 'Đã mở khoá' : `Mở khoá khi đạt ${t.at.toLocaleString('vi-VN')} điểm`}</small>
        ${i === cur ? '<em class="tc-me">Hạng của bạn</em>' : ''}
      </div>`;
  }

  App.screens.tiers = () => {
    const cur = curTierIdx();
    let idx = cur;
    const e = earned();
    const nextT = TIERS[cur + 1];
    const el = App.ui.el(`
      <section class="ly tiers" style="--bg:${TIERS[cur].bg}">
        ${header(nextT ? `Thêm ${(nextT.at - e).toLocaleString('vi-VN')} điểm để thăng hạng!` : 'Bạn đang ở hạng cao nhất!')}
        <div class="tr-track">
          <span class="tr-line"><i style="width:${Math.min(100, (cur + Math.min(1, nextT ? (e - TIERS[cur].at) / (nextT.at - TIERS[cur].at) : 0)) / (TIERS.length - 1) * 100)}%"></i></span>
          ${TIERS.map((t, i) => `<button class="tr-dot ${i <= cur ? 'ok' : ''}" data-go="${i}" style="left:${(i / (TIERS.length - 1)) * 100}%"><small>${t.at.toLocaleString('vi-VN')}</small><i></i><span>${t.name}</span></button>`).join('')}
        </div>
        <div class="tr-rail">${TIERS.map((t, i) => tierCardHTML(t, i, cur)).join('')}</div>
        <div class="tr-perks"></div>
      </section>`);
    const rail = el.querySelector('.tr-rail');
    const perks = el.querySelector('.tr-perks');

    function paint(i) {
      idx = i;
      const t = TIERS[i];
      el.style.setProperty('--bg', t.bg);
      el.querySelectorAll('.tr-dot').forEach((d, k) => d.classList.toggle('on', k === i));
      el.querySelectorAll('.tc').forEach((c, k) => c.classList.toggle('active', k === i));
      perks.innerHTML = t.perks.length ? t.perks.map(([h, d, ic], k) => `
        <div class="pk" style="--k:${k}">
          <b>${h}</b>
          <div class="pk-row"><span class="pk-ic">${perkIc[ic]}</span><span>${d}</span></div>
          <span class="pk-wm">${perkIc[ic]}</span>
        </div>`).join('') : `
        <div class="pk-empty">
          <span>${App.icons.ic.gift}</span>
          <p>Nâng cấp lên hạng ${TIERS[1].name} để tận hưởng thêm nhiều quyền lợi thành viên</p>
          <button data-go="1">›››</button>
        </div>`;
    }
    function goTo(i, smooth = true) {
      const c = rail.children[i];
      rail.scrollTo({ left: c.offsetLeft - (rail.clientWidth - c.offsetWidth) / 2, behavior: smooth ? 'smooth' : 'auto' });
    }
    let t0;
    rail.addEventListener('scroll', () => {
      clearTimeout(t0);
      t0 = setTimeout(() => {
        const mid = rail.scrollLeft + rail.clientWidth / 2;
        let best = 0, dist = 1e9;
        [...rail.children].forEach((c, k) => { const d = Math.abs(c.offsetLeft + c.offsetWidth / 2 - mid); if (d < dist) { dist = d; best = k; } });
        if (best !== idx) { App.ui.haptic(3); paint(best); }
      }, 60);
    }, { passive: true });
    App.ui.dragScroll && App.ui.dragScroll(rail);
    el.addEventListener('click', (ev) => {
      if (ev.target.closest('[data-act="back"]')) return App.nav.pop();
      const g = ev.target.closest('[data-go]'); if (g) { paint(+g.dataset.go); return goTo(+g.dataset.go); }
      const c = ev.target.closest('.tc'); if (c) { paint(+c.dataset.i); goTo(+c.dataset.i); }
    });
    paint(cur);
    return { el, statusBar: 'dark', onEnter() { requestAnimationFrame(() => goTo(cur, false)); } };
  };

  // ---------- điểm trà ----------
  const CATALOG = [
    { id: 'pf-l', big: 'FREE 1', small: 'LY NƯỚC (L)', title: '1 ly miễn phí size L', cost: 1500, rule: { type: 'freeAny' }, desc: 'Đổi 1 ly đồ uống bất kỳ size L miễn phí, không giới hạn giá trị.' },
    { id: 'p25', big: 'GIẢM', small: '25%', title: 'Giảm 25%', cost: 500, rule: { type: 'pct1', pct: 25 }, desc: 'Giảm 25% cho 1 ly đồ uống có giá cao nhất trong đơn.' },
    { id: 'p50', big: 'GIẢM', small: '50%', title: 'Giảm 50%', cost: 1000, rule: { type: 'pct1', pct: 50 }, desc: 'Giảm 50% cho 1 ly đồ uống có giá cao nhất trong đơn.' },
    { id: 'pf-m', big: 'FREE 1', small: 'LY NƯỚC (M)', title: '1 ly miễn phí size M', cost: 1200, rule: { type: 'freeAny' }, desc: 'Đổi 1 ly đồ uống bất kỳ size Vừa miễn phí.' },
    { id: 'p100', big: 'GIẢM 100.000', small: 'QUÀ LƯU NIỆM', title: 'Giảm 100.000đ quà lưu niệm', cost: 2000, rule: { type: 'gift' }, desc: 'Giảm 100.000đ khi mua quà lưu niệm Mộc Trà tại quầy.' },
    { id: 'pup', big: 'FREE', small: 'UPSIZE', title: 'Nâng size miễn phí', cost: 200, rule: { type: 'flat', amount: 10000, min: 0 }, desc: 'Nâng 1 ly từ Vừa lên Lớn miễn phí (giảm 10.000đ).' },
  ];
  const balance = () => Math.max(0, earned() - (st().pointsSpent || 0));
  const ticketArt = (c, big) => `
    <svg viewBox="0 0 220 140" class="tk-art ${big ? 'big' : ''}">
      <rect width="220" height="140" fill="#EFE8DA"/>
      <g fill="none" stroke="#6E6A60" stroke-width="1" opacity=".55">
        <path d="M10 140V70l30-18 30 18v70M40 52V34M30 140v-30h20v30M140 140V60h60v80M150 60l20-16 20 16M156 80h14v14h-14zM178 80h14v14h-14zM80 140V90h50v50"/>
        <path d="M0 120h220M90 90l15-12 15 12"/>
      </g>
      <g transform="translate(46 34) rotate(-6)">
        <path d="M0 6a6 6 0 0 1 6-6h116a6 6 0 0 1 6 6v18a8 8 0 0 0 0 16v18a6 6 0 0 1-6 6H6a6 6 0 0 1-6-6V40a8 8 0 0 0 0-16z" fill="#F7F1E4" stroke="#B8AE98" stroke-width="1.2"/>
        <path d="M24 2v60" stroke="#C9BFA9" stroke-dasharray="3 3"/>
        <text x="12" y="38" font-size="7" fill="#9A8F78" transform="rotate(-90 12 38)" font-family="Be Vietnam Pro, sans-serif" letter-spacing="1">MỘC TRÀ</text>
        <text x="76" y="30" text-anchor="middle" font-size="${c.big.length > 8 ? 9 : 14}" font-weight="800" fill="#2B2A26" font-family="Be Vietnam Pro, sans-serif">${c.big}</text>
        <text x="76" y="46" text-anchor="middle" font-size="${c.small.length > 6 ? 7.5 : 13}" font-weight="800" fill="#2B2A26" font-family="Be Vietnam Pro, sans-serif">${c.small}</text>
      </g>
    </svg>`;

  function rulesModal() {
    const m = App.ui.el(`
      <div class="ly-modal"><div class="lm-card">
        <button class="lm-x" aria-label="Đóng">✕</button>
        <h3>Tận hưởng hành trình tích luỹ điểm thưởng cùng Mộc Trà! 🌿</h3>
        <div class="lm-body">
          <h4>Chương trình Điểm trà Mộc Trà</h4><p>Điểm trà được sử dụng cho tất cả cửa hàng Mộc Trà tại Việt Nam.</p>
          <h4>1. Làm thế nào để tích điểm?</h4>
          <p><b>1.1 Khi thanh toán trên ứng dụng:</b> mỗi 1.000đ thanh toán = 1 điểm trà, tính trên số tiền thực trả sau khuyến mãi. Đơn qua ứng dụng giao hàng của bên thứ ba không được tích điểm.</p>
          <p><b>1.2 Tại quầy:</b> đưa mã thành viên (QR ở tab Tôi) cho nhân viên trước khi thanh toán.</p>
          <p><b>1.3 Thời điểm cộng điểm:</b> điểm được cộng sau khi đơn hàng hoàn tất.</p>
          <h4>2. Quy định sử dụng</h4>
          <p><b>2.1 Thời hạn:</b> điểm có hiệu lực 365 ngày kể từ ngày tích; điểm sắp hết hạn được hiển thị trong mục Xem chi tiết.</p>
          <p><b>2.2 Quy đổi:</b> chọn voucher trong mục Điểm trà và bấm Đổi ngay. Voucher được lưu vào Kho quà, có hiệu lực 30 ngày.</p>
          <p><b>2.3 Không chuyển nhượng:</b> điểm không quy đổi thành tiền mặt và không chuyển giữa các tài khoản.</p>
          <h4>3. Thu hồi điểm</h4>
          <p>Đơn bị huỷ hoặc hoàn tiền sẽ bị trừ lại số điểm tương ứng. Mộc Trà có quyền thu hồi điểm của tài khoản có dấu hiệu gian lận.</p>
          <h4>4. Hỗ trợ</h4><p>Mọi thắc mắc vui lòng liên hệ tổng đài 1900 6868 (mô phỏng).</p>
        </div>
      </div></div>`);
    const close = () => { m.classList.add('closing'); setTimeout(() => m.remove(), 220); };
    m.addEventListener('click', (e) => { if (e.target === m || e.target.closest('.lm-x')) close(); });
    document.getElementById('overlay').appendChild(m);
  }

  App.screens.points = () => {
    const el = App.ui.el(`
      <section class="ly pts">
        ${header('ĐIỂM TRÀ CỦA TÔI', `<button class="ly-info" data-act="rules" aria-label="Thể lệ">${info}</button>`)}
        <div class="ly-scroll">
          <div class="pt-head">
            <b class="pt-bal"></b>
            <button class="pt-more" data-act="expiry">Xem chi tiết ${App.icons.ic.chevron}</button>
            <div class="pt-tabs"><button data-act="hist">${leaf}Lịch sử điểm trà</button><button data-act="redeems">${App.icons.ic.ticket}Lịch sử quy đổi</button></div>
          </div>
          <div class="pt-grid"></div>
          <p class="pt-end">— KẾT THÚC —</p>
        </div>
      </section>`);
    function render() {
      el.querySelector('.pt-bal').textContent = balance().toLocaleString('vi-VN');
      el.querySelector('.pt-grid').innerHTML = CATALOG.map((c, i) => `
        <button class="pt-item" data-c="${c.id}" style="--i:${i}">
          ${ticketArt(c)}
          <b>${c.title}</b><small>${c.desc}</small>
          <em class="${balance() >= c.cost ? 'ok' : ''}">${leaf}${c.cost.toLocaleString('vi-VN')}</em>
        </button>`).join('');
    }
    el.addEventListener('click', (e) => {
      const act = e.target.closest('[data-act]')?.dataset.act;
      if (act === 'back') return App.nav.pop();
      if (act === 'rules') return rulesModal();
      if (act === 'expiry') return App.nav.push(expiry());
      if (act === 'hist') return App.nav.push(historyPage('earn'));
      if (act === 'redeems') return App.nav.push(historyPage('redeem'));
      const c = e.target.closest('[data-c]');
      if (c) { App.ui.haptic(4); App.nav.push(rewardDetail(CATALOG.find((x) => x.id === c.dataset.c))); }
    });
    render();
    return { el, statusBar: 'dark', onResume: render };
  };

  function rewardDetail(c) {
    const el = App.ui.el(`
      <section class="ly rd">
        ${header('Chi tiết')}
        <div class="ly-scroll">
          <div class="rd-hero">${ticketArt(c, true)}</div>
          <div class="rd-card"><h2>${c.title}</h2><p>Giới hạn quy đổi: 99</p><p>Điểm cần để đổi: <b>${leaf}${c.cost.toLocaleString('vi-VN')}</b></p></div>
          <div class="rd-card"><h3>Thông tin chi tiết sản phẩm</h3>
            <ol><li>${c.desc}</li><li>Không áp dụng đồng thời với voucher hoặc chương trình khuyến mãi khác.</li><li>Voucher không có giá trị quy đổi thành tiền mặt.</li><li>Thời hạn sử dụng: 30 ngày kể từ ngày nhận voucher.</li><li>Áp dụng cho đơn đặt trên ứng dụng Mộc Trà và tại tất cả cửa hàng.</li><li>Mộc Trà có quyền sửa đổi điều khoản mà không cần thông báo trước.</li></ol>
          </div>
        </div>
        <div class="rd-foot"><button class="rd-go"></button></div>
      </section>`);
    const btn = el.querySelector('.rd-go');
    const paint = () => {
      const ok = st().isMember && balance() >= c.cost;
      btn.disabled = st().isMember && !ok;
      btn.textContent = !st().isMember ? 'ĐĂNG NHẬP ĐỂ ĐỔI' : ok ? `ĐỔI NGAY · ${c.cost.toLocaleString('vi-VN')} ĐIỂM` : 'ĐIỂM TRÀ KHÔNG ĐỦ';
    };
    el.addEventListener('click', async (e) => {
      if (e.target.closest('[data-act="back"]')) return App.nav.pop();
      if (!e.target.closest('.rd-go')) return;
      if (!st().isMember) return App.auth.require(paint, 'Đăng nhập để đổi điểm trà');
      const ok = await App.ui.iosAlert({ title: `Đổi ${c.cost.toLocaleString('vi-VN')} điểm?`, message: `Bạn sẽ nhận voucher “${c.title}” vào Kho quà. Số dư còn ${(balance() - c.cost).toLocaleString('vi-VN')} điểm.`, buttons: [{ label: 'Huỷ', value: false }, { label: 'Đổi', value: true, bold: true }] });
      if (!ok) return;
      const now = Date.now();
      const d = new Date(now); const p2 = (n) => String(n).padStart(2, '0');
      App.state.set({
        pointsSpent: (st().pointsSpent || 0) + c.cost,
        rewards: [...(st().rewards || []), { id: `${c.id}-${now}`, title: c.title, sub: `Đổi bằng ${c.cost.toLocaleString('vi-VN')} điểm trà`, at: `${d.getFullYear()}-${p2(d.getMonth() + 1)}-${p2(d.getDate())} ${p2(d.getHours())}:${p2(d.getMinutes())}`, used: false, rule: c.rule }],
        redeems: [{ at: now, title: c.title, cost: c.cost }, ...(st().redeems || [])],
      });
      App.ui.haptic([10, 40, 10]);
      paint();
      App.ui.toast('Đổi thành công · voucher đã vào Kho quà');
    });
    paint();
    return { el, statusBar: 'dark' };
  }

  function historyPage(kind) {
    const known = st().isMember && !(st().profile && st().profile.isNew);
    const day = 86400000, now = Date.now();
    const earnList = known ? [
      [now - 2 * day, 'Đơn #284981 · Mộc Trà Nguyễn Huệ', 107], [now - 6 * day, 'Đơn #651429 · Mộc Trà Bàu Cát', 84],
      [now - 12 * day, 'Mua tại quầy · Mộc Trà Nguyễn Huệ', 124], [now - 30 * day, 'Thưởng sinh nhật', 200],
      [now - 45 * day, 'Đơn #190354 · Mộc Trà Thảo Điền', 265], [now - 80 * day, 'Thưởng thăng hạng Lá Vàng', 500],
    ] : [];
    const list = kind === 'earn' ? earnList.map(([t, d, n]) => ({ t, d, n: `+${n}` })) : (st().redeems || []).map((r) => ({ t: r.at, d: r.title, n: `−${r.cost.toLocaleString('vi-VN')}` }));
    const el = App.ui.el(`
      <section class="ly hist">
        ${header(kind === 'earn' ? 'Lịch sử điểm trà' : 'Lịch sử quy đổi')}
        <div class="ly-scroll">${list.length ? list.map((x) => `
          <div class="hs-row"><span class="hs-ic ${kind}">${kind === 'earn' ? leaf : App.icons.ic.ticket}</span><div><b>${x.d}</b><small>${fmtD(x.t)}</small></div><em class="${kind}">${x.n}</em></div>`).join('') : `
          <div class="ly-empty">
            <svg viewBox="0 0 120 120"><path d="M40 44h40l6 60H34z" fill="#F3EEE4" stroke="#16241D" stroke-width="2.6" stroke-linejoin="round"/><path d="M48 44v-6a12 12 0 0 1 24 0v6" fill="none" stroke="#16241D" stroke-width="2.6"/><path d="M34 104l-10 6h76l-14-6" fill="#16241D" opacity=".85"/><g transform="translate(60 72)"><circle r="8" fill="#1F3329"/><path d="M0 -5 C3 -3 3.6 .7 0 5 C-3.6 .7 -3 -3 0 -5Z" fill="#F4EEE2"/></g></svg>
            <b>“KHÔNG CÓ LỊCH SỬ${kind === 'redeem' ? ' QUY ĐỔI' : ''}.”</b>
            <p>${kind === 'earn' ? 'Bạn chưa có bất kì lịch sử tích điểm trà nào.' : 'Bạn chưa có hoạt động đổi điểm nào.'}</p>
          </div>`}</div>
      </section>`);
    el.addEventListener('click', (e) => { if (e.target.closest('[data-act="back"]')) App.nav.pop(); });
    return { el, statusBar: 'dark' };
  }

  function expiry() {
    let tab = 'ok';
    const el = App.ui.el(`
      <section class="ly exp">
        ${header('Điểm sắp hết hạn')}
        <nav class="ex-tabs"><button data-t="ok" class="on">Khả dụng</button><button data-t="exp">Đã hết hạn</button><i></i></nav>
        <div class="ly-scroll"></div>
        <div class="rd-foot"><button class="rd-go" data-act="redeem">Đổi điểm</button></div>
      </section>`);
    const body = el.querySelector('.ly-scroll');
    function render() {
      const b = balance();
      const rows = tab === 'ok' && b ? [[Math.min(b, 320), '31/12/2026'], [Math.max(0, b - 320), '30/06/2027']].filter((r) => r[0] > 0) : [];
      body.innerHTML = tab === 'ok' ? `
        <div class="ex-card"><small>Điểm khả dụng</small><b>${b.toLocaleString('vi-VN')}</b><span class="ex-wm">${leaf}</span></div>
        ${rows.length ? rows.map(([n, d]) => `<div class="hs-row"><span class="hs-ic earn">${leaf}</span><div><b>${n.toLocaleString('vi-VN')} điểm</b><small>Hết hạn ngày ${d}</small></div></div>`).join('') : '<div class="ly-empty sm"><b>Chưa có điểm khả dụng.</b></div>'}`
        : '<div class="ly-empty sm"><b>Không có điểm đã hết hạn.</b><p>Điểm hết hạn trong 12 tháng gần nhất sẽ hiển thị ở đây.</p></div>';
    }
    el.addEventListener('click', (e) => {
      if (e.target.closest('[data-act="back"]') || e.target.closest('[data-act="redeem"]')) return App.nav.pop();
      const t = e.target.closest('[data-t]');
      if (t) { tab = t.dataset.t; el.querySelectorAll('[data-t]').forEach((x) => x.classList.toggle('on', x === t)); el.querySelector('.ex-tabs i').style.transform = `translateX(${t.offsetLeft - 16}px)`; render(); }
    });
    render();
    return { el, statusBar: 'dark' };
  }

  App.loyalty = { TIERS, earned, balance };
})();
