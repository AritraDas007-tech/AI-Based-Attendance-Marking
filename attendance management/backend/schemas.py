from pydantic import BaseModel, EmailStr
from typing import List, Optional

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None
    role: Optional[str] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class StudentCreate(BaseModel):
    full_name: str
    roll_number: str
    department: str
    class_name: str
    mobile_number: str
    email: EmailStr
    password: str
    face_encodings: List[List[float]] # List of face encodings

class TeacherCreate(BaseModel):
    full_name: str
    email: EmailStr
    password: str

class AttendanceBase(BaseModel):
    student_id: int
    date: str
    time: str
    status: str

class AttendanceResponse(AttendanceBase):
    id: int
    student_name: str
    roll_number: str

    class Config:
        orm_mode = True
