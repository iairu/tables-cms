<script>
  import { onMount } from 'svelte';
  import Header from './lib/components/Header.svelte';
  import Footer from './lib/components/Footer.svelte';
  import PageComponent from './lib/components/PageComponent.svelte';
  import './assets/css/basis.css';
  import './assets/css/default.css';

  let pages = $state([]);
  let settings = $state({});
  let currentPage = $state(null);
  let loading = $state(true);

  async function loadData() {
    try {
      const pRes = await fetch('/cms/pages.json');
      const sRes = await fetch('/cms/settings.json');
      pages = await pRes.json();
      settings = await sRes.json();
      
      const slug = window.location.pathname.replace(/^\/|\/$/g, '') || 'home';
      currentPage = pages.find(p => p.slug === slug) || pages[0];
    } catch (e) {
      console.error("Failed to load CMS data:", e);
    } finally {
      loading = false;
    }
  }

  onMount(() => {
    loadData();
  });
</script>

{#if loading}
  <div class="loading">Loading...</div>
{:else}
  <Header {settings} {pages} />
  
  {#if currentPage}
    <main class="site-main">
      {#each currentPage.rows || [] as row}
        <PageComponent {row} />
      {/each}
    </main>
  {:else}
    <div class="error">404 - Page Not Found</div>
  {/if}

  <Footer {settings} />
{/if}

<style>
  :global(body) {
    margin: 0; padding: 0;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    background: #fdfdfd;
  }
  
  .loading, .error {
    display: flex; justify-content: center; align-items: center;
    height: 100vh; font-size: 1.5rem;
  }
</style>
