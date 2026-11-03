// C6 · Giỏ hàng & Thanh toán ("Đơn hàng của bạn")
// Mở từ "KIỂM TRA LẠI" ở Menu hoặc "ĐẶT HÀNG" ở Chi tiết món.
// Tính tiền: tạm tính + phí bao bì + phí giao − voucher; VAT 8% đã bao gồm trong giá.
App.screens.checkout = () => {
  const st = () => App.state.get();
  const vnd = App.fmt.vnd;
  const I = App.icons.ic;
  const byId = Object.fromEntries(App.data.menu.items.map((x) => [x.id, x]));
  const back = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 5l-7 7 7 7"/></svg>';
  const info = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="12" cy="12" r="8.5"/><path d="M12 11v5M12 8v.5" stroke-linecap="round"/></svg>';
  const pen = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M4 20h4L19 9l-4-4L4 16z"/></svg>';
  const bagIc = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"><path d="M6 8h12l-1 12H7z"/><path d="M9 8V6.5a3 3 0 0 1 6 0V8"/></svg>';
  const stampIc = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"><path d="M7 8h10l-1.3 12a1 1 0 0 1-1 .9H9.3a1 1 0 0 1-1-.9z"/><path d="M6 8h12M12.5 8l1.3-4.5h2.5"/></svg>';

  const PACK_FEE = 1000;
  const SHIP_FEE = 15000, FREE_SHIP_FROM = 99000;
  const VAT = 0.08;

  // ---------- voucher ----------
  // kho quà (từ Bộ sưu tập tem) + voucher chung của cửa hàng
  const RULES = {
    'r0-0': { type: 'pct1', pct: 50 },
    'r0-1': { type: 'b1g1', cat: 'fruit', catName: 'Trà Trái Cây' },
    'r3-0': { type: 'b1g1', cat: 'milk', catName: 'Trà Sữa Nguyên Lá' },
    'r5-0': { type: 'b3g1' },
    'r8-0': { type: 'free', ids: ['m-m1', 'm-p1', 'm-k1'] },
    'r10-0': { type: 'gift' },
  };
  const STORE_VOUCHERS = [
    { id: 'v20k', title: 'Giảm 20.000đ', sub: 'Đơn từ 150.000đ', type: 'flat', amount: 20000, min: 150000 },
    { id: 'vship', title: 'Miễn phí giao hàng', sub: 'Đơn giao hàng dưới 99.000đ', type: 'ship' },
  ];
  function vouchers() {
    const mine = (st().rewards || []).filter((r) => !r.used && !(r.exp && r.exp < Date.now())).map((r) => ({ ...r, ...(RULES[r.id] || r.rule || { type: 'gift' }), from: 'Kho quà' }));
    // voucher chung của cửa hàng: bỏ cái đã có trong Kho quà (cùng tên) để không lặp
    const titles = new Set(mine.map((v) => v.title));
    return [...mine, ...STORE_VOUCHERS.filter((v) => !titles.has(v.title)).map((v) => ({ ...v, from: 'Mộc Trà' }))];
  }

  // ---------- tính tiền ----------
  const lines = () => (st().cart || []).filter((l) => byId[l.id]);
  const unitOf = (l) => l.unit ?? byId[l.id].price;
  const isPickup = () => st().orderMode === 'pickup';
  const store = () => App.data.stores.find((s) => s.id === st().storeId) || App.data.stores[0];
  const address = () => (st().isMember ? App.data.member.addresses.find((a) => a.id === st().addressId) : null);

  // từng ly đồ uống (để áp voucher theo ly)
  function cups() {
    const out = [];
    lines().forEach((l) => {
      const it = byId[l.id];
      if (it.kind) return;
      for (let i = 0; i < l.qty; i++) out.push({ id: it.id, cat: it.cat, unit: unitOf(l) });
    });
    return out;
  }
  const stampsEarned = () => lines().reduce((n, l) => {
    const it = byId[l.id];
    return n + (it.kind === 'combo' ? it.cups.length * l.qty : it.kind ? 0 : l.qty);
  }, 0);

  function evalVoucher(v, sub, ship) {
    if (!v) return { ok: false, discount: 0 };
    const cs = cups();
    const fail = (reason) => ({ ok: false, discount: 0, reason });
    switch (v.type) {
      case 'pct1': {
        if (!cs.length) return fail('Cần ít nhất 1 ly đồ uống');
        const top = Math.max(...cs.map((c) => c.unit));
        return { ok: true, discount: Math.round((top * v.pct) / 100) };
      }
      case 'b1g1': {
        const list = cs.filter((c) => c.cat === v.cat).sort((a, b) => a.unit - b.unit);
        if (list.length < 2) return fail(`Cần 2 ly ${v.catName} (đang có ${list.length})`);
        return { ok: true, discount: list[0].unit };
      }
      case 'b3g1': {
        if (cs.length < 4) return fail(`Cần 4 ly đồ uống (đang có ${cs.length})`);
        return { ok: true, discount: Math.min(...cs.map((c) => c.unit)) };
      }
      case 'free': {
        const list = cs.filter((c) => v.ids.includes(c.id));
        if (!list.length) return fail('Áp dụng: Lài Sữa, Ô Long Đào, Hồng Trà Kem Mây');
        return { ok: true, discount: Math.max(...list.map((c) => c.unit)) };
      }
      case 'freeAny': {
        if (!cs.length) return fail('Cần ít nhất 1 ly đồ uống');
        return { ok: true, discount: Math.max(...cs.map((c) => c.unit)) };
      }
      case 'flat':
        return sub >= v.min ? { ok: true, discount: v.amount } : fail(`Mua thêm ${vnd(v.min - sub)} để dùng`);
      case 'ship':
        if (isPickup()) return fail('Chỉ áp dụng cho đơn Giao hàng');
        return ship > 0 ? { ok: true, discount: ship } : fail('Đơn đã được miễn phí giao');
      default:
        return fail('Quà tặng nhận tại quầy, không dùng khi thanh toán');
    }
  }

  function calc() {
    const sub = lines().reduce((n, l) => n + unitOf(l) * l.qty, 0);
    const pack = isPickup() && st().packBag !== false ? PACK_FEE : 0;
    const ship = isPickup() ? 0 : sub >= FREE_SHIP_FROM ? 0 : SHIP_FEE;
    const v = vouchers().find((x) => x.id === st().appliedReward);
    const ev = evalVoucher(v, sub, ship);
    const discount = ev.ok ? Math.min(ev.discount, sub + ship) : 0;
    const total = Math.max(0, sub + pack + ship - discount);
    const vat = Math.round(total - total / (1 + VAT));
    return { sub, pack, ship, v, ev, discount, total, vat };
  }

  // ---------- markup ----------
  const el = App.ui.el(`
    <section class="co">
      <header class="sp-nav"><button class="sp-back" data-act="back" aria-label="Quay lại">${back}</button><h1>Đơn hàng của bạn</h1><span></span></header>
      <div class="co-scroll"></div>
      <div class="co-foot"><button class="co-pay" data-act="pay"></button></div>
    </section>`);
  const $ = (s) => el.querySelector(s);
  const body = $('.co-scroll');

  const PAY = App.data.payMethods;

  function pickupTimeText() {
    const t = st().pickupTime;
    return t ? `Hẹn lúc <b>${t}</b> hôm nay` : null;
  }

  function render() {
    const ls = lines();
    if (!ls.length) {
      body.innerHTML = `
        <div class="co-empty">
          <span>${bagIc}</span><b>Giỏ hàng đang trống</b><p>Chọn món yêu thích trong Menu để bắt đầu đặt hàng.</p>
          <button class="co-btn" data-act="back">XEM MENU</button>
        </div>`;
      $('.co-foot').classList.add('hide');
      return;
    }
    $('.co-foot').classList.remove('hide');
    const s = store();
    const a = address();
    const c = calc();
    const queue = Math.max(1, Math.round(s.wait / 3));
    const closed = s.status === 'closed';
    const stamps = stampsEarned();

    body.innerHTML = `
      <div class="co-card co-where">
        <div class="co-mode"><b>${isPickup() ? 'TỰ ĐẾN LẤY' : 'GIAO HÀNG'}</b><button class="co-switch" data-act="switch">Đổi sang ${isPickup() ? 'Giao hàng' : 'Tự đến lấy'}</button></div>
        ${isPickup() ? `
          <button class="co-row co-store" data-act="store">
            <span class="cs-name"><b>${s.name.toUpperCase()}</b><em>${App.fmt.km(s.distance)}</em>${I.chevron}</span>
            <small>${s.address}</small>
          </button>` : `
          <button class="co-row co-store" data-act="address">
            <span class="cs-name">${I.pin}<b>${a ? `${a.label} · ${a.line}` : 'Chọn địa chỉ giao hàng'}</b>${I.chevron}</span>
            <small>${a ? `${a.receiver} · ${a.phone}` : 'Bắt buộc để giao hàng'}</small>
            <small>Từ ${s.name} · ${App.fmt.km(a ? a.km : s.distance)}</small>
          </button>`}
        ${closed ? `<p class="co-warn">Cửa hàng đang đóng cửa · mở lại ${s.opensAt}. Vui lòng chọn cửa hàng khác.</p>` : ''}
      </div>

      <div class="co-card">
        <div class="co-line">
          <b>${isPickup() ? 'Thời gian nhận món' : 'Thời gian giao'}</b>
          ${isPickup() ? `<button class="co-link" data-act="time">${st().pickupTime ? 'Đổi giờ' : 'Hẹn giờ nhận món'}</button>` : ''}
        </div>
        <p class="co-note">${isPickup()
          ? (pickupTimeText() || `Thời gian chờ ước tính <em>${s.wait} phút</em>, <em>${queue} ly</em> đang trong quá trình pha chế`)
          : `Dự kiến giao trong <em>25–35 phút</em> sau khi cửa hàng nhận đơn`}</p>
      </div>

      <div class="co-card">
        <h3 class="co-h"><span class="co-h-store">${App.icons.ic.store}${s.name.toUpperCase()}</span><button class="co-link" data-act="more">+ Thêm món</button></h3>
        ${ls.map((l, i) => { const it = byId[l.id]; return `
          <div class="co-item">
            <span class="ci-art ${it.kind || 'drink'}">${App.menuArt(it)}</span>
            <div class="ci-info"><b>${it.name}</b><small>${l.opts || it.desc || it.sub || ''}</small></div>
            <div class="ci-right"><b>${vnd(unitOf(l) * l.qty)}</b>
              <div class="stepper"><button data-dec="${i}">−</button><em>${l.qty}</em><button data-inc="${i}">+</button></div>
            </div>
          </div>`; }).join('')}
      </div>

      <div class="co-card co-opts">
        ${isPickup() ? `
        <button class="co-row co-opt" data-act="pack">
          <span class="co-ic">${bagIc}</span><b>Túi mang đi</b>
          <span class="co-r">${vnd(PACK_FEE)}<i class="cbx ${st().packBag !== false ? 'on' : ''}"></i></span>
        </button>` : ''}
        <button class="co-row co-opt" data-act="voucher">
          <span class="co-ic">${I.ticket}</span><b>Voucher</b>
          <span class="co-r ${c.ev.ok ? 'red' : ''}">${c.v ? (c.ev.ok ? `${c.v.title} · −${vnd(c.discount)}` : `<s>${c.v.title}</s> chưa đủ điều kiện`) : `${vouchers().length} voucher khả dụng`}${I.chevron}</span>
        </button>
        <div class="co-row co-opt">
          <span class="co-ic">${stampIc}</span><b>Lấy hàng</b>
          <span class="co-r muted">${stamps ? `Sẽ nhận được <em class="co-stamp-n">${stamps} tem</em>` : 'Đơn không tính tem'}
            <button class="co-info" data-act="stamp" aria-label="Giải thích chương trình tem">${info}</button></span>
        </div>
      </div>

      <div class="co-card">
        <h3 class="co-h">Chi tiết thanh toán</h3>
        <div class="co-sum"><span>Tạm tính (${ls.reduce((n, l) => n + l.qty, 0)} món)</span><span>${vnd(c.sub)}</span></div>
        ${c.pack ? `<div class="co-sum"><span>Túi mang đi</span><span>+ ${vnd(c.pack)}</span></div>` : ''}
        ${!isPickup() ? `<div class="co-sum"><span>Phí giao hàng${c.ship ? ` <small>· miễn phí từ ${vnd(FREE_SHIP_FROM)}</small>` : ''}</span><span>${c.ship ? `+ ${vnd(c.ship)}` : 'Miễn phí'}</span></div>` : ''}
        ${c.discount ? `<div class="co-sum red"><span>Tổng chiết khấu<small>${c.v.title}</small></span><span>− ${vnd(c.discount)}</span></div>` : ''}
        <div class="co-sum muted"><span>VAT 8% (đã bao gồm)</span><span>${vnd(c.vat)}</span></div>
        <div class="co-sum total"><span>Tổng thanh toán</span><span>${vnd(c.total)}</span></div>
      </div>

      <div class="co-card">
        <h3 class="co-h">PHƯƠNG THỨC THANH TOÁN</h3>
        ${PAY.map((p) => `
          <button class="co-row co-pm ${st().payMethod === p.id ? 'on' : ''}" data-pm="${p.id}">
            <span class="pm-logo pm-${p.id}">${p.id === 'intl' ? '<i>VISA</i>' : p.id === 'atm' ? '<i>ATM</i>' : p.id === 'vietqr' ? '<i>QR</i>' : '<i>MoMo</i>'}</span>
            <span class="pm-t"><b>${p.label}</b><small>${p.sub}</small></span>
            <i class="radio"></i>
          </button>`).join('')}
      </div>

      <div class="co-card co-opts">
        <button class="co-row co-opt" data-act="note">
          <b>GHI CHÚ ĐƠN HÀNG</b>
          <span class="co-r muted"><span class="note-t">${st().orderNote || 'Không bắt buộc'}</span>${I.chevron}</span>
        </button>
      </div>
      <p class="co-legal">Bằng việc thanh toán, bạn đồng ý với Điều khoản sử dụng và Chính sách hoàn tiền của Mộc Trà.</p>`;

    $('.co-pay').innerHTML = `THANH TOÁN ${vnd(c.total)}`;
  }

  // ---------- sheet: voucher ----------
  function voucherSheet() {
    const c = calc();
    const vs = vouchers();
    const sh = App.ui.sheet(`
      <div class="vs">
        <h3>Chọn voucher</h3>
        ${!st().isMember ? '<p class="vs-tip">Đăng nhập để dùng voucher trong Kho quà.</p>' : ''}
        <div class="vs-list">
          ${vs.map((v) => {
            const ev = evalVoucher(v, c.sub, isPickup() ? 0 : c.sub >= FREE_SHIP_FROM ? 0 : SHIP_FEE);
            const on = st().appliedReward === v.id;
            return `
            <button class="vs-item ${ev.ok ? '' : 'off'} ${on ? 'on' : ''}" data-v="${v.id}" ${ev.ok ? '' : 'data-reason="' + ev.reason + '"'}>
              <span class="vs-tkt">${I.voucherPct}</span>
              <span class="vs-t"><b>${v.title}</b><small>${v.sub}</small><em class="${ev.ok ? 'ok' : ''}">${ev.ok ? `Giảm ${vnd(ev.discount)} cho đơn này` : ev.reason}</em></span>
              <i class="radio"></i>
              <span class="vs-from">${v.from}</span>
            </button>`;
          }).join('')}
        </div>
        <div class="vs-foot"><button class="vs-none">Không dùng voucher</button><button class="vs-ok">ÁP DỤNG</button></div>
      </div>`);
    let pick = st().appliedReward;
    const paint = () => sh.el.querySelectorAll('.vs-item').forEach((b) => b.classList.toggle('on', b.dataset.v === pick));
    sh.el.querySelectorAll('.vs-item').forEach((b) => b.addEventListener('click', () => {
      if (b.dataset.reason) { b.classList.remove('shake'); void b.offsetWidth; b.classList.add('shake'); return App.ui.toast(b.dataset.reason); }
      App.ui.haptic(4);
      pick = pick === b.dataset.v ? null : b.dataset.v;
      paint();
    }));
    sh.el.querySelector('.vs-none').onclick = () => { App.state.set({ appliedReward: null }); sh.close(); render(); };
    sh.el.querySelector('.vs-ok').onclick = () => { App.state.set({ appliedReward: pick }); sh.close(); render(); if (pick) App.ui.toast('Đã áp dụng voucher'); };
  }

  // ---------- sheet: hẹn giờ ----------
  function timeSheet() {
    const s = store();
    const d = new Date();
    const start = new Date(d.getTime() + (s.wait + 10) * 60000);
    start.setMinutes(Math.ceil(start.getMinutes() / 15) * 15, 0, 0);
    const slots = [];
    const [, close] = s.hours.split('–').map((x) => x.trim());
    const [ch, cm] = close.split(':').map(Number);
    for (let t = new Date(start); slots.length < 12 && (t.getHours() < ch || (t.getHours() === ch && t.getMinutes() <= cm - 30)); t = new Date(t.getTime() + 15 * 60000)) {
      slots.push(`${String(t.getHours()).padStart(2, '0')}:${String(t.getMinutes()).padStart(2, '0')}`);
    }
    const cur = st().pickupTime;
    const sh = App.ui.sheet(`
      <div class="ts">
        <h3>Hẹn giờ nhận món</h3>
        <p>Món sẽ được pha khoảng ${s.wait} phút trước giờ hẹn để giữ độ tươi.</p>
        <div class="ts-grid">
          <button class="ts-slot ${!cur ? 'on' : ''}" data-t="">Nhận ngay<small>khoảng ${s.wait} phút</small></button>
          ${slots.map((t) => `<button class="ts-slot ${cur === t ? 'on' : ''}" data-t="${t}">${t}<small>Hôm nay</small></button>`).join('')}
        </div>
        ${slots.length ? '' : '<p class="ts-none">Cửa hàng sắp đóng cửa, chỉ có thể nhận ngay.</p>'}
      </div>`);
    sh.el.querySelectorAll('.ts-slot').forEach((b) => b.addEventListener('click', () => {
      App.ui.haptic(4);
      App.state.set({ pickupTime: b.dataset.t || null });
      sh.el.querySelectorAll('.ts-slot').forEach((x) => x.classList.toggle('on', x === b));
      setTimeout(() => { sh.close(); render(); }, 220);
    }));
  }

  // ---------- sheet: nhập SĐT / ghi chú ----------
  function noteSheet() {
    const chips = ['Ít đá giúp mình', 'Không lấy ống hút', 'Để riêng topping', 'Gọi khi tới'];
    const sh = App.ui.sheet(`
      <div class="fs">
        <h3>Ghi chú đơn hàng</h3>
        <p>Cửa hàng sẽ cố gắng đáp ứng; một số yêu cầu có thể không thực hiện được.</p>
        <div class="fs-chips">${chips.map((c) => `<button>${c}</button>`).join('')}</div>
        <textarea maxlength="120" placeholder="VD: không lấy ống hút">${st().orderNote || ''}</textarea>
        <span class="fs-count"></span>
        <button class="fs-ok">LƯU GHI CHÚ</button>
      </div>`);
    const ta = sh.el.querySelector('textarea');
    const cnt = () => (sh.el.querySelector('.fs-count').textContent = `${ta.value.length}/120`);
    cnt(); ta.addEventListener('input', cnt);
    sh.el.querySelectorAll('.fs-chips button').forEach((b) => b.onclick = () => {
      ta.value = ta.value ? `${ta.value.replace(/[,\s]+$/, '')}, ${b.textContent}` : b.textContent; cnt();
    });
    sh.el.querySelector('.fs-ok').onclick = () => { App.state.set({ orderNote: ta.value.trim() }); sh.close(); render(); };
  }

  // ---------- modal: giải thích chương trình tem ----------
  function stampModal() {
    App.ui.haptic(5);
    const C = App.data.stampCampaign;
    const n = stampsEarned();
    const have = App.memberStamps();
    const m = App.ui.el(`
      <div class="co-modal">
        <div class="cm-card" role="dialog">
          <button class="cm-x" aria-label="Đóng"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg></button>
          <div class="cm-head">
            <span class="cm-tag">${C.audience}</span>
            <h3>“${C.name}”</h3>
            <p>Mỗi ly đồ uống = <b>1 tem</b>. Góp đủ mốc để mở quà.</p>
          </div>
          <div class="cm-track">
            ${Array.from({ length: C.total }, (_, i) => {
              const k = i + 1; const cls = k <= have ? 'done' : k <= have + n ? 'new' : '';
              const ms = C.milestones.find((x) => x.at === k);
              return `<span class="${cls} ${ms ? 'ms' : ''}" style="--i:${i}">${ms ? `<i>${k}</i>` : ''}</span>`;
            }).join('')}
          </div>
          <p class="cm-now">${n ? `Đơn này sẽ cộng <b>+${n} tem</b>${st().isMember ? ` → ${Math.min(C.total, have + n)}/${C.total}` : ''}` : 'Đơn này không có đồ uống được tính tem'}</p>
          <ul>
            ${C.milestones.filter((x) => x.at > 0).map((x) => `<li><b>${x.at} tem</b><span>${x.rewards.map((r) => r.title).join(' + ')}</span></li>`).join('')}
          </ul>
          <p class="cm-fine">Tem được cộng sau khi đơn hoàn tất. Không tính hộp trà, quà lưu niệm và đồ uống dùng voucher miễn phí. Chương trình đến ${C.endsAt}.</p>
          <div class="cm-btns">
            <button class="cm-more">XEM BỘ SƯU TẬP TEM</button>
            <button class="cm-ok">ĐÃ HIỂU</button>
          </div>
        </div>
      </div>`);
    const close = (after) => { m.classList.add('closing'); setTimeout(() => { m.remove(); after && after(); }, 220); };
    m.addEventListener('click', (e) => {
      if (e.target === m || e.target.closest('.cm-x') || e.target.closest('.cm-ok')) return close();
      if (e.target.closest('.cm-more')) return close(() => App.nav.push(App.screens.stamps({ onOrder: () => {} })));
    });
    document.getElementById('overlay').appendChild(m);
  }

  // ---------- thanh toán ----------
  async function pay() {
    const s = store();
    const c = calc();
    if (s.status === 'closed') {
      return App.ui.iosAlert({ title: 'Cửa hàng đang đóng cửa', message: `${s.name} mở lại ${s.opensAt}. Vui lòng chọn cửa hàng khác.`, buttons: [{ label: 'Để sau', value: 0 }, { label: 'Chọn cửa hàng', value: 1, bold: true }] })
        .then((v) => v && App.nav.push(App.screens.storePicker()));
    }
    if (!isPickup() && !address()) return App.nav.push(App.screens.addressPicker());
    if (!st().payMethod) {
      const card = body.querySelector('.co-pm').closest('.co-card');
      body.scrollTo({ top: card.offsetTop - 12, behavior: 'smooth' });
      card.classList.remove('shake'); void card.offsetWidth; card.classList.add('shake');
      return App.ui.toast('Chọn phương thức thanh toán');
    }
    if (c.v && !c.ev.ok) {
      const go = await App.ui.iosAlert({ title: 'Voucher chưa đủ điều kiện', message: `“${c.v.title}”: ${c.ev.reason}. Tiếp tục thanh toán không dùng voucher?`, buttons: [{ label: 'Xem lại', value: false }, { label: 'Tiếp tục', value: true, bold: true }] });
      if (!go) return;
      App.state.set({ appliedReward: null });
      render();
    }
    App.ui.haptic(12);
    // xác nhận cửa hàng → tạo đơn "chờ thanh toán" → mở cổng thanh toán
    const ok = await App.payment.confirmStore({ store: s, pickup: isPickup(), address: address(), pickupTime: st().pickupTime, total: c.total });
    if (ok === 'change') return App.nav.push(isPickup() ? App.screens.storePicker() : App.screens.addressPicker());
    if (!ok) return;
    const order = App.payment.createOrder({
      lines: lines().map((l) => ({ ...l })),
      storeId: s.id, mode: st().orderMode, addressId: isPickup() ? null : st().addressId,
      pickupTime: st().pickupTime || null, note: st().orderNote || '',
      payMethod: st().payMethod,
      money: { sub: c.sub, pack: c.pack, ship: c.ship, discount: c.discount, vat: c.vat, total: c.total, voucher: c.discount ? c.v.title : null, voucherId: c.discount ? c.v.id : null },
      stamps: stampsEarned(),
    });
    App.payment.start(order);
  }

  // ---------- sự kiện ----------
  el.addEventListener('click', (e) => {
    const t = e.target;
    const inc = t.closest('[data-inc]'), dec = t.closest('[data-dec]');
    if (inc || dec) {
      App.ui.haptic(4);
      const ls = (st().cart || []).map((l) => ({ ...l }));
      const i = +(inc || dec).dataset[inc ? 'inc' : 'dec'];
      if (dec && ls[i].qty === 1) {
        return App.ui.iosAlert({ title: 'Xoá món này?', message: byId[ls[i].id].name, buttons: [{ label: 'Huỷ', value: false }, { label: 'Xoá', value: true, bold: true }] })
          .then((ok) => { if (ok) { ls.splice(i, 1); App.state.set({ cart: ls }); render(); } });
      }
      ls[i].qty += inc ? 1 : -1;
      App.state.set({ cart: ls });
      return render();
    }
    const pm = t.closest('[data-pm]');
    if (pm) { App.ui.haptic(4); App.state.set({ payMethod: pm.dataset.pm }); return render(); }
    const act = t.closest('[data-act]')?.dataset.act;
    switch (act) {
      case 'back': case 'more': return App.nav.pop();
      case 'switch': App.state.set({ orderMode: isPickup() ? 'delivery' : 'pickup' }); return render();
      case 'store': return App.nav.push(App.screens.storePicker());
      case 'address': return App.nav.push(App.screens.addressPicker());
      case 'time': return timeSheet();
      case 'pack': App.state.set({ packBag: st().packBag === false }); return render();
      case 'voucher': return voucherSheet();
      case 'stamp': return stampModal();
      case 'note': return noteSheet();
      case 'pay': return pay();
    }
  });

  render();
  return { el, statusBar: 'dark', onResume: render };
};
