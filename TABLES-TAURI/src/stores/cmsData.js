import { writable } from 'svelte/store';
import { io } from 'socket.io-client';
import { invoke } from '@tauri-apps/api/core';
import { scheduleAutoSave } from './projectManager.js';

const isBrowser = typeof window !== 'undefined';

// CMS Data Store
export const cmsData = writable({
  pages: [],
  pageGroups: [],
  blogArticles: [],
  catRows: [],
  userRows: [],
  biometricRows: [],
  medicalRows: [],
  financialRows: [],
  legalRows: [],
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
  pageHistory: [], // History for pages
  blogHistory: [], // History for blog articles
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
      catRows, userRows, biometricRows, medicalRows, financialRows, legalRows,
      inventoryRows, customerRows, employeeRows, attendanceRows,
      reservationRows, componentRows, movieList,
      settings, acl, extensions
    ] = await Promise.all([
      loadJSON(`/cms/pages.json?t=${t}`, []),
      loadJSON(`/cms/pageGroups.json?t=${t}`, []),
      loadJSON(`/cms/blogArticles.json?t=${t}`, []),
      loadJSON(`/cms/catRows.json?t=${t}`, []),
      loadJSON(`/cms/userRows.json?t=${t}`, []),
      loadJSON(`/cms/biometricRows.json?t=${t}`, []),
      loadJSON(`/cms/medicalRows.json?t=${t}`, []),
      loadJSON(`/cms/financialRows.json?t=${t}`, []),
      loadJSON(`/cms/legalRows.json?t=${t}`, []),
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
      biometricRows: biometricRows || [],
      medicalRows: medicalRows || [],
      financialRows: financialRows || [],
      legalRows: legalRows || [],
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
  scheduleAutoSave(); // Trigger auto-save
}

export function savePageWithHistory(page, action = 'update', label = '') {
  const existingPage = cmsDataValue?.pages.find(p => p.id === page.id);
  
  if (existingPage && action === 'update') {
    // Save history before updating
    savePageHistory(page.id, action, existingPage, label);
  }
  
  const now = Date.now();
  let updatedPages;
  
  if (action === 'create') {
    const newPage = { ...page, id: now.toString(), createdAt: now, updatedAt: now };
    updatedPages = [...(cmsDataValue?.pages || []), newPage];
    savePageHistory(newPage.id, 'create', newPage, label || 'Created page');
  } else {
    updatedPages = (cmsDataValue?.pages || []).map(p =>
      p.id === page.id ? { ...page, updatedAt: now } : p
    );
  }
  
  savePages(updatedPages, skipBroadcast);
  return updatedPages;
}

export function savePageGroups(pageGroups, skipBroadcast = false) {
  cmsData.update(data => ({ ...data, pageGroups }));
  saveToStorage('pageGroups', pageGroups);
  if (!skipBroadcast && data.collabState.isConnected) {
    broadcastDataUpdate('pageGroups', pageGroups);
  }
  scheduleBuild();
  scheduleAutoSave(); // Trigger auto-save
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
  scheduleAutoSave(); // Trigger auto-save
}

export function saveBlogArticleWithHistory(article, action = 'update', label = '') {
  const existingArticle = cmsDataValue?.blogArticles.find(a => a.id === article.id);
  
  if (existingArticle && action === 'update') {
    // Save history before updating
    saveBlogHistory(article.id, action, existingArticle, label);
  }
  
  const now = Date.now();
  let updatedArticles;
  
  if (action === 'create') {
    const newArticle = { ...article, id: now.toString(), createdAt: now, updatedAt: now };
    updatedArticles = [...(cmsDataValue?.blogArticles || []), newArticle];
    saveBlogHistory(newArticle.id, 'create', newArticle, label || 'Created article');
  } else {
    updatedArticles = (cmsDataValue?.blogArticles || []).map(a =>
      a.id === article.id ? { ...article, updatedAt: now } : a
    );
  }
  
  saveBlogArticles(updatedArticles, skipBroadcast);
  return updatedArticles;
}

export function saveSettings(settings, skipBroadcast = false) {
  cmsData.update(data => {
    if (!skipBroadcast && data.collabState?.isConnected) {
      broadcastDataUpdate('settings', settings);
    }
    return { ...data, settings };
  });
  saveToStorage('settings', settings);
  scheduleAutoSave(); // Trigger auto-save
}

export function saveExtensions(extensions, skipBroadcast = false) {
  cmsData.update(data => {
    if (!skipBroadcast && data.collabState?.isConnected) {
      broadcastDataUpdate('extensions', extensions);
    }
    return { ...data, extensions };
  });
  saveToStorage('extensions', extensions);
  scheduleAutoSave(); // Trigger auto-save
}

export function saveCatRows(rows, skipBroadcast = false) {
  cmsData.update(data => {
    if (!skipBroadcast && data.collabState?.isConnected) {
      broadcastDataUpdate('catRows', rows);
    }
    return { ...data, catRows: rows };
  });
  saveToStorage('catRows', rows);
  scheduleBuild();
  scheduleAutoSave(); // Trigger auto-save
}

export function saveUserRows(rows, skipBroadcast = false) {
  cmsData.update(data => {
    if (!skipBroadcast && data.collabState?.isConnected) {
      broadcastDataUpdate('userRows', rows);
    }
    return { ...data, userRows: rows };
  });
  saveToStorage('userRows', rows);
  scheduleBuild();
  scheduleAutoSave(); // Trigger auto-save
}

export function saveBiometricRows(rows, skipBroadcast = false) {
  cmsData.update(data => {
    if (!skipBroadcast && data.collabState?.isConnected) {
      broadcastDataUpdate('biometricRows', rows);
    }
    return { ...data, biometricRows: rows };
  });
  saveToStorage('biometricRows', rows);
  scheduleBuild();
  scheduleAutoSave();
}

export function saveMedicalRows(rows, skipBroadcast = false) {
  cmsData.update(data => {
    if (!skipBroadcast && data.collabState?.isConnected) {
      broadcastDataUpdate('medicalRows', rows);
    }
    return { ...data, medicalRows: rows };
  });
  saveToStorage('medicalRows', rows);
  scheduleBuild();
  scheduleAutoSave();
}

export function saveFinancialRows(rows, skipBroadcast = false) {
  cmsData.update(data => {
    if (!skipBroadcast && data.collabState?.isConnected) {
      broadcastDataUpdate('financialRows', rows);
    }
    return { ...data, financialRows: rows };
  });
  saveToStorage('financialRows', rows);
  scheduleBuild();
  scheduleAutoSave();
}

export function saveLegalRows(rows, skipBroadcast = false) {
  cmsData.update(data => {
    if (!skipBroadcast && data.collabState?.isConnected) {
      broadcastDataUpdate('legalRows', rows);
    }
    return { ...data, legalRows: rows };
  });
  saveToStorage('legalRows', rows);
  scheduleBuild();
  scheduleAutoSave();
}

export function saveInventoryRows(rows, skipBroadcast = false) {
  cmsData.update(data => {
    if (!skipBroadcast && data.collabState?.isConnected) {
      broadcastDataUpdate('inventoryRows', rows);
    }
    return { ...data, inventoryRows: rows };
  });
  saveToStorage('inventoryRows', rows);
  scheduleBuild();
  scheduleAutoSave(); // Trigger auto-save
}

export function saveCustomerRows(rows, skipBroadcast = false) {
  cmsData.update(data => {
    if (!skipBroadcast && data.collabState?.isConnected) {
      broadcastDataUpdate('customerRows', rows);
    }
    return { ...data, customerRows: rows };
  });
  saveToStorage('customerRows', rows);
  scheduleBuild();
  scheduleAutoSave(); // Trigger auto-save
}

export function saveEmployeeRows(rows, skipBroadcast = false) {
  cmsData.update(data => {
    if (!skipBroadcast && data.collabState?.isConnected) {
      broadcastDataUpdate('employeeRows', rows);
    }
    return { ...data, employeeRows: rows };
  });
  saveToStorage('employeeRows', rows);
  scheduleBuild();
  scheduleAutoSave(); // Trigger auto-save
}

export function saveAttendanceRows(rows, skipBroadcast = false) {
  cmsData.update(data => {
    if (!skipBroadcast && data.collabState?.isConnected) {
      broadcastDataUpdate('attendanceRows', rows);
    }
    return { ...data, attendanceRows: rows };
  });
  saveToStorage('attendanceRows', rows);
  scheduleBuild();
  scheduleAutoSave(); // Trigger auto-save
}

export function saveReservationRows(rows, skipBroadcast = false) {
  cmsData.update(data => {
    if (!skipBroadcast && data.collabState?.isConnected) {
      broadcastDataUpdate('reservationRows', rows);
    }
    return { ...data, reservationRows: rows };
  });
  saveToStorage('reservationRows', rows);
  scheduleBuild();
  scheduleAutoSave(); // Trigger auto-save
}

export function saveComponentRows(rows, skipBroadcast = false) {
  cmsData.update(data => {
    if (!skipBroadcast && data.collabState?.isConnected) {
      broadcastDataUpdate('componentRows', rows);
    }
    return { ...data, componentRows: rows };
  });
  saveToStorage('componentRows', rows);
  scheduleBuild();
  scheduleAutoSave(); // Trigger auto-save
}

export function saveMovieList(list, skipBroadcast = false) {
  cmsData.update(data => {
    if (!skipBroadcast && data.collabState?.isConnected) {
      broadcastDataUpdate('movieList', list);
    }
    return { ...data, movieList: list };
  });
  saveToStorage('movieList', list);
  scheduleAutoSave(); // Trigger auto-save
}

// History Management Functions
export function savePageHistory(pageId, action, data, label = '') {
  const now = Date.now();
  const historyEntry = {
    id: `history_${now}_${Math.random().toString(36).substr(2, 9)}`,
    pageId,
    action, // 'create', 'update', 'delete', 'rollback'
    data: JSON.parse(JSON.stringify(data)), // Deep clone
    label,
    timestamp: now,
    date: new Date(now).toISOString()
  };

  cmsData.update(state => {
    const existingHistory = state.pageHistory || [];
    const updatedHistory = [historyEntry, ...existingHistory].slice(0, 100); // Keep last 100 entries
    // Save to storage using the updated state
    saveToStorage('pageHistory', updatedHistory);
    return { ...state, pageHistory: updatedHistory };
  });

  scheduleAutoSave();
}

export function saveBlogHistory(articleId, action, data, label = '') {
  const now = Date.now();
  const historyEntry = {
    id: `history_${now}_${Math.random().toString(36).substr(2, 9)}`,
    articleId,
    action, // 'create', 'update', 'delete', 'rollback'
    data: JSON.parse(JSON.stringify(data)), // Deep clone
    label,
    timestamp: now,
    date: new Date(now).toISOString()
  };

  cmsData.update(state => {
    const existingHistory = state.blogHistory || [];
    const updatedHistory = [historyEntry, ...existingHistory].slice(0, 100); // Keep last 100 entries
    // Save to storage using the updated state
    saveToStorage('blogHistory', updatedHistory);
    return { ...state, blogHistory: updatedHistory };
  });

  scheduleAutoSave();
}

export function rollbackPage(pageId, historyEntry) {
  if (!historyEntry || !historyEntry.data) return false;

  const now = Date.now();
  cmsData.update(state => {
    const updatedPages = state.pages.map(page =>
      page.id === pageId
        ? { ...historyEntry.data, updatedAt: now }
        : page
    );
    return { ...state, pages: updatedPages };
  });

  // Save rollback to history
  savePageHistory(pageId, 'rollback', cmsDataValue?.pages.find(p => p.id === pageId), `Rolled back to: ${historyEntry.label || historyEntry.date}`);

  return true;
}

export function rollbackBlog(articleId, historyEntry) {
  if (!historyEntry || !historyEntry.data) return false;

  const now = Date.now();
  cmsData.update(state => {
    const updatedArticles = state.blogArticles.map(article =>
      article.id === articleId
        ? { ...historyEntry.data, updatedAt: now }
        : article
    );
    return { ...state, blogArticles: updatedArticles };
  });

  // Save rollback to history
  saveBlogHistory(articleId, 'rollback', cmsDataValue?.blogArticles.find(a => a.id === articleId), `Rolled back to: ${historyEntry.label || historyEntry.date}`);

  return true;
}

export function deleteHistoryEntry(historyId, type) {
  cmsData.update(state => {
    if (type === 'page') {
      const updatedHistory = (state.pageHistory || []).filter(h => h.id !== historyId);
      saveToStorage('pageHistory', updatedHistory);
      return {
        ...state,
        pageHistory: updatedHistory
      };
    } else if (type === 'blog') {
      const updatedHistory = (state.blogHistory || []).filter(h => h.id !== historyId);
      saveToStorage('blogHistory', updatedHistory);
      return {
        ...state,
        blogHistory: updatedHistory
      };
    }
    return state;
  });
}

export function clearHistory(type) {
  cmsData.update(state => {
    if (type === 'page') {
      return { ...state, pageHistory: [] };
    } else if (type === 'blog') {
      return { ...state, blogHistory: [] };
    }
    return state;
  });

  if (type === 'page') {
    saveToStorage('pageHistory', []);
  } else if (type === 'blog') {
    saveToStorage('blogHistory', []);
  }
}

export function exportHistory(type) {
  const history = type === 'page' ? cmsDataValue?.pageHistory : cmsDataValue?.blogHistory;
  const dataStr = JSON.stringify(history || [], null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(dataBlob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${type}-history-${Date.now()}.json`;
  link.click();
  URL.revokeObjectURL(url);
}

export async function importHistory(type, file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const imported = JSON.parse(e.target.result);
        if (!Array.isArray(imported)) {
          reject(new Error('Invalid history file format'));
          return;
        }

        cmsData.update(state => {
          const existingHistory = type === 'page' ? state.pageHistory : state.blogHistory;
          const merged = [...imported, ...(existingHistory || [])];
          
          if (type === 'page') {
            return { ...state, pageHistory: merged };
          } else if (type === 'blog') {
            return { ...state, blogHistory: merged };
          }
          return state;
        });

        if (type === 'page') {
          saveToStorage('pageHistory', cmsDataValue?.pageHistory || []);
        } else if (type === 'blog') {
          saveToStorage('blogHistory', cmsDataValue?.blogHistory || []);
        }

        resolve(merged.length);
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
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
