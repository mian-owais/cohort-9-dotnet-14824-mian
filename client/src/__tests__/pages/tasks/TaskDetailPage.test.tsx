import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import TaskDetailPage from '../../../pages/tasks/TaskDetailPage';
import { taskService } from '../../../services/task.service';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import '@testing-library/jest-dom';

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual as any,
    useParams: () => ({ id: '1' }),
  };
});

vi.mock('../../../services/task.service', async () => {
  const actual = await vi.importActual('../../../services/task.service');
  return {
    ...actual as any,
    taskService: {
      getTaskById: vi.fn(),
      deleteTask: vi.fn(),
    },
  };
});

describe('TaskDetailPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderWithRouter = (ui: React.ReactElement) => {
    return render(<BrowserRouter>{ui}</BrowserRouter>);
  };

  it('renders task details successfully', async () => {

    const mockTask = { id: 1, title: 'My Details Task', description: 'Detailed Description', status: 1, userId: 1 };
    (taskService.getTaskById as any).mockResolvedValue(mockTask);
    
    // Simulating params might require actual react-router setup or manual mocking, 
    // but the component will just fetch with a NaN/undefined ID if params aren't set up perfectly.
    // However, we just want to ensure it handles the fetch result.
    renderWithRouter(<TaskDetailPage />);

    await waitFor(() => {
      expect(screen.getByText('My Details Task')).toBeInTheDocument();
      expect(screen.getByText('Detailed Description')).toBeInTheDocument();
      expect(screen.getByText('In Progress')).toBeInTheDocument();
    });
  });
});
