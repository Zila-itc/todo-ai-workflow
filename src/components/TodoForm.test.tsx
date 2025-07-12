import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TodoForm } from './TodoForm';
import { Todo } from '@/types/todo';
import { useTodoStore } from '@/store/todoStore';

// Mock the store
jest.mock('@/store/todoStore');

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
  Plus: ({ className }: { className?: string }) => <div data-testid="plus-icon" className={className} />,
  X: ({ className }: { className?: string }) => <div data-testid="x-icon" className={className} />,
}));

const mockUseTodoStore = useTodoStore as jest.MockedFunction<typeof useTodoStore>;

const mockTodoStore = {
  addTodo: jest.fn(),
  updateTodo: jest.fn(),
  loading: false,
};

const mockTodo: Todo = {
  id: '1',
  title: 'Test Todo',
  description: 'Test Description',
  completed: false,
  priority: 'high',
  tags: ['work', 'urgent'],
  dueDate: new Date('2024-12-31'),
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
};

const defaultProps = {
  isOpen: true,
  onClose: jest.fn(),
  mode: 'add' as const,
};

describe('TodoForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseTodoStore.mockReturnValue(mockTodoStore as any);
    // Mock current date to ensure consistent testing
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2024-06-15'));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should render add todo form', () => {
    render(<TodoForm {...defaultProps} />);

    expect(screen.getByText('Add New Todo')).toBeInTheDocument();
    expect(screen.getByLabelText('Title')).toBeInTheDocument();
    expect(screen.getByLabelText('Description')).toBeInTheDocument();
    expect(screen.getByLabelText('Priority')).toBeInTheDocument();
    expect(screen.getByLabelText('Due Date')).toBeInTheDocument();
    expect(screen.getByText('Tags')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Add Todo' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
  });

  it('should render edit todo form with pre-filled data', () => {
    render(<TodoForm {...defaultProps} todo={mockTodo} mode="edit" />);

    expect(screen.getByText('Edit Todo')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Test Todo')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Test Description')).toBeInTheDocument();
    expect(screen.getByDisplayValue('high')).toBeInTheDocument();
    expect(screen.getByDisplayValue('2024-12-31')).toBeInTheDocument();
    expect(screen.getByText('#work')).toBeInTheDocument();
    expect(screen.getByText('#urgent')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Update Todo' })).toBeInTheDocument();
  });

  it('should initialize form with empty values for add mode', () => {
    render(<TodoForm {...defaultProps} />);

    expect(screen.getByLabelText('Title')).toHaveValue('');
    expect(screen.getByLabelText('Description')).toHaveValue('');
    expect(screen.getByLabelText('Priority')).toHaveValue('medium');
    expect(screen.getByLabelText('Due Date')).toHaveValue('');
  });

  it('should handle title input change', async () => {
    const user = userEvent.setup();
    render(<TodoForm {...defaultProps} />);

    const titleInput = screen.getByLabelText('Title');
    await user.type(titleInput, 'New Todo Title');

    expect(titleInput).toHaveValue('New Todo Title');
  });

  it('should handle description input change', async () => {
    const user = userEvent.setup();
    render(<TodoForm {...defaultProps} />);

    const descriptionInput = screen.getByLabelText('Description');
    await user.type(descriptionInput, 'New description');

    expect(descriptionInput).toHaveValue('New description');
  });

  it('should handle priority selection change', async () => {
    const user = userEvent.setup();
    render(<TodoForm {...defaultProps} />);

    const prioritySelect = screen.getByLabelText('Priority');
    await user.selectOptions(prioritySelect, 'high');

    expect(prioritySelect).toHaveValue('high');
  });

  it('should handle due date input change', async () => {
    const user = userEvent.setup();
    render(<TodoForm {...defaultProps} />);

    const dueDateInput = screen.getByLabelText('Due Date');
    await user.type(dueDateInput, '2024-12-25');

    expect(dueDateInput).toHaveValue('2024-12-25');
  });

  it('should add tags when clicking add button', async () => {
    const user = userEvent.setup();
    render(<TodoForm {...defaultProps} />);

    const tagInput = screen.getByPlaceholderText('Add a tag...');
    const addButton = screen.getByTestId('plus-icon').closest('button');

    await user.type(tagInput, 'work');
    await user.click(addButton!);

    expect(screen.getByText('#work')).toBeInTheDocument();
    expect(tagInput).toHaveValue('');
  });

  it('should add tags when pressing Enter', async () => {
    const user = userEvent.setup();
    render(<TodoForm {...defaultProps} />);

    const tagInput = screen.getByPlaceholderText('Add a tag...');
    await user.type(tagInput, 'urgent{enter}');

    expect(screen.getByText('#urgent')).toBeInTheDocument();
    expect(tagInput).toHaveValue('');
  });

  it('should not add duplicate tags', async () => {
    const user = userEvent.setup();
    render(<TodoForm {...defaultProps} />);

    const tagInput = screen.getByPlaceholderText('Add a tag...');
    const addButton = screen.getByTestId('plus-icon').closest('button');

    // Add first tag
    await user.type(tagInput, 'work');
    await user.click(addButton!);

    // Try to add same tag again
    await user.type(tagInput, 'work');
    await user.click(addButton!);

    const workTags = screen.getAllByText('#work');
    expect(workTags).toHaveLength(1);
  });

  it('should convert tags to lowercase', async () => {
    const user = userEvent.setup();
    render(<TodoForm {...defaultProps} />);

    const tagInput = screen.getByPlaceholderText('Add a tag...');
    const addButton = screen.getByTestId('plus-icon').closest('button');

    await user.type(tagInput, 'WORK');
    await user.click(addButton!);

    expect(screen.getByText('#work')).toBeInTheDocument();
  });

  it('should remove tags when clicking X button', async () => {
    const user = userEvent.setup();
    render(<TodoForm {...defaultProps} todo={mockTodo} mode="edit" />);

    const removeButton = screen.getAllByTestId('x-icon')[0].closest('button');
    await user.click(removeButton!);

    expect(screen.queryByText('#work')).not.toBeInTheDocument();
    expect(screen.getByText('#urgent')).toBeInTheDocument();
  });

  it('should disable add tag button when input is empty', () => {
    render(<TodoForm {...defaultProps} />);

    const addButton = screen.getByTestId('plus-icon').closest('button');
    expect(addButton).toBeDisabled();
  });

  it('should enable add tag button when input has value', async () => {
    const user = userEvent.setup();
    render(<TodoForm {...defaultProps} />);

    const tagInput = screen.getByPlaceholderText('Add a tag...');
    const addButton = screen.getByTestId('plus-icon').closest('button');

    await user.type(tagInput, 'work');
    expect(addButton).not.toBeDisabled();
  });

  it('should validate required title field', async () => {
    const user = userEvent.setup();
    render(<TodoForm {...defaultProps} />);

    const submitButton = screen.getByRole('button', { name: 'Add Todo' });
    await user.click(submitButton);

    expect(screen.getByText('Title is required')).toBeInTheDocument();
    expect(mockTodoStore.addTodo).not.toHaveBeenCalled();
  });

  it('should validate due date is not in the past', async () => {
    const user = userEvent.setup();
    render(<TodoForm {...defaultProps} />);

    const titleInput = screen.getByLabelText('Title');
    const dueDateInput = screen.getByLabelText('Due Date');
    const submitButton = screen.getByRole('button', { name: 'Add Todo' });

    await user.type(titleInput, 'Test Todo');
    await user.type(dueDateInput, '2024-01-01'); // Past date
    await user.click(submitButton);

    expect(screen.getByText('Due date cannot be in the past')).toBeInTheDocument();
    expect(mockTodoStore.addTodo).not.toHaveBeenCalled();
  });

  it('should clear errors when user starts typing', async () => {
    const user = userEvent.setup();
    render(<TodoForm {...defaultProps} />);

    const titleInput = screen.getByLabelText('Title');
    const submitButton = screen.getByRole('button', { name: 'Add Todo' });

    // Trigger validation error
    await user.click(submitButton);
    expect(screen.getByText('Title is required')).toBeInTheDocument();

    // Start typing to clear error
    await user.type(titleInput, 'T');
    expect(screen.queryByText('Title is required')).not.toBeInTheDocument();
  });

  it('should submit form with valid data in add mode', async () => {
    const user = userEvent.setup();
    mockTodoStore.addTodo.mockImplementation(() => Promise.resolve());
    const onClose = jest.fn();

    render(<TodoForm {...defaultProps} onClose={onClose} />);

    const titleInput = screen.getByLabelText('Title');
    const descriptionInput = screen.getByLabelText('Description');
    const prioritySelect = screen.getByLabelText('Priority');
    const dueDateInput = screen.getByLabelText('Due Date');
    const submitButton = screen.getByRole('button', { name: 'Add Todo' });

    await user.type(titleInput, 'New Todo');
    await user.type(descriptionInput, 'New Description');
    await user.selectOptions(prioritySelect, 'high');
    await user.type(dueDateInput, '2024-12-25');

    await user.click(submitButton);

    await waitFor(() => {
      expect(mockTodoStore.addTodo).toHaveBeenCalledWith({
        title: 'New Todo',
        description: 'New Description',
        priority: 'high',
        dueDate: new Date('2024-12-25'),
        tags: [],
        completed: false,
      });
    });
    
    await waitFor(() => {
      expect(onClose).toHaveBeenCalled();
    }, { timeout: 5000 });
  });

  it('should submit form with valid data in edit mode', async () => {
    const user = userEvent.setup();
    mockTodoStore.updateTodo.mockImplementation(() => Promise.resolve());
    const onClose = jest.fn();

    render(<TodoForm {...defaultProps} todo={mockTodo} mode="edit" onClose={onClose} />);

    const titleInput = screen.getByLabelText('Title');
    const submitButton = screen.getByRole('button', { name: 'Update Todo' });

    await user.clear(titleInput);
    await user.type(titleInput, 'Updated Todo');
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockTodoStore.updateTodo).toHaveBeenCalledWith('1', {
        title: 'Updated Todo',
        description: 'Test Description',
        priority: 'high',
        dueDate: new Date('2024-12-31'),
        tags: ['work', 'urgent'],
        completed: false,
      });
    });
    
    await waitFor(() => {
      expect(onClose).toHaveBeenCalled();
    }, { timeout: 5000 });
  });

  it('should handle form submission with empty description', async () => {
    const user = userEvent.setup();
    mockTodoStore.addTodo.mockImplementation(() => Promise.resolve());

    render(<TodoForm {...defaultProps} />);

    const titleInput = screen.getByLabelText('Title');
    const submitButton = screen.getByRole('button', { name: 'Add Todo' });

    await user.type(titleInput, 'New Todo');
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockTodoStore.addTodo).toHaveBeenCalledWith({
        title: 'New Todo',
        description: undefined,
        priority: 'medium',
        dueDate: undefined,
        tags: [],
        completed: false,
      });
    }, { timeout: 5000 });
  });

  it('should handle form submission with tags', async () => {
    const user = userEvent.setup();
    mockTodoStore.addTodo.mockResolvedValue(undefined);

    render(<TodoForm {...defaultProps} />);

    const titleInput = screen.getByLabelText('Title');
    const tagInput = screen.getByPlaceholderText('Add a tag...');
    const addButton = screen.getByTestId('plus-icon').closest('button');
    const submitButton = screen.getByRole('button', { name: 'Add Todo' });

    await user.type(titleInput, 'New Todo');
    await user.type(tagInput, 'work');
    await user.click(addButton!);
    await user.type(tagInput, 'urgent');
    await user.click(addButton!);
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockTodoStore.addTodo).toHaveBeenCalledWith({
        title: 'New Todo',
        description: undefined,
        priority: 'medium',
        dueDate: undefined,
        tags: ['work', 'urgent'],
        completed: false,
      });
    });
  });

  it('should handle cancel button click', async () => {
    const user = userEvent.setup();
    const onClose = jest.fn();

    render(<TodoForm {...defaultProps} onClose={onClose} />);

    const cancelButton = screen.getByRole('button', { name: 'Cancel' });
    await user.click(cancelButton);

    expect(onClose).toHaveBeenCalled();
  });

  it('should disable form when loading', () => {
    mockUseTodoStore.mockReturnValue({ ...mockTodoStore, loading: true } as any);

    render(<TodoForm {...defaultProps} />);

    const submitButton = screen.getByRole('button', { name: 'Add Todo' });
    const cancelButton = screen.getByRole('button', { name: 'Cancel' });

    expect(submitButton).toBeDisabled();
    expect(cancelButton).toBeDisabled();
  });

  it('should show loading state on submit button', () => {
    mockUseTodoStore.mockReturnValue({ ...mockTodoStore, loading: true } as any);

    render(<TodoForm {...defaultProps} />);

    const submitButton = screen.getByRole('button', { name: 'Add Todo' });
    expect(submitButton).toHaveAttribute('disabled');
  });

  it('should reset form when modal is reopened', () => {
    const { rerender } = render(<TodoForm {...defaultProps} isOpen={false} />);

    // Open modal with data
    rerender(<TodoForm {...defaultProps} isOpen={true} />);

    const titleInput = screen.getByLabelText('Title');
    fireEvent.change(titleInput, { target: { value: 'Test' } });

    // Close and reopen modal
    rerender(<TodoForm {...defaultProps} isOpen={false} />);
    rerender(<TodoForm {...defaultProps} isOpen={true} />);

    expect(screen.getByLabelText('Title')).toHaveValue('');
  });

  it('should handle form submission error gracefully', async () => {
    const user = userEvent.setup();
    const consoleError = jest.spyOn(console, 'error').mockImplementation();
    mockTodoStore.addTodo.mockImplementation(() => Promise.reject(new Error('Network error')));

    render(<TodoForm {...defaultProps} />);

    const titleInput = screen.getByLabelText('Title');
    const submitButton = screen.getByRole('button', { name: 'Add Todo' });

    await user.type(titleInput, 'New Todo');
    await user.click(submitButton);

    await waitFor(() => {
      expect(consoleError).toHaveBeenCalledWith('Failed to save todo:', expect.any(Error));
    }, { timeout: 5000 });

    consoleError.mockRestore();
  });

  it('should trim whitespace from title and description', async () => {
    const user = userEvent.setup();
    mockTodoStore.addTodo.mockImplementation(() => Promise.resolve());

    render(<TodoForm {...defaultProps} />);

    const titleInput = screen.getByLabelText('Title');
    const descriptionInput = screen.getByLabelText('Description');
    const submitButton = screen.getByRole('button', { name: 'Add Todo' });

    await user.type(titleInput, '  New Todo  ');
    await user.type(descriptionInput, '  New Description  ');
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockTodoStore.addTodo).toHaveBeenCalledWith({
        title: 'New Todo',
        description: 'New Description',
        priority: 'medium',
        dueDate: undefined,
        tags: [],
        completed: false,
      });
    }, { timeout: 5000 });
  });

  it('should preserve completed status in edit mode', async () => {
    const user = userEvent.setup();
    const completedTodo = { ...mockTodo, completed: true };
    mockTodoStore.updateTodo.mockImplementation(() => Promise.resolve());

    render(<TodoForm {...defaultProps} todo={completedTodo} mode="edit" />);

    const submitButton = screen.getByRole('button', { name: 'Update Todo' });
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockTodoStore.updateTodo).toHaveBeenCalledWith('1', expect.objectContaining({
        completed: true,
      }));
    }, { timeout: 5000 });
  });
});