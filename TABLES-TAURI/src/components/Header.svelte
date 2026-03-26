<script>
  let appWindow = null;

  // Dynamically import Tauri API only when available
  if (typeof window !== 'undefined' && window.__TAURI__) {
    import('@tauri-apps/api/window').then(module => {
      appWindow = module.appWindow;
    }).catch(() => {
      // Tauri API not available (browser mode)
    });
  }

  export let onVisitDomain = () => {};
  export let onBuildAndDeploy = () => {};
  export let onBuildLocally = () => {};
  export let onToggleNotesSidebar = () => {};
  export let isBuilding = false;
  export let canBuild = false;
  export let domain = '';
  export let vercelApiKey = '';
  export let buildCooldownSeconds = 0;
  export let disableImport = false;
  export let extensions = {};
</script>

<header class="header">
  <div class="header-left">
    <h1 class="app-title">
      <i class="fas fa-table"></i>
      TABLES CMS
    </h1>
  </div>

  <div class="header-right">
    {#if extensions?.['notes-extension-enabled']}
      <button
        class="btn-icon"
        title="Notes"
        on:click={onToggleNotesSidebar}
      >
        <i class="fas fa-sticky-note"></i>
      </button>
    {/if}

    {#if canBuild && !isBuilding}
      <button
        class="btn-primary"
        on:click={() => onBuildLocally()}
        title="Build Locally"
      >
        <i class="fas fa-hammer"></i>
        Build Locally
      </button>

      {#if vercelApiKey}
        <button
          class="btn-success"
          on:click={() => onBuildAndDeploy()}
          title="Build & Deploy to Vercel"
        >
          <i class="fas fa-rocket"></i>
          Deploy
        </button>
      {/if}
    {:else if isBuilding}
      <button class="btn-disabled" disabled>
        <i class="fas fa-spinner fa-spin"></i>
        Building...
      </button>
    {/if}

    <a
      href={domain || '#'}
      target="_blank"
      rel="noopener noreferrer"
      class="btn-secondary"
      title="Visit Domain"
      style="pointer-events: {domain ? 'auto' : 'none'}; opacity: {domain ? 1 : 0.5};"
    >
      <i class="fas fa-external-link-alt"></i>
      Visit
    </a>
  </div>
</header>

<style>
  .header {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 8px 16px;
    background: var(--bg-card, white);
    border-bottom: 1px solid var(--border-light, #e2e8f0);
    box-shadow: 0 1px 3px rgba(0,0,0,0.05);
    z-index: 1000;
    height: 55px;
  }

  .header-left {
    display: flex;
    align-items: center;
  }

  .app-title {
    font-size: 18px;
    font-weight: 700;
    color: var(--text-primary, #0f172a);
    margin: 0;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .app-title i {
    color: var(--color-primary, #2563eb);
  }

  .header-right {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .btn-icon {
    width: 36px;
    height: 36px;
    border: none;
    background: var(--bg-tertiary, #f1f5f9);
    border-radius: 6px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background 0.2s;
    color: var(--text-secondary, #475569);
  }

  .btn-icon:hover {
    background: var(--border-light, #e2e8f0);
  }

  .btn-primary,
  .btn-success,
  .btn-secondary,
  .btn-disabled {
    padding: 6px 12px;
    border: none;
    border-radius: var(--radius-md);
    cursor: pointer;
    font-weight: 600;
    font-size: var(--text-sm);
    display: flex;
    align-items: center;
    gap: 6px;
    transition: all var(--transition-fast);
    text-decoration: none;
  }

  .btn-primary {
    background: var(--color-primary, #2563eb);
    color: white;
  }

  .btn-primary:hover {
    background: var(--color-primary-dark, #1d4ed8);
  }

  .btn-success {
    background: var(--color-secondary, #10b981);
    color: white;
  }

  .btn-success:hover {
    background: var(--color-secondary-dark, #059669);
  }

  .btn-secondary {
    background: var(--bg-card, white);
    color: var(--text-secondary, #475569);
    border: 1px solid var(--border-light, #e2e8f0);
  }

  .btn-secondary:hover {
    background: var(--bg-secondary, #f8fafc);
  }

  .btn-disabled {
    background: var(--border-medium, #cbd5e1);
    color: var(--text-tertiary, #64748b);
    cursor: not-allowed;
  }

  /* Prevent icon flashing */
  .header i,
  .fas {
    will-change: auto;
    backface-visibility: hidden;
  }
</style>
