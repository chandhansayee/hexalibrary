from sqlalchemy import PrimaryKeyConstraint
import datetime
from sqlalchemy.orm import Session, DeclarativeBase, Mapped, mapped_column
from sqlalchemy import create_engine, select, Date, Time, String, Integer,ForeignKey
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from fastapi import FastAPI, HTTPException
from pwdlib import PasswordHash

password_hash = PasswordHash.recommended()


def hash_password(password: str):
    return password_hash.hash(password)


def verify_password(password: str, hashed_password: str):
    return password_hash.verify(password, hashed_password)

DATABASE_URL = "postgresql://postgres:Chandhan.1311@localhost:5432/library_management_system"

engine = create_engine(DATABASE_URL)
session = Session(engine)
Base=DeclarativeBase()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
class Base(DeclarativeBase):
    pass


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True)
    employee_id: Mapped[str] = mapped_column()
    name: Mapped[str] = mapped_column()
    email: Mapped[str] = mapped_column()
    password: Mapped[str|None] = mapped_column(nullable=True)
    role: Mapped[str] = mapped_column()

class Book(Base):
    __tablename__ = "books"

    id: Mapped[int] = mapped_column(primary_key=True)
    title: Mapped[str] = mapped_column()
    author: Mapped[str] = mapped_column()
    category: Mapped[str] = mapped_column()
    total_copies: Mapped[int] = mapped_column()
    available_copies: Mapped[int] = mapped_column()

class Borrowing(Base):
    __tablename__ = "borrowings"

    id: Mapped[int] = mapped_column(primary_key=True)

    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"))

    book_id: Mapped[int] = mapped_column(ForeignKey("books.id"))

    borrowed_date: Mapped[datetime.date] = mapped_column(Date)
    due_date: Mapped[datetime.date] = mapped_column(Date)
    returned_date: Mapped[datetime.date | None] = mapped_column(Date,nullable=True)

    status: Mapped[str] = mapped_column()

class Fine(Base):
    __tablename__ = "fines"

    id: Mapped[int] = mapped_column(primary_key=True)

    borrowing_id: Mapped[int] = mapped_column(ForeignKey("borrowings.id"))

    amount: Mapped[int] = mapped_column()
    status: Mapped[str] = mapped_column()
    created_date: Mapped[datetime.date] = mapped_column(Date)
    paid_date: Mapped[datetime.date | None] = mapped_column(Date,nullable=True)

Base.metadata.create_all(engine)


class UserCreate(BaseModel):
    employee_id: str
    name: str
    email: str
    password: str

class LoginRequest(BaseModel):
    email: str
    password: str

class BookCreate(BaseModel):
    title: str
    author: str
    category: str
    total_copies: int

class BorrowRequest(BaseModel):
    user_id: int
    book_id: int
class AdminUserCreate(BaseModel):
    employee_id: str
    name: str
    email: str
    password: str
    role: str
@app.get("/")
def home():
    return {
        "message": "Library Management API"
    }

@app.get("/admin/borrowings")
def get_all_borrowings():

    query = select(Borrowing)
    result = session.execute(query)
    borrowings = result.scalars().all()

    data = []

    for borrowing in borrowings:

        user_query = select(User).where(
            User.id == borrowing.user_id
        )
        user = session.execute(
            user_query
        ).scalar_one_or_none()

        book_query = select(Book).where(
            Book.id == borrowing.book_id
        )
        book = session.execute(
            book_query
        ).scalar_one_or_none()

        if user is None or book is None:
            continue

        today = datetime.date.today()

        # Calculate days left and fine
        if borrowing.status == "returned":

            status = "Returned"
            days_left = None

            if borrowing.returned_date:
                overdue_days = (
                    borrowing.returned_date - borrowing.due_date
                ).days
                fine = max(0, overdue_days) * 5
            else:
                fine = 0

        else:

            days_left = (
                borrowing.due_date - today
            ).days

            if days_left < 0:
                status = "Overdue"
                fine = abs(days_left) * 5
            else:
                status = "Borrowed"
                fine = 0

        data.append({
            "borrowing_id": borrowing.id,
            "user_name": user.name,
            "email": user.email,
            "employee_id": user.employee_id,
            "book_title": book.title,
            "author": book.author,
            "borrowed_date": borrowing.borrowed_date,
            "due_date": borrowing.due_date,
            "returned_date": borrowing.returned_date,
            "days_left": days_left,
            "status": status,
            "fine": fine
        })

    return data

