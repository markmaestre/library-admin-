import React, { useState, useEffect } from "react";
import "../css/homedashboard.css";
import logo from "../assets/Logo.png";

const HomeDashboard = ({ setPage }) => {
  const [activeSection, setActiveSection] = useState("home");
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const progress = (window.scrollY / totalHeight) * 100;
      setScrollProgress(progress);

      // Update active section based on scroll position
      const sections = ["home", "about", "mission", "contact"];
      const current = sections.find(section => {
        const element = document.getElementById(section);
        if (element) {
          const rect = element.getBoundingClientRect();
          return rect.top <= 150 && rect.bottom >= 150;
        }
        return false;
      });
      if (current) setActiveSection(current);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (sectionId) => {
    setActiveSection(sectionId);
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="dashboard-container">
      {/* Scroll Progress Bar */}
      <div 
        className="scroll-progress" 
        style={{ width: `${scrollProgress}%` }}
      />

      {/* Navigation Header */}
      <nav className="nav-container">
        <div className="nav-wrapper">
          <div className="nav-content">
            <div className="nav-logo-wrapper" onClick={() => scrollToSection("home")}>
              <img 
                src={logo} 
                alt="IT Thesis Library TUPT Logo" 
                className="nav-logo"
              />
              <h1 className="nav-title">
                IT Thesis Library
              </h1>
            </div>
            <div className="nav-menu">
              <button
                onClick={() => scrollToSection("home")}
                className={`nav-button ${activeSection === "home" ? "active" : ""}`}
              >
                Home
              </button>
              <button
                onClick={() => scrollToSection("about")}
                className={`nav-button ${activeSection === "about" ? "active" : ""}`}
              >
                About Us
              </button>
              <button
                onClick={() => scrollToSection("mission")}
                className={`nav-button ${activeSection === "mission" ? "active" : ""}`}
              >
                Mission & Vision
              </button>
              <button
                onClick={() => scrollToSection("contact")}
                className={`nav-button ${activeSection === "contact" ? "active" : ""}`}
              >
                Contact
              </button>
              <button
                onClick={() => setPage("admin-login")}
                className="admin-login-btn"
              >
                Admin Login
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section id="home" className="hero-section">
        <div className="hero-content">
          <div className="hero-text-center">
            <h2 className="hero-title">
              Welcome to the
              <span className="hero-title-gradient">
                IT Thesis Library System
              </span>
            </h2>
            <p className="hero-subtitle">
              Your comprehensive digital repository for academic research and scholarly theses.
              Explore, discover, and contribute to the world of knowledge.
            </p>
            <div className="hero-buttons">
              <button
                onClick={() => scrollToSection("about")}
                className="hero-button hero-button-primary"
              >
                Learn More
              </button>
              <button
                onClick={() => scrollToSection("contact")}
                className="hero-button hero-button-secondary"
              >
                Get Started
              </button>
            </div>
          </div>

          {/* Feature Cards */}
          <div className="feature-grid">
            <div className="feature-card">
              <span className="feature-card-number">01</span>
              <h3 className="feature-card-title">
                Extensive Collection
              </h3>
              <p className="feature-card-text">
                Access a wide range of academic theses across multiple disciplines and research areas.
              </p>
            </div>

            <div className="feature-card">
              <span className="feature-card-number">02</span>
              <h3 className="feature-card-title">
                Advanced Search
              </h3>
              <p className="feature-card-text">
                Find relevant research quickly with our powerful search and filtering capabilities.
              </p>
            </div>

            <div className="feature-card">
              <span className="feature-card-number">03</span>
              <h3 className="feature-card-title">
                Secure Repository
              </h3>
              <p className="feature-card-text">
                Your research is protected with industry-standard security and backup systems.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* About Us Section */}
      <section id="about" className="section section-white">
        <div className="section-container">
          <div className="section-header">
            <h2 className="section-title">About Us</h2>
            <div className="section-divider"></div>
          </div>
          <div className="about-grid">
            <div className="about-text">
              <p className="about-text-block">
                The Thesis Library System is a comprehensive digital platform designed to 
                streamline the management, storage, and access of academic research papers 
                and theses. Our system serves as a bridge between researchers, students, 
                and academic institutions.
              </p>
              <p className="about-text-block">
                We are committed to advancing academic excellence by providing a reliable, 
                user-friendly platform that facilitates knowledge sharing and research 
                collaboration.
              </p>
            </div>
            <div className="about-info-box">
              <div className="about-info-content">
                <div className="info-item">
                  <h3 className="info-title">Our Purpose</h3>
                  <p className="info-text">
                    Empowering academic communities through efficient thesis management.
                  </p>
                </div>
                <div className="info-item">
                  <h3 className="info-title">Our Values</h3>
                  <p className="info-text">
                    Excellence, accessibility, and innovation in academic research.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Vision Section */}
      <section id="mission" className="section section-gradient">
        <div className="section-container">
          <div className="section-header">
            <h2 className="section-title">Mission & Vision</h2>
            <div className="section-divider"></div>
          </div>
          <div className="mission-vision-grid">
            <div className="mission-vision-card">
              <h3 className="mission-vision-title">Our Mission</h3>
              <p className="mission-vision-text">
                To provide a comprehensive and accessible digital library system that 
                facilitates efficient organization and preservation of academic theses.
              </p>
            </div>
            <div className="mission-vision-card">
              <h3 className="mission-vision-title">Our Vision</h3>
              <p className="mission-vision-text">
                To become the leading thesis library management system recognized 
                globally for excellence in academic resource management.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="section section-white">
        <div className="section-container">
          <div className="section-header">
            <h2 className="section-title">Contact Us</h2>
            <div className="section-divider"></div>
            <p className="section-subtitle">
              Have questions or need assistance? We're here to help.
            </p>
          </div>

          <div className="contact-grid">
            <div className="contact-info">
              <div className="contact-info-card">
                <h3 className="contact-info-title">Email</h3>
                <p className="contact-info-text">support@thesislibrary.edu</p>
              </div>
              <div className="contact-info-card">
                <h3 className="contact-info-title">Phone</h3>
                <p className="contact-info-text">+1 (555) 123-4567</p>
              </div>
            </div>

            <div className="contact-form-container">
              <h3 className="contact-form-title">Send us a Message</h3>
              <form className="contact-form">
                <div className="form-group">
                  <label className="form-label">Name</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Your name"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Email</label>
                  <input
                    type="email"
                    className="form-input"
                    placeholder="your.email@example.com"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Message</label>
                  <textarea
                    className="form-textarea"
                    placeholder="How can we help you?"
                  ></textarea>
                </div>
                <button
                  type="submit"
                  className="submit-button"
                >
                  Send Message
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer-container">
        <div className="footer-content">
          <div className="footer-logo-wrapper">
            <img 
              src={logo} 
              alt="IT Thesis Library TUPT Logo" 
              className="footer-logo"
            />
            <span className="footer-title">IT Thesis Library</span>
          </div>
          <p className="footer-text">
            &copy; 2025 Thesis Library System. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default HomeDashboard;