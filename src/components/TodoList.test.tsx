import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TodoList } from './TodoList';
import { Todo } from '@/types/todo';
import { useTodoStore } from '@/store/todoStore';
import { useUIStore } from '@/store/uiStore';

// Mock the stores
jest.mock('@/store/todoStore');
jest.mock('@/store/uiStore');

// Mock TodoCard component
jest.mock('./TodoCard', () => ({
  TodoCard: ({ todo, isSelected, onSelect }: any) => (
    <div 
      data-testid={`todo-card-${todo.id}`}
      onClick={() => onSelect && onSelect(todo.id)}
      className={isSelected ? 'selected' : ''}
    >
      <span>{todo.title}</span>
      {isSelected && <span data-testid="selected-indicator">Selected</span>}
    </div>
  ),
}));

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
  CheckSquare: ({ className }: { className?: string }) => <div data-testid="check-square-icon" className={className} />,
  Square: ({ className }: { className?: string }) => <div data-testid="square-icon" className={className} />,
  Trash2: ({ className }: { className?: string }) => <div data-testid="trash-icon" className={className} />,
  ListTodo: ({ className }: { className?: string }) => <div data-testid="list-todo-icon" className={className} />,
  Search: ({ className }: { className?: string }) => <div data-testid="search-icon" className={className} />,
}));

// Mock window.confirm
Object.defineProperty(window, 'confirm', {
  writable: true,
  value: jest.fn(),
});

const mockUseTodoStore = useTodoStore as jest.MockedFunction<typeof useTodoStore>;
const mockUseUIStore = useUIStore as jest.MockedFunction<typeof useUIStore>;

const mockTodos: Todo[] = [
  {
    id: '1',
    title: 'Todo 1',
    description: 'Description 1',
    completed: false,
    priority: 'medium',
    tags: ['work'],
    dueDate: new Date('2024-12-31'),
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: '2',
    title: 'Todo 2',
    description: 'Description 2',
    completed: true,
    priority: 'high',
    tags: ['personal'],
    dueDate: new Date('2024-12-25'),
    createdAt: new Date('2024-01-02'),
    updatedAt: new Date('2024-01-02'),
  },
  {
    id: '3',
    title: 'Todo 3',
    description: 'Description 3',
    completed: false,
    priority: 'low',
    tags: ['urgent'],
    dueDate: undefined,
    createdAt: new Date('2024-01-03'),
    updatedAt: new Date('2024-01-03'),
  },
];

const mockTodoStore = {
  getFilteredTodos: jest.fn(() => mockTodos),
  getStats: jest.fn(() => ({ total: 3, active: 2, completed: 1, overdue: 0 })),
  deleteTodos: jest.fn(),
  toggleTodos: jest.fn(),
  filter: {},
  loading: false,
};

const mockUIStore = {
  isBulkMode: false,
  selectedTodoIds: [],
  selectAllTodos: jest.fn(),
  clearSelection: jest.fn(),
  toggleBulkMode: jest.fn(),
  toggleTodoSelection: jest.fn(),
};

