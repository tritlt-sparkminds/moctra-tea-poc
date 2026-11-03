// C5 · Chi tiết món
// Ảnh lớn + tên + mô tả, chọn Size / Mức đá / Độ ngọt (chọn 1) và Topping (chọn nhiều),
// số lượng, "Thêm vào giỏ" và "Đặt hàng". Mở dạng full-screen card trượt từ dưới lên.
App.screens.productDetail = (it, { art, onAdd, onOrder } = {}) => {
  const vnd = App.fmt.vnd;
  const isDrink = !it.kind;
  const groups = isDrink ? App.data.menuOptions.drink : [];
  const overlay = document.getElementById('overlay');

  // lựa chọn hiện tại
  const sel = {};
  groups.forEach((g) => {
    sel[g.id] = g.type === 'single' ? (g.choices.find((c) => c.default) || g.choices[0]).id : [];
  });
  let qty = 1;

  const choice = (g, id) => g.choices.find((c) => c.id === id);
  function unitPrice() {
    let p = it.price;
    groups.forEach((g) => {
      const ids = g.type === 'single' ? [sel[g.id]] : sel[g.id];
      ids.forEach((id) => (p += choice(g, id)?.delta || 0));
    });
    return p;
  }
  function summary() {
    if (!isDrink) return '';
    const G = Object.fromEntries(groups.map((g) => [g.id, g]));
    const ice = sel.ice === 'normal' ? 'Đá bình thường' : choice(G.ice, sel.ice).label;
    const parts = [choice(G.size, sel.size).label, ice, choice(G.sugar, sel.sugar).label];
    const tops = sel.topping.map((id) => choice(G.topping, id).label);
    return parts.join(', ') + (tops.length ? ` · ${tops.join(', ')}` : '');
  }
  const lineKey = () => [it.id, ...groups.map((g) => [].concat(sel[g.id]).sort().join('+'))].join('|');

  // nền ảnh theo màu ly
  const tone = it.cup ? [it.cup.top, it.cup.mid] : it.tone || ['#F2EEE6', '#DCD3C2'];

  const groupHTML = (g) => `
    <div class="pd-group" data-group="${g.id}">
      <div class="pd-gh">
        <h4>${g.title}</h4>
        <span class="${g.type === 'single' ? 'req' : ''}">${g.type === 'single' ? 'Bắt buộc · chọn 1' : `Không bắt buộc · tối đa ${g.max}`}</span>
      </div>
      <div class="pd-chips ${g.type}">
        ${g.choices.map((c) => `
          <button class="pd-chip" data-g="${g.id}" data-c="${c.id}">
            ${g.type === 'multi' ? '<i class="ck"></i>' : ''}
            <span class="cl">${c.label}</span>
            ${g.id === 'size' ? `<small>${vnd(it.price + (c.delta || 0))}</small>` : c.delta && g.type === 'multi' ? `<small>+${vnd(c.delta)}</small>` : c.note ? `<small>${c.note}</small>` : ''}
          </button>`).join('')}
      </div>
    </div>`;

  const el = App.ui.el(`
    <div class="pd-wrap">
      <div class="pd-dim"></div>
      <div class="pdt">
        <div class="pd-bar"><b>${it.name}</b></div>
        <button class="pd-close" aria-label="Đóng"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg></button>
        <div class="pd-scroll">
          <div class="pd-hero" style="--h1:${tone[0]};--h2:${tone[1]}">
            <span class="pd-leaf l1"></span><span class="pd-leaf l2"></span>
            <div class="pdt-art ${it.kind || 'drink'}">${art}</div>
          </div>
          <div class="pd-body">
            <h2>${it.name}</h2>
            ${it.badge ? `<span class="pd-badge ${it.badge}">${it.badge === 'new' ? 'Mới' : 'Bán chạy'}</span>` : ''}
            <p class="pd-desc">${App.data.menuStory(it)}</p>
            <button class="pd-more">Hiển thị thêm <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9l6 6 6-6"/></svg></button>
            ${groups.map(groupHTML).join('')}
            ${isDrink ? '' : `<p class="pd-note">${it.kind === 'combo' ? 'Combo dùng size Lớn, đá và độ ngọt mặc định.' : 'Sản phẩm không có tuỳ chọn thêm.'}</p>`}
          </div>
        </div>
        <div class="pd-foot">
          <div class="pd-sum">
            <div class="pd-price"><b></b><small></small></div>
            <div class="stepper"><button data-q="-1">−</button><em></em><button data-q="1">+</button></div>
          </div>
          <div class="pd-ctas">
            <button class="pd-add">THÊM VÀO GIỎ HÀNG</button>
            <button class="pd-order">ĐẶT HÀNG</button>
          </div>
        </div>
      </div>
    </div>`);

  const $ = (s) => el.querySelector(s);
  const panel = $('.pdt');
  const scroller = $('.pd-scroll');

  function render() {
    el.querySelectorAll('.pd-chip').forEach((b) => {
      const v = sel[b.dataset.g];
      b.classList.toggle('on', Array.isArray(v) ? v.includes(b.dataset.c) : v === b.dataset.c);
    });
    const tg = groups.find((g) => g.type === 'multi');
    if (tg) {
      const full = sel[tg.id].length >= tg.max;
      el.querySelectorAll(`[data-g="${tg.id}"]`).forEach((b) => b.classList.toggle('dis', full && !b.classList.contains('on')));
      $(`[data-group="${tg.id}"] .pd-gh span`).textContent = sel[tg.id].length
        ? `Đã chọn ${sel[tg.id].length}/${tg.max}` : `Không bắt buộc · tối đa ${tg.max}`;
    }
    $('.pd-price b').textContent = vnd(unitPrice() * qty);
    $('.pd-price small').textContent = summary() || (qty > 1 ? `${qty} × ${vnd(unitPrice())}` : '');
    $('.stepper em').textContent = qty;
    $('[data-q="-1"]').disabled = qty <= 1;
    // ly lớn hơn khi chọn size L
    $('.pdt-art').classList.toggle('big', sel.size === 'L');
  }

  el.addEventListener('click', (e) => {
    const chip = e.target.closest('.pd-chip');
    if (chip) {
      const g = groups.find((x) => x.id === chip.dataset.g);
      App.ui.haptic(4);
      if (g.type === 'single') sel[g.id] = chip.dataset.c;
      else {
        const arr = sel[g.id];
        const i = arr.indexOf(chip.dataset.c);
        if (i >= 0) arr.splice(i, 1);
        else if (arr.length >= g.max) {
          chip.classList.remove('shake'); void chip.offsetWidth; chip.classList.add('shake');
          return App.ui.toast(`Chọn tối đa ${g.max} topping`);
        } else arr.push(chip.dataset.c);
      }
      return render();
    }
    const q = e.target.closest('[data-q]');
    if (q) { App.ui.haptic(4); qty = Math.max(1, qty + +q.dataset.q); return render(); }
    if (e.target.closest('.pd-more')) {
      $('.pd-desc').classList.toggle('open');
      $('.pd-more').classList.toggle('open');
      $('.pd-more').firstChild.textContent = $('.pd-desc').classList.contains('open') ? 'Thu gọn ' : 'Hiển thị thêm ';
      return;
    }
    if (e.target.closest('.pd-close') || e.target.closest('.pd-dim')) return close();
    const line = () => ({ key: lineKey(), id: it.id, qty, unit: unitPrice(), opts: summary() });
    if (e.target.closest('.pd-add')) { App.ui.haptic(10); const l = line(); return close(() => onAdd && onAdd(l)); }
    if (e.target.closest('.pd-order')) { App.ui.haptic(10); const l = line(); return close(() => onOrder && onOrder(l)); }
  });

  // thanh tên nhỏ hiện khi cuộn qua ảnh + parallax ảnh
  scroller.addEventListener('scroll', () => {
    const y = scroller.scrollTop;
    $('.pd-bar').classList.toggle('shown', y > 230);
    $('.pdt-art').style.transform = `translateY(${y * 0.3}px)`;
  }, { passive: true });

  // kéo xuống từ đầu trang để đóng
  let y0 = null, dy = 0;
  panel.addEventListener('pointerdown', (e) => {
    if (scroller.scrollTop > 0 || e.target.closest('button')) return;
    y0 = e.clientY; dy = 0;
  });
  panel.addEventListener('pointermove', (e) => {
    if (y0 === null) return;
    const s = panel.getBoundingClientRect().width / panel.offsetWidth || 1;
    dy = Math.max(0, (e.clientY - y0) / s);
    if (dy > 4) { panel.style.transition = 'none'; panel.style.transform = `translateY(${dy}px)`; }
  });
  const up = () => {
    if (y0 === null) return;
    y0 = null; panel.style.transition = '';
    if (dy > 140) close(); else panel.style.transform = '';
  };
  panel.addEventListener('pointerup', up);
  panel.addEventListener('pointercancel', up);
  panel.addEventListener('pointerleave', up);

  let closing = false;
  function close(after) {
    if (closing) return;
    closing = true;
    el.classList.add('closing');
    panel.style.transform = '';
    App.device.setTheme('dark');
    setTimeout(() => { el.remove(); after && after(); }, 340);
  }

  render();
  overlay.appendChild(el);
  return { el, close };
};
