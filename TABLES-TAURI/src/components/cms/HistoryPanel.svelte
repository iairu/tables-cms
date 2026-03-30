<script>
  import { onMount } from 'svelte';
  import ConfirmModal from '../ConfirmModal.svelte';

  export let history = [];
  export let entityType = 'page'; // 'page' or 'blog'
  export let entityId = '';
  export let isOpen = false;
  export let onClose = () => {};

  let selectedEntry = null;
  let showConfirmRollback = false;
  let showConfirmDelete = false;
  let entryToDelete = null;
  let showConfirmClear = false;
  let searchQuery = '';
  let actionFilter = 'all';

  onMount(() => {
    return () => {
      // Cleanup if needed
    };
  });

  function formatDate(timestamp) {
    const date = new Date(timestamp);
    return date.toLocaleString();
  }

  function getActionIcon(action) {
    switch (action) {
      case 'create': return 'fa-plus-circle';
      case 'update': return 'fa-edit';
      case 'delete': return 'fa-trash';
      case 'rollback': return 'fa-undo';
      default: return 'fa-history';
    }
  }

  function getActionColor(action) {
    switch (action) {
      case 'create': return 'color: var(--color-secondary);';
      case 'update': return 'color: var(--color-primary);';
      case 'delete': return 'color: #ef4444;';
      case 'rollback': return 'color: var(--color-accent);';
      default: return 'color: var(--text-secondary);';
    }
  }

  function getFilteredHistory() {
    return history.filter(entry => {
      // Filter by entity ID if provided
      const idField = entityType === 'page' ? 'pageId' : 'articleId';
      if (entityId && entry[idField] !== entityId) return false;

      // Filter by search query
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesLabel = entry.label?.toLowerCase().includes(query);
        const matchesAction = entry.action.toLowerCase().includes(query);
        const matchesDate = entry.date.toLowerCase().includes(query);
        if (!matchesLabel && !matchesAction && !matchesDate) return false;
      }

      // Filter by action type
      if (actionFilter !== 'all' && entry.action !== actionFilter) return false;

      return true;
    });
  }

  const filteredHistory = getFilteredHistory();

  function viewEntry(entry) {
    selectedEntry = entry;
  }

  function closeView() {
    selectedEntry = null;
  }

  function rollbackToEntry(entry) {
    selectedEntry = entry;
    showConfirmRollback = true;
  }

  function confirmRollback() {
    if (selectedEntry) {
      const { rollbackPage, rollbackBlog } = require('../../stores/cmsData.js');
      const idField = entityType === 'page' ? 'pageId' : 'articleId';
      
      if (entityType === 'page') {
        rollbackPage(selectedEntry.pageId, selectedEntry);
      } else {
        rollbackBlog(selectedEntry.articleId, selectedEntry);
      }
      
      showConfirmRollback = false;
      selectedEntry = null;
      onClose();
    }
  }

  function cancelRollback() {
    showConfirmRollback = false;
  }

  function deleteEntry(entry) {
    entryToDelete = entry;
    showConfirmDelete = true;
  }

  function confirmDelete() {
    if (entryToDelete) {
      const { deleteHistoryEntry } = require('../../stores/cmsData.js');
      deleteHistoryEntry(entryToDelete.id, entityType);
      showConfirmDelete = false;
      entryToDelete = null;
    }
  }

  function cancelDelete() {
    showConfirmDelete = false;
    entryToDelete = null;
  }

  function clearAllHistory() {
    showConfirmClear = true;
  }

  function confirmClear() {
    const { clearHistory } = require('../../stores/cmsData.js');
    clearHistory(entityType);
    showConfirmClear = false;
  }

  function cancelClear() {
    showConfirmClear = false;
  }

  function exportHistoryData() {
    const { exportHistory } = require('../../stores/cmsData.js');
    exportHistory(entityType);
  }

  function importHistoryData(event) {
    const file = event.target.files[0];
    if (file) {
      const { importHistory } = require('../../stores/cmsData.js');
      importHistory(entityType, file)
        .then(count => {
          alert(`Imported ${count} history entries`);
        })
        .catch(error => {
          alert(`Import failed: ${error.message}`);
        });
    }
  }

  function closeModal() {
    isOpen = false;
    selectedEntry = null;
    onClose();
  }