@app.post("/register")
def register(user: UserCreate):

    query = select(User).where(
        User.employee_id == user.employee_id
    )

    result = session.execute(query)
    existing_employee = result.scalar_one_or_none()

    if existing_employee:
        raise HTTPException(
            status_code=400,
            detail="Employee ID already exists"
        )

    query = select(User).where(
        User.email == user.email
    )

    result = session.execute(query)
    existing_email = result.scalar_one_or_none()

    if existing_email:
        raise HTTPException(
            status_code=400,
            detail="Email already registered"
        )

    hashed_password = password_hash.hash(user.password)

    new_user = User(
        employee_id=user.employee_id,
        name=user.name,
        email=user.email,
        password=hash_password(user.password),
        role="user"
    )

    session.add(new_user)
    session.commit()

    return {
        "message": "Registration successful! Please login."
    }
@app.post("/admin/users")
def admin_add_user(user: AdminUserCreate):

    if user.role not in ["admin", "user"]:
        raise HTTPException(
            status_code=400,
            detail="Invalid role"
        )

    existing_email = session.execute(
        select(User).where(User.email == user.email)
    ).scalar_one_or_none()

    if existing_email:
        raise HTTPException(
            status_code=400,
            detail="Email already exists"
        )

    existing_employee = session.execute(
        select(User).where(
            User.employee_id == user.employee_id
        )
    ).scalar_one_or_none()

    if existing_employee:
        raise HTTPException(
            status_code=400,
            detail="Employee ID already exists"
        )

    new_user = User(
        employee_id=user.employee_id,
        name=user.name,
        email=user.email,
        password=hash_password(user.password),
        role=user.role
    )

    session.add(new_user)
    session.commit()
    session.refresh(new_user)

    return {
        "message": "User created successfully",
        "id": new_user.id,
        "name": new_user.name,
        "email": new_user.email,
        "role": new_user.role
    }

@app.post("/login")
def login(user: LoginRequest):

    query = select(User).where(
        User.email == user.email
    )

    result = session.execute(query)
    existing_user = result.scalar_one_or_none()

    if existing_user is None:
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )

    if not existing_user.password:
        raise HTTPException(
            status_code=401,
            detail="Password needs to be reset"
        )

    if not verify_password(
        user.password,
        existing_user.password
    ):
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )

    return {
        "id": existing_user.id,
        "name": existing_user.name,
        "email": existing_user.email,
        "employee_id": existing_user.employee_id,
        "role": existing_user.role,
        "message": "Login successful"
    }


@app.get("/books")
def get_books():

    query = select(Book)
    result = session.execute(query)
    books = result.scalars().all()

    return books

@app.put("/admin/return/{borrowing_id}")
def admin_return_book(borrowing_id: int):

    borrowing = session.get(Borrowing, borrowing_id)

    if borrowing is None:
        raise HTTPException(
            status_code=404,
            detail="Borrowing record not found"
        )

    if borrowing.status == "returned":
        raise HTTPException(
            status_code=400,
            detail="Book has already been returned"
        )

    book = session.get(Book, borrowing.book_id)

    if book is None:
        raise HTTPException(
            status_code=404,
            detail="Book not found"
        )

    borrowing.status = "returned"
    borrowing.returned_date = datetime.date.today()
    book.available_copies += 1

    session.commit()

    return {
        "message": "Book marked as returned successfully"
    }


