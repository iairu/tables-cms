<script>
  import Layout from './components/Layout.svelte';
  import SettingsSection from './components/cms/sections/SettingsSection.svelte';
  import PagesSection from './components/cms/sections/PagesSection.svelte';
  import PageGroupsSection from './components/cms/sections/PageGroupsSection.svelte';
  import BlogSection from './components/cms/sections/BlogSection.svelte';
  import CatsSection from './components/cms/sections/CatsSection.svelte';
  import PersonalSection from './components/cms/sections/PersonalSection.svelte';
  import RentalInventorySection from './components/cms/sections/RentalInventorySection.svelte';
  import RentalAttendanceSection from './components/cms/sections/RentalAttendanceSection.svelte';
  import RentalCustomersSection from './components/cms/sections/RentalCustomersSection.svelte';
  import RentalEmployeesSection from './components/cms/sections/RentalEmployeesSection.svelte';
  import RentalReservationsSection from './components/cms/sections/RentalReservationsSection.svelte';
  import ExtensionsSection from './components/cms/sections/ExtensionsSection.svelte';
  import UploadsSection from './components/cms/sections/UploadsSection.svelte';
  import MoviesSection from './components/cms/sections/MoviesSection.svelte';
  import { cmsData } from './stores/cmsData.js';
  import { isLoading } from './stores/loading.js';
  
  const isBrowser = typeof window !== 'undefined';

  // Simple client-side routing
  let currentRoute = '/cms/settings';
  let currentSection = 'settings';

  if (isBrowser) {
    currentRoute = window.location.pathname || '/cms/settings';
    currentSection = getCurrentSection(currentRoute);
    
    // Listen for navigation
    const handleNavigation = () => {
      currentRoute = window.location.pathname;
      currentSection = getCurrentSection(currentRoute);
    };
    
    window.addEventListener('popstate', handleNavigation);
  }

  function getCurrentSection(path) {
    if (path.startsWith('/cms/pages')) return 'pages';
    if (path.startsWith('/cms/page-groups')) return 'page-groups';
    if (path.startsWith('/cms/blog')) return 'blog';
    if (path.startsWith('/cms/pedigree')) return 'cats';
    if (path.startsWith('/cms/personal')) return 'personal';
    if (path.startsWith('/cms/inventory')) return 'rental-inventory';
    if (path.startsWith('/cms/attendance')) return 'rental-attendance';
    if (path.startsWith('/cms/customers')) return 'rental-customers';
    if (path.startsWith('/cms/employees')) return 'rental-employees';
    if (path.startsWith('/cms/reservations')) return 'rental-reservations';
    if (path.startsWith('/cms/calendar')) return 'rental-calendar';
    if (path.startsWith('/cms/settings')) return 'settings';
    if (path.startsWith('/cms/extensions')) return 'extensions';
    if (path.startsWith('/cms/uploads')) return 'uploads';
    if (path.startsWith('/cms/movietracker')) return 'movietracker';
    return 'settings';
  }

  function navigate(path) {
    if (isBrowser) {
      window.history.pushState({}, '', path);
      currentRoute = path;
      currentSection = getCurrentSection(path);
    }
  }
</script>

<main>
  <Layout 
    currentSection={currentSection}
    currentRoute={currentRoute}
    onNavigate={navigate}
  >
    {#if currentSection === 'settings'}
      <SettingsSection />
    {:else if currentSection === 'pages'}
      <PagesSection />
    {:else if currentSection === 'page-groups'}
      <PageGroupsSection />
    {:else if currentSection === 'blog'}
      <BlogSection />
    {:else if currentSection === 'cats'}
      <CatsSection />
    {:else if currentSection === 'personal'}
      <PersonalSection />
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
    {/if}
  </Layout>
</main>

<style>
  :global(body) {
    margin: 0;
    padding: 0;
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    background: #f8fafc;
  }
  
  :global(#app) {
    min-height: 100vh;
  }
  
  main {
    min-height: 100vh;
  }
</style>
