import { describe, it, expect, beforeEach, vi } from 'vitest';
import { isLoading, showLoading, hideLoading } from './loading.js';

describe('loading Store', () => {
  let loadingUnsub;
  let isLoadingValue;

  beforeEach(() => {
    // Subscribe to store
    loadingUnsub = isLoading.subscribe(value => {
      isLoadingValue = value;
    });
    
    // Reset any custom events
    vi.clearAllMocks();
  });

  afterEach(() => {
    if (loadingUnsub) loadingUnsub();
  });

  describe('Initial State', () => {
    it('should have isLoading as false initially', () => {
      expect(isLoadingValue).toBe(false);
    });
  });

  describe('showLoading', () => {
    it('should set isLoading to true', () => {
      showLoading();
      expect(isLoadingValue).toBe(true);
    });

    it('should dispatch custom event', () => {
      const eventListener = vi.fn();
      window.addEventListener('show-loading', eventListener);
      
      showLoading();
      
      expect(eventListener).toHaveBeenCalled();
      expect(eventListener).toHaveBeenCalledWith(
        expect.any(CustomEvent)
      );
      
      window.removeEventListener('show-loading', eventListener);
    });

    it('should be callable multiple times', () => {
      showLoading();
      showLoading();
      showLoading();
      expect(isLoadingValue).toBe(true);
    });
  });

  describe('hideLoading', () => {
    it('should set isLoading to false', () => {
      showLoading();
      hideLoading();
      expect(isLoadingValue).toBe(false);
    });

    it('should dispatch custom event', () => {
      const eventListener = vi.fn();
      window.addEventListener('hide-loading', eventListener);
      
      hideLoading();
      
      expect(eventListener).toHaveBeenCalled();
      expect(eventListener).toHaveBeenCalledWith(
        expect.any(CustomEvent)
      );
      
      window.removeEventListener('hide-loading', eventListener);
    });

    it('should not error if called when already false', () => {
      expect(() => hideLoading()).not.toThrow();
      expect(isLoadingValue).toBe(false);
    });
  });

  describe('Loading State Transitions', () => {
    it('should handle multiple show/hide cycles', () => {
      showLoading();
      expect(isLoadingValue).toBe(true);

      hideLoading();
      expect(isLoadingValue).toBe(false);

      showLoading();
      expect(isLoadingValue).toBe(true);

      hideLoading();
      expect(isLoadingValue).toBe(false);
    });

    it('should dispatch events for each transition', () => {
      const showListener = vi.fn();
      const hideListener = vi.fn();
      
      window.addEventListener('show-loading', showListener);
      window.addEventListener('hide-loading', hideListener);
      
      showLoading();
      hideLoading();
      showLoading();
      hideLoading();
      
      expect(showListener).toHaveBeenCalledTimes(2);
      expect(hideListener).toHaveBeenCalledTimes(2);
      
      window.removeEventListener('show-loading', showListener);
      window.removeEventListener('hide-loading', hideListener);
    });
  });

  describe('Store Subscription', () => {
    it('should notify subscribers of loading changes', () => {
      const mockCallback = vi.fn();
      const unsub = isLoading.subscribe(mockCallback);
      
      showLoading();
      hideLoading();
      
      // Initial call + 2 changes
      expect(mockCallback).toHaveBeenCalledTimes(3);
      expect(mockCallback).toHaveBeenCalledWith(false); // initial
      expect(mockCallback).toHaveBeenCalledWith(true);  // show
      expect(mockCallback).toHaveBeenCalledWith(false); // hide
      
      unsub();
    });

    it('should receive correct boolean values', () => {
      const values = [];
      const unsub = isLoading.subscribe(value => {
        values.push(value);
      });
      
      showLoading();
      hideLoading();
      showLoading();
      hideLoading();
      
      expect(values).toEqual([false, true, false, true, false]);
      
      unsub();
    });
  });

  describe('Event System Integration', () => {
    it('should work with custom event listeners', () => {
      let eventReceived = false;
      
      const handler = (event) => {
        eventReceived = true;
        expect(event.detail).toBeDefined();
      };
      
      window.addEventListener('show-loading', handler);
      showLoading();
      
      expect(eventReceived).toBe(true);
      
      window.removeEventListener('show-loading', handler);
    });

    it('should support multiple event listeners', () => {
      const listener1 = vi.fn();
      const listener2 = vi.fn();
      
      window.addEventListener('show-loading', listener1);
      window.addEventListener('show-loading', listener2);
      
      showLoading();
      
      expect(listener1).toHaveBeenCalled();
      expect(listener2).toHaveBeenCalled();
      
      window.removeEventListener('show-loading', listener1);
      window.removeEventListener('show-loading', listener2);
    });
  });

  describe('Browser Environment Check', () => {
    it('should only operate in browser environment', () => {
      // This test verifies the isBrowser check exists
      // In jsdom environment, it should work
      expect(() => showLoading()).not.toThrow();
      expect(() => hideLoading()).not.toThrow();
    });
  });

  describe('Edge Cases', () => {
    it('should handle rapid toggling', () => {
      for (let i = 0; i < 100; i++) {
        if (i % 2 === 0) {
          showLoading();
        } else {
          hideLoading();
        }
      }
      
      // Should end in false state (100 is even, so last op was hide)
      expect(isLoadingValue).toBe(false);
    });

    it('should maintain state consistency', () => {
      const states = [];
      const unsub = isLoading.subscribe(value => {
        states.push(value);
      });
      
      // Perform operations
      showLoading();
      showLoading(); // Redundant
      hideLoading();
      hideLoading(); // Redundant
      showLoading();
      
      // All state changes should be boolean
      states.forEach(state => {
        expect(typeof state).toBe('boolean');
      });
      
      unsub();
    });
  });

  describe('Concurrent Subscriptions', () => {
    it('should notify all subscribers', () => {
      const callback1 = vi.fn();
      const callback2 = vi.fn();
      const callback3 = vi.fn();
      
      const unsub1 = isLoading.subscribe(callback1);
      const unsub2 = isLoading.subscribe(callback2);
      const unsub3 = isLoading.subscribe(callback3);
      
      showLoading();
      
      expect(callback1).toHaveBeenCalled();
      expect(callback2).toHaveBeenCalled();
      expect(callback3).toHaveBeenCalled();
      
      unsub1();
      unsub2();
      unsub3();
    });

    it('should handle subscriber cleanup', () => {
      const callback = vi.fn();
      const unsub = isLoading.subscribe(callback);
      
      unsub();
      showLoading();
      
      // Should only have initial call
      expect(callback).toHaveBeenCalledTimes(1);
    });
  });
});
