import './App.css';
import { CssBaseline, Container, Box, Paper } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { AtlasThemeProvider } from './providers/ThemeProvider';
import { TodoProvider } from './contexts/TodoContext';
import { Header } from './components/Layout/Header';
import { Footer } from './components/Layout/Footer';
import { TodoList } from './components/TodoList/TodoList';
import { CreateTodoButton } from './components/CreateTodoButton/CreateTodoButton';
import { TodoModal } from './components/TodoModal/TodoModal';
import type { Todo } from './types/Todo';
import { useState } from 'react';

function App() {
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);

  const handleEditTodo = (todo: Todo) => {
    setEditingTodo(todo);
  };

  const handleCloseEditModal = () => {
    setEditingTodo(null);
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <AtlasThemeProvider>
        <CssBaseline />
        <TodoProvider>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              minHeight: '100vh',
              backgroundColor: theme => theme.palette.background.default,
            }}
          >
            <Header />
            <Container
              maxWidth="md"
              sx={{
                flexGrow: 1,
                py: { xs: 2, sm: 3, md: 4 },
                px: { xs: 2, sm: 3, md: 4 },
              }}
            >
              <Paper
                elevation={2}
                sx={{
                  p: { xs: 2, sm: 3, md: 4 },
                  borderRadius: 2,
                  bgcolor: 'background.paper',
                }}
              >
                <Box component="main">
                  <Box
                    sx={{
                      mb: 3,
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <h2>Your Todos</h2>
                    <CreateTodoButton />
                  </Box>
                  <TodoList onEditTodo={handleEditTodo} />
                </Box>
              </Paper>
            </Container>
            <Footer />
          </Box>

          {editingTodo && (
            <TodoModal
              isOpen={!!editingTodo}
              onClose={handleCloseEditModal}
              mode="edit"
              initialValues={{
                id: editingTodo.id,
                title: editingTodo.title,
                description: editingTodo.description,
                completed: editingTodo.completed,
                dueDate: editingTodo.dueDate,
              }}
            />
          )}
        </TodoProvider>
      </AtlasThemeProvider>
    </LocalizationProvider>
  );
}

export default App;
