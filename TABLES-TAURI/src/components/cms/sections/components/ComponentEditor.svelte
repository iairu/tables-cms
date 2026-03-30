<script>
  import { createEventDispatcher } from 'svelte';
  import AssetManagerModal from '../../AssetManagerModal.svelte';
  import LockedInputWrapper from '../../LockedInputWrapper.svelte';

  const dispatch = createEventDispatcher();

  export let rows = [];
  export let currentLanguage = 'en';
  export let cmsDataValue = null;

  let assetModalOpen = false;
  let assetModalTarget = null;
  // Fallback icon picker behavior to simple text prompt or manual input if needed
  // In Svelte version, we'll just show text inputs for icons or maybe a basic prompt

  const CSS_BLEND_MODES = [
    'normal', 'multiply', 'screen', 'overlay', 'darken', 'lighten', 'color-dodge', 'color-burn',
    'hard-light', 'soft-light', 'difference', 'exclusion', 'hue', 'saturation', 'color', 'luminosity'
  ];

  function getDefaultFieldsForComponent(type) {
    if (type === 'TitleSlide') {
      return { heading: '', alignment: 'center', headingSize: 'normal', text: '', buttons: [], darkTheme: false, backgroundColor: '#ffffff', minimalHeight: 400, scaleImageToWholeBackground: false, backgroundImage: '', mobileBackgroundImage: '', backgroundTexture: '', videoTransparency: 100, videoLink: '', blendMode: 'normal', hideOverflow: false };
    }
    if (type === 'Boxes') {
      return { boxes: [], darkTheme: false, backgroundImage: '', blendMode: 'normal', hideOverflow: false };
    }
    if (type === 'Infobar') {
      return { logo: '', alternativeIcon: '', text: '', darkTheme: false, buttons: [] };
    }
    if (type === 'Flies') {
      return { flies: [], blendMode: 'normal', hideOverflow: false };
    }
    if (type === 'Slide') {
      return { leftHeading: '', leftText: '', leftButtons: [], rightHeading: '', rightText: '', rightButtons: [], rightImage: '', darkTheme: false, backgroundColor: '#ffffff', minimalHeight: 400, backgroundImage: '' };
    }
    if (type === 'Video') {
      return { videoLink: '', text: '', buttons: [], darkTheme: false, backgroundColor: '#ffffff' };
    }
    if (type === 'Ranking') {
      return { items: [], darkTheme: false, backgroundColor: '#ffffff' };
    }
    if (type === 'References') {
      return { items: [], darkTheme: false, backgroundColor: '#ffffff' };
    }
    if (type === 'Reviews') {
      return { items: [], darkTheme: false, backgroundColor: '#ffffff' };
    }
    if (type === 'Slideshow') {
      return { images: [], darkTheme: false, backgroundColor: '#ffffff' };
    }
    return {};
  }

  function dispatchUpdate(newRows) {
    rows = newRows;
    dispatch('update', newRows);
  }

  function handleAddComponent() {
    dispatchUpdate([...rows, { component: 'TitleSlide', fields: getDefaultFieldsForComponent('TitleSlide') }]);
  }

  function handleRemoveComponent(index) {
    dispatchUpdate(rows.filter((_, i) => i !== index));
  }

  function handleMoveComponentUp(index) {
    if (index === 0) return;
    const newRows = [...rows];
    const [moved] = newRows.splice(index, 1);
    newRows.splice(index - 1, 0, moved);
    dispatchUpdate(newRows);
  }

  function handleMoveComponentDown(index) {
    if (index === rows.length - 1) return;
    const newRows = [...rows];
    const [moved] = newRows.splice(index, 1);
    newRows.splice(index + 1, 0, moved);
    dispatchUpdate(newRows);
  }

  function handleChangeComponentType(index, newType) {
    const newRows = [...rows];
    newRows[index] = { component: newType, fields: getDefaultFieldsForComponent(newType) };
    dispatchUpdate(newRows);
  }

  function handleFieldChange(rowIndex, fieldName, value) {
    const newRows = [...rows];
    newRows[rowIndex].fields[fieldName] = value;
    dispatchUpdate(newRows);
  }

  function handleArrayItemAdd(rowIndex, fieldName, defaultItem) {
    const newRows = [...rows];
    if (!newRows[rowIndex].fields[fieldName]) {
      newRows[rowIndex].fields[fieldName] = [];
    }
    newRows[rowIndex].fields[fieldName].push(defaultItem);
    dispatchUpdate(newRows);
  }

  function handleArrayItemRemove(rowIndex, fieldName, itemIndex) {
    const newRows = [...rows];
    newRows[rowIndex].fields[fieldName].splice(itemIndex, 1);
    dispatchUpdate(newRows);
  }

  function handleArrayItemChange(rowIndex, fieldName, itemIndex, itemFieldName, value) {
    const newRows = [...rows];
    newRows[rowIndex].fields[fieldName][itemIndex][itemFieldName] = value;
    dispatchUpdate(newRows);
  }

  function handleSelectImage(rowIndex, fieldName, itemIndex = null, itemFieldName = null) {
    assetModalTarget = { rowIndex, fieldName, itemIndex, itemFieldName };
    assetModalOpen = true;
  }

  function handleAssetSelected(assetUrl) {
    if (assetModalTarget) {
      const { rowIndex, fieldName, itemIndex, itemFieldName } = assetModalTarget;
      if (itemIndex !== null && itemFieldName !== null) {
        handleArrayItemChange(rowIndex, fieldName, itemIndex, itemFieldName, assetUrl);
      } else {
        handleFieldChange(rowIndex, fieldName, assetUrl);
      }
    }
    assetModalOpen = false;
    assetModalTarget = null;
  }
