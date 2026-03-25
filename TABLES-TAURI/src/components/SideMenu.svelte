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
  export let extensions = {};

  // All possible menu items with extension toggle support
  const allMenuItems = [
    { id: 'pages', label: 'Pages', icon: 'fa-file', extension: 'pages-extension-enabled' },
    { id: 'page-groups', label: 'Page Groups', icon: 'fa-layer-group', extension: 'page-groups-extension-enabled' },
    { id: 'blog', label: 'Blog', icon: 'fa-pen-fancy', extension: 'blog-extension-enabled' },
    { id: 'cats', label: 'Pedigree', icon: 'fa-paw', extension: 'pedigree-extension-enabled' },
    { id: 'personal', label: 'Personal', icon: 'fa-user', extension: 'personal-extension-enabled' },
    { id: 'inventory', label: 'Inventory', icon: 'fa-boxes', extension: 'rental-extension-enabled', parent: 'rental' },
    { id: 'attendance', label: 'Attendance', icon: 'fa-clipboard-list', extension: 'rental-extension-enabled', parent: 'rental' },
    { id: 'customers', label: 'Customers', icon: 'fa-users', extension: 'rental-extension-enabled', parent: 'rental' },
    { id: 'employees', label: 'Employees', icon: 'fa-id-badge', extension: 'rental-extension-enabled', parent: 'rental' },
    { id: 'reservations', label: 'Reservations', icon: 'fa-calendar-check', extension: 'rental-extension-enabled', parent: 'rental' },
    { id: 'calendar', label: 'Calendar', icon: 'fa-calendar-alt', extension: 'rental-extension-enabled', parent: 'rental' },
    { id: 'settings', label: 'Settings', icon: 'fa-cog', extension: null },
    { id: 'extensions', label: 'Extensions', icon: 'fa-puzzle-piece', extension: null },
    { id: 'uploads', label: 'Uploads', icon: 'fa-upload', extension: null },
    { id: 'movietracker', label: 'Movie Tracker', icon: 'fa-film', extension: 'movie-tracker-enabled' },
    { id: 'biometric', label: 'Biometric', icon: 'fa-fingerprint', extension: 'biometric-extension-enabled' },
    { id: 'medical', label: 'Medical', icon: 'fa-heartbeat', extension: 'medical-extension-enabled' },
    { id: 'financial', label: 'Financial', icon: 'fa-coins', extension: 'financial-extension-enabled' },
    { id: 'legal', label: 'Legal', icon: 'fa-gavel', extension: 'legal-extension-enabled' }
  ];

  // Compute visible menu items based on extensions
  $: safeExtensions = (extensions && typeof extensions === 'object') ? extensions : {};
  $: visibleMenuItems = allMenuItems.filter(item => {
    if (!item.extension) return true;
    if (!safeExtensions || typeof safeExtensions !== 'object') return false;
    return safeExtensions[item.extension] === true;
  });

  // Group rental items
  $: groupedMenuItems = (() => {
    if (!visibleMenuItems || !Array.isArray(visibleMenuItems)) return [];
    
    const rentalItems = visibleMenuItems.filter(item => item.parent === 'rental');
    const otherItems = visibleMenuItems.filter(item => !item.parent);

    if (rentalItems.length > 0) {
      const rentalIndex = otherItems.findIndex(item => item.id === 'settings');
      if (rentalIndex >= 0) {
        otherItems.splice(rentalIndex, 0, {
          id: 'rental',
          label: 'Rental Management',
          icon: 'fa-store',
          isGroup: true,
          children: rentalItems
        });
      }
    }

    return otherItems;
  })();

  // Track if rental group is expanded
  let rentalExpanded = false;

  function handleNavigation(sectionId) {
    const path = `/cms/${sectionId}`;
    if (isBrowser) {
      window.history.pushState({}, '', path);
      // Dispatch custom event for navigation
      window.dispatchEvent(new CustomEvent('tables-navigation', { 
        detail: { section: sectionId, path } 
      }));
    }
    onNavigate(path);
  }

  function formatLastSaved(timestamp) {
    if (!timestamp) return 'Not saved yet';
    const date = new Date(timestamp);
    return date.toLocaleString();
  }

  function toggleRentalGroup() {
    rentalExpanded = !rentalExpanded;
  }
</script>

<aside class="side-menu">
  <nav class="menu-nav">
    {#each (groupedMenuItems || []) as item}
      {#if item.isGroup}
        <div class="menu-group">
          <button
            class="menu-item group-header {rentalExpanded ? 'expanded' : ''}"
            on:click={toggleRentalGroup}
          >
            <i class="fas {item.icon}"></i>
            <span>{item.label}</span>
            <i class="fas fa-chevron-down group-arrow"></i>
          </button>

          {#if rentalExpanded}
            <div class="menu-group-children">
              {#each (item.children || []) as child}
                <button
                  class="menu-item child {currentSection === child.id ? 'active' : ''}"
                  on:click={() => handleNavigation(child.id)}
                >
                  <i class="fas {child.icon}"></i>
                  <span>{child.label}</span>
                </button>
              {/each}
            </div>
          {/if}
        </div>
      {:else}
        <button
          class="menu-item {currentSection === item.id ? 'active' : ''}"
          on:click={() => handleNavigation(item.id)}
        >
          <i class="fas {item.icon}"></i>
          <span>{item.label}</span>
        </button>
      {/if}
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
    top: 65px; /* Same as header height */
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
    flex-shrink: 0;
  }

  .menu-item.child {
    padding-left: 52px;
    font-size: 13px;
  }

  .menu-group {
    margin-bottom: 4px;
  }

  .menu-item.group-header {
    font-weight: 600;
    color: #0f172a;
  }

  .menu-item.group-header .group-arrow {
    margin-left: auto;
    font-size: 12px;
    transition: transform 0.2s;
  }

  .menu-item.group-header.expanded .group-arrow {
    transform: rotate(180deg);
  }

  .menu-group-children {
    background: #f8fafc;
    border-radius: 6px;
    margin: 4px 8px;
    overflow: hidden;
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

  /* Prevent icon flashing - ensure icons are always rendered */
  .menu-item i,
  .fas {
    will-change: auto;
    backface-visibility: hidden;
  }
</style>
