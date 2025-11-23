# from fastapi import APIRouter, HTTPException, Depends, UploadFile, File, Form
# from bson import ObjectId
# from datetime import datetime, timedelta
# import cloudinary
# import cloudinary.uploader
# from app.models.book import Book, BorrowRequest, BorrowRecord, ReturnRequest, BookStatus, BorrowStatus, Notification, NotificationType
# from app.config.database import db
# from app.utils.auth_handler import get_current_user

# # Configure Cloudinary
# cloudinary.config(
#     cloud_name="dtisam8ot",
#     api_key="416996345946976",
#     api_secret="dcfIgNOmXE5GkMyXgOAHnMxVeLg"
# )

# book_router = APIRouter(prefix="/books", tags=["Books"])

# # Helper function to convert ObjectId to string
# def convert_objectid(doc):
#     if doc and "_id" in doc:
#         doc["_id"] = str(doc["_id"])
#     return doc

# # Helper to check if ObjectId is valid
# def is_valid_objectid(id_str):
#     try:
#         ObjectId(id_str)
#         return True
#     except:
#         return False

# # Upload image to Cloudinary - FIXED VERSION
# async def upload_image_to_cloudinary(file: UploadFile):
#     try:
#         # Validate file type
#         if not file.content_type.startswith('image/'):
#             raise HTTPException(status_code=400, detail="File must be an image")
        
#         # Validate file size (max 5MB)
#         max_size = 5 * 1024 * 1024  # 5MB
#         contents = await file.read()
#         if len(contents) > max_size:
#             raise HTTPException(status_code=400, detail="Image size must be less than 5MB")
        
#         # Reset file pointer after reading
#         await file.seek(0)
        
#         # Upload to Cloudinary
#         upload_result = cloudinary.uploader.upload(
#             contents,  # Use the content we already read
#             folder="library_books"
#         )
        
#         return upload_result["secure_url"]  # Return the URL of the uploaded image
#     except HTTPException:
#         raise
#     except Exception as e:
#         raise HTTPException(status_code=500, detail=f"Image upload failed: {str(e)}")

# # IMAGE UPLOAD ENDPOINT
# @book_router.post("/upload-image")
# async def upload_book_image(
#     image: UploadFile = File(...),
#     current_user: dict = Depends(get_current_user)
# ):
#     """
#     Upload an image for a book
#     """
#     if current_user.get("role") != "admin":
#         raise HTTPException(status_code=403, detail="Admin access required")
    
#     try:
#         # Upload to Cloudinary
#         image_url = await upload_image_to_cloudinary(image)
        
#         return {
#             "message": "Image uploaded successfully",
#             "image_url": image_url
#         }
#     except HTTPException:
#         raise
#     except Exception as e:
#         raise HTTPException(status_code=500, detail=f"Failed to upload image: {str(e)}")

# # BOOK MANAGEMENT
# @book_router.get("/")
# async def get_available_books():
#     books = await db["books"].find({"available_copies": {"$gt": 0}}).to_list(1000)
#     return [convert_objectid(book) for book in books]

# @book_router.get("/all")
# async def get_all_books(current_user: dict = Depends(get_current_user)):
#     if current_user.get("role") != "admin":
#         raise HTTPException(status_code=403, detail="Admin access required")
    
#     books = await db["books"].find().to_list(1000)
#     return [convert_objectid(book) for book in books]

# # ADD BOOK WITH IMAGE - FIXED VERSION
# @book_router.post("/")
# async def add_book(
#     title: str = Form(...),
#     author: str = Form(...),
#     isbn: str = Form(...),
#     description: str = Form(...),
#     total_copies: int = Form(...),
#     available_copies: int = Form(...),
#     category: str = Form(...),
#     image: UploadFile = File(None),
#     current_user: dict = Depends(get_current_user)
# ):
#     if current_user.get("role") != "admin":
#         raise HTTPException(status_code=403, detail="Admin access required")
    
#     # Check if book with same ISBN already exists
#     existing_book = await db["books"].find_one({"isbn": isbn})
#     if existing_book:
#         raise HTTPException(status_code=400, detail="Book with this ISBN already exists")
    
#     # Handle image upload
#     image_url = None
#     if image and image.filename:  # Check if image is provided and has filename
#         try:
#             image_url = await upload_image_to_cloudinary(image)
#         except Exception as e:
#             raise HTTPException(status_code=400, detail=f"Image upload error: {str(e)}")
    
#     # Validate available copies don't exceed total copies
#     if available_copies > total_copies:
#         raise HTTPException(
#             status_code=400, 
#             detail="Available copies cannot exceed total copies"
#         )
    
#     # Create book document
#     book_dict = {
#         "title": title,
#         "author": author,
#         "isbn": isbn,
#         "description": description,
#         "total_copies": total_copies,
#         "available_copies": available_copies,
#         "category": category,
#         "image_url": image_url,
#         "created_at": datetime.now()
#     }
    
#     try:
#         result = await db["books"].insert_one(book_dict)
#         book_dict["_id"] = str(result.inserted_id)
        
#         return {
#             "message": "Book added successfully", 
#             "book": book_dict,
#             "image_uploaded": image_url is not None
#         }
#     except Exception as e:
#         raise HTTPException(status_code=500, detail=f"Failed to add book: {str(e)}")

# # Add book with JSON (alternative without image)
# @book_router.post("/add-book-json")
# async def add_book_json(book: Book, current_user: dict = Depends(get_current_user)):
#     if current_user.get("role") != "admin":
#         raise HTTPException(status_code=403, detail="Admin access required")
    
#     # Check if book with same ISBN already exists
#     existing_book = await db["books"].find_one({"isbn": book.isbn})
#     if existing_book:
#         raise HTTPException(status_code=400, detail="Book with this ISBN already exists")
    
#     book_dict = book.dict()
#     book_dict["created_at"] = datetime.now()
    
#     # Ensure available copies don't exceed total copies
#     if book_dict["available_copies"] > book_dict["total_copies"]:
#         book_dict["available_copies"] = book_dict["total_copies"]
    
#     result = await db["books"].insert_one(book_dict)
#     book_dict["_id"] = str(result.inserted_id)
    
#     return {"message": "Book added successfully", "book": book_dict}

# # Update book image - FIXED VERSION
# @book_router.put("/{book_id}/image")
# async def update_book_image(
#     book_id: str,
#     image: UploadFile = File(...),
#     current_user: dict = Depends(get_current_user)
# ):
#     if current_user.get("role") != "admin":
#         raise HTTPException(status_code=403, detail="Admin access required")
    
#     if not is_valid_objectid(book_id):
#         raise HTTPException(status_code=400, detail="Invalid book ID format")
    
#     existing_book = await db["books"].find_one({"_id": ObjectId(book_id)})
#     if not existing_book:
#         raise HTTPException(status_code=404, detail="Book not found")
    
#     # Check if image is provided
#     if not image or not image.filename:
#         raise HTTPException(status_code=400, detail="No image file provided")
    
#     try:
#         # Upload new image
#         image_url = await upload_image_to_cloudinary(image)
        
#         # Update book with new image
#         await db["books"].update_one(
#             {"_id": ObjectId(book_id)},
#             {"$set": {"image_url": image_url}}
#         )
        
#         return {
#             "message": "Book image updated successfully", 
#             "image_url": image_url
#         }
#     except HTTPException:
#         raise
#     except Exception as e:
#         raise HTTPException(status_code=500, detail=f"Failed to update image: {str(e)}")

# # UPDATE BOOK with optional image - FIXED VERSION
# @book_router.put("/{book_id}")
# async def update_book(
#     book_id: str,
#     title: str = Form(None),
#     author: str = Form(None),
#     isbn: str = Form(None),
#     description: str = Form(None),
#     total_copies: int = Form(None),
#     available_copies: int = Form(None),
#     category: str = Form(None),
#     image: UploadFile = File(None),
#     current_user: dict = Depends(get_current_user)
# ):
#     if current_user.get("role") != "admin":
#         raise HTTPException(status_code=403, detail="Admin access required")
    
#     if not is_valid_objectid(book_id):
#         raise HTTPException(status_code=400, detail="Invalid book ID format")
    
#     existing_book = await db["books"].find_one({"_id": ObjectId(book_id)})
#     if not existing_book:
#         raise HTTPException(status_code=404, detail="Book not found")
    
#     # Prepare update data
#     update_data = {}
    
#     if title is not None:
#         update_data["title"] = title
#     if author is not None:
#         update_data["author"] = author
#     if isbn is not None:
#         # Check if ISBN is being changed and if it conflicts with another book
#         if isbn != existing_book["isbn"]:
#             isbn_exists = await db["books"].find_one({"isbn": isbn, "_id": {"$ne": ObjectId(book_id)}})
#             if isbn_exists:
#                 raise HTTPException(status_code=400, detail="ISBN already exists")
#         update_data["isbn"] = isbn
#     if description is not None:
#         update_data["description"] = description
#     if total_copies is not None:
#         update_data["total_copies"] = total_copies
#     if available_copies is not None:
#         # Ensure available copies don't exceed total copies
#         total = total_copies if total_copies is not None else existing_book["total_copies"]
#         if available_copies > total:
#             raise HTTPException(
#                 status_code=400, 
#                 detail="Available copies cannot exceed total copies"
#             )
#         update_data["available_copies"] = available_copies
#     if category is not None:
#         update_data["category"] = category
    
#     # Handle image upload if provided
#     if image and image.filename:
#         try:
#             image_url = await upload_image_to_cloudinary(image)
#             update_data["image_url"] = image_url
#         except Exception as e:
#             raise HTTPException(status_code=400, detail=f"Image upload error: {str(e)}")
    
#     if update_data:
#         await db["books"].update_one(
#             {"_id": ObjectId(book_id)},
#             {"$set": update_data}
#         )
    
#     return {"message": "Book updated successfully"}

# # DELETE BOOK
# @book_router.delete("/{book_id}")
# async def delete_book(book_id: str, current_user: dict = Depends(get_current_user)):
#     if current_user.get("role") != "admin":
#         raise HTTPException(status_code=403, detail="Admin access required")
    
