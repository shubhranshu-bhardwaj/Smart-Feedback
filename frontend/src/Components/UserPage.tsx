import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './UserPage.css';
import Profile from './Images/dummy.png';

const dropdownLabels = ['Department', 'Services', 'Events'] as const;
type DropdownLabel = typeof dropdownLabels[number];

const UserPage: React.FC = () => {
  const [selected, setSelected] = useState<string>('Submitted');
  const [category, setCategory] = useState<string>('');
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [showProfileDropdown, setShowProfileDropdown] = useState<boolean>(false);
  const [userName, setUserName] = useState<string>('');

  const navigate = useNavigate();

  const dropdownRefs: Record<DropdownLabel, React.RefObject<HTMLDivElement | null>> = {
    Department: useRef<HTMLDivElement | null>(null),
    Services: useRef<HTMLDivElement | null>(null),
    Events: useRef<HTMLDivElement | null>(null),
  };

  const profileRef = useRef<HTMLDivElement>(null);

  const handleSelect = (cat: string, option: string) => {
    setCategory(cat);
    setSelected(option);
    setOpenDropdown(null);
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/', { replace: true });
  };

  const dummyData: Record<string, { title: string }[]> = {
    Submitted: [
      { title: 'Submitted Feedback 1' }, { title: 'Submitted Feedback 2' },
      { title: 'Submitted Feedback 3' }, { title: 'Submitted Feedback 4' }
    ],
    Pending: [
      { title: 'Pending Feedback 1' }, { title: 'Pending Feedback 2' },
      { title: 'Pending Feedback 3' }, { title: 'Pending Feedback 4' }
    ],
    HR: [{ title: 'HR Feedback A' }, { title: 'HR Feedback B' }],
    Development: [{ title: 'Dev Feedback A' }, { title: 'Dev Feedback B' }],
    AC: [{ title: 'AC Service A' }, { title: 'AC Service B' }],
    Water: [{ title: 'Water Service A' }, { title: 'Water Service B' }],
    FitHit: [{ title: 'FitHit Event Feedback' }, { title: 'Another FitHit Item' }],
    RunForLife: [{ title: 'RunForLife Event Feedback' }, { title: 'Volunteer Details' }],
  };

  const renderDropdown = (label: DropdownLabel, options: string[]) => (
    <div
      className={`custom-dropdown ${openDropdown === label ? 'active' : ''}`}
      ref={dropdownRefs[label]}
    >
      <div
        className={`dropdown-button ${
          openDropdown === label || category === label ? 'active' : ''
        }`}
        onClick={() => setOpenDropdown(openDropdown === label ? null : label)}
      >
        {label}
      </div>
      {openDropdown === label && (
        <div className="dropdown-options">
          {options.map((option) => (
            <div
              key={option}
              className="dropdown-option"
              onClick={() => handleSelect(label, option)}
            >
              {option}
            </div>
          ))}
        </div>
      )}
    </div>
  );

  useEffect(() => {
    const name = localStorage.getItem('userName');
    if (name) {
      setUserName(name);
    }

    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login', { replace: true });
    }

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      const clickedOutsideDropdowns = dropdownLabels.every(
        (label) => !dropdownRefs[label].current?.contains(target)
      );
      const clickedOutsideProfile = profileRef.current && !profileRef.current.contains(target);

      if (clickedOutsideDropdowns) {
        setOpenDropdown(null);
      }

      if (clickedOutsideProfile) {
        setShowProfileDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [navigate]);

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
              <div className="logout-option" onClick={handleLogout}>Logout</div>
            </div>
          )}
        </div>
      </nav>

      {/* Welcome */}
      <div className="welcome-text">Welcome {userName}</div>

      {/* Tabs */}
      <div className="tab-row">
        <div
          className={`tab ${selected === 'Submitted' && category === '' ? 'active' : ''}`}
          onClick={() => handleSelect('', 'Submitted')}
        >
          Submitted Feedback
        </div>
        <div
          className={`tab ${selected === 'Pending' && category === '' ? 'active' : ''}`}
          onClick={() => handleSelect('', 'Pending')}
        >
          Pending
        </div>
        {renderDropdown('Department', ['HR', 'Development'])}
        {renderDropdown('Services', ['AC', 'Water'])}
        {renderDropdown('Events', ['FitHit', 'RunForLife'])}
      </div>

      {/* Content */}
      <div className="content">
        {/* Feedback Section */}
        <div className="feedback-section scrollable-column">
          <h3 className="sticky-heading">
            {category ? `${category}: ${selected}` : selected}
          </h3>
          <div className="feedback-list">
            {(dummyData[selected] || []).map((item, index) => (
              <div className="feedback-card" key={index}>
                <div className="status-dot" />
                <div className="feedback-title">{item.title}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Event Section */}
        <div className="event-section scrollable-column">
          <h3 className="sticky-heading">Upcoming Events</h3>
          <div className="event-list">
            <div className="event-item">🌟 FitHit - July 10, 2025</div>
            <div className="event-item">🏃 RunForLife - Aug 3, 2025</div>
            <div className="event-item">🎉 Wellness Fest - Sept 15, 2025</div>
            <div className="event-item">📣 Leadership Talk - Oct 21, 2025</div>
            <div className="event-item">💬 Hackathon - Nov 11, 2025</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserPage;
