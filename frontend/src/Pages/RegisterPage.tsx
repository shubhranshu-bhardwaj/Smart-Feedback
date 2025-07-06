import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from '../api/api';
import './Auth.css';

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

        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        // const payload = { fullName, gender, email, password };
        const payload = { fullName, gender, email, passwordHash: password };


        try {
            const res = await API.post('/auth/register', payload);
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
            alert(err?.response?.data || "Registration failed.");
            setError("Something went wrong.");
        }
    };
    return (
        <>
            <div className="parentContainer">

                <form onSubmit={handleSubmit}>
                    <h3>Register</h3>
                    <label htmlFor="">Full Name</label>
                    <input
                        type="text"
                        name="fullName"
                        value={formVal.fullName}
                        onChange={handleChange}
                        placeholder="Enter your full name"
                    />

                    <label htmlFor="">Gender</label>
                    <select
                        name="gender"
                        value={formVal.gender}
                        onChange={handleChange}>
                        <option value="">Select Gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                    </select>


                    <label htmlFor="">Email</label>
                    <input
                        type="email"
                        name="email"
                        value={formVal.email}
                        onChange={handleChange}
                        placeholder="Eneter email" />



                    <label htmlFor="">Password</label>
                    <input
                        type="password"
                        name="password"
                        value={formVal.password}
                        onChange={handleChange}
                        placeholder="Enter password" />



                    <label htmlFor="">Confirm Password</label>
                    <input
                        type="password"
                        name="confirmPassword"
                        value={formVal.confirmPassword}
                        onChange={handleChange}
                        placeholder="Confirm Password" />


                    <button type="submit">Register</button>
                    {error && <p className="error">{error}</p>}
                    {success && <p className="success">Registration successful!</p>}
                    <p className="redirect-text">
                        Already have an account? <Link to="/login">Login here</Link>
                    </p>
                </form>

            </div>
        </>
    )
}

export default RegisterPage