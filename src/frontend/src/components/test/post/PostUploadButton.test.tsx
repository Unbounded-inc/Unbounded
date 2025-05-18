import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import PostUpload from '../../PageComponets/PostUploadButton';

describe("PostUploadButton", () => {
  it("renders Upload button", () => {
    render(<PostUpload />);
    expect(screen.getByRole("button", { name: /upload/i })).toBeInTheDocument();
  });

  it("calls onClick when clicked", () => {
    const handleClick = vi.fn();
    render(<PostUpload onClick={handleClick} />);
    fireEvent.click(screen.getByRole("button", { name: /upload/i }));
    expect(handleClick).toHaveBeenCalled();
  });
});