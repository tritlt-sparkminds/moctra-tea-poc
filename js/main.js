// Luồng khởi động C1:
// mở app → Splash (kiểm tra phiên bản) → [quá cũ: Bắt buộc cập nhật]
//        → lần đầu: Onboarding → xin quyền Vị trí → xin quyền Thông báo → Trang chủ
//        → lần sau: Trang chủ (không bắt đăng nhập)
App.flow = (() => {
  const S = App.screens;
  const pendingPermissions = () => {
    const p = App.state.get().permissions;
    return ['location', 'notifications'].filter((k) => p[k] === 'notDetermined');
  };
  let queue = [];
  let total = 0;

  function nextPermissionOrHome() {
    const kind = queue.shift();
    if (!kind) return App.nav.root(S.mainTabs(), { anim: 'zoom' });
    const step = total - queue.length;
    // màn xin quyền đầu tiên đẩy vào từ phải, các màn sau cũng vậy
    App.nav.push(S.permission(kind, { step, total }));
  }

  return {
    start() {
      App.nav.clear();
      document.getElementById('overlay').innerHTML = '';
      App.nav.root(S.splash(), { anim: 'fade' });
    },
    afterSplash() {
      const st = App.state.get();
      if (st.simulateOutdated) return App.nav.root(S.forceUpdate(), { anim: 'fade' });
      if (!st.onboarded) return App.nav.root(S.onboarding(), { anim: 'fade' });
      App.nav.root(S.mainTabs(), { anim: 'fade' });
    },
    afterOnboarding() {
      queue = pendingPermissions();
      total = queue.length;
      nextPermissionOrHome();
    },
    afterPermission() {
      nextPermissionOrHome();
    },
  };
})();

document.addEventListener('DOMContentLoaded', () => {
  App.device.init();
  App.pocPanel.init();
  App.flow.start();
});
