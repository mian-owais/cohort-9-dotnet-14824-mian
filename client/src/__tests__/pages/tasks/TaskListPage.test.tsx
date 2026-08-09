import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import TaskListPage from '../../../pages/tasks/TaskListPage';
import { taskService } from '../../../services/task.service';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import '@testing-library/jest-dom';

vi.mock('../../../services/task.service', async () => {
  const actual = await vi.importActual('../../../services/task.service');
  return {
    ...actual as any,
    taskService: {
      getTasks: vi.fn(),
    },
  };
});

describe('TaskListPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderWithRouter = (ui: React.ReactElement) => {
    return render(<BrowserRouter>{ui}</BrowserRouter>);
  };

  it('renders loading state initially', () => {
    (taskService.getTasks as any).mockImplementation(() => new Promise(() => {}));
    renderWithRouter(<TaskListPage />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('renders tasks successfully', async () => {
    const mockTasks = [
      { id: 1, title: 'Task 1', description: 'Desc 1', status: 0, userId: 1 },
      { id: 2, title: 'Task 2', description: 'Desc 2', status: 2, userId: 1 }
    ];
    (taskService.getTasks as any).mockResolvedValue(mockTasks);
    
    renderWithRouter(<TaskListPage />);

    await waitFor(() => {
      expect(screen.getByText('Task 1')).toBeInTheDocument();
      expect(screen.getByText('Task 2')).toBeInTheDocument();
    });
  });

  it('displays empty state when no tasks match filter', async () => {
    (taskService.getTasks as any).mockResolvedValue([]);
    renderWithRouter(<TaskListPage />);

    await waitFor(() => {
      expect(screen.getByText('No tasks found matching your filter.')).toBeInTheDocument();
    });
  });
});
