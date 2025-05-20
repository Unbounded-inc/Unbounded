import { render, screen, fireEvent } from "@testing-library/react";
import '@testing-library/jest-dom';
import { describe, it, expect, vi } from "vitest";
import PostTextBox from "../../PageComponets/PostTextBox.tsx";

describe("PostTextBox", () => {
  it("renders input field", () => {
    render(<PostTextBox postText="" onChange={() => {}} />);
    const input = screen.getByPlaceholderText(/share something.../i);
    expect(input).toBeInTheDocument();
  });

  it("calls onChange when text is entered", () => {
    const handleChange = vi.fn();
    render(<PostTextBox postText="" onChange={handleChange} />);
    const input = screen.getByPlaceholderText(/share something.../i);
    fireEvent.change(input, { target: { value: "Hello Unbounded!" } });
    expect(handleChange).toHaveBeenCalled();
  });
});
