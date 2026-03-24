<script>
  // Extensions Section - Stub
  import { cmsData, saveExtensions } from '../../../stores/cmsData.js';
  let cmsDataValue;
  const unsubscribe = cmsData.subscribe(value => cmsDataValue = value);
</script>

<div class="extensions-section">
  <h2><i class="fas fa-puzzle-piece"></i> Extensions</h2>
  
  <div class="extensions-grid">
    <div class="extension-card">
      <div class="extension-header">
        <i class="fas fa-sticky-note"></i>
        <h3>Notes Extension</h3>
      </div>
      <p>Enable sticky notes sidebar for quick notes and reminders.</p>
      <label class="toggle">
        <input 
          type="checkbox" 
          checked={cmsDataValue?.extensions?.['notes-extension-enabled'] || false}
          on:change={(e) => {
            saveExtensions({ 
              ...cmsDataValue?.extensions, 
              'notes-extension-enabled': e.target.checked 
            });
          }}
        />
        <span class="toggle-slider"></span>
      </label>
    </div>
    
    <div class="extension-card coming-soon">
      <div class="extension-header">
        <i class="fas fa-chart-bar"></i>
        <h3>Analytics <span class="badge">Soon</span></h3>
      </div>
      <p>Track website analytics and visitor statistics.</p>
      <label class="toggle disabled">
        <input type="checkbox" disabled />
        <span class="toggle-slider"></span>
      </label>
    </div>
    
    <div class="extension-card coming-soon">
      <div class="extension-header">
        <i class="fas fa-envelope"></i>
        <h3>Email Forms <span class="badge">Soon</span></h3>
      </div>
      <p>Contact form submissions and email notifications.</p>
      <label class="toggle disabled">
        <input type="checkbox" disabled />
        <span class="toggle-slider"></span>
      </label>
    </div>
  </div>
</div>

<style>
  .extensions-section {
    padding: 40px;
  }
  
  .extensions-section h2 {
    font-size: 24px;
    color: #0f172a;
    margin-bottom: 24px;
    display: flex;
    align-items: center;
    gap: 12px;
  }
  
  .extensions-section h2 i {
    color: #2563eb;
  }
  
  .extensions-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
    gap: 20px;
  }
  
  .extension-card {
    background: white;
    border-radius: 8px;
    padding: 24px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
  
  .extension-card.coming-soon {
    opacity: 0.7;
  }
  
  .extension-header {
    display: flex;
    align-items: center;
    gap: 12px;
  }
  
  .extension-header i {
    font-size: 28px;
    color: #2563eb;
  }
  
  .extension-header h3 {
    font-size: 18px;
    font-weight: 600;
    color: #0f172a;
    margin: 0;
    display: flex;
    align-items: center;
    gap: 8px;
  }
  
  .badge {
    font-size: 11px;
    padding: 2px 8px;
    background: #e2e8f0;
    color: #64748b;
    border-radius: 12px;
    font-weight: 600;
  }
  
  .extension-card p {
    color: #64748b;
    font-size: 14px;
    line-height: 1.5;
    flex: 1;
  }
  
  .toggle {
    position: relative;
    display: inline-block;
    width: 50px;
    height: 26px;
    align-self: flex-end;
  }
  
  .toggle input {
    opacity: 0;
    width: 0;
    height: 0;
  }
  
  .toggle-slider {
    position: absolute;
    cursor: pointer;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: #cbd5e1;
    transition: 0.3s;
    border-radius: 26px;
  }
  
  .toggle-slider:before {
    position: absolute;
    content: "";
    height: 20px;
    width: 20px;
    left: 3px;
    bottom: 3px;
    background-color: white;
    transition: 0.3s;
    border-radius: 50%;
  }
  
  .toggle input:checked + .toggle-slider {
    background-color: #2563eb;
  }
  
  .toggle input:checked + .toggle-slider:before {
    transform: translateX(24px);
  }
  
  .toggle.disabled {
    cursor: not-allowed;
  }
  
  .toggle.disabled .toggle-slider {
    background-color: #e2e8f0;
  }
</style>
