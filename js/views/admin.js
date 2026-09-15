function formatCurrency(value) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(value);
}

function statusLabel(status) {
  const labels = {
    menunggu: 'Menunggu',
    disetujui: 'Disetujui',
    dipinjam: 'Dipinjam',
    selesai: 'Selesai',
    ditolak: 'Ditolak',
  };

  return labels[status] ?? status;
}

export function renderAdminDashboard(state) {
  const totalStok = state.barang.reduce((total, item) => total + item.stokTotal, 0);
  const totalNilai = state.barang.reduce(
    (total, item) => total + (item.stokTotal * item.hargaPerolehan),
    0,
  );
  const statusCounts = state.peminjaman.reduce((counts, item) => {
    counts[item.status] = (counts[item.status] ?? 0) + 1;
    return counts;
  }, {});
  const recentLoans = [...state.peminjaman]
    .sort((first, second) => second.createdAt.localeCompare(first.createdAt))
    .slice(0, 5);

  return `
    <div class="dashboard-shell">
      <aside class="dashboard-sidebar">
        <div class="dashboard-brand"><span>EA</span><strong>EArmory</strong><small>Admin Demo</small></div>
        <nav class="dashboard-nav" aria-label="Navigasi Admin">
          <a class="dashboard-nav-link active" href="#admin/dashboard">Dashboard</a>
          <a class="dashboard-nav-link" href="#admin/barang">Gudang Barang</a>
          <a class="dashboard-nav-link" href="#admin/peminjaman">Peminjaman</a>
          <a class="dashboard-nav-link" href="#admin/prajurit">Prajurit</a>
        </nav>
        <button class="dashboard-logout" type="button" data-action="logout">Keluar ke landing</button>
      </aside>

      <main class="dashboard-main">
        <header class="dashboard-header">
          <div>
            <p class="eyebrow">RUANG KENDALI / ADMIN</p>
            <h1>Selamat datang, ${state.currentUser?.name ?? 'Admin'}</h1>
          </div>
          <span class="demo-badge">DATA DUMMY</span>
        </header>

        <section class="dashboard-stats" aria-label="Ringkasan inventaris">
          <article class="stat-card stat-card-primary"><span>Total Barang</span><strong>${state.barang.length}</strong><small>item inventaris</small></article>
          <article class="stat-card"><span>Total Stok</span><strong>${totalStok}</strong><small>unit terdaftar</small></article>
          <article class="stat-card"><span>Kategori</span><strong>${state.kategori.length}</strong><small>kelompok barang</small></article>
          <article class="stat-card"><span>Nilai Inventaris</span><strong>${formatCurrency(totalNilai)}</strong><small>nilai perolehan</small></article>
        </section>

        <section class="dashboard-content-grid">
          <article class="dashboard-panel loan-panel">
            <div class="panel-heading"><div><p class="eyebrow">AKTIVITAS TERBARU</p><h2>Peminjaman</h2></div><a href="#admin/peminjaman">Lihat semua</a></div>
            <div class="loan-status-row">
              <span><b>${statusCounts.menunggu ?? 0}</b> Menunggu</span>
              <span><b>${statusCounts.disetujui ?? 0}</b> Disetujui</span>
              <span><b>${statusCounts.dipinjam ?? 0}</b> Dipinjam</span>
              <span><b>${statusCounts.selesai ?? 0}</b> Selesai</span>
            </div>
            <div class="loan-list">
              ${recentLoans.map((loan) => `
                <div class="loan-row">
                  <div><strong>${loan.kode}</strong><span>Prajurit #${loan.prajuritId} / ${loan.tujuan}</span></div>
                  <span class="status-pill status-${loan.status}">${statusLabel(loan.status)}</span>
                </div>
              `).join('')}
            </div>
          </article>

          <article class="dashboard-panel inventory-panel">
            <div class="panel-heading"><div><p class="eyebrow">INVENTARIS</p><h2>Kondisi Gudang</h2></div><a href="#admin/barang">Buka gudang</a></div>
            <div class="inventory-list">
              ${state.barang.slice(0, 5).map((item) => `
                <div class="inventory-row"><span>${item.nama}</span><strong class="${item.stokTersedia === 0 ? 'empty-stock' : ''}">${item.stokTersedia}/${item.stokTotal}</strong></div>
              `).join('')}
            </div>
          </article>
        </section>
      </main>
    </div>
  `;
}

