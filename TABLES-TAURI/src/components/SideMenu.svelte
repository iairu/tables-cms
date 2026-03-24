<script>
  const isBrowser = typeof window !== 'undefined';

  export let currentSection = 'settings';
  export let isBuilding = false;
  export let lastSaved = null;
  export let onBuildClick = () => {};
  export let canBuild = false;
  export let buildCooldownSeconds = 0;
  export let domain = '';
  export let vercelApiKey = '';
  export let onNavigate = () => {};

  const menuItems = [
    { id: 'pages', label: 'Pages', icon: 'fa-file' },
    { id: 'page-groups', label: 'Page Groups', icon: 'fa-layer-group' },
    { id: 'blog', label: 'Blog', icon: 'fa-pen-fancy' },
    { id: 'cats', label: 'Pedigree', icon: 'fa-paw' },
    { id: 'personal', label: 'Personal', icon: 'fa-user' },
    { id: 'rental-inventory', label: 'Inventory', icon: 'fa-boxes' },
    { id: 'rental-attendance', label: 'Attendance', icon: 'fa-clipboard-list' },
    { id: 'rental-customers', label: 'Customers', icon: 'fa-users' },
    { id: 'rental-employees', label: 'Employees', icon: 'fa-id-badge' },
    { id: 'rental-reservations', label: 'Reservations', icon: 'fa-calendar-check' },
    { id: 'rental-calendar', label: 'Calendar', icon: 'fa-calendar-alt' },
    { id: 'settings', label: 'Settings', icon: 'fa-cog' },
    { id: 'extensions', label: 'Extensions', icon: 'fa-puzzle-piece' },
    { id: 'uploads', label: 'Uploads', icon: 'fa-upload' },
    { id: 'movietracker', label: 'Movie Tracker', icon: 'fa-film' }
  ];
  
  function handleNavigation(sectionId) {
    const path = `/cms/${sectionId}`;
    if (isBrowser) {
      window.history.pushState({}, '', path);
    }
    onNavigate(path);
  }
  
  function formatLastSaved(timestamp) {
    if (!timestamp) return 'Not saved yet';
    const date = new Date(timestamp);
    return date.toLocaleString();
  }
</script>

<aside class="side-menu">
  <nav class="menu-nav">
    {#each menuItems as item}
      <button
        class="menu-item {currentSection === item.id ? 'active' : ''}"
        on:click={() => handleNavigation(item.id)}
      >
        <i class="fas {item.icon}"></i>
        <span>{item.label}</span>
      </button>
    {/each}
  </nav>
  
  <div class="menu-footer">
    {#if isBuilding}
      <div class="build-status building">
        <i class="fas fa-spinner fa-spin"></i>
        <span>Building...</span>
      </div>
    {:else if canBuild}
      <div class="build-status ready">
        <i class="fas fa-check-circle"></i>
        <span>Ready to build</span>
      </div>
    {/if}
    
    <div class="last-saved">
      <i class="fas fa-clock"></i>
      <span>Last saved: {formatLastSaved(lastSaved)}</span>
    </div>
  </div>
</aside>

<style>
  .side-menu {
    width: 260px;
    background: white;
    border-right: 1px solid #e2e8f0;
    display: flex;
    flex-direction: column;
    height: calc(100vh - 65px);
    position: sticky;
    top: 65px;
  }
  
  .menu-nav {
    flex: 1;
    padding: 16px 0;
    overflow-y: auto;
  }
  
  .menu-item {
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
    color: #475569;
    transition: all 0.2s;
    border-left: 3px solid transparent;
  }
  
  .menu-item:hover {
    background: #f8fafc;
    color: #2563eb;
  }
  
  .menu-item.active {
    background: #eff6ff;
    color: #2563eb;
    border-left-color: #2563eb;
  }
  
  .menu-item i {
    width: 20px;
    text-align: center;
  }
  
  .menu-footer {
    padding: 16px 20px;
    border-top: 1px solid #e2e8f0;
    background: #f8fafc;
  }
  
  .build-status {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 12px;
    border-radius: 6px;
    font-size: 13px;
    font-weight: 500;
    margin-bottom: 8px;
  }
  
  .build-status.building {
    background: #fef3c7;
    color: #92400e;
  }
  
  .build-status.ready {
    background: #d1fae5;
    color: #065f46;
  }
  
  .last-saved {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 12px;
    color: #64748b;
  }
</style>
