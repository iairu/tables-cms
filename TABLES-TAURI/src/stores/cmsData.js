import { writable } from 'svelte/store';
import { io } from 'socket.io-client';
import { invoke } from '@tauri-apps/api/core';

const isBrowser = typeof window !== 'undefined';

// CMS Data Store
export const cmsData = writable({
  pages: [],
  pageGroups: [],
  blogArticles: [],
  catRows: [],
  userRows: [],
  inventoryRows: [],
  customerRows: [],
  employeeRows: [],
  attendanceRows: [],
  reservationRows: [],
  componentRows: [],
  movieList: [],
  settings: {},
  acl: {},
  extensions: {},
  uploads: [],
  isDataLoaded: false,
  isBuilding: false,
  lastSaved: null,
  canBuild: true,
  buildCooldownSeconds: 0,
  buildLogs: [],
  collabState: {
    isServer: false,
    isConnected: false,
    wasConnectedAsClient: false,
    status: 'disconnected',
    error: null,
    serverIP: '',
    serverPort: null,
    clientName: 'Anonymous',
    activeLocks: [],
    connectedClients: [],
    socketId: null,
    discoveredServers: [],
    availableInterfaces: [],
    recentConnections: []
  }
});

// Helper to load JSON from static files
async function loadJSON(path, defaultValue = null) {
  if (!isBrowser) return defaultValue;
  try {
    const response = await fetch(path);
    if (!response.ok) return defaultValue;
    const text = await response.text();
    // Handle empty or invalid JSON
    if (!text.trim()) return defaultValue;
    return JSON.parse(text);
  } catch (e) {
    console.warn('Failed to load JSON:', path, e);
    return defaultValue;
  }
}

// Helper to save to localStorage
function saveToStorage(key, data) {
  if (!isBrowser) return;
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.warn('Failed to save to localStorage:', key, e);
  }
}

// Helper to load from localStorage
function loadFromStorage(key, defaultValue = null) {
  if (!isBrowser) return defaultValue;
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : defaultValue;
  } catch (e) {
    console.warn('Failed to load from localStorage:', key, e);
    return defaultValue;
  }
}

// Load initial CMS data
export async function loadCMSData() {
  if (!isBrowser) return;

  const t = Date.now();

  try {
    const [
      pages, pageGroups, blogArticles,
      catRows, userRows, inventoryRows,
      customerRows, employeeRows, attendanceRows,
      reservationRows, componentRows, movieList,
      settings, acl, extensions
    ] = await Promise.all([
      loadJSON(`/cms/pages.json?t=${t}`, []),
      loadJSON(`/cms/pageGroups.json?t=${t}`, []),
      loadJSON(`/cms/blogArticles.json?t=${t}`, []),
      loadJSON(`/cms/catRows.json?t=${t}`, []),
      loadJSON(`/cms/userRows.json?t=${t}`, []),
      loadJSON(`/cms/inventoryRows.json?t=${t}`, []),
      loadJSON(`/cms/customerRows.json?t=${t}`, []),
      loadJSON(`/cms/employeeRows.json?t=${t}`, []),
      loadJSON(`/cms/attendanceRows.json?t=${t}`, []),
      loadJSON(`/cms/reservationRows.json?t=${t}`, []),
      loadJSON(`/cms/componentRows.json?t=${t}`, []),
      loadJSON(`/cms/movieList.json?t=${t}`, []),
      loadJSON(`/cms/settings.json?t=${t}`, {}),
      loadJSON(`/cms/acl.json?t=${t}`, {}),
      loadJSON(`/cms/extensions.json?t=${t}`, null)
    ]);

    console.log('Loaded CMS data:', {
      pagesCount: pages?.length,
      pageGroupsCount: pageGroups?.length,
      blogArticlesCount: blogArticles?.length
    });

    // Transform pages from old format (title, rows) to new format (name, components)
    const transformedPages = (pages || []).map(page => ({
      id: page.id || Date.now().toString(),
      name: page.title || page.name || 'Untitled',
      slug: page.slug || 'untitled',
      components: page.rows || page.components || [],
      createdAt: page.lastEdited || page.createdAt || Date.now(),
      updatedAt: page.lastEdited || page.updatedAt || Date.now()
    }));

    // Fallback extensions from localStorage
    const extData = extensions || loadFromStorage('extensions', {});
    
    cmsData.update(data => ({
      ...data,
      pages: transformedPages || [],
      pageGroups: pageGroups || [],
      blogArticles: blogArticles || [],
      catRows: catRows || [],
      userRows: userRows || [],
      inventoryRows: inventoryRows || [],
      customerRows: customerRows || [],
      employeeRows: employeeRows || [],
      attendanceRows: attendanceRows || [],
      reservationRows: reservationRows || [],
      componentRows: componentRows || [],
      movieList: movieList || [],
      settings: settings || {},
      acl: acl || {},
      extensions: extData || {},
      isDataLoaded: true
    }));
    
    // Load uploads from Tauri backend
    await loadUploads();
    
  } catch (e) {
    console.error('Error loading CMS data:', e);
  }
}