export function renderAdminInventory(state) {
  const totalAvailable = state.barang.reduce((total, item) => total + item.stokTersedia, 0);
  const emptyItems = state.barang.filter((item) => item.stokTersedia === 0).length;

  return `
    <div class="dashboard-shell">
      <aside class="dashboard-sidebar">
        <div class="dashboard-brand"><span>EA</span><strong>EArmory</strong><small>Admin Demo</small></div>
        <nav class="dashboard-nav" aria-label="Navigasi Admin">
          <a class="dashboard-nav-link" href="#admin/dashboard">Dashboard</a>
          <a class="dashboard-nav-link active" href="#admin/barang">Gudang Barang</a>
          <a class="dashboard-nav-link" href="#admin/peminjaman">Peminjaman</a>
          <a class="dashboard-nav-link" href="#admin/prajurit">Prajurit</a>
        </nav>
        <button class="dashboard-logout" type="button" data-action="logout">Keluar ke landing</button>
      </aside>

      <main class="dashboard-main">
        <header class="dashboard-header">
          <div>
            <p class="eyebrow">OPERASIONAL / INVENTARIS</p>
            <h1>Gudang Barang</h1>
          </div>
          <a class="dashboard-back-link" href="#admin/dashboard">Kembali ke dashboard</a>
        </header>

        <section class="dashboard-stats inventory-summary" aria-label="Ringkasan gudang">
          <article class="stat-card stat-card-primary"><span>Jenis Barang</span><strong>${state.barang.length}</strong><small>item inventaris</small></article>
          <article class="stat-card"><span>Stok Tersedia</span><strong>${totalAvailable}</strong><small>unit siap dipinjam</small></article>
          <article class="stat-card"><span>Stok Kosong</span><strong>${emptyItems}</strong><small>perlu perhatian</small></article>
          <article class="stat-card"><span>Kategori</span><strong>${state.kategori.length}</strong><small>kelompok barang</small></article>
        </section>

        <section class="dashboard-panel inventory-table-panel">
          <div class="inventory-toolbar">
            <div><p class="eyebrow">DAFTAR INVENTARIS</p><h2>Semua Barang</h2></div>
            <div class="inventory-filters">
              <label> Cari barang
                <input id="inventory-search" type="search" placeholder="Nama atau kode" autocomplete="off">
              </label>
              <label> Kategori
                <select id="inventory-category">
                  <option value="all">Semua kategori</option>
                  ${state.kategori.map((category) => `<option value="${category.id}">${category.nama}</option>`).join('')}
                </select>
              </label>
            </div>
          </div>
          <div class="inventory-table-wrap">
            <table class="inventory-table">
              <thead><tr><th>Kode</th><th>Nama Barang</th><th>Kategori</th><th>Kondisi</th><th>Stok</th><th>Status</th></tr></thead>
              <tbody id="inventory-table-body">
                ${state.barang.map((item) => {
                  const category = state.kategori.find((entry) => entry.id === item.kategoriId);
                  return `<tr data-inventory-row data-name="${item.nama.toLowerCase()}" data-code="${item.kode.toLowerCase()}" data-category="${item.kategoriId}">
                    <td><strong>${item.kode}</strong></td><td>${item.nama}<small>${item.merk}</small></td><td>${category?.nama ?? '-'}</td><td>${item.kondisi}</td>
                    <td><strong class="${item.stokTersedia === 0 ? 'empty-stock' : ''}">${item.stokTersedia}/${item.stokTotal}</strong></td><td><span class="inventory-status ${item.stokTersedia === 0 ? 'inventory-status-empty' : ''}">${item.status}</span></td>
                  </tr>`;
                }).join('')}
              </tbody>
            </table>
          </div>
          <p class="inventory-empty-message" id="inventory-empty-message" hidden>Barang tidak ditemukan.</p>
        </section>
      </main>
    </div>
  `;
}

