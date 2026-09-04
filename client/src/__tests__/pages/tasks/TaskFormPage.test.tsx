import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import TaskFormPage from '../../../pages/tasks/TaskFormPage';
import { taskService } from '../../../services/task.service';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import '@testing-library/jest-dom';
import { userService } from '../../../services/user.service';

vi.mock('../../../services/task.service', async () => {
  const actual = await vi.importActual('../../../services/task.service');
  return {
    ...actual as any,
    taskService: {
      createTask: vi.fn(),
      updateTask: vi.fn(),
      getTaskById: vi.fn(),
    },
  };
});

vi.mock('../../../services/user.service', () => {
  return {
    userService: {
      getMe: vi.fn(),
      getAllUsers: vi.fn(),
    }
  };
});

describe('TaskFormPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderWithRouter = (ui: React.ReactElement) => {
    return render(<BrowserRouter>{ui}</BrowserRouter>);
  };

  it('renders create form correctly', async () => {
    (userService.getMe as any).mockResolvedValue({ id: 1, role: 'User' });
    renderWithRouter(<TaskFormPage />);
    
    await waitFor(() => {
      expect(screen.getByText('New Task')).toBeInTheDocument();
    });
    expect(screen.getByLabelText(/title/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/description/i)).toBeInTheDocument();
  });

  it('submits create task form', async () => {
    (userService.getMe as any).mockResolvedValue({ id: 1, role: 'User' });
    (taskService.createTask as any).mockResolvedValue({ id: 1 });
    renderWithRouter(<TaskFormPage />);

    await waitFor(() => {
      expect(screen.getByLabelText(/title/i)).toBeInTheDocument();
    });

    fireEvent.change(screen.getByLabelText(/title/i), { target: { value: 'New Test Task' } });
    fireEvent.change(screen.getByLabelText(/description/i), { target: { value: 'Description' } });
    
    fireEvent.click(screen.getByRole('button', { name: /save task/i }));

    await waitFor(() => {
      expect(taskService.createTask).toHaveBeenCalledWith({
        title: 'New Test Task',
        description: 'Description',
        category: 'General',
        dueDate: null,
        assignedToUserId: undefined,
        priority: 0,
        projectId: null
      });
    });
  });
});
