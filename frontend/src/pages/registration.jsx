
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const API = "http://127.0.0.1:8000";

export default function Registration() {
    const navigate = useNavigate();

    const [form, setForm] = useState({
        employee_id: "",
        name: "",
        email: "",
        password: "",
        confirmPassword: ""
    });

    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        if (
            !form.employee_id.trim() ||
            !form.name.trim() ||
            !form.email.trim() ||
            !form.password ||
            !form.confirmPassword
        ) {
            setError("Please complete all fields.");
            return;
        }

        if (form.password.length < 8) {
            setError("Password must contain at least 8 characters.");
            return;
        }

        if (form.password !== form.confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        setLoading(true);

        try {
            const response = await fetch(`${API}/register`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    employee_id: form.employee_id.trim(),
                    name: form.name.trim(),
                    email: form.email.trim(),
                    password: form.password
                })
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(
                    result.detail || "Registration failed."
                );
            }

            setSuccess(
                "Your account has been created successfully. Redirecting to login..."
            );

            setTimeout(() => {
                navigate("/login");
            }, 1200);

        } catch (err) {
            setError(err.message || "Unable to register.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="hl-auth-page">

            <header className="hl-auth-header">
                <Link to="/" className="hl-auth-logo">
                    Hexa<span>Library</span>
                </Link>

                <Link to="/" className="hl-auth-home">
                    Back to Home
                </Link>
            </header>

            <main className="hl-auth-main">
                <section className="hl-auth-card hl-register-card">

                    <div className="hl-auth-brand-mark">
                        HL
                    </div>

                    <div className="hl-auth-heading">
                        <span className="hl-auth-eyebrow">
                            MEMBER REGISTRATION
                        </span>

                        <h1>Create Your Account</h1>

                        <p>
                            Register to explore books and access
                            the HexaLibrary member portal.
                        </p>
                    </div>

                    {error && (
                        <div className="hl-auth-error" role="alert">
                            {error}
                        </div>
                    )}

                    {success && (
                        <div className="hl-auth-success" role="status">
                            {success}
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>

                        <div className="hl-form-group">
                            <label htmlFor="employee-id">
                                Employee ID
                            </label>

                            <input
                                id="employee-id"
                                type="text"
                                name="employee_id"
                                placeholder="Enter your employee ID"
                                value={form.employee_id}
                                onChange={handleChange}
                                autoComplete="off"
                                required
                            />
                        </div>

                        <div className="hl-form-group">
                            <label htmlFor="register-name">
                                Full Name
                            </label>

                            <input
                                id="register-name"
                                type="text"
                                name="name"
                                placeholder="Enter your full name"
                                value={form.name}
                                onChange={handleChange}
                                autoComplete="name"
                                required
                            />
                        </div>

                        <div className="hl-form-group">
                            <label htmlFor="register-email">
                                Email Address
                            </label>

                            <input
                                id="register-email"
                                type="email"
                                name="email"
                                placeholder="Enter your email address"
                                value={form.email}
                                onChange={handleChange}
                                autoComplete="email"
                                required
                            />
                        </div>

                        <div className="hl-form-group">
                            <label htmlFor="register-password">
                                Password
                            </label>

                            <div className="hl-password-field">
                                <input
                                    id="register-password"
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    placeholder="Create a password"
                                    value={form.password}
                                    onChange={handleChange}
                                    autoComplete="new-password"
                                    minLength={8}
                                    required
                                />

                                <button
                                    type="button"
                                    className="hl-password-toggle"
                                    onClick={() =>
                                        setShowPassword(!showPassword)
                                    }
                                >
                                    {showPassword ? "Hide" : "Show"}
                                </button>
                            </div>

                            <small className="hl-input-help">
                                Use at least 8 characters.
                            </small>
                        </div>

                        <div className="hl-form-group">
                            <label htmlFor="confirm-password">
                                Confirm Password
                            </label>

                            <input
                                id="confirm-password"
                                type={showPassword ? "text" : "password"}
                                name="confirmPassword"
                                placeholder="Re-enter your password"
                                value={form.confirmPassword}
                                onChange={handleChange}
                                autoComplete="new-password"
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            className="hl-auth-submit"
                            disabled={loading || Boolean(success)}
                        >
                            {loading ? "Creating Account..." : "Create Account"}
                        </button>

                    </form>

                    <div className="hl-auth-switch">
                        Already have an account?
                        <Link to="/login">
                            Sign In
                        </Link>
                    </div>

                </section>
            </main>

            <footer className="hl-auth-footer">
                © {new Date().getFullYear()} HexaLibrary.
                All rights reserved.
            </footer>

        </div>
    );
}
