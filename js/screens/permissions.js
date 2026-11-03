// C1 · Xin quyền Vị trí và Thông báo — mỗi quyền có màn giải thích lý do trước khi hiện hộp thoại hệ thống
App.screens.permission = (kind, { step, total }) => {
  const { brand } = App.config;
  const C = {
    location: {
      art: artLocation(),
      title: 'Tìm cửa hàng<br/>gần bạn nhất',
      lead: `${brand.name} dùng vị trí để gợi ý cửa hàng gần nhất và tính phí giao hàng chính xác.`,
      points: [
        'Gợi ý cửa hàng gần và thời gian chờ dự kiến',
        'Điền nhanh địa chỉ giao hàng',
        'Chỉ dùng khi bạn đang mở app',
      ],
      cta: 'Cho phép truy cập vị trí',
    },
    notifications: {
      art: artNotifications(),
      title: 'Biết ngay khi<br/>trà đã sẵn sàng',
      lead: 'Nhận thông báo khi đơn được nhận, đang pha, sẵn sàng để lấy hoặc đang giao tới bạn.',
      points: [
        'Cập nhật trạng thái đơn theo thời gian thực',
        'Ưu đãi và món mới (tắt được bất cứ lúc nào)',
      ],
      cta: 'Bật thông báo',
    },
  }[kind];

  const el = App.ui.el(`
    <section class="perm">
      <div class="step">${step}/${total}</div>
      <div class="art">${C.art}</div>
      <h2>${C.title}</h2>
      <p class="lead">${C.lead}</p>
      <ul>${C.points.map((p) => `<li><span class="ic">${App.icons.check}</span><span>${p}</span></li>`).join('')}</ul>
      <div class="actions">
        <button class="btn btn-primary" data-act="allow">${C.cta}</button>
        <button class="btn btn-ghost" data-act="later">Để sau</button>
      </div>
    </section>`);

  const done = () => App.flow.afterPermission(kind);

  el.querySelector('[data-act="later"]').addEventListener('click', done);
  el.querySelector('[data-act="allow"]').addEventListener('click', async () => {
    const result = kind === 'location' ? await askLocation() : await askNotifications();
    App.state.setPermission(kind, result);
    await App.ui.wait(250);
    done();
  });

  return { el, statusBar: 'dark' };

  // ---- hộp thoại hệ thống iOS (mô phỏng) ----
  function askLocation() {
    return App.ui.iosAlert({
      title: `Cho phép “${brand.name}” sử dụng vị trí của bạn?`,
      message: 'Vị trí giúp gợi ý cửa hàng gần nhất, ước tính thời gian chờ và phí giao hàng.',
      extra: `<div class="map">${miniMap()}<span class="precise">${App.icons.locationArrow} Chính xác: Bật</span></div>`,
      layout: 'col',
      buttons: [
        { label: 'Cho phép một lần', value: 'once' },
        { label: 'Cho phép khi dùng ứng dụng', value: 'whenInUse' },
        { label: 'Không cho phép', value: 'denied' },
      ],
    });
  }

  function askNotifications() {
    return App.ui.iosAlert({
      title: `“${brand.name}” muốn gửi thông báo cho bạn`,
      message: 'Thông báo có thể bao gồm cảnh báo, âm thanh và biểu tượng. Bạn có thể định cấu hình những mục này trong Cài đặt.',
      layout: 'row',
      buttons: [
        { label: 'Không cho phép', value: 'denied' },
        { label: 'Cho phép', value: 'granted', bold: true },
      ],
    });
  }

  function miniMap() {
    return `
    <svg viewBox="0 0 250 150" width="100%" height="100%" preserveAspectRatio="xMidYMid slice">
      <rect width="250" height="150" fill="#EEEAE0"/>
      <path d="M0 40 H250 M0 105 H250 M60 0 V150 M170 0 V150" stroke="#fff" stroke-width="9"/>
      <path d="M0 72 C80 60 140 90 250 70 M120 0 C110 60 130 100 115 150" stroke="#fff" stroke-width="5" fill="none"/>
      <rect x="72" y="50" width="38" height="44" rx="3" fill="#DCE5D1"/>
      <rect x="182" y="114" width="60" height="36" fill="#CFE0EC"/>
      <rect x="10" y="114" width="40" height="28" rx="3" fill="#E3DCCB"/>
      <circle cx="125" cy="76" r="26" fill="#007AFF" opacity=".14"/>
      <circle cx="125" cy="76" r="8" fill="#fff"/><circle cx="125" cy="76" r="6" fill="#007AFF"/>
    </svg>`;
  }

  function artLocation() {
    return `
    <div class="art-box">
      <svg viewBox="0 0 300 300" class="bg-svg">
        <defs><clipPath id="pmClip"><circle cx="150" cy="150" r="128"/></clipPath></defs>
        <circle cx="150" cy="150" r="128" fill="#F4EEE2"/>
        <g clip-path="url(#pmClip)" stroke="#fff" fill="none">
          <path d="M0 96 H300 M0 206 H300 M92 0 V300 M214 0 V300" stroke-width="12"/>
          <path d="M0 150 C90 130 190 175 300 140 M150 0 C135 100 170 200 150 300" stroke-width="6"/>
          <rect x="108" y="36" width="88" height="48" rx="6" fill="#E3EADB" stroke="none"/>
          <rect x="226" y="220" width="70" height="60" rx="6" fill="#E7DCC8" stroke="none"/>
          <rect x="22" y="218" width="58" height="56" rx="6" fill="#E3EADB" stroke="none"/>
        </g>
        <!-- 3 cửa hàng -->
        <g fill="#B08D57">
          <circle cx="60" cy="96" r="7"/><circle cx="234" cy="196" r="7"/><circle cx="186" cy="56" r="7"/>
        </g>
        <g fill="#fff"><circle cx="60" cy="96" r="2.6"/><circle cx="234" cy="196" r="2.6"/><circle cx="186" cy="56" r="2.6"/></g>
      </svg>
      <span class="pulse-ring"></span><span class="pulse-ring"></span><span class="pulse-ring"></span>
      <svg viewBox="0 0 64 80" width="64" height="80" style="position:relative;transform:translateY(-24px);filter:drop-shadow(0 10px 12px rgba(31,51,41,.35))">
        <path d="M32 2 C16 2 4 14 4 30 C4 52 32 78 32 78 S60 52 60 30 C60 14 48 2 32 2Z" fill="#1F3329"/>
        <path d="M32 16 C41 22 43 33 32 46 C21 33 23 22 32 16Z" fill="#F4EEE2"/>
      </svg>
    </div>`;
  }

  function artNotifications() {
    const card = (time, title, body, delay, scale, y, op) => `
      <div style="position:absolute;left:50%;top:${y}px;width:330px;margin-left:-165px;transform:scale(${scale});opacity:${op};
        background:rgba(255,255,255,.92);border-radius:22px;padding:12px 14px;display:flex;gap:10px;
        box-shadow:0 12px 30px -12px rgba(31,51,41,.28);font-family:var(--font-ios);
        animation:notifIn .7s cubic-bezier(.32,.72,0,1) ${delay}s both">
        <div style="flex:none;width:38px;height:38px;border-radius:10px;background:#1F3329;display:grid;place-items:center">
          <svg viewBox="0 0 92 92" width="26" height="26"><path d="M46 14 C66 26 70 50 46 78 C22 50 26 26 46 14 Z" fill="#F4EEE2"/></svg>
        </div>
        <div style="flex:1;min-width:0">
          <div style="display:flex;justify-content:space-between;font-size:14px;font-weight:600;color:#000">
            <span>${title}</span><span style="font-weight:400;color:#8a8a8e;font-size:12px">${time}</span>
          </div>
          <div style="font-size:13px;color:#1c1c1e;line-height:1.35;margin-top:2px">${body}</div>
        </div>
      </div>`;
    return `
      <style>@keyframes notifIn{from{opacity:0;transform:translateY(-24px) scale(.96)}}</style>
      <div class="art-box" style="width:100%;display:block">
        <svg viewBox="0 0 300 300" width="280" height="280" style="position:absolute;left:50%;margin-left:-140px;top:0">
          <circle cx="150" cy="150" r="128" fill="#F4EEE2"/>
          <g class="bell-swing" fill="none" stroke="#D9C29A" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" opacity=".7">
            <path d="M110 190 V150 a40 40 0 0 1 80 0 V190 l12 14 H98 Z"/><path d="M138 220 a12 12 0 0 0 24 0"/>
          </g>
        </svg>
        ${card('bây giờ', brand.name, 'Đơn #A128 đã sẵn sàng! Mời bạn đến quầy nhận nhé 🍃', 0.25, 1, 92, 1)}
        ${card('5 phút trước', brand.name, 'Cửa hàng đã nhận đơn và đang pha cho bạn.', 0.1, 0.92, 168, 0.75)}
      </div>`;
  }
};
