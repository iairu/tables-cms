<script>
  import { currentProject, isProjectOpen, recentProjects, openProject, saveProject, closeProject, openRecentProject } from '../stores/projectManager.js';
  
  let currentProjectValue;
  const unsubscribeCurrent = currentProject.subscribe(value => currentProjectValue = value);
  
  let recentProjectsValue = [];
  const unsubscribeRecent = recentProjects.subscribe(value => recentProjectsValue = value);
  
  let isProjectOpenValue = false;
  const unsubscribeOpen = isProjectOpen.subscribe(value => isProjectOpenValue = value);
  
  let showRecentMenu = false;
  
  function handleOpenProject() {
    openProject();
    showRecentMenu = false;
  }
  
  function handleSaveProject() {
    saveProject();
  }
  
  function handleCloseProject() {
    closeProject();
  }
  
  function handleOpenRecent(path) {
    openRecentProject(path);
    showRecentMenu = false;
  }
  
  function getFileName(path) {
    if (!path) return '';
    return path.split('/').pop() || path.split('\\').pop() || path;
  }
  
  function formatPath(path) {
    if (!path) return '';
    const parts = path.split('/');
    if (parts.length > 3) {
      return '.../' + parts.slice(-3).join('/');
    }
    return path;
  }
</script>

<div class="project-menu">
  <div class="project-info">
    {#if isProjectOpenValue && currentProjectValue}
      <div class="project-name" title={currentProjectValue?.name || currentProjectValue?.path}>
        <i class="fas fa-folder-open"></i>
        <span>{getFileName(currentProjectValue?.path)}</span>
      </div>
      <button class="btn-icon btn-xs" on:click={handleCloseProject} title="Close Project">
        <i class="fas fa-times"></i>
      </button>
    {:else}
      <div class="project-name untitled">
        <i class="fas fa-folder"></i>
        <span>Untitled Project</span>
      </div>
    {/if}
  </div>

  <div class="project-actions">
    <button class="btn-secondary btn-sm" on:click={handleSaveProject} title="Save Project (Cmd+S)">
      <i class="fas fa-save"></i>
      <span>Save Project</span>
    </button>

    <button class="btn-primary btn-sm" on:click={handleOpenProject} title="Open Project (Cmd+O)">
      <i class="fas fa-folder-open"></i>
      <span>{isProjectOpenValue ? 'Open Another' : 'Open Project'}</span>
    </button>

    {#if recentProjectsValue && recentProjectsValue.length > 0}
      <div class="dropdown" class:open={showRecentMenu}>
        <button
          class="btn-icon btn-sm"
          on:click={() => showRecentMenu = !showRecentMenu}
          title="Recent Projects"
        >
          <i class="fas fa-chevron-down"></i>
        </button>

        <div class="dropdown-content">
          <div class="dropdown-header">Recent Projects</div>

          {#each recentProjectsValue as path}
            <button class="dropdown-item recent" on:click={() => handleOpenRecent(path)}>
              <i class="fas fa-history"></i>
              <span class="recent-path" title={path}>{formatPath(path)}</span>
            </button>
          {/each}

          <div class="dropdown-separator"></div>
          <button class="dropdown-item" on:click={() => { clearRecentProjects(); showRecentMenu = false; }}>
            <i class="fas fa-trash"></i>
            <span>Clear Recent</span>
          </button>
        </div>
      </div>
    {/if}
  </div>
</div>

<style>
  .project-menu {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 8px 16px;
    background: var(--bg-secondary, #f8fafc);
    border-bottom: 1px solid var(--border-light, #e2e8f0);
    margin-top: 65px;
  }

  .project-info {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .project-name {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 14px;
    font-weight: 600;
    color: var(--text-primary, #0f172a);
    padding: 6px 12px;
    background: var(--bg-card, white);
    border-radius: 6px;
    border: 1px solid var(--border-light, #e2e8f0);
    max-width: 300px;
    overflow: hidden;
  }
  
  .project-name i {
    color: #2563eb;
  }
  
  .project-name span {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .project-name.untitled {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 14px;
    color: var(--text-tertiary, #94a3b8);
    padding: 6px 12px;
  }

  .project-name.untitled i {
    font-size: 16px;
  }
  
  .project-actions {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-left: auto;
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
    min-width: 280px;
    max-width: 400px;
    z-index: 1000;
    margin-top: 8px;
    overflow: hidden;
    border: 1px solid var(--border-light, #e2e8f0);
  }
  
  .dropdown.open .dropdown-content {
    display: block;
  }
  
  .dropdown-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 10px 16px;
    border: none;
    background: transparent;
    width: 100%;
    text-align: left;
    cursor: pointer;
    transition: background 0.2s;
    color: var(--text-primary, #0f172a);
  }
  
  .dropdown-item:hover {
    background: var(--bg-secondary, #f8fafc);
  }
  
  .dropdown-item i {
    color: #2563eb;
    width: 16px;
  }
  
  .dropdown-separator {
    height: 1px;
    background: var(--border-light, #e2e8f0);
    margin: 4px 0;
  }
  
  .dropdown-header {
    padding: 8px 16px;
    font-size: 11px;
    font-weight: 600;
    color: var(--text-tertiary, #94a3b8);
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
  
  .recent-path {
    font-size: 12px;
    color: var(--text-secondary, #475569);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    flex: 1;
  }
  
  .btn-primary,
  .btn-secondary {
    padding: 8px 14px;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-weight: 600;
    font-size: 13px;
    display: inline-flex;
    align-items: center;
    gap: 6px;
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
    color: var(--text-secondary, #475569);
    border: 1px solid var(--border-light, #e2e8f0);
  }
  
  .btn-secondary:hover {
    background: var(--bg-secondary, #f8fafc);
  }
  
  .btn-sm {
    padding: 6px 12px;
    font-size: 13px;
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

  .btn-icon.btn-sm {
    width: 32px;
    height: 32px;
    border-radius: 6px;
  }

  .btn-icon:hover {
    background: var(--bg-tertiary, #f1f5f9);
  }
</style>
