<script>
  import { cmsData, saveSettings, triggerBuild } from '../../../stores/cmsData.js';
  
  let cmsDataValue;
  const unsubscribe = cmsData.subscribe(value => cmsDataValue = value);
  
  // Local settings state
  let localSettings = {};
  let activeTab = 'general';
  
  // Available themes
  const themes = [
    { id: 'default', name: 'Default', description: 'Clean modern blue theme', preview: '#2563eb' },
    { id: 'synthwave', name: 'Synthwave', description: 'Retro futuristic purple/pink', preview: '#ff6b9d' },
    { id: 'matrix', name: 'Matrix', description: 'Classic green on black', preview: '#00ff41' },
    { id: 'monokai', name: 'Monokai', description: 'Popular dark code theme', preview: '#a6e22e' },
    { id: 'github', name: 'GitHub', description: 'Familiar GitHub style', preview: '#0366d6' },
    { id: 'vscode', name: 'VS Code', description: 'Dark editor theme', preview: '#007acc' },
    { id: 'anime', name: 'Anime', description: 'Vibrant pink kawaii theme', preview: '#ff6b9d' },
    { id: 'historic', name: 'Historic Paper', description: 'Vintage parchment look', preview: '#8b4513' },
    { id: 'senior', name: 'Senior Citizen', description: 'High contrast accessibility', preview: '#0047ab' },
    { id: 'ayu', name: 'Ayu', description: 'Warm dark theme', preview: '#ffcc66' }
  ];
  
  // Initialize local settings from CMS data
  $: if (cmsDataValue?.settings) {
    localSettings = { ...cmsDataValue.settings };
  }
  
  function handleSaveSettings() {
    saveSettings(localSettings);
  }
  
  function handleThemeSelect(themeId) {
    localSettings = { ...localSettings, theme: themeId };
    
    // Apply theme immediately
    document.body.className = `theme-${themeId}`;
    localStorage.setItem('tables-theme', themeId);
    
    handleSaveSettings();
  }
  
  function handleBuildLocally() {
    triggerBuild(true);
  }
  
  function handleBuildAndDeploy() {
    if (!localSettings.vercelApiKey) {
      alert('Please set your Vercel API key in settings first.');
      return;
    }
    triggerBuild(false);
  }
  
  function getCurrentTheme() {
    return themes.find(t => t.id === localSettings.theme) || themes[0];
  }
  
  const tabs = [
    { id: 'general', label: 'General', icon: 'fa-cog' },
    { id: 'theme', label: 'Theme', icon: 'fa-palette' },
    { id: 'deployment', label: 'Deployment', icon: 'fa-rocket' },
    { id: 'collaboration', label: 'Collaboration', icon: 'fa-users' },
    { id: 'advanced', label: 'Advanced', icon: 'fa-wrench' }
  ];
</script>

