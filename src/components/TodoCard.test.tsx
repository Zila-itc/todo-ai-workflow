import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { TodoCard } from './TodoCard';
import { Todo } from '@/types/todo';
import { useTodoStore } from '@/store/todoStore';
import { useUIStore } from '@/store/uiStore';

// Mock the stores
jest.mock('@/store/todoStore');
jest.mock('@/store/uiStore');

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
  Calendar: ({ className }: { className?: string }) => <div data-testid="calendar-icon" className={className} />,
  Edit: ({ className }: { className?: string }) => <div data-testid="edit-icon" className={className} />,
  Trash2: ({ className }: { className?: string }) => <div data-testid="trash-icon" className={className} />,
  CheckCircle: ({ className }: { className?: string }) => <div data-testid="check-circle-icon" className={className} />,
  Circle: ({ className }: { className?: string }) => <div data-testid="circle-icon" className={className} />,
  AlertCircle: ({ className }: { className?: string }) => <div data-testid="alert-circle-icon" className={className} />,
  Flag: ({ className }: { className?: string }) => <div data-testid="flag-icon" className={className} />,
}));

const mockUseTodoStore = useTodoStore as jest.MockedFunction<typeof useTodoStore>;
const mockUseUIStore = useUIStore as jest.MockedFunction<typeof useUIStore>;

const mockTodoStore = {
  toggleTodo: jest.fn(),
};

const mockUIStore = {
  openEditTodoModal: jest.fn(),
  openDeleteConfirmModal: jest.fn(),
  isBulkMode: false,
};

const mockTodo: Todo = {
  id: '1',
  title: 'Test Todo',
  description: 'Test Description',
  completed: false,
  priority: 'medium',
  tags: ['work', 'urgent'],
  dueDate: new Date('2024-12-31'),
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
};

