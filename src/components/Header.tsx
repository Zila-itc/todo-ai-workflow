import React from 'react';
import { Button } from './Button';
import { Input } from './Input';
import { useTodoStore } from '@/store/todoStore';
import { useUIStore } from '@/store/uiStore';
import { 
  Plus, 
  Search, 
  Filter, 
  Menu, 
  CheckSquare,
  Sun,
  Moon,
  Monitor
} from 'lucide-react';
import { cn } from '@/utils/cn';

export const Header: React.FC = () => {
  const { filter, setFilter, getStats } = useTodoStore();
  const { 
    openAddTodoModal, 
    toggleFilterDrawer, 
    toggleMobileMenu,
    toggleBulkMode,
    isBulkMode,
    theme,
    setTheme
  } = useUIStore();

  const stats = getStats();

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilter({ search: e.target.value });
  };

  const cycleTheme = () => {
    const themes: Array<'light' | 'dark' | 'system'> = ['light', 'dark', 'system'];
    const currentIndex = themes.indexOf(theme);
    const nextIndex = (currentIndex + 1) % themes.length;
    setTheme(themes[nextIndex]);
  };

  const getThemeIcon = () => {
    switch (theme) {
      case 'light':
        return <Sun className="h-4 w-4" />;
      case 'dark':
        return <Moon className="h-4 w-4" />;
      default:
        return <Monitor className="h-4 w-4" />;
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left section */}
          <div className="flex items-center space-x-4">
            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleMobileMenu}
              className="md:hidden p-2"
            >
              <Menu className="h-5 w-5" />
            </Button>

            {/* Logo/Title */}
            <div className="flex items-center space-x-2">
              <CheckSquare className="h-8 w-8 text-blue-600" />
              <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                TodoApp
              </h1>
            </div>

            {/* Stats */}
            <div className="hidden sm:flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
              <span>{stats.active} active</span>
              <span>{stats.completed} completed</span>
              {stats.overdue > 0 && (
                <span className="text-red-600 dark:text-red-400">
                  {stats.overdue} overdue
                </span>
              )}
            </div>
          </div>

          {/* Center section - Search */}
          <div className="flex-1 max-w-lg mx-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search todos..."
                value={filter.search || ''}
                onChange={handleSearchChange}
                className="pl-10 w-full"
              />
            </div>
          </div>

          {/* Right section */}
          <div className="flex items-center space-x-2">
            {/* Theme toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={cycleTheme}
              className="p-2"
              title={`Current theme: ${theme}`}
            >
              {getThemeIcon()}
            </Button>

            {/* Bulk mode toggle */}
            <Button
              variant={isBulkMode ? 'primary' : 'ghost'}
              size="sm"
              onClick={toggleBulkMode}
              className="p-2"
              title="Toggle bulk selection mode"
            >
              <CheckSquare className={cn(
                'h-4 w-4',
                isBulkMode && 'text-white'
              )} />
            </Button>

            {/* Filter toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleFilterDrawer}
              className="p-2"
            >
              <Filter className="h-4 w-4" />
            </Button>

            {/* Add todo button */}
            <Button
              onClick={openAddTodoModal}
              size="sm"
              className="flex items-center space-x-2"
            >
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Add Todo</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile stats */}
      <div className="sm:hidden px-4 pb-3">
        <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
          <span>{stats.active} active</span>
          <span>{stats.completed} completed</span>
          {stats.overdue > 0 && (
            <span className="text-red-600 dark:text-red-400">
              {stats.overdue} overdue
            </span>
          )}
        </div>
      </div>
    </header>
  );
};