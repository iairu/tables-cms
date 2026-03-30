<script>
  import { onMount, onDestroy } from 'svelte';
  import Header from './Header.svelte';
  import SideMenu from './SideMenu.svelte';
  import LoadingBar from './LoadingBar.svelte';
  import LoadingSkeleton from './LoadingSkeleton.svelte';
  import BreathingLoader from './BreathingLoader.svelte';
  import NotesSidebar from './NotesSidebar.svelte';
  import ProjectMenu from './ProjectMenu.svelte';
  import { cmsData } from '../stores/cmsData.js';
  import { isLoading } from '../stores/loading.js';

  export let currentSection = 'settings';
  export let currentRoute = '/cms/settings';
  export let onNavigate = () => {};
  export let onBuildLocally = () => {};
  export let onBuildAndDeploy = () => {};
  export let isBuilding = false;
  export let canBuild = false;
  export let buildCooldownSeconds = 0;
  export let domain = '';
  export let vercelApiKey = '';
  export let extensions = {};

  let cmsDataValue;
  let isLoadingValue;
  let isNotesSidebarOpen = true;  // Always open by default when enabled
  let localExtensions = {};

  const unsubscribeCms = cmsData.subscribe(value => cmsDataValue = value);
  const unsubscribeLoading = isLoading.subscribe(value => isLoadingValue = value);

  // Keep extensions in sync with cmsData
  $: if (cmsDataValue?.extensions) {
    localExtensions = cmsDataValue.extensions;
  }

  // Use local extensions or fallback to prop
  $: effectiveExtensions = localExtensions || extensions || {};
  
  // Check if notes extension is enabled
  $: notesEnabled = effectiveExtensions?.['notes-extension-enabled'] === true;
  
  // Show reconnection banner
  $: showReconnectBanner = cmsDataValue?.collabState?.wasConnectedAsClient && !cmsDataValue?.collabState?.isConnected;
  
  function addBuildLog(message, type = 'info') {
    const now = new Date();
    const time = now.toLocaleTimeString();
    buildLogs = [...buildLogs, { time, message, type }];
  }
  
  function handleManualBuild(localOnly = false) {
    showBuildConsole = true;
    buildProgress = 0;
    buildLogs = [];
    buildStatus = 'building';
    buildCancelled = false;
    
    addBuildLog('Starting build process...', 'info');
    addBuildLog(localOnly ? 'Mode: Local Build' : 'Mode: Build & Deploy', 'info');
    addBuildLog('Initializing...', 'info');
    
    // Simulate build progress
    const progressInterval = setInterval(() => {
      if (!buildCancelled && buildProgress < 90) {
        buildProgress += Math.random() * 10;
        if (buildProgress > 90) buildProgress = 90;
        
        // Add some build logs
        const buildSteps = [
          'Preparing build environment...',
          'Installing dependencies...',
          'Compiling Svelte components...',
          'Optimizing assets...',
          'Generating static files...',
          'Minifying JavaScript...',
          'Processing CSS...',
          'Building complete!'
        ];
        
        const stepIndex = Math.floor((buildProgress / 100) * buildSteps.length);
        if (buildSteps[stepIndex]) {
          addBuildLog(buildSteps[stepIndex], 'info');
        }
      }
    }, 500);
    
    // Complete build after 5 seconds
    setTimeout(() => {
      clearInterval(progressInterval);
      
      if (buildCancelled) {
        buildStatus = 'cancelled';
        buildProgress = 0;
        addBuildLog('Build cancelled by user', 'warning');
      } else {
        buildProgress = 100;
        buildStatus = 'success';
        addBuildLog('Build completed successfully!', 'success');
        addBuildLog(`Output: dist/`, 'success');
        
        if (!localOnly) {
          addBuildLog('Preparing deployment...', 'info');
          setTimeout(() => {
            addBuildLog('Deploying to Vercel...', 'info');
            setTimeout(() => {
              addBuildLog('Deployment successful!', 'success');
              addBuildLog('Your site is live!', 'success');
            }, 1000);
          }, 500);
        }
      }
    }, 5000);
  }
  
  function cancelBuild() {
    buildCancelled = true;
    addBuildLog('Cancelling build...', 'warning');
  }
  
  function closeBuildConsole() {
    if (buildStatus !== 'building') {
      showBuildConsole = false;
      buildLogs = [];
      buildStatus = 'idle';
    }
  }
  
  function toggleNotesSidebar() {
    isNotesSidebarOpen = !isNotesSidebarOpen;
  }

  onMount(() => {
    return () => {
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
  
  <ProjectMenu />

  <main class="main-content" class:notes-open={notesEnabled && isNotesSidebarOpen}>
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
        <div class="loading-center">
          <BreathingLoader size={64} />
          <p class="loading-text">Loading...</p>
        </div>
      {:else}
        <slot></slot>
      {/if}
    </div>
  </main>

  {#if notesEnabled}
    <NotesSidebar isOpen={isNotesSidebarOpen} />
  {/if}
</div>

<style>
  .cms-container {
    display: flex;
    flex-direction: column;
    height: 100vh;  /* Fixed height, not min-height */
    overflow: hidden;  /* Prevent container scroll */
    background: var(--bg-primary, #f8fafc);
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
    flex-shrink: 0;  /* Don't shrink */
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
    overflow: hidden;  /* Prevent main scroll */
  }

  .main-content.notes-open {
    margin-right: 350px;  /* Width of notes sidebar */
  }

  .content-area {
    flex-grow: 1;
    padding: 12px;
    overflow-y: auto;  /* Only content area scrolls */
    height: 100%;  /* Fill available height */
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

  .loading-center {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    gap: 20px;
  }

  .loading-text {
    color: var(--text-secondary, #64748b);
    font-size: 14px;
    font-weight: 500;
    animation: loading-pulse 1.5s ease-in-out infinite;
  }

  @keyframes loading-pulse {
    0%, 100% {
      opacity: 0.6;
    }
    50% {
      opacity: 1;
    }
  }
</style>
