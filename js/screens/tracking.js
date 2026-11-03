// C8 · Theo dõi đơn hàng
// Tự đến lấy: ly đầy dần · mã nhận món (phóng to) · dòng thời gian · cửa hàng (gọi / chỉ đường)
// Giao hàng: bản đồ tuyến + tài xế di chuyển · thẻ tài xế · dòng thời gian · địa chỉ giao
// Hoàn tất: đánh giá nhanh 5 sao + Đặt hàng lại
App.screens.tracking = (orderId, { fromDetail } = {}) => {
  const P = App.payment;
  const vnd = App.fmt.vnd;
  const I = App.icons.ic;
  const o = () => P.getOrder(orderId);
  const od0 = o();
  const s = App.data.stores.find((x) => x.id === od0.storeId);
  const a = od0.addressId ? App.data.member.addresses.find((x) => x.id === od0.addressId) : null;
  const pickup = od0.mode === 'pickup';
  const back = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 5l-7 7 7 7"/></svg>';
  const phone = '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M6.6 10.8a15.1 15.1 0 0 0 6.6 6.6l2.2-2.2a1 1 0 0 1 1-.25 11.4 11.4 0 0 0 3.6.57 1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A17 17 0 0 1 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.25.2 2.45.57 3.57a1 1 0 0 1-.25 1z"/></svg>';
  const chat = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"><path d="M4 5h16v11H9l-5 4z"/></svg>';
  const nav = '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M21 3L3 10.5l7.5 3 3 7.5z"/></svg>';
  const star = '<svg viewBox="0 0 24 24"><path d="M12 3.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.9l-5.2 2.7 1-5.8L3.5 9.7l5.9-.9z"/></svg>';
  const hhmm = (ms) => { const d = new Date(ms); return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`; };
  const RIDER = { name: 'Trần Văn Tài', bike: 'Honda Wave · 59-X1 234.56', rate: '4.9' };

  const STEPS = pickup
    ? [['Đã thanh toán', 'Đơn đã gửi đến cửa hàng'], ['Đang pha chế', 'Pha mới từng ly theo tuỳ chọn của bạn'], ['Sẵn sàng tại quầy', 'Đưa mã nhận món cho nhân viên'], ['Đã nhận món', 'Chúc bạn ngon miệng!']]
    : [['Đã thanh toán', 'Đơn đã gửi đến cửa hàng'], ['Đang pha chế', 'Cửa hàng đang chuẩn bị món'], ['Đang giao hàng', 'Tài xế đang trên đường đến bạn'], ['Đã giao thành công', 'Chúc bạn ngon miệng!']];

  const el = App.ui.el(`
    <section class="trk ${pickup ? 'trk--pickup' : 'trk--delivery'}">
      <header class="trk-nav"><button class="trk-back" data-act="back" aria-label="Quay lại">${back}</button><h1>Theo dõi đơn hàng</h1><button class="trk-help" data-act="help">Hỗ trợ</button></header>
      <div class="trk-scroll">
        ${pickup ? '<div class="trk-hero"></div>' : `
        <div class="trk-map">
          <svg viewBox="0 0 440 300" preserveAspectRatio="xMidYMid slice">
            <rect width="440" height="300" fill="#EFEBE2"/>
            <path d="M330 -10 C 350 80, 300 140, 360 200 S 450 280, 470 320 L 470 -10Z" fill="#D7E5E8"/>
            <ellipse cx="120" cy="230" rx="50" ry="24" fill="#DCE7D2"/><ellipse cx="260" cy="60" rx="34" ry="18" fill="#DCE7D2"/>
            <g stroke="#fff" stroke-linecap="round" fill="none">
              <path d="M-10 90 L460 150" stroke-width="12"/><path d="M90 -10 L170 310" stroke-width="10"/>
              <path d="M-10 250 C 120 230, 240 260, 460 220" stroke-width="9"/><path d="M250 -10 L310 310" stroke-width="7"/>
              <path d="M-10 170 L240 160" stroke-width="5"/><path d="M380 -10 L330 310" stroke-width="5"/>
            </g>
            <path class="route-bg" d="M110 110 C 150 130, 170 160, 230 158 S 300 170, 305 215 S 330 250, 360 245" fill="none" stroke="#16241D" stroke-opacity=".15" stroke-width="10" stroke-linecap="round"/>
            <path class="route" d="M110 110 C 150 130, 170 160, 230 158 S 300 170, 305 215 S 330 250, 360 245" fill="none" stroke="#2E6B4C" stroke-width="5" stroke-linecap="round" stroke-dasharray="2 10"/>
            <g transform="translate(110 110)"><circle r="20" fill="#1F3329"/><g transform="translate(-10 -10) scale(.83)">${App.icons.ic.store.replace('<svg', '<svg width="24" height="24" color="#F4EEE2"')}</g></g>
            <g transform="translate(360 245)"><path d="M0 0 C-14 -16 -14 -34 0 -34 C14 -34 14 -16 0 0Z" fill="#B5462E"/><circle cy="-22" r="6" fill="#fff"/></g>
            <g class="rider"><circle r="17" fill="#fff" stroke="#2E6B4C" stroke-width="3"/><g transform="translate(-11 -11) scale(.92)" color="#2E6B4C">${App.icons.ic.scooter.replace('<svg', '<svg width="24" height="24"')}</g></g>
          </svg>
          <span class="trk-eta-chip"></span>
        </div>`}
        <div class="trk-body"></div>
      </div>
    </section>`);
  const $ = (q) => el.querySelector(q);
  const body = $('.trk-body');

  function etaText(od) {
    const base = od.paidAt || od.createdAt;
    if (pickup) return od.pickupTime ? `Hẹn lấy lúc ${od.pickupTime}` : `Sẵn sàng khoảng ${hhmm(base + s.wait * 60000)}`;
    return `Giao dự kiến ${hhmm(base + 25 * 60000)} – ${hhmm(base + 35 * 60000)}`;
  }

  // ly đầy dần theo tiến trình (Tự đến lấy)
  function cupHero(od, p, done) {
    const cup = App.data.menu.items.find((x) => x.id === od.lines[0].id)?.cup || { mid: '#D9B27C', bottom: '#8E5B2E' };
    const level = [0.22, 0.62, 1, 1][p];
    const y = 168 - 120 * level;
    return `
      <div class="trk-cup ${p >= 2 ? 'ready' : ''} ${done ? 'done' : ''}">
        <svg viewBox="0 0 160 200">
          <defs><clipPath id="tcc"><path d="M38 44 H122 L112 182 Q111 190 103 190 H57 Q49 190 48 182 Z"/></clipPath>
            <linearGradient id="tcg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${cup.mid}"/><stop offset="1" stop-color="${cup.bottom}"/></linearGradient></defs>
          <ellipse cx="80" cy="194" rx="46" ry="5" fill="#000" opacity=".08"/>
          <g clip-path="url(#tcc)">
            <rect x="30" y="0" width="100" height="200" fill="#F6F3EC"/>
            <g class="liquid" style="transform: translateY(${y}px)">
              <path class="wave" d="M0 6 Q 20 0 40 6 T 80 6 T 120 6 T 160 6 T 200 6 V 220 H 0 Z" fill="url(#tcg)"/>
            </g>
            <g fill="#fff" opacity=".35"><rect x="62" y="150" width="14" height="13" rx="3" transform="rotate(-12 69 156)"/><rect x="86" y="160" width="12" height="11" rx="3"/></g>
          </g>
          <path d="M38 44 H122 L112 182 Q111 190 103 190 H57 Q49 190 48 182 Z" fill="none" stroke="#16241D" stroke-width="2.4" stroke-linejoin="round"/>
          <path d="M32 44 H128" stroke="#16241D" stroke-width="3.4" stroke-linecap="round"/>
          <rect x="86" y="6" width="7" height="46" rx="3.5" fill="#1F3329" transform="rotate(12 90 30)"/>
          <g class="steam" stroke="#9DB8A8" stroke-width="2.4" fill="none" stroke-linecap="round"><path d="M60 30 c-6 -8 6 -12 0 -22"/><path d="M104 30 c-6 -8 6 -12 0 -22"/></g>
        </svg>
        ${done ? `<span class="trk-done">${App.icons.check}</span>` : ''}
      </div>`;
  }

  function render() {
    const od = o();
    if (!od) return;
    const p = Math.min(3, od.progress || 0);
    const done = p >= 3;
    const queue = Math.max(0, Math.round(s.wait / 3) - 1);
    const title = done ? (pickup ? 'Bạn đã nhận món' : 'Đã giao thành công') : STEPS[p][0];
    const lead = done ? 'Cảm ơn bạn đã chọn Mộc Trà!' : p === 0 ? `Trước bạn còn ${queue} ly đang pha` : p === 1 ? (pickup ? 'Ly của bạn đang được pha chế' : 'Cửa hàng đang chuẩn bị, tài xế sẽ đến lấy') : pickup ? `Mời bạn đến quầy ${s.name}` : `Tài xế ${RIDER.name} đang giao đến bạn`;

    if (pickup) {
      $('.trk-hero').innerHTML = `
        ${cupHero(od, p, done)}
        <h2>${title}</h2>
        <p class="trk-lead">${lead}</p>
        ${done ? '' : `<span class="trk-eta">${etaText(od)}</span>`}`;
    } else {
      $('.trk-eta-chip').innerHTML = done ? `${App.icons.check} Đã giao lúc ${hhmm(od.completedAt || Date.now())}` : `${I.scooter}<b>${etaText(od).replace('Giao dự kiến ', '')}</b>`;
      el.classList.toggle('moving', p === 2);
      el.classList.toggle('arrived', done);
    }

    body.innerHTML = `
      ${pickup ? '' : `
      <div class="trk-card trk-status">
        <h2>${title}</h2>
        <p class="trk-lead">${lead}</p>
        <div class="trk-seg">${[0, 1, 2, 3].map((i) => `<i class="${i < p || done ? 'on' : i === p ? 'cur' : ''}"></i>`).join('')}</div>
      </div>
      ${p >= 1 && !done ? `
      <div class="trk-card trk-rider">
        <span class="rd-av">${p === 1 ? '…' : 'TT'}</span>
        <div class="rd-t">${p === 1 ? '<b>Đang tìm tài xế</b><small>Thường mất 1–3 phút</small>' : `<b>${RIDER.name} <em>★ ${RIDER.rate}</em></b><small>${RIDER.bike}</small>`}</div>
        ${p >= 2 ? `<button class="rd-btn" data-act="chat" aria-label="Nhắn tin">${chat}</button><button class="rd-btn" data-act="callRider" aria-label="Gọi tài xế">${phone}</button>` : ''}
      </div>` : ''}`}

      ${pickup && !done ? `
      <button class="trk-card trk-code" data-act="code">
        <span><small>MÃ NHẬN MÓN</small><b>${od.pickupCode}</b></span>
        <span class="tc-zoom">Phóng to ${I.chevron}</span>
      </button>` : ''}

      ${done ? `
      <div class="trk-card trk-rate">
        <b>${od.rating ? 'Cảm ơn bạn đã đánh giá!' : 'Bạn thấy đơn hàng thế nào?'}</b>
        <div class="stars">${[1, 2, 3, 4, 5].map((n) => `<button data-star="${n}" class="${(od.rating || 0) >= n ? 'on' : ''}" aria-label="${n} sao">${star}</button>`).join('')}</div>
        <div class="trk-2btn"><button class="trk-btn line" data-act="detail">XEM CHI TIẾT</button><button class="trk-btn dark" data-act="reorder">ĐẶT HÀNG LẠI</button></div>
      </div>` : ''}

      <div class="trk-card">
        <h3>Tiến trình đơn hàng</h3>
        <ol class="trk-tl">
          ${STEPS.map(([t, d], i) => {
            const cls = i < p || done ? 'ok' : i === p ? 'cur' : '';
            const at = od.stepAt && od.stepAt[i];
            return `<li class="${cls}"><i>${cls === 'ok' ? App.icons.check : ''}</i><div><b>${t}</b><small>${d}</small></div><time>${at && (cls === 'ok' || cls === 'cur') ? hhmm(at) : ''}</time></li>`;
          }).join('')}
        </ol>
      </div>

      <div class="trk-card trk-place">
        ${pickup ? `
          <div class="tp-h"><span class="tp-ic">${I.store}</span><div><b>${s.name}</b><small>${s.address}</small><small>Mở cửa ${s.hours} · ${App.fmt.km(s.distance)}</small></div></div>
          <div class="tp-btns"><button data-act="call">${phone} Gọi cửa hàng</button><button data-act="direct">${nav} Chỉ đường</button></div>` : `
          <div class="tp-h"><span class="tp-ic red">${I.pin}</span><div><b>${a ? `${a.label} · ${a.line}` : 'Địa chỉ giao'}</b><small>${a ? a.detail : ''}</small><small>${a ? `${a.receiver} · ${a.phone}` : ''}</small></div></div>
          <div class="tp-btns"><button data-act="call">${phone} Gọi cửa hàng</button><button data-act="help">${chat} Cần hỗ trợ</button></div>`}
      </div>

      <button class="trk-card trk-sum" data-act="detail">
        <span class="ts-arts">${od.lines.slice(0, 3).map((l) => { const it = App.data.menu.items.find((x) => x.id === l.id); return `<span class="ci-art ${it.kind || 'drink'}">${App.menuArt(it)}</span>`; }).join('')}</span>
        <span class="ts-t"><b>${od.lines.reduce((n, l) => n + l.qty, 0)} món · ${vnd(od.money.total)}</b><small>Đơn #${od.code.slice(-6)} · ${od.payInfo || ''}</small></span>
        ${I.chevron}
      </button>`;
  }

  // xe chạy dọc tuyến khi đang giao
  let raf;
  function animateRider() {
    if (pickup) return;
    const path = el.querySelector('.route');
    const rider = el.querySelector('.rider');
    if (!path || !rider) return;
    const L = path.getTotalLength();
    const tick = () => {
      const od = o();
      const p = od ? od.progress || 0 : 0;
      let f = 0;
      if (p >= 3) f = 1;
      else if (p === 2) f = Math.min(0.97, (Date.now() - ((od.stepAt && od.stepAt[2]) || Date.now())) / P.STEP_MS);
      const pt = path.getPointAtLength(L * f);
      rider.setAttribute('transform', `translate(${pt.x.toFixed(1)} ${pt.y.toFixed(1)})`);
      raf = requestAnimationFrame(tick);
    };
    tick();
  }

  // phóng to mã nhận món
  function showCode() {
    const od = o();
    App.ui.haptic(5);
    const m = App.ui.el(`
      <div class="trk-full">
        <div class="tf-card">
          <small>MÃ NHẬN MÓN</small>
          <b>${od.pickupCode}</b>
          <div class="tf-qr">${App.art.qr(+od.pickupCode || 7)}</div>
          <p>${s.name}<br/>Đơn #${od.code.slice(-6)} · ${od.lines.reduce((n, l) => n + l.qty, 0)} món</p>
          <span>Độ sáng màn hình đã được tăng để quầy quét mã dễ hơn</span>
        </div>
        <button class="tf-x">Đóng</button>
      </div>`);
    m.addEventListener('click', () => { m.classList.add('closing'); setTimeout(() => m.remove(), 250); });
    document.getElementById('overlay').appendChild(m);
  }

  function helpSheet() {
    const sh = App.ui.sheet(`
      <div class="trk-helpsheet">
        <h3>Bạn cần hỗ trợ gì?</h3>
        ${[['late', 'Đơn hàng đến trễ'], ['wrong', 'Món không đúng / thiếu món'], ['change', 'Muốn đổi thông tin nhận hàng'], ['other', 'Vấn đề khác']].map(([k, t]) => `<button data-h="${k}">${t}${I.chevron}</button>`).join('')}
        <p>Đơn đã thanh toán không thể huỷ trên ứng dụng. Liên hệ cửa hàng nếu cần hỗ trợ gấp.</p>
      </div>`);
    sh.el.querySelectorAll('[data-h]').forEach((b) => (b.onclick = () => { sh.close(); setTimeout(() => App.ui.soon('C14', `Hỗ trợ: ${b.textContent}`), 300); }));
  }

  el.addEventListener('click', async (e) => {
    const st = e.target.closest('[data-star]');
    if (st) {
      App.ui.haptic(5);
      P.updateOrder(orderId, { rating: +st.dataset.star });
      render();
      return App.ui.toast(+st.dataset.star >= 4 ? 'Cảm ơn bạn! Mộc Trà rất vui khi bạn hài lòng' : 'Cảm ơn góp ý, chúng tôi sẽ cải thiện');
    }
    const act = e.target.closest('[data-act]')?.dataset.act;
    switch (act) {
      case 'back': return App.nav.pop();
      case 'detail': return fromDetail ? App.nav.pop() : App.nav.push(App.screens.orderDetail(orderId));
      case 'reorder': return P.reorder(o());
      case 'code': return showCode();
      case 'help': return helpSheet();
      case 'call':
        return App.ui.iosAlert({ title: 'Gọi cho cửa hàng?', message: `${s.name}\n028 3636 9460`, buttons: [{ label: 'Huỷ', value: 0 }, { label: 'Gọi', value: 1, bold: true }] })
          .then((v) => v && App.ui.toast('Đang gọi 028 3636 9460 (mô phỏng)'));
      case 'callRider':
        return App.ui.iosAlert({ title: `Gọi tài xế ${RIDER.name}?`, message: 'Cuộc gọi được ẩn số để bảo vệ thông tin của bạn.', buttons: [{ label: 'Huỷ', value: 0 }, { label: 'Gọi', value: 1, bold: true }] })
          .then((v) => v && App.ui.toast('Đang gọi tài xế (mô phỏng)'));
      case 'chat': return App.ui.toast('Mở khung chat với tài xế (mô phỏng)');
      case 'direct':
        return App.ui.iosAlert({ title: 'Mở chỉ đường bằng', message: s.address, buttons: [{ label: 'Apple Maps', value: 'Apple Maps' }, { label: 'Google Maps', value: 'Google Maps' }, { label: 'Huỷ', value: 0 }], layout: 'col' })
          .then((v) => v && App.ui.toast(`Mở ${v} (mô phỏng)`));
    }
  });

  // vẽ lại khi tiến trình đổi
  let sig = '';
  const unsub = App.state.subscribe(() => {
    const od = o(); if (!od) return;
    const ns = od.status + (od.progress || 0) + (od.rating || 0);
    if (ns !== sig) { sig = ns; if (el.isConnected) render(); }
  });

  render();
  return {
    el,
    statusBar: 'dark',
    onEnter() { requestAnimationFrame(animateRider); },
    onLeave() { unsub(); cancelAnimationFrame(raf); },
  };
};