function adminSidebar(active) {
  const links = [
    ['dashboard', 'Dashboard', '#admin/dashboard'],
    ['kategori', 'Kategori Barang', '#admin/kategori'],
    ['barang', 'Gudang Barang', '#admin/barang'],
    ['peminjaman', 'Peminjaman', '#admin/peminjaman'],
    ['prajurit', 'Prajurit', '#admin/prajurit'],
  ];

  return `
    <aside class="sidebar" aria-label="Primary navigation">
      <div class="sidebar-brand"><div class="brand-icon">EA</div><div class="brand-name">EArmory<small>Admin</small></div></div>
      <nav class="sidebar-nav"><div class="nav-group"><div class="nav-label">Main</div>
        ${links.map(([key, label, href]) => `<a class="nav-link ${active === key ? 'active' : ''}" href="${href}">${label}</a>`).join('')}
        <button class="nav-link" type="button" data-action="logout">Logout</button>
      </div></nav>
    </aside>
  `;
}

function staffSidebar(active) {
  const links = [
    ['dashboard', 'Dashboard', '#staff/dashboard'],
    ['kategori', 'Kategori Barang', '#staff/kategori'],
    ['barang', 'Gudang Barang', '#staff/barang'],
    ['peminjaman', 'Peminjaman', '#staff/peminjaman'],
    ['prajurit', 'Prajurit', '#staff/prajurit'],
  ];

  return `
    <aside class="sidebar" aria-label="Primary navigation">
      <div class="sidebar-brand"><div class="brand-icon">EA</div><div class="brand-name">EArmory<small>Staff</small></div></div>
      <nav class="sidebar-nav"><div class="nav-group"><div class="nav-label">Main</div>
        ${links.map(([key, label, href]) => `<a class="nav-link ${active === key ? 'active' : ''}" href="${href}">${label}</a>`).join('')}
        <button class="nav-link" type="button" data-action="logout">Logout</button>
      </div></nav>
    </aside>
  `;
}

function adminFrame({ active, pretitle, title, content, role = 'admin', actions = '' }) {
  const sidebar = role === 'staff' ? staffSidebar(active) : adminSidebar(active);
  const userName = role === 'staff' ? 'Rizal Pratama' : 'Super Admin';
  const footerLabel = role === 'staff' ? 'EArmory Staff' : 'EArmory Admin';

  return `
    ${sidebar}
    <header class="topbar"><div class="topbar-left"><button class="sidebar-toggle" type="button" aria-label="Open menu">?</button><nav class="breadcrumb" aria-label="Breadcrumb"><span class="current">${title}</span></nav></div><div class="topbar-right"><div class="tb-user"><span class="tb-user-name">${userName}</span></div></div></header>
    <main id="main-content" class="main"><div class="page-wrapper"><div class="page-header"><div class="page-header-row"><div><div class="page-pretitle">${pretitle}</div><h1 class="page-title">${title}</h1></div><div class="page-actions">${actions}</div></div></div><div class="page-body">${content}</div></div><footer class="footer"><span>${footerLabel}</span><span>v1</span></footer></main>
  `;
}

function statCard(iconClass, icon, label, value, subtext) {
  return `<div class="card"><div class="stat"><div class="stat-icon ${iconClass}">${icon}</div><div class="stat-content"><div class="stat-label">${label}</div><div class="stat-value-row"><span class="stat-value">${value}</span></div><div class="stat-subtext">${subtext}</div></div></div></div>`;
}

