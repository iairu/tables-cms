<script>
  import { onMount, onDestroy } from 'svelte';
  import Header from './Header.svelte';
  import SideMenu from './SideMenu.svelte';
  import LoadingBar from './LoadingBar.svelte';
  import LoadingSkeleton from './LoadingSkeleton.svelte';
  import NotesSidebar from './NotesSidebar.svelte';
  import { cmsData } from '../stores/cmsData.js';
  import { isLoading, showLoading, hideLoading } from '../stores/loading.js';
  
  export let currentSection = 'settings';
  export let currentRoute = '/cms/settings';
  export let onNavigate = () => {};
  export let extensions = {};

  let cmsDataValue;
  let isLoadingValue;
  let isNotesSidebarOpen = false;
  let localExtensions = {};

  const unsubscribeCms = cmsData.subscribe(value => cmsDataValue = value);
  const unsubscribeLoading = isLoading.subscribe(value => isLoadingValue = value);

  // Keep extensions in sync with cmsData
  $: if (cmsDataValue?.extensions) {
    localExtensions = cmsDataValue.extensions;
  }
  
  // Use local extensions or fallback to prop
  $: effectiveExtensions = localExtensions || extensions || {};
  
  // Show reconnection banner
  $: showReconnectBanner = cmsDataValue?.collabState?.wasConnectedAsClient && !cmsDataValue?.collabState?.isConnected;
  
  function handleManualBuild(localOnly = false) {
    if (cmsDataValue?.manualTriggerBuild) {
      cmsDataValue.manualTriggerBuild(localOnly);
    }
  }

  function toggleNotesSidebar() {
    isNotesSidebarOpen = !isNotesSidebarOpen;
  }
  
  onMount(() => {
    const handleShowLoading = () => showLoading();
    const handleHideLoading = () => hideLoading();
    
    window.addEventListener('show-loading', handleShowLoading);
    window.addEventListener('hide-loading', handleHideLoading);
    
    return () => {
      window.removeEventListener('show-loading', handleShowLoading);
      window.removeEventListener('hide-loading', handleHideLoading);
      unsubscribeCms();
      unsubscribeLoading();
    };
  });
</script>

<div class="cms-container">
  <LoadingBar />
  
  {#if showReconnectBanner}
    <div class="reconnect-banner">
      <div class="reconnect-content">
        <span class="reconnect-indicator"></span>
        <span>
          {#if cmsDataValue?.collabState?.status === 'connecting'}
            Attempting to reconnect to server…
          {:else if cmsDataValue?.collabState?.status === 'error'}
            Connection lost: {cmsDataValue?.collabState?.error || 'Server unreachable'}
          {:else}
            Disconnected from server — attempting to reconnect…
          {/if}
        </span>
      </div>
      <button class="btn-secondary" on:click={() => onNavigate('/cms/settings')}>
        Go to Settings
      </button>
    </div>
  {/if}
  
  <Header
    onVisitDomain={() => window.open(cmsDataValue?.settings?.domain, '_blank')}
    onBuildAndDeploy={() => handleManualBuild(false)}
    onBuildLocally={() => handleManualBuild(true)}
    onToggleNotesSidebar={toggleNotesSidebar}
    isBuilding={cmsDataValue?.isBuilding}
    canBuild={cmsDataValue?.canBuild}
    domain={cmsDataValue?.settings?.domain}
    vercelApiKey={cmsDataValue?.settings?.vercelApiKey}
    buildCooldownSeconds={cmsDataValue?.buildCooldownSeconds}
    disableImport={cmsDataValue?.collabState?.isConnected && !cmsDataValue?.collabState?.isServer}
    extensions={effectiveExtensions}
  />
  
  <main class="main-content">
    <SideMenu
      currentSection={currentSection}
      isBuilding={cmsDataValue?.isBuilding}
      lastSaved={cmsDataValue?.lastSaved}
      onBuildClick={handleManualBuild}
      canBuild={cmsDataValue?.canBuild}
      buildCooldownSeconds={cmsDataValue?.buildCooldownSeconds}
      domain={cmsDataValue?.settings?.domain}
      vercelApiKey={cmsDataValue?.settings?.vercelApiKey}
      onNavigate={onNavigate}
      extensions={effectiveExtensions}
    />
    
    <div class="content-area">
      {#if isLoadingValue}
        <LoadingSkeleton />
      {:else}
        <slot></slot>
      {/if}
    </div>
  </main>
  
  {#if effectiveExtensions?.['notes-extension-enabled']}
    <NotesSidebar isOpen={isNotesSidebarOpen} onClose={toggleNotesSidebar} />
  {/if}
</div>

<style>
  .cms-container {
    display: flex;
    flex-direction: column;
    min-height: 100vh;
    background: #f8fafc;
  }
  
  .reconnect-banner {
    background: linear-gradient(90deg, #dc2626, #b91c1c);
    color: white;
    padding: 10px 20px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 14px;
    font-weight: 500;
    z-index: 1000;
    box-shadow: 0 2px 8px rgba(0,0,0,0.15);
  }
  
  .reconnect-content {
    display: flex;
    align-items: center;
    gap: 10px;
  }
  
  .reconnect-indicator {
    display: inline-block;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background-color: #fca5a5;
    animation: reconnect-pulse 1.5s ease-in-out infinite;
  }
  
  .main-content {
    flex-grow: 1;
    position: relative;
    display: flex;
    transition: margin-right 0.3s;
    padding-top: 65px; /* Account for fixed header height */
  }
  
  .content-area {
    flex-grow: 1;
    padding: 20px;
    overflow-y: auto;
  }
  
  @keyframes reconnect-pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.3; }
  }
  
  .btn-secondary {
    background: rgba(255,255,255,0.2);
    border: 1px solid rgba(255,255,255,0.4);
    color: white;
    padding: 5px 14px;
    border-radius: 6px;
    cursor: pointer;
    font-size: 13px;
    font-weight: 600;
    white-space: nowrap;
    transition: background 0.2s;
  }
  
  .btn-secondary:hover {
    background: rgba(255,255,255,0.35);
  }
</style>
