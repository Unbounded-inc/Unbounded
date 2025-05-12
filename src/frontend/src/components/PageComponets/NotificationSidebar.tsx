import React, { useEffect, useState } from "react";
import { Bell } from "lucide-react";
import { socket } from "../../lib/socket";
import "../../Styles/Notifications.css";

interface Notification {
  id: string;
  message: string;
  timestamp: string;
}

const NotificationSidebar: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [visible, setVisible] = useState(false);
  const [hasUnseen, setHasUnseen] = useState(false);

  useEffect(() => {
    const userId = localStorage.getItem("userId");
    console.log("Registering user:", userId); // should match backend logs
    if (userId) {
      socket.emit("register", userId);
    }

    socket.on("notification", (data: Notification) => {
      console.log("✅ Received notification:", data); // this MUST show
      setNotifications((prev) => [data, ...prev]);
      setHasUnseen(true);
    });

    return () => {
      socket.off("notification");
    };
  }, []);

  const toggleSidebar = () => {
    setVisible(!visible);
    setHasUnseen(false);
  };

  return (
    <>
      <button
        className={`notification-button ${hasUnseen ? "shake" : ""}`}
        onClick={toggleSidebar}
      >
        <Bell size={24} color="#333" />
        {hasUnseen && <span className="badge" />}
      </button>

      {visible && (
        <div className="notification-popup">
          <div className="notification-header">Notifications</div>
          <div className="notification-list">
            <ul>
              {notifications.map((n) => (
                <li key={n.id}>
                  <p>{n.message}</p>
                  <small>{new Date(n.timestamp).toLocaleTimeString()}</small>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </>
  );
};

export default NotificationSidebar;
