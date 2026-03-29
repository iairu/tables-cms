<script>
  export let data = {};
  export let onUpdate = () => {};
  export let onRemove = () => {};
  export let onMove = () => {};
  export let onDuplicate = () => {};
  export let index = 0;

  function updateField(field, value) {
    onUpdate(index, field, value);
  }

  function addSlide() {
    const newSlide = {
      id: Date.now().toString(),
      title: 'Slide Title',
      content: 'Slide content here',
      imageUrl: '',
      link: '#',
      linkText: 'Learn More'
    };
    const slides = data.slides || [];
    onUpdate(index, 'slides', [...slides, newSlide]);
  }

  function removeSlide(slideIndex) {
    const slides = (data.slides || []).filter((_, i) => i !== slideIndex);
    onUpdate(index, 'slides', slides);
  }

  function updateSlide(slideIndex, field, value) {
    const slides = [...(data.slides || [])];
    slides[slideIndex] = { ...slides[slideIndex], [field]: value };
    onUpdate(index, 'slides', slides);
  }
</script>

<div class="component-container">
  <div class="component-header">
    <h4><i class="fas fa-images"></i> Content Slides</h4>
    <div class="component-actions">
      <button class="btn-icon btn-xs" on:click={() => onMove(index, -1)}><i class="fas fa-arrow-up"></i></button>
      <button class="btn-icon btn-xs" on:click={() => onMove(index, 1)}><i class="fas fa-arrow-down"></i></button>
      <button class="btn-icon btn-xs" on:click={() => onDuplicate(index)}><i class="fas fa-copy"></i></button>
      <button class="btn-icon btn-xs btn-danger" on:click={onRemove}><i class="fas fa-trash"></i></button>
    </div>
  </div>

  <div class="component-body">
    <div class="slides-list">
      {#each data.slides || [] as slide, slideIndex (slide.id)}
        <div class="slide-item">
          <div class="slide-settings">
            <input
              type="text"
              class="field-input"
              value={slide.title}
              on:input={(e) => updateSlide(slideIndex, 'title', e.target.value)}
              placeholder="Slide title"
            />
            <textarea
              class="field-input"
              value={slide.content}
              on:input={(e) => updateSlide(slideIndex, 'content', e.target.value)}
              placeholder="Slide content"
              rows="2"
            ></textarea>
            <input
              type="text"
              class="field-input"
              value={slide.imageUrl}
              on:input={(e) => updateSlide(slideIndex, 'imageUrl', e.target.value)}
              placeholder="Image URL"
            />
            <input
              type="text"
              class="field-input"
              value={slide.link}
              on:input={(e) => updateSlide(slideIndex, 'link', e.target.value)}
              placeholder="Link URL"
            />
            <input
              type="text"
              class="field-input"
              value={slide.linkText}
              on:input={(e) => updateSlide(slideIndex, 'linkText', e.target.value)}
              placeholder="Link text"
            />
            <button class="btn-icon btn-xs btn-danger" on:click={() => removeSlide(slideIndex)}>
              <i class="fas fa-trash"></i>
            </button>
          </div>
        </div>
      {/each}
    </div>

    <button class="btn btn-secondary btn-sm" on:click={addSlide}>
      <i class="fas fa-plus"></i>
      Add Slide
    </button>

    <div class="preview-section">
      <h5>Preview</h5>
      {#if data.slides && data.slides.length > 0}
        <div class="slide-preview">
          {#if data.slides[0]}
            {#if data.slides[0].imageUrl}
              <img src={data.slides[0].imageUrl} alt={data.slides[0].title} class="slide-image" />
            {/if}
            <div class="slide-content">
              <h6>{data.slides[0].title}</h6>
              <p>{data.slides[0].content}</p>
              {#if data.slides[0].link}
                <a href={data.slides[0].link}>{data.slides[0].linkText}</a>
              {/if}
            </div>
          {/if}
        </div>
      {:else}
        <p class="empty-state">No slides added yet</p>
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

  .slides-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .slide-item {
    background: var(--bg-secondary);
    border-radius: var(--radius-md);
    padding: 12px;
  }

  .slide-settings {
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

  textarea.field-input {
    resize: vertical;
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

  .slide-preview {
    background: var(--bg-primary);
    border: 1px solid var(--border-light);
    border-radius: var(--radius-md);
    overflow: hidden;
  }

  .slide-image {
    width: 100%;
    height: 200px;
    object-fit: cover;
  }

  .slide-content {
    padding: 16px;
  }

  .slide-content h6 {
    margin: 0 0 8px;
    font-size: var(--text-lg);
  }

  .slide-content p {
    color: var(--text-secondary);
    margin: 0 0 12px;
  }

  .slide-content a {
    color: var(--color-primary);
    font-weight: 600;
  }

  .empty-state {
    text-align: center;
    color: var(--text-tertiary);
    padding: 20px;
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
    width: 28px;
    height: 28px;
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
