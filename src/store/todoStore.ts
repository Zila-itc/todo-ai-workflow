import { create } from 'zustand';
import { Todo, TodoFilter, TodoStats } from '@/types/todo';

interface TodoState {
  todos: Todo[];
  filter: TodoFilter;
  loading: boolean;
  error: string | null;
  editingTodo: Todo | null;

  // Actions
  loadTodos: () => Promise<void>;
  addTodo: (todo: Omit<Todo, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateTodo: (id: string, updates: Partial<Todo>) => Promise<void>;
  deleteTodo: (id: string) => Promise<void>;
  deleteTodos: (ids: string[]) => Promise<void>;
  toggleTodo: (id: string) => Promise<void>;
  toggleTodos: (ids: string[]) => Promise<void>;
  setEditingTodo: (todo: Todo | null) => void;
  
  // Filters
  setFilter: (filter: Partial<TodoFilter>) => void;
  clearFilter: () => void;
  
  // Computed
  getFilteredTodos: () => Todo[];
  getStats: () => TodoStats;
  getAllTags: () => string[];
}

// API helper functions
const api = {
  async getTodos(filter?: TodoFilter) {
    const params = new URLSearchParams();
    if (filter?.status) params.append('status', filter.status);
    if (filter?.priority) params.append('priority', filter.priority);
    if (filter?.tags?.length) params.append('tags', filter.tags.join(','));
    if (filter?.search) params.append('search', filter.search);
    
    const response = await fetch(`/api/todos?${params}`);
    if (!response.ok) throw new Error('Failed to fetch todos');
    const data = await response.json();
    return data.todos.map((todo: Todo) => ({
      ...todo,
      createdAt: new Date(todo.createdAt),
      updatedAt: new Date(todo.updatedAt),
      dueDate: todo.dueDate ? new Date(todo.dueDate) : undefined,
    }));
  },

  async createTodo(todo: Omit<Todo, 'id' | 'createdAt' | 'updatedAt'>) {
    const response = await fetch('/api/todos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(todo),
    });
    if (!response.ok) throw new Error('Failed to create todo');
    const data = await response.json();
    return {
      ...data,
      createdAt: new Date(data.createdAt),
      updatedAt: new Date(data.updatedAt),
      dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
    };
  },

  async updateTodo(id: string, updates: Partial<Todo>) {
    const response = await fetch(`/api/todos/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    if (!response.ok) throw new Error('Failed to update todo');
    const data = await response.json();
    return {
      ...data,
      createdAt: new Date(data.createdAt),
      updatedAt: new Date(data.updatedAt),
      dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
    };
  },

  async deleteTodo(id: string) {
    const response = await fetch(`/api/todos/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete todo');
  },

  async bulkUpdate(ids: string[], updates: Partial<Todo>) {
    const response = await fetch('/api/todos', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids, updates }),
    });
    if (!response.ok) throw new Error('Failed to bulk update todos');
    const data = await response.json();
    return data.updated.map((todo: Todo) => ({
      ...todo,
      createdAt: new Date(todo.createdAt),
      updatedAt: new Date(todo.updatedAt),
      dueDate: todo.dueDate ? new Date(todo.dueDate) : undefined,
    }));
  },

  async bulkDelete(ids: string[]) {
    const response = await fetch('/api/todos', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids }),
    });
    if (!response.ok) throw new Error('Failed to bulk delete todos');
  },
};

