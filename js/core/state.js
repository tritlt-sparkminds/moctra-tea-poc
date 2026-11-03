// Trạng thái app mô phỏng, lưu localStorage để giữ giữa các lần mở
App.state = (() => {
  const KEY = 'moctra.poc.state.v1';
  const defaults = {
    onboarded: false,
    permissions: { location: 'notDetermined', notifications: 'notDetermined' },
    simulateOutdated: false,
    // dữ liệu demo cho Trang chủ
    isMember: false,
    hasActiveOrder: false,
    orderMode: 'pickup', // 'pickup' | 'delivery'
    storeId: 's1',
    addressId: 'a1',     // địa chỉ giao đang chọn (hội viên)
    favStores: ['s1'],
    cart: [],
  };
  let data;
  try { data = { ...defaults, ...JSON.parse(localStorage.getItem(KEY) || '{}') }; }
  catch { data = { ...defaults }; }
  data.permissions = { ...defaults.permissions, ...(data.permissions || {}) };

  const listeners = new Set();
  const save = () => {
    localStorage.setItem(KEY, JSON.stringify(data));
    listeners.forEach((fn) => fn(data));
  };

  return {
    get: () => data,
    set(patch) { data = { ...data, ...patch }; save(); },
    setPermission(name, value) { data.permissions = { ...data.permissions, [name]: value }; save(); },
    reset(keep = {}) { data = { ...defaults, permissions: { ...defaults.permissions }, ...keep }; save(); },
    subscribe(fn) { listeners.add(fn); return () => listeners.delete(fn); },
  };
})();

// số tem hiện có của hội viên (POC: tài khoản cũ 7 tem, tài khoản mới 0 tem)
App.memberStamps = () => {
  const d = App.state.get();
  if (!d.isMember) return 0;
  return d.profile && d.profile.isNew ? 0 : 7;
};
