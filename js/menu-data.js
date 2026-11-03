// Dữ liệu menu mẫu cho C4 (sau này lấy từ API theo cửa hàng)
// kind: 'drink' (ly) · 'combo' (thẻ combo lớn) · 'box' (hộp trà) · 'merch' (quà lưu niệm)
(() => {
  const C = (top, mid, bottom, foam) => ({ top, mid, bottom, foam });
  const NOTE = 'Lưu ý: cửa hàng hiện chưa hỗ trợ ghi chú riêng cho từng ly.';

  App.data.menu = {
    // khuyến mãi nhỏ phía trên danh sách
    promo: { title: 'Trà Trái Cây', sub: 'Sưu tập tem, mở giải thưởng', cta: 'KHÁM PHÁ THÊM', badge: 'GIẢM 30%' },

    categories: [
      { id: 'deal', name: 'Ưu đãi độc quyền', icon: 'deal' },
      { id: 'fruit', name: 'Trà Trái Cây', icon: 'fruit', isNew: true },
      { id: 'milk', name: 'Trà Sữa Nguyên Lá', icon: 'milk' },
      { id: 'matcha', name: 'Matcha', icon: 'matcha' },
      { id: 'cloud', name: 'Trà Kem Mây', icon: 'cloud' },
      { id: 'latte', name: 'Trà Latte', icon: 'latte' },
      { id: 'frappe', name: 'Trà Đá Xay', icon: 'frappe' },
      { id: 'pure', name: 'Trà Nguyên Bản', icon: 'pure' },
      { id: 'box', name: 'Hộp Trà', icon: 'box' },
      { id: 'merch', name: 'Quà Lưu Niệm', icon: 'merch' },
    ],

    items: [
      // Ưu đãi độc quyền — combo
      { id: 'm-c1', cat: 'deal', kind: 'combo', name: 'Combo 2 ly Trà Trái Cây', price: 109000, sub: '2 ly Trà Trái Cây (L) · tặng túi vải Mộc Trà', tone: ['#E4EFE6', '#B9D3C0'], cups: [C('#FCE3D3', '#F2B38E', '#D97E4E'), C('#FFF6C9', '#F4D86A', '#D9A93A')], extra: 'tote' },
      { id: 'm-c2', cat: 'deal', kind: 'combo', name: 'Combo Trà Sữa + Ly giữ nhiệt', price: 299000, sub: '1 Lài Sữa Nguyên Lá (L) · 1 ly giữ nhiệt 500ml', tone: ['#EEE6D8', '#D6C3A2'], cups: [C('#FBF6EA', '#EADBB8', '#C8AF7C')], extra: 'tumbler' },

      // Trà Trái Cây
      { id: 'm-f1', cat: 'fruit', name: 'Trà Đào Hồng', tags: 'Tươi mát · Thanh · Hương hoa', price: 69000, badge: 'new', cup: C('#FCE3D3', '#F2B38E', '#D97E4E') },
      { id: 'm-f2', cat: 'fruit', name: 'Trà Xoài Lài', tags: 'Ngọt dịu · Thơm lài', price: 69000, badge: 'new', cup: C('#FFF4D2', '#F7CF63', '#E7A42C') },
      { id: 'm-f3', cat: 'fruit', name: 'Trà Dâu Ô Long', tags: 'Chua nhẹ · Tươi sáng', price: 69000, badge: 'new', cup: C('#FBD7D7', '#E77C80', '#B8333F') },
      { id: 'm-f4', cat: 'fruit', name: 'Trà Chanh Dây Lài', tags: 'Chua thanh · Sảng khoái', price: 55000, cup: C('#FFF8D9', '#F6E38A', '#E2BF3D') },
      { id: 'm-f5', cat: 'fruit', name: 'Trà Vải Hoa Hồng', tags: 'Thơm hoa · Ngọt thanh', price: 59000, cup: C('#FFF0F0', '#F5C9C7', '#E59A98') },

      // Trà Sữa Nguyên Lá
      { id: 'm-m1', cat: 'milk', name: 'Lài Sữa Nguyên Lá', desc: 'Trà lài Thái Nguyên, sữa tươi thanh nhẹ', price: 55000, badge: 'best', cup: C('#FBF6EA', '#EADBB8', '#C8AF7C') },
      { id: 'm-m2', cat: 'milk', name: 'Ô Long Hoa Quế', desc: 'Ô long rang, sữa tươi, hương hoa quế', price: 62000, badge: 'new', cup: C('#F6E9D3', '#DDB27A', '#A9692F') },
      { id: 'm-m3', cat: 'milk', name: 'Hồng Trà Sữa Đậm', desc: 'Hồng trà Lâm Đồng, sữa tươi béo', price: 55000, badge: 'best', cup: C('#EBD3B5', '#B97B47', '#7A4420') },
      { id: 'm-m4', cat: 'milk', name: 'Trà Sữa Gạo Rang', desc: 'Trà xanh gạo rang, thơm bùi', price: 59000, cup: C('#F3EAD8', '#D8C39C', '#A88C5C') },
      { id: 'm-m5', cat: 'milk', name: 'Ô Long Sữa Nướng', desc: 'Ô long nướng than, hậu vị khói nhẹ', price: 62000, cup: C('#EEDDC5', '#C79A68', '#8A5A2E') },

      // Matcha
      { id: 'm-t1', cat: 'matcha', name: 'Matcha Latte', tags: 'Đậm vị · Béo mịn', price: 69000, badge: 'new', cup: C('#F0F3E2', '#B5C984', '#6E8B3D') },
      { id: 'm-t2', cat: 'matcha', name: 'Matcha Sữa Yến Mạch', tags: 'Thực vật · Nhẹ nhàng', price: 65000, cup: C('#EEF1DF', '#A9BE7A', '#6E8B3D') },
      { id: 'm-t3', cat: 'matcha', name: 'Matcha Kem Mây', tags: 'Kem mặn · Đắng nhẹ', price: 72000, cup: C('#E6EDD3', '#93AE5E', '#5A7A2B', '#FFFDF6') },

      // Trà Kem Mây (lớp kem phô mai)
      { id: 'm-k1', cat: 'cloud', name: 'Hồng Trà Kem Mây', desc: 'Hồng trà đậm, lớp kem phô mai mặn', price: 59000, badge: 'best', cup: C('#E7C9A6', '#B4703C', '#6E3A18', '#FFFDF6') },
      { id: 'm-k2', cat: 'cloud', name: 'Ô Long Quế Kem Mây', desc: 'Ô long hoa quế, kem mây béo nhẹ', price: 65000, cup: C('#F1DFC4', '#D2A26A', '#9B6331', '#FFFDF6') },
      { id: 'm-k3', cat: 'cloud', name: 'Lài Kem Mây', desc: 'Trà lài thanh, kem mây mằn mặn', price: 59000, cup: C('#FAF5E6', '#E7DAAF', '#C9B276', '#FFFDF6') },

      // Trà Latte
      { id: 'm-l1', cat: 'latte', name: 'Latte Hồng Trà', desc: 'Hồng trà ủ lạnh, sữa tươi đánh bọt', price: 69000, cup: C('#F2E3CF', '#C99666', '#8B5A30', '#FFF8EC') },
      { id: 'm-l2', cat: 'latte', name: 'Latte Ô Long Khói', desc: 'Ô long hun khói, sữa tươi', price: 69000, cup: C('#EFE2D2', '#BC946C', '#6E4A2C', '#FFF8EC') },

      // Đá xay
      { id: 'm-x1', cat: 'frappe', name: 'Đá Xay Hồng Trà Oreo', desc: 'Hồng trà khói, bánh quy cacao, kem tươi', price: 85000, cup: C('#F4EDE4', '#B9A08A', '#5B4636', '#FFFFFF') },
      { id: 'm-x2', cat: 'frappe', name: 'Đá Xay Ô Long Caramel', desc: 'Ô long rang, sốt caramel muối', price: 85000, cup: C('#F7E7CF', '#E2B57A', '#B9772F', '#FFFFFF') },

      // Trà nguyên bản
      { id: 'm-p1', cat: 'pure', name: 'Ô Long Đào', desc: 'Ô long thanh, đào ngâm', price: 49000, cup: C('#FCE7D4', '#F3BD8B', '#DB8A4C') },
      { id: 'm-p2', cat: 'pure', name: 'Hồng Trà Nguyên Bản', desc: 'Hồng trà Lâm Đồng, không sữa', price: 45000, cup: C('#D9A47A', '#A35A2A', '#6A2E12') },
      { id: 'm-p3', cat: 'pure', name: 'Lài Xanh', desc: 'Trà lài Thái Nguyên ủ lạnh', price: 45000, cup: C('#FBF7DF', '#EDE3A6', '#CFC26B') },
      { id: 'm-p4', cat: 'pure', name: 'Thiết Quan Âm', desc: 'Ô long Thiết Quan Âm, hương lan', price: 49000, cup: C('#F7F0D2', '#E3CF84', '#B89B3E') },

      // Hộp trà
      { id: 'm-b1', cat: 'box', kind: 'box', name: 'Bộ sưu tập 5 hộp trà', desc: '5 hộp trà nguyên lá · 10 túi/hộp', price: 899000, tone: ['#DCE7DF', '#7FA08C'] },
      { id: 'm-b2', cat: 'box', kind: 'box', name: 'Bộ sưu tập 3 hộp trà', desc: '3 hộp trà nguyên lá · 10 túi/hộp', price: 569000, tone: ['#EFE4D2', '#C6A879'] },
      { id: 'm-b3', cat: 'box', kind: 'box', name: 'Hộp trà Ô Long Hoa Quế', desc: 'Hộp 10 túi lọc', price: 199000, badge: 'new', tone: ['#F2DCCB', '#C98B63'] },
      { id: 'm-b4', cat: 'box', kind: 'box', name: 'Hộp trà Lài Thái Nguyên', desc: 'Hộp 10 túi lọc', price: 199000, tone: ['#E9EEDF', '#9DB38A'] },

      // Quà lưu niệm
      { id: 'm-g1', cat: 'merch', kind: 'merch', art: 'tumbler', name: 'Ly giữ nhiệt Mộc Trà 500ml', desc: 'Thép không gỉ, giữ lạnh 12 giờ', price: 299000 },
      { id: 'm-g2', cat: 'merch', kind: 'merch', art: 'tote', name: 'Túi vải Mộc Trà', desc: 'Canvas dày, in lá trà', price: 159000 },
      { id: 'm-g3', cat: 'merch', kind: 'merch', art: 'mug', name: 'Cốc sứ men lá', desc: 'Dung tích 360ml', price: 189000 },
    ],

    note: NOTE,
  };
})();

