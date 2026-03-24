<script>
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
  
  function handleCloseApp() {
    // In Tauri, we'd call appWindow.close()
    console.log('Close app');
  }
  
  function handleMinimizeApp() {
    console.log('Minimize app');
  }
  
  function handleMaximizeApp() {
    console.log('Maximize app');
  }
</script>

<header class="header">
  <div class="header-left">
    <h1 class="app-title">
      <i class="fas fa-table"></i>
      TABLES CMS
    </h1>
  </div>
  
  <div class="header-center">
    <div class="window-controls">
      <button class="window-control" title="Minimize" on:click={handleMinimizeApp}>
        <i class="fas fa-minus"></i>
      </button>
      <button class="window-control" title="Maximize" on:click={handleMaximizeApp}>
        <i class="fas fa-square"></i>
      </button>
      <button class="window-control close" title="Close" on:click={handleCloseApp}>
        <i class="fas fa-times"></i>
      </button>
    </div>
  </div>
  
  <div class="header-right">
    <button 
      class="btn-icon" 
      title="Notes"
      on:click={onToggleNotesSidebar}
    >
      <i class="fas fa-sticky-note"></i>
    </button>
    
    {#if canBuild && !isBuilding}
      <button 
        class="btn-primary" 
        on:click={() => onBuildLocally()}
        title="Build Locally"
      >
        <i class="fas fa-hammer"></i>
        Build Locally
      </button>
      
      {#if domain && vercelApiKey}
        <button 
          class="btn-success" 
          on:click={() => onBuildAndDeploy()}
          title="Build & Deploy"
        >
          <i class="fas fa-rocket"></i>
          Build & Deploy
        </button>
      {/if}
    {:else if isBuilding}
      <button class="btn-disabled" disabled>
        <i class="fas fa-spinner fa-spin"></i>
        Building...
      </button>
    {/if}
    
    <a 
      href={domain} 
      target="_blank" 
      rel="noopener noreferrer"
      class="btn-secondary"
      title="Visit Domain"
    >
      <i class="fas fa-external-link-alt"></i>
      Visit
    </a>
  </div>
</header>

<style>
  .header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 20px;
    background: white;
    border-bottom: 1px solid #e2e8f0;
    box-shadow: 0 1px 3px rgba(0,0,0,0.05);
  }
  
  .header-left {
    display: flex;
    align-items: center;
  }
  
  .app-title {
    font-size: 20px;
    font-weight: 700;
    color: #0f172a;
    margin: 0;
    display: flex;
    align-items: center;
    gap: 10px;
  }
  
  .app-title i {
    color: #2563eb;
  }
  
  .header-center {
    flex: 1;
    display: flex;
    justify-content: center;
  }
  
  .window-controls {
    display: flex;
    gap: 8px;
  }
  
  .window-control {
    width: 30px;
    height: 30px;
    border: none;
    background: #f1f5f9;
    border-radius: 6px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background 0.2s;
  }
  
  .window-control:hover {
    background: #e2e8f0;
  }
  
  .window-control.close:hover {
    background: #ef4444;
    color: white;
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
    background: #f1f5f9;
    border-radius: 6px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background 0.2s;
    color: #475569;
  }
  
  .btn-icon:hover {
    background: #e2e8f0;
  }
  
  .btn-primary,
  .btn-success,
  .btn-secondary,
  .btn-disabled {
    padding: 8px 16px;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-weight: 600;
    font-size: 14px;
    display: flex;
    align-items: center;
    gap: 8px;
    transition: all 0.2s;
    text-decoration: none;
  }
  
  .btn-primary {
    background: #2563eb;
    color: white;
  }
  
  .btn-primary:hover {
    background: #1d4ed8;
  }
  
  .btn-success {
    background: #10b981;
    color: white;
  }
  
  .btn-success:hover {
    background: #059669;
  }
  
  .btn-secondary {
    background: white;
    color: #475569;
    border: 1px solid #e2e8f0;
  }
  
  .btn-secondary:hover {
    background: #f8fafc;
  }
  
  .btn-disabled {
    background: #cbd5e1;
    color: #64748b;
    cursor: not-allowed;
  }
</style>
