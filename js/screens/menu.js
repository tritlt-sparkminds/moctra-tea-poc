// C4 · Menu đặt món
// Header: Tự đến lấy / Giao hàng + cửa hàng gần nhất (khoảng cách)
// Dải hàng chờ · dải tích tem · danh mục trái (sticky) + danh sách món phải (scroll-spy)
// Nút + hoặc chạm vào món → C5 Chi tiết món (chọn size/đá/ngọt/topping) → bay vào giỏ.
App.screens.menu = ({ goTab } = {}) => {
  const I = App.icons.ic;
  const M = App.data.menu;
  const st = () => App.state.get();
  const vnd = App.fmt.vnd;

  // ---------- icon danh mục (nét mảnh, giống rail mẫu) ----------
  const CAT_IC = {
    deal: '<path d="M7 4.5h10l-1 4H8z"/><path d="M6 8.5h12l-1.3 11.3a1 1 0 0 1-1 .9H8.3a1 1 0 0 1-1-.9z"/><path d="M12 11.5l.9 1.9 2 .3-1.5 1.4.4 2-1.8-1-1.8 1 .4-2-1.5-1.4 2-.3z"/>',
    fruit: '<path d="M7 8h10l-1.3 12a1 1 0 0 1-1 .9H9.3a1 1 0 0 1-1-.9z"/><path d="M6 8h12"/><path d="M12.5 8l1.3-4.5h2.5"/><circle cx="12" cy="14.5" r="2.4"/>',
    milk: '<path d="M7 8h10l-1.3 12a1 1 0 0 1-1 .9H9.3a1 1 0 0 1-1-.9z"/><path d="M6 8h12"/><path d="M12.5 8l1.3-4.5h2.5"/><path d="M7.6 13h8.8"/><circle cx="10.5" cy="17" r=".8"/><circle cx="13.5" cy="17.5" r=".8"/>',
    matcha: '<path d="M4 12h16a8 6 0 0 1-16 0z"/><path d="M9 18.5h6"/><path d="M15.5 4l-3 7M18 5.5l-4.5 6"/>',
    cloud: '<path d="M7.5 10h9l-1.2 10.1a1 1 0 0 1-1 .9H9.7a1 1 0 0 1-1-.9z"/><path d="M6.5 10a2.5 2.5 0 0 1 2-3.6A3.5 3.5 0 0 1 15 5.6a2.4 2.4 0 0 1 2.5 4.4z"/>',
    latte: '<path d="M5 9h11v6a5 5 0 0 1-5 5h-1a5 5 0 0 1-5-5z"/><path d="M16 11h1.5a2.5 2.5 0 0 1 0 5H16"/><path d="M9 4.5c-.8 1 .8 1.8 0 3M12.5 4.5c-.8 1 .8 1.8 0 3"/>',
    frappe: '<path d="M7.5 10h9l-1.2 10.1a1 1 0 0 1-1 .9H9.7a1 1 0 0 1-1-.9z"/><path d="M6.5 10a5.5 5 0 0 1 11 0z"/><path d="M12 5V2.5"/>',
    pure: '<path d="M5 11h12v3a6 6 0 0 1-12 0z"/><path d="M17 12.5h1.5a2 2 0 0 1 0 4H16"/><path d="M9 11V9h4v2M11 7.5V9"/>',
    box: '<rect x="4.5" y="8" width="15" height="12" rx="1"/><path d="M4.5 8l2-3.5h11l2 3.5M10 12h4"/>',
    merch: '<path d="M5.5 8.5h13l-1 11.5H6.5z"/><path d="M9 8.5V7a3 3 0 0 1 6 0v1.5"/><path d="M12 13c-1.4-1.6-3.4-.4-2.4 1.3L12 17l2.4-2.7c1-1.7-1-2.9-2.4-1.3z"/>',
  };
  const catIcon = (k) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round">${CAT_IC[k]}</svg>`;

  // ---------- ảnh minh hoạ ----------
  function boxArt([light, dark]) {
    return `<svg viewBox="0 0 120 110" class="box-art">
      <ellipse cx="60" cy="102" rx="46" ry="4" fill="#000" opacity=".1"/>
      <path d="M18 34 L60 22 L102 34 L102 94 L60 104 L18 94 Z" fill="${light}"/>
      <path d="M60 46 L102 34 L102 94 L60 104 Z" fill="${dark}"/>
      <path d="M18 34 L60 46 L60 104 L18 94 Z" fill="${light}" stroke="#fff" stroke-opacity=".5"/>
      <path d="M18 34 L60 22 L102 34 L60 46 Z" fill="#fff" opacity=".85"/>
      <g transform="translate(39 72)" opacity=".85">
        <circle r="9" fill="#1F3329"/><path d="M0 -5.5 C3.4 -3.3 4 .8 0 5.5 C-4 .8 -3.4 -3.3 0 -5.5Z" fill="#F4EEE2"/>
      </g>
      <path d="M24 56 L54 64" stroke="#1F3329" stroke-opacity=".35" stroke-width="2" stroke-linecap="round"/>
    </svg>`;
  }
  function merchArt(type) {
    if (type === 'tumbler') return `<svg viewBox="0 0 120 120"><ellipse cx="60" cy="112" rx="26" ry="4" fill="#000" opacity=".1"/>
      <rect x="40" y="14" width="40" height="12" rx="4" fill="#3A4A42"/><path d="M42 26h36l-4 82a4 4 0 0 1-4 4H50a4 4 0 0 1-4-4z" fill="#E9E4DA"/>
      <path d="M46 26h6l-2 86h-4z" fill="#fff" opacity=".6"/><g transform="translate(60 70)"><circle r="9" fill="#1F3329"/><path d="M0 -5.5 C3.4 -3.3 4 .8 0 5.5 C-4 .8 -3.4 -3.3 0 -5.5Z" fill="#F4EEE2"/></g></svg>`;
    if (type === 'tote') return `<svg viewBox="0 0 120 120"><ellipse cx="60" cy="112" rx="38" ry="4" fill="#000" opacity=".1"/>
      <path d="M42 46V32a18 18 0 0 1 36 0v14" fill="none" stroke="#C9BBA0" stroke-width="5"/>
      <path d="M24 44h72l-6 66H30z" fill="#F2EBDD"/><path d="M24 44h72l-1 10H25z" fill="#E4D9C3"/>
      <path d="M60 64c8 6 9 18 0 30-9-12-8-24 0-30z" fill="#2E4A3B"/><path d="M60 68v24" stroke="#F2EBDD" stroke-width="1.4"/></svg>`;
    return `<svg viewBox="0 0 120 120"><ellipse cx="56" cy="110" rx="34" ry="4" fill="#000" opacity=".1"/>
      <path d="M84 50h6a12 12 0 0 1 0 24h-7" fill="none" stroke="#D8CDB8" stroke-width="7"/>
      <path d="M26 36h60v56a14 14 0 0 1-14 14H40a14 14 0 0 1-14-14z" fill="#F7F3EA"/>
      <ellipse cx="56" cy="36" rx="30" ry="5" fill="#E6DCC8"/><path d="M48 62c6 4 7 14 0 22-7-8-6-18 0-22z" fill="#7FA08C"/><path d="M62 66c5 3 6 11 0 18-6-7-5-15 0-18z" fill="#B5C9A8"/></svg>`;
  }
  const cupArt = (cup) => App.art.cup({ ...cup, shadow: false });
  // dùng chung cho C6 (tóm tắt đơn)
  App.menuArt = (it) => (it.kind === 'combo' ? cupArt(it.cups[0]) : artFor(it));
  function artFor(it) {
    if (it.kind === 'box') return boxArt(it.tone);
    if (it.kind === 'merch') return merchArt(it.art);
    return cupArt(it.cup);
  }

  // ---------- markup ----------
  const badge = (b) => b === 'new' ? '<span class="mi-badge new">Mới</span>' : b === 'best' ? '<span class="mi-badge best">Bán chạy</span>' : '';

  function itemHTML(it) {
    if (it.kind === 'combo') {
      return `
      <div class="mi-combo tap" data-item="${it.id}" style="--t1:${it.tone[0]};--t2:${it.tone[1]}">
        <div class="cb-top"><b>${it.name}</b><span>${vnd(it.price)}</span></div>
        <div class="cb-sub">${it.sub}</div>
        <div class="cb-tiles">
          ${it.cups.map((c) => `<span class="cb-tile">${cupArt(c)}</span>`).join('')}
          <span class="cb-tile">${merchArt(it.extra)}</span>
        </div>
        <button class="mi-add" data-add="${it.id}" aria-label="Thêm">${I.plus}<i class="mi-count"></i></button>
      </div>`;
    }
    return `
      <div class="mi tap" data-item="${it.id}">
        <span class="mi-art ${it.kind || 'drink'}">${artFor(it)}</span>
        <div class="mi-info">
          <b class="mi-name">${it.name}</b>
          <span class="mi-desc">${it.tags || it.desc || ''}</span>
          ${badge(it.badge)}
          <span class="mi-price">${vnd(it.price)}</span>
        </div>
        <button class="mi-add" data-add="${it.id}" aria-label="Thêm ${it.name}">${I.plus}<i class="mi-count"></i></button>
      </div>`;
  }

  const el = App.ui.el(`
    <section class="menu">
      <header class="mn-head">
        <span class="mn-deco">${App.icons.logoMark('#1F3329', '#1F3329')}</span>
        <div class="mn-modes">
          <button data-mode="pickup">TỰ ĐẾN LẤY</button>
          <button data-mode="delivery">GIAO HÀNG</button>
          <i class="mn-ul"></i>
        </div>
        <button class="mn-store tap" data-act="store"></button>
      </header>

      <div class="mn-scroll">
        <div class="mn-strip"></div>
        <button class="mn-stamp tap" data-act="stamp"></button>
        <div class="mn-body">
          <nav class="mn-rail">
            <i class="rail-ind"><b></b></i>
            ${M.categories.map((c) => `
              <button data-cat="${c.id}">
                <span class="rc-ic">${catIcon(c.icon)}${c.isNew ? '<em>New</em>' : ''}</span>
                <span class="rc-name">${c.name}</span>
              </button>`).join('')}
          </nav>
          <div class="mn-list">
            <button class="mn-promo tap" data-act="promo">
              <span class="pr-cups">${['#FCE3D3,#F2B38E,#D97E4E', '#FFF4D2,#F7CF63,#E7A42C', '#FBD7D7,#E77C80,#B8333F', '#FFF8D9,#F6E38A,#E2BF3D']
                .map((s) => { const [t, m, b] = s.split(','); return `<span>${cupArt({ top: t, mid: m, bottom: b })}</span>`; }).join('')}</span>
              <span class="pr-copy"><i>${M.promo.badge}</i><b>${M.promo.title}</b><small>${M.promo.sub}</small><u>${M.promo.cta}</u></span>
            </button>
            ${M.categories.map((c) => `
              <section class="mn-sec" data-sec="${c.id}">
                <h4>${c.name}</h4>
                ${M.items.filter((it) => it.cat === c.id).map(itemHTML).join('')}
              </section>`).join('')}
            <p class="mn-end">${M.note}</p>
          </div>
        </div>
      </div>

      <div class="mn-dim"></div>
      <div class="mn-drawer"></div>
      <div class="mn-cartbar">
        <button class="cb-left" data-act="cart">
          <span class="cb-bag">${I.bag}<i class="cb-badge"></i></span>
          <span class="cb-total"></span>
        </button>
        <button class="cb-go" data-act="checkout">KIỂM TRA LẠI</button>
      </div>
    </section>`);

  const $ = (s) => el.querySelector(s);
  const scroller = $('.mn-scroll');
  const rail = $('.mn-rail');
  const secs = [...el.querySelectorAll('.mn-sec')];
  const railBtns = [...rail.querySelectorAll('button')];
  const byId = Object.fromEntries(M.items.map((x) => [x.id, x]));

  // ---------- header: hình thức + cửa hàng ----------
  function store() { return App.data.stores.find((s) => s.id === st().storeId) || App.data.stores[0]; }

  function renderMode(animate) {
    const mode = st().orderMode;
    const s = store();
    el.querySelectorAll('.mn-modes button').forEach((b) => b.classList.toggle('on', b.dataset.mode === mode));
    el.dataset.mode = mode;
    placeUnderline(animate);

    const storeBtn = $('.mn-store');
    const strip = $('.mn-strip');
    if (mode === 'pickup') {
      storeBtn.innerHTML = `
        <span class="ms-line"><span class="ms-heart">${heart}</span><b>${s.name.toUpperCase()}</b><span class="ms-sep"></span><span class="ms-dist">${App.fmt.km(s.distance)}</span><span class="ms-chev">${I.chevron}</span></span>
        <span class="ms-sub">${s.address}</span>`;
      strip.innerHTML = `<span class="sp-bar"></span>Chuẩn bị <b>${Math.max(1, Math.round(s.wait / 3))}</b> ly, thời gian ước tính <b>${s.wait}</b> phút`;
    } else {
      const a = st().isMember ? App.data.member.addresses.find((x) => x.id === st().addressId) : null;
      const addr = a ? `${a.label} · ${a.line}` : null;
      storeBtn.innerHTML = `
        <span class="ms-line"><span class="ms-heart">${I.pin}</span><b class="ms-to">Giao đến: ${addr || 'Chọn địa chỉ giao hàng'}</b><span class="ms-chev">${I.chevron}</span></span>
        <span class="ms-sub">Từ ${s.name} · ${App.fmt.km(a ? a.km : s.distance)}</span>`;
      strip.innerHTML = `<span class="sp-bar"></span>Dự kiến giao <b>25–35</b> phút · Miễn phí giao từ <b>99.000đ</b>`;
    }
    if (animate) {
      [storeBtn, strip].forEach((n) => { n.classList.remove('swap'); void n.offsetWidth; n.classList.add('swap'); });
    }
  }
  const heart = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"><path d="M12 20s-7.5-4.6-7.5-10.2A4.3 4.3 0 0 1 12 7.2a4.3 4.3 0 0 1 7.5 2.6C19.5 15.4 12 20 12 20z"/></svg>';

  function placeUnderline(animate) {
    const on = $('.mn-modes button.on');
    const ul = $('.mn-ul');
    if (!on || !on.offsetWidth) return;
    ul.style.transition = animate ? '' : 'none';
    ul.style.transform = `translateX(${on.offsetLeft}px)`;
    if (!animate) requestAnimationFrame(() => (ul.style.transition = ''));
  }

  el.querySelectorAll('.mn-modes button').forEach((b) => b.addEventListener('click', () => {
    if (b.dataset.mode === st().orderMode) return;
    App.ui.haptic(5);
    App.state.set({ orderMode: b.dataset.mode });
    renderMode(true);
  }));

  // ---------- tem ----------
  function renderStamp() {
    const have = App.memberStamps();
    const pending = cartDrinks();
    const cells = Array.from({ length: 10 }, (_, i) => {
      const cls = i < have ? 'done' : i < have + pending ? 'pending' : '';
      return `<i class="${cls}">${I.cupMini}</i>`;
    }).join('');
    $('.mn-stamp').innerHTML = `
      <span class="st-text">${pending ? `Đơn này được <b>+${Math.min(pending, 10 - have)} tem</b>` : 'Nhận phần thưởng bằng cách thu thập tem'}</span>
      <span class="st-grid">${cells}</span>
      <span class="st-count">${Math.min(10, have + pending)}<small>/10</small></span>`;
  }

  // ---------- rail + scroll-spy ----------
  let active = null;
  let lockSpy = false, lockTimer;

  function setActive(id, scrollRail = true) {
    if (id === active) return;
    active = id;
    railBtns.forEach((b) => b.classList.toggle('on', b.dataset.cat === id));
    const btn = railBtns.find((b) => b.dataset.cat === id);
    const ind = rail.querySelector('.rail-ind');
    ind.style.transform = `translateY(${btn.offsetTop}px)`;
    ind.style.height = `${btn.offsetHeight}px`;
    if (scrollRail) {
      const top = btn.offsetTop - rail.clientHeight / 2 + btn.offsetHeight / 2;
      rail.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
    }
  }

  const bodyTop = () => $('.mn-body').offsetTop;

  function spy() {
    if (lockSpy) return;
    const y = scroller.scrollTop;
    const bottom = y + scroller.clientHeight >= scroller.scrollHeight - 2;
    let cur = secs[0].dataset.sec;
    for (const s of secs) if (s.offsetTop - 60 <= y) cur = s.dataset.sec;
    if (bottom) cur = secs[secs.length - 1].dataset.sec;
    setActive(cur);
  }

  let ticking = false;
  scroller.addEventListener('scroll', () => {
    if (lockSpy) { clearTimeout(lockTimer); lockTimer = setTimeout(() => (lockSpy = false), 140); }
    if (!ticking) { ticking = true; requestAnimationFrame(() => { ticking = false; spy(); }); }
  }, { passive: true });

  railBtns.forEach((b) => b.addEventListener('click', () => {
    App.ui.haptic(4);
    const sec = secs.find((s) => s.dataset.sec === b.dataset.cat);
    setActive(b.dataset.cat);
    lockSpy = true;
    clearTimeout(lockTimer);
    lockTimer = setTimeout(() => (lockSpy = false), 900);
    // đưa tiêu đề nhóm lên sát mép trên (rail đã sticky)
    scroller.scrollTo({ top: Math.max(sec.offsetTop, bodyTop()), behavior: 'smooth' });
  }));

  function measure() {
    const h = scroller.clientHeight - (el.classList.contains('has-cart') ? 0 : 0);
    rail.style.height = `${h}px`;
    // khoảng trống cuối để nhóm cuối vẫn kéo được lên đầu
    secs[secs.length - 1].style.minHeight = `${Math.max(0, h - 80)}px`;
  }

  // ---------- giỏ hàng ----------
  const cart = () => st().cart || [];
  const cartCount = () => cart().reduce((n, l) => n + l.qty, 0);
  const unitOf = (l) => l.unit ?? (byId[l.id]?.price || 0);
  const cartTotal = () => cart().reduce((n, l) => n + l.qty * unitOf(l), 0);
  function cartDrinks() {
    return cart().reduce((n, l) => {
      const it = byId[l.id];
      if (!it) return n;
      if (it.kind === 'combo') return n + l.qty * it.cups.length;
      return it.kind ? n : n + l.qty;
    }, 0);
  }
  function setCart(lines) { App.state.set({ cart: lines.filter((l) => l.qty > 0) }); }

  // thêm 1 dòng từ trang chi tiết; cùng món + cùng tuỳ chọn thì cộng dồn
  function addLine(line) {
    const lines = cart().map((l) => ({ ...l }));
    const same = lines.find((l) => (l.key || l.id) === line.key);
    if (same) same.qty += line.qty; else lines.push(line);
    setCart(lines);
  }

  function renderCart(bump) {
    const n = cartCount();
    const had = el.classList.contains('has-cart');
    el.classList.toggle('has-cart', n > 0);
    $('.cb-badge').textContent = n;
    $('.cb-total').textContent = vnd(cartTotal());
    if (bump) { const b = $('.cb-bag'); b.classList.remove('bump'); void b.offsetWidth; b.classList.add('bump'); }
    // số lượng trên nút +
    el.querySelectorAll('[data-add]').forEach((btn) => {
      const q = cart().filter((l) => l.id === btn.dataset.add).reduce((s, l) => s + l.qty, 0);
      const c = btn.querySelector('.mi-count');
      c.textContent = q || '';
      btn.classList.toggle('has', q > 0);
    });
    renderStamp();
    if (had !== n > 0) requestAnimationFrame(measure);
    if (drawerOpen) { if (n === 0) closeDrawer(); else renderDrawer(); }
  }

  // bay ảnh món vào giỏ
  function fly(fromEl) {
    const scale = el.getBoundingClientRect().width / el.offsetWidth || 1;
    const base = el.getBoundingClientRect();
    const a = fromEl.getBoundingClientRect();
    const bag = $('.cb-bag').getBoundingClientRect();
    const x0 = (a.left - base.left) / scale, y0 = (a.top - base.top) / scale;
    const w = a.width / scale, h = a.height / scale;
    // nếu thanh giỏ chưa hiện, đích là vị trí sẽ hiện
    const tx = (bag.left - base.left) / scale + 4;
    const ty = el.classList.contains('has-cart') ? (bag.top - base.top) / scale : el.offsetHeight - 52;
    const ghost = App.ui.el(`<div class="mn-fly" style="left:${x0}px;top:${y0}px;width:${w}px;height:${h}px">${fromEl.innerHTML}</div>`);
    el.appendChild(ghost);
    const dx = tx - x0 - w / 2 + 16, dy = ty - y0 - h / 2 + 16;
    ghost.animate([
      { transform: 'translate(0,0) scale(1)', opacity: 1 },
      { transform: `translate(${dx * 0.45}px, ${dy * 0.2 - 70}px) scale(.7)`, opacity: 1, offset: 0.45 },
      { transform: `translate(${dx}px, ${dy}px) scale(.22)`, opacity: 0.6 },
    ], { duration: 620, easing: 'cubic-bezier(.45,0,.55,1)' }).onfinish = () => ghost.remove();
    return 560;
  }

  function openDetail(row) {
    const it = byId[row.dataset.item];
    const art = it.kind === 'combo' ? cupArt(it.cups[0]) : artFor(it);
    App.screens.productDetail(it, {
      art,
      onAdd(line) {
        const src = row.querySelector('.mi-art, .cb-tile');
        const firstTime = !cartCount();
        if (firstTime) { addLine(line); fly(src); renderCart(true); return; }
        const wait = fly(src);
        setTimeout(() => { addLine(line); renderCart(true); }, wait);
      },
      onOrder(line) {
        addLine(line); renderCart(true);
        setTimeout(() => App.nav.push(App.screens.checkout()), 250);
      },
    });
  }

  // ngăn kéo giỏ hàng
  let drawerOpen = false;
  function renderDrawer() {
    $('.mn-drawer').innerHTML = `
      <div class="dr-head">
        <span class="dr-title">${App.icons.check}<b>${cartCount()} sản phẩm</b></span>
        <button class="dr-clear" data-act="clear">Xoá tất cả
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><path d="M5 7h14M10 7V5h4v2M7 7l1 13h8l1-13"/></svg></button>
      </div>
      <div class="dr-list">
        ${cart().map((l, i) => { const it = byId[l.id]; return `
          <div class="dr-line">
            <span class="dr-art ${it.kind || 'drink'}">${it.kind === 'combo' ? cupArt(it.cups[0]) : artFor(it)}</span>
            <div class="dr-info"><b>${it.name}</b><small>${l.opts || (it.kind === 'combo' ? it.sub : it.desc)}</small><span>${vnd(unitOf(l) * l.qty)}</span></div>
            <div class="stepper"><button data-dec="${i}">−</button><em>${l.qty}</em><button data-inc="${i}">+</button></div>
          </div>`; }).join('')}
      </div>`;
  }
  function openDrawer() {
    if (!cartCount()) return;
    drawerOpen = true; renderDrawer();
    el.classList.add('drawer-open');
  }
  function closeDrawer() { drawerOpen = false; el.classList.remove('drawer-open'); }

  $('.mn-drawer').addEventListener('click', (e) => {
    const inc = e.target.closest('[data-inc]'), dec = e.target.closest('[data-dec]');
    const lines = cart().map((l) => ({ ...l }));
    if (inc) { App.ui.haptic(4); lines[+inc.dataset.inc].qty += 1; setCart(lines); }
    else if (dec) { App.ui.haptic(4); lines[+dec.dataset.dec].qty -= 1; setCart(lines); }
    else if (e.target.closest('[data-act="clear"]')) {
      App.ui.iosAlert({
        title: 'Xoá tất cả sản phẩm?',
        message: 'Giỏ hàng sẽ được làm trống.',
        buttons: [{ label: 'Huỷ', value: false }, { label: 'Xoá', value: true, bold: true }],
      }).then((ok) => ok && setCart([]));
    }
  });
  $('.mn-dim').addEventListener('click', closeDrawer);

  // ---------- click chung ----------
  el.addEventListener('click', (e) => {
    // nút + hoặc chạm vào món → trang chi tiết (C5)
    const row = e.target.closest('[data-item]');
    if (row) {
      e.stopPropagation();
      App.ui.haptic(6);
      const plus = row.querySelector('[data-add]');
      plus.classList.remove('pop'); void plus.offsetWidth; plus.classList.add('pop');
      return openDetail(row);
    }
    const act = e.target.closest('[data-act]')?.dataset.act;
    switch (act) {
      case 'store': App.ui.haptic(5); return App.nav.push(st().orderMode === 'pickup' ? App.screens.storePicker() : App.screens.addressPicker());
      case 'stamp': App.ui.haptic(5); return App.nav.push(App.screens.stamps());
      case 'promo': return railBtns.find((b) => b.dataset.cat === 'fruit').click();
      case 'cart': return drawerOpen ? closeDrawer() : openDrawer();
      case 'checkout': closeDrawer(); App.ui.haptic(8); return App.nav.push(App.screens.checkout());
    }
  });

  // đồng bộ khi state đổi (thêm món, bảng POC đổi hội viên / làm trống giỏ)
  let lastMember = st().isMember;
  App.state.subscribe((d) => {
    if (d.isMember !== lastMember) { lastMember = d.isMember; renderMode(false); }
    renderCart();
  });

  // ---------- vòng đời ----------
  let first = true;
  function show() {
    renderMode(false);
    renderCart();
    requestAnimationFrame(() => {
      measure();
      placeUnderline(false);
      if (first) { first = false; active = null; setActive(secs[0].dataset.sec, false); }
    });
  }

  return { el, show, hide: closeDrawer };
};
