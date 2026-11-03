// Quick action ở Trang chủ: Giới thiệu bạn bè · Tính calo
(() => {
  const st = () => App.state.get();
  const I = App.icons.ic;
  const back = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 5l-7 7 7 7"/></svg>';
  const header = (t) => `<header class="ly-nav"><button class="ly-back" data-act="back" aria-label="Quay lại">${back}</button><h1>${t}</h1><span></span></header>`;

  // ---------- Giới thiệu bạn bè ----------
  App.screens.refer = () => {
    const p = App.auth.profile();
    const code = `MT${String(p.phone || '260000').slice(-6)}`;
    const isNew = !!(st().profile && st().profile.isNew);
    const friends = isNew ? [] : [['Thu Hà', 'Đã đặt đơn đầu tiên', true], ['Quốc Bảo', 'Đã đăng ký · chờ đơn đầu tiên', false]];
    const el = App.ui.el(`
      <section class="ly rf">
        ${header('Giới thiệu bạn bè')}
        <div class="ly-scroll">
          <div class="rf-hero">
            <span class="rf-ic">${I.friends}</span>
            <h2>Mời bạn uống trà,<br/>cả hai cùng có quà</h2>
            <p>Bạn nhận voucher <b>30.000đ</b> · Bạn bè nhận voucher <b>Giảm 50%</b> cho đơn đầu tiên</p>
          </div>
          <div class="rf-code">
            <small>MÃ GIỚI THIỆU CỦA BẠN</small>
            <b>${code}</b>
            <div class="rf-btns"><button data-act="copy">Sao chép mã</button><button class="dark" data-act="share">Chia sẻ</button></div>
          </div>
          <div class="rf-card">
            <h3>Cách nhận quà</h3>
            <ol>
              <li>Gửi mã giới thiệu cho bạn bè</li>
              <li>Bạn bè nhập mã khi đăng ký Mộc Trà</li>
              <li>Khi bạn bè hoàn tất đơn đầu tiên, cả hai nhận voucher trong Kho quà</li>
            </ol>
          </div>
          <div class="rf-card">
            <h3>Bạn bè đã mời (${friends.length})</h3>
            ${friends.length ? friends.map(([n, s, ok]) => `<div class="rf-f"><span>${n[0]}</span><div><b>${n}</b><small>${s}</small></div><em class="${ok ? 'ok' : ''}">${ok ? '+30.000đ' : 'Đang chờ'}</em></div>`).join('') : '<p class="rf-none">Chưa có bạn bè nào dùng mã của bạn.</p>'}
          </div>
        </div>
      </section>`);
    el.addEventListener('click', async (e) => {
      const act = e.target.closest('[data-act]')?.dataset.act;
      if (act === 'back') return App.nav.pop();
      if (act === 'share') return App.ui.toast('Mở bảng chia sẻ iOS (mô phỏng)');
      if (act === 'copy') {
        try { await navigator.clipboard.writeText(code); } catch { /* POC: trình duyệt có thể chặn clipboard */ }
        App.ui.haptic(5);
        App.ui.toast(`Đã sao chép mã ${code}`);
      }
    });
    return { el, statusBar: 'dark' };
  };

  // ---------- Tính calo (số liệu ước tính cho POC) ----------
  const BASE = { fruit: 110, milk: 190, matcha: 180, cloud: 240, latte: 200, frappe: 300, pure: 15 }; // không tính đường
  const SUGAR = 90; // kcal đường ở mức 100%, size Vừa
  const TOPPING = { pearl: 110, jelly: 40, cream: 120, chia: 45, aloe: 25 };
  const DAILY = 2000;

  App.screens.calories = () => {
    const drinks = App.data.menu.items.filter((x) => !x.kind);
    const G = Object.fromEntries(App.data.menuOptions.drink.map((g) => [g.id, g]));
    const sel = { id: drinks[0].id, size: 'M', sugar: '100', topping: [] };
    const el = App.ui.el(`
      <section class="ly cal">
        ${header('Tính calo')}
        <div class="ly-scroll">
          <div class="cal-res"></div>
          <div class="cal-sec"><h3>Chọn đồ uống</h3><div class="cal-rail">${drinks.map((d) => `<button data-d="${d.id}"><span>${App.art.cup({ ...d.cup, shadow: false })}</span><small>${d.name}</small></button>`).join('')}</div></div>
          <div class="cal-sec"><h3>Size</h3><div class="cal-chips">${G.size.choices.map((c) => `<button data-g="size" data-c="${c.id}">${c.label} · ${c.note}</button>`).join('')}</div></div>
          <div class="cal-sec"><h3>Độ ngọt</h3><div class="cal-chips">${G.sugar.choices.map((c) => `<button data-g="sugar" data-c="${c.id}">${c.label}</button>`).join('')}</div></div>
          <div class="cal-sec"><h3>Topping</h3><div class="cal-chips">${G.topping.choices.map((c) => `<button data-g="topping" data-c="${c.id}">${c.label} · ${TOPPING[c.id]} kcal</button>`).join('')}</div></div>
          <p class="cal-note">Số liệu chỉ mang tính ước tính, có thể thay đổi theo nguyên liệu và cách pha.</p>
        </div>
        <div class="rd-foot"><button class="rd-go" data-act="order">XEM MENU ĐẶT MÓN</button></div>
      </section>`);
    const res = el.querySelector('.cal-res');

    function render() {
      const d = drinks.find((x) => x.id === sel.id);
      const k = sel.size === 'L' ? 1.3 : 1;
      const drink = Math.round((BASE[d.cat] ?? 150) * k);
      const sugar = d.cat === 'pure' && sel.sugar === '0' ? 0 : Math.round(SUGAR * k * (+sel.sugar / 100));
      const top = sel.topping.reduce((n, id) => n + TOPPING[id], 0);
      const total = drink + sugar + top;
      const pct = Math.round((total / DAILY) * 100);
      const C = 2 * Math.PI * 52;
      res.innerHTML = `
        <div class="cal-ring">
          <svg viewBox="0 0 120 120"><circle cx="60" cy="60" r="52" class="bg"/><circle cx="60" cy="60" r="52" class="fg" stroke-dasharray="${C}" stroke-dashoffset="${C * (1 - Math.min(pct, 100) / 100)}"/></svg>
          <div><b>${total}</b><small>kcal</small></div>
        </div>
        <div class="cal-info">
          <h2>${d.name}</h2>
          <p>Khoảng ${pct}% nhu cầu ${DAILY.toLocaleString('vi-VN')} kcal/ngày</p>
          <ul><li><span>Đồ uống</span><b>${drink}</b></li><li><span>Đường</span><b>${sugar}</b></li><li><span>Topping</span><b>${top}</b></li></ul>
        </div>`;
      el.querySelectorAll('[data-d]').forEach((b) => b.classList.toggle('on', b.dataset.d === sel.id));
      el.querySelectorAll('[data-g]').forEach((b) => {
        const v = sel[b.dataset.g];
        b.classList.toggle('on', Array.isArray(v) ? v.includes(b.dataset.c) : v === b.dataset.c);
      });
    }
    el.addEventListener('click', async (e) => {
      const act = e.target.closest('[data-act]')?.dataset.act;
      if (act === 'back') return App.nav.pop();
      if (act === 'order') { await App.nav.popToRoot(); return App.goTab && App.goTab('order'); }
      const dr = e.target.closest('[data-d]');
      if (dr) { App.ui.haptic(4); sel.id = dr.dataset.d; return render(); }
      const c = e.target.closest('[data-g]');
      if (!c) return;
      App.ui.haptic(4);
      const g = c.dataset.g;
      if (g === 'topping') {
        const i = sel.topping.indexOf(c.dataset.c);
        if (i >= 0) sel.topping.splice(i, 1);
        else if (sel.topping.length >= G.topping.max) return App.ui.toast(`Chọn tối đa ${G.topping.max} topping`);
        else sel.topping.push(c.dataset.c);
      } else sel[g] = c.dataset.c;
      render();
    });
    if (App.ui.dragScroll) App.ui.dragScroll(el.querySelector('.cal-rail'));
    render();
    return { el, statusBar: 'dark' };
  };
})();
