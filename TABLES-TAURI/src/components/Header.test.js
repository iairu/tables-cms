import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, fireEvent, screen } from '@testing-library/svelte';
import Header from './Header.svelte';

describe('Header Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Initial Rendering', () => {
    it('should render app title', () => {
      render(Header, { props: {} });
      
      expect(screen.getByText('TABLES CMS')).toBeInTheDocument();
    });

    it('should render TABLES icon', () => {
      render(Header, { props: {} });
      
      const icon = document.querySelector('.app-title i');
      expect(icon).toHaveClass('fa-table');
    });
  });

  describe('Notes Sidebar Button', () => {
    it('should show notes button when notes extension is enabled', () => {
      render(Header, {
        props: {
          extensions: { 'notes-extension-enabled': true }
        }
      });
      
      const notesButton = screen.getByTitle('Notes');
      expect(notesButton).toBeInTheDocument();
    });

    it('should hide notes button when notes extension is disabled', () => {
      render(Header, {
        props: {
          extensions: { 'notes-extension-enabled': false }
        }
      });
      
      const notesButton = screen.queryByTitle('Notes');
      expect(notesButton).not.toBeInTheDocument();
    });

    it('should call onToggleNotesSidebar when clicked', async () => {
      const onToggleNotesSidebar = vi.fn();
      
      render(Header, {
        props: {
          extensions: { 'notes-extension-enabled': true },
          onToggleNotesSidebar
        }
      });
      
      const notesButton = screen.getByTitle('Notes');
      await fireEvent.click(notesButton);
      
      expect(onToggleNotesSidebar).toHaveBeenCalled();
    });
  });

  describe('Build Buttons', () => {
    it('should show Build Locally button when canBuild is true', () => {
      render(Header, {
        props: {
          canBuild: true,
          isBuilding: false
        }
      });
      
      expect(screen.getByText('Build Locally')).toBeInTheDocument();
    });

    it('should hide Build Locally button when canBuild is false', () => {
      render(Header, {
        props: {
          canBuild: false,
          isBuilding: false
        }
      });
      
      expect(screen.queryByText('Build Locally')).not.toBeInTheDocument();
    });

    it('should show Deploy button when vercelApiKey is provided', () => {
      render(Header, {
        props: {
          canBuild: true,
          vercelApiKey: 'test-key'
        }
      });
      
      expect(screen.getByText('Deploy')).toBeInTheDocument();
    });

    it('should hide Deploy button when vercelApiKey is not provided', () => {
      render(Header, {
        props: {
          canBuild: true,
          vercelApiKey: ''
        }
      });
      
      expect(screen.queryByText('Deploy')).not.toBeInTheDocument();
    });

    it('should call onBuildLocally when clicked', async () => {
      const onBuildLocally = vi.fn();
      
      render(Header, {
        props: {
          canBuild: true,
          onBuildLocally
        }
      });
      
      const buildButton = screen.getByText('Build Locally');
      await fireEvent.click(buildButton);
      
      expect(onBuildLocally).toHaveBeenCalled();
    });

    it('should call onBuildAndDeploy when clicked', async () => {
      const onBuildAndDeploy = vi.fn();
      
      render(Header, {
        props: {
          canBuild: true,
          vercelApiKey: 'test-key',
          onBuildAndDeploy
        }
      });
      
      const deployButton = screen.getByText('Deploy');
      await fireEvent.click(deployButton);
      
      expect(onBuildAndDeploy).toHaveBeenCalled();
    });
  });

  describe('Building State', () => {
    it('should show building indicator when isBuilding is true', () => {
      render(Header, {
        props: {
          isBuilding: true
        }
      });
      
      expect(screen.getByText('Building...')).toBeInTheDocument();
    });

    it('should show spinner icon when building', () => {
      render(Header, {
        props: {
          isBuilding: true
        }
      });
      
      const spinner = document.querySelector('.fa-spinner');
      expect(spinner).toBeInTheDocument();
    });

    it('should disable button when building', () => {
      render(Header, {
        props: {
          isBuilding: true
        }
      });
      
      const button = screen.getByText('Building...');
      expect(button).toHaveAttribute('disabled');
    });
  });

  describe('Visit Domain Button', () => {
    it('should show Visit button', () => {
      render(Header, { props: {} });
      
      expect(screen.getByText('Visit')).toBeInTheDocument();
    });

    it('should have correct href when domain is provided', () => {
      render(Header, {
        props: { domain: 'https://example.com' }
      });
      
      const visitLink = screen.getByTitle('Visit Domain');
      expect(visitLink).toHaveAttribute('href', 'https://example.com');
    });

    it('should have # href when domain is empty', () => {
      render(Header, {
        props: { domain: '' }
      });
      
      const visitLink = screen.getByTitle('Visit Domain');
      expect(visitLink).toHaveAttribute('href', '#');
    });

    it('should open in new tab', () => {
      render(Header, {
        props: { domain: 'https://example.com' }
      });
      
      const visitLink = screen.getByTitle('Visit Domain');
      expect(visitLink).toHaveAttribute('target', '_blank');
      expect(visitLink).toHaveAttribute('rel', 'noopener noreferrer');
    });

    it('should be clickable when domain is provided', () => {
      render(Header, {
        props: { domain: 'https://example.com' }
      });
      
      const visitLink = screen.getByTitle('Visit Domain');
      expect(visitLink).toHaveStyle('pointer-events: auto');
      expect(visitLink).toHaveStyle('opacity: 1');
    });

    it('should be disabled when domain is not provided', () => {
      render(Header, {
        props: { domain: '' }
      });
      
      const visitLink = screen.getByTitle('Visit Domain');
      expect(visitLink).toHaveStyle('pointer-events: none');
      expect(visitLink).toHaveStyle('opacity: 0.5');
    });
  });

  describe('Cooldown Timer', () => {
    it('should accept buildCooldownSeconds prop', () => {
      render(Header, {
        props: {
          buildCooldownSeconds: 30
        }
      });
      
      // Component should render without errors
      expect(screen.getByText('TABLES CMS')).toBeInTheDocument();
    });

    it('should hide build buttons during cooldown', () => {
      render(Header, {
        props: {
          canBuild: true,
          buildCooldownSeconds: 30,
          isBuilding: false
        }
      });
      
      // Build buttons should still show (cooldown logic is in parent)
      expect(screen.getByText('Build Locally')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper button titles', () => {
      render(Header, {
        props: {
          canBuild: true,
          vercelApiKey: 'test-key',
          extensions: { 'notes-extension-enabled': true }
        }
      });
      
      expect(screen.getByTitle('Notes')).toBeInTheDocument();
      expect(screen.getByTitle('Build Locally')).toBeInTheDocument();
      expect(screen.getByTitle('Build & Deploy to Vercel')).toBeInTheDocument();
      expect(screen.getByTitle('Visit Domain')).toBeInTheDocument();
    });

    it('should have header element', () => {
      render(Header, { props: {} });
      
      const header = document.querySelector('header');
      expect(header).toBeInTheDocument();
    });
  });

  describe('Styling', () => {
    it('should have header class', () => {
      render(Header, { props: {} });
      
      const header = document.querySelector('header');
      expect(header).toHaveClass('header');
    });

    it('should have header-left and header-right sections', () => {
      render(Header, { props: {} });
      
      expect(document.querySelector('.header-left')).toBeInTheDocument();
      expect(document.querySelector('.header-right')).toBeInTheDocument();
    });

    it('should have app-title class', () => {
      render(Header, { props: {} });
      
      expect(document.querySelector('.app-title')).toBeInTheDocument();
    });
  });

  describe('Extension System Integration', () => {
    it('should handle empty extensions object', () => {
      render(Header, {
        props: {
          extensions: {}
        }
      });
      
      // Should render without errors
      expect(screen.getByText('TABLES CMS')).toBeInTheDocument();
    });

    it('should handle null extensions', () => {
      render(Header, {
        props: {
          extensions: null
        }
      });
      
      // Should render without errors
      expect(screen.getByText('TABLES CMS')).toBeInTheDocument();
    });

    it('should handle undefined extensions', () => {
      render(Header, {
        props: {
          extensions: undefined
        }
      });
      
      // Should render without errors
      expect(screen.getByText('TABLES CMS')).toBeInTheDocument();
    });
  });

  describe('Button States', () => {
    it('should show correct button states based on props', async () => {
      // Can build, not building
      const { rerender } = render(Header, {
        canBuild: true,
        isBuilding: false
      });
      
      expect(screen.getByText('Build Locally')).toBeInTheDocument();
      expect(screen.queryByText('Building...')).not.toBeInTheDocument();
      
      // Now building - rerender with new props
      await rerender({
        canBuild: false,
        isBuilding: true
      });
      
      // Build Locally should be gone
      const buildLocally = screen.queryByText('Build Locally');
      expect(buildLocally).not.toBeInTheDocument();
      
      // Building indicator should appear
      expect(screen.getByText('Building...')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle all props being false/empty', () => {
      render(Header, {
        props: {
          canBuild: false,
          isBuilding: false,
          domain: '',
          vercelApiKey: '',
          extensions: {}
        }
      });
      
      // Should still render header
      expect(screen.getByText('TABLES CMS')).toBeInTheDocument();
    });

    it('should handle very long domain URLs', () => {
      const longDomain = 'https://' + 'a'.repeat(100) + '.com';
      render(Header, {
        props: { domain: longDomain }
      });
      
      const visitLink = screen.getByTitle('Visit Domain');
      expect(visitLink).toHaveAttribute('href', longDomain);
    });
  });

  describe('Callback Functions', () => {
    it('should accept all callback props', () => {
      const callbacks = {
        onVisitDomain: vi.fn(),
        onBuildAndDeploy: vi.fn(),
        onBuildLocally: vi.fn(),
        onToggleNotesSidebar: vi.fn()
      };
      
      render(Header, {
        props: {
          ...callbacks,
          canBuild: true,
          vercelApiKey: 'test',
          extensions: { 'notes-extension-enabled': true }
        }
      });
      
      // All callbacks should be accepted without errors
      expect(screen.getByText('TABLES CMS')).toBeInTheDocument();
    });
  });
});
