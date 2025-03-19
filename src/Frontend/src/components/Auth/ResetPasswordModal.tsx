import React, { useState } from "react";

interface ResetPasswordModalProps {
  showModal: boolean;
  setShowModal: (show: boolean) => void;
}

const ResetPasswordModal: React.FC<ResetPasswordModalProps> = ({ showModal, setShowModal }) => {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  if (!showModal) return null;

  return (
    <div className="modal-overlay" style={{
      position: "fixed",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      backgroundColor: "rgba(0, 0, 0, 0.5)",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      zIndex: 1000
    }}>
      <div className="modal-content" style={{
        background: "white",
        padding: "20px",
        borderRadius: "10px",
        boxShadow: "0px 0px 10px rgba(0,0,0,0.2)",
        textAlign: "center",
        width: "300px"
      }}>
        <h2 style={{color:"black", margin:"5px"}}>Reset Password</h2>
        <input 
          type="password" 
          className="textfield"
          placeholder="Enter new password" 
          value={newPassword} 
          onChange={(e) => setNewPassword(e.target.value)}
        />
        <input 
          type="password" 
          className="textfield"
          placeholder="Re-enter new password" 
          value={confirmPassword} 
          onChange={(e) => setConfirmPassword(e.target.value)}
        />
        <div className="modal-buttons" style={{ display: "flex", justifyContent: "space-between", marginTop: "10px" }}>
          <button className="register-button" style={{ padding: "10px", borderRadius: "5px", background: "#ccc" }} onClick={() => setShowModal(false)}>Cancel</button>
          <button className="login-button" style={{ padding: "10px", borderRadius: "5px", background: "#4c569e", color: "white" }}>Save</button>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordModal;
