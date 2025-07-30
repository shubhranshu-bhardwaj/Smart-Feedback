import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from '../api/api';
import './RegisterPage.css';
import signupImg from '../assets/signupImg.svg';

type Gender = "Male" | "Female" | "Other";

interface FormData {
    fullName: string;
    gender: Gender | "";
    email: string;
    password: string;
    confirmPassword: string;
}

const RegisterPage: React.FC = () => {

    const [formVal, setFormVal] = useState<FormData>({
        fullName: "",
        gender: "",
        email: "",
        password: "",
        confirmPassword: "",
    });

    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<boolean>(false);
    const navigate = useNavigate();

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => {
        const { name, value } = e.target;
        setFormVal((prev) => ({ ...prev, [name]: value }));
        setError(null);
        setSuccess(false);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const { fullName, gender, email, password, confirmPassword } = formVal;

        if (!fullName || !gender || !email || !password || !confirmPassword) {
            setError("Please fill in all fields.");
            setSuccess(false);
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            setError("Please enter a valid email address.");
            setSuccess(false);
            return;
        }

        const passwordRegex =
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()[\]{};:'",.<>/?\\|_+=-]).{8,}$/;
        if (!passwordRegex.test(password)) {
            setError(
                "Password must be at least 8 characters long and include at least one uppercase letter, one lowercase letter, one digit, and one special character."
            );
            setSuccess(false);
            return;
        }

        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            setSuccess(false);
            return;
        }

        const payload = { fullName, gender, email, passwordHash: password };

        try {
            const res = await API.post("/auth/register", payload);
            if (res.status === 200 || res.status === 201) {
                setSuccess(true);
                setFormVal({
                    fullName: "",
                    gender: "",
                    email: "",
                    password: "",
                    confirmPassword: "",
                });

                setTimeout(() => {
                    navigate("/login");
                }, 1000);
            }
        } catch (err: any) {
            setError("Something went wrong.");
            setSuccess(false);
        }
    };

    return (
        <div className="register-wrapper">
            <div className="register-left">
                <div className="register-container">
                    <div className="register-header">
                        <div className="register-icon">

                            <span role="img" aria-label="register">🔒</span>
                        </div>
                        <h2 className="register-title">Sign up with email</h2>
                        <p className="register-desc">
                            Create your account to get started. It's free and easy.
                        </p>
                    </div>
                    <form className="register-form" onSubmit={handleSubmit}>
                        <input
                            type="text"
                            name="fullName"
                            autoComplete="name"
                            value={formVal.fullName}
                            onChange={handleChange}
                            placeholder="Full Name"
                            className="input"

                        />
                        <select
                            name="gender"
                            value={formVal.gender}
                            onChange={handleChange}
                            className="input"

                        >
                            <option value="">Select Gender</option>
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                            <option value="Other">Other</option>
                        </select>
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
                            autoComplete="new-password"
                            value={formVal.password}
                            onChange={handleChange}
                            placeholder="Password"
                            className="input"

                        />
                        <input
                            type="password"
                            name="confirmPassword"
                            autoComplete="new-password"
                            value={formVal.confirmPassword}
                            onChange={handleChange}
                            placeholder="Confirm Password"
                            className="input"

                        />
                        <button className="register-btn" type="submit">
                            Create Account
                        </button>
                        {error && <p className="register-error">{error}</p>}
                        {success && <p className="register-success">Registration successful!</p>}
                    </form>
                    <div className="register-footer">
                        <span>
                            Already have an account?{' '}
                            <Link className="footer-link" to="/login">Login here</Link>
                        </span>
                    </div>
                </div>
            </div>
            <div className="register-right">
                <img src={signupImg} alt="Signup" className="register-img" />
            </div>
        </div>

    )
}

export default RegisterPage