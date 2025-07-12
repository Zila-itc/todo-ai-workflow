import { cn } from './cn';

describe('cn utility function', () => {
  it('combines class names correctly', () => {
    const result = cn('class1', 'class2');
    expect(result).toBe('class1 class2');
  });

  it('handles conditional classes', () => {
    const result = cn('base', true && 'conditional', false && 'hidden');
    expect(result).toBe('base conditional');
  });

  it('handles arrays of classes', () => {
    const result = cn(['class1', 'class2'], 'class3');
    expect(result).toBe('class1 class2 class3');
  });

  it('handles objects with boolean values', () => {
    const result = cn({
      'class1': true,
      'class2': false,
      'class3': true,
    });
    expect(result).toBe('class1 class3');
  });

  it('merges conflicting Tailwind classes', () => {
    const result = cn('px-2 py-1', 'px-4');
    expect(result).toBe('py-1 px-4');
  });

  it('handles undefined and null values', () => {
    const result = cn('class1', undefined, null, 'class2');
    expect(result).toBe('class1 class2');
  });

  it('handles empty strings', () => {
    const result = cn('class1', '', 'class2');
    expect(result).toBe('class1 class2');
  });

  it('handles complex Tailwind class merging', () => {
    const result = cn(
      'bg-red-500 text-white',
      'bg-blue-500',
      'hover:bg-green-500'
    );
    expect(result).toBe('text-white bg-blue-500 hover:bg-green-500');
  });

  it('handles mixed input types', () => {
    const result = cn(
      'base',
      ['array1', 'array2'],
      { conditional: true, hidden: false },
      true && 'truthy',
      false && 'falsy'
    );
    expect(result).toBe('base array1 array2 conditional truthy');
  });

  it('returns empty string for no arguments', () => {
    const result = cn();
    expect(result).toBe('');
  });

  it('returns empty string for all falsy arguments', () => {
    const result = cn(false, null, undefined, '');
    expect(result).toBe('');
  });

  it('handles responsive classes correctly', () => {
    const result = cn('w-full', 'sm:w-1/2', 'md:w-1/3', 'lg:w-1/4');
    expect(result).toBe('w-full sm:w-1/2 md:w-1/3 lg:w-1/4');
  });

  it('merges spacing classes correctly', () => {
    const result = cn('p-2', 'px-4', 'py-6');
    expect(result).toBe('p-2 px-4 py-6');
  });

  it('handles state variants', () => {
    const result = cn(
      'bg-blue-500',
      'hover:bg-blue-600',
      'focus:bg-blue-700',
      'active:bg-blue-800'
    );
    expect(result).toBe('bg-blue-500 hover:bg-blue-600 focus:bg-blue-700 active:bg-blue-800');
  });

  it('handles dark mode classes', () => {
    const result = cn('bg-white', 'dark:bg-gray-900', 'text-black', 'dark:text-white');
    expect(result).toBe('bg-white dark:bg-gray-900 text-black dark:text-white');
  });
});