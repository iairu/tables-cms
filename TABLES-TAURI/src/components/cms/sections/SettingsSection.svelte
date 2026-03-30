<script>
  import { cmsData, saveSettings, triggerBuild } from '../../../stores/cmsData.js';
  
  let cmsDataValue;
  const unsubscribe = cmsData.subscribe(value => cmsDataValue = value);

  // Local settings state with defaults
  let localSettings = {
    siteName: '',
    siteDescription: '',
    domain: '',
    author: '',
    language: 'en',
    timezone: 'UTC',
    theme: 'default',
    vercelApiKey: '',
    vercelTeamId: '',
    vercelProjectId: '',
    autoBuild: false,
    generateSitemap: true,
    generateRobots: true,
    collaborationEnabled: false,
    collabServerUrl: '',
    collabUserName: '',
    gdprConsent: false,
    devMode: false,
    showComponentIds: false,
    // Social Media
    facebookUrl: '',
    twitterUrl: '',
    instagramUrl: '',
    youtubeUrl: '',
    linkedinUrl: '',
    tiktokUrl: '',
    enableSocialSharing: false,
    enableOpenGraph: true,
    enableTwitterCards: true,
    // ACL
    aclPagesEdit: true,
    aclBlogEdit: true,
    aclUploadsEdit: true,
    aclPedigreeEdit: true,
    aclRentalEdit: true,
    aclMoviesEdit: true,
    aclSettingsEdit: true,
    aclDeploy: true,
    aclExtensions: true
  };

  // Initialize local settings from CMS data — only once, only after data is fully loaded from localStorage
  let initialized = false;
  $: if (cmsDataValue?.isDataLoaded && cmsDataValue?.settings && !initialized) {
    localSettings = {
      ...localSettings,
      ...cmsDataValue.settings
    };
    initialized = true;
  }
  
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
  
  let activeTab = 'general';

  const tabs = [
    { id: 'general', label: 'General', icon: 'fa-cog' },
    { id: 'theme', label: 'Theme', icon: 'fa-palette' },
    { id: 'deployment', label: 'Deployment', icon: 'fa-rocket' },
    { id: 'collaboration', label: 'Collaboration', icon: 'fa-users' },
    { id: 'languages', label: 'Languages', icon: 'fa-language' },
    { id: 'social', label: 'Social Media', icon: 'fa-share-alt' },
    { id: 'acl', label: 'ACL', icon: 'fa-user-shield' },
    { id: 'advanced', label: 'Advanced', icon: 'fa-wrench' }
  ];
  
  function handleSaveSettings() {
    saveSettings(localSettings);
  }

  // Auto-Save all Settings mutations
  $: if (initialized && localSettings) {
    handleSaveSettings();
  }

  function handleThemeSelect(themeId) {
    localSettings = { ...localSettings, theme: themeId };

    // Apply theme immediately - preserve other classes
    const currentClasses = document.body.className
      .split(' ')
      .filter(cls => !cls.startsWith('theme-'));
    document.body.className = [...currentClasses, `theme-${themeId}`].join(' ');

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
        </div>
      {:else if activeTab === 'languages'}
        <div class="tab-content">
          <h2><i class="fas fa-language"></i> Language Settings</h2>

          <div class="settings-group">
            <h3>Default Language</h3>

            <div class="form-group">
              <label for="defaultLanguage">Site Default Language</label>
              <select id="defaultLanguage" bind:value={localSettings.language}>
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
                <option value="ru">Русский</option>
                <option value="ar">العربية</option>
              </select>
              <p class="help-text">Default language for content and UI</p>
            </div>
          </div>

          <div class="settings-group">
            <h3>Supported Languages</h3>
            <p class="help-text" style="margin-bottom: 16px;">
              Select which languages your site should support. Content can be translated for each enabled language.
            </p>
            <div class="language-grid">
              <label class="language-option">
                <input type="checkbox" checked />
                <span class="language-flag">🇺🇸</span>
                <span class="language-name">English</span>
              </label>
              <label class="language-option">
                <input type="checkbox" />
                <span class="language-flag">🇪🇸</span>
                <span class="language-name">Español</span>
              </label>
              <label class="language-option">
                <input type="checkbox" />
                <span class="language-flag">🇫🇷</span>
                <span class="language-name">Français</span>
              </label>
              <label class="language-option">
                <input type="checkbox" />
                <span class="language-flag">🇩🇪</span>
                <span class="language-name">Deutsch</span>
              </label>
              <label class="language-option">
                <input type="checkbox" />
                <span class="language-flag">🇮🇹</span>
                <span class="language-name">Italiano</span>
              </label>
              <label class="language-option">
                <input type="checkbox" />
                <span class="language-flag">🇵🇹</span>
                <span class="language-name">Português</span>
              </label>
              <label class="language-option">
                <input type="checkbox" />
                <span class="language-flag">🇳🇱</span>
                <span class="language-name">Nederlands</span>
              </label>
              <label class="language-option">
                <input type="checkbox" />
                <span class="language-flag">🇯🇵</span>
                <span class="language-name">日本語</span>
              </label>
              <label class="language-option">
                <input type="checkbox" />
                <span class="language-flag">🇨🇳</span>
                <span class="language-name">中文</span>
              </label>
              <label class="language-option">
                <input type="checkbox" />
                <span class="language-flag">🇰🇷</span>
                <span class="language-name">한국어</span>
              </label>
            </div>
          </div>

          <div class="settings-group">
            <h3>Translation Management</h3>
            <div class="form-group">
              <label class="checkbox-label">
                <input type="checkbox" />
                <span>Enable auto-translation suggestions</span>
              </label>
              <p class="help-text">Use machine translation to suggest translations for content</p>
            </div>
          </div>
        </div>
      {:else if activeTab === 'social'}
        <div class="tab-content">
          <h2><i class="fas fa-share-alt"></i> Social Media Settings</h2>

          <div class="settings-group">
            <h3>Social Profiles</h3>
            <p class="help-text" style="margin-bottom: 16px;">
              Add your social media profile links. These will be used for SEO and social sharing.
            </p>

            <div class="form-group">
              <label for="facebookUrl">Facebook URL</label>
              <input
                id="facebookUrl"
                type="url"
                bind:value={localSettings.facebookUrl}
                placeholder="https://facebook.com/yourpage"
              />
            </div>

            <div class="form-group">
              <label for="twitterUrl">Twitter/X URL</label>
              <input
                id="twitterUrl"
                type="url"
                bind:value={localSettings.twitterUrl}
                placeholder="https://twitter.com/yourhandle"
              />
            </div>

            <div class="form-group">
              <label for="instagramUrl">Instagram URL</label>
              <input
                id="instagramUrl"
                type="url"
                bind:value={localSettings.instagramUrl}
                placeholder="https://instagram.com/yourprofile"
              />
            </div>

            <div class="form-group">
              <label for="youtubeUrl">YouTube URL</label>
              <input
                id="youtubeUrl"
                type="url"
                bind:value={localSettings.youtubeUrl}
                placeholder="https://youtube.com/yourchannel"
              />
            </div>

            <div class="form-group">
              <label for="linkedinUrl">LinkedIn URL</label>
              <input
                id="linkedinUrl"
                type="url"
                bind:value={localSettings.linkedinUrl}
                placeholder="https://linkedin.com/company/yourcompany"
              />
            </div>

            <div class="form-group">
              <label for="tiktokUrl">TikTok URL</label>
              <input
                id="tiktokUrl"
                type="url"
                bind:value={localSettings.tiktokUrl}
                placeholder="https://tiktok.com/@yourhandle"
              />
            </div>
          </div>

          <div class="settings-group">
            <h3>Social Sharing</h3>

            <div class="form-group">
              <label class="checkbox-label">
                <input type="checkbox" bind:checked={localSettings.enableSocialSharing} />
                <span>Enable social sharing buttons on pages</span>
              </label>
              <p class="help-text">Show share buttons on published pages</p>
            </div>

            <div class="form-group">
              <label class="checkbox-label">
                <input type="checkbox" bind:checked={localSettings.enableOpenGraph} />
                <span>Enable Open Graph tags</span>
              </label>
              <p class="help-text">Generate Open Graph meta tags for better social sharing</p>
            </div>

            <div class="form-group">
              <label class="checkbox-label">
                <input type="checkbox" bind:checked={localSettings.enableTwitterCards} />
                <span>Enable Twitter Cards</span>
              </label>
              <p class="help-text">Generate Twitter Card meta tags</p>
            </div>
          </div>
        </div>
      {:else if activeTab === 'acl'}
        <div class="tab-content">
          <h2><i class="fas fa-user-shield"></i> Access Control List (ACL)</h2>

          <div class="settings-group">
            <h3>Permission Management</h3>
            <p class="help-text" style="margin-bottom: 16px;">
              Configure access permissions for different user roles and features.
            </p>

            <div class="acl-permissions">
              <div class="permission-group">
                <h4>Content Permissions</h4>
                <div class="permission-item">
                  <label class="checkbox-label">
                    <input type="checkbox" bind:checked={localSettings.aclPagesEdit} />
                    <span>Edit Pages</span>
                  </label>
                  <select>
                    <option value="admin">Admin Only</option>
                    <option value="editor">Editors & Admin</option>
                    <option value="all">All Users</option>
                  </select>
                </div>
                <div class="permission-item">
                  <label class="checkbox-label">
                    <input type="checkbox" bind:checked={localSettings.aclBlogEdit} />
                    <span>Edit Blog Articles</span>
                  </label>
                  <select>
                    <option value="admin">Admin Only</option>
                    <option value="editor">Editors & Admin</option>
                    <option value="all">All Users</option>
                  </select>
                </div>
                <div class="permission-item">
                  <label class="checkbox-label">
                    <input type="checkbox" bind:checked={localSettings.aclUploadsEdit} />
                    <span>Manage Uploads</span>
                  </label>
                  <select>
                    <option value="admin">Admin Only</option>
                    <option value="editor">Editors & Admin</option>
                    <option value="all">All Users</option>
                  </select>
                </div>
              </div>

              <div class="permission-group">
                <h4>Extension Permissions</h4>
                <div class="permission-item">
                  <label class="checkbox-label">
                    <input type="checkbox" bind:checked={localSettings.aclPedigreeEdit} />
                    <span>Edit Pedigree Records</span>
                  </label>
                  <select>
                    <option value="admin">Admin Only</option>
                    <option value="editor">Editors & Admin</option>
                    <option value="all">All Users</option>
                  </select>
                </div>
                <div class="permission-item">
                  <label class="checkbox-label">
                    <input type="checkbox" bind:checked={localSettings.aclRentalEdit} />
                    <span>Manage Rentals</span>
                  </label>
                  <select>
                    <option value="admin">Admin Only</option>
                    <option value="editor">Editors & Admin</option>
                    <option value="all">All Users</option>
                  </select>
                </div>
                <div class="permission-item">
                  <label class="checkbox-label">
                    <input type="checkbox" bind:checked={localSettings.aclMoviesEdit} />
                    <span>Edit Movie Tracker</span>
                  </label>
                  <select>
                    <option value="admin">Admin Only</option>
                    <option value="editor">Editors & Admin</option>
                    <option value="all">All Users</option>
                  </select>
                </div>
              </div>

              <div class="permission-group">
                <h4>System Permissions</h4>
                <div class="permission-item">
                  <label class="checkbox-label">
                    <input type="checkbox" bind:checked={localSettings.aclSettingsEdit} />
                    <span>Modify Settings</span>
                  </label>
                  <select>
                    <option value="admin">Admin Only</option>
                    <option value="editor">Editors & Admin</option>
                    <option value="all">All Users</option>
                  </select>
                </div>
                <div class="permission-item">
                  <label class="checkbox-label">
                    <input type="checkbox" bind:checked={localSettings.aclDeploy} />
                    <span>Deploy Site</span>
                  </label>
                  <select>
                    <option value="admin">Admin Only</option>
                    <option value="editor">Editors & Admin</option>
                    <option value="all">All Users</option>
                  </select>
                </div>
                <div class="permission-item">
                  <label class="checkbox-label">
                    <input type="checkbox" bind:checked={localSettings.aclExtensions} />
                    <span>Manage Extensions</span>
                  </label>
                  <select>
                    <option value="admin">Admin Only</option>
                    <option value="editor">Editors & Admin</option>
                    <option value="all">All Users</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          <div class="settings-group">
            <h3>User Roles</h3>
            <p class="help-text" style="margin-bottom: 16px;">
              Define custom user roles and their associated permissions.
            </p>
            <div class="roles-list">
              <div class="role-card">
                <div class="role-header">
                  <h4>Admin</h4>
                  <span class="role-badge">Default</span>
                </div>
                <p>Full access to all features and settings</p>
              </div>
              <div class="role-card">
                <div class="role-header">
                  <h4>Editor</h4>
                  <span class="role-badge">Default</span>
                </div>
                <p>Can edit content but cannot modify settings or deploy</p>
              </div>
              <div class="role-card add-role">
                <button class="btn-secondary">
                  <i class="fas fa-plus"></i> Add Custom Role
                </button>
              </div>
            </div>
          </div>
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
        </div>
      {/if}
    </div>
  </div>
</div>

<style>
  .settings-section {
    height: calc(100vh - 140px);
    overflow: hidden;
  }
  
  .settings-layout {
    display: flex;
    height: 100%;
    overflow: hidden;
  }
  
  .settings-tabs {
    width: 260px;
    background: var(--bg-card, white);
    border-right: 1px solid var(--border-light, #e2e8f0);
    display: flex;
    flex-direction: column;
    height: 100%;
    overflow: hidden;
  }

  .tab {
    width: 100%;
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 20px;
    border: none;
    background: transparent;
    cursor: pointer;
    text-align: left;
    font-size: 14px;
    font-weight: 500;
    color: var(--text-secondary, #475569);
    transition: all 0.2s;
    border-left: 3px solid transparent;
  }

  .tab:hover {
    background: var(--bg-secondary, #f8fafc);
    color: var(--color-primary, #2563eb);
  }

  .tab.active {
    background: var(--bg-tertiary, #eff6ff);
    color: var(--color-primary, #2563eb);
    border-left-color: var(--color-primary, #2563eb);
  }

  .tab i {
    width: 20px;
    text-align: center;
    flex-shrink: 0;
  }
  
  .settings-content {
    flex: 1;
    background: var(--bg-primary, #f8fafc);
    padding: 20px;
    overflow-y: auto;
  }

  .tab-content h2 {
    font-size: 20px;
    margin-bottom: 16px;
    display: flex;
    align-items: center;
    gap: 8px;
  }
  
  .tab-content h2 i {
    color: var(--color-primary);
  }
  
  .settings-group {
    margin-bottom: 20px;
    padding-bottom: 16px;
    border-bottom: 1px solid var(--border-light);
  }

  .settings-group:last-child {
    border-bottom: none;
  }

  .settings-group h3 {
    font-size: 16px;
    margin-bottom: 12px;
    color: var(--text-primary);
  }

  .form-group {
    margin-bottom: 12px;
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
    background: var(--bg-card, white);
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

  /* Language Settings Styles */
  .language-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
    gap: 12px;
  }

  .language-option {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 12px;
    background: var(--bg-secondary);
    border-radius: var(--radius-md);
    cursor: pointer;
    transition: all var(--transition-fast);
  }

  .language-option:hover {
    background: var(--bg-tertiary);
  }

  .language-flag {
    font-size: 24px;
  }

  .language-name {
    font-weight: 500;
    color: var(--text-primary);
  }

  /* Social Media Styles */
  .social-profiles {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 16px;
  }

  /* ACL Styles */
  .acl-permissions {
    display: flex;
    flex-direction: column;
    gap: 24px;
  }

  .permission-group {
    background: var(--bg-secondary);
    border-radius: var(--radius-lg);
    padding: 20px;
  }

  .permission-group h4 {
    margin: 0 0 16px;
    font-size: var(--text-base);
    color: var(--text-secondary);
  }

  .permission-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 0;
    border-bottom: 1px solid var(--border-light);
  }

  .permission-item:last-child {
    border-bottom: none;
  }

  .permission-item select {
    min-width: 150px;
    padding: 8px 12px;
    border: 1px solid var(--border-light);
    border-radius: var(--radius-md);
    background: var(--bg-primary);
    color: var(--text-primary);
  }

  .roles-list {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 16px;
  }

  .role-card {
    background: var(--bg-secondary);
    border-radius: var(--radius-lg);
    padding: 20px;
    border: 2px solid transparent;
    transition: all var(--transition-fast);
  }

  .role-card:hover {
    border-color: var(--color-primary);
  }

  .role-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
  }

  .role-header h4 {
    margin: 0;
    font-size: var(--text-base);
  }

  .role-badge {
    padding: 4px 8px;
    background: var(--color-primary);
    color: white;
    border-radius: var(--radius-full);
    font-size: 12px;
    font-weight: 600;
  }

  .role-card p {
    margin: 0;
    color: var(--text-secondary);
    font-size: var(--text-sm);
  }

  .role-card.add-role {
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--bg-tertiary);
    border: 2px dashed var(--border-medium);
    cursor: pointer;
  }

  .role-card.add-role:hover {
    border-color: var(--color-primary);
    background: rgba(37, 99, 235, 0.05);
  }
</style>
