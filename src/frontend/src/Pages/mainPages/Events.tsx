import React, { useState } from "react";
import Sidebar from "../../components/PageComponets/Sidebar";
import { MapContainer, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import lolImage from "../../assets/lol.jpg";
import CreateEventModal from "../../components/PageComponets/ CreateEventModal";
import "../../Styles/Events.css";

const Events: React.FC = () => {
  const [showModal, setShowModal] = useState(false);

  const localEvents = [
    { id: 1, name: "Mario Party", description: "Join us to compete in an epic Mario Party tournament on the Nintendo Switch", location: "Isabel's House" },
    { id: 2, name: "Pancake Day", description: "IHOP free stack of pancakes to celebrate National Pancake Day", location: "IHOP in the Bronx" },
    { id: 3, name: "Taste of Dominican Republic", description: "Food tasting event showcasing authentic regional Dominican cuisine.", location: "Central Park" },
  ];

  const yourEvents = [
    { id: 4, name: "Community Art Fair", description: "A local art fair showcasing artists from the community.", location: "Community Center" },
    { id: 5, name: "Neighborhood Cleanup", description: "Join us for a day of cleaning and beautifying the neighborhood.", location: "Main Street" },
    { id: 6, name: "Charity Fun Run", description: "A 5K fun run to raise funds for local charities.", location: "City Park" },
  ];

  return (
    <div className="feed-container">
      <Sidebar />

      <main className="feed-content" style={{ padding: 0 }}>
        <div style={{ padding: "2rem" }}>
          <h2 className="friends-title">Map and Events</h2>

          <div className="friends-search-bar">
            <input
              type="text"
              placeholder="Search for a specific event..."
              className="friends-search-input"
            />
            <button className="add-friend-btn" onClick={() => setShowModal(true)}>Create</button>
          </div>

          <div style={{ width: "100%", height: "400px", margin: "2rem 0" }}>
            <MapContainer center={[40.77, -73.95]} zoom={12} style={{ height: "100%", width: "100%" }}>
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution="&copy; OpenStreetMap contributors"
              />
            </MapContainer>
          </div>

          <div style={{ display: "flex", gap: "6rem" }}>
            <div style={{ flex: 1, maxWidth: "400px" }}>
              <h3 className="section-subtitle">Local Events:</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                {localEvents.map((event) => (
                  <div
                    key={event.id}
                    className="friend-entry"
                    style={{
                      flexDirection: "column",
                      alignItems: "center",
                      width: "100%",
                      border: "5px solid rgb(76, 86, 158)",
                    }}
                  >
                    <img
                      src={lolImage}
                      alt="Event"
                      style={{ width: "90%", height: "100px", objectFit: "cover", borderRadius: "8px 8px 0 0" }}
                    />
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
                {yourEvents.map((event) => (
                  <div
                    key={event.id}
                    className="friend-entry"
                    style={{
                      flexDirection: "column",
                      alignItems: "center",
                      width: "100%",
                      border: "5px solid rgb(44, 36, 86)",
                    }}
                  >
                    <img
                      src={lolImage}
                      alt="Event"
                      style={{ width: "90%", height: "100px", objectFit: "cover", borderRadius: "8px 8px 0 0" }}
                    />
                    <div className="friend-text" style={{ width: "90%", textAlign: "center" }}>
                      <strong>{event.name}</strong>
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

      <CreateEventModal showModal={showModal} setShowModal={setShowModal} />
    </div>
  );
};

export default Events;

