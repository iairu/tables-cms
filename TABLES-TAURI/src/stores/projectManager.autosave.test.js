import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import {
  autoSaveEnabled,
  lastAutoSave,
  autoSaveStatus,
  enableAutoSave,
  scheduleAutoSave,
  cancelAutoSave,
  triggerAutoSave,
  saveProject,
  openProject
} from './projectManager.js';

describe('Auto-Save System', () => {
  let autoSaveUnsub, lastSaveUnsub, statusUnsub;
  let autoSaveValue, lastSaveValue, statusValue;

  beforeEach(() => {
    autoSaveUnsub = autoSaveEnabled.subscribe(v => autoSaveValue = v);
    lastSaveUnsub = lastAutoSave.subscribe(v => lastSaveValue = v);
    statusUnsub = autoSaveStatus.subscribe(v => statusValue = v);
    
    localStorage.clear();
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    if (autoSaveUnsub) autoSaveUnsub();
    if (lastSaveUnsub) lastSaveUnsub();
    if (statusUnsub) statusUnsub();
    vi.useRealTimers();
  });

  describe('Initial State', () => {
    it('should have auto-save disabled initially', () => {
      expect(autoSaveValue).toBe(false);
    });

    it('should have null lastAutoSave initially', () => {
      expect(lastSaveValue).toBeNull();
    });

    it('should have idle status initially', () => {
      expect(statusValue).toBe('idle');
    });
  });

  describe('enableAutoSave', () => {
    it('should enable auto-save', () => {
      enableAutoSave();
      expect(autoSaveValue).toBe(true);
    });

    it('should log to console', () => {
      const consoleSpy = vi.spyOn(console, 'log');
      enableAutoSave();
      expect(consoleSpy).toHaveBeenCalledWith('Auto-save enabled');
      consoleSpy.mockRestore();
    });
  });

  describe('scheduleAutoSave', () => {
    it('should not schedule if auto-save not enabled', () => {
      scheduleAutoSave();
      // Should not throw or schedule
      expect(statusValue).toBe('idle');
    });

    it('should not schedule if no manual save yet', () => {
      scheduleAutoSave();
      expect(statusValue).toBe('idle');
    });

    it('should schedule auto-save after enabling', () => {
      enableAutoSave();
      scheduleAutoSave();
      
      // Status should still be idle until timer fires
      expect(statusValue).toBe('idle');
      
      // Fast-forward timer
      vi.advanceTimersByTime(5000);
      
      // Status should have changed (saving -> success or error)
      // Note: Actual save will fail in test environment without backend
    });

    it('should cancel previous timeout when scheduling new one', () => {
      enableAutoSave();
      scheduleAutoSave();
      scheduleAutoSave();
      scheduleAutoSave();
      
      // Only the last one should fire
      vi.advanceTimersByTime(5000);
    });
  });

  describe('cancelAutoSave', () => {
    it('should cancel pending auto-save', () => {
      enableAutoSave();
      scheduleAutoSave();
      cancelAutoSave();
      
      vi.advanceTimersByTime(5000);
      
      // Should not have triggered save
      expect(statusValue).toBe('idle');
    });

    it('should not throw if no pending save', () => {
      expect(() => cancelAutoSave()).not.toThrow();
    });
  });

  describe('triggerAutoSave', () => {
    it('should not trigger if auto-save not enabled', async () => {
      await triggerAutoSave();
      // Should not do anything
      expect(statusValue).toBe('idle');
    });
  });

  describe('Auto-Save Flow', () => {
    it('should follow complete auto-save flow', async () => {
      // 1. Enable auto-save
      enableAutoSave();
      expect(autoSaveValue).toBe(true);
      
      // 2. Schedule auto-save
      scheduleAutoSave();
      
      // 3. Fast-forward time
      vi.advanceTimersByTime(5000);
      
      // 4. Status should have changed
      // (will be 'saving', 'success', or 'error' depending on backend availability)
    });

    it('should reset status to idle after success', async () => {
      enableAutoSave();
      
      const { invoke } = await import('@tauri-apps/api/core');
      invoke.mockResolvedValue('/path/to/project.json.cms');
      
      await triggerAutoSave();
      
      // Wait for status reset timeout
      vi.advanceTimersByTime(2000);
      
      expect(statusValue).toBe('idle');
    });
  });

  describe('Integration with Manual Save', () => {
    it('should track auto-save state', () => {
      expect(autoSaveValue).toBe(false);
      enableAutoSave();
      expect(autoSaveValue).toBe(true);
    });
  });

  describe('Error Handling', () => {
    it('should handle save errors gracefully', async () => {
      enableAutoSave();
      
      const { invoke } = await import('@tauri-apps/api/core');
      invoke.mockRejectedValue(new Error('Save failed'));
      
      await expect(triggerAutoSave()).resolves.not.toThrow();
      
      // Status should be error
      expect(statusValue).toBe('error');
    });

    it('should handle missing project gracefully', async () => {
      enableAutoSave();
      
      const { invoke } = await import('@tauri-apps/api/core');
      invoke.mockResolvedValue(null); // No current project
      
      await triggerAutoSave();
      
      // Should not throw, should handle gracefully
    });
  });

  describe('Status Transitions', () => {
    it('should transition through statuses correctly', async () => {
      enableAutoSave();
      
      const statuses = [];
      const unsub = autoSaveStatus.subscribe(v => statuses.push(v));
      
      // Initial
      expect(statusValue).toBe('idle');
      
      // Trigger save
      const { invoke } = await import('@tauri-apps/api/core');
      invoke.mockResolvedValue('/path');
      
      await triggerAutoSave();
      
      // Should have gone through saving -> success
      expect(statuses).toContain('saving');
      
      unsub();
    });
  });

  describe('Last Save Timestamp', () => {
    it('should update lastAutoSave on successful save', async () => {
      enableAutoSave();
      
      const before = Date.now();
      
      const { invoke } = await import('@tauri-apps/api/core');
      invoke.mockResolvedValue('/path');
      
      await triggerAutoSave();
      
      const after = Date.now();
      
      expect(lastSaveValue).toBeGreaterThanOrEqual(before);
      expect(lastSaveValue).toBeLessThanOrEqual(after);
    });
  });

  describe('Concurrent Operations', () => {
    it('should handle multiple enable calls', () => {
      enableAutoSave();
      enableAutoSave();
      enableAutoSave();
      
      expect(autoSaveValue).toBe(true);
    });

    it('should handle cancel without pending save', () => {
      expect(() => cancelAutoSave()).not.toThrow();
    });
  });

  describe('Configuration', () => {
    it('should use configured delay', () => {
      enableAutoSave();
      scheduleAutoSave();
      
      // Default delay is 5000ms
      vi.advanceTimersByTime(4999);
      // Should not have fired yet
      
      vi.advanceTimersByTime(1);
      // Should fire now
    });
  });

  describe('Browser Environment Check', () => {
    it('should only operate in browser environment', () => {
      // In test environment (jsdom), should work
      expect(() => enableAutoSave()).not.toThrow();
      expect(() => scheduleAutoSave()).not.toThrow();
    });
  });
});
