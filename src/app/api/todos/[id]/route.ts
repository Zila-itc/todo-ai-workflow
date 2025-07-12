import { NextRequest, NextResponse } from 'next/server';
import { Todo } from '@/types/todo';
import { dbManager } from '@/utils/indexedDB';

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

// GET /api/todos/[id] - Get a specific todo
export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id } = await params;
    const todos = await dbManager.getAllTodos();
    const todo = todos.find(t => t.id === id);

    if (!todo) {
      return NextResponse.json(
        { error: 'Todo not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(todo);
  } catch (error) {
    console.error('Error fetching todo:', error);
    return NextResponse.json(
      { error: 'Failed to fetch todo' },
      { status: 500 }
    );
  }
}

// PUT /api/todos/[id] - Update a specific todo
export async function PUT(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id } = await params;
    const body = await request.json();
    
    // Validate required fields if provided
    if (body.title !== undefined) {
      if (typeof body.title !== 'string' || body.title.trim().length === 0) {
        return NextResponse.json(
          { error: 'Title must be a non-empty string' },
          { status: 400 }
        );
      }
    }

    // Prepare updates
    const updates: Partial<Todo> = {
      ...body,
      title: body.title?.trim(),
      description: body.description?.trim(),
      dueDate: body.dueDate ? new Date(body.dueDate) : undefined,
      tags: Array.isArray(body.tags)
        ? body.tags.filter((tag: unknown) => typeof tag === 'string' && tag.trim())
        : undefined,
    };

    // Remove undefined values
    Object.keys(updates).forEach(key => {
      if (updates[key as keyof Todo] === undefined) {
        delete updates[key as keyof Todo];
      }
    });

    const todos = await dbManager.getAllTodos();
    const existingTodo = todos.find(t => t.id === id);
    
    if (!existingTodo) {
      return NextResponse.json(
        { error: 'Todo not found' },
        { status: 404 }
      );
    }
    
    const updatedTodo = {
      ...existingTodo,
      ...updates,
      updatedAt: new Date(),
    };
    
    await dbManager.updateTodo(updatedTodo);

    return NextResponse.json(updatedTodo);
  } catch (error) {
    console.error('Error updating todo:', error);
    return NextResponse.json(
      { error: 'Failed to update todo' },
      { status: 500 }
    );
  }
}

// DELETE /api/todos/[id] - Delete a specific todo
export async function DELETE(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id } = await params;
    
    // Check if todo exists first
    const todos = await dbManager.getAllTodos();
    const existingTodo = todos.find(t => t.id === id);
    
    if (!existingTodo) {
      return NextResponse.json(
        { error: 'Todo not found' },
        { status: 404 }
      );
    }
    
    await dbManager.deleteTodo(id);

    return NextResponse.json({ message: 'Todo deleted successfully' });
  } catch (error) {
    console.error('Error deleting todo:', error);
    return NextResponse.json(
      { error: 'Failed to delete todo' },
      { status: 500 }
    );
  }
}

// PATCH /api/todos/[id] - Partially update a todo (e.g., toggle completion)
export async function PATCH(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id } = await params;
    const body = await request.json();
    
    const todos = await dbManager.getAllTodos();
    const existingTodo = todos.find(t => t.id === id);
    
    if (!existingTodo) {
      return NextResponse.json(
        { error: 'Todo not found' },
        { status: 404 }
      );
    }
    
    const updatedTodo = {
      ...existingTodo,
      ...body,
      updatedAt: new Date(),
    };
    
    await dbManager.updateTodo(updatedTodo);

    return NextResponse.json(updatedTodo);
  } catch (error) {
    console.error('Error patching todo:', error);
    return NextResponse.json(
      { error: 'Failed to patch todo' },
      { status: 500 }
    );
  }
}