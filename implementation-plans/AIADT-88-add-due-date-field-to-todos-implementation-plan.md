# AIADT-88: Add Due Date Field to Todos - Implementation Plan

## Objective and Non-goals

### Objective

Add an optional due date field to the Todo data model and UI, allowing users to set deadlines for better task prioritization and time management.

### Non-goals

- Reminder notifications, calendar sync, or automatic sorting
- API/backend persistence (future work)
- Complex recurring date patterns

## Architecture/Design Overview

### Data Model Changes

- Extend `Todo` interface with optional `dueDate?: string` field (ISO 8601 format)
- Maintain backwards compatibility with existing todos without due dates

### UI Components

- Add Material UI DatePicker to TodoModal for date input
- Display due dates in TodoItem list with proper formatting
- Visual differentiation for overdue items using subtle styling

### Dependencies

- Add `@mui/x-date-pickers` for date picker component
- Add `date-fns` for date formatting and manipulation
- Wrap app in `LocalizationProvider` at App level

### Storage Strategy

- If sessionStorage persistence exists, extend it to include due dates
- Gracefully handle legacy data without due dates
- Validate and sanitize stored date values

## Detailed Steps

### Task 1: Install and Configure Dependencies

**Status**: TODO  
**Depends On**: None  
**Description**: Install required date handling dependencies and configure the application-level date provider.

**Code Snippets**:

```bash
npm install @mui/x-date-pickers date-fns
```

```tsx
// App.tsx - Add LocalizationProvider wrapper
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

function App() {
  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <AtlasThemeProvider>{/* existing app content */}</AtlasThemeProvider>
    </LocalizationProvider>
  );
}
```

**Verification**:

- Dependencies are installed in package.json
- App starts without errors after LocalizationProvider addition
- Date picker components can be imported without TypeScript errors

### Task 2: Extend Todo Data Model

**Status**: TODO  
**Depends On**: None  
**Description**: Add optional due date field to the Todo interface and update related type definitions.

**Code Snippets**:

```typescript
// src/types/Todo.ts
export interface Todo {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  createdAt: Date;
  dueDate?: string; // ISO 8601 format
}
```

**Verification**:

- TypeScript compilation succeeds
- Existing code continues to work without modifications
- New dueDate field is properly typed as optional string

### Task 3: Update TodoContext for Due Date Handling

**Status**: TODO  
**Depends On**: [2]  
**Description**: Modify TodoContext methods to handle the new due date field in add and edit operations.

**Code Snippets**:

```typescript
// src/contexts/TodoContext.tsx
const addTodo = (title: string, description: string, dueDate?: string) => {
  const newTodo: Todo = {
    id: uuidv4(),
    title,
    description,
    completed: false,
    createdAt: new Date(),
    dueDate, // Include optional due date
  };
  setTodos([...todos, newTodo]);
};

const editTodo = (id: string, updates: Partial<Todo>) => {
  setTodos(todos.map(todo => (todo.id === id ? { ...todo, ...updates } : todo)));
};
```

**Verification**:

- addTodo function accepts optional dueDate parameter
- editTodo function can update dueDate field
- Context provider functions work without breaking existing functionality

### Task 4: Add Date Picker to TodoModal

**Status**: TODO  
**Depends On**: [1, 3]  
**Description**: Integrate DatePicker component into the TodoModal for creating and editing todos with due dates.

**Code Snippets**:

