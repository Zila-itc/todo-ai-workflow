import { dbManager } from './indexedDB';
import { Todo } from '@/types/todo';

// Mock IndexedDB
class MockIDBRequest {
  result: any;
  error: any;
  onsuccess: ((event: any) => void) | null = null;
  onerror: ((event: any) => void) | null = null;

  constructor(result?: any, error?: any) {
    this.result = result;
    this.error = error;
    // Simulate async behavior
    setTimeout(() => {
      if (this.error) {
        if (this.onerror) {
          this.onerror({ target: this });
        }
      } else if (this.onsuccess) {
        this.onsuccess({ target: this });
      }
    }, 0);
  }
}

class MockIDBObjectStore {
  private data: Map<string, any> = new Map();
  private indexes: Map<string, MockIDBIndex> = new Map();
  public shouldError: boolean = false;
  public errorMessage: string = '';

  constructor() {
    this.indexes.set('completed', new MockIDBIndex('completed'));
    this.indexes.set('priority', new MockIDBIndex('priority'));
    this.indexes.set('dueDate', new MockIDBIndex('dueDate'));
    this.indexes.set('tags', new MockIDBIndex('tags'));
  }

  add(value: any): MockIDBRequest {
    if (this.shouldError) {
      return new MockIDBRequest(undefined, new Error(this.errorMessage || 'Add error'));
    }
    if (this.data.has(value.id)) {
      return new MockIDBRequest(undefined, new Error('Key already exists'));
    }
    this.data.set(value.id, value);
    return new MockIDBRequest(value.id);
  }

  put(value: any): MockIDBRequest {
    if (this.shouldError) {
      return new MockIDBRequest(undefined, new Error(this.errorMessage || 'Put error'));
    }
    this.data.set(value.id, value);
    return new MockIDBRequest(value.id);
  }

  delete(key: string): MockIDBRequest {
    if (this.shouldError) {
      return new MockIDBRequest(undefined, new Error(this.errorMessage || 'Delete error'));
    }
    this.data.delete(key);
    return new MockIDBRequest(undefined);
  }

  getAll(): MockIDBRequest {
    if (this.shouldError) {
      return new MockIDBRequest(undefined, new Error(this.errorMessage || 'Transaction error'));
    }
    return new MockIDBRequest(Array.from(this.data.values()));
  }

  index(name: string): MockIDBIndex {
    return this.indexes.get(name) || new MockIDBIndex(name);
  }

  createIndex(name: string, keyPath: string, options?: any): MockIDBIndex {
    const index = new MockIDBIndex(name);
    this.indexes.set(name, index);
    return index;
  }

  // Helper method for tests
  setData(data: Map<string, any>) {
    this.data = data;
    this.indexes.forEach(index => index.setData(data));
  }
}

class MockIDBIndex {
  private data: Map<string, any> = new Map();
  
  constructor(private name: string) {}

  getAll(query?: any): MockIDBRequest {
    if (query === undefined) {
      return new MockIDBRequest(Array.from(this.data.values()));
    }
    
    const filtered = Array.from(this.data.values()).filter(item => {
      if (this.name === 'priority') {
        return item.priority === query;
      }
      if (this.name === 'completed') {
        return item.completed === query;
      }
      return true;
    });
    
    return new MockIDBRequest(filtered);
  }

  setData(data: Map<string, any>) {
    this.data = data;
  }
}

class MockIDBTransaction {
  constructor(private stores: Map<string, MockIDBObjectStore>) {}

  objectStore(name: string): MockIDBObjectStore {
    return this.stores.get(name)!;
  }
}

class MockIDBDatabase {
  private stores: Map<string, MockIDBObjectStore> = new Map();
  objectStoreNames: DOMStringList;

  constructor() {
    this.stores.set('todos', new MockIDBObjectStore());
    this.stores.set('settings', new MockIDBObjectStore());
    
    // Create a proper DOMStringList-like object
    const storeNames = ['todos', 'settings'];
    this.objectStoreNames = {
      length: storeNames.length,
      contains: (name: string) => storeNames.includes(name),
      item: (index: number) => storeNames[index] || null,
      [Symbol.iterator]: function* () {
        for (const name of storeNames) {
          yield name;
        }
      },
      ...storeNames.reduce((acc, name, index) => {
        acc[index] = name;
        return acc;
      }, {} as any)
    } as DOMStringList;
  }

  transaction(storeNames: string[], mode: string): MockIDBTransaction {
    return new MockIDBTransaction(this.stores);
  }