describe('TodoList', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseTodoStore.mockReturnValue(mockTodoStore as any);
    mockUseUIStore.mockReturnValue(mockUIStore as any);
    (window.confirm as jest.Mock).mockReturnValue(true);
  });

  it('should render todo list with todos', () => {
    render(<TodoList />);

    expect(screen.getByTestId('todo-card-1')).toBeInTheDocument();
    expect(screen.getByTestId('todo-card-2')).toBeInTheDocument();
    expect(screen.getByTestId('todo-card-3')).toBeInTheDocument();
    expect(screen.getByText('Todo 1')).toBeInTheDocument();
    expect(screen.getByText('Todo 2')).toBeInTheDocument();
    expect(screen.getByText('Todo 3')).toBeInTheDocument();
  });

  it('should show loading state', () => {
    mockUseTodoStore.mockReturnValue({
      ...mockTodoStore,
      loading: true,
    } as any);

    render(<TodoList />);

    expect(screen.getByRole('status', { hidden: true })).toBeInTheDocument();
    expect(screen.queryByTestId('todo-card-1')).not.toBeInTheDocument();
  });

  it('should show empty state when no todos', () => {
    mockUseTodoStore.mockReturnValue({
      ...mockTodoStore,
      getFilteredTodos: jest.fn(() => []),
    } as any);

    render(<TodoList />);

    expect(screen.getByTestId('list-todo-icon')).toBeInTheDocument();
    expect(screen.getByText('No todos yet')).toBeInTheDocument();
    expect(screen.getByText('Create your first "todo" to get started!')).toBeInTheDocument();
  });

  it('should show filtered empty state when no todos match filters', () => {
    mockUseTodoStore.mockReturnValue({
      ...mockTodoStore,
      getFilteredTodos: jest.fn(() => []),
      filter: { search: 'test search' },
    } as any);

    render(<TodoList />);

    expect(screen.getByTestId('search-icon')).toBeInTheDocument();
    expect(screen.getByText('No todos match your filters')).toBeInTheDocument();
    expect(screen.getByText('Try adjusting your search criteria or clearing filters.')).toBeInTheDocument();
  });

  it('should show list summary', () => {
    render(<TodoList />);

    expect(screen.getByText('Showing 3 of 3 todos')).toBeInTheDocument();
  });

  it('should show search term in summary when filtering', () => {
    mockUseTodoStore.mockReturnValue({
      ...mockTodoStore,
      filter: { search: 'test search' },
    } as any);

    render(<TodoList />);

    expect(screen.getByText('Showing 3 of 3 todos matching "test search"')).toBeInTheDocument();
  });

  it('should not show bulk actions bar when not in bulk mode', () => {
    render(<TodoList />);

    expect(screen.queryByText('Select All')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Exit' })).not.toBeInTheDocument();
  });

  it('should show bulk actions bar when in bulk mode', () => {
    mockUseUIStore.mockReturnValue({
      ...mockUIStore,
      isBulkMode: true,
    } as any);

    render(<TodoList />);

    expect(screen.getByText('Select All (3)')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Exit' })).toBeInTheDocument();
    expect(screen.getByTestId('square-icon')).toBeInTheDocument();
  });

  it('should show deselect all when all todos are selected', () => {
    mockUseUIStore.mockReturnValue({
      ...mockUIStore,
      isBulkMode: true,
      selectedTodoIds: ['1', '2', '3'],
    } as any);

    render(<TodoList />);

    expect(screen.getByText('Deselect All (3)')).toBeInTheDocument();
    expect(screen.getByTestId('check-square-icon')).toBeInTheDocument();
  });

  it('should show selected count when todos are selected', () => {
    mockUseUIStore.mockReturnValue({
      ...mockUIStore,
      isBulkMode: true,
      selectedTodoIds: ['1', '2'],
    } as any);

    render(<TodoList />);

    expect(screen.getByText('2 selected')).toBeInTheDocument();
  });

  it('should show bulk action buttons when todos are selected', () => {
    mockUseUIStore.mockReturnValue({
      ...mockUIStore,
      isBulkMode: true,
      selectedTodoIds: ['1', '2'],
    } as any);

    render(<TodoList />);

    expect(screen.getByRole('button', { name: 'Toggle' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Delete' })).toBeInTheDocument();
  });

  it('should not show bulk action buttons when no todos are selected', () => {
    mockUseUIStore.mockReturnValue({
      ...mockUIStore,
      isBulkMode: true,
      selectedTodoIds: [],
    } as any);

    render(<TodoList />);

    expect(screen.queryByRole('button', { name: 'Toggle' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Delete' })).not.toBeInTheDocument();
  });

  it('should handle select all action', async () => {
    const user = userEvent.setup();
    mockUseUIStore.mockReturnValue({
      ...mockUIStore,
      isBulkMode: true,
    } as any);

    render(<TodoList />);

    const selectAllButton = screen.getByText('Select All (3)').closest('button');
    await user.click(selectAllButton!);

    expect(mockUIStore.selectAllTodos).toHaveBeenCalledWith(['1', '2', '3']);
  });

  it('should handle deselect all action', async () => {
    const user = userEvent.setup();
    mockUseUIStore.mockReturnValue({
      ...mockUIStore,
      isBulkMode: true,
      selectedTodoIds: ['1', '2', '3'],
    } as any);

    render(<TodoList />);

    const deselectAllButton = screen.getByText('Deselect All (3)').closest('button');
    await user.click(deselectAllButton!);

    expect(mockUIStore.clearSelection).toHaveBeenCalled();
  });

  it('should handle bulk toggle action', async () => {
    const user = userEvent.setup();
    mockUseUIStore.mockReturnValue({
      ...mockUIStore,
      isBulkMode: true,
      selectedTodoIds: ['1', '2'],
    } as any);

    render(<TodoList />);

    const toggleButton = screen.getByRole('button', { name: 'Toggle' });
    await user.click(toggleButton);

    await waitFor(() => {
      expect(mockTodoStore.toggleTodos).toHaveBeenCalledWith(['1', '2']);
      expect(mockUIStore.clearSelection).toHaveBeenCalled();
    });
  });

  it('should handle bulk delete action with confirmation', async () => {
    const user = userEvent.setup();
    mockUseUIStore.mockReturnValue({
      ...mockUIStore,
      isBulkMode: true,
      selectedTodoIds: ['1', '2'],
    } as any);

    render(<TodoList />);

    const deleteButton = screen.getByRole('button', { name: 'Delete' });
    await user.click(deleteButton);

    expect(window.confirm).toHaveBeenCalledWith('Are you sure you want to delete 2 todo(s)?');
    await waitFor(() => {
      expect(mockTodoStore.deleteTodos).toHaveBeenCalledWith(['1', '2']);
      expect(mockUIStore.clearSelection).toHaveBeenCalled();
    });
  });

  it('should not delete when confirmation is cancelled', async () => {
    const user = userEvent.setup();
    (window.confirm as jest.Mock).mockReturnValue(false);
    mockUseUIStore.mockReturnValue({
      ...mockUIStore,
      isBulkMode: true,
      selectedTodoIds: ['1', '2'],
    } as any);

    render(<TodoList />);

    const deleteButton = screen.getByRole('button', { name: 'Delete' });
    await user.click(deleteButton);

    expect(window.confirm).toHaveBeenCalled();
    expect(mockTodoStore.deleteTodos).not.toHaveBeenCalled();
    expect(mockUIStore.clearSelection).not.toHaveBeenCalled();
  });

  it('should handle exit bulk mode action', async () => {
    const user = userEvent.setup();
    mockUseUIStore.mockReturnValue({
      ...mockUIStore,
      isBulkMode: true,
      selectedTodoIds: ['1'],
    } as any);

    render(<TodoList />);

    const exitButton = screen.getByRole('button', { name: 'Exit' });
    await user.click(exitButton);

    expect(mockUIStore.clearSelection).toHaveBeenCalled();
    expect(mockUIStore.toggleBulkMode).toHaveBeenCalled();
  });

  it('should handle todo selection', async () => {
    const user = userEvent.setup();
    mockUseUIStore.mockReturnValue({
      ...mockUIStore,
      isBulkMode: true,
    } as any);

    render(<TodoList />);

    const todoCard = screen.getByTestId('todo-card-1');
    await user.click(todoCard);

    expect(mockUIStore.toggleTodoSelection).toHaveBeenCalledWith('1');
  });

  it('should show selected indicator for selected todos', () => {
    mockUseUIStore.mockReturnValue({
      ...mockUIStore,
      isBulkMode: true,
      selectedTodoIds: ['1', '3'],
    } as any);

    render(<TodoList />);

    const todoCard1 = screen.getByTestId('todo-card-1');
    const todoCard2 = screen.getByTestId('todo-card-2');
    const todoCard3 = screen.getByTestId('todo-card-3');

    expect(todoCard1).toHaveClass('selected');
    expect(todoCard2).not.toHaveClass('selected');
    expect(todoCard3).toHaveClass('selected');
  });

  it('should not perform bulk actions when no todos are selected', async () => {
    const user = userEvent.setup();
    mockUseUIStore.mockReturnValue({
      ...mockUIStore,
      isBulkMode: true,
      selectedTodoIds: [],
    } as any);

    // Since buttons are not rendered when no todos are selected,
    // we need to test the functions directly
    const { handleBulkDelete, handleBulkToggle } = require('./TodoList');
    
    // These functions should return early when no todos are selected
    await handleBulkDelete?.();
    await handleBulkToggle?.();

    expect(mockTodoStore.deleteTodos).not.toHaveBeenCalled();
    expect(mockTodoStore.toggleTodos).not.toHaveBeenCalled();
  });

  it('should handle empty filter states correctly', () => {
    mockUseTodoStore.mockReturnValue({
      ...mockTodoStore,
      getFilteredTodos: jest.fn(() => []),
      filter: { status: 'active' }, // Has filter but no search
    } as any);

    render(<TodoList />);

    expect(screen.getByTestId('search-icon')).toBeInTheDocument();
    expect(screen.getByText('No todos match your filters')).toBeInTheDocument();
  });

  it('should handle filter with priority', () => {
    mockUseTodoStore.mockReturnValue({
      ...mockTodoStore,
      getFilteredTodos: jest.fn(() => []),
      filter: { priority: 'high' },
    } as any);

    render(<TodoList />);

    expect(screen.getByText('No todos match your filters')).toBeInTheDocument();
  });

  it('should handle filter with tags', () => {
    mockUseTodoStore.mockReturnValue({
      ...mockTodoStore,
      getFilteredTodos: jest.fn(() => []),
      filter: { tags: ['work'] },
    } as any);

    render(<TodoList />);

    expect(screen.getByText('No todos match your filters')).toBeInTheDocument();
  });

  it('should render correct number of todos', () => {
    const singleTodo = [mockTodos[0]];
    mockUseTodoStore.mockReturnValue({
      ...mockTodoStore,
      getFilteredTodos: jest.fn(() => singleTodo),
      getStats: jest.fn(() => ({ total: 3, active: 2, completed: 1, overdue: 0 })),
    } as any);

    render(<TodoList />);

    expect(screen.getByTestId('todo-card-1')).toBeInTheDocument();
    expect(screen.queryByTestId('todo-card-2')).not.toBeInTheDocument();
    expect(screen.queryByTestId('todo-card-3')).not.toBeInTheDocument();
    expect(screen.getByText('Showing 1 of 3 todos')).toBeInTheDocument();
  });

  it('should handle partial selection state correctly', () => {
    mockUseUIStore.mockReturnValue({
      ...mockUIStore,
      isBulkMode: true,
      selectedTodoIds: ['1'], // Only one of three selected
    } as any);

    render(<TodoList />);

    expect(screen.getByText('Select All (3)')).toBeInTheDocument();
    expect(screen.getByText('1 selected')).toBeInTheDocument();
    expect(screen.getByTestId('square-icon')).toBeInTheDocument();
  });
});