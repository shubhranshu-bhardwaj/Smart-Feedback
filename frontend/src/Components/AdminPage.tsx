import { useEffect, useState } from "react";
import API from "../api/api";
import { useNavigate } from "react-router-dom";
import { FaFileDownload, FaSignOutAlt, FaUserAlt, FaChartBar, FaClipboardList, FaEnvelope, FaClock } from "react-icons/fa";
import "./AdminPage.css";

type Feedback = {
  id: number;
  heading: string;
  category: string;
  subcategory: string;
  message: string;
  submittedAt: string;
  status: string;
  fullName: string;
  email: string;
  imageUrl?: string;
  sentiment: "Positive" | "Negative" | "Neutral" | "Mixed";
};

const categories = ["Department", "Services", "Events", "Others"] as const;
const subcategoriesMap: Record<string, string[]> = {
  Department: ["Development", "Administration", "HR"],
  Services: ["IT Support Services", "Workplace Tools & Software", "Transportation"],
  Events: ["Hackathons", "Tech Talks", "Employee Recognition Events"],
  Others: ["Other"],
};


const AdminPage = () => {
  const navigate = useNavigate();
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [filteredFeedbacks, setFilteredFeedbacks] = useState<Feedback[]>([]);
  const [category, setCategory] = useState("");
  const [subcategory, setSubcategory] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedCards, setExpandedCards] = useState<Set<number>>(new Set());
  const [selectedDate, setSelectedDate] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const itemsPerPage = 6;

  useEffect(() => {
    const token = localStorage.getItem("token");
    const isAdmin = localStorage.getItem("isAdmin");

    if (!token || isAdmin !== "true") {
      navigate("/login");
      return;
    }

    const fetchFeedbacks = async () => {
      setIsLoading(true);
      try {
        const res = await API.get("/admin/all-feedbacks");
        const cleaned = res.data.map((fb: any) => ({
          ...fb,
          sentiment: ["Positive", "Negative", "Neutral", "Mixed"].includes(fb.sentiment)
            ? fb.sentiment
            : "Mixed",
        }));
        setFeedbacks(cleaned);
        setFilteredFeedbacks(cleaned);
      } catch (err) {
        console.error("Error fetching feedbacks", err);
      }
      finally {
        setIsLoading(false);
      }
    };

    fetchFeedbacks();
  }, [navigate]);

  useEffect(() => {
    let filtered = [...feedbacks];

    if (category) {
      filtered = filtered.filter((f) => f.category === category);
    }

    if (subcategory) {
      filtered = filtered.filter((f) => f.subcategory === subcategory);
    }

    if (selectedDate) {
      filtered = filtered.filter(
        (f) => new Date(f.submittedAt).toISOString().slice(0, 10) === selectedDate
      );
    }

    setFilteredFeedbacks(filtered);
    setCurrentPage(1);
  }, [category, subcategory, selectedDate, feedbacks]);


  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("isAdmin");
    navigate("/login");
  };


  // const handleDelete = async (id: number) => {
  //   if (!confirm("Are you sure you want to delete this feedback?")) return;
  //   try {
  //     await API.delete(`/admin/delete-feedback/${id}`);
  //     setFeedbacks((prev) => prev.filter((f) => f.id !== id));
  //   } catch (err) {
  //     console.error("Failed to delete feedback", err);
  //   }
  // };

  const toggleCardExpansion = (id: number) => {
    setExpandedCards((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) newSet.delete(id);
      else newSet.add(id);
      return newSet;
    });
  };

  const paginatedFeedbacks = filteredFeedbacks.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  const totalPages = Math.ceil(filteredFeedbacks.length / itemsPerPage);

  const handleExportCSV = () => {
    const csvHeader = [
      "Full Name",
      "Email",
      "Heading",
      "Category",
      "Subcategory",
      "Feedback",
      "Image Url",
      "Submitted Date and Time"
    ];

    const csvRows = filteredFeedbacks.map(fb => [
      `"${fb.fullName}"`,
      `"${fb.email}"`,
      `"${fb.heading}"`,
      `"${fb.category}"`,
      `"${fb.subcategory}"`,
      `"${fb.message.replace(/"/g, '""')}"`,
      `"${fb.imageUrl || ""}"`,
      `"${new Date(fb.submittedAt).toLocaleString()}"`
    ]);

    const csvContent = [csvHeader, ...csvRows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "feedbacks_export.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getSentimentEmoji = (sentiment: string) => {
    switch (sentiment) {
      case "Positive":
        return "😊";
      case "Negative":
        return "😠";
      case "Neutral":
        return "😐";
      case "Mixed":
        return "🤔";
      default:
        return "🤔";
    }
  };


  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case "Positive":
        return "#d4edda";
      case "Negative":
        return "#f8d7da";
      case "Neutral":
        return "#fff3cd";
      case "Mixed":
        return "#d1ecf1";
      default:
        return "#d1ecf1";
    }
  };




  return (
    <div className="admin-dashboard">
      {/* Header Section */}
      <div className="dashboard-header">
        <div className="header-left">
          <h1 className="dashboard-title">Admin <span>Dashboard</span></h1>
          <p className="dashboard-subtitle">Manage and track all feedback submissions</p>
        </div>
        <div className="header-right">
          <button className="btn btn-users" onClick={() => navigate("/admin/users")}>
            <FaUserAlt /> Manage Users
          </button>
          <button className="btn btn-analytics" onClick={() => navigate("/admin-analytics")}>
            <FaChartBar /> View Analytics
          </button>
          <button className="btn btn-logout" onClick={handleLogout}>
            <FaSignOutAlt /> Logout
          </button>
        </div>
      </div>

      {/* Filter + Total Feedback Row */}
      <div className="filters-row">
        <div className="filter-container">
          {/* Category Dropdown */}
          <div className="filter-group">
            <label>Category</label>
            <select
              className="filter-select"
              value={category}
              onChange={(e) => {
                setCategory(e.target.value);
                setSubcategory("");
              }}
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Subcategory Dropdown */}
          <div className="filter-group">
            <label>Subcategory</label>
            <select
              className="filter-select"
              value={subcategory}
              onChange={(e) => setSubcategory(e.target.value)}
              disabled={!category}
            >
              <option value="">All Subcategories</option>
              {category &&
                subcategoriesMap[category]?.map((sub) => (
                  <option key={sub} value={sub}>
                    {sub}
                  </option>
                ))}
            </select>
          </div>

          <div className="filter-group">
            <label>Date</label>
            <input
              type="date"
              className="filter-select"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
            />
          </div>


          {/* Clear Filter Button */}
          {(category || selectedDate) && (
            <div className="filter-group">
              <label style={{ visibility: "hidden" }}>Clear</label>
              <button
                className="btn-clear-filter"
                onClick={() => {
                  setCategory("");
                  setSubcategory("");
                  setSelectedDate("");
                }}
              >
                Clear Filter
              </button>
            </div>
          )}
        </div>

        {/* Feedback Count + Export */}
        <div className="feedback-export-container">
          <div className="total-feedback-box">
            <div className="feedback-label"><FaClipboardList /> Total Feedbacks</div>
            <div className="feedback-count">{filteredFeedbacks.length}</div>
          </div>

          <button className="btn-export" onClick={handleExportCSV}>
            <FaFileDownload /> Export All Feedbacks
          </button>
        </div>
      </div>



      {/* Cards Section remains unchanged */}
      <div className="feedback-cards">
        {isLoading ? (
          <div className="loading-indicator">
             <div className="spinner" />
            <p>Loading feedbacks...</p>
          </div>
        ) :
          paginatedFeedbacks.length > 0 ? (
            paginatedFeedbacks.map((fb) => (
              <div
                key={fb.id}
                className="feedback-card"
                onClick={() => toggleCardExpansion(fb.id)}
              >
                <div className="feedback-card-header">
                  <div className="sentiment-badge" style={{ backgroundColor: getSentimentColor(fb.sentiment) }}>
                    {getSentimentEmoji(fb.sentiment)} {fb.sentiment}
                  </div>
                </div>

                <h2 className="feedback-heading">{fb.heading}</h2>

                <p className="feedback-category">
                  <h3>{fb.category} / <span>{fb.subcategory}</span></h3>
                </p>
                {fb.imageUrl ? (
                  <>
                    <img src={fb.imageUrl} alt="Feedback attachment" className="feedback-image" />
                    <div className="feedback-content-scrollable">
                      <p className={`feedback-message ${expandedCards.has(fb.id) ? "expanded" : ""}`}>
                        {fb.message}
                      </p>
                    </div>
                  </>
                ) : (
                  <div className="feedback-content-full">
                    <p className={`feedback-message ${expandedCards.has(fb.id) ? "expanded" : ""}`}>
                      {fb.message}
                    </p>
                  </div>
                )}
                <div className="feedback-footer">
                  <p className="submitted-by"><FaUserAlt /> {fb.fullName}</p>
                  <p className="submitted-email"><FaEnvelope /> {fb.email}</p>
                  <p className="submitted-time"><FaClock /> {new Date(fb.submittedAt).toLocaleString()}</p>
                </div>

                {/* <div className="feedback-actions">
                <button
                  className="delete-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(fb.id);
                  }}
                >
                  <FaRegTrashAlt /> Delete
                </button>
              </div> */}
              </div>
            ))
          ) : (
            <div className="no-feedbacks">
              <p>No feedbacks found</p>
              <span>Try adjusting your filters to see more results</span>
            </div>
          )}
      </div>

      {totalPages > 1 && (
        <div className="custom-pagination">
          <button
            className="pagination-button"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(currentPage - 1)}
          >
            Previous
          </button>

          {Array.from({ length: totalPages }, (_, idx) => (
            <button
              key={idx + 1}
              className={`pagination-button ${currentPage === idx + 1 ? "active" : ""}`}
              onClick={() => setCurrentPage(idx + 1)}
            >
              {idx + 1}
            </button>
          ))}

          <button
            className="pagination-button"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(currentPage + 1)}
          >
            Next
          </button>
        </div>
      )}

    </div>
  );

};

export default AdminPage;
