// import {FaChartLine, FaFileAlt } from 'react-icons/fa';
// import { FaClockRotateLeft } from "react-icons/fa6";
import { useNavigate } from "react-router-dom";
import './LandingPage.css';
// import HeadingImg from './Images/HeadingImg.png';
// import works1 from './Images/works1.png';
// import works2 from './Images/works2.png';

// const LandingPage: React.FC = () => {
//   const navigate = useNavigate();
//   return (
//     <div className="mainContainer">

//       <div className="headingContainer">
//         <div className="headingText">
//           <h1>Smart Feedback Portal</h1>
//           <button className="btn primary" onClick={() => navigate("/login")}>Get Started</button>
//         </div>
//         <div className="headingImg">
//           <img src={HeadingImg} alt="Smart Feedback Portal" />
//         </div>
//       </div>

  
//       <div className="worksSection">
//         <h2>How It Works</h2>
//         <div className="worksContent">
//           <div className="worksText">
//             <p>Your streamlined feedback collection and analysis, automated by smart tools.</p>
//           </div>
//           <div className="worksIconGroup">
//             <div className="iconBlock">
//               <img src={works1} alt="024 Works" />
//               <p>024 Works</p>
//             </div>
//             <div className="iconBlock">
//               <img src={works2} alt="Live Feedback" />
//               <p>Live Feedback</p>
//             </div>
//           </div>
//         </div>
//       </div>

//       <div className="keyFeatures">
//         <h2>Key Features</h2>
//         <div className="featuresGrid">
//           <div className="featureBox">
//             <FaClockRotateLeft size={32} />
//             <h4>Feedback History</h4>
//           </div>
//           <div className="featureBox">
//             <FaChartLine size={32} />
//             <h4>Real-time Analytics</h4>
//           </div>
//           <div className="featureBox">
//             <FaFileAlt size={32} />
//             <h4>Automated Report</h4>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };
// export default LandingPage;

import { useEffect, useState } from "react";

const testimonials = [
   {
    text: "Smart Feedback Portal helped us gather actionable insights from users. We've never been closer to understanding our customers.",
    name: "Ava Thompson",
    title: "Head of UX, Feedbackly",
    img: "https://i.pravatar.cc/40?img=12",
  },
  {
    text: "Clean UI and smooth experience. Collecting, managing, and analyzing feedback has never been this simple!",
    name: "Rajiv Menon",
    title: "Product Manager, Zento",
    img: "https://i.pravatar.cc/40?img=15",
  },
  {
    text: "Our decision-making process is now fully data-driven thanks to the analytics features of this portal.",
    name: "Emily Zhang",
    title: "CEO, Insightify",
    img: "https://i.pravatar.cc/40?img=18",
  },
];

const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % testimonials.length);
    }, 5000); // every 5 seconds
    return () => clearInterval(interval);
  }, []);

  const { text, name, title, img } = testimonials[current];

  return (
    <div className="mainContainer">
      {/* Hero Section */}
      <div className="heroSection">
        <h1>Feedback that drives action.</h1>
        <p className="subText">
          From collection to analysis, streamline your feedback process in one powerful dashboard.
        </p>
        <div className="centerBtn">
          <button className="btn primary" onClick={() => navigate("/login")}>Get Started</button>
        </div>
      </div>

      {/* Dynamic Testimonial Section */}
      <div className="testimonialCard">
        <p className="testimonialText">{text}</p>
        <div className="authorSection">
          <img src={img} alt={name} className="authorAvatar" />
          <div>
            <p className="authorName">{name}</p>
            <p className="authorTitle">{title}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;