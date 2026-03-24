import { writable } from 'svelte/store';

const isBrowser = typeof window !== 'undefined';

// Loading state
export const isLoading = writable(false);

// Helper to show/hide loading
export const showLoading = () => {
  if (isBrowser) {
    isLoading.set(true);
    window.dispatchEvent(new CustomEvent('show-loading'));
  }
};

export const hideLoading = () => {
  if (isBrowser) {
    isLoading.set(false);
    window.dispatchEvent(new CustomEvent('hide-loading'));
  }
};
