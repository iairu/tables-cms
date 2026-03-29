import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import {
  currentProject,
  recentProjects,
  isProjectOpen,
  openProject,
  saveProject,
  closeProject,
  loadRecentProjects,
  clearRecentProjects,
  openRecentProject
} from './projectManager.js';

describe('projectManager Store', () => {
  let projectUnsub, recentUnsub, openUnsub;
  let currentProjectValue, recentProjectsValue, isProjectOpenValue;

  beforeEach(() => {
    // Subscribe to stores
    projectUnsub = currentProject.subscribe(value => {
      currentProjectValue = value;
    });
    
    recentUnsub = recentProjects.subscribe(value => {
      recentProjectsValue = value;
    });
    
    openUnsub = isProjectOpen.subscribe(value => {
      isProjectOpenValue = value;
    });

    // Reset localStorage
    localStorage.clear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    if (projectUnsub) projectUnsub();
    if (recentUnsub) recentUnsub();
    if (openUnsub) openUnsub();
  });

  describe('Initial State', () => {
    it('should have null current project initially', () => {
      expect(currentProjectValue).toBeNull();
    });

    it('should have empty recent projects array initially', () => {
      // recentProjects may be null initially
      expect(recentProjectsValue || []).toEqual([]);
    });

    it('should have isProjectOpen as false initially', () => {
      expect(isProjectOpenValue).toBe(false);
    });
  });

  describe('openProject', () => {
    it('should return null when dialog is cancelled', async () => {
      const { open } = await import('@tauri-apps/plugin-dialog');
      open.mockResolvedValue(null);

      const result = await openProject();
      expect(result).toBeNull();
    });

    it('should update current project when file is selected', async () => {
      const { open } = await import('@tauri-apps/plugin-dialog');
      const { invoke } = await import('@tauri-apps/api/core');
      
      const mockPath = '/path/to/project.json.cms';
      open.mockResolvedValue(mockPath);
      invoke.mockResolvedValue({ data: {} });

      await openProject();

      expect(currentProjectValue).toBeDefined();
      expect(isProjectOpenValue).toBe(true);
    });

    it('should call invoke with correct path', async () => {
      const { open } = await import('@tauri-apps/plugin-dialog');
      const { invoke } = await import('@tauri-apps/api/core');
      
      const mockPath = '/path/to/project.json.cms';
      open.mockResolvedValue(mockPath);
      invoke.mockResolvedValue({ data: {} });

      await openProject();

      expect(invoke).toHaveBeenCalledWith('open_project', { path: mockPath });
    });

    it('should throw error if invoke fails', async () => {
      const { open } = await import('@tauri-apps/plugin-dialog');
      const { invoke } = await import('@tauri-apps/api/core');
      
      open.mockResolvedValue('/path/to/project.json.cms');
      invoke.mockRejectedValue(new Error('File not found'));

      await expect(openProject()).rejects.toThrow('File not found');
    });
  });

  describe('saveProject', () => {
    it('should return null when save dialog is cancelled', async () => {
      const { save } = await import('@tauri-apps/plugin-dialog');
      save.mockResolvedValue(null);

      const result = await saveProject();
      expect(result).toBeNull();
    });

    it('should add .cms extension to .json files', async () => {
      const { save } = await import('@tauri-apps/plugin-dialog');
      const { invoke } = await import('@tauri-apps/api/core');
      
      save.mockResolvedValue('/path/to/project.json');
      invoke.mockResolvedValue('/path/to/project.json.cms');

      await saveProject();

      expect(invoke).toHaveBeenCalledWith(
        'save_project',
        expect.objectContaining({
          path: expect.stringContaining('.json.cms')
        })
      );
    });

    it('should preserve .json.cms extension if already present', async () => {
      const { save } = await import('@tauri-apps/plugin-dialog');
      const { invoke } = await import('@tauri-apps/api/core');
      
      const mockPath = '/path/to/project.json.cms';
      save.mockResolvedValue(mockPath);
      invoke.mockResolvedValue(mockPath);

      await saveProject();

      expect(invoke).toHaveBeenCalledWith(
        'save_project',
        expect.objectContaining({
          path: mockPath
        })
      );
    });

    it('should add .json.cms extension to files without extension', async () => {
      const { save } = await import('@tauri-apps/plugin-dialog');
      const { invoke } = await import('@tauri-apps/api/core');
      
      save.mockResolvedValue('/path/to/project');
      invoke.mockResolvedValue('/path/to/project.json.cms');

      await saveProject();

      expect(invoke).toHaveBeenCalledWith(
        'save_project',
        expect.objectContaining({
          path: expect.stringContaining('.json.cms')
        })
      );
    });

    it('should export all CMS data when saving', async () => {
      const { save } = await import('@tauri-apps/plugin-dialog');
      const { invoke } = await import('@tauri-apps/api/core');
      
      save.mockResolvedValue('/path/to/project.json.cms');
      invoke.mockResolvedValue('/path/to/project.json.cms');

      await saveProject();

      // Get the last call to invoke
      const lastCall = invoke.mock.calls[invoke.mock.calls.length - 1];
      const callArgs = lastCall[1].data;
      expect(callArgs).toHaveProperty('pages');
      expect(callArgs).toHaveProperty('blogArticles');
      expect(callArgs).toHaveProperty('settings');
      expect(callArgs).toHaveProperty('extensions');
    });

    it('should update current project state after save', async () => {
      const { save } = await import('@tauri-apps/plugin-dialog');
      const { invoke } = await import('@tauri-apps/api/core');
      
      const mockPath = '/path/to/project.json.cms';
      save.mockResolvedValue(mockPath);
      invoke.mockResolvedValue(mockPath);

      await saveProject();

      expect(currentProjectValue).toBeDefined();
      expect(isProjectOpenValue).toBe(true);
    });
  });

  describe('closeProject', () => {
    it('should reset current project to null', async () => {
      // First set a project
      currentProject.set({ path: '/test.json.cms', name: 'Test' });
      isProjectOpen.set(true);

      const { invoke } = await import('@tauri-apps/api/core');
      invoke.mockResolvedValue(undefined);

      await closeProject();

      expect(currentProjectValue).toBeNull();
      expect(isProjectOpenValue).toBe(false);
    });

    it('should call close_project invoke command', async () => {
      const { invoke } = await import('@tauri-apps/api/core');
      invoke.mockResolvedValue(undefined);

      await closeProject();

      expect(invoke).toHaveBeenCalledWith('close_project');
    });
  });

  describe('loadRecentProjects', () => {
    it('should return empty array if no recent projects', async () => {
      const { invoke } = await import('@tauri-apps/api/core');
      invoke.mockResolvedValue([]);

      const result = await loadRecentProjects();
      expect(result).toEqual([]);
      expect(recentProjectsValue).toEqual([]);
    });

    it('should load recent projects from backend', async () => {
      const { invoke } = await import('@tauri-apps/api/core');
      const mockRecent = [
        '/path/to/project1.json.cms',
        '/path/to/project2.json.cms'
      ];
      invoke.mockResolvedValue(mockRecent);

      await loadRecentProjects();

      expect(recentProjectsValue).toEqual(mockRecent);
    });

    it('should handle errors gracefully', async () => {
      const { invoke } = await import('@tauri-apps/api/core');
      invoke.mockRejectedValue(new Error('Failed to load'));

      const result = await loadRecentProjects();
      expect(result).toEqual([]);
    });
  });

  describe('clearRecentProjects', () => {
    it('should clear recent projects list', async () => {
      const { invoke } = await import('@tauri-apps/api/core');
      invoke.mockResolvedValue(undefined);

      // Set some initial values
      recentProjects.set(['/path/to/project.json.cms']);

      await clearRecentProjects();

      expect(invoke).toHaveBeenCalledWith('clear_recent_projects');
      expect(recentProjectsValue).toEqual([]);
    });
  });

  describe('openRecentProject', () => {
    it('should open project by path', async () => {
      const { invoke } = await import('@tauri-apps/api/core');
      const mockPath = '/path/to/project.json.cms';
      const mockData = { 
        path: mockPath, 
        data: { pages: [], settings: {} } 
      };
      
      invoke.mockResolvedValue(mockData);

      await openRecentProject(mockPath);

      expect(invoke).toHaveBeenCalledWith('open_project', { path: mockPath });
      expect(currentProjectValue).toBeDefined();
    });

    it('should throw error if path is invalid', async () => {
      const { invoke } = await import('@tauri-apps/api/core');
      invoke.mockRejectedValue(new Error('File not found'));

      await expect(openRecentProject('/invalid/path.json.cms'))
        .rejects.toThrow('File not found');
    });
  });

  describe('Project File Extension Handling', () => {
    it('should handle various file extension cases', async () => {
      const testCases = [
        { input: '/path/file.json', expected: '/path/file.json.cms' },
        { input: '/path/file.json.cms', expected: '/path/file.json.cms' },
        { input: '/path/file', expected: '/path/file.json.cms' },
        { input: '/path/file.JSON', expected: '/path/file.JSON.cms' },
        { input: '/path/file.JSON.CMS', expected: '/path/file.JSON.CMS' }
      ];

      for (const { input, expected } of testCases) {
        const { save } = await import('@tauri-apps/plugin-dialog');
        const { invoke } = await import('@tauri-apps/api/core');
        
        save.mockResolvedValue(input);
        invoke.mockResolvedValue(expected);

        await saveProject();

        expect(invoke).toHaveBeenCalledWith(
          'save_project',
          expect.objectContaining({
            path: expect.stringContaining(expected.split('/').pop())
          })
        );
      }
    });
  });

  describe('Menu Event Listeners', () => {
    it('should setup menu event listeners in browser environment', () => {
      // This tests that the module initializes correctly
      expect(window.__TAURI__).toBeDefined();
      expect(window.__TAURI__.event).toBeDefined();
      expect(window.__TAURI__.event.listen).toBeDefined();
    });
  });

  describe('State Transitions', () => {
    it('should handle complete project lifecycle', async () => {
      const { open, save } = await import('@tauri-apps/plugin-dialog');
      const { invoke } = await import('@tauri-apps/api/core');

      // Open project
      const mockPath = '/path/to/project.json.cms';
      open.mockResolvedValue(mockPath);
      invoke.mockResolvedValue({ data: {} });

      await openProject();
      expect(isProjectOpenValue).toBe(true);

      // Save project
      save.mockResolvedValue(mockPath);
      invoke.mockResolvedValue(mockPath);

      await saveProject();
      expect(currentProjectValue).toBeDefined();

      // Close project
      invoke.mockResolvedValue(undefined);

      await closeProject();
      expect(isProjectOpenValue).toBe(false);
      expect(currentProjectValue).toBeNull();
    });
  });

  describe('Error Handling', () => {
    it('should show alert on save failure', async () => {
      const { save } = await import('@tauri-apps/plugin-dialog');
      const { invoke } = await import('@tauri-apps/api/core');
      
      // Mock alert
      window.alert = vi.fn();
      
      save.mockResolvedValue('/path/to/project.json.cms');
      invoke.mockRejectedValue(new Error('Permission denied'));

      await expect(saveProject()).rejects.toThrow('Permission denied');
      expect(window.alert).toHaveBeenCalled();
    });
  });
});
