import React, { useState } from "react";
import axios from "axios";
import API_URL from "../Utils/Api"; 
import "../css/admin.css";
import logo from "../assets/Logo.png"; 

const AdminLogin = ({ setPage }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState(""); // 'success', 'error', 'info'
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setMessage("Logging in...");
    setMessageType("info");
    setIsLoading(true);

    try {
      const res = await axios.post(`${API_URL}/admins/login`, {
        email,
        password,
      });

      if (res.data.role === "admin") {
        // ✅ store all useful data
        localStorage.setItem("token", res.data.access_token);
        localStorage.setItem("role", res.data.role);
        localStorage.setItem("name", res.data.name);
        localStorage.setItem("id", res.data.id); // for edit profile

        setMessage("Login successful! Redirecting...");
        setMessageType("success");
        setTimeout(() => setPage("admin-dashboard"), 1000);
      } else {
        setMessage("Access denied: Not an admin account.");
        setMessageType("error");
        setIsLoading(false);
      }
    } catch (err) {
      setMessage(err.response?.data?.detail || "Login failed. Please try again.");
      setMessageType("error");
      setIsLoading(false);
    }
  };

  return (
    <div className="admin-login-container">
      <div className="admin-login-card">
        {/* Header - Matching HomeDashboard style */}
        <div className="admin-login-header">
          <div className="admin-login-logo-wrapper">
            <img 
              src={logo} 
              alt="IT Thesis Library TUPT Logo" 
              className="admin-login-logo"
            />
            <span className="admin-login-logo-text">IT Thesis Library</span>
          </div>

          <p className="admin-login-subtitle">
            Sign in to access your dashboard and manage the thesis library system
          </p>
        </div>

        {/* Login Form */}
        <form className="admin-login-form" onSubmit={handleLogin}>
          {/* Email Field */}
          <div className="form-group">
            <label className="form-group-label">Email Address</label>
            <input
              type="email"
              className="admin-login-input"
              placeholder="Only admin emails allowed"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>

          {/* Password Field */}
          <div className="form-group">
            <label className="form-group-label">Password</label>
            <input
              type="password"
              className="admin-login-input"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>

          {/* Submit Button */}
          <button 
            type="submit" 
            className="admin-login-submit"
            disabled={isLoading}
          >
            {isLoading && <span className="admin-login-loading"></span>}
            {isLoading ? "Signing In..." : "Sign In"}
          </button>
        </form>

        {/* Message */}
        {message && (
          <div className={`admin-login-message ${messageType}`}>
            {message}
          </div>
        )}


        {/* Back to Home Button */}
        <button 
          className="admin-back-button" 
          onClick={() => setPage("home")}
          disabled={isLoading}
        >
          Back to Home
        </button>

        {/* Footer */}
        <div className="admin-login-footer">
          <p className="admin-login-footer-text">
            Need help? Contact{" "}
            <a href="mailto:markraniermaestre@gmail.com" className="admin-login-footer-link">
              support@thesislibrary.edu
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;