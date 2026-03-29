import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/svelte';
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
      
      expect(container).toBeInTheDocument();
    });

    it('should display title', () => {
      render(HistoryPanel, {
        props: {
          isOpen: true,
          history: mockHistory,
          entityType: 'page'
        }
      });
      
      expect(screen.getByText(/History/i)).toBeInTheDocument();
    });

    it('should display history entries', () => {
      render(HistoryPanel, {
        props: {
          isOpen: true,
          history: mockHistory,
          entityType: 'page'
        }
      });
      
      expect(screen.getByText('Created page')).toBeInTheDocument();
    });

    it('should show empty state when no history', () => {
      render(HistoryPanel, {
        props: {
          isOpen: true,
          history: [],
          entityType: 'page'
        }
      });
      
      expect(screen.getByText(/No history/i)).toBeInTheDocument();
    });
  });

  describe('Controls', () => {
    it('should have search input', () => {
      render(HistoryPanel, {
        props: {
          isOpen: true,
          history: mockHistory,
          entityType: 'page'
        }
      });
      
      expect(screen.getByPlaceholderText(/Search/i)).toBeInTheDocument();
    });

    it('should have action filter', () => {
      render(HistoryPanel, {
        props: {
          isOpen: true,
          history: mockHistory,
          entityType: 'page'
        }
      });
      
      expect(screen.getByRole('combobox')).toBeInTheDocument();
    });

    it('should have export button', () => {
      render(HistoryPanel, {
        props: {
          isOpen: true,
          history: mockHistory,
          entityType: 'page'
        }
      });
      
      expect(screen.getByText('Export')).toBeInTheDocument();
    });

    it('should have clear all button', () => {
      render(HistoryPanel, {
        props: {
          isOpen: true,
          history: mockHistory,
          entityType: 'page'
        }
      });
      
      expect(screen.getByText('Clear All')).toBeInTheDocument();
    });
  });

  describe('Entry Actions', () => {
    it('should display entry action', () => {
      render(HistoryPanel, {
        props: {
          isOpen: true,
          history: mockHistory,
          entityType: 'page'
        }
      });
      
      expect(screen.getByText('create')).toBeInTheDocument();
    });

    it('should have view button', () => {
      render(HistoryPanel, {
        props: {
          isOpen: true,
          history: mockHistory,
          entityType: 'page'
        }
      });
      
      const viewButtons = screen.getAllByTitle('View Details');
      expect(viewButtons.length).toBeGreaterThan(0);
    });

    it('should have delete button', () => {
      render(HistoryPanel, {
        props: {
          isOpen: true,
          history: mockHistory,
          entityType: 'page'
        }
      });
      
      const deleteButtons = screen.getAllByTitle('Delete Entry');
      expect(deleteButtons.length).toBeGreaterThan(0);
    });
  });

  describe('Modal Behavior', () => {
    it('should call onClose when overlay clicked', async () => {
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
      if (overlay) {
        await overlay.click();
        expect(onClose).toHaveBeenCalled();
      }
    });
  });

  describe('Different Entity Types', () => {
    it('should work with page entity type', () => {
      render(HistoryPanel, {
        props: {
          isOpen: true,
          history: mockHistory,
          entityType: 'page'
        }
      });
      
      expect(screen.getByText(/Page History/i)).toBeInTheDocument();
    });

    it('should work with blog entity type', () => {
      render(HistoryPanel, {
        props: {
          isOpen: true,
          history: mockHistory,
          entityType: 'blog'
        }
      });
      
      expect(screen.getByText(/Article History/i)).toBeInTheDocument();
    });
  });

  describe('Data Display', () => {
    it('should display entry count', () => {
      render(HistoryPanel, {
        props: {
          isOpen: true,
          history: mockHistory,
          entityType: 'page'
        }
      });
      
      expect(screen.getByText(/1 of 1 entries/i)).toBeInTheDocument();
    });

    it('should display entry date', () => {
      render(HistoryPanel, {
        props: {
          isOpen: true,
          history: mockHistory,
          entityType: 'page'
        }
      });
      
      const dates = document.querySelectorAll('.entry-date');
      expect(dates.length).toBeGreaterThan(0);
    });
  });

  describe('Accessibility', () => {
    it('should have proper modal structure', () => {
      render(HistoryPanel, {
        props: {
          isOpen: true,
          history: mockHistory,
          entityType: 'page'
        }
      });
      
      expect(document.querySelector('.modal-overlay')).toBeInTheDocument();
      expect(document.querySelector('.history-modal')).toBeInTheDocument();
    });

    it('should have header', () => {
      render(HistoryPanel, {
        props: {
          isOpen: true,
          history: mockHistory,
          entityType: 'page'
        }
      });
      
      expect(document.querySelector('.modal-header')).toBeInTheDocument();
    });

    it('should have body', () => {
      render(HistoryPanel, {
        props: {
          isOpen: true,
          history: mockHistory,
          entityType: 'page'
        }
      });
      
      expect(document.querySelector('.modal-body')).toBeInTheDocument();
    });
  });
});
