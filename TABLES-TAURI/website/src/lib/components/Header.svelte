<script>
  let { settings, pages, currentLang = 'en' } = $props();
  let mobileNavOpen = $state(false);
  
  let menuPages = $derived(pages.filter(p => p.showInMenu !== false));
  let isDark = $derived(settings.headerDarkTheme);
</script>

<header class={isDark ? 'dark' : ''}>
  <div class="content">
    <a href="/" class="logo">
      {#if settings.siteLogo}
        <img src={settings.siteLogo} alt={settings.siteTitle} />
      {:else}
        <span class="site-title">{settings.siteTitle || 'TABLES'}</span>
      {/if}
    </a>

    <nav class="desktop-nav">
      {#each menuPages as page}
        <a href="/{page.slug}" class="nav-link">{page.title}</a>
      {/each}
      {#if settings.hasBlogArticles}
        <a href="/blog" class="nav-link">Blog</a>
      {/if}
    </nav>

    <button class="menu-toggle" onclick={() => mobileNavOpen = !mobileNavOpen}>
      ☰
    </button>
  </div>

  {#if mobileNavOpen}
    <nav class="mobile-nav">
      {#each menuPages as page}
        <a href="/{page.slug}" onclick={() => mobileNavOpen = false}>{page.title}</a>
      {/each}
    </nav>
  {/if}
</header>

<div class="header-spacer"></div>

<style>
  header {
    position: fixed;
    top: 0; left: 0; width: 100%; height: 60px;
    background: white;
    border-bottom: 1px solid #e2e8f0;
    z-index: 1000;
    display: flex;
    justify-content: center;
  }

  header.dark { background: black; color: white; border-color: #333; }

  .content {
    width: 100%;
    max-width: 1200px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 20px;
  }

  .logo { text-decoration: none; color: inherit; display: flex; align-items: center; }
  .logo img { max-height: 40px; }
  .site-title { font-size: 1.5rem; font-weight: 300; }

  .desktop-nav { display: flex; gap: 20px; }
  .nav-link { text-decoration: none; color: inherit; text-transform: uppercase; font-size: 0.875rem; letter-spacing: 0.05em; }

  .menu-toggle { display: none; background: none; border: none; font-size: 24px; cursor: pointer; color: inherit; }

  .mobile-nav {
    position: absolute;
    top: 60px; left: 0; width: 100%;
    background: white;
    border-bottom: 1px solid #e2e8f0;
    display: flex;
    flex-direction: column;
    padding: 20px;
  }

  .header-spacer { height: 60px; }

  @media (max-width: 900px) {
    .desktop-nav { display: none; }
    .menu-toggle { display: block; }
  }
</style>
