import { NextRequest } from 'next/server';
import { GET, PUT, DELETE, PATCH } from './route';
import { dbManager } from '@/utils/indexedDB';
import { Todo } from '@/types/todo';

// Mock the dbManager
jest.mock('@/utils/indexedDB', () => ({
  dbManager: {
    getAllTodos: jest.fn(),
    updateTodo: jest.fn(),
    deleteTodo: jest.fn(),
  },
}));

const mockDbManager = dbManager as jest.Mocked<typeof dbManager>;

// Helper function to create mock NextRequest
function createMockRequest(url: string, options: RequestInit = {}) {
  return new NextRequest(url, options);
}

// Helper function to create mock route params
function createMockParams(id: string) {
  return {
    params: Promise.resolve({ id }),
  };
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
];

describe('/api/todos/[id]', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockDbManager.getAllTodos.mockResolvedValue([...sampleTodos]);
  });

  describe('GET', () => {
    it('should return a specific todo', async () => {
      const request = createMockRequest('http://localhost:3000/api/todos/1');
      const params = createMockParams('1');
      
      const response = await GET(request, params);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.id).toBe('1');
      expect(data.title).toBe('Test Todo 1');
      expect(mockDbManager.getAllTodos).toHaveBeenCalledTimes(1);
    });

    it('should return 404 for non-existent todo', async () => {
      const request = createMockRequest('http://localhost:3000/api/todos/999');
      const params = createMockParams('999');
      
      const response = await GET(request, params);
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe('Todo not found');
    });

    it('should handle database errors', async () => {
      mockDbManager.getAllTodos.mockRejectedValue(new Error('Database error'));
      
      const request = createMockRequest('http://localhost:3000/api/todos/1');
      const params = createMockParams('1');
      
      const response = await GET(request, params);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Failed to fetch todo');
    });
  });

  describe('PUT', () => {
    it('should update a todo with all fields', async () => {
      const updateData = {
        title: 'Updated Todo',
        description: 'Updated Description',
        completed: true,
        priority: 'low',
        dueDate: '2024-12-30T23:59:59.999Z',
        tags: ['updated', 'test'],
      };

      const request = createMockRequest('http://localhost:3000/api/todos/1', {
        method: 'PUT',
        body: JSON.stringify(updateData),
        headers: { 'Content-Type': 'application/json' },
      });
      const params = createMockParams('1');
      
      const response = await PUT(request, params);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.title).toBe('Updated Todo');
      expect(data.description).toBe('Updated Description');
      expect(data.completed).toBe(true);
      expect(data.priority).toBe('low');
      expect(data.tags).toEqual(['updated', 'test']);
      expect(data.updatedAt).toBeDefined();
      expect(mockDbManager.updateTodo).toHaveBeenCalledWith(expect.objectContaining({
        id: '1',
        title: 'Updated Todo',
        description: 'Updated Description',
        completed: true,
        priority: 'low',
        tags: ['updated', 'test'],
      }));
    });

    it('should update a todo with partial fields', async () => {
      const updateData = {
        title: 'Partially Updated Todo',
        completed: true,
      };

      const request = createMockRequest('http://localhost:3000/api/todos/1', {
        method: 'PUT',
        body: JSON.stringify(updateData),
        headers: { 'Content-Type': 'application/json' },
      });
      const params = createMockParams('1');
      
      const response = await PUT(request, params);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.title).toBe('Partially Updated Todo');
      expect(data.completed).toBe(true);
      expect(data.description).toBe('Description 1'); // Original value preserved
      expect(data.priority).toBe('high'); // Original value preserved
    });

    it('should trim whitespace from title and description', async () => {
      const updateData = {
        title: '  Trimmed Title  ',
        description: '  Trimmed Description  ',
      };

      const request = createMockRequest('http://localhost:3000/api/todos/1', {
        method: 'PUT',
        body: JSON.stringify(updateData),
        headers: { 'Content-Type': 'application/json' },
      });
      const params = createMockParams('1');
      
      const response = await PUT(request, params);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.title).toBe('Trimmed Title');
      expect(data.description).toBe('Trimmed Description');
    });

    it('should filter out invalid tags', async () => {
      const updateData = {
        tags: ['valid', '', '  ', 123, null, 'another-valid'],
      };

      const request = createMockRequest('http://localhost:3000/api/todos/1', {
        method: 'PUT',
        body: JSON.stringify(updateData),
        headers: { 'Content-Type': 'application/json' },
      });
      const params = createMockParams('1');
      
      const response = await PUT(request, params);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.tags).toEqual(['valid', 'another-valid']);
    });

    it('should handle dueDate correctly', async () => {
      const updateData = {
        dueDate: '2024-12-31T23:59:59.999Z',
      };

      const request = createMockRequest('http://localhost:3000/api/todos/1', {
        method: 'PUT',
        body: JSON.stringify(updateData),
        headers: { 'Content-Type': 'application/json' },
      });
      const params = createMockParams('1');
      
      const response = await PUT(request, params);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.dueDate).toBeDefined();
    });

    it('should remove undefined values from updates', async () => {
      const updateData = {
        title: 'Updated Title',
        description: undefined,
        tags: undefined,
      };

      const request = createMockRequest('http://localhost:3000/api/todos/1', {
        method: 'PUT',
        body: JSON.stringify(updateData),
        headers: { 'Content-Type': 'application/json' },
      });
      const params = createMockParams('1');
      
      const response = await PUT(request, params);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.title).toBe('Updated Title');
      expect(data.description).toBe('Description 1'); // Original preserved
      expect(data.tags).toEqual(['work', 'urgent']); // Original preserved
    });

    it('should return 400 for invalid title', async () => {
      const updateData = { title: '' };

      const request = createMockRequest('http://localhost:3000/api/todos/1', {
        method: 'PUT',
        body: JSON.stringify(updateData),
        headers: { 'Content-Type': 'application/json' },
      });
      const params = createMockParams('1');
      
      const response = await PUT(request, params);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Title must be a non-empty string');
    });

    it('should return 400 for non-string title', async () => {
      const updateData = { title: 123 };

      const request = createMockRequest('http://localhost:3000/api/todos/1', {
        method: 'PUT',
        body: JSON.stringify(updateData),
        headers: { 'Content-Type': 'application/json' },
      });
      const params = createMockParams('1');
      
      const response = await PUT(request, params);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Title must be a non-empty string');
    });

    it('should return 404 for non-existent todo', async () => {
      const updateData = { title: 'Updated Title' };

      const request = createMockRequest('http://localhost:3000/api/todos/999', {
        method: 'PUT',
        body: JSON.stringify(updateData),
        headers: { 'Content-Type': 'application/json' },
      });
      const params = createMockParams('999');
      
      const response = await PUT(request, params);
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe('Todo not found');
    });

    it('should handle database errors', async () => {
      mockDbManager.getAllTodos.mockRejectedValue(new Error('Database error'));
      
      const updateData = { title: 'Updated Title' };
      const request = createMockRequest('http://localhost:3000/api/todos/1', {
        method: 'PUT',
        body: JSON.stringify(updateData),
        headers: { 'Content-Type': 'application/json' },
      });
      const params = createMockParams('1');
      
      const response = await PUT(request, params);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Failed to update todo');
    });
  });

  describe('DELETE', () => {
    it('should delete an existing todo', async () => {
      const request = createMockRequest('http://localhost:3000/api/todos/1', {
        method: 'DELETE',
      });
      const params = createMockParams('1');
      
      const response = await DELETE(request, params);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.message).toBe('Todo deleted successfully');
      expect(mockDbManager.deleteTodo).toHaveBeenCalledWith('1');
    });

    it('should return 404 for non-existent todo', async () => {
      const request = createMockRequest('http://localhost:3000/api/todos/999', {
        method: 'DELETE',
      });
      const params = createMockParams('999');
      
      const response = await DELETE(request, params);
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe('Todo not found');
      expect(mockDbManager.deleteTodo).not.toHaveBeenCalled();
    });

    it('should handle database errors', async () => {
      mockDbManager.getAllTodos.mockRejectedValue(new Error('Database error'));
      
      const request = createMockRequest('http://localhost:3000/api/todos/1', {
        method: 'DELETE',
      });
      const params = createMockParams('1');
      
      const response = await DELETE(request, params);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Failed to delete todo');
    });
  });

  describe('PATCH', () => {
    it('should partially update a todo', async () => {
      const patchData = { completed: true };

      const request = createMockRequest('http://localhost:3000/api/todos/1', {
        method: 'PATCH',
        body: JSON.stringify(patchData),
        headers: { 'Content-Type': 'application/json' },
      });
      const params = createMockParams('1');
      
      const response = await PATCH(request, params);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.completed).toBe(true);
      expect(data.title).toBe('Test Todo 1'); // Original value preserved
      expect(data.description).toBe('Description 1'); // Original value preserved
      expect(data.updatedAt).toBeDefined();
      expect(mockDbManager.updateTodo).toHaveBeenCalledWith(expect.objectContaining({
        id: '1',
        completed: true,
        title: 'Test Todo 1',
        description: 'Description 1',
      }));
    });

    it('should update multiple fields at once', async () => {
      const patchData = {
        completed: true,
        priority: 'low',
        tags: ['updated'],
      };

      const request = createMockRequest('http://localhost:3000/api/todos/1', {
        method: 'PATCH',
        body: JSON.stringify(patchData),
        headers: { 'Content-Type': 'application/json' },
      });
      const params = createMockParams('1');
      
      const response = await PATCH(request, params);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.completed).toBe(true);
      expect(data.priority).toBe('low');
      expect(data.tags).toEqual(['updated']);
      expect(data.title).toBe('Test Todo 1'); // Original value preserved
    });

    it('should return 404 for non-existent todo', async () => {
      const patchData = { completed: true };

      const request = createMockRequest('http://localhost:3000/api/todos/999', {
        method: 'PATCH',
        body: JSON.stringify(patchData),
        headers: { 'Content-Type': 'application/json' },
      });
      const params = createMockParams('999');
      
      const response = await PATCH(request, params);
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe('Todo not found');
      expect(mockDbManager.updateTodo).not.toHaveBeenCalled();
    });

    it('should handle database errors', async () => {
      mockDbManager.getAllTodos.mockRejectedValue(new Error('Database error'));
      
      const patchData = { completed: true };
      const request = createMockRequest('http://localhost:3000/api/todos/1', {
        method: 'PATCH',
        body: JSON.stringify(patchData),
        headers: { 'Content-Type': 'application/json' },
      });
      const params = createMockParams('1');
      
      const response = await PATCH(request, params);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Failed to patch todo');
    });
  });
});