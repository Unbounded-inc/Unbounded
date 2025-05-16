import Sidebar from "../../components/PageComponets/Sidebar";
import "leaflet/dist/leaflet.css";
import lolImage from "../../assets/lol.jpg";
import CreateEventModal from "../../components/PageComponets/ CreateEventModal";
import "../../Styles/Events.css";
import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";

const redIcon = new L.Icon({
  iconUrl: "https://maps.gstatic.com/mapfiles/ms2/micons/red-dot.png",
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

const Events: React.FC = () => {
  const [showModal, setShowModal] = useState(false);
  const [sidebarExpanded, setSidebarExpanded] = useState(false);
  const [yourEvents, setYourEvents] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchYourEvents = async () => {
    const userId = localStorage.getItem("user_id");
    if (!userId) return;

    try {
      const res = await fetch(`http://localhost:5001/api/events/user/${userId}`);
      const data = await res.json();
      setYourEvents(data);
    } catch (err) {
      console.error("Failed to fetch events:", err);
    }
  };

  useEffect(() => {
    const handleSidebarChange = () => {
      const sidebar = document.querySelector(".sidebar");
      if (sidebar) {
        setSidebarExpanded(sidebar.classList.contains("expanded"));
      }
    };

    handleSidebarChange();

    const observer = new MutationObserver(handleSidebarChange);
    const sidebar = document.querySelector(".sidebar");

    if (sidebar) {
      observer.observe(sidebar, { attributes: true, attributeFilter: ["class"] });
    }

    return () => {
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    fetchYourEvents();
  }, []);

  const handleDelete = async (eventId: string) => {
    const confirmed = window.confirm("Are you sure you want to delete this event?");
    if (!confirmed) return;

    try {
      await fetch(`http://localhost:5001/api/events/${eventId}`, {
        method: "DELETE",
      });
      await fetchYourEvents();
    } catch (err) {
      console.error("Failed to delete event:", err);
    }
  };

  const localEvents = [
    { id: 1, name: "Mario Party", description: "Join us to compete in an epic Mario Party tournament on the Nintendo Switch", location: "Isabel's House" },
    { id: 2, name: "Pancake Day", description: "IHOP free stack of pancakes to celebrate National Pancake Day", location: "IHOP in the Bronx" },
    { id: 3, name: "Taste of Dominican Republic", description: "Food tasting event showcasing authentic regional Dominican cuisine.", location: "Central Park" },
  ];

  const filteredEvents = yourEvents.filter(event =>
    event.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    event.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    event.location?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className={`feed-container ${sidebarExpanded ? "sidebar-expanded" : ""}`}>
      <Sidebar />

      <main className="feed-content" style={{ padding: 0 }}>
        <div style={{ padding: "2rem" }}>
          <h2 className="friends-title">Map and Events</h2>

          <div className="friends-search-bar">
            <input
              type="text"
              placeholder="Search for a specific event..."
              className="friends-search-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button className="add-friend-btn" onClick={() => setShowModal(true)}>
              Create
            </button>
          </div>

          <div style={{ width: "100%", height: "400px", margin: "2rem 0" }}>
            <MapContainer center={[40.77, -73.95]} zoom={12} style={{ height: "100%", width: "100%" }}>
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution="&copy; OpenStreetMap contributors"
              />
              {filteredEvents.map(event =>
                event.latitude && event.longitude && (
                  <Marker key={event.id} position={[event.latitude, event.longitude]} icon={redIcon}>
                    <Popup>
                      <strong>{event.title}</strong>
                      <br />
                      {event.location}
                    </Popup>
                  </Marker>
                )
              )}
            </MapContainer>
          </div>

          <div style={{ display: "flex", gap: "6rem" }}>
            <div style={{ flex: 1, maxWidth: "400px" }}>
              <h3 className="section-subtitle">Local Events:</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                {localEvents.map(event => (
                  <div key={event.id} className="friend-entry" style={{ flexDirection: "column", alignItems: "center", width: "100%", border: "5px solid rgb(76, 86, 158)" }}>
                    <img src={lolImage} alt="Event" style={{ width: "90%", height: "100px", objectFit: "cover", borderRadius: "8px 8px 0 0" }} />
                    <div className="friend-text" style={{ width: "90%", textAlign: "center" }}>
                      <strong>{event.name}</strong>
                      <p>{event.description}</p>
                      <p style={{ fontStyle: "italic", color: "#777" }}>{event.location}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ flex: 1, maxWidth: "400px" }}>
              <h3 className="section-subtitle">Your Events:</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                {filteredEvents.map(event => (
                  <div key={event.id} className="friend-entry" style={{ position: "relative", flexDirection: "column", alignItems: "center", width: "100%", border: "5px solid rgb(44, 36, 86)", borderRadius: "8px" }}>
                    <button
                      onClick={() => handleDelete(event.id)}
                      style={{
                        position: "absolute",
                        top: "-5px",
                        right: "-200px",
                        background: "transparent",
                        border: "none",
                        fontSize: "1.2rem",
                        cursor: "pointer",
                        color: "#000",
                        zIndex: 10,
                      }}
                      aria-label="Delete event"
                    >
                      ❌
                    </button>

                    <img
                      src={event.image_url ? `/uploads/${event.image_url}` : lolImage}
                      alt="Event"
                      style={{ width: "90%", height: "100px", objectFit: "cover", borderRadius: "8px 8px 0 0" }}
                    />
                    <div className="friend-text" style={{ width: "90%", textAlign: "center" }}>
                      <strong>{event.title}</strong>
                      <p>{event.description}</p>
                      <p style={{ fontStyle: "italic", color: "#777" }}>{event.location}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>

      <aside className="feed-right-panel">
        <div className="notification-panel">
          <h3>Notifications</h3>
          <p className="notification-item">Manny liked your post.</p>
          <p className="notification-item">Isabel commented on your post.</p>
          <p className="notification-item">New message from Calvin.</p>
        </div>
      </aside>

      <CreateEventModal
        showModal={showModal}
        setShowModal={setShowModal}
        onEventCreated={(newEvent) => setYourEvents((prev) => [...prev, newEvent])}
      />
    </div>
  );
};

export default Events;