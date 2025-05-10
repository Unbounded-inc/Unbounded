
import React, { useState } from "react";
import "../../../Styles/Settings.css";
import Sidebar from "../../../components/PageComponets/Sidebar";

const Settings: React.FC = () => {
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showPhoneModal, setShowPhoneModal] = useState(false);

  const Modal = ({ type, onClose }: { type: string; onClose: () => void }) => {
    const [current, setCurrent] = useState("");
    const [next, setNext] = useState("");
    const [confirm, setConfirm] = useState("");

    const handleSave = () => {
      if (!current || !next || !confirm) {
        alert("Please fill in all fields.");
        return;
      }
      if (next !== confirm) {
        alert("New and confirm fields do not match.");
        return;
      }
      onClose();
    };

    return (
      <div className="settings-modal-overlay">
        <div className="settings-modal-content">
          <h2>Update {type}</h2>
          <input
            type="text"
            placeholder={`Current ${type}`}
            value={current}
            onChange={(e) => setCurrent(e.target.value)}
            className="settings-input"
          />
          <input
            type="text"
            placeholder={`New ${type}`}
            value={next}
            onChange={(e) => setNext(e.target.value)}
            className="settings-input"
          />
          <input
            type="text"
            placeholder={`Re-enter New ${type}`}
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
          value="example@email.com"
          disabled
          className="settings-readonly"
        />
        <button onClick={() => setShowEmailModal(true)} className="settings-button">
          Update Email
        </button>

        <input
          type="text"
          value="(123) 456-7890"
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