#     if not is_valid_objectid(book_id):
#         raise HTTPException(status_code=400, detail="Invalid book ID format")
    
#     existing_book = await db["books"].find_one({"_id": ObjectId(book_id)})
#     if not existing_book:
#         raise HTTPException(status_code=404, detail="Book not found")
    
#     # Check if book is currently borrowed
#     active_borrows = await db["borrow_records"].count_documents({
#         "book_id": book_id,
#         "status": {"$in": [BorrowStatus.BORROWED, BorrowStatus.PENDING, BorrowStatus.OVERDUE]}
#     })
    
#     if active_borrows > 0:
#         raise HTTPException(
#             status_code=400, 
#             detail="Cannot delete book that is currently borrowed or has pending requests"
#         )
    
#     # Delete image from Cloudinary if exists
#     if existing_book.get("image_url"):
#         try:
#             # Extract public_id from URL
#             image_url = existing_book["image_url"]
#             public_id = image_url.split("/")[-1].split(".")[0]
#             cloudinary.uploader.destroy(f"library_books/{public_id}")
#         except Exception as e:
#             print(f"Error deleting image from Cloudinary: {e}")
    
#     await db["books"].delete_one({"_id": ObjectId(book_id)})
#     return {"message": "Book deleted successfully"}

# # UPDATED BORROWING SYSTEM WITH PENDING STATUS
# @book_router.post("/borrow")
# async def borrow_book(borrow_request: BorrowRequest, current_user: dict = Depends(get_current_user)):
#     user_email = current_user.get("email")
#     user_name = current_user.get("name", "User")
    
#     # Validate book_id format
#     if not is_valid_objectid(borrow_request.book_id):
#         raise HTTPException(status_code=400, detail="Invalid book ID format")
    
#     # Check if book exists
#     book = await db["books"].find_one({"_id": ObjectId(borrow_request.book_id)})
#     if not book:
#         raise HTTPException(status_code=404, detail="Book not found")
    
#     if book["available_copies"] <= 0:
#         raise HTTPException(status_code=400, detail="No copies available")
    
#     # Check if user already has a pending or active borrow for this book
#     existing_borrow = await db["borrow_records"].find_one({
#         "book_id": borrow_request.book_id,
#         "user_email": user_email,
#         "status": {"$in": [BorrowStatus.PENDING, BorrowStatus.BORROWED, BorrowStatus.OVERDUE]}
#     })
    
#     if existing_borrow:
#         raise HTTPException(status_code=400, detail="You already have a pending or active borrow for this book")
    
#     # Create borrow record with PENDING status
#     borrow_record = {
#         "book_id": borrow_request.book_id,
#         "user_email": user_email,
#         "user_name": user_name,
#         "borrow_date": None,
#         "due_date": None,
#         "status": BorrowStatus.PENDING,
#         "fine_amount": 0.0,
#         "return_date": None,
#         "request_date": datetime.now(),
#         "approved_date": None
#     }
    
#     # Insert borrow record
#     result = await db["borrow_records"].insert_one(borrow_record)
#     borrow_record["_id"] = result.inserted_id
    
#     # Create notification for admin (in real app, you might want to notify admins)
#     # For now, we'll just create a notification for the user
#     notification = {
#         "user_email": user_email,
#         "title": "Borrow Request Submitted",
#         "message": f"Your borrow request for '{book['title']}' has been submitted and is pending admin approval.",
#         "type": NotificationType.BORROW_REQUEST,
#         "borrow_id": str(borrow_record["_id"]),
#         "book_id": borrow_request.book_id,
#         "is_read": False,
#         "created_at": datetime.now()
#     }
#     await db["notifications"].insert_one(notification)
    
#     # Prepare response
#     borrow_record_response = convert_objectid(borrow_record)
#     borrow_record_response["book"] = convert_objectid(book)
    
#     return {
#         "message": "Borrow request submitted successfully. Waiting for admin approval.",
#         "receipt": {
#             "transaction_id": str(borrow_record["_id"]),
#             "book_title": book["title"],
#             "user_name": user_name,
#             "request_date": datetime.now().isoformat(),
#             "status": "pending",
#             "note": "Your request is pending approval. You will receive a notification once approved."
#         }
#     }

# @book_router.post("/return")
# async def return_book(return_request: ReturnRequest, current_user: dict = Depends(get_current_user)):
#     user_email = current_user.get("email")
    
#     # Validate borrow_id format
#     if not is_valid_objectid(return_request.borrow_id):
#         raise HTTPException(status_code=400, detail="Invalid borrow ID format")
    
#     # Find borrow record
#     borrow_record = await db["borrow_records"].find_one({
#         "_id": ObjectId(return_request.borrow_id),
#         "user_email": user_email
#     })
    
#     if not borrow_record:
#         raise HTTPException(status_code=404, detail="Borrow record not found")
    
#     if borrow_record["status"] == BorrowStatus.RETURNED:
#         raise HTTPException(status_code=400, detail="Book already returned")
    
#     if borrow_record["status"] == BorrowStatus.PENDING:
#         raise HTTPException(status_code=400, detail="Cannot return a book that is still pending approval")
    
#     # Calculate fine if overdue
#     return_date = datetime.now()
#     fine_amount = 0.0
    
#     if return_date > borrow_record["due_date"]:
#         days_overdue = (return_date - borrow_record["due_date"]).days
#         fine_amount = days_overdue * 5.0  # $5 per day fine
    
#     # Update borrow record
#     await db["borrow_records"].update_one(
#         {"_id": ObjectId(return_request.borrow_id)},
#         {
#             "$set": {
#                 "return_date": return_date,
#                 "status": BorrowStatus.RETURNED,
#                 "fine_amount": fine_amount
#             }
#         }
#     )
    
#     # Update book available copies
#     await db["books"].update_one(
#         {"_id": ObjectId(borrow_record["book_id"])},
#         {"$inc": {"available_copies": 1}}
#     )
    
#     # Create return notification
#     book = await db["books"].find_one({"_id": ObjectId(borrow_record["book_id"])})
#     notification = {
#         "user_email": user_email,
#         "title": "Book Returned",
#         "message": f"You have successfully returned '{book['title'] if book else 'the book'}'. Fine amount: ${fine_amount}",
#         "type": NotificationType.BOOK_RETURNED,
#         "borrow_id": return_request.borrow_id,
#         "book_id": borrow_record["book_id"],
#         "is_read": False,
#         "created_at": datetime.now()
#     }
#     await db["notifications"].insert_one(notification)
    
#     return {"message": "Book returned successfully", "fine_amount": fine_amount}

# # ADMIN BORROW MANAGEMENT
# @book_router.get("/pending-requests")
# async def get_pending_borrow_requests(current_user: dict = Depends(get_current_user)):
#     if current_user.get("role") != "admin":
#         raise HTTPException(status_code=403, detail="Admin access required")
    
#     pending_requests = await db["borrow_records"].find({
#         "status": BorrowStatus.PENDING
#     }).sort("request_date", -1).to_list(1000)
    
#     # Get book details for each request
#     result = []
#     for request in pending_requests:
#         book = await db["books"].find_one({"_id": ObjectId(request["book_id"])})
#         request = convert_objectid(request)
#         if book:
#             request["book"] = convert_objectid(book)
#         result.append(request)
    
#     return result

# @book_router.put("/approve-borrow/{borrow_id}")
# async def approve_borrow_request(
#     borrow_id: str, 
#     current_user: dict = Depends(get_current_user)
# ):
#     if current_user.get("role") != "admin":
#         raise HTTPException(status_code=403, detail="Admin access required")
    
#     if not is_valid_objectid(borrow_id):
#         raise HTTPException(status_code=400, detail="Invalid borrow ID format")
    
#     # Find borrow record
#     borrow_record = await db["borrow_records"].find_one({
#         "_id": ObjectId(borrow_id),
#         "status": BorrowStatus.PENDING
#     })
    
#     if not borrow_record:
#         raise HTTPException(status_code=404, detail="Pending borrow request not found")
    
#     # Check if book is still available
#     book = await db["books"].find_one({"_id": ObjectId(borrow_record["book_id"])})
#     if not book:
#         raise HTTPException(status_code=404, detail="Book not found")
    
#     if book["available_copies"] <= 0:
#         # Update borrow status to rejected
#         await db["borrow_records"].update_one(
#             {"_id": ObjectId(borrow_id)},
#             {"$set": {"status": BorrowStatus.REJECTED}}
#         )
        
#         # Create rejection notification
#         notification = {
#             "user_email": borrow_record["user_email"],
#             "title": "Borrow Request Rejected",
#             "message": f"Your borrow request for '{book['title']}' was rejected because no copies are available.",
#             "type": NotificationType.BORROW_REJECTED,
#             "borrow_id": borrow_id,
#             "book_id": borrow_record["book_id"],
#             "is_read": False,
#             "created_at": datetime.now()
#         }
#         await db["notifications"].insert_one(notification)
        
#         raise HTTPException(status_code=400, detail="No copies available")
    
#     # Calculate dates
#     borrow_date = datetime.now()
#     due_date = borrow_date + timedelta(days=14)  # Default 14 days
    
#     # Update borrow record
#     await db["borrow_records"].update_one(
#         {"_id": ObjectId(borrow_id)},
#         {
#             "$set": {
#                 "status": BorrowStatus.BORROWED,
#                 "borrow_date": borrow_date,
#                 "due_date": due_date,
#                 "approved_date": datetime.now()
#             }
#         }
#     )
    
#     # Update book available copies
#     await db["books"].update_one(
#         {"_id": ObjectId(borrow_record["book_id"])},
#         {"$inc": {"available_copies": -1}}
#     )
    
#     # Create approval notification
#     notification = {
#         "user_email": borrow_record["user_email"],
#         "title": "Borrow Request Approved",
#         "message": f"Your borrow request for '{book['title']}' has been approved. Due date: {due_date.strftime('%Y-%m-%d')}",
#         "type": NotificationType.BORROW_APPROVED,
#         "borrow_id": borrow_id,
#         "book_id": borrow_record["book_id"],
#         "is_read": False,
#         "created_at": datetime.now()
#     }
#     await db["notifications"].insert_one(notification)
    
