const isBrowser = typeof window !== 'undefined';

export function navigate(path) {
  if (isBrowser) {
    window.history.pushState({}, '', path);
    window.dispatchEvent(new CustomEvent('navigate', { detail: { path } }));
  }
}

export function getCurrentSection(path) {
  if (path.startsWith('/cms/pages')) return 'pages';
  if (path.startsWith('/cms/page-groups')) return 'page-groups';
  if (path.startsWith('/cms/blog')) return 'blog';
  if (path.startsWith('/cms/pedigree')) return 'cats';
  if (path.startsWith('/cms/personal')) return 'personal';
  if (path.startsWith('/cms/inventory')) return 'rental-inventory';
  if (path.startsWith('/cms/attendance')) return 'rental-attendance';
  if (path.startsWith('/cms/customers')) return 'rental-customers';
  if (path.startsWith('/cms/employees')) return 'rental-employees';
  if (path.startsWith('/cms/reservations')) return 'rental-reservations';
  if (path.startsWith('/cms/calendar')) return 'rental-calendar';
  if (path.startsWith('/cms/settings')) return 'settings';
  if (path.startsWith('/cms/extensions')) return 'extensions';
  if (path.startsWith('/cms/uploads')) return 'uploads';
  if (path.startsWith('/cms/movietracker')) return 'movietracker';
  return 'settings';
}
