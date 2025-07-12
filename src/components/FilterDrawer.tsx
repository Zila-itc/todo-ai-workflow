import React from 'react';
import { Button } from './Button';
import { Select } from './Input';
import { useTodoStore } from '@/store/todoStore';
import { useUIStore } from '@/store/uiStore';
import { X, RotateCcw } from 'lucide-react';
import { cn } from '@/utils/cn';

export const FilterDrawer: React.FC = () => {
  const { filter, setFilter, clearFilter, getAllTags } = useTodoStore();
  const { isFilterDrawerOpen, closeFilterDrawer } = useUIStore();

  const allTags = getAllTags();

  const statusOptions = [
    { value: 'all', label: 'All Todos' },
    { value: 'active', label: 'Active' },
    { value: 'completed', label: 'Completed' },
  ];

  const priorityOptions = [
    { value: 'all', label: 'All Priorities' },
    { value: 'high', label: 'High Priority' },
    { value: 'medium', label: 'Medium Priority' },
    { value: 'low', label: 'Low Priority' },
  ];

  const handleStatusChange = (status: string) => {
    setFilter({ 
      status: status === 'all' ? undefined : status as 'active' | 'completed' 
    });
  };

  const handlePriorityChange = (priority: string) => {
    setFilter({ 
      priority: priority === 'all' ? undefined : priority as 'low' | 'medium' | 'high' 
    });
  };

  const handleTagToggle = (tag: string) => {
    const currentTags = filter.tags || [];
    const newTags = currentTags.includes(tag)
      ? currentTags.filter(t => t !== tag)
      : [...currentTags, tag];
    
    setFilter({ tags: newTags.length > 0 ? newTags : undefined });
  };

  const handleClearFilters = () => {
    clearFilter();
  };

  const hasActiveFilters = filter.status || filter.priority || (filter.tags && filter.tags.length > 0);

  return (
    <>
      {/* Backdrop */}
      {isFilterDrawerOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={closeFilterDrawer}
        />
      )}

      {/* Drawer */}
      <div className={cn(
        'fixed right-0 top-0 h-full w-80 bg-white dark:bg-gray-900 shadow-xl z-50 transform transition-transform duration-300 ease-in-out',
        isFilterDrawerOpen ? 'translate-x-0' : 'translate-x-full'
      )}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Filter Todos
          </h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={closeFilterDrawer}
            className="p-2"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-6">
          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Status
            </label>
            <Select
              value={filter.status || 'all'}
              onChange={(e) => handleStatusChange(e.target.value)}
              options={statusOptions}
            />
          </div>

          {/* Priority Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Priority
            </label>
            <Select
              value={filter.priority || 'all'}
              onChange={(e) => handlePriorityChange(e.target.value)}
              options={priorityOptions}
            />
          </div>

          {/* Tags Filter */}
          {allTags.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Tags
              </label>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {allTags.map((tag) => {
                  const isSelected = filter.tags?.includes(tag) || false;
                  return (
                    <label
                      key={tag}
                      className="flex items-center space-x-2 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleTagToggle(tag)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        #{tag}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>
          )}

          {/* Clear Filters */}
          {hasActiveFilters && (
            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
              <Button
                variant="secondary"
                onClick={handleClearFilters}
                className="w-full flex items-center justify-center space-x-2"
              >
                <RotateCcw className="h-4 w-4" />
                <span>Clear All Filters</span>
              </Button>
            </div>
          )}

          {/* Filter Summary */}
          {hasActiveFilters && (
            <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
              <h3 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">
                Active Filters:
              </h3>
              <div className="space-y-1 text-xs text-blue-700 dark:text-blue-300">
                {filter.status && (
                  <div>Status: {filter.status}</div>
                )}
                {filter.priority && (
                  <div>Priority: {filter.priority}</div>
                )}
                {filter.tags && filter.tags.length > 0 && (
                  <div>Tags: {filter.tags.map(tag => `#${tag}`).join(', ')}</div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};