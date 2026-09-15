import { mockData } from './mock-data.js';

export const STATE_KEY = 'earmory-demo-state';
export const ROLE_KEY = 'earmory-demo-role';

function cloneData(data) {
  return JSON.parse(JSON.stringify(data));
}

function getStorage(storage) {
  if (storage) return storage;
  if (typeof globalThis.localStorage !== 'undefined') return globalThis.localStorage;
  throw new Error('localStorage tidak tersedia pada lingkungan ini.');
}

function buildState() {
  const data = cloneData(mockData);
  const prajurit = data.users.filter((user) => user.role === 'prajurit');

  return {
    currentRole: null,
    currentUser: null,
    barang: data.barang,
    kategori: data.kategori,
    prajurit,
    peminjaman: data.peminjaman,
    activityLogs: data.activityLogs,
  };
}

export function saveState(state, storage) {
  getStorage(storage).setItem(STATE_KEY, JSON.stringify(state));
  return state;
}

export function loadState(storage) {
  const browserStorage = getStorage(storage);
  const savedState = browserStorage.getItem(STATE_KEY);

  if (!savedState) {
    const initialState = buildState();
    saveState(initialState, browserStorage);
    return initialState;
  }

  try {
    return JSON.parse(savedState);
  } catch {
    const initialState = buildState();
    saveState(initialState, browserStorage);
    return initialState;
  }
}

export function initializeDemoState(storage) {
  return loadState(storage);
}

export function setCurrentRole(role, storage) {
  const browserStorage = getStorage(storage);
  const state = loadState(browserStorage);
  const users = [
    ...state.prajurit,
    { id: 1, role: 'admin', name: 'Super Admin', username: 'admin.demo' },
    { id: 2, role: 'staff', name: 'Rizal Pratama', username: 'staff.demo' },
  ];
  const currentUser = users.find((user) => user.role === role) ?? null;

  state.currentRole = role;
  state.currentUser = currentUser;
  browserStorage.setItem(ROLE_KEY, role);
  saveState(state, browserStorage);

  return state;
}

export function getStoredRole(storage) {
  return getStorage(storage).getItem(ROLE_KEY);
}

export function clearCurrentRole(storage) {
  const browserStorage = getStorage(storage);
  const state = loadState(browserStorage);

  state.currentRole = null;
  state.currentUser = null;
  browserStorage.removeItem(ROLE_KEY);
  saveState(state, browserStorage);

  return state;
}

export function resetDemoState(storage) {
  const browserStorage = getStorage(storage);
  browserStorage.removeItem(STATE_KEY);
  browserStorage.removeItem(ROLE_KEY);
  return initializeDemoState(browserStorage);
}

export function updateLoanStatus(loanId, nextStatus, storage) {
  const browserStorage = getStorage(storage);
  const state = loadState(browserStorage);
  const loan = state.peminjaman.find((item) => item.id === Number(loanId));

  if (!loan) throw new Error('Peminjaman tidak ditemukan.');

  const allowedTransitions = {
    menunggu: ['disetujui', 'ditolak'],
    disetujui: ['dipinjam'],
    dipinjam: ['selesai'],
  };
  if (!allowedTransitions[loan.status]?.includes(nextStatus)) {
    throw new Error(`Status ${loan.status} tidak dapat diubah menjadi ${nextStatus}.`);
  }

  if (nextStatus === 'dipinjam') {
    loan.details.forEach((detail) => {
      const item = state.barang.find((barang) => barang.id === detail.barangId);
      if (!item || item.stokTersedia < detail.qty) {
        throw new Error('Stok barang tidak mencukupi.');
      }
    });
    loan.details.forEach((detail) => {
      const item = state.barang.find((barang) => barang.id === detail.barangId);
      item.stokTersedia -= detail.qty;
      item.status = item.stokTersedia === 0 ? 'Dipinjam' : 'Tersedia';
    });
  }

  if (nextStatus === 'selesai') {
    loan.details.forEach((detail) => {
      const item = state.barang.find((barang) => barang.id === detail.barangId);
      if (!item) return;
      item.stokTersedia = Math.min(item.stokTotal, item.stokTersedia + detail.qty);
      item.status = 'Tersedia';
    });
    loan.returnedAt = new Date().toISOString();
  }

  loan.status = nextStatus;
  state.activityLogs.unshift({
    id: Date.now(),
    actor: state.currentUser?.name ?? 'Super Admin',
    role: state.currentRole ?? 'admin',
    action: nextStatus.toUpperCase(),
    entity: 'PEMINJAMAN',
    description: `${loan.kode} menjadi ${nextStatus}.`,
    createdAt: new Date().toISOString(),
  });
  saveState(state, browserStorage);

  return state;
}