```tsx
// src/components/TodoModal/TodoModal.tsx
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { format, isValid, parseISO } from 'date-fns';

// Add state for due date
const [dueDate, setDueDate] = useState<Date | null>(null);

// In useEffect for loading initial values
useEffect(() => {
  if (isOpen) {
    if (mode === 'edit' && initialValues) {
      setTitle(initialValues.title);
      setDescription(initialValues.description);
      setCompleted(initialValues.completed);
      // Parse due date if it exists
      if (initialValues.dueDate) {
        const parsedDate = parseISO(initialValues.dueDate);
        setDueDate(isValid(parsedDate) ? parsedDate : null);
      } else {
        setDueDate(null);
      }
    } else {
      setTitle('');
      setDescription('');
      setCompleted(false);
      setDueDate(null);
    }
    setTitleError('');
  }
}, [isOpen, mode, initialValues]);

// In handleSubmit
const handleSubmit = (e: React.FormEvent) => {
  e.preventDefault();
  if (!validateForm()) return;

  const dueDateString = dueDate ? dueDate.toISOString() : undefined;

  if (mode === 'create') {
    addTodo(title.trim(), description.trim(), dueDateString);
  } else if (mode === 'edit' && initialValues) {
    editTodo(initialValues.id, {
      title: title.trim(),
      description: description.trim(),
      completed,
      dueDate: dueDateString,
    });
  }
  onClose();
};

// Add DatePicker to form
<DatePicker
  label="Due Date (optional)"
  value={dueDate}
  onChange={newValue => setDueDate(newValue)}
  slotProps={{
    textField: {
      fullWidth: true,
      'data-testid': 'due-date-picker',
    },
  }}
/>;
```

**Verification**:

- DatePicker appears in both create and edit modes
- Date selection works and updates state correctly
- Form submission includes due date in ISO format
- Existing functionality remains unaffected

### Task 5: Display Due Date in TodoItem

**Status**: TODO  
**Depends On**: [2]  
**Description**: Show due dates in the todo list with proper formatting and visual indicators for overdue items.

**Code Snippets**:

```tsx
// src/components/TodoList/TodoItem.tsx
import { format, parseISO, isBefore } from 'date-fns';
import { Chip, Box } from '@mui/material';

// Helper function to check if overdue
const isOverdue = (dueDate: string): boolean => {
  try {
    const date = parseISO(dueDate);
    return isBefore(date, new Date());
  } catch {
    return false;
  }
};

// Helper function to format due date
const formatDueDate = (dueDate: string): string => {
  try {
    const date = parseISO(dueDate);
    return format(date, 'PP'); // e.g., "Sep 3, 2025"
  } catch {
    return 'Invalid date';
  }
};

// In TodoItem component, add due date display
<ListItemText
  disableTypography
  primary={
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <Typography
        variant="body1"
        sx={{
          textDecoration: todo.completed ? 'line-through' : 'none',
          color: todo.completed ? 'text.secondary' : 'text.primary',
          fontWeight: 500,
        }}
      >
        {todo.title}
      </Typography>
      {todo.dueDate && (
        <Chip
          label={formatDueDate(todo.dueDate)}
          size="small"
          color={isOverdue(todo.dueDate) ? 'error' : 'default'}
          variant="outlined"
          sx={{ fontSize: '0.75rem' }}
        />
      )}
    </Box>
  }
  secondary={
    <Typography
      variant="body2"
      sx={{
        color: 'text.secondary',
        textDecoration: todo.completed ? 'line-through' : 'none',
      }}
    >
      {todo.description}
    </Typography>
  }
/>;
```

**Verification**:

- Due dates appear as formatted chips next to todo titles
- Overdue items show red-colored chips
- Layout remains clean and readable
- Due dates don't break existing styling

### Task 6: Handle Storage Persistence (if exists)

**Status**: TODO  
**Depends On**: [2]  
**Description**: If sessionStorage persistence is implemented, ensure due dates are properly saved and loaded with backward compatibility.

**Code Snippets**:

```typescript
// Extend storage validation to handle due dates
const isValidTodo = (item: any): item is Todo => {
  return (
    typeof item === 'object' &&
    typeof item.id === 'string' &&
    typeof item.title === 'string' &&
    typeof item.description === 'string' &&
    typeof item.completed === 'boolean' &&
    item.createdAt instanceof Date &&
    (item.dueDate === undefined || typeof item.dueDate === 'string')
  );
};

// Migration for legacy data without due dates
const migrateTodoData = (todos: any[]): Todo[] => {
  return todos.map(todo => ({
    ...todo,
    dueDate: todo.dueDate || undefined, // Ensure dueDate field exists
  }));
};
```

