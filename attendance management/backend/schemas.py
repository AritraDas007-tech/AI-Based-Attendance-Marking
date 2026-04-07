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
    class_year: str
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
    department: Optional[str] = None
    class_year: Optional[str] = None

class AttendanceResponse(AttendanceBase):
    id: int
    student_name: str
    roll_number: str

    class Config:
        orm_mode = True

class DepartmentBase(BaseModel):
    name: str
    years: str

class DepartmentCreate(DepartmentBase):
    pass

class Department(DepartmentBase):
    id: int
    class Config:
        orm_mode = True

class ScheduleBase(BaseModel):
    department_id: int
    year: str
    subject: str
    day: str
    start_time: str
    end_time: str

class ScheduleCreate(ScheduleBase):
    pass

class Schedule(ScheduleBase):
    id: int
    department_name: Optional[str] = None
    class Config:
        orm_mode = True
