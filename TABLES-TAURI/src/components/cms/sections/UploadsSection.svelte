<script>
  import { cmsData, uploadFile, deleteUpload, loadUploads } from '../../../stores/cmsData.js';
  import { onMount } from 'svelte';
  import ConfirmModal from '../../ConfirmModal.svelte';

  let cmsDataValue;
  const unsubscribe = cmsData.subscribe(value => cmsDataValue = value);
  let isUploading = false;
  let showDeleteConfirm = false;
  let deleteItemId = null;
  let showPreview = false;
  let previewItem = null;

  onMount(() => {
    loadUploads();
  });

  async function handleFileUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    isUploading = true;
    await uploadFile(file);
    isUploading = false;
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
    if (upload.data && upload.data.startsWith('data:')) {
      return upload.data;
    }
    // Fallback to path-based URL for Tauri
    return `file://${upload.path}`;
  }
</script>

<div class="uploads-section">
  <div class="section-header">
    <h2><i class="fas fa-upload"></i> Uploads</h2>
    <label class="btn-primary">
      <i class="fas fa-plus"></i> Upload File
      <input
        type="file"
        style="display: none"
        accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.xls,.xlsx,.zip"
        on:change={handleFileUpload}
      />
    </label>
  </div>

  {#if isUploading}
    <div class="uploading-indicator">
      <i class="fas fa-spinner fa-spin"></i>
      <span>Uploading...</span>
    </div>
  {/if}

  {#if cmsDataValue?.uploads && cmsDataValue.uploads.length > 0}
    <div class="uploads-grid">
      {#each cmsDataValue.uploads as upload}
        <div class="upload-card">
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
            {#if isPreviewable(upload.mime_type)}
              <button class="btn-icon" on:click={() => openPreview(upload)} title="Preview">
                <i class="fas fa-eye"></i>
              </button>
            {/if}
            <a href={upload.path} target="_blank" class="btn-icon" title="Open in Browser">
              <i class="fas fa-external-link-alt"></i>
            </a>
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
      <h3>No uploads yet</h3>
      <p>Upload your first file to get started</p>
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
  }

  .section-header h2 {
    font-size: 24px;
    color: #0f172a;
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .section-header h2 i {
    color: #2563eb;
  }

  .btn-primary {
    padding: 10px 16px;
    border: none;
    background: #2563eb;
    color: white;
    border-radius: 6px;
    cursor: pointer;
    font-weight: 600;
    display: inline-flex;
    align-items: center;
    gap: 8px;
    transition: background 0.2s;
  }

  .btn-primary:hover {
    background: #1d4ed8;
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
    background: white;
    border-radius: 8px;
    padding: 16px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    display: flex;
    align-items: center;
    gap: 12px;
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
    background: white;
    border-radius: 8px;
  }

  .empty-state i {
    font-size: 48px;
    color: #cbd5e1;
    margin-bottom: 16px;
  }

  .empty-state h3 {
    margin: 8px 0;
    color: #0f172a;
  }

  .empty-state p {
    color: #64748b;
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
    background: white;
    border-radius: 12px;
    max-width: 90vw;
    max-height: 90vh;
    width: 800px;
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
    border-bottom: 1px solid #e2e8f0;
  }

  .preview-header h3 {
    margin: 0;
    font-size: 18px;
    color: #0f172a;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 600px;
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
    color: #64748b;
    flex-shrink: 0;
  }

  .btn-close:hover {
    background: #e2e8f0;
  }

  .preview-content {
    flex: 1;
    padding: 20px;
    overflow: auto;
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 400px;
    background: #f8fafc;
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
  }

  .preview-footer {
    padding: 16px 20px;
    border-top: 1px solid #e2e8f0;
    background: white;
  }

  .preview-meta {
    margin: 0;
    display: flex;
    gap: 16px;
    font-size: 13px;
    color: #64748b;
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
