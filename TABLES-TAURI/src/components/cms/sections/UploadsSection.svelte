<script>
  import { cmsData, uploadFile, deleteUpload, loadUploads } from '../../../stores/cmsData.js';
  import { onMount } from 'svelte';
  
  let cmsDataValue;
  const unsubscribe = cmsData.subscribe(value => cmsDataValue = value);
  let isUploading = false;
  
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
  
  async function handleDelete(id) {
    if (confirm('Are you sure you want to delete this file?')) {
      await deleteUpload(id);
    }
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
            <a href={upload.url} target="_blank" class="btn-icon" title="Open">
              <i class="fas fa-external-link-alt"></i>
            </a>
            <button class="btn-icon btn-danger" on:click={() => handleDelete(upload.id)} title="Delete">
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
    margin: 0;
    font-size: 14px;
    font-weight: 600;
    color: #0f172a;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  
  .upload-meta {
    margin: 4px 0 0 0;
    font-size: 12px;
    color: #64748b;
  }
  
  .upload-actions {
    display: flex;
    gap: 8px;
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
</style>