@app.post("/books")
def add_book(book: BookCreate):

    new_book = Book(
        title=book.title,
        author=book.author,
        category=book.category,
        total_copies=book.total_copies,
        available_copies=book.total_copies
    )

    session.add(new_book)
    session.commit()

    return {
        "message": "Book added successfully"
    }


@app.post("/borrow")
def borrow_book(request: BorrowRequest):

    query = select(Book).where(Book.id == request.book_id)
    result = session.execute(query)
    book = result.scalar_one_or_none()

    if not book:
        return {
            "message": "Book not found"
        }

    if book.available_copies <= 0:
        return {
            "message": "Book is not available"
        }

    query = select(Borrowing).where(
        (Borrowing.user_id == request.user_id) &
        (Borrowing.status == "borrowed")
    )

    result = session.execute(query)
    borrowed_books = result.scalars().all()

    if len(borrowed_books) >= 3:
        return {
            "message": "Maximum 3 books can be borrowed"
        }

    today = datetime.date.today()

    due_date = today + datetime.timedelta(days=14)

    new_borrowing = Borrowing(
        user_id=request.user_id,
        book_id=request.book_id,
        borrowed_date=today,
        due_date=due_date,
        status="borrowed"
    )

    book.available_copies -= 1

    session.add(new_borrowing)
    session.commit()

    return {
        "message": "Book borrowed successfully",
        "due_date": due_date
    }
    existing_borrowing = session.query(Borrowing).filter(
        Borrowing.user_id == request.user_id,
        Borrowing.book_id == request.book_id,
        Borrowing.status != "returned"
    ).first()

    if existing_borrowing:
        return {
            "message": "You have already borrowed this book. Please return it first."
        }
    


@app.get("/borrowings/{user_id}")
def get_borrowings(user_id: int):
    borrowings = session.query(Borrowing, Book).join(
        Book,
        Borrowing.book_id == Book.id
    ).filter(
        Borrowing.user_id == user_id
    ).all()

    result = []

    for borrowing, book in borrowings:
        result.append({
            "borrowing_id": borrowing.id,
            "book_id": borrowing.book_id,
            "title": book.title,
            "author": book.author,
            "borrowed_date": borrowing.borrowed_date,
            "due_date": borrowing.due_date,
            "returned_date": borrowing.returned_date,
            "status": borrowing.status
        })

    return result


@app.put("/return/{borrowing_id}")
def return_book(borrowing_id: int):

    query = select(Borrowing).where(
        Borrowing.id == borrowing_id
    )

    result = session.execute(query)

    borrowing = result.scalar_one_or_none()

    if not borrowing:
        return {
            "message": "Borrowing record not found"
        }

    if borrowing.status == "returned":
        return {
            "message": "Book already returned"
        }

    query = select(Book).where(
        Book.id == borrowing.book_id
    )

    result = session.execute(query)

    book = result.scalar_one_or_none()

    today = datetime.date.today()

    borrowing.returned_date = today
    borrowing.status = "returned"

    book.available_copies += 1

    if today > borrowing.due_date:

        overdue_days = (
            today - borrowing.due_date
        ).days

        fine_amount = overdue_days * 10

        fine = Fine(
            borrowing_id=borrowing.id,
            amount=fine_amount,
            status="unpaid",
            created_date=today
        )

        session.add(fine)

    session.commit()

    return {
        "message": "Book returned successfully"
    }


@app.get("/fines/{user_id}")
def get_fines(user_id: int):

    query = select(Borrowing).where(
        Borrowing.user_id == user_id
    )

    result = session.execute(query)

    borrowings = result.scalars().all()

    borrowing_ids = [
        borrowing.id
        for borrowing in borrowings
    ]

    if not borrowing_ids:
        return []

    query = select(Fine).where(
        Fine.borrowing_id.in_(borrowing_ids)
    )

    result = session.execute(query)

    fines = result.scalars().all()

    return fines

@app.get("/users")
def get_users():

    query = select(User)

    result = session.execute(query)

    users = result.scalars().all()

    return users