export function renderAdminDashboardOriginal(state, options = {}) {
  const totalStock = state.barang.reduce((total, item) => total + item.stokTotal, 0);
  const totalValue = state.barang.reduce((total, item) => total + item.stokTotal * item.hargaPerolehan, 0);
  const count = (status) => state.peminjaman.filter((item) => item.status === status).length;
  const recentLoans = [...state.peminjaman].sort((first, second) => second.createdAt.localeCompare(first.createdAt));
  const icons = {
    list: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M4 6h16M4 12h16M4 18h7"/></svg>',
    box: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/></svg>',
    clock: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 3"/></svg>',
    check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M20 6L9 17l-5-5"/></svg>',
  };
  const inventoryStats = [
    statCard('teal', icons.list, 'Total Kategori', state.kategori.length, 'kategori barang terdaftar'),
    statCard('blue', icons.box, 'Jenis Barang', state.barang.length, 'jenis barang terdaftar'),
    statCard('green', icons.box, 'Total Stok', totalStock, 'unit di seluruh gudang'),
    statCard('yellow', icons.box, 'Nilai Inventaris', formatCurrency(totalValue), 'total nilai seluruh barang'),
  ].join('');
  const loanStats = [
    statCard('teal', icons.list, 'Total Peminjaman', state.peminjaman.length, `${count('menunggu')} menunggu approval`),
    statCard('yellow', icons.clock, 'Menunggu', count('menunggu'), 'perlu ditindaklanjuti'),
    statCard('green', icons.check, 'Disetujui', count('disetujui'), 'menunggu pengambilan'),
    statCard('blue', icons.clock, 'Dipinjam', count('dipinjam'), 'sedang berjalan'),
    statCard('purple', icons.check, 'Selesai', count('selesai'), 'sudah dikembalikan'),
    statCard('red', icons.check, 'Ditolak', count('ditolak'), 'tidak disetujui'),
  ].join('');
  const rows = recentLoans.slice(0, 10).map((loan) => {
    const user = state.prajurit.find((item) => item.id === loan.prajuritId);
    const statusClass = { menunggu: 'status-yellow', disetujui: 'status-green', dipinjam: 'status-blue', ditolak: 'status-red', selesai: 'status' }[loan.status] ?? 'status';
    return `<tr><td class="cell-mono">${loan.kode}</td><td class="cell-strong">${user?.name ?? '-'}</td><td>${loan.tanggalPinjam}</td><td><span class="status ${statusClass}">${statusLabel(loan.status)}</span></td></tr>`;
  }).join('');
  const content = `<div class="row col-4">${inventoryStats}</div><div class="row col-3">${loanStats}</div><div class="row col-1"><div class="card"><div class="card-header"><div class="card-title">10 Transaksi Peminjaman Terbaru</div></div><div class="card-body"><div class="table-responsive"><table class="table"><thead><tr><th>Kode</th><th>Prajurit</th><th>Tanggal Pinjam</th><th>Status</th></tr></thead><tbody>${rows}</tbody></table></div></div></div></div>`;

  return adminFrame({ active: 'dashboard', pretitle: options.pretitle ?? 'Overview', title: options.title ?? 'Dashboard', content, role: options.role });
}

export function renderStaffDashboardOriginal(state) {
  return renderAdminDashboardOriginal(state, {
    role: 'staff',
    pretitle: 'Selamat datang',
    title: 'Dashboard Staff',
  });
}

export function renderAdminInventoryOriginal(state, options = {}) {
  const rows = state.barang.map((item) => {
    const category = state.kategori.find((entry) => entry.id === item.kategoriId);
    return `<tr data-inventory-row data-name="${item.nama.toLowerCase()}" data-code="${item.kode.toLowerCase()}" data-category="${item.kategoriId}"><td class="cell-mono">${item.kode}</td><td class="cell-strong">${item.nama}</td><td>${category?.nama ?? '-'}</td><td>${item.stokTotal}</td><td>${item.kondisi}</td><td>${item.status}</td><td><span style="color:var(--text-muted);font-size:12px">Demo</span></td><td><div class="row-actions" style="opacity:1"><button type="button" class="btn btn-sm btn-outline">Detail</button><button type="button" class="btn btn-sm btn-warning" data-barang-crud="edit" data-barang-id="${item.id}">Edit</button><button type="button" class="btn btn-sm btn-danger" data-barang-crud="delete" data-barang-id="${item.id}" data-barang-name="${item.nama}">Hapus</button></div></td></tr>`;
  }).join('');
  const content = `<div class="row col-1"><div class="card"><div class="card-body"><div class="form-row cols-3" style="margin-bottom:16px"><input id="inventory-search" type="text" class="form-control" placeholder="Cari barang..."><select id="inventory-category" class="form-control"><option value="all">Semua Kategori</option>${state.kategori.map((item) => `<option value="${item.id}">${item.nama}</option>`).join('')}</select><button type="button" class="btn btn-primary" id="inventory-search-button">Cari</button></div><div class="table-responsive"><table class="table"><thead><tr><th>Kode</th><th>Nama Barang</th><th>Kategori</th><th>Stok</th><th>Kondisi</th><th>Status</th><th>Foto</th><th>Aksi</th></tr></thead><tbody>${rows}</tbody></table></div><p id="inventory-empty-message" hidden>Belum ada data barang</p></div></div></div>`;

  const actions = '<button type="button" class="btn btn-primary" id="barang-create">+ Tambah Barang</button>';
  return adminFrame({ active: 'barang', pretitle: 'Inventaris', title: 'Gudang Stok', content, actions, role: options.role });
}

