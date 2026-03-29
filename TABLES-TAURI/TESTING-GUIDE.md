# TABLES-TAURI Testing Guide

This document provides guidelines and examples for writing and running tests in the TABLES-TAURI project.

---

## Quick Start

### Running Tests

```bash
# Run all tests once
npm test

# Run tests in watch mode (auto-rerun on changes)
npm run test:watch

# Run tests with coverage report
npm run test:coverage

# Run tests with UI dashboard
npm run test:ui
```

---

## Test File Organization

Test files should be placed next to the files they test:

```
src/
├── components/
│   ├── ConfirmModal.svelte
│   ├── ConfirmModal.test.js
│   ├── Header.svelte
│   └── Header.test.js
├── stores/
│   ├── cmsData.js
│   ├── cmsData.test.js
│   └── loading.test.js
└── test-setup.js
```

---

## Writing Tests

### Store Tests

Example store test structure:

```javascript
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { myStore, myAction } from './myStore.js';

describe('myStore', () => {
  let unsubscribe;
  let currentValue;

  beforeEach(() => {
    // Subscribe to store
    unsubscribe = myStore.subscribe(value => {
      currentValue = value;
    });
    
    // Reset mocks
    vi.clearAllMocks();
  });

  afterEach(() => {
    if (unsubscribe) unsubscribe();
  });

  describe('Initial State', () => {
    it('should have correct initial value', () => {
      expect(currentValue).toBe(expectedValue);
    });
  });

  describe('Actions', () => {
    it('should update state when action is called', () => {
      myAction(newValue);
      expect(currentValue).toBe(newValue);
    });

    it('should persist to localStorage', () => {
      myAction('test');
      const saved = localStorage.getItem('key');
      expect(JSON.parse(saved)).toBe('test');
    });
  });
});
```

### Component Tests

Example component test structure:

```javascript
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, fireEvent, screen, waitFor } from '@testing-library/svelte';
import MyComponent from './MyComponent.svelte';

describe('MyComponent', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render with default props', () => {
      render(MyComponent);
      expect(screen.getByText('Default Text')).toBeInTheDocument();
    });

    it('should render with custom props', () => {
      render(MyComponent, {
        props: { title: 'Custom Title' }
      });
      expect(screen.getByText('Custom Title')).toBeInTheDocument();
    });
  });

  describe('User Interactions', () => {
    it('should call handler when button is clicked', async () => {
      const onClick = vi.fn();
      render(MyComponent, { props: { onClick } });
      
      const button = screen.getByText('Click me');
      await fireEvent.click(button);
      
      expect(onClick).toHaveBeenCalled();
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty input', () => {
      render(MyComponent, { props: { items: [] } });
      expect(screen.getByText('No items')).toBeInTheDocument();
    });
  });
});
```

---

## Mocking

### Tauri APIs

Tauri APIs are automatically mocked in `test-setup.js`. To customize mocks:

```javascript
import { vi } from 'vitest';

// Mock invoke
const { invoke } = await import('@tauri-apps/api/core');
invoke.mockResolvedValue({ data: 'mocked' });

// Mock dialog
const { open } = await import('@tauri-apps/plugin-dialog');
open.mockResolvedValue('/path/to/file');
```

### localStorage

```javascript
// Set value
localStorage.setItem('key', JSON.stringify({ data: 'test' }));

// Get value
const value = JSON.parse(localStorage.getItem('key'));

// Clear all
localStorage.clear();
```

### Fetch

```javascript
global.fetch = vi.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({ data: 'mocked' }),
    text: () => Promise.resolve('mocked text'),
  })
);
```

---

## Common Patterns

### Testing Store Reactivity

```javascript
it('should react to state changes', async () => {
  const { container } = render(MyComponent);
  
  // Initial state
  expect(container.querySelector('.item')).toBeNull();
  
  // Update store
  myStore.addItem({ id: 1 });
  
  // Wait for re-render
  await waitFor(() => {
    expect(container.querySelector('.item')).toBeInTheDocument();
  });
});
```

### Testing Promise-based APIs

