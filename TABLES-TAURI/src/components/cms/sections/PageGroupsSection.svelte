<script>
  import { cmsData, savePageGroups } from '../../../stores/cmsData.js';
  
  let cmsDataValue;
  const unsubscribe = cmsData.subscribe(value => cmsDataValue = value);
  
  let searchQuery = '';
  let selectedGroup = null;
  let isEditingGroup = false;
  let editingGroup = null;
  let dragIndex = null;
  
  $: filteredGroups = cmsDataValue?.pageGroups?.filter(group =>
    !searchQuery ||
    group.name?.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];
  
  function handleNewGroup() {
    const newGroup = {
      id: Date.now().toString(),
      name: 'New Group',
      slug: 'new-group',
      pages: [],
      showInMenu: true,
      showInDropdown: true,
      order: (cmsDataValue?.pageGroups?.length || 0) + 1,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
    
    savePageGroups([...(cmsDataValue.pageGroups || []), newGroup]);
  }
  
  function handleDeleteGroup(groupId) {
    if (confirm('Are you sure you want to delete this group?')) {
      savePageGroups((cmsDataValue.pageGroups || []).filter(g => g.id !== groupId));
      if (selectedGroup?.id === groupId) {
        selectedGroup = null;
      }
    }
  }
  
  function handleSelectGroup(group) {
    selectedGroup = group;
    isEditingGroup = false;
  }
  
  function handleEditGroup() {
    if (selectedGroup) {
      editingGroup = { ...selectedGroup, pages: [...(selectedGroup.pages || [])] };
      isEditingGroup = true;
    }
  }
  
  function handleSaveGroup() {
    if (!editingGroup) return;
    
    const groups = (cmsDataValue.pageGroups || []).map(g => 
      g.id === editingGroup.id ? { ...editingGroup, updatedAt: Date.now() } : g
    );
    
    savePageGroups(groups);
    selectedGroup = { ...editingGroup };
    isEditingGroup = false;
    editingGroup = null;
  }
  
  function handleCancelEdit() {
    isEditingGroup = false;
    editingGroup = null;
  }
  
  function handleAddPage() {
    if (!editingGroup) return;
    
    const availablePages = (cmsDataValue.pages || []).filter(
      p => !editingGroup.pages?.includes(p.id)
    );
    
    if (availablePages.length === 0) {
      alert('No available pages to add');
      return;
    }
    
    const pageId = prompt('Enter page ID to add (or select from list):\n\nAvailable: ' + 
      availablePages.map(p => `${p.id} - ${p.name}`).join('\n'));
    
    if (pageId && availablePages.find(p => p.id === pageId)) {
      editingGroup = {
        ...editingGroup,
        pages: [...(editingGroup.pages || []), pageId]
      };
    }
  }
  
  function handleRemovePage(pageIndex) {
    if (!editingGroup) return;
    
    editingGroup = {
      ...editingGroup,
      pages: editingGroup.pages.filter((_, i) => i !== pageIndex)
    };
  }
  
  function handleMovePage(index, direction) {
    if (!editingGroup) return;
    
    const pages = [...editingGroup.pages];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    
    if (newIndex < 0 || newIndex >= pages.length) return;
    
    [pages[index], pages[newIndex]] = [pages[newIndex], pages[index]];
    
    editingGroup = { ...editingGroup, pages };
  }
  
  function handleDragStart(index) {
    dragIndex = index;
  }
  
  function handleDragOver(e, index) {
    e.preventDefault();
  }
  
  function handleDrop(index) {
    if (!editingGroup || dragIndex === null || dragIndex === index) return;
    
    const pages = [...editingGroup.pages];
    const draggedItem = pages[dragIndex];
    
    pages.splice(dragIndex, 1);
    pages.splice(index, 0, draggedItem);
    
    editingGroup = { ...editingGroup, pages };
    dragIndex = null;
  }
  
  function getPageName(pageId) {
    const page = (cmsDataValue.pages || []).find(p => p.id === pageId);
    return page?.name || pageId;
  }
  
  function getPageSlug(pageId) {
    const page = (cmsDataValue.pages || []).find(p => p.id === pageId);
    return page?.slug || '';
  }
</script>

<div class="page-groups-section">
  <div class="groups-layout">
    <!-- Groups List -->
    <div class="groups-list-panel {selectedGroup || isEditingGroup ? 'collapsed' : ''}">
      <div class="panel-header">
        <h2><i class="fas fa-layer-group"></i> Page Groups</h2>
        <button class="btn-primary btn-sm" on:click={handleNewGroup}>
          <i class="fas fa-plus"></i> New
        </button>
      </div>
      
      <div class="search-box">
        <i class="fas fa-search"></i>
        <input
          type="text"
          placeholder="Search groups..."
          bind:value={searchQuery}
        />
      </div>
      
      <div class="groups-list">
        {#each filteredGroups as group}
          <div
            class="group-item {selectedGroup?.id === group.id && !isEditingGroup ? 'active' : ''}"
            on:click={() => handleSelectGroup(group)}
          >
            <div class="group-item-content">
              <h3>{group.name || 'Untitled'}</h3>
              <div class="group-meta">
                <span class="pages-count">
                  <i class="fas fa-file"></i> {group.pages?.length || 0} pages
                </span>
                {#if group.showInDropdown}
                  <span class="dropdown-badge">
                    <i class="fas fa-chevron-down"></i> Dropdown
                  </span>
                {/if}
              </div>
            </div>
            <button
              class="btn-icon btn-danger btn-xs"
              on:click={(e) => { e.stopPropagation(); handleDeleteGroup(group.id); }}
            >
              <i class="fas fa-trash"></i>
            </button>
          </div>
        {:else}
          <div class="empty-state">
            <i class="fas fa-layer-group"></i>
            <p>No groups found</p>
          </div>
        {/each}
      </div>
    </div>
    
    <!-- Group Editor -->
    <div class="group-editor-panel">
      {#if !selectedGroup && !isEditingGroup}
        <div class="no-selection">
          <i class="fas fa-layer-group"></i>
          <h3>Select a Group</h3>
          <p>Choose a group from the list or create a new one</p>
          <button class="btn-primary" on:click={handleNewGroup}>
            <i class="fas fa-plus"></i> Create Group
          </button>
        </div>
      {:else if isEditingGroup && editingGroup}
        <div class="editor-container">
          <div class="editor-header">
            <button class="btn-back" on:click={handleCancelEdit}>
              <i class="fas fa-arrow-left"></i> Back
            </button>
            <div class="editor-title">
              <input
                type="text"
                class="group-name-input"
                bind:value={editingGroup.name}
                placeholder="Group Name"
              />
              <input
                type="text"
                class="group-slug-input"
                bind:value={editingGroup.slug}
                placeholder="group-slug"
              />
            </div>
            <button class="btn-success" on:click={handleSaveGroup}>
              <i class="fas fa-save"></i> Save
            </button>
          </div>
          
          <div class="editor-content">
            <div class="settings-section">
              <h3><i class="fas fa-cog"></i> Display Settings</h3>
              
              <div class="setting-row">
                <label class="checkbox-label">
                  <input type="checkbox" bind:checked={editingGroup.showInMenu} />
                  <span>Show in Main Menu</span>
                </label>
                <p class="help-text">Display this group in the main navigation</p>
              </div>
              
              <div class="setting-row">
                <label class="checkbox-label">
                  <input type="checkbox" bind:checked={editingGroup.showInDropdown} />
                  <span>Show Dropdown Menu</span>
                </label>
                <p class="help-text">Show pages in this group as a dropdown menu</p>
              </div>
              
              <div class="setting-row">
                <label class="checkbox-label">
                  <input type="checkbox" bind:checked={editingGroup.showSitemap} />
                  <span>Show in Sitemap</span>
                </label>
                <p class="help-text">Include this group's pages in the sitemap</p>
              </div>
            </div>
            
            <div class="pages-section">
              <div class="section-header">
                <h3><i class="fas fa-files"></i> Group Pages</h3>
                <button class="btn-primary btn-sm" on:click={handleAddPage}>
                  <i class="fas fa-plus"></i> Add Page
                </button>
              </div>
              
              {#if editingGroup.pages && editingGroup.pages.length > 0}
                <div class="pages-list">
                  {#each editingGroup.pages as pageId, index}
                    <div
                      class="page-row"
                      draggable="true"
                      on:dragstart={() => handleDragStart(index)}
                      on:dragover={(e) => handleDragOver(e, index)}
                      on:drop={() => handleDrop(index)}
                    >
                      <div class="drag-handle">
                        <i class="fas fa-grip-vertical"></i>
                      </div>
                      <div class="page-info">
                        <span class="page-name">{getPageName(pageId)}</span>
                        <span class="page-slug">/{getPageSlug(pageId)}</span>
                      </div>
                      <div class="page-actions">
                        <button class="btn-icon btn-xs" on:click={() => handleMovePage(index, 'up')} disabled={index === 0}>
                          <i class="fas fa-chevron-up"></i>
                        </button>
                        <button class="btn-icon btn-xs" on:click={() => handleMovePage(index, 'down')} disabled={index === editingGroup.pages.length - 1}>
                          <i class="fas fa-chevron-down"></i>
                        </button>
                        <button class="btn-icon btn-danger btn-xs" on:click={() => handleRemovePage(index)}>
                          <i class="fas fa-trash"></i>
                        </button>
                      </div>
                    </div>
                  {/each}
                </div>
                
                <div class="dropdown-preview">
                  <h4><i class="fas fa-eye"></i> Dropdown Preview</h4>
                  <div class="dropdown-menu-preview">
                    <div class="dropdown-trigger">
                      {editingGroup.name} <i class="fas fa-chevron-down"></i>
                    </div>
                    <div class="dropdown-items">
                      {#each editingGroup.pages as pageId}
                        <a href="#" class="dropdown-item-preview">
                          {getPageName(pageId)}
                        </a>
                      {/each}
                    </div>
                  </div>
                </div>
              {:else}
                <div class="empty-pages">
                  <i class="fas fa-files"></i>
                  <p>No pages in this group</p>
                  <button class="btn-primary btn-sm" on:click={handleAddPage}>
                    <i class="fas fa-plus"></i> Add First Page
                  </button>
                </div>
              {/if}
            </div>
          </div>
        </div>
      {:else if selectedGroup}
        <div class="group-preview">
          <div class="preview-header">
            <div>
              <h2>{selectedGroup.name || 'Untitled'}</h2>
              <p class="preview-slug">/{selectedGroup.slug || 'no-slug'}</p>
            </div>
            <div class="preview-actions">
              <button class="btn-secondary" on:click={handleSelectGroup}>
                <i class="fas fa-eye"></i> View
              </button>
              <button class="btn-primary" on:click={handleEditGroup}>
                <i class="fas fa-edit"></i> Edit Group
              </button>
            </div>
          </div>
          
          <div class="preview-content">
            <div class="preview-settings">
              <h3>Display Settings</h3>
              <div class="settings-grid">
                <div class="setting-item {selectedGroup.showInMenu ? 'enabled' : 'disabled'}">
                  <i class="fas {selectedGroup.showInMenu ? 'fa-check-circle' : 'fa-times-circle'}"></i>
                  <span>Show in Main Menu</span>
                </div>
                <div class="setting-item {selectedGroup.showInDropdown ? 'enabled' : 'disabled'}">
                  <i class="fas {selectedGroup.showInDropdown ? 'fa-check-circle' : 'fa-times-circle'}"></i>
                  <span>Show Dropdown Menu</span>
                </div>
                <div class="setting-item {selectedGroup.showSitemap ? 'enabled' : 'disabled'}">
                  <i class="fas {selectedGroup.showSitemap ? 'fa-check-circle' : 'fa-times-circle'}"></i>
                  <span>Show in Sitemap</span>
                </div>
              </div>
            </div>
            
            <div class="preview-pages">
              <h3>Group Pages ({selectedGroup.pages?.length || 0})</h3>
              {#if selectedGroup.pages && selectedGroup.pages.length > 0}
                <div class="pages-list-preview">
                  {#each selectedGroup.pages as pageId, index}
                    <div class="page-item-preview">
                      <span class="order">{index + 1}</span>
                      <div class="page-details">
                        <span class="name">{getPageName(pageId)}</span>
                        <span class="slug">/{getPageSlug(pageId)}</span>
                      </div>
                    </div>
                  {/each}
                </div>
              {:else}
                <p class="empty-message">No pages in this group</p>
              {/if}
            </div>
          </div>
        </div>
      {/if}
    </div>
  </div>
</div>

<style>
  .page-groups-section {
    height: calc(100vh - 140px);
    overflow: hidden;
  }
  
  .groups-layout {
    display: flex;
    gap: 20px;
    height: 100%;
  }
  
  .groups-list-panel {
    width: 320px;
    background: white;
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    display: flex;
    flex-direction: column;
    overflow: hidden;
    transition: width 0.3s;
  }
  
  .groups-list-panel.collapsed {
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
  
  .groups-list {
    flex: 1;
    overflow-y: auto;
    padding: 12px;
  }
  
  .group-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 14px 16px;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s;
    margin-bottom: 8px;
  }
  
  .group-item:hover {
    background: #f8fafc;
  }
  
  .group-item.active {
    background: #eff6ff;
    border: 1px solid #2563eb;
  }
  
  .group-item-content {
    flex: 1;
  }
  
  .group-item-content h3 {
    font-size: 14px;
    font-weight: 600;
    margin: 0 0 6px;
    color: #0f172a;
  }
  
  .group-meta {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 12px;
  }
  
  .pages-count {
    color: #64748b;
    display: flex;
    align-items: center;
    gap: 4px;
  }
  
  .dropdown-badge {
    background: #dbeafe;
    color: #1e40af;
    padding: 2px 8px;
    border-radius: 12px;
    font-size: 11px;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 4px;
  }
  
  .group-editor-panel {
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
  
  .editor-title {
    flex: 1;
    display: flex;
    gap: 12px;
    align-items: center;
  }
  
  .group-name-input {
    flex: 2;
    padding: 8px 12px;
    border: 1px solid #e2e8f0;
    border-radius: 6px;
    font-size: 16px;
    font-weight: 600;
  }
  
  .group-slug-input {
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
  
  .settings-section,
  .pages-section {
    background: #f8fafc;
    border-radius: 8px;
    padding: 20px;
    margin-bottom: 20px;
  }
  
  .settings-section h3,
  .pages-section h3 {
    font-size: 16px;
    font-weight: 600;
    color: #0f172a;
    margin: 0 0 16px;
    display: flex;
    align-items: center;
    gap: 8px;
  }
  
  .settings-section h3 i,
  .pages-section h3 i {
    color: #2563eb;
  }
  
  .setting-row {
    margin-bottom: 16px;
  }
  
  .setting-row:last-child {
    margin-bottom: 0;
  }
  
  .checkbox-label {
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 14px;
    font-weight: 500;
    color: #475569;
    cursor: pointer;
  }
  
  .checkbox-label input[type="checkbox"] {
    width: 18px;
    height: 18px;
    cursor: pointer;
  }
  
  .help-text {
    font-size: 12px;
    color: #64748b;
    margin-top: 6px;
    margin-left: 28px;
  }
  
  .section-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 16px;
  }
  
  .section-header h3 {
    margin: 0;
  }
  
  .pages-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  
  .page-row {
    display: flex;
    align-items: center;
    gap: 12px;
    background: white;
    border: 1px solid #e2e8f0;
    border-radius: 6px;
    padding: 12px;
    cursor: grab;
  }
  
  .page-row:active {
    cursor: grabbing;
  }
  
  .drag-handle {
    color: #94a3b8;
    cursor: grab;
  }
  
  .page-info {
    flex: 1;
  }
  
  .page-name {
    display: block;
    font-weight: 500;
    color: #0f172a;
  }
  
  .page-slug {
    font-size: 12px;
    color: #64748b;
    font-family: monospace;
  }
  
  .page-actions {
    display: flex;
    gap: 4px;
  }
  
  .empty-pages {
    text-align: center;
    padding: 40px 20px;
    color: #64748b;
  }
  
  .empty-pages i {
    font-size: 48px;
    color: #cbd5e1;
    margin-bottom: 16px;
  }
  
  .dropdown-preview {
    margin-top: 20px;
    background: white;
    border-radius: 8px;
    padding: 16px;
    border: 1px solid #e2e8f0;
  }
  
  .dropdown-preview h4 {
    font-size: 14px;
    font-weight: 600;
    color: #475569;
    margin: 0 0 12px;
    display: flex;
    align-items: center;
    gap: 8px;
  }
  
  .dropdown-menu-preview {
    border: 1px solid #e2e8f0;
    border-radius: 6px;
    overflow: hidden;
  }
  
  .dropdown-trigger {
    background: #2563eb;
    color: white;
    padding: 12px 16px;
    font-weight: 600;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  
  .dropdown-items {
    background: white;
  }
  
  .dropdown-item-preview {
    display: block;
    padding: 10px 16px;
    color: #475569;
    text-decoration: none;
    border-top: 1px solid #f1f5f9;
    transition: background 0.2s;
  }
  
  .dropdown-item-preview:hover {
    background: #f8fafc;
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
  
  .preview-settings h3,
  .preview-pages h3 {
    font-size: 16px;
    font-weight: 600;
    color: #0f172a;
    margin-bottom: 16px;
  }
  
  .settings-grid {
    display: grid;
    gap: 12px;
    margin-bottom: 24px;
  }
  
  .setting-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 16px;
    background: #f8fafc;
    border-radius: 8px;
    font-size: 14px;
  }
  
  .setting-item i {
    font-size: 20px;
  }
  
  .setting-item.enabled {
    background: #d1fae5;
    color: #065f46;
  }
  
  .setting-item.enabled i {
    color: #10b981;
  }
  
  .setting-item.disabled {
    background: #f1f5f9;
    color: #64748b;
  }
  
  .setting-item.disabled i {
    color: #94a3b8;
  }
  
  .pages-list-preview {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  
  .page-item-preview {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 16px;
    background: #f8fafc;
    border-radius: 8px;
  }
  
  .order {
    width: 24px;
    height: 24px;
    background: #e2e8f0;
    color: #64748b;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    font-weight: 600;
  }
  
  .page-details {
    flex: 1;
  }
  
  .name {
    display: block;
    font-weight: 500;
    color: #0f172a;
  }
  
  .slug {
    font-size: 12px;
    color: #64748b;
    font-family: monospace;
  }
  
  .empty-message {
    color: #64748b;
    text-align: center;
    padding: 20px;
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
