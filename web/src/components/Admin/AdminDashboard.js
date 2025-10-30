import React, { useEffect, useState } from "react";
import "../css/adminDashboard.css";
import axios from "axios";
import API_URL from "../Utils/Api";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import jsPDF from 'jspdf';

const AdminDashboard = ({ setPage }) => {
  const [adminName, setAdminName] = useState(localStorage.getItem("name"));
  const adminId = localStorage.getItem("id");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const token = localStorage.getItem("token");
  const [currentView, setCurrentView] = useState("dashboard");
  const [stats, setStats] = useState({});
  const [users, setUsers] = useState([]);
  const [books, setBooks] = useState([]);
  const [borrowRequests, setBorrowRequests] = useState([]);
  const [allBorrowRecords, setAllBorrowRecords] = useState([]);
  const [notifications, setNotifications] = useState([]);

  const [userSearch, setUserSearch] = useState("");
  const [bookSearch, setBookSearch] = useState("");
  const [borrowRequestSearch, setBorrowRequestSearch] = useState("");
  const [borrowRecordSearch, setBorrowRecordSearch] = useState("");
  const [notificationSearch, setNotificationSearch] = useState("");

  const [userFilters, setUserFilters] = useState({
    role: "",
    status: ""
  });
  const [bookFilters, setBookFilters] = useState({
    category: "",
    availability: ""
  });
  const [borrowRecordFilters, setBorrowRecordFilters] = useState({
    status: "",
    dateRange: ""
  });

  const [newBook, setNewBook] = useState({
    title: "",
    author: "",
    isbn: "",
    description: "",
    total_copies: 1,
    available_copies: 1,
    category: "",
    image: null
  });
  const [editingBook, setEditingBook] = useState(null);
  const [banReason, setBanReason] = useState("");
  const [selectedUserId, setSelectedUserId] = useState("");

  const [reportType, setReportType] = useState("users");
  const [dateRange, setDateRange] = useState({
    startDate: "",
    endDate: ""
  });
  const [reportData, setReportData] = useState([]);
  const [generatingReport, setGeneratingReport] = useState(false);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  useEffect(() => {
    const fetchAdmin = async () => {
      try {
        const res = await axios.get(`${API_URL}/admins/profile/${adminId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setAdminName(res.data.name);
        localStorage.setItem("name", res.data.name);
        setLoading(false);
        fetchDashboardStats();
      } catch (err) {
        console.error(err);
        if (err.response && (err.response.status === 401 || err.response.status === 403)) {
          setError("Session expired. Please login again to access the Admin Dashboard.");
          localStorage.clear();
        } else {
          setError("Failed to load admin info. Please try again.");
        }
        setLoading(false);
      }
    };

    if (adminId && token) fetchAdmin();
    else {
      setError("You are not logged in. Please login again to access the Admin Dashboard.");
      setLoading(false);
    }
  }, [adminId, token]);

  const fetchDashboardStats = async () => {
    try {
      const [
        usersRes,
        booksRes,
        borrowRes,
        pendingRes,
        notificationsRes
      ] = await Promise.all([
        axios.get(`${API_URL}/auth/users`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API_URL}/books/all`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API_URL}/books/admin/borrow-records`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API_URL}/books/pending-requests`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API_URL}/books/notifications`, { headers: { Authorization: `Bearer ${token}` } })
      ]);

      const usersData = usersRes.data;
      const booksData = booksRes.data;
      const borrowData = borrowRes.data;
      const pendingData = pendingRes.data;
      const notificationsData = notificationsRes.data;

      const totalUsers = usersData.length;
      const bannedUsers = usersData.filter(user => user.is_banned).length;
      const totalBooks = booksData.length;
      const availableBooks = booksData.reduce((sum, book) => sum + book.available_copies, 0);
      const totalBorrows = borrowData.length;
      const pendingRequests = pendingData.length;
      const activeBorrows = borrowData.filter(record => 
        record.status === 'borrowed' || record.status === 'overdue'
      ).length;

      setStats({
        totalUsers,
        bannedUsers,
        totalBooks,
        availableBooks,
        totalBorrows,
        pendingRequests,
        activeBorrows
      });

      setUsers(usersData.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)));
      setBooks(booksData.sort((a, b) => new Date(b.created_at || b.updated_at) - new Date(a.created_at || a.updated_at)));
      setBorrowRequests(pendingData.sort((a, b) => new Date(b.request_date) - new Date(a.request_date)));
      setAllBorrowRecords(borrowData.sort((a, b) => {
        const dateA = new Date(b.updated_at || b.request_date || b.borrow_date);
        const dateB = new Date(a.updated_at || a.request_date || a.borrow_date);
        return dateA - dateB;
      }));
      setNotifications(notificationsData.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)));
    } catch (err) {
      console.error("Error fetching stats:", err);
    }
  };

  const filteredUsers = users.filter(user => {
    const searchMatch = 
      user.name?.toLowerCase().includes(userSearch.toLowerCase()) ||
      user.email?.toLowerCase().includes(userSearch.toLowerCase()) ||
      user.role?.toLowerCase().includes(userSearch.toLowerCase());
    
    const roleMatch = !userFilters.role || user.role === userFilters.role;
    const statusMatch = !userFilters.status || 
      (userFilters.status === 'banned' && user.is_banned) ||
      (userFilters.status === 'active' && !user.is_banned);
    
    return searchMatch && roleMatch && statusMatch;
  });

  const filteredBooks = books.filter(book => {
    const searchMatch =
      book.title?.toLowerCase().includes(bookSearch.toLowerCase()) ||
      book.author?.toLowerCase().includes(bookSearch.toLowerCase()) ||
      book.isbn?.toLowerCase().includes(bookSearch.toLowerCase()) ||
      book.category?.toLowerCase().includes(bookSearch.toLowerCase());
    
    const categoryMatch = !bookFilters.category || book.category === bookFilters.category;
    const availabilityMatch = !bookFilters.availability || 
      (bookFilters.availability === 'available' && book.available_copies > 0) ||
      (bookFilters.availability === 'unavailable' && book.available_copies === 0);
    
    return searchMatch && categoryMatch && availabilityMatch;
  });

  const filteredBorrowRequests = borrowRequests.filter(request =>
    request.user_name?.toLowerCase().includes(borrowRequestSearch.toLowerCase()) ||
    request.user_email?.toLowerCase().includes(borrowRequestSearch.toLowerCase()) ||
    request.book?.title?.toLowerCase().includes(borrowRequestSearch.toLowerCase()) ||
    request.book?.author?.toLowerCase().includes(borrowRequestSearch.toLowerCase())
  );

  const filteredBorrowRecords = allBorrowRecords.filter(record => {
    const searchMatch =
      record.user_name?.toLowerCase().includes(borrowRecordSearch.toLowerCase()) ||
      record.user_email?.toLowerCase().includes(borrowRecordSearch.toLowerCase()) ||
      record.book?.title?.toLowerCase().includes(borrowRecordSearch.toLowerCase()) ||
      record.status?.toLowerCase().includes(borrowRecordSearch.toLowerCase());
    
    const statusMatch = !borrowRecordFilters.status || record.status === borrowRecordFilters.status;
    
    let dateMatch = true;
    if (borrowRecordFilters.dateRange) {
      const recordDate = new Date(record.request_date || record.borrow_date || record.created_at);
      const today = new Date();
      
      switch (borrowRecordFilters.dateRange) {
        case 'today':
          dateMatch = recordDate.toDateString() === today.toDateString();
          break;
        case 'week':
          const weekAgo = new Date(today.setDate(today.getDate() - 7));
          dateMatch = recordDate >= weekAgo;
          break;
        case 'month':
          const monthAgo = new Date(today.setMonth(today.getMonth() - 1));
          dateMatch = recordDate >= monthAgo;
          break;
        default:
          dateMatch = true;
      }
    }
    
    return searchMatch && statusMatch && dateMatch;
  });

  const filteredNotifications = notifications.filter(notification =>
    notification.title?.toLowerCase().includes(notificationSearch.toLowerCase()) ||
    notification.message?.toLowerCase().includes(notificationSearch.toLowerCase()) ||
    notification.type?.toLowerCase().includes(notificationSearch.toLowerCase())
  );

  const getUniqueCategories = () => {
    return [...new Set(books.map(book => book.category).filter(Boolean))];
  };

  const getUniqueRoles = () => {
    return [...new Set(users.map(user => user.role).filter(Boolean))];
  };

  const generateReport = async () => {
    setGeneratingReport(true);
    try {
      let data = [];
      
      switch (reportType) {
        case "users":
          data = generateUsersReport();
          break;
        case "books":
          data = generateBooksReport();
          break;
        case "borrow-records":
          data = generateBorrowRecordsReport();
          break;
        case "financial":
          data = generateFinancialReport();
          break;
        case "system":
          data = generateSystemReport();
          break;
        default:
          data = [];
      }
      
      setReportData(data);
    } catch (error) {
      console.error("Error generating report:", error);
      alert("Error generating report: " + error.message);
    }
    setGeneratingReport(false);
  };

  const generateUsersReport = () => {
    let filteredUsers = users;
    
    if (dateRange.startDate && dateRange.endDate) {
      filteredUsers = users.filter(user => {
        const userDate = new Date(user.created_at);
        const start = new Date(dateRange.startDate);
        const end = new Date(dateRange.endDate);
        end.setHours(23, 59, 59, 999);
        return userDate >= start && userDate <= end;
      });
    }

    return filteredUsers.map(user => ({
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.is_banned ? 'Banned' : 'Active',
      joinedDate: new Date(user.created_at).toLocaleDateString(),
      lastLogin: user.last_login ? new Date(user.last_login).toLocaleDateString() : 'Never'
    }));
  };

  const generateBooksReport = () => {
    let filteredBooks = books;
    
    if (dateRange.startDate && dateRange.endDate) {
      filteredBooks = books.filter(book => {
        const bookDate = new Date(book.created_at || book.updated_at);
        const start = new Date(dateRange.startDate);
        const end = new Date(dateRange.endDate);
        end.setHours(23, 59, 59, 999);
        return bookDate >= start && bookDate <= end;
      });
    }

    return filteredBooks.map(book => ({
      title: book.title,
      author: book.author,
      isbn: book.isbn,
      category: book.category,
      totalCopies: book.total_copies,
      availableCopies: book.available_copies,
      borrowedCopies: book.total_copies - book.available_copies,
      lastUpdated: new Date(book.updated_at || book.created_at).toLocaleDateString()
    }));
  };

  const generateBorrowRecordsReport = () => {
    let filteredRecords = allBorrowRecords;
    
    if (dateRange.startDate && dateRange.endDate) {
      filteredRecords = allBorrowRecords.filter(record => {
        const recordDate = new Date(record.request_date || record.borrow_date || record.created_at);
        const start = new Date(dateRange.startDate);
        const end = new Date(dateRange.endDate);
        end.setHours(23, 59, 59, 999);
        return recordDate >= start && recordDate <= end;
      });
    }

    return filteredRecords.map(record => ({
      userName: record.user_name,
      userEmail: record.user_email,
      bookTitle: record.book?.title,
      bookAuthor: record.book?.author,
      status: record.status,
      requestDate: record.request_date ? new Date(record.request_date).toLocaleDateString() : '-',
      borrowDate: record.borrow_date ? new Date(record.borrow_date).toLocaleDateString() : '-',
      dueDate: record.due_date ? new Date(record.due_date).toLocaleDateString() : '-',
      returnDate: record.return_date ? new Date(record.return_date).toLocaleDateString() : '-',
      fineAmount: `$${record.fine_amount || '0.00'}`
    }));
  };

  const generateFinancialReport = () => {
    const financialData = [];
    let totalFines = 0;
    let collectedFines = 0;
    let pendingFines = 0;

    allBorrowRecords.forEach(record => {
      const fine = parseFloat(record.fine_amount) || 0;
      totalFines += fine;
      if (record.status === 'returned' && fine > 0) {
        collectedFines += fine;
      } else if (fine > 0) {
        pendingFines += fine;
      }
    });

    financialData.push(
      { metric: 'Total Fines Generated', amount: `$${totalFines.toFixed(2)}` },
      { metric: 'Collected Fines', amount: `$${collectedFines.toFixed(2)}` },
      { metric: 'Pending Fines', amount: `$${pendingFines.toFixed(2)}` },
      { metric: 'Collection Rate', amount: `${totalFines > 0 ? ((collectedFines / totalFines) * 100).toFixed(2) : '0.00'}%` }
    );

    return financialData;
  };

  const generateSystemReport = () => {
    const systemData = [
      { metric: 'Total Users', value: stats.totalUsers || 0 },
      { metric: 'Active Users', value: (stats.totalUsers - stats.bannedUsers) || 0 },
      { metric: 'Banned Users', value: stats.bannedUsers || 0 },
      { metric: 'Total Books', value: stats.totalBooks || 0 },
      { metric: 'Available Books', value: stats.availableBooks || 0 },
      { metric: 'Total Borrow Records', value: stats.totalBorrows || 0 },
      { metric: 'Active Borrows', value: stats.activeBorrows || 0 },
      { metric: 'Pending Requests', value: stats.pendingRequests || 0 },
      { metric: 'Overdue Books', value: allBorrowRecords.filter(r => r.status === 'overdue').length || 0 }
    ];

    return systemData;
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    
    // Header with border
    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(0.5);
    doc.rect(10, 10, 190, 40);
    
    // TUP Logo placeholder
    doc.setFillColor(41, 128, 185);
    doc.rect(15, 15, 30, 30, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.text('TUP', 30, 30, { align: 'center' });
    doc.text('LIB', 30, 37, { align: 'center' });
    
    // Institution details
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(16);
    doc.setFont(undefined, 'bold');
    doc.text('TECHNOLOGICAL UNIVERSITY OF THE PHILIPPINES', 55, 20);
    doc.setFontSize(12);
    doc.setFont(undefined, 'normal');
    doc.text('Office of the Library Services', 55, 28);
    doc.text('Ayala Blvd, Ermita, Manila, 1000 Metro Manila', 55, 35);
    doc.text('Tel: (02) 8521-4063 | Email: library@tup.edu.ph', 55, 42);
    
    // Report title
    doc.setFontSize(18);
    doc.setFont(undefined, 'bold');
    doc.text(`${getReportTypeTitle(reportType).toUpperCase()}`, 105, 60, { align: 'center' });
    
    // Report details
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, 70);
    doc.text(`Generated by: ${adminName}`, 20, 76);
    doc.text(`Academic Year: ${new Date().getFullYear()}-${new Date().getFullYear() + 1}`, 20, 82);
    
    if (dateRange.startDate && dateRange.endDate) {
      doc.text(`Date Range: ${dateRange.startDate} to ${dateRange.endDate}`, 120, 70);
    }
    
    doc.text(`Total Records: ${reportData.length}`, 120, 76);
    
    // Official seal
    doc.setDrawColor(200, 0, 0);
    doc.setLineWidth(0.3);
    doc.circle(180, 75, 8);
    doc.setFontSize(6);
    doc.text('OFFICIAL', 180, 73, { align: 'center' });
    doc.text('SEAL', 180, 76, { align: 'center' });
    doc.text('TUP-LIB', 180, 79, { align: 'center' });
    
    // Line under header
    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(0.2);
    doc.line(10, 85, 200, 85);
    
    // Table
    const headers = getPDFHeaders(reportType);
    const data = reportData.map(item => Object.values(item));
    
    let yPosition = 95;
    const rowHeight = 8;
    const colWidth = 180 / headers.length;
    
    // Table headers
    doc.setFillColor(41, 128, 185);
    doc.setTextColor(255);
    doc.setFont(undefined, 'bold');
    doc.setFontSize(8);
    
    headers.forEach((header, index) => {
      doc.rect(15 + (index * colWidth), yPosition, colWidth, rowHeight, 'F');
      doc.text(header, 17 + (index * colWidth), yPosition + 5);
    });
    
    yPosition += rowHeight;
    
    // Table data
    doc.setFont(undefined, 'normal');
    doc.setTextColor(0);
    
    data.forEach((row, rowIndex) => {
      if (yPosition > 270) {
        doc.addPage();
        yPosition = 20;
        doc.setFontSize(10);
        doc.text(`Continuation of ${getReportTypeTitle(reportType)} - Page ${doc.internal.getNumberOfPages()}`, 105, 15, { align: 'center' });
        yPosition = 25;
      }
      
      if (rowIndex % 2 === 0) {
        doc.setFillColor(245, 245, 245);
        doc.rect(15, yPosition, 180, rowHeight, 'F');
      }
      
      row.forEach((cell, cellIndex) => {
        const text = String(cell).substring(0, 25);
        doc.text(text, 17 + (cellIndex * colWidth), yPosition + 5);
      });
      
      yPosition += rowHeight;
    });
    
    // Analysis section
    yPosition += 10;
    if (yPosition > 250) {
      doc.addPage();
      yPosition = 20;
    }
    
    // Analysis header
    doc.setFillColor(60, 60, 60);
    doc.setTextColor(255);
    doc.setFont(undefined, 'bold');
    doc.rect(15, yPosition, 180, 10, 'F');
    doc.text('ANALYSIS AND SUMMARY REPORT', 105, yPosition + 6, { align: 'center' });
    yPosition += 15;
    
    // Analysis content
    doc.setTextColor(0);
    doc.setFont(undefined, 'normal');
    doc.setFontSize(9);
    
    const analysis = generateAnalysisReport();
    analysis.forEach((line, index) => {
      if (yPosition > 270) {
        doc.addPage();
        yPosition = 20;
      }
      doc.text(line, 20, yPosition);
      yPosition += 5;
    });
    
    // Statistics
    yPosition += 10;
    doc.setFont(undefined, 'bold');
    doc.text('KEY STATISTICS:', 20, yPosition);
    yPosition += 8;
    doc.setFont(undefined, 'normal');
    
    const stats = generateStatistics();
    stats.forEach((stat, index) => {
      if (yPosition > 270) {
        doc.addPage();
        yPosition = 20;
      }
      doc.text(stat, 25, yPosition);
      yPosition += 5;
    });
    
    // Footer with signatures
    yPosition = 280;
    doc.setLineWidth(0.1);
    doc.line(30, yPosition, 80, yPosition);
    doc.line(120, yPosition, 170, yPosition);
    
    doc.setFontSize(8);
    doc.text('Prepared by:', 55, yPosition + 5, { align: 'center' });
    doc.text('Noted by:', 145, yPosition + 5, { align: 'center' });
    
    doc.text(adminName, 55, yPosition + 10, { align: 'center' });
    doc.text('Library Director', 145, yPosition + 10, { align: 'center' });
    
    // Page numbers
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.text(`Page ${i} of ${pageCount}`, 105, 290, { align: 'center' });
      doc.text('Confidential - TUP Library Management System', 105, 295, { align: 'center' });
    }
    
    doc.save(`TUP_LIBRARY_${getReportTypeTitle(reportType).replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  const generateAnalysisReport = () => {
    const analysis = [];
    
    switch (reportType) {
      case "users":
        analysis.push(
          `• Total Users Analysis: ${reportData.length} registered users in the system.`,
          `• User Distribution: ${reportData.filter(u => u.status === 'Active').length} active users, ${reportData.filter(u => u.status === 'Banned').length} banned users.`,
          `• Role Analysis: ${reportData.filter(u => u.role === 'student').length} students, ${reportData.filter(u => u.role === 'faculty').length} faculty members.`,
          `• Growth Trend: User base shows ${reportData.length > 50 ? 'healthy' : 'moderate'} growth.`,
          `• Recommendation: ${reportData.filter(u => u.status === 'Banned').length > 5 ? 'Review banned users for potential reinstatement.' : 'User management is optimal.'}`
        );
        break;
        
      case "books":
        const totalCopies = reportData.reduce((sum, book) => sum + (book.totalCopies || 0), 0);
        const availableCopies = reportData.reduce((sum, book) => sum + (book.availableCopies || 0), 0);
        analysis.push(
          `• Collection Overview: ${reportData.length} unique titles with ${totalCopies} total copies.`,
          `• Availability Status: ${availableCopies} copies currently available (${((availableCopies/totalCopies)*100).toFixed(1)}% availability rate).`,
          `• Category Distribution: ${getUniqueCategories().length} different categories represented.`,
          `• Utilization: ${totalCopies - availableCopies} copies currently in circulation.`,
          `• Recommendation: ${availableCopies/totalCopies < 0.3 ? 'Consider acquiring additional copies of popular titles.' : 'Collection availability is adequate.'}`
        );
        break;
        
      case "borrow-records":
        const statusCount = {
          pending: reportData.filter(r => r.status === 'pending').length,
          borrowed: reportData.filter(r => r.status === 'borrowed').length,
          returned: reportData.filter(r => r.status === 'returned').length,
          overdue: reportData.filter(r => r.status === 'overdue').length
        };
        analysis.push(
          `• Activity Summary: ${reportData.length} total borrowing transactions recorded.`,
          `• Status Breakdown: ${statusCount.pending} pending, ${statusCount.borrowed} active, ${statusCount.returned} completed, ${statusCount.overdue} overdue.`,
          `• Completion Rate: ${((statusCount.returned/reportData.length)*100).toFixed(1)}% of borrows successfully returned.`,
          `• Overdue Analysis: ${statusCount.overdue} overdue items (${((statusCount.overdue/reportData.length)*100).toFixed(1)}% overdue rate).`,
          `• Recommendation: ${statusCount.overdue > 10 ? 'Implement stricter overdue policies and reminders.' : 'Borrowing compliance is satisfactory.'}`
        );
        break;
        
      case "financial":
        const totalFines = reportData.reduce((sum, item) => {
          const amount = parseFloat(item.amount?.replace(/[^\d.-]/g, '')) || 0;
          return sum + amount;
        }, 0);
        analysis.push(
          `• Financial Overview: Total fines generated: $${totalFines.toFixed(2)}`,
          `• Collection Performance: ${reportData.find(item => item.metric === 'Collection Rate')?.amount || '0%'} collection rate achieved.`,
          `• Revenue Analysis: ${reportData.find(item => item.metric === 'Collected Fines')?.amount || '$0.00'} successfully collected.`,
          `• Outstanding Amount: ${reportData.find(item => item.metric === 'Pending Fines')?.amount || '$0.00'} pending collection.`,
          `• Recommendation: ${totalFines > 100 ? 'Review fine collection procedures for improvement.' : 'Financial management is effective.'}`
        );
        break;
        
      case "system":
        analysis.push(
          `• System Health: All modules functioning normally.`,
          `• User Base: ${reportData.find(item => item.metric === 'Total Users')?.value || 0} registered users.`,
          `• Collection Size: ${reportData.find(item => item.metric === 'Total Books')?.value || 0} books in inventory.`,
          `• Activity Level: ${reportData.find(item => item.metric === 'Active Borrows')?.value || 0} active borrows.`,
          `• System Performance: Operational efficiency at optimal levels.`
        );
        break;
        
      default:
        analysis.push(
          '• Report analysis generated successfully.',
          '• All data has been verified and validated.',
          '• System performance metrics within normal parameters.',
          '• No critical issues identified in this report period.',
          '• Continue current operational procedures.'
        );
    }
    
    return analysis;
  };

  const generateStatistics = () => {
    const stats = [];
    
    switch (reportType) {
      case "users":
        stats.push(
          `✓ Total Users: ${reportData.length}`,
          `✓ Active Users: ${reportData.filter(u => u.status === 'Active').length}`,
          `✓ New This Month: ${reportData.filter(u => {
            const joinDate = new Date(u.joinedDate);
            const monthAgo = new Date();
            monthAgo.setMonth(monthAgo.getMonth() - 1);
            return joinDate > monthAgo;
          }).length}`,
          `✓ Banned Users: ${reportData.filter(u => u.status === 'Banned').length}`
        );
        break;
        
      case "books":
        const totalCopies = reportData.reduce((sum, book) => sum + (book.totalCopies || 0), 0);
        const availableCopies = reportData.reduce((sum, book) => sum + (book.availableCopies || 0), 0);
        stats.push(
          `✓ Total Titles: ${reportData.length}`,
          `✓ Total Copies: ${totalCopies}`,
          `✓ Available Now: ${availableCopies}`,
          `✓ Categories: ${getUniqueCategories().length}`
        );
        break;
        
      default:
        stats.push(
          `✓ Total Records: ${reportData.length}`,
          `✓ Report Period: ${dateRange.startDate || 'All Time'} to ${dateRange.endDate || 'Present'}`,
          `✓ Generated: ${new Date().toLocaleDateString()}`,
          `✓ Data Source: TUP Library Database`
        );
    }
    
    return stats;
  };

  const getReportTypeTitle = (type) => {
    const titles = {
      'users': 'Users Report',
      'books': 'Books Inventory Report',
      'borrow-records': 'Borrow Records Report',
      'financial': 'Financial Report',
      'system': 'System Overview Report'
    };
    return titles[type] || 'Report';
  };

  const getPDFHeaders = (type) => {
    const headers = {
      'users': ['Name', 'Email', 'Role', 'Status', 'Join Date'],
      'books': ['Title', 'Author', 'ISBN', 'Category', 'Total', 'Available'],
      'borrow-records': ['User', 'Book Title', 'Status', 'Req Date', 'Due Date', 'Fine'],
      'financial': ['Metric', 'Amount'],
      'system': ['Metric', 'Value']
    };
    return headers[type] || [];
  };

  const handleLogout = () => {
    localStorage.clear();
    alert("You have been logged out.");
    setPage("home");
  };

  const banUser = async (userId, reason) => {
    try {
      await axios.post(
        `${API_URL}/auth/users/${userId}/ban`,
        { reason },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("User banned successfully");
      fetchDashboardStats();
      setBanReason("");
      setSelectedUserId("");
    } catch (err) {
      alert("Error banning user: " + err.response?.data?.detail || err.message);
    }
  };

  const unbanUser = async (userId) => {
    try {
      await axios.post(
        `${API_URL}/auth/users/${userId}/unban`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("User unbanned successfully");
      fetchDashboardStats();
    } catch (err) {
      alert("Error unbanning user: " + err.response?.data?.detail || err.message);
    }
  };

  const addBook = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      Object.keys(newBook).forEach(key => {
        if (key === 'image' && newBook[key]) {
          formData.append('image', newBook[key]);
        } else if (key !== 'image') {
          formData.append(key, newBook[key]);
        }
      });

      await axios.post(`${API_URL}/books/`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      alert("Book added successfully");
      setNewBook({
        title: "",
        author: "",
        isbn: "",
        description: "",
        total_copies: 1,
        available_copies: 1,
        category: "",
        image: null
      });
      fetchDashboardStats();
    } catch (err) {
      alert("Error adding book: " + err.response?.data?.detail || err.message);
    }
  };

  const deleteBook = async (bookId) => {
    if (!window.confirm("Are you sure you want to delete this book?")) return;
    
    try {
      await axios.delete(`${API_URL}/books/${bookId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert("Book deleted successfully");
      fetchDashboardStats();
    } catch (err) {
      alert("Error deleting book: " + err.response?.data?.detail || err.message);
    }
  };

  const updateBook = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      Object.keys(editingBook).forEach(key => {
        if (key === 'image' && editingBook[key]) {
          formData.append('image', editingBook[key]);
        } else if (key !== 'image' && key !== '_id' && editingBook[key] !== null) {
          formData.append(key, editingBook[key]);
        }
      });

      await axios.put(`${API_URL}/books/${editingBook._id}`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      alert("Book updated successfully");
      setEditingBook(null);
      fetchDashboardStats();
    } catch (err) {
      alert("Error updating book: " + err.response?.data?.detail || err.message);
    }
  };

  const approveBorrow = async (borrowId) => {
    try {
      await axios.put(
        `${API_URL}/books/approve-borrow/${borrowId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("Borrow request approved");
      fetchDashboardStats();
    } catch (err) {
      alert("Error approving request: " + err.response?.data?.detail || err.message);
    }
  };

  const rejectBorrow = async (borrowId) => {
    try {
      await axios.put(
        `${API_URL}/books/reject-borrow/${borrowId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("Borrow request rejected");
      fetchDashboardStats();
    } catch (err) {
      alert("Error rejecting request: " + err.response?.data?.detail || err.message);
    }
  };

  const getBookCategoryData = () => {
    const categoryCount = {};
    books.forEach(book => {
      categoryCount[book.category] = (categoryCount[book.category] || 0) + 1;
    });
    return Object.entries(categoryCount).map(([name, value]) => ({ name, value }));
  };

  const getBorrowStatusData = () => {
    const statusCount = {
      'pending': 0,
      'borrowed': 0,
      'returned': 0,
      'overdue': 0,
      'rejected': 0
    };
    allBorrowRecords.forEach(record => {
      statusCount[record.status] = (statusCount[record.status] || 0) + 1;
    });
    return Object.entries(statusCount).map(([name, value]) => ({ name, value }));
  };

  const getMonthlyBorrowData = () => {
    const monthlyData = {};
    allBorrowRecords.forEach(record => {
      const date = new Date(record.request_date || record.borrow_date);
      const monthYear = `${date.getMonth() + 1}/${date.getFullYear()}`;
      monthlyData[monthYear] = (monthlyData[monthYear] || 0) + 1;
    });
    return Object.entries(monthlyData)
      .map(([month, count]) => ({ month, count }))
      .sort((a, b) => {
        const [aMonth, aYear] = a.month.split('/').map(Number);
        const [bMonth, bYear] = b.month.split('/').map(Number);
        return aYear - bYear || aMonth - bMonth;
      });
  };

  const getMostBorrowedBooks = () => {
    const bookBorrowCount = {};
    
    allBorrowRecords.forEach(record => {
      if (record.book) {
        const bookId = record.book._id;
        if (!bookBorrowCount[bookId]) {
          bookBorrowCount[bookId] = {
            title: record.book.title,
            author: record.book.author,
            count: 0
          };
        }
        bookBorrowCount[bookId].count++;
      }
    });

    return Object.values(bookBorrowCount)
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  };

  if (loading) return <div className="loading">Loading dashboard...</div>;

  if (error) {
    return (
      <div className="error-message">
        <h2>{error}</h2>
        <button onClick={() => setPage("home")} className="login-again-btn">
          Go to Login
        </button>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <div className="admin-sidebar">
        <div className="sidebar-header">
          <h2>Admin Control Panel</h2>
          <div className="admin-info">
            <div className="admin-avatar">{adminName?.charAt(0).toUpperCase()}</div>
            <div className="admin-details">
              <p className="admin-name">{adminName}</p>
              <span className="admin-role">Administrator</span>
            </div>
          </div>
        </div>
        <nav className="sidebar-nav">
          <button 
            className={`nav-item ${currentView === "dashboard" ? "active" : ""}`}
            onClick={() => setCurrentView("dashboard")}
          >
            <span className="nav-label">Dashboard</span>
          </button>
          <button 
            className={`nav-item ${currentView === "users" ? "active" : ""}`}
            onClick={() => setCurrentView("users")}
          >
            <span className="nav-label">User Management</span>
          </button>
          <button 
            className={`nav-item ${currentView === "books" ? "active" : ""}`}
            onClick={() => setCurrentView("books")}
          >
            <span className="nav-label">Book Management</span>
          </button>
          <button 
            className={`nav-item ${currentView === "borrow-requests" ? "active" : ""}`}
            onClick={() => setCurrentView("borrow-requests")}
          >
            <span className="nav-label">Borrow Requests</span>
            {stats.pendingRequests > 0 && (
              <span className="badge">{stats.pendingRequests}</span>
            )}
          </button>
          <button 
            className={`nav-item ${currentView === "all-borrows" ? "active" : ""}`}
            onClick={() => setCurrentView("all-borrows")}
          >
            <span className="nav-label">All Borrow Records</span>
          </button>
          <button 
            className={`nav-item ${currentView === "notifications" ? "active" : ""}`}
            onClick={() => setCurrentView("notifications")}
          >
            <span className="nav-label">Notifications</span>
            {notifications.filter(n => !n.is_read).length > 0 && (
              <span className="badge">{notifications.filter(n => !n.is_read).length}</span>
            )}
          </button>
          <button 
            className={`nav-item ${currentView === "reports" ? "active" : ""}`}
            onClick={() => setCurrentView("reports")}
          >
            <span className="nav-label">Reports & Analytics</span>
          </button>
          <button onClick={handleLogout} className="nav-item logout-btn">
            <span className="nav-label">Logout</span>
          </button>
        </nav>
      </div>

      <div className="admin-main-content">
        {currentView === "dashboard" && (
          <div className="dashboard-view">
            <div className="page-header">
              <h1>Dashboard Overview</h1>
              <p className="page-subtitle">Monitor your library system performance</p>
            </div>
            
            <div className="stats-grid">
              <div className="stat-card stat-primary">
                <div className="stat-content">
                  <div className="stat-label">Total Users</div>
                  <div className="stat-number">{stats.totalUsers}</div>
                  <div className="stat-footer">
                    <span className="stat-detail">Banned: {stats.bannedUsers}</span>
                  </div>
                </div>
                <div className="stat-visual">
                  <div className="progress-ring">
                    <div className="progress-value">{stats.totalUsers - stats.bannedUsers}</div>
                    <div className="progress-label">Active</div>
                  </div>
                </div>
              </div>

              <div className="stat-card stat-success">
                <div className="stat-content">
                  <div className="stat-label">Total Books</div>
                  <div className="stat-number">{stats.totalBooks}</div>
                  <div className="stat-footer">
                    <span className="stat-detail">Available: {stats.availableBooks}</span>
                  </div>
                </div>
                <div className="stat-visual">
                  <div className="progress-ring">
                    <div className="progress-value">{stats.availableBooks}</div>
                    <div className="progress-label">Ready</div>
                  </div>
                </div>
              </div>

              <div className="stat-card stat-info">
                <div className="stat-content">
                  <div className="stat-label">Borrow Records</div>
                  <div className="stat-number">{stats.totalBorrows}</div>
                  <div className="stat-footer">
                    <span className="stat-detail">Active: {stats.activeBorrows}</span>
                  </div>
                </div>
                <div className="stat-visual">
                  <div className="progress-ring">
                    <div className="progress-value">{stats.activeBorrows}</div>
                    <div className="progress-label">Current</div>
                  </div>
                </div>
              </div>

              <div className="stat-card stat-warning">
                <div className="stat-content">
                  <div className="stat-label">Pending Requests</div>
                  <div className="stat-number">{stats.pendingRequests}</div>
                  <div className="stat-footer">
                    <span className="stat-detail">Needs Approval</span>
                  </div>
                </div>
                <div className="stat-visual">
                  <div className="progress-ring">
                    <div className="progress-value">{stats.pendingRequests}</div>
                    <div className="progress-label">Waiting</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="charts-section">
              <div className="chart-row">
                <div className="chart-card">
                  <div className="chart-header">
                    <h3>Books by Category</h3>
                    <p>Distribution of books across categories</p>
                  </div>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={getBookCategoryData()}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {getBookCategoryData().map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div className="chart-card">
                  <div className="chart-header">
                    <h3>Borrow Status Distribution</h3>
                    <p>Current status of all borrow records</p>
                  </div>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={getBorrowStatusData()}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="value" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="chart-card full-width">
                <div className="chart-header">
                  <h3>Most Borrowed Books</h3>
                  <p>Top 10 popular books in your library</p>
                </div>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart 
                    data={getMostBorrowedBooks()} 
                    layout="vertical"
                    margin={{ top: 20, right: 30, left: 100, bottom: 20 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis 
                      type="category" 
                      dataKey="title"
                      width={80}
                      tick={{ fontSize: 12 }}
                    />
                    <Tooltip 
                      formatter={(value) => [`${value} borrows`, 'Count']}
                      labelFormatter={(label, payload) => {
                        if (payload && payload[0]) {
                          return `${payload[0].payload.title} by ${payload[0].payload.author}`;
                        }
                        return label;
                      }}
                    />
                    <Legend />
                    <Bar dataKey="count" fill="#00C49F" name="Borrow Count">
                      {getMostBorrowedBooks().map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="chart-card full-width">
                <div className="chart-header">
                  <h3>Borrows Over Time</h3>
                  <p>Monthly borrowing trends</p>
                </div>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={getMonthlyBorrowData()}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="count" stroke="#8884d8" activeDot={{ r: 8 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {currentView === "users" && (
          <div className="users-view">
            <div className="page-header">
              <h1>User Management</h1>
              <p className="page-subtitle">Manage all registered users</p>
            </div>
            
            <div className="search-section">
              <div className="search-controls">
                <input
                  type="text"
                  placeholder="Search users by name, email, or role..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  className="search-input"
                />
                <div className="filter-controls">
                  <select 
                    value={userFilters.role} 
                    onChange={(e) => setUserFilters({...userFilters, role: e.target.value})}
                    className="filter-select"
                  >
                    <option value="">All Roles</option>
                    {getUniqueRoles().map(role => (
                      <option key={role} value={role}>{role}</option>
                    ))}
                  </select>
                  <select 
                    value={userFilters.status} 
                    onChange={(e) => setUserFilters({...userFilters, status: e.target.value})}
                    className="filter-select"
                  >
                    <option value="">All Status</option>
                    <option value="active">Active</option>
                    <option value="banned">Banned</option>
                  </select>
                </div>
              </div>
              <span className="search-results">
                Showing {filteredUsers.length} of {users.length} users
              </span>
            </div>

            <div className="data-table">
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Joined Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map(user => (
                    <tr key={user.id}>
                      <td>
                        <div className="user-cell">
                          <div className="user-avatar">{user.name?.charAt(0).toUpperCase()}</div>
                          <span>{user.name}</span>
                        </div>
                      </td>
                      <td>{user.email}</td>
                      <td>
                        <span className={`role-badge role-${user.role}`}>
                          {user.role}
                        </span>
                      </td>
                      <td>
                        <span className={`status-badge status-${user.is_banned ? 'banned' : 'active'}`}>
                          {user.is_banned ? 'Banned' : 'Active'}
                        </span>
                      </td>
                      <td>{new Date(user.created_at).toLocaleDateString()}</td>
                      <td className="actions-cell">
                        {user.role !== 'admin' && (
                          user.is_banned ? (
                            <button 
                              className="btn btn-success"
                              onClick={() => unbanUser(user.id)}
                            >
                              Unban
                            </button>
                          ) : (
                            <button 
                              className="btn btn-danger"
                              onClick={() => {
                                setSelectedUserId(user.id);
                                setBanReason("");
                              }}
                            >
                              Ban User
                            </button>
                          )
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredUsers.length === 0 && (
                <div className="no-data">No users found</div>
              )}
            </div>

            {selectedUserId && (
              <div className="modal-overlay" onClick={() => {
                setSelectedUserId("");
                setBanReason("");
              }}>
                <div className="modal" onClick={(e) => e.stopPropagation()}>
                  <div className="modal-header">
                    <h3>Ban User</h3>
                  </div>
                  <div className="modal-body">
                    <p>Please provide a reason for banning this user:</p>
                    <textarea
                      value={banReason}
                      onChange={(e) => setBanReason(e.target.value)}
                      placeholder="Enter reason for ban..."
                      rows="4"
                    />
                  </div>
                  <div className="modal-footer">
                    <button 
                      onClick={() => banUser(selectedUserId, banReason)}
                      disabled={!banReason.trim()}
                      className="btn btn-danger"
                    >
                      Confirm Ban
                    </button>
                    <button 
                      onClick={() => {
                        setSelectedUserId("");
                        setBanReason("");
                      }}
                      className="btn btn-secondary"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {currentView === "books" && (
          <div className="books-view">
            <div className="page-header">
              <h1>Book Management</h1>
              <p className="page-subtitle">Add, edit, and manage library books</p>
            </div>
            
            <div className="search-section">
              <div className="search-controls">
                <input
                  type="text"
                  placeholder="Search books by title, author, ISBN, or category..."
                  value={bookSearch}
                  onChange={(e) => setBookSearch(e.target.value)}
                  className="search-input"
                />
                <div className="filter-controls">
                  <select 
                    value={bookFilters.category} 
                    onChange={(e) => setBookFilters({...bookFilters, category: e.target.value})}
                    className="filter-select"
                  >
                    <option value="">All Categories</option>
                    {getUniqueCategories().map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                  <select 
                    value={bookFilters.availability} 
                    onChange={(e) => setBookFilters({...bookFilters, availability: e.target.value})}
                    className="filter-select"
                  >
                    <option value="">All Availability</option>
                    <option value="available">Available</option>
                    <option value="unavailable">Unavailable</option>
                  </select>
                </div>
              </div>
              <span className="search-results">
                Showing {filteredBooks.length} of {books.length} books
              </span>
            </div>
            
            <div className="form-card">
              <h3>{editingBook ? 'Edit Book' : 'Add New Book'}</h3>
              <form onSubmit={editingBook ? updateBook : addBook} className="book-form">
                <div className="form-grid">
                  <div className="form-group">
                    <label>Title</label>
                    <input
                      type="text"
                      placeholder="Enter book title"
                      value={editingBook ? editingBook.title : newBook.title}
                      onChange={(e) => editingBook 
                        ? setEditingBook({...editingBook, title: e.target.value})
                        : setNewBook({...newBook, title: e.target.value})
                      }
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Author</label>
                    <input
                      type="text"
                      placeholder="Enter author name"
                      value={editingBook ? editingBook.author : newBook.author}
                      onChange={(e) => editingBook
                        ? setEditingBook({...editingBook, author: e.target.value})
                        : setNewBook({...newBook, author: e.target.value})
                      }
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>ISBN</label>
                    <input
                      type="text"
                      placeholder="Enter ISBN"
                      value={editingBook ? editingBook.isbn : newBook.isbn}
                      onChange={(e) => editingBook
                        ? setEditingBook({...editingBook, isbn: e.target.value})
                        : setNewBook({...newBook, isbn: e.target.value})
                      }
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Category</label>
                    <input
                      type="text"
                      placeholder="Enter category"
                      value={editingBook ? editingBook.category : newBook.category}
                      onChange={(e) => editingBook
                        ? setEditingBook({...editingBook, category: e.target.value})
                        : setNewBook({...newBook, category: e.target.value})
                      }
                      required
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label>Description</label>
                  <textarea
                    placeholder="Enter book description"
                    value={editingBook ? editingBook.description : newBook.description}
                    onChange={(e) => editingBook
                      ? setEditingBook({...editingBook, description: e.target.value})
                      : setNewBook({...newBook, description: e.target.value})
                    }
                    rows="4"
                    required
                  />
                </div>
                <div className="form-grid">
                  <div className="form-group">
                    <label>Total Copies</label>
                    <input
                      type="number"
                      placeholder="Total copies"
                      value={editingBook ? editingBook.total_copies : newBook.total_copies}
                      onChange={(e) => editingBook
                        ? setEditingBook({...editingBook, total_copies: parseInt(e.target.value)})
                        : setNewBook({...newBook, total_copies: parseInt(e.target.value)})
                      }
                      min="1"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Available Copies</label>
                    <input
                      type="number"
                      placeholder="Available copies"
                      value={editingBook ? editingBook.available_copies : newBook.available_copies}
                      onChange={(e) => editingBook
                        ? setEditingBook({...editingBook, available_copies: parseInt(e.target.value)})
                        : setNewBook({...newBook, available_copies: parseInt(e.target.value)})
                      }
                      min="0"
                      required
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label>Book Cover Image</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => editingBook
                      ? setEditingBook({...editingBook, image: e.target.files[0]})
                      : setNewBook({...newBook, image: e.target.files[0]})
                    }
                  />
                </div>
                <div className="form-actions">
                  <button type="submit" className="btn btn-primary">
                    {editingBook ? 'Update Book' : 'Add Book'}
                  </button>
                  {editingBook && (
                    <button 
                      type="button" 
                      className="btn btn-secondary"
                      onClick={() => setEditingBook(null)}
                    >
                      Cancel Edit
                    </button>
                  )}
                </div>
              </form>
            </div>

            <div className="books-section">
              <h3>All Books ({filteredBooks.length})</h3>
              <div className="books-grid">
                {filteredBooks.map(book => (
                  <div key={book._id} className="book-item">
                    <div className="book-image-container">
                      {book.image_url ? (
                        <img src={book.image_url} alt={book.title} className="book-cover" />
                      ) : (
                        <div className="book-placeholder">
                          <span>No Image</span>
                        </div>
                      )}
                    </div>
                    <div className="book-details">
                      <h4 className="book-title">{book.title}</h4>
                      <p className="book-author">by {book.author}</p>
                      <div className="book-meta">
                        <span className="meta-item">ISBN: {book.isbn}</span>
                        <span className="meta-item">Category: {book.category}</span>
                        <span className="meta-item">
                          Copies: {book.available_copies}/{book.total_copies}
                        </span>
                      </div>
                      <p className="book-updated">
                        Updated: {new Date(book.updated_at || book.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="book-item-actions">
                      <button 
                        className="btn btn-primary btn-sm"
                        onClick={() => setEditingBook(book)}
                      >
                        Edit
                      </button>
                      <button 
                        className="btn btn-danger btn-sm"
                        onClick={() => deleteBook(book._id)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              {filteredBooks.length === 0 && (
                <div className="no-data">No books found</div>
              )}
            </div>
          </div>
        )}

        {currentView === "borrow-requests" && (
          <div className="borrow-requests-view">
            <div className="page-header">
              <h1>Pending Borrow Requests</h1>
              <p className="page-subtitle">{filteredBorrowRequests.length} requests waiting for approval</p>
            </div>
            
            <div className="search-section">
              <input
                type="text"
                placeholder="Search requests by user name, email, book title, or author..."
                value={borrowRequestSearch}
                onChange={(e) => setBorrowRequestSearch(e.target.value)}
                className="search-input"
              />
              <span className="search-results">
                Showing {filteredBorrowRequests.length} of {borrowRequests.length} requests
              </span>
            </div>

            <div className="data-table">
              <table>
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Book Title</th>
                    <th>Author</th>
                    <th>Request Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBorrowRequests.map(request => (
                    <tr key={request._id}>
                      <td>
                        <div className="user-info">
                          <strong>{request.user_name}</strong>
                          <small>{request.user_email}</small>
                        </div>
                      </td>
                      <td>{request.book?.title}</td>
                      <td>{request.book?.author}</td>
                      <td>{new Date(request.request_date).toLocaleDateString()}</td>
                      <td className="actions-cell">
                        <button 
                          className="btn btn-success btn-sm"
                          onClick={() => approveBorrow(request._id)}
                        >
                          Approve
                        </button>
                        <button 
                          className="btn btn-danger btn-sm"
                          onClick={() => rejectBorrow(request._id)}
                        >
                          Reject
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredBorrowRequests.length === 0 && (
                <div className="no-data">No pending borrow requests found</div>
              )}
            </div>
          </div>
        )}

        {currentView === "all-borrows" && (
          <div className="all-borrows-view">
            <div className="page-header">
              <h1>All Borrow Records</h1>
              <p className="page-subtitle">Complete history of all borrowing activities</p>
            </div>
            
            <div className="search-section">
              <div className="search-controls">
                <input
                  type="text"
                  placeholder="Search records by user name, email, book title, or status..."
                  value={borrowRecordSearch}
                  onChange={(e) => setBorrowRecordSearch(e.target.value)}
                  className="search-input"
                />
                <div className="filter-controls">
                  <select 
                    value={borrowRecordFilters.status} 
                    onChange={(e) => setBorrowRecordFilters({...borrowRecordFilters, status: e.target.value})}
                    className="filter-select"
                  >
                    <option value="">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="borrowed">Borrowed</option>
                    <option value="returned">Returned</option>
                    <option value="overdue">Overdue</option>
                    <option value="rejected">Rejected</option>
                  </select>
                  <select 
                    value={borrowRecordFilters.dateRange} 
                    onChange={(e) => setBorrowRecordFilters({...borrowRecordFilters, dateRange: e.target.value})}
                    className="filter-select"
                  >
                    <option value="">All Time</option>
                    <option value="today">Today</option>
                    <option value="week">Last 7 Days</option>
                    <option value="month">Last 30 Days</option>
                  </select>
                </div>
              </div>
              <span className="search-results">
                Showing {filteredBorrowRecords.length} of {allBorrowRecords.length} records
              </span>
            </div>

            <div className="data-table">
              <table>
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Book</th>
                    <th>Status</th>
                    <th>Request Date</th>
                    <th>Borrow Date</th>
                    <th>Due Date</th>
                    <th>Return Date</th>
                    <th>Fine</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBorrowRecords.map(record => (
                    <tr key={record._id}>
                      <td>
                        <div className="user-info">
                          <strong>{record.user_name}</strong>
                          <small>{record.user_email}</small>
                        </div>
                      </td>
                      <td>{record.book?.title}</td>
                      <td>
                        <span className={`status-badge status-${record.status}`}>
                          {record.status}
                        </span>
                      </td>
                      <td>{record.request_date ? new Date(record.request_date).toLocaleDateString() : '-'}</td>
                      <td>{record.borrow_date ? new Date(record.borrow_date).toLocaleDateString() : '-'}</td>
                      <td>{record.due_date ? new Date(record.due_date).toLocaleDateString() : '-'}</td>
                      <td>{record.return_date ? new Date(record.return_date).toLocaleDateString() : '-'}</td>
                      <td className="fine-amount">${record.fine_amount || '0.00'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredBorrowRecords.length === 0 && (
                <div className="no-data">No borrow records found</div>
              )}
            </div>
          </div>
        )}

        {currentView === "notifications" && (
          <div className="notifications-view">
            <div className="page-header">
              <h1>System Notifications</h1>
              <p className="page-subtitle">{filteredNotifications.length} total notifications</p>
            </div>
            
            <div className="search-section">
              <input
                type="text"
                placeholder="Search notifications by title, message, or type..."
                value={notificationSearch}
                onChange={(e) => setNotificationSearch(e.target.value)}
                className="search-input"
              />
              <span className="search-results">
                Showing {filteredNotifications.length} of {notifications.length} notifications
              </span>
            </div>

            <div className="notifications-list">
              {filteredNotifications.map(notification => (
                <div key={notification._id} className={`notification-card ${notification.is_read ? 'read' : 'unread'}`}>
                  <div className="notification-header">
                    <h4>{notification.title}</h4>
                    <span className="notification-date">
                      {new Date(notification.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="notification-message">{notification.message}</p>
                  <div className="notification-footer">
                    <span className={`notification-type type-${notification.type}`}>{notification.type}</span>
                    {!notification.is_read && (
                      <span className="unread-indicator">New</span>
                    )}
                  </div>
                </div>
              ))}
              {filteredNotifications.length === 0 && (
                <div className="no-data">No notifications found</div>
              )}
            </div>
          </div>
        )}

        {currentView === "reports" && (
          <div className="reports-view">
            <div className="page-header">
              <h1>Reports & Analytics</h1>
              <p className="page-subtitle">Generate professional reports with institutional branding</p>
            </div>

            <div className="reports-controls">
              <div className="report-form">
                <div className="form-group">
                  <label>Report Type</label>
                  <select 
                    value={reportType} 
                    onChange={(e) => setReportType(e.target.value)}
                    className="form-select"
                  >
                    <option value="users">Users Report</option>
                    <option value="books">Books Inventory Report</option>
                    <option value="borrow-records">Borrow Records Report</option>
                    <option value="financial">Financial Report</option>
                    <option value="system">System Overview Report</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Date Range (Optional)</label>
                  <div className="date-range">
                    <input
                      type="date"
                      value={dateRange.startDate}
                      onChange={(e) => setDateRange({...dateRange, startDate: e.target.value})}
                      className="form-input"
                    />
                    <span className="date-separator">to</span>
                    <input
                      type="date"
                      value={dateRange.endDate}
                      onChange={(e) => setDateRange({...dateRange, endDate: e.target.value})}
                      className="form-input"
                    />
                  </div>
                </div>

                <div className="form-actions">
                  <button 
                    onClick={generateReport}
                    disabled={generatingReport}
                    className="btn btn-primary"
                  >
                    {generatingReport ? 'Generating...' : 'Generate Report'}
                  </button>
                  
                  {reportData.length > 0 && (
                    <button 
                      onClick={exportToPDF}
                      className="btn btn-success"
                    >
                      Export to PDF
                    </button>
                  )}
                </div>
              </div>
            </div>

            {reportData.length > 0 && (
              <div className="report-results">
                <div className="report-header">
                  <h3>{getReportTypeTitle(reportType)}</h3>
                  <div className="report-meta">
                    <span>Generated: {new Date().toLocaleString()}</span>
                    <span>Records: {reportData.length}</span>
                  </div>
                </div>

                <div className="report-preview">
                  <div className="data-table">
                    <table>
                      <thead>
                        <tr>
                          {getPDFHeaders(reportType).map(header => (
                            <th key={header}>{header}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {reportData.slice(0, 10).map((row, index) => (
                          <tr key={index}>
                            {Object.values(row).map((value, cellIndex) => (
                              <td key={cellIndex}>{value}</td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {reportData.length > 10 && (
                      <div className="table-footer">
                        <p>Showing first 10 of {reportData.length} records. Export to PDF to see all records.</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="report-summary">
                  <h4>Summary</h4>
                  <div className="summary-stats">
                    <div className="summary-stat">
                      <span className="stat-label">Total Records</span>
                      <span className="stat-value">{reportData.length}</span>
                    </div>
                    {reportType === 'financial' && (
                      <div className="summary-stat">
                        <span className="stat-label">Total Value</span>
                        <span className="stat-value">
                          ${reportData.reduce((sum, item) => {
                            const amount = parseFloat(item.amount?.replace(/[^\d.-]/g, '')) || 0;
                            return sum + amount;
                          }, 0).toFixed(2)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {reportData.length === 0 && !generatingReport && (
              <div className="no-report">
                <div className="no-report-content">
                  <h3>No Report Generated</h3>
                  <p>Select a report type and click "Generate Report" to create your first report.</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;