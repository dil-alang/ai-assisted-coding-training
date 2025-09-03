import React from 'react';
import {
  ListItem,
  ListItemText,
  IconButton,
  Checkbox,
  Divider,
  Typography,
  Chip,
  Box,
} from '@mui/material';
import { format, parseISO, isBefore, isValid } from 'date-fns';
import type { Todo } from '../../types/Todo';
import { useTodo } from '../../hooks/useTodo';

interface TodoItemProps {
  todo: Todo;
  onEditClick: (todo: Todo) => void;
}

// Helper function to check if overdue
const isOverdue = (dueDate: string): boolean => {
  try {
    const date = parseISO(dueDate);
    return isValid(date) && isBefore(date, new Date());
  } catch {
    return false;
  }
};

// Helper function to format due date
const formatDueDate = (dueDate: string): string => {
  try {
    const date = parseISO(dueDate);
    return isValid(date) ? format(date, 'PP') : 'Invalid date'; // e.g., "Sep 3, 2025"
  } catch {
    return 'Invalid date';
  }
};

export const TodoItem: React.FC<TodoItemProps> = ({ todo, onEditClick }) => {
  const { toggleTodoCompletion, deleteTodo } = useTodo();

  return (
    <>
      <ListItem
        sx={{
          bgcolor: 'background.paper',
          py: 1,
          borderLeft: todo.completed ? '4px solid green' : '4px solid transparent',
          '&:hover': {
            bgcolor: 'action.hover',
            cursor: 'pointer',
          },
        }}
        onClick={() => onEditClick(todo)}
        secondaryAction={
          <IconButton
            edge="end"
            aria-label="delete"
            onClick={e => {
              e.stopPropagation();
              deleteTodo(todo.id);
            }}
          >
            Delete
          </IconButton>
        }
      >
        <Checkbox
          edge="start"
          checked={todo.completed}
          onClick={e => {
            e.stopPropagation();
            toggleTodoCompletion(todo.id);
          }}
          color="primary"
          sx={{ mr: 1 }}
        />
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
        />
      </ListItem>
      <Divider />
    </>
  );
};
