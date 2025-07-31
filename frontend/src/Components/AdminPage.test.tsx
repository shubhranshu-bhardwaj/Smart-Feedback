import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import AdminPage from './AdminPage';
import API from '../api/api';
import { vi } from 'vitest';

vi.mock('../api/api');

describe('AdminPage', () => {
  const mockFeedback = [
    {
      id: 1,
      name: 'John Doe',
      email: 'john@example.com',
      category: 'Website',
      feedback: 'Great work!',
    },
    {
      id: 2,
      name: 'Jane Smith',
      email: 'jane@example.com',
      category: 'Support',
      feedback: 'Helpful team!',
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders feedback data after fetch', async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (API.get as any).mockResolvedValueOnce({ data: mockFeedback });

    render(
      <MemoryRouter>
        <AdminPage />
      </MemoryRouter>
    );

    expect(await screen.findByText(/John Doe/i)).toBeInTheDocument();
    expect(screen.getByText(/Great work/i)).toBeInTheDocument();
    expect(screen.getByText(/Jane Smith/i)).toBeInTheDocument();
  });

  it('shows error if fetch fails', async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (API.get as any).mockRejectedValueOnce(new Error('Network error'));

    render(
      <MemoryRouter>
        <AdminPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/Something went wrong/i)).toBeInTheDocument();
    });
  });

  it('renders category dropdown options', async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (API.get as any).mockResolvedValueOnce({ data: mockFeedback });

    render(
      <MemoryRouter>
        <AdminPage />
      </MemoryRouter>
    );

    expect(await screen.findByText(/John Doe/i)).toBeInTheDocument();
    expect(screen.getByRole('combobox')).toBeInTheDocument();
  });
});
