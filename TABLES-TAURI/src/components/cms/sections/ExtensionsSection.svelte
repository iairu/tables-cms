<script>
  import { cmsData, saveExtensions } from '../../../stores/cmsData.js';
  
  let cmsDataValue;
  const unsubscribe = cmsData.subscribe(value => cmsDataValue = value);
  
  // All available extensions with metadata
  const extensions = [
    {
      id: 'notes-extension-enabled',
      name: 'Notes Extension',
      description: 'Enable sticky notes sidebar for quick notes and reminders.',
      icon: 'fa-sticky-note',
      category: 'Productivity',
      comingSoon: false,
      sensitive: false
    },
    {
      id: 'pages-extension-enabled',
      name: 'Pages Extension',
      description: 'Create and manage website pages with component-based builder.',
      icon: 'fa-file',
      category: 'Core',
      comingSoon: false,
      sensitive: false
    },
    {
      id: 'blog-extension-enabled',
      name: 'Blog Extension',
      description: 'Full-featured blogging engine with rich text editing.',
      icon: 'fa-pen-fancy',
      category: 'Core',
      comingSoon: false,
      sensitive: false
    },
    {
      id: 'page-groups-extension-enabled',
      name: 'Page Groups Extension',
      description: 'Organize pages into hierarchical groups with dropdown menus.',
      icon: 'fa-layer-group',
      category: 'Core',
      comingSoon: false,
      sensitive: false
    },
    {
      id: 'pedigree-extension-enabled',
      name: 'Pedigree Extension',
      description: 'Track cat pedigrees, breeding records, and lineage trees.',
      icon: 'fa-paw',
      category: 'Database',
      comingSoon: false,
      sensitive: false
    },
    {
      id: 'rental-extension-enabled',
      name: 'Rental Management',
      description: 'Complete rental business solution with inventory, reservations, and calendar.',
      icon: 'fa-store',
      category: 'Business',
      comingSoon: false,
      sensitive: false
    },
    {
      id: 'movie-tracker-enabled',
      name: 'Movie Tracker',
      description: 'Track movies and shows with IMDB integration.',
      icon: 'fa-film',
      category: 'Personal',
      comingSoon: false,
      sensitive: false
    },
    {
      id: 'personal-extension-enabled',
      name: 'Personal Database',
      description: 'Store personal information, hobbies, interests, and preferences.',
      icon: 'fa-user',
      category: 'Personal',
      comingSoon: false,
      sensitive: true,
      warning: '⚠️ Demo Only: This extension is for data structure demonstration only. Data is NOT encrypted and should NOT be used for storing actual sensitive information in production.'
    },
    {
      id: 'biometric-extension-enabled',
      name: 'Biometric Database',
      description: 'Database with fingerprints, face mugshots, and physical characteristics.',
      icon: 'fa-fingerprint',
      category: 'Sensitive',
      comingSoon: false,
      sensitive: true,
      warning: '⚠️ Demo Only: This extension is for data structure demonstration only. Data is NOT encrypted and should NOT be used for storing actual biometric data. GDPR and privacy regulations apply.'
    },
    {
      id: 'medical-extension-enabled',
      name: 'Medical Records',
      description: 'Medical records, allergies, medications, and health history.',
      icon: 'fa-heartbeat',
      category: 'Sensitive',
      comingSoon: false,
      sensitive: true,
      warning: '⚠️ Demo Only: This extension is for data structure demonstration only. NOT HIPAA compliant. Do NOT store actual medical data.'
    },
    {
      id: 'financial-extension-enabled',
      name: 'Financial Database',
      description: 'Financial information, income, expenses, assets, liabilities, and credit scores.',
      icon: 'fa-coins',
      category: 'Sensitive',
      comingSoon: false,
      sensitive: true,
      warning: '⚠️ Demo Only: This extension is for data structure demonstration only. Data is NOT encrypted. Do NOT store actual financial data.'
    },
    {
      id: 'legal-extension-enabled',
      name: 'Legal Records',
      description: 'Legal information, criminal records, court cases, and legal history.',
      icon: 'fa-gavel',
      category: 'Sensitive',
      comingSoon: false,
      sensitive: true,
      warning: '⚠️ Demo Only: This extension is for data structure demonstration only. Data is NOT encrypted. Do NOT store actual legal records.'
    },
    {
      id: 'analytics-extension-enabled',
      name: 'Analytics',
      description: 'Track website analytics and visitor statistics.',
      icon: 'fa-chart-bar',
      category: 'Business',
      comingSoon: true,
      sensitive: false
    },
    {
      id: 'email-forms-enabled',
      name: 'Email Forms',
      description: 'Contact form submissions and email notifications.',
      icon: 'fa-envelope',
      category: 'Business',
      comingSoon: true,
      sensitive: false
    },
    {
      id: 'ecommerce-enabled',
      name: 'E-commerce',
      description: 'Integration with external providers like Snipcart.',
      icon: 'fa-shopping-cart',
      category: 'Business',
      comingSoon: true,
      sensitive: false
    },
    {
      id: 'acl-extension-enabled',
      name: 'Access Control (ACL)',
      description: 'Manage user permissions, roles, and access levels across the CMS.',
      icon: 'fa-shield-alt',
      category: 'Security',
      comingSoon: false,
      sensitive: false
    },
    {
      id: 'collaboration-enabled',
      name: 'Real-time Collaboration',
      description: 'WebSocket-based collaboration with "Currently edited by" notifications.',
      icon: 'fa-users',
      category: 'Productivity',
      comingSoon: true,
      sensitive: false
    }
  ];
  
  // Group extensions by category
  $: groupedExtensions = extensions.reduce((acc, ext) => {
    if (!acc[ext.category]) acc[ext.category] = [];
    acc[ext.category].push(ext);
    return acc;
  }, {});
  
  function isExtensionEnabled(extensionId) {
    return cmsDataValue?.extensions?.[extensionId] || false;
  }
  
  function toggleExtension(extensionId) {
    saveExtensions({
      ...cmsDataValue?.extensions,
      [extensionId]: !isExtensionEnabled(extensionId)
    });
  }
  
  function getCategoryIcon(category) {
    const icons = {
      'Core': 'fa-cube',
      'Productivity': 'fa-lightbulb',
      'Database': 'fa-database',
      'Business': 'fa-briefcase',
      'Personal': 'fa-user',
      'Security': 'fa-shield-alt',
      'Sensitive': 'fa-exclamation-triangle'
    };
    return icons[category] || 'fa-puzzle-piece';
  }
