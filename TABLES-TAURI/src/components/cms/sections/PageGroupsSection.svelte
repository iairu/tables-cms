<script>
  // Page Groups Section - Stub
  import { cmsData } from '../../../stores/cmsData.js';
  let cmsDataValue;
  const unsubscribe = cmsData.subscribe(value => cmsDataValue = value);
</script>

<div class="section-placeholder">
  <h2><i class="fas fa-layer-group"></i> Page Groups</h2>
  <p>Page Groups management coming soon...</p>
  <div class="feature-list">
    <div class="feature-item">
      <i class="fas fa-folder"></i>
      <span>Organize pages into groups</span>
    </div>
    <div class="feature-item">
      <i class="fas fa-sitemap"></i>
      <span> hierarchical structure</span>
    </div>
    <div class="feature-item">
      <i class="fas fa-tags"></i>
      <span>Categorize content</span>
    </div>
  </div>
</div>

<style>
  .section-placeholder {
    padding: 40px;
    text-align: center;
  }
  
  .section-placeholder h2 {
    font-size: 24px;
    color: #0f172a;
    margin-bottom: 16px;
  }
  
  .section-placeholder p {
    color: #64748b;
    margin-bottom: 32px;
  }
  
  .feature-list {
    display: flex;
    justify-content: center;
    gap: 32px;
    flex-wrap: wrap;
  }
  
  .feature-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
  }
  
  .feature-item i {
    font-size: 32px;
    color: #2563eb;
  }
  
  .feature-item span {
    color: #475569;
  }
</style>