  createObjectStore(name: string, options?: any): MockIDBObjectStore {
    const store = new MockIDBObjectStore();
    this.stores.set(name, store);
    
    // Update the DOMStringList-like object
    const currentNames = Array.from({ length: this.objectStoreNames.length }, (_, i) => this.objectStoreNames.item(i)!).filter(Boolean);
    if (!currentNames.includes(name)) {
      currentNames.push(name);
      const storeNames = currentNames;
      this.objectStoreNames = {
        length: storeNames.length,
        contains: (name: string) => storeNames.includes(name),
        item: (index: number) => storeNames[index] || null,
        [Symbol.iterator]: function* () {
          for (const name of storeNames) {
            yield name;
          }
        },
        ...storeNames.reduce((acc, name, index) => {
          acc[index] = name;
          return acc;
        }, {} as any)
      } as DOMStringList;
    }
    
    return store;
  }

  // Helper method for tests
  getStore(name: string): MockIDBObjectStore {
    return this.stores.get(name)!;
  }
}

class MockIDBOpenDBRequest extends MockIDBRequest {
  onupgradeneeded: ((event: any) => void) | null = null;

  constructor(db: MockIDBDatabase, shouldUpgrade = false) {
    super(db);
    
    if (shouldUpgrade) {
      setTimeout(() => {
        if (this.onupgradeneeded) {
          this.onupgradeneeded({ target: this });
        }
        if (this.onsuccess) {
          this.onsuccess({ target: this });
        }
      }, 0);
    }
  }
}

// Mock the global indexedDB
const mockDB = new MockIDBDatabase();

global.indexedDB = {
  open: jest.fn((name: string, version: number) => {
    return new MockIDBOpenDBRequest(mockDB, version > 0);
  }),
} as any;