#     return {"message": "Borrow request approved successfully"}

# @book_router.put("/reject-borrow/{borrow_id}")
# async def reject_borrow_request(
#     borrow_id: str, 
#     current_user: dict = Depends(get_current_user)
# ):
#     if current_user.get("role") != "admin":
#         raise HTTPException(status_code=403, detail="Admin access required")
    
#     if not is_valid_objectid(borrow_id):
#         raise HTTPException(status_code=400, detail="Invalid borrow ID format")
    
#     # Find borrow record
#     borrow_record = await db["borrow_records"].find_one({
#         "_id": ObjectId(borrow_id),
#         "status": BorrowStatus.PENDING
#     })
    
#     if not borrow_record:
#         raise HTTPException(status_code=404, detail="Pending borrow request not found")
    
#     book = await db["books"].find_one({"_id": ObjectId(borrow_record["book_id"])})
    
#     # Update borrow status to rejected
#     await db["borrow_records"].update_one(
#         {"_id": ObjectId(borrow_id)},
#         {"$set": {"status": BorrowStatus.REJECTED}}
#     )
    
#     # Create rejection notification
#     notification = {
#         "user_email": borrow_record["user_email"],
#         "title": "Borrow Request Rejected",
#         "message": f"Your borrow request for '{book['title'] if book else 'the book'}' was rejected.",
#         "type": NotificationType.BORROW_REJECTED,
#         "borrow_id": borrow_id,
#         "book_id": borrow_record["book_id"],
#         "is_read": False,
#         "created_at": datetime.now()
#     }
#     await db["notifications"].insert_one(notification)
    
#     return {"message": "Borrow request rejected successfully"}

# # USER BORROW RECORDS
# @book_router.get("/my-borrows")
# async def get_my_borrowed_books(current_user: dict = Depends(get_current_user)):
#     user_email = current_user.get("email")
    
#     borrow_records = await db["borrow_records"].find({
#         "user_email": user_email,
#         "status": {"$in": [BorrowStatus.PENDING, BorrowStatus.BORROWED, BorrowStatus.OVERDUE]}
#     }).sort("request_date", -1).to_list(1000)
    
#     # Get book details for each borrow record
#     result = []
#     for record in borrow_records:
#         book = await db["books"].find_one({"_id": ObjectId(record["book_id"])})
#         record = convert_objectid(record)
#         if book:
#             record["book"] = convert_objectid(book)
#         result.append(record)
    
#     return result

# @book_router.get("/borrowing-history")
# async def get_borrowing_history(current_user: dict = Depends(get_current_user)):
#     user_email = current_user.get("email")
    
#     borrow_records = await db["borrow_records"].find({
#         "user_email": user_email,
#         "status": {"$in": [BorrowStatus.RETURNED, BorrowStatus.REJECTED]}
#     }).sort("request_date", -1).to_list(1000)
    
#     # Get book details for each borrow record
#     result = []
#     for record in borrow_records:
#         book = await db["books"].find_one({"_id": ObjectId(record["book_id"])})
#         record = convert_objectid(record)
#         if book:
#             record["book"] = convert_objectid(book)
#         result.append(record)
    
#     return result

# # NOTIFICATION SYSTEM
# @book_router.get("/notifications")
# async def get_user_notifications(current_user: dict = Depends(get_current_user)):
#     user_email = current_user.get("email")
    
#     notifications = await db["notifications"].find({
#         "user_email": user_email
#     }).sort("created_at", -1).to_list(1000)
    
#     return [convert_objectid(notif) for notif in notifications]

# @book_router.put("/notifications/{notification_id}/read")
# async def mark_notification_as_read(
#     notification_id: str, 
#     current_user: dict = Depends(get_current_user)
# ):
#     user_email = current_user.get("email")
    
#     if not is_valid_objectid(notification_id):
#         raise HTTPException(status_code=400, detail="Invalid notification ID format")
    
#     result = await db["notifications"].update_one(
#         {"_id": ObjectId(notification_id), "user_email": user_email},
#         {"$set": {"is_read": True}}
#     )
    
#     if result.modified_count == 0:
#         raise HTTPException(status_code=404, detail="Notification not found")
    
#     return {"message": "Notification marked as read"}

# @book_router.delete("/notifications/{notification_id}")
# async def delete_notification(
#     notification_id: str, 
#     current_user: dict = Depends(get_current_user)
# ):
#     user_email = current_user.get("email")
    
#     if not is_valid_objectid(notification_id):
#         raise HTTPException(status_code=400, detail="Invalid notification ID format")
    
#     result = await db["notifications"].delete_one({
#         "_id": ObjectId(notification_id), 
#         "user_email": user_email
#     })
    
#     if result.deleted_count == 0:
#         raise HTTPException(status_code=404, detail="Notification not found")
    
#     return {"message": "Notification deleted successfully"}

# # SCHEDULED NOTIFICATIONS FOR DUE DATES
# @book_router.post("/check-due-dates")
# async def check_due_dates():
#     """
#     This endpoint should be called by a scheduled task/cron job
#     """
#     # Find books due in 2 days
#     due_soon_date = datetime.now() + timedelta(days=2)
    
#     due_soon_books = await db["borrow_records"].find({
#         "status": BorrowStatus.BORROWED,
#         "due_date": {"$lte": due_soon_date, "$gt": datetime.now()}
#     }).to_list(1000)
    
#     # Find overdue books
#     overdue_books = await db["borrow_records"].find({
#         "status": BorrowStatus.BORROWED,
#         "due_date": {"$lt": datetime.now()}
#     }).to_list(1000)
    
#     # Create due soon notifications
#     for record in due_soon_books:
#         book = await db["books"].find_one({"_id": ObjectId(record["book_id"])})
#         if book:
#             # Check if notification already exists
#             existing_notif = await db["notifications"].find_one({
#                 "borrow_id": str(record["_id"]),
#                 "type": NotificationType.DUE_SOON
#             })
            
#             if not existing_notif:
#                 notification = {
#                     "user_email": record["user_email"],
#                     "title": "Book Due Soon",
#                     "message": f"Your book '{book['title']}' is due on {record['due_date'].strftime('%Y-%m-%d')}. Please return it soon.",
#                     "type": NotificationType.DUE_SOON,
#                     "borrow_id": str(record["_id"]),
#                     "book_id": record["book_id"],
#                     "is_read": False,
#                     "created_at": datetime.now()
#                 }
#                 await db["notifications"].insert_one(notification)
    
#     # Create overdue notifications
#     for record in overdue_books:
#         book = await db["books"].find_one({"_id": ObjectId(record["book_id"])})
#         if book:
#             # Update status to overdue
#             await db["borrow_records"].update_one(
#                 {"_id": record["_id"]},
#                 {"$set": {"status": BorrowStatus.OVERDUE}}
#             )
            
#             # Check if notification already exists
#             existing_notif = await db["notifications"].find_one({
#                 "borrow_id": str(record["_id"]),
#                 "type": NotificationType.OVERDUE
#             })
            
#             if not existing_notif:
#                 days_overdue = (datetime.now() - record["due_date"]).days
#                 notification = {
#                     "user_email": record["user_email"],
#                     "title": "Book Overdue",
#                     "message": f"Your book '{book['title']}' is {days_overdue} day(s) overdue. Please return it immediately.",
#                     "type": NotificationType.OVERDUE,
#                     "borrow_id": str(record["_id"]),
#                     "book_id": record["book_id"],
#                     "is_read": False,
#                     "created_at": datetime.now()
#                 }
#                 await db["notifications"].insert_one(notification)
    
#     return {"message": "Due date check completed"}

# # Get all borrow records for admin
# @book_router.get("/admin/borrow-records")
# async def get_all_borrow_records(current_user: dict = Depends(get_current_user)):
#     if current_user.get("role") != "admin":
#         raise HTTPException(status_code=403, detail="Admin access required")
    
#     borrow_records = await db["borrow_records"].find().sort("request_date", -1).to_list(1000)
    
#     # Get book details for each borrow record
#     result = []
#     for record in borrow_records:
#         book = await db["books"].find_one({"_id": ObjectId(record["book_id"])})
#         record = convert_objectid(record)
#         if book:
#             record["book"] = convert_objectid(book)
#         result.append(record)
    
#     return result





































































# # from fastapi import APIRouter, HTTPException, Depends, UploadFile, File, Form
# # from bson import ObjectId
# # from datetime import datetime, timedelta
# # import cloudinary
# # import cloudinary.uploader
# # from app.models.book import Book, BorrowRequest, BorrowRecord, ReturnRequest, BookStatus, BorrowStatus, Notification, NotificationType
# # from app.config.database import db
# # from app.utils.auth_handler import get_current_user

# # # Configure Cloudinary
# # cloudinary.config(
# #     cloud_name="dtisam8ot",
# #     api_key="416996345946976",
# #     api_secret="dcfIgNOmXE5GkMyXgOAHnMxVeLg"
# # )

# # book_router = APIRouter(prefix="/books", tags=["Books"])

# # # Helper function to convert ObjectId to string
# # def convert_objectid(doc):
# #     if doc and "_id" in doc:
# #         doc["_id"] = str(doc["_id"])
# #     return doc

# # # Helper to check if ObjectId is valid
# # def is_valid_objectid(id_str):
# #     try:
# #         ObjectId(id_str)
# #         return True
# #     except:
# #         return False

# # # Upload image to Cloudinary - FIXED VERSION
# # async def upload_image_to_cloudinary(file: UploadFile):
# #     try:
# #         # Validate file type
# #         if not file.content_type.startswith('image/'):
# #             raise HTTPException(status_code=400, detail="File must be an image")
        
# #         # Read file content
# #         file_content = await file.read()
        
# #         # Validate file size (max 5MB)
# #         max_size = 5 * 1024 * 1024
# #         if len(file_content) > max_size:
# #             raise HTTPException(status_code=400, detail="Image size must be less than 5MB")
        
# #         # Upload to Cloudinary using bytes content
# #         upload_result = cloudinary.uploader.upload(
# #             file_content,
# #             folder="library_books"
# #         )
        
