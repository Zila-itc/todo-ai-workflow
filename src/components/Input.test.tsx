import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Input, Textarea, Select } from './Input';

describe('Input Component', () => {
  it('renders input without label', () => {
    render(<Input placeholder="Enter text" />);
    const input = screen.getByPlaceholderText('Enter text');
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute('placeholder', 'Enter text');
  });

  it('renders input with label', () => {
    render(<Input label="Username" placeholder="Enter username" />);
    const label = screen.getByText('Username');
    const input = screen.getByLabelText('Username');
    expect(label).toBeInTheDocument();
    expect(input).toBeInTheDocument();
    expect(label).toHaveAttribute('for', input.id);
  });

  it('applies default classes', () => {
    render(<Input />);
    const input = screen.getByRole('textbox');
    expect(input).toHaveClass(
      'block',
      'w-full',
      'px-3',
      'py-2',
      'border',
      'border-gray-300',
      'rounded-md'
    );
  });

  it('applies custom className', () => {
    render(<Input className="custom-input" />);
    const input = screen.getByRole('textbox');
    expect(input).toHaveClass('custom-input');
  });

  it('shows error message and applies error styles', () => {
    render(<Input label="Email" error="Invalid email" />);
    const input = screen.getByLabelText('Email');
    const errorMessage = screen.getByText('Invalid email');
    expect(errorMessage).toBeInTheDocument();
    expect(errorMessage).toHaveClass('text-red-600');
    expect(input).toHaveClass('border-red-300');
  });

  it('shows helper text when no error', () => {
    render(<Input label="Password" helperText="Must be at least 8 characters" />);
    const helperText = screen.getByText('Must be at least 8 characters');
    expect(helperText).toBeInTheDocument();
    expect(helperText).toHaveClass('text-gray-500');
  });

  it('prioritizes error over helper text', () => {
    render(
      <Input 
        label="Password" 
        error="Password too short" 
        helperText="Must be at least 8 characters" 
      />
    );
    expect(screen.getByText('Password too short')).toBeInTheDocument();
    expect(screen.queryByText('Must be at least 8 characters')).not.toBeInTheDocument();
  });

  it('handles input changes', () => {
    const handleChange = jest.fn();
    render(<Input onChange={handleChange} />);
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'test value' } });
    expect(handleChange).toHaveBeenCalledTimes(1);
    expect(input).toHaveValue('test value');
  });

  it('is disabled when disabled prop is true', () => {
    render(<Input disabled />);
    const input = screen.getByRole('textbox');
    expect(input).toBeDisabled();
    expect(input).toHaveClass('disabled:opacity-50');
  });

  it('accepts different input types', () => {
    render(<Input type="email" />);
    const input = screen.getByRole('textbox');
    expect(input).toHaveAttribute('type', 'email');
  });

  it('generates unique id when not provided', () => {
    const { rerender } = render(<Input label="First" />);
    const firstInput = screen.getByLabelText('First');
    const firstId = firstInput.id;
    
    rerender(<Input label="Second" />);
    const secondInput = screen.getByLabelText('Second');
    const secondId = secondInput.id;
    
    expect(firstId).not.toBe(secondId);
    expect(firstId).toMatch(/^input-/);
    expect(secondId).toMatch(/^input-/);
  });
});

