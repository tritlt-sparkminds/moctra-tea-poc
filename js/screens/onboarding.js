// C1 · Onboarding — 3 slide vuốt ngang, chỉ hiện ở lần mở đầu tiên
App.screens.onboarding = () => {
  const slides = [
    { title: 'Trà nguyên lá', text: 'Pha mới cho từng ly.', art: artCup() },
    { title: 'Đặt trước, khỏi chờ', text: 'Nhận tại quán hoặc giao tận nơi.', art: artPickup() },
    { title: 'Mỗi ly một điểm', text: 'Tích điểm, đổi quà hội viên.', art: artMember() },
  ];

  const el = App.ui.el(`
    <section class="onb">
      <button class="skip tap">Bỏ qua</button>
      <div class="track">
        ${slides.map((s, i) => `
          <div class="slide ${i === 0 ? 'active' : ''}">
            <div class="bg">${s.art}</div>
            <div class="copy">
              <h2>${s.title}</h2>
              <p>${s.text}</p>
            </div>
          </div>`).join('')}
      </div>
      <div class="controls">
        <div class="dots">${slides.map((_, i) => `<i class="${i === 0 ? 'on' : ''}"></i>`).join('')}</div>
        <button class="next" aria-label="Tiếp tục"><span class="lbl">Bắt đầu</span>${App.icons.arrowRight}</button>
      </div>
    </section>`);

  const track = el.querySelector('.track');
  const slideEls = [...el.querySelectorAll('.slide')];
  const arts = slideEls.map((s) => s.querySelector('.art'));
  const dots = [...el.querySelectorAll('.dots i')];
  const nextBtn = el.querySelector('.next');
  const skipBtn = el.querySelector('.skip');
  const last = slides.length - 1;
  let idx = 0;

  const W = () => el.offsetWidth;
  const scale = () => el.getBoundingClientRect().width / el.offsetWidth || 1;

  function setPos(px, animated) {
    const t = animated ? 'transform .55s cubic-bezier(.32,.72,0,1)' : 'none';
    track.style.transition = t;
    track.style.transform = `translate3d(${px}px,0,0)`;
    // parallax: hình minh họa trôi chậm hơn nội dung
    arts.forEach((a, i) => {
      if (!a) return;
      const rel = i * W() + px;
      a.style.transition = t;
      a.style.transform = `translate3d(${rel * 0.45}px,0,0)`;
    });
  }

  function go(i) {
    idx = Math.max(0, Math.min(last, i));
    setPos(-idx * W(), true);
    slideEls.forEach((s, k) => s.classList.toggle('active', k === idx));
    dots.forEach((d, k) => d.classList.toggle('on', k === idx));
    nextBtn.classList.toggle('wide', idx === last);
    skipBtn.classList.toggle('hidden', idx === last);
  }

  // kéo/vuốt bằng chuột hoặc cảm ứng
  let startX = 0, startY = 0, dx = 0, t0 = 0, dragging = false, locked = null;
  track.addEventListener('pointerdown', (e) => {
    dragging = true; locked = null;
    startX = e.clientX; startY = e.clientY; dx = 0; t0 = performance.now();
    track.setPointerCapture(e.pointerId);
  });
  track.addEventListener('pointermove', (e) => {
    if (!dragging) return;
    const s = scale();
    const mx = (e.clientX - startX) / s;
    const my = (e.clientY - startY) / s;
    if (locked === null && Math.hypot(mx, my) > 6) locked = Math.abs(mx) > Math.abs(my) ? 'x' : 'y';
    if (locked !== 'x') return;
    track.classList.add('dragging');
    dx = mx;
    if ((idx === 0 && dx > 0) || (idx === last && dx < 0)) dx *= 0.3; // kéo quá mép thì nặng tay
    setPos(-idx * W() + dx, false);
  });
  const end = () => {
    if (!dragging) return;
    dragging = false;
    track.classList.remove('dragging');
    if (locked !== 'x') return;
    const v = dx / Math.max(1, performance.now() - t0); // px/ms
    if (dx < -W() * 0.18 || v < -0.45) go(idx + 1);
    else if (dx > W() * 0.18 || v > 0.45) go(idx - 1);
    else go(idx);
  };
  track.addEventListener('pointerup', end);
  track.addEventListener('pointercancel', end);

  const finish = () => {
    App.ui.haptic();
    App.state.set({ onboarded: true });
    App.flow.afterOnboarding();
  };
  nextBtn.addEventListener('click', () => (idx === last ? finish() : go(idx + 1)));
  skipBtn.addEventListener('click', finish);

  return {
    el,
    statusBar: 'dark',
    onEnter() { requestAnimationFrame(() => go(0)); },
  };

  // ---------------- illustrations ----------------
  function artCup() {
    return `
    <svg viewBox="0 0 440 956" preserveAspectRatio="xMidYMid slice">
      <defs>
        <linearGradient id="o1bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#E6EBDF"/><stop offset="1" stop-color="#C9D4C1"/></linearGradient>
        <linearGradient id="o1tea" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F3E7D2"/><stop offset=".38" stop-color="#E0BF8E"/><stop offset=".7" stop-color="#B98149"/><stop offset="1" stop-color="#7E4E25"/></linearGradient>
        <linearGradient id="o1glass" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#fff" stop-opacity=".55"/><stop offset=".25" stop-color="#fff" stop-opacity="0"/><stop offset=".8" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#fff" stop-opacity=".3"/></linearGradient>
        <clipPath id="o1cup"><path d="M140 250 H300 L282 525 Q281 540 266 540 H174 Q159 540 158 525 Z"/></clipPath>
      </defs>
      <rect width="440" height="956" fill="url(#o1bg)"/>
      <g transform="translate(0 120)">
      <circle cx="220" cy="380" r="205" fill="#fff" opacity=".35"/>
      <circle cx="220" cy="380" r="150" fill="#fff" opacity=".35"/>
      <g class="art">
        <ellipse cx="220" cy="548" rx="92" ry="10" fill="#1F3329" opacity=".12"/>
        <!-- lá bay -->
        <g fill="#2E4A3B">
          <path d="M70 200 c30 -18 62 -6 70 20 c-30 14 -60 6 -70 -20z" opacity=".85"/>
          <path d="M352 150 c22 -24 56 -24 70 0 c-24 22 -54 22 -70 0z" opacity=".7"/>
          <path d="M335 420 c26 -8 48 8 50 30 c-26 6 -46 -6 -50 -30z" opacity=".6"/>
          <path d="M60 430 c14 -22 42 -26 58 -8 c-16 20 -42 24 -58 8z" opacity=".5"/>
        </g>
        <g stroke="#E6EBDF" stroke-width="1.4" fill="none" stroke-linecap="round">
          <path d="M76 202 C100 200 120 206 138 218"/><path d="M358 150 C380 148 400 148 418 150"/>
        </g>
        <!-- ống hút -->
        <rect x="236" y="120" width="13" height="200" rx="6.5" fill="#1F3329" transform="rotate(10 242 220)"/>
        <!-- thân ly -->
        <g clip-path="url(#o1cup)">
          <rect x="130" y="250" width="180" height="300" fill="url(#o1tea)"/>
          <path d="M130 330 C170 310 200 352 240 334 S300 318 310 330 V250 H130Z" fill="#FBF6EC" opacity=".9"/>
          <g fill="#fff" opacity=".35">
            <rect x="168" y="372" width="34" height="30" rx="6" transform="rotate(-12 185 387)"/>
            <rect x="228" y="392" width="30" height="28" rx="6" transform="rotate(14 243 406)"/>
            <rect x="196" y="430" width="28" height="26" rx="6" transform="rotate(-4 210 443)"/>
          </g>
          <rect x="130" y="250" width="180" height="300" fill="url(#o1glass)"/>
        </g>
        <path d="M140 250 H300 L282 525 Q281 540 266 540 H174 Q159 540 158 525 Z" fill="none" stroke="#fff" stroke-opacity=".7" stroke-width="2"/>
        <!-- nhãn ly -->
        <g transform="translate(220 468)">
          <circle r="26" fill="#1F3329"/>
          <path d="M0 -15 C9 -9 11 2 0 15 C-11 2 -9 -9 0 -15Z" fill="#F4EEE2"/>
        </g>
        <!-- nắp -->
        <path d="M130 252 Q130 240 142 238 H298 Q310 240 310 252 Z" fill="#fff" opacity=".95"/>
        <path d="M146 238 Q150 196 220 192 Q290 196 294 238 Z" fill="#fff" opacity=".75"/>
      </g>
      </g>
    </svg>`;
  }

  function artPickup() {
    return `
    <svg viewBox="0 0 440 956" preserveAspectRatio="xMidYMid slice">
      <defs>
        <linearGradient id="o2bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F1E8D8"/><stop offset="1" stop-color="#E2D2B6"/></linearGradient>
        <linearGradient id="o2bag" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#D2B48A"/><stop offset="1" stop-color="#B28E5C"/></linearGradient>
      </defs>
      <rect width="440" height="956" fill="url(#o2bg)"/>
      <g transform="translate(0 120)">
      <circle cx="220" cy="370" r="200" fill="#fff" opacity=".3"/>
      <g class="art">
        <!-- điện thoại -->
        <g transform="translate(70 168) rotate(-8)">
          <rect width="168" height="330" rx="30" fill="#1B1D1A"/>
          <rect x="8" y="8" width="152" height="314" rx="23" fill="#FBF8F2"/>
          <rect x="62" y="17" width="44" height="12" rx="6" fill="#1B1D1A"/>
          <text x="24" y="66" font-family="Playfair Display, serif" font-size="15" font-weight="600" fill="#1B1D1A">Đơn #A128</text>
          <text x="24" y="86" font-family="Be Vietnam Pro, sans-serif" font-size="10" fill="#8C877B">Mã lấy hàng</text>
          <text x="24" y="132" font-family="Playfair Display, serif" font-size="38" font-weight="700" fill="#1F3329">128</text>
          <rect x="24" y="152" width="120" height="6" rx="3" fill="#ECE6DA"/>
          <rect x="24" y="152" width="84" height="6" rx="3" fill="#B08D57"/>
          <g font-family="Be Vietnam Pro, sans-serif" font-size="9.5" fill="#4A4D47">
            <circle cx="30" cy="184" r="5" fill="#1F3329"/><text x="42" y="187">Đã thanh toán</text>
            <circle cx="30" cy="206" r="5" fill="#1F3329"/><text x="42" y="209">Đang pha</text>
            <circle cx="30" cy="228" r="5" fill="none" stroke="#B08D57" stroke-width="1.6"/><text x="42" y="231">Sẵn sàng · ~5 phút</text>
          </g>
          <rect x="24" y="262" width="120" height="34" rx="17" fill="#1F3329"/>
          <text x="84" y="283" text-anchor="middle" font-family="Be Vietnam Pro, sans-serif" font-size="11" font-weight="600" fill="#fff">Chỉ đường</text>
        </g>
        <!-- túi giấy -->
        <g transform="translate(222 300)">
          <ellipse cx="80" cy="232" rx="96" ry="10" fill="#1F3329" opacity=".12"/>
          <path d="M44 34 Q44 -6 80 -6 Q116 -6 116 34" fill="none" stroke="#8E6A3C" stroke-width="7" stroke-linecap="round"/>
          <path d="M0 30 H160 L150 228 H10 Z" fill="url(#o2bag)"/>
          <path d="M0 30 H160 L156 54 H4 Z" fill="#000" opacity=".06"/>
          <circle cx="80" cy="128" r="34" fill="#1F3329"/>
          <path d="M80 106 C93 114 96 130 80 150 C64 130 67 114 80 106Z" fill="#F4EEE2"/>
          <text x="80" y="196" text-anchor="middle" font-family="Playfair Display, serif" font-size="13" font-weight="600" letter-spacing="3" fill="#1F3329">MỘC TRÀ</text>
        </g>
        <!-- xe giao + chấm đường -->
        <g transform="translate(300 170)">
          <circle r="34" fill="#FBF8F2"/>
          <g fill="none" stroke="#1F3329" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="-14" cy="10" r="7"/><circle cx="16" cy="10" r="7"/>
            <path d="M-14 10 L-4 -8 H8 L16 10 M-4 -8 H-12 M4 -8 L8 -16 H14"/>
          </g>
        </g>
        <path d="M262 214 C240 240 250 262 280 280" fill="none" stroke="#B08D57" stroke-width="2" stroke-dasharray="2 7" stroke-linecap="round"/>
      </g>
      </g>
    </svg>`;
  }

  function artMember() {
    return `
    <svg viewBox="0 0 440 956" preserveAspectRatio="xMidYMid slice">
      <defs>
        <linearGradient id="o3bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F3E3D8"/><stop offset="1" stop-color="#E5C9B8"/></linearGradient>
        <linearGradient id="o3gold" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#E9D4A8"/><stop offset=".5" stop-color="#C6A065"/><stop offset="1" stop-color="#9C7A45"/></linearGradient>
        <linearGradient id="o3green" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#3B5C4A"/><stop offset="1" stop-color="#1A2B22"/></linearGradient>
      </defs>
      <rect width="440" height="956" fill="url(#o3bg)"/>
      <g transform="translate(0 120)">
      <circle cx="220" cy="360" r="200" fill="#fff" opacity=".28"/>
      <g class="art">
        <!-- thẻ sau -->
        <g transform="translate(104 238) rotate(-14)">
          <rect width="250" height="156" rx="18" fill="url(#o3green)"/>
          <text x="22" y="40" font-family="Playfair Display, serif" font-size="15" font-weight="600" letter-spacing="3" fill="#F4EEE2">MỘC TRÀ</text>
          <text x="22" y="130" font-family="Be Vietnam Pro, sans-serif" font-size="11" letter-spacing="2" fill="#D9C29A">HẠNG LÁ XANH</text>
        </g>
        <!-- thẻ trước -->
        <g transform="translate(96 300) rotate(6)">
          <rect width="250" height="156" rx="18" fill="url(#o3gold)"/>
          <rect width="250" height="156" rx="18" fill="none" stroke="#fff" stroke-opacity=".5"/>
          <text x="22" y="40" font-family="Playfair Display, serif" font-size="15" font-weight="600" letter-spacing="3" fill="#1F3329">MỘC TRÀ</text>
          <text x="22" y="64" font-family="Be Vietnam Pro, sans-serif" font-size="10" letter-spacing="2" fill="#1F3329" opacity=".7">HẠNG LÁ VÀNG</text>
          <text x="22" y="128" font-family="Playfair Display, serif" font-size="30" font-weight="700" fill="#1F3329">1.280</text>
          <text x="104" y="128" font-family="Be Vietnam Pro, sans-serif" font-size="11" fill="#1F3329" opacity=".75">điểm</text>
          <g transform="translate(190 94)" fill="#1F3329">
            <rect width="40" height="40" rx="6" fill="#fff" opacity=".9"/>
            <rect x="5" y="5" width="11" height="11"/><rect x="24" y="5" width="11" height="11"/><rect x="5" y="24" width="11" height="11"/>
            <rect x="24" y="24" width="5" height="5"/><rect x="30" y="30" width="5" height="5"/><rect x="19" y="19" width="4" height="4"/>
          </g>
        </g>
        <!-- lấp lánh -->
        <g fill="#B08D57">
          <path d="M92 190 l5 13 13 5 -13 5 -5 13 -5 -13 -13 -5 13 -5z"/>
          <path d="M360 214 l3.5 9 9 3.5 -9 3.5 -3.5 9 -3.5 -9 -9 -3.5 9 -3.5z" opacity=".8"/>
          <path d="M370 500 l4 10 10 4 -10 4 -4 10 -4 -10 -10 -4 10 -4z" opacity=".6"/>
        </g>
        <!-- huy hiệu điểm -->
        <g transform="translate(330 300)">
          <circle r="30" fill="#1F3329"/>
          <text y="7" text-anchor="middle" font-family="Be Vietnam Pro, sans-serif" font-size="17" font-weight="700" fill="#D9C29A">+15</text>
        </g>
      </g>
      </g>
    </svg>`;
  }
};
