
import React, { useEffect, useMemo, useState } from "react";

const API = "http://127.0.0.1:8000";

export default function UserDashboard() {
    const [user] = useState(() => {
        try {
            return JSON.parse(localStorage.getItem("user")) || {};
        } catch {
            return {};
        }
    });

    const [books, setBooks] = useState([]);
    const [borrowings, setBorrowings] = useState([]);
    const [wishlist, setWishlist] = useState(() => {
        try {
            return JSON.parse(
                localStorage.getItem("hexalibrary_wishlist")
            ) || [];
        } catch {
            return [];
        }
    });

    const [activePage, setActivePage] = useState("Overview");
    const [search, setSearch] = useState("");
    const [category, setCategory] = useState("All");
    const [availability, setAvailability] = useState("All");
    const [sortBy, setSortBy] = useState("title");
    const [selectedBook, setSelectedBook] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const userId = user.id;

    // ------------------------------------
    // FETCH DATA
    // ------------------------------------

    const fetchDashboardData = async () => {
        setLoading(true);
        setError("");

        try {
            const [bookResponse, borrowingResponse] =
                await Promise.all([
                    fetch(`${API}/books`),
                    userId
                        ? fetch(`${API}/borrowings/${userId}`)
                        : Promise.resolve(null)
                ]);

            if (!bookResponse.ok) {
                throw new Error("Unable to load books.");
            }

            const bookData = await bookResponse.json();

            setBooks(
                Array.isArray(bookData) ? bookData : []
            );

            if (borrowingResponse) {
                if (!borrowingResponse.ok) {
                    throw new Error(
                        "Unable to load borrowing history."
                    );
                }

                const borrowingData =
                    await borrowingResponse.json();

                setBorrowings(
                    Array.isArray(borrowingData)
                        ? borrowingData
                        : []
                );
            } else {
                setBorrowings([]);
            }
        } catch (err) {
            setError(
                err.message || "Something went wrong."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboardData();
    }, [userId]);

    useEffect(() => {
        localStorage.setItem(
            "hexalibrary_wishlist",
            JSON.stringify(wishlist)
        );
    }, [wishlist]);

    // ------------------------------------
    // DERIVED DATA
    // ------------------------------------

    const activeBorrowings = borrowings.filter(
        (item) =>
            !item.returned_date &&
            String(item.status || "").toLowerCase() !==
            "returned"
    );

    const returnedBooks = borrowings.filter(
        (item) =>
            item.returned_date ||
            String(item.status || "").toLowerCase() ===
            "returned"
    );

    const getDaysRemaining = (dueDate) => {
        if (!dueDate) return 0;

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const due = new Date(dueDate);
        due.setHours(0, 0, 0, 0);

        return Math.ceil(
            (due - today) / (1000 * 60 * 60 * 24)
        );
    };

    const overdueBooks = activeBorrowings.filter(
        (item) => getDaysRemaining(item.due_date) < 0
    );

    const upcomingBooks = activeBorrowings.filter(
        (item) => {
            const days = getDaysRemaining(item.due_date);
            return days >= 0 && days <= 3;
        }
    );

    const estimatedFine = overdueBooks.reduce(
        (total, item) =>
            total +
            Math.abs(
                getDaysRemaining(item.due_date)
            ) * 5,
        0
    );

    const categories = [
        "All",
        ...new Set(
            books
                .map((book) => book.category)
                .filter(Boolean)
        )
    ];

    const filteredBooks = useMemo(() => {
        let result = [...books];

        if (search.trim()) {
            const term = search.toLowerCase();

            result = result.filter(
                (book) =>
                    book.title?.toLowerCase().includes(term) ||
                    book.author?.toLowerCase().includes(term)
            );
        }

        if (category !== "All") {
            result = result.filter(
                (book) => book.category === category
            );
        }

        if (availability === "Available") {
            result = result.filter(
                (book) =>
                    Number(book.available_copies) > 0
            );
        }

        if (availability === "Unavailable") {
            result = result.filter(
                (book) =>
                    Number(book.available_copies) <= 0
            );
        }

        result.sort((a, b) =>
            String(a[sortBy] || "").localeCompare(
                String(b[sortBy] || "")
            )
        );

        return result;
    }, [
        books,
        search,
        category,
        availability,
        sortBy
    ]);

    const initials = (user.name || "User")
        .split(" ")
        .map((part) => part[0])
        .join("")
        .substring(0, 2)
        .toUpperCase();

    // ------------------------------------
    // WISHLIST
    // ------------------------------------

    const toggleWishlist = (bookId) => {
        setWishlist((previous) =>
            previous.includes(bookId)
                ? previous.filter((id) => id !== bookId)
                : [...previous, bookId]
        );
    };

    const savedBooks = books.filter((book) =>
        wishlist.includes(book.id)
    );

    // ------------------------------------
    // BORROW BOOK
    // ------------------------------------

    const borrowBook = async (book) => {
        if (!userId) {
            alert("Please log in again.");
            return;
        }

        if (activeBorrowings.length >= 5) {
            alert("You can borrow a maximum of 5 books.");
            return;
        }

        const alreadyBorrowed = activeBorrowings.some(
            (item) =>
                Number(item.book_id) === Number(book.id)
        );

        if (alreadyBorrowed) {
            alert("You have already borrowed this book.");
            return;
        }

        if (Number(book.available_copies) <= 0) {
            alert("This book is currently unavailable.");
            return;
        }

        try {
            const response = await fetch(
                `${API}/borrow`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        user_id: userId,
                        book_id: book.id
                    })
                }
            );

            const result = await response.json();

            if (!response.ok) {
                throw new Error(
                    result.detail || "Unable to borrow book."
                );
            }

            alert("Book borrowed successfully.");
            setSelectedBook(null);
            await fetchDashboardData();
        } catch (err) {
            alert(err.message);
        }
    };

    // ------------------------------------
    // RETURN BOOK
    // ------------------------------------

    const returnBook = async (borrowing) => {
        const bookName =
            borrowing.title || "this book";

        if (
            !window.confirm(
                `Are you sure you want to return ${bookName}?`
            )
        ) {
            return;
        }

        try {
            const response = await fetch(
                `${API}/return/${borrowing.borrowing_id}`,
                { method: "PUT" }
            );

            const result = await response.json();

            if (!response.ok) {
                throw new Error(
                    result.detail || "Unable to return book."
                );
            }

            alert("Book returned successfully.");
            await fetchDashboardData();
        } catch (err) {
            alert(err.message);
        }
    };

    // ------------------------------------
    // LOGOUT
    // ------------------------------------

    const handleLogout = () => {
        if (
            window.confirm("Are you sure you want to logout?")
        ) {
            localStorage.removeItem("user");
            window.location.href = "/login";
        }
    };

    // ------------------------------------
    // HELPERS
    // ------------------------------------

    const formatDate = (date) => {
        if (!date) return "-";

        return new Date(date).toLocaleDateString(
            "en-IN",
            {
                day: "2-digit",
                month: "short",
                year: "numeric"
            }
        );
    };

    const getStatus = (item) => {
        const days = getDaysRemaining(item.due_date);

        if (days < 0) {
            return {
                label: "Overdue",
                className: "overdue"
            };
        }

        return {
            label: "On time",
            className: "on-time"
        };
    };

    const navigation = [
        { name: "Overview", code: "OV" },
        { name: "Book Catalogue", code: "BK" },
        { name: "My Borrowings", code: "BR" },
        { name: "Saved Books", code: "SV" },
        { name: "Notifications", code: "NT" },
        { name: "My Profile", code: "PR" }
    ];

    // ------------------------------------
    // OVERVIEW PAGE
    // ------------------------------------

    const renderOverview = () => (
        <>
            <div className="hl-page-heading">
                <div>
                    <p className="hl-eyebrow">
                        MEMBER PORTAL
                    </p>
                    <h1>Dashboard Overview</h1>
                    <p className="hl-muted">
                        Welcome back, {user.name || "Member"}.
                        Here's your library summary.
                    </p>
                </div>

                <button
                    className="hl-button hl-button-outline"
                    onClick={fetchDashboardData}
                >
                    Refresh Data
                </button>
            </div>

            <div className="hl-stat-grid">
                <div className="hl-stat-card">
                    <span className="hl-stat-label">
                        Total Books
                    </span>
                    <strong>{books.length}</strong>
                    <small>Books in catalogue</small>
                </div>

                <div className="hl-stat-card">
                    <span className="hl-stat-label">
                        Active Borrowings
                    </span>
                    <strong>{activeBorrowings.length}</strong>
                    <small>Maximum 5 books</small>
                </div>

                <div className="hl-stat-card">
                    <span className="hl-stat-label">
                        Overdue Books
                    </span>
                    <strong className={
                        overdueBooks.length ? "hl-danger-text" : ""
                    }>
                        {overdueBooks.length}
                    </strong>
                    <small>Books past their due date</small>
                </div>

                <div className="hl-stat-card">
                    <span className="hl-stat-label">
                        Estimated Fine
                    </span>
                    <strong className={
                        estimatedFine ? "hl-danger-text" : ""
                    }>
                        ₹{estimatedFine}
                    </strong>
                    <small>₹5 per overdue day</small>
                </div>
            </div>

            {error && (
                <div className="hl-alert hl-alert-danger">
                    {error}
                </div>
            )}

            {overdueBooks.length > 0 && (
                <div className="hl-alert hl-alert-danger">
                    You have {overdueBooks.length} overdue book(s).
                    Please return them as soon as possible.
                </div>
            )}

            {upcomingBooks.length > 0 && (
                <div className="hl-alert hl-alert-info">
                    You have {upcomingBooks.length} book(s)
                    approaching their due date.
                </div>
            )}

            <section className="hl-section">
                <div className="hl-section-heading">
                    <div>
                        <h2>Currently Borrowed</h2>
                        <p>Your active borrowing records.</p>
                    </div>

                    <button
                        className="hl-button hl-button-outline"
                        onClick={() =>
                            setActivePage("My Borrowings")
                        }
                    >
                        View All
                    </button>
                </div>

                {activeBorrowings.length === 0 ? (
                    <div className="hl-empty-state">
                        <strong>No active borrowings</strong>
                        <p>You haven't borrowed any books yet.</p>
                        <button
                            className="hl-button hl-button-primary"
                            onClick={() =>
                                setActivePage("Book Catalogue")
                            }
                        >
                            Explore Books
                        </button>
                    </div>
                ) : (
                    <div className="hl-table-wrap">
                        <table className="hl-table">
                            <thead>
                                <tr>
                                    <th>Book</th>
                                    <th>Borrowed Date</th>
                                    <th>Due Date</th>
                                    <th>Status</th>
                                </tr>
                            </thead>

                            <tbody>
                                {activeBorrowings.slice(0, 5).map(
                                    (item) => {
                                        const status = getStatus(item);

                                        return (
                                            <tr key={item.borrowing_id}>
                                                <td className="hl-table-book">
                                                    {item.title || "Untitled"}
                                                </td>
                                                <td>
                                                    {formatDate(item.borrowed_date)}
                                                </td>
                                                <td>
                                                    {formatDate(item.due_date)}
                                                </td>
                                                <td>
                                                    <span
                                                        className={`hl-status ${status.className}`}
                                                    >
                                                        {status.label}
                                                    </span>
                                                </td>
                                            </tr>
                                        );
                                    }
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </section>

            <section className="hl-section">
                <div className="hl-section-heading">
                    <div>
                        <h2>Recently Added Books</h2>
                        <p>Explore the available collection.</p>
                    </div>

                    <button
                        className="hl-button hl-button-outline"
                        onClick={() =>
                            setActivePage("Book Catalogue")
                        }
                    >
                        Browse Catalogue
                    </button>
                </div>

                <div className="hl-book-grid">
                    {books.slice(0, 3).map((book) => (
                        <BookCard
                            key={book.id}
                            book={book}
                            wishlist={wishlist}
                            toggleWishlist={toggleWishlist}
                            onDetails={setSelectedBook}
                        />
                    ))}
                </div>
            </section>
        </>
    );

    // ------------------------------------
    // BOOK CATALOGUE PAGE
    // ------------------------------------

    const renderCatalogue = () => (
        <>
            <div className="hl-page-heading">
                <div>
                    <p className="hl-eyebrow">
                        LIBRARY COLLECTION
                    </p>
                    <h1>Book Catalogue</h1>
                    <p className="hl-muted">
                        Search and explore available books.
                    </p>
                </div>
            </div>

            <section className="hl-section">
                <div className="hl-filter-grid">
                    <input
                        type="text"
                        placeholder="Search by title or author..."
                        value={search}
                        onChange={(e) =>
                            setSearch(e.target.value)
                        }
                    />

                    <select
                        value={category}
                        onChange={(e) =>
                            setCategory(e.target.value)
                        }
                    >
                        {categories.map((item) => (
                            <option key={item} value={item}>
                                {item}
                            </option>
                        ))}
                    </select>

                    <select
                        value={availability}
                        onChange={(e) =>
                            setAvailability(e.target.value)
                        }
                    >
                        <option value="All">All Books</option>
                        <option value="Available">
                            Available
                        </option>
                        <option value="Unavailable">
                            Unavailable
                        </option>
                    </select>

                    <select
                        value={sortBy}
                        onChange={(e) =>
                            setSortBy(e.target.value)
                        }
                    >
                        <option value="title">
                            Sort by Title
                        </option>
                        <option value="author">
                            Sort by Author
                        </option>
                        <option value="category">
                            Sort by Category
                        </option>
                    </select>
                </div>

                <div className="hl-section-heading">
                    <div>
                        <h2>Available Collection</h2>
                        <p>{filteredBooks.length} books found</p>
                    </div>
                </div>

                {loading ? (
                    <div className="hl-empty-state">
                        Loading books...
                    </div>
                ) : filteredBooks.length === 0 ? (
                    <div className="hl-empty-state">
                        <strong>No books found</strong>
                        <p>Try changing your search or filters.</p>
                    </div>
                ) : (
                    <div className="hl-book-grid">
                        {filteredBooks.map((book) => (
                            <BookCard
                                key={book.id}
                                book={book}
                                wishlist={wishlist}
                                toggleWishlist={toggleWishlist}
                                onDetails={setSelectedBook}
                            />
                        ))}
                    </div>
                )}
            </section>
        </>
    );

    // ------------------------------------
    // BORROWINGS PAGE
    // ------------------------------------

    const renderBorrowings = () => (
        <>
            <div className="hl-page-heading">
                <div>
                    <p className="hl-eyebrow">
                        MEMBER ACTIVITY
                    </p>
                    <h1>My Borrowings</h1>
                    <p className="hl-muted">
                        Track your borrowed and returned books.
                    </p>
                </div>
            </div>

            <section className="hl-section">
                <div className="hl-section-heading">
                    <div>
                        <h2>Active Borrowings</h2>
                        <p>
                            {activeBorrowings.length} of 5 books borrowed
                        </p>
                    </div>
                </div>

                {activeBorrowings.length === 0 ? (
                    <div className="hl-empty-state">
                        <strong>No active books</strong>
                        <p>Your active borrowing list is empty.</p>
                    </div>
                ) : (
                    <div className="hl-table-wrap">
                        <table className="hl-table">
                            <thead>
                                <tr>
                                    <th>Book Title</th>
                                    <th>Author</th>
                                    <th>Borrowed</th>
                                    <th>Due Date</th>
                                    <th>Days Left</th>
                                    <th>Status</th>
                                    <th>Action</th>
                                </tr>
                            </thead>

                            <tbody>
                                {activeBorrowings.map((item) => {
                                    const days = getDaysRemaining(
                                        item.due_date
                                    );
                                    const status = getStatus(item);

                                    return (
                                        <tr key={item.borrowing_id}>
                                            <td className="hl-table-book">
                                                {item.title || "Untitled"}
                                            </td>

                                            <td>
                                                {item.author || "-"}
                                            </td>

                                            <td>
                                                {formatDate(item.borrowed_date)}
                                            </td>

                                            <td>
                                                {formatDate(item.due_date)}
                                            </td>

                                            <td>
                                                {days < 0
                                                    ? `${Math.abs(days)} days overdue`
                                                    : `${days} days`}
                                            </td>

                                            <td>
                                                <span
                                                    className={`hl-status ${status.className}`}
                                                >
                                                    {status.label}
                                                </span>
                                            </td>

                                            <td>
                                                <button
                                                    className="hl-button hl-button-outline hl-return-button"
                                                    onClick={() => returnBook(item)}
                                                >
                                                    Return
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </section>

            <section className="hl-section">
                <div className="hl-section-heading">
                    <div>
                        <h2>Borrowing History</h2>
                        <p>Previously returned books.</p>
                    </div>
                </div>

                {returnedBooks.length === 0 ? (
                    <div className="hl-empty-state">
                        No returned books yet.
                    </div>
                ) : (
                    <div className="hl-table-wrap">
                        <table className="hl-table">
                            <thead>
                                <tr>
                                    <th>Book</th>
                                    <th>Borrowed Date</th>
                                    <th>Returned Date</th>
                                    <th>Status</th>
                                </tr>
                            </thead>

                            <tbody>
                                {returnedBooks.map((item) => (
                                    <tr key={item.borrowing_id}>
                                        <td className="hl-table-book">
                                            {item.title || "Untitled"}
                                        </td>
                                        <td>
                                            {formatDate(item.borrowed_date)}
                                        </td>
                                        <td>
                                            {formatDate(item.returned_date)}
                                        </td>
                                        <td>
                                            <span className="hl-status returned">
                                                Returned
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </section>
        </>
    );

    // ------------------------------------
    // SAVED BOOKS PAGE
    // ------------------------------------

    const renderSavedBooks = () => (
        <>
            <div className="hl-page-heading">
                <div>
                    <p className="hl-eyebrow">
                        PERSONAL COLLECTION
                    </p>
                    <h1>Saved Books</h1>
                    <p className="hl-muted">
                        Your bookmarked books.
                    </p>
                </div>
            </div>

            <section className="hl-section">
                {savedBooks.length === 0 ? (
                    <div className="hl-empty-state">
                        <strong>No saved books</strong>
                        <p>
                            Save books from the catalogue to see
                            them here.
                        </p>
                        <button
                            className="hl-button hl-button-primary"
                            onClick={() =>
                                setActivePage("Book Catalogue")
                            }
                        >
                            Explore Catalogue
                        </button>
                    </div>
                ) : (
                    <div className="hl-book-grid">
                        {savedBooks.map((book) => (
                            <BookCard
                                key={book.id}
                                book={book}
                                wishlist={wishlist}
                                toggleWishlist={toggleWishlist}
                                onDetails={setSelectedBook}
                            />
                        ))}
                    </div>
                )}
            </section>
        </>
    );

    // ------------------------------------
    // NOTIFICATIONS PAGE
    // ------------------------------------

    const renderNotifications = () => (
        <>
            <div className="hl-page-heading">
                <div>
                    <p className="hl-eyebrow">
                        ACCOUNT UPDATES
                    </p>
                    <h1>Notifications</h1>
                    <p className="hl-muted">
                        Important updates about your borrowings.
                    </p>
                </div>
            </div>

            <section className="hl-section">
                <div className="hl-section-heading">
                    <div>
                        <h2>Due Date Reminders</h2>
                        <p>Upcoming and overdue books.</p>
                    </div>
                </div>

                <div className="hl-notification-list">
                    {overdueBooks.map((item) => (
                        <div
                            className="hl-notification hl-danger"
                            key={item.borrowing_id}
                        >
                            <strong>Overdue: {item.title}</strong>
                            <p>
                                This book is overdue by{" "}
                                {Math.abs(
                                    getDaysRemaining(item.due_date)
                                )}{" "}
                                day(s). Please return it.
                            </p>
                        </div>
                    ))}

                    {upcomingBooks.map((item) => (
                        <div
                            className="hl-notification"
                            key={item.borrowing_id}
                        >
                            <strong>Due date approaching: {item.title}</strong>
                            <p>
                                Due on {formatDate(item.due_date)}.
                                {getDaysRemaining(item.due_date) === 0
                                    ? " Due today."
                                    : ` ${getDaysRemaining(item.due_date)} day(s) remaining.`}
                            </p>
                        </div>
                    ))}

                    {overdueBooks.length === 0 &&
                        upcomingBooks.length === 0 && (
                            <div className="hl-empty-state">
                                <strong>No pending notifications</strong>
                                <p>
                                    You are all caught up with your
                                    borrowing schedule.
                                </p>
                            </div>
                        )}
                </div>
            </section>

            <section className="hl-section">
                <div className="hl-section-heading">
                    <div>
                        <h2>Borrowing Summary</h2>
                        <p>Your account activity.</p>
                    </div>
                </div>

                <div className="hl-stat-grid">
                    <div className="hl-stat-card">
                        <span className="hl-stat-label">
                            Active Books
                        </span>
                        <strong>{activeBorrowings.length}</strong>
                    </div>

                    <div className="hl-stat-card">
                        <span className="hl-stat-label">
                            Returned Books
                        </span>
                        <strong>{returnedBooks.length}</strong>
                    </div>

                    <div className="hl-stat-card">
                        <span className="hl-stat-label">
                            Overdue Books
                        </span>
                        <strong>{overdueBooks.length}</strong>
                    </div>

                    <div className="hl-stat-card">
                        <span className="hl-stat-label">
                            Estimated Fine
                        </span>
                        <strong>₹{estimatedFine}</strong>
                    </div>
                </div>
            </section>
        </>
    );

    // ------------------------------------
    // PROFILE PAGE
    // ------------------------------------

    const renderProfile = () => (
        <>
            <div className="hl-page-heading">
                <div>
                    <p className="hl-eyebrow">
                        ACCOUNT INFORMATION
                    </p>
                    <h1>My Profile</h1>
                    <p className="hl-muted">
                        View your registered member details.
                    </p>
                </div>
            </div>

            <section className="hl-section">
                <div className="hl-profile-summary">
                    <div className="hl-avatar hl-avatar-large">
                        {initials}
                    </div>

                    <div>
                        <strong>{user.name || "Member"}</strong>
                        <small>Library Member</small>
                    </div>
                </div>

                <div className="hl-table-wrap">
                    <table className="hl-table">
                        <tbody>
                            <tr>
                                <th>Name</th>
                                <td>{user.name || "-"}</td>
                            </tr>

                            <tr>
                                <th>Employee ID</th>
                                <td>{user.employee_id || "-"}</td>
                            </tr>

                            <tr>
                                <th>Email</th>
                                <td>{user.email || "-"}</td>
                            </tr>

                            <tr>
                                <th>Role</th>
                                <td>{user.role || "User"}</td>
                            </tr>

                            <tr>
                                <th>Active Borrowings</th>
                                <td>{activeBorrowings.length} / 5</td>
                            </tr>

                            <tr>
                                <th>Saved Books</th>
                                <td>{wishlist.length}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </section>
        </>
    );

    // ------------------------------------
    // BOOK CARD COMPONENT
    // ------------------------------------

    function BookCard({
        book,
        wishlist,
        toggleWishlist,
        onDetails
    }) {
        const isSaved = wishlist.includes(book.id);
        const isAvailable =
            Number(book.available_copies) > 0;

        return (
            <div className="hl-book-card">
                <div className="hl-book-topline">
                    <span className="hl-category">
                        {book.category || "General"}
                    </span>

                    <button
                        className={`hl-save-button ${isSaved ? "is-saved" : ""
                            }`}
                        onClick={() => toggleWishlist(book.id)}
                    >
                        {isSaved ? "Saved" : "Save book"}
                    </button>
                </div>

                <div className="hl-book-monogram">
                    {book.title?.charAt(0)?.toUpperCase() || "B"}
                </div>

                <h3>{book.title}</h3>

                <p className="hl-book-author">
                    By {book.author || "Unknown Author"}
                </p>

                <div className="hl-book-stock">
                    <span>Available copies</span>

                    <span
                        className={
                            isAvailable
                                ? "hl-stock-available"
                                : "hl-stock-unavailable"
                        }
                    >
                        {book.available_copies ?? 0}
                    </span>
                </div>

                <div className="hl-book-actions">
                    <button
                        className="hl-button hl-button-outline"
                        onClick={() => onDetails(book)}
                    >
                        Details
                    </button>

                    <button
                        className="hl-button hl-button-primary"
                        disabled={!isAvailable}
                        onClick={() => onDetails(book)}
                    >
                        {isAvailable ? "View / Borrow" : "Unavailable"}
                    </button>
                </div>
            </div>
        );
    }

    // ------------------------------------
    // MAIN RENDER
    // ------------------------------------

    const pageContent = {
        Overview: renderOverview,
        "Book Catalogue": renderCatalogue,
        "My Borrowings": renderBorrowings,
        "Saved Books": renderSavedBooks,
        Notifications: renderNotifications,
        "My Profile": renderProfile
    };

    return (
        <div className="hexalibrary-admin hl-user-dashboard d-flex min-vh-100">

            {/* SIDEBAR */}

            <aside
                className="d-flex flex-column p-3"
                style={{
                    width: "250px",
                    minWidth: "250px",
                    minHeight: "100vh"
                }}
            >
                <div className="mb-4 px-2 pt-2">
                    <h4 className="fw-bold mb-1">
                        Hexa<span style={{ color: "#2457c5" }}>
                            Library
                        </span>
                    </h4>

                    <small className="text-secondary">
                        Member Portal
                    </small>
                </div>

                <div className="px-2 mb-2">
                    <small
                        className="text-secondary fw-bold"
                        style={{ fontSize: "10px", letterSpacing: "1px" }}
                    >
                        MAIN MENU
                    </small>
                </div>

                <nav className="d-flex flex-column gap-2">
                    {navigation.map((item) => (
                        <button
                            key={item.name}
                            className={`btn text-start d-flex align-items-center gap-3 ${activePage === item.name
                                    ? "btn-primary"
                                    : "btn-light"
                                }`}
                            onClick={() => {
                                setActivePage(item.name);
                                setSelectedBook(null);
                            }}
                        >
                            <span className="hl-nav-icon">
                                {item.code}
                            </span>

                            <span>{item.name}</span>
                        </button>
                    ))}
                </nav>

                <div className="mt-auto pt-4">
                    <div
                        className="border rounded-3 p-3 mb-3"
                        style={{ borderColor: "#e3eaf4" }}
                    >
                        <div className="d-flex align-items-center gap-2">
                            <div className="hl-avatar">
                                {initials}
                            </div>

                            <div style={{ minWidth: 0 }}>
                                <div className="fw-semibold text-truncate">
                                    {user.name || "Member"}
                                </div>
                                <small className="text-secondary">
                                    {user.employee_id || "Library User"}
                                </small>
                            </div>
                        </div>
                    </div>

                    <button
                        className="btn btn-light text-danger w-100 text-start"
                        onClick={handleLogout}
                    >
                        Logout
                    </button>
                </div>
            </aside>

            {/* MAIN CONTENT */}

            <main className="flex-grow-1 p-4">
                <header className="d-flex justify-content-between align-items-center mb-4 pb-3 border-bottom">
                    <div>
                        <small className="text-secondary">
                            HEXALIBRARY / MEMBER
                        </small>

                        <h5 className="fw-bold mb-0 mt-1">
                            {activePage}
                        </h5>
                    </div>

                    <div className="d-flex align-items-center gap-3">
                        <button
                            className="btn btn-light border"
                            onClick={fetchDashboardData}
                            title="Refresh dashboard"
                        >
                            Refresh
                        </button>

                        <div className="text-end">
                            <div className="fw-semibold">
                                {user.name || "Member"}
                            </div>

                            <small className="text-secondary">
                                {user.role || "User"}
                            </small>
                        </div>

                        <div className="hl-avatar">
                            {initials}
                        </div>
                    </div>
                </header>

                {loading && (
                    <div className="alert alert-info">
                        Loading dashboard data...
                    </div>
                )}

                {error && (
                    <div className="alert alert-danger">
                        {error}
                    </div>
                )}

                {pageContent[activePage]()}
            </main>

            {/* BOOK DETAILS MODAL */}

            {selectedBook && (
                <div
                    className="hl-modal-backdrop"
                    onMouseDown={(e) => {
                        if (e.target === e.currentTarget) {
                            setSelectedBook(null);
                        }
                    }}
                >
                    <div className="hl-modal">
                        <div className="hl-modal-header">
                            <h2>Book Details</h2>

                            <button
                                className="hl-modal-close"
                                onClick={() => setSelectedBook(null)}
                            >
                                ×
                            </button>
                        </div>

                        <div className="hl-modal-body">
                            <span className="hl-category">
                                {selectedBook.category || "General"}
                            </span>

                            <h3>{selectedBook.title}</h3>

                            <p>
                                By {selectedBook.author || "Unknown Author"}
                            </p>

                            <dl>
                                <div>
                                    <dt>Book ID</dt>
                                    <dd>{selectedBook.id}</dd>
                                </div>

                                <div>
                                    <dt>Category</dt>
                                    <dd>
                                        {selectedBook.category || "-"}
                                    </dd>
                                </div>

                                <div>
                                    <dt>Total Copies</dt>
                                    <dd>
                                        {selectedBook.total_copies ?? "-"}
                                    </dd>
                                </div>

                                <div>
                                    <dt>Available Copies</dt>
                                    <dd>
                                        {selectedBook.available_copies ?? 0}
                                    </dd>
                                </div>
                            </dl>

                            <p className="hl-footnote">
                                Borrowing period: 10 days.
                                Maximum borrowing limit: 5 books.
                            </p>
                        </div>

                        <div className="hl-modal-footer">
                            <button
                                className="hl-button hl-button-outline"
                                onClick={() => setSelectedBook(null)}
                            >
                                Close
                            </button>

                            <button
                                className="hl-button hl-button-primary"
                                disabled={
                                    Number(selectedBook.available_copies) <= 0
                                }
                                onClick={() => borrowBook(selectedBook)}
                            >
                                Borrow Book
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
