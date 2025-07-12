import { act, renderHook } from '@testing-library/react';
import { useTodoStore } from './todoStore';
import { Todo } from '@/types/todo';

// Mock fetch
global.fetch = jest.fn();

const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>;

describe('TodoStore', () => {
  const mockTodo: Todo = {
    id: '1',
    title: 'Test Todo',
    description: 'Test Description',
    completed: false,
    priority: 'medium',
    tags: ['test', 'work'],
    createdAt: new Date('2023-01-01'),
    updatedAt: new Date('2023-01-01'),
    dueDate: new Date('2025-12-31'), // Future date to avoid being overdue
  };

  const mockTodo2: Todo = {
    id: '2',
    title: 'Second Todo',
    description: 'Second Description',
    completed: true,
    priority: 'high',
    tags: ['personal'],
    createdAt: new Date('2023-01-02'),
    updatedAt: new Date('2023-01-02'),
    dueDate: new Date('2023-06-01'),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockFetch.mockClear();
    // Reset store state
    const { result } = renderHook(() => useTodoStore());
    act(() => {
      result.current.clearFilter();
      // Reset todos array
      useTodoStore.setState({ todos: [], loading: false, error: null, editingTodo: null });
    });
  });

  describe('initial state', () => {
    it('has correct initial state', () => {
      const { result } = renderHook(() => useTodoStore());
      
      expect(result.current.todos).toEqual([]);
      expect(result.current.filter).toEqual({});
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBe(null);
      expect(result.current.editingTodo).toBe(null);
    });
  });

  describe('loadTodos', () => {
    it('loads todos successfully', async () => {
      const mockResponse = {
        ok: true,
        json: async () => ({ todos: [mockTodo, mockTodo2] }),
      };
      mockFetch.mockResolvedValueOnce(mockResponse as Response);

      const { result } = renderHook(() => useTodoStore());

      await act(async () => {
        await result.current.loadTodos();
      });

      expect(result.current.todos).toHaveLength(2);
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBe(null);
      expect(mockFetch).toHaveBeenCalledWith('/api/todos?');
    });

    it('handles load todos error', async () => {
      mockFetch.mockImplementationOnce(() => Promise.reject(new Error('Failed to delete todo')));

      const { result } = renderHook(() => useTodoStore());

      await act(async () => {
        await result.current.loadTodos();
      });

      expect(result.current.error).toBe('Failed to load todos');
      expect(result.current.loading).toBe(false);
    });

    it('sets loading state during fetch', async () => {
      const mockResponse = {
        ok: true,
        json: async () => [],
      };
      mockFetch.mockImplementationOnce(() => 
        new Promise(resolve => setTimeout(() => resolve(mockResponse as Response), 100))
      );

      const { result } = renderHook(() => useTodoStore());

      act(() => {
        result.current.loadTodos();
      });

      expect(result.current.loading).toBe(true);
    });
  });

  describe('addTodo', () => {
    it('adds a todo successfully', async () => {
      const mockResponse = {
        ok: true,
        json: async () => mockTodo,
      };
      mockFetch.mockResolvedValueOnce(mockResponse as Response);

      const { result } = renderHook(() => useTodoStore());

      const todoData = {
        title: mockTodo.title,
        description: mockTodo.description,
        priority: mockTodo.priority,
        tags: mockTodo.tags,
        dueDate: mockTodo.dueDate,
      };

      await act(async () => {
        await result.current.addTodo(todoData);
      });

      expect(result.current.todos).toHaveLength(1);
      expect(result.current.todos[0].title).toBe(mockTodo.title);
      expect(result.current.loading).toBe(false);
      expect(mockFetch).toHaveBeenCalledWith('/api/todos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(todoData),
      });
    });

    it('handles add todo error', async () => {
      const mockResponse = {
        ok: false,
      };
      mockFetch.mockResolvedValueOnce(mockResponse as Response);

      const { result } = renderHook(() => useTodoStore());

      await act(async () => {
        await result.current.addTodo({ title: 'Test', priority: 'medium', tags: [] });
      });

      expect(result.current.error).toBe('Failed to add todo');
      expect(result.current.loading).toBe(false);
    });
  });

  describe('updateTodo', () => {
    it('updates a todo successfully', async () => {
      const updatedTodo = { ...mockTodo, title: 'Updated Title' };
      const mockResponse = {
        ok: true,
        json: async () => updatedTodo,
      };
      mockFetch.mockResolvedValueOnce(mockResponse as Response);

      const { result } = renderHook(() => useTodoStore());
      
      // Set initial state with a todo
      act(() => {
        useTodoStore.setState({ todos: [mockTodo] });
      });

      await act(async () => {
        await result.current.updateTodo('1', { title: 'Updated Title' });
      });

      expect(result.current.todos[0].title).toBe('Updated Title');
      expect(result.current.editingTodo).toBe(null);
      expect(mockFetch).toHaveBeenCalledWith('/api/todos/1', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: 'Updated Title' }),
      });
    });

    it('handles update todo error', async () => {
      const mockResponse = {
        ok: false,
      };
      mockFetch.mockResolvedValueOnce(mockResponse as Response);

      const { result } = renderHook(() => useTodoStore());

      await act(async () => {
        await result.current.updateTodo('1', { title: 'Updated' });
      });

      expect(result.current.error).toBe('Failed to update todo');
    });
  });

  describe('deleteTodo', () => {
    it('deletes a todo successfully', async () => {
      const mockResponse = {
        ok: true,
      };
      mockFetch.mockResolvedValueOnce(mockResponse as Response);

      const { result } = renderHook(() => useTodoStore());
      
      // Set initial state with todos
      act(() => {
        useTodoStore.setState({ todos: [mockTodo, mockTodo2] });
      });

      await act(async () => {
        await result.current.deleteTodo('1');
      });

      expect(result.current.todos).toHaveLength(1);
      expect(result.current.todos[0].id).toBe('2');
      expect(mockFetch).toHaveBeenCalledWith('/api/todos/1', {
        method: 'DELETE',
      });
    });

    it('handles delete todo error', async () => {
      const mockResponse = {
        ok: false,
      };
      mockFetch.mockResolvedValueOnce(mockResponse as Response);

      const { result } = renderHook(() => useTodoStore());

      await act(async () => {
        await result.current.deleteTodo('1');
      });

      expect(result.current.error).toBe('Failed to delete todo');
    });
  });

  describe('deleteTodos (bulk delete)', () => {
    it('deletes multiple todos successfully', async () => {
      const mockResponse = {
        ok: true,
      };
      mockFetch.mockResolvedValueOnce(mockResponse as Response);

      const { result } = renderHook(() => useTodoStore());
      
      // Set initial state with todos
      act(() => {
        useTodoStore.setState({ todos: [mockTodo, mockTodo2] });
      });

      await act(async () => {
        await result.current.deleteTodos(['1', '2']);
      });

      expect(result.current.todos).toHaveLength(0);
      expect(mockFetch).toHaveBeenCalledWith('/api/todos', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: ['1', '2'] }),
      });
    });
  });

  describe('toggleTodo', () => {
    it('toggles a todo completion status', async () => {
      const updatedTodo = { ...mockTodo, completed: true };
      const mockResponse = {
        ok: true,
        json: async () => updatedTodo,
      };
      mockFetch.mockResolvedValueOnce(mockResponse as Response);

      const { result } = renderHook(() => useTodoStore());
      
      // Set initial state with a todo
      act(() => {
        useTodoStore.setState({ todos: [mockTodo] });
      });

      await act(async () => {
        await result.current.toggleTodo('1');
      });

      expect(mockFetch).toHaveBeenCalledWith('/api/todos/1', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed: true }),
      });
    });

    it('does nothing if todo not found', async () => {
      const { result } = renderHook(() => useTodoStore());

      await act(async () => {
        await result.current.toggleTodo('nonexistent');
      });

      expect(mockFetch).not.toHaveBeenCalled();
    });
  });

  describe('toggleTodos (bulk toggle)', () => {
    it('toggles multiple todos successfully', async () => {
      const mockResponse = {
        ok: true,
        json: async () => ({ updated: [{ ...mockTodo, completed: true }, { ...mockTodo2, completed: true }] }),
      };
      mockFetch.mockResolvedValueOnce(mockResponse as Response);

      const { result } = renderHook(() => useTodoStore());
      
      // Set initial state with todos
      act(() => {
        useTodoStore.setState({ todos: [mockTodo, mockTodo2] });
      });

      await act(async () => {
        await result.current.toggleTodos(['1', '2']);
      });

      expect(result.current.todos[0].completed).toBe(true); // toggled from false
      expect(result.current.todos[1].completed).toBe(true); // both set to opposite of first todo's state
      expect(mockFetch).toHaveBeenCalledWith('/api/todos', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: ['1', '2'], updates: { completed: true } }),
      });
    });

    it('does nothing if no todos found', async () => {
      const { result } = renderHook(() => useTodoStore());

      await act(async () => {
        await result.current.toggleTodos(['nonexistent']);
      });

      expect(mockFetch).not.toHaveBeenCalled();
    });
  });

  describe('setEditingTodo', () => {
    it('sets the editing todo', () => {
      const { result } = renderHook(() => useTodoStore());

      act(() => {
        result.current.setEditingTodo(mockTodo);
      });

      expect(result.current.editingTodo).toEqual(mockTodo);
    });

    it('clears the editing todo', () => {
      const { result } = renderHook(() => useTodoStore());

      act(() => {
        result.current.setEditingTodo(mockTodo);
      });

      act(() => {
        result.current.setEditingTodo(null);
      });

      expect(result.current.editingTodo).toBe(null);
    });
  });

  describe('filter management', () => {
    it('sets filter correctly', () => {
      const { result } = renderHook(() => useTodoStore());

      act(() => {
        result.current.setFilter({ status: 'active', priority: 'high' });
      });

      expect(result.current.filter).toEqual({ status: 'active', priority: 'high' });
    });

    it('merges filters correctly', () => {
      const { result } = renderHook(() => useTodoStore());

      act(() => {
        result.current.setFilter({ status: 'active' });
      });

      act(() => {
        result.current.setFilter({ priority: 'high' });
      });

      expect(result.current.filter).toEqual({ status: 'active', priority: 'high' });
    });

    it('clears filter correctly', () => {
      const { result } = renderHook(() => useTodoStore());

      act(() => {
        result.current.setFilter({ status: 'active', priority: 'high' });
      });

      act(() => {
        result.current.clearFilter();
      });

      expect(result.current.filter).toEqual({});
    });
  });

  describe('getFilteredTodos', () => {
    beforeEach(() => {
      const { result } = renderHook(() => useTodoStore());
      act(() => {
        useTodoStore.setState({ todos: [mockTodo, mockTodo2] });
      });
    });

    it('filters by status - active', () => {
      const { result } = renderHook(() => useTodoStore());

      act(() => {
        result.current.setFilter({ status: 'active' });
      });

      const filtered = result.current.getFilteredTodos();
      expect(filtered).toHaveLength(1);
      expect(filtered[0].completed).toBe(false);
    });

    it('filters by status - completed', () => {
      const { result } = renderHook(() => useTodoStore());

      act(() => {
        result.current.setFilter({ status: 'completed' });
      });

      const filtered = result.current.getFilteredTodos();
      expect(filtered).toHaveLength(1);
      expect(filtered[0].completed).toBe(true);
    });

    it('filters by priority', () => {
      const { result } = renderHook(() => useTodoStore());

      act(() => {
        result.current.setFilter({ priority: 'high' });
      });

      const filtered = result.current.getFilteredTodos();
      expect(filtered).toHaveLength(1);
      expect(filtered[0].priority).toBe('high');
    });

    it('filters by tags', () => {
      const { result } = renderHook(() => useTodoStore());

      act(() => {
        result.current.setFilter({ tags: ['work'] });
      });

      const filtered = result.current.getFilteredTodos();
      expect(filtered).toHaveLength(1);
      expect(filtered[0].tags).toContain('work');
    });

    it('filters by search term in title', () => {
      const { result } = renderHook(() => useTodoStore());

      act(() => {
        result.current.setFilter({ search: 'Test' });
      });

      const filtered = result.current.getFilteredTodos();
      expect(filtered).toHaveLength(1);
      expect(filtered[0].title).toContain('Test');
    });

    it('filters by search term in description', () => {
      const { result } = renderHook(() => useTodoStore());

      act(() => {
        result.current.setFilter({ search: 'Second' });
      });

      const filtered = result.current.getFilteredTodos();
      expect(filtered).toHaveLength(1);
      expect(filtered[0].description).toContain('Second');
    });

    it('filters by search term in tags', () => {
      const { result } = renderHook(() => useTodoStore());

      act(() => {
        result.current.setFilter({ search: 'personal' });
      });

      const filtered = result.current.getFilteredTodos();
      expect(filtered).toHaveLength(1);
      expect(filtered[0].tags).toContain('personal');
    });

    it('sorts by creation date (newest first)', () => {
      const { result } = renderHook(() => useTodoStore());

      const filtered = result.current.getFilteredTodos();
      expect(filtered[0].createdAt.getTime()).toBeGreaterThan(filtered[1].createdAt.getTime());
    });

    it('combines multiple filters', () => {
      const { result } = renderHook(() => useTodoStore());

      act(() => {
        result.current.setFilter({ 
          status: 'completed', 
          priority: 'high',
          search: 'Second'
        });
      });

      const filtered = result.current.getFilteredTodos();
      expect(filtered).toHaveLength(1);
      expect(filtered[0].completed).toBe(true);
      expect(filtered[0].priority).toBe('high');
      expect(filtered[0].title).toContain('Second');
    });
  });

  describe('getStats', () => {
    it('calculates stats correctly', () => {
      const { result } = renderHook(() => useTodoStore());
      
      const overdueTodo = {
        ...mockTodo,
        id: '3',
        completed: false,
        dueDate: new Date('2022-01-01'), // Past date
      };
      
      act(() => {
        useTodoStore.setState({ todos: [mockTodo, mockTodo2, overdueTodo] });
      });

      const stats = result.current.getStats();
      expect(stats.total).toBe(3);
      expect(stats.completed).toBe(1);
      expect(stats.active).toBe(2);
      expect(stats.overdue).toBe(1);
    });

    it('handles empty todos array', () => {
      const { result } = renderHook(() => useTodoStore());

      const stats = result.current.getStats();
      expect(stats.total).toBe(0);
      expect(stats.completed).toBe(0);
      expect(stats.active).toBe(0);
      expect(stats.overdue).toBe(0);
    });
  });

  describe('getAllTags', () => {
    it('returns unique tags sorted alphabetically', () => {
      const { result } = renderHook(() => useTodoStore());
      
      act(() => {
        useTodoStore.setState({ todos: [mockTodo, mockTodo2] });
      });

      const tags = result.current.getAllTags();
      expect(tags).toEqual(['personal', 'test', 'work']);
    });

    it('handles empty todos array', () => {
      const { result } = renderHook(() => useTodoStore());

      const tags = result.current.getAllTags();
      expect(tags).toEqual([]);
    });

    it('handles duplicate tags', () => {
      const { result } = renderHook(() => useTodoStore());
      
      const todoWithDuplicateTags = {
        ...mockTodo,
        id: '3',
        tags: ['test', 'work'], // Same tags as mockTodo
      };
      
      act(() => {
        useTodoStore.setState({ todos: [mockTodo, todoWithDuplicateTags] });
      });

      const tags = result.current.getAllTags();
      expect(tags).toEqual(['test', 'work']);
    });
  });
});