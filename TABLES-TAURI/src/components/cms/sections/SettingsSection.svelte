<script>
  import { cmsData, saveSettings, startCollaborationServer, connectToCollaborationServer, disconnectCollaboration } from '../../../stores/cmsData.js';
  
  let cmsDataValue;
  const unsubscribe = cmsData.subscribe(value => cmsDataValue = value);
  
  let connectIP = '';
  let connectName = 'Anonymous';
  let selectedInterfaceIP = '';
  let assetModalOpen = false;
  let assetModalTarget = null;
  
  // Extensions
  let extensions = {};
  
  $: if (cmsDataValue?.extensions) {
    extensions = cmsDataValue.extensions;
  }
  
  function handleChange(field, value) {
    saveSettings({ ...cmsDataValue.settings, [field]: value });
  }
  
  function handleVercelProjectNameChange(value) {
    const projectName = value.toLowerCase().replace(/[^a-z0-9-]/g, '');
    saveSettings({
      ...cmsDataValue.settings,
      vercelProjectName: projectName,
      domain: projectName ? `https://${projectName}.vercel.app/` : ''
    });
  }
  
  async function handleFileChange(field, file) {
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        handleChange(field, e.target.result);
      };
      reader.readAsDataURL(file);
    }
  }
  
  function handleSelectImage(field) {
    assetModalTarget = field;
    assetModalOpen = true;
  }
  
  function handleAssetSelected(asset) {
    if (assetModalTarget) {
      handleChange(assetModalTarget, asset.url);
    }
    assetModalOpen = false;
    assetModalTarget = null;
  }
  
  function handleAddLanguage() {
    const langCode = prompt('Enter language code (e.g., en, sk, de):');
    if (!langCode) return;
    
    const langName = prompt('Enter language name (e.g., English, Slovak, German):');
    if (!langName) return;
    
    const currentLanguages = cmsDataValue.settings.languages || [];
    const newLanguage = { code: langCode.toLowerCase(), name: langName };
    
    if (currentLanguages.some(lang => lang.code === newLanguage.code)) {
      alert('Language already exists!');
      return;
    }
    
    saveSettings({ ...cmsDataValue.settings, languages: [...currentLanguages, newLanguage] });
  }
  
  function handleRemoveLanguage(langCode) {
    if (!confirm('Are you sure you want to remove this language?')) return;
    
    const currentLanguages = cmsDataValue.settings.languages || [];
    const updatedLanguages = currentLanguages.filter(lang => lang.code !== langCode);
    saveSettings({ ...cmsDataValue.settings, languages: updatedLanguages });
  }
  
  function handleAddSocialMedia() {
    const currentSocialMedia = cmsDataValue.settings.socialMedia || [];
    saveSettings({ ...cmsDataValue.settings, socialMedia: [...currentSocialMedia, { platform: '', url: '' }] });
  }
  
  function handleRemoveSocialMedia(index) {
    const currentSocialMedia = cmsDataValue.settings.socialMedia || [];
    const updatedSocialMedia = currentSocialMedia.filter((_, i) => i !== index);
    saveSettings({ ...cmsDataValue.settings, socialMedia: updatedSocialMedia });
  }
  
  function handleSocialMediaChange(index, field, value) {
    const currentSocialMedia = cmsDataValue.settings.socialMedia || [];
    const updatedSocialMedia = [...currentSocialMedia];
    updatedSocialMedia[index][field] = value;
    saveSettings({ ...cmsDataValue.settings, socialMedia: updatedSocialMedia });
  }
  
  async function handleStartServer() {
    await startCollaborationServer(selectedInterfaceIP || null);
  }
  
  async function handleConnect() {
    if (!connectIP) return;
    const url = `http://${connectIP}:8081`;
    await connectToCollaborationServer(url, connectName, false);
  }
  
  function handleDisconnect() {
    disconnectCollaboration();
  }
  
  function isLockedForMe(fieldId) {
    if (!cmsDataValue?.collabState?.activeLocks) return false;
    const lock = cmsDataValue.collabState.activeLocks.find(l => l.fieldId === fieldId);
    return !!lock && lock.socketId !== cmsDataValue.collabState.socketId;
  }
</script>

