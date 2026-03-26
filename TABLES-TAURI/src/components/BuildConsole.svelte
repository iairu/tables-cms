<script>
  export let isOpen = false;
  export let isBuilding = false;
  export let progress = 0;
  export let logs = [];
  export let status = 'idle'; // idle, building, success, error, cancelled
  export let onCancel = () => {};
  export let onClose = () => {};
  
  let logsContainer = null;
  
  // Auto-scroll to bottom of logs
  $: if (logsContainer && logs.length > 0) {
    logsContainer.scrollTop = logsContainer.scrollHeight;
  }
  
  function getStatusIcon() {
    switch (status) {
      case 'building': return 'fa-spinner fa-spin';
      case 'success': return 'fa-check-circle';
      case 'error': return 'fa-exclamation-circle';
      case 'cancelled': return 'fa-times-circle';
      default: return 'fa-cog';
    }
  }
  
  function getStatusColor() {
    switch (status) {
      case 'building': return '#2563eb';
      case 'success': return '#10b981';
      case 'error': return '#ef4444';
      case 'cancelled': return '#f59e0b';
      default: return '#64748b';
    }
  }
</script>

{#if isOpen}
  <div class="build-console-overlay" on:click={onClose}>
    <div class="build-console" on:click|stopPropagation>
      <div class="console-header">
        <div class="console-title">
          <i class="fas {getStatusIcon()}" style="color: {getStatusColor()}"></i>
          <span>
            {#if status === 'building'}
              Building...
            {:else if status === 'success'}
              Build Successful!
            {:else if status === 'error'}
              Build Failed!
            {:else if status === 'cancelled'}
              Build Cancelled
            {:else}
              Build Console
            {/if}
          </span>
        </div>
        <div class="console-actions">
          {#if isBuilding}
            <button class="btn-cancel" on:click={onCancel}>
              <i class="fas fa-stop"></i>
              Cancel
            </button>
          {/if}
          <button class="btn-close" on:click={onClose}>
            <i class="fas fa-times"></i>
          </button>
        </div>
      </div>
      
      {#if status === 'building' || status === 'success' || status === 'error' || status === 'cancelled'}
        <div class="console-progress">
          <div class="progress-bar">
            <div 
              class="progress-fill" 
              style="width: {progress}%; background: {getStatusColor()}"
            ></div>
          </div>
          <span class="progress-text">{Math.round(progress)}%</span>
        </div>
      {/if}
      
      <div class="console-logs" bind:this={logsContainer}>
        {#if logs.length === 0}
          <div class="no-logs">
            <i class="fas fa-terminal"></i>
            <p>Build logs will appear here...</p>
          </div>
        {:else}
          {#each logs as log, i}
            <div class="log-line {log.type || 'info'}">
              <span class="log-timestamp">[{log.time}]</span>
              <span class="log-message">{log.message}</span>
            </div>
          {/each}
        {/if}
      </div>
      
      {#if status === 'success' || status === 'error' || status === 'cancelled'}
        <div class="console-footer">
          <button class="btn-primary" on:click={onClose}>
            <i class="fas fa-check"></i>
            Done
          </button>
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
    z-index: 10000;
    animation: fadeIn 0.2s ease-out;
  }
  
  .build-console {
    background: var(--bg-card, #1e1e1e);
    border-radius: 12px;
    width: 90%;
    max-width: 800px;
    max-height: 80vh;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
    animation: slideUp 0.3s ease-out;
  }
  
  .console-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px 20px;
    border-bottom: 1px solid var(--border-light, #333);
    background: var(--bg-secondary, #252526);
  }
  
  .console-title {
    display: flex;
    align-items: center;
    gap: 12px;
    font-size: 16px;
    font-weight: 600;
    color: var(--text-primary, #ffffff);
  }
  
  .console-title i {
    font-size: 20px;
  }
  
  .console-actions {
    display: flex;
    gap: 8px;
  }
  
  .btn-cancel {
    padding: 8px 16px;
    border: none;
    border-radius: 6px;
    background: #ef4444;
    color: white;
    cursor: pointer;
    font-weight: 600;
    font-size: 13px;
    display: flex;
    align-items: center;
    gap: 6px;
    transition: background 0.2s;
  }
  
  .btn-cancel:hover {
    background: #dc2626;
  }
  
  .btn-close {
    width: 32px;
    height: 32px;
    border: none;
    border-radius: 6px;
    background: var(--bg-tertiary, #333);
    color: var(--text-secondary, #999);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s;
  }
  
  .btn-close:hover {
    background: #ef4444;
    color: white;
  }
  
  .console-progress {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 20px;
    background: var(--bg-secondary, #252526);
    border-bottom: 1px solid var(--border-light, #333);
  }
  
  .progress-bar {
    flex: 1;
    height: 8px;
    background: var(--bg-tertiary, #333);
    border-radius: 4px;
    overflow: hidden;
  }
  
  .progress-fill {
    height: 100%;
    transition: width 0.3s ease;
    border-radius: 4px;
  }
  
  .progress-text {
    font-size: 13px;
    font-weight: 600;
    color: var(--text-primary, #ffffff);
    min-width: 45px;
    text-align: right;
  }
  
  .console-logs {
    flex: 1;
    overflow-y: auto;
    padding: 16px 20px;
    background: var(--bg-card, #1e1e1e);
    font-family: 'Fira Code', 'Consolas', monospace;
    font-size: 13px;
    line-height: 1.6;
    min-height: 300px;
    max-height: 50vh;
  }
  
  .no-logs {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 200px;
    color: var(--text-tertiary, #666);
  }
  
  .no-logs i {
    font-size: 48px;
    margin-bottom: 16px;
  }
  
  .log-line {
    display: flex;
    gap: 12px;
    padding: 4px 0;
    border-bottom: 1px solid var(--border-light, #333);
  }
  
  .log-line:last-child {
    border-bottom: none;
  }
  
  .log-line.info {
    color: var(--text-primary, #ffffff);
  }
  
  .log-line.success {
    color: #10b981;
  }
  
  .log-line.error {
    color: #ef4444;
  }
  
  .log-line.warning {
    color: #f59e0b;
  }
  
  .log-timestamp {
    color: var(--text-tertiary, #666);
    font-size: 11px;
    white-space: nowrap;
  }
  
  .log-message {
    flex: 1;
    word-break: break-word;
  }
  
  .console-footer {
    display: flex;
    justify-content: flex-end;
    padding: 16px 20px;
    border-top: 1px solid var(--border-light, #333);
    background: var(--bg-secondary, #252526);
  }
  
  .btn-primary {
    padding: 10px 20px;
    border: none;
    border-radius: 6px;
    background: #2563eb;
    color: white;
    cursor: pointer;
    font-weight: 600;
    font-size: 14px;
    display: flex;
    align-items: center;
    gap: 8px;
    transition: background 0.2s;
  }
  
  .btn-primary:hover {
    background: #1d4ed8;
  }
  
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  
  @keyframes slideUp {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
</style>
