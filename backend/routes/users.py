"""
Users Route - POST /users, GET /users/{id}
User management
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database.connection import get_db
from database.models import User
from models.schemas import UserCreate, UserResponse
from typing import List

router = APIRouter(prefix="/users", tags=["Users"])


@router.post("", response_model=UserResponse, status_code=201)
async def create_user(user: UserCreate, db: Session = Depends(get_db)):
    """Create a new user."""
    existing = db.query(User).filter(User.username == user.username).first()
    if existing:
        raise HTTPException(status_code=409, detail="Username already exists.")

    db_user = User(username=user.username, email=user.email)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user


@router.get("", response_model=List[UserResponse])
async def list_users(db: Session = Depends(get_db)):
    """List all users."""
    return db.query(User).all()


@router.get("/by-email", response_model=UserResponse)
async def get_user_by_email(email: str, db: Session = Depends(get_db)):
    """Get a user by email address."""
    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")
    return user


@router.post("/sync", response_model=UserResponse)
async def sync_user(user: UserCreate, db: Session = Depends(get_db)):
    """Create user if not exists, or return existing user. Used by frontend after login."""
    # Try by email first
    if user.email:
        existing = db.query(User).filter(User.email == user.email).first()
        if existing:
            return existing
    # Try by username
    existing = db.query(User).filter(User.username == user.username).first()
    if existing:
        return existing
    # Create new
    db_user = User(username=user.username, email=user.email)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user


@router.get("/{user_id}", response_model=UserResponse)
async def get_user(user_id: int, db: Session = Depends(get_db)):
    """Get a specific user by ID."""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")
    return user

from pydantic import BaseModel

class ProfileUpdate(BaseModel):
    username: str
    target_user_id: int

@router.put("/me/profile", response_model=UserResponse)
async def update_profile(profile: ProfileUpdate, db: Session = Depends(get_db)):
    """Update user profile."""
    # We pass the user id manually from frontend since we don't have full auth tokens
    user = db.query(User).filter(User.id == profile.target_user_id).first()
    if not user:
         raise HTTPException(status_code=404, detail="User not found.")
    
    # Optional check if new username exists
    existing = db.query(User).filter(User.username == profile.username, User.id != profile.target_user_id).first()
    if existing:
        raise HTTPException(status_code=409, detail="Username is already taken.")

    user.username = profile.username
    db.commit()
    db.refresh(user)
    return user
