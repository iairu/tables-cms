<script>
  import { cmsData, savePages, savePageWithHistory } from '../../../stores/cmsData.js';
  import AssetManagerModal from '../AssetManagerModal.svelte';
  import ConfirmModal from '../../ConfirmModal.svelte';
  import HistoryPanel from '../HistoryPanel.svelte';

  let cmsDataValue;
  const unsubscribe = cmsData.subscribe(value => cmsDataValue = value);

  // Search and filter state
  let searchQuery = '';
  let filterGroup = 'all';
  let sortBy = 'updatedAt';
  let sortDirection = 'desc';

  // UI state
  let isEditingPage = false;
  let editingPage = null;
  let showAssetManager = false;
  let showDeleteConfirm = false;
  let deletePageId = null;
  let showHistory = false;
  let selectedPageForHistory = null;
  let activeField = null;

  const componentTypes = [
    { id: 'hero', name: 'Hero Section', icon: 'fa-image' },
    { id: 'text', name: 'Text Block', icon: 'fa-paragraph' },
    { id: 'image', name: 'Image', icon: 'fa-image' },
    { id: 'video', name: 'Video', icon: 'fa-video' },
    { id: 'features', name: 'Features Grid', icon: 'fa-th-large' },
    { id: 'cta', name: 'Call to Action', icon: 'fa-bullhorn' },
    { id: 'blog-list', name: 'Blog List', icon: 'fa-newspaper' },
    { id: 'infobar', name: 'Info Bar', icon: 'fa-info-circle' },
    { id: 'ranking', name: 'Ranking', icon: 'fa-trophy' },
    { id: 'reviews', name: 'Reviews', icon: 'fa-star' }
  ];

  $: filteredPages = (cmsDataValue?.pages || [])
    .filter(page => {
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        if (!page.name?.toLowerCase().includes(query) &&
            !page.slug?.toLowerCase().includes(query)) {
          return false;
        }
      }
      if (filterGroup !== 'all') {
        if (filterGroup === 'none') {
          if (page.groups && page.groups.length > 0) return false;
        } else {
          if (!page.groups || !page.groups.includes(filterGroup)) return false;
        }
      }
      return true;
    })
    .sort((a, b) => {
      const aVal = a[sortBy] || 0;
      const bVal = b[sortBy] || 0;
      return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
    });

  $: availableGroups = cmsDataValue?.pageGroups || [];

  function handleNewPage() {
    const newPage = {
      id: Date.now().toString(),
      name: 'New Page',
      slug: 'new-page',
      components: [],
      groups: [],
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
    savePageWithHistory(newPage, 'create', 'Created new page');
    editingPage = { ...newPage };
    isEditingPage = true;
  }

  function requestDeletePage(pageId) {
    deletePageId = pageId;
    showDeleteConfirm = true;
  }

  function confirmDeletePage() {
    showDeleteConfirm = false;
    if (deletePageId) {
      const page = cmsDataValue.pages.find(p => p.id === deletePageId);
      savePageWithHistory(page, 'delete', 'Deleted page');
      savePages((cmsDataValue.pages || []).filter(p => p.id !== deletePageId));
      if (editingPage?.id === deletePageId) {
        editingPage = null;
        isEditingPage = false;
      }
      deletePageId = null;
    }
  }

  function editPage(page) {
    editingPage = { ...page, groups: [...(page.groups || [])] };
    isEditingPage = true;
  }

  function savePage() {
    if (!editingPage.name || !editingPage.slug) return;
    editingPage.updatedAt = Date.now();
    savePageWithHistory(editingPage, 'update', 'Updated page');
    const existingIndex = cmsDataValue.pages.findIndex(p => p.id === editingPage.id);
    const updatedPages = [...cmsDataValue.pages];
    if (existingIndex >= 0) {
      updatedPages[existingIndex] = editingPage;
    } else {
      updatedPages.push(editingPage);
    }
    savePages(updatedPages);
    isEditingPage = false;
    editingPage = null;
  }

  function cancelEdit() {
    isEditingPage = false;
    editingPage = null;
  }

  function toggleGroupAssignment(groupId) {
    if (!editingPage) return;
    const currentGroups = editingPage.groups || [];
    let newGroups;
    if (currentGroups.includes(groupId)) {
      newGroups = currentGroups.filter(id => id !== groupId);
    } else {
      newGroups = [...currentGroups, groupId];
    }
    editingPage = { ...editingPage, groups: newGroups };
  }

  function formatDate(timestamp) {
    if (!timestamp) return '-';
    return new Date(timestamp).toLocaleDateString();
  }

  function formatDateTime(timestamp) {
    if (!timestamp) return '-';
    return new Date(timestamp).toLocaleString();
  }

  function viewHistory(page) {
    selectedPageForHistory = page;
    showHistory = true;
  }

  function closeHistory() {
    showHistory = false;
    selectedPageForHistory = null;
  }

  function handleSort(field) {
    if (sortBy === field) {
      sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      sortBy = field;
      sortDirection = 'asc';
    }
  }

  function getSortIcon(field) {
    if (sortBy !== field) return 'fa-sort';
    return sortDirection === 'asc' ? 'fa-sort-up' : 'fa-sort-down';
  }
</script>

<div class="pages-section-compact">
  <div class="section-toolbar">
    <div class="toolbar-left">
      <h2 class="section-title">
        <i class="fas fa-file"></i>
        Pages
        <span class="badge">{filteredPages.length}</span>
      </h2>
    </div>
    <div class="toolbar-right">
      <div class="filters">
        <input
          type="text"
          class="search-input"
          placeholder="Search pages..."
          bind:value={searchQuery}
        />
        <select bind:value={filterGroup} class="filter-select">
          <option value="all">All Groups</option>
          <option value="none">No Group</option>
          {#each availableGroups as group (group.id)}
            <option value={group.id}>{group.name}</option>
          {/each}
        </select>
      </div>
      <button class="btn btn-primary btn-sm" on:click={handleNewPage}>
        <i class="fas fa-plus"></i>
        New Page
      </button>
    </div>
  </div>

  <div class="table-container">
    <table class="data-table">
      <thead>
        <tr>
          <th class="sortable" on:click={() => handleSort('name')}>
            <span class="sort-header">
              Name
              <i class="fas {getSortIcon('name')}"></i>
            </span>
          </th>
          <th class="sortable" on:click={() => handleSort('slug')}>
            <span class="sort-header">
              Slug
              <i class="fas {getSortIcon('slug')}"></i>
            </span>
          </th>
          <th class="sortable" on:click={() => handleSort('updatedAt')}>
            <span class="sort-header">
              Last Modified
              <i class="fas {getSortIcon('updatedAt')}"></i>
            </span>
          </th>
          <th class="text-center">Components</th>
          <th class="text-center">Groups</th>
          <th class="text-center">Actions</th>
        </tr>
      </thead>
      <tbody>
        {#if filteredPages.length === 0}
          <tr>
            <td colspan="6" class="empty-state">
              <i class="fas fa-inbox"></i>
              <p>No pages found</p>
            </td>
          </tr>
        {:else}
          {#each filteredPages as page (page.id)}
            <tr class="table-row" on:click={() => editPage(page)}>
              <td>
                <div class="page-name">
                  <i class="fas fa-file"></i>
                  <span>{page.name}</span>
                </div>
              </td>
              <td>
                <code class="slug-text">/{page.slug}</code>
              </td>
              <td class="text-muted">{formatDateTime(page.updatedAt)}</td>
              <td class="text-center">
                <span class="badge badge-info">{page.components?.length || 0}</span>
              </td>
              <td class="text-center">
                {#if page.groups && page.groups.length > 0}
                  <span class="badge badge-secondary">{page.groups.length}</span>
                {:else}
                  <span class="text-muted">-</span>
                {/if}
              </td>
              <td class="text-center">
                <div class="action-buttons">
                  <button
                    class="btn-icon btn-xs"
                    title="Edit"
                    on:click|stopPropagation={() => editPage(page)}
                  >
                    <i class="fas fa-edit"></i>
                  </button>
                  <button
                    class="btn-icon btn-xs"
                    title="History"
                    on:click|stopPropagation={() => viewHistory(page)}
                  >
                    <i class="fas fa-history"></i>
                  </button>
                  <button
                    class="btn-icon btn-xs btn-danger"
                    title="Delete"
                    on:click|stopPropagation={() => requestDeletePage(page.id)}
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

  {#if isEditingPage && editingPage}
    <div class="editor-panel">
      <div class="editor-header">
        <h3>{cmsDataValue.pages.find(p => p.id === editingPage.id) ? 'Edit' : 'New'} Page</h3>
        <div class="editor-actions">
          <button class="btn btn-secondary btn-sm" on:click={cancelEdit}>
            <i class="fas fa-times"></i> Cancel
          </button>
          <button class="btn btn-primary btn-sm" on:click={savePage}>
            <i class="fas fa-save"></i> Save
          </button>
        </div>
      </div>
      <div class="editor-fields">
        <div class="field-row">
          <label class="field-label">Page Name *</label>
          <input
            type="text"
            class="field-input"
            bind:value={editingPage.name}
            placeholder="Enter page name"
          />
        </div>
        <div class="field-row">
          <label class="field-label">Slug *</label>
          <input
            type="text"
            class="field-input"
            bind:value={editingPage.slug}
            placeholder="page-slug"
          />
        </div>
        <div class="field-row">
          <label class="field-label">Groups</label>
          <div class="group-tags">
            {#each availableGroups as group (group.id)}
              <span
                class="group-tag"
                class:active={editingPage.groups?.includes(group.id)}
                on:click={() => toggleGroupAssignment(group.id)}
              >
                {group.name}
              </span>
            {/each}
          </div>
        </div>
      </div>
    </div>
  {/if}

  <HistoryPanel
    isOpen={showHistory}
    history={cmsDataValue?.pageHistory || []}
    entityType="page"
    entityId={selectedPageForHistory?.id}
    onClose={closeHistory}
  />

  <ConfirmModal
    isOpen={showDeleteConfirm}
    title="Delete Page"
    message="Are you sure you want to delete this page? This action cannot be undone."
    confirmText="Delete"
    cancelText="Cancel"
    onConfirm={confirmDeletePage}
    onCancel={() => showDeleteConfirm = false}
  />

  <AssetManagerModal
    isOpen={showAssetManager}
    onSelect={(url) => {
      if (activeField) {
        editingPage = { ...editingPage, [activeField]: url };
      }
      showAssetManager = false;
    }}
    onClose={() => showAssetManager = false}
  />
</div>

<style>
  .pages-section-compact {
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

  .badge-info {
    background: rgba(37, 99, 235, 0.1);
    color: var(--color-primary);
  }

  .badge-secondary {
    background: rgba(107, 114, 128, 0.1);
    color: var(--text-secondary);
  }

  .filters {
    display: flex;
    gap: 8px;
  }

  .search-input,
  .filter-select {
    padding: 6px 12px;
    border: 1px solid var(--border-light);
    border-radius: var(--radius-md);
    background: var(--bg-primary);
    color: var(--text-primary);
    font-size: var(--text-sm);
  }

  .search-input {
    width: 250px;
  }

  .filter-select {
    min-width: 150px;
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

  .btn-xs {
    padding: 3px 8px;
    font-size: 12px;
    width: 28px;
    height: 28px;
  }

  .btn-primary {
    background: var(--color-primary);
    color: white;
  }

  .btn-primary:hover {
    background: var(--color-primary-dark);
  }

  .btn-secondary {
    background: var(--bg-tertiary);
    color: var(--text-secondary);
  }

  .btn-secondary:hover {
    background: var(--border-medium);
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
    cursor: pointer;
  }

  .sortable {
    cursor: pointer;
    user-select: none;
  }

  .sort-header {
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .sort-header i {
    font-size: 10px;
    color: var(--text-tertiary);
  }

  .page-name {
    display: flex;
    align-items: center;
    gap: 8px;
    font-weight: 600;
  }

  .page-name i {
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

  .text-muted {
    color: var(--text-tertiary);
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

  .editor-panel {
    margin-top: 16px;
    background: var(--bg-card);
    border-radius: var(--radius-lg);
    padding: 20px;
    box-shadow: var(--shadow-md);
  }

  .editor-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
  }

  .editor-header h3 {
    margin: 0;
  }

  .editor-actions {
    display: flex;
    gap: 8px;
  }

  .editor-fields {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .field-row {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .field-label {
    font-weight: 600;
    color: var(--text-secondary);
    font-size: var(--text-sm);
  }

  .field-input {
    padding: 8px 12px;
    border: 1px solid var(--border-light);
    border-radius: var(--radius-md);
    font-size: var(--text-sm);
  }

  .group-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  .group-tag {
    padding: 4px 12px;
    background: var(--bg-tertiary);
    border-radius: var(--radius-full);
    font-size: 12px;
    cursor: pointer;
    transition: all var(--transition-fast);
    border: 1px solid transparent;
  }

  .group-tag:hover {
    background: var(--border-medium);
  }

  .group-tag.active {
    background: var(--color-primary);
    color: white;
  }
</style>
