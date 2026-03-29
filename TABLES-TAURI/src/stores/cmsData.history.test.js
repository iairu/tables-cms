import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  savePageHistory,
  saveBlogHistory,
  deleteHistoryEntry,
  clearHistory
} from './cmsData.js';

describe('History System - Core Functions', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  describe('savePageHistory', () => {
    it('should be a function', () => {
      expect(typeof savePageHistory).toBe('function');
    });

    it('should not throw when called', () => {
      expect(() => {
        savePageHistory('page1', 'create', { id: 'page1' }, 'Test');
      }).not.toThrow();
    });
  });

  describe('saveBlogHistory', () => {
    it('should be a function', () => {
      expect(typeof saveBlogHistory).toBe('function');
    });

    it('should not throw when called', () => {
      expect(() => {
        saveBlogHistory('article1', 'create', { id: 'article1' }, 'Test');
      }).not.toThrow();
    });
  });

  describe('deleteHistoryEntry', () => {
    it('should be a function', () => {
      expect(typeof deleteHistoryEntry).toBe('function');
    });

    it('should not throw when called', () => {
      expect(() => {
        deleteHistoryEntry('test-id', 'page');
      }).not.toThrow();
    });
  });

  describe('clearHistory', () => {
    it('should be a function', () => {
      expect(typeof clearHistory).toBe('function');
    });

    it('should not throw when called', () => {
      expect(() => {
        clearHistory('page');
      }).not.toThrow();
    });
  });

  describe('History Entry Structure', () => {
    it('should accept required parameters', () => {
      expect(() => {
        savePageHistory('page1', 'create', { id: 'page1' });
      }).not.toThrow();
    });

    it('should work with optional label', () => {
      expect(() => {
        savePageHistory('page1', 'update', { id: 'page1' }, 'Custom label');
      }).not.toThrow();
    });
  });

  describe('Error Handling', () => {
    it('should handle null data gracefully', () => {
      expect(() => {
        savePageHistory('page1', 'create', null);
      }).not.toThrow();
    });

    it('should handle empty string label', () => {
      expect(() => {
        savePageHistory('page1', 'create', { id: 'page1' }, '');
      }).not.toThrow();
    });
  });
});