// Save functions for each data type
export function savePages(pages, skipBroadcast = false) {
  cmsData.update(data => ({ ...data, pages }));
  saveToStorage('pages', pages);
  if (!skipBroadcast && data.collabState.isConnected) {
    broadcastDataUpdate('pages', pages);
  }
  scheduleBuild();
}

export function savePageGroups(pageGroups, skipBroadcast = false) {
  cmsData.update(data => ({ ...data, pageGroups }));
  saveToStorage('pageGroups', pageGroups);
  if (!skipBroadcast && data.collabState.isConnected) {
    broadcastDataUpdate('pageGroups', pageGroups);
  }
  scheduleBuild();
}

export function saveBlogArticles(articles, skipBroadcast = false) {
  cmsData.update(data => {
    if (!skipBroadcast && data.collabState?.isConnected) {
      broadcastDataUpdate('blogArticles', articles);
    }
    return { ...data, blogArticles: articles };
  });
  saveToStorage('blogArticles', articles);
  scheduleBuild();
}

export function saveSettings(settings, skipBroadcast = false) {
  cmsData.update(data => {
    if (!skipBroadcast && data.collabState?.isConnected) {
      broadcastDataUpdate('settings', settings);
    }
    return { ...data, settings };
  });
  saveToStorage('settings', settings);
}

export function saveExtensions(extensions, skipBroadcast = false) {
  cmsData.update(data => {
    if (!skipBroadcast && data.collabState?.isConnected) {
      broadcastDataUpdate('extensions', extensions);
    }
    return { ...data, extensions };
  });
  saveToStorage('extensions', extensions);
}

export function saveCatRows(rows, skipBroadcast = false) {
  cmsData.update(data => ({ ...data, catRows: rows }));
  saveToStorage('catRows', rows);
  if (!skipBroadcast && data.collabState.isConnected) {
    broadcastDataUpdate('catRows', rows);
  }
  scheduleBuild();
}

export function saveUserRows(rows, skipBroadcast = false) {
  cmsData.update(data => ({ ...data, userRows: rows }));
  saveToStorage('userRows', rows);
  if (!skipBroadcast && data.collabState.isConnected) {
    broadcastDataUpdate('userRows', rows);
  }
  scheduleBuild();
}

export function saveInventoryRows(rows, skipBroadcast = false) {
  cmsData.update(data => ({ ...data, inventoryRows: rows }));
  saveToStorage('inventoryRows', rows);
  if (!skipBroadcast && data.collabState.isConnected) {
    broadcastDataUpdate('inventoryRows', rows);
  }
  scheduleBuild();
}

export function saveCustomerRows(rows, skipBroadcast = false) {
  cmsData.update(data => ({ ...data, customerRows: rows }));
  saveToStorage('customerRows', rows);
  if (!skipBroadcast && data.collabState.isConnected) {
    broadcastDataUpdate('customerRows', rows);
  }
  scheduleBuild();
}

export function saveEmployeeRows(rows, skipBroadcast = false) {
  cmsData.update(data => ({ ...data, employeeRows: rows }));
  saveToStorage('employeeRows', rows);
  if (!skipBroadcast && data.collabState.isConnected) {
    broadcastDataUpdate('employeeRows', rows);
  }
  scheduleBuild();
}

export function saveAttendanceRows(rows, skipBroadcast = false) {
  cmsData.update(data => ({ ...data, attendanceRows: rows }));
  saveToStorage('attendanceRows', rows);
  if (!skipBroadcast && data.collabState.isConnected) {
    broadcastDataUpdate('attendanceRows', rows);
  }
  scheduleBuild();
}

export function saveReservationRows(rows, skipBroadcast = false) {
  cmsData.update(data => ({ ...data, reservationRows: rows }));
  saveToStorage('reservationRows', rows);
  if (!skipBroadcast && data.collabState.isConnected) {
    broadcastDataUpdate('reservationRows', rows);
  }
  scheduleBuild();
}

export function saveComponentRows(rows, skipBroadcast = false) {
  cmsData.update(data => ({ ...data, componentRows: rows }));
  saveToStorage('componentRows', rows);
  if (!skipBroadcast && data.collabState.isConnected) {
    broadcastDataUpdate('componentRows', rows);
  }
  scheduleBuild();
}

export function saveMovieList(list, skipBroadcast = false) {
  cmsData.update(data => ({ ...data, movieList: list }));
  saveToStorage('movieList', list);
  if (!skipBroadcast && data.collabState.isConnected) {
    broadcastDataUpdate('movieList', list);
  }
}

// Build scheduling
let buildTimeout = null;
function scheduleBuild() {
  if (buildTimeout) clearTimeout(buildTimeout);
  buildTimeout = setTimeout(() => {
    triggerBuild();
  }, 3000);
}

// Build trigger
export async function triggerBuild(localOnly = false) {
  cmsData.update(data => ({ ...data, isBuilding: true, canBuild: false }));
  
  // In Tauri, we'll trigger build through backend
  // For now, just simulate
  console.log('Build triggered', localOnly ? '(local only)' : '');
  
  // Simulate build completion
  setTimeout(() => {
    cmsData.update(data => ({
      ...data,
      isBuilding: false,
      canBuild: true,
      lastSaved: Date.now()
    }));
  }, 2000);
}

