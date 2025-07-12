import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface UIState {
  // Modal states
  isAddTodoModalOpen: boolean;
  isEditTodoModalOpen: boolean;
  editingTodoId: string | null;
  isDeleteConfirmModalOpen: boolean;
  deletingTodoId: string | null;
  
  // Drawer states
  isFilterDrawerOpen: boolean;
  isMobileMenuOpen: boolean;
  
  // Theme
  theme: 'light' | 'dark' | 'system';
  
  // Loading states
  isLoading: boolean;
  loadingMessage: string;
  
  // Bulk selection
  selectedTodoIds: string[];
  isBulkMode: boolean;
  
  // Actions
  openAddTodoModal: () => void;
  closeAddTodoModal: () => void;
  openEditTodoModal: (todoId: string) => void;
  closeEditTodoModal: () => void;
  openDeleteConfirmModal: (todoId: string) => void;
  closeDeleteConfirmModal: () => void;
  
  toggleFilterDrawer: () => void;
  closeFilterDrawer: () => void;
  toggleMobileMenu: () => void;
  closeMobileMenu: () => void;
  
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  
  setLoading: (isLoading: boolean, message?: string) => void;
  
  toggleTodoSelection: (todoId: string) => void;
  selectAllTodos: (todoIds: string[]) => void;
  clearSelection: () => void;
  toggleBulkMode: () => void;
}

export const useUIStore = create<UIState>()(persist(
  (set) => ({
    // Modal states
    isAddTodoModalOpen: false,
    isEditTodoModalOpen: false,
    editingTodoId: null,
    isDeleteConfirmModalOpen: false,
    deletingTodoId: null,
    
    // Drawer states
    isFilterDrawerOpen: false,
    isMobileMenuOpen: false,
    
    // Theme
    theme: 'system',
    
    // Loading states
    isLoading: false,
    loadingMessage: '',
    
    // Bulk selection
    selectedTodoIds: [],
    isBulkMode: false,
    
    // Actions
    openAddTodoModal: () => set({ isAddTodoModalOpen: true }),
    closeAddTodoModal: () => set({ isAddTodoModalOpen: false }),
    
    openEditTodoModal: (todoId) => set({ 
      isEditTodoModalOpen: true, 
      editingTodoId: todoId 
    }),
    closeEditTodoModal: () => set({ 
      isEditTodoModalOpen: false, 
      editingTodoId: null 
    }),
    
    openDeleteConfirmModal: (todoId) => set({ 
      isDeleteConfirmModalOpen: true, 
      deletingTodoId: todoId 
    }),
    closeDeleteConfirmModal: () => set({ 
      isDeleteConfirmModalOpen: false, 
      deletingTodoId: null 
    }),
    
    toggleFilterDrawer: () => set(state => ({ 
      isFilterDrawerOpen: !state.isFilterDrawerOpen 
    })),
    closeFilterDrawer: () => set({ isFilterDrawerOpen: false }),
    
    toggleMobileMenu: () => set(state => ({ 
      isMobileMenuOpen: !state.isMobileMenuOpen 
    })),
    closeMobileMenu: () => set({ isMobileMenuOpen: false }),
    
    setTheme: (theme) => set({ theme }),
    
    setLoading: (isLoading, message = '') => set({ 
      isLoading, 
      loadingMessage: message 
    }),
    
    toggleTodoSelection: (todoId) => set(state => {
      const isSelected = state.selectedTodoIds.includes(todoId);
      return {
        selectedTodoIds: isSelected
          ? state.selectedTodoIds.filter(id => id !== todoId)
          : [...state.selectedTodoIds, todoId]
      };
    }),
    
    selectAllTodos: (todoIds) => set({ selectedTodoIds: todoIds }),
    
    clearSelection: () => set({ selectedTodoIds: [], isBulkMode: false }),
    
    toggleBulkMode: () => set(state => ({ 
      isBulkMode: !state.isBulkMode,
      selectedTodoIds: state.isBulkMode ? [] : state.selectedTodoIds
    })),
  }),
  {
    name: 'todo-ui-store',
    partialize: (state) => ({ 
      theme: state.theme 
    }),
  }
));