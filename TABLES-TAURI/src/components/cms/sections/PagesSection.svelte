<script>
  import { cmsData, savePages, saveComponentRows } from '../../../stores/cmsData.js';
  import AssetManagerModal from '../AssetManagerModal.svelte';
  import ConfirmModal from '../../ConfirmModal.svelte';

  let cmsDataValue;
  const unsubscribe = cmsData.subscribe(value => cmsDataValue = value);

  let searchQuery = '';
  let selectedPage = null;
  let isEditingPage = false;
  let editingPage = null;
  let showAssetManager = false;
  let activeComponentIndex = null;
  let activeField = null;
  let showDeleteConfirm = false;
  let deletePageId = null;
  let showComponentDropdown = false;
  let isSaving = false;
  let lastSaved = null;
  let saveError = null;
  let showGroupDropdown = false;
  
  // Available component types
  const componentTypes = [
    { id: 'hero', name: 'Hero Section', icon: 'fa-image', description: 'Large header with title, subtitle, and CTA' },
    { id: 'text', name: 'Text Block', icon: 'fa-paragraph', description: 'Rich text content area' },
    { id: 'image', name: 'Image', icon: 'fa-image', description: 'Single image with optional caption' },
    { id: 'video', name: 'Video', icon: 'fa-video', description: 'Embedded video (YouTube, Vimeo)' },
    { id: 'features', name: 'Features Grid', icon: 'fa-th-large', description: 'Grid of feature cards with icons' },
    { id: 'cta', name: 'Call to Action', icon: 'fa-bullhorn', description: 'Prominent CTA section' },
    { id: 'blog-list', name: 'Blog List', icon: 'fa-newspaper', description: 'List of recent blog articles' },
    { id: 'infobar', name: 'Info Bar', icon: 'fa-info-circle', description: 'Horizontal information bar' },
    { id: 'ranking', name: 'Ranking', icon: 'fa-trophy', description: 'Ranked list or comparison' },
    { id: 'reviews', name: 'Reviews', icon: 'fa-star', description: 'Customer testimonials' }
  ];
  
  $: filteredPages = cmsDataValue?.pages?.filter(page =>
    !searchQuery ||
    page.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    page.slug?.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];
  
  function handleNewPage() {
    const newPage = {
      id: Date.now().toString(),
      name: 'New Page',
      slug: 'new-page',
      components: [],
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
    
    savePages([...(cmsDataValue.pages || []), newPage]);
  }

  function requestDeletePage(pageId) {
    deletePageId = pageId;
    showDeleteConfirm = true;
  }

  function confirmDeletePage() {
    showDeleteConfirm = false;
    if (deletePageId) {
      savePages((cmsDataValue.pages || []).filter(p => p.id !== deletePageId));
      if (selectedPage?.id === deletePageId) {
        selectedPage = null;
      }
      deletePageId = null;
    }
  }

  function cancelDeletePage() {
    showDeleteConfirm = false;
    deletePageId = null;
  }

  // Get available page groups
  $: availableGroups = cmsDataValue?.pageGroups || [];

  // Get groups assigned to current editing page
  $: assignedGroupIds = editingPage?.groups || [];
  
  // Check if a group is assigned to the current page
  function isGroupAssigned(groupId) {
    return assignedGroupIds.includes(groupId);
  }
  
  // Toggle group assignment for current page
  function toggleGroupAssignment(groupId) {
    if (!editingPage) return;
    
    const currentGroups = editingPage.groups || [];
    let newGroups;
    
    if (currentGroups.includes(groupId)) {
      // Remove from group
      newGroups = currentGroups.filter(id => id !== groupId);
    } else {
      // Add to group
      newGroups = [...currentGroups, groupId];
    }
    
    editingPage = {
      ...editingPage,
      groups: newGroups
    };
  }
  
  // Get group names for display
  function getGroupNames(groupIds) {
    if (!groupIds || groupIds.length === 0) return 'No groups';
    return availableGroups
      .filter(g => groupIds.includes(g.id))
      .map(g => g.name)
      .join(', ');
  }

  function handleSelectPage(page) {
    selectedPage = page;
    isEditingPage = false;
  }
  
  function handleEditPage() {
    if (selectedPage) {
      editingPage = { ...selectedPage };
      isEditingPage = true;
    }
  }
  
  function handleSavePage() {
    if (!editingPage) return;
    
    isSaving = true;
    saveError = null;

    try {
      const pages = (cmsDataValue.pages || []).map(p =>
        p.id === editingPage.id ? { ...editingPage, updatedAt: Date.now() } : p
      );

      savePages(pages);
      selectedPage = { ...editingPage };
      isEditingPage = false;
      editingPage = null;
      lastSaved = new Date();
      
      // Clear saved indicator after 3 seconds
      setTimeout(() => {
        lastSaved = null;
      }, 3000);
    } catch (error) {
      saveError = 'Failed to save page';
      console.error('Save error:', error);
    } finally {
      isSaving = false;
    }
  }
  
  function handleCancelEdit() {
    isEditingPage = false;
    editingPage = null;
  }
  
  function handleAddComponent(componentType) {
    if (!editingPage) return;
    
    const newComponent = {
      id: Date.now().toString(),
      type: componentType.id,
      props: getDefaultProps(componentType.id)
    };
    
    editingPage = {
      ...editingPage,
      components: [...(editingPage.components || []), newComponent]
    };
  }
  
  function handleRemoveComponent(index) {
    if (!editingPage) return;
    
    editingPage = {
      ...editingPage,
      components: editingPage.components.filter((_, i) => i !== index)
    };
  }
  
  function handleMoveComponent(index, direction) {
    if (!editingPage) return;
    
    const components = [...editingPage.components];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    
    if (newIndex < 0 || newIndex >= components.length) return;
    
    [components[index], components[newIndex]] = [components[newIndex], components[index]];
    
    editingPage = {
      ...editingPage,
      components
    };
  }
  
  function handleDuplicateComponent(index) {
    if (!editingPage) return;
    
    const component = editingPage.components[index];
    const newComponent = {
      ...component,
      id: Date.now().toString(),
      props: { ...component.props }
    };
    
    editingPage = {
      ...editingPage,
      components: [
        ...editingPage.components.slice(0, index + 1),
        newComponent,
        ...editingPage.components.slice(index + 1)
      ]
    };
  }
  
  function handleOpenAssetManager(componentIndex, field) {
    activeComponentIndex = componentIndex;
    activeField = field;
    showAssetManager = true;
  }
  
  function handleAssetSelect(asset) {
    if (!editingPage || activeComponentIndex === null || !activeField) return;
    
    const components = [...editingPage.components];
    const component = { ...components[activeComponentIndex] };
    component.props = {
      ...component.props,
      [activeField]: asset.url || asset
    };
    
    components[activeComponentIndex] = component;
    editingPage = { ...editingPage, components };
    showAssetManager = false;
  }
  
  function getDefaultProps(type) {
    const defaults = {
      hero: { title: 'Hero Title', subtitle: 'Hero subtitle', ctaText: 'Get Started', ctaLink: '#', image: '' },
      text: { content: 'Enter your text content here...' },
      image: { src: '', alt: '', caption: '' },
      video: { url: '', title: '' },
      features: { title: 'Features', items: [{ icon: 'fas fa-star', title: 'Feature 1', description: 'Description' }] },
      cta: { title: 'Call to Action', description: 'Compelling description', buttonText: 'Click Here', link: '#' },
      'blog-list': { title: 'Latest Articles', limit: 6 },
      infobar: { items: [{ icon: 'fas fa-check', text: 'Info item' }] },
      ranking: { title: 'Rankings', items: [{ rank: 1, title: 'First', description: '' }] },
      reviews: { title: 'Reviews', items: [{ name: 'John Doe', text: 'Great service!', rating: 5 }] }
    };
    return defaults[type] || {};
  }
  
  function updateComponentProp(index, prop, value) {
    if (!editingPage) return;
    
    const components = [...editingPage.components];
    const component = { ...components[index] };
    component.props = { ...component.props, [prop]: value };
    components[index] = component;
    editingPage = { ...editingPage, components };
  }
  
  function updateFeatureItem(featureIndex, prop, value) {
    if (!editingPage) return;
    
    const components = [...editingPage.components];
    const component = { ...components[activeComponentIndex] };
    const items = [...(component.props.items || [])];
    items[featureIndex] = { ...items[featureIndex], [prop]: value };
    component.props = { ...component.props, items };
    components[activeComponentIndex] = component;
    editingPage = { ...editingPage, components };
  }
  
  function addFeatureItem() {
    if (!editingPage || activeComponentIndex === null) return;
    
    const components = [...editingPage.components];
    const component = { ...components[activeComponentIndex] };
    const items = [...(component.props.items || []), { icon: 'fas fa-star', title: 'New Feature', description: 'Description' }];
    component.props = { ...component.props, items };
    components[activeComponentIndex] = component;
    editingPage = { ...editingPage, components };
  }
  
  function removeFeatureItem(index) {
    if (!editingPage || activeComponentIndex === null) return;
    
    const components = [...editingPage.components];
    const component = { ...components[activeComponentIndex] };
    const items = (component.props.items || []).filter((_, i) => i !== index);
    component.props = { ...component.props, items };
    components[activeComponentIndex] = component;
    editingPage = { ...editingPage, components };
  }
</script>

<div class="pages-section">
  <div class="pages-layout">
    <!-- Pages List -->
    <div class="pages-list-panel {selectedPage || isEditingPage ? 'collapsed' : ''}">
      <div class="panel-header">
        <h2><i class="fas fa-file"></i> Pages</h2>
        <button class="btn-primary btn-sm" on:click={handleNewPage}>
          <i class="fas fa-plus"></i> New
        </button>
      </div>
      
      <div class="search-box">
        <i class="fas fa-search"></i>
        <input
          type="text"
          placeholder="Search pages..."
          bind:value={searchQuery}
        />
      </div>
      
      <div class="pages-list">
        {#each filteredPages as page}
          <div
            class="page-item {selectedPage?.id === page.id && !isEditingPage ? 'active' : ''}"
            on:click={() => handleSelectPage(page)}
          >
            <div class="page-item-content">
              <h3>{page.name || 'Untitled'}</h3>
              <span class="page-slug">/{page.slug || 'no-slug'}</span>
            </div>
            <button
              class="btn-icon btn-danger btn-xs"
              on:click={(e) => { e.stopPropagation(); requestDeletePage(page.id); }}
            >
              <i class="fas fa-trash"></i>
            </button>
          </div>
        {:else}
          <div class="empty-state">
            <i class="fas fa-file"></i>
            <p>No pages found</p>
          </div>
        {/each}
      </div>
    </div>
    
    <!-- Page Editor -->
    <div class="page-editor-panel">
      {#if !selectedPage && !isEditingPage}
        <div class="no-selection">
          <i class="fas fa-file"></i>
          <h3>Select a Page</h3>
          <p>Choose a page from the list or create a new one</p>
          <button class="btn-primary" on:click={handleNewPage}>
            <i class="fas fa-plus"></i> Create Page
          </button>
        </div>
      {:else if isEditingPage && editingPage}
        <div class="editor-container">
          <div class="editor-header">
            <button class="btn-back" on:click={handleCancelEdit}>
              <i class="fas fa-arrow-left"></i> Back
            </button>
            <div class="editor-title">
              <input
                type="text"
                class="page-name-input"
                bind:value={editingPage.name}
                placeholder="Page Name"
              />
              <input
                type="text"
                class="page-slug-input"
                bind:value={editingPage.slug}
                placeholder="page-slug"
              />
            </div>
            
            <div class="group-assignment">
              <div class="dropdown" class:open={showGroupDropdown}>
                <button 
                  class="btn-secondary btn-sm"
                  on:click={() => showGroupDropdown = !showGroupDropdown}
                  title="Assign to groups"
                >
                  <i class="fas fa-layer-group"></i>
                  <span>{getGroupNames(editingPage?.groups)}</span>
                  <i class="fas fa-chevron-down"></i>
                </button>
                <div class="dropdown-content dropdown-content-groups">
                  {#if availableGroups.length > 0}
                    {#each availableGroups as group}
                      <label class="group-checkbox">
                        <input
                          type="checkbox"
                          checked={isGroupAssigned(group.id)}
                          on:change={() => toggleGroupAssignment(group.id)}
                        />
                        <span>{group.name}</span>
                      </label>
                    {/each}
                  {:else}
                    <div class="no-groups">
                      <i class="fas fa-info-circle"></i>
                      <span>No groups available. Create a group first.</span>
                    </div>
                  {/if}
                </div>
              </div>
            </div>
            
            <div class="save-indicator">
              {#if lastSaved}
                <span class="save-status saved">
                  <i class="fas fa-check"></i>
                  Saved
                </span>
              {:else if saveError}
                <span class="save-status error">
                  <i class="fas fa-exclamation-circle"></i>
                  {saveError}
                </span>
              {:else if isSaving}
                <span class="save-status saving">
                  <i class="fas fa-spinner fa-spin"></i>
                </span>
              {/if}
            </div>
            <button class="btn-success" on:click={handleSavePage} disabled={isSaving}>
              <i class="fas fa-save"></i> Save
            </button>
          </div>
          
          <div class="editor-content">
            <!-- Components List -->
            <div class="components-section">
              <div class="section-header">
                <h3><i class="fas fa-th"></i> Components</h3>
                <div class="dropdown" class:open={showComponentDropdown}>
                  <button 
                    class="btn-primary" 
                    on:focus={() => showComponentDropdown = true}
                    on:blur={() => setTimeout(() => showComponentDropdown = false, 200)}
                    on:click={() => showComponentDropdown = !showComponentDropdown}
                  >
                    <i class="fas fa-plus"></i> Add Component
                  </button>
                  <div class="dropdown-content">
                    {#each componentTypes as type}
                      <button class="dropdown-item" on:click={() => { handleAddComponent(type); showComponentDropdown = false; }}>
                        <i class="fas {type.icon}"></i>
                        <span>{type.name}</span>
                      </button>
                    {/each}
                  </div>
                </div>
              </div>
              
              <div class="components-list">
                {#each editingPage.components || [] as component, index}
                  <div class="component-item">
                    <div class="component-header">
                      <span class="component-type">
                        <i class="fas {componentTypes.find(t => t.id === component.type)?.icon || 'fa-cube'}"></i>
                        {componentTypes.find(t => t.id === component.type)?.name || component.type}
                      </span>
                      <div class="component-actions">
                        <button class="btn-icon btn-xs" on:click={() => handleMoveComponent(index, 'up')} disabled={index === 0}>
                          <i class="fas fa-chevron-up"></i>
                        </button>
                        <button class="btn-icon btn-xs" on:click={() => handleMoveComponent(index, 'down')} disabled={index === (editingPage.components?.length || 1) - 1}>
                          <i class="fas fa-chevron-down"></i>
                        </button>
                        <button class="btn-icon btn-xs" on:click={() => handleDuplicateComponent(index)}>
                          <i class="fas fa-copy"></i>
                        </button>
                        <button class="btn-icon btn-danger btn-xs" on:click={() => handleRemoveComponent(index)}>
                          <i class="fas fa-trash"></i>
                        </button>
                      </div>
                    </div>
                    
                    <div class="component-props">
                      {#if component.type === 'hero'}
                        <div class="prop-row">
                          <label>Title</label>
                          <input type="text" bind:value={component.props.title} on:input={(e) => updateComponentProp(index, 'title', e.target.value)} />
                        </div>
                        <div class="prop-row">
                          <label>Subtitle</label>
                          <input type="text" bind:value={component.props.subtitle} on:input={(e) => updateComponentProp(index, 'subtitle', e.target.value)} />
                        </div>
                        <div class="prop-row">
                          <label>Image</label>
                          <div class="input-with-button">
                            <input type="text" bind:value={component.props.image} readonly placeholder="Select image..." />
                            <button class="btn-secondary btn-sm" on:click={() => handleOpenAssetManager(index, 'image')}>
                              <i class="fas fa-upload"></i>
                            </button>
                          </div>
                        </div>
                        <div class="prop-row">
                          <label>CTA Text</label>
                          <input type="text" bind:value={component.props.ctaText} on:input={(e) => updateComponentProp(index, 'ctaText', e.target.value)} />
                        </div>
                        <div class="prop-row">
                          <label>CTA Link</label>
                          <input type="text" bind:value={component.props.ctaLink} on:input={(e) => updateComponentProp(index, 'ctaLink', e.target.value)} />
                        </div>
                      {:else if component.type === 'text'}
                        <div class="prop-row full">
                          <label>Content</label>
                          <textarea bind:value={component.props.content} on:input={(e) => updateComponentProp(index, 'content', e.target.value)} rows="6"></textarea>
                        </div>
                      {:else if component.type === 'image'}
                        <div class="prop-row">
                          <label>Source</label>
                          <div class="input-with-button">
                            <input type="text" bind:value={component.props.src} readonly placeholder="Select image..." />
                            <button class="btn-secondary btn-sm" on:click={() => handleOpenAssetManager(index, 'src')}>
                              <i class="fas fa-upload"></i>
                            </button>
                          </div>
                        </div>
                        <div class="prop-row">
                          <label>Alt Text</label>
                          <input type="text" bind:value={component.props.alt} on:input={(e) => updateComponentProp(index, 'alt', e.target.value)} />
                        </div>
                        <div class="prop-row">
                          <label>Caption</label>
                          <input type="text" bind:value={component.props.caption} on:input={(e) => updateComponentProp(index, 'caption', e.target.value)} />
                        </div>
                      {:else if component.type === 'video'}
                        <div class="prop-row">
                          <label>Video URL</label>
                          <input type="text" bind:value={component.props.url} on:input={(e) => updateComponentProp(index, 'url', e.target.value)} placeholder="https://youtube.com/..." />
                        </div>
                        <div class="prop-row">
                          <label>Title</label>
                          <input type="text" bind:value={component.props.title} on:input={(e) => updateComponentProp(index, 'title', e.target.value)} />
                        </div>
                      {:else if component.type === 'features'}
                        <div class="prop-row">
                          <label>Title</label>
                          <input type="text" bind:value={component.props.title} on:input={(e) => updateComponentProp(index, 'title', e.target.value)} />
                        </div>
                        <div class="prop-row">
                          <label>Features</label>
                          <div class="feature-items">
                            {#each component.props.items || [] as item, featureIndex}
                              <div class="feature-item">
                                <input type="text" bind:value={item.title} on:input={(e) => updateFeatureItem(featureIndex, 'title', e.target.value)} placeholder="Title" />
                                <input type="text" bind:value={item.description} on:input={(e) => updateFeatureItem(featureIndex, 'description', e.target.value)} placeholder="Description" />
                                <input type="text" bind:value={item.icon} on:input={(e) => updateFeatureItem(featureIndex, 'icon', e.target.value)} placeholder="fa-icon" />
                                <button class="btn-icon btn-danger btn-xs" on:click={() => removeFeatureItem(featureIndex)}>
                                  <i class="fas fa-trash"></i>
                                </button>
                              </div>
                            {/each}
                            <button class="btn-secondary btn-sm" on:click={addFeatureItem}>
                              <i class="fas fa-plus"></i> Add Feature
                            </button>
                          </div>
                        </div>
                      {:else if component.type === 'cta'}
                        <div class="prop-row">
                          <label>Title</label>
                          <input type="text" bind:value={component.props.title} on:input={(e) => updateComponentProp(index, 'title', e.target.value)} />
                        </div>
                        <div class="prop-row">
                          <label>Description</label>
                          <textarea bind:value={component.props.description} on:input={(e) => updateComponentProp(index, 'description', e.target.value)} rows="3"></textarea>
                        </div>
                        <div class="prop-row">
                          <label>Button Text</label>
                          <input type="text" bind:value={component.props.buttonText} on:input={(e) => updateComponentProp(index, 'buttonText', e.target.value)} />
                        </div>
                        <div class="prop-row">
                          <label>Link</label>
                          <input type="text" bind:value={component.props.link} on:input={(e) => updateComponentProp(index, 'link', e.target.value)} />
                        </div>
                      {:else}
                        <div class="prop-row full">
                          <label>Component Props</label>
                          <p class="help-text">Edit component properties in JSON format</p>
                          <textarea bind:value={component.props} rows="4"></textarea>
                        </div>
                      {/if}
                    </div>
                  </div>
                {:else}
                  <div class="empty-components">
                    <i class="fas fa-th"></i>
                    <p>No components yet</p>
                    <p class="help-text">Add components to build your page</p>
                  </div>
                {/each}
              </div>
            </div>
          </div>
        </div>
      {:else if selectedPage}
        <div class="page-preview">
          <div class="preview-header">
            <div>
              <h2>{selectedPage.name || 'Untitled'}</h2>
              <p class="preview-slug">/{selectedPage.slug || 'no-slug'}</p>
            </div>
            <div class="preview-actions">
              <button class="btn-secondary" on:click={handleSelectPage}>
                <i class="fas fa-eye"></i> View
              </button>
              <button class="btn-primary" on:click={handleEditPage}>
                <i class="fas fa-edit"></i> Edit Page
              </button>
            </div>
          </div>
          
          <div class="preview-content">
            {#if selectedPage.components && selectedPage.components.length > 0}
              <div class="components-preview">
                {#each selectedPage.components as component}
                  <div class="component-preview-card">
                    <span class="component-label">
                      <i class="fas {componentTypes.find(t => t.id === component.type)?.icon || 'fa-cube'}"></i>
                      {componentTypes.find(t => t.id === component.type)?.name || component.type}
                    </span>
                  </div>
                {/each}
              </div>
            {:else}
              <div class="empty-preview">
                <i class="fas fa-file"></i>
                <p>This page has no components yet</p>
                <button class="btn-primary" on:click={handleEditPage}>
                  <i class="fas fa-edit"></i> Edit Page
                </button>
              </div>
            {/if}
          </div>
        </div>
      {/if}
    </div>
  </div>
  
  {#if showAssetManager}
    <AssetManagerModal
      onClose={() => showAssetManager = false}
      onSelect={handleAssetSelect}
    />
  {/if}
  
  <ConfirmModal
    isOpen={showDeleteConfirm}
    title="Delete Page"
    message="Are you sure you want to delete this page? This action cannot be undone."
    confirmText="Delete"
    cancelText="Cancel"
    isDestructive={true}
    onConfirm={confirmDeletePage}
    onCancel={cancelDeletePage}
  />
</div>

<style>
  .pages-section {
    height: calc(100vh - 140px);
    overflow: hidden;
  }
  
  .pages-layout {
    display: flex;
    gap: 20px;
    height: 100%;
  }
  
  .pages-list-panel {
    width: 320px;
    background: white;
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    display: flex;
    flex-direction: column;
    overflow: hidden;
    transition: width 0.3s;
  }
  
  .pages-list-panel.collapsed {
    width: 0;
    padding: 0;
    overflow: hidden;
  }
  
  .panel-header {
    padding: 20px;
    border-bottom: 1px solid #e2e8f0;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  
  .panel-header h2 {
    font-size: 18px;
    margin: 0;
    display: flex;
    align-items: center;
    gap: 8px;
  }
  
  .search-box {
    padding: 12px 20px;
    border-bottom: 1px solid #e2e8f0;
    display: flex;
    align-items: center;
    gap: 8px;
  }
  
  .search-box i {
    color: #94a3b8;
  }
  
  .search-box input {
    flex: 1;
    border: none;
    outline: none;
    font-size: 14px;
  }
  
  .pages-list {
    flex: 1;
    overflow-y: auto;
    padding: 12px;
  }
  
  .page-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 16px;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s;
    margin-bottom: 8px;
  }
  
  .page-item:hover {
    background: #f8fafc;
  }
  
  .page-item.active {
    background: #eff6ff;
    border: 1px solid #2563eb;
  }
  
  .page-item-content {
    flex: 1;
  }
  
  .page-item-content h3 {
    font-size: 14px;
    font-weight: 600;
    margin: 0 0 4px;
    color: #0f172a;
  }
  
  .page-slug {
    font-size: 12px;
    color: #64748b;
    font-family: monospace;
  }
  
  .page-editor-panel {
    flex: 1;
    background: white;
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    overflow: hidden;
  }
  
  .no-selection {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    padding: 40px;
    text-align: center;
  }
  
  .no-selection i {
    font-size: 64px;
    color: #cbd5e1;
    margin-bottom: 20px;
  }
  
  .no-selection h3 {
    font-size: 20px;
    color: #0f172a;
    margin-bottom: 8px;
  }
  
  .no-selection p {
    color: #64748b;
    margin-bottom: 24px;
  }
  
  .editor-container {
    height: 100%;
    display: flex;
    flex-direction: column;
  }
  
  .editor-header {
    padding: 20px;
    border-bottom: 1px solid #e2e8f0;
    display: flex;
    align-items: center;
    gap: 16px;
  }

  .save-indicator {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-left: auto;
  }

  .save-status {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 13px;
    font-weight: 500;
    padding: 6px 12px;
    border-radius: 6px;
  }

  .save-status.saved {
    background: #d1fae5;
    color: #065f46;
  }

  .save-status.error {
    background: #fee2e2;
    color: #991b1b;
  }

  .save-status.saving {
    color: #2563eb;
  }

  .save-status i {
    font-size: 14px;
  }

  .group-assignment {
    display: flex;
    align-items: center;
    margin: 0 8px;
  }

  .group-assignment .btn-secondary {
    display: flex;
    align-items: center;
    gap: 6px;
    max-width: 200px;
  }

  .group-assignment .btn-secondary span {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    max-width: 140px;
  }

  .dropdown-content-groups {
    min-width: 220px;
    max-height: 300px;
    overflow-y: auto;
    padding: 8px;
  }

  .group-checkbox {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 8px 12px;
    border-radius: 6px;
    cursor: pointer;
    transition: background 0.2s;
    margin-bottom: 4px;
  }

  .group-checkbox:hover {
    background: #f8fafc;
  }

  .group-checkbox input[type="checkbox"] {
    width: 16px;
    height: 16px;
    cursor: pointer;
  }

  .group-checkbox span {
    font-size: 14px;
    color: #475569;
  }

  .no-groups {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 16px;
    color: #64748b;
    font-size: 13px;
  }

  .no-groups i {
    color: #2563eb;
  }

  .editor-title {
    flex: 1;
    display: flex;
    gap: 12px;
    align-items: center;
  }
  
  .page-name-input {
    flex: 2;
    padding: 8px 12px;
    border: 1px solid #e2e8f0;
    border-radius: 6px;
    font-size: 16px;
    font-weight: 600;
  }
  
  .page-slug-input {
    flex: 1;
    padding: 8px 12px;
    border: 1px solid #e2e8f0;
    border-radius: 6px;
    font-size: 14px;
    font-family: monospace;
  }
  
  .editor-content {
    flex: 1;
    overflow-y: auto;
    padding: 20px;
  }
  
  .components-section {
    max-width: 800px;
    margin: 0 auto;
  }
  
  .section-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 20px;
  }
  
  .section-header h3 {
    font-size: 18px;
    margin: 0;
    display: flex;
    align-items: center;
    gap: 8px;
  }
  
  .dropdown {
    position: relative;
  }

  .dropdown-content {
    display: none;
    position: absolute;
    top: 100%;
    right: 0;
    background: white;
    border-radius: 8px;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
    min-width: 220px;
    z-index: 100;
    margin-top: 8px;
    overflow: hidden;
  }

  .dropdown.open .dropdown-content {
    display: block;
  }
  
  .dropdown-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 16px;
    border: none;
    background: transparent;
    width: 100%;
    text-align: left;
    cursor: pointer;
    transition: background 0.2s;
  }
  
  .dropdown-item:hover {
    background: #f8fafc;
  }
  
  .dropdown-item i {
    color: #2563eb;
    width: 20px;
  }
  
  .components-list {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }
  
  .component-item {
    background: #f8fafc;
    border-radius: 8px;
    padding: 16px;
    border: 1px solid #e2e8f0;
  }
  
  .component-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 16px;
  }
  
  .component-type {
    font-size: 14px;
    font-weight: 600;
    color: #0f172a;
    display: flex;
    align-items: center;
    gap: 8px;
  }
  
  .component-type i {
    color: #2563eb;
  }
  
  .component-actions {
    display: flex;
    gap: 4px;
  }
  
  .component-props {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
  
  .prop-row {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }
  
  .prop-row.full {
    flex-direction: column;
  }
  
  .prop-row label {
    font-size: 13px;
    font-weight: 600;
    color: #475569;
  }
  
  .prop-row input,
  .prop-row textarea {
    padding: 10px 12px;
    border: 1px solid #e2e8f0;
    border-radius: 6px;
    font-size: 14px;
  }
  
  .prop-row input:focus,
  .prop-row textarea:focus {
    outline: none;
    border-color: #2563eb;
    box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
  }
  
  .input-with-button {
    display: flex;
    gap: 8px;
  }
  
  .input-with-button input {
    flex: 1;
  }
  
  .feature-items {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  
  .feature-item {
    display: flex;
    gap: 8px;
    align-items: center;
  }
  
  .feature-item input {
    flex: 1;
  }
  
  .help-text {
    font-size: 12px;
    color: #64748b;
    font-style: italic;
  }
  
  .empty-components,
  .empty-preview {
    text-align: center;
    padding: 60px 20px;
    color: #64748b;
  }
  
  .empty-components i,
  .empty-preview i {
    font-size: 48px;
    color: #cbd5e1;
    margin-bottom: 16px;
  }
  
  .preview-header {
    padding: 20px;
    border-bottom: 1px solid #e2e8f0;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  
  .preview-header h2 {
    font-size: 20px;
    margin: 0 0 4px;
  }
  
  .preview-slug {
    color: #64748b;
    font-family: monospace;
    margin: 0;
  }
  
  .preview-actions {
    display: flex;
    gap: 8px;
  }
  
  .preview-content {
    padding: 20px;
  }
  
  .components-preview {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 12px;
  }
  
  .component-preview-card {
    background: #f8fafc;
    padding: 16px;
    border-radius: 8px;
    text-align: center;
  }
  
  .component-label {
    font-size: 13px;
    color: #64748b;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
  }
  
  .component-label i {
    color: #2563eb;
  }
  
  .btn-primary,
  .btn-secondary,
  .btn-success {
    padding: 8px 16px;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-weight: 600;
    font-size: 14px;
    display: inline-flex;
    align-items: center;
    gap: 8px;
    transition: all 0.2s;
  }
  
  .btn-primary {
    background: #2563eb;
    color: white;
  }
  
  .btn-primary:hover {
    background: #1d4ed8;
  }
  
  .btn-secondary {
    background: white;
    color: #475569;
    border: 1px solid #e2e8f0;
  }
  
  .btn-secondary:hover {
    background: #f8fafc;
  }
  
  .btn-success {
    background: #10b981;
    color: white;
  }
  
  .btn-success:hover {
    background: #059669;
  }
  
  .btn-back {
    background: transparent;
    border: none;
    cursor: pointer;
    color: #64748b;
    font-size: 14px;
    display: flex;
    align-items: center;
    gap: 6px;
  }
  
  .btn-back:hover {
    color: #0f172a;
  }
  
  .btn-icon {
    width: 28px;
    height: 28px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s;
  }
  
  .btn-icon.btn-xs {
    width: 24px;
    height: 24px;
  }
  
  .btn-icon.btn-danger {
    background: #fee2e2;
    color: #ef4444;
  }
  
  .btn-icon.btn-danger:hover {
    background: #ef4444;
    color: white;
  }
  
  .btn-sm {
    padding: 6px 12px;
    font-size: 13px;
  }
  
  .empty-state {
    text-align: center;
    padding: 40px 20px;
    color: #64748b;
  }
  
  .empty-state i {
    font-size: 48px;
    color: #cbd5e1;
    margin-bottom: 16px;
  }
</style>
