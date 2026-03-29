import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, fireEvent, screen } from '@testing-library/svelte';
import HistoryPanel from './HistoryPanel.svelte';

describe('HistoryPanel Component', () => {
  const mockHistory = [
    {
      id: 'history_1',
      pageId: 'page1',
      action: 'create',
      label: 'Created page',
      timestamp: Date.now() - 100000,
      date: new Date().toISOString(),
      data: { name: 'Test Page', slug: 'test-page' }
    },
    {
      id: 'history_2',
      pageId: 'page1',
      action: 'update',
      label: 'Updated page',
      timestamp: Date.now() - 50000,
      date: new Date().toISOString(),
      data: { name: 'Updated Page', slug: 'updated-page' }
    }
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should not render when isOpen is false', () => {
      const { container } = render(HistoryPanel, {
        props: {
          isOpen: false,
          history: mockHistory,
          entityType: 'page'
        }
      });
      
      expect(container.querySelector('.modal-overlay')).toBeNull();
    });

    it('should render when isOpen is true', () => {
      const { container } = render(HistoryPanel, {
        props: {
          isOpen: true,
          history: mockHistory,
          entityType: 'page'
        }
      });
      
      expect(container.querySelector('.history-modal')).toBeInTheDocument();
    });

    it('should display correct title for pages', () => {
      render(HistoryPanel, {
        props: {
          isOpen: true,
          history: mockHistory,
          entityType: 'page'
        }
      });
      
      expect(screen.getByText('Page History')).toBeInTheDocument();
    });

    it('should display correct title for blog articles', () => {
      render(HistoryPanel, {
        props: {
          isOpen: true,
          history: mockHistory,
          entityType: 'blog'
        }
      });
      
      expect(screen.getByText('Article History')).toBeInTheDocument();
    });

    it('should display history count', () => {
      render(HistoryPanel, {
        props: {
          isOpen: true,
          history: mockHistory,
          entityType: 'page'
        }
      });
      
      expect(screen.getByText('2 of 2 entries')).toBeInTheDocument();
    });
  });

  describe('History List', () => {
    it('should display history entries', () => {
      render(HistoryPanel, {
        props: {
          isOpen: true,
          history: mockHistory,
          entityType: 'page'
        }
      });
      
      expect(screen.getByText('create')).toBeInTheDocument();
      expect(screen.getByText('update')).toBeInTheDocument();
    });

    it('should show entry labels', () => {
      render(HistoryPanel, {
        props: {
          isOpen: true,
          history: mockHistory,
          entityType: 'page'
        }
      });
      
      expect(screen.getByText('Created page')).toBeInTheDocument();
      expect(screen.getByText('Updated page')).toBeInTheDocument();
    });

    it('should show empty state when no history', () => {
      render(HistoryPanel, {
        props: {
          isOpen: true,
          history: [],
          entityType: 'page'
        }
      });
      
      expect(screen.getByText('No history entries found')).toBeInTheDocument();
    });
  });

  describe('Filtering', () => {
    it('should render search input', () => {
      render(HistoryPanel, {
        props: {
          isOpen: true,
          history: mockHistory,
          entityType: 'page'
        }
      });
      
      expect(screen.getByPlaceholderText('Search history...')).toBeInTheDocument();
    });

    it('should render action filter', () => {
      render(HistoryPanel, {
        props: {
          isOpen: true,
          history: mockHistory,
          entityType: 'page'
        }
      });
      
      const filterOptions = screen.getAllByRole('option');
      expect(filterOptions.length).toBeGreaterThan(0);
    });
  });

  describe('Entry Actions', () => {
    it('should show entry details when clicked', async () => {
      render(HistoryPanel, {
        props: {
          isOpen: true,
          history: mockHistory,
          entityType: 'page'
        }
      });
      
      const viewButtons = screen.getAllByTitle('View Details');
      await fireEvent.click(viewButtons[0]);
      
      expect(screen.getByText('Entry Details')).toBeInTheDocument();
    });

    it('should show rollback button for non-delete entries', () => {
      render(HistoryPanel, {
        props: {
          isOpen: true,
          history: mockHistory,
          entityType: 'page'
        }
      });
      
      const rollbackButtons = screen.getAllByTitle('Rollback to This Version');
      expect(rollbackButtons.length).toBeGreaterThan(0);
    });

    it('should show delete button for all entries', () => {
      render(HistoryPanel, {
        props: {
          isOpen: true,
          history: mockHistory,
          entityType: 'page'
        }
      });
      
      const deleteButtons = screen.getAllByTitle('Delete Entry');
      expect(deleteButtons.length).toBe(mockHistory.length);
    });
  });

  describe('Export/Import', () => {
    it('should have export button', () => {
      render(HistoryPanel, {
        props: {
          isOpen: true,
          history: mockHistory,
          entityType: 'page'
        }
      });
      
      expect(screen.getByTitle('Export History')).toBeInTheDocument();
    });

    it('should have import button', () => {
      render(HistoryPanel, {
        props: {
          isOpen: true,
          history: mockHistory,
          entityType: 'page'
        }
      });
      
      expect(screen.getByTitle('Import History')).toBeInTheDocument();
    });

    it('should have clear all button', () => {
      render(HistoryPanel, {
        props: {
          isOpen: true,
          history: mockHistory,
          entityType: 'page'
        }
      });
      
      expect(screen.getByTitle('Clear All History')).toBeInTheDocument();
    });
  });

  describe('Modal Controls', () => {
    it('should call onClose when close button is clicked', async () => {
      const onClose = vi.fn();
      render(HistoryPanel, {
        props: {
          isOpen: true,
          history: mockHistory,
          entityType: 'page',
          onClose
        }
      });
      
      // Close button might have multiple instances, use first one
      const closeButtons = screen.getAllByTitle('Close');
      if (closeButtons.length > 0) {
        await fireEvent.click(closeButtons[0]);
        expect(onClose).toHaveBeenCalled();
      }
    });

    it('should call onClose when clicking overlay', async () => {
      const onClose = vi.fn();
      const { container } = render(HistoryPanel, {
        props: {
          isOpen: true,
          history: mockHistory,
          entityType: 'page',
          onClose
        }
      });
      
      const overlay = container.querySelector('.modal-overlay');
      await fireEvent.click(overlay);
      
      expect(onClose).toHaveBeenCalled();
    });
  });

  describe('Action Icons', () => {
    it('should show correct icon for create action', () => {
      render(HistoryPanel, {
        props: {
          isOpen: true,
          history: [{
            id: 'test',
            pageId: 'page1',
            action: 'create',
            timestamp: Date.now(),
            date: new Date().toISOString(),
            data: {}
          }],
          entityType: 'page'
        }
      });
      
      expect(document.querySelector('.fa-plus-circle')).toBeInTheDocument();
    });

    it('should show correct icon for update action', () => {
      render(HistoryPanel, {
        props: {
          isOpen: true,
          history: [{
            id: 'test',
            pageId: 'page1',
            action: 'update',
            timestamp: Date.now(),
            date: new Date().toISOString(),
            data: {}
          }],
          entityType: 'page'
        }
      });
      
      expect(document.querySelector('.fa-edit')).toBeInTheDocument();
    });

    it('should show correct icon for delete action', () => {
      render(HistoryPanel, {
        props: {
          isOpen: true,
          history: [{
            id: 'test',
            pageId: 'page1',
            action: 'delete',
            timestamp: Date.now(),
            date: new Date().toISOString(),
            data: {}
          }],
          entityType: 'page'
        }
      });
      
      expect(document.querySelector('.fa-trash')).toBeInTheDocument();
    });

    it('should show correct icon for rollback action', () => {
      render(HistoryPanel, {
        props: {
          isOpen: true,
          history: [{
            id: 'test',
            pageId: 'page1',
            action: 'rollback',
            timestamp: Date.now(),
            date: new Date().toISOString(),
            data: {}
          }],
          entityType: 'page'
        }
      });
      
      expect(document.querySelector('.fa-undo')).toBeInTheDocument();
    });
  });

  describe('Date Formatting', () => {
    it('should format dates correctly', () => {
      render(HistoryPanel, {
        props: {
          isOpen: true,
          history: mockHistory,
          entityType: 'page'
        }
      });
      
      // Should display formatted dates
      const dates = document.querySelectorAll('.entry-date');
      expect(dates.length).toBe(mockHistory.length);
    });
  });

  describe('Confirmation Modals', () => {
    it('should show rollback confirmation', async () => {
      render(HistoryPanel, {
        props: {
          isOpen: true,
          history: mockHistory,
          entityType: 'page'
        }
      });
      
      const viewButtons = screen.getAllByTitle('View Details');
      await fireEvent.click(viewButtons[0]);
      
      const rollbackButtons = screen.getAllByTitle('Rollback to This Version');
      await fireEvent.click(rollbackButtons[0]);
      
      expect(screen.getByText('Rollback to This Version?')).toBeInTheDocument();
    });

    it('should show delete confirmation', async () => {
      render(HistoryPanel, {
        props: {
          isOpen: true,
          history: mockHistory,
          entityType: 'page'
        }
      });
      
      const deleteButtons = screen.getAllByTitle('Delete Entry');
      await fireEvent.click(deleteButtons[0]);
      
      expect(screen.getByText('Delete History Entry')).toBeInTheDocument();
    });

    it('should show clear all confirmation', async () => {
      render(HistoryPanel, {
        props: {
          isOpen: true,
          history: mockHistory,
          entityType: 'page'
        }
      });
      
      const clearButton = screen.getByTitle('Clear All History');
      await fireEvent.click(clearButton);
      
      expect(screen.getByText('Clear All History')).toBeInTheDocument();
    });
  });

  describe('Data Display', () => {
    it('should show entry data in details view', async () => {
      render(HistoryPanel, {
        props: {
          isOpen: true,
          history: mockHistory,
          entityType: 'page'
        }
      });
      
      const viewButtons = screen.getAllByTitle('View Details');
      await fireEvent.click(viewButtons[0]);
      
      // Should show data JSON
      expect(screen.getByText(/"name":/)).toBeInTheDocument();
      expect(screen.getByText(/"slug":/)).toBeInTheDocument();
    });

    it('should show action label in details', async () => {
      render(HistoryPanel, {
        props: {
          isOpen: true,
          history: mockHistory,
          entityType: 'page'
        }
      });
      
      const viewButtons = screen.getAllByTitle('View Details');
      await fireEvent.click(viewButtons[0]);
      
      expect(screen.getByText('Action:')).toBeInTheDocument();
      // Use queryAll to avoid multiple elements error
      const actionElements = screen.getAllByText('create');
      expect(actionElements.length).toBeGreaterThan(0);
    });

    it('should show date label in details', async () => {
      render(HistoryPanel, {
        props: {
          isOpen: true,
          history: mockHistory,
          entityType: 'page'
        }
      });
      
      const viewButtons = screen.getAllByTitle('View Details');
      await fireEvent.click(viewButtons[0]);
      
      expect(screen.getByText('Date:')).toBeInTheDocument();
    });
  });
});
