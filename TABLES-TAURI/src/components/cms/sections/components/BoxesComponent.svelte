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

  function addBox() {
    const newBox = {
      id: Date.now().toString(),
      icon: 'fa-star',
      title: 'Feature Box',
      description: 'Description text here',
      link: '#',
      linkText: 'Learn More'
    };
    const boxes = data.boxes || [];
    onUpdate(index, 'boxes', [...boxes, newBox]);
  }

  function removeBox(boxIndex) {
    const boxes = (data.boxes || []).filter((_, i) => i !== boxIndex);
    onUpdate(index, 'boxes', boxes);
  }

  function updateBox(boxIndex, field, value) {
    const boxes = [...(data.boxes || [])];
    boxes[boxIndex] = { ...boxes[boxIndex], [field]: value };
    onUpdate(index, 'boxes', boxes);
  }
</script>

<div class="component-container">
  <div class="component-header">
    <h4><i class="fas fa-th-large"></i> Feature Boxes</h4>
    <div class="component-actions">
      <button class="btn-icon btn-xs" on:click={() => onMove(index, -1)}><i class="fas fa-arrow-up"></i></button>
      <button class="btn-icon btn-xs" on:click={() => onMove(index, 1)}><i class="fas fa-arrow-down"></i></button>
      <button class="btn-icon btn-xs" on:click={() => onDuplicate(index)}><i class="fas fa-copy"></i></button>
      <button class="btn-icon btn-xs btn-danger" on:click={onRemove}><i class="fas fa-trash"></i></button>
    </div>
  </div>

  <div class="component-body">
    <div class="boxes-list">
      {#each data.boxes || [] as box, boxIndex (box.id)}
        <div class="box-item">
          <div class="box-settings">
            <input
              type="text"
              class="field-input"
              value={box.icon}
              on:input={(e) => updateBox(boxIndex, 'icon', e.target.value)}
              placeholder="FontAwesome icon class"
            />
            <input
              type="text"
              class="field-input"
              value={box.title}
              on:input={(e) => updateBox(boxIndex, 'title', e.target.value)}
              placeholder="Box title"
            />
            <textarea
              class="field-input"
              value={box.description}
              on:input={(e) => updateBox(boxIndex, 'description', e.target.value)}
              placeholder="Description"
              rows="2"
            ></textarea>
            <input
              type="text"
              class="field-input"
              value={box.link}
              on:input={(e) => updateBox(boxIndex, 'link', e.target.value)}
              placeholder="Link URL"
            />
            <input
              type="text"
              class="field-input"
              value={box.linkText}
              on:input={(e) => updateBox(boxIndex, 'linkText', e.target.value)}
              placeholder="Link text"
            />
            <button class="btn-icon btn-xs btn-danger" on:click={() => removeBox(boxIndex)}>
              <i class="fas fa-trash"></i>
            </button>
          </div>
        </div>
      {/each}
    </div>

    <button class="btn btn-secondary btn-sm" on:click={addBox}>
      <i class="fas fa-plus"></i>
      Add Box
    </button>

    <div class="preview-section">
      <h5>Preview</h5>
      <div class="boxes-preview">
        {#each data.boxes || [] as box (box.id)}
          <div class="box-preview">
            <i class="fas {box.icon}"></i>
            <h6>{box.title}</h6>
            <p>{box.description}</p>
            {#if box.link}
              <a href={box.link}>{box.linkText}</a>
            {/if}
          </div>
        {/each}
      </div>
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

  .boxes-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .box-item {
    background: var(--bg-secondary);
    border-radius: var(--radius-md);
    padding: 12px;
  }

  .box-settings {
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
    min-height: 60px;
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

  .boxes-preview {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 16px;
  }

  .box-preview {
    background: var(--bg-primary);
    border: 1px solid var(--border-light);
    border-radius: var(--radius-md);
    padding: 16px;
    text-align: center;
  }

  .box-preview i {
    font-size: 32px;
    color: var(--color-primary);
    margin-bottom: 12px;
  }

  .box-preview h6 {
    margin: 0 0 8px;
    font-size: var(--text-base);
  }

  .box-preview p {
    font-size: var(--text-sm);
    color: var(--text-secondary);
    margin: 0 0 12px;
  }

  .box-preview a {
    color: var(--color-primary);
    font-size: var(--text-sm);
    font-weight: 600;
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
