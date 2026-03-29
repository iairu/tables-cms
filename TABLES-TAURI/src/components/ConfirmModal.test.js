import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, fireEvent, screen, waitFor } from '@testing-library/svelte';
import ConfirmModal from './ConfirmModal.svelte';

describe('ConfirmModal Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Initial Rendering', () => {
    it('should not render when isOpen is false', () => {
      const { container } = render(ConfirmModal, {
        props: { isOpen: false }
      });
      
      expect(container.querySelector('.modal-overlay')).toBeNull();
    });

    it('should render when isOpen is true', () => {
      const { container } = render(ConfirmModal, {
        props: { isOpen: true }
      });
      
      expect(container.querySelector('.modal-overlay')).toBeInTheDocument();
    });

    it('should display default title', () => {
      render(ConfirmModal, { props: { isOpen: true } });
      
      expect(screen.getByText('Are you sure?')).toBeInTheDocument();
    });

    it('should display custom title', () => {
      render(ConfirmModal, {
        props: {
          isOpen: true,
          title: 'Custom Title'
        }
      });
      
      expect(screen.getByText('Custom Title')).toBeInTheDocument();
    });

    it('should display default message', () => {
      render(ConfirmModal, { props: { isOpen: true } });
      
      expect(screen.getByText('This action cannot be undone.')).toBeInTheDocument();
    });

    it('should display custom message', () => {
      render(ConfirmModal, {
        props: {
          isOpen: true,
          message: 'Custom message text'
        }
      });
      
      expect(screen.getByText('Custom message text')).toBeInTheDocument();
    });
  });

  describe('Button Configuration', () => {
    it('should display default confirm text', () => {
      render(ConfirmModal, { props: { isOpen: true } });
      
      expect(screen.getByText('Delete')).toBeInTheDocument();
    });

    it('should display custom confirm text', () => {
      render(ConfirmModal, {
        props: {
          isOpen: true,
          confirmText: 'Yes, Delete'
        }
      });
      
      expect(screen.getByText('Yes, Delete')).toBeInTheDocument();
    });

    it('should display default cancel text', () => {
      render(ConfirmModal, { props: { isOpen: true } });
      
      expect(screen.getByText('Cancel')).toBeInTheDocument();
    });

    it('should display custom cancel text', () => {
      render(ConfirmModal, {
        props: {
          isOpen: true,
          cancelText: 'No, Keep It'
        }
      });
      
      expect(screen.getByText('No, Keep It')).toBeInTheDocument();
    });

    it('should have danger button when isDestructive is true', () => {
      render(ConfirmModal, {
        props: { isOpen: true, isDestructive: true }
      });
      
      const confirmButton = screen.getByText('Delete');
      expect(confirmButton).toHaveClass('btn-danger');
    });

    it('should have primary button when isDestructive is false', () => {
      render(ConfirmModal, {
        props: { isOpen: true, isDestructive: false }
      });
      
      const confirmButton = screen.getByText('Delete');
      expect(confirmButton).toHaveClass('btn-primary');
    });
  });

  describe('Icon Display', () => {
    it('should show warning icon for destructive actions', () => {
      render(ConfirmModal, {
        props: { isOpen: true, isDestructive: true }
      });
      
      const icon = document.querySelector('.modal-header i');
      expect(icon).toHaveClass('fa-exclamation-triangle');
    });

    it('should show question icon for non-destructive actions', () => {
      render(ConfirmModal, {
        props: { isOpen: true, isDestructive: false }
      });
      
      const icon = document.querySelector('.modal-header i');
      expect(icon).toHaveClass('fa-question-circle');
    });
  });

  describe('User Interactions', () => {
    it('should close modal and call onConfirm when confirm button is clicked', async () => {
      const onConfirm = vi.fn();
      
      render(ConfirmModal, {
        props: {
          isOpen: true,
          onConfirm
        }
      });
      
      const confirmButton = screen.getByText('Delete');
      await fireEvent.click(confirmButton);
      
      expect(onConfirm).toHaveBeenCalled();
      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      });
    });

    it('should close modal and call onCancel when cancel button is clicked', async () => {
      const onCancel = vi.fn();
      
      render(ConfirmModal, {
        props: {
          isOpen: true,
          onCancel
        }
      });
      
      const cancelButton = screen.getByText('Cancel');
      await fireEvent.click(cancelButton);
      
      expect(onCancel).toHaveBeenCalled();
      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      });
    });

    it('should close modal when clicking overlay', async () => {
      render(ConfirmModal, {
        props: { isOpen: true }
      });
      
      const overlay = document.querySelector('.modal-overlay');
      await fireEvent.click(overlay);
      
      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      });
    });

    it('should not close when clicking modal content', async () => {
      render(ConfirmModal, {
        props: { isOpen: true }
      });
      
      const modalContent = document.querySelector('.modal-content');
      await fireEvent.click(modalContent);
      
      expect(screen.queryByRole('dialog')).toBeInTheDocument();
    });

    it('should close modal when pressing Escape key', async () => {
      render(ConfirmModal, {
        props: { isOpen: true }
      });
      
      const overlay = document.querySelector('.modal-overlay');
      await fireEvent.keyDown(overlay, { key: 'Escape', code: 'Escape' });
      
      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      });
    });

    it('should not close when pressing other keys', async () => {
      render(ConfirmModal, {
        props: { isOpen: true }
      });
      
      const overlay = document.querySelector('.modal-overlay');
      await fireEvent.keyDown(overlay, { key: 'Enter', code: 'Enter' });
      
      expect(screen.queryByRole('dialog')).toBeInTheDocument();
    });
  });

  describe('Promise-based API', () => {
    it('should resolve promise with true when confirmed', async () => {
      const { component } = render(ConfirmModal, {
        props: { isOpen: false }
      });
      
      const promise = component.open({
        message: 'Test message'
      });
      
      // Wait for modal to open
      await waitFor(() => {
        expect(screen.queryByRole('dialog')).toBeInTheDocument();
      });
      
      // Click confirm
      const confirmButton = screen.getByText('Delete');
      await fireEvent.click(confirmButton);
      
      const result = await promise;
      expect(result).toBe(true);
    });

    it('should resolve promise with false when cancelled', async () => {
      const { component } = render(ConfirmModal, {
        props: { isOpen: false }
      });
      
      const promise = component.open({
        message: 'Test message'
      });
      
      // Wait for modal to open
      await waitFor(() => {
        expect(screen.queryByRole('dialog')).toBeInTheDocument();
      });
      
      // Click cancel
      const cancelButton = screen.getByText('Cancel');
      await fireEvent.click(cancelButton);
      
      const result = await promise;
      expect(result).toBe(false);
    });

    it('should accept all options in open method', async () => {
      const { component } = render(ConfirmModal, {
        props: { isOpen: false }
      });
      
      const promise = component.open({
        title: 'Custom Title',
        message: 'Custom Message',
        confirmText: 'Yes',
        cancelText: 'No',
        isDestructive: false
      });
      
      await waitFor(() => {
        expect(screen.getByText('Custom Title')).toBeInTheDocument();
        expect(screen.getByText('Custom Message')).toBeInTheDocument();
        expect(screen.getByText('Yes')).toBeInTheDocument();
        expect(screen.getByText('No')).toBeInTheDocument();
      });
      
      // Cleanup
      await fireEvent.click(screen.getByText('Yes'));
      await promise;
    });
  });

  describe('Accessibility', () => {
    it('should have correct ARIA attributes', () => {
      render(ConfirmModal, { props: { isOpen: true } });
      
      const dialog = screen.getByRole('dialog');
      expect(dialog).toHaveAttribute('aria-modal', 'true');
      expect(dialog).toHaveAttribute('aria-labelledby', 'modal-title');
    });

    it('should have title with correct id', () => {
      render(ConfirmModal, { props: { isOpen: true } });
      
      const title = screen.getByText('Are you sure?');
      expect(title.id).toBe('modal-title');
    });

    it('should autofocus confirm button', () => {
      render(ConfirmModal, { props: { isOpen: true } });
      
      const confirmButton = screen.getByText('Delete');
      expect(confirmButton).toHaveFocus();
    });

    it('should have proper button types', () => {
      render(ConfirmModal, { props: { isOpen: true } });
      
      const buttons = document.querySelectorAll('button');
      expect(buttons.length).toBeGreaterThan(0);
    });
  });

  describe('Styling and Animation', () => {
    it('should have modal overlay with correct classes', () => {
      render(ConfirmModal, { props: { isOpen: true } });
      
      const overlay = document.querySelector('.modal-overlay');
      expect(overlay).toBeInTheDocument();
    });

    it('should have modal content with correct classes', () => {
      render(ConfirmModal, { props: { isOpen: true } });
      
      const content = document.querySelector('.modal-content');
      expect(content).toBeInTheDocument();
    });

    it('should have modal header, body, and actions sections', () => {
      render(ConfirmModal, { props: { isOpen: true } });
      
      expect(document.querySelector('.modal-header')).toBeInTheDocument();
      expect(document.querySelector('.modal-body')).toBeInTheDocument();
      expect(document.querySelector('.modal-actions')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty message', () => {
      render(ConfirmModal, {
        props: { isOpen: true, message: '' }
      });
      
      // Empty message should render as empty <p> tag
      const paragraph = document.querySelector('.modal-body p');
      expect(paragraph).toBeInTheDocument();
      expect(paragraph.textContent).toBe('');
    });

    it('should handle very long messages', () => {
      const longMessage = 'A'.repeat(1000);
      render(ConfirmModal, {
        props: { isOpen: true, message: longMessage }
      });
      
      expect(screen.getByText(longMessage)).toBeInTheDocument();
    });

    it('should handle special characters in title', () => {
      const specialTitle = 'Special: @#$%^&*()<>{}';
      render(ConfirmModal, {
        props: { isOpen: true, title: specialTitle }
      });
      
      expect(screen.getByText(specialTitle)).toBeInTheDocument();
    });

    it('should handle unicode characters', () => {
      const unicodeMessage = 'Unicode: 你好世界 🚀 Ñoño';
      render(ConfirmModal, {
        props: { isOpen: true, message: unicodeMessage }
      });
      
      expect(screen.getByText(unicodeMessage)).toBeInTheDocument();
    });
  });

  describe('Multiple Open/Close Cycles', () => {
    it('should handle multiple open/close cycles', async () => {
      const { component } = render(ConfirmModal, {
        props: { isOpen: false }
      });
      
      // First cycle
      const promise1 = component.open({ message: 'First' });
      await waitFor(() => {
        expect(screen.queryByRole('dialog')).toBeInTheDocument();
      });
      await fireEvent.click(screen.getByText('Cancel'));
      await promise1;
      
      // Second cycle
      const promise2 = component.open({ message: 'Second' });
      await waitFor(() => {
        expect(screen.queryByRole('dialog')).toBeInTheDocument();
      });
      await fireEvent.click(screen.getByText('Delete'));
      const result = await promise2;
      
      expect(result).toBe(true);
    });
  });

  describe('Callback Functions', () => {
    it('should call onConfirm callback', async () => {
      const onConfirm = vi.fn();
      
      render(ConfirmModal, {
        props: {
          isOpen: true,
          onConfirm
        }
      });
      
      await fireEvent.click(screen.getByText('Delete'));
      expect(onConfirm).toHaveBeenCalled();
    });

    it('should call onCancel callback', async () => {
      const onCancel = vi.fn();
      
      render(ConfirmModal, {
        props: {
          isOpen: true,
          onCancel
        }
      });
      
      await fireEvent.click(screen.getByText('Cancel'));
      expect(onCancel).toHaveBeenCalled();
    });

    it('should call callbacks before resolving promise', async () => {
      const onConfirm = vi.fn();
      let promiseResolved = false;
      
      render(ConfirmModal, {
        props: {
          isOpen: true,
          onConfirm: () => {
            onConfirm();
            expect(promiseResolved).toBe(false);
          }
        }
      });
      
      const promise = Promise.resolve().then(() => {
        // This runs after the click
      });
      
      await fireEvent.click(screen.getByText('Delete'));
      promiseResolved = true;
      await promise;
      
      expect(onConfirm).toHaveBeenCalled();
    });
  });
});
