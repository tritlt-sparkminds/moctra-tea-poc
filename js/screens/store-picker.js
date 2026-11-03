// C3 · Chọn cửa hàng (Tự đến lấy) / Chọn địa chỉ giao (Giao hàng)
// Mở từ dòng cửa hàng ở Menu. Chọn xong → pop về Menu, Menu cập nhật theo state.
(() => {
  const I = App.icons.ic;
  const st = () => App.state.get();
  const km = (n) => App.fmt.km(n);
  const back = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 5l-7 7 7 7"/></svg>';
  const heart = '<svg viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"><path d="M12 20s-7.5-4.6-7.5-10.2A4.3 4.3 0 0 1 12 7.2a4.3 4.3 0 0 1 7.5 2.6C19.5 15.4 12 20 12 20z"/></svg>';
  const search = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="6.5"/><path d="M16 16l4 4"/></svg>';
  const locate = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="12" cy="12" r="6.5"/><circle cx="12" cy="12" r="2.2" fill="currentColor"/><path d="M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3"/></svg>';
  const edit = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M4 20h4L19 9l-4-4L4 16z"/><path d="M13.5 6.5l4 4"/></svg>';
  const fold = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'd').toLowerCase();

  function header(title) {
    return `<header class="sp-nav"><button class="sp-back" data-act="back" aria-label="Quay lại">${back}</button><h1>${title}</h1><span></span></header>`;
  }

  // xác nhận khi đổi cửa hàng mà giỏ đang có món
  async function confirmSwitch(nextStoreId) {
    const hasCart = (st().cart || []).length > 0;
    if (!hasCart || nextStoreId === st().storeId) return true;
    return App.ui.iosAlert({
      title: 'Đổi cửa hàng?',
      message: 'Giỏ hàng vẫn được giữ. Giá và tình trạng món sẽ cập nhật theo cửa hàng mới.',
      buttons: [{ label: 'Huỷ', value: false }, { label: 'Đổi', value: true, bold: true }],
    });
  }

  // ======================================================
  // Tự đến lấy · chọn cửa hàng
  // ======================================================
  App.screens.storePicker = () => {
    const locOK = st().permissions.location === 'granted';
    let tab = 'near';
    let q = '';
    let focus = st().storeId;

    const statusChip = (s) => s.status === 'open' ? '<span class="sc open">Đang mở</span>'
      : s.status === 'closingSoon' ? `<span class="sc soon">Đóng cửa sau ${s.closesIn} phút</span>`
      : `<span class="sc closed">Đã đóng · mở lại ${s.opensAt}</span>`;

    const el = App.ui.el(`
      <section class="sp">
        ${header('Chọn cửa hàng')}
        <div class="sp-search">${search}<input type="search" placeholder="Tìm theo tên quán, đường, quận…" /><button class="sp-clear" data-act="clear">✕</button></div>
        <div class="sp-map">
          <svg class="map-bg" viewBox="0 0 440 240" preserveAspectRatio="xMidYMid slice">
            <rect width="440" height="240" fill="#EFEBE2"/>
            <path d="M300 -10 C 330 60, 280 110, 330 160 S 420 230, 460 250 L 460 -10 Z" fill="#D7E5E8"/>
            <path d="M300 -10 C 330 60, 280 110, 330 160 S 420 230, 460 250" fill="none" stroke="#C3D8DC" stroke-width="3"/>
            <ellipse cx="150" cy="150" rx="36" ry="20" fill="#DCE7D2"/>
            <ellipse cx="236" cy="70" rx="24" ry="16" fill="#DCE7D2"/>
            <g stroke="#fff" stroke-linecap="round" fill="none">
              <path d="M-10 60 L 460 120" stroke-width="9"/><path d="M60 -10 L 220 250" stroke-width="9"/>
              <path d="M-10 190 C 120 170, 220 200, 460 170" stroke-width="7"/><path d="M200 -10 L 300 250" stroke-width="6"/>
              <path d="M-10 120 L 200 110" stroke-width="4"/><path d="M120 -10 L 110 250" stroke-width="4"/>
              <path d="M250 -10 L 380 250" stroke-width="4"/><path d="M-10 230 L 460 220" stroke-width="4"/>
            </g>
            <g fill="#BDB6A8" font-size="9" font-family="Be Vietnam Pro, sans-serif" letter-spacing="1">
              <text x="40" y="100">TÂN BÌNH</text><text x="140" y="46">QUẬN 3</text><text x="230" y="150">QUẬN 1</text><text x="350" y="60">THỦ ĐỨC</text><text x="250" y="232">QUẬN 7</text>
            </g>
          </svg>
          ${locOK ? '<span class="me" style="left:50%;top:66%"><i></i></span>' : ''}
          ${App.data.stores.map((s) => `<button class="pin ${s.status}" data-pin="${s.id}" style="left:${s.x}%;top:${s.y}%"><span>${App.icons.logoMark('#F4EEE2', '#F4EEE2')}</span></button>`).join('')}
          <button class="map-locate" data-act="locate" aria-label="Vị trí của tôi">${locate}</button>
        </div>
        <div class="sp-sheet">
          <div class="sp-tabs"><button data-tab="near" class="on">${locOK ? 'Gần bạn' : 'Tất cả cửa hàng'}</button><button data-tab="fav">Yêu thích</button><i class="sp-tab-ul"></i></div>
          ${locOK ? '' : `<button class="sp-locbanner" data-act="perm">${I.pin}<span><b>Bật vị trí để tìm quán gần bạn</b><small>Mộc Trà chỉ dùng vị trí khi bạn mở app</small></span>${I.chevron}</button>`}
          <div class="sp-list"></div>
        </div>
      </section>`);

    const $ = (s) => el.querySelector(s);
    const list = $('.sp-list');

    function stores() {
      let arr = App.data.stores.slice();
      if (tab === 'fav') arr = arr.filter((s) => (st().favStores || []).includes(s.id));
      if (q) arr = arr.filter((s) => fold(s.name + ' ' + s.address).includes(fold(q)));
      // quán đóng cửa xuống cuối; có vị trí thì sắp theo khoảng cách, không thì theo tên
      return arr.sort((a, b) => (a.status === 'closed') - (b.status === 'closed') || (locOK ? a.distance - b.distance : a.name.localeCompare(b.name, 'vi')));
    }

    function render() {
      const arr = stores();
      const fav = st().favStores || [];
      list.innerHTML = arr.length ? arr.map((s) => `
        <div class="sc-card ${s.id === focus ? 'focus' : ''} ${s.status === 'closed' ? 'off' : ''}" data-store="${s.id}">
          <div class="sc-top">
            <b>${s.name}</b>
            <button class="sc-fav ${fav.includes(s.id) ? 'on' : ''}" data-fav="${s.id}" aria-label="Yêu thích">${heart}</button>
          </div>
          <p class="sc-addr">${s.address}</p>
          <div class="sc-meta">
            ${statusChip(s)}
            <span>${s.hours}</span>
            ${s.status !== 'closed' ? `<span>Chờ khoảng ${s.wait} phút</span>` : ''}
          </div>
          <div class="sc-foot">
            <span class="sc-dist">${locOK ? `${I.pin}${km(s.distance)}` : ''}</span>
            ${s.id === st().storeId
              ? `<span class="sc-cur">${App.icons.check} Đang chọn</span>`
              : `<button class="sc-pick" data-pick="${s.id}" ${s.status === 'closed' ? 'disabled' : ''}>${s.status === 'closed' ? 'TẠM ĐÓNG' : 'CHỌN'}</button>`}
          </div>
        </div>`).join('')
        : `<div class="sp-empty">${tab === 'fav' && !q ? 'Chưa có cửa hàng yêu thích.<br/>Chạm ♡ trên thẻ cửa hàng để lưu lại.' : `Không tìm thấy cửa hàng khớp “${q}”.`}</div>`;
      el.querySelectorAll('.pin').forEach((p) => {
        p.classList.toggle('on', p.dataset.pin === focus);
        p.classList.toggle('dim', !arr.some((s) => s.id === p.dataset.pin));
      });
    }

    function focusStore(id, scroll) {
      focus = id;
      render();
      if (scroll) {
        const card = list.querySelector(`[data-store="${id}"]`);
        if (card) list.scrollTo({ top: card.offsetTop - 8, behavior: 'smooth' });
      }
    }

    async function pick(id) {
      if (!(await confirmSwitch(id))) return;
      App.ui.haptic(10);
      App.state.set({ storeId: id, orderMode: 'pickup' });
      render();
      const s = App.data.stores.find((x) => x.id === id);
      setTimeout(() => { App.nav.pop(); App.ui.toast(`Đã chọn ${s.name}`); }, 260);
    }

    function setTab(t) {
      tab = t;
      el.querySelectorAll('.sp-tabs button').forEach((b) => b.classList.toggle('on', b.dataset.tab === t));
      const on = $('.sp-tabs button.on');
      $('.sp-tab-ul').style.transform = `translateX(${on.offsetLeft}px)`;
      $('.sp-tab-ul').style.width = `${on.offsetWidth}px`;
      render();
    }

    el.addEventListener('click', (e) => {
      const t = e.target;
      if (t.closest('[data-act="back"]')) return App.nav.pop();
      const tb = t.closest('[data-tab]'); if (tb) return setTab(tb.dataset.tab);
      const fav = t.closest('[data-fav]');
      if (fav) {
        App.ui.haptic(5);
        const list0 = st().favStores || [];
        const id = fav.dataset.fav;
        App.state.set({ favStores: list0.includes(id) ? list0.filter((x) => x !== id) : [...list0, id] });
        render();
        const b = list.querySelector(`[data-fav="${id}"]`); b && b.classList.add('pop');
        return;
      }
      const pk = t.closest('[data-pick]'); if (pk) return pick(pk.dataset.pick);
      const pin = t.closest('[data-pin]'); if (pin) { App.ui.haptic(4); return focusStore(pin.dataset.pin, true); }
      const card = t.closest('[data-store]'); if (card) return focusStore(card.dataset.store, false);
      const act = t.closest('[data-act]')?.dataset.act;
      if (act === 'clear') { $('.sp-search input').value = ''; q = ''; el.classList.remove('has-q'); return render(); }
      if (act === 'locate') {
        if (!locOK) return App.ui.toast('Cần bật quyền vị trí trong Cài đặt');
        const me = $('.me'); me.classList.remove('ping'); void me.offsetWidth; me.classList.add('ping');
        return focusStore([...App.data.stores].filter((s) => s.status !== 'closed').sort((a, b) => a.distance - b.distance)[0].id, true);
      }
      if (act === 'perm') return App.ui.toast('Mở Cài đặt › Mộc Trà › Vị trí (mô phỏng)');
    });

    $('.sp-search input').addEventListener('input', (e) => {
      q = e.target.value.trim();
      el.classList.toggle('has-q', !!q);
      render();
    });

    render();
    return {
      el,
      statusBar: 'dark',
      onEnter() { requestAnimationFrame(() => setTab('near')); setTimeout(() => focusStore(focus, true), 520); },
    };
  };

  // ======================================================
  // Giao hàng · chọn địa chỉ giao
  // ======================================================
  App.screens.addressPicker = () => {
    const R = App.data.deliveryRadiusKm;
    const storeOf = (id) => App.data.stores.find((s) => s.id === id);

    const el = App.ui.el(`
      <section class="sp ap">
        ${header('Chọn địa chỉ giao hàng')}
        <div class="ap-body"></div>
        <div class="ap-foot"><button class="ap-add" data-act="add">THÊM ĐỊA CHỈ</button></div>
      </section>`);
    const body = el.querySelector('.ap-body');

    function render() {
      if (!st().isMember) {
        body.innerHTML = `
          <div class="ap-empty">
            <span class="ap-ill">${I.pin}</span>
            <b>Chưa có địa chỉ đã lưu</b>
            <p>Đăng nhập để lưu sổ địa chỉ và đặt giao nhanh hơn cho lần sau.</p>
            <button class="ap-login" data-act="login">Đăng nhập</button>
          </div>`;
        return;
      }
      const cur = st().addressId;
      body.innerHTML = `
        <p class="ap-hint">Mộc Trà giao trong bán kính ${R} km quanh cửa hàng gần nhất.</p>
        ${App.data.member.addresses.map((a) => {
          const nn = App.addressBook && a.x != null ? App.addressBook.nearest(a.x, a.y) : { store: storeOf(a.storeId), km: a.km };
          const s = nn.store; a.km = nn.km; a.storeId = s.id;
          const out = a.km > R;
          return `
          <div class="ap-card ${a.id === cur ? 'on' : ''} ${out ? 'off' : ''}" data-addr="${a.id}">
            <i class="radio"></i>
            <div class="ap-info">
              <div class="ap-l1"><span class="ap-tag">${a.label}</span>${App.addressBook && App.addressBook.defId() === a.id ? '<span class="ab-def">Mặc định</span>' : ''}<b>${a.line}</b></div>
              <p>${a.detail}</p>
              <small>${a.receiver} · ${a.phone}</small>
              <span class="ap-from ${out ? 'out' : ''}">${out ? `Ngoài vùng giao · cách cửa hàng gần nhất ${km(a.km)}` : `Giao từ ${s.name} · ${km(a.km)}`}</span>
            </div>
            <button class="ap-edit" data-edit="${a.id}" aria-label="Sửa">${edit}</button>
          </div>`;
        }).join('')}`;
    }

    async function choose(id) {
      const a = App.data.member.addresses.find((x) => x.id === id);
      if (a.km > R) {
        App.ui.haptic(20);
        return App.ui.iosAlert({
          title: 'Địa chỉ ngoài vùng giao',
          message: `Địa chỉ này cách cửa hàng gần nhất ${km(a.km)}, vượt bán kính giao ${R} km. Bạn có thể chọn Tự đến lấy.`,
          buttons: [{ label: 'Đóng', value: false }, { label: 'Tự đến lấy', value: true, bold: true }],
        }).then((ok) => {
          if (!ok) return;
          App.state.set({ orderMode: 'pickup' });
          App.nav.pop();
        });
      }
      if (!(await confirmSwitch(a.storeId))) return;
      App.ui.haptic(10);
      App.state.set({ addressId: id, storeId: a.storeId, orderMode: 'delivery' });
      render();
      setTimeout(() => { App.nav.pop(); App.ui.toast(`Giao đến ${a.label} · từ ${storeOf(a.storeId).name}`); }, 260);
    }

    el.addEventListener('click', (e) => {
      const t = e.target;
      if (t.closest('[data-act="back"]')) return App.nav.pop();
      if (t.closest('[data-edit]')) return App.nav.push(App.screens.addressEdit(t.closest('[data-edit]').dataset.edit));
      const card = t.closest('[data-addr]'); if (card) return choose(card.dataset.addr);
      const act = t.closest('[data-act]')?.dataset.act;
      if (act === 'add') return App.nav.push(App.screens.addressEdit());
      if (act === 'login') return App.auth.require(render, 'Đăng nhập để dùng sổ địa chỉ');
    });

    render();
    return { el, statusBar: 'dark', onResume: render };
  };
})();
