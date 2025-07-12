import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Card, CardHeader, CardContent, CardFooter } from './Card';

describe('Card Component', () => {
  it('renders children correctly', () => {
    render(
      <Card>
        <div>Card content</div>
      </Card>
    );
    expect(screen.getByText('Card content')).toBeInTheDocument();
  });

  it('applies default classes', () => {
    const { container } = render(<Card>Content</Card>);
    const card = container.firstChild as HTMLElement;
    expect(card).toHaveClass(
      'bg-white',
      'dark:bg-gray-800',
      'rounded-lg',
      'border',
      'border-gray-200',
      'dark:border-gray-700',
      'shadow-sm'
    );
  });

  it('applies custom className', () => {
    const { container } = render(<Card className="custom-class">Content</Card>);
    const card = container.firstChild as HTMLElement;
    expect(card).toHaveClass('custom-class');
  });

  it('applies hover classes when hover prop is true', () => {
    const { container } = render(<Card hover>Content</Card>);
    const card = container.firstChild as HTMLElement;
    expect(card).toHaveClass('hover:shadow-md', 'transition-shadow', 'cursor-pointer');
  });

  it('applies cursor-pointer when onClick is provided', () => {
    const handleClick = jest.fn();
    const { container } = render(<Card onClick={handleClick}>Content</Card>);
    const card = container.firstChild as HTMLElement;
    expect(card).toHaveClass('cursor-pointer');
  });

  it('handles click events', () => {
    const handleClick = jest.fn();
    const { container } = render(<Card onClick={handleClick}>Content</Card>);
    const card = container.firstChild as HTMLElement;
    fireEvent.click(card);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('does not apply hover classes when hover is false', () => {
    const { container } = render(<Card hover={false}>Content</Card>);
    const card = container.firstChild as HTMLElement;
    expect(card).not.toHaveClass('hover:shadow-md');
  });
});

describe('CardHeader Component', () => {
  it('renders children correctly', () => {
    render(
      <CardHeader>
        <h2>Header Title</h2>
      </CardHeader>
    );
    expect(screen.getByText('Header Title')).toBeInTheDocument();
  });

  it('applies default classes', () => {
    const { container } = render(<CardHeader>Header</CardHeader>);
    const header = container.firstChild as HTMLElement;
    expect(header).toHaveClass(
      'px-4',
      'py-3',
      'border-b',
      'border-gray-200',
      'dark:border-gray-700'
    );
  });

  it('applies custom className', () => {
    const { container } = render(<CardHeader className="custom-header">Header</CardHeader>);
    const header = container.firstChild as HTMLElement;
    expect(header).toHaveClass('custom-header');
  });
});

describe('CardContent Component', () => {
  it('renders children correctly', () => {
    render(
      <CardContent>
        <p>Content text</p>
      </CardContent>
    );
    expect(screen.getByText('Content text')).toBeInTheDocument();
  });

  it('applies default classes', () => {
    const { container } = render(<CardContent>Content</CardContent>);
    const content = container.firstChild as HTMLElement;
    expect(content).toHaveClass('px-4', 'py-3');
  });

  it('applies custom className', () => {
    const { container } = render(<CardContent className="custom-content">Content</CardContent>);
    const content = container.firstChild as HTMLElement;
    expect(content).toHaveClass('custom-content');
  });
});

describe('CardFooter Component', () => {
  it('renders children correctly', () => {
    render(
      <CardFooter>
        <button>Footer Button</button>
      </CardFooter>
    );
    expect(screen.getByText('Footer Button')).toBeInTheDocument();
  });

  it('applies default classes', () => {
    const { container } = render(<CardFooter>Footer</CardFooter>);
    const footer = container.firstChild as HTMLElement;
    expect(footer).toHaveClass(
      'px-4',
      'py-3',
      'border-t',
      'border-gray-200',
      'dark:border-gray-700'
    );
  });

  it('applies custom className', () => {
    const { container } = render(<CardFooter className="custom-footer">Footer</CardFooter>);
    const footer = container.firstChild as HTMLElement;
    expect(footer).toHaveClass('custom-footer');
  });
});

describe('Card Composition', () => {
  it('renders complete card with all sections', () => {
    render(
      <Card>
        <CardHeader>
          <h2>Title</h2>
        </CardHeader>
        <CardContent>
          <p>Main content</p>
        </CardContent>
        <CardFooter>
          <button>Action</button>
        </CardFooter>
      </Card>
    );

    expect(screen.getByText('Title')).toBeInTheDocument();
    expect(screen.getByText('Main content')).toBeInTheDocument();
    expect(screen.getByText('Action')).toBeInTheDocument();
  });
});