// Bảng điều khiển POC (bên ngoài điện thoại) — để reviewer thử các nhánh của luồng
App.pocPanel = (() => {
  const features = [
    ['C1', 'Splash / Onboarding / Xin quyền', 'done'],
    ['C2', 'Trang chủ', 'done'],
    ['C3', 'Chọn cửa hàng / Địa chỉ giao', 'done'],
    ['C4', 'Menu đặt món', 'done'],
    ['C5', 'Chi tiết món', 'done'],
    ['C6', 'Giỏ hàng & Thanh toán (+ chờ thanh toán / huỷ đơn)', 'done'],
    ['C7', 'Kết quả thanh toán', 'done'],
    ['C8', 'Theo dõi đơn', 'done'],
    ['C9', 'Đơn hàng (lịch sử đặt hàng)', 'done'],
    ['C10', 'Đăng nhập / OTP', 'done'],
    ['C11', 'Hạng hội viên & Điểm trà (đổi voucher)', 'current'],
    ['C12', 'Thông báo', 'current'],
    ['C13', 'Tài khoản', 'current'],
    ['C14', 'Trang phụ (cài đặt, điều khoản, FAQ)', 'current'],
    ['C15', 'Sổ địa chỉ', 'current'],
  ];

  function render() {
    const st = App.state.get();
    const panel = document.getElementById('pocPanel');
    panel.innerHTML = `
      <h1>Customer App · POC</h1>
      <p class="sub">iPhone 17 Pro Max · 440×956 pt · mô phỏng native trên web</p>

      <div class="card">
        <h2>Kịch bản thử</h2>
        <button data-act="fresh">↺ Mở app lần đầu (cài mới)</button>
        <button data-act="again">↻ Mở lại app (đã dùng trước đó)</button>
        <label><input type="checkbox" data-act="outdated" ${st.simulateOutdated ? 'checked' : ''}/> Phiên bản cũ → bắt buộc cập nhật</label>
      </div>

      <div class="card">
        <h2>Dữ liệu demo</h2>
        <label><input type="checkbox" data-act="member" ${st.isMember ? 'checked' : ''}/> Đã đăng nhập (hội viên)${st.isMember && st.profile ? ` · ${st.profile.name}` : ''}</label>
        <label><input type="checkbox" data-act="active" ${st.hasActiveOrder ? 'checked' : ''}/> Có đơn đang xử lý</label>
        <label><input type="checkbox" data-act="locDenied" ${st.permissions.location === 'denied' ? 'checked' : ''}/> Từ chối quyền vị trí (C3)</label>
        <button data-act="resetStamps">↺ Đặt lại tem, điểm đã đổi & Kho quà (${(st.rewards || []).length} quà)</button>
        <label style="display:block;margin:8px 0 4px">Kết quả thanh toán mô phỏng (C7)</label>
        <select data-act="payResult" style="width:100%;padding:7px 8px;border-radius:8px;border:1px solid rgba(0,0,0,.12);font:inherit;margin-bottom:6px">
          ${[['success', 'Thành công'], ['declined', 'Thất bại · thẻ bị từ chối'], ['insufficient', 'Thất bại · không đủ số dư'], ['timeout', 'Thất bại · hết thời gian xác thực']]
            .map(([v, n]) => `<option value="${v}" ${(st.simPayResult || 'success') === v ? 'selected' : ''}>${n}</option>`).join('')}
        </select>
                <button data-act="clearCards">💳 Xoá thẻ đã lưu (${(st.savedCards || []).length} thẻ)</button>
        <button data-act="seedOrders">＋ Tạo lịch sử đơn mẫu (hoàn tất / đã huỷ)</button>
        <button data-act="clearOrders">🗑 Xoá lịch sử đơn (${(st.orders || []).length} đơn)</button>
        <button data-act="clearCart" style="margin-top:8px">🗑 Làm trống giỏ hàng (${(st.cart || []).reduce((n, l) => n + l.qty, 0)} món)</button>
      </div>

      <div class="card">
        <h2>Trạng thái thiết bị</h2>
        <div class="kv">
          <span>Đã xem onboarding</span><span>${st.onboarded ? 'Có' : 'Chưa'}</span>
          <span>Quyền vị trí</span><span>${st.permissions.location}</span>
          <span>Quyền thông báo</span><span>${st.permissions.notifications}</span>
        </div>
      </div>

      <div class="card">
        <h2>Tiến độ chức năng</h2>
        <ol>${features.map(([c, n, s]) => `<li class="${s === 'todo' ? 'todo' : 'done'}">${c} · ${n}${s === 'current' ? ' — đang duyệt' : s === 'done' ? ' ✓' : ''}</li>`).join('')}</ol>
      </div>`;

    panel.querySelector('[data-act="fresh"]').onclick = () => {
      App.state.reset({ simulateOutdated: App.state.get().simulateOutdated });
      App.flow.start();
    };
    panel.querySelector('[data-act="again"]').onclick = () => App.flow.start();
    panel.querySelector('[data-act="member"]').onchange = (e) => (e.target.checked ? App.state.set({ isMember: true }) : App.state.set({ isMember: false, profile: null }));
    panel.querySelector('[data-act="active"]').onchange = (e) => App.state.set({ hasActiveOrder: e.target.checked });
    panel.querySelector('[data-act="locDenied"]').onchange = (e) => App.state.setPermission('location', e.target.checked ? 'denied' : 'granted');
    panel.querySelector('[data-act="resetStamps"]').onclick = () => App.state.set({ claimedMilestones: [], rewards: [], appliedReward: null, pointsSpent: 0, redeems: [], vouchersSeeded: false });
    panel.querySelector('[data-act="payResult"]').onchange = (e) => App.state.set({ simPayResult: e.target.value });
    panel.querySelector('[data-act="clearCards"]').onclick = () => App.state.set({ savedCards: [] });
    panel.querySelector('[data-act="seedOrders"]').onclick = () => App.payment.seedHistory();
    panel.querySelector('[data-act="clearOrders"]').onclick = () => App.state.set({ orders: [] });
    panel.querySelector('[data-act="clearCart"]').onclick = () => { App.state.set({ cart: [] }); };
    panel.querySelector('[data-act="outdated"]').onchange = (e) => {
      App.state.set({ simulateOutdated: e.target.checked });
      App.flow.start();
    };
  }

  return {
    init() { render(); App.state.subscribe(render); App.device.fit(); },
  };
})();
