// C15 · Sổ địa chỉ
// Danh sách (mặc định, ngoài vùng giao) · Thêm/Sửa: bản đồ kéo được + ghim giữa, tìm địa chỉ gợi ý,
// cửa hàng gần nhất & khoảng cách tự tính, nhãn, người nhận, SĐT, ghi chú tài xế, đặt mặc định, xoá.
// Dữ liệu ở state.addresses (đồng bộ vào App.data.member.addresses để các màn khác dùng chung).
(() => {
  const st = () => App.state.get();
  const I = App.icons.ic;
  const R = App.data.deliveryRadiusKm;
  const KM_PER_UNIT = 0.24; // 1 đơn vị toạ độ bản đồ minh hoạ ≈ 240 m
  const back = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 5l-7 7 7 7"/></svg>';
  const editIc = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M4 20h4L19 9l-4-4L4 16z"/><path d="M13.5 6.5l4 4"/></svg>';
  const searchIc = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="6.5"/><path d="M16 16l4 4"/></svg>';
  const locate = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="12" cy="12" r="6.5"/><circle cx="12" cy="12" r="2.2" fill="currentColor"/><path d="M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3"/></svg>';
  const fold = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/gi, 'd').toLowerCase();
  const ME = { x: 53.5, y: 61 }; // vị trí hiện tại (mô phỏng)

  // gợi ý địa chỉ (mô phỏng dịch vụ tìm kiếm bản đồ)
  const PLACES = [
    { line: '12 Lê Thánh Tôn', detail: 'Bến Nghé, Quận 1, TP. Hồ Chí Minh', x: 57, y: 63 },
    { line: 'Vincom Center, 72 Lê Thánh Tôn', detail: 'Bến Nghé, Quận 1, TP. Hồ Chí Minh', x: 58, y: 60 },
    { line: '86 Nguyễn Huệ', detail: 'Bến Nghé, Quận 1, TP. Hồ Chí Minh', x: 56, y: 59 },
    { line: 'Chợ Bến Thành, 2 Lê Lợi', detail: 'Bến Thành, Quận 1, TP. Hồ Chí Minh', x: 50, y: 62 },
    { line: '220 Võ Văn Tần', detail: 'Phường 5, Quận 3, TP. Hồ Chí Minh', x: 42, y: 50 },
    { line: '210 Lê Văn Sỹ', detail: 'Phường 14, Quận 3, TP. Hồ Chí Minh', x: 34, y: 35 },
    { line: 'Tầng 5, 24A Bàu Cát 2', detail: 'Phường 14, Tân Bình, TP. Hồ Chí Minh', x: 17, y: 22 },
    { line: 'Sân bay Tân Sơn Nhất', detail: 'Phường 2, Tân Bình, TP. Hồ Chí Minh', x: 24, y: 10 },
    { line: 'Landmark 81, 720A Điện Biên Phủ', detail: 'Phường 22, Bình Thạnh, TP. Hồ Chí Minh', x: 74, y: 38 },
    { line: '159 Xa lộ Hà Nội', detail: 'Thảo Điền, TP. Thủ Đức, TP. Hồ Chí Minh', x: 86, y: 28 },
    { line: 'Crescent Mall, 101 Tôn Dật Tiên', detail: 'Tân Phú, Quận 7, TP. Hồ Chí Minh', x: 61, y: 82 },
    { line: '58 Phan Trung', detail: 'Tân Tiến, Biên Hoà, Đồng Nai', x: 165, y: 12 },
  ];

  // ---------- dữ liệu ----------
  const list = () => st().addresses || App.data.member.addresses;
  function sync() { if (st().addresses) App.data.member.addresses = st().addresses; }
  sync();
  App.state.subscribe(sync);
  function nearest(x, y) {
    let best = null;
    App.data.stores.forEach((s) => {
      const km = Math.hypot(s.x - x, s.y - y) * KM_PER_UNIT;
      if (!best || km < best.km) best = { store: s, km: Math.round(km * 10) / 10 };
    });
    return best;
  }
  function saveList(arr, defaultId) {
    App.state.set({ addresses: arr, ...(defaultId !== undefined ? { defaultAddressId: defaultId } : {}) });
  }
  const defId = () => st().defaultAddressId || list()[0]?.id;

  // ======================================================
  // Danh sách
  // ======================================================
  App.screens.addressBook = () => {
    const el = App.ui.el(`
      <section class="ab">
        <header class="ac-nav"><button class="ac-back" data-act="back" aria-label="Quay lại">${back}</button><h1>Sổ địa chỉ</h1><span></span></header>
        <div class="ab-body"></div>
        <div class="ab-foot"><button class="ab-add" data-act="add">+ THÊM ĐỊA CHỈ</button></div>
      </section>`);
    const body = el.querySelector('.ab-body');
    function render() {
      const arr = list();
      const d = defId();
      body.innerHTML = arr.length ? `
        <p class="ab-hint">Mộc Trà giao trong bán kính ${R} km quanh cửa hàng gần nhất.</p>
        ${arr.map((a, i) => {
          const n = nearest(a.x ?? 50, a.y ?? 60);
          const out = n.km > R;
          return `
          <div class="ab-card ${out ? 'off' : ''}" data-edit="${a.id}" style="--i:${i}">
            <div class="ab-l1"><span class="ap-tag">${a.label}</span>${a.id === d ? '<span class="ab-def">Mặc định</span>' : ''}<b>${a.line}</b></div>
            <p>${a.detail}</p>
            <small>${a.receiver} · ${a.phone}</small>
            ${a.note ? `<small class="ab-note">“${a.note}”</small>` : ''}
            <span class="ab-from ${out ? 'out' : ''}">${out ? `Ngoài vùng giao · cách ${n.store.name} ${App.fmt.km(n.km)}` : `Giao từ ${n.store.name} · ${App.fmt.km(n.km)}`}</span>
            <button class="ab-edit" data-edit="${a.id}" aria-label="Sửa">${editIc}</button>
          </div>`;
        }).join('')}
        <p class="ab-max">Bạn có thể lưu tối đa 10 địa chỉ (${arr.length}/10).</p>` : `
        <div class="ab-empty"><span>${I.pin}</span><b>Chưa có địa chỉ nào</b><p>Thêm địa chỉ nhà, công ty để đặt giao hàng nhanh hơn.</p></div>`;
    }
    el.addEventListener('click', (e) => {
      const act = e.target.closest('[data-act]')?.dataset.act;
      if (act === 'back') return App.nav.pop();
      if (act === 'add') {
        if (list().length >= 10) return App.ui.toast('Sổ địa chỉ đã đủ 10 địa chỉ');
        return App.nav.push(App.screens.addressEdit());
      }
      const id = e.target.closest('[data-edit]')?.dataset.edit;
      if (id) { App.ui.haptic(4); App.nav.push(App.screens.addressEdit(id)); }
    });
    render();
    return { el, statusBar: 'dark', onResume: render };
  };

  // ======================================================
  // Thêm / Sửa
  // ======================================================
  App.screens.addressEdit = (id, { onSaved } = {}) => {
    const orig = id ? list().find((a) => a.id === id) : null;
    const pr = App.auth.profile();
    const a = orig ? { ...orig } : {
      id: null, label: 'Nhà', line: '', detail: '', x: ME.x, y: ME.y, note: '',
      receiver: pr.name || '', phone: pr.phone ? `0${pr.phone.slice(0, 2)} ${pr.phone.slice(2, 5)} ${pr.phone.slice(5)}` : '',
    };
    let isDefault = orig ? defId() === orig.id : !list().length;
    let customLabel = ['Nhà', 'Văn phòng'].includes(a.label) ? '' : a.label;

    const el = App.ui.el(`
      <section class="ae">
        <header class="ac-nav"><button class="ac-back" data-act="back" aria-label="Quay lại">${back}</button><h1>${orig ? 'Sửa địa chỉ' : 'Thêm địa chỉ'}</h1><span></span></header>
        <div class="ae-body">
          <div class="ae-search">${searchIc}<input type="search" placeholder="Tìm đường, toà nhà, địa điểm…" autocomplete="off"/></div>
          <div class="ae-sug"></div>
          <div class="ae-map">
            <div class="ae-world">
              <svg viewBox="-40 -30 220 160" class="ae-svg">
                <rect x="-40" y="-30" width="220" height="160" fill="#EFEBE2"/>
                <path d="M68 -30 C 80 10, 66 32, 82 52 S 120 80, 130 130 L 180 130 L 180 -30Z" fill="#D7E5E8"/>
                <ellipse cx="30" cy="70" rx="9" ry="5" fill="#DCE7D2"/><ellipse cx="54" cy="18" rx="6" ry="4" fill="#DCE7D2"/><ellipse cx="66" cy="88" rx="8" ry="4" fill="#DCE7D2"/>
                <g stroke="#fff" stroke-linecap="round" fill="none">
                  <path d="M-40 25 L 180 40" stroke-width="2.6"/><path d="M10 -30 L 50 130" stroke-width="2.4"/>
                  <path d="M-40 75 C 20 68, 60 80, 180 66" stroke-width="2.2"/><path d="M48 -30 L 72 130" stroke-width="1.8"/>
                  <path d="M-40 50 L 60 46" stroke-width="1.2"/><path d="M30 -30 L 26 130" stroke-width="1.2"/>
                  <path d="M84 -30 L 100 130" stroke-width="1.2"/><path d="M-40 100 L 180 96" stroke-width="1.2"/>
                </g>
                <g font-size="3.2" fill="#BDB6A8" font-family="Be Vietnam Pro, sans-serif" letter-spacing=".4">
                  <text x="8" y="16">TÂN BÌNH</text><text x="32" y="38">QUẬN 3</text><text x="52" y="56">QUẬN 1</text><text x="82" y="22">THỦ ĐỨC</text><text x="54" y="90">QUẬN 7</text><text x="150" y="8">BIÊN HOÀ →</text>
                </g>
                ${App.data.stores.map((s) => `<g transform="translate(${s.x} ${s.y})"><circle r="2.6" fill="#1F3329"/><circle r="1" fill="#F4EEE2"/></g>`).join('')}
                <g transform="translate(${ME.x} ${ME.y})"><circle r="3.4" fill="rgba(47,122,245,.18)"/><circle r="1.4" fill="#2F7AF5" stroke="#fff" stroke-width=".6"/></g>
                <circle class="ae-radius" r="${R / KM_PER_UNIT}" fill="rgba(46,107,76,.06)" stroke="#2E6B4C" stroke-opacity=".35" stroke-width=".4" stroke-dasharray="1.5 1.5"/>
              </svg>
            </div>
            <span class="ae-pin"><i></i></span>
            <span class="ae-bubble"></span>
            <button class="ae-locate" data-act="locate" aria-label="Vị trí hiện tại">${locate}</button>
          </div>
          <div class="ae-form">
            <div class="ae-place"><span class="ae-pic">${I.pin}</span><div><b class="ae-line"></b><small class="ae-detail"></small></div></div>
            <p class="ae-store"></p>
            <label class="ae-l">Số nhà, toà nhà, tầng / căn hộ</label>
            <input class="ae-in" data-f="unit" placeholder="VD: Tầng 5, phòng 502" maxlength="60" value="${(orig && orig.unit) || ''}"/>
            <label class="ae-l">Ghi chú cho tài xế</label>
            <input class="ae-in" data-f="note" placeholder="VD: Gọi trước khi giao, gửi bảo vệ…" maxlength="80" value="${a.note || ''}"/>
            <label class="ae-l">Lưu địa chỉ là</label>
            <div class="ae-tags">
              ${['Nhà', 'Văn phòng', 'Khác'].map((t) => `<button data-tag="${t}">${t === 'Nhà' ? '🏠' : t === 'Văn phòng' ? '🏢' : '📍'} ${t}</button>`).join('')}
            </div>
            <input class="ae-in ae-custom" data-f="custom" placeholder="Đặt tên, VD: Nhà ba mẹ" maxlength="20" value="${customLabel}"/>
            <div class="ae-two">
              <div><label class="ae-l">Người nhận <sup>*</sup></label><input class="ae-in" data-f="receiver" placeholder="Họ tên" maxlength="30" value="${a.receiver}"/><p class="ae-err" data-e="receiver"></p></div>
              <div><label class="ae-l">Số điện thoại <sup>*</sup></label><input class="ae-in" data-f="phone" type="tel" inputmode="numeric" placeholder="090 123 4567" maxlength="13" value="${a.phone}"/><p class="ae-err" data-e="phone"></p></div>
            </div>
            <div class="ae-def"><span><b>Đặt làm địa chỉ mặc định</b><small>Tự chọn khi đặt giao hàng</small></span><button class="sw ${isDefault ? 'on' : ''}" data-act="def" aria-label="Mặc định"><i></i></button></div>
            ${orig ? '<button class="ae-del" data-act="delete">Xoá địa chỉ này</button>' : ''}
          </div>
        </div>
        <div class="ab-foot"><button class="ab-add dark" data-act="save">LƯU ĐỊA CHỈ</button></div>
      </section>`);
    const $ = (q) => el.querySelector(q);
    const f = (k) => el.querySelector(`[data-f="${k}"]`);
    const map = $('.ae-map'), world = $('.ae-world');
    const SCALE = 5; // px / đơn vị (mức thu phóng mặc định)
    let pos = { x: a.x ?? ME.x, y: a.y ?? ME.y };
    let tagSel = ['Nhà', 'Văn phòng'].includes(a.label) ? a.label : 'Khác';

    // đặt bản đồ sao cho `pos` nằm dưới ghim
    function place(animate) {
      const W = map.clientWidth || 440, H = map.clientHeight || 250;
      world.style.transition = animate ? 'transform .45s var(--ease-ios)' : 'none';
      world.style.transform = `translate(${W / 2 - (pos.x + 40) * SCALE}px, ${H / 2 - (pos.y + 30) * SCALE}px)`;
      world.style.width = `${220 * SCALE}px`; world.style.height = `${160 * SCALE}px`;
      el.querySelector('.ae-radius').setAttribute('cx', nearest(pos.x, pos.y).store.x);
      el.querySelector('.ae-radius').setAttribute('cy', nearest(pos.x, pos.y).store.y);
    }
    // "reverse geocode": địa điểm gợi ý gần nhất
    function resolve(fromSearch) {
      if (!fromSearch) {
        let best = PLACES[0], d = 1e9;
        PLACES.forEach((p) => { const k = Math.hypot(p.x - pos.x, p.y - pos.y); if (k < d) { d = k; best = p; } });
        a.line = d < 2.5 ? best.line : d < 8 ? `Gần ${best.line}` : 'Vị trí đã ghim trên bản đồ';
        a.detail = d < 8 ? best.detail : `Khu vực gần ${best.detail.split(',').slice(-2).join(',').trim()}`;
      }
      $('.ae-line').textContent = a.line || 'Kéo bản đồ để chọn vị trí';
      $('.ae-detail').textContent = a.detail || '';
      const n = nearest(pos.x, pos.y);
      const out = n.km > R;
      $('.ae-store').className = `ae-store ${out ? 'out' : ''}`;
      $('.ae-store').innerHTML = out
        ? `⚠︎ Ngoài vùng giao · cửa hàng gần nhất ${n.store.name} cách ${App.fmt.km(n.km)} (tối đa ${R} km)`
        : `✓ Giao từ <b>${n.store.name}</b> · ${App.fmt.km(n.km)}`;
      $('.ae-bubble').textContent = out ? 'Ngoài vùng giao' : `${App.fmt.km(n.km)} · ${n.store.name.replace('Mộc Trà ', '')}`;
      $('.ae-bubble').classList.toggle('out', out);
    }
    function paintTags() {
      el.querySelectorAll('[data-tag]').forEach((b) => b.classList.toggle('on', b.dataset.tag === tagSel));
      $('.ae-custom').classList.toggle('show', tagSel === 'Khác');
    }

    // kéo bản đồ
    let drag = null;
    map.addEventListener('pointerdown', (e) => {
      if (e.target.closest('button')) return;
      const sc = map.getBoundingClientRect().width / map.offsetWidth || 1;
      drag = { x0: e.clientX, y0: e.clientY, p0: { ...pos }, sc };
      map.setPointerCapture(e.pointerId);
      map.classList.add('dragging');
    });
    map.addEventListener('pointermove', (e) => {
      if (!drag) return;
      pos = { x: drag.p0.x - (e.clientX - drag.x0) / drag.sc / SCALE, y: drag.p0.y - (e.clientY - drag.y0) / drag.sc / SCALE };
      pos.x = Math.max(-30, Math.min(170, pos.x)); pos.y = Math.max(-20, Math.min(120, pos.y));
      place(false);
    });
    const end = () => { if (!drag) return; drag = null; map.classList.remove('dragging'); App.ui.haptic(4); resolve(false); };
    map.addEventListener('pointerup', end); map.addEventListener('pointercancel', end);

    // tìm địa chỉ
    const sIn = $('.ae-search input');
    sIn.addEventListener('input', () => {
      const q = fold(sIn.value.trim());
      const res = q ? PLACES.filter((p) => fold(p.line + ' ' + p.detail).includes(q)).slice(0, 5) : [];
      $('.ae-sug').innerHTML = res.map((p, i) => `<button data-pl="${PLACES.indexOf(p)}">${I.pin}<span><b>${p.line}</b><small>${p.detail}</small></span><em>${App.fmt.km(Math.hypot(p.x - ME.x, p.y - ME.y) * KM_PER_UNIT)}</em></button>`).join('')
        + (q && !res.length ? '<p class="ae-none">Không tìm thấy · thử kéo bản đồ để chọn vị trí</p>' : '');
    });

    el.addEventListener('click', async (e) => {
      const pl = e.target.closest('[data-pl]');
      if (pl) {
        const p = PLACES[+pl.dataset.pl];
        App.ui.haptic(5);
        pos = { x: p.x, y: p.y }; a.line = p.line; a.detail = p.detail;
        sIn.value = ''; $('.ae-sug').innerHTML = ''; sIn.blur();
        place(true); resolve(true);
        return;
      }
      const tg = e.target.closest('[data-tag]');
      if (tg) { tagSel = tg.dataset.tag; paintTags(); if (tagSel === 'Khác') setTimeout(() => f('custom').focus(), 50); return; }
      const act = e.target.closest('[data-act]')?.dataset.act;
      switch (act) {
        case 'back': return App.nav.pop();
        case 'locate': pos = { ...ME }; App.ui.haptic(5); place(true); return setTimeout(() => resolve(false), 300);
        case 'def': isDefault = !isDefault; return $('.sw').classList.toggle('on', isDefault);
        case 'delete': {
          const ok = await App.ui.iosAlert({ title: 'Xoá địa chỉ này?', message: `${a.label} · ${a.line}`, buttons: [{ label: 'Huỷ', value: false }, { label: 'Xoá', value: true, bold: true }] });
          if (!ok) return;
          const rest = list().filter((x) => x.id !== orig.id);
          saveList(rest, defId() === orig.id ? (rest[0]?.id || null) : undefined);
          if (st().addressId === orig.id) App.state.set({ addressId: rest[0]?.id || null });
          await App.nav.pop();
          return App.ui.toast('Đã xoá địa chỉ');
        }
        case 'save': return save();
      }
    });
    f('phone').addEventListener('input', (e) => {
      const d = e.target.value.replace(/\D/g, '').slice(0, 10);
      e.target.value = d.replace(/^(\d{3})(\d{0,3})(\d{0,4}).*/, (_, x, y, z) => [x, y, z].filter(Boolean).join(' '));
      err('phone');
    });
    f('receiver').addEventListener('input', () => err('receiver'));
    function err(k, t) { el.querySelector(`[data-e="${k}"]`).textContent = t || ''; f(k).classList.toggle('bad', !!t); }

    async function save() {
      let ok = true;
      const rec = f('receiver').value.trim().replace(/\s+/g, ' ');
      const ph = f('phone').value.replace(/\D/g, '');
      if (rec.length < 2 || !/^[\p{L} ]+$/u.test(rec)) { err('receiver', 'Nhập họ tên người nhận'); ok = false; }
      if (!/^0[35789]\d{8}$/.test(ph)) { err('phone', 'SĐT gồm 10 số, bắt đầu 03/05/07/08/09'); ok = false; }
      if (!a.line) { App.ui.toast('Chọn vị trí trên bản đồ hoặc tìm địa chỉ'); ok = false; }
      const label = tagSel === 'Khác' ? (f('custom').value.trim() || 'Khác') : tagSel;
      if (!ok) { App.ui.haptic(20); return; }
      const n = nearest(pos.x, pos.y);
      if (n.km > R) {
        const go = await App.ui.iosAlert({ title: 'Địa chỉ ngoài vùng giao', message: `Cửa hàng gần nhất cách ${App.fmt.km(n.km)}, vượt bán kính giao ${R} km. Bạn vẫn có thể lưu để dùng sau.`, buttons: [{ label: 'Chọn lại', value: false }, { label: 'Vẫn lưu', value: true, bold: true }] });
        if (!go) return;
      }
      const unit = f('unit').value.trim();
      const rec2 = {
        id: orig ? orig.id : 'a' + Date.now(), label, unit,
        line: unit && !a.line.includes(unit) ? `${unit}, ${a.line.replace(/^Gần /, '')}` : a.line,
        detail: a.detail, x: Math.round(pos.x * 10) / 10, y: Math.round(pos.y * 10) / 10,
        receiver: rec, phone: ph.replace(/^(\d{3})(\d{3})(\d{4})$/, '$1 $2 $3'), note: f('note').value.trim(),
        storeId: n.store.id, km: n.km,
      };
      if (orig && orig.unit && rec2.line.startsWith(`${orig.unit}, `) && unit !== orig.unit) rec2.line = rec2.line.replace(`${orig.unit}, `, unit ? `${unit}, ` : '');
      const arr = orig ? list().map((x) => (x.id === orig.id ? rec2 : x)) : [...list(), rec2];
      const cur = defId();
      saveList(arr, isDefault ? rec2.id : cur === rec2.id ? (arr.find((x) => x.id !== rec2.id)?.id || rec2.id) : cur);
      App.ui.haptic(10);
      await App.nav.pop();
      App.ui.toast(orig ? 'Đã cập nhật địa chỉ' : 'Đã thêm địa chỉ mới');
      onSaved && onSaved(rec2);
    }

    resolve(!!orig);
    paintTags();
    return { el, statusBar: 'dark', onEnter() { requestAnimationFrame(() => place(false)); } };
  };

  App.addressBook = { list, nearest, defId };
})();
