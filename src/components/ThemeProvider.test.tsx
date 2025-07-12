import React from 'react';
import { render } from '@testing-library/react';
import { ThemeProvider } from './ThemeProvider';
import { useUIStore } from '@/store/uiStore';

// Mock the store
jest.mock('@/store/uiStore');

const mockUseUIStore = useUIStore as jest.MockedFunction<typeof useUIStore>;

const mockUIStore = {
  theme: 'light' as const,
};

// Mock window.matchMedia
const mockMatchMedia = jest.fn();
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: mockMatchMedia,
});

// Mock document.documentElement
const mockClassList = {
  add: jest.fn(),
  remove: jest.fn(),
};
Object.defineProperty(document.documentElement, 'classList', {
  value: mockClassList,
  writable: true,
});

describe('ThemeProvider', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseUIStore.mockReturnValue(mockUIStore as any);
    mockMatchMedia.mockReturnValue({
      matches: false,
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
    });
  });

  it('should render children', () => {
    const { getByText } = render(
      <ThemeProvider>
        <div>Test Content</div>
      </ThemeProvider>
    );

    expect(getByText('Test Content')).toBeInTheDocument();
  });

  it('should apply light theme class', () => {
    mockUseUIStore.mockReturnValue({
      theme: 'light',
    } as any);

    render(
      <ThemeProvider>
        <div>Test Content</div>
      </ThemeProvider>
    );

    expect(mockClassList.remove).toHaveBeenCalledWith('light', 'dark');
    expect(mockClassList.add).toHaveBeenCalledWith('light');
  });

  it('should apply dark theme class', () => {
    mockUseUIStore.mockReturnValue({
      theme: 'dark',
    } as any);

    render(
      <ThemeProvider>
        <div>Test Content</div>
      </ThemeProvider>
    );

    expect(mockClassList.remove).toHaveBeenCalledWith('light', 'dark');
    expect(mockClassList.add).toHaveBeenCalledWith('dark');
  });

  it('should apply system theme based on media query (light)', () => {
    mockUseUIStore.mockReturnValue({
      theme: 'system',
    } as any);

    mockMatchMedia.mockReturnValue({
      matches: false, // Light theme
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
    });

    render(
      <ThemeProvider>
        <div>Test Content</div>
      </ThemeProvider>
    );

    expect(mockMatchMedia).toHaveBeenCalledWith('(prefers-color-scheme: dark)');
    expect(mockClassList.remove).toHaveBeenCalledWith('light', 'dark');
    expect(mockClassList.add).toHaveBeenCalledWith('light');
  });

  it('should apply system theme based on media query (dark)', () => {
    mockUseUIStore.mockReturnValue({
      theme: 'system',
    } as any);

    mockMatchMedia.mockReturnValue({
      matches: true, // Dark theme
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
    });

    render(
      <ThemeProvider>
        <div>Test Content</div>
      </ThemeProvider>
    );

    expect(mockMatchMedia).toHaveBeenCalledWith('(prefers-color-scheme: dark)');
    expect(mockClassList.remove).toHaveBeenCalledWith('light', 'dark');
    expect(mockClassList.add).toHaveBeenCalledWith('dark');
  });

  it('should add event listener for system theme changes', () => {
    const mockAddEventListener = jest.fn();
    const mockRemoveEventListener = jest.fn();

    mockUseUIStore.mockReturnValue({
      theme: 'system',
    } as any);

    mockMatchMedia.mockReturnValue({
      matches: false,
      addEventListener: mockAddEventListener,
      removeEventListener: mockRemoveEventListener,
    });

    const { unmount } = render(
      <ThemeProvider>
        <div>Test Content</div>
      </ThemeProvider>
    );

    expect(mockAddEventListener).toHaveBeenCalledWith('change', expect.any(Function));

    // Test cleanup
    unmount();
    expect(mockRemoveEventListener).toHaveBeenCalledWith('change', expect.any(Function));
  });

  it('should not add event listener for non-system themes', () => {
    const mockAddEventListener = jest.fn();
    const mockRemoveEventListener = jest.fn();

    mockUseUIStore.mockReturnValue({
      theme: 'light',
    } as any);

    mockMatchMedia.mockReturnValue({
      matches: false,
      addEventListener: mockAddEventListener,
      removeEventListener: mockRemoveEventListener,
    });

    render(
      <ThemeProvider>
        <div>Test Content</div>
      </ThemeProvider>
    );

    expect(mockAddEventListener).not.toHaveBeenCalled();
    expect(mockRemoveEventListener).not.toHaveBeenCalled();
  });

  it('should handle system theme change events', () => {
    let changeHandler: (e: MediaQueryListEvent) => void;
    const mockAddEventListener = jest.fn((event, handler) => {
      if (event === 'change') {
        changeHandler = handler;
      }
    });

    mockUseUIStore.mockReturnValue({
      theme: 'system',
    } as any);

    mockMatchMedia.mockReturnValue({
      matches: false,
      addEventListener: mockAddEventListener,
      removeEventListener: jest.fn(),
    });

    render(
      <ThemeProvider>
        <div>Test Content</div>
      </ThemeProvider>
    );

    // Clear previous calls
    mockClassList.add.mockClear();
    mockClassList.remove.mockClear();

    // Simulate system theme change to dark
    const mockEvent = { matches: true } as MediaQueryListEvent;
    changeHandler!(mockEvent);

    expect(mockClassList.remove).toHaveBeenCalledWith('light', 'dark');
    expect(mockClassList.add).toHaveBeenCalledWith('dark');
  });

  it('should handle system theme change events to light', () => {
    let changeHandler: (e: MediaQueryListEvent) => void;
    const mockAddEventListener = jest.fn((event, handler) => {
      if (event === 'change') {
        changeHandler = handler;
      }
    });

    mockUseUIStore.mockReturnValue({
      theme: 'system',
    } as any);

    mockMatchMedia.mockReturnValue({
      matches: true,
      addEventListener: mockAddEventListener,
      removeEventListener: jest.fn(),
    });

    render(
      <ThemeProvider>
        <div>Test Content</div>
      </ThemeProvider>
    );

    // Clear previous calls
    mockClassList.add.mockClear();
    mockClassList.remove.mockClear();

    // Simulate system theme change to light
    const mockEvent = { matches: false } as MediaQueryListEvent;
    changeHandler!(mockEvent);

    expect(mockClassList.remove).toHaveBeenCalledWith('light', 'dark');
    expect(mockClassList.add).toHaveBeenCalledWith('light');
  });

  it('should update theme when theme prop changes', () => {
    const { rerender } = render(
      <ThemeProvider>
        <div>Test Content</div>
      </ThemeProvider>
    );

    // Initial theme
    expect(mockClassList.add).toHaveBeenCalledWith('light');

    // Clear previous calls
    mockClassList.add.mockClear();
    mockClassList.remove.mockClear();

    // Change theme
    mockUseUIStore.mockReturnValue({
      theme: 'dark',
    } as any);

    rerender(
      <ThemeProvider>
        <div>Test Content</div>
      </ThemeProvider>
    );

    expect(mockClassList.remove).toHaveBeenCalledWith('light', 'dark');
    expect(mockClassList.add).toHaveBeenCalledWith('dark');
  });

  it('should switch from system to specific theme', () => {
    const mockRemoveEventListener = jest.fn();

    // Start with system theme
    mockUseUIStore.mockReturnValue({
      theme: 'system',
    } as any);

    mockMatchMedia.mockReturnValue({
      matches: false,
      addEventListener: jest.fn(),
      removeEventListener: mockRemoveEventListener,
    });

    const { rerender } = render(
      <ThemeProvider>
        <div>Test Content</div>
      </ThemeProvider>
    );

    // Clear previous calls
    mockClassList.add.mockClear();
    mockClassList.remove.mockClear();

    // Switch to specific theme
    mockUseUIStore.mockReturnValue({
      theme: 'dark',
    } as any);

    rerender(
      <ThemeProvider>
        <div>Test Content</div>
      </ThemeProvider>
    );

    expect(mockClassList.remove).toHaveBeenCalledWith('light', 'dark');
    expect(mockClassList.add).toHaveBeenCalledWith('dark');
    expect(mockRemoveEventListener).toHaveBeenCalled();
  });

  it('should switch from specific theme to system', () => {
    const mockAddEventListener = jest.fn();

    // Start with specific theme
    mockUseUIStore.mockReturnValue({
      theme: 'dark',
    } as any);

    const { rerender } = render(
      <ThemeProvider>
        <div>Test Content</div>
      </ThemeProvider>
    );

    // Clear previous calls
    mockClassList.add.mockClear();
    mockClassList.remove.mockClear();

    // Switch to system theme
    mockUseUIStore.mockReturnValue({
      theme: 'system',
    } as any);

    mockMatchMedia.mockReturnValue({
      matches: true, // Dark system theme
      addEventListener: mockAddEventListener,
      removeEventListener: jest.fn(),
    });

    rerender(
      <ThemeProvider>
        <div>Test Content</div>
      </ThemeProvider>
    );

    expect(mockClassList.remove).toHaveBeenCalledWith('light', 'dark');
    expect(mockClassList.add).toHaveBeenCalledWith('dark');
    expect(mockAddEventListener).toHaveBeenCalledWith('change', expect.any(Function));
  });
});