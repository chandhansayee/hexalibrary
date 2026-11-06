
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const API = "http://127.0.0.1:8000";

export default function Login() {
    const navigate = useNavigate();

    const [form, setForm] = useState({
        email: "",
        password: ""
    });

    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        if (!form.email.trim() || !form.password) {
            setError("Please enter your email and password.");
            return;
        }

        setLoading(true);

        try {
            const response = await fetch(`${API}/login`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(form)
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(
                    result.detail || "Invalid email or password."
                );
            }

            // Supports either {user: {...}} or a direct user object.
            const loggedInUser = result.user || result;

            if (!loggedInUser.id || !loggedInUser.role) {
                throw new Error(
                    "Login response is missing user ID or role. Check your backend response."
                );
            }

            localStorage.setItem(
                "user",
                JSON.stringify(loggedInUser)
            );

            if (
                String(loggedInUser.role).toLowerCase() === "admin"
            ) {
                navigate("/admin", { replace: true });
            } else {
                navigate("/dashboard", { replace: true });
            }
        } catch (err) {
            setError(err.message || "Unable to login.");
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
                <section className="hl-auth-card">

                    <div className="hl-auth-brand-mark">
                        HL
                    </div>

                    <div className="hl-auth-heading">
                        <span className="hl-auth-eyebrow">
                            MEMBER ACCESS
                        </span>

                        <h1>Welcome Back</h1>

                        <p>
                            Sign in to access your HexaLibrary account
                            and manage your library activities.
                        </p>
                    </div>

                    {error && (
                        <div className="hl-auth-error" role="alert">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>

                        <div className="hl-form-group">
                            <label htmlFor="login-email">
                                Email Address
                            </label>

                            <input
                                id="login-email"
                                type="email"
                                name="email"
                                placeholder="Enter your registered email"
                                value={form.email}
                                onChange={handleChange}
                                autoComplete="username"
                                required
                            />
                        </div>

                        <div className="hl-form-group">
                            <div className="hl-label-row">
                                <label htmlFor="login-password">
                                    Password
                                </label>
                            </div>

                            <div className="hl-password-field">
                                <input
                                    id="login-password"
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    placeholder="Enter your password"
                                    value={form.password}
                                    onChange={handleChange}
                                    autoComplete="current-password"
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
                        </div>

                        <button
                            type="submit"
                            className="hl-auth-submit"
                            disabled={loading}
                        >
                            {loading ? "Signing in..." : "Sign In"}
                        </button>

                    </form>

                    <div className="hl-auth-switch">
                        Don't have an account?
                        <Link to="/registration">
                            Create Account
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
