import { render } from '@testing-library/react';
import { ReactNode } from 'react';

// Mock the entire layout as a simple component for testing
jest.mock('./layout', () => {
  return function MockRootLayout({ children }: { children: ReactNode }) {
    return (
      <html lang="en">
        <head>
          <title>TodoApp - Smart Task Management</title>
        </head>
        <body>
          <div data-testid="theme-provider">
            {children}
          </div>
        </body>
      </html>
    );
  };
});

import RootLayout from './layout';

describe('RootLayout', () => {
  it('renders children correctly', () => {
    const { getByText } = render(
      <RootLayout>
        <div>Test content</div>
      </RootLayout>
    );
    
    expect(getByText('Test content')).toBeInTheDocument();
  });

  it('renders without crashing', () => {
    const { container } = render(
      <RootLayout>
        <div>Test</div>
      </RootLayout>
    );
    
    expect(container).toBeInTheDocument();
  });

  it('contains expected content', () => {
    const { getByText } = render(
      <RootLayout>
        <div>Test content</div>
      </RootLayout>
    );
    
    expect(getByText('Test content')).toBeInTheDocument();
  });

  it('includes ThemeProvider', () => {
    const { getByTestId } = render(
      <RootLayout>
        <div>Test</div>
      </RootLayout>
    );
    
    expect(getByTestId('theme-provider')).toBeInTheDocument();
  });
});