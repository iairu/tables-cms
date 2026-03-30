<script>
  import { cmsData, savePages, savePageWithHistory } from '../../../stores/cmsData.js';
  import AssetManagerModal from '../AssetManagerModal.svelte';
  import ConfirmModal from '../../ConfirmModal.svelte';
  import HistoryPanel from '../HistoryPanel.svelte';
  import ComponentEditor from './components/ComponentEditor.svelte';

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
  let pageAutoSaved = false;   // shows the ✓ auto-saved tick
  let lastAutoSavedString = ''; // Phase 9: change detection
  
  // Bulk operations state
  let selectedPages = [];
  let showBulkDeleteConfirm = false;
  let selectAll = false;

  let currentLanguage = 'en';
  $: availableLanguages = cmsDataValue?.settings?.languages || [{ code: 'en', name: 'English' }];

  function getLocalizedContent(page, lang) {
    if (!page.translations || !page.translations[lang]) {
      return {
        name: page.name || '',
        slug: page.slug || '',
        components: page.components || []
      };
    }
    return {
      name: page.translations[lang].name || page.translations[lang].title || page.name || '',
      components: page.translations[lang].components || page.translations[lang].rows || page.components || [],
      slug: page.slug || ''
    };
  }

  function saveLocalizedContent(lang, updates) {
    if (!editingPage) return;
    const translations = editingPage.translations || {};
    const currentLangData = translations[lang] || {
      name: editingPage.name || '',
      slug: editingPage.slug || '',
      components: editingPage.components || []
    };
    
    translations[lang] = { ...currentLangData, ...updates };
    
    if (updates.slug !== undefined) {
      editingPage.slug = updates.slug;
      delete translations[lang].slug;
    }
    
    if (lang === (cmsDataValue?.settings?.defaultLang || 'en')) {
      editingPage = { ...editingPage, ...updates, translations };
    } else {
      editingPage = { ...editingPage, translations };
    }
  }

  $: currentLangContent = editingPage ? getLocalizedContent(editingPage, currentLanguage) : null;

  // PHASE 5 & 9: Immediately auto-save edits and only show tick on actual changes
  let _autoSaveTimer;
  $: if (isEditingPage && editingPage && typeof window !== 'undefined') {
    const currentString = JSON.stringify(editingPage);
    
    if (currentString !== lastAutoSavedString) {
      const activePages = cmsDataValue?.pages || [];
      const mergedPages = activePages.map(p => p.id === editingPage.id ? editingPage : p);
      if (!activePages.find(p => p.id === editingPage.id)) mergedPages.push(editingPage);
      
      // Sync store and localStorage
      savePages(mergedPages, true);
      
      // ONLY SHOW TICK IF IT WAS ALREADY INITIALIZED (not the first render of the editor for this page)
      if (lastAutoSavedString !== '') {
        pageAutoSaved = true;
        clearTimeout(_autoSaveTimer);
        _autoSaveTimer = setTimeout(() => { pageAutoSaved = false; }, 1500);
      }
      
      lastAutoSavedString = currentString;
    }
  }

  // Reset tracking when closing editor or switching pages
  $: if (!isEditingPage) {
    lastAutoSavedString = '';
  }

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
    { id: 'reviews', name: 'Reviews', icon: 'fa-star' },
    { id: 'flies', name: 'Animated Flies', icon: 'fa-wind' },
    { id: 'boxes', name: 'Feature Boxes', icon: 'fa-th' },
    { id: 'slide', name: 'Content Slide', icon: 'fa-layer-group' },
    { id: 'references', name: 'References', icon: 'fa-quote-left' },
    { id: 'slideshow', name: 'Image Slideshow', icon: 'fa-images' }
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
      updatedAt: Date.now(),
      translations: {}
    };
    savePageWithHistory(newPage, 'create', 'Created new page');
    currentLanguage = cmsDataValue?.settings?.defaultLang || 'en';
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
    currentLanguage = cmsDataValue?.settings?.defaultLang || 'en';
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

  // Bulk operations functions
  function toggleSelectAll() {
    selectAll = !selectAll;
    if (selectAll) {
      selectedPages = filteredPages.map(p => p.id);
    } else {
      selectedPages = [];
    }
  }

  function toggleSelectPage(pageId) {
    const index = selectedPages.indexOf(pageId);
    if (index > -1) {
      selectedPages = selectedPages.filter(id => id !== pageId);
    } else {
      selectedPages = [...selectedPages, pageId];
    }
    // Update selectAll state based on selection
    selectAll = selectedPages.length === filteredPages.length && filteredPages.length > 0;
  }

  function requestBulkDelete() {
    if (selectedPages.length === 0) return;
    showBulkDeleteConfirm = true;
  }

  function confirmBulkDelete() {
    showBulkDeleteConfirm = false;
    const pagesToDelete = cmsDataValue.pages.filter(p => selectedPages.includes(p.id));
    
    // Save history for each page
    pagesToDelete.forEach(page => {
      savePageWithHistory(page, 'delete', 'Bulk deleted');
    });
    
    // Remove pages
    const updatedPages = (cmsDataValue.pages || []).filter(p => !selectedPages.includes(p.id));
    savePages(updatedPages);
    
    // Clear selection
    selectedPages = [];
    selectAll = false;
  }

  function getSelectedCount() {
    return selectedPages.length;
  }

  function exportSelectedPages() {
    if (selectedPages.length === 0) return;
    
    const pagesToExport = (cmsDataValue.pages || []).filter(p => selectedPages.includes(p.id));
    const dataStr = JSON.stringify(pagesToExport, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `pages-export-${Date.now()}.json`;
    link.click();
    
    URL.revokeObjectURL(url);
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
      {#if selectedPages.length > 0}
        <div class="bulk-actions">
          <span class="selected-count">{selectedPages.length} selected</span>
          <button class="btn btn-secondary btn-sm" on:click={exportSelectedPages}>
            <i class="fas fa-download"></i> Export
          </button>
          <button class="btn btn-danger btn-sm" on:click={requestBulkDelete}>
            <i class="fas fa-trash"></i> Delete
          </button>
          <button class="btn btn-secondary btn-sm" on:click={() => { selectedPages = []; selectAll = false; }}>
            <i class="fas fa-times"></i> Cancel
          </button>
        </div>
      {:else}
        <button class="btn btn-primary btn-sm" on:click={handleNewPage}>
          <i class="fas fa-plus"></i>
          New Page
        </button>
      {/if}
    </div>
  </div>

  <div class="table-container">
    <table class="data-table">
      <thead>
        <tr>
          <th class="text-center" style="width: 40px;">
            <input
              type="checkbox"
              class="bulk-select-checkbox"
              checked={selectAll}
              on:change={toggleSelectAll}
              title="Select all pages"
            />
          </th>
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
            <td colspan="7" class="empty-state">
              <i class="fas fa-inbox"></i>
              <p>No pages found</p>
            </td>
          </tr>
        {:else}
          {#each filteredPages as page (page.id)}
            <tr class="table-row {selectedPages.includes(page.id) ? 'selected' : ''}">
              <td class="text-center">
                <input
                  type="checkbox"
                  class="bulk-select-checkbox"
                  checked={selectedPages.includes(page.id)}
                  on:change|stopPropagation={() => toggleSelectPage(page.id)}
                  title="Select {page.name}"
                />
              </td>
              <td>
                <div class="page-name" style="cursor: pointer;" on:click={() => editPage(page)}>
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
    <div class="editor-fullscreen">
      <div class="editor-header">
        <button class="btn-back" on:click={cancelEdit}>
          <i class="fas fa-arrow-left"></i> Back
        </button>
        <h2 style="flex: 1; margin: 0; font-size: 24px;">{cmsDataValue.pages.find(p => p.id === editingPage.id) ? 'Edit' : 'New'} Page</h2>
        <div class="editor-actions" style="display: flex; gap: 10px; align-items: center;">
          <select bind:value={currentLanguage} class="field-input" style="width: auto; padding: 6px 12px; height: 100%;">
            {#each availableLanguages as lang}
              <option value={lang.code}>{lang.name}</option>
            {/each}
          </select>
          <button class="btn btn-primary" on:click={savePage}>
            <i class="fas fa-save"></i> Save Page
          </button>
          {#if pageAutoSaved}
            <span class="autosaved-tick" title="Draft auto-saved">
              <i class="fas fa-check-circle"></i> Auto-saved
            </span>
          {/if}
        </div>
      </div>
      <div class="editor-fields">
        <div class="field-row">
          <label class="field-label">Page Name ({currentLanguage}) *</label>
          <input
            type="text"
            class="field-input"
            value={currentLangContent?.name || ''}
            on:input={(e) => saveLocalizedContent(currentLanguage, { name: e.target.value })}
            placeholder="Enter page name"
          />
        </div>
        <div class="field-row">
          <label class="field-label">Slug *</label>
          <input
            type="text"
            class="field-input"
            value={editingPage.slug || ''}
            on:input={(e) => saveLocalizedContent(currentLanguage, { slug: e.target.value })}
            placeholder="page-slug"
            disabled={editingPage.slug === 'home'}
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

      <ComponentEditor
        rows={currentLangContent?.components || []}
        {currentLanguage}
        {cmsDataValue}
        on:update={(e) => saveLocalizedContent(currentLanguage, { components: e.detail })}
      />
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

  <ConfirmModal
    isOpen={showBulkDeleteConfirm}
    title="Bulk Delete Pages"
    message="Are you sure you want to delete {selectedPages.length} page(s)? This action cannot be undone."
    confirmText="Delete All"
    cancelText="Cancel"
    isDestructive={true}
    onConfirm={confirmBulkDelete}
    onCancel={() => { showBulkDeleteConfirm = false; }}
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

  .editor-fullscreen {
    position: absolute;
    inset: 0;
    background: var(--bg-primary);
    z-index: 1000;
    padding: 30px;
    overflow-y: auto;
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
    background: var(--bg-primary);
    color: var(--text-primary);
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

  /* Bulk Operations Styles */
  .bulk-actions {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .selected-count {
    font-size: var(--text-sm);
    font-weight: 600;
    color: var(--color-primary);
    padding: 0 8px;
  }

  .btn-danger {
    background: #ef4444;
    color: white;
  }

  .btn-danger:hover {
    background: #dc2626;
  }

  .bulk-select-checkbox {
    width: 16px;
    height: 16px;
    cursor: pointer;
    accent-color: var(--color-primary);
  }

  .table-row.selected {
    background: rgba(37, 99, 235, 0.05);
  }

  .table-row.selected:hover {
    background: rgba(37, 99, 235, 0.1);
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

  .autosaved-tick {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    font-size: 12px;
    font-weight: 600;
    color: #16a34a;
    background: rgba(22, 163, 74, 0.1);
    border: 1px solid rgba(22, 163, 74, 0.3);
    padding: 4px 10px;
    border-radius: 20px;
    animation: autosave-fade 1.5s ease-in-out;
  }

  @keyframes autosave-fade {
    0%   { opacity: 0; transform: translateY(4px); }
    20%  { opacity: 1; transform: translateY(0); }
    80%  { opacity: 1; }
    100% { opacity: 0; }
  }
</style>
