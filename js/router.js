export function getRoute() {
  const route = window.location.hash.replace(/^#/, '') || 'landing';
  const validRoute = /^(admin|staff)\/(dashboard|kategori|barang|peminjaman|prajurit)$/.test(route)
    || /^prajurit\/(dashboard|profile|peminjaman)$/.test(route)
    || /^prajurit\/peminjaman\/(create|\d+)$/.test(route);

  return validRoute
    ? route
    : 'landing';
}

export function navigate(route) {
  window.location.hash = route;
}

export function subscribeToRoute(callback) {
  window.addEventListener('hashchange', () => callback(getRoute()));
}
