// C7 · Kết quả thanh toán
// Thành công: dấu ✓ + pháo giấy, mã nhận món, cửa hàng, thời gian dự kiến, tem → Xem chi tiết đơn / Tiếp tục đặt món
// Thất bại: dấu ✕, lý do, đơn còn giữ mm:ss → Thử lại / Đổi phương thức / Xem đơn hàng
App.screens.paymentResult = (orderId, { ok, reason, payInfo } = {}) => {
  const P = App.payment;
  const st = () => App.state.get();
  const vnd = App.fmt.vnd;
  const I = App.icons.ic;
  const o = () => P.getOrder(orderId);
  const od = o();
  const s = App.data.stores.find((x) => x.id === od.storeId);
  const a = od.addressId ? App.data.member.addresses.find((x) => x.id === od.addressId) : null;
  const pickup = od.mode === 'pickup';
  const mmss = (ms) => `${String(Math.floor(ms / 60000)).padStart(2, '0')}:${String(Math.floor(ms / 1000) % 60).padStart(2, '0')}`;
  const hhmm = (ms) => { const d = new Date(ms); return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`; };
  const F = P.FAIL[reason] || P.FAIL.declined;
  const closeIc = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>';

  const eta = pickup
    ? (od.pickupTime ? `Hẹn lấy lúc ${od.pickupTime}` : `Sẵn sàng khoảng ${hhmm((od.paidAt || Date.now()) + s.wait * 60000)}`)
    : `Giao dự kiến ${hhmm((od.paidAt || Date.now()) + 25 * 60000)} – ${hhmm((od.paidAt || Date.now()) + 35 * 60000)}`;
  const askNoti = ok && st().permissions.notifications !== 'granted';

  const el = App.ui.el(ok ? `
    <section class="rs ok">
      <div class="rs-confetti">${Array.from({ length: 26 }, (_, i) => `<i style="--x:${(i * 37) % 100}%;--d:${(i % 7) * 0.12}s;--r:${(i * 53) % 360}deg;--dx:${((i * 53) % 360 - 180) / 2}px;--c:${['#D9B77A', '#2E6B4C', '#B5462E', '#9DB8A8', '#F0C68A'][i % 5]}"></i>`).join('')}</div>
      <div class="rs-scroll">
        <div class="rs-hero">
          <svg class="rs-mark" viewBox="0 0 96 96"><circle class="c" cx="48" cy="48" r="44"/><path class="k" d="M28 49l13 13 27-28"/></svg>
          <h1>Thanh toán thành công</h1>
          <b class="rs-amt">${vnd(od.money.total)}</b>
          <p>${od.payInfo || ''}</p>
        </div>

        ${pickup ? `
        <div class="rs-code">
          <small>MÃ NHẬN MÓN</small><b>${od.pickupCode}</b>
          <span>Đưa mã này cho nhân viên khi đến quầy</span>
        </div>` : ''}

        <div class="rs-card">
          <div class="rs-row"><span class="rs-ic">${pickup ? I.store : I.scooter}</span>
            <div><b>${pickup ? s.name : `Giao đến ${a ? a.label : ''}`}</b><small>${pickup ? s.address : a ? `${a.line}, ${a.detail}` : ''}</small></div></div>
          <div class="rs-row"><span class="rs-ic">${I.cup}</span>
            <div><b>${eta}</b><small>${pickup ? 'Cửa hàng bắt đầu pha chế ngay khi nhận đơn' : `Từ ${s.name}`}</small></div></div>
          ${od.stamps ? `<div class="rs-row"><span class="rs-ic gold">${I.cupMini}</span>
            <div><b>+${od.stamps} tem · Sip, Collect, Unlock</b><small>Tem được cộng khi đơn hoàn tất</small></div></div>` : ''}
          <div class="rs-meta"><span>Số đơn hàng</span><span>${od.code}</span></div>
          <div class="rs-meta"><span>Mã giao dịch</span><span>${od.txn || '-'}</span></div>
        </div>

        ${askNoti ? `<button class="rs-noti" data-act="noti">${I.bell}<span><b>Bật thông báo</b><small>Để biết ngay khi món đã sẵn sàng</small></span>${I.chevron}</button>` : ''}
      </div>
      <div class="rs-foot">
        <button class="rs-btn dark" data-act="detail">XEM CHI TIẾT ĐƠN HÀNG</button>
        <button class="rs-btn line" data-act="more">TIẾP TỤC ĐẶT MÓN</button>
      </div>
    </section>` : `
    <section class="rs fail">
      <header class="rs-nav"><button class="rs-x" data-act="detail" aria-label="Đóng">${closeIc}</button></header>
      <div class="rs-scroll">
        <div class="rs-hero">
          <svg class="rs-mark" viewBox="0 0 96 96"><circle class="c" cx="48" cy="48" r="44"/><path class="k" d="M33 33l30 30"/><path class="k k2" d="M63 33L33 63"/></svg>
          <h1>Thanh toán không thành công</h1>
          <b class="rs-amt">${vnd(od.money.total)}</b>
          <p>${payInfo || ''}</p>
        </div>
        <div class="rs-reason"><b>${F.title}</b><p>${F.msg}</p></div>
        <div class="rs-hold">${I.store}<span>Đơn tại <b>${s.name}</b> vẫn được giữ trong <b class="rs-left">${mmss(od.expiresAt - Date.now())}</b></span></div>
        <ul class="rs-tips">
          <li>Kiểm tra thẻ đã bật thanh toán trực tuyến</li>
          <li>Thử phương thức khác như VietQR hoặc Ví MoMo</li>
          <li>Không bị trừ tiền khi giao dịch thất bại; nếu đã bị trừ, tiền sẽ hoàn trong 1–3 ngày làm việc</li>
        </ul>
      </div>
      <div class="rs-foot">
        <button class="rs-btn dark" data-act="retry">THỬ LẠI</button>
        <button class="rs-btn line" data-act="change">ĐỔI PHƯƠNG THỨC THANH TOÁN</button>
        <button class="rs-link" data-act="detail">Xem đơn hàng</button>
      </div>
    </section>`);

  // đếm ngược giữ đơn (thất bại)
  const timer = !ok && setInterval(() => {
    const cur = o();
    const left = cur.expiresAt - Date.now();
    const n = el.querySelector('.rs-left');
    if (left <= 0 && cur.status === 'pending') {
      P.cancelOrder(orderId, 'timeout');
      clearInterval(timer);
      App.nav.replaceAbove(App.screens.orderDetail(orderId));
      return;
    }
    if (n) n.textContent = mmss(left);
  }, 500);

  el.addEventListener('click', async (e) => {
    const act = e.target.closest('[data-act]')?.dataset.act;
    switch (act) {
      case 'detail': return App.nav.replaceAbove(App.screens.orderDetail(orderId));
      case 'more':
        await App.nav.popToRoot();
        return App.goTab && App.goTab('order');
      case 'noti': {
        const r = await App.ui.iosAlert({
          title: '“Mộc Trà” muốn gửi thông báo cho bạn',
          message: 'Thông báo có thể bao gồm cảnh báo, âm thanh và biểu tượng.',
          buttons: [{ label: 'Không cho phép', value: 'denied' }, { label: 'Cho phép', value: 'granted', bold: true }],
        });
        App.state.setPermission('notifications', r);
        e.target.closest('.rs-noti')?.remove();
        return r === 'granted' && App.ui.toast('Đã bật thông báo đơn hàng');
      }
      case 'retry': App.ui.haptic(8); return P.start(o(), { from: 'result' });
      case 'change': {
        const pick = await P.methodSheet(o());
        if (!pick) return;
        App.state.set({ payMethod: pick });
        P.updateOrder(orderId, { payMethod: pick });
        return P.start(o(), { from: 'result' });
      }
    }
  });

  return { el, statusBar: 'dark', onLeave: () => timer && clearInterval(timer) };
};
