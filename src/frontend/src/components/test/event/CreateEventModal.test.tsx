import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import CreateEventModal from '../../PageComponets/CreateEventModal.tsx';

const setup = () => {
  const setShowModal = vi.fn();
  const onEventCreated = vi.fn();

  render(
    <CreateEventModal
      showModal={true}
      setShowModal={setShowModal}
      onEventCreated={onEventCreated}
    />
  );

  return { setShowModal, onEventCreated };
};

describe("CreateEventModal", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("renders when showModal is true", () => {
    setup();
    expect(screen.getByText("Create Event")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Event Name")).toBeInTheDocument();
    expect(screen.getByText("Cancel")).toBeInTheDocument();
  });

  it("lets user fill out the form", () => {
    setup();
    fireEvent.change(screen.getByPlaceholderText("Event Name"), {
      target: { value: "Birthday Bash" },
    });
    fireEvent.change(screen.getByPlaceholderText("Description"), {
      target: { value: "Come celebrate!" },
    });
    fireEvent.change(screen.getByPlaceholderText("Location"), {
      target: { value: "Central Park" },
    });

    expect(screen.getByPlaceholderText("Event Name")).toHaveValue("Birthday Bash");
    expect(screen.getByPlaceholderText("Description")).toHaveValue("Come celebrate!");
    expect(screen.getByPlaceholderText("Location")).toHaveValue("Central Park");
  });

  it("calls setShowModal(false) when Cancel is clicked", () => {
    const { setShowModal } = setup();
    fireEvent.click(screen.getByText("Cancel"));
    expect(setShowModal).toHaveBeenCalledWith(false);
  });

  it("calls onEventCreated after saving (mocking fetch + geocode)", async () => {
    const { onEventCreated } = setup();

    // Fill out required fields
    fireEvent.change(screen.getByPlaceholderText("Event Name"), {
      target: { value: "Mock Event" },
    });
    fireEvent.change(screen.getByPlaceholderText("Location"), {
      target: { value: "New York" },
    });
    fireEvent.change(screen.getByPlaceholderText("Description"), {
      target: { value: "Testing description" },
    });
    fireEvent.change(screen.getByLabelText("Event Date"), {
      target: { value: "2025-12-25" },
    });
    fireEvent.change(screen.getByLabelText("Event Time"), {
      target: { value: "18:00" },
    });

    // Mock localStorage and fetch
    vi.stubGlobal("localStorage", {
      getItem: vi.fn(() => "123"),
    });

    vi.stubGlobal("fetch", vi.fn().mockImplementation((url: string) => {
      if (url.includes("opencagedata")) {
        return Promise.resolve({
          json: () =>
            Promise.resolve({
              results: [{ geometry: { lat: 40.7128, lng: -74.006 } }],
            }),
        });
      } else {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ event: { id: 1, title: "Mock Event" } }),
        });
      }
    }));

    // Use act to ensure state updates are properly flushed
    await act(async () => {
      fireEvent.click(screen.getByText("Save"));
    });

    expect(onEventCreated).toHaveBeenCalledWith({ id: 1, title: "Mock Event" });
  });
});