# #         return upload_result["secure_url"]
# #     except HTTPException:
# #         raise
# #     except Exception as e:
# #         raise HTTPException(status_code=500, detail=f"Image upload failed: {str(e)}")

# # # IMAGE UPLOAD ENDPOINT
# # @book_router.post("/upload-image")
# # async def upload_book_image(
# #     image: UploadFile = File(...),
# #     current_user: dict = Depends(get_current_user)
# # ):
# #     """
# #     Upload an image for a book
# #     """
# #     if current_user.get("role") != "admin":
# #         raise HTTPException(status_code=403, detail="Admin access required")
    
# #     try:
# #         # Upload to Cloudinary
# #         image_url = await upload_image_to_cloudinary(image)
        
# #         return {
# #             "message": "Image uploaded successfully",
# #             "image_url": image_url
# #         }
# #     except HTTPException:
# #         raise
# #     except Exception as e:
# #         raise HTTPException(status_code=500, detail=f"Failed to upload image: {str(e)}")

# # # BOOK MANAGEMENT
# # @book_router.get("/")
# # async def get_available_books():
# #     books = await db["books"].find({"available_copies": {"$gt": 0}}).to_list(1000)
# #     return [convert_objectid(book) for book in books]

# # @book_router.get("/all")
# # async def get_all_books(current_user: dict = Depends(get_current_user)):
# #     if current_user.get("role") != "admin":
# #         raise HTTPException(status_code=403, detail="Admin access required")
    
# #     books = await db["books"].find().to_list(1000)
# #     return [convert_objectid(book) for book in books]

# # @book_router.get("/{book_id}")
# # async def get_book_by_id(book_id: str):
# #     if not is_valid_objectid(book_id):
# #         raise HTTPException(status_code=400, detail="Invalid book ID format")
    
# #     book = await db["books"].find_one({"_id": ObjectId(book_id)})
# #     if not book:
# #         raise HTTPException(status_code=404, detail="Book not found")
    
# #     return convert_objectid(book)

# # # ADD BOOK WITH IMAGE - FIXED VERSION
# # @book_router.post("/")
# # async def add_book(
# #     title: str = Form(...),
# #     author: str = Form(...),
# #     isbn: str = Form(...),
# #     description: str = Form(...),
# #     total_copies: int = Form(...),
# #     available_copies: int = Form(...),
# #     category: str = Form(...),
# #     published_year: int = Form(None),
# #     publisher: str = Form(None),
# #     image: UploadFile = File(None),
# #     image_url: str = Form(None),  # ADDED BACK
# #     current_user: dict = Depends(get_current_user)
# # ):
# #     if current_user.get("role") != "admin":
# #         raise HTTPException(status_code=403, detail="Admin access required")
    
# #     # Check if book with same ISBN already exists
# #     existing_book = await db["books"].find_one({"isbn": isbn})
# #     if existing_book:
# #         raise HTTPException(status_code=400, detail="Book with this ISBN already exists")
    
# #     # Handle image upload - PRIORITIZE FILE OVER URL
# #     final_image_url = None
# #     if image:
# #         try:
# #             final_image_url = await upload_image_to_cloudinary(image)
# #         except Exception as e:
# #             raise HTTPException(status_code=400, detail=f"Image upload error: {str(e)}")
# #     elif image_url:
# #         final_image_url = image_url
    
# #     # Validate available copies don't exceed total copies
# #     if available_copies > total_copies:
# #         raise HTTPException(
# #             status_code=400, 
# #             detail="Available copies cannot exceed total copies"
# #         )
    
# #     # Create book document
# #     book_dict = {
# #         "title": title,
# #         "author": author,
# #         "isbn": isbn,
# #         "description": description,
# #         "total_copies": total_copies,
# #         "available_copies": available_copies,
# #         "category": category,
# #         "published_year": published_year,
# #         "publisher": publisher,
# #         "image_url": final_image_url,
# #         "created_at": datetime.now()
# #     }
    
# #     try:
# #         result = await db["books"].insert_one(book_dict)
# #         book_dict["_id"] = str(result.inserted_id)
        
# #         return {
# #             "message": "Book added successfully", 
# #             "book": book_dict,
# #             "image_uploaded": final_image_url is not None
# #         }
# #     except Exception as e:
# #         raise HTTPException(status_code=500, detail=f"Failed to add book: {str(e)}")

# # # Add book with JSON (alternative without image)
# # @book_router.post("/add-book-json")
# # async def add_book_json(book: Book, current_user: dict = Depends(get_current_user)):
# #     if current_user.get("role") != "admin":
# #         raise HTTPException(status_code=403, detail="Admin access required")
    
# #     # Check if book with same ISBN already exists
# #     existing_book = await db["books"].find_one({"isbn": book.isbn})
# #     if existing_book:
# #         raise HTTPException(status_code=400, detail="Book with this ISBN already exists")
    
# #     book_dict = book.dict()
# #     book_dict["created_at"] = datetime.now()
    
# #     # Ensure available copies don't exceed total copies
# #     if book_dict["available_copies"] > book_dict["total_copies"]:
# #         book_dict["available_copies"] = book_dict["total_copies"]
    
# #     result = await db["books"].insert_one(book_dict)
# #     book_dict["_id"] = str(result.inserted_id)
    
# #     return {"message": "Book added successfully", "book": book_dict}

# # # Update book image - FIXED VERSION
# # @book_router.put("/{book_id}/image")
# # async def update_book_image(
# #     book_id: str,
# #     image: UploadFile = File(...),
# #     current_user: dict = Depends(get_current_user)
# # ):
# #     if current_user.get("role") != "admin":
# #         raise HTTPException(status_code=403, detail="Admin access required")
    
# #     if not is_valid_objectid(book_id):
# #         raise HTTPException(status_code=400, detail="Invalid book ID format")
    
# #     existing_book = await db["books"].find_one({"_id": ObjectId(book_id)})
# #     if not existing_book:
# #         raise HTTPException(status_code=404, detail="Book not found")
    
# #     try:
# #         # Upload new image
# #         image_url = await upload_image_to_cloudinary(image)
        
# #         # Update book with new image
# #         await db["books"].update_one(
# #             {"_id": ObjectId(book_id)},
# #             {"$set": {"image_url": image_url}}
# #         )
        
# #         return {
# #             "message": "Book image updated successfully", 
# #             "image_url": image_url
# #         }
# #     except HTTPException:
# #         raise
# #     except Exception as e:
# #         raise HTTPException(status_code=500, detail=f"Failed to update image: {str(e)}")

# # # UPDATE BOOK with optional image - FIXED VERSION
# # @book_router.put("/{book_id}")
# # async def update_book(
# #     book_id: str,
# #     title: str = Form(None),
# #     author: str = Form(None),
# #     isbn: str = Form(None),
# #     description: str = Form(None),
# #     total_copies: int = Form(None),
# #     available_copies: int = Form(None),
# #     category: str = Form(None),
# #     published_year: int = Form(None),
# #     publisher: str = Form(None),
# #     image: UploadFile = File(None),
# #     image_url: str = Form(None),  # ADDED BACK
# #     current_user: dict = Depends(get_current_user)
# # ):
# #     if current_user.get("role") != "admin":
# #         raise HTTPException(status_code=403, detail="Admin access required")
    
# #     if not is_valid_objectid(book_id):
# #         raise HTTPException(status_code=400, detail="Invalid book ID format")
    
# #     existing_book = await db["books"].find_one({"_id": ObjectId(book_id)})
# #     if not existing_book:
# #         raise HTTPException(status_code=404, detail="Book not found")
    
# #     # Prepare update data
# #     update_data = {}
    
# #     if title is not None:
# #         update_data["title"] = title
# #     if author is not None:
# #         update_data["author"] = author
# #     if isbn is not None:
# #         # Check if ISBN is being changed and if it conflicts with another book
# #         if isbn != existing_book["isbn"]:
# #             isbn_exists = await db["books"].find_one({"isbn": isbn, "_id": {"$ne": ObjectId(book_id)}})
# #             if isbn_exists:
# #                 raise HTTPException(status_code=400, detail="ISBN already exists")
# #         update_data["isbn"] = isbn
# #     if description is not None:
# #         update_data["description"] = description
# #     if total_copies is not None:
# #         update_data["total_copies"] = total_copies
# #     if available_copies is not None:
# #         # Ensure available copies don't exceed total copies
# #         total = total_copies if total_copies is not None else existing_book["total_copies"]
# #         if available_copies > total:
# #             raise HTTPException(
# #                 status_code=400, 
# #                 detail="Available copies cannot exceed total copies"
# #             )
# #         update_data["available_copies"] = available_copies
# #     if category is not None:
# #         update_data["category"] = category
# #     if published_year is not None:
# #         update_data["published_year"] = published_year
# #     if publisher is not None:
# #         update_data["publisher"] = publisher
    
# #     # Handle image upload - PRIORITIZE FILE OVER URL
# #     if image:
# #         try:
# #             final_image_url = await upload_image_to_cloudinary(image)
# #             update_data["image_url"] = final_image_url
# #         except Exception as e:
# #             raise HTTPException(status_code=400, detail=f"Image upload error: {str(e)}")
# #     elif image_url is not None:  # HANDLE URL PROVIDED
# #         update_data["image_url"] = image_url
    
# #     if update_data:
# #         await db["books"].update_one(
# #             {"_id": ObjectId(book_id)},
# #             {"$set": update_data}
# #         )
    
# #     return {"message": "Book updated successfully"}

# # # DELETE BOOK
# # @book_router.delete("/{book_id}")
# # async def delete_book(book_id: str, current_user: dict = Depends(get_current_user)):
# #     if current_user.get("role") != "admin":
# #         raise HTTPException(status_code=403, detail="Admin access required")
    
# #     if not is_valid_objectid(book_id):
# #         raise HTTPException(status_code=400, detail="Invalid book ID format")
    
# #     existing_book = await db["books"].find_one({"_id": ObjectId(book_id)})
# #     if not existing_book:
# #         raise HTTPException(status_code=404, detail="Book not found")
    
