import {
  clearCurrentRole,
  cancelLoan,
  createCategory,
  createLoan,
  createBarang,
  createPrajurit,
  getStoredRole,
  initializeDemoState,
  loadState,
  resetDemoState,
  setCurrentRole,
  renameCategory,
  removeCategory,
  removeBarang,
  removePrajurit,
  updatePrajurit,
  updateBarang,
  updatePrajuritProfile,
  updatePrajuritStatus,
  updateLoanStatus,
} from './store.js';
import { getRoute, subscribeToRoute } from './router.js';
import { renderAdminCategoriesOriginal, renderAdminDashboardOriginal, renderAdminInventoryOriginal, renderAdminLoansOriginal, renderAdminPrajuritOriginal, renderStaffCategoriesOriginal, renderStaffDashboardOriginal, renderStaffInventoryOriginal, renderStaffLoansOriginal, renderStaffPrajuritOriginal } from './views/admin.js';
import { renderPrajuritDashboard, renderPrajuritLoanCreate, renderPrajuritLoanDetail, renderPrajuritLoans, renderPrajuritProfile } from './views/prajurit.js';

const roleLabels = {
  admin: 'Admin',
  staff: 'Staff',
  prajurit: 'Prajurit',
};

const appRoot = document.querySelector('#app-root');
const landingMarkup = appRoot.innerHTML;

initializeDemoState();

function selectRole(role) {
  setCurrentRole(role);
  window.location.hash = `${role}/dashboard`;
}

function resetDemo() {
  resetDemoState();
  window.location.hash = 'landing';
}

function bindLandingEvents() {
  const selectionMessage = document.querySelector('#selection-message');
  const themeSwitch = document.querySelector('.theme-switch');

  document.querySelectorAll('[data-role]').forEach((button) => {
    button.addEventListener('click', () => selectRole(button.dataset.role));
  });

  document.querySelector('#reset-demo').addEventListener('click', resetDemo);

  themeSwitch.checked = localStorage.getItem('earmory-demo-theme') === 'dark';
  document.body.classList.toggle('dark', themeSwitch.checked);
  themeSwitch.addEventListener('change', () => {
    const theme = themeSwitch.checked ? 'dark' : 'light';
    document.body.classList.toggle('dark', themeSwitch.checked);
    localStorage.setItem('earmory-demo-theme', theme);
  });

  const savedRole = getStoredRole();
  if (savedRole && roleLabels[savedRole]) {
    selectionMessage.textContent = `Role terakhir: ${roleLabels[savedRole]}. Pilih role untuk memulai demo.`;
  }
}

