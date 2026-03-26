<script>
  import { onMount } from 'svelte';
  
  export let isOpen = false;
  
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

  // Load existing notes on mount
  onMount(() => {
    if (typeof window !== 'undefined') {
      noteText = localStorage.getItem('notes-extension-data') || '';
    }
  });
</script>

<aside class="notes-sidebar" class:open={isOpen}>
  <div class="notes-header">
    <h3><i class="fas fa-sticky-note"></i> Notes</h3>
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

<style>
  .notes-sidebar {
    position: fixed;
    top: 65px;  /* Below header */
    right: 0;
    width: 350px;
    height: calc(100vh - 65px);
    background: var(--bg-card, white);
    z-index: 100;
    display: flex;
    flex-direction: column;
    box-shadow: -2px 0 8px rgba(0, 0, 0, 0.1);
    border-left: 1px solid var(--border-light, #e2e8f0);
    transition: transform 0.3s ease;
  }

  .notes-sidebar.open {
    transform: translateX(0);
  }

  .notes-sidebar:not(.open) {
    transform: translateX(100%);
  }

  .notes-header {
    display: flex;
    align-items: center;
    padding: 16px 20px;
    border-bottom: 1px solid var(--border-light, #e2e8f0);
    background: var(--bg-secondary, #f8fafc);
  }

  .notes-header h3 {
    margin: 0;
    font-size: 16px;
    font-weight: 600;
    color: var(--text-primary, #0f172a);
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .notes-header h3 i {
    color: var(--color-primary, #2563eb);
  }

  .notes-content {
    flex: 1;
    padding: 16px;
    overflow-y: auto;
    background: var(--bg-card, white);
  }

  .notes-content textarea {
    width: 100%;
    height: 100%;
    min-height: 300px;
    border: 1px solid var(--border-light, #e2e8f0);
    border-radius: 6px;
    padding: 12px;
    font-family: inherit;
    font-size: 14px;
    line-height: 1.6;
    resize: none;
    background: var(--bg-card, white);
    color: var(--text-primary, #0f172a);
  }

  .notes-content textarea:focus {
    outline: none;
    border-color: var(--color-primary, #2563eb);
    box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
  }

  .notes-footer {
    padding: 12px 20px;
    border-top: 1px solid var(--border-light, #e2e8f0);
    background: var(--bg-secondary, #f8fafc);
  }

  .save-status {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 12px;
    color: var(--text-tertiary, #64748b);
  }

  .save-status i {
    font-size: 14px;
  }
</style>
