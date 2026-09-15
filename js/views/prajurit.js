function statusLabel(status) {
  const labels = { menunggu: 'Menunggu', disetujui: 'Disetujui', dipinjam: 'Dipinjam', selesai: 'Selesai', ditolak: 'Ditolak', dibatalkan: 'Dibatalkan' };
  return labels[status] ?? status;
}

function statusClass(status) {
  return { menunggu: 'status-yellow', disetujui: 'status-blue', dipinjam: 'status-blue', selesai: 'status-green', ditolak: 'status-red', dibatalkan: 'status' }[status] ?? 'status';
}

function prajuritSidebar(active, user) {
  const links = [['dashboard', 'Dashboard', '#prajurit/dashboard'], ['profile', 'Data Diri', '#prajurit/profile'], ['peminjaman', 'Peminjaman', '#prajurit/peminjaman']];
  const initial = (user?.name ?? 'P').charAt(0).toUpperCase();
  return `<aside class="sidebar" aria-label="Primary navigation"><div class="sidebar-brand"><div class="brand-icon">P</div><div class="brand-name">EArmory<small>Prajurit</small></div></div><nav class="sidebar-nav"><div class="nav-group"><div class="nav-label">Main</div>${links.map(([key, label, href]) => `<a class="nav-link ${active === key ? 'active' : ''}" href="${href}">${label}</a>`).join('')}<button class="nav-link" type="button" data-action="logout">Logout</button></div></nav><div class="sidebar-footer"><div class="sidebar-user"><div class="avatar">${initial}<span class="online"></span></div><div class="sidebar-user-info"><div class="name">${user?.name ?? '-'}</div><div class="role">Prajurit</div></div></div></div></aside>`;
}

function prajuritFrame({ active, title, pretitle, content, user }) {
  return `${prajuritSidebar(active, user)}<header class="topbar"><div class="topbar-left"><button class="sidebar-toggle" type="button" aria-label="Open menu">?</button><nav class="breadcrumb" aria-label="Breadcrumb"><span class="current">${title}</span></nav></div><div class="topbar-right"><div class="tb-user"><span class="tb-user-name">${user?.name ?? '-'}</span></div></div></header><main id="main-content" class="main"><div class="page-wrapper"><div class="page-header"><div class="page-header-row"><div><div class="page-pretitle">${pretitle}</div><h1 class="page-title">${title}</h1></div></div></div><div class="page-body">${content}</div></div><footer class="footer"><span>EArmory Prajurit</span><span>v1</span></footer></main>`;
}

function stat(iconClass, icon, label, value) {
  return `<div class="stat"><div class="stat-icon ${iconClass}">${icon}</div><div class="stat-content"><div class="stat-label">${label}</div><div class="stat-value-row"><div class="stat-value">${value}</div></div></div></div>`;
}

const icons = {
  document: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M9 12h6M9 16h6M6 4h12a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z"/></svg>',
  clock: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 3"/></svg>',
  borrowed: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M5 8h14M5 8a2 2 0 1 0-4 0 2 2 0 0 0 4 0zM19 8a2 2 0 1 0 4 0 2 2 0 0 0-4 0zM5 8v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8"/></svg>',
  check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M20 6L9 17l-5-5"/></svg>',
};

