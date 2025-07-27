import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from '../api/api';
import './LoginPage.css';
import loginImg from '../assets/loginImg.svg';

interface LoginData {
  email: string;
  password: string;
};

const LoginPage: React.FC = () => {

  const [formVal, setFormVal] = useState<LoginData>({
    email: "",
    password: ""
  });

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormVal((prev) => ({ ...prev, [name]: value }));
    setError(null);
    setSuccess(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { email, password } = formVal;
     if (!email || !password) {
    setError("Please fill in all fields.");
    setSuccess(false);
    return;
  }

    try {
      const res = await API.post('/auth/login', {
        email,
        password,
      });

      if (res.status === 200) {
        const { token, isAdmin, fullName } = res.data;

        localStorage.setItem("token", token);
        localStorage.setItem("isAdmin", isAdmin);
        localStorage.setItem("userName", fullName);

        setSuccess(true);

        setTimeout(() => {
          if (isAdmin === true || isAdmin === "true") {
            navigate("/admin");
          } else {
            navigate("/user");
          }
        }, 1000);
      }
    }
    catch (err: any) {
      console.error("Login error:", err);
      setError(err?.response?.data || "Invalid credentials.");
      setSuccess(false);
    }
  };

  return (
    <div className="login-wrapper">
      <div className="login-left">
        <img src={loginImg} alt="Login Visual" className="login-img" />
      </div>
      <div className="login-right">
      <div className="login-container">
        <div className="login-header">
          <div className="login-icon">
            <span role="img" aria-label="login">🔐</span>
          </div>
          <h2 className="login-title">Welcome Back</h2>
          <p className="login-desc">Log in to continue to your dashboard.</p>
        </div>
        <form className="login-form" onSubmit={handleSubmit}>
          <input
            type="email"
            name="email"
            autoComplete="email"
            value={formVal.email}
            onChange={handleChange}
            placeholder="Email"
            className="input"
            
          />
          <input
            type="password"
            name="password"
            autoComplete="current-password"
            value={formVal.password}
            onChange={handleChange}
            placeholder="Password"
            className="input"
            
          />
          <button className="login-btn" type="submit">
            Log In
          </button>
          {error && <p className="login-error">{error}</p>}
          {success && <p className="login-success">Login successful!</p>}
        </form>
        <div className="login-footer">
          <span>
            Don't have an account?
            <Link className="footer-link" to="/register">Register here</Link>
          </span>
        </div>
      </div>
    </div>
    </div>
  )
}

export default LoginPage