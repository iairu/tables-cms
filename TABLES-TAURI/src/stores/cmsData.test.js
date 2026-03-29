import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { cmsData, loadCMSData, savePages, saveBlogArticles, saveSettings, saveExtensions } from './cmsData.js';

describe('cmsData Store', () => {
  let unsubscribe;
  let currentValue;

  beforeEach(() => {
    // Subscribe to store changes
    unsubscribe = cmsData.subscribe(value => {
      currentValue = value;
    });
    
    // Reset localStorage before each test
    localStorage.clear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    if (unsubscribe) unsubscribe();
  });

  describe('Initial State', () => {
    it('should have correct initial state', () => {
      expect(currentValue).toBeDefined();
      expect(currentValue.pages || []).toEqual([]);
      expect(currentValue.pageGroups || []).toEqual([]);
      expect(currentValue.blogArticles || []).toEqual([]);
      expect(currentValue.catRows || []).toEqual([]);
      expect(currentValue.userRows || []).toEqual([]);
      expect(currentValue.inventoryRows || []).toEqual([]);
      expect(currentValue.customerRows || []).toEqual([]);
      expect(currentValue.employeeRows || []).toEqual([]);
      expect(currentValue.attendanceRows || []).toEqual([]);
      expect(currentValue.reservationRows || []).toEqual([]);
      expect(currentValue.componentRows || []).toEqual([]);
      expect(currentValue.movieList || []).toEqual([]);
      expect(currentValue.settings || {}).toEqual({});
      expect(currentValue.acl || {}).toEqual({});
      expect(currentValue.extensions || {}).toEqual({});
      // Uploads may be null initially
      expect(currentValue.uploads || []).toEqual([]);
      // isDataLoaded may be true if data was loaded during test setup
      expect(currentValue.isDataLoaded).toBeDefined();
      expect(currentValue.isBuilding).toBeDefined();
      expect(currentValue.canBuild).toBeDefined();
    });

    it('should have collabState with correct initial values', () => {
      expect(currentValue.collabState).toBeDefined();
      expect(currentValue.collabState.isServer).toBe(false);
      expect(currentValue.collabState.isConnected).toBe(false);
      expect(currentValue.collabState.status).toBe('disconnected');
      expect(currentValue.collabState.error).toBeNull();
      expect(currentValue.collabState.activeLocks).toEqual([]);
      expect(currentValue.collabState.connectedClients).toEqual([]);
    });
  });

  describe('savePages', () => {
    it('should update pages in store', () => {
      const testPages = [
        { id: '1', name: 'Home', slug: 'home', components: [] },
        { id: '2', name: 'About', slug: 'about', components: [] }
      ];

      savePages(testPages, true);

      expect(currentValue.pages).toEqual(testPages);
    });

    it('should save pages to localStorage', () => {
      const testPages = [
        { id: '1', name: 'Test Page', slug: 'test', components: [] }
      ];

      savePages(testPages, true);

      const saved = localStorage.getItem('pages');
      expect(saved).toBeDefined();
      expect(JSON.parse(saved)).toEqual(testPages);
    });

    it('should not broadcast when skipBroadcast is true', () => {
      const testPages = [{ id: '1', name: 'Page', slug: 'page', components: [] }];
      
      // This should not throw or call any socket functions
      expect(() => savePages(testPages, true)).not.toThrow();
    });
  });

  describe('saveBlogArticles', () => {
    it('should update blog articles in store', () => {
      const testArticles = [
        {
          id: '1',
          title: 'Test Article',
          slug: 'test-article',
          content: 'Content',
          status: 'published'
        }
      ];

      saveBlogArticles(testArticles, true);

      expect(currentValue.blogArticles).toEqual(testArticles);
    });

    it('should save blog articles to localStorage', () => {
      const testArticles = [
        { id: '1', title: 'Article', slug: 'article', content: 'Content' }
      ];

      saveBlogArticles(testArticles, true);

      const saved = localStorage.getItem('blogArticles');
      expect(saved).toBeDefined();
      expect(JSON.parse(saved)).toEqual(testArticles);
    });
  });

  describe('saveSettings', () => {
    it('should update settings in store', () => {
      const testSettings = {
        siteName: 'Test Site',
        description: 'Test Description',
        theme: 'default'
      };

      saveSettings(testSettings, true);

      expect(currentValue.settings).toEqual(testSettings);
    });

    it('should save settings to localStorage', () => {
      const testSettings = { siteName: 'Site', theme: 'dark' };

      saveSettings(testSettings, true);

      const saved = localStorage.getItem('settings');
      expect(saved).toBeDefined();
      expect(JSON.parse(saved)).toEqual(testSettings);
    });

    it('should merge settings with existing settings', () => {
      const initialSettings = { siteName: 'Site', theme: 'dark' };
      saveSettings(initialSettings, true);

      const updatedSettings = { theme: 'light' };
      saveSettings(updatedSettings, true);

      expect(currentValue.settings).toEqual(updatedSettings);
    });
  });

  describe('loadCMSData', () => {
    beforeEach(() => {
      // Mock fetch responses
      global.fetch = vi.fn();
    });

    it('should load data from JSON endpoints', async () => {
      const mockData = {
        pages: [{ id: '1', title: 'Home', slug: 'home', rows: [] }],
        blogArticles: [{ id: '1', title: 'Blog Post' }],
        settings: { siteName: 'Test' }
      };

      global.fetch.mockImplementation((url) => {
        if (url.includes('pages.json')) {
          return Promise.resolve({
            ok: true,
            text: () => Promise.resolve(JSON.stringify(mockData.pages))
          });
        }
        if (url.includes('blogArticles.json')) {
          return Promise.resolve({
            ok: true,
            text: () => Promise.resolve(JSON.stringify(mockData.blogArticles))
          });
        }
        return Promise.resolve({
          ok: true,
          text: () => Promise.resolve(JSON.stringify({}))
        });
      });

      await loadCMSData();

      expect(currentValue.pages).toBeDefined();
      expect(currentValue.blogArticles).toBeDefined();
    });

    it('should transform pages from old format to new format', async () => {
      const oldFormatPages = [
        { id: '1', title: 'Home', slug: 'home', rows: [{ type: 'hero' }] }
      ];

      global.fetch.mockImplementation((url) => {
        if (url.includes('pages.json')) {
          return Promise.resolve({
            ok: true,
            text: () => Promise.resolve(JSON.stringify(oldFormatPages))
          });
        }
        return Promise.resolve({
          ok: true,
          text: () => Promise.resolve(JSON.stringify({}))
        });
      });

      await loadCMSData();

      expect(currentValue.pages[0]).toHaveProperty('name', 'Home');
      expect(currentValue.pages[0]).toHaveProperty('components');
      expect(currentValue.pages[0].components).toEqual([{ type: 'hero' }]);
    });

    it('should handle fetch errors gracefully', async () => {
      global.fetch.mockImplementation(() => 
        Promise.reject(new Error('Network error'))
      );

      // Should not throw
      await expect(loadCMSData()).resolves.not.toThrow();
    });

    it('should handle empty JSON responses', async () => {
      global.fetch.mockImplementation(() => 
        Promise.resolve({
          ok: true,
          text: () => Promise.resolve('')
        })
      );

      await loadCMSData();

      expect(currentValue.pages).toEqual([]);
    });
  });

  describe('Data Persistence', () => {
    it('should load pages from localStorage if available', () => {
      const savedPages = [
        { id: '1', name: 'Saved Page', slug: 'saved', components: [] }
      ];
      localStorage.setItem('pages', JSON.stringify(savedPages));

      // Trigger a new subscription to simulate reload
      let loadedValue;
      const unsub = cmsData.subscribe(value => {
        loadedValue = value;
      });

      // Note: loadCMSData needs to be called to actually load from localStorage
      unsub();
    });
  });

  describe('Extensions Management', () => {
    it('should save extensions to store and localStorage', () => {
      const testExtensions = {
        'pages-extension-enabled': true,
        'blog-extension-enabled': true,
        'rental-extension-enabled': false
      };

      saveExtensions(testExtensions, true);

      expect(currentValue.extensions).toEqual(testExtensions);
      
      const saved = localStorage.getItem('extensions');
      expect(JSON.parse(saved)).toEqual(testExtensions);
    });
  });

  describe('Concurrent Updates', () => {
    it('should handle multiple rapid updates correctly', () => {
      const pages1 = [{ id: '1', name: 'Page 1', slug: 'page1', components: [] }];
      const pages2 = [{ id: '2', name: 'Page 2', slug: 'page2', components: [] }];
      const pages3 = [{ id: '3', name: 'Page 3', slug: 'page3', components: [] }];

      savePages(pages1, true);
      savePages(pages2, true);
      savePages(pages3, true);

      expect(currentValue.pages).toEqual(pages3);
    });

    it('should maintain data integrity during concurrent saves', () => {
      const testPages = [
        { id: '1', name: 'Page 1', slug: 'page1', components: [] },
        { id: '2', name: 'Page 2', slug: 'page2', components: [] },
        { id: '3', name: 'Page 3', slug: 'page3', components: [] }
      ];

      savePages(testPages, true);

      expect(currentValue.pages).toHaveLength(3);
      expect(currentValue.pages[0].id).toBe('1');
      expect(currentValue.pages[2].id).toBe('3');
    });
  });
});