// Tuỳ chọn cho trang chi tiết món (C5)
// single: chỉ chọn 1 (bắt buộc, có mặc định) · multi: chọn nhiều (tuỳ chọn, có giới hạn)
App.data.menuOptions = {
  drink: [
    { id: 'size', title: 'Size', type: 'single', choices: [
      { id: 'M', label: 'Vừa', note: '500ml', delta: 0, default: true },
      { id: 'L', label: 'Lớn', note: '700ml', delta: 10000 },
    ] },
    { id: 'ice', title: 'Mức đá', type: 'single', choices: [
      { id: 'normal', label: 'Bình thường', default: true },
      { id: 'less', label: 'Ít đá' },
      { id: 'none', label: 'Không đá' },
      { id: 'hot', label: 'Nóng' },
    ] },
    { id: 'sugar', title: 'Độ ngọt', type: 'single', choices: [
      { id: '100', label: 'Ngọt nguyên bản', default: true },
      { id: '70', label: 'Ít ngọt (70%)' },
      { id: '50', label: 'Vừa ngọt (50%)' },
      { id: '30', label: 'Hơi ngọt (30%)' },
      { id: '0', label: 'Không đường' },
    ] },
    { id: 'topping', title: 'Topping thêm', type: 'multi', max: 3, choices: [
      { id: 'pearl', label: 'Trân châu lá trà', delta: 10000 },
      { id: 'jelly', label: 'Thạch ô long', delta: 10000 },
      { id: 'cream', label: 'Kem mây phô mai', delta: 15000 },
      { id: 'chia', label: 'Hạt chia', delta: 8000 },
      { id: 'aloe', label: 'Nha đam', delta: 8000 },
    ] },
  ],
};

