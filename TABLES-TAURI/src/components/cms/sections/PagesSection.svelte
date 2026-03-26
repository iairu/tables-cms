<script>
  import { cmsData, savePages, saveComponentRows } from '../../../stores/cmsData.js';
  import AssetManagerModal from '../AssetManagerModal.svelte';
  import ConfirmModal from '../../ConfirmModal.svelte';

  let cmsDataValue;
  const unsubscribe = cmsData.subscribe(value => cmsDataValue = value);

  let searchQuery = '';
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
  let showPreview = false;

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
    editingPage = { ...newPage };
    isEditingPage = true;
    selectedPage = null;
  }

  function requestDeletePage(pageId) {
    deletePageId = pageId;
    showDeleteConfirm = true;
  }

  function confirmDeletePage() {
    showDeleteConfirm = false;
    if (deletePageId) {
      savePages((cmsDataValue.pages || []).filter(p => p.id !== deletePageId));
      if (editingPage?.id === deletePageId) {
        editingPage = null;
        isEditingPage = false;
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
    // Directly go to edit mode when clicking a page
    editingPage = { ...page };
    isEditingPage = true;
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
      editingPage = null;
      isEditingPage = false;
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

  function openPreview() {
    showPreview = true;
  }

  function closePreview() {
    showPreview = false;
  }

  // Generate preview HTML with theme
  function generatePreviewHTML(page, theme = 'default') {
    const themeCSS = getThemeCSS(theme);
    const componentsHTML = generateComponentsHTML(page.components || []);
    
    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${page.name || 'Page'}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css">
  <style>
    ${themeCSS}
    ${getBaseCSS()}
  </style>
</head>
<body class="theme-${theme}">
  <main class="page-content">
    ${componentsHTML}
  </main>
</body>
</html>`;
  }

  function getThemeCSS(themeName) {
    const themes = {
      'default': `
        :root {
          --color-primary: #2563eb;
          --color-primary-dark: #1d4ed8;
          --color-secondary: #10b981;
          --bg-primary: #ffffff;
          --bg-secondary: #f8fafc;
          --text-primary: #0f172a;
          --text-secondary: #475569;
          --border-light: #e2e8f0;
        }
      `,
      'synthwave': `
        :root {
          --color-primary: #ff6b9d;
          --color-primary-dark: #ff4785;
          --color-secondary: #00f5d4;
          --bg-primary: #2b213a;
          --bg-secondary: #362b48;
          --text-primary: #f5f5f5;
          --text-secondary: #e0e0e0;
          --border-light: #4a3f5c;
        }
      `,
      'matrix': `
        :root {
          --color-primary: #00ff41;
          --color-primary-dark: #00cc33;
          --color-secondary: #008f11;
          --bg-primary: #0d0208;
          --bg-secondary: #1a0510;
          --text-primary: #00ff41;
          --text-secondary: #00cc33;
          --border-light: #003311;
        }
      `,
      'monokai': `
        :root {
          --color-primary: #a6e22e;
          --color-primary-dark: #8bc31a;
          --color-secondary: #66d9ef;
          --bg-primary: #272822;
          --bg-secondary: #2d2e27;
          --text-primary: #f8f8f2;
          --text-secondary: #e8e8e3;
          --border-light: #3e3f38;
        }
      `,
      'github': `
        :root {
          --color-primary: #0366d6;
          --color-primary-dark: #0255b3;
          --color-secondary: #28a745;
          --bg-primary: #ffffff;
          --bg-secondary: #f6f8fa;
          --text-primary: #24292e;
          --text-secondary: #586069;
          --border-light: #e1e4e8;
        }
      `,
      'vscode': `
        :root {
          --color-primary: #007acc;
          --color-primary-dark: #005f9e;
          --color-secondary: #4ec9b0;
          --bg-primary: #1e1e1e;
          --bg-secondary: #252526;
          --text-primary: #d4d4d4;
          --text-secondary: #cccccc;
          --border-light: #3e3e42;
        }
      `,
      'anime': `
        :root {
          --color-primary: #ff6b9d;
          --color-primary-dark: #ff1493;
          --color-secondary: #7cfc00;
          --bg-primary: #ffeff5;
          --bg-secondary: #ffe0ed;
          --text-primary: #ff1493;
          --text-secondary: #ff6b9d;
          --border-light: #ffd1e6;
        }
      `,
      'historic': `
        :root {
          --color-primary: #8b4513;
          --color-primary-dark: #6b3410;
          --color-secondary: #556b2f;
          --bg-primary: #f4ecd8;
          --bg-secondary: #e8dcc4;
          --text-primary: #5c4b37;
          --text-secondary: #6d5c47;
          --border-light: #d4c8b0;
        }
      `,
      'senior': `
        :root {
          --color-primary: #0047ab;
          --color-primary-dark: #003380;
          --color-secondary: #008000;
          --bg-primary: #ffffff;
          --bg-secondary: #f0f0f0;
          --text-primary: #000000;
          --text-secondary: #1a1a1a;
          --border-light: #999999;
        }
      `,
      'ayu': `
        :root {
          --color-primary: #ffcc66;
          --color-primary-dark: #e6b85c;
          --color-secondary: #99e04b;
          --bg-primary: #1f2430;
          --bg-secondary: #252b38;
          --text-primary: #e6e1cf;
          --text-secondary: #d9d4c5;
          --border-light: #353b4a;
        }
      `
    };
    
    return themes[themeName] || themes['default'];
  }

  function getBaseCSS() {
    return `
      * { box-sizing: border-box; margin: 0; padding: 0; }
      body {
        font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        background: var(--bg-primary);
        color: var(--text-primary);
        line-height: 1.6;
      }
      .page-content { max-width: 1200px; margin: 0 auto; padding: 20px; }
      
      /* Component Styles */
      .component-hero {
        min-height: 60vh;
        display: flex;
        align-items: center;
        justify-content: center;
        text-align: center;
        padding: 80px 20px;
        background: linear-gradient(135deg, var(--color-primary), var(--color-primary-dark));
        color: white;
        border-radius: 12px;
        margin-bottom: 40px;
      }
      .hero-title { font-size: 3rem; margin-bottom: 16px; }
      .hero-subtitle { font-size: 1.25rem; opacity: 0.9; margin-bottom: 32px; }
      .btn {
        display: inline-block;
        padding: 12px 24px;
        border-radius: 6px;
        font-weight: 600;
        text-decoration: none;
        background: white;
        color: var(--color-primary);
      }
      
      .component-text { padding: 60px 20px; max-width: 800px; margin: 0 auto; }
      .text-content { font-size: 1.1rem; line-height: 1.8; }
      
      .component-image { padding: 40px 20px; text-align: center; }
      .component-image img { max-width: 100%; border-radius: 8px; }
      
      .component-video { padding: 40px 20px; }
      .video-wrapper { position: relative; padding-bottom: 56.25%; height: 0; }
      .video-wrapper iframe { position: absolute; top: 0; left: 0; width: 100%; height: 100%; border-radius: 8px; }
      
      .component-features { padding: 80px 20px; background: var(--bg-secondary); border-radius: 12px; margin-bottom: 40px; }
      .component-features h2 { text-align: center; margin-bottom: 40px; font-size: 2rem; }
      .features-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 32px; max-width: 1200px; margin: 0 auto; }
      .feature-card { background: var(--bg-primary); padding: 32px; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); text-align: center; }
      .feature-card i { font-size: 2.5rem; color: var(--color-primary); margin-bottom: 16px; }
      
      .component-cta { padding: 80px 20px; text-align: center; background: linear-gradient(135deg, var(--color-primary), var(--color-secondary)); color: white; border-radius: 12px; margin-bottom: 40px; }
      .component-cta h2 { font-size: 2rem; margin-bottom: 16px; }
      .component-cta .btn { background: white; color: var(--color-primary); }
      
      .component-blog-list { padding: 80px 20px; }
      .component-blog-list h2 { text-align: center; margin-bottom: 40px; font-size: 2rem; }
      .blog-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 32px; max-width: 1200px; margin: 0 auto; }
      .blog-card { background: var(--bg-primary); border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
      .blog-card img { width: 100%; height: 200px; object-fit: cover; }
      .blog-card h3 { padding: 16px 16px 8px; font-size: 1.25rem; }
      .blog-card .blog-excerpt { padding: 0 16px 16px; color: var(--text-secondary); }
      
      .component-infobar { display: flex; gap: 20px; padding: 20px; background: var(--bg-secondary); border-radius: 8px; margin-bottom: 20px; flex-wrap: wrap; }
      .infobar-item { display: flex; align-items: center; gap: 8px; padding: 12px 16px; background: var(--bg-primary); border-radius: 6px; }
      
      .component-ranking { padding: 60px 20px; }
      .component-ranking h2 { text-align: center; margin-bottom: 40px; }
      .ranking-list { max-width: 800px; margin: 0 auto; }
      .ranking-item { display: flex; align-items: center; gap: 16px; padding: 16px; background: var(--bg-secondary); margin-bottom: 12px; border-radius: 8px; }
      .ranking-number { width: 40px; height: 40px; background: var(--color-primary); color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; }
      
      .component-reviews { padding: 80px 20px; background: var(--bg-secondary); border-radius: 12px; }
      .component-reviews h2 { text-align: center; margin-bottom: 40px; }
      .reviews-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 24px; max-width: 1200px; margin: 0 auto; }
      .review-card { background: var(--bg-primary); padding: 24px; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
      .review-stars { color: #fbbf24; margin-bottom: 12px; }
      .review-text { font-style: italic; color: var(--text-secondary); margin-bottom: 16px; }
      .review-author { font-weight: 600; color: var(--text-primary); }
    `;
  }

  function generateComponentsHTML(components) {
    return components.map(comp => {
      const { type, props = {} } = comp;
      
      switch (type) {
        case 'hero':
          return `
            <section class="component-hero">
              ${props.image ? `<img src="${props.image}" alt="${props.title || ''}" class="hero-image" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; object-fit: cover; opacity: 0.3;">` : ''}
              <div style="position: relative; z-index: 1;">
                <h1 class="hero-title">${props.title || ''}</h1>
                ${props.subtitle ? `<p class="hero-subtitle">${props.subtitle}</p>` : ''}
                ${props.ctaText ? `<a href="${props.ctaLink || '#'}" class="btn">${props.ctaText}</a>` : ''}
              </div>
            </section>
          `;
        
        case 'text':
          return `<section class="component-text"><div class="text-content">${props.content || ''}</div></section>`;
        
        case 'image':
          return `
            <section class="component-image">
              <img src="${props.src || ''}" alt="${props.alt || ''}">
              ${props.caption ? `<p class="image-caption">${props.caption}</p>` : ''}
            </section>
          `;
        
        case 'video':
          return `
            <section class="component-video">
              <div class="video-wrapper">
                <iframe src="${props.url || ''}" frameborder="0" allowfullscreen></iframe>
              </div>
            </section>
          `;
        
        case 'features':
          return `
            <section class="component-features">
              <h2>${props.title || 'Features'}</h2>
              <div class="features-grid">
                ${(props.items || []).map(item => `
                  <div class="feature-card">
                    ${item.icon ? `<i class="${item.icon}"></i>` : ''}
                    <h3>${item.title || ''}</h3>
                    <p>${item.description || ''}</p>
                  </div>
                `).join('')}
              </div>
            </section>
          `;
        
        case 'cta':
          return `
            <section class="component-cta">
              <h2>${props.title || ''}</h2>
              <p>${props.description || ''}</p>
              <a href="${props.link || '#'}" class="btn">${props.buttonText || 'Get Started'}</a>
            </section>
          `;
        
        case 'blog-list':
          return `
            <section class="component-blog-list">
              <h2>${props.title || 'Latest Articles'}</h2>
              <div class="blog-grid">
                <div class="blog-card">
                  <div style="height: 200px; background: var(--bg-secondary);"></div>
                  <h3>Sample Blog Post</h3>
                  <p class="blog-excerpt">This is a preview of how blog posts will appear.</p>
                </div>
              </div>
            </section>
          `;
        
        case 'infobar':
          return `
            <section class="component-infobar">
              ${(props.items || []).map(item => `
                <div class="infobar-item">
                  ${item.icon ? `<i class="${item.icon}"></i>` : ''}
                  <span>${item.text || ''}</span>
                </div>
              `).join('')}
            </section>
          `;
        
        case 'ranking':
          return `
            <section class="component-ranking">
              <h2>${props.title || 'Rankings'}</h2>
              <div class="ranking-list">
                ${(props.items || []).map((item, i) => `
                  <div class="ranking-item">
                    <div class="ranking-number">${i + 1}</div>
                    <div>
                      <h3>${item.title || ''}</h3>
                      <p>${item.description || ''}</p>
                    </div>
                  </div>
                `).join('')}
              </div>
            </section>
          `;
        
        case 'reviews':
          return `
            <section class="component-reviews">
              <h2>${props.title || 'Reviews'}</h2>
              <div class="reviews-grid">
                ${(props.items || []).map(item => `
                  <div class="review-card">
                    <div class="review-stars">${'★'.repeat(item.rating || 5)}</div>
                    <p class="review-text">"${item.text || ''}"</p>
                    <p class="review-author">— ${item.name || 'Anonymous'}</p>
                  </div>
                `).join('')}
              </div>
            </section>
          `;
        
        default:
          return '';
      }
    }).join('');
  }

  function getCurrentTheme() {
    return cmsDataValue?.settings?.theme || 'default';
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
    <div class="pages-list-panel {isEditingPage ? 'collapsed' : ''}">
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
            class="page-item {editingPage?.id === page.id ? 'active' : ''}"
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
      {#if !isEditingPage}
        <div class="no-selection">
          <i class="fas fa-file"></i>
          <h3>Select a Page</h3>
          <p>Click a page to edit or create a new one</p>
          <button class="btn-primary" on:click={handleNewPage}>
            <i class="fas fa-plus"></i> Create Page
          </button>
        </div>
      {:else if editingPage}
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
            <button class="btn-secondary" on:click={openPreview} title="Preview Page">
              <i class="fas fa-eye"></i> Preview
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

  <!-- Page Preview Modal -->
  {#if showPreview && editingPage}
    <div class="preview-overlay" on:click={closePreview}>
      <div class="preview-modal" on:click|stopPropagation>
        <div class="preview-header">
          <div class="preview-title">
            <i class="fas fa-desktop"></i>
            <span>Page Preview - {editingPage.name}</span>
          </div>
          <div class="preview-actions">
            <span class="theme-badge">
              <i class="fas fa-palette"></i>
              {getCurrentTheme()}
            </span>
            <button class="btn-close" on:click={closePreview}>
              <i class="fas fa-times"></i>
            </button>
          </div>
        </div>
        <div class="preview-body">
          <iframe
            srcdoc={generatePreviewHTML(editingPage, getCurrentTheme())}
            title="Page Preview"
            sandbox="allow-same-origin"
          ></iframe>
        </div>
      </div>
    </div>
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
    background: var(--bg-card, white);
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
    background: var(--bg-card, white);
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

  /* Page Preview Modal */
  .preview-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.7);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10000;
    animation: fadeIn 0.2s ease-out;
  }

  .preview-modal {
    background: var(--bg-card, white);
    border-radius: 12px;
    width: 95%;
    height: 95%;
    max-width: 1400px;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
    animation: slideUp 0.3s ease-out;
  }

  .preview-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px 20px;
    border-bottom: 1px solid var(--border-light, #e2e8f0);
    background: var(--bg-secondary, #f8fafc);
  }

  .preview-title {
    display: flex;
    align-items: center;
    gap: 12px;
    font-size: 16px;
    font-weight: 600;
    color: var(--text-primary, #0f172a);
  }

  .preview-title i {
    color: var(--color-primary, #2563eb);
  }

  .preview-actions {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .theme-badge {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 6px 12px;
    background: var(--bg-tertiary, #f1f5f9);
    border-radius: 6px;
    font-size: 13px;
    color: var(--text-secondary, #475569);
  }

  .theme-badge i {
    color: var(--color-primary, #2563eb);
  }

  .btn-close {
    width: 32px;
    height: 32px;
    border: none;
    border-radius: 6px;
    background: var(--bg-tertiary, #f1f5f9);
    color: var(--text-secondary, #64748b);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s;
  }

  .btn-close:hover {
    background: #ef4444;
    color: white;
  }

  .preview-body {
    flex: 1;
    overflow: hidden;
    background: var(--bg-primary, #f8fafc);
  }

  .preview-body iframe {
    width: 100%;
    height: 100%;
    border: none;
  }

  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  @keyframes slideUp {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
</style>
