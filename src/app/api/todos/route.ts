import { NextRequest, NextResponse } from 'next/server';
import { Todo } from '@/types/todo';
import { dbManager } from '@/utils/indexedDB';

// GET /api/todos - Get all todos
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const priority = searchParams.get('priority');
    const tags = searchParams.get('tags')?.split(',').filter(Boolean);
    const search = searchParams.get('search');

    const todos = await dbManager.getAllTodos();
    let filteredTodos = [...todos];

    // Filter by status
    if (status === 'active') {
      filteredTodos = filteredTodos.filter(todo => !todo.completed);
    } else if (status === 'completed') {
      filteredTodos = filteredTodos.filter(todo => todo.completed);
    }

    // Filter by priority
    if (priority && priority !== 'all') {
      filteredTodos = filteredTodos.filter(todo => todo.priority === priority);
    }

    // Filter by tags
    if (tags && tags.length > 0) {
      filteredTodos = filteredTodos.filter(todo => 
        tags.some(tag => todo.tags.includes(tag))
      );
    }

    // Filter by search
    if (search) {
      const searchLower = search.toLowerCase();
      filteredTodos = filteredTodos.filter(todo => 
        todo.title.toLowerCase().includes(searchLower) ||
        (todo.description && todo.description.toLowerCase().includes(searchLower)) ||
        todo.tags.some(tag => tag.toLowerCase().includes(searchLower))
      );
    }

    // Sort by creation date (newest first)
    filteredTodos.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    return NextResponse.json({
      todos: filteredTodos,
      total: todos.length,
      filtered: filteredTodos.length
    });
  } catch (error) {
    console.error('Error fetching todos:', error);
    return NextResponse.json(
      { error: 'Failed to fetch todos' },
      { status: 500 }
    );
  }
}

// POST /api/todos - Create a new todo
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, description, priority = 'medium', dueDate, tags = [] } = body;

    if (!title || typeof title !== 'string' || title.trim().length === 0) {
      return NextResponse.json(
        { error: 'Title is required and must be a non-empty string' },
        { status: 400 }
      );
    }

    const newTodo: Todo = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      title: title.trim(),
      description: description?.trim() || undefined,
      completed: false,
      priority: priority as 'low' | 'medium' | 'high',
      dueDate: dueDate ? new Date(dueDate) : undefined,
      tags: Array.isArray(tags) ? tags.filter(tag => typeof tag === 'string' && tag.trim()) : [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await dbManager.addTodo(newTodo);

    return NextResponse.json(newTodo, { status: 201 });
  } catch (error) {
    console.error('Error creating todo:', error);
    return NextResponse.json(
      { error: 'Failed to create todo' },
      { status: 500 }
    );
  }
}

// PUT /api/todos - Bulk update todos
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { ids, updates } = body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { error: 'IDs array is required' },
        { status: 400 }
      );
    }

    const todos = await dbManager.getAllTodos();
    const updatedTodos: Todo[] = [];
    
    for (const id of ids) {
      const todo = todos.find(t => t.id === id);
      if (todo) {
        const updatedTodo = {
          ...todo,
          ...updates,
          updatedAt: new Date(),
        };
        await dbManager.updateTodo(updatedTodo);
        updatedTodos.push(updatedTodo);
      }
    }

    return NextResponse.json({
      updated: updatedTodos,
      count: updatedTodos.length
    });
  } catch (error) {
    console.error('Error bulk updating todos:', error);
    return NextResponse.json(
      { error: 'Failed to update todos' },
      { status: 500 }
    );
  }
}

// DELETE /api/todos - Bulk delete todos
export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { ids } = body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { error: 'IDs array is required' },
        { status: 400 }
      );
    }

    const deletedIds: string[] = [];
    
    for (const id of ids) {
      try {
        await dbManager.deleteTodo(id);
        deletedIds.push(id);
      } catch (error) {
        console.error(`Failed to delete todo ${id}:`, error);
      }
    }

    return NextResponse.json({
      deleted: deletedIds,
      count: deletedIds.length
    });
  } catch (error) {
    console.error('Error bulk deleting todos:', error);
    return NextResponse.json(
      { error: 'Failed to delete todos' },
      { status: 500 }
    );
  }
}