<script>
  import { cmsData, saveBlogArticles } from '../../../stores/cmsData.js';
  import AssetManagerModal from '../AssetManagerModal.svelte';
  import ConfirmModal from '../../ConfirmModal.svelte';
  
  let cmsDataValue;
  const unsubscribe = cmsData.subscribe(value => cmsDataValue = value);
  
  let searchQuery = '';
  let isEditingArticle = false;
  let editingArticle = null;
  let showAssetManager = false;
  let activeField = null;
  let activeLanguage = 'en';
  let showTranslations = false;
  let showDeleteConfirm = false;
  let deleteArticleId = null;
  let isSaving = false;
  let lastSaved = null;
  let saveError = null;
  
  // Supported languages
  const languages = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'es', name: 'Español', flag: '🇪🇸' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
    { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
    { code: 'it', name: 'Italiano', flag: '🇮🇹' },
    { code: 'pt', name: 'Português', flag: '🇵🇹' },
    { code: 'nl', name: 'Nederlands', flag: '🇳🇱' },
    { code: 'ja', name: '日本語', flag: '🇯🇵' },
    { code: 'zh', name: '中文', flag: '🇨🇳' },
    { code: 'ko', name: '한국어', flag: '🇰🇷' }
  ];
  
  // Rich text formatting toolbar
  const formattingOptions = [
    { icon: 'fa-bold', command: 'bold', title: 'Bold' },
    { icon: 'fa-italic', command: 'italic', title: 'Italic' },
    { icon: 'fa-underline', command: 'underline', title: 'Underline' },
    { icon: 'fa-strikethrough', command: 'strikeThrough', title: 'Strikethrough' },
    { type: 'separator' },
    { icon: 'fa-heading', command: 'formatBlock', value: 'h2', title: 'Heading 2' },
    { icon: 'fa-subscript', command: 'formatBlock', value: 'h3', title: 'Heading 3' },
    { icon: 'fa-paragraph', command: 'formatBlock', value: 'p', title: 'Paragraph' },
    { type: 'separator' },
    { icon: 'fa-list-ul', command: 'insertUnorderedList', title: 'Bullet List' },
    { icon: 'fa-list-ol', command: 'insertOrderedList', title: 'Numbered List' },
    { type: 'separator' },
    { icon: 'fa-quote-left', command: 'formatBlock', value: 'blockquote', title: 'Quote' },
    { icon: 'fa-code', command: 'formatBlock', value: 'pre', title: 'Code Block' },
    { type: 'separator' },
    { icon: 'fa-link', command: 'createLink', title: 'Insert Link', prompt: true },
    { icon: 'fa-image', command: 'insertImage', title: 'Insert Image', prompt: true },
    { type: 'separator' },
    { icon: 'fa-undo', command: 'undo', title: 'Undo' },
    { icon: 'fa-redo', command: 'redo', title: 'Redo' }
  ];
  
  $: filteredArticles = cmsDataValue?.blogArticles?.filter(article =>
    !searchQuery ||
    article.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    article.excerpt?.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];
  
  function handleNewArticle() {
    const newArticle = {
      id: Date.now().toString(),
      title: 'New Article',
      slug: 'new-article',
      content: '',
      excerpt: '',
      author: '',
      image: '',
      status: 'draft',
      publishedAt: null,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      translations: {},
      tags: [],
      category: ''
    };

    saveBlogArticles([...(cmsDataValue.blogArticles || []), newArticle]);
    editingArticle = { ...newArticle };
    isEditingArticle = true;
    selectedArticle = null;
  }

  function requestDeleteArticle(articleId) {
    deleteArticleId = articleId;
    showDeleteConfirm = true;
  }

  function confirmDeleteArticle() {
    showDeleteConfirm = false;
    if (deleteArticleId) {
      saveBlogArticles((cmsDataValue.blogArticles || []).filter(a => a.id !== deleteArticleId));
      if (editingArticle?.id === deleteArticleId) {
        editingArticle = null;
        isEditingArticle = false;
      }
      deleteArticleId = null;
    }
  }

  function cancelDeleteArticle() {
    showDeleteConfirm = false;
    deleteArticleId = null;
  }

  function handleSelectArticle(article) {
    // Directly go to edit mode when clicking an article
    editingArticle = { ...article, translations: { ...article.translations } };
    isEditingArticle = true;
  }

  function handleSaveArticle() {
    if (!editingArticle) return;

    isSaving = true;
    saveError = null;

    try {
      const articles = (cmsDataValue.blogArticles || []).map(a =>
        a.id === editingArticle.id ? { ...editingArticle, updatedAt: Date.now() } : a
      );

      saveBlogArticles(articles);
      editingArticle = null;
      isEditingArticle = false;
      lastSaved = new Date();
      
      // Clear saved indicator after 3 seconds
      setTimeout(() => {
        lastSaved = null;
      }, 3000);
    } catch (error) {
      saveError = 'Failed to save article';
      console.error('Save error:', error);
    } finally {
      isSaving = false;
    }
  }
  
  function handleCancelEdit() {
    isEditingArticle = false;
    editingArticle = null;
  }
  
  function handlePublishArticle() {
    if (!editingArticle) return;
    
    editingArticle = {
      ...editingArticle,
      status: 'published',
      publishedAt: Date.now()
    };
  }
  
  function handleUnpublishArticle() {
    if (!editingArticle) return;
    
    editingArticle = {
      ...editingArticle,
      status: 'draft',
      publishedAt: null
    };
  }
  
  function execCommand(command, value = null, usePrompt = false) {
    let inputValue = value;
    
    if (usePrompt) {
      if (command === 'createLink') {
        inputValue = prompt('Enter URL:', 'https://');
      } else if (command === 'insertImage') {
        handleOpenAssetManager('content');
        return;
      }
    }
    
    if (inputValue) {
      document.execCommand(command, false, inputValue);
    }
  }
  
  function handleOpenAssetManager(field) {
    activeField = field;
    showAssetManager = true;
  }
  
  function handleAssetSelect(asset) {
    const url = asset.url || asset;
    
    if (activeField === 'content') {
      document.execCommand('insertImage', false, url);
    } else if (editingArticle) {
      editingArticle = {
        ...editingArticle,
        [activeField]: url
      };
    }
    
    showAssetManager = false;
  }
  
  function handleAddTag(tag) {
    if (!editingArticle || !tag.trim()) return;
    
    editingArticle = {
      ...editingArticle,
      tags: [...(editingArticle.tags || []), tag.trim()]
    };
  }
  
  function handleRemoveTag(tagIndex) {
    if (!editingArticle) return;
    
    editingArticle = {
      ...editingArticle,
      tags: (editingArticle.tags || []).filter((_, i) => i !== tagIndex)
    };
  }
  
  function getTranslation(field) {
    if (!editingArticle) return '';
    return editingArticle.translations?.[activeLanguage]?.[field] || editingArticle[field] || '';
  }
  
  function setTranslation(field, value) {
    if (!editingArticle) return;
    
    const translations = {
      ...(editingArticle.translations || {}),
      [activeLanguage]: {
        ...(editingArticle.translations?.[activeLanguage] || {}),
        [field]: value
      }
    };
    
    editingArticle = { ...editingArticle, translations };
  }
  
  function toggleTranslations() {
    showTranslations = !showTranslations;
  }
  
  function addTranslation() {
    showTranslations = true;
    activeLanguage = 'es';
  }

  function getStatusBadgeClass(status) {
    return status === 'published' ? 'badge-published' : 'badge-draft';
  }
