import {FaChartLine, FaFileAlt } from 'react-icons/fa';
import { FaClockRotateLeft } from "react-icons/fa6";
import { useNavigate } from "react-router-dom";
import './LandingPage.css';
import HeadingImg from './Images/HeadingImg.png';
import works1 from './Images/works1.png';
import works2 from './Images/works2.png';

const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  return (
    <div className="mainContainer">
      {/* Heading Section */}
      <div className="headingContainer">
        <div className="headingText">
          <h1>Smart Feedback Portal</h1>
          <button className="btn primary" onClick={() => navigate("/login")}>Get Started</button>
        </div>
        <div className="headingImg">
          <img src={HeadingImg} alt="Smart Feedback Portal" />
        </div>
      </div>

      {/* How It Works Section */}
      <div className="worksSection">
        <h2>How It Works</h2>
        <div className="worksContent">
          <div className="worksText">
            <p>Your streamlined feedback collection and analysis, automated by smart tools.</p>
          </div>
          <div className="worksIconGroup">
            <div className="iconBlock">
              <img src={works1} alt="024 Works" />
              <p>024 Works</p>
            </div>
            <div className="iconBlock">
              <img src={works2} alt="Live Feedback" />
              <p>Live Feedback</p>
            </div>
          </div>
        </div>
      </div>

      {/* Key Features Section */}
      <div className="keyFeatures">
        <h2>Key Features</h2>
        <div className="featuresGrid">
          <div className="featureBox">
            <FaClockRotateLeft size={32} />
            <h4>Feedback History</h4>
          </div>
          <div className="featureBox">
            <FaChartLine size={32} />
            <h4>Real-time Analytics</h4>
          </div>
          <div className="featureBox">
            <FaFileAlt size={32} />
            <h4>Automated Report</h4>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
