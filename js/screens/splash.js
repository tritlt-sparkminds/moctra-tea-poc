// C1 · Splash — logo, kiểm tra phiên bản (mô phỏng)
App.screens = App.screens || {};

App.screens.splash = () => {
  const { brand } = App.config;
  const el = App.ui.el(`
    <section class="splash">
      ${App.icons.logoMark()}
      <div class="wordmark">${brand.wordmark}</div>
      <div class="tagline">${brand.tagline}</div>
      <div class="foot">
        <div class="loader"><i></i><i></i><i></i></div>
        <span>v${App.config.app.version}</span>
      </div>
    </section>`);

  let timers = [];
  return {
    el,
    statusBar: 'light',
    onEnter() {
      timers.push(setTimeout(() => el.querySelector('.loader').classList.add('show'), 1300));
      timers.push(setTimeout(() => App.flow.afterSplash(), App.config.splashMinMs));
    },
    onLeave() { timers.forEach(clearTimeout); },
  };
};