export function cancelLoan(loanId, storage) {
  const browserStorage = getStorage(storage);
  const state = loadState(browserStorage);
  const loan = state.peminjaman.find((item) => item.id === Number(loanId));

  if (!loan) throw new Error('Peminjaman tidak ditemukan.');
  if (loan.status !== 'menunggu') {
    throw new Error('Hanya pengajuan berstatus menunggu yang dapat dibatalkan.');
  }

  loan.status = 'dibatalkan';
  state.activityLogs.unshift({
    id: Date.now(),
    actor: state.currentUser?.name ?? 'Prajurit',
    role: 'prajurit',
    action: 'CANCEL',
    entity: 'PEMINJAMAN',
    description: `${loan.kode} dibatalkan.`,
    createdAt: new Date().toISOString(),
  });
  saveState(state, browserStorage);

  return state;
}

export function createLoan(fields, storage) {
  const browserStorage = getStorage(storage);
  const state = loadState(browserStorage);
  const user = state.currentUser ?? state.prajurit[0];
  const details = fields.details ?? [];
  if (!fields.tanggalKembaliRencana || !fields.tujuan || details.length === 0) {
    throw new Error('Tanggal kembali, tujuan, dan minimal satu barang wajib dipilih.');
  }
  details.forEach((detail) => {
    const item = state.barang.find((barang) => barang.id === Number(detail.barangId));
    if (!item || Number(detail.qty) < 1 || Number(detail.qty) > item.stokTersedia) {
      throw new Error('Jumlah barang melebihi stok tersedia.');
    }
  });
  const nextNumber = Math.max(0, ...state.peminjaman.map((item) => Number(item.kode.replace('PMJ-', '')))) + 1;
  const loan = {
    id: Math.max(0, ...state.peminjaman.map((item) => item.id)) + 1,
    kode: `PMJ-${String(nextNumber).padStart(6, '0')}`,
    prajuritId: user.id,
    tanggalPinjam: new Date().toISOString().slice(0, 10),
    tanggalKembaliRencana: fields.tanggalKembaliRencana,
    tujuan: fields.tujuan,
    status: 'menunggu',
    catatan: fields.catatan ?? '',
    details: details.map((detail) => ({ barangId: Number(detail.barangId), qty: Number(detail.qty) })),
    createdAt: new Date().toISOString(),
  };
  state.peminjaman.unshift(loan);
  state.activityLogs.unshift({ id: Date.now(), actor: user.name, role: 'prajurit', action: 'CREATE', entity: 'PEMINJAMAN', description: `Membuat ${loan.kode}.`, createdAt: new Date().toISOString() });
  saveState(state, browserStorage);
  return state;
}

export function updatePrajuritProfile(fields, storage) {
  const browserStorage = getStorage(storage);
  const state = loadState(browserStorage);
  const user = state.prajurit.find((item) => item.id === state.currentUser?.id);
  if (!user) throw new Error('Profil Prajurit tidak ditemukan.');
  const values = ['name', 'pangkat', 'kesatuan', 'jabatan'].map((field) => [field, normalizePrajurit(fields[field])]);
  if (values.some(([, value]) => !value)) throw new Error('Nama, pangkat, kesatuan, dan jabatan wajib diisi.');
  Object.fromEntries(values);
  Object.assign(user, Object.fromEntries(values));
  state.currentUser = { ...state.currentUser, ...Object.fromEntries(values) };
  saveState(state, browserStorage);
  return state;
}

