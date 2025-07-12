import React from 'react';
import { TodoCard } from './TodoCard';
import { Button } from './Button';
import { useTodoStore } from '@/store/todoStore';
import { useUIStore } from '@/store/uiStore';
import { 
  CheckSquare, 
  Square, 
  Trash2, 
  // Archive,
  ListTodo,
  Search
} from 'lucide-react';
// import { cn } from '@/utils/cn';

export const TodoList: React.FC = () => {
  const { 
    getFilteredTodos, 
    getStats, 
    deleteTodos, 
    toggleTodos,
    filter,
    loading 
  } = useTodoStore();
  
  const { 
    isBulkMode, 
    selectedTodoIds, 
    selectAllTodos, 
    clearSelection, 
    toggleBulkMode,
    toggleTodoSelection
  } = useUIStore();

  const todos = getFilteredTodos();
  const stats = getStats();
  const selectedCount = selectedTodoIds.length;
  const allSelected = todos.length > 0 && selectedTodoIds.length === todos.length;

  const handleSelectAll = () => {
    if (allSelected) {
      clearSelection();
    } else {
      selectAllTodos(todos.map(todo => todo.id));
    }
  };

  const handleBulkDelete = async () => {
    if (selectedTodoIds.length === 0) return;
    
    if (confirm(`Are you sure you want to delete ${selectedCount} todo(s)?`)) {
      await deleteTodos(selectedTodoIds);
      clearSelection();
    }
  };

  const handleBulkToggle = async () => {
    if (selectedTodoIds.length === 0) return;
    
    await toggleTodos(selectedTodoIds);
    clearSelection();
  };

  const handleExitBulkMode = () => {
    clearSelection();
    toggleBulkMode();
  };

  // Show loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Show empty state
  if (todos.length === 0) {
    const hasFilters = filter.status || filter.priority || filter.search || (filter.tags && filter.tags.length > 0);
    
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        {hasFilters ? (
          <>
            <Search className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
              No todos match your filters
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              Try adjusting your search criteria or clearing filters.
            </p>
          </>
        ) : (
          <>
            <ListTodo className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
              No todos yet
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              Create your first &quot;todo&quot; to get started!
            </p>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Bulk actions bar */}
      {isBulkMode && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={handleSelectAll}
                className="flex items-center space-x-2 text-sm font-medium text-blue-700 dark:text-blue-300 hover:text-blue-900 dark:hover:text-blue-100"
              >
                {allSelected ? (
                  <CheckSquare className="h-4 w-4" />
                ) : (
                  <Square className="h-4 w-4" />
                )}
                <span>
                  {allSelected ? 'Deselect All' : 'Select All'} ({todos.length})
                </span>
              </button>
              
              {selectedCount > 0 && (
                <span className="text-sm text-blue-600 dark:text-blue-400">
                  {selectedCount} selected
                </span>
              )}
            </div>

            <div className="flex items-center space-x-2">
              {selectedCount > 0 && (
                <>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={handleBulkToggle}
                    className="flex items-center space-x-1"
                  >
                    <CheckSquare className="h-4 w-4" />
                    <span>Toggle</span>
                  </Button>
                  
                  <Button
                    size="sm"
                    variant="danger"
                    onClick={handleBulkDelete}
                    className="flex items-center space-x-1"
                  >
                    <Trash2 className="h-4 w-4" />
                    <span>Delete</span>
                  </Button>
                </>
              )}
              
              <Button
                size="sm"
                variant="ghost"
                onClick={handleExitBulkMode}
              >
                Exit
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Todo list */}
      <div className="space-y-3">
        {todos.map((todo) => (
          <TodoCard
            key={todo.id}
            todo={todo}
            isSelected={selectedTodoIds.includes(todo.id)}
            onSelect={toggleTodoSelection}
          />
        ))}
      </div>

      {/* List summary */}
      <div className="text-center py-4 text-sm text-gray-500 dark:text-gray-400">
        Showing {todos.length} of {stats.total} todos
        {filter.search && (
          <span> matching &quot;{filter.search}&quot;</span>
        )}
      </div>
    </div>
  );
};