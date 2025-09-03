// React is used implicitly
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { TodoModal } from '../components/TodoModal/TodoModal';
import { useTodo } from '../hooks/useTodo';
import type { Todo } from '../types/Todo';
import { vi, describe, it, expect, beforeEach } from 'vitest';

// Mock the useTodo hook
vi.mock('../hooks/useTodo', () => ({
  useTodo: vi.fn(),
}));

describe('TodoModal Component', () => {
  const mockAddTodo = vi.fn();
  const mockEditTodo = vi.fn();
  const mockOnClose = vi.fn();

  // Helper function to render TodoModal with LocalizationProvider
  const renderTodoModal = (props: {
    isOpen: boolean;
    onClose: () => void;
    mode: 'create' | 'edit';
    initialValues?: {
      id: string;
      title: string;
      description: string;
      completed: boolean;
      dueDate?: string;
      createdAt?: Date;
    };
  }) => {
    return render(
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <TodoModal {...props} />
      </LocalizationProvider>
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (useTodo as jest.MockedFunction<typeof useTodo>).mockReturnValue({
      addTodo: mockAddTodo,
      editTodo: mockEditTodo,
      todos: [],
      toggleTodoCompletion: vi.fn(),
      deleteTodo: vi.fn(),
    });
  });

  it('renders correctly when open for creating a new todo', () => {
    renderTodoModal({
      isOpen: true,
      mode: 'create',
      onClose: mockOnClose,
    });

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /create todo/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/title/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/description/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /create/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
  });

  it('renders correctly when open for editing an existing todo', () => {
    const existingTodo: Todo = {
      id: '1',
      title: 'Existing Todo',
      description: 'Existing Description',
      completed: false,
      dueDate: '2024-12-31T00:00:00.000Z',
      createdAt: new Date('2024-12-01T00:00:00.000Z'),
    };

    renderTodoModal({
      isOpen: true,
      mode: 'edit',
      initialValues: existingTodo,
      onClose: mockOnClose,
    });

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /edit todo/i })).toBeInTheDocument();
    expect(screen.getByDisplayValue('Existing Todo')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Existing Description')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
  });

  it('does not submit when title is empty', async () => {
    const user = userEvent.setup();
    renderTodoModal({ isOpen: true, onClose: mockOnClose, mode: 'create' });

    // Try to submit without entering a title
    const submitButton = screen.getByTestId('submit-button');
    await user.click(submitButton);

    // Should not call addTodo
    expect(mockAddTodo).not.toHaveBeenCalled();
    expect(mockOnClose).not.toHaveBeenCalled();
  });

  it('calls addTodo when form is submitted in create mode', async () => {
    const user = userEvent.setup();
    renderTodoModal({ isOpen: true, onClose: mockOnClose, mode: 'create' });

    // Fill in form fields
    await user.type(screen.getByTestId('title-input'), 'New Todo');
    await user.type(screen.getByTestId('description-input'), 'New Description');

    // Submit the form
    const submitButton = screen.getByTestId('submit-button');
    await user.click(submitButton);

    // Should call addTodo with correct values
    expect(mockAddTodo).toHaveBeenCalledWith('New Todo', 'New Description', undefined);

    // Should close the modal
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('calls editTodo when form is submitted in edit mode', async () => {
    const user = userEvent.setup();
    const mockTodo = {
      id: '123',
      title: 'Test Todo',
      description: 'Test Description',
      completed: false,
    };

    renderTodoModal({ isOpen: true, onClose: mockOnClose, mode: 'edit', initialValues: mockTodo });

    // Edit form fields
    await user.clear(screen.getByDisplayValue('Test Todo'));
    await user.type(screen.getByTestId('title-input'), 'Updated Todo');
    await user.clear(screen.getByDisplayValue('Test Description'));
    await user.type(screen.getByTestId('description-input'), 'Updated Description');

    // Mark as completed
    const completedCheckbox = screen.getByTestId('completed-checkbox');
    await user.click(completedCheckbox);

    // Submit the form
    await user.click(screen.getByTestId('submit-button'));

    // Should call editTodo with correct values
    expect(mockEditTodo).toHaveBeenCalledWith('123', {
      title: 'Updated Todo',
      description: 'Updated Description',
      completed: true,
    });

    // Should close the modal
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('closes the modal when cancel button is clicked', async () => {
    const user = userEvent.setup();
    renderTodoModal({ isOpen: true, onClose: mockOnClose, mode: 'create' });

    // Click cancel button
    await user.click(screen.getByText('Cancel'));

    // Should call onClose
    expect(mockOnClose).toHaveBeenCalled();

    // Should not call addTodo
    expect(mockAddTodo).not.toHaveBeenCalled();
  });
});
