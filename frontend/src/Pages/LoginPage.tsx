import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from '../api/api';
import './Auth.css';

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
            navigate("/");
          } else {
            navigate("/user");
          }
        }, 1000);
      }
    } catch (err: any) {
      console.error("Login error:", err);
      setError(err?.response?.data || "Invalid credentials.");
      setSuccess(false);
    }
  };

  return (
    <>
      <div className="parentContainer">

        <form onSubmit={handleSubmit}>
          <h3>Login</h3>
          <label htmlFor="">Email</label>
          <input
            type="email"
            name="email"
            value={formVal.email}
            onChange={handleChange}
            placeholder="Enter email" />

          <br />

          <label htmlFor="">Password</label>
          <input
            type="password"
            name="password"
            value={formVal.password}
            onChange={handleChange}
            placeholder="Enter password" />

          <br />
          <button type="submit">Login</button>
          {error && <p className="error">{error}</p>}
          {success && <p className="success">Login successful!</p>}
          <p className="redirect-text">
            Don't have an account? <Link to="/register">Register here</Link>
          </p>
        </form>

      </div>
    </>
  )
}

export default LoginPage