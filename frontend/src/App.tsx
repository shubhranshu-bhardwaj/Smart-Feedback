import { BrowserRouter,Routes, Route } from "react-router-dom";
import LandingPage from "./Components/LandingPage";
import UserPage from "./Components/UserPage";
import LoginPage from "./Pages/LoginPage";
import RegisterPage from "./Pages/RegisterPage";
import AdminPage from "./Components/AdminPage";
import AdminAnalytics from "./Components/AdminAnalytics";
import ManageUser from "./Components/ManageUser";

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
      <Route path="/admin/users" element={<ManageUser />} />
    </Routes>
    </BrowserRouter>
  );
}

export default App;