</script>

<div class="component-editor-wrapper" style="margin-top: 20px;">
  <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px;">
    <h3 style="margin: 0;">Page Components</h3>
    <span class="language-badge">
      Editing in: {currentLanguage.toUpperCase()}
    </span>
  </div>
  
  <p class="info-alert">
    ℹ️ All component content below is specific to the <strong>{currentLanguage.toUpperCase()}</strong> language.
    Switch languages using the dropdown above to edit content for other languages.
  </p>

  {#each rows as row, rowIndex (rowIndex)}
    <div class="single-component-editor">
      <div class="component-header">
        <label style="font-weight: 600;">
          <select
            value={row.component}
            on:change={(e) => handleChangeComponentType(rowIndex, e.target.value)}
            class="component-select"
          >
            <option value="TitleSlide">📝 TitleSlide</option>
            <option value="Boxes">⏹️ Boxes</option>
            <option value="Infobar">ℹ️ Infobar</option>
            <option value="Flies">🦋 Flies</option>
            <option value="Slide">📰 Slide</option>
            <option value="Video">📹 Video</option>
            <option value="Ranking">⭐ Ranking</option>
            <option value="References">💬 References</option>
            <option value="Reviews">🗣️ Reviews</option>
            <option value="Slideshow">🖼️ Slideshow</option>
          </select>
        </label>
        <div class="component-actions">
          <button
            on:click={() => handleMoveComponentUp(rowIndex)}
            disabled={rowIndex === 0}
            class="btn-icon btn-blue"
            title="Move Up"
          >
            <i class="fas fa-arrow-up"></i>
          </button>
          <button
            on:click={() => handleMoveComponentDown(rowIndex)}
            disabled={rowIndex === rows.length - 1}
            class="btn-icon btn-blue"
            title="Move Down"
          >
            <i class="fas fa-arrow-down"></i>
          </button>
          <button
            on:click={() => handleRemoveComponent(rowIndex)}
            class="btn-icon btn-red"
            title="Remove"
          >
            <i class="fas fa-trash"></i>
          </button>
        </div>
      </div>

      <!-- TitleSlide Component -->
      {#if row.component === 'TitleSlide'}
        <div class="fields-section">
          <div class="field-row">
            <label><strong>Heading:</strong></label>
            <input type="text" class="input-text" bind:value={row.fields.heading} />
          </div>

          <div class="grid-2-col">
            <div class="field-row">
              <label><strong>Alignment:</strong></label>
              <select class="input-text" bind:value={row.fields.alignment}>
                <option value="left">Left</option>
                <option value="center">Center</option>
                <option value="right">Right</option>
              </select>
            </div>
            <div class="field-row">
              <label><strong>Heading Size:</strong></label>
              <select class="input-text" bind:value={row.fields.headingSize}>
                <option value="normal">Normal</option>
                <option value="big">Big</option>
              </select>
            </div>
          </div>

          <div class="field-row">
            <label><strong>Text:</strong></label>
            <textarea class="input-textarea" bind:value={row.fields.text} rows="4"></textarea>
          </div>

          <div class="field-row">
            <label><strong>Buttons:</strong></label>
            {#each row.fields.buttons || [] as btn, btnIndex}
              <div class="nested-item">
                <div style="display: flex; gap: 8px; align-items: center;">
                  <button on:click={() => handleArrayItemRemove(rowIndex, 'buttons', btnIndex)} class="btn-sm btn-red">Remove</button>
                  <input type="text" placeholder="Title" class="input-text" bind:value={btn.title} />
                  <input type="text" placeholder="Link" class="input-text" bind:value={btn.link} />
                  <input type="text" placeholder="Icon (fa-xxx)" class="input-text" bind:value={btn.icon} />
                  <label><input type="checkbox" bind:checked={btn.openAsPopup} /> Popup</label>
                  <label><input type="checkbox" bind:checked={btn.showAsButton} /> Button Look</label>
                </div>
              </div>
            {/each}
            <button class="btn btn-outline" on:click={() => handleArrayItemAdd(rowIndex, 'buttons', { icon: '', title: '', link: '', openAsPopup: false, showAsButton: true })}>+ Add Button</button>
          </div>

          <div class="grid-2-col">
            <div class="field-row">
              <label><input type="checkbox" bind:checked={row.fields.darkTheme} /> Dark Theme</label>
            </div>
            <div class="field-row">
              <label><strong>Background Color:</strong></label>
              <input type="color" bind:value={row.fields.backgroundColor} class="input-color" />
            </div>
            <div class="field-row">
              <label><strong>Minimal Height (vh):</strong></label>
              <input type="number" class="input-text" bind:value={row.fields.minimalHeight} />
            </div>
            <div class="field-row">
              <label><input type="checkbox" bind:checked={row.fields.scaleImageToWholeBackground} /> Scale image to background</label>
            </div>
          </div>

          <div class="grid-2-col">
            <div class="field-row">
              <label><strong>Background Image:</strong></label>
              <div style="display:flex;gap:8px;">
                <input type="text" class="input-text" bind:value={row.fields.backgroundImage} />
                <button class="btn" on:click={() => handleSelectImage(rowIndex, 'backgroundImage')}>Browse</button>
              </div>
            </div>
            <div class="field-row">
              <label><strong>Mobile Background:</strong></label>
              <div style="display:flex;gap:8px;">
                <input type="text" class="input-text" bind:value={row.fields.mobileBackgroundImage} />
                <button class="btn" on:click={() => handleSelectImage(rowIndex, 'mobileBackgroundImage')}>Browse</button>
              </div>
            </div>
          </div>

          <div class="grid-2-col">
            <div class="field-row">
              <label><strong>Background Texture:</strong></label>
              <div style="display:flex;gap:8px;">
                <input type="text" class="input-text" bind:value={row.fields.backgroundTexture} />
                <button class="btn" on:click={() => handleSelectImage(rowIndex, 'backgroundTexture')}>Browse</button>
              </div>
            </div>
            <div class="field-row">
              <label><strong>Video Transparency (0-100):</strong></label>
              <input type="number" min="0" max="100" class="input-text" bind:value={row.fields.videoTransparency} />
            </div>
          </div>

          <div class="field-row">
            <label><strong>Video Link:</strong></label>
            <input type="text" class="input-text" bind:value={row.fields.videoLink} placeholder="YouTube or Video URL" />
          </div>
        </div>
      {/if}

      <!-- Boxes Component -->
      {#if row.component === 'Boxes'}
        <div class="fields-section">
          <div class="field-row">
            <label><strong>Boxes:</strong></label>
            {#each row.fields.boxes || [] as box, boxIndex}
              <div class="nested-item">
                <div style="display: flex; justify-content: space-between;">
                  <strong>Box {boxIndex + 1}</strong>
                  <button on:click={() => handleArrayItemRemove(rowIndex, 'boxes', boxIndex)} class="btn-sm btn-red">Remove</button>
                </div>
                <div class="grid-2-col">
                  <div>
                    <label>Heading:</label>
                    <input type="text" class="input-text" bind:value={box.heading} />
                  </div>
                  <div>
                    <label>Subheading:</label>
                    <input type="text" class="input-text" bind:value={box.subheading} />
                  </div>
                </div>
                <div>
                  <label>Text:</label>
                  <textarea class="input-textarea" bind:value={box.text} rows="3"></textarea>
                </div>
                <div class="grid-2-col">
                  <div>
                    <label>Lower Corner Text:</label>
                    <input type="text" class="input-text" bind:value={box.lowerCornerText} />
                  </div>
                  <div>
                    <label>Icon / Image:</label>
                    <div style="display:flex;gap:8px;">
                      <input type="text" class="input-text" bind:value={box.icon} />
                      <button class="btn btn-sm" on:click={() => handleSelectImage(rowIndex, 'boxes', boxIndex, 'icon')}>Browse</button>
                    </div>
                  </div>
                  <div>
                    <label>Horiz. Adjust:</label>
                    <input type="number" class="input-text" bind:value={box.horizontalAdjustment} />
                  </div>
                  <div>
                    <label>Vert. Adjust:</label>
                    <input type="number" class="input-text" bind:value={box.verticalAdjustment} />
                  </div>
                </div>
              </div>
            {/each}
            <button class="btn btn-outline" on:click={() => handleArrayItemAdd(rowIndex, 'boxes', { heading: '', subheading: '', text: '', lowerCornerText: '', icon: '', horizontalAdjustment: 0, verticalAdjustment: 0 })}>+ Add Box</button>
          </div>

          <div class="grid-2-col">
            <div class="field-row">
              <label><input type="checkbox" bind:checked={row.fields.darkTheme} /> Dark Theme</label>
            </div>
            <div class="field-row">
              <label>Background Image:</label>
              <div style="display:flex;gap:8px;">
                <input type="text" class="input-text" bind:value={row.fields.backgroundImage} />
                <button class="btn" on:click={() => handleSelectImage(rowIndex, 'backgroundImage')}>Browse</button>
              </div>
            </div>
          </div>
        </div>
      {/if}

      <!-- Other basic mappings that we can quickly outline -->
      {#if row.component === 'Infobar' || row.component === 'Slide' || row.component === 'Flies' || row.component === 'Video' || row.component === 'Ranking' || row.component === 'References' || row.component === 'Reviews' || row.component === 'Slideshow'}
        <div class="fields-section">
           <p class="text-muted">Fields for {row.component} (Auto-mapped for Svelte ComponentEditor)</p>
           {#each Object.keys(row.fields) as fieldKey}
             {#if typeof row.fields[fieldKey] === 'boolean'}
               <div class="field-row">
                 <label><input type="checkbox" bind:checked={row.fields[fieldKey]} /> {fieldKey}</label>
               </div>
             {:else if typeof row.fields[fieldKey] === 'number'}
               <div class="field-row">
                 <label><strong>{fieldKey}:</strong></label>
                 <input type="number" class="input-text" bind:value={row.fields[fieldKey]} />
               </div>
             {:else if Array.isArray(row.fields[fieldKey])}
               <div class="field-row">
                 <label><strong>{fieldKey} (Array data):</strong></label>
                 <!-- Fallback for simple array viewer/editor, we only hardcoded TitleSlide and Boxes fully as a proof-of-concept for the replacement, others can be raw JSON editing for now -->
                 <textarea class="input-textarea" rows="4" value={JSON.stringify(row.fields[fieldKey], null, 2)} on:change={(e) => { try { row.fields[fieldKey] = JSON.parse(e.target.value); } catch(err){} }}></textarea>
                 <small style="color:var(--text-muted)">Edit as JSON array for now.</small>
               </div>
             {:else}
               <div class="field-row">
                 <label><strong>{fieldKey}:</strong></label>
                 <div style="display:flex;gap:8px;">
                   <input type="text" class="input-text" bind:value={row.fields[fieldKey]} />
                   {#if fieldKey.toLowerCase().includes('image') || fieldKey.toLowerCase().includes('logo')}
                     <button class="btn" on:click={() => handleSelectImage(rowIndex, fieldKey)}>Browse</button>
                   {/if}
                 </div>
               </div>
             {/if}
           {/each}
        </div>
      {/if}
    </div>
  {/each}
  
  <div style="margin-top: 20px; text-align: center;">
    <button on:click={handleAddComponent} class="btn btn-primary" style="padding: 10px 20px;">
      <i class="fas fa-plus"></i> Add Component
    </button>
  </div>
</div>

<AssetManagerModal
  isOpen={assetModalOpen}
  onSelect={(url) => handleAssetSelected(url)}
  onClose={() => assetModalOpen = false}
/>

<style>
  .language-badge {
    padding: 6px 12px;
    background: var(--bg-card);
    color: var(--color-primary);
    font-size: 14px;
    font-weight: 600;
    border-radius: 4px;
    border: 1px solid var(--border-medium);
  }
  .info-alert {
    font-size: 14px;
    color: var(--text-secondary);
    margin-bottom: 15px;
    padding: 10px;
    background: var(--bg-tertiary);
    border: 1px solid var(--border-light);
    border-radius: 4px;
  }
  .single-component-editor {
    border: 1px solid var(--border-light);
    padding: 20px;
    margin-bottom: 15px;
    background: var(--bg-secondary);
    border-radius: 8px;
  }
  .component-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 15px;
  }
  .component-select {
    padding: 6px 12px;
    border: 1px solid var(--border-medium);
    color: var(--text-primary);
    background-color: var(--bg-primary);
    font-weight: bold;
    border-radius: 4px;
  }
  .component-actions button {
    margin-left: 5px;
  }
  .btn-icon {
    padding: 5px 12px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
  }
  .btn-blue {
    background: rgb(37, 99, 235);
    color: white;
  }
  .btn-red {
    background: #ef4444;
    color: white;
  }
  .btn-blue:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  .fields-section {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
  .field-row {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }
  .grid-2-col {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 15px;
  }
  .input-text, .input-textarea {
    width: 100%;
    padding: 8px;
    border: 1px solid var(--border-medium);
    border-radius: 4px;
    font-family: inherit;
    background: var(--bg-primary);
    color: var(--text-primary);
  }
  .input-color {
    width: 100px;
    height: 40px;
    padding: 2px;
    border: 1px solid var(--border-medium);
    cursor: pointer;
    background: var(--bg-primary);
  }
  .nested-item {
    background: var(--bg-card);
    padding: 12px;
    border: 1px solid var(--border-light);
    margin-bottom: 8px;
    border-radius: 4px;
  }
  .btn-outline {
    background: transparent;
    color: var(--color-primary);
    border: 1px solid var(--color-primary);
    padding: 6px 12px;
    cursor: pointer;
    border-radius: 4px;
  }
  .btn-sm {
    padding: 4px 8px;
    font-size: 12px;
    border-radius: 4px;
    border: none;
    cursor: pointer;
  }
  .btn-primary {
    background: var(--color-primary);
    color: white;
    border: none;
    border-radius: 6px;
    font-weight: 600;
    cursor: pointer;
  }
</style>
