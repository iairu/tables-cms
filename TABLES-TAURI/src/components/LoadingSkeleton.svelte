<script>
  // Loading skeleton for CMS content areas
  // No imports needed for this component
  export let type = 'default';
</script>

<div class="loading-skeleton {type}">
  {#if type === 'default' || type === 'cards'}
    <div class="skeleton-grid">
      {#each Array(6) as _, i}
        <div class="skeleton-card">
          <div class="skeleton-image"></div>
          <div class="skeleton-title"></div>
          <div class="skeleton-text short"></div>
          <div class="skeleton-text"></div>
        </div>
      {/each}
    </div>
  {:else if type === 'list'}
    <div class="skeleton-list">
      {#each Array(8) as _, i}
        <div class="skeleton-list-item">
          <div class="skeleton-avatar"></div>
          <div class="skeleton-content">
            <div class="skeleton-title"></div>
            <div class="skeleton-text short"></div>
          </div>
        </div>
      {/each}
    </div>
  {:else if type === 'table'}
    <div class="skeleton-table">
      {#each Array(10) as _, i}
        <div class="skeleton-table-row">
          <div class="skeleton-cell wide"></div>
          <div class="skeleton-cell"></div>
          <div class="skeleton-cell"></div>
          <div class="skeleton-cell narrow"></div>
        </div>
      {/each}
    </div>
  {:else if type === 'form'}
    <div class="skeleton-form">
      <div class="skeleton-form-row">
        <div class="skeleton-label"></div>
        <div class="skeleton-input"></div>
      </div>
      <div class="skeleton-form-row">
        <div class="skeleton-label"></div>
        <div class="skeleton-input"></div>
      </div>
      <div class="skeleton-form-row">
        <div class="skeleton-label"></div>
        <div class="skeleton-input tall"></div>
      </div>
    </div>
  {:else if type === 'blog'}
    <div class="skeleton-blog">
      {#each Array(4) as _, i}
        <div class="skeleton-article">
          <div class="skeleton-article-image"></div>
          <div class="skeleton-article-content">
            <div class="skeleton-article-title"></div>
            <div class="skeleton-article-meta"></div>
            <div class="skeleton-article-excerpt"></div>
            <div class="skeleton-article-excerpt short"></div>
          </div>
        </div>
      {/each}
    </div>
  {/if}
</div>

<style>
  .loading-skeleton {
    padding: 20px;
    animation: skeleton-pulse 1.5s ease-in-out infinite;
  }

  @keyframes skeleton-pulse {
    0%, 100% {
      opacity: 1;
    }
    50% {
      opacity: 0.6;
    }
  }

  .skeleton-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 20px;
  }

  .skeleton-card {
    background: var(--bg-card, white);
    border-radius: 12px;
    padding: 16px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  }

  .skeleton-image {
    height: 160px;
    background: linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%);
    background-size: 200% 100%;
    animation: skeleton-shimmer 1.5s ease-in-out infinite;
    border-radius: 8px;
    margin-bottom: 12px;
  }

  .skeleton-title {
    height: 20px;
    background: linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%);
    background-size: 200% 100%;
    animation: skeleton-shimmer 1.5s ease-in-out infinite;
    border-radius: 4px;
    width: 80%;
    margin-bottom: 8px;
  }

  .skeleton-text {
    height: 14px;
    background: linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%);
    background-size: 200% 100%;
    animation: skeleton-shimmer 1.5s ease-in-out infinite;
    border-radius: 4px;
    margin-bottom: 6px;
  }

  .skeleton-text.short {
    width: 60%;
  }

  @keyframes skeleton-shimmer {
    0% {
      background-position: 200% 0;
    }
    100% {
      background-position: -200% 0;
    }
  }

  .skeleton-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .skeleton-list-item {
    display: flex;
    align-items: center;
    gap: 16px;
    background: var(--bg-card, white);
    padding: 16px;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  }

  .skeleton-avatar {
    width: 48px;
    height: 48px;
    border-radius: 50%;
    background: linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%);
    background-size: 200% 100%;
    animation: skeleton-shimmer 1.5s ease-in-out infinite;
    flex-shrink: 0;
  }

  .skeleton-content {
    flex: 1;
  }

  .skeleton-table {
    background: var(--bg-card, white);
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  }

  .skeleton-table-row {
    display: grid;
    grid-template-columns: 2fr 1fr 1fr 80px;
    gap: 1px;
    background: #e2e8f0;
    border-bottom: 1px solid #e2e8f0;
  }

  .skeleton-table-row:last-child {
    border-bottom: none;
  }

  .skeleton-cell {
    height: 48px;
    background: var(--bg-card, white);
    padding: 12px 16px;
  }

  .skeleton-cell > * {
    height: 100%;
    background: linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%);
    background-size: 200% 100%;
    animation: skeleton-shimmer 1.5s ease-in-out infinite;
    border-radius: 4px;
  }

  .skeleton-cell.wide > * {
    width: 80%;
  }

  .skeleton-cell.narrow > * {
    width: 40%;
  }

  .skeleton-form {
    background: var(--bg-card, white);
    padding: 24px;
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  }

  .skeleton-form-row {
    margin-bottom: 20px;
  }

  .skeleton-form-row:last-child {
    margin-bottom: 0;
  }

  .skeleton-label {
    height: 14px;
    width: 100px;
    background: linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%);
    background-size: 200% 100%;
    animation: skeleton-shimmer 1.5s ease-in-out infinite;
    border-radius: 4px;
    margin-bottom: 8px;
  }

  .skeleton-input {
    height: 40px;
    background: linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%);
    background-size: 200% 100%;
    animation: skeleton-shimmer 1.5s ease-in-out infinite;
    border-radius: 6px;
  }

  .skeleton-input.tall {
    height: 120px;
  }

  .skeleton-blog {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 24px;
  }

  .skeleton-article {
    background: var(--bg-card, white);
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  }

  .skeleton-article-image {
    height: 200px;
    background: linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%);
    background-size: 200% 100%;
    animation: skeleton-shimmer 1.5s ease-in-out infinite;
  }

  .skeleton-article-content {
    padding: 20px;
  }

  .skeleton-article-title {
    height: 24px;
    background: linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%);
    background-size: 200% 100%;
    animation: skeleton-shimmer 1.5s ease-in-out infinite;
    border-radius: 4px;
    width: 90%;
    margin-bottom: 12px;
  }

  .skeleton-article-meta {
    height: 14px;
    width: 120px;
    background: linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%);
    background-size: 200% 100%;
    animation: skeleton-shimmer 1.5s ease-in-out infinite;
    border-radius: 4px;
    margin-bottom: 12px;
  }

  .skeleton-article-excerpt {
    height: 14px;
    background: linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%);
    background-size: 200% 100%;
    animation: skeleton-shimmer 1.5s ease-in-out infinite;
    border-radius: 4px;
    margin-bottom: 6px;
  }

  .skeleton-article-excerpt.short {
    width: 70%;
  }
</style>
