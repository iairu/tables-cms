import { describe, it, expect, beforeEach, vi } from 'vitest';

// Import the actual functions to test they exist
import * as cmsDataModule from './cmsData.js';

describe('History System - Core Functions', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  describe('savePageHistory', () => {
    it('should be a function', () => {
      expect(typeof cmsDataModule.savePageHistory).toBe('function');
    });

    it('should not throw when called', () => {
      expect(() => {
        cmsDataModule.savePageHistory('page1', 'create', { id: 'page1' }, 'Test');
      }).not.toThrow();
    });
  });

  describe('saveBlogHistory', () => {
    it('should be a function', () => {
      expect(typeof cmsDataModule.saveBlogHistory).toBe('function');
    });

    it('should not throw when called', () => {
      expect(() => {
        cmsDataModule.saveBlogHistory('article1', 'create', { id: 'article1' }, 'Test');
      }).not.toThrow();
    });
  });

  describe('deleteHistoryEntry', () => {
    it('should be a function', () => {
      expect(typeof cmsDataModule.deleteHistoryEntry).toBe('function');
    });

    it('should not throw when called', () => {
      expect(() => {
        cmsDataModule.deleteHistoryEntry('test-id', 'page');
      }).not.toThrow();
    });
  });

  describe('clearHistory', () => {
    it('should be a function', () => {
      expect(typeof cmsDataModule.clearHistory).toBe('function');
    });

    it('should not throw when called', () => {
      expect(() => {
        cmsDataModule.clearHistory('page');
      }).not.toThrow();
    });
  });

  describe('History Entry Structure', () => {
    it('should accept required parameters', () => {
      expect(() => {
        cmsDataModule.savePageHistory('page1', 'create', { id: 'page1' });
      }).not.toThrow();
    });

    it('should work with optional label', () => {
      expect(() => {
        cmsDataModule.savePageHistory('page1', 'update', { id: 'page1' }, 'Custom label');
      }).not.toThrow();
    });
  });

  describe('Error Handling', () => {
    it('should handle null data gracefully', () => {
      expect(() => {
        cmsDataModule.savePageHistory('page1', 'create', null);
      }).not.toThrow();
    });

    it('should handle empty string label', () => {
      expect(() => {
        cmsDataModule.savePageHistory('page1', 'create', { id: 'page1' }, '');
      }).not.toThrow();
    });
  });
});