describe('IndexedDB Manager', () => {
  const mockTodo: Todo = {
    id: '1',
    title: 'Test Todo',
    description: 'Test Description',
    completed: false,
    priority: 'medium',
    tags: ['test'],
    createdAt: new Date('2023-01-01'),
    updatedAt: new Date('2023-01-01'),
    dueDate: new Date('2023-12-31'),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    // Reset the database
    mockDB.getStore('todos').setData(new Map());
    mockDB.getStore('settings').setData(new Map());
    // Reset error flags
    mockDB.getStore('todos').shouldError = false;
    mockDB.getStore('settings').shouldError = false;
    // Ensure dbManager uses our mock database
    (dbManager as any).db = mockDB;
  });

  describe('init', () => {
    it('initializes the database successfully', async () => {
      await expect(dbManager.init()).resolves.toBeUndefined();
      expect(global.indexedDB.open).toHaveBeenCalledWith('TodoAppDB', 1);
    });

    it('handles database initialization errors', async () => {
      (global.indexedDB.open as jest.Mock).mockImplementationOnce(() => {
        return new MockIDBRequest(undefined, new Error('DB Error'));
      });

      await expect(dbManager.init()).rejects.toThrow('DB Error');
    });
  });

  describe('addTodo', () => {
    it('adds a todo successfully', async () => {
      await dbManager.addTodo(mockTodo);
      
      const todos = await dbManager.getAllTodos();
      expect(todos).toHaveLength(1);
      expect(todos[0].id).toBe(mockTodo.id);
      expect(todos[0].title).toBe(mockTodo.title);
    });

    it('handles add todo errors', async () => {
      // Add the todo first
      await dbManager.addTodo(mockTodo);
      
      // Try to add the same todo again (should fail due to duplicate key)
      await expect(dbManager.addTodo(mockTodo)).rejects.toThrow();
    });
  });

  describe('getAllTodos', () => {
    it('returns empty array when no todos exist', async () => {
      const todos = await dbManager.getAllTodos();
      expect(todos).toEqual([]);
    });

    it('returns all todos with proper date conversion', async () => {
      await dbManager.addTodo(mockTodo);
      
      const todos = await dbManager.getAllTodos();
      expect(todos).toHaveLength(1);
      expect(todos[0].createdAt).toBeInstanceOf(Date);
      expect(todos[0].updatedAt).toBeInstanceOf(Date);
      expect(todos[0].dueDate).toBeInstanceOf(Date);
    });

    it('handles todos without due dates', async () => {
      const todoWithoutDueDate = { ...mockTodo, dueDate: undefined };
      await dbManager.addTodo(todoWithoutDueDate);
      
      const todos = await dbManager.getAllTodos();
      expect(todos[0].dueDate).toBeUndefined();
    });
  });

  describe('updateTodo', () => {
    it('updates an existing todo', async () => {
      await dbManager.addTodo(mockTodo);
      
      const updatedTodo = {
        ...mockTodo,
        title: 'Updated Title',
        completed: true,
        updatedAt: new Date('2023-06-01'),
      };
      
      await dbManager.updateTodo(updatedTodo);
      
      const todos = await dbManager.getAllTodos();
      expect(todos[0].title).toBe('Updated Title');
      expect(todos[0].completed).toBe(true);
    });

    it('creates a new todo if it does not exist', async () => {
      await dbManager.updateTodo(mockTodo);
      
      const todos = await dbManager.getAllTodos();
      expect(todos).toHaveLength(1);
      expect(todos[0].id).toBe(mockTodo.id);
    });
  });

  describe('deleteTodo', () => {
    it('deletes an existing todo', async () => {
      await dbManager.addTodo(mockTodo);
      
      let todos = await dbManager.getAllTodos();
      expect(todos).toHaveLength(1);
      
      await dbManager.deleteTodo(mockTodo.id);
      
      todos = await dbManager.getAllTodos();
      expect(todos).toHaveLength(0);
    });

    it('handles deletion of non-existent todo', async () => {
      await expect(dbManager.deleteTodo('non-existent')).resolves.toBeUndefined();
    });
  });

  describe('getTodosByFilter', () => {
    beforeEach(async () => {
      const todos = [
        { ...mockTodo, id: '1', completed: false, priority: 'high' },
        { ...mockTodo, id: '2', completed: true, priority: 'medium' },
        { ...mockTodo, id: '3', completed: false, priority: 'low' },
        { ...mockTodo, id: '4', completed: true, priority: 'high' },
      ];
      
      for (const todo of todos) {
        await dbManager.addTodo(todo);
      }
    });

    it('filters by completed status', async () => {
      const completedTodos = await dbManager.getTodosByFilter({ completed: true });
      expect(completedTodos).toHaveLength(2);
      expect(completedTodos.every(todo => todo.completed)).toBe(true);
      
      const incompleteTodos = await dbManager.getTodosByFilter({ completed: false });
      expect(incompleteTodos).toHaveLength(2);
      expect(incompleteTodos.every(todo => !todo.completed)).toBe(true);
    });

    it('filters by priority', async () => {
      const highPriorityTodos = await dbManager.getTodosByFilter({ priority: 'high' });
      expect(highPriorityTodos).toHaveLength(2);
      expect(highPriorityTodos.every(todo => todo.priority === 'high')).toBe(true);
    });

    it('filters by both completed status and priority', async () => {
      const filteredTodos = await dbManager.getTodosByFilter({ 
        completed: true, 
        priority: 'high' 
      });
      expect(filteredTodos).toHaveLength(1);
      expect(filteredTodos[0].completed).toBe(true);
      expect(filteredTodos[0].priority).toBe('high');
    });

    it('returns all todos when no filter is specified', async () => {
      const allTodos = await dbManager.getTodosByFilter({});
      expect(allTodos).toHaveLength(4);
    });

    it('returns empty array when no todos match filter', async () => {
      const filteredTodos = await dbManager.getTodosByFilter({ priority: 'urgent' });
      expect(filteredTodos).toHaveLength(0);
    });

    it('converts dates properly in filtered results', async () => {
      const todos = await dbManager.getTodosByFilter({ completed: false });
      expect(todos[0].createdAt).toBeInstanceOf(Date);
      expect(todos[0].updatedAt).toBeInstanceOf(Date);
      expect(todos[0].dueDate).toBeInstanceOf(Date);
    });
  });

  describe('database initialization and upgrade', () => {
    it('creates object stores during upgrade', async () => {
      const mockUpgradeDB = new MockIDBDatabase();
      // Initialize with proper DOMStringList-like object
      mockUpgradeDB.objectStoreNames = {
        length: 0,
        contains: (name: string) => false,
        item: (index: number) => null,
        [Symbol.iterator]: function* () {},
      } as DOMStringList;
      
      (global.indexedDB.open as jest.Mock).mockImplementationOnce(() => {
        const request = new MockIDBOpenDBRequest(mockUpgradeDB, true);
        
        // Simulate the upgrade process
        setTimeout(() => {
          if (request.onupgradeneeded) {
            request.onupgradeneeded({ target: request });
          }
        }, 0);
        
        return request;
      });
      
      await dbManager.init();
      expect(global.indexedDB.open).toHaveBeenCalled();
    });
  });

  describe('error handling', () => {
    it('handles transaction errors in getAllTodos', async () => {
      const mockObjectStore = mockDB.getStore('todos');
      mockObjectStore.shouldError = true;
      mockObjectStore.errorMessage = 'Transaction error';

      await expect(dbManager.getAllTodos()).rejects.toThrow('Transaction error');

      mockObjectStore.shouldError = false;
    });

    it('handles transaction errors in addTodo', async () => {
      const mockObjectStore = mockDB.getStore('todos');
      mockObjectStore.shouldError = true;
      mockObjectStore.errorMessage = 'Add error';

      await expect(dbManager.addTodo(mockTodo)).rejects.toThrow('Add error');

      mockObjectStore.shouldError = false;
    });
  });
});