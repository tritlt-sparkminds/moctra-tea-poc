// C1 · Bắt buộc cập nhật (khi phiên bản app thấp hơn mức tối thiểu admin cấu hình)
App.screens.forceUpdate = () => {
  const { app, brand } = App.config;
  const el = App.ui.el(`
    <section class="force-update">
      <div class="art">
        <div class="badge">
          ${App.icons.logoMark()}
          <span class="ver">v${app.latestVersion}</span>
        </div>
      </div>
      <h2>Đã có phiên bản mới</h2>
      <p>${brand.name} vừa cập nhật để việc đặt món nhanh và ổn định hơn. Vui lòng cập nhật để tiếp tục sử dụng.</p>
      <div class="meta">Phiên bản hiện tại v${app.version} · Mới nhất v${app.latestVersion}</div>
      <button class="btn btn-primary" data-act="update">Cập nhật ngay</button>
    </section>`);

  el.querySelector('[data-act="update"]').addEventListener('click', () => {
    App.ui.toast('Mở App Store (mô phỏng)');
  });

  return { el, statusBar: 'dark' };
};
