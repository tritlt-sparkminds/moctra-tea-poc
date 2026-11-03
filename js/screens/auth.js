// C10 · Đăng nhập / OTP (dạng bottom sheet như mẫu) + màn "Cá nhân"
// Sheet CHÀO MỪNG (SĐT, mã giới thiệu, tiếp thị, điều khoản) → sheet Nhập mã bảo mật (bàn phím số, đếm ngược)
// → vào thẳng app (người mới bổ sung thông tin sau ở màn Cá nhân).
// App.auth.require(cb, reason): chưa đăng nhập thì mở sheet; xong gọi cb.
App.auth = (() => {
  const st = () => App.state.get();
  const back = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 5l-7 7 7 7"/></svg>';
  const closeIc = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>';
  const apple = '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M16.4 12.6c0-2.4 2-3.6 2.1-3.7-1.1-1.7-2.9-1.9-3.5-1.9-1.5-.2-2.9.9-3.7.9-.8 0-1.9-.9-3.2-.8-1.6 0-3.1 1-4 2.4-1.7 3-.4 7.4 1.2 9.8.8 1.2 1.8 2.5 3 2.4 1.2 0 1.7-.8 3.1-.8 1.5 0 1.9.8 3.2.8 1.3 0 2.1-1.2 2.9-2.4.9-1.3 1.3-2.7 1.3-2.8-.1 0-2.4-.9-2.4-3.9zM14 5.4c.7-.8 1.1-1.9 1-3-1 0-2.1.7-2.8 1.5-.6.7-1.2 1.8-1 2.9 1.1.1 2.1-.6 2.8-1.4z"/></svg>';
  const mail = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"><rect x="3" y="5.5" width="18" height="13" rx="1.5" fill="#E8F0FB"/><path d="M3.5 6.5l8.5 6.5 8.5-6.5"/></svg>';
  const chevD = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9l6 6 6-6"/></svg>';
  const del = '<svg viewBox="0 0 28 20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"><path d="M9 2h16a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1H9L2 10z"/><path d="M13 7l6 6M19 7l-6 6" stroke-linecap="round"/></svg>';

  // tài khoản đã có (POC) — số khác coi như người dùng mới
  const KNOWN = { '901234567': { name: 'Minh Anh' } };
  const CODES = [['+84', 'Việt Nam', '🇻🇳', 9], ['+65', 'Singapore', '🇸🇬', 8], ['+60', 'Malaysia', '🇲🇾', 9], ['+66', 'Thái Lan', '🇹🇭', 9], ['+62', 'Indonesia', '🇮🇩', 10], ['+63', 'Philippines', '🇵🇭', 10], ['+82', 'Hàn Quốc', '🇰🇷', 10]];

  // ---------- áp hồ sơ đã lưu lên dữ liệu hội viên ----------
  const M = App.data.member;
  const DEFAULT = { name: M.name, phone: M.phone, tier: M.tier, nextTier: M.nextTier, points: M.points, nextTierAt: M.nextTierAt };
  function applyProfile() {
    const p = st().profile;
    Object.assign(M, DEFAULT);
    if (p) {
      M.name = p.name || 'Thành viên mới';
      if (p.phone) M.phone = `0${p.phone.slice(0, 2)} *** ${p.phone.slice(-4)}`;
      // hội viên mới: hạng khởi đầu, 0 điểm
      if (p.isNew) Object.assign(M, { tier: 'Lá Non', nextTier: 'Lá Xanh', points: 0, nextTierAt: 500 });
    }
    // số dư = điểm tích luỹ − điểm đã đổi (hạng vẫn xét theo điểm tích luỹ)
    M.points = Math.max(0, M.points - (st().pointsSpent || 0));
  }
  applyProfile();
  App.state.subscribe(applyProfile);
  // hồ sơ hiện tại (tài khoản mặc định chưa có profile → dựng từ dữ liệu mẫu)
  const profile = () => st().profile || { name: DEFAULT.name, phone: '901234567' };

  let flow = null; // { cb, wrap }

  function require(cb, reason) {
    if (st().isMember) return cb && cb();
    flow = { cb };
    openLogin(reason);
  }

  async function finish(p, isNew) {
    App.state.set({ isMember: true, profile: p });
    applyProfile();
    const f = flow; flow = null;
    if (f && f.wrap) await closeWrap(f.wrap);
    if (isNew) welcomeSheet(f && f.cb);
    else { App.ui.toast(`Chào mừng trở lại, ${p.name}!`); f && f.cb && f.cb(); }
  }

  function logout() { App.state.set({ isMember: false, profile: null }); App.ui.toast('Đã đăng xuất'); }

  function closeWrap(wrap) {
    return new Promise((r) => { wrap.classList.add('closing'); setTimeout(() => { wrap.remove(); r(); }, 330); });
  }

  // ======================================================
  // Sheet CHÀO MỪNG
  // ======================================================
  function openLogin(reason) {
    let code = CODES[0];
    let marketing = true, agree = false;
    const wrap = App.ui.el(`
      <div class="lg-wrap">
        <div class="lg-dim"></div>
        <div class="lg-sheet lg-1">
          <div class="lg-h"><h2>CHÀO MỪNG</h2><button class="lg-x" data-act="close" aria-label="Đóng">${closeIc}</button></div>
          <i class="lg-ul"></i>
          ${reason ? `<p class="lg-reason">${App.icons.ic.gift}${reason}</p>` : ''}
          <div class="lg-row">
            <button class="lg-cc" data-act="cc"><span>${code[0]}</span>${chevD}</button>
            <label class="lg-in"><input data-f="phone" type="tel" inputmode="numeric" placeholder="Số điện thoại" maxlength="12" autocomplete="tel-national"/></label>
          </div>
          <p class="lg-err" data-e="phone"></p>
          <label class="lg-in full"><input data-f="ref" placeholder="Mã giới thiệu (Tuỳ chọn)" maxlength="12" autocapitalize="characters"/></label>
          <p class="lg-err" data-e="ref"></p>
          <button class="lg-go" data-act="go" disabled>TIẾP TỤC</button>
          <div class="lg-alt">
            <button data-act="email" aria-label="Đăng nhập bằng email">${mail}</button>
            <button data-act="apple" aria-label="Đăng nhập bằng Apple">${apple}</button>
          </div>
          <button class="lg-ck" data-act="mk"><i class="cbx on"></i><span><b>Thông tin tiếp thị</b>Tôi muốn nhận thông tin tiếp thị qua email, tin nhắn văn bản và/hoặc cuộc gọi điện thoại</span></button>
          <button class="lg-ck" data-act="agree"><i class="cbx"></i><span>Tôi xác nhận rằng tôi đã đọc và chấp nhận <u>Điều khoản sử dụng</u> và <u>Chính sách bảo mật</u></span></button>
          <p class="lg-tip">Dùng thử: <b>90 123 4567</b> là tài khoản đã có (Minh Anh); số khác sẽ tạo tài khoản mới.</p>
        </div>
      </div>`);
    flow = flow || {};
    flow.wrap = wrap;
    const $ = (q) => wrap.querySelector(q);
    const phoneIn = $('[data-f="phone"]');
    const digits = () => phoneIn.value.replace(/\D/g, '').replace(/^0/, '');
    const valid = () => (code[0] === '+84' ? /^[35789]\d{8}$/.test(digits()) : digits().length >= code[3] - 1 && digits().length <= code[3]);
    const paint = () => { $('.lg-go').disabled = !(valid() && agree); };

    phoneIn.addEventListener('input', () => {
      phoneIn.value = phoneIn.value.replace(/\D/g, '').slice(0, code[3] + 1);
      $('[data-e="phone"]').textContent = ''; phoneIn.parentElement.classList.remove('bad');
      paint();
    });
    phoneIn.addEventListener('blur', () => {
      if (phoneIn.value && !valid()) { $('[data-e="phone"]').textContent = 'Số điện thoại chưa đúng định dạng'; phoneIn.parentElement.classList.add('bad'); }
    });
    $('[data-f="ref"]').addEventListener('input', (e) => { e.target.value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''); $('[data-e="ref"]').textContent = ''; });

    wrap.addEventListener('click', async (e) => {
      if (e.target.classList.contains('lg-dim')) return cancel();
      if (e.target.closest('.lg-2')) return; // sheet OTP tự xử lý
      const act = e.target.closest('[data-act]')?.dataset.act;
      if (act === 'close') return cancel();
      if (act === 'cc') {
        const k = await codeSheet(code[0]);
        if (k) { code = CODES.find((c) => c[0] === k); $('.lg-cc span').textContent = code[0]; paint(); }
        return;
      }
      if (act === 'mk') { marketing = !marketing; $('[data-act="mk"] .cbx').classList.toggle('on', marketing); return; }
      if (act === 'agree') { agree = !agree; $('[data-act="agree"] .cbx').classList.toggle('on', agree); return paint(); }
      if (act === 'email') return App.ui.toast('Đăng nhập bằng email · sẽ có ở bản sau (POC dùng số điện thoại)');
      if (act === 'apple') {
        if (!agree) { const b = $('[data-act="agree"]'); b.classList.remove('shake'); void b.offsetWidth; b.classList.add('shake'); return App.ui.toast('Vui lòng chấp nhận Điều khoản trước'); }
        return appleSheet();
      }
      if (act === 'go' && valid() && agree) {
        const ref = $('[data-f="ref"]').value;
        if (ref && !/^[A-Z0-9]{6,12}$/.test(ref)) { $('[data-e="ref"]').textContent = 'Mã giới thiệu gồm 6–12 chữ/số'; return; }
        App.ui.haptic(8);
        const go = $('.lg-go'); go.textContent = 'ĐANG GỬI MÃ…'; go.disabled = true;
        await App.ui.wait(600);
        go.textContent = 'TIẾP TỤC'; paint();
        openOtp(wrap, { cc: code[0], phone: digits(), ref: ref || null, marketing });
      }
    });
    function cancel() { flow = null; closeWrap(wrap); }
    document.getElementById('overlay').appendChild(wrap);
    setTimeout(() => phoneIn.focus(), 450);
  }

  // chọn mã vùng
  function codeSheet(cur) {
    return new Promise((resolve) => {
      let picked = null;
      const sh = App.ui.sheet(`
        <div class="ps">
          <div class="ps-h"><h3>Mã quốc gia</h3></div>
          <div class="ps-list">${CODES.map(([c, n, f]) => `<button class="ps-row ${c === cur ? 'on' : ''}" data-k="${c}"><span class="ps-flag">${f}</span><span class="ps-n">${n}</span><b class="ps-code">${c}</b><i class="radio"></i></button>`).join('')}</div>
        </div>`, { onClose: () => resolve(picked) });
      sh.el.style.zIndex = 960;
      sh.el.querySelectorAll('[data-k]').forEach((b) => (b.onclick = () => { picked = b.dataset.k; App.ui.haptic(4); sh.close(); }));
    });
  }

  // ======================================================
  // Sheet Nhập mã bảo mật (chồng lên sheet CHÀO MỪNG)
  // ======================================================
  function openOtp(wrap, info) {
    let code = '', val = '', tries = 0, locked = 0, resendAt = 0;
    const sheet = App.ui.el(`
      <div class="lg-sheet lg-2">
        <div class="otp2-h"><button class="lg-back" data-act="back" aria-label="Quay lại">${back}</button><h2>Nhập mã bảo mật</h2></div>
        <i class="lg-ul r"></i>
        <p class="otp2-sub">Chúng tôi đã gửi tin nhắn đến <b>${info.cc} ${info.phone}</b>, vui lòng điền mã bảo mật.</p>
        <div class="otp2-cells">${Array.from({ length: 6 }, (_, i) => `<span data-i="${i}"></span>`).join('')}</div>
        <p class="otp2-msg"></p>
        <p class="otp2-cd"></p>
        <button class="lg-go" data-act="ok" disabled>TIẾP TỤC</button>
        <div class="kb">
          <button class="kb-sug" data-act="sug"><small>Từ Tin nhắn</small><b></b></button>
          <div class="kb-keys">
            ${[['1', ''], ['2', 'ABC'], ['3', 'DEF'], ['4', 'GHI'], ['5', 'JKL'], ['6', 'MNO'], ['7', 'PQRS'], ['8', 'TUV'], ['9', 'WXYZ']].map(([n, l]) => `<button data-k="${n}"><b>${n}</b><small>${l}</small></button>`).join('')}
            <span></span><button data-k="0"><b>0</b></button><button class="kb-del" data-k="del" aria-label="Xoá">${del}</button>
          </div>
        </div>
      </div>`);
    const $ = (q) => sheet.querySelector(q);
    const cells = [...sheet.querySelectorAll('.otp2-cells span')];

    function send() {
      code = String(Math.floor(100000 + Math.random() * 900000));
      resendAt = Date.now() + 60000;
      $('.kb-sug b').textContent = code;
      sheet.classList.remove('sms');
      setTimeout(() => {
        if (!sheet.isConnected) return;
        App.payment.notify('Tin nhắn · MOCTRA', `Mã bảo mật Mộc Trà của bạn là ${code}. Mã có hiệu lực 5 phút. Không chia sẻ mã này với bất kỳ ai.`, () => fill(code));
        sheet.classList.add('sms');
      }, 1100);
    }
    function paint() {
      cells.forEach((c, i) => { c.textContent = val[i] || ''; c.classList.toggle('fill', !!val[i]); });
      $('[data-act="ok"]').disabled = val.length < 6;
    }
    function tick() {
      const cd = $('.otp2-cd');
      if (locked > Date.now()) { cd.innerHTML = `Tạm khoá · thử lại sau ${Math.ceil((locked - Date.now()) / 1000)}S`; return; }
      const left = Math.ceil((resendAt - Date.now()) / 1000);
      cd.innerHTML = left > 0 ? `${left}S` : '<button class="otp2-resend" data-act="resend">Gửi lại mã</button>';
    }
    function fill(v) { val = v; paint(); verify(); }
    function key(k) {
      if (locked > Date.now()) return;
      App.ui.haptic(3);
      sheet.classList.remove('bad'); $('.otp2-msg').textContent = '';
      if (k === 'del') val = val.slice(0, -1); else if (val.length < 6) val += k;
      paint();
      if (val.length === 6) verify();
    }
    async function verify() {
      if (val.length < 6 || sheet.classList.contains('checking')) return;
      sheet.classList.add('checking');
      await App.ui.wait(600);
      sheet.classList.remove('checking');
      if (val === code) {
        sheet.classList.add('ok'); App.ui.haptic(10);
        stop();
        await App.ui.wait(300);
        App.state.set({ marketing: { on: info.marketing, app: info.marketing, email: info.marketing, sms: info.marketing } });
        const known = KNOWN[info.phone] && info.cc === '+84';
        return finish(known ? { name: KNOWN[info.phone].name, phone: info.phone }
          : { name: '', phone: info.phone, cc: info.cc, ref: info.ref, isNew: true, gender: null, dob: null, email: null }, !known);
      }
      tries++;
      App.ui.haptic([30, 50, 30]);
      sheet.classList.remove('bad'); void sheet.offsetWidth; sheet.classList.add('bad');
      if (tries >= 5) { locked = Date.now() + 60000; tries = 0; $('.otp2-msg').textContent = 'Bạn đã nhập sai 5 lần. Vui lòng thử lại sau 60 giây.'; }
      else $('.otp2-msg').textContent = `Mã bảo mật không đúng. Bạn còn ${5 - tries} lần thử.`;
      setTimeout(() => { val = ''; paint(); }, 450);
    }
    function stop() { clearInterval(timer); document.removeEventListener('keydown', onKey); }

    sheet.addEventListener('click', (e) => {
      const k = e.target.closest('[data-k]')?.dataset.k;
      if (k) return key(k);
      const act = e.target.closest('[data-act]')?.dataset.act;
      if (act === 'back') { stop(); sheet.classList.add('out'); wrap.classList.remove('stacked'); return setTimeout(() => sheet.remove(), 330); }
      if (act === 'sug') { App.ui.haptic(5); return fill(code); }
      if (act === 'ok') return verify();
      if (act === 'resend') { send(); tick(); App.ui.toast('Đã gửi lại mã'); }
    });
    // bàn phím thật (khi xem trên máy tính)
    const onKey = (e) => {
      if (!sheet.isConnected) return stop();
      if (/^\d$/.test(e.key)) key(e.key); else if (e.key === 'Backspace') key('del');
    };
    document.addEventListener('keydown', onKey);
    const timer = setInterval(() => { if (!sheet.isConnected) return stop(); tick(); }, 500);

    wrap.appendChild(sheet);
    wrap.classList.add('stacked');
    if (document.activeElement) document.activeElement.blur();
    send(); paint(); tick();
  }

  // Sign in with Apple (mô phỏng sheet hệ thống)
  function appleSheet() {
    const sh = App.ui.sheet(`
      <div class="ap-sheet">
        <div class="aps-h">${apple}<b>Đăng nhập bằng Apple</b></div>
        <p>Tạo tài khoản Mộc Trà bằng Apple ID của bạn.</p>
        <div class="aps-row"><small>TÊN</small><b>Minh Anh</b></div>
        <div class="aps-row"><small>EMAIL</small><b>Ẩn email của tôi</b><em>Chuyển tiếp tới email iCloud</em></div>
        <button class="aps-go">${apple}Tiếp tục</button>
      </div>`);
    sh.el.style.zIndex = 960;
    sh.el.querySelector('.aps-go').onclick = async () => {
      const b = sh.el.querySelector('.aps-go');
      b.innerHTML = '<span class="faceid"><i></i></span>Face ID'; b.disabled = true;
      await App.ui.wait(1200);
      sh.close();
      setTimeout(() => finish({ name: 'Minh Anh', phone: null, isNew: true, via: 'apple', email: null }, true), 300);
    };
  }

  // ======================================================
  // Chào mừng người dùng mới
  // ======================================================
  function welcomeSheet(cb) {
    const p = st().profile || {};
    const sh = App.ui.sheet(`
      <div class="wc">
        <div class="cs-burst">${Array.from({ length: 12 }, (_, i) => `<i style="--a:${i * 30}deg"></i>`).join('')}<span>${App.icons.ic.gift}</span></div>
        <h3>Chào mừng ${p.name || 'bạn'} đến Mộc Trà!</h3>
        <p>Bạn đã là hội viên. Quà chào mừng của chương trình <b>“Sip, Collect, Unlock”</b> đang chờ bạn:</p>
        <div class="cs-list">
          <div class="cs-t" style="--i:0"><b>Giảm 50%</b><small>Cho 1 ly bất kỳ</small></div>
          <div class="cs-t" style="--i:1"><b>Mua 1 Tặng 1 Trà Trái Cây</b><small>Áp dụng nhóm Trà Trái Cây</small></div>
        </div>
        <button class="cs-btn" data-go="1">NHẬN QUÀ NGAY</button>
        <button class="wc-later" data-prof="1">Cập nhật thông tin cá nhân để nhận quà sinh nhật ›</button>
      </div>`, { onClose: () => cb && cb() });
    sh.el.querySelector('[data-go]').onclick = () => { sh.close(); setTimeout(() => App.nav.push(App.screens.stamps({ onOrder: () => App.goTab && App.goTab('order') })), 300); };
    sh.el.querySelector('[data-prof]').onclick = () => { sh.close(); setTimeout(() => App.nav.push(App.screens.personal()), 300); };
  }

  // ======================================================
  // Màn "Cá nhân"
  // ======================================================
  const AVATARS = [['leaf', '#1F3329'], ['peach', '#E98A55'], ['berry', '#B5462E'], ['matcha', '#6E8B3D'], ['sky', '#4A7FA8'], ['sand', '#B08D57']];
  const avatarHTML = (id) => { const a = AVATARS.find((x) => x[0] === id) || AVATARS[0]; return `<span class="av" style="background:${a[1]}">${App.icons.logoMark('#F4EEE2', '#F4EEE2')}</span>`; };

  function editSheet({ title, html, onSubmit }) {
    const sh = App.ui.sheet(`
      <div class="es">
        <div class="ps-h"><h3>${title}</h3></div>
        ${html}
        <p class="es-err"></p>
        <button class="ps-go">GỬI</button>
      </div>`);
    const err = (t) => (sh.el.querySelector('.es-err').textContent = t || '');
    sh.el.querySelector('.ps-go').onclick = async () => { const r = await onSubmit(sh.el, err); if (r !== false) sh.close(); };
    const f = sh.el.querySelector('input');
    if (f) setTimeout(() => f.focus(), 380);
    return sh;
  }

  App.screens.personal = () => {
    const el = App.ui.el(`
      <section class="ac-page pn">
        <header class="ac-nav"><button class="ac-back" data-act="back" aria-label="Quay lại">${back}</button><h1>Cá nhân</h1><span></span></header>
        <div class="ac-pbody pn-body"></div>
      </section>`);
    const body = el.querySelector('.pn-body');
    const save = (patch) => { App.state.set({ profile: { ...profile(), ...patch } }); render(); App.ui.toast('Đã cập nhật'); };
    const mask = (p) => (p ? `${p.slice(0, 2)}****${p.slice(-3)}` : 'Chưa liên kết');

    function render() {
      const p = profile();
      body.innerHTML = `
        <div class="pn-group">
          <button data-act="name"><span>Tên</span><em class="${p.name ? '' : 'ph'}">${p.name || 'Điền'}</em>${App.icons.ic.chevron}</button>
          <button data-act="avatar"><span>Ảnh đại diện</span>${avatarHTML(p.avatar)}${App.icons.ic.chevron}</button>
          <button data-act="phone"><span>Số điện thoại</span><em>${mask(p.phone)}</em>${App.icons.ic.chevron}</button>
          <button data-act="gender"><span>Giới tính</span><em class="${p.gender ? '' : 'ph'}">${p.gender || 'Không muốn tiết lộ'}</em>${App.icons.ic.chevron}</button>
          <button data-act="dob" class="${p.dob ? 'locked' : ''}"><span>Sinh nhật</span><em class="${p.dob ? '' : 'warn'}">${p.dob || 'Không thể thay đổi sau khi chọn'}</em>${p.dob ? '' : App.icons.ic.chevron}</button>
          <button data-act="email"><span>Email</span><em class="${p.email ? '' : 'ph'}">${p.email || 'Điền'}</em>${App.icons.ic.chevron}</button>
          <div class="pn-static"><span>Khu vực đăng ký</span><em>Việt Nam</em></div>
        </div>
        <p class="pn-note">Ngày sinh dùng để gửi quà sinh nhật hằng năm và chỉ chọn được một lần.</p>`;
    }

    el.addEventListener('click', async (e) => {
      const act = e.target.closest('[data-act]')?.dataset.act;
      const p = profile();
      switch (act) {
        case 'back': return App.nav.pop();
        case 'name':
          return editSheet({ title: 'Tên', html: `<input class="es-in" maxlength="30" placeholder="Điền tên của bạn" value="${p.name || ''}"/>`,
            onSubmit: (s, err) => { const v = s.querySelector('input').value.trim().replace(/\s+/g, ' '); if (v.length < 2 || !/^[\p{L} ]+$/u.test(v)) { err('Tên gồm ít nhất 2 chữ cái'); return false; } save({ name: v }); } });
        case 'avatar': {
          const sh = editSheet({ title: 'Ảnh đại diện', html: `
            <div class="es-photo"><button data-ph="cam">📷 Chụp ảnh</button><button data-ph="lib">🖼 Chọn từ thư viện</button></div>
            <p class="es-cap">Hoặc chọn biểu tượng</p>
            <div class="es-avs">${AVATARS.map(([id]) => `<button data-av="${id}" class="${(p.avatar || 'leaf') === id ? 'on' : ''}">${avatarHTML(id)}</button>`).join('')}</div>`,
            onSubmit: (s) => { const on = s.querySelector('[data-av].on'); save({ avatar: on ? on.dataset.av : 'leaf' }); } });
          sh.el.addEventListener('click', (ev) => {
            const b = ev.target.closest('[data-av]'); if (b) { sh.el.querySelectorAll('[data-av]').forEach((x) => x.classList.toggle('on', x === b)); return; }
            const ph = ev.target.closest('[data-ph]'); if (ph) App.ui.toast(ph.dataset.ph === 'cam' ? 'Cần quyền Máy ảnh (mô phỏng)' : 'Cần quyền Album ảnh (mô phỏng)');
          });
          return;
        }
        case 'phone':
          return App.ui.iosAlert({ title: 'Đổi số điện thoại', message: 'Số điện thoại là định danh tài khoản. Vui lòng liên hệ tổng đài 1900 6868 để được hỗ trợ chuyển điểm sang số mới.', buttons: [{ label: 'Đóng', value: 0 }, { label: 'Gọi tổng đài', value: 1, bold: true }] })
            .then((v) => v && App.ui.toast('Đang gọi 1900 6868 (mô phỏng)'));
        case 'gender': {
          const opts = ['Nam', 'Nữ', 'Không muốn tiết lộ'];
          const sh = editSheet({ title: 'Giới tính', html: `<div class="ps-list">${opts.map((g) => `<button class="ps-row ${(p.gender || 'Không muốn tiết lộ') === g ? 'on' : ''}" data-g="${g}"><span class="ps-n">${g}</span><i class="radio"></i></button>`).join('')}</div>`,
            onSubmit: (s) => { const g = s.querySelector('[data-g].on').dataset.g; save({ gender: g === 'Không muốn tiết lộ' ? null : g }); } });
          sh.el.addEventListener('click', (ev) => { const b = ev.target.closest('[data-g]'); if (b) sh.el.querySelectorAll('[data-g]').forEach((x) => x.classList.toggle('on', x === b)); });
          return;
        }
        case 'dob': {
          if (p.dob) return App.ui.toast('Ngày sinh đã được xác nhận và không thể thay đổi');
          const yNow = new Date().getFullYear();
          const sel = (n, from, to, cur, label) => `<label><small>${label}</small><select data-d="${n}">${Array.from({ length: to - from + 1 }, (_, i) => from + i).map((v) => `<option value="${v}" ${v === cur ? 'selected' : ''}>${String(v).padStart(2, '0')}</option>`).join('')}</select></label>`;
          return editSheet({ title: 'Sinh nhật', html: `
            <div class="es-date">${sel('d', 1, 31, 15, 'Ngày')}${sel('m', 1, 12, 8, 'Tháng')}${sel('y', yNow - 90, yNow - 10, 1998, 'Năm')}</div>
            <p class="es-warn">⚠︎ Ngày sinh không thể thay đổi sau khi xác nhận.</p>`,
            onSubmit: async (s, err) => {
              const [d, m, y] = ['d', 'm', 'y'].map((k) => +s.querySelector(`[data-d="${k}"]`).value);
              const dt = new Date(y, m - 1, d);
              if (dt.getDate() !== d) { err('Ngày không hợp lệ'); return false; }
              const label = `${String(d).padStart(2, '0')}/${String(m).padStart(2, '0')}/${y}`;
              const ok = await App.ui.iosAlert({ title: `Xác nhận ngày sinh ${label}?`, message: 'Bạn sẽ không thể thay đổi ngày sinh sau khi xác nhận.', buttons: [{ label: 'Huỷ', value: false }, { label: 'Xác nhận', value: true, bold: true }] });
              if (!ok) return false;
              save({ dob: label });
            } });
        }
        case 'email':
          return editSheet({ title: 'Email', html: `<input class="es-in" type="email" inputmode="email" maxlength="60" placeholder="vd: minhanh@gmail.com" value="${p.email || ''}"/>`,
            onSubmit: (s, err) => { const v = s.querySelector('input').value.trim(); if (!/^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(v)) { err('Email chưa đúng định dạng'); return false; } save({ email: v }); } });
      }
    });
    render();
    return { el, statusBar: 'dark' };
  };

  return { require, logout, applyProfile, avatarHTML, profile };
})();
