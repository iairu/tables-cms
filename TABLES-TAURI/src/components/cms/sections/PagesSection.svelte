<script>
  import { cmsData, savePages } from '../../../stores/cmsData.js';
  
  let cmsDataValue;
  const unsubscribe = cmsData.subscribe(value => cmsDataValue = value);
  
  let searchQuery = '';
  let selectedPage = null;
  
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
  
  function handleDeletePage(pageId) {
    if (confirm('Are you sure you want to delete this page?')) {
      savePages((cmsDataValue.pages || []).filter(p => p.id !== pageId));
    }
  }
  
  function handleSelectPage(page) {
    selectedPage = page;
  }
</script>

<div class="pages-section">
  <div class="section-header">
    <h2><i class="fas fa-file"></i> Pages</h2>
    <button class="btn-primary" on:click={handleNewPage}>
      <i class="fas fa-plus"></i> New Page
    </button>
  </div>
  
  <div class="pages-toolbar">
    <input
      type="text"
      class="search-input"
      placeholder="Search pages..."
      bind:value={searchQuery}
    />
  </div>
  
  <div class="pages-grid">
    {#each filteredPages as page}
      <div 
        class="page-card {selectedPage?.id === page.id ? 'selected' : ''}"
        on:click={() => handleSelectPage(page)}
      >
        <div class="page-card-header">
          <h3>{page.name || 'Untitled'}</h3>
          <button class="btn-icon btn-danger" on:click={(e) => { e.stopPropagation(); handleDeletePage(page.id); }}>
            <i class="fas fa-trash"></i>
          </button>
        </div>
        <div class="page-card-body">
          <p class="page-slug">/{page.slug || 'no-slug'}</p>
          <p class="page-meta">
            <i class="fas fa-clock"></i>
            {new Date(page.updatedAt || Date.now()).toLocaleDateString()}
          </p>
        </div>
      </div>
    {:else}
      <div class="empty-state">
        <i class="fas fa-file"></i>
        <p>No pages found</p>
        <button class="btn-primary" on:click={handleNewPage}>
          <i class="fas fa-plus"></i> Create your first page
        </button>
      </div>
    {/each}
  </div>
</div>

<style>
  .pages-section {
    padding: 20px;
  }
  
  .section-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 24px;
  }
  
  .section-header h2 {
    font-size: 24px;
    font-weight: 700;
    color: #0f172a;
    display: flex;
    align-items: center;
    gap: 12px;
  }
  
  .section-header h2 i {
    color: #2563eb;
  }
  
  .pages-toolbar {
    margin-bottom: 20px;
  }
  
  .search-input {
    width: 100%;
    max-width: 400px;
    padding: 10px 14px;
    border: 1px solid #e2e8f0;
    border-radius: 6px;
    font-size: 14px;
  }
  
  .search-input:focus {
    outline: none;
    border-color: #2563eb;
    box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
  }
  
  .pages-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 16px;
  }
  
  .page-card {
    background: white;
    border-radius: 8px;
    padding: 16px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    cursor: pointer;
    transition: all 0.2s;
    border: 2px solid transparent;
  }
  
  .page-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
  
  .page-card.selected {
    border-color: #2563eb;
  }
  
  .page-card-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 12px;
  }
  
  .page-card-header h3 {
    font-size: 16px;
    font-weight: 600;
    color: #0f172a;
    margin: 0;
  }
  
  .page-card-body {
    color: #64748b;
    font-size: 14px;
  }
  
  .page-slug {
    color: #2563eb;
    font-family: monospace;
    margin: 8px 0;
  }
  
  .page-meta {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 12px;
  }
  
  .btn-primary {
    padding: 10px 16px;
    border: none;
    background: #2563eb;
    color: white;
    border-radius: 6px;
    cursor: pointer;
    font-weight: 600;
    display: inline-flex;
    align-items: center;
    gap: 8px;
    transition: background 0.2s;
  }
  
  .btn-primary:hover {
    background: #1d4ed8;
  }
  
  .btn-icon {
    width: 32px;
    height: 32px;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s;
  }
  
  .btn-icon.btn-danger {
    background: #fee2e2;
    color: #ef4444;
  }
  
  .btn-icon.btn-danger:hover {
    background: #ef4444;
    color: white;
  }
  
  .empty-state {
    grid-column: 1 / -1;
    text-align: center;
    padding: 60px 20px;
    background: white;
    border-radius: 8px;
  }
  
  .empty-state i {
    font-size: 48px;
    color: #cbd5e1;
    margin-bottom: 16px;
  }
  
  .empty-state p {
    color: #64748b;
    margin-bottom: 20px;
  }
</style>