export const useTodoStore = create<TodoState>((set, get) => ({
  todos: [],
  filter: {},
  loading: false,
  error: null,
  editingTodo: null,

  loadTodos: async () => {
    set({ loading: true, error: null });
    try {
      const todos = await api.getTodos();
      set({ todos, loading: false });
    } catch (error) {
      console.error('Failed to load todos:', error);
      set({ error: 'Failed to load todos', loading: false });
    }
  },

  addTodo: async (todoData) => {
    set({ loading: true, error: null });
    try {
      const newTodo = await api.createTodo(todoData);
      set(state => ({ 
        todos: [newTodo, ...state.todos], 
        loading: false 
      }));
    } catch (error) {
      console.error('Failed to add todo:', error);
      set({ error: 'Failed to add todo', loading: false });
    }
  },

  updateTodo: async (id, updates) => {
    set({ loading: true, error: null });
    try {
      const updatedTodo = await api.updateTodo(id, updates);
      set(state => ({
        todos: state.todos.map(todo => 
          todo.id === id ? updatedTodo : todo
        ),
        loading: false,
        editingTodo: null,
      }));
    } catch (error) {
      console.error('Failed to update todo:', error);
      set({ error: 'Failed to update todo', loading: false });
    }
  },

  deleteTodo: async (id) => {
    set({ loading: true, error: null });
    try {
      await api.deleteTodo(id);
      set(state => ({
        todos: state.todos.filter(todo => todo.id !== id),
        loading: false,
      }));
    } catch (error) {
      console.error('Failed to delete todo:', error);
      set({ error: 'Failed to delete todo', loading: false });
    }
  },

  deleteTodos: async (ids) => {
    set({ loading: true, error: null });
    try {
      await api.bulkDelete(ids);
      set(state => ({
        todos: state.todos.filter(todo => !ids.includes(todo.id)),
        loading: false,
      }));
    } catch (error) {
      console.error('Failed to delete todos:', error);
      set({ error: 'Failed to delete todos', loading: false });
    }
  },

  toggleTodo: async (id) => {
    const { todos, updateTodo } = get();
    const todo = todos.find(t => t.id === id);
    if (todo) {
      await updateTodo(id, { completed: !todo.completed });
    }
  },

  toggleTodos: async (ids) => {
    const { todos } = get();
    const firstTodo = todos.find(t => ids.includes(t.id));
    if (!firstTodo) return;
    
    const newCompletedState = !firstTodo.completed;
    
    set({ loading: true, error: null });
    try {
      await api.bulkUpdate(ids, { completed: newCompletedState });
      
      set(state => ({
        todos: state.todos.map(todo => 
          ids.includes(todo.id) 
            ? { ...todo, completed: newCompletedState, updatedAt: new Date() }
            : todo
        ),
        loading: false,
      }));
    } catch (error) {
      console.error('Failed to toggle todos:', error);
      set({ error: 'Failed to toggle todos', loading: false });
    }
  },

  setEditingTodo: (todo) => {
    set({ editingTodo: todo });
  },

  setFilter: (newFilter) => {
    set(state => ({ 
      filter: { ...state.filter, ...newFilter } 
    }));
  },

  clearFilter: () => {
    set({ filter: {} });
  },

  getFilteredTodos: () => {
    const { todos, filter } = get();
    let filtered = [...todos];

    // Filter by status
    if (filter.status === 'active') {
      filtered = filtered.filter(todo => !todo.completed);
    } else if (filter.status === 'completed') {
      filtered = filtered.filter(todo => todo.completed);
    }

    // Filter by priority
    if (filter.priority) {
      filtered = filtered.filter(todo => todo.priority === filter.priority);
    }

    // Filter by tags
    if (filter.tags && filter.tags.length > 0) {
      filtered = filtered.filter(todo => 
        filter.tags!.some(tag => todo.tags.includes(tag))
      );
    }

    // Filter by search
    if (filter.search) {
      const searchLower = filter.search.toLowerCase();
      filtered = filtered.filter(todo => 
        todo.title.toLowerCase().includes(searchLower) ||
        (todo.description && todo.description.toLowerCase().includes(searchLower)) ||
        todo.tags.some(tag => tag.toLowerCase().includes(searchLower))
      );
    }

    // Sort by creation date (newest first)
    filtered.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    return filtered;
  },

  getStats: () => {
    const { todos } = get();
    const now = new Date();
    
    return {
      total: todos.length,
      completed: todos.filter(todo => todo.completed).length,
      active: todos.filter(todo => !todo.completed).length,
      overdue: todos.filter(todo => 
        !todo.completed && 
        todo.dueDate && 
        todo.dueDate < now
      ).length,
    };
  },

  getAllTags: () => {
    const { todos } = get();
    const allTags = todos.flatMap(todo => todo.tags);
    return [...new Set(allTags)].sort();
  },
}));