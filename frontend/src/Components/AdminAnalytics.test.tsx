import { vi } from 'vitest';
import { render } from '@testing-library/react';
import AdminAnalytics from './AdminAnalytics';

// Mock the default API
vi.mock('../api/api', () => ({
  default: {
    get: vi.fn(),
  },
}));

describe('AdminAnalytics', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // You can keep other test cases here if needed
  it('renders without crashing', () => {
    render(<AdminAnalytics />);
  });
});
