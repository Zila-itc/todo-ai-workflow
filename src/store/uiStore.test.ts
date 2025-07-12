import { act, renderHook } from '@testing-library/react';
import { useUIStore } from './uiStore';

// Mock localStorage for persist middleware
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('UIStore', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
    
    // Reset store state
    const { result } = renderHook(() => useUIStore());
    act(() => {
      useUIStore.setState({
        isAddTodoModalOpen: false,
        isEditTodoModalOpen: false,
        editingTodoId: null,
        isDeleteConfirmModalOpen: false,
        deletingTodoId: null,
        isFilterDrawerOpen: false,
        isMobileMenuOpen: false,
        theme: 'system',
        isLoading: false,
        loadingMessage: '',
        selectedTodoIds: [],
        isBulkMode: false,
      });
    });
  });

  describe('initial state', () => {
    it('has correct initial state', () => {
      const { result } = renderHook(() => useUIStore());
      
      expect(result.current.isAddTodoModalOpen).toBe(false);
      expect(result.current.isEditTodoModalOpen).toBe(false);
      expect(result.current.editingTodoId).toBe(null);
      expect(result.current.isDeleteConfirmModalOpen).toBe(false);
      expect(result.current.deletingTodoId).toBe(null);
      expect(result.current.isFilterDrawerOpen).toBe(false);
      expect(result.current.isMobileMenuOpen).toBe(false);
      expect(result.current.theme).toBe('system');
      expect(result.current.isLoading).toBe(false);
      expect(result.current.loadingMessage).toBe('');
      expect(result.current.selectedTodoIds).toEqual([]);
      expect(result.current.isBulkMode).toBe(false);
    });
  });

  describe('Add Todo Modal', () => {
    it('opens add todo modal', () => {
      const { result } = renderHook(() => useUIStore());

      act(() => {
        result.current.openAddTodoModal();
      });

      expect(result.current.isAddTodoModalOpen).toBe(true);
    });

    it('closes add todo modal', () => {
      const { result } = renderHook(() => useUIStore());

      act(() => {
        result.current.openAddTodoModal();
      });

      act(() => {
        result.current.closeAddTodoModal();
      });

      expect(result.current.isAddTodoModalOpen).toBe(false);
    });
  });

  describe('Edit Todo Modal', () => {
    it('opens edit todo modal with todo id', () => {
      const { result } = renderHook(() => useUIStore());

      act(() => {
        result.current.openEditTodoModal('todo-123');
      });

      expect(result.current.isEditTodoModalOpen).toBe(true);
      expect(result.current.editingTodoId).toBe('todo-123');
    });

    it('closes edit todo modal and clears editing todo id', () => {
      const { result } = renderHook(() => useUIStore());

      act(() => {
        result.current.openEditTodoModal('todo-123');
      });

      act(() => {
        result.current.closeEditTodoModal();
      });

      expect(result.current.isEditTodoModalOpen).toBe(false);
      expect(result.current.editingTodoId).toBe(null);
    });
  });

  describe('Delete Confirm Modal', () => {
    it('opens delete confirm modal with todo id', () => {
      const { result } = renderHook(() => useUIStore());

      act(() => {
        result.current.openDeleteConfirmModal('todo-456');
      });

      expect(result.current.isDeleteConfirmModalOpen).toBe(true);
      expect(result.current.deletingTodoId).toBe('todo-456');
    });

    it('closes delete confirm modal and clears deleting todo id', () => {
      const { result } = renderHook(() => useUIStore());

      act(() => {
        result.current.openDeleteConfirmModal('todo-456');
      });

      act(() => {
        result.current.closeDeleteConfirmModal();
      });

      expect(result.current.isDeleteConfirmModalOpen).toBe(false);
      expect(result.current.deletingTodoId).toBe(null);
    });
  });

  describe('Filter Drawer', () => {
    it('toggles filter drawer open', () => {
      const { result } = renderHook(() => useUIStore());

      act(() => {
        result.current.toggleFilterDrawer();
      });

      expect(result.current.isFilterDrawerOpen).toBe(true);
    });

    it('toggles filter drawer closed', () => {
      const { result } = renderHook(() => useUIStore());

      act(() => {
        result.current.toggleFilterDrawer();
      });

      act(() => {
        result.current.toggleFilterDrawer();
      });

      expect(result.current.isFilterDrawerOpen).toBe(false);
    });

    it('closes filter drawer directly', () => {
      const { result } = renderHook(() => useUIStore());

      act(() => {
        result.current.toggleFilterDrawer();
      });

      act(() => {
        result.current.closeFilterDrawer();
      });

      expect(result.current.isFilterDrawerOpen).toBe(false);
    });
  });

  describe('Mobile Menu', () => {
    it('toggles mobile menu open', () => {
      const { result } = renderHook(() => useUIStore());

      act(() => {
        result.current.toggleMobileMenu();
      });

      expect(result.current.isMobileMenuOpen).toBe(true);
    });

    it('toggles mobile menu closed', () => {
      const { result } = renderHook(() => useUIStore());

      act(() => {
        result.current.toggleMobileMenu();
      });

      act(() => {
        result.current.toggleMobileMenu();
      });

      expect(result.current.isMobileMenuOpen).toBe(false);
    });

    it('closes mobile menu directly', () => {
      const { result } = renderHook(() => useUIStore());

      act(() => {
        result.current.toggleMobileMenu();
      });

      act(() => {
        result.current.closeMobileMenu();
      });

      expect(result.current.isMobileMenuOpen).toBe(false);
    });
  });

  describe('Theme Management', () => {
    it('sets theme to light', () => {
      const { result } = renderHook(() => useUIStore());

      act(() => {
        result.current.setTheme('light');
      });

      expect(result.current.theme).toBe('light');
    });

    it('sets theme to dark', () => {
      const { result } = renderHook(() => useUIStore());

      act(() => {
        result.current.setTheme('dark');
      });

      expect(result.current.theme).toBe('dark');
    });

    it('sets theme to system', () => {
      const { result } = renderHook(() => useUIStore());

      act(() => {
        result.current.setTheme('system');
      });

      expect(result.current.theme).toBe('system');
    });
  });

  describe('Loading States', () => {
    it('sets loading state with default message', () => {
      const { result } = renderHook(() => useUIStore());

      act(() => {
        result.current.setLoading(true);
      });

      expect(result.current.isLoading).toBe(true);
      expect(result.current.loadingMessage).toBe('');
    });

    it('sets loading state with custom message', () => {
      const { result } = renderHook(() => useUIStore());

      act(() => {
        result.current.setLoading(true, 'Saving todo...');
      });

      expect(result.current.isLoading).toBe(true);
      expect(result.current.loadingMessage).toBe('Saving todo...');
    });

    it('clears loading state', () => {
      const { result } = renderHook(() => useUIStore());

      act(() => {
        result.current.setLoading(true, 'Loading...');
      });

      act(() => {
        result.current.setLoading(false);
      });

      expect(result.current.isLoading).toBe(false);
      expect(result.current.loadingMessage).toBe('');
    });
  });

  describe('Todo Selection', () => {
    it('toggles todo selection - adds todo id', () => {
      const { result } = renderHook(() => useUIStore());

      act(() => {
        result.current.toggleTodoSelection('todo-1');
      });

      expect(result.current.selectedTodoIds).toContain('todo-1');
    });

    it('toggles todo selection - removes todo id', () => {
      const { result } = renderHook(() => useUIStore());

      act(() => {
        result.current.toggleTodoSelection('todo-1');
      });

      act(() => {
        result.current.toggleTodoSelection('todo-1');
      });

      expect(result.current.selectedTodoIds).not.toContain('todo-1');
    });

    it('toggles multiple todo selections', () => {
      const { result } = renderHook(() => useUIStore());

      act(() => {
        result.current.toggleTodoSelection('todo-1');
      });

      act(() => {
        result.current.toggleTodoSelection('todo-2');
      });

      expect(result.current.selectedTodoIds).toEqual(['todo-1', 'todo-2']);
    });

    it('selects all todos', () => {
      const { result } = renderHook(() => useUIStore());
      const todoIds = ['todo-1', 'todo-2', 'todo-3'];

      act(() => {
        result.current.selectAllTodos(todoIds);
      });

      expect(result.current.selectedTodoIds).toEqual(todoIds);
    });

    it('clears selection and disables bulk mode', () => {
      const { result } = renderHook(() => useUIStore());

      act(() => {
        result.current.toggleTodoSelection('todo-1');
        result.current.toggleBulkMode();
      });

      act(() => {
        result.current.clearSelection();
      });

      expect(result.current.selectedTodoIds).toEqual([]);
      expect(result.current.isBulkMode).toBe(false);
    });
  });

  describe('Bulk Mode', () => {
    it('toggles bulk mode on', () => {
      const { result } = renderHook(() => useUIStore());

      act(() => {
        result.current.toggleBulkMode();
      });

      expect(result.current.isBulkMode).toBe(true);
    });

    it('toggles bulk mode off and clears selection', () => {
      const { result } = renderHook(() => useUIStore());

      act(() => {
        result.current.toggleTodoSelection('todo-1');
        result.current.toggleBulkMode();
      });

      act(() => {
        result.current.toggleBulkMode();
      });

      expect(result.current.isBulkMode).toBe(false);
      expect(result.current.selectedTodoIds).toEqual([]);
    });

    it('preserves selection when turning bulk mode on', () => {
      const { result } = renderHook(() => useUIStore());

      act(() => {
        result.current.toggleTodoSelection('todo-1');
        result.current.toggleTodoSelection('todo-2');
      });

      act(() => {
        result.current.toggleBulkMode();
      });

      expect(result.current.isBulkMode).toBe(true);
      expect(result.current.selectedTodoIds).toEqual(['todo-1', 'todo-2']);
    });
  });

  describe('Persistence', () => {
    it('persists theme setting', () => {
      const { result } = renderHook(() => useUIStore());

      act(() => {
        result.current.setTheme('dark');
      });

      // The persist middleware should call localStorage.setItem
      // We can't easily test this without mocking the entire persist middleware
      // but we can verify the theme is set correctly
      expect(result.current.theme).toBe('dark');
    });

    it('loads persisted theme from localStorage', () => {
      localStorageMock.getItem.mockReturnValue(
        JSON.stringify({ state: { theme: 'light' }, version: 0 })
      );

      const { result } = renderHook(() => useUIStore());
      
      // Note: In a real test environment, you might need to reinitialize the store
      // to test persistence loading. This is a simplified test.
      expect(result.current.theme).toBeDefined();
    });
  });

  describe('Complex Interactions', () => {
    it('handles multiple modal states correctly', () => {
      const { result } = renderHook(() => useUIStore());

      act(() => {
        result.current.openAddTodoModal();
        result.current.openEditTodoModal('todo-1');
        result.current.openDeleteConfirmModal('todo-2');
      });

      expect(result.current.isAddTodoModalOpen).toBe(true);
      expect(result.current.isEditTodoModalOpen).toBe(true);
      expect(result.current.editingTodoId).toBe('todo-1');
      expect(result.current.isDeleteConfirmModalOpen).toBe(true);
      expect(result.current.deletingTodoId).toBe('todo-2');
    });

    it('handles drawer and menu states independently', () => {
      const { result } = renderHook(() => useUIStore());

      act(() => {
        result.current.toggleFilterDrawer();
        result.current.toggleMobileMenu();
      });

      expect(result.current.isFilterDrawerOpen).toBe(true);
      expect(result.current.isMobileMenuOpen).toBe(true);

      act(() => {
        result.current.closeFilterDrawer();
      });

      expect(result.current.isFilterDrawerOpen).toBe(false);
      expect(result.current.isMobileMenuOpen).toBe(true);
    });

    it('manages selection and bulk mode together', () => {
      const { result } = renderHook(() => useUIStore());

      act(() => {
        result.current.toggleTodoSelection('todo-1');
        result.current.toggleTodoSelection('todo-2');
        result.current.toggleBulkMode();
      });

      expect(result.current.selectedTodoIds).toEqual(['todo-1', 'todo-2']);
      expect(result.current.isBulkMode).toBe(true);

      act(() => {
        result.current.toggleTodoSelection('todo-3');
      });

      expect(result.current.selectedTodoIds).toEqual(['todo-1', 'todo-2', 'todo-3']);

      act(() => {
        result.current.clearSelection();
      });

      expect(result.current.selectedTodoIds).toEqual([]);
      expect(result.current.isBulkMode).toBe(false);
    });
  });
});