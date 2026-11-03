// Điều hướng kiểu iOS: stack push/pop + thay root
// Mỗi screen là object: { el, statusBar: 'dark'|'light', onEnter?, onLeave? }
App.nav = (() => {
  const host = () => document.getElementById('app');
  const stack = [];
  let busy = false;

  const DUR = { fade: 450, push: 500, pop: 500, zoom: 600 };

  function applyChrome(screen) {
    App.device.setTheme(screen.statusBar || 'dark');
  }

  function animate(el, cls, ms) {
    return new Promise((resolve) => {
      el.classList.add(cls);
      setTimeout(() => { el.classList.remove(cls); resolve(); }, ms);
    });
  }

  function mount(screen) {
    screen.el.classList.add('scr');
    host().appendChild(screen.el);
  }

  function unmount(screen) {
    screen.onLeave && screen.onLeave();
    screen.el.remove();
  }

  async function root(screen, { anim = 'fade' } = {}) {
    if (busy) return;
    busy = true;
    const old = stack.splice(0, stack.length);
    mount(screen);
    stack.push(screen);
    applyChrome(screen);
    screen.onEnter && screen.onEnter();
    const outs = old.map((s) => (anim === 'fade' ? animate(s.el, 'anim-fade-out', DUR.fade) : Promise.resolve()));
    await Promise.all([animate(screen.el, anim === 'zoom' ? 'anim-zoom-in' : 'anim-fade-in', DUR[anim] || DUR.fade), ...outs]);
    old.forEach(unmount);
    busy = false;
  }

  async function push(screen) {
    if (busy) return;
    busy = true;
    const prev = stack[stack.length - 1];
    mount(screen);
    stack.push(screen);
    applyChrome(screen);
    screen.onEnter && screen.onEnter();
    await Promise.all([
      animate(screen.el, 'anim-push-in', DUR.push),
      prev ? animate(prev.el, 'anim-push-out', DUR.push) : null,
    ]);
    if (prev) prev.el.style.visibility = 'hidden';
    busy = false;
  }

  async function pop() {
    if (busy || stack.length < 2) return;
    busy = true;
    const top = stack.pop();
    const prev = stack[stack.length - 1];
    prev.el.style.visibility = '';
    applyChrome(prev);
    await Promise.all([animate(top.el, 'anim-pop-out', DUR.pop), animate(prev.el, 'anim-pop-in', DUR.pop)]);
    unmount(top);
    prev.onResume && prev.onResume();
    busy = false;
  }

  // trượt màn mới vào, bỏ mọi màn giữa root và nó (VD: thoát cổng thanh toán → Chi tiết đơn)
  async function replaceAbove(screen) {
    if (busy) return;
    busy = true;
    const old = stack.splice(1);
    const prev = old[old.length - 1] || stack[0];
    mount(screen);
    stack.push(screen);
    applyChrome(screen);
    screen.onEnter && screen.onEnter();
    await Promise.all([animate(screen.el, 'anim-push-in', DUR.push), animate(prev.el, 'anim-push-out', DUR.push)]);
    old.forEach(unmount);
    stack[0].el.style.visibility = 'hidden';
    busy = false;
  }

  // về thẳng root (tab), bỏ các màn ở giữa
  async function popToRoot() {
    if (busy || stack.length < 2) return;
    stack.splice(1, stack.length - 2).forEach(unmount);
    await pop();
  }

  // quay về khi stack còn `len` màn (VD: xong đăng nhập → về màn đã yêu cầu đăng nhập)
  async function popTo(len) {
    if (busy || stack.length <= len) return;
    stack.splice(len, stack.length - len - 1).forEach(unmount);
    await pop();
  }

  function clear() {
    stack.splice(0).forEach(unmount);
    host().innerHTML = '';
    busy = false;
  }

  return { root, push, pop, clear, replaceAbove, popToRoot, popTo, get depth() { return stack.length; }, get top() { return stack[stack.length - 1]; } };
})();
