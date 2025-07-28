import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaClipboardList, FaSignOutAlt } from "react-icons/fa";
import "./UserPage.css";
import API from "../api/api";

interface FeedbackFormData {
  heading: string;
  category: string;
  subcategory: string;
  feedback: string;
  image: File | null;
}

interface SubmittedFeedback {
  heading: string;
  category: string;
  subcategory: string;
  submittedAt: string;
  message: string;
  imageUrl?: string;
}

const categories = ["Department", "Services", "Events", "Others"] as const;
const subcategoriesMap: Record<string, string[]> = {
  Department: ["Development", "Administration", "HR"],
  Services: ["IT Support Services", "Workplace Tools & Software", "Transportation"],
  Events: ["Hackathons", "Tech Talks", "Employee Recognition Events"],
  Others: ["Other"],
};

const UserPage: React.FC = () => {
  const [feedbackForm, setFeedbackForm] = useState<FeedbackFormData>({
    heading: "",
    category: "",
    subcategory: "",
    feedback: "",
    image: null,
  });

  const [feedbackError, setFeedbackError] = useState<string | null>(null);
  const [feedbackSuccess, setFeedbackSuccess] = useState<boolean>(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>("");
  const [userName, setUserName] = useState<string>("");
  const [submittedFeedbacks, setSubmittedFeedbacks] = useState<SubmittedFeedback[]>([]);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>("");

  const navigate = useNavigate();
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);


  const handleLogout = () => {
    localStorage.clear();
    navigate("/", { replace: true });
  };

  useEffect(() => {
    const name = localStorage.getItem("userName");
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login", { replace: true });
      return;
    }

    if (name) setUserName(name);

    const fetchFeedbacks = async () => {
      try {
        const res = await API.get("/feedback/my-feedbacks", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setSubmittedFeedbacks(res.data || []);
      } catch (err) {
        console.error("Failed to fetch feedbacks:", err);
      }
    };

    fetchFeedbacks();
  }, [navigate]);

  const handleFeedbackChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFeedbackForm((prev) => ({
      ...prev,
      [name]: value,
      ...(name === "category" ? { subcategory: "" } : {}),
    }));
    setFeedbackError(null);
    setFeedbackSuccess(false);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFeedbackForm((prev) => ({ ...prev, image: file }));
    }
  };

  const handleFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { heading, category, subcategory, feedback, image } = feedbackForm;

    if (!heading || !category || !subcategory || !feedback) {
      setFeedbackError("Please fill in all fields.");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      let imageUrl = "";

      if (image) {
        const formData = new FormData();
        formData.append("image", image);
        const uploadRes = await API.post("/feedback/upload-image", formData, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        });
        imageUrl = uploadRes.data.imageUrl;
      }

      const res = await API.post(
        "/feedback/submit",
        {
          heading,
          category,
          subcategory,
          message: feedback,
          image: imageUrl,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.status === 200 || res.status === 201) {
        setFeedbackSuccess(true);
        setFeedbackForm({
          heading: "",
          category: "",
          subcategory: "",
          feedback: "",
          image: null,
        });
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }

        setTimeout(() => setFeedbackSuccess(false), 5000);

        const updated = await API.get("/feedback/my-feedbacks", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setSubmittedFeedbacks(updated.data || []);
      }
    } catch (err: any) {
      setFeedbackSuccess(false);
      setFeedbackError(err?.response?.data?.message || "Submission failed.");
    }
  };

  const filteredFeedbacks = submittedFeedbacks.filter((fb) => {
    const fbCategory = (fb.category || "").toLowerCase().trim();
    const fbSubcategory = (fb.subcategory || "").toLowerCase().trim();
    const selectedCat = selectedCategory.toLowerCase().trim();
    const selectedSub = selectedSubcategory.toLowerCase().trim();

    const matchesCategory = !selectedCategory || fbCategory === selectedCat;
    const matchesSubcategory = !selectedSubcategory || fbSubcategory === selectedSub;

    const matchesDate =
      !selectedDate ||
      new Date(fb.submittedAt).toISOString().slice(0, 10) === selectedDate;

    return matchesCategory && matchesSubcategory && matchesDate;
  });




  const toggleExpand = (index: number) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };



  return (
    <div className="user-page">
      {/* Navbar */}
      <nav className="navbar">
        {/* Welcome */}
        <div className="welcome-text"> <h2>Welcome, <span>{userName}</span></h2></div>

        <button className="logout-option" onClick={handleLogout}><FaSignOutAlt /> Logout</button>

      </nav>

      {/* Filters */}
      <div className="filters-row-user">
        <div className="filter-user-group">
          <label>Category</label>
          <select
            className="filter-select"
            value={selectedCategory}
            onChange={(e) => {
              setSelectedCategory(e.target.value);
              setSelectedSubcategory("");
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

        <div className="filter-user-group">
          <label>Subcategory</label>
          <select
            className="filter-select"
            value={selectedSubcategory}
            onChange={(e) => setSelectedSubcategory(e.target.value)}
            disabled={!selectedCategory}
          >
            <option value="">All Subcategories</option>
            {selectedCategory &&
              subcategoriesMap[selectedCategory]?.map((sub) => (
                <option key={sub} value={sub}>
                  {sub}
                </option>
              ))}
          </select>
        </div>
        <div className="filter-user-group">
          <label>Date</label>
          <input
            type="date"
            className="filter-select"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
          />
        </div>


        {(selectedCategory || selectedDate) && (
          <div className="filter-user-group">
            <label style={{ visibility: "hidden" }}>Clear</label>
            <button
              className="btn-clear-filter-user"
              onClick={() => {
                setSelectedCategory("");
                setSelectedSubcategory("");
                setSelectedDate("");
              }}
            >
              Clear Filter
            </button>
          </div>
        )}
        <div className="filter-user-group">
          <div className="total-feedback-display">
            <FaClipboardList /> Total Feedbacks:
            <span>{filteredFeedbacks.length}</span>
          </div>
        </div>

      </div>

      {/* Content */}
      <div className="content">
        {/* Feedback List */}
        <div className="feedback-section scrollable-column">
          <h3 className="sticky-heading">
            {selectedCategory
              ? `${selectedCategory}${selectedSubcategory ? ` / ${selectedSubcategory}` : ""} Feedback`
              : "All Feedback"}
          </h3>

          <div className="feedback-list">
            {filteredFeedbacks.length > 0 ? (
              filteredFeedbacks.map((fb, index) => (
                <div
                  key={index}
                  className={`user-feedback-card ${expandedIndex === index ? "expanded" : ""}`}
                  onClick={() => toggleExpand(index)}
                >
                  <div className="status-dot" />
                  <div className="feedback-content">
                    <div className="feedback-title">{fb.heading}</div>
                    <div className="feedback-meta-row">
                      <span className="feedback-meta">
                        {fb.category} / {fb.subcategory}
                      </span>
                      <span className="feedback-time">
                        {new Date(fb.submittedAt).toLocaleString()}
                      </span>
                    </div>
                    {expandedIndex === index && (
                      <>
                        <div className="user-feedback-message">{fb.message}</div>
                        {fb.imageUrl && (
                          <div className="user-feedback-image-container">
                            <img
                              src={fb.imageUrl}
                              alt="Attached feedback"
                              className="user-feedback-image"
                            />
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="no-data">No feedbacks found.</div>
            )}
          </div>
        </div>

        {/* Feedback Form */}
        <div className="event-section scrollable-column">
          <h3 className="sticky-heading">Write Your Feedback</h3>
          <form onSubmit={handleFeedbackSubmit}>
            <input
              type="text"
              name="heading"
              value={feedbackForm.heading}
              onChange={handleFeedbackChange}
              placeholder="Enter heading / name for your feedback"
              className="feedback-input"
            />

            <select
              name="category"
              value={feedbackForm.category}
              onChange={handleFeedbackChange}
              className="feedback-input"
            >
              <option value="">Select Category</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>

            <select
              name="subcategory"
              value={feedbackForm.subcategory}
              onChange={handleFeedbackChange}
              className="feedback-input"
              disabled={!feedbackForm.category}
            >
              <option value="">Select Subcategory</option>
              {feedbackForm.category &&
                subcategoriesMap[feedbackForm.category]?.map((sub) => (
                  <option key={sub} value={sub}>
                    {sub}
                  </option>
                ))}
            </select>

            <textarea
              name="feedback"
              value={feedbackForm.feedback}
              onChange={handleFeedbackChange}
              placeholder="Write your feedback here..."
              className="feedback-textarea"
              rows={5}
            ></textarea>

            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="feedback-input"
              ref={fileInputRef}
            />

            <button type="submit" className="submit-feedback-btn">
              Submit Feedback
            </button>

            {feedbackError && <p className="error">{feedbackError}</p>}
            {feedbackSuccess && <p className="success">Feedback submitted successfully!</p>}
          </form>
        </div>
      </div>
    </div>
  );
};

export default UserPage;