function bindDashboardEvents() {
  document.querySelectorAll('[data-action="logout"]').forEach((button) => {
    button.addEventListener('click', () => {
      clearCurrentRole();
      window.location.hash = 'landing';
    });
  });

  document.querySelectorAll('[data-loan-action]').forEach((button) => {
    button.addEventListener('click', () => {
      const actionContainer = button.closest('[data-loan-id]');
      try {
        updateLoanStatus(actionContainer.dataset.loanId, button.dataset.loanAction);
        renderRoute(getRoute());
      } catch (error) {
        const feedback = document.querySelector('#loan-feedback');
        if (feedback) feedback.textContent = error.message;
      }
    });
  });

  document.querySelectorAll('[data-prajurit-cancel]').forEach((button) => {
    button.addEventListener('click', () => {
      if (!window.confirm('Batalkan pengajuan ini?')) return;
      try {
        cancelLoan(button.dataset.prajuritCancel);
        renderRoute(getRoute());
      } catch (error) {
        const feedback = document.querySelector('#prajurit-loan-feedback');
        if (feedback) feedback.textContent = error.message;
      }
    });
  });

  document.querySelectorAll('[data-loan-check]').forEach((checkbox) => {
    checkbox.addEventListener('change', () => {
      const quantity = document.querySelector(`[data-loan-qty="${checkbox.dataset.loanCheck}"]`);
      quantity.disabled = !checkbox.checked;
    });
  });
  document.querySelector('#prajurit-loan-form')?.addEventListener('submit', (event) => {
    event.preventDefault();
    const details = [...document.querySelectorAll('[data-loan-check]:checked')].map((checkbox) => ({
      barangId: checkbox.dataset.loanCheck,
      qty: document.querySelector(`[data-loan-qty="${checkbox.dataset.loanCheck}"]`).value,
    }));
    try {
      createLoan({ tanggalKembaliRencana: document.querySelector('#loan-return-date').value, tujuan: document.querySelector('#loan-purpose').value, catatan: document.querySelector('#loan-note').value, details });
      window.location.hash = 'prajurit/peminjaman';
    } catch (error) {
      document.querySelector('#prajurit-create-feedback').textContent = error.message;
    }
  });
  document.querySelector('#profile-form')?.addEventListener('submit', (event) => {
    event.preventDefault();
    try {
      updatePrajuritProfile({ name: document.querySelector('#profile-name').value, pangkat: document.querySelector('#profile-rank').value, kesatuan: document.querySelector('#profile-unit').value, jabatan: document.querySelector('#profile-position').value });
      renderRoute(getRoute());
      document.querySelector('#profile-feedback').textContent = 'Data diri berhasil diperbarui.';
    } catch (error) {
      document.querySelector('#profile-feedback').textContent = error.message;
    }
  });

  document.querySelectorAll('[data-prajurit-action]').forEach((button) => {
    button.addEventListener('click', () => {
      const actionContainer = button.closest('[data-prajurit-id]');
      try {
        updatePrajuritStatus(actionContainer.dataset.prajuritId, button.dataset.prajuritAction);
        renderRoute(getRoute());
      } catch (error) {
        const feedback = document.querySelector('#prajurit-feedback');
        if (feedback) feedback.textContent = error.message;
      }
    });
  });

  const promptPrajurit = (current = {}) => ({
    name: window.prompt('Nama:', current.name ?? ''),
    username: window.prompt('Username:', current.username ?? ''),
    nrp: window.prompt('NRP:', current.nrp ?? ''),
    pangkat: window.prompt('Pangkat:', current.pangkat ?? ''),
    kesatuan: window.prompt('Kesatuan:', current.kesatuan ?? ''),
    jabatan: window.prompt('Jabatan:', current.jabatan ?? ''),
  });
  document.querySelector('#prajurit-create')?.addEventListener('click', () => {
    const fields = promptPrajurit();
    if (fields.name === null) return;
    try {
      createPrajurit(fields);
      renderRoute(getRoute());
    } catch (error) {
      const feedback = document.querySelector('#prajurit-feedback');
      if (feedback) feedback.textContent = error.message;
    }
  });
  document.querySelectorAll('[data-prajurit-crud="edit"]').forEach((button) => {
    button.addEventListener('click', () => {
      const current = loadState().prajurit.find((item) => item.id === Number(button.dataset.prajuritId));
      const fields = promptPrajurit(current);
      if (fields.name === null) return;
      try {
        updatePrajurit(button.dataset.prajuritId, fields);
        renderRoute(getRoute());
      } catch (error) {
        const feedback = document.querySelector('#prajurit-feedback');
        if (feedback) feedback.textContent = error.message;
      }
    });
  });
  document.querySelectorAll('[data-prajurit-crud="delete"]').forEach((button) => {
    button.addEventListener('click', () => {
      if (!window.confirm(`Hapus prajurit ${button.dataset.prajuritName}?`)) return;
      removePrajurit(button.dataset.prajuritId);
      renderRoute(getRoute());
    });
  });

  const categorySearch = document.querySelector('#category-search');
  if (categorySearch) {
    const filterCategories = () => {
      const query = categorySearch.value.trim().toLowerCase();
      let visibleCount = 0;
      document.querySelectorAll('[data-category-row]').forEach((row) => {
        const visible = row.dataset.search.includes(query);
        row.hidden = !visible;
        if (visible) visibleCount += 1;
      });
      document.querySelector('#category-empty-message').hidden = visibleCount > 0;
    };
    categorySearch.addEventListener('input', filterCategories);
  }

  const categoryFeedback = document.querySelector('#category-feedback');
  const showCategoryError = (error) => {
    if (categoryFeedback) categoryFeedback.textContent = error.message;
  };
  document.querySelector('#category-create')?.addEventListener('click', () => {
    const name = window.prompt('Nama kategori baru:');
    if (name === null) return;
    try {
      createCategory(name);
      renderRoute(getRoute());
    } catch (error) {
      showCategoryError(error);
    }
  });
  document.querySelectorAll('[data-category-action="edit"]').forEach((button) => {
    button.addEventListener('click', () => {
      const name = window.prompt('Nama kategori:', button.dataset.categoryName);
      if (name === null) return;
      try {
        renameCategory(button.dataset.categoryId, name);
        renderRoute(getRoute());
      } catch (error) {
        showCategoryError(error);
      }
    });
  });
  document.querySelectorAll('[data-category-action="delete"]').forEach((button) => {
    button.addEventListener('click', () => {
      if (!window.confirm(`Hapus kategori ${button.dataset.categoryName}?`)) return;
      try {
        removeCategory(button.dataset.categoryId);
        renderRoute(getRoute());
      } catch (error) {
        showCategoryError(error);
      }
    });
  });

  const prajuritSearch = document.querySelector('#prajurit-search');
  const prajuritStatus = document.querySelector('#prajurit-status');
  if (prajuritSearch && prajuritStatus) {
    const filterPrajurit = () => {
      const query = prajuritSearch.value.trim().toLowerCase();
      const status = prajuritStatus.value;
      let visibleCount = 0;

      document.querySelectorAll('[data-prajurit-row]').forEach((row) => {
        const visible = row.dataset.search.includes(query)
          && (status === 'all' || row.dataset.status === status);
        row.hidden = !visible;
        if (visible) visibleCount += 1;
      });
      document.querySelector('#prajurit-empty-message').hidden = visibleCount > 0;
    };

    prajuritSearch.addEventListener('input', filterPrajurit);
    prajuritStatus.addEventListener('change', filterPrajurit);
  }

  const loanSearch = document.querySelector('#loan-search');
  const loanStatus = document.querySelector('#loan-status');
  if (loanSearch && loanStatus) {
    const filterLoans = () => {
      const query = loanSearch.value.trim().toLowerCase();
      const status = loanStatus.value;
      let visibleCount = 0;

      document.querySelectorAll('[data-loan-row]').forEach((row) => {
        const visible = row.dataset.search.includes(query)
          && (status === 'all' || row.dataset.status === status);
        row.hidden = !visible;
        if (visible) visibleCount += 1;
      });
      document.querySelector('#loan-empty-message').hidden = visibleCount > 0;
    };

    loanSearch.addEventListener('input', filterLoans);
    loanStatus.addEventListener('change', filterLoans);
  }

  const searchInput = document.querySelector('#inventory-search');
  const categorySelect = document.querySelector('#inventory-category');
  if (!searchInput || !categorySelect) return;

  const filterRows = () => {
    const query = searchInput.value.trim().toLowerCase();
    const category = categorySelect.value;
    let visibleCount = 0;

    document.querySelectorAll('[data-inventory-row]').forEach((row) => {
      const matchesText = row.dataset.name.includes(query) || row.dataset.code.includes(query);
      const matchesCategory = category === 'all' || row.dataset.category === category;
      const visible = matchesText && matchesCategory;
      row.hidden = !visible;
      if (visible) visibleCount += 1;
    });

    document.querySelector('#inventory-empty-message').hidden = visibleCount > 0;
  };

  searchInput.addEventListener('input', filterRows);
  categorySelect.addEventListener('change', filterRows);

  const promptBarang = (current = {}) => ({
    nama: window.prompt('Nama barang:', current.nama ?? ''),
    kategoriId: window.prompt(`ID kategori (${loadState().kategori.map((item) => `${item.id}: ${item.nama}`).join(', ')}):`, current.kategoriId ?? ''),
    merk: window.prompt('Merk:', current.merk ?? ''),
    hargaPerolehan: window.prompt('Harga perolehan:', current.hargaPerolehan ?? '0'),
    satuan: window.prompt('Satuan:', current.satuan ?? 'Unit'),
    stokTotal: window.prompt('Stok total:', current.stokTotal ?? '0'),
    kondisi: window.prompt('Kondisi:', current.kondisi ?? 'Baik'),
    status: window.prompt('Status barang:', current.status ?? 'Tersedia'),
    lokasi: window.prompt('Lokasi rak:', current.lokasi ?? ''),
  });
  const showBarangError = (error) => {
    const feedback = document.querySelector('#inventory-empty-message');
    if (feedback) { feedback.hidden = false; feedback.textContent = error.message; }
  };
  document.querySelector('#barang-create')?.addEventListener('click', () => {
    const fields = promptBarang();
    if (fields.nama === null) return;
    try { createBarang(fields); renderRoute(getRoute()); } catch (error) { showBarangError(error); }
  });
  document.querySelectorAll('[data-barang-crud="edit"]').forEach((button) => {
    button.addEventListener('click', () => {
      const current = loadState().barang.find((item) => item.id === Number(button.dataset.barangId));
      const fields = promptBarang(current);
      if (fields.nama === null) return;
      try { updateBarang(button.dataset.barangId, fields); renderRoute(getRoute()); } catch (error) { showBarangError(error); }
    });
  });
  document.querySelectorAll('[data-barang-crud="delete"]').forEach((button) => {
    button.addEventListener('click', () => {
      if (!window.confirm(`Hapus barang ${button.dataset.barangName}?`)) return;
      try { removeBarang(button.dataset.barangId); renderRoute(getRoute()); } catch (error) { showBarangError(error); }
    });
  });
}

