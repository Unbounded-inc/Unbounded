import React, { useEffect, useState } from "react";
import { Bell } from "lucide-react";
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
    const dummy: Notification[] = [
      { id: "1", message: "Manny liked your post.", timestamp: new Date().toISOString() },
      { id: "2", message: "Isabel commented on your post.", timestamp: new Date().toISOString() },
      { id: "3", message: "New message from Calvin.", timestamp: new Date().toISOString() },
      { id: "4", message: "New message from Manny.", timestamp: new Date().toISOString() },
      { id: "5", message: "New message from Isabel.", timestamp: new Date().toISOString() },
      { id: "6", message: "New message from Roy.", timestamp: new Date().toISOString() },
      { id: "7", message: "New message from Maylyn.", timestamp: new Date().toISOString() },
      { id: "8", message: "New message from Rita.", timestamp: new Date().toISOString() },
      { id: "10", message: "New message from Arsen.", timestamp: new Date().toISOString() },
    ];
    setNotifications(dummy);
    setHasUnseen(true);
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
        <Bell size={24} color="#333"/>
        {hasUnseen && <span className="badge"/>}
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
