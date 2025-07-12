'use client';

import React, { useEffect } from 'react';
import { Header } from '@/components/Header';
import { TodoList } from '@/components/TodoList';
import { TodoForm } from '@/components/TodoForm';
import { FilterDrawer } from '@/components/FilterDrawer';
import { useTodoStore } from '@/store/todoStore';
import { useUIStore } from '@/store/uiStore';

export default function Home() {
  const { loadTodos, editingTodo } = useTodoStore();
  const { 
    isAddTodoModalOpen, 
    isEditTodoModalOpen, 
    closeAddTodoModal, 
    closeEditTodoModal 
  } = useUIStore();

  // Load todos on component mount
  useEffect(() => {
    loadTodos();
  }, [loadTodos]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <Header />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-4xl mx-auto">
          <TodoList />
        </div>
      </main>

      {/* Modals */}
      <TodoForm
        isOpen={isAddTodoModalOpen}
        onClose={closeAddTodoModal}
        mode="add"
      />

      <TodoForm
        isOpen={isEditTodoModalOpen}
        onClose={closeEditTodoModal}
        mode="edit"
        todo={editingTodo || undefined}
      />

      {/* Filter Drawer */}
      <FilterDrawer />
    </div>
  );
}