export function renderAdminLoansOriginal(state, options = {}) {
  const rows = [...state.peminjaman]
    .sort((first, second) => second.createdAt.localeCompare(first.createdAt))
    .map((loan) => {
      const user = state.prajurit.find((item) => item.id === loan.prajuritId);
      const statusClass = { menunggu: 'status-yellow', disetujui: 'status-green', dipinjam: 'status-blue', ditolak: 'status-red', selesai: 'status' }[loan.status] ?? 'status';
      const action = loan.status === 'menunggu'
        ? '<button class="btn btn-sm btn-primary" data-loan-action="disetujui">Approve</button><button class="btn btn-sm btn-danger" data-loan-action="ditolak">Reject</button>'
        : loan.status === 'disetujui'
          ? '<button class="btn btn-sm btn-primary" data-loan-action="dipinjam">Proses Pinjam</button>'
          : loan.status === 'dipinjam'
            ? '<button class="btn btn-sm btn-warning" data-loan-action="selesai">Tandai Selesai</button>'
            : '<span class="text-muted">-</span>';
      return `<tr data-loan-row data-status="${loan.status}" data-search="${`${loan.kode} ${user?.name ?? ''}`.toLowerCase()}"><td class="cell-mono">${loan.kode}</td><td class="cell-strong">${user?.name ?? '-'}</td><td>${loan.tanggalPinjam}</td><td>${loan.tanggalKembaliRencana}</td><td><span class="status ${statusClass}">${statusLabel(loan.status)}</span></td><td><div class="row-actions" style="opacity:1" data-loan-id="${loan.id}">${action}</div></td></tr>`;
    }).join('');
  const content = `<div class="row col-1"><div class="card"><div class="card-body"><div class="form-row cols-3" style="margin-bottom:16px"><input id="loan-search" type="text" class="form-control" placeholder="Cari kode atau nama prajurit..."><select id="loan-status" class="form-control"><option value="all">Semua Status</option><option value="menunggu">Menunggu</option><option value="disetujui">Disetujui</option><option value="dipinjam">Dipinjam</option><option value="selesai">Selesai</option><option value="ditolak">Ditolak</option></select><button type="button" class="btn btn-primary" id="loan-search-button">Cari</button></div><p id="loan-feedback" class="demo-feedback" role="status" aria-live="polite"></p><div class="table-responsive"><table class="table"><thead><tr><th>Kode</th><th>Prajurit</th><th>Tanggal Pinjam</th><th>Rencana Kembali</th><th>Status</th><th>Aksi</th></tr></thead><tbody>${rows}</tbody></table></div><p id="loan-empty-message" hidden>Belum ada data peminjaman</p></div></div></div>`;

  return adminFrame({ active: 'peminjaman', pretitle: 'Operasional', title: 'Peminjaman', content, role: options.role });
}

