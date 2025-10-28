import React, { useState } from "react";
import axios from "axios";
import API_URL from "../Utils/Api"; // ✅ import your API base URL
import "../css/admin.css";

const AdminLogin = ({ setPage }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setMessage("Logging in...");

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
        setTimeout(() => setPage("admin-dashboard"), 1000);
      } else {
        setMessage("Access denied: Not an admin account.");
      }
    } catch (err) {
      setMessage(err.response?.data?.detail || "Login failed. Please try again.");
    }
  };

  return (
    <div className="admin-login">
      <h2>Admin Login</h2>
      <form onSubmit={handleLogin}>
        <input
          type="email"
          placeholder="Admin Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Admin Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit">Login</button>
      </form>
      <p className="message">{message}</p>
      <button className="back-btn" onClick={() => setPage("home")}>
        Back to Home
      </button>
    </div>
  );
};

export default AdminLogin;
