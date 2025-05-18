import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, act} from '@testing-library/react';
import NotificationSidebar from '../../../components/PageComponets/NotificationSidebar';

// Mock localStorage
vi.stubGlobal('localStorage', {
  getItem: vi.fn(() => 'test-user-id'),
});

// Mock socket
vi.mock('../../../lib/socket', () => ({
  socket: {
    emit: vi.fn(),
    on: vi.fn(),
    off: vi.fn(),
  },
}));

// Mock fetch
beforeEach(() => {
  vi.resetAllMocks();

  global.fetch = vi.fn(() =>
    Promise.resolve({
      json: () => Promise.resolve({ notifications: [] }),
      ok: true,
    })
  ) as unknown as typeof fetch;
});

describe('NotificationSidebar', () => {
  it('renders bell button and toggles popup', async () => {
    render(<NotificationSidebar />);
    const bellButton = screen.getByRole('button');

    await act(async () => {
      fireEvent.click(bellButton);
    });

    expect(screen.getByText(/notifications/i)).toBeInTheDocument();
  });
});
