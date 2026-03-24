<script>
  // Blog Section - Stub
  import { cmsData, saveBlogArticles } from '../../../stores/cmsData.js';
  let cmsDataValue;
  const unsubscribe = cmsData.subscribe(value => cmsDataValue = value);
  
  function handleNewArticle() {
    const newArticle = {
      id: Date.now().toString(),
      title: 'New Article',
      slug: 'new-article',
      content: '',
      excerpt: '',
      author: '',
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
    
    saveBlogArticles([...(cmsDataValue.blogArticles || []), newArticle]);
  }
</script>

<div class="section-placeholder">
  <div class="section-header">
    <h2><i class="fas fa-pen-fancy"></i> Blog Articles</h2>
    <button class="btn-primary" on:click={handleNewArticle}>
      <i class="fas fa-plus"></i> New Article
    </button>
  </div>
  
  {#if cmsDataValue?.blogArticles && cmsDataValue.blogArticles.length > 0}
    <div class="articles-list">
      {#each cmsDataValue.blogArticles as article}
        <div class="article-card">
          <h3>{article.title || 'Untitled'}</h3>
          <p class="article-meta">
            <i class="fas fa-calendar"></i>
            {new Date(article.createdAt || Date.now()).toLocaleDateString()}
          </p>
        </div>
      {/each}
    </div>
  {:else}
    <p class="empty-message">No blog articles yet. Create your first article!</p>
  {/if}
</div>

<style>
  .section-placeholder {
    padding: 40px;
  }
  
  .section-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 24px;
  }
  
  .section-header h2 {
    font-size: 24px;
    color: #0f172a;
    display: flex;
    align-items: center;
    gap: 12px;
  }
  
  .section-header h2 i {
    color: #2563eb;
  }
  
  .articles-list {
    display: grid;
    gap: 16px;
  }
  
  .article-card {
    background: white;
    padding: 20px;
    border-radius: 8px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  }
  
  .article-card h3 {
    margin: 0 0 8px 0;
    color: #0f172a;
  }
  
  .article-meta {
    color: #64748b;
    font-size: 14px;
    display: flex;
    align-items: center;
    gap: 8px;
  }
  
  .empty-message {
    text-align: center;
    color: #64748b;
    padding: 40px;
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
  }
  
  .btn-primary:hover {
    background: #1d4ed8;
  }
</style>
