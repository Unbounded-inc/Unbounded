import React, { useState } from "react";
import "../../../Styles/profile/Settings.css";
import Sidebar from "../../../components/PageComponets/Sidebar";
import { useUser } from "../../../lib/UserContext";

const API_BASE = import.meta.env.PROD ? "" : "http://localhost:5001";

const Settings: React.FC = () => {
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showPhoneModal, setShowPhoneModal] = useState(false);
  const { user } = useUser();

  const Modal = ({ type, onClose }: { type: string; onClose: () => void }) => {
    const [current, setCurrent] = useState("");
    const [next, setNext] = useState("");
    const [confirm, setConfirm] = useState("");

    const handleSave = async () => {
      if (!current || !next || !confirm) {
        alert("Please fill in all fields.");
        return;
      }

      // Only check next vs confirm if it's for password updates
      if (type === "Password" && next !== confirm) {
        alert("New and confirm fields do not match.");
        return;
      }

      if (!user) {
        alert("User not loaded. Please try again later.");
        return;
      }

      let endpoint = "";
      const body: any = { userId: user.id };

      if (type === "Password") {
        endpoint = `${API_BASE}/api/users/edit-password-secure`;
        Object.assign(body, {
          currentPassword: current,
          newPassword: next,
        });
      } else if (type === "Email") {
        endpoint = `${API_BASE}/api/users/edit-email-secure`;
        Object.assign(body, {
          currentEmail: current,
          newEmail: next,
          currentPassword: confirm,
        });
      } else if (type === "Phone Number") {
        endpoint = `${API_BASE}/api/users/edit-phone-secure`;
        Object.assign(body, {
          currentPhone: current,
          newPhone: next,
          currentPassword: confirm,
        });
      }

      try {
        const res = await fetch(endpoint, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Update failed");

        alert(`${type} updated successfully.`);
        onClose();
      } catch (err: any) {
        alert(`Failed to update ${type}: ${err.message}`);
      }
    };

    const getInputType = (field: string) => {
      if (type === "Password") return "password";
      if (type === "Email") return field === "current" ? "email" : "email";
      if (type === "Phone Number") return field === "current" ? "text" : "tel";
      return "text";
    };

    const getPlaceholder = (field: string) => {
      if (type === "Password") {
        if (field === "current") return "Current Password";
        if (field === "new") return "New Password";
        if (field === "confirm") return "Re-enter New Password";
      } else if (type === "Email") {
        if (field === "current") return "Current Email";
        if (field === "new") return "New Email";
        if (field === "confirm") return "Current Password";
      } else if (type === "Phone Number") {
        if (field === "current") return "Current Phone Number";
        if (field === "new") return "New Phone Number";
        if (field === "confirm") return "Current Password";
      }
      return "";
    };

    return (
      <div className="settings-modal-overlay">
        <div className="settings-modal-content">
          <h2>Update {type}</h2>
          <input
            type={getInputType("current")}
            placeholder={getPlaceholder("current")}
            value={current}
            onChange={(e) => setCurrent(e.target.value)}
            className="settings-input"
          />
          <input
            type={getInputType("new")}
            placeholder={getPlaceholder("new")}
            value={next}
            onChange={(e) => setNext(e.target.value)}
            className="settings-input"
          />
          <input
            type={type === "Password" ? "password" : "password"}
            placeholder={getPlaceholder("confirm")}
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            className="settings-input"
          />
          <div className="settings-modal-buttons">
            <button onClick={onClose}>Cancel</button>
            <button onClick={handleSave}>Save</button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="settings-container">
      <Sidebar />
      <div className="settings-box">
        <h2>Manage your personal account details.</h2>

        <input
          type="text"
          value="••••••••"
          disabled
          className="settings-readonly"
        />
        <button onClick={() => setShowPasswordModal(true)} className="settings-button">
          Update Password
        </button>

        <input
          type="text"
          value={user?.email || "example@email.com"}
          disabled
          className="settings-readonly"
        />
        <button onClick={() => setShowEmailModal(true)} className="settings-button">
          Update Email
        </button>

        <input
          type="text"
          value={user?.phone_number || "(123) 456-7890"}
          disabled
          className="settings-readonly"
        />
        <button onClick={() => setShowPhoneModal(true)} className="settings-button">
          Update Phone Number
        </button>
      </div>

      {showPasswordModal && <Modal type="Password" onClose={() => setShowPasswordModal(false)} />}
      {showEmailModal && <Modal type="Email" onClose={() => setShowEmailModal(false)} />}
      {showPhoneModal && <Modal type="Phone Number" onClose={() => setShowPhoneModal(false)} />}
    </div>
  );
};

export default Settings;
