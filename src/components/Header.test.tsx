import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Header } from './Header';

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
  Plus: () => <div data-testid="plus-icon">+</div>,
  Search: () => <div data-testid="search-icon">🔍</div>,
  Filter: () => <div data-testid="filter-icon">⚙️</div>,
  Menu: () => <div data-testid="menu-icon">☰</div>,
  CheckSquare: () => <div data-testid="check-square-icon">☑️</div>,
  Sun: () => <div data-testid="sun-icon">☀️</div>,
  Moon: () => <div data-testid="moon-icon">🌙</div>,
  Monitor: () => <div data-testid="monitor-icon">🖥️</div>,
}));

// Mock stores
const mockTodoStore = {
  filter: { search: '' },
  setFilter: jest.fn(),
  getStats: jest.fn(() => ({
    total: 10,
    active: 5,
    completed: 3,
    overdue: 2,
  })),
};

const mockUIStore = {
  openAddTodoModal: jest.fn(),
  toggleFilterDrawer: jest.fn(),
  toggleMobileMenu: jest.fn(),
  toggleBulkMode: jest.fn(),
  isBulkMode: false,
  theme: 'light' as const,
  setTheme: jest.fn(),
};

jest.mock('@/store/todoStore', () => ({
  useTodoStore: () => mockTodoStore,
}));

jest.mock('@/store/uiStore', () => ({
  useUIStore: () => mockUIStore,
}));

