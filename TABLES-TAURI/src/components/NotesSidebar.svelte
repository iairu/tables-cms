<script>
  export let isOpen = false;
  export let onClose = () => {};

  let noteText = '';
  let saveTimeout = null;
  let lastSaved = null;

  function autoSave() {
    // Clear any pending save
    if (saveTimeout) clearTimeout(saveTimeout);
    
    // Debounce save - wait 500ms after last keystroke
    saveTimeout = setTimeout(() => {
      localStorage.setItem('notes-extension-data', noteText);
      lastSaved = new Date();
      console.log('Notes auto-saved at', lastSaved.toLocaleTimeString());
    }, 500);
  }

  function handleInput() {
    autoSave();
  }

  // Load existing notes
  if (typeof window !== 'undefined' && isOpen) {
    noteText = localStorage.getItem('notes-extension-data') || '';
  }
</script>

{#if isOpen}
  <div class="notes-sidebar-overlay" on:click={onClose}></div>
  <aside class="notes-sidebar" class:open={isOpen}>
    <div class="notes-header">
      <h3><i class="fas fa-sticky-note"></i> Notes</h3>
      <button class="btn-close" on:click={onClose}>
        <i class="fas fa-times"></i>
      </button>
    </div>
    
    <div class="notes-content">
      <textarea
        bind:value={noteText}
        on:input={handleInput}
        placeholder="Write your notes here... (auto-saves)"
      ></textarea>
    </div>

    <div class="notes-footer">
      <span class="save-status">
        {#if lastSaved}
          <i class="fas fa-check"></i>
          Saved at {lastSaved.toLocaleTimeString()}
        {:else}
          <i class="fas fa-clock"></i>
          Type to auto-save...
        {/if}
      </span>
    </div>
  </aside>
{/if}

<style>
  .notes-sidebar-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    z-index: 999;
  }
  
  .notes-sidebar {
    position: fixed;
    top: 0;
    right: -400px;
    width: 400px;
    height: 100vh;
    background: white;
    z-index: 1000;
    transition: right 0.3s ease;
    display: flex;
    flex-direction: column;
    box-shadow: -4px 0 12px rgba(0, 0, 0, 0.1);
  }
  
  .notes-sidebar.open {
    right: 0;
  }
  
  .notes-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px 20px;
    border-bottom: 1px solid #e2e8f0;
  }
  
  .notes-header h3 {
    margin: 0;
    font-size: 18px;
    color: #0f172a;
    display: flex;
    align-items: center;
    gap: 10px;
  }
  
  .notes-header h3 i {
    color: #2563eb;
  }
  
  .btn-close {
    width: 32px;
    height: 32px;
    border: none;
    background: #f1f5f9;
    border-radius: 6px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background 0.2s;
    color: #64748b;
  }
  
  .btn-close:hover {
    background: #e2e8f0;
  }
  
  .notes-content {
    flex: 1;
    padding: 20px;
    overflow-y: auto;
  }
  
  .notes-content textarea {
    width: 100%;
    height: 100%;
    min-height: 400px;
    border: 1px solid #e2e8f0;
    border-radius: 6px;
    padding: 16px;
    font-family: inherit;
    font-size: 14px;
    line-height: 1.6;
    resize: vertical;
  }
  
  .notes-content textarea:focus {
    outline: none;
    border-color: #2563eb;
    box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
  }
  
  .notes-footer {
    padding: 12px 20px;
    border-top: 1px solid #e2e8f0;
    background: #f8fafc;
  }

  .save-status {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 12px;
    color: #64748b;
  }

  .save-status i {
    font-size: 14px;
  }
</style>