describe('Textarea Component', () => {
  it('renders textarea without label', () => {
    render(<Textarea placeholder="Enter description" />);
    const textarea = screen.getByPlaceholderText('Enter description');
    expect(textarea).toBeInTheDocument();
    expect(textarea.tagName).toBe('TEXTAREA');
  });

  it('renders textarea with label', () => {
    render(<Textarea label="Description" placeholder="Enter description" />);
    const label = screen.getByText('Description');
    const textarea = screen.getByLabelText('Description');
    expect(label).toBeInTheDocument();
    expect(textarea).toBeInTheDocument();
    expect(label).toHaveAttribute('for', textarea.id);
  });

  it('applies default classes including resize-vertical', () => {
    render(<Textarea />);
    const textarea = screen.getByRole('textbox');
    expect(textarea).toHaveClass(
      'block',
      'w-full',
      'px-3',
      'py-2',
      'border',
      'resize-vertical'
    );
  });

  it('shows error message and applies error styles', () => {
    render(<Textarea label="Comment" error="Comment is required" />);
    const textarea = screen.getByLabelText('Comment');
    const errorMessage = screen.getByText('Comment is required');
    expect(errorMessage).toBeInTheDocument();
    expect(textarea).toHaveClass('border-red-300');
  });

  it('handles textarea changes', () => {
    const handleChange = jest.fn();
    render(<Textarea onChange={handleChange} />);
    const textarea = screen.getByRole('textbox');
    fireEvent.change(textarea, { target: { value: 'multi\nline\ntext' } });
    expect(handleChange).toHaveBeenCalledTimes(1);
    expect(textarea).toHaveValue('multi\nline\ntext');
  });

  it('generates unique id when not provided', () => {
    const { rerender } = render(<Textarea label="First" />);
    const firstTextarea = screen.getByLabelText('First');
    const firstId = firstTextarea.id;
    
    rerender(<Textarea label="Second" />);
    const secondTextarea = screen.getByLabelText('Second');
    const secondId = secondTextarea.id;
    
    expect(firstId).not.toBe(secondId);
    expect(firstId).toMatch(/^textarea-/);
    expect(secondId).toMatch(/^textarea-/);
  });
});

describe('Select Component', () => {
  const options = [
    { value: 'option1', label: 'Option 1' },
    { value: 'option2', label: 'Option 2' },
    { value: 'option3', label: 'Option 3' },
  ];

  it('renders select without label', () => {
    render(<Select options={options} />);
    const select = screen.getByRole('combobox');
    expect(select).toBeInTheDocument();
  });

  it('renders select with label', () => {
    render(<Select label="Choose option" options={options} />);
    const label = screen.getByText('Choose option');
    const select = screen.getByLabelText('Choose option');
    expect(label).toBeInTheDocument();
    expect(select).toBeInTheDocument();
    expect(label).toHaveAttribute('for', select.id);
  });

  it('renders all options', () => {
    render(<Select options={options} />);
    options.forEach(option => {
      expect(screen.getByText(option.label)).toBeInTheDocument();
    });
  });

  it('applies default classes', () => {
    render(<Select options={options} />);
    const select = screen.getByRole('combobox');
    expect(select).toHaveClass(
      'block',
      'w-full',
      'px-3',
      'py-2',
      'border',
      'border-gray-300',
      'rounded-md'
    );
  });

  it('shows error message and applies error styles', () => {
    render(<Select label="Priority" options={options} error="Please select a priority" />);
    const select = screen.getByLabelText('Priority');
    const errorMessage = screen.getByText('Please select a priority');
    expect(errorMessage).toBeInTheDocument();
    expect(select).toHaveClass('border-red-300');
  });

  it('handles selection changes', () => {
    const handleChange = jest.fn();
    render(<Select options={options} onChange={handleChange} />);
    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: 'option2' } });
    expect(handleChange).toHaveBeenCalledTimes(1);
    expect(select).toHaveValue('option2');
  });

  it('is disabled when disabled prop is true', () => {
    render(<Select options={options} disabled />);
    const select = screen.getByRole('combobox');
    expect(select).toBeDisabled();
    expect(select).toHaveClass('disabled:opacity-50');
  });

  it('shows helper text when no error', () => {
    render(<Select label="Status" options={options} helperText="Select current status" />);
    const helperText = screen.getByText('Select current status');
    expect(helperText).toBeInTheDocument();
    expect(helperText).toHaveClass('text-gray-500');
  });

  it('generates unique id when not provided', () => {
    const { rerender } = render(<Select label="First" options={options} />);
    const firstSelect = screen.getByLabelText('First');
    const firstId = firstSelect.id;
    
    rerender(<Select label="Second" options={options} />);
    const secondSelect = screen.getByLabelText('Second');
    const secondId = secondSelect.id;
    
    expect(firstId).not.toBe(secondId);
    expect(firstId).toMatch(/^select-/);
    expect(secondId).toMatch(/^select-/);
  });

  it('handles empty options array', () => {
    render(<Select options={[]} />);
    const select = screen.getByRole('combobox');
    expect(select).toBeInTheDocument();
    expect(select.children).toHaveLength(0);
  });
});