```javascript
it('should resolve promise on success', async () => {
  const { component } = render(MyComponent);
  
  const promise = component.someMethod();
  
  // Trigger resolution
  await fireEvent.click(screen.getByText('Confirm'));
  
  const result = await promise;
  expect(result).toBe(true);
});
```

### Testing Async Operations

```javascript
it('should handle async operation', async () => {
  const { invoke } = await import('@tauri-apps/api/core');
  invoke.mockResolvedValue({ success: true });
  
  await asyncOperation();
  
  expect(invoke).toHaveBeenCalledWith('command_name');
});
```

---

## Best Practices

### 1. Test Isolation

Each test should be independent:

```javascript
// ✅ Good - isolated test
it('should do something', () => {
  localStorage.clear();
  // Test code
});

// ❌ Bad - depends on previous test
it('should do something else', () => {
  // Assumes localStorage has value from previous test
});
```

### 2. Descriptive Test Names

```javascript
// ✅ Good - clear what is being tested
it('should save pages to localStorage when skipBroadcast is true', () => {
  // ...
});

// ❌ Bad - unclear
it('should work', () => {
  // ...
});
```

### 3. Arrange-Act-Assert Pattern

```javascript
it('should update state on action', () => {
  // Arrange
  const testValue = 'test';
  
  // Act
  myAction(testValue);
  
  // Assert
  expect(currentValue).toBe(testValue);
});
```

### 4. Test Edge Cases

```javascript
// Empty values
it('should handle empty array', () => { /* ... */ });
it('should handle null value', () => { /* ... */ });
it('should handle undefined', () => { /* ... */ });

// Special characters
it('should handle unicode characters', () => { /* ... */ });
it('should handle special characters', () => { /* ... */ });

// Large values
it('should handle very long strings', () => { /* ... */ });
it('should handle large arrays', () => { /* ... */ });
```

### 5. Accessibility Testing

```javascript
it('should have correct ARIA attributes', () => {
  render(MyComponent);
  
  const dialog = screen.getByRole('dialog');
  expect(dialog).toHaveAttribute('aria-modal', 'true');
  expect(dialog).toHaveAttribute('aria-labelledby', 'title-id');
});
```

---

## Debugging Tests

### Console Logging

```javascript
it('should debug this', () => {
  const value = getValue();
  console.log('Value:', value);
  expect(value).toBe(expected);
});
```

### Inspecting DOM

```javascript
it('should inspect DOM', () => {
  render(MyComponent);
  console.log(document.body.innerHTML);
});
```

### Running Specific Tests

```bash
# Run tests matching pattern
npx vitest run -t "should save pages"

# Run tests in specific file
npx vitest run src/stores/cmsData.test.js
```

---

## Common Issues

### Issue: Test fails due to async timing

**Solution:** Use `waitFor` or `await vi.dynamicImportSettled()`

```javascript
it('should wait for async operation', async () => {
  render(MyComponent);
  
  await waitFor(() => {
    expect(screen.getByText('Loaded')).toBeInTheDocument();
  }, { timeout: 2000 });
});
```

### Issue: Store state persists between tests

**Solution:** Reset store in `beforeEach`

```javascript
beforeEach(() => {
  myStore.reset();
  localStorage.clear();
});
```

### Issue: Component doesn't re-render on store change

**Solution:** Ensure component subscribes to store and use `waitFor`

```javascript
it('should re-render on store change', async () => {
  const { container } = render(MyComponent);
  
  myStore.update('new value');
  
  await waitFor(() => {
    expect(container.querySelector('.value')).toHaveTextContent('new value');
  });
});
```

---

## Test Coverage Goals

| Category | Current | Goal |
|----------|---------|------|
| Stores | 100% | 100% ✅ |
| Components | 20% | 80% |
| Utils | 0% | 80% |
| Overall | ~40% | 80% |

---

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [Testing Library Svelte](https://testing-library.com/docs/svelte-testing-library/intro/)
- [Svelte Testing Best Practices](https://svelte.dev/docs/svelte/v4-migration-guide#Testing)

---

## Questions?

If you have questions about testing, check:
1. Existing test files for examples
2. This guide
3. TESTING-REPORT.md for overall status

---

*Last updated: March 29, 2026*
