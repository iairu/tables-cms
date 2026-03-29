<script>
  import { onMount } from 'svelte';
  import Layout from './components/Layout.svelte';
  import SettingsSection from './components/cms/sections/SettingsSection.svelte';
  import PagesSectionCompact from './components/cms/sections/PagesSectionCompact.svelte';
  import PageGroupsSection from './components/cms/sections/PageGroupsSection.svelte';
  import BlogSection from './components/cms/sections/BlogSection.svelte';
  import CatsSection from './components/cms/sections/CatsSection.svelte';
  import PersonalSection from './components/cms/sections/PersonalSection.svelte';
  import BiometricSection from './components/cms/sections/BiometricSection.svelte';
  import MedicalSection from './components/cms/sections/MedicalSection.svelte';
  import FinancialSection from './components/cms/sections/FinancialSection.svelte';
  import LegalSection from './components/cms/sections/LegalSection.svelte';
  import ACLSection from './components/cms/sections/ACLSection.svelte';
  import RentalInventorySection from './components/cms/sections/RentalInventorySection.svelte';
  import RentalAttendanceSection from './components/cms/sections/RentalAttendanceSection.svelte';
  import RentalCustomersSection from './components/cms/sections/RentalCustomersSection.svelte';
  import RentalEmployeesSection from './components/cms/sections/RentalEmployeesSection.svelte';
  import RentalReservationsSection from './components/cms/sections/RentalReservationsSection.svelte';
  import ExtensionsSection from './components/cms/sections/ExtensionsSection.svelte';
  import UploadsSection from './components/cms/sections/UploadsSection.svelte';
  import MoviesSection from './components/cms/sections/MoviesSection.svelte';
  import BuildConsole from './components/BuildConsole.svelte';
  import { cmsData, loadCMSData, triggerBuild } from './stores/cmsData.js';
  import { isLoading, showLoading, hideLoading } from './stores/loading.js';

  const isBrowser = typeof window !== 'undefined';

  // Simple client-side routing
  let currentRoute = '/cms/settings';
  let currentSection = 'settings';
  let cmsDataValue;
  let isLoadingValue;
  let showBuildConsole = false;

  const unsubscribeCms = cmsData.subscribe(value => cmsDataValue = value);
  const unsubscribeLoading = isLoading.subscribe(value => isLoadingValue = value);

  // Get available sections based on extensions
  function getAvailableSections() {
    const ext = cmsDataValue?.extensions || {};
    const sections = {
      'settings': true,
      'extensions': true,
      'uploads': true
    };

    // All sections require explicit extension enable
    if (ext['pages-extension-enabled'] === true) sections['pages'] = true;
    if (ext['page-groups-extension-enabled'] === true) sections['page-groups'] = true;
    if (ext['blog-extension-enabled'] === true) sections['blog'] = true;
    if (ext['pedigree-extension-enabled'] === true) sections['cats'] = true;
    if (ext['personal-extension-enabled'] === true) sections['personal'] = true;
    if (ext['biometric-extension-enabled'] === true) sections['biometric'] = true;
    if (ext['medical-extension-enabled'] === true) sections['medical'] = true;
    if (ext['financial-extension-enabled'] === true) sections['financial'] = true;
    if (ext['legal-extension-enabled'] === true) sections['legal'] = true;

    // Rental extension
    if (ext['rental-extension-enabled'] === true) {
      sections['rental-inventory'] = true;
      sections['rental-attendance'] = true;
      sections['rental-customers'] = true;
      sections['rental-employees'] = true;
      sections['rental-reservations'] = true;
      sections['rental-calendar'] = true;
    }

    // Other extensions
    if (ext['movie-tracker-enabled'] === true) sections['movietracker'] = true;

    return sections;
  }

  function getCurrentSection(path) {
    const sections = getAvailableSections();

    if (path.startsWith('/cms/pages')) return sections['pages'] ? 'pages' : 'settings';
    if (path.startsWith('/cms/page-groups')) return sections['page-groups'] ? 'page-groups' : 'settings';
    if (path.startsWith('/cms/blog')) return sections['blog'] ? 'blog' : 'settings';
    if (path.startsWith('/cms/pedigree')) return sections['cats'] ? 'cats' : 'settings';
    if (path.startsWith('/cms/personal')) return sections['personal'] ? 'personal' : 'settings';
    if (path.startsWith('/cms/acl')) return 'acl';
    if (path.startsWith('/cms/inventory')) return sections['rental-inventory'] ? 'rental-inventory' : 'settings';
    if (path.startsWith('/cms/attendance')) return sections['rental-attendance'] ? 'rental-attendance' : 'settings';
    if (path.startsWith('/cms/customers')) return sections['rental-customers'] ? 'rental-customers' : 'settings';
    if (path.startsWith('/cms/employees')) return sections['rental-employees'] ? 'rental-employees' : 'settings';
    if (path.startsWith('/cms/reservations')) return sections['rental-reservations'] ? 'rental-reservations' : 'settings';
    if (path.startsWith('/cms/calendar')) return sections['rental-calendar'] ? 'rental-calendar' : 'settings';
    if (path.startsWith('/cms/settings')) return 'settings';
    if (path.startsWith('/cms/extensions')) return 'extensions';
    if (path.startsWith('/cms/uploads')) return 'uploads';
    if (path.startsWith('/cms/movietracker')) return sections['movietracker'] ? 'movietracker' : 'settings';
    if (path.startsWith('/cms/biometric')) return sections['biometric'] ? 'biometric' : 'settings';
    if (path.startsWith('/cms/medical')) return sections['medical'] ? 'medical' : 'settings';
    if (path.startsWith('/cms/financial')) return sections['financial'] ? 'financial' : 'settings';
    if (path.startsWith('/cms/legal')) return sections['legal'] ? 'legal' : 'settings';
    return 'settings';
  }

  function navigate(path) {
    if (isBrowser) {
      showLoading();
      window.history.pushState({}, '', path);
      currentRoute = path;
      currentSection = getCurrentSection(path);

      // Hide loading after a short delay
      setTimeout(() => {
        hideLoading();
      }, 300);
    }
  }

  // Handle browser back/forward
  function handlePopState() {
    if (isBrowser) {
      currentRoute = window.location.pathname;
      currentSection = getCurrentSection(currentRoute);
    }
  }

  // Build and deploy handlers
  async function handleBuildLocally() {
    try {
      showBuildConsole = true;
      await triggerBuild(true);
    } catch (error) {
      console.error('Build failed:', error);
      alert('Build failed: ' + error.message);
    }
  }

  async function handleBuildAndDeploy() {
    try {
      showBuildConsole = true;
      await triggerBuild(false);
    } catch (error) {
      console.error('Deployment failed:', error);
      alert('Deployment failed: ' + error.message);
    }
  }
  
  onMount(() => {
    if (isBrowser) {
      // Load CMS data
      loadCMSData();
      
      // Set initial route
      currentRoute = window.location.pathname || '/cms/settings';
      currentSection = getCurrentSection(currentRoute);
      
      // Apply saved theme - preserve other classes
      const savedTheme = localStorage.getItem('tables-theme') || 'default';
      const currentClasses = document.body.className
        .split(' ')
        .filter(cls => !cls.startsWith('theme-'));
      document.body.className = [...currentClasses, `theme-${savedTheme}`].join(' ');
      
      // Listen for popstate
      window.addEventListener('popstate', handlePopState);
      
      // Listen for custom navigation events
      window.addEventListener('tables-navigation', (e) => {
        currentSection = e.detail.section;
      });
      
      // Keyboard shortcuts for reload
      window.addEventListener('keydown', (e) => {
        // Cmd+R or Ctrl+R - Soft reload
        if ((e.metaKey || e.ctrlKey) && e.key === 'r') {
          e.preventDefault();
          window.location.reload();
        }
        // Cmd+Shift+R or Ctrl+Shift+R - Force reload
        if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === 'R') {
          e.preventDefault();
          window.location.reload(true);
        }
      });
    }
    
    return () => {
      unsubscribeCms();
      unsubscribeLoading();
      if (isBrowser) {
        window.removeEventListener('popstate', handlePopState);
      }
    };
  });
