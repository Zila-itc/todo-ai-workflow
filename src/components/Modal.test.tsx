import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Modal, ModalFooter } from './Modal';

// Mock lucide-react
jest.mock('lucide-react', () => ({
  X: () => <div data-testid="close-icon">X</div>,
}));

describe('Modal Component', () => {
  const defaultProps = {
    isOpen: true,
    onClose: jest.fn(),
    children: <div>Modal content</div>,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    // Reset body overflow style
    document.body.style.overflow = 'unset';
  });

  it('renders when isOpen is true', () => {
    render(<Modal {...defaultProps} />);
    expect(screen.getByText('Modal content')).toBeInTheDocument();
  });

  it('does not render when isOpen is false', () => {
    render(<Modal {...defaultProps} isOpen={false} />);
    expect(screen.queryByText('Modal content')).not.toBeInTheDocument();
  });

  it('renders with title', () => {
    render(<Modal {...defaultProps} title="Test Modal" />);
    expect(screen.getByText('Test Modal')).toBeInTheDocument();
    expect(screen.getByText('Test Modal')).toHaveClass('text-lg', 'font-semibold');
  });

  it('renders close button by default', () => {
    render(<Modal {...defaultProps} />);
    const closeButton = screen.getByRole('button');
    expect(closeButton).toBeInTheDocument();
    expect(screen.getByTestId('close-icon')).toBeInTheDocument();
  });

  it('hides close button when showCloseButton is false', () => {
    render(<Modal {...defaultProps} showCloseButton={false} />);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', () => {
    const onClose = jest.fn();
    render(<Modal {...defaultProps} onClose={onClose} />);
    const closeButton = screen.getByRole('button');
    fireEvent.click(closeButton);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when backdrop is clicked', () => {
    const onClose = jest.fn();
    render(<Modal {...defaultProps} onClose={onClose} />);
    const backdrop = document.querySelector('.bg-black.bg-opacity-50');
    fireEvent.click(backdrop!);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('does not call onClose when modal content is clicked', () => {
    const onClose = jest.fn();
    render(<Modal {...defaultProps} onClose={onClose} />);
    const modalContent = screen.getByText('Modal content');
    fireEvent.click(modalContent);
    expect(onClose).not.toHaveBeenCalled();
  });

  it('calls onClose when Escape key is pressed', async () => {
    const onClose = jest.fn();
    render(<Modal {...defaultProps} onClose={onClose} />);
    fireEvent.keyDown(document, { key: 'Escape' });
    await waitFor(() => {
      expect(onClose).toHaveBeenCalledTimes(1);
    });
  });

  it('does not call onClose when other keys are pressed', () => {
    const onClose = jest.fn();
    render(<Modal {...defaultProps} onClose={onClose} />);
    fireEvent.keyDown(document, { key: 'Enter' });
    fireEvent.keyDown(document, { key: 'Space' });
    expect(onClose).not.toHaveBeenCalled();
  });

  it('sets body overflow to hidden when open', () => {
    render(<Modal {...defaultProps} />);
    expect(document.body.style.overflow).toBe('hidden');
  });

  it('resets body overflow when closed', () => {
    const { rerender } = render(<Modal {...defaultProps} />);
    expect(document.body.style.overflow).toBe('hidden');
    
    rerender(<Modal {...defaultProps} isOpen={false} />);
    expect(document.body.style.overflow).toBe('unset');
  });

  it('applies small size class', () => {
    render(<Modal {...defaultProps} size="sm" />);
    const modal = document.querySelector('.max-w-md');
    expect(modal).toBeInTheDocument();
  });

  it('applies medium size class (default)', () => {
    render(<Modal {...defaultProps} />);
    const modal = document.querySelector('.max-w-lg');
    expect(modal).toBeInTheDocument();
  });

  it('applies large size class', () => {
    render(<Modal {...defaultProps} size="lg" />);
    const modal = document.querySelector('.max-w-2xl');
    expect(modal).toBeInTheDocument();
  });

  it('applies extra large size class', () => {
    render(<Modal {...defaultProps} size="xl" />);
    const modal = document.querySelector('.max-w-4xl');
    expect(modal).toBeInTheDocument();
  });

  it('renders header when title is provided', () => {
    render(<Modal {...defaultProps} title="Test Title" />);
    const header = document.querySelector('.border-b');
    expect(header).toBeInTheDocument();
    expect(header).toHaveClass('flex', 'items-center', 'justify-between', 'p-4');
  });

  it('renders header when showCloseButton is true (default)', () => {
    render(<Modal {...defaultProps} />);
    const header = document.querySelector('.border-b');
    expect(header).toBeInTheDocument();
  });

  it('does not render header when no title and showCloseButton is false', () => {
    render(<Modal {...defaultProps} showCloseButton={false} />);
    const header = document.querySelector('.border-b');
    expect(header).not.toBeInTheDocument();
  });

  it('has proper z-index for overlay', () => {
    render(<Modal {...defaultProps} />);
    const overlay = document.querySelector('.fixed.inset-0.z-50');
    expect(overlay).toBeInTheDocument();
    expect(overlay).toHaveClass('z-50');
  });

  it('has proper backdrop styling', () => {
    render(<Modal {...defaultProps} />);
    const backdrop = document.querySelector('.bg-black.bg-opacity-50');
    expect(backdrop).toBeInTheDocument();
    expect(backdrop).toHaveClass('fixed', 'inset-0', 'transition-opacity');
  });

  it('centers modal content', () => {
    render(<Modal {...defaultProps} />);
    const container = document.querySelector('.flex.min-h-full');
    expect(container).toBeInTheDocument();
    expect(container).toHaveClass('items-center', 'justify-center', 'p-4');
  });

  it('cleans up event listeners on unmount', () => {
    const removeEventListenerSpy = jest.spyOn(document, 'removeEventListener');
    const { unmount } = render(<Modal {...defaultProps} />);
    
    unmount();
    
    expect(removeEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function));
    expect(document.body.style.overflow).toBe('unset');
    
    removeEventListenerSpy.mockRestore();
  });
});

