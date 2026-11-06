
import React from "react";
import { Link } from "react-router-dom";

export default function LaunchPage() {
    const features = [
        {
            number: "01",
            title: "Book Management",
            description:
                "Explore a centralized collection of books with detailed information, categories and availability."
        },
        {
            number: "02",
            title: "Easy Borrowing",
            description:
                "Borrow books, monitor due dates and manage your borrowing activity through a simple interface."
        },
        {
            number: "03",
            title: "Member Management",
            description:
                "Maintain organized member accounts and access personal library information."
        },
        {
            number: "04",
            title: "Fine Management",
            description:
                "Keep track of overdue books and outstanding fines with transparent records."
        }
    ];

    const steps = [
        {
            number: "01",
            title: "Create Your Account",
            description:
                "Register using your employee details to access the library portal."
        },
        {
            number: "02",
            title: "Explore the Collection",
            description:
                "Browse available books, search by title or author and discover new resources."
        },
        {
            number: "03",
            title: "Borrow and Manage",
            description:
                "Borrow books, track return dates and manage your library activity."
        }
    ];

    return (
        <div className="hl-landing">

            {/* NAVIGATION */}

            <header className="hl-landing-header">
                <nav className="hl-landing-nav">
                    <Link to="/" className="hl-landing-logo">
                        Hexa<span>Library</span>
                    </Link>

                    <div className="hl-landing-links">
                        <a href="#home">Home</a>
                        <a href="#about">About</a>
                        <a href="#features">Features</a>
                        <a href="#how-it-works">How It Works</a>
                    </div>

                    <div className="hl-landing-actions">
                        <Link
                            to="/login"
                            className="hl-landing-login"
                        >
                            Login
                        </Link>

                        <Link
                            to="/registration"
                            className="hl-landing-register"
                        >
                            Get Started
                        </Link>
                    </div>
                </nav>
            </header>

            {/* HERO SECTION */}

            <section className="hl-hero" id="home">
                <div className="hl-hero-inner">

                    <div className="hl-hero-content">
                        <span className="hl-hero-label">
                            DIGITAL LIBRARY MANAGEMENT SYSTEM
                        </span>

                        <h1>
                            A Smarter Way to
                            <span> Manage Your Library.</span>
                        </h1>

                        <p>
                            Discover a simpler and more organized
                            library experience. Explore books, manage
                            borrowings and stay updated with your
                            library activities — all in one place.
                        </p>

                        <div className="hl-hero-buttons">
                            <Link
                                to="/login"
                                className="hl-landing-register hl-hero-primary"
                            >
                                Access Your Library
                            </Link>

                            <a
                                href="#features"
                                className="hl-hero-secondary"
                            >
                                Explore Features
                            </a>
                        </div>

                        <div className="hl-hero-note">
                            A centralized platform for efficient
                            library operations.
                        </div>
                    </div>

                    <div className="hl-hero-visual">
                        <div className="hl-visual-panel">
                            <div className="hl-visual-top">
                                <div>
                                    <span className="hl-visual-caption">
                                        HEXALIBRARY
                                    </span>
                                    <h3>Library Overview</h3>
                                </div>
                                <span className="hl-visual-status">
                                    MEMBER PORTAL
                                </span>
                            </div>

                            <div className="hl-visual-stat-grid">
                                <div className="hl-visual-stat">
                                    <span>BOOK COLLECTION</span>
                                    <strong>Books</strong>
                                    <small>Centralized catalogue</small>
                                </div>

                                <div className="hl-visual-stat">
                                    <span>MEMBER ACCESS</span>
                                    <strong>Members</strong>
                                    <small>Organized accounts</small>
                                </div>

                                <div className="hl-visual-stat">
                                    <span>BOOK ACTIVITY</span>
                                    <strong>Borrow</strong>
                                    <small>Track your books</small>
                                </div>

                                <div className="hl-visual-stat">
                                    <span>ACCOUNT TRACKING</span>
                                    <strong>Manage</strong>
                                    <small>Stay up to date</small>
                                </div>
                            </div>

                            <div className="hl-visual-bottom">
                                <div>
                                    <strong>Everything in one place</strong>
                                    <p>
                                        Your library, organized and accessible.
                                    </p>
                                </div>

                                <span className="hl-visual-mark">
                                    HL
                                </span>
                            </div>
                        </div>

                        <div className="hl-hero-decoration hl-decoration-one" />
                        <div className="hl-hero-decoration hl-decoration-two" />
                    </div>

                </div>
            </section>

            {/* TRUST / INTRO STRIP */}

            <section className="hl-intro-strip">
                <div>
                    <strong>One Platform</strong>
                    <span>Centralized library access</span>
                </div>

                <div>
                    <strong>Simple Management</strong>
                    <span>Organized book operations</span>
                </div>

                <div>
                    <strong>Easy Tracking</strong>
                    <span>Clear borrowing information</span>
                </div>
            </section>

            {/* ABOUT SECTION */}

            <section className="hl-landing-section" id="about">
                <div className="hl-section-container">
                    <div className="hl-about-grid">

                        <div className="hl-about-visual">
                            <div className="hl-about-box">
                                <span className="hl-about-monogram">
                                    HL
                                </span>
                                <h3>Knowledge, Organized.</h3>
                                <p>
                                    A centralized digital experience
                                    for modern library management.
                                </p>
                            </div>
                        </div>

                        <div className="hl-about-content">
                            <span className="hl-section-label">
                                ABOUT HEXALIBRARY
                            </span>

                            <h2>
                                Bringing library operations
                                into one organized platform.
                            </h2>

                            <p>
                                HexaLibrary is a library management
                                platform designed to simplify how
                                books and members are managed.
                            </p>

                            <p>
                                From discovering books to tracking
                                borrowings and returns, the platform
                                provides a convenient and structured
                                experience for library members and
                                administrators.
                            </p>

                            <Link
                                to="/login"
                                className="hl-about-link"
                            >
                                Explore Your Library
                                <span>→</span>
                            </Link>
                        </div>

                    </div>
                </div>
            </section>

            {/* FEATURES */}

            <section
                className="hl-landing-section hl-features-section"
                id="features"
            >
                <div className="hl-section-container">

                    <div className="hl-section-heading-landing">
                        <span className="hl-section-label">
                            PLATFORM FEATURES
                        </span>

                        <h2>
                            Everything you need to
                            manage your library.
                        </h2>

                        <p>
                            Simple tools designed to make everyday
                            library operations more efficient.
                        </p>
                    </div>

                    <div className="hl-feature-grid">
                        {features.map((feature) => (
                            <article
                                className="hl-feature-card"
                                key={feature.number}
                            >
                                <span className="hl-feature-number">
                                    {feature.number}
                                </span>

                                <div className="hl-feature-line" />

                                <h3>{feature.title}</h3>

                                <p>{feature.description}</p>
                            </article>
                        ))}
                    </div>

                </div>
            </section>

            {/* HOW IT WORKS */}

            <section
                className="hl-landing-section"
                id="how-it-works"
            >
                <div className="hl-section-container">

                    <div className="hl-section-heading-landing">
                        <span className="hl-section-label">
                            HOW IT WORKS
                        </span>

                        <h2>
                            Get started in three simple steps.
                        </h2>

                        <p>
                            Access your library and manage your
                            borrowing activities with ease.
                        </p>
                    </div>

                    <div className="hl-steps-grid">
                        {steps.map((step) => (
                            <div
                                className="hl-step-card"
                                key={step.number}
                            >
                                <span className="hl-step-number">
                                    {step.number}
                                </span>

                                <h3>{step.title}</h3>

                                <p>{step.description}</p>
                            </div>
                        ))}
                    </div>

                </div>
            </section>

            {/* CALL TO ACTION */}

            <section className="hl-landing-cta">
                <div className="hl-cta-inner">
                    <div>
                        <span className="hl-cta-label">
                            GET STARTED WITH HEXALIBRARY
                        </span>

                        <h2>
                            Your library experience,
                            made simpler.
                        </h2>

                        <p>
                            Sign in to explore the collection
                            and manage your library activities.
                        </p>
                    </div>

                    <Link
                        to="/login"
                        className="hl-cta-button"
                    >
                        Login to HexaLibrary
                        <span>→</span>
                    </Link>
                </div>
            </section>

            {/* FOOTER */}

            <footer className="hl-landing-footer">
                <div className="hl-footer-inner">

                    <div>
                        <Link to="/" className="hl-landing-logo">
                            Hexa<span>Library</span>
                        </Link>

                        <p>
                            A smarter and more organized
                            digital library experience.
                        </p>
                    </div>

                    <div className="hl-footer-links">
                        <a href="#home">Home</a>
                        <a href="#about">About</a>
                        <a href="#features">Features</a>
                        <Link to="/login">Login</Link>
                    </div>

                </div>

                <div className="hl-footer-bottom">
                    © {new Date().getFullYear()} HexaLibrary.
                    All rights reserved.
                </div>
            </footer>

        </div>
    );
}
