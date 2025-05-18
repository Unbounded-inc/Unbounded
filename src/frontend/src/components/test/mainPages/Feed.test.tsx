// src/components/test/main/Feed.test.tsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Feed from '../../../Pages/mainPages/Feed';

// ✅ Mock useUser for logged-in state
vi.mock('../../../lib/UserContext', () => {
  return {
    useUser: () => ({
      user: { id: '1', username: 'testuser', profile_picture: '' },
    }),
  };
});

beforeEach(() => {
  vi.resetAllMocks();
});

describe('Feed', () => {
  it('renders post input and upload button', () => {
    render(
      <MemoryRouter>
        <Feed />
      </MemoryRouter>
    );
    expect(screen.getByPlaceholderText(/share something.../i)).toBeInTheDocument();
    expect(screen.getByText('Upload')).toBeInTheDocument();
  });

  it('allows user to type a new post', () => {
    render(
      <MemoryRouter>
        <Feed />
      </MemoryRouter>
    );
    const input = screen.getByPlaceholderText(/share something.../i);
    fireEvent.change(input, { target: { value: 'This is a test post' } });
    expect(input).toHaveValue('This is a test post');
  });
});
