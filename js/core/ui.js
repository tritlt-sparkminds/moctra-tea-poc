// UI helpers: tạo element, toast, iOS system alert
App.ui = (() => {
  const overlay = () => document.getElementById('overlay');

  function el(html) {
    const t = document.createElement('template');
    t.innerHTML = html.trim();
    return t.content.firstElementChild;
  }

  function haptic(ms = 8) {
    if (navigator.vibrate) navigator.vibrate(ms);
  }

  let toastTimer;
  function toast(text, ms = 2200) {
    let t = overlay().querySelector('.toast');
    if (!t) { t = el('<div class="toast"></div>'); overlay().appendChild(t); }
    t.textContent = text;
    requestAnimationFrame(() => t.classList.add('show'));
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove('show'), ms);
  }

  /**
   * Mô phỏng UIAlertController.
   * buttons: [{ label, value, bold? }]; layout 'row' (2 nút) | 'col'
   * Trả về Promise<value>
   */
  function iosAlert({ title, message = '', extra = '', buttons, layout }) {
    layout = layout || (buttons.length === 2 ? 'row' : 'col');
    return new Promise((resolve) => {
      const dim = el(`
        <div class="ios-dim">
          <div class="ios-alert" role="alertdialog">
            <div class="body">
              <div class="title">${title}</div>
              ${message ? `<div class="msg">${message}</div>` : ''}
              ${extra}
            </div>
            <div class="btns ${layout}">
              ${buttons.map((b, i) => `<button data-i="${i}" class="${b.bold ? 'bold' : ''}">${b.label}</button>`).join('')}
            </div>
          </div>
        </div>`);
      dim.querySelectorAll('button').forEach((btn) => {
        btn.addEventListener('click', () => {
          haptic();
          dim.classList.add('closing');
          setTimeout(() => { dim.remove(); resolve(buttons[+btn.dataset.i].value); }, 200);
        });
      });
      overlay().appendChild(dim);
    });
  }

  const wait = (ms) => new Promise((r) => setTimeout(r, ms));

  // Báo màn chưa dựng (dùng trong POC khi chạm vào lối đi tới chức năng sau)
  const soon = (code, name) => toast(`${name} · ${code} sẽ dựng ở bước sau`);

  /** Bottom sheet kiểu iOS. Kéo xuống hoặc chạm nền để đóng. Trả về { el, close } */
  function sheet(html, { onClose } = {}) {
    const wrap = el(`
      <div class="sheet-wrap">
        <div class="sheet-dim"></div>
        <div class="sheet"><div class="grabber"></div>${html}</div>
      </div>`);
    const panel = wrap.querySelector('.sheet');
    const close = () => {
      wrap.classList.add('closing');
      panel.style.transform = '';
      setTimeout(() => { wrap.remove(); onClose && onClose(); }, 320);
    };
    wrap.querySelector('.sheet-dim').addEventListener('click', close);

    // kéo grabber xuống để đóng
    let y0 = null, dy = 0;
    const grab = wrap.querySelector('.grabber');
    panel.addEventListener('pointerdown', (e) => {
      if (e.target !== grab && e.clientY - panel.getBoundingClientRect().top > 40) return;
      y0 = e.clientY; dy = 0; panel.setPointerCapture(e.pointerId); panel.style.transition = 'none';
    });
    panel.addEventListener('pointermove', (e) => {
      if (y0 === null) return;
      const s = panel.getBoundingClientRect().width / panel.offsetWidth || 1;
      dy = Math.max(0, (e.clientY - y0) / s);
      panel.style.transform = `translateY(${dy}px)`;
    });
    const up = () => {
      if (y0 === null) return;
      y0 = null; panel.style.transition = '';
      if (dy > 110) close(); else panel.style.transform = '';
    };
    panel.addEventListener('pointerup', up);
    panel.addEventListener('pointercancel', up);

    overlay().appendChild(wrap);
    return { el: wrap, close };
  }

  /** Cho phép kéo-cuộn ngang bằng chuột (desktop) cho dải cuộn ngang */
  function dragScroll(node) {
    let x0 = null, sl = 0, moved = false;
    node.addEventListener('pointerdown', (e) => {
      if (e.pointerType !== 'mouse') return;
      x0 = e.clientX; sl = node.scrollLeft; moved = false;
      node.style.scrollSnapType = 'none';
    });
    window.addEventListener('pointermove', (e) => {
      if (x0 === null) return;
      const s = node.getBoundingClientRect().width / node.offsetWidth || 1;
      const dx = (e.clientX - x0) / s;
      if (Math.abs(dx) > 4) moved = true;
      node.scrollLeft = sl - dx;
    });
    window.addEventListener('pointerup', () => {
      if (x0 === null) return;
      x0 = null;
      node.style.scrollSnapType = '';
    });
    // chặn click sau khi kéo
    node.addEventListener('click', (e) => { if (moved) { e.stopPropagation(); e.preventDefault(); moved = false; } }, true);
  }

  return { el, toast, iosAlert, haptic, wait, soon, sheet, dragScroll };
})();
