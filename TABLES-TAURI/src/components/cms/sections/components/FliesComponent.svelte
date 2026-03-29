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

  function addFly() {
    const newFly = {
      id: Date.now().toString(),
      text: 'New Fly',
      speed: 2,
      size: 20,
      color: '#000000'
    };
    const flies = data.flies || [];
    onUpdate(index, 'flies', [...flies, newFly]);
  }

  function removeFly(flyIndex) {
    const flies = (data.flies || []).filter((_, i) => i !== flyIndex);
    onUpdate(index, 'flies', flies);
  }

  function updateFly(flyIndex, field, value) {
    const flies = [...(data.flies || [])];
    flies[flyIndex] = { ...flies[flyIndex], [field]: value };
    onUpdate(index, 'flies', flies);
  }
</script>

<div class="component-container">
  <div class="component-header">
    <h4><i class="fas fa-wind"></i> Animated Flies</h4>
    <div class="component-actions">
      <button class="btn-icon btn-xs" on:click={() => onMove(index, -1)}><i class="fas fa-arrow-up"></i></button>
      <button class="btn-icon btn-xs" on:click={() => onMove(index, 1)}><i class="fas fa-arrow-down"></i></button>
      <button class="btn-icon btn-xs" on:click={() => onDuplicate(index)}><i class="fas fa-copy"></i></button>
      <button class="btn-icon btn-xs btn-danger" on:click={onRemove}><i class="fas fa-trash"></i></button>
    </div>
  </div>

  <div class="component-body">
    <div class="flies-list">
      {#if data.flies && data.flies.length > 0}
        {#each data.flies as fly, flyIndex (fly.id)}
          <div class="fly-item">
            <div class="fly-settings">
              <input
                type="text"
                class="field-input"
                value={fly.text}
                on:input={(e) => updateFly(flyIndex, 'text', e.target.value)}
                placeholder="Fly text"
              />
              <input
                type="number"
                class="field-input"
                value={fly.speed}
                on:input={(e) => updateFly(flyIndex, 'speed', parseInt(e.target.value))}
                placeholder="Speed"
                min="1"
                max="10"
              />
              <input
                type="number"
                class="field-input"
                value={fly.size}
                on:input={(e) => updateFly(flyIndex, 'size', parseInt(e.target.value))}
                placeholder="Size"
                min="10"
                max="100"
              />
              <input
                type="color"
                class="field-input"
                value={fly.color}
                on:input={(e) => updateFly(flyIndex, 'color', e.target.value)}
              />
              <button class="btn-icon btn-xs btn-danger" on:click={() => removeFly(flyIndex)}>
                <i class="fas fa-trash"></i>
              </button>
            </div>
          </div>
        {/each}
      {:else}
        <p class="empty-state">No flies added yet</p>
      {/if}
    </div>

    <button class="btn btn-secondary btn-sm" on:click={addFly}>
      <i class="fas fa-plus"></i>
      Add Fly
    </button>

    <div class="preview-section">
      <h5>Preview</h5>
      <div class="flies-preview">
        {#if data.flies}
          {#each data.flies as fly (fly.id)}
            <div
              class="fly-preview"
              style="font-size: {fly.size}px; color: {fly.color}; animation-duration: {10 / fly.speed}s;"
            >
              {fly.text}
            </div>
          {/each}
        {/if}
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

  .flies-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .fly-item {
    background: var(--bg-secondary);
    border-radius: var(--radius-md);
    padding: 12px;
  }

  .fly-settings {
    display: flex;
    gap: 8px;
    align-items: center;
    flex-wrap: wrap;
  }

  .field-input {
    padding: 6px 10px;
    border: 1px solid var(--border-light);
    border-radius: var(--radius-md);
    font-size: var(--text-sm);
  }

  .field-input[type="number"] {
    width: 70px;
  }

  .field-input[type="color"] {
    width: 40px;
    height: 32px;
    padding: 2px;
  }

  .empty-state {
    text-align: center;
    color: var(--text-tertiary);
    padding: 20px;
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

  .flies-preview {
    position: relative;
    height: 200px;
    background: var(--bg-primary);
    border-radius: var(--radius-md);
    overflow: hidden;
  }

  .fly-preview {
    position: absolute;
    animation: fly-around linear infinite;
    cursor: pointer;
  }

  @keyframes fly-around {
    0% {
      transform: translate(0, 0) rotate(0deg);
    }
    25% {
      transform: translate(100px, 50px) rotate(90deg);
    }
    50% {
      transform: translate(200px, 100px) rotate(180deg);
    }
    75% {
      transform: translate(100px, 150px) rotate(270deg);
    }
    100% {
      transform: translate(0, 0) rotate(360deg);
    }
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
