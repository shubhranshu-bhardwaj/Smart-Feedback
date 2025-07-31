// src/Pages/RegisterPage.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import RegisterPage from './RegisterPage';
import { MemoryRouter } from 'react-router-dom';
import { vi } from 'vitest';
import API from '../api/api';

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => vi.fn(),
  };
});

vi.mock('../api/api', () => ({
  default: {
    post: vi.fn(),
  },
}));

describe('RegisterPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders all input fields', () => {
    render(<RegisterPage />, { wrapper: MemoryRouter });

    expect(screen.getByPlaceholderText('Full Name')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Email')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Password')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Confirm Password')).toBeInTheDocument();
    expect(screen.getByText('Select Gender')).toBeInTheDocument();
  });

  it('shows error if fields are empty on submit', async () => {
    render(<RegisterPage />, { wrapper: MemoryRouter });

    fireEvent.click(screen.getByText('Create Account'));

    expect(await screen.findByText('Please fill in all fields.')).toBeInTheDocument();
  });

  it('shows error if passwords do not match', async () => {
    render(<RegisterPage />, { wrapper: MemoryRouter });

    fireEvent.change(screen.getByPlaceholderText('Full Name'), { target: { value: 'Test User' } });
    fireEvent.change(screen.getByDisplayValue('Select Gender'), { target: { value: 'Male' } });
    fireEvent.change(screen.getByPlaceholderText('Email'), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByPlaceholderText('Password'), { target: { value: 'pass123' } });
    fireEvent.change(screen.getByPlaceholderText('Confirm Password'), { target: { value: 'pass456' } });

    fireEvent.click(screen.getByText('Create Account'));

    expect(await screen.findByText('Passwords do not match.')).toBeInTheDocument();
  });

  it('submits form successfully and shows success message', async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (API.post as any).mockResolvedValue({ status: 201 });

    render(<RegisterPage />, { wrapper: MemoryRouter });

    fireEvent.change(screen.getByPlaceholderText('Full Name'), { target: { value: 'Test User' } });
    fireEvent.change(screen.getByDisplayValue('Select Gender'), { target: { value: 'Male' } });
    fireEvent.change(screen.getByPlaceholderText('Email'), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByPlaceholderText('Password'), { target: { value: 'pass123' } });
    fireEvent.change(screen.getByPlaceholderText('Confirm Password'), { target: { value: 'pass123' } });

    fireEvent.click(screen.getByText('Create Account'));

    await waitFor(() => {
      expect(screen.getByText('Registration successful!')).toBeInTheDocument();
    });
  });
});