describe('ModalFooter Component', () => {
  it('renders children correctly', () => {
    render(
      <ModalFooter>
        <button>Cancel</button>
        <button>Save</button>
      </ModalFooter>
    );
    expect(screen.getByText('Cancel')).toBeInTheDocument();
    expect(screen.getByText('Save')).toBeInTheDocument();
  });

  it('applies default classes', () => {
    const { container } = render(
      <ModalFooter>
        <button>Action</button>
      </ModalFooter>
    );
    const footer = container.firstChild as HTMLElement;
    expect(footer).toHaveClass(
      'flex',
      'items-center',
      'justify-end',
      'space-x-2',
      'p-4',
      'border-t'
    );
  });

  it('applies custom className', () => {
    const { container } = render(
      <ModalFooter className="custom-footer">
        <button>Action</button>
      </ModalFooter>
    );
    const footer = container.firstChild as HTMLElement;
    expect(footer).toHaveClass('custom-footer');
  });

  it('maintains default classes when custom className is provided', () => {
    const { container } = render(
      <ModalFooter className="custom-footer">
        <button>Action</button>
      </ModalFooter>
    );
    const footer = container.firstChild as HTMLElement;
    expect(footer).toHaveClass('flex', 'items-center', 'custom-footer');
  });
});

describe('Modal Integration', () => {
  it('renders complete modal with footer', () => {
    render(
      <Modal isOpen={true} onClose={jest.fn()} title="Complete Modal">
        <div>Modal body content</div>
        <ModalFooter>
          <button>Cancel</button>
          <button>Confirm</button>
        </ModalFooter>
      </Modal>
    );

    expect(screen.getByText('Complete Modal')).toBeInTheDocument();
    expect(screen.getByText('Modal body content')).toBeInTheDocument();
    expect(screen.getByText('Cancel')).toBeInTheDocument();
    expect(screen.getByText('Confirm')).toBeInTheDocument();
  });
});