</script>

{#if isOpen}
  <div class="modal-overlay" on:click={closeModal}>
    <div class="history-modal" on:click|stopPropagation>
      <div class="modal-header">
        <h3>
          <i class="fas fa-history"></i>
          {entityType === 'page' ? 'Page' : 'Article'} History
        </h3>
        <button class="btn-icon" on:click={closeModal}>
          <i class="fas fa-times"></i>
        </button>
      </div>

      <div class="modal-body">
        <div class="history-controls">
          <input
            type="text"
            class="search-input"
            placeholder="Search history..."
            bind:value={searchQuery}
          />

          <select bind:value={actionFilter}>
            <option value="all">All Actions</option>
            <option value="create">Create</option>
            <option value="update">Update</option>
            <option value="delete">Delete</option>
            <option value="rollback">Rollback</option>
          </select>

          <div class="history-actions">
            <button class="btn-secondary" on:click={exportHistoryData} title="Export History">
              <i class="fas fa-download"></i>
              Export
            </button>
            <label class="btn-secondary" title="Import History">
              <i class="fas fa-upload"></i>
              Import
              <input
                type="file"
                accept=".json"
                style="display: none;"
                on:change={importHistoryData}
              />
            </label>
            <button class="btn-danger" on:click={clearAllHistory} title="Clear All History">
              <i class="fas fa-trash"></i>
              Clear All
            </button>
          </div>
        </div>

        <div class="history-stats">
          <span>{filteredHistory.length} of {history.length} entries</span>
        </div>

        <div class="history-list">
          {#if filteredHistory.length === 0}
            <div class="no-history">
              <i class="fas fa-history"></i>
              <p>No history entries found</p>
            </div>
          {:else}
            {#each filteredHistory as entry (entry.id)}
              <div class="history-entry" class:selected={selectedEntry?.id === entry.id}>
                <div class="entry-header">
                  <div class="entry-info">
                    <i class="fas {getActionIcon(entry.action)}" style={getActionColor(entry.action)}></i>
                    <span class="entry-action">{entry.action}</span>
                    <span class="entry-date">{formatDate(entry.timestamp)}</span>
                  </div>
                  <div class="entry-actions">
                    <button
                      class="btn-icon btn-small"
                      title="View Details"
                      on:click={() => viewEntry(entry)}
                    >
                      <i class="fas fa-eye"></i>
                    </button>
                    {#if entry.action !== 'delete'}
                      <button
                        class="btn-icon btn-small"
                        title="Rollback to This Version"
                        on:click={() => rollbackToEntry(entry)}
                      >
                        <i class="fas fa-undo"></i>
                      </button>
                    {/if}
                    <button
                      class="btn-icon btn-small btn-danger"
                      title="Delete Entry"
                      on:click={() => deleteEntry(entry)}
                    >
                      <i class="fas fa-trash"></i>
                    </button>
                  </div>
                </div>
                {#if entry.label}
                  <div class="entry-label">{entry.label}</div>
                {/if}
              </div>
            {/each}
          {/if}
        </div>
      </div>

      {#if selectedEntry}
        <div class="entry-details">
          <h4>Entry Details</h4>
          <div class="detail-grid">
            <div class="detail-item">
              <label>Action:</label>
              <span>{selectedEntry.action}</span>
            </div>
            <div class="detail-item">
              <label>Date:</label>
              <span>{formatDate(selectedEntry.timestamp)}</span>
            </div>
            {#if selectedEntry.label}
              <div class="detail-item full-width">
                <label>Label:</label>
                <span>{selectedEntry.label}</span>
              </div>
            {/if}
            <div class="detail-item full-width">
              <label>Data:</label>
              <pre>{JSON.stringify(selectedEntry.data, null, 2)}</pre>
            </div>
          </div>
        </div>
      {/if}
    </div>
  </div>
{/if}

<ConfirmModal
  isOpen={showConfirmRollback}
  title="Rollback to This Version?"
  message="Are you sure you want to rollback to this version? The current version will be saved to history before rollback."
  confirmText="Rollback"
  cancelText="Cancel"
  isDestructive={false}
  onConfirm={confirmRollback}
  onCancel={cancelRollback}
/>

<ConfirmModal
  isOpen={showConfirmDelete}
  title="Delete History Entry"
  message="Are you sure you want to delete this history entry? This action cannot be undone."
  confirmText="Delete"
  cancelText="Cancel"
  onConfirm={confirmDelete}
  onCancel={cancelDelete}
/>

<ConfirmModal
  isOpen={showConfirmClear}
  title="Clear All History"
  message="Are you sure you want to clear all history entries? This action cannot be undone."
  confirmText="Clear All"
  cancelText="Cancel"
  isDestructive={true}
  onConfirm={confirmClear}
  onCancel={cancelClear}
/>

<style>
  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 9999;
  }

  .history-modal {
    background: var(--bg-card);
    border-radius: var(--radius-xl);
    width: 90%;
    max-width: 1000px;
    max-height: 90vh;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  .modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px;
    border-bottom: 1px solid var(--border-light);
  }

  .modal-header h3 {
    display: flex;
    align-items: center;
    gap: 12px;
    margin: 0;
  }

  .modal-header h3 i {
    color: var(--color-primary);
  }

  .modal-body {
    flex: 1;
    overflow-y: auto;
    padding: 20px;
  }

  .history-controls {
    display: flex;
    gap: 12px;
    margin-bottom: 16px;
    flex-wrap: wrap;
  }

  .search-input,
  select {
    padding: 8px 12px;
    border: 1px solid var(--border-light);
    border-radius: var(--radius-md);
    background: var(--bg-primary);
    color: var(--text-primary);
  }

  .search-input {
    flex: 1;
    min-width: 200px;
  }

  .history-actions {
    display: flex;
    gap: 8px;
  }

  .history-stats {
    margin-bottom: 16px;
    color: var(--text-tertiary);
    font-size: var(--text-sm);
  }

  .history-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .history-entry {
    background: var(--bg-secondary);
    border: 1px solid var(--border-light);
    border-radius: var(--radius-md);
    padding: 12px;
    transition: all var(--transition-fast);
  }

  .history-entry:hover {
    background: var(--bg-tertiary);
  }

  .history-entry.selected {
    border-color: var(--color-primary);
    background: rgba(37, 99, 235, 0.1);
  }

  .entry-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .entry-info {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .entry-info i {
    font-size: 16px;
  }

  .entry-action {
    font-weight: 600;
    text-transform: capitalize;
  }

  .entry-date {
    color: var(--text-tertiary);
    font-size: var(--text-sm);
  }

  .entry-actions {
    display: flex;
    gap: 6px;
  }

  .btn-small {
    width: 28px;
    height: 28px;
    font-size: 12px;
  }

  .entry-label {
    margin-top: 8px;
    padding-top: 8px;
    border-top: 1px solid var(--border-light);
    color: var(--text-secondary);
    font-size: var(--text-sm);
  }

  .no-history {
    text-align: center;
    padding: 60px 20px;
    color: var(--text-tertiary);
  }

  .no-history i {
    font-size: 48px;
    margin-bottom: 16px;
  }

  .entry-details {
    border-top: 1px solid var(--border-light);
    padding: 20px;
    background: var(--bg-secondary);
  }

  .entry-details h4 {
    margin-bottom: 16px;
  }

  .detail-grid {
    display: grid;
    gap: 12px;
  }

  .detail-item {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .detail-item.full-width {
    grid-column: 1 / -1;
  }

  .detail-item label {
    font-weight: 600;
    color: var(--text-secondary);
    font-size: var(--text-sm);
  }

  .detail-item pre {
    background: var(--bg-primary);
    padding: 12px;
    border-radius: var(--radius-md);
    overflow: auto;
    max-height: 300px;
    font-size: var(--text-sm);
  }
</style>