# #     # Check if book is currently borrowed
# #     active_borrows = await db["borrow_records"].count_documents({
# #         "book_id": book_id,
# #         "status": {"$in": [BorrowStatus.BORROWED, BorrowStatus.PENDING, BorrowStatus.OVERDUE]}
# #     })
    
# #     if active_borrows > 0:
# #         raise HTTPException(
# #             status_code=400, 
# #             detail="Cannot delete book that is currently borrowed or has pending requests"
# #         )
    
# #     # Delete image from Cloudinary if exists
# #     if existing_book.get("image_url"):
# #         try:
# #             # Extract public_id from URL
# #             image_url = existing_book["image_url"]
# #             public_id = image_url.split("/")[-1].split(".")[0]
# #             cloudinary.uploader.destroy(f"library_books/{public_id}")
# #         except Exception as e:
# #             print(f"Error deleting image from Cloudinary: {e}")
    
# #     await db["books"].delete_one({"_id": ObjectId(book_id)})
# #     return {"message": "Book deleted successfully"}

# # # UPDATED BORROWING SYSTEM WITH PENDING STATUS
# # @book_router.post("/borrow")
# # async def borrow_book(borrow_request: BorrowRequest, current_user: dict = Depends(get_current_user)):
# #     user_email = current_user.get("email")
# #     user_name = current_user.get("name", "User")
    
# #     # Validate book_id format
# #     if not is_valid_objectid(borrow_request.book_id):
# #         raise HTTPException(status_code=400, detail="Invalid book ID format")
    
# #     # Check if book exists
# #     book = await db["books"].find_one({"_id": ObjectId(borrow_request.book_id)})
# #     if not book:
# #         raise HTTPException(status_code=404, detail="Book not found")
    
# #     if book["available_copies"] <= 0:
# #         raise HTTPException(status_code=400, detail="No copies available")
    
# #     # Check if user already has a pending or active borrow for this book
# #     existing_borrow = await db["borrow_records"].find_one({
# #         "book_id": borrow_request.book_id,
# #         "user_email": user_email,
# #         "status": {"$in": [BorrowStatus.PENDING, BorrowStatus.BORROWED, BorrowStatus.OVERDUE]}
# #     })
    
# #     if existing_borrow:
# #         raise HTTPException(status_code=400, detail="You already have a pending or active borrow for this book")
    
# #     # Create borrow record with PENDING status
# #     borrow_record = {
# #         "book_id": borrow_request.book_id,
# #         "user_email": user_email,
# #         "user_name": user_name,
# #         "borrow_date": None,
# #         "due_date": None,
# #         "status": BorrowStatus.PENDING,
# #         "fine_amount": 0.0,
# #         "return_date": None,
# #         "request_date": datetime.now(),
# #         "approved_date": None
# #     }
    
# #     # Insert borrow record
# #     result = await db["borrow_records"].insert_one(borrow_record)
# #     borrow_record["_id"] = result.inserted_id
    
# #     # Create notification for admin (in real app, you might want to notify admins)
# #     # For now, we'll just create a notification for the user
# #     notification = {
# #         "user_email": user_email,
# #         "title": "Borrow Request Submitted",
# #         "message": f"Your borrow request for '{book['title']}' has been submitted and is pending admin approval.",
# #         "type": NotificationType.BORROW_REQUEST,
# #         "borrow_id": str(borrow_record["_id"]),
# #         "book_id": borrow_request.book_id,
# #         "is_read": False,
# #         "created_at": datetime.now()
# #     }
# #     await db["notifications"].insert_one(notification)
    
# #     # Prepare response
# #     borrow_record_response = convert_objectid(borrow_record)
# #     borrow_record_response["book"] = convert_objectid(book)
    
# #     return {
# #         "message": "Borrow request submitted successfully. Waiting for admin approval.",
# #         "receipt": {
# #             "transaction_id": str(borrow_record["_id"]),
# #             "book_title": book["title"],
# #             "user_name": user_name,
# #             "request_date": datetime.now().isoformat(),
# #             "status": "pending",
# #             "note": "Your request is pending approval. You will receive a notification once approved."
# #         }
# #     }

# # @book_router.post("/return")
# # async def return_book(return_request: ReturnRequest, current_user: dict = Depends(get_current_user)):
# #     user_email = current_user.get("email")
    
# #     # Validate borrow_id format
# #     if not is_valid_objectid(return_request.borrow_id):
# #         raise HTTPException(status_code=400, detail="Invalid borrow ID format")
    
# #     # Find borrow record
# #     borrow_record = await db["borrow_records"].find_one({
# #         "_id": ObjectId(return_request.borrow_id),
# #         "user_email": user_email
# #     })
    
# #     if not borrow_record:
# #         raise HTTPException(status_code=404, detail="Borrow record not found")
    
# #     if borrow_record["status"] == BorrowStatus.RETURNED:
# #         raise HTTPException(status_code=400, detail="Book already returned")
    
# #     if borrow_record["status"] == BorrowStatus.PENDING:
# #         raise HTTPException(status_code=400, detail="Cannot return a book that is still pending approval")
    
# #     # Calculate fine if overdue
# #     return_date = datetime.now()
# #     fine_amount = 0.0
    
# #     if return_date > borrow_record["due_date"]:
# #         days_overdue = (return_date - borrow_record["due_date"]).days
# #         fine_amount = days_overdue * 5.0  # $5 per day fine
    
# #     # Update borrow record
# #     await db["borrow_records"].update_one(
# #         {"_id": ObjectId(return_request.borrow_id)},
# #         {
# #             "$set": {
# #                 "return_date": return_date,
# #                 "status": BorrowStatus.RETURNED,
# #                 "fine_amount": fine_amount
# #             }
# #         }
# #     )
    
# #     # Update book available copies
# #     await db["books"].update_one(
# #         {"_id": ObjectId(borrow_record["book_id"])},
# #         {"$inc": {"available_copies": 1}}
# #     )
    
# #     # Create return notification
# #     book = await db["books"].find_one({"_id": ObjectId(borrow_record["book_id"])})
# #     notification = {
# #         "user_email": user_email,
# #         "title": "Book Returned",
# #         "message": f"You have successfully returned '{book['title'] if book else 'the book'}'. Fine amount: ${fine_amount}",
# #         "type": NotificationType.BOOK_RETURNED,
# #         "borrow_id": return_request.borrow_id,
# #         "book_id": borrow_record["book_id"],
# #         "is_read": False,
# #         "created_at": datetime.now()
# #     }
# #     await db["notifications"].insert_one(notification)
    
# #     return {"message": "Book returned successfully", "fine_amount": fine_amount}

# # # ADMIN BORROW MANAGEMENT
# # @book_router.get("/pending-requests")
# # async def get_pending_borrow_requests(current_user: dict = Depends(get_current_user)):
# #     if current_user.get("role") != "admin":
# #         raise HTTPException(status_code=403, detail="Admin access required")
    
# #     pending_requests = await db["borrow_records"].find({
# #         "status": BorrowStatus.PENDING
# #     }).sort("request_date", -1).to_list(1000)
    
# #     # Get book details for each request
# #     result = []
# #     for request in pending_requests:
# #         book = await db["books"].find_one({"_id": ObjectId(request["book_id"])})
# #         request = convert_objectid(request)
# #         if book:
# #             request["book"] = convert_objectid(book)
# #         result.append(request)
    
# #     return result

# # @book_router.put("/approve-borrow/{borrow_id}")
# # async def approve_borrow_request(
# #     borrow_id: str, 
# #     current_user: dict = Depends(get_current_user)
# # ):
# #     if current_user.get("role") != "admin":
# #         raise HTTPException(status_code=403, detail="Admin access required")
    
# #     if not is_valid_objectid(borrow_id):
# #         raise HTTPException(status_code=400, detail="Invalid borrow ID format")
    
# #     # Find borrow record
# #     borrow_record = await db["borrow_records"].find_one({
# #         "_id": ObjectId(borrow_id),
# #         "status": BorrowStatus.PENDING
# #     })
    
# #     if not borrow_record:
# #         raise HTTPException(status_code=404, detail="Pending borrow request not found")
    
# #     # Check if book is still available
# #     book = await db["books"].find_one({"_id": ObjectId(borrow_record["book_id"])})
# #     if not book:
# #         raise HTTPException(status_code=404, detail="Book not found")
    
# #     if book["available_copies"] <= 0:
# #         # Update borrow status to rejected
# #         await db["borrow_records"].update_one(
# #             {"_id": ObjectId(borrow_id)},
# #             {"$set": {"status": BorrowStatus.REJECTED}}
# #         )
        
# #         # Create rejection notification
# #         notification = {
# #             "user_email": borrow_record["user_email"],
# #             "title": "Borrow Request Rejected",
# #             "message": f"Your borrow request for '{book['title']}' was rejected because no copies are available.",
# #             "type": NotificationType.BORROW_REJECTED,
# #             "borrow_id": borrow_id,
# #             "book_id": borrow_record["book_id"],
# #             "is_read": False,
# #             "created_at": datetime.now()
# #         }
# #         await db["notifications"].insert_one(notification)
        
# #         raise HTTPException(status_code=400, detail="No copies available")
    
# #     # Calculate dates
# #     borrow_date = datetime.now()
# #     due_date = borrow_date + timedelta(days=14)  # Default 14 days
    
# #     # Update borrow record
# #     await db["borrow_records"].update_one(
# #         {"_id": ObjectId(borrow_id)},
# #         {
# #             "$set": {
# #                 "status": BorrowStatus.BORROWED,
# #                 "borrow_date": borrow_date,
# #                 "due_date": due_date,
# #                 "approved_date": datetime.now()
# #             }
# #         }
# #     )
    
# #     # Update book available copies
# #     await db["books"].update_one(
# #         {"_id": ObjectId(borrow_record["book_id"])},
# #         {"$inc": {"available_copies": -1}}
# #     )
    
