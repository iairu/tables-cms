<script>
  import { onMount } from 'svelte';
  import { cmsData, saveSettings } from '../../../stores/cmsData.js';
  import { isLoading, showLoading, hideLoading } from '../../../stores/loading.js';

  let cmsDataValue;
  let acl = {};
  let isLoadingValue;
  let selectedRole = 'admin';
  let isEditing = false;

  const roles = [
    { id: 'admin', name: 'Administrator', description: 'Full access to all features' },
    { id: 'editor', name: 'Editor', description: 'Can create and edit content' },
    { id: 'author', name: 'Author', description: 'Can create content only' },
    { id: 'contributor', name: 'Contributor', description: 'Can submit content for review' },
    { id: 'viewer', name: 'Viewer', description: 'Read-only access' }
  ];

  const permissions = [
    { id: 'pages-view', name: 'View Pages', category: 'Pages' },
    { id: 'pages-create', name: 'Create Pages', category: 'Pages' },
    { id: 'pages-edit', name: 'Edit Pages', category: 'Pages' },
    { id: 'pages-delete', name: 'Delete Pages', category: 'Pages' },
    { id: 'pages-publish', name: 'Publish Pages', category: 'Pages' },
    { id: 'blog-view', name: 'View Blog', category: 'Blog' },
    { id: 'blog-create', name: 'Create Articles', category: 'Blog' },
    { id: 'blog-edit', name: 'Edit Articles', category: 'Blog' },
    { id: 'blog-delete', name: 'Delete Articles', category: 'Blog' },
    { id: 'blog-publish', name: 'Publish Articles', category: 'Blog' },
    { id: 'page-groups-manage', name: 'Manage Page Groups', category: 'Page Groups' },
    { id: 'extensions-manage', name: 'Manage Extensions', category: 'System' },
    { id: 'settings-manage', name: 'Manage Settings', category: 'System' },
    { id: 'uploads-manage', name: 'Manage Uploads', category: 'System' },
    { id: 'acl-manage', name: 'Manage ACL', category: 'System' },
    { id: 'deploy-manage', name: 'Deploy Site', category: 'System' },
    { id: 'cats-manage', name: 'Manage Cats', category: 'Extensions' },
    { id: 'personal-manage', name: 'Manage Personal Records', category: 'Extensions' },
    { id: 'rental-manage', name: 'Manage Rental', category: 'Extensions' },
    { id: 'movies-manage', name: 'Manage Movies', category: 'Extensions' }
  ];

  const unsubscribeCms = cmsData.subscribe(value => {
    cmsDataValue = value;
    acl = value.acl || {};
  });

  const unsubscribeLoading = isLoading.subscribe(value => isLoadingValue = value);

  onMount(() => {
    showLoading();
    setTimeout(() => {
      hideLoading();
    }, 500);
  });

  function hasPermission(role, permissionId) {
    const rolePermissions = acl[role] || [];
    return rolePermissions.includes(permissionId);
  }

  function togglePermission(role, permissionId) {
    const currentPermissions = acl[role] || [];
    let newPermissions;

    if (currentPermissions.includes(permissionId)) {
      newPermissions = currentPermissions.filter(p => p !== permissionId);
    } else {
      newPermissions = [...currentPermissions, permissionId];
    }

    acl = { ...acl, [role]: newPermissions };
    saveSettings({ ...cmsDataValue.settings, acl });
  }

  function selectRole(role) {
    selectedRole = role;
    isEditing = true;
  }

  function resetACL() {
    // Reset to default permissions
    const defaultACL = {
      admin: permissions.map(p => p.id),
      editor: permissions.filter(p => !['acl-manage', 'extensions-manage', 'deploy-manage'].includes(p.id)).map(p => p.id),
      author: permissions.filter(p => ['pages-view', 'pages-create', 'blog-view', 'blog-create'].includes(p.id)).map(p => p.id),
      contributor: permissions.filter(p => ['pages-view', 'blog-view'].includes(p.id)).map(p => p.id),
      viewer: permissions.filter(p => p.id.endsWith('-view')).map(p => p.id)
    };

    acl = defaultACL;
    saveSettings({ ...cmsDataValue.settings, acl });
  }

  function exportACL() {
    const dataStr = JSON.stringify(acl, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `acl-export-${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }

  async function importACL(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const imported = JSON.parse(e.target.result);
        if (typeof imported !== 'object') {
          alert('Invalid ACL file format');
          return;
        }
        acl = imported;
        saveSettings({ ...cmsDataValue.settings, acl });
      } catch (error) {
        alert('Failed to parse ACL file: ' + error.message);
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  }

  function getPermissionCount(role) {
    return (acl[role] || []).length;
  }

  function getCategoryPermissions(category) {
    return permissions.filter(p => p.category === category);
  }

  const categories = [...new Set(permissions.map(p => p.category))];
</script>

<div class="acl-section">
  <div class="section-header">
    <h2><i class="fas fa-shield-alt"></i> Access Control List</h2>
    <div class="header-actions">
      <button class="btn-secondary" on:click={resetACL} title="Reset to defaults">
        <i class="fas fa-undo"></i>
        Reset Defaults
      </button>
      <button class="btn-secondary" on:click={exportACL} title="Export ACL">
        <i class="fas fa-download"></i>
        Export
      </button>
      <label class="btn-secondary" title="Import ACL">
        <i class="fas fa-upload"></i>
        Import
        <input
          type="file"
          style="display: none"
          accept=".json"
          on:change={importACL}
        />
      </label>
    </div>
  </div>

  <div class="acl-container">
    <div class="roles-sidebar">
      <h3>Roles</h3>
      {#each roles as role}
        <div
          class="role-item {selectedRole === role.id ? 'selected' : ''}"
          on:click={() => selectRole(role.id)}
        >
          <div class="role-name">{role.name}</div>
          <div class="role-description">{role.description}</div>
          <div class="role-permission-count">{getPermissionCount(role.id)} permissions</div>
        </div>
      {/each}
    </div>

    <div class="permissions-panel">
      <h3>
        {roles.find(r => r.id === selectedRole)?.name} Permissions
      </h3>

      {#each categories as category}
        <div class="permission-category">
          <h4>{category}</h4>
          <div class="permission-list">
            {#each getCategoryPermissions(category) as perm}
              <div class="permission-item">
                <label class="checkbox-label">
                  <input
                    type="checkbox"
                    checked={hasPermission(selectedRole, perm.id)}
                    on:change={() => togglePermission(selectedRole, perm.id)}
                  />
                  <span class="checkmark"></span>
                  <span class="permission-name">{perm.name}</span>
                </label>
              </div>
            {/each}
          </div>
        </div>
      {/each}
    </div>
  </div>

  <div class="acl-info">
    <i class="fas fa-info-circle"></i>
    <p>
      Configure role-based access control for your CMS. Select a role from the sidebar and toggle permissions on or off.
      Changes are saved automatically.
    </p>
  </div>
</div>

<style>
  .acl-section {
    padding: 20px;
  }

  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    flex-wrap: wrap;
    gap: 16px;
  }

  .section-header h2 {
    display: flex;
    align-items: center;
    gap: 12px;
    margin: 0;
  }

  .section-header h2 i {
    color: var(--color-primary);
  }

  .header-actions {
    display: flex;
    gap: 10px;
  }

  .btn-secondary {
    padding: 8px 16px;
    border: 1px solid var(--border-light);
    border-radius: var(--radius-md);
    background: var(--bg-secondary);
    color: var(--text-primary);
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    gap: 8px;
    transition: all 0.2s;
    font-size: 14px;
  }

  .btn-secondary:hover {
    background: var(--bg-tertiary);
    border-color: var(--color-primary);
  }

  .acl-container {
    display: grid;
    grid-template-columns: 280px 1fr;
    gap: 20px;
    margin-bottom: 20px;
  }

  .roles-sidebar {
    background: var(--bg-card);
    border-radius: var(--radius-xl);
    padding: 20px;
    box-shadow: var(--shadow-md);
  }

  .roles-sidebar h3 {
    margin: 0 0 16px;
    font-size: 16px;
    color: var(--text-secondary);
  }

  .role-item {
    padding: 12px;
    border-radius: var(--radius-md);
    cursor: pointer;
    transition: all 0.2s;
    border: 2px solid transparent;
    margin-bottom: 8px;
  }

  .role-item:hover {
    background: var(--bg-secondary);
  }

  .role-item.selected {
    background: rgba(37, 99, 235, 0.1);
    border-color: var(--color-primary);
  }

  .role-name {
    font-weight: 600;
    color: var(--text-primary);
    margin-bottom: 4px;
  }

  .role-description {
    font-size: 12px;
    color: var(--text-tertiary);
    margin-bottom: 4px;
  }

  .role-permission-count {
    font-size: 11px;
    color: var(--text-muted);
  }

  .permissions-panel {
    background: var(--bg-card);
    border-radius: var(--radius-xl);
    padding: 24px;
    box-shadow: var(--shadow-md);
  }

  .permissions-panel h3 {
    margin: 0 0 20px;
    font-size: 18px;
    color: var(--text-primary);
  }

  .permission-category {
    margin-bottom: 24px;
  }

  .permission-category h4 {
    margin: 0 0 12px;
    font-size: 14px;
    color: var(--text-secondary);
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .permission-list {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 8px;
  }

  .permission-item {
    padding: 8px 12px;
    background: var(--bg-secondary);
    border-radius: var(--radius-md);
    transition: all 0.2s;
  }

  .permission-item:hover {
    background: var(--bg-tertiary);
  }

  .checkbox-label {
    display: flex;
    align-items: center;
    gap: 10px;
    cursor: pointer;
    font-size: 14px;
    color: var(--text-primary);
  }

  .checkbox-label input[type="checkbox"] {
    width: 18px;
    height: 18px;
    cursor: pointer;
    accent-color: var(--color-primary);
  }

  .permission-name {
    user-select: none;
  }

  .acl-info {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 16px;
    background: rgba(37, 99, 235, 0.1);
    border-radius: var(--radius-md);
    border-left: 4px solid var(--color-primary);
  }

  .acl-info i {
    color: var(--color-primary);
    font-size: 20px;
  }

  .acl-info p {
    margin: 0;
    color: var(--text-secondary);
    font-size: 14px;
  }

  @media (max-width: 900px) {
    .acl-container {
      grid-template-columns: 1fr;
    }

    .roles-sidebar {
      margin-bottom: 0;
    }
  }
</style>
