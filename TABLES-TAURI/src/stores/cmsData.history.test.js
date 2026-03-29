import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import {
  cmsData,
  savePageWithHistory,
  saveBlogArticleWithHistory,
  savePageHistory,
  saveBlogHistory,
  rollbackPage,
  rollbackBlog,
  deleteHistoryEntry,
  clearHistory,
  exportHistory,
  importHistory
} from './cmsData.js';

describe('History System', () => {
  let unsubscribe;
  let currentValue;

  beforeEach(() => {
    unsubscribe = cmsData.subscribe(value => {
      currentValue = value;
    });
    localStorage.clear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    if (unsubscribe) unsubscribe();
  });

  describe('savePageHistory', () => {
    it('should create history entry for page', () => {
      const pageData = { id: 'page1', name: 'Test Page', slug: 'test' };
      savePageHistory('page1', 'create', pageData, 'Created test page');

      expect(currentValue.pageHistory).toBeDefined();
      expect(currentValue.pageHistory.length).toBe(1);
      expect(currentValue.pageHistory[0].pageId).toBe('page1');
      expect(currentValue.pageHistory[0].action).toBe('create');
      expect(currentValue.pageHistory[0].label).toBe('Created test page');
    });

    it('should add timestamp to history entry', () => {
      const before = Date.now();
      savePageHistory('page1', 'update', { id: 'page1' });
      const after = Date.now();

      const entry = currentValue.pageHistory[0];
      expect(entry.timestamp).toBeGreaterThanOrEqual(before);
      expect(entry.timestamp).toBeLessThanOrEqual(after);
    });

    it('should save history to localStorage', () => {
      savePageHistory('page1', 'create', { id: 'page1' });

      const saved = localStorage.getItem('pageHistory');
      expect(saved).toBeDefined();
      expect(JSON.parse(saved).length).toBe(1);
    });

    it('should limit history to 100 entries', () => {
      for (let i = 0; i < 105; i++) {
        savePageHistory(`page${i}`, 'create', { id: `page${i}` });
      }

      expect(currentValue.pageHistory.length).toBe(100);
    });

    it('should deep clone data', () => {
      const originalData = { id: 'page1', nested: { value: 'test' } };
      savePageHistory('page1', 'update', originalData);

      const entry = currentValue.pageHistory[0];
      expect(entry.data).toEqual(originalData);
      expect(entry.data).not.toBe(originalData);
      expect(entry.data.nested).not.toBe(originalData.nested);
    });
  });

  describe('saveBlogHistory', () => {
    it('should create history entry for blog article', () => {
      const articleData = { id: 'article1', title: 'Test Article' };
      saveBlogHistory('article1', 'create', articleData, 'Created article');

      expect(currentValue.blogHistory).toBeDefined();
      expect(currentValue.blogHistory.length).toBe(1);
      expect(currentValue.blogHistory[0].articleId).toBe('article1');
    });

    it('should save blog history to localStorage', () => {
      saveBlogHistory('article1', 'create', { id: 'article1' });

      const saved = localStorage.getItem('blogHistory');
      expect(saved).toBeDefined();
      expect(JSON.parse(saved).length).toBe(1);
    });
  });

  describe('rollbackPage', () => {
    it('should rollback page to previous version', () => {
      // First save a page
      const { savePages } = require('./cmsData.js');
      const initialPage = { id: 'page1', name: 'Initial', slug: 'initial' };
      savePages([initialPage]);

      // Create history entry
      const previousVersion = { id: 'page1', name: 'Previous', slug: 'previous' };
      savePageHistory('page1', 'update', previousVersion, 'Previous version');

      // Rollback
      const historyEntry = currentValue.pageHistory.find(h => h.action === 'update');
      const result = rollbackPage('page1', historyEntry);

      expect(result).toBe(true);
    });

    it('should create rollback history entry', () => {
      const { savePages } = require('./cmsData.js');
      savePages([{ id: 'page1', name: 'Current', slug: 'current' }]);

      const previousVersion = { id: 'page1', name: 'Previous', slug: 'previous' };
      savePageHistory('page1', 'update', previousVersion);

      const historyEntry = currentValue.pageHistory.find(h => h.action === 'update');
      rollbackPage('page1', historyEntry);

      const rollbackEntry = currentValue.pageHistory.find(h => h.action === 'rollback');
      expect(rollbackEntry).toBeDefined();
    });

    it('should return false for invalid history entry', () => {
      const result = rollbackPage('page1', null);
      expect(result).toBe(false);
    });

    it('should return false for history entry without data', () => {
      const result = rollbackPage('page1', { id: 'test', action: 'update' });
      expect(result).toBe(false);
    });
  });

  describe('rollbackBlog', () => {
    it('should rollback blog article to previous version', () => {
      const { saveBlogArticles } = require('./cmsData.js');
      const initialArticle = { id: 'article1', title: 'Initial' };
      saveBlogArticles([initialArticle]);

      const previousVersion = { id: 'article1', title: 'Previous' };
      saveBlogHistory('article1', 'update', previousVersion);

      const historyEntry = currentValue.blogHistory.find(h => h.action === 'update');
      const result = rollbackBlog('article1', historyEntry);

      expect(result).toBe(true);
    });

    it('should create rollback history entry for blog', () => {
      const { saveBlogArticles } = require('./cmsData.js');
      saveBlogArticles([{ id: 'article1', title: 'Current' }]);

      const previousVersion = { id: 'article1', title: 'Previous' };
      saveBlogHistory('article1', 'update', previousVersion);

      const historyEntry = currentValue.blogHistory.find(h => h.action === 'update');
      rollbackBlog('article1', historyEntry);

      const rollbackEntry = currentValue.blogHistory.find(h => h.action === 'rollback');
      expect(rollbackEntry).toBeDefined();
    });
  });

  describe('deleteHistoryEntry', () => {
    it('should delete page history entry', () => {
      savePageHistory('page1', 'create', { id: 'page1' });
      const entryId = currentValue.pageHistory[0].id;

      deleteHistoryEntry(entryId, 'page');

      expect(currentValue.pageHistory.length).toBe(0);
    });

    it('should delete blog history entry', () => {
      saveBlogHistory('article1', 'create', { id: 'article1' });
      const entryId = currentValue.blogHistory[0].id;

      deleteHistoryEntry(entryId, 'blog');

      expect(currentValue.blogHistory.length).toBe(0);
    });

    it('should save to localStorage after deletion', () => {
      savePageHistory('page1', 'create', { id: 'page1' });
      const entryId = currentValue.pageHistory[0].id;

      deleteHistoryEntry(entryId, 'page');

      const saved = localStorage.getItem('pageHistory');
      expect(JSON.parse(saved).length).toBe(0);
    });
  });

  describe('clearHistory', () => {
    it('should clear all page history', () => {
      savePageHistory('page1', 'create', { id: 'page1' });
      savePageHistory('page2', 'create', { id: 'page2' });

      clearHistory('page');

      expect(currentValue.pageHistory.length).toBe(0);
    });

    it('should clear all blog history', () => {
      saveBlogHistory('article1', 'create', { id: 'article1' });
      saveBlogHistory('article2', 'create', { id: 'article2' });

      clearHistory('blog');

      expect(currentValue.blogHistory.length).toBe(0);
    });

    it('should save empty array to localStorage', () => {
      savePageHistory('page1', 'create', { id: 'page1' });
      clearHistory('page');

      const saved = localStorage.getItem('pageHistory');
      expect(JSON.parse(saved)).toEqual([]);
    });
  });

  describe('exportHistory', () => {
    it('should export page history as JSON', () => {
      savePageHistory('page1', 'create', { id: 'page1' });

      // Mock document.createElement and click
      const mockLink = {
        href: '',
        download: '',
        click: vi.fn()
      };
      document.createElement = vi.fn(() => mockLink);
      URL.createObjectURL = vi.fn(() => 'blob:url');
      URL.revokeObjectURL = vi.fn();

      exportHistory('page');

      expect(document.createElement).toHaveBeenCalledWith('a');
      expect(mockLink.click).toHaveBeenCalled();
    });

    it('should export blog history as JSON', () => {
      saveBlogHistory('article1', 'create', { id: 'article1' });

      const mockLink = {
        href: '',
        download: '',
        click: vi.fn()
      };
      document.createElement = vi.fn(() => mockLink);
      URL.createObjectURL = vi.fn(() => 'blob:url');

      exportHistory('blog');

      expect(mockLink.download).toContain('blog-history');
    });
  });

  describe('importHistory', () => {
    it('should import page history from file', async () => {
      const mockFile = new Blob([JSON.stringify([
        { id: 'imported1', pageId: 'page1', action: 'create', data: {} }
      ])], { type: 'application/json' });

      const count = await importHistory('page', mockFile);
      expect(count).toBe(1);
      expect(currentValue.pageHistory.length).toBe(1);
    });

    it('should import blog history from file', async () => {
      const mockFile = new Blob([JSON.stringify([
        { id: 'imported1', articleId: 'article1', action: 'create', data: {} }
      ])], { type: 'application/json' });

      const count = await importHistory('blog', mockFile);
      expect(count).toBe(1);
      expect(currentValue.blogHistory.length).toBe(1);
    });

    it('should merge with existing history', async () => {
      savePageHistory('existing', 'create', { id: 'existing' });

      const mockFile = new Blob([JSON.stringify([
        { id: 'imported1', pageId: 'imported', action: 'create', data: {} }
      ])], { type: 'application/json' });

      await importHistory('page', mockFile);

      expect(currentValue.pageHistory.length).toBe(2);
    });

    it('should reject invalid JSON', async () => {
      const mockFile = new Blob(['invalid json'], { type: 'application/json' });

      await expect(importHistory('page', mockFile)).rejects.toThrow();
    });

    it('should reject non-array JSON', async () => {
      const mockFile = new Blob([JSON.stringify({ not: 'array' })], { type: 'application/json' });

      await expect(importHistory('page', mockFile)).rejects.toThrow();
    });
  });

  describe('savePageWithHistory', () => {
    it('should save page and create history entry', () => {
      const newPage = { id: 'page1', name: 'New Page', slug: 'new' };
      savePageWithHistory(newPage, 'create', 'Created new page');

      expect(currentValue.pages).toBeDefined();
      expect(currentValue.pageHistory).toBeDefined();
      expect(currentValue.pageHistory.length).toBeGreaterThan(0);
    });

    it('should update page and create history entry', () => {
      const { savePages } = require('./cmsData.js');
      const initialPage = { id: 'page1', name: 'Initial', slug: 'initial' };
      savePages([initialPage]);

      const updatedPage = { id: 'page1', name: 'Updated', slug: 'updated' };
      savePageWithHistory(updatedPage, 'update');

      const page = currentValue.pages.find(p => p.id === 'page1');
      expect(page).toBeDefined();
      expect(currentValue.pageHistory.length).toBeGreaterThan(0);
    });
  });

  describe('saveBlogArticleWithHistory', () => {
    it('should save article and create history entry', () => {
      const newArticle = { id: 'article1', title: 'New Article' };
      saveBlogArticleWithHistory(newArticle, 'create');

      expect(currentValue.blogArticles).toBeDefined();
      expect(currentValue.blogHistory).toBeDefined();
      expect(currentValue.blogHistory.length).toBeGreaterThan(0);
    });

    it('should update article and create history entry', () => {
      const { saveBlogArticles } = require('./cmsData.js');
      const initialArticle = { id: 'article1', title: 'Initial' };
      saveBlogArticles([initialArticle]);

      const updatedArticle = { id: 'article1', title: 'Updated' };
      saveBlogArticleWithHistory(updatedArticle, 'update');

      const article = currentValue.blogArticles.find(a => a.id === 'article1');
      expect(article).toBeDefined();
      expect(currentValue.blogHistory.length).toBeGreaterThan(0);
    });
  });

  describe('History Entry Structure', () => {
    it('should create entry with required fields', () => {
      savePageHistory('page1', 'create', { id: 'page1' }, 'Test label');

      const entry = currentValue.pageHistory[0];
      expect(entry.id).toBeDefined();
      expect(entry.pageId).toBe('page1');
      expect(entry.action).toBe('create');
      expect(entry.data).toBeDefined();
      expect(entry.label).toBe('Test label');
      expect(entry.timestamp).toBeDefined();
      expect(entry.date).toBeDefined();
    });

    it('should generate IDs for entries', () => {
      savePageHistory('page1', 'create', { id: 'page1' });
      savePageHistory('page2', 'create', { id: 'page2' });

      const id1 = currentValue.pageHistory[0].id;
      const id2 = currentValue.pageHistory[1].id;
      expect(id1).toBeDefined();
      expect(id2).toBeDefined();
      expect(id1).not.toBe(id2);
    });
  });

  describe('Auto-Save Integration', () => {
    it('should not throw when saving history', () => {
      expect(() => {
        savePageHistory('page1', 'create', { id: 'page1' });
      }).not.toThrow();
    });

    it('should save history even without auto-save', () => {
      savePageHistory('page1', 'create', { id: 'page1' });
      expect(currentValue.pageHistory.length).toBe(1);
    });
  });
});
