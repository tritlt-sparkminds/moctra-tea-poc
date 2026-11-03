// Khung thiết bị: status bar, home indicator, scale vừa màn hình, chế độ full-screen trên điện thoại thật
App.device = (() => {
  const isRealPhone = () =>
    window.matchMedia('(pointer: coarse)').matches && Math.min(window.innerWidth, window.innerHeight) < 600;

  function renderStatusBar() {
    const sb = document.getElementById('statusBar');
    const now = new Date();
    const time = `${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')}`;
    sb.innerHTML = `
      <span class="sb-time">${time}</span>
      <span class="sb-right">${App.icons.signal}${App.icons.wifi}${App.icons.battery}</span>`;
  }

  function setTheme(theme) {
    document.getElementById('statusBar').classList.toggle('light', theme === 'light');
    document.getElementById('homeIndicator').classList.toggle('light', theme === 'light');
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.content = theme === 'light' ? '#1F3329' : '#FBF8F2';
  }

  function fit() {
    const wrap = document.getElementById('deviceWrap');
    if (document.body.classList.contains('native')) return;
    const panel = document.getElementById('pocPanel');
    const panelW = panel && getComputedStyle(panel).display !== 'none' ? panel.offsetWidth + 48 : 0;
    const w = 440 + 28, h = 956 + 28;
    const s = Math.min(1, (window.innerHeight - 32) / h, (window.innerWidth - panelW - 32) / w);
    wrap.style.transform = `scale(${s})`;
    // giữ layout flex đúng kích thước sau khi scale
    wrap.style.margin = `${(-h * (1 - s)) / 2}px ${(-w * (1 - s)) / 2}px`;
  }

  function init() {
    if (isRealPhone()) document.body.classList.add('native');
    renderStatusBar();
    setInterval(renderStatusBar, 15000);
    fit();
    window.addEventListener('resize', fit);
  }

  return { init, setTheme, fit };
})();