function renderRoute(route) {
  if (route === 'landing') {
    document.body.removeAttribute('data-shell');
    appRoot.innerHTML = landingMarkup;
    bindLandingEvents();
    return;
  }

  const state = loadState();
  document.body.dataset.shell = 'admin';
  if (route === 'admin/dashboard') {
    appRoot.innerHTML = renderAdminDashboardOriginal(state);
  } else if (route === 'admin/kategori') {
    appRoot.innerHTML = renderAdminCategoriesOriginal(state);
  } else if (route === 'admin/barang') {
    appRoot.innerHTML = renderAdminInventoryOriginal(state);
  } else if (route === 'admin/peminjaman') {
    appRoot.innerHTML = renderAdminLoansOriginal(state);
  } else if (route === 'admin/prajurit') {
    appRoot.innerHTML = renderAdminPrajuritOriginal(state);
  } else if (route === 'staff/dashboard') {
    appRoot.innerHTML = renderStaffDashboardOriginal(state);
  } else if (route === 'staff/kategori') {
    appRoot.innerHTML = renderStaffCategoriesOriginal(state);
  } else if (route === 'staff/barang') {
    appRoot.innerHTML = renderStaffInventoryOriginal(state);
  } else if (route === 'staff/peminjaman') {
    appRoot.innerHTML = renderStaffLoansOriginal(state);
  } else if (route === 'staff/prajurit') {
    appRoot.innerHTML = renderStaffPrajuritOriginal(state);
  } else if (route === 'prajurit/dashboard') {
    appRoot.innerHTML = renderPrajuritDashboard(state);
  } else if (route === 'prajurit/peminjaman') {
    appRoot.innerHTML = renderPrajuritLoans(state);
  } else if (route === 'prajurit/peminjaman/create') {
    appRoot.innerHTML = renderPrajuritLoanCreate(state);
  } else if (route === 'prajurit/profile') {
    appRoot.innerHTML = renderPrajuritProfile(state);
  } else if (route.startsWith('prajurit/peminjaman/')) {
    appRoot.innerHTML = renderPrajuritLoanDetail(state, route.split('/')[2]);
  } else {
    appRoot.innerHTML = landingMarkup;
    bindLandingEvents();
    window.location.hash = 'landing';
    return;
  }
  bindDashboardEvents();
}

subscribeToRoute(renderRoute);
renderRoute(getRoute());
