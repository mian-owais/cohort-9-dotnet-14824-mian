import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import ProfilePage from '../../../pages/profile/ProfilePage';
import { userService } from '../../../services/user.service';

vi.mock('../../../services/user.service');

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('ProfilePage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders loading state initially', () => {
    (userService.getMe as ReturnType<typeof vi.fn>).mockImplementation(
      () => new Promise(() => {}) // never resolves
    );
    render(
      <BrowserRouter>
        <ProfilePage />
      </BrowserRouter>
    );
    expect(screen.getByText('Loading profile...')).toBeInTheDocument();
  });

  it('renders user details on successful fetch', async () => {
    const mockProfile = {
      id: 1,
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      role: 'Admin',
      createdAt: '2023-01-01T00:00:00Z',
    };
    (userService.getMe as ReturnType<typeof vi.fn>).mockResolvedValue(mockProfile);

    render(
      <BrowserRouter>
        <ProfilePage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('Admin')).toBeInTheDocument();
      expect(screen.getByText('john@example.com')).toBeInTheDocument();
    });
  });

  it('handles logout button click', async () => {
    const mockProfile = {
      id: 1,
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      role: 'Admin',
      createdAt: '2023-01-01T00:00:00Z',
    };
    (userService.getMe as ReturnType<typeof vi.fn>).mockResolvedValue(mockProfile);
    Storage.prototype.removeItem = vi.fn();

    render(
      <BrowserRouter>
        <ProfilePage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Log Out')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Log Out'));
    
    expect(localStorage.removeItem).toHaveBeenCalledWith('user');
    expect(mockNavigate).toHaveBeenCalledWith('/login');
  });
});