// Collaboration
let socket = null;
let discoveredServers = [];

export async function startCollaborationServer(bindIP = null) {
  // This would start a Socket.io server in the Tauri backend
  // For now, we'll implement client-side only
  console.log('Start collaboration server', bindIP);
  
  cmsData.update(data => ({
    ...data,
    collabState: {
      ...data.collabState,
      isServer: true,
      serverIP: bindIP || '127.0.0.1',
      status: 'connected'
    }
  }));
}

export async function connectToCollaborationServer(url, name, isHost = false) {
  if (socket) {
    socket.disconnect();
  }
  
  socket = io(url, {
    reconnectionAttempts: 5,
    timeout: 10000,
    autoConnect: true
  });
  
  cmsData.update(data => ({
    ...data,
    collabState: {
      ...data.collabState,
      status: 'connecting',
      error: null
    }
  }));
  
  socket.on('connect', () => {
    console.log('Connected to collaboration server');
    
    if (!isHost) {
      saveConnectionProfile(url, name);
    }
    
    cmsData.update(data => ({
      ...data,
      collabState: {
        ...data.collabState,
        isConnected: true,
        status: 'connected',
        error: null,
        clientName: name,
        socketId: socket.id,
        wasConnectedAsClient: !isHost
      }
    }));
    
    socket.emit('register-client', { name, isHost });
  });
  
  socket.on('disconnect', (reason) => {
    console.log('Disconnected:', reason);
    cmsData.update(data => ({
      ...data,
      collabState: {
        ...data.collabState,
        isConnected: false,
        status: 'disconnected',
        socketId: null
      }
    }));
  });
  
  socket.on('connect_error', (err) => {
    console.error('Connection error:', err);
    cmsData.update(data => ({
      ...data,
      collabState: {
        ...data.collabState,
        isConnected: false,
        status: 'error',
        error: `Connection failed: ${err.message}`
      }
    }));
  });
  
  // Handle other socket events...
}

export function disconnectCollaboration() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
  
  cmsData.update(data => ({
    ...data,
    collabState: {
      ...data.collabState,
      isConnected: false,
      status: 'disconnected',
      isServer: false
    }
  }));
}

function broadcastDataUpdate(type, data) {
  if (socket && socket.connected) {
    socket.emit('data-update', { type, data });
  }
}

// Connection profiles
function saveConnectionProfile(url, name) {
  try {
    const urlObj = new URL(url);
    let profiles = loadFromStorage('recentConnections', []);
    const existingIndex = profiles.findIndex(p => p.ip === urlObj.hostname && p.port === urlObj.port);

    const profile = {
      ip: urlObj.hostname,
      port: urlObj.port || '80',
      name,
      lastConnected: new Date().toISOString(),
      isFavorite: false
    };

    if (existingIndex >= 0) {
      profiles[existingIndex] = { ...profiles[existingIndex], name, lastConnected: profile.lastConnected };
    } else {
      profiles.unshift(profile);
    }

    profiles.sort((a, b) => {
      if (a.isFavorite && !b.isFavorite) return -1;
      if (!a.isFavorite && b.isFavorite) return 1;
      return new Date(b.lastConnected) - new Date(a.lastConnected);
    });

    if (profiles.length > 20) profiles = profiles.slice(0, 20);

    saveToStorage('recentConnections', profiles);

    cmsData.update(data => ({
      ...data,
      collabState: {
        ...data.collabState,
        recentConnections: profiles
      }
    }));
  } catch (e) {
    console.error('Error saving connection profile:', e);
  }
}

// Uploads
export async function loadUploads() {
  if (!isBrowser) return;
  try {
    const uploads = await invoke('get_uploads');
    cmsData.update(data => ({ ...data, uploads }));
  } catch (e) {
    console.warn('Failed to load uploads:', e);
  }
}

export async function uploadFile(file) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const result = await invoke('upload_file', {
          request: {
            name: file.name,
            type: file.type,
            data: e.target.result
          }
        });
        
        if (socket && socket.connected) {
          socket.emit('upload-event', { type: 'new-file', filename: file.name });
        }
        
        await loadUploads();
        resolve({ url: result.url });
      } catch (err) {
        console.error('Upload error:', err);
        resolve({ url: '' });
      }
    };
    reader.onerror = () => resolve({ url: '' });
    reader.readAsDataURL(file);
  });
}

export async function deleteUpload(id) {
  try {
    await invoke('delete_upload', { id });
    await loadUploads();
  } catch (e) {
    console.error('Delete upload error:', e);
  }
}

// Initialize on load
if (isBrowser) {
  loadCMSData();
  
  // Load recent connections
  const recentConnections = loadFromStorage('recentConnections', []);
  cmsData.update(data => ({
    ...data,
    collabState: {
      ...data.collabState,
      recentConnections
    }
  }));
}
