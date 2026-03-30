<script>
  import { onMount, onDestroy } from 'svelte';
  import { listen } from '@tauri-apps/api/event';
  import { getBuildLogs, getDeploymentStatus, clearBuildLogs } from '../stores/cmsData.js';

  // Support both prop naming conventions
  export let isOpen = false;
  export let open = false;
  export let onClose = () => {};
  export let onCancel = null;
  
  // Additional props for build state (passed from parent)
  export let isBuilding = false;
  export let progress = 0;
  export let logs = [];
  export let status = 'idle';

  let buildLogs = [];
  let deploymentStatus = null;
  let autoScroll = true;
  let logsContainer = null;
  let refreshInterval = null;
  
  // Use isOpen if open is not explicitly set
  $: effectiveOpen = open || isOpen;

  onMount(async () => {
    // Listen for deployment complete event
    const unlisten = await listen('deployment-complete', (event) => {
      buildLogs.push(`✅ Deployment complete!`);
      buildLogs.push(`   URL: ${event.payload.url}`);
      buildLogs.push(`   ID: ${event.payload.id}`);
      
      if (autoScroll && logsContainer) {
        logsContainer.scrollTop = logsContainer.scrollHeight;
      }
    });

    // Refresh logs periodically when open
    refreshInterval = setInterval(async () => {
      if (isOpen) {
        const logs = await getBuildLogs();
        if (logs && logs.length > buildLogs.length) {
          buildLogs = logs;
          if (autoScroll && logsContainer) {
            logsContainer.scrollTop = logsContainer.scrollHeight;
          }
        }
        
        const status = await getDeploymentStatus();
        if (status) {
          deploymentStatus = status;
        }
      }
    }, 1000);

    // Initial load
    buildLogs = await getBuildLogs();
    deploymentStatus = await getDeploymentStatus();

    return () => {
      unlisten();
      if (refreshInterval) {
        clearInterval(refreshInterval);
      }
    };
  });

  function handleClearLogs() {
    clearBuildLogs();
    buildLogs = [];
  }

  function handleCopyLogs() {
    const logsText = buildLogs.join('\n');
    navigator.clipboard.writeText(logsText);
  }

  function getLogIcon(log) {
    if (log.includes('✅') || log.includes('success')) return 'fa-check-circle text-success';
    if (log.includes('❌') || log.includes('failed') || log.includes('error')) return 'fa-times-circle text-danger';
    if (log.includes('⚠️') || log.includes('warning')) return 'fa-exclamation-triangle text-warning';
    if (log.includes('🔨') || log.includes('Starting') || log.includes('Running')) return 'fa-hammer text-info';
    if (log.includes('📦') || log.includes('Copied')) return 'fa-box text-info';
    if (log.includes('📄') || log.includes('Generated')) return 'fa-file text-info';
    if (log.includes('🗺️') || log.includes('Sitemap')) return 'fa-map text-info';
    if (log.includes('🤖') || log.includes('Robots')) return 'fa-robot text-info';
    if (log.includes('📱') || log.includes('Manifest')) return 'fa-mobile text-info';
    if (log.includes('🚀') || log.includes('Deploying')) return 'fa-rocket text-primary';
    return 'fa-info-circle text-muted';
  }
</script>

