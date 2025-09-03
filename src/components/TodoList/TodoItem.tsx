import React, { useMemo } from 'react';
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

// Helper function to parse date and return info object
const parseDueDate = (dueDate: string, currentDate: Date) => {
  try {
    const date = parseISO(dueDate);
    if (!isValid(date)) {
      return { isValid: false, formatted: 'Invalid date', isOverdue: false };
    }
    return {
      isValid: true,
      formatted: format(date, 'PP'), // e.g., "Sep 3, 2025"
      isOverdue: isBefore(date, currentDate),
    };
  } catch {
    return { isValid: false, formatted: 'Invalid date', isOverdue: false };
  }
};

export const TodoItem: React.FC<TodoItemProps> = ({ todo, onEditClick }) => {
  const { toggleTodoCompletion, deleteTodo } = useTodo();

  // Memoize current date and date parsing to avoid re-computation on every render
  const dueDateInfo = useMemo(() => {
    if (!todo.dueDate) return null;
    const currentDate = new Date();
    return parseDueDate(todo.dueDate, currentDate);
  }, [todo.dueDate]);

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
              {dueDateInfo && (
                <Chip
                  label={dueDateInfo.formatted}
                  size="small"
                  color={dueDateInfo.isOverdue ? 'error' : 'default'}
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
