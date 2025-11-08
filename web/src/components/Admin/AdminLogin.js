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
  const [showPassword, setShowPassword] = useState(false);

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

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="admin-login-container">
      {/* Back to Home Button - Outside card for better mobile UX */}
      <button 
        className="admin-back-button" 
        onClick={() => setPage("home")}
        disabled={isLoading}
        aria-label="Back to Home"
      >
        <svg 
          className="admin-back-icon" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2"
        >
          <path d="M19 12H5M12 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        <span className="admin-back-text">Back</span>
      </button>

      <div className="admin-login-card">
        {/* Decorative Elements */}
        <div className="admin-login-decoration">
          <div className="decoration-circle decoration-circle-1"></div>
          <div className="decoration-circle decoration-circle-2"></div>
          <div className="decoration-circle decoration-circle-3"></div>
        </div>

        {/* Header */}
        <div className="admin-login-header">
          <div className="admin-login-logo-wrapper">
            <div className="logo-container">
              <img 
                src={logo} 
                alt="IT Thesis Library TUPT Logo" 
                className="admin-login-logo"
              />
              <div className="logo-glow"></div>
            </div>
            <div className="admin-login-branding">
              <h1 className="admin-login-logo-text">IT Thesis Library</h1>
              <span className="admin-login-badge">Admin Portal</span>
            </div>
          </div>

          <p className="admin-login-subtitle">
            Sign in to access your dashboard and manage the thesis library system
          </p>
        </div>

        {/* Login Form */}
        <form className="admin-login-form" onSubmit={handleLogin}>
          {/* Email Field */}
          <div className="form-group">
            <label className="form-group-label">
              <svg className="label-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M22 6l-10 7L2 6" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Email Address
            </label>
            <div className="input-wrapper">
              <input
                type="email"
                className="admin-login-input"
                placeholder="admin@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
                autoComplete="email"
              />
              <div className="input-border"></div>
            </div>
          </div>

          {/* Password Field */}
          <div className="form-group">
            <label className="form-group-label">
              <svg className="label-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M7 11V7a5 5 0 0110 0v4" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Password
            </label>
            <div className="input-wrapper">
              <div className="password-input-container">
                <input
                  type={showPassword ? "text" : "password"}
                  className="admin-login-input password-input"
                  placeholder="Enter your secure password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="password-toggle-btn"
                  onClick={togglePasswordVisibility}
                  disabled={isLoading}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" strokeLinecap="round" strokeLinejoin="round"/>
                      <line x1="1" y1="1" x2="23" y2="23" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  ) : (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" strokeLinecap="round" strokeLinejoin="round"/>
                      <circle cx="12" cy="12" r="3"/>
                    </svg>
                  )}
                </button>
              </div>
              <div className="input-border"></div>
            </div>
          </div>

          {/* Message */}
          {message && (
            <div className={`admin-login-message ${messageType}`}>
              <div className="message-icon">
                {messageType === 'success' && (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 11.08V12a10 10 0 11-5.93-9.14" strokeLinecap="round" strokeLinejoin="round"/>
                    <polyline points="22 4 12 14.01 9 11.01" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
                {messageType === 'error' && (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" strokeLinecap="round" strokeLinejoin="round"/>
                    <line x1="15" y1="9" x2="9" y2="15" strokeLinecap="round" strokeLinejoin="round"/>
                    <line x1="9" y1="9" x2="15" y2="15" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
                {messageType === 'info' && (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" strokeLinecap="round" strokeLinejoin="round"/>
                    <line x1="12" y1="16" x2="12" y2="12" strokeLinecap="round" strokeLinejoin="round"/>
                    <line x1="12" y1="8" x2="12.01" y2="8" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
              </div>
              <span className="message-text">{message}</span>
            </div>
          )}

          {/* Submit Button */}
          <button 
            type="submit" 
            className="admin-login-submit"
            disabled={isLoading}
          >
            {isLoading && (
              <span className="admin-login-loading"></span>
            )}
            <span className="button-text">
              {isLoading ? "Signing In..." : "Sign In"}
            </span>
            {!isLoading && (
              <svg className="button-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="5" y1="12" x2="19" y2="12" strokeLinecap="round" strokeLinejoin="round"/>
                <polyline points="12 5 19 12 12 19" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            )}
            <div className="button-shine"></div>
          </button>
        </form>

        {/* Footer */}
        <div className="admin-login-footer">
          <div className="footer-divider"></div>
          <p className="admin-login-footer-text">
            Need assistance?{" "}
            <a href="mailto:support@thesislibrary.edu" className="admin-login-footer-link">
              Contact Support
            </a>
          </p>
          <p className="admin-login-copyright">
            © 2025 IT Thesis Library. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;