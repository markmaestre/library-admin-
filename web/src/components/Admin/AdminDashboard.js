import React, { useEffect, useState } from "react";
import "../css/admin.css";
import axios from "axios";
import API_URL from "../Utils/Api";

const AdminDashboard = ({ setPage }) => {
  const [adminName, setAdminName] = useState(localStorage.getItem("name"));
  const [adminId, setAdminId] = useState(localStorage.getItem("id"));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const token = localStorage.getItem("token");

  // ✅ Fetch the latest profile details
  useEffect(() => {
    const fetchAdmin = async () => {
      try {
        const res = await axios.get(`${API_URL}/admins/profile/${adminId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setAdminName(res.data.name);
        localStorage.setItem("name", res.data.name);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setError("Failed to load admin info");
        setLoading(false);
      }
    };
    if (adminId && token) fetchAdmin();
  }, [adminId, token]);

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("name");
    localStorage.removeItem("id");
    setPage("home");
  };

  if (loading) return <p>Loading dashboard...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="admin-dashboard">
      <h1>Welcome, {adminName}</h1>
      <div className="admin-actions">
        <button onClick={() => setPage("edit-profile")}>Edit Profile</button>
        <button onClick={logout}>Logout</button>
      </div>
    </div>
  );
};

export default AdminDashboard;