# #     # Create approval notification
# #     notification = {
# #         "user_email": borrow_record["user_email"],
# #         "title": "Borrow Request Approved",
# #         "message": f"Your borrow request for '{book['title']}' has been approved. Due date: {due_date.strftime('%Y-%m-%d')}",
# #         "type": NotificationType.BORROW_APPROVED,
# #         "borrow_id": borrow_id,
# #         "book_id": borrow_record["book_id"],
# #         "is_read": False,
# #         "created_at": datetime.now()
# #     }
# #     await db["notifications"].insert_one(notification)
    
# #     return {"message": "Borrow request approved successfully"}

# # @book_router.put("/reject-borrow/{borrow_id}")
# # async def reject_borrow_request(
# #     borrow_id: str, 
# #     current_user: dict = Depends(get_current_user)
# # ):
# #     if current_user.get("role") != "admin":
# #         raise HTTPException(status_code=403, detail="Admin access required")
    
# #     if not is_valid_objectid(borrow_id):
# #         raise HTTPException(status_code=400, detail="Invalid borrow ID format")
    
# #     # Find borrow record
# #     borrow_record = await db["borrow_records"].find_one({
# #         "_id": ObjectId(borrow_id),
# #         "status": BorrowStatus.PENDING
# #     })
    
# #     if not borrow_record:
# #         raise HTTPException(status_code=404, detail="Pending borrow request not found")
    
# #     book = await db["books"].find_one({"_id": ObjectId(borrow_record["book_id"])})
    
# #     # Update borrow status to rejected
# #     await db["borrow_records"].update_one(
# #         {"_id": ObjectId(borrow_id)},
# #         {"$set": {"status": BorrowStatus.REJECTED}}
# #     )
    
# #     # Create rejection notification
# #     notification = {
# #         "user_email": borrow_record["user_email"],
# #         "title": "Borrow Request Rejected",
# #         "message": f"Your borrow request for '{book['title'] if book else 'the book'}' was rejected.",
# #         "type": NotificationType.BORROW_REJECTED,
# #         "borrow_id": borrow_id,
# #         "book_id": borrow_record["book_id"],
# #         "is_read": False,
# #         "created_at": datetime.now()
# #     }
# #     await db["notifications"].insert_one(notification)
    
# #     return {"message": "Borrow request rejected successfully"}

# # # USER BORROW RECORDS
# # @book_router.get("/my-borrows")
# # async def get_my_borrowed_books(current_user: dict = Depends(get_current_user)):
# #     user_email = current_user.get("email")
    
# #     borrow_records = await db["borrow_records"].find({
# #         "user_email": user_email,
# #         "status": {"$in": [BorrowStatus.PENDING, BorrowStatus.BORROWED, BorrowStatus.OVERDUE]}
# #     }).sort("request_date", -1).to_list(1000)
    
# #     # Get book details for each borrow record
# #     result = []
# #     for record in borrow_records:
# #         book = await db["books"].find_one({"_id": ObjectId(record["book_id"])})
# #         record = convert_objectid(record)
# #         if book:
# #             record["book"] = convert_objectid(book)
# #         result.append(record)
    
# #     return result

# # @book_router.get("/borrowing-history")
# # async def get_borrowing_history(current_user: dict = Depends(get_current_user)):
# #     user_email = current_user.get("email")
    
# #     borrow_records = await db["borrow_records"].find({
# #         "user_email": user_email,
# #         "status": {"$in": [BorrowStatus.RETURNED, BorrowStatus.REJECTED]}
# #     }).sort("request_date", -1).to_list(1000)
    
# #     # Get book details for each borrow record
# #     result = []
# #     for record in borrow_records:
# #         book = await db["books"].find_one({"_id": ObjectId(record["book_id"])})
# #         record = convert_objectid(record)
# #         if book:
# #             record["book"] = convert_objectid(book)
# #         result.append(record)
    
# #     return result

# # # NOTIFICATION SYSTEM
# # @book_router.get("/notifications")
# # async def get_user_notifications(current_user: dict = Depends(get_current_user)):
# #     user_email = current_user.get("email")
    
# #     notifications = await db["notifications"].find({
# #         "user_email": user_email
# #     }).sort("created_at", -1).to_list(1000)
    
# #     return [convert_objectid(notif) for notif in notifications]

# # @book_router.put("/notifications/{notification_id}/read")
# # async def mark_notification_as_read(
# #     notification_id: str, 
# #     current_user: dict = Depends(get_current_user)
# # ):
# #     user_email = current_user.get("email")
    
# #     if not is_valid_objectid(notification_id):
# #         raise HTTPException(status_code=400, detail="Invalid notification ID format")
    
# #     result = await db["notifications"].update_one(
# #         {"_id": ObjectId(notification_id), "user_email": user_email},
# #         {"$set": {"is_read": True}}
# #     )
    
# #     if result.modified_count == 0:
# #         raise HTTPException(status_code=404, detail="Notification not found")
    
# #     return {"message": "Notification marked as read"}

# # @book_router.delete("/notifications/{notification_id}")
# # async def delete_notification(
# #     notification_id: str, 
# #     current_user: dict = Depends(get_current_user)
# # ):
# #     user_email = current_user.get("email")
    
# #     if not is_valid_objectid(notification_id):
# #         raise HTTPException(status_code=400, detail="Invalid notification ID format")
    
# #     result = await db["notifications"].delete_one({
# #         "_id": ObjectId(notification_id), 
# #         "user_email": user_email
# #     })
    
# #     if result.deleted_count == 0:
# #         raise HTTPException(status_code=404, detail="Notification not found")
    
# #     return {"message": "Notification deleted successfully"}

# # # SCHEDULED NOTIFICATIONS FOR DUE DATES
# # @book_router.post("/check-due-dates")
# # async def check_due_dates():
# #     """
# #     This endpoint should be called by a scheduled task/cron job
# #     """
# #     # Find books due in 2 days
# #     due_soon_date = datetime.now() + timedelta(days=2)
    
# #     due_soon_books = await db["borrow_records"].find({
# #         "status": BorrowStatus.BORROWED,
# #         "due_date": {"$lte": due_soon_date, "$gt": datetime.now()}
# #     }).to_list(1000)
    
# #     # Find overdue books
# #     overdue_books = await db["borrow_records"].find({
# #         "status": BorrowStatus.BORROWED,
# #         "due_date": {"$lt": datetime.now()}
# #     }).to_list(1000)
    
# #     # Create due soon notifications
# #     for record in due_soon_books:
# #         book = await db["books"].find_one({"_id": ObjectId(record["book_id"])})
# #         if book:
# #             # Check if notification already exists
# #             existing_notif = await db["notifications"].find_one({
# #                 "borrow_id": str(record["_id"]),
# #                 "type": NotificationType.DUE_SOON
# #             })
            
# #             if not existing_notif:
# #                 notification = {
# #                     "user_email": record["user_email"],
# #                     "title": "Book Due Soon",
# #                     "message": f"Your book '{book['title']}' is due on {record['due_date'].strftime('%Y-%m-%d')}. Please return it soon.",
# #                     "type": NotificationType.DUE_SOON,
# #                     "borrow_id": str(record["_id"]),
# #                     "book_id": record["book_id"],
# #                     "is_read": False,
# #                     "created_at": datetime.now()
# #                 }
# #                 await db["notifications"].insert_one(notification)
    
# #     # Create overdue notifications
# #     for record in overdue_books:
# #         book = await db["books"].find_one({"_id": ObjectId(record["book_id"])})
# #         if book:
# #             # Update status to overdue
# #             await db["borrow_records"].update_one(
# #                 {"_id": record["_id"]},
# #                 {"$set": {"status": BorrowStatus.OVERDUE}}
# #             )
            
# #             # Check if notification already exists
# #             existing_notif = await db["notifications"].find_one({
# #                 "borrow_id": str(record["_id"]),
# #                 "type": NotificationType.OVERDUE
# #             })
            
# #             if not existing_notif:
# #                 days_overdue = (datetime.now() - record["due_date"]).days
# #                 notification = {
# #                     "user_email": record["user_email"],
# #                     "title": "Book Overdue",
# #                     "message": f"Your book '{book['title']}' is {days_overdue} day(s) overdue. Please return it immediately.",
# #                     "type": NotificationType.OVERDUE,
# #                     "borrow_id": str(record["_id"]),
# #                     "book_id": record["book_id"],
# #                     "is_read": False,
# #                     "created_at": datetime.now()
# #                 }
# #                 await db["notifications"].insert_one(notification)
    
# #     return {"message": "Due date check completed"}

# # # Get all borrow records for admin
# # @book_router.get("/admin/borrow-records")
# # async def get_all_borrow_records(current_user: dict = Depends(get_current_user)):
# #     if current_user.get("role") != "admin":
# #         raise HTTPException(status_code=403, detail="Admin access required")
    
# #     borrow_records = await db["borrow_records"].find().sort("request_date", -1).to_list(1000)
    
# #     # Get book details for each borrow record
# #     result = []
# #     for record in borrow_records:
# #         book = await db["books"].find_one({"_id": ObjectId(record["book_id"])})
# #         record = convert_objectid(record)
# #         if book:
# #             record["book"] = convert_objectid(book)
# #         result.append(record)
    
# #     return results



from fastapi import APIRouter, HTTPException, Depends, UploadFile, File, Form
from bson import ObjectId
from datetime import datetime, timedelta
import cloudinary
import cloudinary.uploader
from app.models.book import Book, BorrowRequest, BorrowRecord, ReturnRequest, BookStatus, BorrowStatus, Notification, NotificationType
from app.config.database import db
from app.utils.auth_handler import get_current_user

# Configure Cloudinary
cloudinary.config(
    cloud_name="dtisam8ot",
    api_key="416996345946976",
    api_secret="dcfIgNOmXE5GkMyXgOAHnMxVeLg"
)

book_router = APIRouter(prefix="/books", tags=["Books"])

# Helper function to convert ObjectId to string
def convert_objectid(doc):
    if doc and "_id" in doc:
        doc["_id"] = str(doc["_id"])
    return doc

# Helper to check if ObjectId is valid
def is_valid_objectid(id_str):
    try:
        ObjectId(id_str)
        return True
    except:
        return False