</script>

<div class="extensions-section">
  <div class="section-header">
    <h2><i class="fas fa-puzzle-piece"></i> Extensions</h2>
    <p class="section-description">
      Enable or disable features and modules. Sensitive extensions show warnings.
    </p>
  </div>
  
  {#each Object.entries(groupedExtensions) as [category, categoryExtensions]}
    <div class="extensions-category">
      <div class="category-header">
        <i class="fas {getCategoryIcon(category)}"></i>
        <h3>{category}</h3>
        <span class="category-count">{categoryExtensions.length}</span>
      </div>
      
      <div class="extensions-grid">
        {#each categoryExtensions as ext}
          <div class="extension-card {ext.comingSoon ? 'coming-soon' : ''} {ext.sensitive ? 'sensitive' : ''}">
            <div class="extension-header">
              <i class="fas {ext.icon}"></i>
              <div class="extension-title">
                <h3>
                  {ext.name}
                  {#if ext.comingSoon}
                    <span class="badge badge-soon">Soon</span>
                  {/if}
                  {#if ext.sensitive}
                    <span class="badge badge-warning"><i class="fas fa-exclamation-triangle"></i></span>
                  {/if}
                </h3>
                <span class="extension-id">{ext.id}</span>
              </div>
            </div>
            
            <p class="extension-description">{ext.description}</p>
            
            {#if ext.sensitive}
              <div class="extension-warning">
                <i class="fas fa-exclamation-triangle"></i>
                <span>{ext.warning}</span>
              </div>
            {/if}
            
            <label class="toggle {ext.comingSoon || ext.sensitive ? 'disabled' : ''}">
              <input
                type="checkbox"
                checked={isExtensionEnabled(ext.id)}
                disabled={ext.comingSoon || ext.sensitive}
                on:change={() => toggleExtension(ext.id)}
              />
              <span class="toggle-slider"></span>
            </label>
            
            {#if ext.comingSoon}
              <span class="disabled-label">Coming soon</span>
            {:else if ext.sensitive}
              <span class="disabled-label">Demo only - not for production use</span>
            {/if}
          </div>
        {/each}
      </div>
    </div>
  {/each}
</div>

<style>
  .extensions-section {
    padding: 40px;
  }
  
  .section-header {
    margin-bottom: 32px;
  }
  
  .section-header h2 {
    font-size: 28px;
    color: var(--text-primary, #0f172a);
    margin-bottom: 8px;
    display: flex;
    align-items: center;
    gap: 12px;
  }
  
  .section-header h2 i {
    color: var(--color-primary, #2563eb);
  }
  
  .section-description {
    color: #64748b;
    font-size: 15px;
  }
  
  .extensions-category {
    margin-bottom: 40px;
  }
  
  .category-header {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 20px;
    padding-bottom: 12px;
    border-bottom: 2px solid var(--border-light, #e2e8f0);
  }
  
  .category-header i {
    font-size: 20px;
    color: var(--color-primary, #2563eb);
  }
  
  .category-header h3 {
    font-size: 18px;
    font-weight: 600;
    color: var(--text-primary, #0f172a);
    margin: 0;
  }
  
  .category-count {
    background: var(--bg-tertiary, #e2e8f0);
    color: var(--text-tertiary, #64748b);
    font-size: 12px;
    padding: 2px 10px;
    border-radius: 12px;
    font-weight: 600;
  }
  
  .extensions-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
    gap: 20px;
  }
  
  .extension-card {
    background: var(--bg-card, white);
    border-radius: 12px;
    padding: 24px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    display: flex;
    flex-direction: column;
    gap: 12px;
    border: 2px solid transparent;
    transition: all 0.2s;
  }
  
  .extension-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
  }
  
  .extension-card.coming-soon {
    opacity: 0.7;
    background: var(--bg-secondary, #f8fafc);
  }
  
  .extension-card.sensitive {
    border-color: var(--color-accent, #fbbf24);
    background: rgba(245, 158, 11, 0.05);
  }
  
  .extension-header {
    display: flex;
    align-items: flex-start;
    gap: 16px;
  }
  
  .extension-header i {
    font-size: 32px;
    color: var(--color-primary, #2563eb);
    flex-shrink: 0;
  }
  
  .extension-title {
    flex: 1;
  }
  
  .extension-title h3 {
    font-size: 16px;
    font-weight: 600;
    color: var(--text-primary, #0f172a);
    margin: 0;
    display: flex;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
  }
  
  .extension-id {
    font-size: 11px;
    color: var(--text-muted, #94a3b8);
    font-family: monospace;
  }
  
  .badge {
    font-size: 10px;
    padding: 2px 8px;
    border-radius: 12px;
    font-weight: 600;
    text-transform: uppercase;
  }
  
  .badge-soon {
    background: var(--bg-tertiary, #e2e8f0);
    color: var(--text-tertiary, #64748b);
  }
  
  .badge-warning {
    background: #fbbf24;
    color: #92400e;
  }
  
  .extension-description {
    color: var(--text-tertiary, #64748b);
    font-size: 14px;
    line-height: 1.5;
    flex: 1;
  }
  
  .extension-warning {
    background: rgba(245, 158, 11, 0.1);
    border-left: 3px solid var(--color-accent, #f59e0b);
    padding: 12px;
    border-radius: 6px;
    font-size: 12px;
    color: var(--color-accent, #92400e);
    display: flex;
    gap: 8px;
    line-height: 1.4;
  }
  
  .extension-warning i {
    flex-shrink: 0;
    margin-top: 2px;
  }
  
  .toggle {
    position: relative;
    display: inline-block;
    width: 52px;
    height: 28px;
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
    background-color: var(--border-medium, #cbd5e1);
    transition: 0.3s;
    border-radius: 28px;
  }
  
  .toggle-slider:before {
    position: absolute;
    content: "";
    height: 22px;
    width: 22px;
    left: 3px;
    bottom: 3px;
    background-color: white;
    transition: 0.3s;
    border-radius: 50%;
    box-shadow: 0 2px 4px rgba(0,0,0,0.2);
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
    background-color: var(--bg-tertiary, #e2e8f0);
  }
  
  .toggle.disabled input:checked + .toggle-slider {
    background-color: #94a3b8;
  }
  
  .disabled-label {
    font-size: 12px;
    color: #64748b;
    font-style: italic;
  }
  
  @media (max-width: 768px) {
    .extensions-grid {
      grid-template-columns: 1fr;
    }
  }
</style>
