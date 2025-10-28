import React from "react";
import "../css/homedashboard.css";

const HomeDashboard = ({ setPage }) => {
  return (
    <div className="home-dashboard">
      <h1>Welcome to Home Dashboard</h1>
      <p>This is the general dashboard for all users.</p>
      <button onClick={() => setPage("admin-login")}>Admin Login</button>
    </div>
  );
};

export default HomeDashboard;
