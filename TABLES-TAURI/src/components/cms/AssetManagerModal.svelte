<script>
  import { createEventDispatcher, onMount } from 'svelte';
  import { cmsData, loadUploads } from '../../stores/cmsData.js';
  
  const dispatch = createEventDispatcher();
  
  export let open = false;
  export let targetType = 'image';
  
  let cmsDataValue;
  const unsubscribe = cmsData.subscribe(value => cmsDataValue = value);
  let searchQuery = '';
  
  onMount(() => {
    if (open) {
      loadUploads();
    }
  });
  
  function handleClose() {
    dispatch('close');
  }
  
  function handleSelect(asset) {
    dispatch('select', asset);
  }
  
  $: filteredUploads = (cmsDataValue?.uploads || []).filter(upload => {
    if (!searchQuery) return true;
    return upload.name.toLowerCase().includes(searchQuery.toLowerCase());
  });
  
  $: images = filteredUploads.filter(upload => 
    upload.mime_type?.startsWith('image/')
  );
</script>

{#if open}
  <div class="modal-overlay" on:click={handleClose}></div>
  <div class="asset-modal">
    <div class="modal-header">
      <h3><i class="fas fa-images"></i> Select Image</h3>
      <button class="btn-close" on:click={handleClose}>
        <i class="fas fa-times"></i>
      </button>
    </div>
    
    <div class="modal-body">
      <div class="search-bar">
        <i class="fas fa-search"></i>
        <input
          type="text"
          placeholder="Search assets..."
          bind:value={searchQuery}
        />
      </div>
      
      {#if images.length > 0}
        <div class="assets-grid">
          {#each images as image}
            <div class="asset-card" on:click={() => handleSelect(image)}>
              <div class="asset-preview">
                <img src={image.url} alt={image.name} loading="lazy" />
              </div>
              <div class="asset-info">
                <p class="asset-name">{image.name}</p>
                <p class="asset-meta">{Math.round(image.size / 1024)} KB</p>
              </div>
            </div>
          {/each}
        </div>
      {:else}
        <div class="empty-state">
          <i class="fas fa-image"></i>
          <p>No images found</p>
          <small>Upload some images first</small>
        </div>
      {/if}
    </div>
    
    <div class="modal-footer">
      <button class="btn-secondary" on:click={handleClose}>Cancel</button>
    </div>
  </div>
{/if}

<style>
  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    z-index: 999;
    animation: fadeIn 0.2s ease;
  }
  
  .asset-modal {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: var(--bg-card, white);
    border-radius: 12px;
    width: 90%;
    max-width: 800px;
    max-height: 80vh;
    z-index: 1000;
    display: flex;
    flex-direction: column;
    animation: slideIn 0.3s ease;
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
  }
  
  .modal-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 20px;
    border-bottom: 1px solid #e2e8f0;
  }
  
  .modal-header h3 {
    margin: 0;
    font-size: 18px;
    color: #0f172a;
    display: flex;
    align-items: center;
    gap: 10px;
  }
  
  .modal-header h3 i {
    color: #2563eb;
  }
  
  .btn-close {
    width: 32px;
    height: 32px;
    border: none;
    background: var(--bg-tertiary, #f1f5f9);
    border-radius: 6px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #64748b;
    transition: background 0.2s;
  }
  
  .btn-close:hover {
    background: #e2e8f0;
  }
  
  .modal-body {
    flex: 1;
    overflow-y: auto;
    padding: 20px;
  }
  
  .search-bar {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 14px;
    background: var(--bg-secondary, #f8fafc);
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    margin-bottom: 20px;
  }
  
  .search-bar i {
    color: #94a3b8;
  }
  
  .search-bar input {
    border: none;
    background: transparent;
    flex: 1;
    font-size: 14px;
    outline: none;
  }
  
  .assets-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 16px;
  }
  
  .asset-card {
    background: var(--bg-card, white);
    border: 2px solid #e2e8f0;
    border-radius: 8px;
    overflow: hidden;
    cursor: pointer;
    transition: all 0.2s;
  }
  
  .asset-card:hover {
    border-color: #2563eb;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
  
  .asset-preview {
    aspect-ratio: 1;
    overflow: hidden;
    background: var(--bg-secondary, #f8fafc);
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .asset-preview img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  
  .asset-info {
    padding: 12px;
  }
  
  .asset-name {
    margin: 0;
    font-size: 13px;
    font-weight: 600;
    color: #0f172a;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  
  .asset-meta {
    margin: 4px 0 0 0;
    font-size: 12px;
    color: #64748b;
  }
  
  .empty-state {
    text-align: center;
    padding: 60px 20px;
    color: #64748b;
  }
  
  .empty-state i {
    font-size: 48px;
    color: #cbd5e1;
    margin-bottom: 16px;
  }
  
  .empty-state p {
    margin: 8px 0;
  }
  
  .empty-state small {
    color: #94a3b8;
  }
  
  .modal-footer {
    padding: 16px 20px;
    border-top: 1px solid #e2e8f0;
    display: flex;
    justify-content: flex-end;
    gap: 10px;
  }
  
  .btn-secondary {
    padding: 10px 20px;
    border: 1px solid #e2e8f0;
    background: var(--bg-card, white);
    color: #475569;
    border-radius: 6px;
    cursor: pointer;
    font-weight: 600;
    transition: background 0.2s;
  }
  
  .btn-secondary:hover {
    background: var(--bg-secondary, #f8fafc);
  }
  
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  
  @keyframes slideIn {
    from {
      transform: translate(-50%, -45%);
      opacity: 0;
    }
    to {
      transform: translate(-50%, -50%);
      opacity: 1;
    }
  }
</style>
