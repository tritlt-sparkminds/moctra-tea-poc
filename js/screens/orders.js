// C9 · Tab Đơn hàng — "LỊCH SỬ ĐẶT HÀNG"
// Lọc: Tất cả · Trên ứng dụng · Tại cửa hàng · Khác
// Thẻ đơn: cửa hàng, thời gian, trạng thái, món, tổng tiền, hành động theo trạng thái.
App.screens.orders = ({ goTab } = {}) => {
  const P = App.payment;
  const st = () => App.state.get();
  const vnd = App.fmt.vnd;
  const I = App.icons.ic;
  const byId = Object.fromEntries(App.data.menu.items.map((x) => [x.id, x]));
  const TABS = [['all', 'Tất cả'], ['app', 'Trên ứng dụng'], ['store', 'Tại cửa hàng'], ['other', 'Khác']];
  const STATUS = {
    pending: { t: 'Đang chờ thanh toán', c: 'wait' },
    cancelled: { t: 'Bị huỷ bỏ', c: 'off' },
    paid: { t: 'Đã thanh toán', c: 'ok' },
  };
  let tab = 'all';

  const el = App.ui.el(`
    <section class="ol">
      <header class="ol-head">
        <h1>LỊCH SỬ ĐẶT HÀNG</h1>
        <nav class="ol-tabs">${TABS.map(([k, n]) => `<button data-tab="${k}" class="${k === tab ? 'on' : ''}">${n}</button>`).join('')}<i class="ol-ul"></i></nav>
      </header>
      <div class="ol-list"></div>
    </section>`);
  const list = el.querySelector('.ol-list');
  const fmt = (ms) => { const d = new Date(ms); const p = (n) => String(n).padStart(2, '0'); return `${p(d.getDate())}/${p(d.getMonth() + 1)}/${d.getFullYear()} ${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`; };
  const mmss = (ms) => `${String(Math.floor(ms / 60000)).padStart(2, '0')}:${String(Math.floor(ms / 1000) % 60).padStart(2, '0')}`;

  function orders() {
    const all = st().orders || [];
    if (tab === 'all' || tab === 'app') return all; // POC: mọi đơn đều đặt trên ứng dụng
    return [];
  }

  function card(o) {
    const s = App.data.stores.find((x) => x.id === o.storeId);
    const S = o.status === 'paid'
      ? ((o.progress || 0) >= 3 ? { t: 'Hoàn tất', c: 'ok' } : { t: ['Đã thanh toán', 'Đang pha chế', o.mode === 'pickup' ? 'Sẵn sàng' : 'Đang giao'][o.progress || 0], c: 'run' })
      : STATUS[o.status];
    const active = o.status === 'paid' && (o.progress || 0) < 3;
    const count = o.lines.reduce((n, l) => n + l.qty, 0);
    const one = o.lines.length === 1;
    const it0 = byId[o.lines[0].id];
    return `
      <div class="oc ${o.status}" data-order="${o.id}">
        <div class="oc-top">
          <span class="oc-store"><span class="oc-ic">${I.store}</span><b>${s.name.toUpperCase()}</b></span>${I.chevron}
        </div>
        <div class="oc-sub">
          <span>${fmt(o.createdAt)} · ${o.mode === 'pickup' ? 'Tự đến lấy' : 'Giao hàng'}</span>
          <span class="oc-st ${S.c}">${o.status === 'pending' ? '<i></i>' : ''}${S.t}${o.status === 'pending' ? ` · <em data-left="${o.id}">${mmss(o.expiresAt - Date.now())}</em>` : ''}</span>
        </div>
        <div class="oc-body">
          ${one ? `
            <span class="ci-art ${it0.kind || 'drink'}">${App.menuArt(it0)}</span>
            <div class="ci-info"><b>${it0.name}</b><small>${o.lines[0].opts || it0.desc || ''}</small></div>`
          : `<div class="oc-arts">${o.lines.slice(0, 4).map((l) => `<span class="ci-art ${byId[l.id].kind || 'drink'}">${App.menuArt(byId[l.id])}</span>`).join('')}${o.lines.length > 4 ? `<span class="oc-more">+${o.lines.length - 4}</span>` : ''}</div>`}
          <div class="od-ip"><b>${vnd(o.money.total)}</b><small>x${count}</small></div>
        </div>
        <div class="oc-acts">
          ${o.status === 'pending' ? '<button class="oc-btn dark" data-do="pay">XỬ LÝ THANH TOÁN</button>' : ''}
          ${active ? '<button class="oc-btn dark" data-do="view">THEO DÕI ĐƠN</button>' : ''}
          ${o.status === 'cancelled' || (o.status === 'paid' && !active) ? `${o.status === 'paid' ? '<button class="oc-btn line" data-do="rate">ĐÁNH GIÁ</button>' : ''}<button class="oc-btn dark" data-do="reorder">ĐẶT HÀNG LẠI</button>` : ''}
        </div>
      </div>`;
  }

  function render() {
    P.sweepExpired();
    const os = orders();
    list.innerHTML = os.length ? os.map(card).join('') + '<p class="ol-end">Chỉ hiển thị đơn hàng trong 6 tháng gần nhất</p>' : `
      <div class="ol-empty">
        <svg viewBox="0 0 120 110" class="ol-cup">
          <g transform="rotate(-28 60 60)">
            <path d="M34 30 h52 l-6 66 a6 6 0 0 1 -6 5 H46 a6 6 0 0 1 -6 -5z" fill="#fff" stroke="#16241D" stroke-width="3" stroke-linejoin="round"/>
            <path d="M37 52 h46 l-4 44 a6 6 0 0 1 -6 5 H47 a6 6 0 0 1 -6 -5z" fill="#E9D3AE"/>
            <path d="M30 30 h60" stroke="#16241D" stroke-width="4" stroke-linecap="round"/>
            <ellipse cx="60" cy="30" rx="30" ry="6" fill="#F3EEE4" stroke="#16241D" stroke-width="3"/>
          </g>
          <path d="M70 92 c10 2 24 2 34 0" stroke="#E9D3AE" stroke-width="5" stroke-linecap="round" fill="none"/>
        </svg>
        <b>“KHÔNG CÓ ĐƠN HÀNG.”</b>
        <p>${tab === 'store' ? 'Đơn mua tại quầy sẽ hiển thị khi bạn quét mã hội viên lúc thanh toán.' : 'Bạn chưa đặt mua bất cứ thứ gì.'}</p>
        <button class="ol-go" data-act="order">Đặt ngay</button>
      </div>`;
  }

  // đếm ngược trên thẻ đơn đang chờ
  const timer = setInterval(() => {
    let expired = false;
    el.querySelectorAll('[data-left]').forEach((n) => {
      const o = P.getOrder(n.dataset.left);
      const left = o.expiresAt - Date.now();
      if (left <= 0) expired = true; else n.textContent = mmss(left);
    });
    if (expired) render();
  }, 1000);

  function setTab(k) {
    tab = k;
    el.querySelectorAll('.ol-tabs button').forEach((b) => b.classList.toggle('on', b.dataset.tab === k));
    const on = el.querySelector('.ol-tabs button.on');
    const ul = el.querySelector('.ol-ul');
    ul.style.width = `${on.offsetWidth}px`;
    ul.style.transform = `translateX(${on.offsetLeft}px)`;
    render();
  }

  el.addEventListener('click', async (e) => {
    const tb = e.target.closest('[data-tab]');
    if (tb) { App.ui.haptic(4); return setTab(tb.dataset.tab); }
    if (e.target.closest('[data-act="order"]')) return goTab && goTab('order');
    const c = e.target.closest('[data-order]');
    if (!c) return;
    const o = P.getOrder(c.dataset.order);
    const d = e.target.closest('[data-do]')?.dataset.do;
    if (d === 'pay') {
      const pick = await P.methodSheet(o);
      if (!pick) return;
      App.state.set({ payMethod: pick });
      P.updateOrder(o.id, { payMethod: pick });
      return P.start(P.getOrder(o.id), { from: 'list' });
    }
    if (d === 'reorder') return P.reorder(o);
    if (d === 'rate') return App.ui.soon('C9', 'Đánh giá đơn hàng');
    if (d === 'view') { App.ui.haptic(5); return App.nav.push(App.screens.tracking(o.id)); }
    App.ui.haptic(5);
    App.nav.push(App.screens.orderDetail(o.id));
  });

  // tiến trình đơn đổi → vẽ lại nếu đang hiển thị
  let sig = '';
  App.state.subscribe((d) => {
    const ns = (d.orders || []).map((x) => x.id + x.status + (x.progress || 0)).join();
    if (ns !== sig) { sig = ns; if (el.offsetParent) render(); }
  });

  return {
    el,
    show() { render(); requestAnimationFrame(() => setTab(tab)); },
    destroy() { clearInterval(timer); },
  };
};