{#if isOpen}
  <div class="build-console-overlay" on:click={onClose}>
    <div class="build-console" on:click|stopPropagation>
      <div class="console-header">
        <div class="console-title">
          <i class="fas fa-terminal"></i>
          <span>Build Console</span>
          {#if deploymentStatus?.is_deploying}
            <span class="status-badge deploying">
              <i class="fas fa-spinner fa-spin"></i>
              Deploying...
            </span>
          {/if}
        </div>
        <div class="console-actions">
          <label class="checkbox-label">
            <input type="checkbox" bind:checked={autoScroll} />
            <span>Auto-scroll</span>
          </label>
          <button class="btn-icon" on:click={handleCopyLogs} title="Copy logs">
            <i class="fas fa-copy"></i>
          </button>
          <button class="btn-icon" on:click={handleClearLogs} title="Clear logs">
            <i class="fas fa-trash"></i>
          </button>
          <button class="btn-close" on:click={onClose}>
            <i class="fas fa-times"></i>
          </button>
        </div>
      </div>

      <div class="console-body">
        <div class="logs-container" bind:this={logsContainer}>
          {#if buildLogs && buildLogs.length > 0}
            {#each buildLogs as log, index}
              <div class="log-line">
                <i class="fas {getLogIcon(log)}"></i>
                <span>{log}</span>
              </div>
            {/each}
          {:else}
            <div class="empty-logs">
              <i class="fas fa-terminal"></i>
              <p>No build logs yet. Start a build to see output here.</p>
            </div>
          {/if}
        </div>
      </div>

      {#if deploymentStatus}
        <div class="console-footer">
          <div class="status-info">
            {#if deploymentStatus.last_deployment}
              <span>
                <i class="fas fa-clock"></i>
                Last deployment: {new Date(deploymentStatus.last_deployment * 1000).toLocaleString()}
              </span>
            {/if}
            {#if deploymentStatus.deployment_url}
              <a href={deploymentStatus.deployment_url} target="_blank" rel="noopener noreferrer">
                <i class="fas fa-external-link-alt"></i>
                View Deployment
              </a>
            {/if}
          </div>
        </div>
      {/if}
    </div>
  </div>
{/if}

<style>
  .build-console-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.7);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 9999;
    backdrop-filter: blur(4px);
  }

  .build-console {
    background: var(--bg-card, #1e1e1e);
    border-radius: 12px;
    width: 90%;
    max-width: 900px;
    height: 80vh;
    max-height: 700px;
    display: flex;
    flex-direction: column;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
    border: 1px solid var(--border-light, #333);
  }

  .console-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px 20px;
    border-bottom: 1px solid var(--border-light, #333);
  }

  .console-title {
    display: flex;
    align-items: center;
    gap: 12px;
    font-size: 16px;
    font-weight: 600;
    color: var(--text-primary, #fff);
  }

  .console-title i {
    color: var(--color-primary, #2563eb);
  }

  .status-badge {
    padding: 4px 12px;
    border-radius: 20px;
    font-size: 12px;
    font-weight: 600;
    display: inline-flex;
    align-items: center;
    gap: 6px;
  }

  .status-badge.deploying {
    background: rgba(245, 158, 11, 0.2);
    color: #f59e0b;
    border: 1px solid #f59e0b;
  }

  .console-actions {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .checkbox-label {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 13px;
    color: var(--text-secondary, #aaa);
    cursor: pointer;
  }

  .checkbox-label input {
    cursor: pointer;
  }

  .console-body {
    flex: 1;
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }

  .logs-container {
    flex: 1;
    overflow-y: auto;
    padding: 16px;
    font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
    font-size: 13px;
    line-height: 1.6;
    background: rgba(0, 0, 0, 0.3);
    border-radius: 8px;
    margin: 0 16px 16px;
  }

  .log-line {
    display: flex;
    align-items: flex-start;
    gap: 10px;
    padding: 4px 0;
    color: var(--text-primary, #e0e0e0);
  }

  .log-line i {
    flex-shrink: 0;
    width: 16px;
  }

  .text-success { color: #10b981; }
  .text-danger { color: #ef4444; }
  .text-warning { color: #f59e0b; }
  .text-info { color: #3b82f6; }
  .text-primary { color: var(--color-primary, #2563eb); }
  .text-muted { color: var(--text-muted, #666); }

  .empty-logs {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 200px;
    color: var(--text-muted, #666);
  }

  .empty-logs i {
    font-size: 48px;
    margin-bottom: 16px;
    opacity: 0.5;
  }

  .console-footer {
    padding: 12px 20px;
    border-top: 1px solid var(--border-light, #333);
    background: rgba(0, 0, 0, 0.2);
    border-radius: 0 0 12px 12px;
  }

  .status-info {
    display: flex;
    gap: 16px;
    font-size: 13px;
    color: var(--text-secondary, #aaa);
  }

  .status-info a {
    color: var(--color-primary, #2563eb);
    text-decoration: none;
    display: inline-flex;
    align-items: center;
    gap: 6px;
  }

  .status-info a:hover {
    text-decoration: underline;
  }

  .btn-icon {
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    border: none;
    background: var(--bg-tertiary, #333);
    border-radius: 6px;
    cursor: pointer;
    color: var(--text-secondary, #aaa);
    transition: all 0.2s;
  }

  .btn-icon:hover {
    background: var(--bg-secondary, #444);
    color: var(--text-primary, #fff);
  }

  .btn-close {
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    border: none;
    background: transparent;
    border-radius: 6px;
    cursor: pointer;
    color: var(--text-secondary, #aaa);
    transition: all 0.2s;
  }

  .btn-close:hover {
    background: #ef4444;
    color: white;
  }

  /* Scrollbar styling */
  .logs-container::-webkit-scrollbar {
    width: 8px;
  }

  .logs-container::-webkit-scrollbar-track {
    background: rgba(0, 0, 0, 0.2);
    border-radius: 4px;
  }

  .logs-container::-webkit-scrollbar-thumb {
    background: var(--border-medium, #555);
    border-radius: 4px;
  }

  .logs-container::-webkit-scrollbar-thumb:hover {
    background: var(--border-light, #777);
  }
</style>
