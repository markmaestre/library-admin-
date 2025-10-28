import React, { useState, useEffect } from "react";
import HomeDashboard from "./components/Admin/HomeDashboard";
import AdminLogin from "./components/Admin/AdminLogin";
import AdminDashboard from "./components/Admin/AdminDashboard";
import EditProfile from "./components/Admin/EditProfile";
import "./App.css";

function App() {
  const [page, setPage] = useState("home"); 

  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");
    if (token && role === "admin") setPage("admin-dashboard");
  }, []);

  return (
    <div className="App">
      {page === "home" && <HomeDashboard setPage={setPage} />}
      {page === "admin-login" && <AdminLogin setPage={setPage} />}
      {page === "admin-dashboard" && <AdminDashboard setPage={setPage} />}
      {page === "edit-profile" && <EditProfile setPage={setPage} />}
    </div>
  );
}

export default App;
