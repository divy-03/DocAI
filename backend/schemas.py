from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime
from models import DocumentType

# User Schemas
class UserBase(BaseModel):
    email: EmailStr
    username: str

class UserCreate(UserBase):
    password: str

class UserResponse(UserBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True

# Token Schemas
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None

# Section Schemas
class SectionBase(BaseModel):
    title: str
    order: int

class SectionCreate(SectionBase):
    pass

class SectionResponse(SectionBase):
    id: int
    content: Optional[str] = None
    project_id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

# Project Schemas
class ProjectBase(BaseModel):
    title: str
    topic: str
    document_type: DocumentType

class ProjectCreate(ProjectBase):
    sections: List[SectionCreate]

class ProjectUpdate(BaseModel):
    title: Optional[str] = None
    topic: Optional[str] = None

class ProjectResponse(ProjectBase):
    id: int
    user_id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    sections: List[SectionResponse] = []

    class Config:
        from_attributes = True

class ProjectListResponse(ProjectBase):
    id: int
    user_id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    section_count: int = 0

    class Config:
        from_attributes = True

