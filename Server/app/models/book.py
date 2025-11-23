# from pydantic import BaseModel, Field
# from typing import Optional, List
# from datetime import datetime
# from enum import Enum

# class BookStatus(str, Enum):
#     AVAILABLE = "available"
#     BORROWED = "borrowed"
#     RESERVED = "reserved"

# class BorrowStatus(str, Enum):
#     PENDING = "pending"  # New status
#     APPROVED = "approved"
#     BORROWED = "borrowed"
#     RETURNED = "returned"
#     OVERDUE = "overdue"
#     REJECTED = "rejected"  # New status

# class NotificationType(str, Enum):
#     BORROW_REQUEST = "borrow_request"
#     BORROW_APPROVED = "borrow_approved"
#     BORROW_REJECTED = "borrow_rejected"
#     DUE_SOON = "due_soon"
#     OVERDUE = "overdue"
#     BOOK_RETURNED = "book_returned"

# class Book(BaseModel):
#     title: str
#     author: str
#     isbn: str
#     category: str = Field(default="General")
#     description: str
#     published_year: Optional[int] = None
#     publisher: Optional[str] = None
#     total_copies: int = Field(default=1)
#     available_copies: int = Field(default=1)
#     status: BookStatus = Field(default=BookStatus.AVAILABLE)
#     image_url: Optional[str] = None
#     created_at: Optional[datetime] = None

# class BookCreate(BaseModel):
#     title: str
#     author: str
#     isbn: str
#     category: str
#     description: str
#     total_copies: int
#     available_copies: int
#     published_year: Optional[int] = None
#     publisher: Optional[str] = None
#     image_url: Optional[str] = None

# class BorrowRequest(BaseModel):
#     book_id: str
#     borrow_days: int = Field(default=14, ge=1, le=30)

# class BorrowRecord(BaseModel):
#     book_id: str
#     user_email: str
#     user_name: str  # Add user name for notifications
#     borrow_date: Optional[datetime] = None
#     due_date: Optional[datetime] = None
#     return_date: Optional[datetime] = None
#     status: BorrowStatus = Field(default=BorrowStatus.PENDING)  # Default to pending
#     fine_amount: float = Field(default=0.0)
#     request_date: datetime = Field(default_factory=datetime.now)  # When request was made
#     approved_date: Optional[datetime] = None

# class ReturnRequest(BaseModel):
#     borrow_id: str

# class Notification(BaseModel):
#     user_email: str
#     title: str
#     message: str
#     type: NotificationType
#     borrow_id: Optional[str] = None
#     book_id: Optional[str] = None
#     is_read: bool = Field(default=False)
#     created_at: datetime = Field(default_factory=datetime.now)



from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from enum import Enum

class BookStatus(str, Enum):
    AVAILABLE = "available"
    BORROWED = "borrowed"
    RESERVED = "reserved"

class BorrowStatus(str, Enum):
    PENDING = "pending"
    APPROVED = "approved"
    BORROWED = "borrowed"
    RETURNED = "returned"
    OVERDUE = "overdue"
    REJECTED = "rejected"

class NotificationType(str, Enum):
    BORROW_REQUEST = "borrow_request"
    BORROW_APPROVED = "borrow_approved"
    BORROW_REJECTED = "borrow_rejected"
    DUE_SOON = "due_soon"
    OVERDUE = "overdue"
    BOOK_RETURNED = "book_returned"

class Book(BaseModel):
    title: str
    author: str
    isbn: str
    category: str = Field(default="General")
    description: str
    published_year: Optional[int] = None
    publisher: Optional[str] = None
    total_copies: int = Field(default=1)
    available_copies: int = Field(default=1)
    status: BookStatus = Field(default=BookStatus.AVAILABLE)
    image_url: Optional[str] = None
    created_at: Optional[datetime] = None

class BookCreate(BaseModel):
    title: str
    author: str
    isbn: str
    category: str
    description: str
    total_copies: int
    available_copies: int
    published_year: Optional[int] = None
    publisher: Optional[str] = None
    image_url: Optional[str] = None

class BorrowRequest(BaseModel):
    book_id: str
    borrow_days: int = Field(default=14, ge=1, le=30)

class BorrowRecord(BaseModel):
    book_id: str
    user_email: str
    user_name: str
    borrow_date: Optional[datetime] = None
    due_date: Optional[datetime] = None
    return_date: Optional[datetime] = None
    status: BorrowStatus = Field(default=BorrowStatus.PENDING)
    fine_amount: float = Field(default=0.0)
    request_date: datetime = Field(default_factory=datetime.now)
    approved_date: Optional[datetime] = None

class ReturnRequest(BaseModel):
    borrow_id: str

class Notification(BaseModel):
    user_email: str
    title: str
    message: str
    type: NotificationType
    borrow_id: Optional[str] = None
    book_id: Optional[str] = None
    is_read: bool = Field(default=False)
    created_at: datetime = Field(default_factory=datetime.now)