</script>
<div class="blog-section-compact">
  <div class="section-toolbar">
    <div class="toolbar-left">
      <h2 class="section-title">
        <i class="fas fa-pen-fancy"></i>
        Blog Articles
        <span class="badge">{filteredArticles.length}</span>
      </h2>
    </div>
    <div class="toolbar-right">
      <div class="filters">
        <input
          type="text"
          class="search-input"
          placeholder="Search articles..."
          bind:value={searchQuery}
        />
      </div>
      <button class="btn btn-primary btn-sm" on:click={handleNewArticle}>
        <i class="fas fa-plus"></i>
        New Article
      </button>
    </div>
  </div>

  <div class="table-container">
    <table class="data-table">
      <thead>
        <tr>
          <th>Title</th>
          <th>Slug</th>
          <th>Status</th>
          <th>Category</th>
          <th>Date</th>
          <th class="text-center">Actions</th>
        </tr>
      </thead>
      <tbody>
        {#if filteredArticles.length === 0}
          <tr>
            <td colspan="6" class="empty-state">
              <i class="fas fa-inbox"></i>
              <p>No articles found</p>
            </td>
          </tr>
        {:else}
          {#each filteredArticles as article (article.id)}
            <tr class="table-row">
              <td>
                <div class="item-name" style="cursor: pointer;" on:click={() => handleSelectArticle(article)}>
                  <i class="fas fa-pen-fancy"></i>
                  <span>{article.title || 'Untitled'}</span>
                </div>
              </td>
              <td>
                <code class="slug-text">/{article.slug}</code>
              </td>
              <td>
                <span class="badge {article.status === 'published' ? 'badge-published' : 'badge-draft'}">
                  {article.status || 'draft'}
                </span>
              </td>
              <td>
                {article.category || '-'}
              </td>
              <td class="text-muted">
                {new Date(article.createdAt || Date.now()).toLocaleDateString()}
              </td>
              <td class="text-center">
                <div class="action-buttons">
                  <button
                    class="btn-icon btn-xs"
                    title="Edit"
                    on:click|stopPropagation={() => handleSelectArticle(article)}
                  >
                    <i class="fas fa-edit"></i>
                  </button>
                  <button
                    class="btn-icon btn-xs btn-danger"
                    title="Delete"
                    on:click|stopPropagation={() => requestDeleteArticle(article.id)}
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

  {#if isEditingArticle && editingArticle}
    <div class="editor-fullscreen">
      <div class="editor-container">
        <div class="editor-header">
          <button class="btn-back" on:click={handleCancelEdit}>
            <i class="fas fa-arrow-left"></i> Back
          </button>
          <div class="editor-actions">
            {#if lastSaved}
              <span class="save-status saved">
                <i class="fas fa-check"></i>
                Saved {lastSaved.toLocaleTimeString()}
              </span>
            {:else if saveError}
              <span class="save-status error">
                <i class="fas fa-exclamation-circle"></i>
                {saveError}
              </span>
            {:else if isSaving}
              <span class="save-status saving">
                <i class="fas fa-spinner fa-spin"></i>
                Saving...
              </span>
            {/if}
            
            <button class="btn-primary" on:click={handleSaveArticle}>
              <i class="fas fa-save"></i> Save
            </button>
            
            {#if editingArticle.status === 'published'}
              <button class="btn-secondary" on:click={handleUnpublishArticle}>
                <i class="fas fa-eye-slash"></i> Unpublish
              </button>
            {:else}
              <button class="btn-success" on:click={handlePublishArticle}>
                <i class="fas fa-check"></i> Publish
              </button>
            {/if}
          </div>
        </div>
        
        <div class="editor-content">
          <!-- Main Content -->
          <div class="content-section">
            <div class="form-row">
              <label>Title</label>
              {#if showTranslations}
                <div class="translation-input">
                  <select bind:value={activeLanguage} class="language-select">
                    {#each languages as lang}
                      <option value={lang.code}>{lang.flag} {lang.name}</option>
                    {/each}
                  </select>
                  <input
                    type="text"
                    class="title-input field-input"
                    value={getTranslation('title')}
                    on:input={(e) => setTranslation('title', e.target.value)}
                    placeholder="Article title"
                  />
                </div>
              {:else}
                <input
                  type="text"
                  class="title-input field-input"
                  bind:value={editingArticle.title}
                  placeholder="Article title"
                />
              {/if}
            </div>
            
            <div class="form-row">
              <label>Slug</label>
              <input
                type="text"
                class="slug-input field-input"
                bind:value={editingArticle.slug}
                placeholder="article-slug"
              />
            </div>
            
            <div class="form-row">
              <label>Excerpt</label>
              {#if showTranslations}
                <textarea
                  class="excerpt-input field-input"
                  value={getTranslation('excerpt')}
                  on:input={(e) => setTranslation('excerpt', e.target.value)}
                  placeholder="Brief description..."
                  rows="3"
                ></textarea>
              {:else}
                <textarea
                  class="excerpt-input field-input"
                  bind:value={editingArticle.excerpt}
                  placeholder="Brief description..."
                  rows="3"
                ></textarea>
              {/if}
            </div>
            
            <div class="form-row">
              <label>Featured Image</label>
              <div class="image-selector">
                {#if editingArticle.image}
                  <div class="image-preview">
                    <img src={editingArticle.image} alt="Featured" />
                    <button class="btn-icon btn-danger btn-xs" on:click={() => editingArticle.image = ''}>
                      <i class="fas fa-times"></i>
                    </button>
                  </div>
                {/if}
                <button class="btn-secondary" on:click={() => handleOpenAssetManager('image')}>
                  <i class="fas fa-upload"></i>
                  {editingArticle.image ? 'Change Image' : 'Upload Image'}
                </button>
              </div>
            </div>
            
            <div class="form-row">
              <label>Author</label>
              <input
                type="text"
                class="author-input field-input"
                bind:value={editingArticle.author}
                placeholder="Author name"
              />
            </div>
            
            <div class="form-row">
              <label>Category</label>
              <input
                type="text"
                class="category-input field-input"
                bind:value={editingArticle.category}
                placeholder="Category"
              />
            </div>
            
            <div class="form-row">
              <label>Tags</label>
              <div class="tags-input field-input" style="display: flex; flex-direction: column;">
                <div class="tags-list">
                  {#each editingArticle.tags || [] as tag, index}
                    <span class="tag group-tag">
                      {tag}
                      <button class="btn-icon btn-xs" on:click={() => handleRemoveTag(index)}>
                        <i class="fas fa-times"></i>
                      </button>
                    </span>
                  {/each}
                </div>
                <input
                  type="text"
                  class="tag-new-input"
                  style="background: transparent; color: var(--text-primary); border: none; margin-top: 5px; outline: none;"
                  placeholder="Add tag..."
                  on:keydown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddTag(e.target.value);
                      e.target.value = '';
                    }
                  }}
                />
              </div>
            </div>
            
            <div class="form-row full-width">
              <div class="toolbar-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                <label>Content</label>
                <button class="btn-secondary btn-sm" on:click={toggleTranslations}>
                  <i class="fas fa-language"></i>
                  {showTranslations ? 'Edit Primary' : 'Translations'}
                </button>
              </div>
              
              <div class="rich-text-editor field-input" style="padding: 0; display: flex; flex-direction: column;">
                <div class="toolbar" style="padding: 10px; border-bottom: 1px solid var(--border-light); background: var(--bg-secondary);">
                  {#each formattingOptions as option}
                    {#if option.type === 'separator'}
                      <span class="separator" style="border-left: 1px solid var(--border-light); margin: 0 5px;"></span>
                    {:else}
                      <button
                        class="toolbar-btn btn-icon"
                        style="display: inline-flex;"
                        title={option.title}
                        on:click={() => execCommand(option.command, option.value, option.prompt)}
                      >
                        <i class="fas {option.icon}"></i>
                      </button>
                    {/if}
                  {/each}
                </div>
                
                {#if showTranslations}
                  <div class="translation-editor" style="display: flex; flex-direction: column; flex: 1;">
                    <select bind:value={activeLanguage} class="language-select field-input" style="margin: 10px; width: auto; align-self: flex-start;">
                      {#each languages as lang}
                        <option value={lang.code}>{lang.flag} {lang.name}</option>
                      {/each}
                    </select>
                    <div
                      class="content-editor"
                      style="flex: 1; padding: 15px; min-height: 400px; outline: none;"
                      contenteditable="true"
                      innerHTML={getTranslation('content')}
                      on:input={(e) => setTranslation('content', e.target.innerHTML)}
                    ></div>
                  </div>
                {:else}
                  <div
                    class="content-editor"
                    style="padding: 15px; min-height: 400px; outline: none;"
                    contenteditable="true"
                    bind:innerHTML={editingArticle.content}
                    placeholder="Write your article content here..."
                  ></div>
                {/if}
              </div>
            </div>
          </div>
          
          <!-- Sidebar -->
          <div class="editor-sidebar">
            <div class="sidebar-section">
              <h3><i class="fas fa-cog"></i> Settings</h3>
              
              <div class="setting-row">
                <label>Status</label>
                <select bind:value={editingArticle.status} class="status-select field-input">
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                  <option value="scheduled">Scheduled</option>
                  <option value="archived">Archived</option>
                </select>
              </div>
              
              {#if editingArticle.status === 'scheduled'}
                <div class="setting-row">
                  <label>Publish Date</label>
                  <input
                    type="datetime-local"
                    bind:value={editingArticle.publishedAt}
                    class="date-input field-input"
                  />
                </div>
              {/if}
            </div>
            
            <div class="sidebar-section">
              <h3><i class="fas fa-language"></i> Translations</h3>
              <p class="help-text">
                Available translations:
              </p>
              <div class="translations-list">
                {#each Object.entries(editingArticle.translations || {}) as [lang, data]}
                  <div class="translation-item">
                    <span>
                      {languages.find(l => l.code === lang)?.flag || '🌐'}
                      {languages.find(l => l.code === lang)?.name || lang}
                    </span>
                    <button
                      class="btn-icon btn-xs"
                      on:click={() => {
                        activeLanguage = lang;
                        showTranslations = true;
                      }}
                    >
                      <i class="fas fa-edit"></i>
                    </button>
                  </div>
                {:else}
                  <p class="help-text">No translations yet</p>
                {/each}
              </div>
              <button class="btn-secondary btn-sm full-width" on:click={addTranslation}>
                <i class="fas fa-plus"></i> Add Translation
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  {/if}

  {#if showAssetManager}
    <AssetManagerModal
      onClose={() => showAssetManager = false}
      onSelect={handleAssetSelect}
    />
  {/if}
  
  <ConfirmModal
    isOpen={showDeleteConfirm}
    title="Delete Article"
    message="Are you sure you want to delete this article? This action cannot be undone."
    confirmText="Delete"
    cancelText="Cancel"
    isDestructive={true}
    onConfirm={confirmDeleteArticle}
    onCancel={cancelDeleteArticle}
  />
</div>

<style>
  .blog-section-compact {
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

  .badge-published {
    background: rgba(16, 185, 129, 0.1);
    color: #10b981;
  }

  .badge-draft {
    background: rgba(107, 114, 128, 0.1);
    color: var(--text-secondary);
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

  .editor-container {
    max-width: 1400px;
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

  .editor-actions {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .editor-content {
    display: flex;
    flex: 1;
    overflow: hidden;
  }

  .content-section {
    flex: 1;
    padding: 30px;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  .editor-sidebar {
    width: 300px;
    background: var(--bg-secondary);
    border-left: 1px solid var(--border-light);
    padding: 20px;
    overflow-y: auto;
  }

  .form-row {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .form-row label {
    font-weight: 600;
    color: var(--text-secondary);
    font-size: var(--text-sm);
  }

  .field-input {
    padding: 10px 14px;
    border: 1px solid var(--border-light);
    border-radius: var(--radius-md);
    font-size: var(--text-sm);
    background: var(--bg-primary);
    color: var(--text-primary);
    font-family: inherit;
  }

  .field-input:focus {
    outline: none;
    border-color: var(--color-primary);
  }

  .save-status {
    font-size: 13px;
    font-weight: 500;
  }

  .save-status.saved { color: #10b981; }
  .save-status.saving { color: var(--color-primary); }
  .save-status.error { color: #ef4444; }

  .btn-success {
    background: #10b981;
    color: white;
  }
  .btn-success:hover {
    background: #059669;
  }
  .btn-secondary {
    background: var(--bg-tertiary);
    color: var(--text-primary);
  }
  
  .image-selector {
    display: flex;
    flex-direction: column;
    gap: 10px;
    align-items: flex-start;
  }
  
  .image-preview {
    position: relative;
    border-radius: var(--radius-md);
    overflow: hidden;
    border: 1px solid var(--border-light);
  }
  
  .image-preview img {
    max-width: 200px;
    max-height: 150px;
    display: block;
  }
  
  .image-preview .btn-danger {
    position: absolute;
    top: 5px;
    right: 5px;
  }

  .sidebar-section {
    margin-bottom: 30px;
  }

  .sidebar-section h3 {
    font-size: 16px;
    margin-top: 0;
    margin-bottom: 15px;
    color: var(--text-primary);
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .setting-row {
    margin-bottom: 15px;
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .translations-list {
    display: flex;
    flex-direction: column;
    gap: 10px;
    margin-bottom: 15px;
  }

  .translation-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 8px 12px;
    background: var(--bg-primary);
    border: 1px solid var(--border-light);
    border-radius: var(--radius-md);
  }

  .help-text {
    font-size: 13px;
    color: var(--text-tertiary);
    margin-top: 0;
    margin-bottom: 10px;
  }
</style>
