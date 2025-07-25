import { BrowserRouter,Routes, Route } from "react-router-dom";
import LandingPage from "./Components/LandingPage";
import UserPage from "./Components/UserPage";
import LoginPage from "./Pages/LoginPage";
import RegisterPage from "./Pages/RegisterPage";
import AdminPage from "./Components/AdminPage";
import AdminAnalytics from "./Components/AdminAnalytics";

function App() {
  return (
    <BrowserRouter>
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/user" element={<UserPage />} />
      <Route path="/admin" element={<AdminPage />} />
      <Route path="/admin-analytics" element={<AdminAnalytics />} />
    </Routes>
    </BrowserRouter>
  );
}

export default App;