**Verification**:

- Due dates persist after page refresh (if storage exists)
- Legacy todos without due dates load correctly
- No data corruption occurs during storage operations
- Storage validation includes due date field

### Task 7: Add Date Validation

**Status**: TODO  
**Depends On**: [4]  
**Description**: Implement proper validation for due date inputs to prevent invalid date submissions.

**Code Snippets**:

```tsx
// In TodoModal validation
const validateForm = () => {
  if (!title.trim()) {
    setTitleError('Title is required');
    return false;
  }

  // Validate due date if provided
  if (dueDate && !isValid(dueDate)) {
    // Handle invalid date - could set error state
    console.warn('Invalid due date provided');
    return false;
  }

  return true;
};
```

**Verification**:

- Invalid dates are rejected during form submission
- Error handling provides user feedback for invalid dates
- Date picker prevents obviously invalid dates (like 32/13/2025)
- Form validation works correctly with and without due dates

### Task 8: Update Unit Tests

**Status**: TODO  
**Depends On**: [2, 3, 4, 5]  
**Description**: Add comprehensive unit tests for due date functionality across all modified components.

**Code Snippets**:

```typescript
// Tests for TodoContext
describe('TodoContext with due dates', () => {
  it('should create todo with due date', () => {
    const dueDate = '2025-12-31T23:59:59.999Z';
    addTodo('Test', 'Description', dueDate);
    expect(todos[0].dueDate).toBe(dueDate);
  });

  it('should create todo without due date', () => {
    addTodo('Test', 'Description');
    expect(todos[0].dueDate).toBeUndefined();
  });

  it('should edit todo due date', () => {
    const newDueDate = '2025-06-15T12:00:00.000Z';
    editTodo(todoId, { dueDate: newDueDate });
    expect(todos.find(t => t.id === todoId)?.dueDate).toBe(newDueDate);
  });
});

// Tests for TodoModal
describe('TodoModal with due dates', () => {
  it('should render date picker', () => {
    render(<TodoModal isOpen mode="create" onClose={jest.fn()} />);
    expect(screen.getByTestId('due-date-picker')).toBeInTheDocument();
  });

  it('should submit with selected due date', async () => {
    // Test date selection and form submission
  });
});

// Tests for TodoItem
describe('TodoItem with due dates', () => {
  it('should display formatted due date', () => {
    const todo = { ...mockTodo, dueDate: '2025-12-31T23:59:59.999Z' };
    render(<TodoItem todo={todo} onEditClick={jest.fn()} />);
    expect(screen.getByText('Dec 31, 2025')).toBeInTheDocument();
  });

  it('should show overdue indicator', () => {
    const todo = { ...mockTodo, dueDate: '2020-01-01T00:00:00.000Z' };
    render(<TodoItem todo={todo} onEditClick={jest.fn()} />);
    // Check for error-colored chip
  });
});
```

**Verification**:

- All existing tests continue to pass
- New tests cover due date functionality comprehensively
- Test coverage meets or exceeds existing baseline
- Edge cases are properly tested (invalid dates, missing dates, etc.)

## Data/Schema Changes and Migrations

### Schema Changes

- Add optional `dueDate` field to Todo interface as string (ISO 8601 format)
- No database migrations required (client-side only)

### Data Migration Strategy

- Existing todos automatically get `undefined` for dueDate field
- Storage layer validates and migrates legacy data on load
- No user action required for backward compatibility

## API Contracts and External Integrations

### No API Changes Required

- Feature is entirely client-side
- Future backend integration will require API endpoint modifications
- Current implementation prepares data structure for future backend persistence

## Feature Flags/Config Changes

### No Feature Flags Required

- Feature is always enabled once deployed
- No configuration changes needed
- Progressive enhancement approach ensures backward compatibility

## Tests (Unit/Integration/E2E) and Test Data

### Unit Tests

- TodoContext: Test addTodo and editTodo with due dates
- TodoModal: Test date picker integration and form submission
- TodoItem: Test due date display and overdue indicators
- Date utilities: Test formatting and validation functions