export function updatePrajuritStatus(prajuritId, nextStatus, storage) {
  const browserStorage = getStorage(storage);
  const state = loadState(browserStorage);
  const prajurit = state.prajurit.find((item) => item.id === Number(prajuritId));

  if (!prajurit) throw new Error('Data prajurit tidak ditemukan.');
  if (prajurit.status !== 'menunggu' || !['aktif', 'ditolak'].includes(nextStatus)) {
    throw new Error('Status prajurit tidak dapat diproses.');
  }

  prajurit.status = nextStatus;
  state.activityLogs.unshift({
    id: Date.now(),
    actor: state.currentUser?.name ?? 'Super Admin',
    role: state.currentRole ?? 'admin',
    action: nextStatus === 'aktif' ? 'APPROVE' : 'REJECT',
    entity: 'PRAJURIT',
    description: `${prajurit.nama ?? prajurit.name} menjadi ${nextStatus}.`,
    createdAt: new Date().toISOString(),
  });
  saveState(state, browserStorage);

  return state;
}

function normalizeCategoryName(name) {
  return String(name ?? '').trim().replace(/\s+/g, ' ');
}

export function createCategory(name, storage) {
  const browserStorage = getStorage(storage);
  const state = loadState(browserStorage);
  const categoryName = normalizeCategoryName(name);

  if (!categoryName) throw new Error('Nama kategori wajib diisi.');
  if (state.kategori.some((item) => item.nama.toLowerCase() === categoryName.toLowerCase())) {
    throw new Error('Nama kategori sudah tersedia.');
  }

  const category = { id: Math.max(0, ...state.kategori.map((item) => item.id)) + 1, nama: categoryName };
  state.kategori.unshift(category);
  saveState(state, browserStorage);
  return state;
}

export function renameCategory(categoryId, name, storage) {
  const browserStorage = getStorage(storage);
  const state = loadState(browserStorage);
  const category = state.kategori.find((item) => item.id === Number(categoryId));
  const categoryName = normalizeCategoryName(name);

  if (!category) throw new Error('Kategori tidak ditemukan.');
  if (!categoryName) throw new Error('Nama kategori wajib diisi.');
  if (state.kategori.some((item) => item.id !== category.id && item.nama.toLowerCase() === categoryName.toLowerCase())) {
    throw new Error('Nama kategori sudah tersedia.');
  }

  category.nama = categoryName;
  saveState(state, browserStorage);
  return state;
}

export function removeCategory(categoryId, storage) {
  const browserStorage = getStorage(storage);
  const state = loadState(browserStorage);
  const categoryIndex = state.kategori.findIndex((item) => item.id === Number(categoryId));

  if (categoryIndex < 0) throw new Error('Kategori tidak ditemukan.');
  state.kategori.splice(categoryIndex, 1);
  saveState(state, browserStorage);
  return state;
}

function normalizePrajurit(value) {
  return String(value ?? '').trim().replace(/\s+/g, ' ');
}

function validatePrajuritFields(state, fields, currentId = null) {
  const requiredFields = ['name', 'username', 'nrp', 'pangkat', 'kesatuan', 'jabatan'];
  if (requiredFields.some((field) => !normalizePrajurit(fields[field]))) {
    throw new Error('Nama, username, NRP, pangkat, kesatuan, dan jabatan wajib diisi.');
  }
  if (state.prajurit.some((item) => item.id !== currentId && item.username.toLowerCase() === fields.username.toLowerCase())) {
    throw new Error('Username sudah digunakan.');
  }
  if (state.prajurit.some((item) => item.id !== currentId && item.nrp === fields.nrp)) {
    throw new Error('NRP sudah digunakan.');
  }
}

export function createPrajurit(fields, storage) {
  const browserStorage = getStorage(storage);
  const state = loadState(browserStorage);
  const normalizedFields = Object.fromEntries(Object.entries(fields).map(([key, value]) => [key, normalizePrajurit(value)]));
  validatePrajuritFields(state, normalizedFields);
  state.prajurit.push({ id: Math.max(0, ...state.prajurit.map((item) => item.id)) + 1, ...normalizedFields, status: 'aktif' });
  saveState(state, browserStorage);
  return state;
}

export function updatePrajurit(prajuritId, fields, storage) {
  const browserStorage = getStorage(storage);
  const state = loadState(browserStorage);
  const prajurit = state.prajurit.find((item) => item.id === Number(prajuritId));
  const normalizedFields = Object.fromEntries(Object.entries(fields).map(([key, value]) => [key, normalizePrajurit(value)]));
  if (!prajurit) throw new Error('Data prajurit tidak ditemukan.');
  validatePrajuritFields(state, normalizedFields, prajurit.id);
  Object.assign(prajurit, normalizedFields);
  saveState(state, browserStorage);
  return state;
}

