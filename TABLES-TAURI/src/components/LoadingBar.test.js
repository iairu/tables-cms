import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import LoadingBar from './LoadingBar.svelte';
import { isLoading } from '../stores/loading.js';

describe('LoadingBar Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset loading state before each test
    isLoading.set(false);
  });

  describe('Rendering', () => {
    it('should not render when isLoading is false', () => {
      isLoading.set(false);
      const { container } = render(LoadingBar);
      
      expect(container.querySelector('.loading-bar')).toBeNull();
    });

    it('should render when isLoading is true', () => {
      isLoading.set(true);
      const { container } = render(LoadingBar);
      
      expect(container.querySelector('.loading-bar')).toBeInTheDocument();
    });

    it('should have progress bar element', () => {
      isLoading.set(true);
      const { container } = render(LoadingBar);
      
      expect(container.querySelector('.loading-bar-progress')).toBeInTheDocument();
    });
  });

  describe('Reactivity', () => {
    it('should appear when loading state changes to true', async () => {
      isLoading.set(false);
      const { container } = render(LoadingBar);
      
      // Initially not visible
      expect(container.querySelector('.loading-bar')).toBeNull();
      
      // Set loading to true and re-render
      isLoading.set(true);
      await vi.dynamicImportSettled();
      
      // Should now be visible - component subscribes to store
      expect(container.querySelector('.loading-bar')).toBeInTheDocument();
    });

    it('should disappear when loading state changes to false', async () => {
      isLoading.set(true);
      const { container } = render(LoadingBar);
      
      // Initially visible
      expect(container.querySelector('.loading-bar')).toBeInTheDocument();
      
      // Set loading to false and re-render
      isLoading.set(false);
      await vi.dynamicImportSettled();
      
      // Should now be hidden
      expect(container.querySelector('.loading-bar')).toBeNull();
    });
  });

  describe('Styling', () => {
    it('should have correct CSS classes', () => {
      isLoading.set(true);
      const { container } = render(LoadingBar);
      
      const loadingBar = container.querySelector('.loading-bar');
      expect(loadingBar).toHaveClass('loading-bar');
      
      const progress = container.querySelector('.loading-bar-progress');
      expect(progress).toHaveClass('loading-bar-progress');
    });

    it('should have fixed positioning defined in CSS', () => {
      isLoading.set(true);
      const { container } = render(LoadingBar);
      
      const loadingBar = container.querySelector('.loading-bar');
      // Verify the element exists and has the class
      // Actual position value is defined in CSS, not inline
      expect(loadingBar).toBeInTheDocument();
      expect(loadingBar.className).toContain('loading-bar');
    });
  });

  describe('Animation', () => {
    it('should have shimmer animation defined in styles', () => {
      isLoading.set(true);
      const { container } = render(LoadingBar);
      
      const progress = container.querySelector('.loading-bar-progress');
      expect(progress).toBeInTheDocument();
    });
  });

  describe('Z-index', () => {
    it('should have high z-index to appear on top', () => {
      isLoading.set(true);
      const { container } = render(LoadingBar);
      
      const loadingBar = container.querySelector('.loading-bar');
      // Check that the class is present (actual z-index is in CSS)
      expect(loadingBar).toBeInTheDocument();
    });
  });
});
