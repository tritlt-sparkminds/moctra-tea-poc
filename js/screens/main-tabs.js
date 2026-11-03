// Khung tab dưới: Trang chủ · Đặt món · Đơn hàng · Tài khoản
// Trang chủ (C2) và Đặt món (C4) đã dựng; các tab còn lại là placeholder (C9, C13).
App.screens.mainTabs = () => {
  const tabs = [
    { key: 'home', label: 'Trang chủ' },
    { key: 'order', label: 'Đặt món', center: true },
    { key: 'orders', label: 'Đơn hàng' },
    { key: 'account', label: 'Tôi' },
  ];

  const el = App.ui.el(`
    <section class="tabs-root">
      ${tabs.map((t, i) => `
        <div class="tab-page ${i === 0 ? 'on' : ''}" data-page="${t.key}">
          ${t.code ? `
          <div class="placeholder">
            <span class="chip">${t.code} · Chức năng tiếp theo</span>
            <h3>${t.title}</h3>
            <p class="ph-text">Màn này sẽ được dựng ở các bước sau.</p>
          </div>` : ''}
        </div>`).join('')}
      <nav class="tab-bar" style="grid-template-columns:repeat(${tabs.length},1fr)">
        ${tabs.map((t, i) => t.center
          ? `<button class="center" data-tab="${t.key}" aria-label="${t.label}"><span class="center-cup">${App.art.product('p1', { shadow: false })}</span></button>`
          : `<button class="${i === 0 ? 'on' : ''}" data-tab="${t.key}">${App.icons.tab[t.key]}<span>${t.label}</span></button>`).join('')}
      </nav>
    </section>`);

  let current = 'home';
  const home = App.screens.home({ goTab: (k) => select(k) });
  const homePage = el.querySelector('[data-page="home"]');
  homePage.classList.add('no-scroll');
  homePage.appendChild(home.el);

  // C9 · Lịch sử đặt hàng
  const ordersTab = App.screens.orders({ goTab: (k) => select(k) });
  const ordersPage = el.querySelector('[data-page="orders"]');
  ordersPage.classList.add('no-scroll');
  ordersPage.appendChild(ordersTab.el);

  // C13 · Tài khoản
  const accountTab = App.screens.account();
  const accountPage = el.querySelector('[data-page="account"]');
  accountPage.classList.add('no-scroll');
  accountPage.appendChild(accountTab.el);

  // C4 · Menu đặt món
  const menu = App.screens.menu({ goTab: (k) => select(k) });
  const orderPage = el.querySelector('[data-page="order"]');
  orderPage.innerHTML = '';
  orderPage.classList.add('no-scroll');
  orderPage.appendChild(menu.el);

  function select(key) {
    if (key === current) return;
    if (current === 'home') home.hide();
    if (current === 'order') menu.hide();
    current = key;
    el.querySelectorAll('.tab-bar button').forEach((x) => x.classList.toggle('on', x.dataset.tab === key));
    el.querySelectorAll('.tab-page').forEach((p) => p.classList.toggle('on', p.dataset.page === key));
    if (key === 'home') home.show();
    else App.device.setTheme('dark');
    if (key === 'order') menu.show();
    if (key === 'orders') ordersTab.show();
    if (key === 'account') accountTab.show();
  }

  App.goTab = (k) => select(k); // dùng từ màn con (VD: C7 → Tiếp tục đặt món)

  el.querySelectorAll('.tab-bar button').forEach((b) =>
    b.addEventListener('click', () => { App.ui.haptic(5); select(b.dataset.tab); })
  );

  return {
    el,
    get statusBar() { return current === 'home' ? home.theme() : 'dark'; },
    onEnter() { if (current === 'home') home.show(); },
    onLeave() { home.hide(); },
    // quay lại từ màn con (VD: C3 chọn cửa hàng) → cập nhật Menu
    onResume() { if (current === 'order') menu.show(); else if (current === 'orders') ordersTab.show(); else if (current === 'account') accountTab.show(); else if (current === 'home') home.show(); },
  };
};
