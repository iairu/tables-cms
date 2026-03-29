import '@testing-library/jest-dom';
import { afterEach, vi } from 'vitest';

// Cleanup after each test
afterEach(() => {
  document.body.innerHTML = '';
});

// Mock Tauri APIs
vi.mock('@tauri-apps/api/core', () => ({
  invoke: vi.fn(() => Promise.resolve(null)),
}));

vi.mock('@tauri-apps/plugin-dialog', () => ({
  open: vi.fn(() => Promise.resolve(null)),
  save: vi.fn(() => Promise.resolve(null)),
}));

vi.mock('@tauri-apps/plugin-fs', () => ({
  readDir: vi.fn(() => Promise.resolve([])),
  readFile: vi.fn(() => Promise.resolve(new Uint8Array())),
  writeFile: vi.fn(() => Promise.resolve()),
  remove: vi.fn(() => Promise.resolve()),
}));

// Mock localStorage
const localStorageMock = {
  store: {},
  clear: function () {
    this.store = {};
  },
  getItem: function (key) {
    return this.store[key] || null;
  },
  setItem: function (key, value) {
    this.store[key] = value.toString();
  },
  removeItem: function (key) {
    delete this.store[key];
  },
};

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Mock window.location
Object.defineProperty(window, 'location', {
  value: {
    href: 'http://localhost:3000',
    pathname: '/cms/settings',
    pushState: vi.fn(),
    replaceState: vi.fn(),
    reload: vi.fn(),
  },
  writable: true,
});

// Mock History API
const historyMock = {
  pushState: vi.fn(),
  replaceState: vi.fn(),
  back: vi.fn(),
  forward: vi.fn(),
  go: vi.fn(),
};

Object.defineProperty(window, 'history', {
  value: historyMock,
  writable: true,
});

// Mock fetch
global.fetch = vi.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({}),
    text: () => Promise.resolve(''),
  })
);

// Mock Tauri event system
window.__TAURI__ = {
  event: {
    listen: vi.fn(),
    emit: vi.fn(),
  },
};
