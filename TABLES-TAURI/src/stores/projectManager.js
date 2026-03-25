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
    const unsubscribe = cmsData.subscribe(data => {
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
    });
    unsubscribe();
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
  if (!isBrowser) return;
  
  try {
    const selected = await open({
      multiple: false,
      filters: [{
        name: 'TABLES Project',
        extensions: ['json', 'cms']
      }]
    });
    
    if (!selected) return null;
    
    const project = await invoke('open_project', { path: selected });
    currentProject.set(project);
    isProjectOpen.set(true);
    
    // Import data into CMS
    importData(project.data);
    
    return project;
  } catch (error) {
    console.error('Failed to open project:', error);
    throw error;
  }
}

// Save project dialog
export async function saveProject() {
  if (!isBrowser) return;
  
  try {
    const data = await getExportData();
    
    // Get current project path or ask for new one
    let projectPath = null;
    const current = await invoke('get_current_project');
    
    if (current) {
      projectPath = current;
    } else {
      projectPath = await save({
        filters: [{
          name: 'TABLES Project',
          extensions: ['json', 'cms']
        }],
        defaultPath: `project${PROJECT_EXTENSION}`
      });
    }
    
    if (!projectPath) return null;
    
    // Ensure extension
    if (!projectPath.endsWith(PROJECT_EXTENSION)) {
      projectPath = projectPath + PROJECT_EXTENSION;
    }
    
    const savedPath = await invoke('save_project', { 
      path: projectPath, 
      data 
    });
    
    currentProject.set({ path: savedPath, name: projectPath.split('/').pop() });
    isProjectOpen.set(true);
    
    return savedPath;
  } catch (error) {
    console.error('Failed to save project:', error);
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
