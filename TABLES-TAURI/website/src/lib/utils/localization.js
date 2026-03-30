export const translations = {
  en: {
    by: 'By',
    backToBlog: '← Back to Blog',
    pinned: '📌 Pinned',
    noBlogPosts: 'No blog posts yet.',
    home: 'Home',
    blog: 'Blog',
    loading: 'Loading...',
    notFound: 'Not found',
    builtWith: 'Built with Svelte',
    sitemap: 'Sitemap',
    showSitemap: 'Show Sitemap',
    hideSitemap: 'Hide Sitemap'
  },
  sk: {
    by: 'Autor',
    backToBlog: '← Späť na Blog',
    pinned: '📌 Pripnuté',
    noBlogPosts: 'Zatiaľ žiadne blogové príspevky.',
    home: 'Domov',
    blog: 'Blog',
    loading: 'Načítava sa...',
    notFound: 'Nenájdené',
    builtWith: 'Vytvorené pomocou Svelte',
    sitemap: 'Mapa stránok',
    showSitemap: 'Zobraziť mapu',
    hideSitemap: 'Skryť mapu'
  }
};

export const t = (key, lang = 'en') => {
  const langTranslations = translations[lang] || translations['en'];
  return langTranslations[key] || key;
};
