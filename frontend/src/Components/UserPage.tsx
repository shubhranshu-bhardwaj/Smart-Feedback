import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './UserPage.css';
import Profile from './Images/dummy.png';
import API from '../api/api';

interface FeedbackFormData {
  heading: string;
  category: string;
  subcategory: string;
  feedback: string;
}

interface SubmittedFeedback {
  heading: string;
  category: string;
  subcategory: string;
  submittedAt: string;
  message: string;
}

const categories = ['Department', 'Services', 'Events', 'Others'] as const;
const subcategoriesMap: Record<string, string[]> = {
  Department: ['Development', 'Administration', 'HR'],
  Services: ['IT Support Services', 'Workplace Tools & Software', 'Transportation'],
  Events: ['Hackathons', 'Tech Talks', 'Employee Recognition Events'],
  Others: ['Other'],
};

const UserPage: React.FC = () => {
  const [feedbackForm, setFeedbackForm] = useState<FeedbackFormData>({
    heading: '',
    category: '',
    subcategory: '',
    feedback: '',
  });

  const [feedbackError, setFeedbackError] = useState<string | null>(null);
  const [feedbackSuccess, setFeedbackSuccess] = useState<boolean>(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('Submitted');
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>('');
  const [openCategoryDropdown, setOpenCategoryDropdown] = useState<string | null>(null);
  const [showProfileDropdown, setShowProfileDropdown] = useState<boolean>(false);
  const [userName, setUserName] = useState<string>('');
  const [submittedFeedbacks, setSubmittedFeedbacks] = useState<SubmittedFeedback[]>([]);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const profileRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.clear();
    navigate('/', { replace: true });
  };

  useEffect(() => {
    const name = localStorage.getItem('userName');
    const token = localStorage.getItem('token');

    if (!token) {
      navigate('/login', { replace: true });
      return;
    }

    if (name) setUserName(name);

    const fetchFeedbacks = async () => {
      try {
        const res = await API.get('/feedback/my-feedbacks', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setSubmittedFeedbacks(res.data || []);
      } catch (err) {
        console.error('Failed to fetch feedbacks:', err);
      }
    };

    fetchFeedbacks();

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;

      if (profileRef.current && !profileRef.current.contains(target)) {
        setShowProfileDropdown(false);
      }

      if (dropdownRef.current && !dropdownRef.current.contains(target)) {
        setOpenCategoryDropdown(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [navigate]);

  const handleFeedbackChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFeedbackForm((prev) => ({ ...prev, [name]: value }));

    if (name === 'category') {
      setFeedbackForm((prev) => ({ ...prev, subcategory: '' }));
    }

    setFeedbackError(null);
    setFeedbackSuccess(false);
  };

  const handleFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { heading, category, subcategory, feedback } = feedbackForm;

    if (!heading || !category || !subcategory || !feedback) {
      setFeedbackError('Please fill in all fields.');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const res = await API.post(
        '/feedback/submit',
        { heading, category, subcategory, message: feedback },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.status === 200 || res.status === 201) {
        setFeedbackSuccess(true);
        setFeedbackForm({
          heading: '',
          category: '',
          subcategory: '',
          feedback: '',
        });

        setTimeout(() => setFeedbackSuccess(false), 5000);

        const updated = await API.get('/feedback/my-feedbacks', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setSubmittedFeedbacks(updated.data || []);
      }
    } catch (err: any) {
      setFeedbackSuccess(false);
      setFeedbackError(err?.response?.data?.message || 'Submission failed.');
    }
  };

  const filteredFeedbacks =
    selectedCategory === 'Submitted'
      ? submittedFeedbacks
      : selectedSubcategory !== ''
        ? submittedFeedbacks.filter(
            (fb) =>
              fb.category === selectedCategory &&
              fb.subcategory === selectedSubcategory
          )
        : [];

  const toggleExpand = (index: number) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  return (
    <div className="user-page">
      {/* Navbar */}
      <nav className="navbar">
        <div></div>
        <div className="profile-dropdown" ref={profileRef}>
          <img
            src={Profile}
            alt="User"
            className="user-img"
            onClick={() => setShowProfileDropdown(!showProfileDropdown)}
          />
          {showProfileDropdown && (
            <div className="dropdown-options profile-options">
              <div className="logout-option" onClick={handleLogout}>
                Logout
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Welcome */}
      <div className="welcome-text">Welcome {userName}</div>

      {/* Tabs */}
      <div className="tab-row" ref={dropdownRef}>
        <div
          className={`tab ${selectedCategory === 'Submitted' ? 'active' : ''}`}
          onClick={() => {
            setSelectedCategory('Submitted');
            setSelectedSubcategory('');
            setOpenCategoryDropdown(null);
          }}
        >
          Submitted Feedback
        </div>
        {categories.map((cat) => (
          <div key={cat} className="custom-dropdown">
            <div
              className={`dropdown-button ${selectedCategory === cat ? 'active' : ''}`}
              onClick={() => {
                setSelectedCategory(cat);
                setSelectedSubcategory('');
                setOpenCategoryDropdown(openCategoryDropdown === cat ? null : cat);
              }}
            >
              {cat}
            </div>
            {openCategoryDropdown === cat && (
              <div className="dropdown-options">
                {subcategoriesMap[cat].map((sub) => (
                  <div
                    key={sub}
                    className={`dropdown-option ${selectedSubcategory === sub ? 'selected' : ''}`}
                    onClick={() => {
                      setSelectedSubcategory(sub);
                      setOpenCategoryDropdown(null);
                    }}
                  >
                    {sub}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Content */}
      <div className="content">
        {/* Feedback Section */}
        <div className="feedback-section scrollable-column">
          <h3 className="sticky-heading">
            {selectedCategory === 'Submitted'
              ? 'Submitted Feedback'
              : selectedSubcategory
                ? `${selectedCategory}: ${selectedSubcategory}`
                : `Select a subcategory`}
          </h3>

          <div className="feedback-list">
            {filteredFeedbacks.length > 0 ? (
              filteredFeedbacks.map((fb, index) => (
                <div
                  className={`feedback-card ${expandedIndex === index ? 'expanded' : ''}`}
                  key={index}
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
                      <div className="feedback-message">
                        {fb.message}
                      </div>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="no-data">
                {selectedCategory === 'Submitted'
                  ? 'No feedback found...'
                  : selectedSubcategory
                    ? 'No feedback for this category.'
                    : ''}
              </div>
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
