import { Todo } from '@/types/todo';

const DB_NAME = 'TodoAppDB';
const DB_VERSION = 1;
const TODO_STORE = 'todos';
const SETTINGS_STORE = 'settings';

class IndexedDBManager {
  private db: IDBDatabase | null = null;

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Create todos store
        if (!db.objectStoreNames.contains(TODO_STORE)) {
          const todoStore = db.createObjectStore(TODO_STORE, { keyPath: 'id' });
          todoStore.createIndex('completed', 'completed', { unique: false });
          todoStore.createIndex('priority', 'priority', { unique: false });
          todoStore.createIndex('dueDate', 'dueDate', { unique: false });
          todoStore.createIndex('tags', 'tags', { unique: false, multiEntry: true });
        }

        // Create settings store
        if (!db.objectStoreNames.contains(SETTINGS_STORE)) {
          db.createObjectStore(SETTINGS_STORE, { keyPath: 'key' });
        }
      };
    });
  }

  async getAllTodos(): Promise<Todo[]> {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([TODO_STORE], 'readonly');
      const store = transaction.objectStore(TODO_STORE);
      const request = store.getAll();

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const todos = request.result.map((todo: Todo) => ({
          ...todo,
          createdAt: new Date(todo.createdAt),
          updatedAt: new Date(todo.updatedAt),
          dueDate: todo.dueDate ? new Date(todo.dueDate) : undefined,
        }));
        resolve(todos);
      };
    });
  }

  async addTodo(todo: Todo): Promise<void> {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([TODO_STORE], 'readwrite');
      const store = transaction.objectStore(TODO_STORE);
      const request = store.add(todo);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  async updateTodo(todo: Todo): Promise<void> {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([TODO_STORE], 'readwrite');
      const store = transaction.objectStore(TODO_STORE);
      const request = store.put(todo);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  async deleteTodo(id: string): Promise<void> {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([TODO_STORE], 'readwrite');
      const store = transaction.objectStore(TODO_STORE);
      const request = store.delete(id);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  async getTodosByFilter(filter: { completed?: boolean; priority?: string }): Promise<Todo[]> {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([TODO_STORE], 'readonly');
      const store = transaction.objectStore(TODO_STORE);
      
      let request: IDBRequest;
      
      if (filter.priority) {
        const index = store.index('priority');
        request = index.getAll(filter.priority);
      } else {
        request = store.getAll();
      }

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        let todos = request.result.map((todo: Todo) => ({
          ...todo,
          createdAt: new Date(todo.createdAt),
          updatedAt: new Date(todo.updatedAt),
          dueDate: todo.dueDate ? new Date(todo.dueDate) : undefined,
        }));
        
        // Filter by completed status if specified
        if (filter.completed !== undefined) {
          todos = todos.filter((todo: Todo) => todo.completed === filter.completed);
        }
        
        resolve(todos);
      };
    });
  }
}

export const dbManager = new IndexedDBManager();