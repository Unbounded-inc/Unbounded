import React, { useEffect, useState } from "react";
import { Bell } from "lucide-react";
import { socket } from "../../lib/socket";
import "../../Styles/Notifications.css";

interface Notification {
  id: string;
  message: string;
  timestamp: string;
}

interface DBNotification {
  id: string;
  content: string;
  created_at: string;
}


const NotificationSidebar: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [visible, setVisible] = useState(false);
  const [hasUnseen, setHasUnseen] = useState(false);

  useEffect(() => {
    const userId = localStorage.getItem("userId");

    // Load from DB on mount
    if (userId) {
      socket.emit("register", userId);

      fetch(`http://localhost:5001/api/notifications/${userId}`)
        .then(res => res.json())
        .then(data => {
          if (data.notifications) {
            setNotifications(data.notifications.map((n: DBNotification) => ({
              id: n.id,
              message: n.content,
              timestamp: n.created_at,
            })));
          }
        });
    }

    socket.on("notification", (data: Notification) => {
      console.log("✅ Received notification:", data);
      setNotifications((prev) => [data, ...prev]);
      setHasUnseen(true);
    });

    return () => {
      socket.off("notification");
    };
  }, []);


  const toggleSidebar = async () => {
    setVisible((prev) => !prev);
    setHasUnseen(false);

    const userId = localStorage.getItem("userId");
    if (userId) {
      await fetch(`http://localhost:5001/api/notifications/mark-read/${userId}`, {
        method: "PATCH",
      });
    }
  };


  return (
    <>
      <button
        className={`notification-button ${hasUnseen ? "shake" : ""}`}
        aria-label="Bell"
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
