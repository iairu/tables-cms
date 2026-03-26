import { writable } from 'svelte/store';
import { invoke } from '@tauri-apps/api/core';
import { open, save } from '@tauri-apps/plugin-dialog';
import { cmsData } from './cmsData.js';

const isBrowser = typeof window !== 'undefined';

// Project state
export const currentProject = writable(null);
export const recentProjects = writable([]);
export const isProjectOpen = writable(false);

// Project file extension
const PROJECT_EXTENSION = '.json.cms';

// Get all CMS data for export
function getExportData() {
  return new Promise((resolve) => {
    let resolved = false;
    const unsubscribe = cmsData.subscribe(data => {
      if (!resolved) {
        resolved = true;
        resolve({
          pages: data.pages || [],
          pageGroups: data.pageGroups || [],
          blogArticles: data.blogArticles || [],
          catRows: data.catRows || [],
          userRows: data.userRows || [],
          inventoryRows: data.inventoryRows || [],
          customerRows: data.customerRows || [],
          employeeRows: data.employeeRows || [],
          attendanceRows: data.attendanceRows || [],
          reservationRows: data.reservationRows || [],
          componentRows: data.componentRows || [],
          movieList: data.movieList || [],
          settings: data.settings || {},
          acl: data.acl || {},
          extensions: data.extensions || {},
          uploads: data.uploads || []
        });
      }
    });
    // Don't unsubscribe immediately - let it resolve first
    setTimeout(() => {
      unsubscribe();
    }, 100);
  });
}

// Import CMS data from project file
function importData(data) {
  const { savePages, savePageGroups, saveBlogArticles, saveSettings, saveExtensions } = 
    require('./cmsData.js');
  
  if (data.pages) savePages(data.pages, true);
  if (data.pageGroups) savePageGroups(data.pageGroups, true);
  if (data.blogArticles) saveBlogArticles(data.blogArticles, true);
  if (data.settings) saveSettings(data.settings, true);
  if (data.extensions) saveExtensions(data.extensions, true);
}

// Open project dialog
export async function openProject() {
  if (!isBrowser) return null;

  try {
    const selected = await open({
      multiple: false,
      filters: [{
        name: 'TABLES Project',
        extensions: ['json', 'cms']
      }]
    });

    if (!selected) return null;

    // Read the project file to get the data
    const projectData = await invoke('open_project', { path: selected });
    
    // Set project state with path
    currentProject.set(selected);
    isProjectOpen.set(true);

    // Import data into CMS
    importData(projectData);

    return selected;
  } catch (error) {
    console.error('Failed to open project:', error);
    throw error;
  }
}

// Save project dialog
export async function saveProject() {
  if (!isBrowser) return null;

  try {
    console.log('Saving project...');
    const data = await getExportData();
    console.log('Got CMS data:', Object.keys(data).length, 'fields');

    // Get current project path
    let projectPath = null;
    try {
      const current = await invoke('get_current_project');
      console.log('Current project:', current);
      if (current) {
        projectPath = current;
      }
    } catch (e) {
      console.log('No current project, will show save dialog');
    }

    // If no current project, show save dialog
    if (!projectPath) {
      console.log('Opening save dialog...');
      projectPath = await save({
        title: 'Save Project',
        filters: [{
          name: 'TABLES Project',
          extensions: ['json', 'cms']
        }],
        defaultPath: `project${PROJECT_EXTENSION}`
      });
      console.log('Save dialog result:', projectPath);
    }

    if (!projectPath) {
      console.log('Save cancelled');
      return null;
    }

    // Ensure extension - handle cases where dialog adds .json automatically
    const normalizedPath = projectPath.toLowerCase();
    if (normalizedPath.endsWith('.json.cms')) {
      // Already has correct extension
      console.log('Path already has .json.cms extension');
    } else if (normalizedPath.endsWith('.json')) {
      // Has .json, add .cms
      console.log('Adding .cms to .json extension');
      projectPath = projectPath + '.cms';
    } else if (!normalizedPath.endsWith(PROJECT_EXTENSION)) {
      // No extension, add full .json.cms
      console.log('Adding full .json.cms extension');
      projectPath = projectPath + PROJECT_EXTENSION;
    }

    console.log('Saving to:', projectPath);
    const savedPath = await invoke('save_project', {
      path: projectPath,
      data
    });

    currentProject.set({ path: savedPath, name: projectPath.split('/').pop() });
    isProjectOpen.set(true);
    console.log('Project saved successfully!');

    return savedPath;
  } catch (error) {
    console.error('Failed to save project:', error);
    alert('Failed to save project: ' + error.message);
    throw error;
  }
}

// Close current project
export async function closeProject() {
  if (!isBrowser) return;
  
  try {
    await invoke('close_project');
    currentProject.set(null);
    isProjectOpen.set(false);
  } catch (error) {
    console.error('Failed to close project:', error);
    throw error;
  }
}

// Get recent projects
export async function loadRecentProjects() {
  if (!isBrowser) return [];
  
  try {
    const recent = await invoke('get_recent_projects');
    recentProjects.set(recent);
    return recent;
  } catch (error) {
    console.error('Failed to load recent projects:', error);
    return [];
  }
}

// Clear recent projects
export async function clearRecentProjects() {
  if (!isBrowser) return;
  
  try {
    await invoke('clear_recent_projects');
    recentProjects.set([]);
  } catch (error) {
    console.error('Failed to clear recent projects:', error);
  }
}

// Open recent project by path
export async function openRecentProject(path) {
  if (!isBrowser) return;
  
  try {
    const project = await invoke('open_project', { path });
    currentProject.set(project);
    isProjectOpen.set(true);
    importData(project.data);
    return project;
  } catch (error) {
    console.error('Failed to open recent project:', error);
    throw error;
  }
}

// Listen for menu events
if (isBrowser) {
  // Open project from menu
  window.__TAURI__?.event?.listen('menu-open-project', async () => {
    await openProject();
  });
  
  // Save project from menu
  window.__TAURI__?.event?.listen('menu-save-project', async () => {
    await saveProject();
  });
  
  // Close project from menu
  window.__TAURI__?.event?.listen('menu-close-project', async () => {
    await closeProject();
  });
  
  // Load recent projects on startup
  loadRecentProjects();
}
