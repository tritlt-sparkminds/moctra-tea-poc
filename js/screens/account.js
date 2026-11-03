// C13 · Tài khoản (tab "Tôi") + Cài đặt / Quyền truy cập / Xoá tài khoản / Điều khoản (C14)
// C12 · Thông báo (hộp thư)
(() => {
  const st = () => App.state.get();
  const I = App.icons.ic;
  const back = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 5l-7 7 7 7"/></svg>';
  const chev = I.chevron;
  const gear = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><circle cx="12" cy="12" r="3"/><path d="M12 2.8l1.6 2.4 2.8-.6.6 2.8 2.4 1.6-1.4 2.5 1.4 2.5-2.4 1.6-.6 2.8-2.8-.6L12 21.2l-1.6-2.4-2.8.6-.6-2.8-2.4-1.6L6 12.5 4.6 10l2.4-1.6.6-2.8 2.8.6z" stroke-linejoin="round"/></svg>';
  const leaf = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"><path d="M5 19C5 10 10 5 20 4c0 9-5 15-15 15z"/><path d="M5 19l8-8"/></svg>';
  const header = (t) => `<header class="ac-nav"><button class="ac-back" data-act="back" aria-label="Quay lại">${back}</button><h1>${t}</h1><span></span></header>`;
  const COUNTRIES = [
    ['hk', 'Đặc khu hành chính Hồng Kông', '🇭🇰', true], ['mo', 'Đặc khu hành chính Ma Cao', '🇲🇴'], ['id', 'Indonesia', '🇮🇩'], ['my', 'Malaysia', '🇲🇾'],
    ['ph', 'Philippines', '🇵🇭'], ['sg', 'Singapore', '🇸🇬'], ['kr', 'Hàn Quốc', '🇰🇷'], ['th', 'Thái Lan', '🇹🇭'], ['vn', 'Việt Nam', '🇻🇳'],
  ];
  const country = () => COUNTRIES.find((c) => c[0] === (st().country || 'vn'));
  const LANGS = [['en', 'English'], ['vi', 'Tiếng Việt']];
  const lang = () => LANGS.find((l) => l[0] === (st().lang || 'vi'));
  const maskPhone = () => { const p = App.data.member.phone.replace(/\D/g, ''); return `+84 ${p.slice(1, 3)}****${p.slice(-3)}`; };

  // ---------- sheet chọn (quốc gia / ngôn ngữ) ----------
  function pickSheet(title, items, cur, note) {
    return new Promise((resolve) => {
      let pick = cur, done = false;
      const sh = App.ui.sheet(`
        <div class="ps">
          <div class="ps-h"><h3>${title}</h3><button class="ps-x" aria-label="Đóng">✕</button></div>
          <div class="ps-list">${items.map(([k, n, flag, soon]) => `
            <button class="ps-row ${soon ? 'off' : ''} ${k === cur ? 'on' : ''}" data-k="${k}" ${soon ? 'disabled' : ''}>
              ${flag ? `<span class="ps-flag">${flag}</span>` : ''}<span class="ps-n">${n}${soon ? '<em>Sắp diễn ra</em>' : ''}</span><i class="radio"></i>
            </button>`).join('')}</div>
          ${note ? `<p class="ps-note">${note}</p>` : ''}
          <button class="ps-go">GỬI</button>
        </div>`, { onClose: () => resolve(done ? pick : null) });
      sh.el.querySelectorAll('[data-k]').forEach((b) => (b.onclick = () => {
        App.ui.haptic(4); pick = b.dataset.k;
        sh.el.querySelectorAll('[data-k]').forEach((x) => x.classList.toggle('on', x === b));
      }));
      sh.el.querySelector('.ps-x').onclick = () => sh.close();
      sh.el.querySelector('.ps-go').onclick = () => { done = true; sh.close(); };
    });
  }
  async function chooseCountry() {
    const k = await pickSheet('Chọn quốc gia', COUNTRIES, st().country || 'vn', 'Đặt hàng tại quốc gia khác sẽ dùng menu, giá và cửa hàng của quốc gia đó. Tài khoản hội viên được tách riêng theo từng quốc gia.');
    if (!k || k === (st().country || 'vn')) return;
    if (k !== 'vn') {
      const ok = await App.ui.iosAlert({ title: `Chuyển sang ${COUNTRIES.find((c) => c[0] === k)[1]}?`, message: 'Bản POC chỉ có dữ liệu Việt Nam. Ứng dụng thật sẽ tải lại menu và cửa hàng của quốc gia này.', buttons: [{ label: 'Huỷ', value: false }, { label: 'Chuyển', value: true, bold: true }] });
      if (!ok) return;
    }
    App.state.set({ country: k });
    App.ui.toast(`Đã chọn ${COUNTRIES.find((c) => c[0] === k)[1]}`);
  }
  async function chooseLang() {
    const k = await pickSheet('Ngôn ngữ', LANGS, st().lang || 'vi');
    if (!k || k === (st().lang || 'vi')) return;
    App.state.set({ lang: k });
    App.ui.toast(k === 'en' ? 'Language: English (POC chỉ có nội dung tiếng Việt)' : 'Đã chọn Tiếng Việt');
  }

  // ---------- mã thành viên ----------
  function memberQR() {
    const PERIOD = 30;
    let sec = PERIOD;
    const M = App.data.member;
    const code = () => `MT ${String(Date.now()).slice(-8, -4)} ${String(Date.now()).slice(-4)}`;
    const m = App.ui.el(`
      <div class="mq">
        <div class="mq-card">
          <div class="mq-top">
            <span class="mq-logo">${App.icons.logoMark('#F4EEE2', '#D9B77A')}</span>
            <div><small>MÃ THÀNH VIÊN</small><b>${M.name}</b></div>
            <span class="mq-tier">${M.tier}</span>
            <button class="mq-x" aria-label="Đóng">✕</button>
          </div>
          <div class="mq-mid">
            <p class="mq-cap">Đưa mã cho nhân viên khi thanh toán tại quầy để tích điểm trà</p>
            <div class="mq-frame"><i class="c1"></i><i class="c2"></i><i class="c3"></i><i class="c4"></i>
              <div class="mq-qr">${App.art.qr(Date.now() % 997)}<span class="mq-center">${App.icons.logoMark('#1F3329', '#1F3329')}</span></div>
              <span class="mq-scan"></span>
            </div>
            <b class="mq-code">${code()}</b>
            <div class="mq-timer"><svg viewBox="0 0 36 36"><circle cx="18" cy="18" r="15" class="bg"/><circle cx="18" cy="18" r="15" class="fg"/></svg><span>Tự làm mới sau <b>${PERIOD}</b> giây</span></div>
          </div>
          <div class="mq-cut"><i></i><i></i></div>
          <div class="mq-foot"><span>${maskPhone()}</span><span>${M.points.toLocaleString('vi-VN')} điểm trà</span></div>
        </div>
        <p class="mq-hint">☀︎ Độ sáng màn hình được tăng tạm thời để quét mã dễ hơn</p>
      </div>`);
    const fg = m.querySelector('.mq-timer .fg');
    const C = 2 * Math.PI * 15;
    fg.style.strokeDasharray = C;
    const setRing = () => { fg.style.strokeDashoffset = C * (1 - sec / PERIOD); };
    setRing();
    const tick = setInterval(() => {
      sec = sec <= 1 ? PERIOD : sec - 1;
      if (sec === PERIOD) {
        const q = m.querySelector('.mq-qr');
        q.classList.remove('flip'); void q.offsetWidth; q.classList.add('flip');
        q.innerHTML = App.art.qr(Date.now() % 997) + `<span class="mq-center">${App.icons.logoMark('#1F3329', '#1F3329')}</span>`;
        m.querySelector('.mq-code').textContent = code();
      }
      m.querySelector('.mq-timer b').textContent = sec;
      setRing();
    }, 1000);
    const close = () => { clearInterval(tick); m.classList.add('closing'); setTimeout(() => m.remove(), 220); };
    m.addEventListener('click', (e) => { if (e.target === m || e.target.closest('.mq-x')) close(); });
    document.getElementById('overlay').appendChild(m);
  }

  // ======================================================
  // Tab Tôi
  // ======================================================
  App.screens.account = () => {
    const el = App.ui.el(`<section class="ac"><div class="ac-scroll"></div></section>`);
    const body = el.querySelector('.ac-scroll');

    function render() {
      const M = App.data.member;
      const member = st().isMember;
      const unread = (st().inbox || []).filter((n) => !n.read).length;
      const vouchers = (st().rewards || []).filter((r) => !r.used && !(r.exp && r.exp < Date.now())).length;
      const pct = Math.min(100, Math.round((M.points / M.nextTierAt) * 100));
      body.innerHTML = `
        <div class="ac-hero">
          <svg class="ac-art" viewBox="0 0 440 200" preserveAspectRatio="xMidYMid slice">
            <rect width="440" height="200" fill="#CFE3D7"/>
            <g opacity=".9">
              <circle cx="70" cy="40" r="56" fill="#F2C75B"/><circle cx="62" cy="34" r="38" fill="#F6D774"/>
              <circle cx="250" cy="26" r="62" fill="#F3A46B"/><path d="M220 0 c20 30 60 30 70 0z" fill="#E98A55"/>
              <circle cx="392" cy="36" r="44" fill="#D9475A"/><g fill="#F7E6B5"><circle cx="380" cy="28" r="2"/><circle cx="396" cy="44" r="2"/><circle cx="404" cy="24" r="2"/><circle cx="386" cy="52" r="2"/></g>
              <path d="M130 70 C 150 20, 210 30, 190 80 C 170 110, 120 100, 130 70Z" fill="#8DBB7A"/>
              <path d="M300 90 C 320 50, 370 70, 350 110 C 330 130, 290 120, 300 90Z" fill="#6FA368"/>
              <path d="M150 74 L 186 40 M310 100 L345 76" stroke="#4F7F4A" stroke-width="2"/>
            </g>
            <rect y="120" width="440" height="80" fill="url(#acfade)"/>
            <defs><linearGradient id="acfade" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#CFE3D7" stop-opacity="0"/><stop offset="1" stop-color="#CFE3D7"/></linearGradient></defs>
          </svg>
          <div class="ac-top">
            <button class="ac-ic flag" data-act="country">${country()[2]}</button>
            <button class="ac-ic" data-act="settings" aria-label="Cài đặt">${gear}</button>
            <button class="ac-ic" data-act="inbox" aria-label="Thông báo">${I.bell}${unread ? '<i class="ac-dot"></i>' : ''}</button>
          </div>
          <div class="ac-who">
            ${member ? `<button class="ac-me" data-act="personal">${App.auth.avatarHTML(App.auth.profile().avatar)}<div><b>${M.tier.toUpperCase()}</b><small>${M.name} · ${maskPhone()}</small></div></button>`
            : `<span class="ac-av">${App.icons.logoMark('#F4EEE2', '#D9B77A')}</span>`}
            ${member ? `
            <button class="ac-qr" data-act="qr" aria-label="Mã thành viên">${I.qr}</button>`
            : `<div><b>XIN CHÀO!</b><small>Đăng nhập để tích điểm & nhận quà</small></div>
            <button class="ac-login" data-act="login">Đăng nhập</button>`}
          </div>
        </div>

        <div class="ac-card ${member ? '' : 'guest'}" data-act="${member ? 'tiers' : 'login'}" role="button">
          <span class="acc-emb">${App.icons.logoMark('#5E8A72', '#5E8A72')}</span>
          <h2>${member ? M.tier : 'Hội viên Mộc Trà'}</h2>
          <p>${member ? `Còn ${(M.nextTierAt - M.points).toLocaleString('vi-VN')} điểm để lên hạng ${M.nextTier}!` : 'Đăng ký miễn phí · nhận ngay 2 voucher chào mừng'}</p>
          <div class="acc-bar"><i style="width:${member ? pct : 0}%"></i></div>
          <small class="acc-n">${member ? `${M.points.toLocaleString('vi-VN')}/${M.nextTierAt.toLocaleString('vi-VN')}` : '0/500'}</small>
          <button class="acc-more" data-act="${member ? 'tiers' : 'login'}">${member ? 'Quyền lợi của tôi' : 'Đăng ký ngay'} ${chev}</button>
        </div>

        <h3 class="ac-h">TÀI KHOẢN CỦA TÔI</h3>
        <div class="ac-tiles">
          <button class="ac-tile" data-act="points"><span><b>ĐIỂM TRÀ</b>${leaf}</span><em>${member ? M.points.toLocaleString('vi-VN') : '–'}</em></button>
          <button class="ac-tile" data-act="vouchers"><span><b>VOUCHER</b>${I.ticket}</span><em>${member ? vouchers : '–'}</em></button>
        </div>

        <div class="ac-list">
          ${member ? `<button data-act="personal"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><circle cx="12" cy="8.5" r="4"/><path d="M4.5 20c.8-4 3.8-6.5 7.5-6.5s6.7 2.5 7.5 6.5"/></svg><span>Thông tin cá nhân</span>${chev}</button>` : ''}
          <button data-act="address">${I.pin}<span>Sổ địa chỉ</span>${chev}</button>
          <button data-act="stamps">${I.cupMini}<span>Bộ sưu tập tem · Sip, Collect, Unlock</span>${chev}</button>
          <button data-act="faq"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><circle cx="12" cy="12" r="8.5"/><path d="M9.6 9.5a2.5 2.5 0 0 1 4.8 1c0 1.7-2.4 2-2.4 3.5M12 17v.3"/></svg><span>Những câu hỏi thường gặp</span>${chev}</button>
        </div>
        <p class="ac-ver">Mộc Trà v${App.config.app.version} · POC</p>`;
    }

    el.addEventListener('click', (e) => {
      const act = e.target.closest('[data-act]')?.dataset.act;
      const need = (fn, why) => App.auth.require(fn, why);
      switch (act) {
        case 'country': return chooseCountry().then(render);
        case 'settings': return App.nav.push(settings());
        case 'inbox': return App.nav.push(App.screens.inbox());
        case 'qr': return memberQR();
        case 'login': return App.auth.require(null, 'Đăng nhập để tích điểm trà và nhận voucher');
        case 'benefits': return App.nav.push(App.screens.tiers());
        case 'tiers': return App.nav.push(App.screens.tiers());
        case 'personal': return App.nav.push(App.screens.personal());
        case 'points': return App.nav.push(App.screens.points());
        case 'vouchers': return need(() => App.nav.push(App.screens.rewards({ onUse: async (r) => { App.state.set({ appliedReward: r.id }); await App.nav.pop(); App.goTab('order'); App.ui.toast(`Đã chọn “${r.title}”`); } })), 'Đăng nhập để xem voucher');
        case 'orders': return App.goTab('orders');
        case 'address': return need(() => App.nav.push(App.screens.addressBook()), 'Đăng nhập để dùng sổ địa chỉ');
        case 'stamps': return App.nav.push(App.screens.stamps({ onOrder: () => App.goTab('order') }));
        case 'faq': return App.nav.push(faq());
      }
    });

    let sig = '';
    App.state.subscribe((d) => {
      const ns = [d.isMember, d.profile && d.profile.name, d.profile && d.profile.avatar, d.pointsSpent, d.country, (d.inbox || []).filter((n) => !n.read).length, (d.rewards || []).length].join('|');
      if (ns !== sig) { sig = ns; if (el.offsetParent) render(); }
    });
    return { el, show: render };
  };

  // ======================================================
  // Cài đặt
  // ======================================================
  function settings() {
    const el = App.ui.el(`<section class="ac-page">${header('Cài đặt')}<div class="ac-pbody"></div></section>`);
    const body = el.querySelector('.ac-pbody');
    function render() {
      body.innerHTML = `
        <h4 class="ac-sec">Cài đặt</h4>
        <div class="ac-group">
          <button data-act="country"><span>Quốc gia</span><em>${country()[1]}</em>${chev}</button>
          <button data-act="lang"><span>Ngôn ngữ</span><em>${lang()[1]}</em>${chev}</button>
          <button data-act="perm"><span>Cài đặt quyền truy cập</span>${chev}</button>
          ${st().isMember ? `<button data-act="delete"><span>Xoá tài khoản</span>${chev}</button>` : ''}
        </div>
        <h4 class="ac-sec">Hỗ trợ</h4>
        <div class="ac-group">
          <button data-act="legal"><span>Điều khoản thoả thuận</span>${chev}</button>
          <button data-act="faq"><span>Những câu hỏi thường gặp</span>${chev}</button>
        </div>
        ${st().isMember ? '<button class="ac-logout" data-act="logout">ĐĂNG XUẤT</button>' : '<button class="ac-logout dark" data-act="login">ĐĂNG NHẬP</button>'}`;
    }
    el.addEventListener('click', async (e) => {
      const act = e.target.closest('[data-act]')?.dataset.act;
      switch (act) {
        case 'back': return App.nav.pop();
        case 'country': await chooseCountry(); return render();
        case 'lang': await chooseLang(); return render();
        case 'perm': return App.nav.push(permissions());
        case 'delete': return App.nav.push(deleteAccount());
        case 'legal': return App.nav.push(legalList());
        case 'faq': return App.nav.push(faq());
        case 'login': return App.auth.require(render, 'Đăng nhập để đồng bộ cài đặt');
        case 'logout': {
          const ok = await App.ui.iosAlert({ title: 'Đăng xuất?', message: 'Bạn có thể đăng nhập lại bất cứ lúc nào bằng số điện thoại.', buttons: [{ label: 'Huỷ', value: false }, { label: 'Đăng xuất', value: true, bold: true }] });
          if (!ok) return;
          App.state.set({ isMember: false, profile: null });
          await App.nav.pop();
          return App.ui.toast('Đã đăng xuất');
        }
      }
    });
    render();
    return { el, statusBar: 'dark', onResume: render };
  }

  // ---------- quyền truy cập ----------
  function permissions() {
    const el = App.ui.el(`<section class="ac-page">${header('Cài đặt quyền truy cập')}<div class="ac-pbody"></div></section>`);
    const body = el.querySelector('.ac-pbody');
    const P = () => st().permissions;
    const mk = () => st().marketing || { on: true, app: true, email: true, sms: true };
    const onOff = (v) => (v === 'granted' || v === 'once' ? 'Bật' : 'Tắt');
    function render() {
      const m = mk();
      body.innerHTML = `
        ${[
          ['location', 'Vị trí', 'Mộc Trà cần quyền truy cập vị trí để giới thiệu cửa hàng gần bạn và ước tính thời gian giao hàng.'],
          ['camera', 'Máy ảnh', 'Dùng máy ảnh để quét mã QR voucher, mã bàn tại cửa hàng.'],
          ['photos', 'Album ảnh', 'Cho phép chọn ảnh đại diện hoặc đính kèm ảnh khi gửi phản hồi.'],
        ].map(([k, t, d]) => `
          <div class="pm-block"><button class="pm-row" data-perm="${k}"><span>${t}</span><em class="${onOff(P()[k]) === 'Bật' ? 'on' : ''}">${onOff(P()[k])}</em>${chev}</button><p>${d}</p></div>`).join('')}
        <div class="pm-block"><button class="pm-row" data-perm="notifications"><span>Thông báo</span><em class="link">${P().notifications === 'granted' ? 'Đang bật · ' : ''}Đi tới cài đặt</em>${chev}</button>
          <p>Nếu bạn muốn nhận thông báo về đơn đặt hàng, chương trình khuyến mãi và cập nhật từ Mộc Trà, vui lòng bật quyền thông báo.</p></div>
        <div class="pm-block">
          <div class="pm-row static"><span>Thông tin truyền thông tiếp thị</span><button class="sw ${m.on ? 'on' : ''}" data-mk="on" aria-label="Bật tiếp thị"><i></i></button></div>
          <p>Tôi đồng ý nhận thông tin truyền thông tiếp thị qua các kênh: thông báo ứng dụng, email hoặc tin nhắn văn bản.</p>
          <div class="pm-ch ${m.on ? '' : 'off'}">
            ${[['app', 'Thông báo ứng dụng'], ['email', 'Email'], ['sms', 'Tin nhắn văn bản (SMS)']].map(([k, t]) => `<button data-mk="${k}"><i class="cbx ${m[k] && m.on ? 'on' : ''}"></i>${t}</button>`).join('')}
          </div>
        </div>`;
    }
    el.addEventListener('click', async (e) => {
      if (e.target.closest('[data-act="back"]')) return App.nav.pop();
      const pk = e.target.closest('[data-perm]')?.dataset.perm;
      if (pk) {
        const name = { location: 'Vị trí', camera: 'Máy ảnh', photos: 'Ảnh', notifications: 'Thông báo' }[pk];
        const ok = await App.ui.iosAlert({ title: `Mở Cài đặt › Mộc Trà › ${name}?`, message: 'Quyền truy cập được quản lý trong Cài đặt của iPhone. (POC: bấm “Đổi” để mô phỏng bật/tắt.)', buttons: [{ label: 'Huỷ', value: false }, { label: 'Đổi', value: true, bold: true }] });
        if (!ok) return;
        const cur = P()[pk];
        App.state.setPermission(pk, cur === 'granted' || cur === 'once' ? 'denied' : 'granted');
        return render();
      }
      const k = e.target.closest('[data-mk]')?.dataset.mk;
      if (k) {
        const m = { ...mk() };
        if (k === 'on') m.on = !m.on; else if (m.on) m[k] = !m[k]; else return;
        App.ui.haptic(4);
        App.state.set({ marketing: m });
        render();
      }
    });
    render();
    return { el, statusBar: 'dark' };
  }

  // ---------- xoá tài khoản ----------
  function deleteAccount() {
    const el = App.ui.el(`
      <section class="ac-page">${header('Xoá tài khoản')}
        <div class="ac-pbody del">
          <span class="del-logo">${App.icons.logoMark('#F4EEE2', '#D9B77A')}</span>
          <p class="del-lead">Khi bạn xoá tài khoản được liên kết với <b>${maskPhone()}</b>, các thông tin sau sẽ bị xoá vĩnh viễn và không thể truy xuất được:</p>
          <ul>${['Dữ liệu cá nhân', 'Thông tin đặt hàng', 'Lịch sử đặt hàng', 'Thông tin hoá đơn', 'Tất cả voucher chưa sử dụng', 'Tem của chương trình Sip, Collect, Unlock', 'Đặc quyền hạng thành viên', 'Tất cả điểm trà chưa sử dụng'].map((t) => `<li>${t}</li>`).join('')}</ul>
          <button class="del-agree" data-act="agree"><i class="cbx"></i>Tôi hiểu và đồng ý xoá vĩnh viễn tài khoản</button>
          <button class="del-go" data-act="del" disabled>XOÁ</button>
        </div>
      </section>`);
    let agree = false;
    el.addEventListener('click', async (e) => {
      const act = e.target.closest('[data-act]')?.dataset.act;
      if (act === 'back') return App.nav.pop();
      if (act === 'agree') { agree = !agree; el.querySelector('.del-agree .cbx').classList.toggle('on', agree); el.querySelector('.del-go').disabled = !agree; return; }
      if (act === 'del' && agree) {
        const ok = await App.ui.iosAlert({ title: 'Xoá tài khoản vĩnh viễn?', message: 'Hành động này không thể hoàn tác.', buttons: [{ label: 'Huỷ', value: false }, { label: 'Xoá', value: true, bold: true }] });
        if (!ok) return;
        App.state.set({ isMember: false, profile: null, rewards: [], claimedMilestones: [], savedCards: [], orders: [], inbox: [], appliedReward: null });
        await App.nav.popToRoot();
        App.ui.toast('Tài khoản đã được xoá');
      }
    });
    return { el, statusBar: 'dark' };
  }

  // ---------- điều khoản ----------
  const DOCS = {
    privacy: ['Chính sách bảo mật', [
      ['1. Phạm vi áp dụng', 'Chính sách này mô tả cách Mộc Trà thu thập, sử dụng, lưu trữ và bảo vệ dữ liệu cá nhân của bạn khi sử dụng ứng dụng, website và cửa hàng Mộc Trà.'],
      ['2. Dữ liệu chúng tôi thu thập', 'Số điện thoại, họ tên, ngày sinh (nếu cung cấp), địa chỉ giao hàng, lịch sử đơn hàng, vị trí (khi bạn cho phép) và thông tin thiết bị. Mộc Trà không lưu số thẻ thanh toán đầy đủ; dữ liệu thẻ do cổng thanh toán xử lý.'],
      ['3. Mục đích sử dụng', 'Xử lý đơn hàng, tích điểm và tem, gửi thông báo trạng thái đơn, chăm sóc khách hàng, cá nhân hoá ưu đãi (khi bạn đồng ý nhận tiếp thị) và tuân thủ pháp luật.'],
      ['4. Chia sẻ dữ liệu', 'Chỉ chia sẻ với đối tác cần thiết để hoàn tất dịch vụ (đơn vị giao hàng, cổng thanh toán) hoặc theo yêu cầu của cơ quan nhà nước có thẩm quyền.'],
      ['5. Quyền của bạn', 'Bạn có quyền truy cập, chỉnh sửa, rút lại sự đồng ý và yêu cầu xoá dữ liệu bất cứ lúc nào trong Cài đặt › Xoá tài khoản hoặc qua tổng đài hỗ trợ.'],
    ]],
    terms: ['Thoả thuận người dùng', [
      ['1. Chấp nhận điều khoản', 'Bằng việc đăng ký hoặc sử dụng ứng dụng Mộc Trà, bạn đồng ý với các điều khoản này. Nếu không đồng ý, vui lòng ngừng sử dụng dịch vụ.'],
      ['2. Tài khoản', 'Mỗi số điện thoại chỉ đăng ký một tài khoản. Bạn chịu trách nhiệm bảo mật mã OTP và mọi hoạt động phát sinh từ tài khoản của mình.'],
      ['3. Điểm, tem và voucher', 'Điểm trà, tem và voucher không có giá trị quy đổi thành tiền mặt, không được chuyển nhượng và có thời hạn sử dụng theo từng chương trình.'],
      ['4. Hành vi bị cấm', 'Tạo nhiều tài khoản để trục lợi khuyến mãi, can thiệp hệ thống, hoặc sử dụng ứng dụng cho mục đích trái pháp luật.'],
    ]],
    delivery: ['Điều khoản giao hàng', [
      ['1. Phạm vi giao hàng', `Mộc Trà giao trong bán kính ${App.data.deliveryRadiusKm} km quanh cửa hàng gần nhất. Địa chỉ ngoài phạm vi sẽ được gợi ý chuyển sang Tự đến lấy.`],
      ['2. Phí giao hàng', 'Phí giao hàng 15.000đ; miễn phí cho đơn từ 99.000đ. Phí hiển thị rõ tại bước thanh toán trước khi bạn xác nhận.'],
      ['3. Thời gian giao', 'Thời gian giao dự kiến 25–35 phút kể từ khi cửa hàng nhận đơn; có thể thay đổi do thời tiết, giao thông hoặc giờ cao điểm.'],
      ['4. Huỷ và hoàn tiền', 'Đơn chưa thanh toán tự huỷ sau 15 phút. Đơn đã thanh toán không thể huỷ trên ứng dụng; vui lòng liên hệ cửa hàng. Tiền hoàn (nếu có) về phương thức thanh toán ban đầu trong 1–7 ngày làm việc.'],
      ['5. Kiểm tra khi nhận hàng', 'Vui lòng kiểm tra món khi nhận. Nếu thiếu hoặc sai món, phản hồi trong vòng 2 giờ qua mục Hỗ trợ trên màn Theo dõi đơn hàng.'],
    ]],
  };
  function legalList() {
    const el = App.ui.el(`<section class="ac-page">${header('Điều khoản thoả thuận')}<div class="ac-pbody"><div class="ac-group">
      ${[['privacy', 'Thoả thuận bảo mật'], ['terms', 'Thoả thuận người dùng'], ['delivery', 'Điều khoản giao hàng']].map(([k, t]) => `<button data-doc="${k}"><span>${t}</span>${chev}</button>`).join('')}
    </div></div></section>`);
    el.addEventListener('click', (e) => {
      if (e.target.closest('[data-act="back"]')) return App.nav.pop();
      const d = e.target.closest('[data-doc]')?.dataset.doc;
      if (d) App.nav.push(legalDoc(d));
    });
    return { el, statusBar: 'dark' };
  }
  function legalDoc(k) {
    const [title, secs] = DOCS[k];
    const el = App.ui.el(`<section class="ac-page">${header(title)}<div class="ac-pbody doc">
      <h2>${title} của Mộc Trà</h2><p class="doc-date">Có hiệu lực từ: 01/11/2026 · Cập nhật lần cuối: 01/11/2026</p>
      ${secs.map(([h, t]) => `<h3>${h}</h3><p>${t}</p>`).join('')}
      <p class="doc-end">Mọi thắc mắc, vui lòng liên hệ tổng đài 1900 6868 hoặc email hotro@moctra.vn (thông tin mô phỏng).</p>
    </div></section>`);
    el.addEventListener('click', (e) => { if (e.target.closest('[data-act="back"]')) App.nav.pop(); });
    return { el, statusBar: 'dark' };
  }

  // ---------- câu hỏi thường gặp ----------
  function faq() {
    const QA = [
      ['Làm sao để tích điểm trà?', 'Mỗi 1.000đ thanh toán qua app = 1 điểm trà. Khi mua tại quầy, hãy đưa mã thành viên (QR ở tab Tôi) cho nhân viên trước khi thanh toán.'],
      ['Tem “Sip, Collect, Unlock” khác điểm trà thế nào?', 'Tem tính theo số ly đồ uống (mỗi ly 1 tem) trong thời gian chương trình; điểm trà tính theo số tiền và dùng để xét hạng hội viên.'],
      ['Tôi có thể huỷ đơn đã thanh toán không?', 'Đơn đã thanh toán không huỷ được trên app vì cửa hàng đã bắt đầu pha chế. Bạn có thể gọi cửa hàng ở màn Theo dõi đơn hàng để được hỗ trợ.'],
      ['Thanh toán thất bại nhưng bị trừ tiền?', 'Giao dịch thất bại sẽ không bị trừ tiền. Nếu tài khoản đã bị trừ, tiền sẽ tự hoàn trong 1–3 ngày làm việc tuỳ ngân hàng.'],
      ['Vì sao địa chỉ của tôi “ngoài vùng giao”?', `Mộc Trà giao trong bán kính ${App.data.deliveryRadiusKm} km quanh cửa hàng để đảm bảo đồ uống còn ngon khi tới tay bạn.`],
      ['Làm sao để đổi số điện thoại?', 'Hiện tại mỗi tài khoản gắn với một số điện thoại. Vui lòng liên hệ tổng đài để được hỗ trợ chuyển điểm sang số mới.'],
    ];
    const el = App.ui.el(`<section class="ac-page">${header('Những câu hỏi thường gặp')}<div class="ac-pbody">
      <div class="faq">${QA.map(([q, a], i) => `<div class="fq" data-i="${i}"><button class="fq-q">${q}<i></i></button><div class="fq-a"><p>${a}</p></div></div>`).join('')}</div>
      <button class="ac-logout dark" data-act="call">GỌI TỔNG ĐÀI 1900 6868</button>
    </div></section>`);
    el.addEventListener('click', (e) => {
      if (e.target.closest('[data-act="back"]')) return App.nav.pop();
      if (e.target.closest('[data-act="call"]')) return App.ui.toast('Đang gọi 1900 6868 (mô phỏng)');
      const f = e.target.closest('.fq'); if (f) { App.ui.haptic(3); f.classList.toggle('open'); }
    });
    return { el, statusBar: 'dark' };
  }

  // ======================================================
  // C12 · Thông báo
  // ======================================================
  App.screens.inbox = () => {
    // thông báo mặc định cho POC
    if (!(st().inbox || []).length && !st().inboxSeeded) {
      const t = Date.now() - 86400000;
      App.state.set({ inboxSeeded: true, inbox: [
        { id: 'n1', type: 'promo', title: 'Bạn vừa nhận voucher mới', text: 'Voucher Giảm 50% cho 1 ly bất kỳ đã được thêm vào Kho quà.', at: t, read: false },
        { id: 'n2', type: 'promo', title: 'Giới thiệu chương trình hội viên Mộc Trà', text: 'Tích điểm trà, lên hạng Lá Ngọc để nhận freeship không giới hạn. Chạm để xem quyền lợi!', at: t - 60000, read: false },
      ] });
    }
    let tab = 'all';
    const el = App.ui.el(`<section class="ac-page inbox">${header('Thông báo')}
      <div class="ib-tools"><nav>${[['all', 'Tất cả'], ['order', 'Đơn hàng'], ['promo', 'Ưu đãi']].map(([k, n]) => `<button data-tab="${k}" class="${k === tab ? 'on' : ''}">${n}</button>`).join('')}</nav><button class="ib-read" data-act="readall">Đánh dấu đã đọc</button></div>
      <div class="ac-pbody ib"></div></section>`);
    const body = el.querySelector('.ib');
    const fmt = (ms) => { const d = new Date(ms); const p = (n) => String(n).padStart(2, '0'); return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`; };
    function render() {
      const list = (st().inbox || []).filter((n) => tab === 'all' || n.type === tab);
      body.innerHTML = list.length ? list.map((n) => `
        <button class="ib-row ${n.read ? '' : 'unread'}" data-n="${n.id}">
          <span class="ib-ic ${n.type}">${n.type === 'order' ? I.bag : App.icons.logoMark('#F4EEE2', '#F4EEE2')}</span>
          <span class="ib-t"><b>${n.title}</b><span>${n.text}</span><small>${fmt(n.at)}</small></span>
          ${n.read ? '' : '<i class="ib-dot"></i>'}
        </button>`).join('') : `<div class="ib-empty">${I.bell}<b>Chưa có thông báo</b><p>Thông báo về đơn hàng và ưu đãi sẽ hiển thị ở đây.</p></div>`;
    }
    el.addEventListener('click', (e) => {
      const act = e.target.closest('[data-act]')?.dataset.act;
      if (act === 'back') return App.nav.pop();
      if (act === 'readall') { App.state.set({ inbox: (st().inbox || []).map((n) => ({ ...n, read: true })) }); return render(); }
      const tb = e.target.closest('[data-tab]');
      if (tb) { tab = tb.dataset.tab; el.querySelectorAll('[data-tab]').forEach((b) => b.classList.toggle('on', b === tb)); return render(); }
      const row = e.target.closest('[data-n]');
      if (row) {
        const n = (st().inbox || []).find((x) => x.id === row.dataset.n);
        App.state.set({ inbox: (st().inbox || []).map((x) => (x.id === n.id ? { ...x, read: true } : x)) });
        render();
        if (n.orderId && App.payment.getOrder(n.orderId)) {
          const o = App.payment.getOrder(n.orderId);
          return App.nav.push(o.status === 'paid' ? App.screens.tracking(o.id) : App.screens.orderDetail(o.id));
        }
        if (n.id === 'n1') return App.auth.require(() => App.nav.push(App.screens.rewards()), 'Đăng nhập để xem voucher');
        if (n.id === 'n2') return App.auth.require(() => App.nav.push(App.screens.tiers()), 'Đăng nhập để xem quyền lợi hội viên');
      }
    });
    render();
    return { el, statusBar: 'dark' };
  };
})();
