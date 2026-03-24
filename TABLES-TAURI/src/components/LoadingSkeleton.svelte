<script>
</script>

<div class="loading-skeleton">
  <div class="skeleton-header"></div>
  <div class="skeleton-content">
    <div class="skeleton-line short"></div>
    <div class="skeleton-line"></div>
    <div class="skeleton-line"></div>
    <div class="skeleton-line long"></div>
  </div>
  <div class="skeleton-sidebar">
    <div class="skeleton-line"></div>
    <div class="skeleton-line"></div>
    <div class="skeleton-line"></div>
  </div>
</div>

<style>
  .loading-skeleton {
    padding: 20px;
  }
  
  .skeleton-header {
    height: 40px;
    background: linear-gradient(90deg, #e2e8f0 25%, #f1f5f9 50%, #e2e8f0 75%);
    background-size: 200% 100%;
    border-radius: 8px;
    margin-bottom: 20px;
    animation: shimmer 1.5s infinite;
  }
  
  .skeleton-content {
    background: white;
    border-radius: 8px;
    padding: 20px;
    margin-bottom: 20px;
  }
  
  .skeleton-line {
    height: 16px;
    background: linear-gradient(90deg, #e2e8f0 25%, #f1f5f9 50%, #e2e8f0 75%);
    background-size: 200% 100%;
    border-radius: 4px;
    margin-bottom: 12px;
    animation: shimmer 1.5s infinite;
  }
  
  .skeleton-line.short {
    width: 60%;
  }
  
  .skeleton-line.long {
    width: 80%;
  }
  
  .skeleton-sidebar {
    background: white;
    border-radius: 8px;
    padding: 20px;
  }
  
  @keyframes shimmer {
    0% { background-position: 200% 0; }
    100% { background-position: -200% 0; }
  }
</style>
