// Hình minh họa ly trà (placeholder cho ảnh sản phẩm thật)
App.art = (() => {
  let seq = 0;

  function cup({ top = '#F3E7D2', mid = '#D9B27C', bottom = '#8E5B2E', foam = null, straw = '#1F3329', shadow = true } = {}) {
    const id = 'cup' + ++seq;
    return `
    <svg viewBox="0 0 200 280" class="cup-art" preserveAspectRatio="xMidYMax meet">
      <defs>
        <linearGradient id="${id}g" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="${top}"/><stop offset=".45" stop-color="${mid}"/><stop offset="1" stop-color="${bottom}"/>
        </linearGradient>
        <clipPath id="${id}c"><path d="M42 72 H158 L146 258 Q145 268 135 268 H65 Q55 268 54 258 Z"/></clipPath>
      </defs>
      ${shadow ? '<ellipse cx="100" cy="272" rx="58" ry="6" fill="#000" opacity=".12"/>' : ''}
      <rect x="104" y="6" width="9" height="112" rx="4.5" fill="${straw}" transform="rotate(10 108 62)"/>
      <g clip-path="url(#${id}c)">
        <rect x="40" y="70" width="120" height="200" fill="url(#${id}g)"/>
        ${foam ? `<path d="M40 70 H160 V104 C134 96 122 116 98 108 S58 98 40 108Z" fill="${foam}"/>` : ''}
        <g fill="#fff" opacity=".32">
          <rect x="66" y="128" width="22" height="20" rx="4" transform="rotate(-12 77 138)"/>
          <rect x="106" y="142" width="20" height="18" rx="4" transform="rotate(14 116 151)"/>
          <rect x="84" y="166" width="18" height="17" rx="4"/>
        </g>
        <rect x="50" y="76" width="9" height="180" rx="4.5" fill="#fff" opacity=".28"/>
      </g>
      <path d="M42 72 H158 L146 258 Q145 268 135 268 H65 Q55 268 54 258 Z" fill="none" stroke="#fff" stroke-opacity=".7" stroke-width="1.6"/>
      <g transform="translate(100 214)">
        <circle r="17" fill="#1F3329"/>
        <path d="M0 -10 C6 -6 7.5 1.5 0 10 C-7.5 1.5 -6 -6 0 -10Z" fill="#F4EEE2"/>
      </g>
      <path d="M36 74 Q36 66 44 65 H156 Q164 66 164 74 Z" fill="#fff" opacity=".96"/>
      <path d="M46 65 Q50 36 100 34 Q150 36 154 65 Z" fill="#fff" opacity=".72"/>
    </svg>`;
  }

  function product(id, opts) {
    const p = App.data.products.find((x) => x.id === id);
    return cup({ ...p.cup, ...opts });
  }

  // QR giả (pattern cố định theo seed) — chỉ để minh họa
  function qr(seed = 7, size = 25) {
    let s = seed;
    const rnd = () => ((s = (s * 9301 + 49297) % 233280) / 233280);
    const cells = [];
    const finder = (x, y) =>
      `<rect x="${x}" y="${y}" width="7" height="7" fill="#1B1D1A"/><rect x="${x + 1}" y="${y + 1}" width="5" height="5" fill="#fff"/><rect x="${x + 2}" y="${y + 2}" width="3" height="3" fill="#1B1D1A"/>`;
    const inFinder = (x, y) => (x < 8 && y < 8) || (x > size - 9 && y < 8) || (x < 8 && y > size - 9);
    for (let y = 0; y < size; y++)
      for (let x = 0; x < size; x++)
        if (!inFinder(x, y) && rnd() > 0.52) cells.push(`<rect x="${x}" y="${y}" width="1" height="1"/>`);
    return `<svg viewBox="-1 -1 ${size + 2} ${size + 2}" shape-rendering="crispEdges">
      <rect x="-1" y="-1" width="${size + 2}" height="${size + 2}" fill="#fff"/>
      <g fill="#1B1D1A">${cells.join('')}</g>
      ${finder(0, 0)}${finder(size - 7, 0)}${finder(0, size - 7)}
    </svg>`;
  }

  return { cup, product, qr };
})();
