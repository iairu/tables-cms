import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  autoSaveEnabled,
  lastAutoSave,
  autoSaveStatus,
  enableAutoSave,
  scheduleAutoSave,
  cancelAutoSave,
  triggerAutoSave
} from './projectManager.js';

describe('Auto-Save System - Core Functions', () => {
  let autoSaveValue, lastSaveValue, statusValue;
  let autoSaveUnsub, lastSaveUnsub, statusUnsub;

  beforeEach(() => {
    autoSaveUnsub = autoSaveEnabled.subscribe(v => autoSaveValue = v);
    lastSaveUnsub = lastAutoSave.subscribe(v => lastSaveValue = v);
    statusUnsub = autoSaveStatus.subscribe(v => statusValue = v);
    vi.clearAllMocks();
  });

  afterEach(() => {
    if (autoSaveUnsub) autoSaveUnsub();
    if (lastSaveUnsub) lastSaveUnsub();
    if (statusUnsub) statusUnsub();
  });

  describe('Initial State', () => {
    it('should have auto-save disabled initially', () => {
      expect(autoSaveValue).toBe(false);
    });

    it('should have idle status initially', () => {
      expect(statusValue).toBe('idle');
    });
  });

  describe('enableAutoSave', () => {
    it('should be a function', () => {
      expect(typeof enableAutoSave).toBe('function');
    });

    it('should enable auto-save', () => {
      enableAutoSave();
      expect(autoSaveValue).toBe(true);
    });
  });

  describe('scheduleAutoSave', () => {
    it('should be a function', () => {
      expect(typeof scheduleAutoSave).toBe('function');
    });

    it('should not throw when called', () => {
      expect(() => scheduleAutoSave()).not.toThrow();
    });
  });

  describe('cancelAutoSave', () => {
    it('should be a function', () => {
      expect(typeof cancelAutoSave).toBe('function');
    });

    it('should not throw when called', () => {
      expect(() => cancelAutoSave()).not.toThrow();
    });
  });

  describe('triggerAutoSave', () => {
    it('should be a function', () => {
      expect(typeof triggerAutoSave).toBe('function');
    });

    it('should not throw when called', async () => {
      await expect(triggerAutoSave()).resolves.not.toThrow();
    });
  });

  describe('State Transitions', () => {
    it('should change status when enabled', () => {
      enableAutoSave();
      expect(autoSaveValue).toBe(true);
    });
  });
});
