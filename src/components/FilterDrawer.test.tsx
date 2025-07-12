import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { FilterDrawer } from './FilterDrawer';
import { useTodoStore } from '@/store/todoStore';
import { useUIStore } from '@/store/uiStore';

// Mock the stores
jest.mock('@/store/todoStore');
jest.mock('@/store/uiStore');

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
  X: () => <div data-testid="x-icon" />,
  RotateCcw: () => <div data-testid="rotate-ccw-icon" />,
}));

const mockUseTodoStore = useTodoStore as jest.MockedFunction<typeof useTodoStore>;
const mockUseUIStore = useUIStore as jest.MockedFunction<typeof useUIStore>;

const mockTodoStore = {
  filter: {},
  setFilter: jest.fn(),
  clearFilter: jest.fn(),
  getAllTags: jest.fn(),
};

const mockUIStore = {
  isFilterDrawerOpen: false,
  closeFilterDrawer: jest.fn(),
};

describe('FilterDrawer', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseTodoStore.mockReturnValue(mockTodoStore as any);
    mockUseUIStore.mockReturnValue(mockUIStore as any);
    mockTodoStore.getAllTags.mockReturnValue([]);
  });

  it('should render when drawer is closed', () => {
    render(<FilterDrawer />);
    
    const drawer = screen.getByText('Filter Todos').closest('div');
    expect(drawer).toHaveClass('translate-x-full');
  });

  it('should render when drawer is open', () => {
    mockUseUIStore.mockReturnValue({
      ...mockUIStore,
      isFilterDrawerOpen: true,
    } as any);

    render(<FilterDrawer />);
    
    const drawer = screen.getByText('Filter Todos').closest('div');
    expect(drawer).toHaveClass('translate-x-0');
    expect(screen.getByText('Filter Todos')).toBeInTheDocument();
  });

  it('should render backdrop when drawer is open', () => {
    mockUseUIStore.mockReturnValue({
      ...mockUIStore,
      isFilterDrawerOpen: true,
    } as any);

    const { container } = render(<FilterDrawer />);
    
    const backdrop = container.querySelector('.fixed.inset-0.bg-black.bg-opacity-50');
    expect(backdrop).toBeInTheDocument();
  });

  it('should not render backdrop when drawer is closed', () => {
    const { container } = render(<FilterDrawer />);
    
    const backdrop = container.querySelector('.fixed.inset-0.bg-black.bg-opacity-50');
    expect(backdrop).not.toBeInTheDocument();
  });

  it('should close drawer when close button is clicked', () => {
    mockUseUIStore.mockReturnValue({
      ...mockUIStore,
      isFilterDrawerOpen: true,
    } as any);

    render(<FilterDrawer />);
    
    const closeButton = screen.getByTestId('x-icon').closest('button');
    fireEvent.click(closeButton!);
    
    expect(mockUIStore.closeFilterDrawer).toHaveBeenCalledTimes(1);
  });

  it('should close drawer when backdrop is clicked', () => {
    mockUseUIStore.mockReturnValue({
      ...mockUIStore,
      isFilterDrawerOpen: true,
    } as any);

    const { container } = render(<FilterDrawer />);
    
    const backdrop = container.querySelector('.fixed.inset-0.bg-black.bg-opacity-50');
    fireEvent.click(backdrop!);
    
    expect(mockUIStore.closeFilterDrawer).toHaveBeenCalledTimes(1);
  });

  it('should render status filter options', () => {
    mockUseUIStore.mockReturnValue({
      ...mockUIStore,
      isFilterDrawerOpen: true,
    } as any);

    render(<FilterDrawer />);
    
    expect(screen.getByText('Status')).toBeInTheDocument();
    expect(screen.getByDisplayValue('All Todos')).toBeInTheDocument();
  });

  it('should render priority filter options', () => {
    mockUseUIStore.mockReturnValue({
      ...mockUIStore,
      isFilterDrawerOpen: true,
    } as any);

    render(<FilterDrawer />);
    
    expect(screen.getByText('Priority')).toBeInTheDocument();
    expect(screen.getByDisplayValue('All Priorities')).toBeInTheDocument();
  });

  it('should handle status filter change', () => {
    mockUseUIStore.mockReturnValue({
      ...mockUIStore,
      isFilterDrawerOpen: true,
    } as any);

    render(<FilterDrawer />);
    
    const statusSelect = screen.getByDisplayValue('All Todos');
    fireEvent.change(statusSelect, { target: { value: 'active' } });
    
    expect(mockTodoStore.setFilter).toHaveBeenCalledWith({ status: 'active' });
  });

  it('should handle status filter change to "all"', () => {
    mockUseUIStore.mockReturnValue({
      ...mockUIStore,
      isFilterDrawerOpen: true,
    } as any);

    render(<FilterDrawer />);
    
    const statusSelect = screen.getByDisplayValue('All Todos');
    fireEvent.change(statusSelect, { target: { value: 'all' } });
    
    expect(mockTodoStore.setFilter).toHaveBeenCalledWith({ status: undefined });
  });

  it('should handle priority filter change', () => {
    mockUseUIStore.mockReturnValue({
      ...mockUIStore,
      isFilterDrawerOpen: true,
    } as any);

    render(<FilterDrawer />);
    
    const prioritySelect = screen.getByDisplayValue('All Priorities');
    fireEvent.change(prioritySelect, { target: { value: 'high' } });
    
    expect(mockTodoStore.setFilter).toHaveBeenCalledWith({ priority: 'high' });
  });

  it('should handle priority filter change to "all"', () => {
    mockUseUIStore.mockReturnValue({
      ...mockUIStore,
      isFilterDrawerOpen: true,
    } as any);

    render(<FilterDrawer />);
    
    const prioritySelect = screen.getByDisplayValue('All Priorities');
    fireEvent.change(prioritySelect, { target: { value: 'all' } });
    
    expect(mockTodoStore.setFilter).toHaveBeenCalledWith({ priority: undefined });
  });

  it('should render tags when available', () => {
    mockTodoStore.getAllTags.mockReturnValue(['work', 'personal', 'urgent']);
    mockUseUIStore.mockReturnValue({
      ...mockUIStore,
      isFilterDrawerOpen: true,
    } as any);

    render(<FilterDrawer />);
    
    expect(screen.getByText('Tags')).toBeInTheDocument();
    expect(screen.getByText('#work')).toBeInTheDocument();
    expect(screen.getByText('#personal')).toBeInTheDocument();
    expect(screen.getByText('#urgent')).toBeInTheDocument();
  });

  it('should not render tags section when no tags available', () => {
    mockTodoStore.getAllTags.mockReturnValue([]);
    mockUseUIStore.mockReturnValue({
      ...mockUIStore,
      isFilterDrawerOpen: true,
    } as any);

    render(<FilterDrawer />);
    
    expect(screen.queryByText('Tags')).not.toBeInTheDocument();
  });

  it('should handle tag selection', () => {
    mockTodoStore.getAllTags.mockReturnValue(['work', 'personal']);
    mockUseTodoStore.mockReturnValue({
      ...mockTodoStore,
      filter: { tags: [] },
    } as any);
    mockUseUIStore.mockReturnValue({
      ...mockUIStore,
      isFilterDrawerOpen: true,
    } as any);

    render(<FilterDrawer />);
    
    const workCheckbox = screen.getByLabelText('#work');
    fireEvent.click(workCheckbox);
    
    expect(mockTodoStore.setFilter).toHaveBeenCalledWith({ tags: ['work'] });
  });

  it('should handle tag deselection', () => {
    mockTodoStore.getAllTags.mockReturnValue(['work', 'personal']);
    mockUseTodoStore.mockReturnValue({
      ...mockTodoStore,
      filter: { tags: ['work', 'personal'] },
    } as any);
    mockUseUIStore.mockReturnValue({
      ...mockUIStore,
      isFilterDrawerOpen: true,
    } as any);

    render(<FilterDrawer />);
    
    const workCheckbox = screen.getByLabelText('#work');
    fireEvent.click(workCheckbox);
    
    expect(mockTodoStore.setFilter).toHaveBeenCalledWith({ tags: ['personal'] });
  });

  it('should set tags to undefined when all tags are deselected', () => {
    mockTodoStore.getAllTags.mockReturnValue(['work']);
    mockUseTodoStore.mockReturnValue({
      ...mockTodoStore,
      filter: { tags: ['work'] },
    } as any);
    mockUseUIStore.mockReturnValue({
      ...mockUIStore,
      isFilterDrawerOpen: true,
    } as any);

    render(<FilterDrawer />);
    
    const workCheckbox = screen.getByLabelText('#work');
    fireEvent.click(workCheckbox);
    
    expect(mockTodoStore.setFilter).toHaveBeenCalledWith({ tags: undefined });
  });

  it('should show selected tags as checked', () => {
    mockTodoStore.getAllTags.mockReturnValue(['work', 'personal']);
    mockUseTodoStore.mockReturnValue({
      ...mockTodoStore,
      filter: { tags: ['work'] },
    } as any);
    mockUseUIStore.mockReturnValue({
      ...mockUIStore,
      isFilterDrawerOpen: true,
    } as any);

    render(<FilterDrawer />);
    
    const workCheckbox = screen.getByLabelText('#work') as HTMLInputElement;
    const personalCheckbox = screen.getByLabelText('#personal') as HTMLInputElement;
    
    expect(workCheckbox.checked).toBe(true);
    expect(personalCheckbox.checked).toBe(false);
  });

  it('should show clear filters button when filters are active', () => {
    mockUseTodoStore.mockReturnValue({
      ...mockTodoStore,
      filter: { status: 'active', priority: 'high' },
    } as any);
    mockUseUIStore.mockReturnValue({
      ...mockUIStore,
      isFilterDrawerOpen: true,
    } as any);

    render(<FilterDrawer />);
    
    expect(screen.getByText('Clear All Filters')).toBeInTheDocument();
    expect(screen.getByTestId('rotate-ccw-icon')).toBeInTheDocument();
  });

  it('should not show clear filters button when no filters are active', () => {
    mockUseTodoStore.mockReturnValue({
      ...mockTodoStore,
      filter: {},
    } as any);
    mockUseUIStore.mockReturnValue({
      ...mockUIStore,
      isFilterDrawerOpen: true,
    } as any);

    render(<FilterDrawer />);
    
    expect(screen.queryByText('Clear All Filters')).not.toBeInTheDocument();
  });

  it('should handle clear filters button click', () => {
    mockUseTodoStore.mockReturnValue({
      ...mockTodoStore,
      filter: { status: 'active' },
    } as any);
    mockUseUIStore.mockReturnValue({
      ...mockUIStore,
      isFilterDrawerOpen: true,
    } as any);

    render(<FilterDrawer />);
    
    const clearButton = screen.getByText('Clear All Filters');
    fireEvent.click(clearButton);
    
    expect(mockTodoStore.clearFilter).toHaveBeenCalledTimes(1);
  });

  it('should show filter summary when filters are active', () => {
    mockUseTodoStore.mockReturnValue({
      ...mockTodoStore,
      filter: {
        status: 'active',
        priority: 'high',
        tags: ['work', 'urgent'],
      },
    } as any);
    mockUseUIStore.mockReturnValue({
      ...mockUIStore,
      isFilterDrawerOpen: true,
    } as any);

    render(<FilterDrawer />);
    
    expect(screen.getByText('Active Filters:')).toBeInTheDocument();
    expect(screen.getByText('Status: active')).toBeInTheDocument();
    expect(screen.getByText('Priority: high')).toBeInTheDocument();
    expect(screen.getByText('Tags: #work, #urgent')).toBeInTheDocument();
  });

  it('should not show filter summary when no filters are active', () => {
    mockUseTodoStore.mockReturnValue({
      ...mockTodoStore,
      filter: {},
    } as any);
    mockUseUIStore.mockReturnValue({
      ...mockUIStore,
      isFilterDrawerOpen: true,
    } as any);

    render(<FilterDrawer />);
    
    expect(screen.queryByText('Active Filters:')).not.toBeInTheDocument();
  });

  it('should show partial filter summary', () => {
    mockUseTodoStore.mockReturnValue({
      ...mockTodoStore,
      filter: { status: 'completed' },
    } as any);
    mockUseUIStore.mockReturnValue({
      ...mockUIStore,
      isFilterDrawerOpen: true,
    } as any);

    render(<FilterDrawer />);
    
    expect(screen.getByText('Active Filters:')).toBeInTheDocument();
    expect(screen.getByText('Status: completed')).toBeInTheDocument();
    expect(screen.queryByText('Priority:')).not.toBeInTheDocument();
    expect(screen.queryByText('Tags:')).not.toBeInTheDocument();
  });

  it('should display current filter values in selects', () => {
    mockUseTodoStore.mockReturnValue({
      ...mockTodoStore,
      filter: { status: 'active', priority: 'high' },
    } as any);
    mockUseUIStore.mockReturnValue({
      ...mockUIStore,
      isFilterDrawerOpen: true,
    } as any);

    render(<FilterDrawer />);
    
    expect(screen.getByDisplayValue('Active')).toBeInTheDocument();
    expect(screen.getByDisplayValue('High Priority')).toBeInTheDocument();
  });

  it('should handle empty tags array in filter', () => {
    mockTodoStore.getAllTags.mockReturnValue(['work', 'personal']);
    mockUseTodoStore.mockReturnValue({
      ...mockTodoStore,
      filter: { tags: [] },
    } as any);
    mockUseUIStore.mockReturnValue({
      ...mockUIStore,
      isFilterDrawerOpen: true,
    } as any);

    render(<FilterDrawer />);
    
    const workCheckbox = screen.getByLabelText('#work') as HTMLInputElement;
    const personalCheckbox = screen.getByLabelText('#personal') as HTMLInputElement;
    
    expect(workCheckbox.checked).toBe(false);
    expect(personalCheckbox.checked).toBe(false);
    expect(screen.queryByText('Clear All Filters')).not.toBeInTheDocument();
  });
});