// mô tả dài cho trang chi tiết (POC: ghép từ mô tả ngắn)
App.data.menuStory = (it) => {
  const head = it.desc || it.tags || it.sub || '';
  if (it.kind === 'box') return `${head}. Lá trà nguyên lá tuyển chọn từ vùng trà Bảo Lộc và Thái Nguyên, đóng gói túi lọc tiện pha tại nhà hoặc văn phòng. Thích hợp làm quà tặng.`;
  if (it.kind === 'merch') return `${head}. Sản phẩm giới hạn của Mộc Trà, thiết kế lấy cảm hứng từ chiếc lá trà. Nhận tại cửa hàng cùng đơn đồ uống.`;
  if (it.kind === 'combo') return `${head}. Combo áp dụng size Lớn với tuỳ chọn mặc định; có thể điều chỉnh tại quầy khi nhận món. Số lượng quà tặng có hạn.`;
  return `${head}. Lá trà được ủ và pha mới cho từng ly ngay khi bạn đặt, giữ trọn hương thơm tự nhiên và hậu vị ngọt thanh. Gợi ý: chọn ít ngọt để cảm nhận rõ vị trà.`;
};

// Phương thức thanh toán (dùng ở C6, cổng thanh toán, chi tiết đơn)
App.data.payMethods = [
  { id: 'intl', label: 'Thẻ quốc tế', sub: 'Visa · Mastercard · JCB · Amex' },
  { id: 'atm', label: 'Thẻ nội địa', sub: 'ATM · Internet Banking' },
  { id: 'vietqr', label: 'VietQR', sub: 'Quét mã bằng app ngân hàng' },
  { id: 'momo', label: 'Ví MoMo', sub: 'Liên kết ví điện tử' },
];