export function renderPrajuritDashboard(state) {
  const user = state.currentUser ?? state.prajurit[0];
  const loans = state.peminjaman.filter((loan) => loan.prajuritId === user?.id);
  const stats = [stat('blue', icons.document, 'Total Pengajuan', loans.length), stat('yellow', icons.clock, 'Menunggu', loans.filter((loan) => loan.status === 'menunggu').length), stat('teal', icons.borrowed, 'Dipinjam', loans.filter((loan) => loan.status === 'dipinjam').length), stat('green', icons.check, 'Dikembalikan', loans.filter((loan) => loan.status === 'selesai').length)].join('');
  const loanRows = loans.slice().sort((a, b) => b.createdAt.localeCompare(a.createdAt)).map((loan) => `<tr><td class="cell-mono">${loan.kode}</td><td>${loan.tanggalPinjam}</td><td><span class="status ${statusClass(loan.status)}">${statusLabel(loan.status)}</span></td></tr>`).join('');
  const content = `<div class="row col-4">${stats}</div><div class="row col-1" style="margin-top:1.25rem"><div class="card"><div class="card-header"><div class="card-title">Data Diri</div></div><div class="card-body"><div class="detail-contact"><div class="detail-contact-head"><div class="avatar" style="width:56px;height:56px;font-size:18px">${(user?.name ?? 'P').charAt(0).toUpperCase()}</div><div><div style="font-size:16px;font-weight:600;color:var(--text)">${user?.name ?? '-'}</div><div style="font-size:12.5px;color:var(--text-muted)">${user?.jabatan ?? '-'} &middot; ${user?.kesatuan ?? '-'}</div></div></div><div class="detail-contact-fields"><div class="form-group" style="margin-bottom:0"><label class="form-label">NRP</label><div class="cell-mono" style="font-size:13px">${user?.nrp ?? '-'}</div></div><div class="form-group" style="margin-bottom:0"><label class="form-label">Pangkat</label><div>${user?.pangkat ?? '-'}</div></div><div class="form-group" style="margin-bottom:0"><label class="form-label">Username</label><div>${user?.username ?? '-'}</div></div><div class="form-group" style="margin-bottom:0"><label class="form-label">Kesatuan</label><div>${user?.kesatuan ?? '-'}</div></div></div></div></div></div></div><div class="row col-1"><div class="card"><div class="card-header"><div class="card-title">Peminjaman Terbaru</div><a href="#prajurit/peminjaman" class="btn btn-sm btn-outline">Lihat semua</a></div><div class="card-body"><div class="table-responsive"><table class="table"><thead><tr><th>Kode</th><th>Tanggal Pinjam</th><th>Status</th></tr></thead><tbody>${loanRows}</tbody></table></div></div></div></div>`;
  return prajuritFrame({ active: 'dashboard', title: 'Dashboard Prajurit', pretitle: 'Selamat datang', content, user });
}

export function renderPrajuritLoans(state) {
  const user = state.currentUser ?? state.prajurit[0];
  const loans = state.peminjaman.filter((loan) => loan.prajuritId === user?.id).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const rows = loans.map((loan) => `<tr><td class="cell-mono">${loan.kode}</td><td>${loan.tanggalPinjam}</td><td><span class="status ${statusClass(loan.status)}">${statusLabel(loan.status)}</span></td><td><div class="row-actions" style="opacity:1"><a class="btn btn-sm btn-outline" href="#prajurit/peminjaman/${loan.id}">Detail</a>${loan.status === 'menunggu' ? `<button type="button" class="btn btn-sm btn-danger" data-prajurit-cancel="${loan.id}">Batalkan</button>` : ''}</div></td></tr>`).join('');
  const empty = '<tr><td colspan="4" style="text-align:center;color:var(--text-muted)">Belum ada peminjaman</td></tr>';
  const content = `<div class="row col-1"><div class="card"><div class="card-header"><div class="card-title">Peminjaman Saya</div><a class="btn btn-primary" href="#prajurit/peminjaman/create">+ Ajukan Peminjaman</a></div><div class="card-body"><p id="prajurit-loan-feedback" class="demo-feedback" role="status" aria-live="polite"></p><div class="table-responsive"><table class="table"><thead><tr><th>Kode</th><th>Tanggal Pinjam</th><th>Status</th><th>Aksi</th></tr></thead><tbody>${rows || empty}</tbody></table></div></div></div></div>`;
  return prajuritFrame({ active: 'peminjaman', title: 'Peminjaman Saya', pretitle: 'Riwayat pengajuan', content, user });
}

export function renderPrajuritLoanCreate(state) {
  const user = state.currentUser ?? state.prajurit[0];
  const availableItems = state.barang.filter((item) => item.stokTersedia > 0);
  const rows = availableItems.map((item) => `<tr data-loan-item="${item.id}"><td><input type="checkbox" data-loan-check="${item.id}"></td><td class="cell-strong">${item.nama}</td><td>${item.stokTersedia}</td><td><input class="form-control" type="number" min="1" max="${item.stokTersedia}" value="1" data-loan-qty="${item.id}" disabled></td></tr>`).join('');
  const content = `<div class="row col-1"><div class="card"><div class="card-header"><div class="card-title">Form Pengajuan Peminjaman</div></div><div class="card-body"><p id="prajurit-create-feedback" class="demo-feedback" role="alert" aria-live="polite"></p><form id="prajurit-loan-form"><div class="form-row"><div class="form-group"><label class="form-label" for="loan-return-date">Rencana Tanggal Kembali</label><input id="loan-return-date" class="form-control" type="date" required></div><div class="form-group"><label class="form-label" for="loan-purpose">Tujuan Peminjaman</label><select id="loan-purpose" class="form-control" required><option value="">Pilih tujuan</option><option>Latihan</option><option>Operasi</option><option>Pendidikan</option><option>Lainnya</option></select></div></div><div class="form-group"><label class="form-label" for="loan-note">Catatan</label><textarea id="loan-note" class="form-control" rows="3"></textarea></div><div class="form-group"><label class="form-label">Pilih Barang</label><div class="table-responsive"><table class="table"><thead><tr><th></th><th>Nama Barang</th><th>Stok Tersedia</th><th>Jumlah</th></tr></thead><tbody>${rows}</tbody></table></div></div><div class="form-actions"><button class="btn btn-primary" type="submit">Ajukan Peminjaman</button><a class="btn btn-outline" href="#prajurit/peminjaman">Kembali</a></div></form></div></div></div>`;
  return prajuritFrame({ active: 'peminjaman', title: 'Ajukan Peminjaman', pretitle: 'Peminjaman Saya', content, user });
}

