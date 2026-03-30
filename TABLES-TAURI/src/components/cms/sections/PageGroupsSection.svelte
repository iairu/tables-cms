<script>
  import { cmsData, savePageGroups } from '../../../stores/cmsData.js';
  import ConfirmModal from '../../ConfirmModal.svelte';
  
  let cmsDataValue;
  const unsubscribe = cmsData.subscribe(value => cmsDataValue = value);
  
  let searchQuery = '';
  let selectedGroup = null;
  let isEditingGroup = false;
  let editingGroup = null;
  let dragIndex = null;
  let showDeleteConfirm = false;
  let deleteGroupId = null;
  
  $: filteredGroups = cmsDataValue?.pageGroups?.filter(group =>
    !searchQuery ||
    group.name?.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  // Get pages in the current editing group
  $: pagesInEditingGroup = editingGroup 
    ? (cmsDataValue.pages || []).filter(p => p.groups?.includes(editingGroup.id))
    : [];
  
  // Get page names for display
  function getPageName(pageId) {
    const page = (cmsDataValue.pages || []).find(p => p.id === pageId);
    return page?.name || pageId;
  }
  
  function getPageSlug(pageId) {
    const page = (cmsDataValue.pages || []).find(p => p.id === pageId);
    return page?.slug || '';
  }
  
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

  function requestDeleteGroup(groupId) {
    deleteGroupId = groupId;
    showDeleteConfirm = true;
  }

  function confirmDeleteGroup() {
    showDeleteConfirm = false;
    if (deleteGroupId) {
      savePageGroups((cmsDataValue.pageGroups || []).filter(g => g.id !== deleteGroupId));
      if (selectedGroup?.id === deleteGroupId) {
        selectedGroup = null;
      }
      deleteGroupId = null;
    }
  }

  function cancelDeleteGroup() {
    showDeleteConfirm = false;
    deleteGroupId = null;
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

    // Get pages that are NOT in this group
    const availablePages = (cmsDataValue.pages || []).filter(
      p => !p.groups?.includes(editingGroup.id)
    );

    if (availablePages.length === 0) {
      alert('No available pages to add');
      return;
    }

    const pageId = prompt('Enter page ID to add (or select from list):\n\nAvailable: ' +
      availablePages.map(p => `${p.id} - ${p.name}`).join('\n'));

    if (pageId && availablePages.find(p => p.id === pageId)) {
      // Add group ID to page's groups array
      const page = availablePages.find(p => p.id === pageId);
      const updatedPage = {
        ...page,
        groups: [...(page.groups || []), editingGroup.id]
      };
      
      // Save the updated page
      const pages = (cmsDataValue.pages || []).map(p => 
        p.id === pageId ? updatedPage : p
      );
      savePages(pages);
      
      // Update editing group to reflect the change
      editingGroup = {
        ...editingGroup,
        pages: [...(editingGroup.pages || []), pageId]
      };
    }
  }
  
  function handleRemovePage(pageIndex) {
    if (!editingGroup) return;

    const pageId = editingGroup.pages[pageIndex];
    
    // Remove group ID from page's groups array
    const page = (cmsDataValue.pages || []).find(p => p.id === pageId);
    if (page) {
      const updatedPage = {
        ...page,
        groups: (page.groups || []).filter(id => id !== editingGroup.id)
      };
      
      // Save the updated page
      const pages = (cmsDataValue.pages || []).map(p => 
        p.id === pageId ? updatedPage : p
      );
      savePages(pages);
    }
    
    // Update editing group to reflect the change
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
</script>
<div class="page-groups-section-compact">
  <div class="section-toolbar">
    <div class="toolbar-left">
      <h2 class="section-title">
        <i class="fas fa-layer-group"></i>
        Page Groups
        <span class="badge">{filteredGroups.length}</span>
      </h2>
    </div>
    <div class="toolbar-right">
      <div class="filters">
        <input
          type="text"
          class="search-input"
          placeholder="Search groups..."
          bind:value={searchQuery}
        />
      </div>
      <button class="btn btn-primary btn-sm" on:click={handleNewGroup}>
        <i class="fas fa-plus"></i>
        New Group
      </button>
    </div>
  </div>

  <div class="table-container">
    <table class="data-table">
      <thead>
        <tr>
          <th>Group Name</th>
          <th>Slug</th>
          <th class="text-center">Pages</th>
          <th class="text-center">Display Settings</th>
          <th class="text-center">Actions</th>
        </tr>
      </thead>
      <tbody>
        {#if filteredGroups.length === 0}
          <tr>
            <td colspan="5" class="empty-state">
              <i class="fas fa-layer-group"></i>
              <p>No groups found</p>
            </td>
          </tr>
        {:else}
          {#each filteredGroups as group (group.id)}
            <tr class="table-row">
              <td>
                <div class="item-name" style="cursor: pointer;" on:click={() => handleSelectGroup(group) || handleEditGroup()}>
                  <i class="fas fa-layer-group"></i>
                  <span>{group.name || 'Untitled'}</span>
                </div>
              </td>
              <td>
                <code class="slug-text">/{group.slug}</code>
              </td>
              <td class="text-center">
                <span class="badge">
                  <i class="fas fa-file"></i> {group.pages?.length || 0}
                </span>
              </td>
              <td class="text-center">
                <div style="display: flex; gap: 4px; justify-content: center;">
                  {#if group.showInMenu}<span class="badge-setting" title="In Menu"><i class="fas fa-bars"></i></span>{/if}
                  {#if group.showInDropdown}<span class="badge-setting" title="Dropdown"><i class="fas fa-chevron-down"></i></span>{/if}
                  {#if group.showSitemap}<span class="badge-setting" title="Sitemap"><i class="fas fa-sitemap"></i></span>{/if}
                </div>
              </td>
              <td class="text-center">
                <div class="action-buttons">
                  <button
                    class="btn-icon btn-xs"
                    title="Edit"
                    on:click|stopPropagation={() => handleSelectGroup(group) || handleEditGroup()}
                  >
                    <i class="fas fa-edit"></i>
                  </button>
                  <button
                    class="btn-icon btn-xs btn-danger"
                    title="Delete"
                    on:click|stopPropagation={() => requestDeleteGroup(group.id)}
                  >
                    <i class="fas fa-trash"></i>
                  </button>
                </div>
              </td>
            </tr>
          {/each}
        {/if}
      </tbody>
    </table>
  </div>

  {#if isEditingGroup && editingGroup}
    <div class="editor-fullscreen">
      <div class="editor-container">
        <div class="editor-header">
          <button class="btn-back" on:click={handleCancelEdit}>
            <i class="fas fa-arrow-left"></i> Back
          </button>
          <div class="editor-title">
            <input
              type="text"
              class="group-name-input field-input"
              bind:value={editingGroup.name}
              placeholder="Group Name"
            />
            <input
              type="text"
              class="group-slug-input field-input"
              bind:value={editingGroup.slug}
              placeholder="group-slug"
            />
          </div>
          <button class="btn-primary" on:click={handleSaveGroup}>
            <i class="fas fa-save"></i> Save Group
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
            
            {#if pagesInEditingGroup && pagesInEditingGroup.length > 0}
              <div class="pages-list">
                {#each pagesInEditingGroup as page, index}
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
                      <span class="page-name-t">{page.name || 'Untitled'}</span>
                      <span class="page-slug-t">/{page.slug || 'no-slug'}</span>
                    </div>
                    <div class="page-actions">
                      <button class="btn-icon btn-xs" on:click={() => handleMovePage(index, 'up')} disabled={index === 0}>
                        <i class="fas fa-chevron-up"></i>
                      </button>
                      <button class="btn-icon btn-xs" on:click={() => handleMovePage(index, 'down')} disabled={index === pagesInEditingGroup.length - 1}>
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
                      <div class="dropdown-item-preview">
                        {getPageName(pageId)}
                      </div>
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
    </div>
  {/if}
  
  <ConfirmModal
    isOpen={showDeleteConfirm}
    title="Delete Group"
    message="Are you sure you want to delete this group? This action cannot be undone."
    confirmText="Delete"
    cancelText="Cancel"
    isDestructive={true}
    onConfirm={confirmDeleteGroup}
    onCancel={cancelDeleteGroup}
  />
</div>

<style>
  .page-groups-section-compact {
    position: relative;
    height: 100%;
    padding: 16px;
  }

  .section-toolbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
    padding: 12px 16px;
    background: var(--bg-card);
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-sm);
  }

  .toolbar-left,
  .toolbar-right {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .section-title {
    display: flex;
    align-items: center;
    gap: 10px;
    margin: 0;
    font-size: var(--text-lg);
    font-weight: 600;
  }

  .section-title i {
    color: var(--color-primary);
  }

  .badge {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 2px 8px;
    background: var(--bg-tertiary);
    border-radius: var(--radius-full);
    font-size: 12px;
    font-weight: 600;
    color: var(--text-secondary);
  }
  
  .badge-setting {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 24px;
    height: 24px;
    background: var(--bg-tertiary);
    border: 1px solid var(--border-light);
    border-radius: 4px;
    color: var(--color-primary);
    font-size: 12px;
  }

  .filters {
    display: flex;
    gap: 8px;
  }

  .search-input {
    padding: 6px 12px;
    border: 1px solid var(--border-light);
    border-radius: var(--radius-md);
    background: var(--bg-primary);
    color: var(--text-primary);
    font-size: var(--text-sm);
    width: 250px;
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
    transition: all var(--transition-fast);
  }

  .btn-sm {
    padding: 5px 10px;
    font-size: 13px;
  }

  .btn-primary {
    background: var(--color-primary);
    color: white;
  }

  .btn-primary:hover {
    background: var(--color-primary-dark);
  }

  .table-container {
    background: var(--bg-card);
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-sm);
    overflow: hidden;
  }

  .data-table {
    width: 100%;
    border-collapse: collapse;
  }

  .data-table th {
    padding: 10px 12px;
    text-align: left;
    font-size: 12px;
    font-weight: 600;
    color: var(--text-secondary);
    text-transform: uppercase;
    letter-spacing: 0.5px;
    background: var(--bg-tertiary);
    border-bottom: 2px solid var(--border-light);
  }

  .data-table td {
    padding: 10px 12px;
    border-bottom: 1px solid var(--border-light);
    font-size: var(--text-sm);
  }

  .data-table tbody tr {
    transition: background var(--transition-fast);
  }

  .data-table tbody tr:hover {
    background: var(--bg-secondary);
  }

  .item-name {
    display: flex;
    align-items: center;
    gap: 8px;
    font-weight: 600;
  }

  .item-name i {
    color: var(--color-primary);
  }

  .slug-text {
    padding: 2px 6px;
    background: var(--bg-tertiary);
    border-radius: var(--radius-sm);
    font-family: 'Fira Code', monospace;
    font-size: 12px;
    color: var(--color-primary);
  }

  .text-center {
    text-align: center;
  }

  .action-buttons {
    display: flex;
    gap: 4px;
    justify-content: center;
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
    transition: all var(--transition-fast);
    color: var(--text-secondary);
  }

  .btn-icon:hover {
    background: var(--border-medium);
    color: var(--text-primary);
  }

  .btn-icon.btn-danger:hover {
    background: #ef4444;
    color: white;
  }

  .empty-state {
    text-align: center;
    padding: 60px 20px;
    color: var(--text-tertiary);
  }

  .empty-state i {
    font-size: 48px;
    margin-bottom: 12px;
  }

  .editor-fullscreen {
    position: absolute;
    inset: 0;
    background: var(--bg-primary);
    z-index: 1000;
    padding: 30px;
    overflow-y: auto;
  }

  .editor-container {
    max-width: 1000px;
    margin: 0 auto;
    background: var(--bg-card);
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-lg);
    overflow: hidden;
    display: flex;
    flex-direction: column;
    min-height: calc(100vh - 60px);
  }

  .editor-header {
    padding: 20px;
    background: var(--bg-secondary);
    border-bottom: 1px solid var(--border-light);
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
  }

  .btn-back {
    padding: 8px 16px;
    background: var(--bg-tertiary);
    border: 1px solid var(--border-light);
    border-radius: 6px;
    cursor: pointer;
    font-weight: 600;
    color: var(--text-primary);
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
    font-size: 16px;
    font-weight: 600;
  }
  
  .group-slug-input {
    flex: 1;
    padding: 8px 12px;
    font-size: 14px;
    font-family: monospace;
  }

  .editor-content {
    flex: 1;
    overflow-y: auto;
    padding: 30px;
    display: flex;
    flex-direction: column;
    gap: 30px;
  }

  .settings-section,
  .pages-section {
    background: var(--bg-secondary);
    border-radius: 8px;
    padding: 20px;
    border: 1px solid var(--border-light);
  }

  .settings-section h3,
  .pages-section h3 {
    font-size: 16px;
    font-weight: 600;
    color: var(--text-primary);
    margin: 0 0 16px;
    display: flex;
    align-items: center;
    gap: 8px;
  }
  
  .settings-section h3 i,
  .pages-section h3 i {
    color: var(--color-primary);
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
    color: var(--text-primary);
    cursor: pointer;
  }
  
  .checkbox-label input[type="checkbox"] {
    width: 18px;
    height: 18px;
    cursor: pointer;
  }
  
  .help-text {
    font-size: 12px;
    color: var(--text-secondary);
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
    background: var(--bg-card);
    border: 1px solid var(--border-light);
    border-radius: 6px;
    padding: 12px;
    cursor: grab;
  }
  
  .page-row:active {
    cursor: grabbing;
  }
  
  .drag-handle {
    color: var(--text-tertiary);
    cursor: grab;
  }
  
  .page-info {
    flex: 1;
  }
  
  .page-name-t {
    display: block;
    font-weight: 500;
    color: var(--text-primary);
  }
  
  .page-slug-t {
    font-size: 12px;
    color: var(--text-secondary);
    font-family: monospace;
  }
  
  .page-actions {
    display: flex;
    gap: 4px;
  }
  
  .empty-pages {
    text-align: center;
    padding: 40px 20px;
    color: var(--text-tertiary);
  }
  
  .empty-pages i {
    font-size: 48px;
    color: var(--border-medium);
    margin-bottom: 16px;
  }
  
  .dropdown-preview {
    margin-top: 20px;
    background: var(--bg-card);
    border-radius: 8px;
    padding: 16px;
    border: 1px solid var(--border-light);
  }
  .dropdown-preview h4 {
    margin-top: 0;
    font-size: 14px;
    color: var(--text-secondary);
  }
  
  .dropdown-menu-preview {
    border: 1px solid var(--border-light);
    border-radius: 6px;
    display: inline-block;
    min-width: 200px;
    background: var(--bg-primary);
  }
  
  .dropdown-trigger {
    padding: 10px 16px;
    background: var(--bg-secondary);
    border-bottom: 1px solid var(--border-light);
    font-weight: 500;
    display: flex;
    justify-content: space-between;
    align-items: center;
    color: var(--text-primary);
  }
  
  .dropdown-item-preview {
    padding: 10px 16px;
    display: block;
    color: var(--text-primary);
    text-decoration: none;
    font-size: 14px;
    border-bottom: 1px solid var(--border-light);
  }
  
  .dropdown-item-preview:last-child {
    border-bottom: none;
  }
  
  .field-input {
    border: 1px solid var(--border-light);
    border-radius: var(--radius-md);
    background: var(--bg-primary);
    color: var(--text-primary);
  }
</style>
