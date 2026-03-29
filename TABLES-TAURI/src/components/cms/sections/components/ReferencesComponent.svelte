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

  function addReference() {
    const newRef = {
      id: Date.now().toString(),
      quote: 'Inspirational quote here',
      author: 'Author Name',
      source: 'Source or Book',
      position: 'Position/Title'
    };
    const references = data.references || [];
    onUpdate(index, 'references', [...references, newRef]);
  }

  function removeReference(refIndex) {
    const references = (data.references || []).filter((_, i) => i !== refIndex);
    onUpdate(index, 'references', references);
  }

  function updateReference(refIndex, field, value) {
    const references = [...(data.references || [])];
    references[refIndex] = { ...references[refIndex], [field]: value };
    onUpdate(index, 'references', references);
  }
</script>

<div class="component-container">
  <div class="component-header">
    <h4><i class="fas fa-quote-right"></i> References & Quotes</h4>
    <div class="component-actions">
      <button class="btn-icon btn-xs" on:click={() => onMove(index, -1)}><i class="fas fa-arrow-up"></i></button>
      <button class="btn-icon btn-xs" on:click={() => onMove(index, 1)}><i class="fas fa-arrow-down"></i></button>
      <button class="btn-icon btn-xs" on:click={() => onDuplicate(index)}><i class="fas fa-copy"></i></button>
      <button class="btn-icon btn-xs btn-danger" on:click={onRemove}><i class="fas fa-trash"></i></button>
    </div>
  </div>

  <div class="component-body">
    <div class="references-list">
      {#each data.references || [] as reference, refIndex (reference.id)}
        <div class="reference-item">
          <div class="reference-settings">
            <textarea
              class="field-input"
              value={reference.quote}
              on:input={(e) => updateReference(refIndex, 'quote', e.target.value)}
              placeholder="Quote or reference text"
              rows="3"
            ></textarea>
            <input
              type="text"
              class="field-input"
              value={reference.author}
              on:input={(e) => updateReference(refIndex, 'author', e.target.value)}
              placeholder="Author name"
            />
            <input
              type="text"
              class="field-input"
              value={reference.source}
              on:input={(e) => updateReference(refIndex, 'source', e.target.value)}
              placeholder="Source or book"
            />
            <input
              type="text"
              class="field-input"
              value={reference.position}
              on:input={(e) => updateReference(refIndex, 'position', e.target.value)}
              placeholder="Position/Title"
            />
            <button class="btn-icon btn-xs btn-danger" on:click={() => removeReference(refIndex)}>
              <i class="fas fa-trash"></i>
            </button>
          </div>
        </div>
      {/each}
    </div>

    <button class="btn btn-secondary btn-sm" on:click={addReference}>
      <i class="fas fa-plus"></i>
      Add Reference
    </button>

    <div class="preview-section">
      <h5>Preview</h5>
      {#if data.references && data.references.length > 0}
        {#each data.references.slice(0, 1) as reference (reference.id)}
          <div class="reference-preview">
            <blockquote>
              <i class="fas fa-quote-left"></i>
              <p>{reference.quote}</p>
              <cite>
                — {reference.author}
                {#if reference.position}, {reference.position}{/if}
                {#if reference.source}
                  <br/><small>{reference.source}</small>
                {/if}
              </cite>
            </blockquote>
          </div>
        {/each}
      {:else}
        <p class="empty-state">No references added yet</p>
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

  .references-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .reference-item {
    background: var(--bg-secondary);
    border-radius: var(--radius-md);
    padding: 12px;
  }

  .reference-settings {
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

  .reference-preview {
    background: var(--bg-primary);
    border: 1px solid var(--border-light);
    border-radius: var(--radius-md);
    padding: 20px;
  }

  .reference-preview blockquote {
    margin: 0;
    padding: 0;
    border-left: 3px solid var(--color-primary);
    background: none;
  }

  .reference-preview blockquote i {
    color: var(--color-primary);
    opacity: 0.3;
    font-size: 24px;
    margin-bottom: 8px;
    display: block;
  }

  .reference-preview blockquote p {
    font-size: var(--text-lg);
    font-style: italic;
    color: var(--text-primary);
    margin: 8px 0;
    line-height: 1.6;
  }

  .reference-preview cite {
    display: block;
    margin-top: 12px;
    font-size: var(--text-sm);
    color: var(--text-secondary);
    font-style: normal;
  }

  .reference-preview cite small {
    color: var(--text-tertiary);
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
