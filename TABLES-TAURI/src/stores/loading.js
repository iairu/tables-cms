import { writable } from 'svelte/store';

const isBrowser = typeof window !== 'undefined';

// Loading state
export const isLoading = writable(false);

// Helper to show/hide loading
export const showLoading = () => {
  if (isBrowser) {
    isLoading.set(true);
  }
};

export const hideLoading = () => {
  if (isBrowser) {
    isLoading.set(false);
  }
};
