// Luồng thanh toán (sau C6):
// THANH TOÁN → modal xác nhận cửa hàng → tạo đơn "Chờ thanh toán" (giữ 15 phút) → cổng thanh toán
//   Thẻ nội địa → Chọn ngân hàng → Nhập thông tin thẻ
//   Thẻ quốc tế → Nhập thông tin thẻ (có CVV)
//   VietQR → mã QR · MoMo → mở ví (mô phỏng)
// Thoát cổng thanh toán → Chi tiết đơn hàng (Chờ thanh toán: Xử lý thanh toán / Huỷ đơn)
App.payment = (() => {
  const st = () => App.state.get();
  const vnd = App.fmt.vnd;
  const HOLD_MIN = 15;
  const back = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M15 5l-7 7 7 7"/></svg>';
  const searchIc = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="6.5"/><path d="M16 16l4 4"/></svg>';

  const BANKS = [
    { id: 'vcb', short: 'VCB', name: 'Vietcombank', c: '#0B7A3E' },
    { id: 'vtb', short: 'VTB', name: 'VietinBank', c: '#0B4EA2' },
    { id: 'bidv', short: 'BIDV', name: 'BIDV', c: '#0E6A63' },
    { id: 'agr', short: 'AGR', name: 'Agribank', c: '#A4192E' },
    { id: 'tcb', short: 'TCB', name: 'Techcombank', c: '#E2231A' },
    { id: 'mb', short: 'MB', name: 'MB Bank', c: '#1A3F95' },
    { id: 'acb', short: 'ACB', name: 'ACB', c: '#1E4FA0' },
    { id: 'vpb', short: 'VPB', name: 'VPBank', c: '#00894F' },
    { id: 'tpb', short: 'TPB', name: 'TPBank', c: '#5C2D91' },
    { id: 'stb', short: 'STB', name: 'Sacombank', c: '#1B5DAB' },
    { id: 'hdb', short: 'HDB', name: 'HDBank', c: '#E3261B' },
    { id: 'vib', short: 'VIB', name: 'VIB', c: '#0067B1' },
    { id: 'shb', short: 'SHB', name: 'SHB', c: '#F37021' },
    { id: 'ocb', short: 'OCB', name: 'OCB', c: '#00954C' },
    { id: 'msb', short: 'MSB', name: 'MSB', c: '#E4002B' },
    { id: 'eib', short: 'EIB', name: 'Eximbank', c: '#0055A5' },
    { id: 'seab', short: 'SEA', name: 'SeABank', c: '#D71920' },
    { id: 'nab', short: 'NAB', name: 'Nam A Bank', c: '#00539B' },
    { id: 'lpb', short: 'LPB', name: 'LPBank', c: '#F28C00' },
    { id: 'abb', short: 'ABB', name: 'ABBANK', c: '#00843D' },
    { id: 'bvb', short: 'BVB', name: 'BaoViet Bank', c: '#0067AC' },
  ];
  // thẻ quốc tế: chọn loại trước khi nhập
  const CARD_BRANDS = [
    { id: 'visa', name: 'Visa', sub: 'Thẻ Visa ghi nợ / tín dụng', len: 16, cvv: 3, re: /^4/, prefix: 'bắt đầu bằng 4' },
    { id: 'mc', name: 'Mastercard', sub: 'Thẻ Mastercard ghi nợ / tín dụng', len: 16, cvv: 3, re: /^(5[1-5]|2[2-7])/, prefix: 'bắt đầu bằng 51–55 hoặc 22–27' },
    { id: 'jcb', name: 'JCB', sub: 'Thẻ JCB ghi nợ / tín dụng', len: 16, cvv: 3, re: /^35/, prefix: 'bắt đầu bằng 35' },
    { id: 'amex', name: 'American Express', sub: 'Thẻ tín dụng American Express', len: 15, cvv: 4, re: /^3[47]/, prefix: 'bắt đầu bằng 34 hoặc 37' },
  ];
  const brandLogo = (id, big) => ({
    visa: `<span class="cl cl-visa ${big ? 'big' : ''}">VISA</span>`,
    mc: `<span class="cl cl-mc ${big ? 'big' : ''}"><i></i><i></i></span>`,
    jcb: `<span class="cl cl-jcb ${big ? 'big' : ''}"><b>J</b><b>C</b><b>B</b></span>`,
    amex: `<span class="cl cl-amex ${big ? 'big' : ''}">AMEX</span>`,
  })[id];
  const fmtNum = (d, brand) => brand && brand.id === 'amex'
    ? d.replace(/^(\d{0,4})(\d{0,6})(\d{0,5}).*/, (_, a, b, c) => [a, b, c].filter(Boolean).join(' '))
    : d.replace(/(\d{4})(?=\d)/g, '$1 ');

  // thẻ thử cho POC (đuôi 0002 → bị từ chối, 0051 → không đủ số dư — xem decide())
  const TEST_CARDS = {
    visa: { ok: '4111111111111111', declined: '4000000000000002', insufficient: '4000000000000051' },
    mc: { ok: '5555555555554444', declined: '5105105105100002', insufficient: '5200828282820051' },
    jcb: { ok: '3530111333300000', declined: '3566002020360002', insufficient: '3566111111110051' },
    amex: { ok: '378282246310005', declined: '371449635390002', insufficient: '378734493670051' },
    atm: { ok: '9704000000000018', declined: '9704000000000002', insufficient: '9704000000000051' },
  };
  // thẻ đã lưu: chỉ giữ 4 số cuối + tên + hạn (không lưu số thẻ đầy đủ)
  const savedFor = (bank, brand) => (st().savedCards || []).filter((c) => (bank ? c.type === 'atm' && c.bankId === bank.id : c.type === 'intl' && c.brandId === brand.id));
  const allSaved = (type) => (st().savedCards || []).filter((c) => c.type === type);
  function saveCard(card) {
    const list = (st().savedCards || []).filter((c) => !(c.type === card.type && c.last4 === card.last4 && (c.bankId || c.brandId) === (card.bankId || card.brandId)));
    App.state.set({ savedCards: [{ id: 'c' + Date.now(), ...card }, ...list] });
  }
  function removeCard(id) { App.state.set({ savedCards: (st().savedCards || []).filter((c) => c.id !== id) }); }
  const savedRow = (c) => {
    const b = c.type === 'atm' ? BANKS.find((x) => x.id === c.bankId) : null;
    return `<button class="sc-row" data-saved="${c.id}">
      <span class="sc-logo">${b ? bankLogo(b, true) : brandLogo(c.brandId, true)}</span>
      <span class="sc-t"><b>${b ? b.name : CARD_BRANDS.find((x) => x.id === c.brandId).name} •••• ${c.last4}</b><small>${c.name} · ${c.type === 'atm' ? 'Phát hành' : 'Hết hạn'} ${c.exp}</small></span>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 5l7 7-7 7"/></svg>
    </button>`;
  };

  const fold = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/gi, 'd').toLowerCase();
  const bankLogo = (b, big) => `<span class="bk-logo ${big ? 'big' : ''}" style="--c:${b.c}">${b.short}</span>`;

  // ---------- đơn hàng ----------
  function createOrder(data) {
    const now = Date.now();
    const d = new Date(now);
    const p = (n, l = 2) => String(n).padStart(l, '0');
    const code = `${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}${p(d.getHours())}${p(d.getMinutes())}${p(Math.floor(Math.random() * 1e6), 6)}`;
    const order = { id: 'o' + now, code, createdAt: now, expiresAt: now + HOLD_MIN * 60000, status: 'pending', ...data };
    // giữ voucher cho đơn này; giỏ hàng làm trống
    const rewards = (st().rewards || []).map((r) => (r.id === data.money.voucherId ? { ...r, used: true, usedAt: Date.now(), usedOn: `Đơn #${code.slice(-6)}` } : r));
    App.state.set({ orders: [order, ...(st().orders || [])], cart: [], appliedReward: null, pickupTime: null, orderNote: '', rewards });
    return order;
  }
  const getOrder = (id) => (st().orders || []).find((o) => o.id === id);
  function updateOrder(id, patch) {
    App.state.set({ orders: (st().orders || []).map((o) => (o.id === id ? { ...o, ...patch } : o)) });
    return getOrder(id);
  }
  function cancelOrder(id, reason) {
    const o = getOrder(id);
    if (!o || o.status !== 'pending') return o;
    // trả voucher về Kho quà
    const rewards = (st().rewards || []).map((r) => (r.id === o.money.voucherId ? { ...r, used: false, usedAt: null, usedOn: null } : r));
    App.state.set({ rewards });
    return updateOrder(id, { status: 'cancelled', cancelReason: reason, cancelledAt: Date.now() });
  }

  // đặt lại: gộp món của đơn vào giỏ, khôi phục cửa hàng / hình thức → màn thanh toán
  async function reorder(o) {
    const merged = (st().cart || []).map((l) => ({ ...l }));
    o.lines.forEach((l) => {
      const same = merged.find((x) => (x.key || x.id) === (l.key || l.id));
      if (same) same.qty += l.qty; else merged.push({ ...l });
    });
    App.state.set({ cart: merged, storeId: o.storeId, orderMode: o.mode, ...(o.addressId ? { addressId: o.addressId } : {}) });
    App.ui.haptic(10);
    await App.nav.replaceAbove(App.screens.checkout());
    App.ui.toast('Đã thêm lại các món vào giỏ hàng');
  }
  // ---------- kết quả giao dịch (C7) ----------
  const FAIL = {
    declined: { title: 'Giao dịch bị từ chối', msg: 'Ngân hàng phát hành đã từ chối giao dịch. Vui lòng liên hệ ngân hàng hoặc dùng thẻ khác.' },
    insufficient: { title: 'Số dư không đủ', msg: 'Tài khoản/thẻ không đủ số dư để thanh toán đơn hàng này.' },
    timeout: { title: 'Hết thời gian xác thực', msg: 'Bạn chưa hoàn tất xác thực (OTP/3-D Secure) trong thời gian cho phép.' },
    cancelled: { title: 'Bạn đã huỷ giao dịch', msg: 'Giao dịch đã bị huỷ trong ứng dụng thanh toán. Bạn có thể thử lại.' },
  };
  // kết quả mô phỏng: thẻ thử đuôi 0002 → từ chối, 0051 → không đủ số dư; còn lại theo bảng POC
  function decide(cardDigits) {
    if (cardDigits && cardDigits.endsWith('0002')) return 'declined';
    if (cardDigits && cardDigits.endsWith('0051')) return 'insufficient';
    return st().simPayResult || 'success';
  }
  async function finish(o, result, payInfo) {
    if (result === 'success') return success(o, payInfo);
    const cur = getOrder(o.id);
    updateOrder(o.id, { attempts: [...(cur.attempts || []), { at: Date.now(), result, payInfo }] });
    App.ui.haptic([30, 60, 30]);
    return App.nav.replaceAbove(App.screens.paymentResult(o.id, { ok: false, reason: result, payInfo }));
  }
  async function success(o, payInfo) {
    const now = Date.now();
    updateOrder(o.id, {
      status: 'paid', paidAt: now, progress: 0, stepAt: [now], payInfo,
      txn: 'MT' + String(now).slice(-10),
      pickupCode: String(100 + Math.floor(Math.random() * 900)),
    });
    App.ui.haptic([10, 40, 10]);
    return App.nav.replaceAbove(App.screens.paymentResult(o.id, { ok: true }));
  }

  // ---------- thông báo đẩy kiểu iOS ----------
  function notify(title, text, onTap, { log = !/^Tin nhắn/.test(title), orderId } = {}) {
    // lưu vào hộp thư Thông báo (C12) — SMS OTP thì không
    if (log) App.state.set({ inbox: [{ id: 'n' + Date.now(), type: orderId ? 'order' : 'promo', title, text, at: Date.now(), read: false, orderId }, ...(st().inbox || [])].slice(0, 50) });
    document.querySelectorAll('.push-note').forEach((x) => x.remove());
    const n = App.ui.el(`
      <div class="push-note">
        <span class="pn-ic">${App.icons.logoMark('#F4EEE2', '#F4EEE2')}</span>
        <div><div class="pn-h"><b>${title}</b><small>bây giờ</small></div><p>${text}</p></div>
      </div>`);
    document.getElementById('overlay').appendChild(n);
    App.ui.haptic([10, 40, 10]);
    n.addEventListener('click', () => { n.classList.add('out'); onTap && onTap(); });
    setTimeout(() => n.classList.add('out'), 4200);
    setTimeout(() => n.remove(), 4700);
  }

  // ---------- mô phỏng tiến trình đơn đã thanh toán (POC) ----------
  // mỗi bước ~12 giây: 0 Đã thanh toán → 1 Đang pha chế → 2 Sẵn sàng / Đang giao → 3 Hoàn tất
  const STEP_MS = 12000;
  const stepNote = (o, p) => {
    const s = App.data.stores.find((x) => x.id === o.storeId);
    const code = `#${o.code.slice(-6)}`;
    return [null,
      ['Cửa hàng đang pha chế', `${s.name} đã nhận đơn ${code} và bắt đầu pha chế.`],
      o.mode === 'pickup' ? ['Món của bạn đã sẵn sàng!', `Mời bạn đến quầy ${s.name}, mã nhận món ${o.pickupCode}.`] : ['Tài xế đang giao hàng', `Đơn ${code} đang trên đường đến bạn.`],
      ['Đơn hàng đã hoàn tất', `Cảm ơn bạn đã chọn Mộc Trà! Đánh giá đơn ${code} để nhận ưu đãi.`]][p];
  };
  setInterval(() => {
    (st().orders || []).forEach((o) => {
      if (o.status !== 'paid' || (o.progress || 0) >= 3 || String(o.id).startsWith('seed') || !o.paidAt) return;
      const target = Math.min(3, Math.floor((Date.now() - o.paidAt) / STEP_MS));
      if (target <= (o.progress || 0)) return;
      const stepAt = [...(o.stepAt || [o.paidAt])];
      for (let i = (o.progress || 0) + 1; i <= target; i++) stepAt[i] = o.paidAt + i * STEP_MS;
      updateOrder(o.id, { progress: target, stepAt, ...(target >= 3 ? { completedAt: stepAt[3] } : {}) });
      const [t, m] = stepNote(o, target);
      notify(t, m, () => { if (!document.querySelector('.trk')) App.nav.push(App.screens.tracking(o.id)); }, { orderId: o.id });
    });
  }, 1000);
  // đơn đang chạy gần nhất (cho Trang chủ)
  const activeOrder = () => (st().orders || []).find((o) => o.status === 'paid' && (o.progress || 0) < 3);

  // dữ liệu mẫu cho lịch sử (bảng POC)
  function seedHistory() {
    const day = 86400000, now = Date.now();
    const L = (id, qty, unit, opts) => ({ key: id, id, qty, unit, opts });
    const base = (i, t, extra) => ({
      id: 'seed' + i + t, code: '2026' + String(t).slice(-12), createdAt: t, expiresAt: t + HOLD_MIN * 60000,
      note: '', pickupTime: null, stamps: 0, ...extra,
    });
    const t1 = now - day - 3 * 3600000, t2 = now - 2 * day - 5 * 3600000, t3 = now - 6 * day;
    const seeded = [
      base(1, t1, {
        status: 'paid', progress: 3, paidAt: t1 + 60000, completedAt: t1 + 14 * 60000, storeId: 's1', mode: 'pickup', addressId: null,
        payMethod: 'intl', payInfo: 'Visa •••• 4242', txn: 'MT' + String(t1).slice(-10), pickupCode: '128', stamps: 2,
        lines: [L('m-m2', 1, 72000, 'Lớn, Ít đá, Ít ngọt (70%) · Trân châu lá trà'), L('m-f1', 1, 69000, 'Vừa, Đá bình thường, Ngọt nguyên bản')],
        money: { sub: 141000, pack: 1000, ship: 0, discount: 34500, vat: 7896, total: 107500, voucher: 'Giảm 50%', voucherId: null },
      }),
      base(2, t2, {
        status: 'cancelled', cancelReason: 'user', cancelledAt: t2 + 4 * 60000, storeId: 's4', mode: 'delivery', addressId: 'a2', payMethod: 'atm',
        lines: [L('m-k1', 2, 59000, 'Vừa, Đá bình thường, Ngọt nguyên bản'), L('m-b2', 1, 569000, '')],
        money: { sub: 687000, pack: 0, ship: 0, discount: 0, vat: 50889, total: 687000, voucher: null, voucherId: null },
      }),
      base(3, t3, {
        status: 'paid', progress: 3, paidAt: t3 + 90000, completedAt: t3 + 32 * 60000, storeId: 's4', mode: 'delivery', addressId: 'a2',
        payMethod: 'vietqr', payInfo: 'VietQR · MB Bank', txn: 'MT' + String(t3).slice(-10), stamps: 1,
        lines: [L('m-l2', 1, 69000, 'Vừa, Ít đá, Ngọt nguyên bản')],
        money: { sub: 69000, pack: 0, ship: 15000, discount: 0, vat: 6222, total: 84000, voucher: null, voucherId: null },
      }),
    ];
    const keep = (st().orders || []).filter((o) => !String(o.id).startsWith('seed'));
    App.state.set({ orders: [...keep, ...seeded].sort((a, b) => b.createdAt - a.createdAt) });
  }

  // hết hạn giữ đơn → tự huỷ (gọi khi hiển thị danh sách)
  function sweepExpired() {
    (st().orders || []).forEach((o) => { if (o.status === 'pending' && Date.now() >= o.expiresAt) cancelOrder(o.id, 'timeout'); });
  }

  // ---------- modal xác nhận cửa hàng ----------
  function confirmStore({ store, pickup, address, pickupTime, total }) {
    return new Promise((resolve) => {
      const far = pickup && store.distance > 3;
      const m = App.ui.el(`
        <div class="pay-modal">
          <div class="pm-card">
            <div class="pm-h"><h3>Xác nhận địa chỉ cửa hàng</h3><button class="pm-x" aria-label="Đóng">✕</button></div>
            <div class="pm-store">
              <div class="pm-s-info">
                <span class="pm-mode">${pickup ? 'TỰ ĐẾN LẤY' : 'GIAO HÀNG'}</span>
                <b>${store.name.toUpperCase()}</b>
                <small>${store.address}</small>
                <em>${App.icons.ic.pin}${App.fmt.km(pickup ? store.distance : address.km)}</em>
              </div>
              <svg class="pm-map" viewBox="0 0 90 90">
                <rect width="90" height="90" rx="8" fill="#F1EEE6"/>
                <g stroke="#fff" stroke-width="5" stroke-linecap="round"><path d="M-5 30 L95 52"/><path d="M34 -5 L52 95"/><path d="M-5 72 L95 64"/></g>
                <path d="M62 -5 C 70 30, 60 50, 95 70" stroke="#D7E5E8" stroke-width="7" fill="none"/>
                <ellipse cx="18" cy="56" rx="10" ry="6" fill="#DCE7D2"/>
                <g transform="translate(46 44)"><ellipse cy="12" rx="7" ry="2.5" fill="#000" opacity=".15"/><path d="M0 11 C-9 0 -9 -11 0 -11 C9 -11 9 0 0 11Z" fill="#B5462E"/><circle cy="-3" r="3.4" fill="#fff"/></g>
              </svg>
            </div>
            <div class="pm-meta">
              ${pickup
                ? `<span>${pickupTime ? `Hẹn lấy lúc <b>${pickupTime}</b>` : `Nhận sau khoảng <b>${store.wait} phút</b>`}</span>`
                : `<span>Giao đến: <b>${address.label} · ${address.line}</b></span><span>Dự kiến giao trong <b>25–35 phút</b></span>`}
              <span>Tổng thanh toán <b>${vnd(total)}</b></span>
            </div>
            ${far ? `<p class="pm-warn">Cửa hàng cách bạn ${App.fmt.km(store.distance)}. Hãy chắc chắn bạn có thể đến lấy món.</p>` : ''}
            <div class="pm-btns"><button class="pm-change">THAY ĐỔI</button><button class="pm-ok">Xác nhận</button></div>
          </div>
        </div>`);
      const done = (v) => { m.classList.add('closing'); card.style.transform = ''; setTimeout(() => { m.remove(); resolve(v); }, 300); };
      // kéo xuống để đóng
      const card = m.querySelector('.pm-card');
      let y0 = null, dy = 0;
      card.addEventListener('pointerdown', (e) => { if (e.target.closest('button')) return; y0 = e.clientY; dy = 0; card.style.transition = 'none'; });
      card.addEventListener('pointermove', (e) => {
        if (y0 === null) return;
        const sc = card.getBoundingClientRect().width / card.offsetWidth || 1;
        dy = Math.max(0, (e.clientY - y0) / sc); card.style.transform = `translateY(${dy}px)`;
      });
      const up = () => { if (y0 === null) return; y0 = null; card.style.transition = 'transform .3s var(--ease-ios)'; if (dy > 110) done(false); else card.style.transform = ''; };
      card.addEventListener('pointerup', up); card.addEventListener('pointercancel', up);
      m.addEventListener('click', (e) => {
        if (e.target === m || e.target.closest('.pm-x')) return done(false);
        if (e.target.closest('.pm-change')) return done('change');
        if (e.target.closest('.pm-ok')) { App.ui.haptic(10); return done(true); }
      });
      document.getElementById('overlay').appendChild(m);
    });
  }

  // ---------- mở cổng theo phương thức ----------
  function start(order, { from = 'checkout' } = {}) {
    const o = getOrder(order.id) || order;
    switch (o.payMethod) {
      case 'atm': return App.nav.push(bankList(o));
      case 'intl': return App.nav.push(cardBrands(o));
      case 'vietqr': return App.nav.push(vietQR(o));
      default: return momo(o, from);
    }
  }
  // rời cổng thanh toán → chi tiết đơn (chờ thanh toán)
  function leave(order) {
    return App.nav.replaceAbove(App.screens.orderDetail(order.id));
  }
  async function processing(host, text) {
    const ov = App.ui.el(`<div class="co-proc"><div><span class="spin"></span><b>${text}</b><small>Vui lòng không tắt ứng dụng</small></div></div>`);
    host.appendChild(ov);
    await App.ui.wait(1600);
    ov.remove();
  }
  const gwHeader = (title) => `<header class="gw-head"><button class="gw-back" data-act="back" aria-label="Quay lại">${back}</button><h1>${title}</h1><span></span></header>`;
  const gwFoot = (o, btn) => `<div class="gw-foot"><div><small>TẠM TÍNH</small><b>${vnd(o.money.total)}</b></div><button class="gw-go" ${btn.disabled ? 'disabled' : ''}>${btn.label}</button></div>`;

  // ---------- Thẻ nội địa: chọn ngân hàng ----------
  function bankList(o) {
    const el = App.ui.el(`
      <section class="gw">
        ${gwHeader('Chọn ngân hàng')}
        <div class="gw-body">
          <div class="gw-order"><span>Đơn hàng <b>#${o.code.slice(-6)}</b></span><b>${vnd(o.money.total)}</b></div>
          <div class="gw-search">${searchIc}<input type="search" placeholder="Tìm ngân hàng" /></div>
          ${allSaved('atm').length ? `<p class="gw-cap">Thẻ đã lưu</p><div class="sc-list">${allSaved('atm').map(savedRow).join('')}</div>` : ''}
          <p class="gw-cap">Thẻ ATM nội địa / Internet Banking</p>
          <div class="bk-grid"></div>
        </div>
      </section>`);
    const grid = el.querySelector('.bk-grid');
    const render = (q = '') => {
      const list = BANKS.filter((b) => !q || fold(b.name + ' ' + b.short).includes(fold(q)));
      grid.innerHTML = list.length
        ? list.map((b, i) => `<button class="bk" data-bank="${b.id}" style="--i:${i}">${bankLogo(b)}<span>${b.name}</span></button>`).join('')
        : '<p class="gw-empty">Không tìm thấy ngân hàng</p>';
    };
    render();
    el.querySelector('input').addEventListener('input', (e) => render(e.target.value.trim()));
    el.addEventListener('click', (e) => {
      if (e.target.closest('[data-act="back"]')) return leave(o);
      const sv = e.target.closest('[data-saved]');
      if (sv) { const c = (st().savedCards || []).find((x) => x.id === sv.dataset.saved); App.ui.haptic(5); return App.nav.push(cardForm(o, BANKS.find((x) => x.id === c.bankId), null, c)); }
      const b = e.target.closest('[data-bank]');
      if (b) { App.ui.haptic(5); App.nav.push(cardForm(o, BANKS.find((x) => x.id === b.dataset.bank))); }
    });
    return { el, statusBar: 'dark' };
  }

  // ---------- Thẻ quốc tế: chọn loại thẻ ----------
  function cardBrands(o) {
    const el = App.ui.el(`
      <section class="gw">
        ${gwHeader('Chọn loại thẻ')}
        <div class="gw-body">
          <div class="gw-order"><span>Đơn hàng <b>#${o.code.slice(-6)}</b></span><b>${vnd(o.money.total)}</b></div>
          ${allSaved('intl').length ? `<p class="gw-cap">Thẻ đã lưu</p><div class="sc-list">${allSaved('intl').map(savedRow).join('')}</div>` : ''}
          <p class="gw-cap">Thẻ quốc tế ghi nợ / tín dụng</p>
          <div class="cb-list">
            ${CARD_BRANDS.map((b, i) => `
              <button class="cb-item" data-brand="${b.id}" style="--i:${i}">
                <span class="cb-logo">${brandLogo(b.id, true)}</span>
                <span class="cb-t"><b>${b.name}</b><small>${b.sub} · ${b.len} số</small></span>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 5l7 7-7 7"/></svg>
              </button>`).join('')}
          </div>
          <p class="cf-secure">🔒 Giao dịch được xác thực 3-D Secure bởi ngân hàng phát hành thẻ.</p>
        </div>
      </section>`);
    el.addEventListener('click', (e) => {
      if (e.target.closest('[data-act="back"]')) return leave(o);
      const sv = e.target.closest('[data-saved]');
      if (sv) { const c = (st().savedCards || []).find((x) => x.id === sv.dataset.saved); App.ui.haptic(5); return App.nav.push(cardForm(o, null, CARD_BRANDS.find((x) => x.id === c.brandId), c)); }
      const b = e.target.closest('[data-brand]');
      if (b) { App.ui.haptic(5); App.nav.push(cardForm(o, null, CARD_BRANDS.find((x) => x.id === b.dataset.brand))); }
    });
    return { el, statusBar: 'dark' };
  }

  // ---------- Nhập thông tin thẻ ----------
  function cardForm(o, bank, brand, preset) {
    const intl = !bank;
    const kindKey = intl ? brand.id : 'atm';
    const el = App.ui.el(`
      <section class="gw">
        ${gwHeader('Nhập Thông Tin Thẻ')}
        <div class="gw-body form">
          <div class="cf-tip">
            <svg viewBox="0 0 48 40" fill="none" stroke-width="1.6"><rect x="4" y="6" width="28" height="20" rx="2" stroke="#4A90D9"/><path d="M2 30h34" stroke="#4A90D9" stroke-linecap="round"/><text x="12" y="21" font-size="12" fill="#E0A23B" font-family="sans-serif">$</text><circle cx="36" cy="28" r="9" fill="#FFF7E3" stroke="#D9B05B"/><path d="M31 31h10M32 26h8M33 26v5M36 26v5M39 26v5M31 25l5-3 5 3" stroke="#D9B05B" stroke-linecap="round"/></svg>
            <p>${intl ? `Thẻ ${brand.name} của Quý khách cần được bật chức năng thanh toán trực tuyến (3-D Secure).` : 'Thẻ của Quý khách cần được kích hoạt chức năng thanh toán trực tuyến hoặc dịch vụ Internet Banking trước khi thực hiện giao dịch.'}</p>
          </div>
          <div class="cf-quick">
            ${savedFor(bank, brand).length ? `<div class="cf-saved">${savedFor(bank, brand).map((c) => `<button class="cf-chip" data-use="${c.id}">${App.icons.check}•••• ${c.last4}<i data-del="${c.id}" aria-label="Xoá thẻ">✕</i></button>`).join('')}</div>` : '<span></span>'}
            <button class="cf-auto" data-act="autofill"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M13 2L4 14h6l-1 8 9-12h-6z"/></svg>Điền thẻ thử</button>
          </div>
          <label class="cf-l">Số Thẻ <button class="cf-other" data-act="other">Nhập thẻ khác</button></label>
          <div class="cf-in"><input data-f="num" inputmode="numeric" placeholder="${intl ? `${brand.len} số` : '16,19 số'}" autocomplete="off"/><span class="cf-brand">${bank ? bankLogo(bank, true) : brandLogo(brand.id, true)}</span></div>
          <p class="cf-err" data-e="num"></p>
          <label class="cf-l">Tên In Trên Thẻ</label>
          <div class="cf-in"><input data-f="name" placeholder="Nhập ít nhất 1 khoảng trắng ở giữa" autocomplete="off" autocapitalize="characters"/></div>
          <p class="cf-err" data-e="name"></p>
          <div class="cf-row">
            <div><label class="cf-l">${intl ? 'Ngày Hết Hạn' : 'Ngày Phát Hành'}</label>
              <div class="cf-in"><input data-f="date" inputmode="numeric" placeholder="MM/YY" maxlength="5" autocomplete="off"/></div>
              <p class="cf-err" data-e="date"></p></div>
            ${intl ? `<div><label class="cf-l">${brand.id === 'amex' ? 'CID' : 'CVV/CVC'}</label>
              <div class="cf-in"><input data-f="cvv" inputmode="numeric" type="password" placeholder="${brand.cvv} số ${brand.id === 'amex' ? 'mặt trước' : 'mặt sau'}" maxlength="${brand.cvv}" autocomplete="off"/></div>
              <p class="cf-err" data-e="cvv"></p></div>` : ''}
          </div>
          <div class="cf-save">
            <div class="cf-save-row"><span>Lưu thông tin thẻ để sử dụng cho những lần thanh toán sau.</span><button class="sw on" data-act="save" aria-label="Lưu thẻ"><i></i></button></div>
            <label class="cf-agree"><span>Tôi đã đọc và đồng ý với <u>Thoả thuận Người Sử Dụng</u> và <u>Chính sách Bảo Mật Thông Tin</u>.</span><button class="cbx2" data-act="agree" aria-label="Đồng ý"></button></label>
          </div>
          <p class="cf-secure">🔒 Thông tin thẻ được mã hoá và xử lý bởi ngân hàng; Mộc Trà không lưu số thẻ đầy đủ.</p>
        </div>
        ${gwFoot(o, { label: 'TIẾP TỤC', disabled: true })}
      </section>`);

    const $ = (s) => el.querySelector(s);
    const f = (k) => el.querySelector(`[data-f="${k}"]`);
    let save = true, agree = false;
    let saved = null; // thẻ đã lưu đang dùng
    const touched = {};

    function useSaved(c) {
      saved = c;
      el.classList.toggle('saved-mode', !!c);
      ['num', 'name', 'date'].forEach((k) => (f(k).readOnly = !!c));
      if (c) {
        f('num').value = (intl && brand.id === 'amex' ? '•••• •••••• •' : '•••• •••• •••• ') + c.last4;
        f('name').value = c.name; f('date').value = c.exp;
        $('.cf-save').classList.add('hide');
        el.querySelectorAll('.cf-chip').forEach((b) => b.classList.toggle('on', b.dataset.use === c.id));
        if (intl) setTimeout(() => f('cvv').focus(), 50);
      } else {
        ['num', 'name', 'date'].forEach((k) => (f(k).value = ''));
        $('.cf-save').classList.remove('hide');
        el.querySelectorAll('.cf-chip').forEach((b) => b.classList.remove('on'));
      }
      Object.keys(touched).forEach((k) => delete touched[k]);
      check();
    }

    // POC: điền thẻ thử (gõ nhanh từng ký tự cho tự nhiên)
    async function typeInto(k, v) {
      const i = f(k); i.value = ''; i.focus();
      for (const ch of v) { i.value += ch; i.dispatchEvent(new Event('input')); await App.ui.wait(14); }
      touched[k] = true;
    }
    async function autofill(kind) {
      if (saved) useSaved(null);
      const num = TEST_CARDS[kindKey][kind];
      await typeInto('num', num);
      await typeInto('name', 'NGUYEN VAN A');
      await typeInto('date', intl ? '1229' : '0124');
      if (intl) await typeInto('cvv', brand.cvv === 4 ? '1234' : '123');
      f(intl ? 'cvv' : 'date').blur();
      if (save && !agree) { agree = true; $('.cbx2').classList.add('on'); }
      check();
      App.ui.toast('Đã điền thẻ thử');
    }
    function autofillSheet() {
      const T = TEST_CARDS[kindKey];
      const sh = App.ui.sheet(`
        <div class="af">
          <h3>Điền thẻ thử</h3>
          <p>Chỉ dùng cho bản POC · số thẻ thử theo chuẩn sandbox, không phải thẻ thật.</p>
          ${[['ok', 'Thanh toán thành công', 'ok'], ['declined', 'Thẻ bị từ chối', 'bad'], ['insufficient', 'Không đủ số dư', 'bad']].map(([k, t, c]) => `
            <button class="af-row" data-k="${k}">
              <span class="af-dot ${c}"></span>
              <span class="af-t"><b>${t}</b><small>${fmtNum(T[k], brand)}</small></span>
              <svg viewBox="0 0 24 24" fill="currentColor"><path d="M13 2L4 14h6l-1 8 9-12h-6z"/></svg>
            </button>`).join('')}
        </div>`);
      sh.el.querySelectorAll('[data-k]').forEach((b) => (b.onclick = () => { sh.close(); setTimeout(() => autofill(b.dataset.k), 300); }));
    }

    function check() {
      const num = f('num').value.replace(/\D/g, '');
      const name = f('name').value.trim();
      const date = f('date').value;
      const err = {};
      if (saved) { /* thẻ đã lưu: chỉ cần CVV (thẻ quốc tế) */ }
      else if (intl) {
        if (num && !brand.re.test(num)) err.num = `Không phải thẻ ${brand.name} (số thẻ ${brand.prefix})`;
        else if (num.length !== brand.len) err.num = `Số thẻ ${brand.name} gồm ${brand.len} chữ số`;
      } else if (![16, 19].includes(num.length)) err.num = 'Số thẻ gồm 16 hoặc 19 chữ số';
      if (!saved && !/^[A-Z]+( [A-Z]+)+$/.test(name)) err.name = 'Nhập đúng tên in trên thẻ, không dấu, có khoảng trắng';
      const m = date.match(/^(\d{2})\/(\d{2})$/);
      if (saved) { /* bỏ qua */ }
      else if (!m || +m[1] < 1 || +m[1] > 12) err.date = 'Định dạng MM/YY';
      else {
        const now = new Date(); const yy = now.getFullYear() % 100; const mm = now.getMonth() + 1;
        const v = +m[2] * 100 + +m[1], cur = yy * 100 + mm;
        if (intl && v < cur) err.date = 'Thẻ đã hết hạn';
        if (!intl && v > cur) err.date = 'Ngày phát hành không hợp lệ';
      }
      if (intl && !new RegExp(`^\\d{${brand.cvv}}$`).test(f('cvv').value)) err.cvv = `${brand.id === 'amex' ? 'CID' : 'CVV'} gồm ${brand.cvv} chữ số`;
      el.querySelectorAll('[data-e]').forEach((p) => {
        const k = p.dataset.e;
        p.textContent = touched[k] && err[k] ? err[k] : '';
        f(k).closest('.cf-in').classList.toggle('bad', !!(touched[k] && err[k]));
        f(k).closest('.cf-in').classList.toggle('good', !err[k]);
      });
      const ok = !Object.keys(err).length && (saved || !save || agree);
      $('.gw-go').disabled = !ok;
      $('.cf-agree').classList.toggle('need', save && !agree);
      return ok;
    }

    f('num').addEventListener('input', (e) => {
      const d = e.target.value.replace(/\D/g, '').slice(0, intl ? brand.len : 19);
      e.target.value = fmtNum(d, brand);
      // nhập sai đầu số → làm mờ logo để báo
      if (intl) $('.cf-brand').classList.toggle('mismatch', !!d && !brand.re.test(d));
      check();
    });
    f('name').addEventListener('input', (e) => {
      const v = fold(e.target.value).toUpperCase().replace(/[^A-Z ]/g, '').replace(/\s{2,}/g, ' ');
      e.target.value = v.replace(/^ /, '');
      check();
    });
    f('date').addEventListener('input', (e) => {
      let d = e.target.value.replace(/\D/g, '').slice(0, 4);
      if (d.length >= 3) d = d.slice(0, 2) + '/' + d.slice(2);
      e.target.value = d;
      check();
    });
    intl && f('cvv').addEventListener('input', (e) => { e.target.value = e.target.value.replace(/\D/g, '').slice(0, brand.cvv); check(); });
    el.querySelectorAll('[data-f]').forEach((i) => i.addEventListener('blur', () => { touched[i.dataset.f] = true; check(); }));

    el.addEventListener('click', async (e) => {
      const act = e.target.closest('[data-act]')?.dataset.act;
      if (act === 'back') return App.nav.pop();
      if (act === 'save') {
        save = !save;
        $('.sw').classList.toggle('on', save);
        $('.cf-agree').classList.toggle('hide', !save);
        return check();
      }
      if (act === 'agree') { agree = !agree; $('.cbx2').classList.toggle('on', agree); return check(); }
      if (act === 'autofill') return autofillSheet();
      if (act === 'other') return useSaved(null);
      const del = e.target.closest('[data-del]');
      if (del) {
        e.stopPropagation();
        const ok2 = await App.ui.iosAlert({ title: 'Xoá thẻ đã lưu?', message: 'Bạn sẽ cần nhập lại thông tin thẻ cho lần sau.', buttons: [{ label: 'Huỷ', value: false }, { label: 'Xoá', value: true, bold: true }] });
        if (!ok2) return;
        if (saved && saved.id === del.dataset.del) useSaved(null);
        removeCard(del.dataset.del);
        del.closest('.cf-chip').remove();
        return;
      }
      const use = e.target.closest('[data-use]');
      if (use) { App.ui.haptic(5); return useSaved((st().savedCards || []).find((c) => c.id === use.dataset.use)); }
      if (e.target.closest('.gw-go')) {
        Object.keys({ num: 1, name: 1, date: 1, ...(intl ? { cvv: 1 } : {}) }).forEach((k) => (touched[k] = true));
        if (!check()) return;
        App.ui.haptic(12);
        await processing(el, `Đang xác thực với ${bank ? bank.name : 'ngân hàng phát hành'}…`);
        const digits = saved ? saved.last4 : f('num').value.replace(/\D/g, '');
        const last4 = digits.slice(-4);
        const result = decide(digits);
        if (result === 'success' && save && !saved) {
          saveCard({ type: intl ? 'intl' : 'atm', ...(intl ? { brandId: brand.id } : { bankId: bank.id }), last4, name: f('name').value.trim(), exp: f('date').value });
        }
        return finish(o, result, `${bank ? `Thẻ nội địa ${bank.name}` : brand.name} •••• ${last4}`);
      }
    });
    if (preset) useSaved(preset);
    else setTimeout(() => f('num').focus(), 520);
    return { el, statusBar: 'dark' };
  }

  // ---------- VietQR: "Quét mã QR" ----------
  const QR_APPS = [
    ['vcb', 'VCB Digibank'], ['vtb', 'VietinBank iPay'], ['bidv', 'BIDV SmartBanking'], ['agr', 'Agribank Plus'],
    ['tcb', 'Techcombank Mobile'], ['mb', 'MB Bank'], ['acb', 'ACB ONE'], ['vpb', 'VPBank NEO'],
    ['tpb', 'TPBank Mobile'], ['stb', 'Sacombank Pay'], ['hdb', 'HDBank'], ['vib', 'MyVIB'],
    ['shb', 'SHB Mobile'], ['ocb', 'OCB OMNI'], ['msb', 'MSB mBank'], ['eib', 'Eximbank EDigi'],
    ['seab', 'SeAMobile'], ['nab', 'Nam A Bank Open'], ['lpb', 'LPBank'], ['abb', 'ABBANK Mobile'], ['bvb', 'BAOVIET Smart'],
  ];
  function vietQR(o) {
    const qrCode = 'QR' + o.code.slice(-6).replace(/\d/g, (d) => 'ABCDEFGHJK'[d]).slice(0, 2) + o.code.slice(-4);
    const el = App.ui.el(`
      <section class="gw qrs">
        <header class="qrs-head"><button class="qrs-x" data-act="back" aria-label="Đóng"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg></button><h1>Quét mã QR</h1><span></span></header>
        <div class="gw-body qrs-body">
          <div class="qrs-card">
            <span class="qrs-cap">THANH TOÁN ĐA NĂNG</span>
            <div class="qrs-in">${App.art.qr(+o.code.slice(-5))}<b>${qrCode}</b></div>
          </div>
          <p class="qrs-amt">Số tiền <b>${vnd(o.money.total)}</b> · Hiệu lực còn <b class="qr-left">--:--</b></p>
          <div class="qrs-acts">
            <button data-act="share"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M14 5l6 6-6 6"/><path d="M20 11H10a6 6 0 0 0-6 6v2"/></svg>Chia sẻ</button>
            <button data-act="save"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M12 4v11M7 10l5 5 5-5M5 20h14"/></svg>Tải xuống</button>
          </div>
          <div class="qrs-apps">
            <b>Ứng dụng hỗ trợ thanh toán QR Code</b>
            <small>Sử dụng ứng dụng để quét mã thanh toán</small>
            <div class="qrs-grid">${QR_APPS.map(([id, n], i) => { const b = BANKS.find((x) => x.id === id); return `<button class="qa" data-app="${n}" style="--i:${i}"><span class="qa-ic" style="--c:${b.c}">${b.short}</span><span>${n}</span></button>`; }).join('')}</div>
          </div>
        </div>
      </section>`);
    const t = setInterval(() => {
      const left = Math.max(0, o.expiresAt - Date.now());
      const q = el.querySelector('.qr-left');
      if (q) q.textContent = `${String(Math.floor(left / 60000)).padStart(2, '0')}:${String(Math.floor(left / 1000) % 60).padStart(2, '0')}`;
    }, 500);
    el.addEventListener('click', async (e) => {
      const act = e.target.closest('[data-act]')?.dataset.act;
      if (act === 'back') return leave(o);
      if (act === 'share') return App.ui.toast('Mở bảng chia sẻ iOS (mô phỏng)');
      if (act === 'save') return App.ui.toast('Đã lưu mã QR vào Ảnh');
      const app = e.target.closest('[data-app]');
      if (app) {
        App.ui.haptic(5);
        const r = await App.ui.iosAlert({
          title: `“Mộc Trà” muốn mở “${app.dataset.app}”`,
          message: 'Mô phỏng: chọn kết quả khi quay về từ ứng dụng ngân hàng.',
          buttons: [{ label: 'Đã thanh toán', value: 'ok', bold: true }, { label: 'Giao dịch thất bại', value: 'fail' }, { label: 'Huỷ', value: 0 }],
          layout: 'col',
        });
        if (!r) return;
        await processing(el, 'Đang kiểm tra giao dịch…');
        return finish(o, r === 'ok' ? decide() : 'declined', `VietQR · ${app.dataset.app}`);
      }
    });
    return { el, statusBar: 'dark', onLeave: () => clearInterval(t) };
  }

  // ---------- MoMo (mô phỏng mở app ví) ----------
  async function momo(o, from) {
    const host = document.getElementById('overlay');
    const ov = App.ui.el(`<div class="co-proc fixed"><div><span class="spin"></span><b>Đang mở ví MoMo…</b><small>Bạn sẽ quay lại app sau khi xác nhận</small></div></div>`);
    host.appendChild(ov);
    await App.ui.wait(1500);
    ov.remove();
    const back = await App.ui.iosAlert({
      title: '“Mộc Trà” muốn mở “MoMo”',
      message: 'Mô phỏng: chọn kết quả quay về từ ví.',
      buttons: [{ label: 'Đã thanh toán', value: 'paid', bold: true }, { label: 'Huỷ trong ví MoMo', value: 'fail' }, { label: 'Quay lại', value: 'back' }],
      layout: 'col',
    });
    if (back === 'paid') return finish(o, decide(), 'Ví MoMo');
    if (back === 'fail') return finish(o, 'cancelled', 'Ví MoMo');
    if (from === 'checkout') leave(o);
  }

  // ---------- sheet chọn lại phương thức (từ Chi tiết đơn) ----------
  function methodSheet(o) {
    return new Promise((resolve) => {
      let pick = null;
      const sh = App.ui.sheet(`
        <div class="pms">
          <div class="pms-h"><h3>PHƯƠNG THỨC THANH TOÁN</h3><button class="pms-x" aria-label="Đóng">✕</button></div>
          ${App.data.payMethods.map((p) => `
            <button class="co-row co-pm" data-pm="${p.id}">
              <span class="pm-logo pm-${p.id}"><i>${p.id === 'intl' ? 'VISA' : p.id === 'atm' ? 'ATM' : p.id === 'vietqr' ? 'QR' : 'MoMo'}</i></span>
              <span class="pm-t"><b>${p.label}</b><small>${p.sub}</small></span><i class="radio"></i>
            </button>`).join('')}
          <div class="pms-btns"><button class="pms-close">Đóng</button><button class="pms-ok" disabled>Xác nhận</button></div>
        </div>`, { onClose: () => resolve(pick && done ? pick : null) });
      let done = false;
      sh.el.querySelectorAll('[data-pm]').forEach((b) => b.addEventListener('click', () => {
        App.ui.haptic(4); pick = b.dataset.pm;
        sh.el.querySelectorAll('[data-pm]').forEach((x) => x.classList.toggle('on', x === b));
        sh.el.querySelector('.pms-ok').disabled = false;
      }));
      sh.el.querySelector('.pms-close').onclick = () => sh.close();
      sh.el.querySelector('.pms-x').onclick = () => sh.close();
      sh.el.querySelector('.pms-ok').onclick = () => { done = true; sh.close(); };
    });
  }

  return { createOrder, getOrder, updateOrder, cancelOrder, confirmStore, start, methodSheet, reorder, sweepExpired, success, seedHistory, notify, activeOrder, STEP_MS, FAIL, HOLD_MIN };
})();
