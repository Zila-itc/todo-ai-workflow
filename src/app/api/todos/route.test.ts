import { NextRequest } from 'next/server';
import { GET, POST, PUT, DELETE } from './route';
import { dbManager } from '@/utils/indexedDB';
import { Todo } from '@/types/todo';

// Mock the dbManager
jest.mock('@/utils/indexedDB', () => ({
  dbManager: {
    getAllTodos: jest.fn(),
    addTodo: jest.fn(),
    updateTodo: jest.fn(),
    deleteTodo: jest.fn(),
  },
}));

const mockDbManager = dbManager as jest.Mocked<typeof dbManager>;

// Helper function to create mock NextRequest
function createMockRequest(url: string, options: RequestInit = {}) {
  return new NextRequest(url, options);
}

// Sample todo data
const sampleTodos: Todo[] = [
  {
    id: '1',
    title: 'Test Todo 1',
    description: 'Description 1',
    completed: false,
    priority: 'high',
    dueDate: new Date('2024-12-31'),
    tags: ['work', 'urgent'],
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: '2',
    title: 'Test Todo 2',
    description: 'Description 2',
    completed: true,
    priority: 'medium',
    dueDate: new Date('2024-12-25'),
    tags: ['personal'],
    createdAt: new Date('2024-01-02'),
    updatedAt: new Date('2024-01-02'),
  },
  {
    id: '3',
    title: 'Test Todo 3',
    completed: false,
    priority: 'low',
    tags: ['work'],
    createdAt: new Date('2024-01-03'),
    updatedAt: new Date('2024-01-03'),
  },
];

