<script>
  export let data = {};
  export let onUpdate = () => {};
  export let onRemove = () => {};
  export let onMove = () => {};
  export let onDuplicate = () => {};
  export let index = 0;
  let currentSlide = 0;

  function updateField(field, value) {
    onUpdate(index, field, value);
  }

  function addImage() {
    const newImage = {
      id: Date.now().toString(),
      url: '',
      caption: '',
      link: ''
    };
    const images = data.images || [];
    onUpdate(index, 'images', [...images, newImage]);
  }

  function removeImage(imgIndex) {
    const images = (data.images || []).filter((_, i) => i !== imgIndex);
    onUpdate(index, 'images', images);
    if (currentSlide >= images.length) {
      currentSlide = Math.max(0, images.length - 1);
    }
  }

  function updateImage(imgIndex, field, value) {
    const images = [...(data.images || [])];
    images[imgIndex] = { ...images[imgIndex], [field]: value };
    onUpdate(index, 'images', images);
  }

  function nextSlide() {
    if (data.images && currentSlide < data.images.length - 1) {
      currentSlide++;
    }
  }

  function prevSlide() {
    if (currentSlide > 0) {
      currentSlide--;
    }
  }
</script>

<div class="component-container">
  <div class="component-header">
    <h4><i class="fas fa-film"></i> Image Slideshow</h4>
    <div class="component-actions">
      <button class="btn-icon btn-xs" on:click={() => onMove(index, -1)}><i class="fas fa-arrow-up"></i></button>
      <button class="btn-icon btn-xs" on:click={() => onMove(index, 1)}><i class="fas fa-arrow-down"></i></button>
      <button class="btn-icon btn-xs" on:click={() => onDuplicate(index)}><i class="fas fa-copy"></i></button>
      <button class="btn-icon btn-xs btn-danger" on:click={onRemove}><i class="fas fa-trash"></i></button>
    </div>
  </div>

  <div class="component-body">
    <div class="images-list">
      {#each data.images || [] as image, imgIndex (image.id)}
        <div class="image-item" class:active={imgIndex === currentSlide}>
          <div class="image-number">{imgIndex + 1}</div>
          <div class="image-settings">
            <input
              type="text"
              class="field-input"
              value={image.url}
              on:input={(e) => updateImage(imgIndex, 'url', e.target.value)}
              placeholder="Image URL"
            />
            <input
              type="text"
              class="field-input"
              value={image.caption}
              on:input={(e) => updateImage(imgIndex, 'caption', e.target.value)}
              placeholder="Caption"
            />
            <input
              type="text"
              class="field-input"
              value={image.link}
              on:input={(e) => updateImage(imgIndex, 'link', e.target.value)}
              placeholder="Link URL (optional)"
            />
            <button class="btn-icon btn-xs btn-danger" on:click={() => removeImage(imgIndex)}>
              <i class="fas fa-trash"></i>
            </button>
          </div>
        </div>
      {/each}
    </div>

    <button class="btn btn-secondary btn-sm" on:click={addImage}>
      <i class="fas fa-plus"></i>
      Add Image
    </button>

    <div class="preview-section">
      <h5>Preview</h5>
      {#if data.images && data.images.length > 0}
        <div class="slideshow-preview">
          {#if data.images[currentSlide]}
            <div class="slide-image-container">
              <img 
                src={data.images[currentSlide].url || 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Crect fill="%23ddd" width="400" height="300"/%3E%3Ctext fill="%23999" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3ENo Image%3C/text%3E%3C/svg%3E'} 
                alt={data.images[currentSlide].caption}
                class="slide-image"
              />
              {#if data.images[currentSlide].caption}
                <div class="slide-caption">{data.images[currentSlide].caption}</div>
              {/if}
            </div>
            
            <div class="slideshow-controls">
              <button 
                class="btn-icon btn-sm" 
                on:click={prevSlide} 
                disabled={currentSlide === 0}
              >
                <i class="fas fa-chevron-left"></i>
              </button>
              <span class="slide-counter">{currentSlide + 1} / {data.images.length}</span>
              <button 
                class="btn-icon btn-sm" 
                on:click={nextSlide}
                disabled={currentSlide === data.images.length - 1}
              >
                <i class="fas fa-chevron-right"></i>
              </button>
            </div>
          {/if}
        </div>
      {:else}
        <p class="empty-state">No images added yet</p>
      {/if}
    </div>
  </div>
</div>

<style>
  .component-container {
    background: var(--bg-card);
    border: 1px solid var(--border-light);
    border-radius: var(--radius-lg);
    padding: 16px;
    margin-bottom: 16px;
  }

  .component-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
    padding-bottom: 12px;
    border-bottom: 1px solid var(--border-light);
  }

  .component-header h4 {
    display: flex;
    align-items: center;
    gap: 8px;
    margin: 0;
    font-size: var(--text-base);
  }

  .component-header h4 i {
    color: var(--color-primary);
  }

  .component-actions {
    display: flex;
    gap: 4px;
  }

  .component-body {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .images-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
    max-height: 400px;
    overflow-y: auto;
  }

  .image-item {
    background: var(--bg-secondary);
    border-radius: var(--radius-md);
    padding: 12px;
    display: flex;
    gap: 12px;
    align-items: flex-start;
    border: 2px solid transparent;
    transition: border-color var(--transition-fast);
  }

  .image-item.active {
    border-color: var(--color-primary);
  }

  .image-number {
    background: var(--bg-tertiary);
    color: var(--text-secondary);
    width: 32px;
    height: 32px;
    border-radius: var(--radius-full);
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 600;
    font-size: var(--text-sm);
    flex-shrink: 0;
  }

  .image-settings {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .field-input {
    padding: 6px 10px;
    border: 1px solid var(--border-light);
    border-radius: var(--radius-md);
    font-size: var(--text-sm);
  }

  .preview-section {
    background: var(--bg-tertiary);
    border-radius: var(--radius-md);
    padding: 16px;
  }

  .preview-section h5 {
    margin: 0 0 12px;
    font-size: var(--text-sm);
    color: var(--text-secondary);
  }

  .slideshow-preview {
    background: var(--bg-primary);
    border-radius: var(--radius-md);
    overflow: hidden;
  }

  .slide-image-container {
    position: relative;
  }

  .slide-image {
    width: 100%;
    height: 300px;
    object-fit: cover;
    display: block;
  }

  .slide-caption {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    background: rgba(0, 0, 0, 0.7);
    color: white;
    padding: 12px 16px;
    font-size: var(--text-sm);
  }

  .slideshow-controls {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 16px;
    padding: 12px;
    background: var(--bg-secondary);
  }

  .slide-counter {
    font-size: var(--text-sm);
    font-weight: 600;
    color: var(--text-secondary);
    min-width: 60px;
    text-align: center;
  }

  .btn-icon.btn-sm {
    width: 32px;
    height: 32px;
    font-size: 14px;
  }

  .btn-icon:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .empty-state {
    text-align: center;
    color: var(--text-tertiary);
    padding: 40px 20px;
  }

  .btn {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 6px 12px;
    border: none;
    border-radius: var(--radius-md);
    font-size: var(--text-sm);
    font-weight: 600;
    cursor: pointer;
  }

  .btn-sm {
    padding: 5px 10px;
    font-size: 13px;
  }

  .btn-secondary {
    background: var(--bg-tertiary);
    color: var(--text-secondary);
  }

  .btn-secondary:hover {
    background: var(--border-medium);
  }

  .btn-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    border: none;
    background: var(--bg-tertiary);
    border-radius: var(--radius-md);
    cursor: pointer;
    color: var(--text-secondary);
  }

  .btn-icon.btn-xs {
    width: 24px;
    height: 24px;
    font-size: 12px;
  }

  .btn-icon.btn-danger:hover {
    background: #ef4444;
    color: white;
  }
</style>
