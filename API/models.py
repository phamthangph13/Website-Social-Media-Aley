from config import db
from bson import ObjectId
from werkzeug.security import generate_password_hash, check_password_hash
import datetime
import re

class User:
    def __init__(self, fullname=None, email=None, password=None, created_at=None, updated_at=None, 
                 is_verified=False, verification_token=None, token_expiration=None, _id=None):
        self.fullname = fullname
        self.email = email
        self.password = password  # Stored as hashed
        self.created_at = created_at or datetime.datetime.utcnow()
        self.updated_at = updated_at or datetime.datetime.utcnow()
        self.is_verified = is_verified
        self.verification_token = verification_token
        self.token_expiration = token_expiration
        self._id = _id

    @staticmethod
    def create_user(fullname, email, password, verification_token=None):
        """Create a new user with hashed password"""
        # Check if email already exists
        if db.users.find_one({"email": email}):
            return None, "Email already exists"
        
        # Validate email format
        if not re.match(r"[^@]+@[^@]+\.[^@]+", email):
            return None, "Invalid email format"
        
        # Validate password strength (at least 6 characters)
        if len(password) < 6:
            return None, "Password must be at least 6 characters long"
        
        # Hash password
        hashed_password = generate_password_hash(password)
        
        user_data = {
            "fullname": fullname,
            "email": email,
            "password": hashed_password,
            "created_at": datetime.datetime.utcnow(),
            "updated_at": datetime.datetime.utcnow(),
            "is_verified": False,
            "verification_token": verification_token,
            "token_expiration": datetime.datetime.utcnow() + datetime.timedelta(hours=24)
        }
        
        # Insert user into database
        result = db.users.insert_one(user_data)
        user_data["_id"] = result.inserted_id
        
        return User(**user_data), None
    
    @staticmethod
    def find_by_email(email):
        """Find user by email"""
        user_data = db.users.find_one({"email": email})
        if user_data:
            return User(**user_data)
        return None
    
    @staticmethod
    def find_by_verification_token(token):
        """Find user by verification token"""
        user_data = db.users.find_one({"verification_token": token})
        if user_data:
            return User(**user_data)
        return None
    
    @staticmethod
    def find_by_id(user_id):
        """Find user by ID"""
        if not ObjectId.is_valid(user_id):
            return None
        
        user_data = db.users.find_one({"_id": ObjectId(user_id)})
        if user_data:
            return User(**user_data)
        return None
    
    def verify_password(self, password):
        """Verify password against stored hash"""
        return check_password_hash(self.password, password)
    
    def update_password(self, new_password):
        """Update user password"""
        hashed_password = generate_password_hash(new_password)
        db.users.update_one(
            {"_id": self._id},
            {
                "$set": {
                    "password": hashed_password,
                    "updated_at": datetime.datetime.utcnow()
                }
            }
        )
        self.password = hashed_password
        self.updated_at = datetime.datetime.utcnow()
        return True
        
    def verify_email(self):
        """Mark user email as verified"""
        db.users.update_one(
            {"_id": self._id},
            {
                "$set": {
                    "is_verified": True,
                    "verification_token": None,
                    "token_expiration": None,
                    "updated_at": datetime.datetime.utcnow()
                }
            }
        )
        self.is_verified = True
        self.verification_token = None
        self.token_expiration = None
        self.updated_at = datetime.datetime.utcnow()
        return True 