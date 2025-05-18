import React, { useState } from "react";
import "../../Styles/CreateEventModal.css";

interface CreateEventModalProps {
  showModal: boolean;
  setShowModal: (show: boolean) => void;
  onEventCreated?: (event: any) => void;
}

const CreateEventModal: React.FC<CreateEventModalProps> = ({ showModal, setShowModal, onEventCreated }) => {
  const [image, setImage] = useState<File | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");

  if (!showModal) return null;

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImage(e.target.files[0]);
    }
  };

  const geocodeLocation = async (location: string) => {
    const apiKey = "af00308b5ea14153bbd63e0f536ccbf2";
    const url = `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(
      location
    )}&key=${apiKey}`;

    const res = await fetch(url);
    const data = await res.json();

    if (data.results.length > 0) {
      const { lat, lng } = data.results[0].geometry;
      return { lat, lng };
    } else {
      throw new Error("Location not found");
    }
  };

  const handleSave = async () => {
    try {
      const coords = await geocodeLocation(location);
      const event_date = new Date(`${date}T${time}`).toISOString();
      const user_id = localStorage.getItem("user_id");

      const eventPayload = {
        title: name,
        description,
        location,
        event_date,
        user_id,
        latitude: coords.lat,
        longitude: coords.lng,
        image_url: image?.name || "",
      };

      const response = await fetch("http://localhost:5001/api/events/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(eventPayload),
      });

      const result = await response.json();

      if (response.ok) {
        console.log("Event created:", result.event);
        onEventCreated?.(result.event);
        setShowModal(false);
        setName("");
        setDescription("");
        setLocation("");
        setDate("");
        setTime("");
        setImage(null);
      } else {
        console.error("Event creation failed:", result.error);
      }
    } catch (error) {
      console.error("Error creating event:", error);
      alert("Could not find the location. Please enter a valid address.");
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Create Event</h2>

        <div className="modal-form">
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="modal-input"
          />

          <input
            type="text"
            placeholder="Event Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="modal-input"
          />

          <textarea
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="modal-textarea"
          />

          <input
            type="text"
            placeholder="Location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="modal-input"
          />

          <input
            type="date"
            aria-label="Event Date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="modal-input"
          />

          <input
            type="time"
            aria-label="Event Time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            className="modal-input"
          />

          <div className="modal-buttons">
            <button
              className="modal-button-cancel"
              onClick={() => setShowModal(false)}
            >
              Cancel
            </button>
            <button className="modal-button-save" onClick={handleSave}>
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateEventModal;
