// Dữ liệu mẫu cho POC (sau này lấy từ API / Admin)
App.data = {
  // x, y: vị trí trên bản đồ minh hoạ (0–100%)
  stores: [
    { id: 's1', name: 'Mộc Trà Nguyễn Huệ', address: '86 Nguyễn Huệ, Bến Nghé, Quận 1', distance: 0.8, status: 'open', wait: 10, hours: '07:00 – 22:30', x: 56, y: 58 },
    { id: 's6', name: 'Mộc Trà Hai Bà Trưng', address: '115 Hai Bà Trưng, Bến Nghé, Quận 1', distance: 1.6, status: 'open', wait: 4, hours: '07:00 – 22:00', x: 64, y: 44 },
    { id: 's5', name: 'Mộc Trà Lê Văn Sỹ', address: '210 Lê Văn Sỹ, Phường 14, Quận 3', distance: 2.4, status: 'closed', wait: 0, hours: '07:00 – 21:00', opensAt: '07:00 sáng mai', x: 34, y: 34 },
    { id: 's4', name: 'Mộc Trà Bàu Cát', address: '18 Đường Bàu Cát 2, Phường 14, Tân Bình', distance: 5.2, status: 'open', wait: 6, hours: '07:00 – 22:00', x: 16, y: 20 },
    { id: 's2', name: 'Mộc Trà Thảo Điền', address: '12 Quốc Hương, Thảo Điền, TP. Thủ Đức', distance: 6.4, status: 'closingSoon', wait: 15, hours: '07:30 – 22:00', closesIn: 25, x: 86, y: 26 },
    { id: 's3', name: 'Mộc Trà Phú Mỹ Hưng', address: '45 Nguyễn Lương Bằng, Tân Phú, Quận 7', distance: 8.1, status: 'open', wait: 8, hours: '08:00 – 22:00', x: 60, y: 80 },
  ],
  deliveryRadiusKm: 5,

  member: {
    name: 'Minh Anh',
    phone: '090 *** 4567',
    tier: 'Lá Vàng',
    nextTier: 'Lá Ngọc',
    points: 1280,
    nextTierAt: 2000,
    address: { label: 'Nhà', line: '12 Lê Thánh Tôn, Bến Nghé, Quận 1' },
    // sổ địa chỉ: storeId = cửa hàng gần nhất giao tới, km = khoảng cách từ cửa hàng đó
    addresses: [
      { id: 'a1', label: 'Nhà', line: '12 Lê Thánh Tôn', detail: 'Bến Nghé, Quận 1, TP. Hồ Chí Minh', receiver: 'Minh Anh', phone: '090 123 4567', storeId: 's1', km: 1.2, x: 57, y: 63, note: 'Gọi trước khi giao' },
      { id: 'a2', label: 'Văn phòng', line: 'Tầng 5, 24A Bàu Cát 2', detail: 'Phường 14, Tân Bình, TP. Hồ Chí Minh', receiver: 'Minh Anh', phone: '090 123 4567', storeId: 's4', km: 0.6, x: 17, y: 22, note: 'Để ở quầy lễ tân' },
      { id: 'a3', label: 'Nhà ba mẹ', line: '58 Phan Trung', detail: 'Tân Tiến, Biên Hoà, Đồng Nai', receiver: 'Nguyễn Văn Hùng', phone: '091 888 2211', storeId: 's2', km: 21.5, x: 165, y: 12 },
    ],
  },

  activeOrder: {
    code: 'A128',
    pickupCode: '128',
    storeId: 's1',
    mode: 'pickup',
    step: 2, // 0 Đã thanh toán · 1 Đã nhận · 2 Đang pha · 3 Sẵn sàng · 4 Hoàn tất
    eta: 6,
  },

  // màu ly: top (lớp trên) → mid → bottom; foam = lớp kem phô mai
  products: [
    { id: 'p1', name: 'Ô Long Hoa Quế', desc: 'Ô long rang, sữa tươi, hương hoa quế', price: 62000, tag: 'Mới', cup: { top: '#F6E9D3', mid: '#DDB27A', bottom: '#A9692F', foam: '#FFF8EC' } },
    { id: 'p2', name: 'Lài Sữa Nguyên Lá', desc: 'Trà lài Thái Nguyên, sữa tươi thanh', price: 55000, tag: 'Bán chạy', cup: { top: '#FBF6EA', mid: '#EADBB8', bottom: '#C8AF7C' } },
    { id: 'p3', name: 'Hồng Trà Kem Mặn', desc: 'Hồng trà đậm, lớp kem phô mai mặn', price: 59000, tag: 'Bán chạy', cup: { top: '#E7C9A6', mid: '#B4703C', bottom: '#6E3A18', foam: '#FFFDF6' } },
    { id: 'p4', name: 'Matcha Sữa Yến Mạch', desc: 'Matcha Uji, sữa yến mạch', price: 65000, tag: 'Mới', cup: { top: '#EEF1DF', mid: '#A9BE7A', bottom: '#6E8B3D' } },
    { id: 'p5', name: 'Ô Long Đào Hồng', desc: 'Ô long thanh, đào hồng tươi', price: 58000, cup: { top: '#FCE3D3', mid: '#F2B38E', bottom: '#D97E4E' } },
  ],

  banners: [
    {
      id: 'b1', theme: 'dark', eyebrow: 'Mới · Mùa thu 2026', title: 'Ô Long<br/>Hoa Quế', sub: 'Hương quế ấm, hậu vị ô long rang.', cta: 'Thử ngay',
      bg: ['#F1DDBD', '#D9A86B'], ink: '#2B1C0E', cupId: 'p1', deeplink: 'Chi tiết món Ô Long Hoa Quế',
    },
    {
      id: 'b2', theme: 'light', eyebrow: 'Giao hàng', title: 'Miễn phí giao<br/>từ 99.000đ', sub: 'Trong bán kính 5 km quanh cửa hàng.', cta: 'Đặt giao ngay',
      bg: ['#2E4A3B', '#1A2B22'], ink: '#F4EEE2', cupId: 'p2', deeplink: 'Đặt món – Giao hàng',
    },
    {
      id: 'b3', theme: 'dark', eyebrow: 'Hội viên', title: 'Thứ Ba<br/>mua 2 tặng 1', sub: 'Dành cho hội viên từ hạng Lá Xanh.', cta: 'Xem ưu đãi',
      bg: ['#E9EEDF', '#BCCBAE'], ink: '#1B2A21', cupId: 'p4', deeplink: 'Chi tiết khuyến mãi Thứ Ba',
    },
  ],

  stories: [
    { id: 'n1', title: 'Hành trình lá trà từ đồi chè Bảo Lộc', meta: 'Câu chuyện · 4 phút đọc', tone: ['#DCE5D1', '#9DB38A'] },
    { id: 'n2', title: 'Vì sao chúng tôi pha mới từng ly', meta: 'Tay nghề · 3 phút đọc', tone: ['#F0E2CC', '#CFA874'] },
  ],
};

App.fmt = {
  vnd: (n) => n.toLocaleString('vi-VN') + 'đ',
  km: (n) => n.toLocaleString('vi-VN', { maximumFractionDigits: 1 }) + ' km',
};