### Integration Tests

- End-to-end form submission with due dates
- Storage persistence (if applicable)
- Modal open/close with date picker state

### Test Data

```typescript
const mockTodoWithDueDate: Todo = {
  id: '1',
  title: 'Test Todo',
  description: 'Test Description',
  completed: false,
  createdAt: new Date('2025-01-01'),
  dueDate: '2025-12-31T23:59:59.999Z',
};

const mockOverdueTodo: Todo = {
  id: '2',
  title: 'Overdue Todo',
  description: 'This is overdue',
  completed: false,
  createdAt: new Date('2024-01-01'),
  dueDate: '2024-06-01T12:00:00.000Z',
};
```

## Telemetry/Monitoring

### No Telemetry Required

- Client-side feature with no analytics requirements
- Future backend integration may add usage metrics
- Error handling includes console warnings for development

## Risks, Edge Cases, Rollback

### Risks

1. **Browser Date Compatibility**: Different browsers may handle date parsing differently
   - Mitigation: Use date-fns library for consistent cross-browser behavior
2. **Storage Quota**: Adding due dates increases storage usage
   - Mitigation: Existing storage error handling continues to apply
3. **Performance Impact**: Date parsing and formatting on every render
   - Mitigation: Implement memoization if performance issues arise

### Edge Cases

1. **Invalid Date Strings**: Malformed ISO dates in storage
   - Handling: Treat as undefined and continue gracefully
2. **Timezone Issues**: User travels across timezones
   - Handling: Store in UTC, display in local timezone using date-fns
3. **Far Future Dates**: Dates beyond JavaScript Date limits
   - Handling: Date picker constraints prevent selection of invalid dates
4. **Legacy Data**: Existing todos without due dates
   - Handling: Backward compatibility ensures seamless operation

### Rollback Strategy

1. **Quick Rollback**: Remove date picker from modal, hide due date display
2. **Data Preservation**: Due date data remains in storage for future re-enable
3. **No Data Loss**: Rollback doesn't affect existing todo functionality

## Acceptance Criteria Mapping to Tasks

### AC1: "User can optionally pick a due date when creating a todo"

- **Mapped to**: Task 1 (dependencies), Task 4 (date picker in create mode)
- **Verification**: Create new todo with and without due date

### AC2: "Existing todos without due date remain unaffected"

- **Mapped to**: Task 2 (optional field), Task 6 (storage backward compatibility)
- **Verification**: Load app with existing todos, ensure they display correctly

### AC3: "Editing a todo shows current due date and allows change or removal"

- **Mapped to**: Task 4 (date picker in edit mode with existing values)
- **Verification**: Edit todo with due date, verify date loads and can be modified

### AC4: "Due date shows in todo item list"

- **Mapped to**: Task 5 (display in TodoItem)
- **Verification**: Create todo with due date, verify it appears in list

### AC5: "Validation prevents submission of clearly invalid dates"

- **Mapped to**: Task 7 (date validation)
- **Verification**: Attempt to submit invalid dates, verify rejection

### AC6: "If persistence already implemented, data persists after page refresh"

- **Mapped to**: Task 6 (storage persistence)
- **Verification**: Add due date, refresh page, verify persistence

### AC7: "All unit tests pass and coverage ≥ existing baseline"

- **Mapped to**: Task 8 (comprehensive testing)
- **Verification**: Run test suite, verify coverage metrics

## Execution Guide

Execute tasks in dependency order:

1. **Parallel Start**: Tasks 1, 2 (no dependencies)
2. **After Task 2**: Task 3 (needs Todo interface)
3. **After Tasks 1, 3**: Task 4 (needs dependencies and context)
4. **After Task 2**: Tasks 5, 6 (need Todo interface)
5. **After Task 4**: Task 7 (needs modal implementation)
6. **After Tasks 2, 3, 4, 5**: Task 8 (needs all components implemented)

Each task should be completed and verified before proceeding to dependent tasks.
