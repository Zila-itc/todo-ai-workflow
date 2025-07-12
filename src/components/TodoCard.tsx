import React from 'react';
import { Todo } from '@/types/todo';
import { Card, CardContent } from './Card';
import { Button } from './Button';
import { cn } from '@/utils/cn';
import { 
  Calendar, 
  Edit, 
  Trash2, 
  CheckCircle, 
  Circle, 
  AlertCircle,
  Flag
} from 'lucide-react';
import { useTodoStore } from '@/store/todoStore';
import { useUIStore } from '@/store/uiStore';

interface TodoCardProps {
  todo: Todo;
  isSelected?: boolean;
  onSelect?: (todoId: string) => void;
}

export const TodoCard: React.FC<TodoCardProps> = ({ 
  todo, 
  isSelected = false, 
  onSelect 
}) => {
  const { toggleTodo } = useTodoStore();
  const { 
    openEditTodoModal, 
    openDeleteConfirmModal, 
    isBulkMode 
  } = useUIStore();

  const isOverdue = todo.dueDate && !todo.completed && new Date() > todo.dueDate;
  
  const priorityColors = {
    low: 'text-green-600 dark:text-green-400',
    medium: 'text-yellow-600 dark:text-yellow-400',
    high: 'text-red-600 dark:text-red-400',
  };

  const handleToggleComplete = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleTodo(todo.id);
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    openEditTodoModal(todo.id);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    openDeleteConfirmModal(todo.id);
  };

  const handleCardClick = () => {
    if (isBulkMode && onSelect) {
      onSelect(todo.id);
    }
  };

  return (
    <Card 
      className={cn(
        'transition-all duration-200',
        todo.completed && 'opacity-75',
        isOverdue && !todo.completed && 'border-red-300 dark:border-red-700',
        isSelected && 'ring-2 ring-blue-500 border-blue-500',
        isBulkMode && 'cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700'
      )}
      onClick={handleCardClick}
      hover={isBulkMode}
    >
      <CardContent className="p-4">
        <div className="flex items-start space-x-3">
          {/* Checkbox */}
          <button
            onClick={handleToggleComplete}
            className="flex-shrink-0 mt-0.5 text-gray-400 hover:text-blue-600 transition-colors"
          >
            {todo.completed ? (
              <CheckCircle className="h-5 w-5 text-green-600" />
            ) : (
              <Circle className="h-5 w-5" />
            )}
          </button>

          {/* Content */}
          <div className="flex-1 min-w-0">
            {/* Title */}
            <h3 className={cn(
              'text-sm font-medium text-gray-900 dark:text-gray-100',
              todo.completed && 'line-through text-gray-500 dark:text-gray-400'
            )}>
              {todo.title}
            </h3>

            {/* Description */}
            {todo.description && (
              <p className={cn(
                'mt-1 text-sm text-gray-600 dark:text-gray-300',
                todo.completed && 'line-through text-gray-400 dark:text-gray-500'
              )}>
                {todo.description}
              </p>
            )}

            {/* Meta information */}
            <div className="mt-2 flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
              {/* Priority */}
              <div className="flex items-center space-x-1">
                <Flag className={cn('h-3 w-3', priorityColors[todo.priority])} />
                <span className="capitalize">{todo.priority}</span>
              </div>

              {/* Due date */}
              {todo.dueDate && (
                <div className={cn(
                  'flex items-center space-x-1',
                  isOverdue && 'text-red-600 dark:text-red-400'
                )}>
                  <Calendar className="h-3 w-3" />
                  <span>
                    {todo.dueDate.toLocaleDateString()}
                    {isOverdue && (
                      <AlertCircle className="inline h-3 w-3 ml-1" />
                    )}
                  </span>
                </div>
              )}

              {/* Tags */}
              {todo.tags.length > 0 && (
                <div className="flex items-center space-x-1">
                  <span>#</span>
                  <span>{todo.tags.join(', ')}</span>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          {!isBulkMode && (
            <div className="flex items-center space-x-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleEdit}
                className="p-1 h-8 w-8"
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDelete}
                className="p-1 h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          )}

          {/* Bulk selection indicator */}
          {isBulkMode && (
            <div className="flex-shrink-0">
              <div className={cn(
                'w-4 h-4 rounded border-2 transition-colors',
                isSelected 
                  ? 'bg-blue-600 border-blue-600' 
                  : 'border-gray-300 dark:border-gray-600'
              )}>
                {isSelected && (
                  <CheckCircle className="h-3 w-3 text-white" />
                )}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};