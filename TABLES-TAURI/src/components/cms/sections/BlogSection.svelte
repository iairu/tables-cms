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

<div class="blog-section">
  <div class="blog-layout">
    <!-- Articles List -->
    <div class="articles-list-panel {isEditingArticle ? 'collapsed' : ''}">
      <div class="panel-header">
        <h2><i class="fas fa-pen-fancy"></i> Blog Articles</h2>
        <button class="btn-primary btn-sm" on:click={handleNewArticle}>
          <i class="fas fa-plus"></i> New
        </button>
      </div>
      
      <div class="search-box">
        <i class="fas fa-search"></i>
        <input
          type="text"
          placeholder="Search articles..."
          bind:value={searchQuery}
        />
      </div>
      
      <div class="articles-list">
        {#each filteredArticles as article}
          <div
            class="article-item {editingArticle?.id === article.id ? 'active' : ''}"
            on:click={() => handleSelectArticle(article)}
          >
            <div class="article-item-content">
              <h3>{article.title || 'Untitled'}</h3>
              <div class="article-meta">
                <span class={getStatusBadgeClass(article.status || 'draft')}>
                  {article.status || 'draft'}
                </span>
                <span class="article-date">
                  {new Date(article.createdAt || Date.now()).toLocaleDateString()}
                </span>
              </div>
            </div>
            <button
              class="btn-icon btn-danger btn-xs"
              on:click={(e) => { e.stopPropagation(); requestDeleteArticle(article.id); }}
            >
              <i class="fas fa-trash"></i>
            </button>
          </div>
        {:else}
          <div class="empty-state">
            <i class="fas fa-pen-fancy"></i>
            <p>No articles found</p>
          </div>
        {/each}
      </div>
    </div>
    
    <!-- Article Editor -->
    <div class="article-editor-panel">
      {#if !isEditingArticle}
        <div class="no-selection">
          <i class="fas fa-pen-fancy"></i>
          <h3>Select an Article</h3>
          <p>Click an article to edit or create a new one</p>
          <button class="btn-primary" on:click={handleNewArticle}>
            <i class="fas fa-plus"></i> Create Article
          </button>
        </div>
      {:else if editingArticle}
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
                      class="title-input"
                      value={getTranslation('title')}
                      on:input={(e) => setTranslation('title', e.target.value)}
                      placeholder="Article title"
                    />
                  </div>
                {:else}
                  <input
                    type="text"
                    class="title-input"
                    bind:value={editingArticle.title}
                    placeholder="Article title"
                  />
                {/if}
              </div>
              
              <div class="form-row">
                <label>Slug</label>
                <input
                  type="text"
                  class="slug-input"
                  bind:value={editingArticle.slug}
                  placeholder="article-slug"
                />
              </div>
              
              <div class="form-row">
                <label>Excerpt</label>
                {#if showTranslations}
                  <textarea
                    class="excerpt-input"
                    value={getTranslation('excerpt')}
                    on:input={(e) => setTranslation('excerpt', e.target.value)}
                    placeholder="Brief description..."
                    rows="3"
                  ></textarea>
                {:else}
                  <textarea
                    class="excerpt-input"
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
                  class="author-input"
                  bind:value={editingArticle.author}
                  placeholder="Author name"
                />
              </div>
              
              <div class="form-row">
                <label>Category</label>
                <input
                  type="text"
                  class="category-input"
                  bind:value={editingArticle.category}
                  placeholder="Category"
                />
              </div>
              
              <div class="form-row">
                <label>Tags</label>
                <div class="tags-input">
                  <div class="tags-list">
                    {#each editingArticle.tags || [] as tag, index}
                      <span class="tag">
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
                <div class="toolbar-header">
                  <label>Content</label>
                  <button class="btn-secondary btn-sm" on:click={toggleTranslations}>
                    <i class="fas fa-language"></i>
                    {showTranslations ? 'Edit Primary' : 'Translations'}
                  </button>
                </div>
                
                <div class="rich-text-editor">
                  <div class="toolbar">
                    {#each formattingOptions as option}
                      {#if option.type === 'separator'}
                        <span class="separator"></span>
                      {:else}
                        <button
                          class="toolbar-btn"
                          title={option.title}
                          on:click={() => execCommand(option.command, option.value, option.prompt)}
                        >
                          <i class="fas {option.icon}"></i>
                        </button>
                      {/if}
                    {/each}
                  </div>
                  
                  {#if showTranslations}
                    <div class="translation-editor">
                      <select bind:value={activeLanguage} class="language-select">
                        {#each languages as lang}
                          <option value={lang.code}>{lang.flag} {lang.name}</option>
                        {/each}
                      </select>
                      <div
                        class="content-editor"
                        contenteditable="true"
                        innerHTML={getTranslation('content')}
                        on:input={(e) => setTranslation('content', e.target.innerHTML)}
                      ></div>
                    </div>
                  {:else}
                    <div
                      class="content-editor"
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
                  <select bind:value={editingArticle.status} class="status-select">
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
                      class="date-input"
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
  .blog-section {
    height: calc(100vh - 140px);
    overflow: hidden;
  }
  
  .blog-layout {
    display: flex;
    gap: 20px;
    height: 100%;
  }
  
  .articles-list-panel {
    width: 340px;
    background: var(--bg-card, white);
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    display: flex;
    flex-direction: column;
    overflow: hidden;
    transition: width 0.3s;
  }
  
  .articles-list-panel.collapsed {
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
  
  .articles-list {
    flex: 1;
    overflow-y: auto;
    padding: 12px;
  }
  
  .article-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 14px 16px;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s;
    margin-bottom: 8px;
  }
  
  .article-item:hover {
    background: #f8fafc;
  }
  
  .article-item.active {
    background: #eff6ff;
    border: 1px solid #2563eb;
  }
  
  .article-item-content {
    flex: 1;
  }
  
  .article-item-content h3 {
    font-size: 14px;
    font-weight: 600;
    margin: 0 0 8px;
    color: #0f172a;
  }
  
  .article-meta {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  
  .badge-published,
  .badge-draft {
    font-size: 10px;
    padding: 2px 8px;
    border-radius: 12px;
    font-weight: 600;
    text-transform: uppercase;
  }
  
  .badge-published {
    background: #d1fae5;
    color: #065f46;
  }
  
  .badge-draft {
    background: #e2e8f0;
    color: #64748b;
  }
  
  .article-date {
    font-size: 11px;
    color: #94a3b8;
  }
  
  .article-editor-panel {
    flex: 1;
    background: var(--bg-card, white);
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
    justify-content: space-between;
  }
  
  .editor-actions {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .save-status {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 13px;
    font-weight: 500;
    padding: 6px 12px;
    border-radius: 6px;
    margin-right: 8px;
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
  
  .editor-content {
    flex: 1;
    overflow-y: auto;
    padding: 20px;
    display: flex;
    gap: 24px;
  }
  
  .content-section {
    flex: 1;
    max-width: 800px;
  }
  
  .form-row {
    margin-bottom: 20px;
  }
  
  .form-row.full-width {
    margin-bottom: 0;
  }
  
  .form-row label {
    display: block;
    font-size: 14px;
    font-weight: 600;
    color: #475569;
    margin-bottom: 8px;
  }
  
  .form-row input,
  .form-row textarea,
  .form-row select {
    width: 100%;
    padding: 10px 12px;
    border: 1px solid #e2e8f0;
    border-radius: 6px;
    font-size: 14px;
    font-family: inherit;
  }
  
  .form-row input:focus,
  .form-row textarea:focus,
  .form-row select:focus {
    outline: none;
    border-color: #2563eb;
    box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
  }
  
  .title-input {
    font-size: 24px !important;
    font-weight: 600 !important;
  }
  
  .slug-input {
    font-family: monospace !important;
  }
  
  .image-selector {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
  
  .image-preview {
    position: relative;
    display: inline-block;
  }
  
  .image-preview img {
    max-width: 300px;
    max-height: 200px;
    border-radius: 8px;
    object-fit: cover;
  }
  
  .image-preview .btn-icon {
    position: absolute;
    top: 8px;
    right: 8px;
  }
  
  .tags-input {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    align-items: center;
  }
  
  .tags-list {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
  }
  
  .tag {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    background: #e2e8f0;
    color: #475569;
    padding: 4px 10px;
    border-radius: 16px;
    font-size: 13px;
  }
  
  .tag .btn-icon {
    width: 16px;
    height: 16px;
  }
  
  .tag-new-input {
    flex: 1;
    min-width: 120px;
  }
  
  .toolbar-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 8px;
  }
  
  .toolbar-header label {
    margin: 0;
  }
  
  .rich-text-editor {
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    overflow: hidden;
  }
  
  .toolbar {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
    padding: 8px;
    background: #f8fafc;
    border-bottom: 1px solid #e2e8f0;
  }
  
  .toolbar-btn {
    width: 32px;
    height: 32px;
    border: none;
    background: transparent;
    border-radius: 4px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #475569;
    transition: all 0.2s;
  }
  
  .toolbar-btn:hover {
    background: #e2e8f0;
    color: #0f172a;
  }
  
  .separator {
    width: 1px;
    background: #e2e8f0;
    margin: 0 4px;
  }
  
  .content-editor {
    min-height: 400px;
    padding: 16px;
    outline: none;
    line-height: 1.8;
  }
  
  .content-editor:empty:before {
    content: attr(placeholder);
    color: #94a3b8;
  }
  
  .translation-editor {
    display: flex;
    flex-direction: column;
  }
  
  .language-select {
    padding: 8px 12px;
    border: none;
    border-bottom: 1px solid #e2e8f0;
    background: var(--bg-card, white);
    font-size: 14px;
    cursor: pointer;
  }
  
  .translation-input {
    display: flex;
    gap: 8px;
    align-items: center;
  }
  
  .translation-input .language-select {
    width: auto;
    border: 1px solid #e2e8f0;
    border-radius: 6px;
  }
  
  .editor-sidebar {
    width: 280px;
    flex-shrink: 0;
  }
  
  .sidebar-section {
    background: #f8fafc;
    border-radius: 8px;
    padding: 16px;
    margin-bottom: 16px;
  }
  
  .sidebar-section h3 {
    font-size: 14px;
    font-weight: 600;
    color: #0f172a;
    margin: 0 0 12px;
    display: flex;
    align-items: center;
    gap: 8px;
  }
  
  .sidebar-section h3 i {
    color: #2563eb;
  }
  
  .setting-row {
    margin-bottom: 12px;
  }
  
  .setting-row label {
    display: block;
    font-size: 12px;
    font-weight: 600;
    color: #64748b;
    margin-bottom: 6px;
    text-transform: uppercase;
  }
  
  .setting-row select,
  .setting-row input {
    width: 100%;
    padding: 8px 10px;
    border: 1px solid #e2e8f0;
    border-radius: 6px;
    font-size: 13px;
  }
  
  .translations-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin-bottom: 12px;
  }
  
  .translation-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 8px 10px;
    background: var(--bg-card, white);
    border-radius: 6px;
    font-size: 13px;
  }
  
  .help-text {
    font-size: 12px;
    color: #64748b;
    font-style: italic;
  }
  
  .full-width {
    width: 100%;
  }
  
  .preview-header {
    padding: 20px;
    border-bottom: 1px solid #e2e8f0;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  
  .preview-header h2 {
    font-size: 24px;
    margin: 0 0 8px;
  }
  
  .preview-meta {
    display: flex;
    align-items: center;
    gap: 12px;
    font-size: 14px;
    color: #64748b;
  }
  
  .preview-actions {
    display: flex;
    gap: 8px;
  }
  
  .preview-content {
    padding: 20px;
    max-width: 800px;
  }
  
  .featured-image {
    width: 100%;
    max-height: 400px;
    object-fit: cover;
    border-radius: 12px;
    margin-bottom: 24px;
  }
  
  .excerpt {
    font-size: 18px;
    color: #64748b;
    margin-bottom: 24px;
    line-height: 1.6;
  }
  
  .article-body {
    font-size: 16px;
    line-height: 1.8;
  }
  
  .tags-section {
    margin-top: 32px;
    padding-top: 24px;
    border-top: 1px solid #e2e8f0;
  }
  
  .tags-section h4 {
    font-size: 14px;
    font-weight: 600;
    color: #64748b;
    margin-bottom: 12px;
    text-transform: uppercase;
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
    background: var(--color-primary, #2563eb);
    color: white;
  }

  .btn-primary:hover {
    background: var(--color-primary-dark, #1d4ed8);
  }

  .btn-secondary {
    background: var(--bg-card, white);
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
    width: 20px;
    height: 20px;
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
  
  @media (max-width: 1024px) {
    .editor-content {
      flex-direction: column;
    }
    
    .editor-sidebar {
      width: 100%;
    }
  }
</style>
