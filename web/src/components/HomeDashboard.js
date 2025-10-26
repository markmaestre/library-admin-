import React, { useState } from 'react';
import logo from "../components/assets/Logo.png";
import "../components/css/homedashboard.css";

const HomeDashboard = () => {
  const [activeSection, setActiveSection] = useState('home');
  const [hoveredCard, setHoveredCard] = useState(null);
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });

  const navigationItems = [
    { id: 'home', label: 'Home' },
    { id: 'explore', label: 'Explore Theses' },
    { id: 'collection', label: 'My Collection' },
    { id: 'community', label: 'Community' },
    { id: 'submissions', label: 'Submissions' },
    { id: 'about', label: 'About' },
    { id: 'contact', label: 'Contact' }
  ];

  const thesisCategories = [
    { title: 'Artificial Intelligence', count: '248 Papers', color: 'from-blue-600 to-blue-800' },
    { title: 'Cybersecurity', count: '186 Papers', color: 'from-purple-600 to-purple-800' },
    { title: 'Data Science', count: '312 Papers', color: 'from-green-600 to-green-800' },
    { title: 'Software Engineering', count: '421 Papers', color: 'from-orange-600 to-orange-800' },
    { title: 'Network Systems', count: '195 Papers', color: 'from-red-600 to-red-800' },
    { title: 'Human-Computer Interaction', count: '143 Papers', color: 'from-indigo-600 to-indigo-800' }
  ];

  const recentTheses = [
    { title: 'Deep Learning Approaches to Natural Language Processing', author: 'Smith, J.', year: '2024' },
    { title: 'Blockchain Security in Distributed Systems', author: 'Garcia, M.', year: '2024' },
    { title: 'Predictive Analytics Using Machine Learning', author: 'Chen, L.', year: '2025' }
  ];

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert('Message sent successfully!');
    setFormData({ name: '', email: '', message: '' });
  };

  const renderHome = () => (
    <>
      <div className="mb-12">
        <h1 className="text-5xl font-bold text-gray-900 mb-4">IT Thesis Library</h1>
        <p className="text-xl text-gray-600 max-w-3xl">Your comprehensive digital repository for Information Technology research papers, theses, and academic publications.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        {thesisCategories.map((category, index) => (
          <div
            key={index}
            className="relative overflow-hidden rounded-lg shadow-lg transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 cursor-pointer"
            onMouseEnter={() => setHoveredCard(index)}
            onMouseLeave={() => setHoveredCard(null)}
          >
            <div className={`bg-gradient-to-br ${category.color} p-8 h-48 flex flex-col justify-between`}>
              <div>
                <h3 className="text-2xl font-bold text-white mb-2">{category.title}</h3>
                <p className="text-white text-opacity-90">{category.count}</p>
              </div>
              <div className={`transition-all duration-300 ${hoveredCard === index ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                <button className="bg-white text-gray-900 px-6 py-2 rounded-full font-semibold hover:bg-gray-100 transition-colors">
                  Browse →
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-lg shadow-lg p-8 mb-12">
        <h2 className="text-3xl font-bold text-gray-900 mb-6">Recent Additions</h2>
        <div className="space-y-4">
          {recentTheses.map((thesis, index) => (
            <div key={index} className="border-l-4 border-blue-600 pl-6 py-4 hover:bg-gray-50 transition-colors cursor-pointer">
              <h3 className="text-lg font-semibold text-gray-900 mb-1">{thesis.title}</h3>
              <p className="text-gray-600">{thesis.author} • {thesis.year}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-8 hover:shadow-lg transition-shadow">
          <h3 className="text-6xl font-bold text-blue-600 mb-2">1,500+</h3>
          <p className="text-gray-700 text-lg">Research Papers</p>
        </div>
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-8 hover:shadow-lg transition-shadow">
          <h3 className="text-6xl font-bold text-purple-600 mb-2">850+</h3>
          <p className="text-gray-700 text-lg">Active Researchers</p>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-8 hover:shadow-lg transition-shadow">
          <h3 className="text-6xl font-bold text-green-600 mb-2">42</h3>
          <p className="text-gray-700 text-lg">Partner Universities</p>
        </div>
      </div>
    </>
  );

  const renderAbout = () => (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-5xl font-bold text-gray-900 mb-8">About IT Thesis Library</h1>
      
      <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Mission</h2>
        <p className="text-lg text-gray-700 leading-relaxed mb-6">
          The IT Thesis Library serves as a comprehensive digital repository dedicated to advancing information technology research and education. We provide students, researchers, and professionals with seamless access to high-quality academic publications, theses, and research papers.
        </p>
        <p className="text-lg text-gray-700 leading-relaxed">
          Our platform bridges the gap between academic research and practical application, fostering innovation and knowledge sharing within the global IT community.
        </p>
      </div>

      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg shadow-lg p-8 text-white mb-8">
        <h2 className="text-3xl font-bold mb-6">What We Offer</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-xl font-semibold mb-2">Extensive Database</h3>
            <p className="text-blue-100">Access thousands of peer-reviewed research papers and theses across all IT disciplines.</p>
          </div>
          <div>
            <h3 className="text-xl font-semibold mb-2">Advanced Search</h3>
            <p className="text-blue-100">Find exactly what you need with our powerful search and filtering capabilities.</p>
          </div>
          <div>
            <h3 className="text-xl font-semibold mb-2">Community Engagement</h3>
            <p className="text-blue-100">Connect with fellow researchers and participate in academic discussions.</p>
          </div>
          <div>
            <h3 className="text-xl font-semibold mb-2">Open Access</h3>
            <p className="text-blue-100">Promoting knowledge accessibility for researchers worldwide.</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Team</h2>
        <p className="text-lg text-gray-700 leading-relaxed">
          We are a dedicated team of librarians, IT professionals, and academic researchers committed to maintaining and expanding this vital resource. Our expertise spans information science, software development, and academic publishing.
        </p>
      </div>
    </div>
  );

  const renderContact = () => (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-5xl font-bold text-gray-900 mb-8">Contact Us</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Get in Touch</h2>
          <div className="space-y-4">
            <div className="border-l-4 border-blue-600 pl-4">
              <h3 className="font-semibold text-gray-900 mb-1">Email</h3>
              <p className="text-gray-600">library@itthesis.edu</p>
            </div>
            <div className="border-l-4 border-purple-600 pl-4">
              <h3 className="font-semibold text-gray-900 mb-1">Phone</h3>
              <p className="text-gray-600">+1 (555) 123-4567</p>
            </div>
            <div className="border-l-4 border-green-600 pl-4">
              <h3 className="font-semibold text-gray-900 mb-1">Location</h3>
              <p className="text-gray-600">Technology Building, Room 301<br/>University Campus</p>
            </div>
            <div className="border-l-4 border-orange-600 pl-4">
              <h3 className="font-semibold text-gray-900 mb-1">Hours</h3>
              <p className="text-gray-600">Monday - Friday: 8:00 AM - 6:00 PM<br/>Saturday: 10:00 AM - 4:00 PM</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Send a Message</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Name</label>
              <input 
                type="text" 
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all" 
                placeholder="Your name" 
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
              <input 
                type="email" 
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all" 
                placeholder="your.email@example.com" 
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Message</label>
              <textarea 
                rows="4" 
                name="message"
                value={formData.message}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all" 
                placeholder="How can we help you?"
              ></textarea>
            </div>
            <button 
              onClick={handleSubmit}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold py-3 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all transform hover:scale-105"
            >
              Send Message
            </button>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-r from-gray-800 to-gray-900 rounded-lg shadow-lg p-8 text-white">
        <h2 className="text-3xl font-bold mb-6">Frequently Asked Questions</h2>
        <div className="space-y-6">
          <div>
            <h3 className="text-xl font-semibold mb-2">How do I submit my thesis?</h3>
            <p className="text-gray-300">Navigate to the Submissions section and follow the step-by-step upload process. All submissions undergo a review before publication.</p>
          </div>
          <div>
            <h3 className="text-xl font-semibold mb-2">Is the library free to use?</h3>
            <p className="text-gray-300">Yes, all research papers and theses are freely accessible to registered users. Registration is free and takes only a few minutes.</p>
          </div>
          <div>
            <h3 className="text-xl font-semibold mb-2">Can I cite papers from this library?</h3>
            <p className="text-gray-300">Absolutely. Each paper includes proper citation information in multiple formats (APA, MLA, Chicago, etc.).</p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch(activeSection) {
      case 'about':
        return renderAbout();
      case 'contact':
        return renderContact();
      default:
        return renderHome();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Navigation */}
      <header className="bg-gradient-to-r from-gray-900 to-gray-800 text-white shadow-2xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo Section */}
            <div className="flex items-center space-x-4">
              <img 
                src={logo} 
                alt="IT Thesis Library Logo" 
                className="w-12 h-12 rounded-lg"
              />
              <div>
                <h1 className="text-2xl font-bold">IT THESIS</h1>
                <p className="text-xs text-gray-400">Research Library</p>
              </div>
            </div>
            
            {/* Navigation */}
            <nav className="hidden md:flex items-center space-x-1">
              {navigationItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveSection(item.id)}
                  className={`px-4 py-2 rounded-lg transition-all duration-300 font-medium ${
                    activeSection === item.id
                      ? 'bg-blue-600 text-white shadow-lg'
                      : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </nav>

            {/* Logout Button */}
            <button className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors font-semibold">
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-12">
        {renderContent()}
        
        <footer className="mt-16 pt-8 border-t border-gray-300 text-center text-gray-600">
          <p className="text-sm">© 2025 IT Thesis Library | Advancing Research, Empowering Knowledge</p>
        </footer>
      </main>
    </div>
  );
};

export default HomeDashboard;