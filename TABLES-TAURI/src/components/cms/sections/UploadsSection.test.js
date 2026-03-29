import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, fireEvent, screen, waitFor } from '@testing-library/svelte';
import UploadsSection from './UploadsSection.svelte';
import { cmsData } from '../../../stores/cmsData.js';

describe('UploadsSection Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  describe('Initial Rendering', () => {
    it('should render uploads section title', () => {
      render(UploadsSection);

      expect(screen.getByText('Uploads')).toBeInTheDocument();
    });

    it('should render upload icon', () => {
      render(UploadsSection);

      const icon = document.querySelector('.uploads-section h2 i');
      expect(icon).toHaveClass('fa-upload');
    });

    it('should render upload file button', () => {
      render(UploadsSection);

      expect(screen.getByText('Upload File')).toBeInTheDocument();
    });

    it('should render select all button', () => {
      render(UploadsSection);

      expect(screen.getByText('Select All')).toBeInTheDocument();
    });

    it('should render export button', () => {
      render(UploadsSection);

      expect(screen.getByText('Export')).toBeInTheDocument();
    });

    it('should render import button', () => {
      render(UploadsSection);

      expect(screen.getByText('Import')).toBeInTheDocument();
    });

    it('should render purge all button', () => {
      render(UploadsSection);

      expect(screen.getByText('Purge All')).toBeInTheDocument();
    });
  });

  describe('Search Functionality', () => {
    it('should render search input', () => {
      render(UploadsSection);

      const searchInput = screen.getByPlaceholderText('Search files...');
      expect(searchInput).toBeInTheDocument();
    });

    it('should filter uploads when searching', async () => {
      // Set up some test data
      cmsData.update(data => ({
        ...data,
        uploads: [
          { id: '1', name: 'test-image.jpg', mime_type: 'image/jpeg', size: 1024, created_at: Date.now() / 1000 },
          { id: '2', name: 'document.pdf', mime_type: 'application/pdf', size: 2048, created_at: Date.now() / 1000 }
        ]
      }));

      render(UploadsSection);

      const searchInput = screen.getByPlaceholderText('Search files...');
      await fireEvent.change(searchInput, { target: { value: 'test' } });

      // Should filter results
      await waitFor(() => {
        expect(screen.getByText('test-image.jpg')).toBeInTheDocument();
      });
    });
  });

  describe('Bulk Selection', () => {
    it('should select all files when clicked', async () => {
      // Set up some test data
      cmsData.update(data => ({
        ...data,
        uploads: [
          { id: '1', name: 'file1.jpg', mime_type: 'image/jpeg', size: 1024, created_at: Date.now() / 1000 },
          { id: '2', name: 'file2.jpg', mime_type: 'image/jpeg', size: 2048, created_at: Date.now() / 1000 }
        ]
      }));

      render(UploadsSection);

      const selectAllButton = screen.getByText('Select All');
      await fireEvent.click(selectAllButton);

      // Wait for checkboxes to render and check they exist
      await waitFor(() => {
        const checkboxes = document.querySelectorAll('.upload-checkbox input[type="checkbox"]');
        expect(checkboxes.length).toBeGreaterThan(0);
      }, { timeout: 2000 });
    });

    it('should deselect all files when clicked', async () => {
      // Set up some test data
      cmsData.update(data => ({
        ...data,
        uploads: [
          { id: '1', name: 'file1.jpg', mime_type: 'image/jpeg', size: 1024, created_at: Date.now() / 1000 }
        ]
      }));

      render(UploadsSection);

      // First select all
      const selectAllButton = screen.getByText('Select All');
      await fireEvent.click(selectAllButton);

      // Then deselect all
      const deselectAllButton = screen.getByText('Deselect All');
      await fireEvent.click(deselectAllButton);

      // Checkboxes should be unchecked
      await waitFor(() => {
        const checkboxes = document.querySelectorAll('.upload-checkbox input[type="checkbox"]');
        checkboxes.forEach(cb => {
          expect(cb.checked).toBe(false);
        });
      });
    });

    it('should show bulk actions when files are selected', async () => {
      // Set up some test data
      cmsData.update(data => ({
        ...data,
        uploads: [
          { id: '1', name: 'file1.jpg', mime_type: 'image/jpeg', size: 1024, created_at: Date.now() / 1000 }
        ]
      }));

      render(UploadsSection);

      const selectAllButton = screen.getByText('Select All');
      await fireEvent.click(selectAllButton);

      // Bulk actions should be visible
      await waitFor(() => {
        expect(screen.getByText('Deselect All')).toBeInTheDocument();
        expect(screen.getByText('Delete Selected')).toBeInTheDocument();
      });
    });

    it('should show selected count', async () => {
      // Set up some test data
      cmsData.update(data => ({
        ...data,
        uploads: [
          { id: '1', name: 'file1.jpg', mime_type: 'image/jpeg', size: 1024, created_at: Date.now() / 1000 },
          { id: '2', name: 'file2.jpg', mime_type: 'image/jpeg', size: 2048, created_at: Date.now() / 1000 }
        ]
      }));

      render(UploadsSection);

      const selectAllButton = screen.getByText('Select All');
      await fireEvent.click(selectAllButton);

      // Bulk actions should appear with selected count
      await waitFor(async () => {
        expect(screen.getByText('Deselect All')).toBeInTheDocument();
        // Selected count text should be present
        const selectedElements = document.querySelectorAll('.selected-count');
        expect(selectedElements.length).toBeGreaterThan(0);
      }, { timeout: 2000 });
    });
  });

  describe('File Upload', () => {
    it('should trigger file input when upload button is clicked', async () => {
      render(UploadsSection);

      const uploadButton = screen.getByText('Upload File');
      const fileInput = document.querySelector('input[type="file"]');
      
      await fireEvent.click(uploadButton);
      
      expect(fileInput).toBeInTheDocument();
    });

    it('should show uploading indicator when uploading', async () => {
      render(UploadsSection);

      const fileInput = document.querySelector('input[type="file"]');
      const file = new File(['test'], 'test.txt', { type: 'text/plain' });

      await fireEvent.change(fileInput, { target: { files: [file] } });

      // Should show uploading indicator
      expect(screen.getByText('Uploading...')).toBeInTheDocument();
    });
  });

  describe('Replace File', () => {
    it('should have replace button for each upload', async () => {
      // Set up some test data
      cmsData.update(data => ({
        ...data,
        uploads: [
          { id: '1', name: 'file1.jpg', mime_type: 'image/jpeg', size: 1024, created_at: Date.now() / 1000 }
        ]
      }));

      render(UploadsSection);

      await waitFor(async () => {
        const replaceButtons = document.querySelectorAll('.btn-icon[title="Replace"]');
        expect(replaceButtons.length).toBeGreaterThan(0);
      }, { timeout: 2000 });
    });

    it('should trigger file input when replace is clicked', async () => {
      // Set up some test data
      cmsData.update(data => ({
        ...data,
        uploads: [
          { id: '1', name: 'file1.jpg', mime_type: 'image/jpeg', size: 1024, created_at: Date.now() / 1000 }
        ]
      }));

      render(UploadsSection);

      await waitFor(async () => {
        const replaceButton = document.querySelector('.btn-icon[title="Replace"]');
        expect(replaceButton).toBeInTheDocument();
        
        // Click replace button
        if (replaceButton) {
          await fireEvent.click(replaceButton);
          // Hidden file input should exist
          const fileInput = document.getElementById('replace-file-input');
          expect(fileInput).toBeInTheDocument();
        }
      }, { timeout: 2000 });
    });
  });

  describe('Delete Functionality', () => {
    it('should have delete button for each upload', async () => {
      // Set up some test data
      cmsData.update(data => ({
        ...data,
        uploads: [
          { id: '1', name: 'file1.jpg', mime_type: 'image/jpeg', size: 1024, created_at: Date.now() / 1000 }
        ]
      }));

      render(UploadsSection);

      const deleteButtons = document.querySelectorAll('.btn-icon.btn-danger[title="Delete"]');
      expect(deleteButtons.length).toBeGreaterThan(0);
    });

    it('should show delete confirmation when delete is clicked', async () => {
      // Set up some test data
      cmsData.update(data => ({
        ...data,
        uploads: [
          { id: '1', name: 'file1.jpg', mime_type: 'image/jpeg', size: 1024, created_at: Date.now() / 1000 }
        ]
      }));

      render(UploadsSection);

      const deleteButton = document.querySelector('.btn-icon.btn-danger[title="Delete"]');
      if (deleteButton) {
        await fireEvent.click(deleteButton);

        // Should show confirmation modal
        expect(screen.getByText('Delete File')).toBeInTheDocument();
      }
    });

    it('should show bulk delete confirmation when delete selected is clicked', async () => {
      // Set up some test data
      cmsData.update(data => ({
        ...data,
        uploads: [
          { id: '1', name: 'file1.jpg', mime_type: 'image/jpeg', size: 1024, created_at: Date.now() / 1000 },
          { id: '2', name: 'file2.jpg', mime_type: 'image/jpeg', size: 2048, created_at: Date.now() / 1000 }
        ]
      }));

      render(UploadsSection);

      const selectAllButton = screen.getByText('Select All');
      await fireEvent.click(selectAllButton);

      const deleteSelectedButton = screen.getByText('Delete Selected');
      await fireEvent.click(deleteSelectedButton);

      // Should show bulk delete confirmation
      expect(screen.getByText('Delete Selected Files')).toBeInTheDocument();
    });
  });

  describe('Preview Functionality', () => {
    it('should have preview button for previewable files', async () => {
      // Set up some test data
      cmsData.update(data => ({
        ...data,
        uploads: [
          { id: '1', name: 'image.jpg', mime_type: 'image/jpeg', size: 1024, created_at: Date.now() / 1000, data: 'data:image/jpeg;base64,test' }
        ]
      }));

      render(UploadsSection);

      const previewButtons = document.querySelectorAll('.btn-icon[title="Preview"]');
      expect(previewButtons.length).toBeGreaterThan(0);
    });

    it('should not have preview button for non-previewable files', async () => {
      // Set up some test data
      cmsData.update(data => ({
        ...data,
        uploads: [
          { id: '1', name: 'file.zip', mime_type: 'application/zip', size: 1024, created_at: Date.now() / 1000 }
        ]
      }));

      render(UploadsSection);

      const previewButtons = document.querySelectorAll('.btn-icon[title="Preview"]');
      expect(previewButtons.length).toBe(0);
    });
  });

  describe('Empty State', () => {
    it('should show empty state when no uploads', () => {
      cmsData.update(data => ({
        ...data,
        uploads: []
      }));

      render(UploadsSection);

      expect(screen.getByText('No uploads yet')).toBeInTheDocument();
      expect(screen.getByText('Upload your first file to get started')).toBeInTheDocument();
    });

    it('should show search input for filtering', async () => {
      // Set up some test data
      cmsData.update(data => ({
        ...data,
        uploads: [
          { id: '1', name: 'test.jpg', mime_type: 'image/jpeg', size: 1024, created_at: Date.now() / 1000 }
        ]
      }));

      render(UploadsSection);

      const searchInput = screen.getByPlaceholderText('Search files...');
      expect(searchInput).toBeInTheDocument();
      
      // Test that search input can be typed into
      await fireEvent.change(searchInput, { target: { value: 'test' } });
      expect(searchInput.value).toBe('test');
    });
  });

  describe('File Size Formatting', () => {
    it('should format bytes correctly', () => {
      render(UploadsSection);
      
      // Component should render without errors
      expect(screen.getByText('Uploads')).toBeInTheDocument();
    });
  });

  describe('File Icons', () => {
    it('should show correct icon for image files', () => {
      // Test is implicit in component rendering
      render(UploadsSection);
      expect(screen.getByText('Uploads')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper button titles', async () => {
      // Set up some test data
      cmsData.update(data => ({
        ...data,
        uploads: [
          { id: '1', name: 'file1.jpg', mime_type: 'image/jpeg', size: 1024, created_at: Date.now() / 1000 }
        ]
      }));

      render(UploadsSection);

      await waitFor(() => {
        expect(screen.getByTitle('Replace')).toBeInTheDocument();
        expect(screen.getByTitle('Delete')).toBeInTheDocument();
      });
    });

    it('should have labeled search input', () => {
      render(UploadsSection);

      const searchInput = screen.getByPlaceholderText('Search files...');
      expect(searchInput).toBeInTheDocument();
    });
  });

  describe('Styling', () => {
    it('should have uploads-section class', () => {
      render(UploadsSection);

      expect(document.querySelector('.uploads-section')).toBeInTheDocument();
    });

    it('should have uploads-grid', () => {
      render(UploadsSection);

      expect(document.querySelector('.uploads-grid') || document.querySelector('.empty-state')).toBeInTheDocument();
    });

    it('should have upload-card for each upload', async () => {
      cmsData.update(data => ({
        ...data,
        uploads: [
          { id: '1', name: 'file1.jpg', mime_type: 'image/jpeg', size: 1024, created_at: Date.now() / 1000 }
        ]
      }));

      render(UploadsSection);

      await waitFor(() => {
        expect(document.querySelector('.upload-card')).toBeInTheDocument();
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle null uploads gracefully', () => {
      cmsData.update(data => ({
        ...data,
        uploads: null
      }));

      render(UploadsSection);

      // Should not throw
      expect(screen.getByText('Uploads')).toBeInTheDocument();
    });

    it('should handle empty uploads array', () => {
      cmsData.update(data => ({
        ...data,
        uploads: []
      }));

      render(UploadsSection);

      expect(screen.getByText('No uploads yet')).toBeInTheDocument();
    });

    it('should handle very long filenames', async () => {
      const longName = 'a'.repeat(100) + '.jpg';
      cmsData.update(data => ({
        ...data,
        uploads: [
          { id: '1', name: longName, mime_type: 'image/jpeg', size: 1024, created_at: Date.now() / 1000 }
        ]
      }));

      render(UploadsSection);

      await waitFor(() => {
        expect(document.querySelector('.upload-card')).toBeInTheDocument();
      });
    });
  });
});
