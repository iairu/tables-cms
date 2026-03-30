<script>
  import { cmsData, uploadFile, deleteUpload, loadUploads } from '../../../stores/cmsData.js';
  import { onMount } from 'svelte';
  import ConfirmModal from '../../ConfirmModal.svelte';
  import Fuse from 'fuse.js';

  let cmsDataValue;
  const unsubscribe = cmsData.subscribe(value => cmsDataValue = value);
  let isUploading = false;
  let showDeleteConfirm = false;
  let deleteItemId = null;
  let showPreview = false;
  let previewItem = null;
  let searchQuery = '';
  let selectedFiles = new Set();
  let showBulkDeleteConfirm = false;
  let isReplacing = false;
  let replaceItemId = null;
  let showImportExport = false;

  // Fuse.js instance for fuzzy search
  let fuse;

  onMount(() => {
    loadUploads();
  });

  // Initialize Fuse.js when uploads change
  $: if (cmsDataValue?.uploads) {
    fuse = new Fuse(cmsDataValue.uploads, {
      keys: ['name', 'mime_type'],
      threshold: 0.3,
      includeScore: true
    });
  }

  // Filter uploads based on search
  function getFilteredUploads() {
    if (!cmsDataValue?.uploads) return [];
    if (!searchQuery.trim()) return cmsDataValue.uploads;
    
    const results = fuse.search(searchQuery);
    return results.map(result => result.item);
  }

  const filteredUploads = getFilteredUploads();

  async function handleFileUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    isUploading = true;
    await uploadFile(file);
    isUploading = false;
    event.target.value = '';
  }

  async function handleReplaceFile(event) {
    const file = event.target.files[0];
    if (!file || !replaceItemId) return;

    isReplacing = true;
    // Delete old file first
    await deleteUpload(replaceItemId);
    // Upload new file
    await uploadFile(file);
    isReplacing = false;
    replaceItemId = null;
    event.target.value = '';
  }

  function requestDelete(id) {
    deleteItemId = id;
    showDeleteConfirm = true;
  }

  async function confirmDelete() {
    showDeleteConfirm = false;
    if (deleteItemId) {
      await deleteUpload(deleteItemId);
      deleteItemId = null;
    }
  }

  function cancelDelete() {
    showDeleteConfirm = false;
    deleteItemId = null;
  }

  function requestReplace(id) {
    replaceItemId = id;
    // Trigger file input
    const input = document.getElementById('replace-file-input');
    if (input) input.click();
  }

  function toggleSelect(id) {
    if (selectedFiles.has(id)) {
      selectedFiles.delete(id);
    } else {
      selectedFiles.add(id);
    }
  }

  function selectAll() {
    filteredUploads.forEach(upload => selectedFiles.add(upload.id));
  }

  function deselectAll() {
    selectedFiles.clear();
  }

  function requestBulkDelete() {
    showBulkDeleteConfirm = true;
  }

  async function confirmBulkDelete() {
    showBulkDeleteConfirm = false;
    for (const id of selectedFiles) {
      await deleteUpload(id);
    }
    selectedFiles.clear();
  }

  function cancelBulkDelete() {
    showBulkDeleteConfirm = false;
  }

  async function purgeAllUploads() {
    if (!confirm('Are you sure you want to delete ALL uploads? This action cannot be undone.')) {
      return;
    }
    for (const upload of cmsDataValue.uploads) {
      await deleteUpload(upload.id);
    }
  }

  function openPreview(upload) {
    previewItem = upload;
    showPreview = true;
  }

  function closePreview() {
    showPreview = false;
    previewItem = null;
  }

  function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  }

  function getFileIcon(mimeType) {
    if (mimeType.startsWith('image/')) return 'fa-file-image';
    if (mimeType.startsWith('video/')) return 'fa-file-video';
    if (mimeType.startsWith('audio/')) return 'fa-file-audio';
    if (mimeType.includes('pdf')) return 'fa-file-pdf';
    if (mimeType.includes('word')) return 'fa-file-word';
    if (mimeType.includes('excel')) return 'fa-file-excel';
    if (mimeType.includes('powerpoint')) return 'fa-file-powerpoint';
    if (mimeType.includes('zip') || mimeType.includes('compressed')) return 'fa-file-archive';
    return 'fa-file';
  }

  function isPreviewable(mimeType) {
    return mimeType.startsWith('image/') ||
           mimeType.startsWith('video/') ||
           mimeType.startsWith('audio/') ||
           mimeType === 'application/pdf';
  }

  function getPreviewUrl(upload) {
    if (upload.data) {
      return upload.data;
    }
    return `file://${upload.path}`;
  }

  function exportUploads() {
    const dataStr = JSON.stringify(cmsDataValue.uploads, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `uploads-export-${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }

  async function importUploads(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const imported = JSON.parse(e.target.result);
        if (!Array.isArray(imported)) {
          alert('Invalid uploads file format');
          return;
        }
        // Note: This would need backend support to actually import files
        alert('Import functionality requires backend support. Export/Import is metadata only.');
      } catch (error) {
        alert('Failed to parse uploads file: ' + error.message);
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  }
</script>

<div class="uploads-section">
  <div class="section-header">
    <h2><i class="fas fa-upload"></i> Uploads</h2>
    <div class="header-actions">
      <input
        type="text"
        class="search-input"
        placeholder="Search files..."
        bind:value={searchQuery}
      />
      <div class="bulk-actions" style:display={selectedFiles.size > 0 ? 'flex' : 'none'}>
        <span class="selected-count">{selectedFiles.size} selected</span>
        <button class="btn-secondary" on:click={deselectAll}>
          <i class="fas fa-times"></i>
          Deselect All
        </button>
        <button class="btn-danger" on:click={requestBulkDelete}>
          <i class="fas fa-trash"></i>
          Delete Selected
        </button>
      </div>
      <label class="btn-secondary">
        <i class="fas fa-upload"></i> Upload File
        <input
          type="file"
          style="display: none"
          accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.xls,.xlsx,.zip"
          on:change={handleFileUpload}
        />
      </label>
      <button class="btn-secondary" on:click={selectAll}>
        <i class="fas fa-check-square"></i>
        Select All
      </button>
      <button class="btn-secondary" on:click={exportUploads}>
        <i class="fas fa-download"></i>
        Export
      </button>
      <label class="btn-secondary">
        <i class="fas fa-upload"></i>
        Import
        <input
          type="file"
          style="display: none"
          accept=".json"
          on:change={importUploads}
        />
      </label>
      <button class="btn-danger" on:click={purgeAllUploads} title="Purge all uploads">
        <i class="fas fa-trash-alt"></i>
        Purge All
      </button>
    </div>
  </div>

  <!-- Hidden file input for replace -->
  <input
    id="replace-file-input"
    type="file"
    style="display: none"
    accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.xls,.xlsx,.zip"
    on:change={handleReplaceFile}
  />

  {#if isUploading}
    <div class="uploading-indicator">
      <i class="fas fa-spinner fa-spin"></i>
      <span>Uploading...</span>
    </div>
  {/if}

  {#if isReplacing}
    <div class="uploading-indicator">
      <i class="fas fa-spinner fa-spin"></i>
      <span>Replacing file...</span>
    </div>
  {/if}

  {#if filteredUploads && filteredUploads.length > 0}
    <div class="uploads-grid">
      {#each filteredUploads as upload}
        <div class="upload-card {selectedFiles.has(upload.id) ? 'selected' : ''}">
          <div class="upload-checkbox">
            <input
              type="checkbox"
              checked={selectedFiles.has(upload.id)}
              on:change={() => toggleSelect(upload.id)}
            />
          </div>
          <div class="upload-icon">
            <i class="fas {getFileIcon(upload.mime_type)}"></i>
          </div>
          <div class="upload-info">
            <h4>{upload.name}</h4>
            <p class="upload-meta">
              {formatFileSize(upload.size)} •
              {new Date(upload.created_at * 1000).toLocaleDateString()}
            </p>
          </div>
          <div class="upload-actions">
            <button class="btn-icon" on:click={() => requestReplace(upload.id)} title="Replace">
              <i class="fas fa-sync"></i>
            </button>
            {#if isPreviewable(upload.mime_type)}
              <button class="btn-icon" on:click={() => openPreview(upload)} title="Preview">
                <i class="fas fa-eye"></i>
              </button>
            {/if}
            <button class="btn-icon btn-danger" on:click={() => requestDelete(upload.id)} title="Delete">
              <i class="fas fa-trash"></i>
            </button>
          </div>
        </div>
      {/each}
    </div>
  {:else}
    <div class="empty-state">
      <i class="fas fa-upload"></i>
      {#if searchQuery}
        <h3>No files found</h3>
        <p>No uploads match your search: "{searchQuery}"</p>
      {:else}
        <h3>No uploads yet</h3>
        <p>Upload your first file to get started</p>
      {/if}
    </div>
  {/if}

  <!-- Preview Modal -->
  {#if showPreview && previewItem}
    <div class="preview-overlay" on:click={closePreview}>
      <div class="preview-modal" on:click|stopPropagation>
        <div class="preview-header">
          <h3>{previewItem.name}</h3>
          <button class="btn-close" on:click={closePreview}>
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="preview-content">
          {#if previewItem.mime_type.startsWith('image/')}
            <img src={getPreviewUrl(previewItem)} alt={previewItem.name} />
          {:else if previewItem.mime_type.startsWith('video/')}
            <video controls autoplay>
              <source src={getPreviewUrl(previewItem)} type={previewItem.mime_type} />
              Your browser does not support video playback.
            </video>
          {:else if previewItem.mime_type.startsWith('audio/')}
            <audio controls autoplay>
              <source src={getPreviewUrl(previewItem)} type={previewItem.mime_type} />
              Your browser does not support audio playback.
            </audio>
          {:else if previewItem.mime_type === 'application/pdf'}
            <iframe src={getPreviewUrl(previewItem)} width="100%" height="600px"></iframe>
          {/if}
        </div>
        <div class="preview-footer">
          <p class="preview-meta">
            <span>{formatFileSize(previewItem.size)}</span>
            <span>{previewItem.mime_type}</span>
          </p>
        </div>
      </div>
    </div>
  {/if}

  <ConfirmModal
    isOpen={showDeleteConfirm}
    title="Delete File"
    message="Are you sure you want to delete this file? This action cannot be undone."
    confirmText="Delete"
    cancelText="Cancel"
    isDestructive={true}
    onConfirm={confirmDelete}
    onCancel={cancelDelete}
  />

  <ConfirmModal
    isOpen={showBulkDeleteConfirm}
    title="Delete Selected Files"
    message="Are you sure you want to delete {selectedFiles.size} selected file(s)? This action cannot be undone."
    confirmText="Delete All"
    cancelText="Cancel"
    isDestructive={true}
    onConfirm={confirmBulkDelete}
    onCancel={cancelBulkDelete}
  />
</div>

<style>
  .uploads-section {
    padding: 40px;
  }

  .section-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 24px;
    flex-wrap: wrap;
    gap: 16px;
  }

  .section-header h2 {
    font-size: 24px;
    color: var(--text-primary);
    display: flex;
    align-items: center;
    gap: 12px;
    margin: 0;
  }

  .section-header h2 i {
    color: var(--color-primary);
  }

  .header-actions {
    display: flex;
    gap: 10px;
    align-items: center;
    flex-wrap: wrap;
  }

  .search-input {
    padding: 8px 12px;
    border: 1px solid var(--border-light);
    border-radius: var(--radius-md);
    min-width: 200px;
    background: var(--bg-primary);
    color: var(--text-primary);
  }

  .bulk-actions {
    display: flex;
    gap: 8px;
    align-items: center;
    padding: 8px 12px;
    background: rgba(239, 68, 68, 0.1);
    border-radius: var(--radius-md);
    border: 1px solid var(--color-danger);
  }

  .selected-count {
    font-size: 13px;
    font-weight: 600;
    color: var(--color-danger);
  }

  .btn-secondary {
    padding: 8px 16px;
    border: 1px solid var(--border-light);
    border-radius: var(--radius-md);
    background: var(--bg-secondary);
    color: var(--text-primary);
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    gap: 8px;
    transition: all 0.2s;
    font-size: 14px;
  }

  .btn-secondary:hover {
    background: var(--bg-tertiary);
    border-color: var(--color-primary);
  }

  .btn-danger {
    padding: 8px 16px;
    border: 1px solid var(--color-danger);
    border-radius: var(--radius-md);
    background: var(--color-danger);
    color: white;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    gap: 8px;
    transition: all 0.2s;
    font-size: 14px;
  }

  .btn-danger:hover {
    background: var(--color-danger-dark);
  }

  .uploading-indicator {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 16px;
    background: #eff6ff;
    border-radius: 8px;
    color: #2563eb;
    margin-bottom: 20px;
  }

  .uploads-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 16px;
  }

  .upload-card {
    background: var(--bg-card);
    border-radius: 8px;
    padding: 16px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    display: flex;
    align-items: center;
    gap: 12px;
    transition: all 0.2s;
    border: 2px solid transparent;
  }

  .upload-card:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    transform: translateY(-2px);
  }

  .upload-card.selected {
    border-color: var(--color-primary);
    background: rgba(37, 99, 235, 0.05);
  }

  .upload-checkbox {
    flex-shrink: 0;
  }

  .upload-checkbox input[type="checkbox"] {
    width: 18px;
    height: 18px;
    cursor: pointer;
    accent-color: var(--color-primary);
  }

  .upload-icon {
    width: 48px;
    height: 48px;
    background: #f1f5f9;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  .upload-icon i {
    font-size: 24px;
    color: #2563eb;
  }

  .upload-info {
    flex: 1;
    min-width: 0;
  }

  .upload-info h4 {
    margin: 0 0 4px 0;
    font-size: 14px;
    font-weight: 600;
    color: #0f172a;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .upload-meta {
    margin: 0;
    font-size: 12px;
    color: #64748b;
  }

  .upload-actions {
    display: flex;
    gap: 8px;
    flex-shrink: 0;
  }

  .btn-icon {
    width: 32px;
    height: 32px;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s;
    color: #64748b;
    background: #f1f5f9;
    text-decoration: none;
  }

  .btn-icon:hover {
    background: #e2e8f0;
  }

  .btn-icon .badge-soon {
    background: var(--bg-tertiary, #e2e8f0);
    color: var(--text-tertiary, #64748b);
  }

  .btn-icon.btn-danger {
    background: #fee2e2;
    color: #ef4444;
  }

  .btn-icon.btn-danger:hover {
    background: #ef4444;
    color: white;
  }

  .empty-state {
    text-align: center;
    padding: 60px 20px;
    background: var(--bg-card, white);
    border-radius: 8px;
  }

  .empty-state i {
    font-size: 48px;
    color: var(--text-muted, #cbd5e1);
    margin-bottom: 16px;
  }

  .empty-state h3 {
    margin: 8px 0;
    color: var(--text-primary, #0f172a);
  }

  .empty-state p {
    color: var(--text-tertiary, #64748b);
  }

  /* Preview Modal */
  .preview-overlay {
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
    animation: fadeIn 0.2s ease-out;
  }

  .preview-modal {
    background: var(--bg-card, white);
    border-radius: 12px;
    width: 90%;
    max-width: 900px;
    max-height: 90vh;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    animation: slideUp 0.3s ease-out;
  }

  .preview-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px 20px;
    border-bottom: 1px solid var(--border-light, #e2e8f0);
    background: var(--bg-secondary, #f8fafc);
  }

  .preview-header h3 {
    margin: 0;
    font-size: 18px;
    color: var(--text-primary, #0f172a);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 600px;
  }

  .btn-close {
    width: 32px;
    height: 32px;
    border: none;
    border-radius: 6px;
    background: var(--bg-tertiary, #f1f5f9);
    color: var(--text-secondary, #64748b);
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

  .preview-content {
    flex: 1;
    padding: 20px;
    overflow: auto;
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 400px;
    max-height: 70vh;
    background: var(--bg-card, white);
  }

  .preview-content img {
    max-width: 100%;
    max-height: 600px;
    object-fit: contain;
    border-radius: 8px;
  }

  .preview-content video {
    max-width: 100%;
    max-height: 600px;
    border-radius: 8px;
  }

  .preview-content audio {
    width: 100%;
    max-width: 500px;
  }

  .preview-content iframe {
    border: none;
    border-radius: 8px;
    width: 100%;
    height: 600px;
  }

  .preview-footer {
    padding: 16px 20px;
    border-top: 1px solid var(--border-light, #e2e8f0);
    background: var(--bg-secondary, #f8fafc);
  }

  .preview-meta {
    margin: 0;
    display: flex;
    gap: 16px;
    font-size: 13px;
    color: var(--text-tertiary, #64748b);
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