export function renderPrajuritProfile(state) {
  const user = state.currentUser ?? state.prajurit[0];
  const content = `<div class="row col-1"><div class="card"><div class="card-header"><div class="card-title">Data Diri</div><div class="card-subtitle">Biarkan field yang tidak ingin diubah tetap seperti semula.</div></div><div class="card-body"><p id="profile-feedback" class="demo-feedback" role="status" aria-live="polite"></p><form id="profile-form"><div class="form-row"><div class="form-group"><label class="form-label" for="profile-name">Nama</label><input id="profile-name" class="form-control" value="${user?.name ?? ''}" required></div><div class="form-group"><label class="form-label">NRP</label><input class="form-control" value="${user?.nrp ?? ''}" readonly><div class="form-help">NRP tidak dapat diubah.</div></div></div><div class="form-group"><label class="form-label">Username</label><input class="form-control" value="${user?.username ?? ''}" readonly><div class="form-help">Username tidak dapat diubah.</div></div><div class="form-row"><div class="form-group"><label class="form-label" for="profile-rank">Pangkat</label><input id="profile-rank" class="form-control" value="${user?.pangkat ?? ''}" required></div><div class="form-group"><label class="form-label" for="profile-unit">Kesatuan</label><input id="profile-unit" class="form-control" value="${user?.kesatuan ?? ''}" required></div></div><div class="form-group"><label class="form-label" for="profile-position">Jabatan</label><input id="profile-position" class="form-control" value="${user?.jabatan ?? ''}" required></div><div class="form-actions"><button class="btn btn-primary" type="submit">Simpan Data Diri</button></div></form></div></div></div>`;
  return prajuritFrame({ active: 'profile', title: 'Data Diri', pretitle: 'Profil Prajurit', content, user });
}

export function renderPrajuritLoanDetail(state, loanId) {
  const user = state.currentUser ?? state.prajurit[0];
  const loan = state.peminjaman.find((item) => item.id === Number(loanId) && item.prajuritId === user?.id);
  if (!loan) return prajuritFrame({ active: 'peminjaman', title: 'Detail Peminjaman', pretitle: 'Peminjaman Saya', content: '<div class="alert alert-error">Peminjaman tidak ditemukan.</div>', user });
  const rows = loan.details.map((detail) => { const item = state.barang.find((barang) => barang.id === detail.barangId); return `<tr><td class="cell-strong">${item?.nama ?? '-'}</td><td>${detail.qty}</td></tr>`; }).join('');
  const content = `<div class="row col-1"><div class="card"><div class="card-header"><div class="card-title cell-mono">${loan.kode}</div><div class="card-subtitle"><span class="status ${statusClass(loan.status)}">${statusLabel(loan.status)}</span></div></div><div class="card-body"><div class="detail-contact-fields" style="margin-bottom:1.5rem"><div class="form-group" style="margin-bottom:0"><label class="form-label">Tanggal Pinjam</label><div>${loan.tanggalPinjam}</div></div><div class="form-group" style="margin-bottom:0"><label class="form-label">Rencana Kembali</label><div>${loan.tanggalKembaliRencana}</div></div><div class="form-group" style="margin-bottom:0"><label class="form-label">Tujuan</label><div>${loan.tujuan}</div></div><div class="form-group" style="margin-bottom:0"><label class="form-label">Catatan</label><div>${loan.catatan || '-'}</div></div></div><label class="form-label">Daftar Barang</label><div class="table-responsive"><table class="table"><thead><tr><th>Barang</th><th>Jumlah</th></tr></thead><tbody>${rows}</tbody></table></div></div><div class="card-footer"><a href="#prajurit/peminjaman" class="btn btn-outline">Kembali</a></div></div></div>`;
  return prajuritFrame({ active: 'peminjaman', title: 'Detail Peminjaman', pretitle: 'Peminjaman Saya', content, user });
}