<div class="settings-section">
  <h2><i class="fas fa-cog"></i> Settings</h2>
  
  <div class="settings-grid">
    <!-- Basic Settings -->
    <div class="settings-card">
      <h3>Basic Information</h3>
      
      <div class="form-group">
        <label>Site Title</label>
        <input
          type="text"
          value={cmsDataValue.settings.siteTitle || ''}
          on:input={(e) => handleChange('siteTitle', e.target.value)}
          placeholder="My Website"
        />
      </div>
      
      <div class="form-group">
        <label>Description</label>
        <textarea
          value={cmsDataValue.settings.description || ''}
          on:input={(e) => handleChange('description', e.target.value)}
          placeholder="Website description..."
          rows="3"
        ></textarea>
      </div>
      
      <div class="form-group">
        <label>Domain</label>
        <input
          type="url"
          value={cmsDataValue.settings.domain || ''}
          on:input={(e) => handleChange('domain', e.target.value)}
          placeholder="https://example.com"
        />
      </div>
    </div>
    
    <!-- Vercel Settings -->
    <div class="settings-card">
      <h3>Vercel Deployment</h3>
      
      <div class="form-group">
        <label>Vercel Project Name</label>
        <input
          type="text"
          value={cmsDataValue.settings.vercelProjectName || ''}
          on:input={(e) => handleVercelProjectNameChange(e.target.value)}
          placeholder="my-project"
        />
        <small>Lowercase letters, numbers, and hyphens only</small>
      </div>
      
      <div class="form-group">
        <label>Vercel API Key</label>
        <input
          type="password"
          value={cmsDataValue.settings.vercelApiKey || ''}
          on:input={(e) => handleChange('vercelApiKey', e.target.value)}
          placeholder="Enter your Vercel API key"
        />
      </div>
    </div>
    
    <!-- Logo & Favicon -->
    <div class="settings-card">
      <h3>Branding</h3>
      
      <div class="form-group">
        <label>Logo</label>
        <div class="image-upload">
          {#if cmsDataValue.settings.logo}
            <img src={cmsDataValue.settings.logo} alt="Logo" class="image-preview" />
          {/if}
          <input
            type="file"
            accept="image/*"
            on:change={(e) => handleFileChange('logo', e.target.files[0])}
          />
          <button class="btn-secondary" on:click={() => handleSelectImage('logo')}>
            <i class="fas fa-image"></i> Choose from Assets
          </button>
        </div>
      </div>
      
      <div class="form-group">
        <label>Favicon</label>
        <div class="image-upload">
          {#if cmsDataValue.settings.favicon}
            <img src={cmsDataValue.settings.favicon} alt="Favicon" class="image-preview" />
          {/if}
          <input
            type="file"
            accept="image/*"
            on:change={(e) => handleFileChange('favicon', e.target.files[0])}
          />
        </div>
      </div>
    </div>
    
    <!-- Languages -->
    <div class="settings-card">
      <h3>Languages</h3>
      
      {#if cmsDataValue.settings.languages && cmsDataValue.settings.languages.length > 0}
        <div class="languages-list">
          {#each cmsDataValue.settings.languages as lang}
            <div class="language-item">
              <span>{lang.name} ({lang.code})</span>
              <button class="btn-danger" on:click={() => handleRemoveLanguage(lang.code)}>
                <i class="fas fa-trash"></i>
              </button>
            </div>
          {/each}
        </div>
      {/if}
      
      <button class="btn-primary" on:click={handleAddLanguage}>
        <i class="fas fa-plus"></i> Add Language
      </button>
    </div>
    
    <!-- Social Media -->
    <div class="settings-card">
      <h3>Social Media</h3>
      
      {#if cmsDataValue.settings.socialMedia}
        {#each cmsDataValue.settings.socialMedia.entries() as [index, social]}
          <div class="social-media-item">
            <input
              type="text"
              placeholder="Platform (e.g., Facebook)"
              value={social.platform}
              on:input={(e) => handleSocialMediaChange(index, 'platform', e.target.value)}
            />
            <input
              type="url"
              placeholder="URL"
              value={social.url}
              on:input={(e) => handleSocialMediaChange(index, 'url', e.target.value)}
            />
            <button class="btn-danger" on:click={() => handleRemoveSocialMedia(index)}>
              <i class="fas fa-trash"></i>
            </button>
          </div>
        {/each}
      {/if}
      
      <button class="btn-primary" on:click={handleAddSocialMedia}>
        <i class="fas fa-plus"></i> Add Social Media
      </button>
    </div>
    
    <!-- Collaboration Settings -->
    <div class="settings-card">
      <h3>Collaboration</h3>
      
      {#if !cmsDataValue.collabState.isConnected}
        <div class="collaboration-setup">
          <div class="form-group">
            <label>Your Name</label>
            <input
              type="text"
              bind:value={connectName}
              placeholder="Anonymous"
            />
          </div>
          
          {#if !cmsDataValue.collabState.isServer}
            <div class="form-group">
              <label>Server IP</label>
              <input
                type="text"
                bind:value={connectIP}
                placeholder="192.168.1.100"
              />
            </div>
            
            <button class="btn-primary" on:click={handleConnect}>
              <i class="fas fa-plug"></i> Connect to Server
            </button>
          {/if}
          
          {#if !cmsDataValue.collabState.isServer && !cmsDataValue.collabState.isConnected}
            <button class="btn-secondary" on:click={handleStartServer}>
              <i class="fas fa-server"></i> Start Server
            </button>
          {/if}
        </div>
      {:else}
        <div class="collaboration-status connected">
          <i class="fas fa-check-circle"></i>
          <span>
            Connected as {cmsDataValue.collabState.clientName}
            {#if cmsDataValue.collabState.isServer}
              (Host)
            {:else}
              (Client)
            {/if}
          </span>
        </div>
        
        <button class="btn-danger" on:click={handleDisconnect}>
          <i class="fas fa-unplug"></i> Disconnect
        </button>
        
        {#if cmsDataValue.collabState.connectedClients && cmsDataValue.collabState.connectedClients.length > 0}
          <div class="connected-clients">
            <h4>Connected Clients</h4>
            {#each cmsDataValue.collabState.connectedClients as client}
              <div class="client-item">
                <i class="fas fa-user"></i>
                <span>{client.name}</span>
              </div>
            {/each}
          </div>
        {/if}
      {/if}
    </div>
    
    <!-- Extensions -->
    <div class="settings-card">
      <h3>Extensions</h3>
      
      <div class="extension-item">
        <label>
          <input
            type="checkbox"
            checked={extensions['notes-extension-enabled'] || false}
            on:change={(e) => {
              extensions['notes-extension-enabled'] = e.target.checked;
              saveSettings({ ...cmsDataValue.settings });
            }}
          />
          Notes Extension
        </label>
      </div>
    </div>
  </div>
</div>

<style>
  .settings-section {
    padding: 20px;
  }
  
  .settings-section h2 {
    font-size: 24px;
    font-weight: 700;
    color: #0f172a;
    margin-bottom: 24px;
    display: flex;
    align-items: center;
    gap: 12px;
  }
  
  .settings-section h2 i {
    color: #2563eb;
  }
  
  .settings-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
    gap: 20px;
  }
  
  .settings-card {
    background: white;
    border-radius: 8px;
    padding: 20px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  }
  
  .settings-card h3 {
    font-size: 18px;
    font-weight: 600;
    color: #0f172a;
    margin-bottom: 16px;
    padding-bottom: 12px;
    border-bottom: 2px solid #e2e8f0;
  }
  
  .form-group {
    margin-bottom: 16px;
  }
  
  .form-group label {
    display: block;
    font-weight: 500;
    color: #475569;
    margin-bottom: 8px;
    font-size: 14px;
  }
  
  .form-group input[type="text"],
  .form-group input[type="url"],
  .form-group input[type="password"],
  .form-group textarea {
    width: 100%;
    padding: 10px 14px;
    border: 1px solid #e2e8f0;
    border-radius: 6px;
    font-size: 14px;
    font-family: inherit;
    transition: border-color 0.2s, box-shadow 0.2s;
  }
  
  .form-group input:focus,
  .form-group textarea:focus {
    outline: none;
    border-color: #2563eb;
    box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
  }
  
  .form-group small {
    display: block;
    margin-top: 6px;
    color: #64748b;
    font-size: 12px;
  }
  
  .image-upload {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
  
  .image-preview {
    max-width: 200px;
    max-height: 200px;
    border-radius: 6px;
    border: 1px solid #e2e8f0;
  }
  
  .btn-primary,
  .btn-secondary,
  .btn-danger {
    padding: 10px 16px;
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
    background: white;
    color: #475569;
    border: 1px solid #e2e8f0;
  }
  
  .btn-secondary:hover {
    background: #f8fafc;
  }
  
  .btn-danger {
    background: #ef4444;
    color: white;
  }
  
  .btn-danger:hover {
    background: #dc2626;
  }
  
  .languages-list {
    margin-bottom: 12px;
  }
  
  .language-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 10px 14px;
    background: #f8fafc;
    border-radius: 6px;
    margin-bottom: 8px;
  }
  
  .social-media-item {
    display: grid;
    grid-template-columns: 1fr 2fr auto;
    gap: 10px;
    margin-bottom: 10px;
    align-items: center;
  }
  
  .collaboration-setup {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
  
  .collaboration-status {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 12px 16px;
    border-radius: 6px;
    margin-bottom: 12px;
    font-weight: 500;
  }
  
  .collaboration-status.connected {
    background: #d1fae5;
    color: #065f46;
  }
  
  .connected-clients {
    margin-top: 16px;
    padding-top: 16px;
    border-top: 1px solid #e2e8f0;
  }
  
  .connected-clients h4 {
    font-size: 14px;
    font-weight: 600;
    color: #475569;
    margin-bottom: 10px;
  }
  
  .client-item {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 8px 12px;
    background: #f8fafc;
    border-radius: 6px;
    font-size: 14px;
  }
  
  .client-item i {
    color: #2563eb;
  }
  
  .extension-item {
    padding: 12px 0;
  }
  
  .extension-item label {
    display: flex;
    align-items: center;
    gap: 10px;
    font-weight: 500;
    color: #475569;
    cursor: pointer;
  }
  
  .extension-item input[type="checkbox"] {
    width: 18px;
    height: 18px;
    cursor: pointer;
  }
</style>