# Upload image to Cloudinary
async def upload_image_to_cloudinary(file: UploadFile):
    try:
        # Validate file type
        if not file.content_type.startswith('image/'):
            raise HTTPException(status_code=400, detail="File must be an image")
        
        # Validate file size (max 5MB)
        max_size = 5 * 1024 * 1024  # 5MB
        contents = await file.read()
        if len(contents) > max_size:
            raise HTTPException(status_code=400, detail="Image size must be less than 5MB")
        
        # Reset file pointer after reading
        await file.seek(0)
        
        # Upload to Cloudinary
        upload_result = cloudinary.uploader.upload(
            contents,
            folder="library_books"
        )
        
        return upload_result["secure_url"]
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Image upload failed: {str(e)}")

# IMAGE UPLOAD ENDPOINT
@book_router.post("/upload-image")
async def upload_book_image(
    image: UploadFile = File(...),
    current_user: dict = Depends(get_current_user)
):
    """
    Upload an image for a book
    """
    if current_user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    try:
        # Upload to Cloudinary
        image_url = await upload_image_to_cloudinary(image)
        
        return {
            "message": "Image uploaded successfully",
            "image_url": image_url
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to upload image: {str(e)}")

# BOOK MANAGEMENT
@book_router.get("/")
async def get_available_books():
    books = await db["books"].find({"available_copies": {"$gt": 0}}).to_list(1000)
    return [convert_objectid(book) for book in books]

@book_router.get("/all")
async def get_all_books(current_user: dict = Depends(get_current_user)):
    if current_user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    books = await db["books"].find().to_list(1000)
    return [convert_objectid(book) for book in books]

# ADD BOOK WITH IMAGE - UPDATED WITH PUBLISHER AND PUBLISHED_YEAR
@book_router.post("/")
async def add_book(
    title: str = Form(...),
    author: str = Form(...),
    isbn: str = Form(...),
    description: str = Form(...),
    total_copies: int = Form(...),
    available_copies: int = Form(...),
    category: str = Form(...),
    published_year: int = Form(None),  # New field
    publisher: str = Form(None),       # New field
    image: UploadFile = File(None),
    current_user: dict = Depends(get_current_user)
):
    if current_user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    # Check if book with same ISBN already exists
    existing_book = await db["books"].find_one({"isbn": isbn})
    if existing_book:
        raise HTTPException(status_code=400, detail="Book with this ISBN already exists")
    
    # Handle image upload
    image_url = None
    if image and image.filename:
        try:
            image_url = await upload_image_to_cloudinary(image)
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Image upload error: {str(e)}")
    
    # Validate available copies don't exceed total copies
    if available_copies > total_copies:
        raise HTTPException(
            status_code=400, 
            detail="Available copies cannot exceed total copies"
        )
    
    # Validate published year if provided
    if published_year is not None:
        current_year = datetime.now().year
        if published_year < 1000 or published_year > current_year + 5:
            raise HTTPException(
                status_code=400,
                detail=f"Published year must be between 1000 and {current_year + 5}"
            )
    
    # Create book document
    book_dict = {
        "title": title,
        "author": author,
        "isbn": isbn,
        "description": description,
        "total_copies": total_copies,
        "available_copies": available_copies,
        "category": category,
        "published_year": published_year,
        "publisher": publisher,
        "image_url": image_url,
        "created_at": datetime.now()
    }
    
    try:
        result = await db["books"].insert_one(book_dict)
        book_dict["_id"] = str(result.inserted_id)
        
        return {
            "message": "Book added successfully", 
            "book": book_dict,
            "image_uploaded": image_url is not None
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to add book: {str(e)}")

# UPDATE BOOK with publisher and published_year - UPDATED VERSION
@book_router.put("/{book_id}")
async def update_book(
    book_id: str,
    title: str = Form(None),
    author: str = Form(None),
    isbn: str = Form(None),
    description: str = Form(None),
    total_copies: int = Form(None),
    available_copies: int = Form(None),
    category: str = Form(None),
    published_year: int = Form(None),  # New field
    publisher: str = Form(None),       # New field
    image: UploadFile = File(None),
    current_user: dict = Depends(get_current_user)
):
    if current_user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    if not is_valid_objectid(book_id):
        raise HTTPException(status_code=400, detail="Invalid book ID format")
    
    existing_book = await db["books"].find_one({"_id": ObjectId(book_id)})
    if not existing_book:
        raise HTTPException(status_code=404, detail="Book not found")
    
    # Prepare update data
    update_data = {}
    
    if title is not None:
        update_data["title"] = title
    if author is not None:
        update_data["author"] = author
    if isbn is not None:
        # Check if ISBN is being changed and if it conflicts with another book
        if isbn != existing_book["isbn"]:
            isbn_exists = await db["books"].find_one({"isbn": isbn, "_id": {"$ne": ObjectId(book_id)}})
            if isbn_exists:
                raise HTTPException(status_code=400, detail="ISBN already exists")
        update_data["isbn"] = isbn
    if description is not None:
        update_data["description"] = description
    if total_copies is not None:
        update_data["total_copies"] = total_copies
    if available_copies is not None:
        # Ensure available copies don't exceed total copies
        total = total_copies if total_copies is not None else existing_book["total_copies"]
        if available_copies > total:
            raise HTTPException(
                status_code=400, 
                detail="Available copies cannot exceed total copies"
            )
        update_data["available_copies"] = available_copies
    if category is not None:
        update_data["category"] = category
    if published_year is not None:
        # Validate published year
        current_year = datetime.now().year
        if published_year < 1000 or published_year > current_year + 5:
            raise HTTPException(
                status_code=400,
                detail=f"Published year must be between 1000 and {current_year + 5}"
            )
        update_data["published_year"] = published_year
    if publisher is not None:
        update_data["publisher"] = publisher
    
    # Handle image upload if provided
    if image and image.filename:
        try:
            image_url = await upload_image_to_cloudinary(image)
            update_data["image_url"] = image_url
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Image upload error: {str(e)}")
    
    if update_data:
        await db["books"].update_one(
            {"_id": ObjectId(book_id)},
            {"$set": update_data}
        )
    
    return {"message": "Book updated successfully"}

# DELETE BOOK
@book_router.delete("/{book_id}")
async def delete_book(book_id: str, current_user: dict = Depends(get_current_user)):
    if current_user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    if not is_valid_objectid(book_id):
        raise HTTPException(status_code=400, detail="Invalid book ID format")
    
    existing_book = await db["books"].find_one({"_id": ObjectId(book_id)})
    if not existing_book:
        raise HTTPException(status_code=404, detail="Book not found")
    
    # Check if book is currently borrowed
    active_borrows = await db["borrow_records"].count_documents({
        "book_id": book_id,
        "status": {"$in": [BorrowStatus.BORROWED, BorrowStatus.PENDING, BorrowStatus.OVERDUE]}
    })
    
    if active_borrows > 0:
        raise HTTPException(
            status_code=400, 
            detail="Cannot delete book that is currently borrowed or has pending requests"
        )
    
    # Delete image from Cloudinary if exists
    if existing_book.get("image_url"):
        try:
            # Extract public_id from URL
            image_url = existing_book["image_url"]
            public_id = image_url.split("/")[-1].split(".")[0]
            cloudinary.uploader.destroy(f"library_books/{public_id}")
        except Exception as e:
            print(f"Error deleting image from Cloudinary: {e}")
    
    await db["books"].delete_one({"_id": ObjectId(book_id)})
    return {"message": "Book deleted successfully"}

# BORROWING SYSTEM (rest of the code remains the same)
@book_router.post("/borrow")
async def borrow_book(borrow_request: BorrowRequest, current_user: dict = Depends(get_current_user)):
    user_email = current_user.get("email")
    user_name = current_user.get("name", "User")
    
    # Validate book_id format
    if not is_valid_objectid(borrow_request.book_id):
        raise HTTPException(status_code=400, detail="Invalid book ID format")
    
    # Check if book exists
    book = await db["books"].find_one({"_id": ObjectId(borrow_request.book_id)})
    if not book:
        raise HTTPException(status_code=404, detail="Book not found")
    
    if book["available_copies"] <= 0:
        raise HTTPException(status_code=400, detail="No copies available")
    
    # Check if user already has a pending or active borrow for this book
    existing_borrow = await db["borrow_records"].find_one({
        "book_id": borrow_request.book_id,
        "user_email": user_email,
        "status": {"$in": [BorrowStatus.PENDING, BorrowStatus.BORROWED, BorrowStatus.OVERDUE]}
    })
    
    if existing_borrow:
        raise HTTPException(status_code=400, detail="You already have a pending or active borrow for this book")
    
    # Create borrow record with PENDING status
    borrow_record = {
        "book_id": borrow_request.book_id,
        "user_email": user_email,
        "user_name": user_name,
        "borrow_date": None,
        "due_date": None,
        "status": BorrowStatus.PENDING,
        "fine_amount": 0.0,
        "return_date": None,
        "request_date": datetime.now(),
        "approved_date": None
    }
    
    # Insert borrow record
    result = await db["borrow_records"].insert_one(borrow_record)
    borrow_record["_id"] = result.inserted_id
    
    # Create notification for admin
    notification = {
        "user_email": user_email,
        "title": "Borrow Request Submitted",
        "message": f"Your borrow request for '{book['title']}' has been submitted and is pending admin approval.",
        "type": NotificationType.BORROW_REQUEST,
        "borrow_id": str(borrow_record["_id"]),
        "book_id": borrow_request.book_id,
        "is_read": False,
        "created_at": datetime.now()
    }
    await db["notifications"].insert_one(notification)
    
    # Prepare response
    borrow_record_response = convert_objectid(borrow_record)
    borrow_record_response["book"] = convert_objectid(book)
    
    return {
        "message": "Borrow request submitted successfully. Waiting for admin approval.",
        "receipt": {
            "transaction_id": str(borrow_record["_id"]),
            "book_title": book["title"],
            "user_name": user_name,
            "request_date": datetime.now().isoformat(),
            "status": "pending",
            "note": "Your request is pending approval. You will receive a notification once approved."
        }
    }

@book_router.post("/return")
async def return_book(return_request: ReturnRequest, current_user: dict = Depends(get_current_user)):
    user_email = current_user.get("email")
    
    # Validate borrow_id format
    if not is_valid_objectid(return_request.borrow_id):
        raise HTTPException(status_code=400, detail="Invalid borrow ID format")
    
    # Find borrow record
    borrow_record = await db["borrow_records"].find_one({
        "_id": ObjectId(return_request.borrow_id),
        "user_email": user_email
    })
    
    if not borrow_record:
        raise HTTPException(status_code=404, detail="Borrow record not found")
    
    if borrow_record["status"] == BorrowStatus.RETURNED:
        raise HTTPException(status_code=400, detail="Book already returned")
    
    if borrow_record["status"] == BorrowStatus.PENDING:
        raise HTTPException(status_code=400, detail="Cannot return a book that is still pending approval")
    
    # Calculate fine if overdue
    return_date = datetime.now()
    fine_amount = 0.0
    
    if return_date > borrow_record["due_date"]:
        days_overdue = (return_date - borrow_record["due_date"]).days
        fine_amount = days_overdue * 5.0  # $5 per day fine
    
    # Update borrow record
    await db["borrow_records"].update_one(
        {"_id": ObjectId(return_request.borrow_id)},
        {
            "$set": {
                "return_date": return_date,
                "status": BorrowStatus.RETURNED,
                "fine_amount": fine_amount
            }
        }
    )
    
    # Update book available copies
    await db["books"].update_one(
        {"_id": ObjectId(borrow_record["book_id"])},
        {"$inc": {"available_copies": 1}}
    )
    
    # Create return notification
    book = await db["books"].find_one({"_id": ObjectId(borrow_record["book_id"])})
    notification = {
        "user_email": user_email,
        "title": "Book Returned",
        "message": f"You have successfully returned '{book['title'] if book else 'the book'}'. Fine amount: ${fine_amount}",
        "type": NotificationType.BOOK_RETURNED,
        "borrow_id": return_request.borrow_id,
        "book_id": borrow_record["book_id"],
        "is_read": False,
        "created_at": datetime.now()
    }
    await db["notifications"].insert_one(notification)
    
    return {"message": "Book returned successfully", "fine_amount": fine_amount}

# ADMIN BORROW MANAGEMENT
@book_router.get("/pending-requests")
async def get_pending_borrow_requests(current_user: dict = Depends(get_current_user)):
    if current_user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    pending_requests = await db["borrow_records"].find({
        "status": BorrowStatus.PENDING
    }).sort("request_date", -1).to_list(1000)
    
    # Get book details for each request
    result = []
    for request in pending_requests:
        book = await db["books"].find_one({"_id": ObjectId(request["book_id"])})
        request = convert_objectid(request)
        if book:
            request["book"] = convert_objectid(book)
        result.append(request)
    
    return result

@book_router.put("/approve-borrow/{borrow_id}")
async def approve_borrow_request(
    borrow_id: str, 
    current_user: dict = Depends(get_current_user)
):
    if current_user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    if not is_valid_objectid(borrow_id):
        raise HTTPException(status_code=400, detail="Invalid borrow ID format")
    
    # Find borrow record
    borrow_record = await db["borrow_records"].find_one({
        "_id": ObjectId(borrow_id),
        "status": BorrowStatus.PENDING
    })
    
    if not borrow_record:
        raise HTTPException(status_code=404, detail="Pending borrow request not found")
    
    # Check if book is still available
    book = await db["books"].find_one({"_id": ObjectId(borrow_record["book_id"])})
    if not book:
        raise HTTPException(status_code=404, detail="Book not found")
    
    if book["available_copies"] <= 0:
        # Update borrow status to rejected
        await db["borrow_records"].update_one(
            {"_id": ObjectId(borrow_id)},
            {"$set": {"status": BorrowStatus.REJECTED}}
        )
        
        # Create rejection notification
        notification = {
            "user_email": borrow_record["user_email"],
            "title": "Borrow Request Rejected",
            "message": f"Your borrow request for '{book['title']}' was rejected because no copies are available.",
            "type": NotificationType.BORROW_REJECTED,
            "borrow_id": borrow_id,
            "book_id": borrow_record["book_id"],
            "is_read": False,
            "created_at": datetime.now()
        }
        await db["notifications"].insert_one(notification)
        
        raise HTTPException(status_code=400, detail="No copies available")
    
    # Calculate dates
    borrow_date = datetime.now()
    due_date = borrow_date + timedelta(days=14)  # Default 14 days
    
    # Update borrow record
    await db["borrow_records"].update_one(
        {"_id": ObjectId(borrow_id)},
        {
            "$set": {
                "status": BorrowStatus.BORROWED,
                "borrow_date": borrow_date,
                "due_date": due_date,
                "approved_date": datetime.now()
            }
        }
    )
    
    # Update book available copies
    await db["books"].update_one(
        {"_id": ObjectId(borrow_record["book_id"])},
        {"$inc": {"available_copies": -1}}
    )
    
    # Create approval notification
    notification = {
        "user_email": borrow_record["user_email"],
        "title": "Borrow Request Approved",
        "message": f"Your borrow request for '{book['title']}' has been approved. Due date: {due_date.strftime('%Y-%m-%d')}",
        "type": NotificationType.BORROW_APPROVED,
        "borrow_id": borrow_id,
        "book_id": borrow_record["book_id"],
        "is_read": False,
        "created_at": datetime.now()
    }
    await db["notifications"].insert_one(notification)
    
    return {"message": "Borrow request approved successfully"}

@book_router.put("/reject-borrow/{borrow_id}")
async def reject_borrow_request(
    borrow_id: str, 
    current_user: dict = Depends(get_current_user)
):
    if current_user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    if not is_valid_objectid(borrow_id):
        raise HTTPException(status_code=400, detail="Invalid borrow ID format")
    
    # Find borrow record
    borrow_record = await db["borrow_records"].find_one({
        "_id": ObjectId(borrow_id),
        "status": BorrowStatus.PENDING
    })
    
    if not borrow_record:
        raise HTTPException(status_code=404, detail="Pending borrow request not found")
    
    book = await db["books"].find_one({"_id": ObjectId(borrow_record["book_id"])})
    
    # Update borrow status to rejected
    await db["borrow_records"].update_one(
        {"_id": ObjectId(borrow_id)},
        {"$set": {"status": BorrowStatus.REJECTED}}
    )
    
    # Create rejection notification
    notification = {
        "user_email": borrow_record["user_email"],
        "title": "Borrow Request Rejected",
        "message": f"Your borrow request for '{book['title'] if book else 'the book'}' was rejected.",
        "type": NotificationType.BORROW_REJECTED,
        "borrow_id": borrow_id,
        "book_id": borrow_record["book_id"],
        "is_read": False,
        "created_at": datetime.now()
    }
    await db["notifications"].insert_one(notification)
    
    return {"message": "Borrow request rejected successfully"}

# USER BORROW RECORDS
@book_router.get("/my-borrows")
async def get_my_borrowed_books(current_user: dict = Depends(get_current_user)):
    user_email = current_user.get("email")
    
    borrow_records = await db["borrow_records"].find({
        "user_email": user_email,
        "status": {"$in": [BorrowStatus.PENDING, BorrowStatus.BORROWED, BorrowStatus.OVERDUE]}
    }).sort("request_date", -1).to_list(1000)
    
    # Get book details for each borrow record
    result = []
    for record in borrow_records:
        book = await db["books"].find_one({"_id": ObjectId(record["book_id"])})
        record = convert_objectid(record)
        if book:
            record["book"] = convert_objectid(book)
        result.append(record)
    
    return result

@book_router.get("/borrowing-history")
async def get_borrowing_history(current_user: dict = Depends(get_current_user)):
    user_email = current_user.get("email")
    
    borrow_records = await db["borrow_records"].find({
        "user_email": user_email,
        "status": {"$in": [BorrowStatus.RETURNED, BorrowStatus.REJECTED]}
    }).sort("request_date", -1).to_list(1000)
    
    # Get book details for each borrow record
    result = []
    for record in borrow_records:
        book = await db["books"].find_one({"_id": ObjectId(record["book_id"])})
        record = convert_objectid(record)
        if book:
            record["book"] = convert_objectid(book)
        result.append(record)
    
    return result

# NOTIFICATION SYSTEM
@book_router.get("/notifications")
async def get_user_notifications(current_user: dict = Depends(get_current_user)):
    user_email = current_user.get("email")
    
    notifications = await db["notifications"].find({
        "user_email": user_email
    }).sort("created_at", -1).to_list(1000)
    
    return [convert_objectid(notif) for notif in notifications]

@book_router.put("/notifications/{notification_id}/read")
async def mark_notification_as_read(
    notification_id: str, 
    current_user: dict = Depends(get_current_user)
):
    user_email = current_user.get("email")
    
    if not is_valid_objectid(notification_id):
        raise HTTPException(status_code=400, detail="Invalid notification ID format")
    
    result = await db["notifications"].update_one(
        {"_id": ObjectId(notification_id), "user_email": user_email},
        {"$set": {"is_read": True}}
    )
    
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Notification not found")
    
    return {"message": "Notification marked as read"}

@book_router.delete("/notifications/{notification_id}")
async def delete_notification(
    notification_id: str, 
    current_user: dict = Depends(get_current_user)
):
    user_email = current_user.get("email")
    
    if not is_valid_objectid(notification_id):
        raise HTTPException(status_code=400, detail="Invalid notification ID format")
    
    result = await db["notifications"].delete_one({
        "_id": ObjectId(notification_id), 
        "user_email": user_email
    })
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Notification not found")
    
    return {"message": "Notification deleted successfully"}

# Get all borrow records for admin
@book_router.get("/admin/borrow-records")
async def get_all_borrow_records(current_user: dict = Depends(get_current_user)):
    if current_user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    borrow_records = await db["borrow_records"].find().sort("request_date", -1).to_list(1000)
    
    # Get book details for each borrow record
    result = []
    for record in borrow_records:
        book = await db["books"].find_one({"_id": ObjectId(record["book_id"])})
        record = convert_objectid(record)
        if book:
            record["book"] = convert_objectid(book)
        result.append(record)
    
    return result