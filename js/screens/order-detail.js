// Chi tiết đơn hàng — trạng thái Chờ thanh toán (giữ 15 phút) / Đơn hàng bị huỷ
// Chờ thanh toán: đếm ngược · XỬ LÝ THANH TOÁN (chọn lại phương thức → cổng) · HUỶ ĐƠN HÀNG
// Bị huỷ: thông báo đẩy + ĐẶT HÀNG LẠI (đưa món về giỏ)
App.screens.orderDetail = (orderId) => {
  const P = App.payment;
  const vnd = App.fmt.vnd;
  const I = App.icons.ic;
  const byId = Object.fromEntries(App.data.menu.items.map((x) => [x.id, x]));
  const closeIc = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><path d="M9 9l6 6M15 9l-6 6"/></svg>';
  const phoneIc = '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M6.6 10.8a15.1 15.1 0 0 0 6.6 6.6l2.2-2.2a1 1 0 0 1 1-.25 11.4 11.4 0 0 0 3.6.57 1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A17 17 0 0 1 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.25.2 2.45.57 3.57a1 1 0 0 1-.25 1z"/></svg>';
  const hourglass = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"><path d="M7 3h10M7 21h10M8 3c0 5 8 5 8 9s-8 4-8 9M16 3c0 5-8 5-8 9s8 4 8 9"/></svg>';
  const reorderIc = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12a8 8 0 1 0 2.4-5.7L4 8.5"/><path d="M4 4v4.5h4.5"/></svg>';

  let more = false;
  const el = App.ui.el(`
    <section class="od">
      <header class="od-nav"><button class="od-x" data-act="close" aria-label="Đóng">${closeIc}</button><h1>Chi tiết đơn hàng</h1><span></span></header>
      <div class="od-scroll"></div>
    </section>`);
  const body = el.querySelector('.od-scroll');
  const o = () => P.getOrder(orderId);
  const fmtTime = (ms) => { const d = new Date(ms); const p = (n) => String(n).padStart(2, '0'); return `${p(d.getDate())}/${p(d.getMonth() + 1)}/${d.getFullYear()} ${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`; };
  const left = () => Math.max(0, o().expiresAt - Date.now());
  const mmss = (ms) => `${String(Math.floor(ms / 60000)).padStart(2, '0')}:${String(Math.floor(ms / 1000) % 60).padStart(2, '0')}`;

  function render() {
    const od = o();
    const s = App.data.stores.find((x) => x.id === od.storeId);
    const a = od.addressId ? App.data.member.addresses.find((x) => x.id === od.addressId) : null;
    const pm = App.data.payMethods.find((p) => p.id === od.payMethod);
    const m = od.money;
    const count = od.lines.reduce((n, l) => n + l.qty, 0);

    body.innerHTML = `
      ${statusBlock(od, s, m)}
      <div class="od-card">
        <div class="od-store"><button data-act="store"><b>${s.name.toUpperCase()}</b>${I.chevron}</button><button class="od-call" data-act="call" aria-label="Gọi cửa hàng">${phoneIc}</button></div>
        ${od.lines.map((l) => { const it = byId[l.id]; return `
          <div class="od-item">
            <span class="ci-art ${it.kind || 'drink'}">${App.menuArt(it)}</span>
            <div class="ci-info"><b>${it.name}</b><small>${l.opts || it.desc || it.sub || ''}</small></div>
            <div class="od-ip"><b>${vnd((l.unit ?? it.price) * l.qty)}</b><small>x${l.qty}</small></div>
          </div>`; }).join('')}
      </div>

      <div class="od-card od-where">
        ${a ? `
          <div class="od-addr"><span class="ap-tag">${a.label}</span><b>${a.line}</b></div>
          <p>${a.detail}</p><small>${a.receiver} · ${a.phone}</small>` : `
          <div class="od-addr"><span class="ap-tag">Tự đến lấy</span><b>${s.name}</b></div>
          <p>${s.address}</p><small>${od.pickupTime ? `Hẹn lấy lúc ${od.pickupTime}` : `Nhận ngay · chờ khoảng ${s.wait} phút`}</small>`}
        <span class="od-pin">${I.pin}</span>
      </div>

      ${m.voucher ? `<div class="od-card od-v"><span>${I.ticket}Phiếu giảm giá</span><b>${m.voucher}</b></div>` : ''}
      ${od.status === 'paid' && od.stamps ? `<button class="od-card od-stamps" data-act="promo"><span>${App.icons.ic.cupMini}</span><div><b>+${od.stamps} tem · Sip, Collect, Unlock</b><small>${od.progress >= 3 ? 'Đã cộng vào bộ sưu tập tem' : 'Sẽ cộng khi đơn hoàn tất'}</small></div>${I.chevron}</button>` : ''}
      ${od.status === 'cancelled' ? `
        <div class="od-card od-info">
          <h4>Thông tin huỷ đơn</h4>
          <div><span>Thời gian huỷ</span><span>${fmtTime(od.cancelledAt || od.expiresAt)}</span></div>
          <div><span>Lý do</span><span>${od.cancelReason === 'timeout' ? 'Quá thời gian thanh toán' : 'Khách hàng huỷ đơn'}</span></div>
          <div><span>Hoàn tiền</span><span>Đơn chưa thanh toán · không phát sinh phí</span></div>
          ${m.voucher ? `<div><span>Voucher</span><span>Đã hoàn “${m.voucher}” về Kho quà</span></div>` : ''}
        </div>` : ''}

      <div class="od-card">
        <div class="od-more ${more ? 'open' : ''}">
          ${m.discount ? `<div class="co-sum"><span>Tổng chiết khấu<small>Phiếu giảm giá được áp dụng</small></span><span>− ${vnd(m.discount)}</span></div>` : ''}
          <div class="co-sum muted"><span>VAT 8% (đã bao gồm)</span><span>${vnd(m.vat)}</span></div>
          ${od.mode === 'delivery' ? `<div class="co-sum"><span>Phí giao hàng</span><span>${m.ship ? '+ ' + vnd(m.ship) : 'Miễn phí'}</span></div>` : ''}
          ${m.pack ? `<div class="co-sum"><span>Túi mang đi</span><span>+ ${vnd(m.pack)}</span></div>` : ''}
        </div>
        <div class="od-total"><b>${count} SẢN PHẨM</b><span>Tổng thanh toán <b>${vnd(m.total)}</b></span></div>
        <div class="co-sum muted"><span>${od.status === 'paid' ? `Đã thanh toán · ${od.payInfo || pm.label}` : `${pm.label}${od.status === 'cancelled' ? ' · chưa thanh toán' : ''}`}</span><span>${vnd(m.total)}</span></div>
        <div class="od-meta">
          <div><span>Thời gian đặt hàng</span><span>${fmtTime(od.createdAt)}</span></div>
          ${od.paidAt ? `<div><span>Thời gian thanh toán</span><span>${fmtTime(od.paidAt)}</span></div>` : ''}
          ${od.completedAt ? `<div><span>Thời gian hoàn tất</span><span>${fmtTime(od.completedAt)}</span></div>` : ''}
          <div><span>Số đơn hàng</span><span>${od.code}</span></div>
          ${od.txn ? `<div class="od-more ${more ? 'open' : ''}"><span>Mã giao dịch</span><span>${od.txn}</span></div>` : ''}
          <div class="od-more ${more ? 'open' : ''}"><span>Ghi chú đặt hàng</span><span>${od.note || '-'}</span></div>
        </div>
        <button class="od-toggle" data-act="more">${more ? 'Thu gọn' : 'Xem thêm chi tiết'} <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M${more ? '6 15l6-6 6 6' : '6 9l6 6 6-6'}"/></svg></button>
      </div>
      ${od.status === 'paid' ? `<button class="od-invoice" data-act="invoice">${App.icons.ic.ticket}Yêu cầu xuất hoá đơn VAT ${I.chevron}</button>` : ''}`;
  }

  // ---------- khối trạng thái ----------
  const STEPS = {
    pickup: ['Đã thanh toán', 'Đang pha chế', 'Sẵn sàng', 'Hoàn tất'],
    delivery: ['Đã thanh toán', 'Đang pha chế', 'Đang giao', 'Hoàn tất'],
  };
  function statusBlock(od, s, m) {
    if (od.status === 'pending') return `
      <div class="od-status pending">
        <h2>CHỜ THANH TOÁN</h2>
        <span class="od-hg">${hourglass}</span>
        <b class="od-left">${mmss(left())}</b>
        <p>Đơn được giữ trong ${P.HOLD_MIN} phút. Quá thời gian, đơn sẽ tự huỷ.</p>
        <button class="od-btn dark" data-act="pay">XỬ LÝ THANH TOÁN</button>
        <button class="od-btn line" data-act="cancel">HUỶ ĐƠN HÀNG</button>
      </div>`;
    if (od.status === 'cancelled') return `
      <div class="od-status cancelled">
        <h2>ĐƠN HÀNG BỊ HUỶ</h2>
        <p>${od.cancelReason === 'timeout' ? 'Đơn đã quá thời gian thanh toán.' : 'Giao dịch thanh toán không thành công.'}${m.voucher ? ' Voucher đã được hoàn về Kho quà.' : ''}</p>
        <button class="od-btn dark" data-act="reorder">${reorderIc} ĐẶT HÀNG LẠI</button>
      </div>
      <button class="od-promo" data-act="promo"><span><b>Trà Trái Cây</b><small>Sưu tập tem, mở giải thưởng</small></span><i>KHÁM PHÁ</i></button>`;
    // đã thanh toán
    const steps = STEPS[od.mode] || STEPS.pickup;
    const p = od.progress || 0;
    const done = p >= 3;
    const title = done ? 'ĐƠN HÀNG ĐÃ HOÀN TẤT' : ['ĐÃ THANH TOÁN', 'ĐANG PHA CHẾ', od.mode === 'pickup' ? 'MÓN ĐÃ SẴN SÀNG' : 'ĐANG GIAO HÀNG'][p];
    const sub = done
      ? `Hoàn tất lúc ${fmtTime(od.completedAt || Date.now()).slice(11, 16)} · Cảm ơn bạn đã chọn Mộc Trà!`
      : p === 2 && od.mode === 'pickup' ? `Mời bạn đến quầy ${s.name} nhận món`
      : od.mode === 'pickup' ? `Dự kiến sẵn sàng sau khoảng ${Math.max(1, s.wait - p * 4)} phút` : 'Dự kiến giao trong 25–35 phút';
    return `
      <div class="od-status paid ${done ? 'done' : ''}">
        <h2>${title}</h2>
        <p>${sub}</p>
        ${od.mode === 'pickup' && !done ? `<div class="od-code"><small>Mã nhận món</small><b>${od.pickupCode}</b></div>` : ''}
        <div class="od-steps">
          ${steps.map((t, i) => `<div class="${i < p ? 'ok' : i === p && !done ? 'cur' : i <= p ? 'ok' : ''}"><i>${i < p || done ? App.icons.check : ''}</i><span>${t}</span></div>`).join('')}
          <span class="od-bar"><b style="width:${(Math.min(p, 3) / 3) * 100}%"></b></span>
        </div>
        ${done ? `<div class="od-2btn"><button class="od-btn line" data-act="rate">ĐÁNH GIÁ</button><button class="od-btn dark" data-act="reorder">${reorderIc} ĐẶT HÀNG LẠI</button></div>`
          : `<button class="od-btn line" data-act="track">THEO DÕI ĐƠN HÀNG</button>`}
      </div>`;
  }

  // cập nhật khi tiến trình đơn đổi (mô phỏng chạy trong App.payment)
  let lastSig = '';
  const unsub = App.state.subscribe(() => {
    const od = o(); if (!od) return;
    const sig = od.status + (od.progress || 0);
    if (sig !== lastSig) { lastSig = sig; if (el.isConnected) render(); }
  });

  // đếm ngược; hết giờ → tự huỷ
  const timer = setInterval(() => {
    const od = o();
    if (!od || od.status !== 'pending') return;
    if (left() <= 0) return doCancel('timeout');
    const b = body.querySelector('.od-left');
    if (b) b.textContent = mmss(left());
  }, 500);

  const notify = (t, m) => P.notify(t, m, () => {}, { orderId });

  function doCancel(reason) {
    P.cancelOrder(orderId, reason);
    render();
    body.scrollTo({ top: 0, behavior: 'smooth' });
    setTimeout(() => notify('Cập nhật trạng thái đơn hàng',
      reason === 'timeout' ? 'Đơn hàng đã quá thời gian thanh toán và đã bị huỷ.' : 'Xin lỗi, giao dịch thanh toán không thành công. Đơn hàng của bạn đã bị huỷ.'), 350);
  }

  function cancelModal() {
    const m = App.ui.el(`
      <div class="od-cm">
        <div class="od-cm-card">
          <button class="od-cm-x" aria-label="Đóng">✕</button>
          <h3>Huỷ đơn hàng</h3>
          <p>Bạn có chắc chắn huỷ đơn đặt hàng này không?</p>
          <div class="od-cm-btns"><button class="od-cm-yes">HUỶ ĐƠN HÀNG</button><button class="od-cm-wait">ĐỢI</button></div>
        </div>
      </div>`);
    const close = () => { m.classList.add('closing'); setTimeout(() => m.remove(), 280); };
    m.addEventListener('click', (e) => {
      if (e.target === m || e.target.closest('.od-cm-x') || e.target.closest('.od-cm-wait')) return close();
      if (e.target.closest('.od-cm-yes')) { App.ui.haptic(15); close(); setTimeout(() => doCancel('user'), 300); }
    });
    document.getElementById('overlay').appendChild(m);
  }

  el.addEventListener('click', async (e) => {
    const act = e.target.closest('[data-act]')?.dataset.act;
    switch (act) {
      case 'close': return App.nav.popToRoot();
      case 'more': more = !more; return render();
      case 'cancel': return cancelModal();
      case 'reorder': return P.reorder(o());
      case 'pay': {
        const pick = await P.methodSheet(o());
        if (!pick) return;
        App.state.set({ payMethod: pick });
        P.updateOrder(orderId, { payMethod: pick });
        return P.start(o(), { from: 'detail' });
      }
      case 'call': {
        const s = App.data.stores.find((x) => x.id === o().storeId);
        return App.ui.iosAlert({ title: 'Gọi cho cửa hàng?', message: `${s.name}\n028 3636 9460`, buttons: [{ label: 'Huỷ', value: 0 }, { label: 'Gọi', value: 1, bold: true }] })
          .then((v) => v && App.ui.toast('Đang gọi 028 3636 9460 (mô phỏng)'));
      }
      case 'store': return App.ui.soon('C14', 'Chi tiết cửa hàng');
      case 'promo': return App.nav.push(App.screens.stamps({ onOrder: () => {} }));
      case 'rate': return App.ui.soon('C9', 'Đánh giá đơn hàng');
      case 'track': return App.nav.push(App.screens.tracking(orderId, { fromDetail: true }));
      case 'invoice': return App.ui.soon('C14', 'Xuất hoá đơn VAT');
    }
  });

  render();
  return { el, statusBar: 'dark', onLeave: () => { clearInterval(timer); unsub(); }, onResume: render };
};
