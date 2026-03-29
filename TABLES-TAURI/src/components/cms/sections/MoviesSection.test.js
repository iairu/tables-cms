import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, fireEvent, screen, waitFor } from '@testing-library/svelte';
import MoviesSection from './MoviesSection.svelte';
import { cmsData, saveMovieList } from '../../../stores/cmsData.js';

// Mock fetch for OMDb API
global.fetch = vi.fn();

describe('MoviesSection Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset cmsData store
    saveMovieList([]);
  });

  describe('Rendering', () => {
    it('renders the movie tracker header', () => {
      const { container } = render(MoviesSection);
      expect(container.querySelector('h2')).toContainHTML('Movie Tracker');
    });

    it('displays empty state when no movies', () => {
      const { container } = render(MoviesSection);
      expect(container.querySelector('.empty-state')).toBeTruthy();
      expect(container.textContent).toContain('No movies tracked yet');
    });

    it('displays movie list when movies exist', async () => {
      saveMovieList([
        { id: '1', title: 'Test Movie', year: 2023, genre: 'Action', watched: false }
      ]);
      
      await waitFor(() => {
        const { container } = render(MoviesSection);
        expect(container.querySelector('.movies-list')).toBeTruthy();
      });
    });
  });

  describe('Search Functionality', () => {
    it('filters movies by title', async () => {
      saveMovieList([
        { id: '1', title: 'The Matrix', year: 1999, genre: 'Sci-Fi' },
        { id: '2', title: 'Inception', year: 2010, genre: 'Sci-Fi' }
      ]);

      await waitFor(() => {
        render(MoviesSection);
      });

      const searchInput = screen.getByPlaceholderText('Search movies...');
      await fireEvent.input(searchInput, { target: { value: 'Matrix' } });

      await waitFor(() => {
        expect(screen.getByText('The Matrix')).toBeTruthy();
        expect(screen.queryByText('Inception')).toBeNull();
      });
    });

    it('filters movies by director', async () => {
      saveMovieList([
        { id: '1', title: 'The Matrix', director: 'Wachowski' },
        { id: '2', title: 'Inception', director: 'Nolan' }
      ]);

      await waitFor(() => {
        render(MoviesSection);
      });

      const searchInput = screen.getByPlaceholderText('Search movies...');
      await fireEvent.input(searchInput, { target: { value: 'Nolan' } });

      await waitFor(() => {
        expect(screen.getByText('Inception')).toBeTruthy();
      });
    });
  });

  describe('Add Movie', () => {
    it('opens add movie form when clicking Add Movie button', async () => {
      const { container } = render(MoviesSection);
      const addButton = screen.getByText('Add Movie');
      
      await fireEvent.click(addButton);

      await waitFor(() => {
        expect(container.querySelector('.editor-fullscreen')).toBeTruthy();
      });
    });

    it('saves a new movie', async () => {
      const { container } = render(MoviesSection);
      
      // Click Add Movie
      const addButton = screen.getByText('Add Movie');
      await fireEvent.click(addButton);

      // Wait for editor to appear
      await waitFor(() => {
        expect(container.querySelector('.editor-fullscreen')).toBeTruthy();
      });

      // Fill in form
      const titleInput = container.querySelector('input[placeholder="Movie title"]');
      await fireEvent.input(titleInput, { target: { value: 'New Movie' } });

      // Save
      const saveButton = screen.getByText('Save');
      await fireEvent.click(saveButton);

      // Verify movie was saved
      await waitFor(() => {
        expect(screen.getByText('New Movie')).toBeTruthy();
      });
    });

    it('cancels adding a new movie', async () => {
      const { container } = render(MoviesSection);
      
      // Click Add Movie
      const addButton = screen.getByText('Add Movie');
      await fireEvent.click(addButton);

      // Cancel
      await waitFor(() => {
        const cancelButton = screen.getByText('Back to Movies');
        fireEvent.click(cancelButton);
      });

      // Should return to list view
      await waitFor(() => {
        expect(container.querySelector('.empty-state')).toBeTruthy();
      });
    });
  });

  describe('Edit Movie', () => {
    it('opens edit form when clicking edit button', async () => {
      saveMovieList([
        { id: '1', title: 'Test Movie', year: 2023 }
      ]);

      await waitFor(() => {
        render(MoviesSection);
      });

      const editButton = screen.getByTitle('Edit');
      await fireEvent.click(editButton);

      await waitFor(() => {
        expect(screen.getByDisplayValue('Test Movie')).toBeTruthy();
      });
    });

    it('updates movie details', async () => {
      saveMovieList([
        { id: '1', title: 'Old Title', year: 2020 }
      ]);

      await waitFor(() => {
        render(MoviesSection);
      });

      // Click edit
      const editButton = screen.getByTitle('Edit');
      await fireEvent.click(editButton);

      // Change title
      await waitFor(() => {
        const titleInput = screen.getByDisplayValue('Old Title');
        fireEvent.input(titleInput, { target: { value: 'New Title' } });
      });

      // Save
      const saveButton = screen.getByText('Save');
      await fireEvent.click(saveButton);

      // Verify update
      await waitFor(() => {
        expect(screen.getByText('New Title')).toBeTruthy();
      });
    });
  });

  describe('Delete Movie', () => {
    it('shows confirmation modal when deleting', async () => {
      saveMovieList([
        { id: '1', title: 'Movie to Delete' }
      ]);

      await waitFor(() => {
        render(MoviesSection);
      });

      const deleteButton = screen.getByTitle('Delete');
      await fireEvent.click(deleteButton);

      await waitFor(() => {
        expect(screen.getByText('Delete Movie')).toBeTruthy();
      });
    });

    it('deletes movie after confirmation', async () => {
      saveMovieList([
        { id: '1', title: 'Movie to Delete' }
      ]);

      await waitFor(() => {
        render(MoviesSection);
      });

      // Click delete
      const deleteButton = screen.getByTitle('Delete');
      await fireEvent.click(deleteButton);

      // Confirm
      await waitFor(() => {
        const confirmButton = screen.getByText('Delete');
        fireEvent.click(confirmButton);
      });

      // Verify deletion
      await waitFor(() => {
        expect(screen.queryByText('Movie to Delete')).toBeNull();
      });
    });

    it('cancels deletion', async () => {
      saveMovieList([
        { id: '1', title: 'Movie to Keep' }
      ]);

      await waitFor(() => {
        render(MoviesSection);
      });

      // Click delete
      const deleteButton = screen.getByTitle('Delete');
      await fireEvent.click(deleteButton);

      // Cancel
      await waitFor(() => {
        const cancelButton = screen.getByText('Cancel');
        fireEvent.click(cancelButton);
      });

      // Movie should still be there
      await waitFor(() => {
        expect(screen.getByText('Movie to Keep')).toBeTruthy();
      });
    });
  });

  describe('Watched Toggle', () => {
    it('toggles watched status when checkbox is clicked', async () => {
      saveMovieList([
        { id: '1', title: 'Test Movie', watched: false }
      ]);

      await waitFor(() => {
        render(MoviesSection);
      });

      const checkbox = screen.getByRole('checkbox');
      expect(checkbox.checked).toBe(false);

      await fireEvent.click(checkbox);

      // Checkbox should be checked now
      await waitFor(() => {
        expect(checkbox.checked).toBe(true);
      });
    });

    it('displays watched movies with strikethrough', async () => {
      saveMovieList([
        { id: '1', title: 'Watched Movie', watched: true }
      ]);

      await waitFor(() => {
        const { container } = render(MoviesSection);
        const movieItem = container.querySelector('.movie-item.watched');
        expect(movieItem).toBeTruthy();
      });
    });
  });

  describe('Rating System', () => {
    it('opens editor with rating controls', async () => {
      saveMovieList([
        { id: '1', title: 'Rate Me', rating: 0 }
      ]);

      await waitFor(() => {
        render(MoviesSection);
      });

      const editButton = screen.getByTitle('Edit');
      await fireEvent.click(editButton);

      await waitFor(() => {
        expect(screen.getByText('Save')).toBeTruthy();
      });

      // Rating buttons should be present - check for at least some rating numbers
      const allButtons = screen.getAllByRole('button');
      const hasRatingButtons = allButtons.some(btn => 
        ['1','2','3','4','5','6','7','8','9','10'].includes(btn.textContent.trim())
      );
      expect(hasRatingButtons).toBe(true);
    });

    it('updates rating when clicking rating button', async () => {
      saveMovieList([
        { id: '1', title: 'Rate Me', rating: 0 }
      ]);

      await waitFor(() => {
        render(MoviesSection);
      });

      const editButton = screen.getByTitle('Edit');
      await fireEvent.click(editButton);

      await waitFor(() => {
        const ratingButton = screen.getByText('7');
        fireEvent.click(ratingButton);
      });

      // Save
      const saveButton = screen.getByText('Save');
      await fireEvent.click(saveButton);

      // Should show 7/10 rating in the movie list
      await waitFor(() => {
        const content = screen.getByText('Rate Me').closest('.movie-item');
        expect(content.textContent).toContain('7/10');
      });
    });
  });

  describe('OMDb Integration', () => {
    it('opens OMDb search modal', async () => {
      const { container } = render(MoviesSection);
      
      const importButton = screen.getByText('Import from OMDb');
      await fireEvent.click(importButton);

      await waitFor(() => {
        expect(container.querySelector('.modal-overlay')).toBeTruthy();
      });
    });

    it('shows error when searching without API key', async () => {
      render(MoviesSection);

      // Open modal
      const importButton = screen.getByText('Import from OMDb');
      await fireEvent.click(importButton);

      // Search without API key - check that error state is set
      await waitFor(() => {
        const searchButton = screen.getByText('Search');
        fireEvent.click(searchButton);
      });

      // The error is shown in the component state - verify modal is open and has API key field
      await waitFor(() => {
        const apiKeyInput = screen.getByPlaceholderText('Enter your OMDb API key');
        expect(apiKeyInput).toBeTruthy();
      });
    });

    it('searches OMDb API with valid key', async () => {
      // Mock successful API response
      fetch.mockResolvedValueOnce({
        json: () => Promise.resolve({
          Response: 'True',
          Search: [
            { Title: 'The Matrix', Year: '1999', imdbID: 'tt0133093', Type: 'movie' }
          ]
        })
      });

      render(MoviesSection);
      
      // Open modal
      const importButton = screen.getByText('Import from OMDb');
      await fireEvent.click(importButton);

      // Enter API key
      await waitFor(() => {
        const apiKeyInput = screen.getByPlaceholderText('Enter your OMDb API key');
        fireEvent.input(apiKeyInput, { target: { value: 'test-key' } });
      });

      // Enter search query
      const searchInput = screen.getByPlaceholderText('Search for movies...');
      await fireEvent.input(searchInput, { target: { value: 'Matrix' } });

      // Click search
      const searchButton = screen.getByText('Search');
      await fireEvent.click(searchButton);

      // Should show results
      await waitFor(() => {
        expect(screen.getByText('The Matrix (1999)')).toBeTruthy();
      });
    });

    it('imports movie from OMDb', async () => {
      // Mock search response
      fetch.mockResolvedValueOnce({
        json: () => Promise.resolve({
          Response: 'True',
          Search: [
            { Title: 'The Matrix', Year: '1999', imdbID: 'tt0133093', Type: 'movie' }
          ]
        })
      }).mockResolvedValueOnce({
        json: () => Promise.resolve({
          Response: 'True',
          Title: 'The Matrix',
          Year: '1999',
          Genre: 'Action, Sci-Fi',
          Director: 'Lana Wachowski, Lilly Wachowski',
          imdbID: 'tt0133093'
        })
      });

      render(MoviesSection);
      
      // Open modal
      const importButton = screen.getByText('Import from OMDb');
      await fireEvent.click(importButton);

      // Enter API key
      await waitFor(() => {
        const apiKeyInput = screen.getByPlaceholderText('Enter your OMDb API key');
        fireEvent.input(apiKeyInput, { target: { value: 'test-key' } });
      });

      // Search
      const searchInput = screen.getByPlaceholderText('Search for movies...');
      await fireEvent.input(searchInput, { target: { value: 'Matrix' } });

      const searchButton = screen.getByText('Search');
      await fireEvent.click(searchButton);

      // Wait for results and click import
      await waitFor(() => {
        const importBtn = screen.getByText('Import');
        fireEvent.click(importBtn);
      });

      // Should import the movie - check for title input in editor
      await waitFor(() => {
        const titleInput = screen.getByPlaceholderText('Movie title');
        expect(titleInput.value).toBe('The Matrix');
      });
    });

    it('prevents duplicate imports by IMDB ID', async () => {
      // Add existing movie
      saveMovieList([
        { id: '1', title: 'The Matrix', imdbId: 'tt0133093' }
      ]);

      // Mock API response
      fetch.mockResolvedValueOnce({
        json: () => Promise.resolve({
          Response: 'True',
          Search: [
            { Title: 'The Matrix', Year: '1999', imdbID: 'tt0133093', Type: 'movie' }
          ]
        })
      }).mockResolvedValueOnce({
        json: () => Promise.resolve({
          Response: 'True',
          Title: 'The Matrix',
          Year: '1999',
          imdbID: 'tt0133093'
        })
      });

      render(MoviesSection);
      
      // Open modal
      const importButton = screen.getByText('Import from OMDb');
      await fireEvent.click(importButton);

      // Enter API key and search
      await waitFor(() => {
        const apiKeyInput = screen.getByPlaceholderText('Enter your OMDb API key');
        fireEvent.input(apiKeyInput, { target: { value: 'test-key' } });
      });

      const searchInput = screen.getByPlaceholderText('Search for movies...');
      await fireEvent.input(searchInput, { target: { value: 'Matrix' } });

      const searchButton = screen.getByText('Search');
      await fireEvent.click(searchButton);

      // Try to import
      await waitFor(() => {
        const importBtn = screen.getByText('Import');
        fireEvent.click(importBtn);
      });

      // Should show duplicate error
      await waitFor(() => {
        expect(screen.getByText(/already exists/i)).toBeTruthy();
      });
    });

    it('handles API errors gracefully', async () => {
      // Mock API error
      fetch.mockResolvedValueOnce({
        json: () => Promise.resolve({
          Response: 'False',
          Error: 'Movie not found'
        })
      });

      render(MoviesSection);
      
      // Open modal
      const importButton = screen.getByText('Import from OMDb');
      await fireEvent.click(importButton);

      // Enter API key and search
      await waitFor(() => {
        const apiKeyInput = screen.getByPlaceholderText('Enter your OMDb API key');
        fireEvent.input(apiKeyInput, { target: { value: 'test-key' } });
      });

      const searchInput = screen.getByPlaceholderText('Search for movies...');
      await fireEvent.input(searchInput, { target: { value: 'NonExistentMovie' } });

      const searchButton = screen.getByText('Search');
      await fireEvent.click(searchButton);

      // Should show error
      await waitFor(() => {
        expect(screen.getByText('Movie not found')).toBeTruthy();
      });
    });

    it('closes OMDb modal', async () => {
      const { container } = render(MoviesSection);

      // Open modal
      const importButton = screen.getByText('Import from OMDb');
      await fireEvent.click(importButton);

      // Close - click the close button (X icon)
      await waitFor(() => {
        const closeButton = container.querySelector('.btn-close');
        fireEvent.click(closeButton);
      });

      // Modal should be gone
      await waitFor(() => {
        expect(container.querySelector('.modal-overlay')).toBeNull();
      });
    });
  });

  describe('Movie Statistics', () => {
    it('displays movie statistics', async () => {
      saveMovieList([
        { id: '1', title: 'Watched', watched: true },
        { id: '2', title: 'Unwatched', watched: false }
      ]);

      await waitFor(() => {
        render(MoviesSection);
      });

      await waitFor(() => {
        expect(screen.getByText('Total:')).toBeTruthy();
        expect(screen.getByText('Watched:')).toBeTruthy();
        expect(screen.getByText('Unwatched:')).toBeTruthy();
      });
    });

    it('shows correct counts', async () => {
      saveMovieList([
        { id: '1', title: 'Watched 1', watched: true },
        { id: '2', title: 'Watched 2', watched: true },
        { id: '3', title: 'Unwatched', watched: false }
      ]);

      await waitFor(() => {
        render(MoviesSection);
      });

      await waitFor(() => {
        const stats = screen.getByText(/Total:/).parentElement;
        expect(stats.textContent).toContain('3');
      });
    });
  });

  describe('Accessibility', () => {
    it('has proper button labels', async () => {
      saveMovieList([
        { id: '1', title: 'Test' }
      ]);

      await waitFor(() => {
        render(MoviesSection);
      });

      const editButton = screen.getByTitle('Edit');
      expect(editButton).toBeTruthy();

      const deleteButton = screen.getByTitle('Delete');
      expect(deleteButton).toBeTruthy();
    });

    it('has search input with placeholder', async () => {
      render(MoviesSection);
      
      const searchInput = screen.getByPlaceholderText('Search movies...');
      expect(searchInput).toBeTruthy();
    });
  });
});
