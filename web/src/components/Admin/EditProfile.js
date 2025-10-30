import React, { useState, useEffect } from "react";
import axios from "axios";
import API_URL from "../Utils/Api";
import "../css/edit.css";
import logo from "../assets/Logo.png"; // Same logo from HomeDashboard

const EditProfile = ({ setPage }) => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    address: "",
    phone: "",
  });
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState(""); // 'success', 'error', 'info'
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);

  const token = localStorage.getItem("token");
  const adminId = localStorage.getItem("id");

  // ✅ Fetch current admin profile
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get(`${API_URL}/admins/profile/${adminId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setForm({
          name: res.data.name,
          email: res.data.email,
          address: res.data.address || "",
          phone: res.data.phone || "",
        });
        setIsFetching(false);
      } catch (err) {
        setMessage("Failed to load profile data");
        setMessageType("error");
        setIsFetching(false);
      }
    };
    if (adminId && token) fetchProfile();
  }, [adminId, token]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("Updating profile...");
    setMessageType("info");
    setIsLoading(true);

    try {
      const res = await axios.put(
        `${API_URL}/admins/edit-profile/${adminId}`,
        form,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // ✅ Update localStorage and UI
      localStorage.setItem("name", res.data.name);
      setMessage("Profile updated successfully!");
      setMessageType("success");
      setTimeout(() => setPage("admin-dashboard"), 1500);
    } catch (err) {
      setMessage(err.response?.data?.detail || "Update failed. Try again.");
      setMessageType("error");
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setPage("admin-dashboard");
  };

  return (
    <div className="edit-profile-container">
      <div className="edit-profile-card">
        {/* Back Button - Top Right */}
        <button 
          className="edit-back-button" 
          onClick={handleCancel}
          disabled={isLoading}
          title="Back to Dashboard"
        />

        {/* Header */}
        <div className="edit-profile-header">
          <div className="edit-profile-logo-wrapper">
            <img 
              src={logo} 
              alt="IT Thesis Library TUPT Logo" 
              className="edit-profile-logo"
            />
          
          </div>
          <h2 className="edit-profile-title">Edit Profile</h2>
          <p className="edit-profile-subtitle">
            Update your personal information and account details
          </p>
        </div>

        {/* Info Section */}
        <div className="edit-profile-info">
          <h3 className="edit-profile-info-title">Profile Information</h3>
          <p className="edit-profile-info-text">
            Keep your profile information up to date to ensure smooth communication and account management.
          </p>
        </div>

        {/* Form */}
        {isFetching ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: '#6b7280' }}>
            Loading profile data...
          </div>
        ) : (
          <form className="edit-profile-form" onSubmit={handleSubmit}>
            {/* Name and Email Row */}
            <div className="form-row">
              <div className="form-group">
                <label className="form-group-label required">Full Name</label>
                <input
                  type="text"
                  name="name"
                  className="edit-profile-input"
                  placeholder="Enter your full name"
                  value={form.name}
                  onChange={handleChange}
                  required
                  disabled={isLoading}
                />
              </div>

              <div className="form-group">
                <label className="form-group-label required">Email Address</label>
                <input
                  type="email"
                  name="email"
                  className="edit-profile-input"
                  placeholder="Enter your email"
                  value={form.email}
                  onChange={handleChange}
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Phone Number */}
            <div className="form-group">
              <label className="form-group-label">Phone Number</label>
              <input
                type="tel"
                name="phone"
                className="edit-profile-input"
                placeholder="Enter your phone number"
                value={form.phone}
                onChange={handleChange}
                disabled={isLoading}
              />
            </div>

            {/* Address */}
            <div className="form-group">
              <label className="form-group-label">Address</label>
              <input
                type="text"
                name="address"
                className="edit-profile-input"
                placeholder="Enter your address"
                value={form.address}
                onChange={handleChange}
                disabled={isLoading}
              />
            </div>

            {/* Form Actions */}
            <div className="form-actions">
              <button 
                type="submit" 
                className="edit-profile-submit"
                disabled={isLoading}
              >
                {isLoading && <span className="edit-profile-loading"></span>}
                {isLoading ? "Saving Changes..." : "Save Changes"}
              </button>
              
              <button 
                type="button"
                className="edit-profile-cancel"
                onClick={handleCancel}
                disabled={isLoading}
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        {/* Message */}
        {message && (
          <div className={`edit-profile-message ${messageType}`}>
            {message}
          </div>
        )}
      </div>
    </div>
  );
};

export default EditProfile;