import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function AdminDashboard() {

    const navigate = useNavigate();

    const [books, setBooks] = useState([]);
    const [users, setUsers] = useState([]);

    const [showAddBook, setShowAddBook] = useState(false);

    const [title, setTitle] = useState("");
    const [author, setAuthor] = useState("");
    const [category, setCategory] = useState("");
    const [copies, setCopies] = useState(1);
    const [borrowings, setBorrowings] = useState([]);
    const [activeSection, setActiveSection] = useState("Dashboard");
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [showAddUser, setShowAddUser] = useState(false);

    const [newUser, setNewUser] = useState({
        employee_id: "",
        name: "",
        email: "",
        password: "",
        role: "user"
    });

    const getBooks = async () => {

        const response = await fetch(
            "http://127.0.0.1:8000/books"
        );

        const data = await response.json();

        setBooks(data);
    };
    const getBorrowings = async () => {

        const response = await fetch(
            "http://127.0.0.1:8000/admin/borrowings"
        );

        const data = await response.json();

        setBorrowings(data);
    };

    const getUsers = async () => {

        const response = await fetch(
            "http://127.0.0.1:8000/users"
        );

        const data = await response.json();

        setUsers(data);
    };

    useEffect(() => {
        getBooks();
        getUsers();
        getBorrowings();
    }, []);

    const handleLogout = () => {

        localStorage.removeItem("user");

        navigate("/login");
    };

    const handleAddBook = async (e) => {

        e.preventDefault();

        if (!title || !author || !category || !copies) {

            alert("Please fill all fields");

            return;
        }

        const response = await fetch(
            "http://127.0.0.1:8000/books",
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    title: title,
                    author: author,
                    category: category,
                    total_copies: Number(copies)
                })
            }
        );

        const data = await response.json();

        alert(data.message);

        getBooks();

        setTitle("");
        setAuthor("");
        setCategory("");
        setCopies(1);

        setShowAddBook(false);
    };

    const totalCopies = books.reduce(
        (sum, book) => sum + book.total_copies,
        0
    );

    const availableCopies = books.reduce(
        (sum, book) => sum + book.available_copies,
        0
    );

    const borrowedCopies =
        totalCopies - availableCopies;
    const handleAddUser = async (e) => {
        e.preventDefault();

        const response = await fetch(
            "http://127.0.0.1:8000/admin/users",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(newUser)
            }
        );

        const data = await response.json();

        if (!response.ok) {
            alert(data.detail || "Failed to create user");
            return;
        }

        alert(data.message);

        setNewUser({
            employee_id: "",
            name: "",
            email: "",
            password: "",
            role: "user"
        });

        setShowAddUser(false);
        getUsers();
    };

    const handleAdminReturn = async (borrowingId) => {
        const confirmed = window.confirm(
            "Are you sure you want to mark this book as returned?"
        );

        if (!confirmed) return;

        const response = await fetch(
            `http://127.0.0.1:8000/admin/return/${borrowingId}`,
            {
                method: "PUT"
            }
        );

        const data = await response.json();

        if (!response.ok) {
            alert(data.detail || "Unable to update return status");
            return;
        }

        alert(data.message);

        getBorrowings();
        getBooks();
    };

    return (
        <div className="hexalibrary-admin d-flex min-vh-100">
            {/* Sidebar */}
            <aside
                className="bg-white border-end d-flex flex-column p-3"
                style={{
                    width: sidebarOpen ? "250px" : "75px",
                    minHeight: "100vh",
                    height: "100vh",
                    position: "sticky",
                    top: 0,
                    flexShrink: 0,
                    transition: "width 0.2s ease",
                    overflowY: "auto"
                }}
            >
                <div className="d-flex align-items-center justify-content-between mb-4">
                    {sidebarOpen && (
                        <h4
                            className="fw-bold mb-0"
                            style={{ cursor: "pointer" }}
                            onClick={() => setActiveSection("Dashboard")}
                        >
                            Hexa<span className="text-primary">Library</span>
                        </h4>
                    )}

                    <button
                        className="btn btn-light"
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                    >
                        ☰
                    </button>
                </div>

                {[
                    { name: "Dashboard", icon: "DB" },
                    { name: "Books", icon: "BK" },
                    { name: "Users", icon: "US" },
                    { name: "Borrowings", icon: "BR" },
                    { name: "Fines", icon: "FN" }
                ].map((item) => (
                    <button
                        key={item.name}
                        className={`btn text-start mb-2 d-flex align-items-center gap-3 ${activeSection === item.name
                            ? "btn-primary"
                            : "btn-light"
                            }`}
                        style={{ whiteSpace: "nowrap", overflow: "hidden" }}
                        onClick={() => setActiveSection(item.name)}
                        title={item.name}
                    >
                        <span className="hl-nav-icon">{item.icon}</span>
                        {sidebarOpen && item.name}
                    </button>
                ))}

                <div className="mt-auto pt-4">
                    <button
                        className="btn btn-outline-danger w-100"
                        onClick={handleLogout}
                    >
                        {sidebarOpen ? "Logout" : "↪"}
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-grow-1 p-3 p-md-4" style={{ minWidth: 0 }}>

                {/* Page Header */}
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <div>
                        <h2 className="fw-bold mb-1">
                            {activeSection === "Dashboard"
                                ? "Good afternoon, Admin"
                                : activeSection}
                        </h2>

                        <p className="text-secondary mb-0">
                            {activeSection === "Dashboard"
                                ? "Here's what's happening in your library today."
                                : `Manage library ${activeSection.toLowerCase()}`}
                        </p>
                    </div>

                    {activeSection === "Books" && (
                        <button
                            className="btn btn-primary"
                            onClick={() => setShowAddBook(true)}
                        >
                            + Add Book
                        </button>
                    )}
                </div>

                {/* Dashboard Overview */}
                {activeSection === "Dashboard" && (
                    <>
                        <div className="row g-4 mb-4">

                            {/* Total Book Copies */}
                            <div className="col-sm-6 col-xl-3">
                                <div className="bg-white rounded-4 shadow-sm p-4 h-100">
                                    <div className="d-flex justify-content-between align-items-center mb-3">
                                        <span className="text-secondary">Total Book Copies</span>
                                        <span className="hl-stat-icon">BK</span>
                                    </div>

                                    <h2 className="fw-bold mb-1">
                                        {totalCopies}
                                    </h2>

                                    <small className="text-secondary">
                                        Across {books.length} book titles
                                    </small>
                                </div>
                            </div>

                            {/* Registered Members */}
                            <div className="col-sm-6 col-xl-3">
                                <div className="bg-white rounded-4 shadow-sm p-4 h-100">
                                    <div className="d-flex justify-content-between align-items-center mb-3">
                                        <span className="text-secondary">Registered Members</span>
                                        <span className="hl-stat-icon">US</span>
                                    </div>

                                    <h2 className="fw-bold text-primary mb-1">
                                        {users.filter(
                                            (user) => user.role !== "admin"
                                        ).length}
                                    </h2>

                                    <small className="text-secondary">
                                        Library members
                                    </small>
                                </div>
                            </div>

                            {/* Overdue Borrowings */}
                            <div className="col-sm-6 col-xl-3">
                                <div className="bg-white rounded-4 shadow-sm p-4 h-100">
                                    <div className="d-flex justify-content-between align-items-center mb-3">
                                        <span className="text-secondary">Overdue Borrowings</span>
                                        <span className="hl-stat-icon">OD</span>
                                    </div>

                                    <h2 className="fw-bold text-danger mb-1">
                                        {borrowings.filter(
                                            (borrowing) =>
                                                borrowing.status === "Overdue"
                                        ).length}
                                    </h2>

                                    <small className="text-secondary">
                                        Require attention
                                    </small>
                                </div>
                            </div>

                            {/* Outstanding Fines */}
                            <div className="col-sm-6 col-xl-3">
                                <div className="bg-white rounded-4 shadow-sm p-4 h-100">
                                    <div className="d-flex justify-content-between align-items-center mb-3">
                                        <span className="text-secondary">Outstanding Fines</span>
                                        <span className="hl-stat-icon">₹</span>
                                    </div>

                                    <h2 className="fw-bold text-warning mb-1">
                                        ₹{borrowings.reduce(
                                            (sum, borrowing) =>
                                                sum + Number(borrowing.fine || 0),
                                            0
                                        )}
                                    </h2>

                                    <small className="text-secondary">
                                        Calculated fines
                                    </small>
                                </div>
                            </div>

                        </div>

                        {/* Recent Activity */}
                        <div className="bg-white rounded-4 shadow-sm mb-4">
                            <div className="p-4 border-bottom d-flex justify-content-between align-items-center">
                                <div>
                                    <h5 className="fw-bold mb-1">Recent Library Activity</h5>
                                    <p className="text-secondary mb-0">
                                        Latest borrowing and return records
                                    </p>
                                </div>

                                <button
                                    className="btn btn-outline-primary btn-sm"
                                    onClick={() => setActiveSection("Borrowings")}
                                >
                                    View All
                                </button>
                            </div>

                            <div className="table-responsive">
                                <table className="table table-hover mb-0">
                                    <thead className="table-light">
                                        <tr>
                                            <th className="px-4 py-3">Member</th>
                                            <th className="py-3">Book</th>
                                            <th className="py-3">Borrowed Date</th>
                                            <th className="py-3">Due Date</th>
                                            <th className="py-3">Status</th>
                                            <th className="py-3">Fine</th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {[...borrowings]
                                            .sort((a, b) =>
                                                String(b.borrowed_date || "").localeCompare(
                                                    String(a.borrowed_date || "")
                                                )
                                            )
                                            .slice(0, 5)
                                            .map((borrowing) => (
                                                <tr key={borrowing.borrowing_id}>
                                                    <td className="px-4 py-3">
                                                        <div className="fw-semibold">
                                                            {borrowing.user_name}
                                                        </div>
                                                        <small className="text-secondary">
                                                            {borrowing.employee_id}
                                                        </small>
                                                    </td>

                                                    <td className="py-3">
                                                        {borrowing.book_title}
                                                    </td>

                                                    <td className="py-3">
                                                        {borrowing.borrowed_date}
                                                    </td>

                                                    <td className="py-3">
                                                        {borrowing.due_date}
                                                    </td>

                                                    <td className="py-3">
                                                        <span
                                                            className={`badge ${borrowing.status === "Returned"
                                                                ? "bg-secondary"
                                                                : borrowing.status === "Overdue"
                                                                    ? "bg-danger"
                                                                    : "bg-success"
                                                                }`}
                                                        >
                                                            {borrowing.status}
                                                        </span>
                                                    </td>
                                                    <td className="py-3 fw-semibold">₹{borrowing.fine || 0}</td>
                                                </tr>
                                            ))}

                                        {borrowings.length === 0 && (
                                            <tr>
                                                <td
                                                    colSpan="6"
                                                    className="text-center text-secondary py-5"
                                                >
                                                    No library activity available yet
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Overdue Alerts */}
                        <div className="bg-white rounded-4 shadow-sm">
                            <div className="p-4 border-bottom d-flex justify-content-between align-items-center">
                                <div>
                                    <h5 className="fw-bold mb-1">Overdue Alerts</h5>
                                    <p className="text-secondary mb-0">
                                        Borrowings that need attention
                                    </p>
                                </div>

                                <span className="badge bg-danger">
                                    {borrowings.filter(
                                        (borrowing) =>
                                            borrowing.status === "Overdue"
                                    ).length} overdue
                                </span>
                            </div>

                            <div className="p-4">
                                {borrowings
                                    .filter(
                                        (borrowing) =>
                                            borrowing.status === "Overdue"
                                    )
                                    .slice(0, 5)
                                    .map((borrowing) => (
                                        <div
                                            key={borrowing.borrowing_id}
                                            className="d-flex justify-content-between align-items-center border-bottom py-3 gap-3"
                                        >
                                            <div>
                                                <div className="fw-semibold">
                                                    {borrowing.book_title}
                                                </div>
                                                <small className="text-secondary">
                                                    {borrowing.user_name} · {borrowing.employee_id}
                                                </small>
                                            </div>

                                            <div className="text-end">
                                                <div className="text-danger fw-semibold">
                                                    {Math.abs(Number(borrowing.days_left || 0))} days overdue
                                                </div>
                                                <small className="text-secondary">
                                                    Fine: ₹{borrowing.fine || 0}
                                                </small>
                                            </div>
                                        </div>
                                    ))}

                                {borrowings.filter(
                                    (borrowing) =>
                                        borrowing.status === "Overdue"
                                ).length === 0 && (
                                        <p className="text-secondary text-center py-3 mb-0">
                                            No overdue books. Your library is up to date!
                                        </p>
                                    )}
                            </div>
                        </div>
                    </>
                )}

                {/* Books Section */}
                {activeSection === "Books" && (
                    <div className="bg-white rounded-4 shadow-sm">
                        <div className="p-4 border-bottom">
                            <h4 className="fw-bold mb-0">Books Inventory</h4>
                            <p className="text-secondary mb-0 mt-1">
                                All books available in the library
                            </p>
                        </div>

                        <div className="table-responsive">
                            <table className="table table-hover mb-0">
                                <thead className="table-light">
                                    <tr>
                                        <th className="px-4 py-3">Title</th>
                                        <th className="py-3">Author</th>
                                        <th className="py-3">Category</th>
                                        <th className="py-3">Total Copies</th>
                                        <th className="py-3">Available</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {books.map((book) => (
                                        <tr key={book.id}>
                                            <td className="px-4 py-3 fw-semibold">{book.title}</td>
                                            <td className="py-3">{book.author}</td>
                                            <td className="py-3">{book.category}</td>
                                            <td className="py-3">{book.total_copies}</td>
                                            <td className="py-3">{book.available_copies}</td>
                                        </tr>
                                    ))}

                                    {books.length === 0 && (
                                        <tr>
                                            <td colSpan="5" className="text-center py-5 text-secondary">
                                                No books available
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Users Section */}
                {activeSection === "Users" && (
                    <div className="bg-white rounded-4 shadow-sm">

                        {/* Header */}
                        <div className="p-4 border-bottom d-flex justify-content-between align-items-center">
                            <div>
                                <h4 className="fw-bold mb-1">Library Users</h4>
                                <p className="text-secondary mb-0">
                                    Manage registered users and administrator accounts
                                </p>
                            </div>

                            <button
                                className="btn btn-primary"
                                onClick={() => setShowAddUser(true)}
                            >
                                + Add User
                            </button>
                        </div>

                        {/* User Statistics */}
                        <div className="row g-3 p-4">
                            <div className="col-md-4">
                                <div className="rounded-3 bg-light p-3">
                                    <small className="text-secondary">Total Accounts</small>
                                    <h4 className="fw-bold mb-0">{users.length}</h4>
                                </div>
                            </div>

                            <div className="col-md-4">
                                <div className="rounded-3 bg-light p-3">
                                    <small className="text-secondary">Administrators</small>
                                    <h4 className="fw-bold text-primary mb-0">
                                        {users.filter((user) => user.role === "admin").length}
                                    </h4>
                                </div>
                            </div>

                            <div className="col-md-4">
                                <div className="rounded-3 bg-light p-3">
                                    <small className="text-secondary">Library Members</small>
                                    <h4 className="fw-bold text-success mb-0">
                                        {users.filter((user) => user.role === "user").length}
                                    </h4>
                                </div>
                            </div>
                        </div>

                        {/* Users Table */}
                        <div className="table-responsive">
                            <table className="table table-hover align-middle mb-0">
                                <thead className="table-light">
                                    <tr>
                                        <th className="px-4 py-3">Name</th>
                                        <th className="py-3">Email</th>
                                        <th className="py-3">Employee ID</th>
                                        <th className="py-3">Role</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {users.map((user) => (
                                        <tr key={user.id}>
                                            <td className="px-4 py-3">
                                                <div className="d-flex align-items-center gap-3">
                                                    <div
                                                        className="rounded-circle bg-primary-subtle text-primary d-flex align-items-center justify-content-center fw-bold"
                                                        style={{
                                                            width: "40px",
                                                            height: "40px",
                                                            flexShrink: 0
                                                        }}
                                                    >
                                                        {user.name?.charAt(0).toUpperCase()}
                                                    </div>

                                                    <span className="fw-semibold">{user.name}</span>
                                                </div>
                                            </td>

                                            <td className="py-3">{user.email}</td>

                                            <td className="py-3">{user.employee_id}</td>

                                            <td className="py-3">
                                                <span
                                                    className={`badge rounded-pill px-3 py-2 ${user.role === "admin"
                                                        ? "bg-primary"
                                                        : "bg-success"
                                                        }`}
                                                >
                                                    {user.role === "admin" ? "Admin" : "User"}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}

                                    {users.length === 0 && (
                                        <tr>
                                            <td
                                                colSpan="4"
                                                className="text-center py-5 text-secondary"
                                            >
                                                No users registered yet.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                    </div>
                )}

                {/* Add User Modal */}
                {showAddUser && (
                    <div
                        className="modal d-block"
                        style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
                    >
                        <div className="modal-dialog modal-dialog-centered">
                            <div className="modal-content rounded-4">

                                <div className="modal-header">
                                    <div>
                                        <h5 className="modal-title fw-bold">
                                            Create New Account
                                        </h5>
                                        <small className="text-secondary">
                                            Add an administrator or library member
                                        </small>
                                    </div>

                                    <button
                                        type="button"
                                        className="btn-close"
                                        onClick={() => setShowAddUser(false)}
                                    />
                                </div>

                                <form onSubmit={handleAddUser}>
                                    <div className="modal-body">

                                        <div className="mb-3">
                                            <label className="form-label fw-semibold">
                                                Employee ID
                                            </label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                placeholder="Enter employee ID"
                                                value={newUser.employee_id}
                                                onChange={(e) =>
                                                    setNewUser({
                                                        ...newUser,
                                                        employee_id: e.target.value
                                                    })
                                                }
                                                required
                                            />
                                        </div>

                                        <div className="mb-3">
                                            <label className="form-label fw-semibold">
                                                Full Name
                                            </label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                placeholder="Enter full name"
                                                value={newUser.name}
                                                onChange={(e) =>
                                                    setNewUser({
                                                        ...newUser,
                                                        name: e.target.value
                                                    })
                                                }
                                                required
                                            />
                                        </div>

                                        <div className="mb-3">
                                            <label className="form-label fw-semibold">
                                                Email Address
                                            </label>
                                            <input
                                                type="email"
                                                className="form-control"
                                                placeholder="Enter email address"
                                                value={newUser.email}
                                                onChange={(e) =>
                                                    setNewUser({
                                                        ...newUser,
                                                        email: e.target.value
                                                    })
                                                }
                                                required
                                            />
                                        </div>

                                        <div className="mb-3">
                                            <label className="form-label fw-semibold">
                                                Password
                                            </label>
                                            <input
                                                type="password"
                                                className="form-control"
                                                placeholder="Minimum 6 characters"
                                                minLength={6}
                                                value={newUser.password}
                                                onChange={(e) =>
                                                    setNewUser({
                                                        ...newUser,
                                                        password: e.target.value
                                                    })
                                                }
                                                required
                                            />
                                        </div>

                                        <div className="mb-3">
                                            <label className="form-label fw-semibold">
                                                Account Role
                                            </label>

                                            <select
                                                className="form-select"
                                                value={newUser.role}
                                                onChange={(e) =>
                                                    setNewUser({
                                                        ...newUser,
                                                        role: e.target.value
                                                    })
                                                }
                                            >
                                                <option value="user">User — Library Member</option>
                                                <option value="admin">Admin — Administrator</option>
                                            </select>
                                        </div>

                                    </div>

                                    <div className="modal-footer">
                                        <button
                                            type="button"
                                            className="btn btn-light"
                                            onClick={() => setShowAddUser(false)}
                                        >
                                            Cancel
                                        </button>

                                        <button
                                            type="submit"
                                            className="btn btn-primary"
                                        >
                                            Create Account
                                        </button>
                                    </div>
                                </form>

                            </div>
                        </div>
                    </div>
                )}

                {/* Borrowings Section */}
                {activeSection === "Borrowings" && (
                    <div className="bg-white rounded-4 shadow-sm">
                        <div className="p-4 border-bottom">
                            <h4 className="fw-bold mb-0">Borrowing Details</h4>
                            <p className="text-secondary mb-0 mt-1">
                                Track borrowing dates, due dates and status
                            </p>
                        </div>

                        <div className="table-responsive">
                            <table className="table table-hover mb-0">
                                <thead className="table-light">
                                    <tr>
                                        <th className="px-4 py-3">Borrower</th>
                                        <th className="py-3">Employee ID</th>
                                        <th className="py-3">Book</th>
                                        <th className="py-3">Borrowed Date</th>
                                        <th className="py-3">Due Date</th>
                                        <th className="py-3">Days Left</th>
                                        <th className="py-3">Status</th>
                                        <th className="py-3">Fine</th>
                                        <th className="py-3">Action</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {borrowings.map((borrowing) => (
                                        <tr key={borrowing.borrowing_id}>
                                            <td className="px-4 py-3">
                                                <div className="fw-semibold">{borrowing.user_name}</div>
                                                <small className="text-secondary">{borrowing.email}</small>
                                            </td>
                                            <td className="py-3">{borrowing.employee_id}</td>
                                            <td className="py-3">{borrowing.book_title}</td>
                                            <td className="py-3">{borrowing.borrowed_date}</td>
                                            <td className="py-3">{borrowing.due_date}</td>
                                            <td className="py-3">
                                                {String(borrowing.status).toLowerCase() === "returned"
                                                    ? "—"
                                                    : borrowing.days_left < 0
                                                        ? `${Math.abs(borrowing.days_left)} days overdue`
                                                        : `${borrowing.days_left} days`}
                                            </td>
                                            <td className="py-3">
                                                <span className={`badge ${String(borrowing.status).toLowerCase() === "returned" ? "bg-secondary" : String(borrowing.status).toLowerCase() === "overdue" ? "bg-danger" : "bg-success"}`}>
                                                    {borrowing.status}
                                                </span>
                                            </td>
                                            <td className="py-3 fw-semibold">₹{borrowing.fine || 0}</td>
                                            <td className="py-3">
                                                {String(borrowing.status).toLowerCase() !== "returned" ? (
                                                    <button
                                                        className="btn btn-sm btn-success"
                                                        onClick={() =>
                                                            handleAdminReturn(borrowing.borrowing_id)
                                                        }
                                                    >
                                                        Mark Returned
                                                    </button>
                                                ) : (
                                                    <span className="text-secondary">Completed</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}

                                    {borrowings.length === 0 && (
                                        <tr>
                                            <td colSpan="9" className="text-center py-5 text-secondary">
                                                No borrowing records found
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Fines Section */}
                {activeSection === "Fines" && (
                    <div className="bg-white rounded-4 shadow-sm">
                        <div className="p-4 border-bottom">
                            <h4 className="fw-bold mb-0">Fine Details</h4>
                            <p className="text-secondary mb-0 mt-1">
                                Calculated fines for overdue books
                            </p>
                        </div>

                        <div className="table-responsive">
                            <table className="table table-hover mb-0">
                                <thead className="table-light">
                                    <tr>
                                        <th className="px-4 py-3">Borrower</th>
                                        <th className="py-3">Book</th>
                                        <th className="py-3">Due Date</th>
                                        <th className="py-3">Status</th>
                                        <th className="py-3">Fine Amount</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {borrowings
                                        .filter((borrowing) => Number(borrowing.fine) > 0)
                                        .map((borrowing) => (
                                            <tr key={borrowing.borrowing_id}>
                                                <td className="px-4 py-3">
                                                    <div className="fw-semibold">{borrowing.user_name}</div>
                                                    <small className="text-secondary">{borrowing.employee_id}</small>
                                                </td>
                                                <td className="py-3">{borrowing.book_title}</td>
                                                <td className="py-3">{borrowing.due_date}</td>
                                                <td className="py-3">{borrowing.status}</td>
                                                <td className="py-3 fw-semibold text-danger">
                                                    ₹{borrowing.fine}
                                                </td>
                                            </tr>
                                        ))}

                                    {borrowings.filter(
                                        (borrowing) => Number(borrowing.fine) > 0
                                    ).length === 0 && (
                                            <tr>
                                                <td colSpan="5" className="text-center py-5 text-secondary">
                                                    No fines found
                                                </td>
                                            </tr>
                                        )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Add Book Modal */}
                {showAddBook && (
                    <div
                        className="modal d-block"
                        style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
                    >
                        <div className="modal-dialog modal-dialog-centered">
                            <div className="modal-content rounded-4">

                                <div className="modal-header">
                                    <h5 className="modal-title fw-bold">Add New Book</h5>
                                    <button
                                        type="button"
                                        className="btn-close"
                                        onClick={() => setShowAddBook(false)}
                                    />
                                </div>

                                <form onSubmit={handleAddBook}>
                                    <div className="modal-body">

                                        <div className="mb-3">
                                            <label className="form-label fw-semibold">Book Title</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                placeholder="Enter book title"
                                                value={title}
                                                onChange={(e) => setTitle(e.target.value)}
                                                required
                                            />
                                        </div>

                                        <div className="mb-3">
                                            <label className="form-label fw-semibold">Author</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                placeholder="Enter author name"
                                                value={author}
                                                onChange={(e) => setAuthor(e.target.value)}
                                                required
                                            />
                                        </div>

                                        <div className="mb-3">
                                            <label className="form-label fw-semibold">Category</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                placeholder="Enter category"
                                                value={category}
                                                onChange={(e) => setCategory(e.target.value)}
                                                required
                                            />
                                        </div>

                                        <div className="mb-3">
                                            <label className="form-label fw-semibold">
                                                Number of Copies
                                            </label>
                                            <input
                                                type="number"
                                                min="1"
                                                className="form-control"
                                                value={copies}
                                                onChange={(e) => setCopies(e.target.value)}
                                                required
                                            />
                                        </div>

                                    </div>

                                    <div className="modal-footer">
                                        <button
                                            type="button"
                                            className="btn btn-secondary"
                                            onClick={() => setShowAddBook(false)}
                                        >
                                            Cancel
                                        </button>

                                        <button type="submit" className="btn btn-primary">
                                            Add Book
                                        </button>
                                    </div>
                                </form>

                            </div>
                        </div>
                    </div>
                )}

            </main>
        </div>
    );
}

export default AdminDashboard;