describe('TodoCard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseTodoStore.mockReturnValue(mockTodoStore as any);
    mockUseUIStore.mockReturnValue(mockUIStore as any);
  });

  it('should render todo card with basic information', () => {
    render(<TodoCard todo={mockTodo} />);

    expect(screen.getByText('Test Todo')).toBeInTheDocument();
    expect(screen.getByText('Test Description')).toBeInTheDocument();
    expect(screen.getByText('Medium')).toBeInTheDocument();
    expect(screen.getByText('work, urgent')).toBeInTheDocument();
    expect(screen.getByTestId('circle-icon')).toBeInTheDocument();
  });

  it('should render completed todo with proper styling', () => {
    const completedTodo = { ...mockTodo, completed: true };
    render(<TodoCard todo={completedTodo} />);

    expect(screen.getByText('Test Todo')).toHaveClass('line-through');
    expect(screen.getByText('Test Description')).toHaveClass('line-through');
    expect(screen.getByTestId('check-circle-icon')).toBeInTheDocument();
  });

  it('should render todo without description', () => {
    const todoWithoutDescription = { ...mockTodo, description: '' };
    render(<TodoCard todo={todoWithoutDescription} />);

    expect(screen.getByText('Test Todo')).toBeInTheDocument();
    expect(screen.queryByText('Test Description')).not.toBeInTheDocument();
  });

  it('should render todo without tags', () => {
    const todoWithoutTags = { ...mockTodo, tags: [] };
    render(<TodoCard todo={todoWithoutTags} />);

    expect(screen.getByText('Test Todo')).toBeInTheDocument();
    expect(screen.queryByText('work, urgent')).not.toBeInTheDocument();
    expect(screen.queryByText('#')).not.toBeInTheDocument();
  });

  it('should render todo without due date', () => {
    const todoWithoutDueDate = { ...mockTodo, dueDate: undefined };
    render(<TodoCard todo={todoWithoutDueDate} />);

    expect(screen.getByText('Test Todo')).toBeInTheDocument();
    expect(screen.queryByTestId('calendar-icon')).not.toBeInTheDocument();
  });

  it('should display priority colors correctly', () => {
    const { rerender } = render(<TodoCard todo={{ ...mockTodo, priority: 'low' }} />);
    expect(screen.getByTestId('flag-icon')).toHaveClass('text-green-600');

    rerender(<TodoCard todo={{ ...mockTodo, priority: 'medium' }} />);
    expect(screen.getByTestId('flag-icon')).toHaveClass('text-yellow-600');

    rerender(<TodoCard todo={{ ...mockTodo, priority: 'high' }} />);
    expect(screen.getByTestId('flag-icon')).toHaveClass('text-red-600');
  });

  it('should show overdue indicator for overdue todos', () => {
    const overdueTodo = {
      ...mockTodo,
      dueDate: new Date('2020-01-01'), // Past date
      completed: false,
    };
    render(<TodoCard todo={overdueTodo} />);

    expect(screen.getByTestId('alert-circle-icon')).toBeInTheDocument();
    expect(screen.getByTestId('calendar-icon')).toHaveClass('text-red-600');
  });

  it('should not show overdue indicator for completed overdue todos', () => {
    const completedOverdueTodo = {
      ...mockTodo,
      dueDate: new Date('2020-01-01'), // Past date
      completed: true,
    };
    render(<TodoCard todo={completedOverdueTodo} />);

    expect(screen.queryByTestId('alert-circle-icon')).not.toBeInTheDocument();
  });

  it('should handle toggle completion', () => {
    render(<TodoCard todo={mockTodo} />);

    const toggleButton = screen.getByTestId('circle-icon').closest('button');
    fireEvent.click(toggleButton!);

    expect(mockTodoStore.toggleTodo).toHaveBeenCalledWith('1');
  });

  it('should handle edit action', () => {
    render(<TodoCard todo={mockTodo} />);

    const editButton = screen.getByTestId('edit-icon').closest('button');
    fireEvent.click(editButton!);

    expect(mockUIStore.openEditTodoModal).toHaveBeenCalledWith('1');
  });

  it('should handle delete action', () => {
    render(<TodoCard todo={mockTodo} />);

    const deleteButton = screen.getByTestId('trash-icon').closest('button');
    fireEvent.click(deleteButton!);

    expect(mockUIStore.openDeleteConfirmModal).toHaveBeenCalledWith('1');
  });

  it('should prevent event propagation on action buttons', () => {
    const onSelect = jest.fn();
    mockUseUIStore.mockReturnValue({ ...mockUIStore, isBulkMode: true } as any);

    render(<TodoCard todo={mockTodo} onSelect={onSelect} />);

    const toggleButton = screen.getByTestId('circle-icon').closest('button');
    fireEvent.click(toggleButton!);

    expect(mockTodoStore.toggleTodo).toHaveBeenCalledWith('1');
    expect(onSelect).not.toHaveBeenCalled();
  });

  it('should render in bulk mode without action buttons', () => {
    mockUseUIStore.mockReturnValue({ ...mockUIStore, isBulkMode: true } as any);

    render(<TodoCard todo={mockTodo} />);

    expect(screen.queryByTestId('edit-icon')).not.toBeInTheDocument();
    expect(screen.queryByTestId('trash-icon')).not.toBeInTheDocument();
  });

  it('should render bulk selection indicator in bulk mode', () => {
    mockUseUIStore.mockReturnValue({ ...mockUIStore, isBulkMode: true } as any);

    render(<TodoCard todo={mockTodo} isSelected={false} />);

    const selectionIndicator = screen.getByRole('generic', { hidden: true });
    expect(selectionIndicator).toHaveClass('border-gray-300');
  });

  it('should render selected state in bulk mode', () => {
    mockUseUIStore.mockReturnValue({ ...mockUIStore, isBulkMode: true } as any);

    render(<TodoCard todo={mockTodo} isSelected={true} />);

    expect(screen.getByTestId('check-circle-icon')).toBeInTheDocument();
  });

  it('should handle card click in bulk mode', () => {
    const onSelect = jest.fn();
    mockUseUIStore.mockReturnValue({ ...mockUIStore, isBulkMode: true } as any);

    render(<TodoCard todo={mockTodo} onSelect={onSelect} />);

    const card = screen.getByText('Test Todo').closest('[role="generic"]');
    fireEvent.click(card!);

    expect(onSelect).toHaveBeenCalledWith('1');
  });

  it('should not handle card click when not in bulk mode', () => {
    const onSelect = jest.fn();
    render(<TodoCard todo={mockTodo} onSelect={onSelect} />);

    const card = screen.getByText('Test Todo').closest('[role="generic"]');
    fireEvent.click(card!);

    expect(onSelect).not.toHaveBeenCalled();
  });

  it('should apply correct CSS classes for selected state', () => {
    render(<TodoCard todo={mockTodo} isSelected={true} />);

    const card = screen.getByText('Test Todo').closest('[role="generic"]');
    expect(card).toHaveClass('ring-2', 'ring-blue-500', 'border-blue-500');
  });

  it('should apply correct CSS classes for overdue state', () => {
    const overdueTodo = {
      ...mockTodo,
      dueDate: new Date('2020-01-01'),
      completed: false,
    };
    render(<TodoCard todo={overdueTodo} />);

    const card = screen.getByText('Test Todo').closest('[role="generic"]');
    expect(card).toHaveClass('border-red-300');
  });

  it('should apply correct CSS classes for completed state', () => {
    const completedTodo = { ...mockTodo, completed: true };
    render(<TodoCard todo={completedTodo} />);

    const card = screen.getByText('Test Todo').closest('[role="generic"]');
    expect(card).toHaveClass('opacity-75');
  });

  it('should apply hover styles in bulk mode', () => {
    mockUseUIStore.mockReturnValue({ ...mockUIStore, isBulkMode: true } as any);

    render(<TodoCard todo={mockTodo} />);

    const card = screen.getByText('Test Todo').closest('[role="generic"]');
    expect(card).toHaveClass('cursor-pointer');
  });

  it('should format due date correctly', () => {
    const todoWithDueDate = {
      ...mockTodo,
      dueDate: new Date('2024-12-25'),
    };
    render(<TodoCard todo={todoWithDueDate} />);

    expect(screen.getByText('12/25/2024')).toBeInTheDocument();
  });

  it('should handle todos with single tag', () => {
    const todoWithSingleTag = { ...mockTodo, tags: ['work'] };
    render(<TodoCard todo={todoWithSingleTag} />);

    expect(screen.getByText('work')).toBeInTheDocument();
    expect(screen.getByText('#')).toBeInTheDocument();
  });

  it('should handle todos with multiple tags', () => {
    const todoWithMultipleTags = { ...mockTodo, tags: ['work', 'urgent', 'important'] };
    render(<TodoCard todo={todoWithMultipleTags} />);

    expect(screen.getByText('work, urgent, important')).toBeInTheDocument();
  });

  it('should render priority text with proper capitalization', () => {
    const { rerender } = render(<TodoCard todo={{ ...mockTodo, priority: 'low' }} />);
    expect(screen.getByText('Low')).toBeInTheDocument();

    rerender(<TodoCard todo={{ ...mockTodo, priority: 'medium' }} />);
    expect(screen.getByText('Medium')).toBeInTheDocument();

    rerender(<TodoCard todo={{ ...mockTodo, priority: 'high' }} />);
    expect(screen.getByText('High')).toBeInTheDocument();
  });
});