<div class="settings-section">
  <div class="settings-layout">
    <!-- Settings Tabs -->
    <aside class="settings-tabs">
      {#each tabs as tab}
        <button
          class="tab {activeTab === tab.id ? 'active' : ''}"
          on:click={() => activeTab = tab.id}
        >
          <i class="fas {tab.icon}"></i>
          <span>{tab.label}</span>
        </button>
      {/each}
    </aside>
    
    <!-- Settings Content -->
    <div class="settings-content">
      {#if activeTab === 'general'}
        <div class="tab-content">
          <h2><i class="fas fa-cog"></i> General Settings</h2>
          
          <div class="settings-group">
            <h3>Site Information</h3>
            
            <div class="form-group">
              <label for="siteName">Site Name</label>
              <input
                id="siteName"
                type="text"
                bind:value={localSettings.siteName}
                placeholder="My Website"
              />
            </div>
            
            <div class="form-group">
              <label for="siteDescription">Site Description</label>
              <textarea
                id="siteDescription"
                bind:value={localSettings.siteDescription}
                placeholder="A brief description of your website"
                rows="3"
              ></textarea>
            </div>
            
            <div class="form-group">
              <label for="domain">Domain</label>
              <input
                id="domain"
                type="url"
                bind:value={localSettings.domain}
                placeholder="https://example.com"
              />
              <p class="help-text">Your production domain for deployment</p>
            </div>
            
            <div class="form-group">
              <label for="author">Default Author</label>
              <input
                id="author"
                type="text"
                bind:value={localSettings.author}
                placeholder="John Doe"
              />
            </div>
          </div>
          
          <div class="settings-group">
            <h3>Localization</h3>
            
            <div class="form-group">
              <label for="language">Default Language</label>
              <select id="language" bind:value={localSettings.language}>
                <option value="en">English</option>
                <option value="es">Español</option>
                <option value="fr">Français</option>
                <option value="de">Deutsch</option>
                <option value="it">Italiano</option>
                <option value="pt">Português</option>
                <option value="nl">Nederlands</option>
                <option value="ja">日本語</option>
                <option value="zh">中文</option>
                <option value="ko">한국어</option>
              </select>
            </div>
            
            <div class="form-group">
              <label for="timezone">Timezone</label>
              <select id="timezone" bind:value={localSettings.timezone}>
                <option value="UTC">UTC</option>
                <option value="America/New_York">Eastern Time</option>
                <option value="America/Chicago">Central Time</option>
                <option value="America/Denver">Mountain Time</option>
                <option value="America/Los_Angeles">Pacific Time</option>
                <option value="Europe/London">London</option>
                <option value="Europe/Paris">Paris</option>
                <option value="Asia/Tokyo">Tokyo</option>
                <option value="Asia/Shanghai">Shanghai</option>
              </select>
            </div>
          </div>
          
          <button class="btn-primary" on:click={handleSaveSettings}>
            <i class="fas fa-save"></i> Save Settings
          </button>
        </div>
      {:else if activeTab === 'theme'}
        <div class="tab-content">
          <h2><i class="fas fa-palette"></i> Theme Settings</h2>
          
          <div class="theme-preview">
            <div class="preview-card">
              <span class="preview-label">Current Theme</span>
              <div
                class="current-theme"
                style="background: {getCurrentTheme().preview}"
              >
                <span class="current-theme-name">{getCurrentTheme().name}</span>
              </div>
            </div>
          </div>
          
          <div class="themes-grid">
            {#each themes as theme}
              <div
                class="theme-card {localSettings.theme === theme.id ? 'selected' : ''}"
                on:click={() => handleThemeSelect(theme.id)}
              >
                <div
                  class="theme-preview-swatch"
                  style="background: {theme.preview}"
                ></div>
                <div class="theme-info">
                  <h3>{theme.name}</h3>
                  <p>{theme.description}</p>
                </div>
                {#if localSettings.theme === theme.id}
                  <div class="theme-selected-badge">
                    <i class="fas fa-check"></i>
                  </div>
                {/if}
              </div>
            {/each}
          </div>
        </div>
      {:else if activeTab === 'deployment'}
        <div class="tab-content">
          <h2><i class="fas fa-rocket"></i> Deployment Settings</h2>
          
          <div class="settings-group">
            <h3>Vercel Configuration</h3>
            
            <div class="form-group">
              <label for="vercelApiKey">Vercel API Key</label>
              <input
                id="vercelApiKey"
                type="password"
                bind:value={localSettings.vercelApiKey}
                placeholder="Enter your Vercel API key"
              />
              <p class="help-text">
                Get your API key from Vercel dashboard → Settings → API Keys
              </p>
            </div>
            
            <div class="form-group">
              <label for="vercelTeamId">Vercel Team ID (Optional)</label>
              <input
                id="vercelTeamId"
                type="text"
                bind:value={localSettings.vercelTeamId}
                placeholder="team_xxxxxxxxxxxxxxxx"
              />
            </div>
            
            <div class="form-group">
              <label for="vercelProjectId">Vercel Project ID (Optional)</label>
              <input
                id="vercelProjectId"
                type="text"
                bind:value={localSettings.vercelProjectId}
                placeholder="prj_xxxxxxxxxxxxxxxx"
              />
            </div>
          </div>
          
          <div class="settings-group">
            <h3>Build Options</h3>
            
            <div class="form-group">
              <label class="checkbox-label">
                <input type="checkbox" bind:checked={localSettings.autoBuild} />
                <span>Auto-build on content changes</span>
              </label>
              <p class="help-text">Automatically trigger build after saving content</p>
            </div>
            
            <div class="form-group">
              <label class="checkbox-label">
                <input type="checkbox" bind:checked={localSettings.generateSitemap} />
                <span>Generate sitemap.xml</span>
              </label>
              <p class="help-text">Create sitemap for SEO optimization</p>
            </div>
            
            <div class="form-group">
              <label class="checkbox-label">
                <input type="checkbox" bind:checked={localSettings.generateRobots} />
                <span>Generate robots.txt</span>
              </label>
              <p class="help-text">Create robots.txt for search engine crawling</p>
            </div>
          </div>
          
          <div class="build-actions">
            <button class="btn-primary" on:click={handleBuildLocally}>
              <i class="fas fa-hammer"></i> Build Locally
            </button>
            <button
              class="btn-success"
              on:click={handleBuildAndDeploy}
              disabled={!localSettings.vercelApiKey}
            >
              <i class="fas fa-rocket"></i> Build & Deploy to Vercel
            </button>
          </div>
          
          <button class="btn-primary" on:click={handleSaveSettings}>
            <i class="fas fa-save"></i> Save Settings
          </button>
        </div>
      {:else if activeTab === 'collaboration'}
        <div class="tab-content">
          <h2><i class="fas fa-users"></i> Collaboration Settings</h2>
          
          <div class="settings-group">
            <h3>Real-time Collaboration</h3>
            
            <div class="form-group">
              <label class="checkbox-label">
                <input type="checkbox" bind:checked={localSettings.collaborationEnabled} />
                <span>Enable Collaboration Features</span>
              </label>
              <p class="help-text">Allow multiple users to edit content simultaneously</p>
            </div>
            
            {#if localSettings.collaborationEnabled}
              <div class="form-group">
                <label for="collabServerUrl">Collaboration Server URL</label>
                <input
                  id="collabServerUrl"
                  type="url"
                  bind:value={localSettings.collabServerUrl}
                  placeholder="wss://your-server.com"
                />
                <p class="help-text">WebSocket server for real-time sync</p>
              </div>
              
              <div class="form-group">
                <label for="collabUserName">Your Display Name</label>
                <input
                  id="collabUserName"
                  type="text"
                  bind:value={localSettings.collabUserName}
                  placeholder="John Doe"
                />
              </div>
            {/if}
          </div>
          
          <div class="settings-group">
            <h3>GDPR Consent</h3>
            
            <div class="gdpr-notice">
              <i class="fas fa-info-circle"></i>
              <p>
                When collaboration is enabled, your IP address, location, and a collaboration
                token will be stored on the server to establish WebSocket connections between
                clients. This is required for real-time editing features.
              </p>
            </div>
            
            <div class="form-group">
              <label class="checkbox-label">
                <input type="checkbox" bind:checked={localSettings.gdprConsent} />
                <span>I consent to data storage for collaboration features</span>
              </label>
            </div>
          </div>
          
          <button class="btn-primary" on:click={handleSaveSettings}>
            <i class="fas fa-save"></i> Save Settings
          </button>
        </div>
      {:else if activeTab === 'advanced'}
        <div class="tab-content">
          <h2><i class="fas fa-wrench"></i> Advanced Settings</h2>
          
          <div class="settings-group">
            <h3>Data Management</h3>
            
            <div class="danger-zone">
              <h4><i class="fas fa-exclamation-triangle"></i> Danger Zone</h4>
              
              <div class="danger-actions">
                <div class="danger-action">
                  <div>
                    <h5>Export All Data</h5>
                    <p>Download all CMS data as JSON files</p>
                  </div>
                  <button class="btn-secondary">
                    <i class="fas fa-download"></i> Export
                  </button>
                </div>
                
                <div class="danger-action">
                  <div>
                    <h5>Import Data</h5>
                    <p>Restore CMS data from JSON backup</p>
                  </div>
                  <button class="btn-secondary">
                    <i class="fas fa-upload"></i> Import
                  </button>
                </div>
                
                <div class="danger-action">
                  <div>
                    <h5>Reset All Data</h5>
                    <p>Permanently delete all CMS data</p>
                  </div>
                  <button class="btn-danger">
                    <i class="fas fa-trash"></i> Reset
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          <div class="settings-group">
            <h3>Developer Options</h3>
            
            <div class="form-group">
              <label class="checkbox-label">
                <input type="checkbox" bind:checked={localSettings.devMode} />
                <span>Developer Mode</span>
              </label>
              <p class="help-text">Enable debug logging and advanced features</p>
            </div>
            
            <div class="form-group">
              <label class="checkbox-label">
                <input type="checkbox" bind:checked={localSettings.showComponentIds} />
                <span>Show Component IDs</span>
              </label>
              <p class="help-text">Display component IDs in the editor</p>
            </div>
          </div>
          
          <div class="settings-group">
            <h3>Cache & Performance</h3>
            
            <div class="form-group">
              <button class="btn-secondary" on:click={() => localStorage.clear()}>
                <i class="fas fa-broom"></i> Clear Local Storage
              </button>
              <p class="help-text">Clear all cached data from browser storage</p>
            </div>
          </div>
          
          <button class="btn-primary" on:click={handleSaveSettings}>
            <i class="fas fa-save"></i> Save Settings
          </button>
        </div>
      {/if}
    </div>
  </div>
</div>

<style>
  .settings-section {
    padding: 20px;
    height: calc(100vh - 140px);
    overflow: hidden;
  }
  
  .settings-layout {
    display: flex;
    gap: 24px;
    height: 100%;
    overflow: hidden;
  }
  
  .settings-tabs {
    width: 240px;
    background: white;
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    padding: 16px;
    display: flex;
    flex-direction: column;
    gap: 4px;
    overflow-y: auto;
  }
  
  .tab {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 14px 16px;
    border: none;
    background: transparent;
    border-radius: 8px;
    cursor: pointer;
    text-align: left;
    font-size: 14px;
    font-weight: 500;
    color: var(--text-secondary);
    transition: all 0.2s;
  }
  
  .tab:hover {
    background: var(--bg-secondary);
    color: var(--text-primary);
  }
  
  .tab.active {
    background: var(--color-primary);
    color: white;
  }
  
  .tab i {
    width: 20px;
    text-align: center;
  }
  
  .settings-content {
    flex: 1;
    background: white;
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    padding: 32px;
    overflow-y: auto;
  }
  
  .tab-content h2 {
    font-size: 24px;
    margin-bottom: 24px;
    display: flex;
    align-items: center;
    gap: 12px;
  }
  
  .tab-content h2 i {
    color: var(--color-primary);
  }
  
  .settings-group {
    margin-bottom: 32px;
    padding-bottom: 24px;
    border-bottom: 1px solid var(--border-light);
  }
  
  .settings-group:last-child {
    border-bottom: none;
  }
  
  .settings-group h3 {
    font-size: 18px;
    margin-bottom: 16px;
    color: var(--text-primary);
  }
  
  .form-group {
    margin-bottom: 20px;
  }
  
  .form-group label {
    display: block;
    margin-bottom: 8px;
  }
  
  .form-group input,
  .form-group textarea,
  .form-group select {
    width: 100%;
    padding: 10px 14px;
    border: 1px solid var(--border-light);
    border-radius: 6px;
    font-size: 14px;
  }
  
  .form-group input:focus,
  .form-group textarea:focus,
  .form-group select:focus {
    outline: none;
    border-color: var(--color-primary);
    box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
  }
  
  .help-text {
    font-size: 12px;
    color: var(--text-tertiary);
    margin-top: 6px;
  }
  
  .checkbox-label {
    display: flex;
    align-items: center;
    gap: 10px;
    cursor: pointer;
    font-weight: 500;
  }
  
  .checkbox-label input[type="checkbox"] {
    width: 18px;
    height: 18px;
    cursor: pointer;
  }
  
  .theme-preview {
    margin-bottom: 24px;
  }
  
  .preview-card {
    background: var(--bg-secondary);
    padding: 20px;
    border-radius: 8px;
  }
  
  .preview-label {
    display: block;
    font-size: 12px;
    color: var(--text-tertiary);
    margin-bottom: 8px;
  }
  
  .current-theme {
    height: 60px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-weight: 600;
    text-shadow: 0 1px 2px rgba(0,0,0,0.2);
  }
  
  .themes-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
    gap: 16px;
  }
  
  .theme-card {
    background: var(--bg-secondary);
    border-radius: 12px;
    padding: 16px;
    cursor: pointer;
    transition: all 0.2s;
    border: 2px solid transparent;
    position: relative;
  }
  
  .theme-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
  
  .theme-card.selected {
    border-color: var(--color-primary);
    background: var(--bg-primary);
  }
  
  .theme-preview-swatch {
    height: 80px;
    border-radius: 8px;
    margin-bottom: 12px;
  }
  
  .theme-info h3 {
    font-size: 16px;
    margin-bottom: 4px;
  }
  
  .theme-info p {
    font-size: 12px;
    color: var(--text-tertiary);
    margin: 0;
  }
  
  .theme-selected-badge {
    position: absolute;
    top: 12px;
    right: 12px;
    width: 28px;
    height: 28px;
    background: var(--color-primary);
    color: white;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .build-actions {
    display: flex;
    gap: 12px;
    margin-bottom: 24px;
  }
  
  .gdpr-notice {
    background: #eff6ff;
    border-left: 4px solid var(--color-primary);
    padding: 16px;
    border-radius: 6px;
    display: flex;
    gap: 12px;
    margin-bottom: 16px;
  }
  
  .gdpr-notice i {
    color: var(--color-primary);
    font-size: 20px;
    flex-shrink: 0;
  }
  
  .gdpr-notice p {
    font-size: 14px;
    color: var(--text-secondary);
    margin: 0;
    line-height: 1.5;
  }
  
  .danger-zone {
    background: #fef2f2;
    border: 1px solid #fecaca;
    border-radius: 8px;
    padding: 20px;
  }
  
  .danger-zone h4 {
    color: #dc2626;
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 16px;
  }
  
  .danger-actions {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }
  
  .danger-action {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-bottom: 16px;
    border-bottom: 1px solid #fecaca;
  }
  
  .danger-action:last-child {
    border-bottom: none;
    padding-bottom: 0;
  }
  
  .danger-action h5 {
    font-size: 14px;
    margin-bottom: 4px;
  }
  
  .danger-action p {
    font-size: 12px;
    color: var(--text-tertiary);
    margin: 0;
  }
  
  .btn-primary,
  .btn-secondary,
  .btn-success,
  .btn-danger {
    padding: 10px 20px;
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
    background: var(--color-primary);
    color: white;
  }
  
  .btn-primary:hover {
    background: var(--color-primary-dark);
  }
  
  .btn-secondary {
    background: white;
    color: var(--text-secondary);
    border: 1px solid var(--border-light);
  }
  
  .btn-secondary:hover {
    background: var(--bg-secondary);
  }
  
  .btn-success {
    background: var(--color-secondary);
    color: white;
  }
  
  .btn-success:hover:not(:disabled) {
    background: var(--color-secondary-dark);
  }
  
  .btn-success:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  
  .btn-danger {
    background: #ef4444;
    color: white;
  }
  
  .btn-danger:hover {
    background: #dc2626;
  }
</style>