describe('/api/todos', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockDbManager.getAllTodos.mockResolvedValue([...sampleTodos]);
  });

  describe('GET', () => {
    it('should return all todos without filters', async () => {
      const request = createMockRequest('http://localhost:3000/api/todos');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.todos).toHaveLength(3);
      expect(data.total).toBe(3);
      expect(data.filtered).toBe(3);
      expect(mockDbManager.getAllTodos).toHaveBeenCalledTimes(1);
    });

    it('should filter todos by status=active', async () => {
      const request = createMockRequest('http://localhost:3000/api/todos?status=active');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.todos).toHaveLength(2);
      expect(data.todos.every((todo: Todo) => !todo.completed)).toBe(true);
      expect(data.total).toBe(3);
      expect(data.filtered).toBe(2);
    });

    it('should filter todos by status=completed', async () => {
      const request = createMockRequest('http://localhost:3000/api/todos?status=completed');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.todos).toHaveLength(1);
      expect(data.todos.every((todo: Todo) => todo.completed)).toBe(true);
      expect(data.total).toBe(3);
      expect(data.filtered).toBe(1);
    });

    it('should filter todos by priority', async () => {
      const request = createMockRequest('http://localhost:3000/api/todos?priority=high');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.todos).toHaveLength(1);
      expect(data.todos[0].priority).toBe('high');
    });

    it('should filter todos by tags', async () => {
      const request = createMockRequest('http://localhost:3000/api/todos?tags=work,urgent');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.todos).toHaveLength(2);
      expect(data.todos.every((todo: Todo) => 
        todo.tags.includes('work') || todo.tags.includes('urgent')
      )).toBe(true);
    });

    it('should filter todos by search term', async () => {
      const request = createMockRequest('http://localhost:3000/api/todos?search=Test Todo 1');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.todos).toHaveLength(1);
      expect(data.todos[0].title).toBe('Test Todo 1');
    });

    it('should search in description and tags', async () => {
      const request = createMockRequest('http://localhost:3000/api/todos?search=personal');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.todos).toHaveLength(1);
      expect(data.todos[0].tags).toContain('personal');
    });

    it('should combine multiple filters', async () => {
      const request = createMockRequest('http://localhost:3000/api/todos?status=active&priority=high&tags=work');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.todos).toHaveLength(1);
      expect(data.todos[0].completed).toBe(false);
      expect(data.todos[0].priority).toBe('high');
      expect(data.todos[0].tags).toContain('work');
    });

    it('should sort todos by creation date (newest first)', async () => {
      const request = createMockRequest('http://localhost:3000/api/todos');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.todos[0].id).toBe('3'); // Most recent
      expect(data.todos[2].id).toBe('1'); // Oldest
    });

    it('should handle database errors', async () => {
      mockDbManager.getAllTodos.mockRejectedValue(new Error('Database error'));
      
      const request = createMockRequest('http://localhost:3000/api/todos');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Failed to fetch todos');
    });
  });

  describe('POST', () => {
    it('should create a new todo with required fields', async () => {
      const newTodo = {
        title: 'New Todo',
        description: 'New Description',
        priority: 'medium',
        tags: ['test'],
      };

      const request = createMockRequest('http://localhost:3000/api/todos', {
        method: 'POST',
        body: JSON.stringify(newTodo),
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.title).toBe('New Todo');
      expect(data.description).toBe('New Description');
      expect(data.priority).toBe('medium');
      expect(data.completed).toBe(false);
      expect(data.tags).toEqual(['test']);
      expect(data.id).toBeDefined();
      expect(data.createdAt).toBeDefined();
      expect(data.updatedAt).toBeDefined();
      expect(mockDbManager.addTodo).toHaveBeenCalledWith(expect.objectContaining({
        title: 'New Todo',
        description: 'New Description',
        priority: 'medium',
        completed: false,
        tags: ['test'],
      }));
    });

    it('should create a todo with minimal fields', async () => {
      const newTodo = { title: 'Minimal Todo' };

      const request = createMockRequest('http://localhost:3000/api/todos', {
        method: 'POST',
        body: JSON.stringify(newTodo),
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.title).toBe('Minimal Todo');
      expect(data.priority).toBe('medium'); // default
      expect(data.tags).toEqual([]); // default
      expect(data.description).toBeUndefined();
      expect(data.dueDate).toBeUndefined();
    });

    it('should handle dueDate correctly', async () => {
      const newTodo = {
        title: 'Todo with Due Date',
        dueDate: '2024-12-31T23:59:59.999Z',
      };

      const request = createMockRequest('http://localhost:3000/api/todos', {
        method: 'POST',
        body: JSON.stringify(newTodo),
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.dueDate).toBeDefined();
    });

    it('should trim whitespace from title and description', async () => {
      const newTodo = {
        title: '  Trimmed Todo  ',
        description: '  Trimmed Description  ',
      };

      const request = createMockRequest('http://localhost:3000/api/todos', {
        method: 'POST',
        body: JSON.stringify(newTodo),
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.title).toBe('Trimmed Todo');
      expect(data.description).toBe('Trimmed Description');
    });

    it('should filter out invalid tags', async () => {
      const newTodo = {
        title: 'Todo with Tags',
        tags: ['valid', '', '  ', 123, null, 'another-valid'],
      };

      const request = createMockRequest('http://localhost:3000/api/todos', {
        method: 'POST',
        body: JSON.stringify(newTodo),
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.tags).toEqual(['valid', 'another-valid']);
    });

    it('should return 400 for missing title', async () => {
      const newTodo = { description: 'No title' };

      const request = createMockRequest('http://localhost:3000/api/todos', {
        method: 'POST',
        body: JSON.stringify(newTodo),
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Title is required and must be a non-empty string');
    });

    it('should return 400 for empty title', async () => {
      const newTodo = { title: '   ' };

      const request = createMockRequest('http://localhost:3000/api/todos', {
        method: 'POST',
        body: JSON.stringify(newTodo),
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Title is required and must be a non-empty string');
    });

    it('should return 400 for non-string title', async () => {
      const newTodo = { title: 123 };

      const request = createMockRequest('http://localhost:3000/api/todos', {
        method: 'POST',
        body: JSON.stringify(newTodo),
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Title is required and must be a non-empty string');
    });

    it('should handle database errors', async () => {
      mockDbManager.addTodo.mockRejectedValue(new Error('Database error'));
      
      const newTodo = { title: 'Test Todo' };
      const request = createMockRequest('http://localhost:3000/api/todos', {
        method: 'POST',
        body: JSON.stringify(newTodo),
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Failed to create todo');
    });
  });

  describe('PUT (Bulk Update)', () => {
    it('should update multiple todos', async () => {
      const updateData = {
        ids: ['1', '2'],
        updates: { completed: true, priority: 'high' },
      };

      const request = createMockRequest('http://localhost:3000/api/todos', {
        method: 'PUT',
        body: JSON.stringify(updateData),
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await PUT(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.updated).toHaveLength(2);
      expect(data.count).toBe(2);
      expect(mockDbManager.updateTodo).toHaveBeenCalledTimes(2);
    });

    it('should handle non-existent todo IDs gracefully', async () => {
      const updateData = {
        ids: ['1', 'non-existent', '2'],
        updates: { completed: true },
      };

      const request = createMockRequest('http://localhost:3000/api/todos', {
        method: 'PUT',
        body: JSON.stringify(updateData),
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await PUT(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.updated).toHaveLength(2); // Only existing todos
      expect(data.count).toBe(2);
    });

    it('should return 400 for missing ids', async () => {
      const updateData = { updates: { completed: true } };

      const request = createMockRequest('http://localhost:3000/api/todos', {
        method: 'PUT',
        body: JSON.stringify(updateData),
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await PUT(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('IDs array is required');
    });

    it('should return 400 for empty ids array', async () => {
      const updateData = { ids: [], updates: { completed: true } };

      const request = createMockRequest('http://localhost:3000/api/todos', {
        method: 'PUT',
        body: JSON.stringify(updateData),
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await PUT(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('IDs array is required');
    });

    it('should handle database errors', async () => {
      mockDbManager.getAllTodos.mockRejectedValue(new Error('Database error'));
      
      const updateData = {
        ids: ['1'],
        updates: { completed: true },
      };
      const request = createMockRequest('http://localhost:3000/api/todos', {
        method: 'PUT',
        body: JSON.stringify(updateData),
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await PUT(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Failed to update todos');
    });
  });

  describe('DELETE (Bulk Delete)', () => {
    it('should delete multiple todos', async () => {
      const deleteData = { ids: ['1', '2'] };

      const request = createMockRequest('http://localhost:3000/api/todos', {
        method: 'DELETE',
        body: JSON.stringify(deleteData),
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await DELETE(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.deleted).toEqual(['1', '2']);
      expect(data.count).toBe(2);
      expect(mockDbManager.deleteTodo).toHaveBeenCalledTimes(2);
      expect(mockDbManager.deleteTodo).toHaveBeenCalledWith('1');
      expect(mockDbManager.deleteTodo).toHaveBeenCalledWith('2');
    });

    it('should handle partial deletion failures', async () => {
      mockDbManager.deleteTodo.mockImplementation((id: string) => {
        if (id === '2') {
          throw new Error('Delete failed');
        }
        return Promise.resolve();
      });

      const deleteData = { ids: ['1', '2', '3'] };

      const request = createMockRequest('http://localhost:3000/api/todos', {
        method: 'DELETE',
        body: JSON.stringify(deleteData),
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await DELETE(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.deleted).toEqual(['1', '3']); // Only successful deletions
      expect(data.count).toBe(2);
    });

    it('should return 400 for missing ids', async () => {
      const deleteData = {};

      const request = createMockRequest('http://localhost:3000/api/todos', {
        method: 'DELETE',
        body: JSON.stringify(deleteData),
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await DELETE(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('IDs array is required');
    });

    it('should return 400 for empty ids array', async () => {
      const deleteData = { ids: [] };

      const request = createMockRequest('http://localhost:3000/api/todos', {
        method: 'DELETE',
        body: JSON.stringify(deleteData),
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await DELETE(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('IDs array is required');
    });

    it('should handle database errors', async () => {
      // Mock console.error to avoid noise in test output
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      
      const deleteData = { ids: ['1'] };
      const request = createMockRequest('http://localhost:3000/api/todos', {
        method: 'DELETE',
        body: JSON.stringify(deleteData),
        headers: { 'Content-Type': 'application/json' },
      });

      // Mock a general error in the try-catch block
      const originalDeleteTodo = mockDbManager.deleteTodo;
      mockDbManager.deleteTodo = jest.fn().mockImplementation(() => {
        throw new Error('Unexpected error');
      });

      const response = await DELETE(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Failed to delete todos');
      
      // Restore
      mockDbManager.deleteTodo = originalDeleteTodo;
      consoleSpy.mockRestore();
    });
  });
});