export function removePrajurit(prajuritId, storage) {
  const browserStorage = getStorage(storage);
  const state = loadState(browserStorage);
  const index = state.prajurit.findIndex((item) => item.id === Number(prajuritId));
  if (index < 0) throw new Error('Data prajurit tidak ditemukan.');
  state.prajurit.splice(index, 1);
  saveState(state, browserStorage);
  return state;
}

function normalizeBarang(value) {
  return String(value ?? '').trim().replace(/\s+/g, ' ');
}

function validateBarangFields(state, fields) {
  if (!normalizeBarang(fields.nama) || !Number.isInteger(Number(fields.kategoriId)) || Number(fields.stokTotal) < 0) {
    throw new Error('Nama, kategori, dan stok total wajib diisi dengan benar.');
  }
  if (!state.kategori.some((item) => item.id === Number(fields.kategoriId))) {
    throw new Error('Kategori barang tidak ditemukan.');
  }
}

export function createBarang(fields, storage) {
  const browserStorage = getStorage(storage);
  const state = loadState(browserStorage);
  const normalizedFields = { ...fields, nama: normalizeBarang(fields.nama), merk: normalizeBarang(fields.merk), lokasi: normalizeBarang(fields.lokasi) };
  validateBarangFields(state, normalizedFields);
  const nextNumber = Math.max(0, ...state.barang.map((item) => Number(item.kode.replace('BRG-', '')))) + 1;
  const stokTotal = Number(normalizedFields.stokTotal);
  state.barang.unshift({ id: Math.max(0, ...state.barang.map((item) => item.id)) + 1, kode: `BRG-${String(nextNumber).padStart(4, '0')}`, nama: normalizedFields.nama, kategoriId: Number(normalizedFields.kategoriId), merk: normalizedFields.merk, stokTotal, stokTersedia: stokTotal, satuan: normalizedFields.satuan || 'Unit', kondisi: normalizedFields.kondisi || 'Baik', status: normalizedFields.status || 'Tersedia', lokasi: normalizedFields.lokasi, hargaPerolehan: Number(normalizedFields.hargaPerolehan) || 0 });
  saveState(state, browserStorage);
  return state;
}

export function updateBarang(barangId, fields, storage) {
  const browserStorage = getStorage(storage);
  const state = loadState(browserStorage);
  const barang = state.barang.find((item) => item.id === Number(barangId));
  const normalizedFields = { ...fields, nama: normalizeBarang(fields.nama), merk: normalizeBarang(fields.merk), lokasi: normalizeBarang(fields.lokasi) };
  if (!barang) throw new Error('Barang tidak ditemukan.');
  validateBarangFields(state, normalizedFields);
  const borrowedStock = Math.max(0, barang.stokTotal - barang.stokTersedia);
  barang.nama = normalizedFields.nama;
  barang.kategoriId = Number(normalizedFields.kategoriId);
  barang.merk = normalizedFields.merk;
  barang.stokTotal = Number(normalizedFields.stokTotal);
  barang.stokTersedia = Math.max(0, barang.stokTotal - borrowedStock);
  barang.satuan = normalizedFields.satuan || barang.satuan;
  barang.kondisi = normalizedFields.kondisi || barang.kondisi;
  barang.status = normalizedFields.status || barang.status;
  barang.lokasi = normalizedFields.lokasi;
  barang.hargaPerolehan = Number(normalizedFields.hargaPerolehan) || 0;
  saveState(state, browserStorage);
  return state;
}

export function removeBarang(barangId, storage) {
  const browserStorage = getStorage(storage);
  const state = loadState(browserStorage);
  const index = state.barang.findIndex((item) => item.id === Number(barangId));
  if (index < 0) throw new Error('Barang tidak ditemukan.');
  if (state.peminjaman.some((loan) => loan.details.some((detail) => detail.barangId === Number(barangId)))) {
    throw new Error('Barang yang pernah digunakan dalam peminjaman tidak dapat dihapus.');
  }
  state.barang.splice(index, 1);
  saveState(state, browserStorage);
  return state;
}