describe('Header Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockTodoStore.filter = { search: '' };
    mockUIStore.isBulkMode = false;
    mockUIStore.theme = 'light';
  });

  it('renders the header with logo and title', () => {
    render(<Header />);
    expect(screen.getByText('TodoApp')).toBeInTheDocument();
    expect(screen.getByTestId('check-square-icon')).toBeInTheDocument();
  });

  it('displays stats correctly', () => {
    render(<Header />);
    expect(screen.getByText('5 active')).toBeInTheDocument();
    expect(screen.getByText('3 completed')).toBeInTheDocument();
    expect(screen.getByText('2 overdue')).toBeInTheDocument();
  });

  it('hides overdue count when zero', () => {
    mockTodoStore.getStats.mockReturnValue({
      total: 8,
      active: 5,
      completed: 3,
      overdue: 0,
    });
    render(<Header />);
    expect(screen.queryByText('0 overdue')).not.toBeInTheDocument();
  });

  it('renders search input with correct placeholder', () => {
    render(<Header />);
    const searchInput = screen.getByPlaceholderText('Search todos...');
    expect(searchInput).toBeInTheDocument();
    expect(screen.getByTestId('search-icon')).toBeInTheDocument();
  });

  it('handles search input changes', () => {
    render(<Header />);
    const searchInput = screen.getByPlaceholderText('Search todos...');
    fireEvent.change(searchInput, { target: { value: 'test search' } });
    expect(mockTodoStore.setFilter).toHaveBeenCalledWith({ search: 'test search' });
  });

  it('displays current search value', () => {
    mockTodoStore.filter = { search: 'existing search' };
    render(<Header />);
    const searchInput = screen.getByPlaceholderText('Search todos...');
    expect(searchInput).toHaveValue('existing search');
  });

  it('renders mobile menu button', () => {
    render(<Header />);
    const mobileMenuButton = screen.getByTestId('menu-icon').closest('button');
    expect(mobileMenuButton).toBeInTheDocument();
    expect(mobileMenuButton).toHaveClass('md:hidden');
  });

  it('handles mobile menu toggle', () => {
    render(<Header />);
    const mobileMenuButton = screen.getByTestId('menu-icon').closest('button');
    fireEvent.click(mobileMenuButton!);
    expect(mockUIStore.toggleMobileMenu).toHaveBeenCalledTimes(1);
  });

  it('renders theme toggle button with light theme icon', () => {
    mockUIStore.theme = 'light';
    render(<Header />);
    expect(screen.getByTestId('sun-icon')).toBeInTheDocument();
    const themeButton = screen.getByTestId('sun-icon').closest('button');
    expect(themeButton).toHaveAttribute('title', 'Current theme: light');
  });

  it('renders theme toggle button with dark theme icon', () => {
    mockUIStore.theme = 'dark';
    render(<Header />);
    expect(screen.getByTestId('moon-icon')).toBeInTheDocument();
  });

  it('renders theme toggle button with system theme icon', () => {
    mockUIStore.theme = 'system';
    render(<Header />);
    expect(screen.getByTestId('monitor-icon')).toBeInTheDocument();
  });

  it('cycles through themes when theme button is clicked', () => {
    mockUIStore.theme = 'light';
    render(<Header />);
    const themeButton = screen.getByTestId('sun-icon').closest('button');
    fireEvent.click(themeButton!);
    expect(mockUIStore.setTheme).toHaveBeenCalledWith('dark');
  });

  it('cycles from dark to system theme', () => {
    mockUIStore.theme = 'dark';
    render(<Header />);
    const themeButton = screen.getByTestId('moon-icon').closest('button');
    fireEvent.click(themeButton!);
    expect(mockUIStore.setTheme).toHaveBeenCalledWith('system');
  });

  it('cycles from system to light theme', () => {
    mockUIStore.theme = 'system';
    render(<Header />);
    const themeButton = screen.getByTestId('monitor-icon').closest('button');
    fireEvent.click(themeButton!);
    expect(mockUIStore.setTheme).toHaveBeenCalledWith('light');
  });

  it('renders bulk mode toggle button', () => {
    render(<Header />);
    const bulkModeButton = screen.getAllByTestId('check-square-icon')[1].closest('button');
    expect(bulkModeButton).toBeInTheDocument();
    expect(bulkModeButton).toHaveAttribute('title', 'Toggle bulk selection mode');
  });

  it('shows bulk mode as inactive by default', () => {
    mockUIStore.isBulkMode = false;
    render(<Header />);
    const bulkModeButton = screen.getAllByTestId('check-square-icon')[1].closest('button');
    expect(bulkModeButton).toHaveClass('bg-gray-200'); // ghost variant
  });

  it('shows bulk mode as active when enabled', () => {
    mockUIStore.isBulkMode = true;
    render(<Header />);
    const bulkModeButton = screen.getAllByTestId('check-square-icon')[1].closest('button');
    expect(bulkModeButton).toHaveClass('bg-blue-600'); // primary variant
  });

  it('handles bulk mode toggle', () => {
    render(<Header />);
    const bulkModeButton = screen.getAllByTestId('check-square-icon')[1].closest('button');
    fireEvent.click(bulkModeButton!);
    expect(mockUIStore.toggleBulkMode).toHaveBeenCalledTimes(1);
  });

  it('renders filter toggle button', () => {
    render(<Header />);
    const filterButton = screen.getByTestId('filter-icon').closest('button');
    expect(filterButton).toBeInTheDocument();
  });

  it('handles filter drawer toggle', () => {
    render(<Header />);
    const filterButton = screen.getByTestId('filter-icon').closest('button');
    fireEvent.click(filterButton!);
    expect(mockUIStore.toggleFilterDrawer).toHaveBeenCalledTimes(1);
  });

  it('renders add todo button', () => {
    render(<Header />);
    const addButton = screen.getByText('Add Todo').closest('button');
    expect(addButton).toBeInTheDocument();
    expect(screen.getByTestId('plus-icon')).toBeInTheDocument();
  });

  it('handles add todo button click', () => {
    render(<Header />);
    const addButton = screen.getByText('Add Todo').closest('button');
    fireEvent.click(addButton!);
    expect(mockUIStore.openAddTodoModal).toHaveBeenCalledTimes(1);
  });

  it('hides "Add Todo" text on small screens', () => {
    render(<Header />);
    const addTodoText = screen.getByText('Add Todo');
    expect(addTodoText).toHaveClass('hidden', 'sm:inline');
  });

  it('shows stats on desktop', () => {
    render(<Header />);
    const desktopStats = screen.getAllByText('5 active')[0];
    expect(desktopStats.closest('div')).toHaveClass('hidden', 'sm:flex');
  });

  it('shows stats on mobile', () => {
    render(<Header />);
    const mobileStats = screen.getAllByText('5 active')[1];
    expect(mobileStats.closest('div')).toHaveClass('sm:hidden');
  });

  it('applies sticky positioning and proper z-index', () => {
    const { container } = render(<Header />);
    const header = container.querySelector('header');
    expect(header).toHaveClass('sticky', 'top-0', 'z-40');
  });

  it('has proper background and border styling', () => {
    const { container } = render(<Header />);
    const header = container.querySelector('header');
    expect(header).toHaveClass(
      'bg-white',
      'dark:bg-gray-900',
      'border-b',
      'border-gray-200',
      'dark:border-gray-700',
      'shadow-sm'
    );
  });

  it('has responsive container with proper max width', () => {
    render(<Header />);
    const container = document.querySelector('.max-w-7xl');
    expect(container).toBeInTheDocument();
    expect(container).toHaveClass('mx-auto', 'px-4', 'sm:px-6', 'lg:px-8');
  });

  it('maintains proper header height', () => {
    render(<Header />);
    const headerContent = document.querySelector('.h-16');
    expect(headerContent).toBeInTheDocument();
    expect(headerContent).toHaveClass('flex', 'items-center', 'justify-between');
  });
});