export function renderAdminPrajuritOriginal(state, options = {}) {
  const statusClass = {
    aktif: 'badge bg-success',
    menunggu: 'badge bg-warning',
    diverifikasi: 'badge bg-success',
    ditolak: 'badge bg-danger',
  };
  const statusLabelMap = { aktif: 'Aktif', menunggu: 'Menunggu', diverifikasi: 'Diverifikasi', ditolak: 'Ditolak' };
  const rows = state.prajurit.map((prajurit, index) => {
    const action = prajurit.status === 'menunggu'
      ? '<button class="btn btn-sm btn-primary" data-prajurit-action="aktif">Approve</button><button class="btn btn-sm btn-danger" data-prajurit-action="ditolak">Reject</button>'
      : `<button type="button" class="btn btn-sm btn-outline">Detail</button><button type="button" class="btn btn-sm btn-warning" data-prajurit-crud="edit" data-prajurit-id="${prajurit.id}">Edit</button><button type="button" class="btn btn-sm btn-danger" data-prajurit-crud="delete" data-prajurit-id="${prajurit.id}" data-prajurit-name="${prajurit.name}">Hapus</button>`;
    return `<tr data-prajurit-row data-status="${prajurit.status}" data-search="${`${prajurit.name} ${prajurit.nrp} ${prajurit.username}`.toLowerCase()}"><td>${index + 1}</td><td class="cell-strong">${prajurit.name}</td><td class="cell-mono">${prajurit.nrp}</td><td>${prajurit.pangkat}</td><td>${prajurit.kesatuan}</td><td>${prajurit.jabatan ?? '-'}</td><td>${prajurit.username}</td><td><span class="${statusClass[prajurit.status] ?? 'badge'}">${statusLabelMap[prajurit.status] ?? prajurit.status}</span></td><td><div class="row-actions" style="opacity:1" data-prajurit-id="${prajurit.id}">${action}</div></td></tr>`;
  }).join('');
  const content = `<div class="row col-1"><div class="card"><div class="card-body"><div class="form-row cols-3" style="margin-bottom:16px"><input id="prajurit-search" type="text" class="form-control" placeholder="Cari nama, NRP, atau username..."><select id="prajurit-status" class="form-control"><option value="all">Semua Status</option><option value="aktif">Aktif</option><option value="menunggu">Menunggu</option><option value="ditolak">Ditolak</option></select><button type="button" class="btn btn-primary" id="prajurit-search-button">Cari</button></div><p id="prajurit-feedback" class="demo-feedback" role="status" aria-live="polite"></p><div class="table-responsive"><table class="table"><thead><tr><th>No</th><th>Nama</th><th>NRP</th><th>Pangkat</th><th>Kesatuan</th><th>Jabatan</th><th>Username</th><th>Status</th><th>Aksi</th></tr></thead><tbody>${rows}</tbody></table></div><p id="prajurit-empty-message" hidden>Belum ada data</p></div></div></div>`;
  const actions = '<button type="button" class="btn btn-primary" id="prajurit-create">+ Tambah Prajurit</button>';

  return adminFrame({ active: 'prajurit', pretitle: 'Manajemen Personel', title: 'Prajurit', content, actions, role: options.role });
}

export function renderAdminCategoriesOriginal(state, options = {}) {
  const rows = state.kategori.map((category, index) => `
    <tr data-category-row data-search="${category.nama.toLowerCase()}">
      <td>${index + 1}</td>
      <td class="cell-strong">${category.nama}</td>
      <td><div class="row-actions" style="opacity:1"><button type="button" class="btn btn-sm btn-warning" data-category-action="edit" data-category-id="${category.id}" data-category-name="${category.nama}">Edit</button><button type="button" class="btn btn-sm btn-danger" data-category-action="delete" data-category-id="${category.id}" data-category-name="${category.nama}">Hapus</button></div></td>
    </tr>
  `).join('');
  const content = `<div class="row col-1"><div class="card"><div class="card-body"><div class="form-row cols-2" style="margin-bottom:16px"><input id="category-search" type="text" class="form-control" placeholder="Cari kategori..."><button type="button" class="btn btn-primary" id="category-search-button">Cari</button></div><p id="category-feedback" class="demo-feedback" role="status" aria-live="polite"></p><div class="table-responsive"><table class="table"><thead><tr><th width="60">No</th><th>Nama Kategori</th><th width="180">Aksi</th></tr></thead><tbody>${rows}</tbody></table></div><p id="category-empty-message" hidden>Belum ada data</p></div></div></div>`;
  const actions = '<button type="button" class="btn btn-primary" id="category-create">+ Tambah Kategori</button>';

  return adminFrame({ active: 'kategori', pretitle: 'Inventaris', title: 'Kategori Barang', content, actions, role: options.role });
}

export function renderStaffInventoryOriginal(state) {
  return renderAdminInventoryOriginal(state, { role: 'staff' });
}

export function renderStaffLoansOriginal(state) {
  return renderAdminLoansOriginal(state, { role: 'staff' });
}

export function renderStaffCategoriesOriginal(state) {
  return renderAdminCategoriesOriginal(state, { role: 'staff' });
}

export function renderStaffPrajuritOriginal(state) {
  return renderAdminPrajuritOriginal(state, { role: 'staff' });
}