</script>

<main>
  <Layout
    currentSection={currentSection}
    currentRoute={currentRoute}
    onNavigate={navigate}
    onBuildLocally={handleBuildLocally}
    onBuildAndDeploy={handleBuildAndDeploy}
    isBuilding={isLoadingValue}
    canBuild={cmsDataValue?.canBuild}
    buildCooldownSeconds={cmsDataValue?.buildCooldownSeconds}
    domain={cmsDataValue?.settings?.domain}
    vercelApiKey={cmsDataValue?.settings?.vercelApiKey}
    extensions={cmsDataValue?.extensions}
  >
    {#if currentSection === 'settings'}
      <SettingsSection />
    {:else if currentSection === 'pages'}
      <PagesSectionCompact />
    {:else if currentSection === 'page-groups'}
      <PageGroupsSection />
    {:else if currentSection === 'blog'}
      <BlogSection />
    {:else if currentSection === 'cats'}
      <CatsSection />
    {:else if currentSection === 'personal'}
      <PersonalSection />
    {:else if currentSection === 'biometric'}
      <BiometricSection />
    {:else if currentSection === 'medical'}
      <MedicalSection />
    {:else if currentSection === 'financial'}
      <FinancialSection />
    {:else if currentSection === 'legal'}
      <LegalSection />
    {:else if currentSection === 'acl'}
      <ACLSection />
    {:else if currentSection === 'rental-inventory'}
      <RentalInventorySection />
    {:else if currentSection === 'rental-attendance'}
      <RentalAttendanceSection />
    {:else if currentSection === 'rental-customers'}
      <RentalCustomersSection />
    {:else if currentSection === 'rental-employees'}
      <RentalEmployeesSection />
    {:else if currentSection === 'rental-reservations'}
      <RentalReservationsSection />
    {:else if currentSection === 'extensions'}
      <ExtensionsSection />
    {:else if currentSection === 'uploads'}
      <UploadsSection />
    {:else if currentSection === 'movietracker'}
      <MoviesSection />
    {:else}
      <div class="section-not-found">
        <i class="fas fa-exclamation-circle"></i>
        <h2>Section Not Available</h2>
        <p>This section may require enabling an extension.</p>
        <button class="btn-primary" on:click={() => navigate('/cms/extensions')}>
          <i class="fas fa-puzzle-piece"></i> Go to Extensions
        </button>
      </div>
    {/if}
  </Layout>

  <BuildConsole
    isOpen={showBuildConsole}
    onClose={() => showBuildConsole = false}
  />
</main>

<style>
  :global(body) {
    margin: 0;
    padding: 0;
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    background: var(--bg-primary);
    color: var(--text-primary);
  }

  :global(#app) {
    min-height: 100vh;
  }

  main {
    min-height: 100vh;
  }
  
  .section-not-found {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 60px 20px;
    text-align: center;
  }
  
  .section-not-found i {
    font-size: 64px;
    color: var(--text-muted);
    margin-bottom: 20px;
  }
  
  .section-not-found h2 {
    font-size: 24px;
    margin-bottom: 8px;
  }
  
  .section-not-found p {
    color: var(--text-tertiary);
    margin-bottom: 24px;
  }
  
  .btn-primary {
    padding: 10px 20px;
    background: var(--color-primary);
    color: white;
    border: none;
    border-radius: 6px;
    font-weight: 600;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    gap: 8px;
    transition: background 0.2s;
  }
  
  .btn-primary:hover {
    background: var(--color-primary-dark);
  }
</style>
