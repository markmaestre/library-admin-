import React, { useState, useEffect } from "react";
import axios from "axios";
import API_URL from "../Utils/Api";

const EditProfile = ({ setPage }) => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    address: "",
    phone: "",
  });
  const [message, setMessage] = useState("");

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
      } catch (err) {
        setMessage("Failed to load profile data");
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

    try {
      const res = await axios.put(
        `${API_URL}/admins/edit-profile/${adminId}`,
        form,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // ✅ Update localStorage and UI
      localStorage.setItem("name", res.data.name);
      setMessage("Profile updated successfully!");
      setTimeout(() => setPage("admin-dashboard"), 1000);
    } catch (err) {
      setMessage(err.response?.data?.detail || "Update failed. Try again.");
    }
  };

  return (
    <div className="edit-profile">
      <h2>Edit Admin Profile</h2>
      <form onSubmit={handleSubmit}>
        <input
          name="name"
          placeholder="Name"
          value={form.name}
          onChange={handleChange}
          required
        />
        <input
          name="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          required
        />
        <input
          name="address"
          placeholder="Address"
          value={form.address}
          onChange={handleChange}
        />
        <input
          name="phone"
          placeholder="Phone"
          value={form.phone}
          onChange={handleChange}
        />
        <button type="submit">Save Changes</button>
      </form>
      <p className="message">{message}</p>
      <button onClick={() => setPage("admin-dashboard")}>Back</button>
    </div>
  );
};

export default EditProfile;
