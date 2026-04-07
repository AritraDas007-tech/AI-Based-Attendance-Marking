from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text, Boolean
from sqlalchemy.orm import relationship
from database import Base
import datetime

class Teacher(Base):
    __tablename__ = "teachers"

    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String(100))
    email = Column(String(100), unique=True, index=True)
    hashed_password = Column(String(200))

class Student(Base):
    __tablename__ = "students"

    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String(100))
    roll_number = Column(String(50), unique=True, index=True)
    department = Column(String(100))
    class_year = Column(String(50))
    mobile_number = Column(String(15))
    email = Column(String(100), unique=True, index=True)
    hashed_password = Column(String(200))
    # Multiple encodings can be stored as JSON or in a separate table.
    # We'll use a simple approach: a separate table for face encodings.
    face_encodings = relationship("FaceEncoding", back_populates="student")

class FaceEncoding(Base):
    __tablename__ = "face_encodings"
    
    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id"))
    encoding = Column(Text) # Store as JSON string of the list
    
    student = relationship("Student", back_populates="face_encodings")

class Attendance(Base):
    __tablename__ = "attendance"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id"))
    date = Column(String(10)) # YYYY-MM-DD
    time = Column(String(8))  # HH:MM:SS
    status = Column(String(20)) # Present/Absent
    department = Column(String(100)) # Tracking branch at time of marking
    class_year = Column(String(50))   # Tracking year at time of marking
    
    student = relationship("Student")

class Department(Base):
    __tablename__ = "departments"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True)
    years = Column(String(200)) # Store as comma-separated: "1,2,3,4"

class Schedule(Base):
    __tablename__ = "schedules"
    id = Column(Integer, primary_key=True, index=True)
    department_id = Column(Integer, ForeignKey("departments.id"))
    year = Column(String(20))
    subject = Column(String(100))
    day = Column(String(20)) # Monday, Tuesday, etc.
    start_time = Column(String(10)) # HH:MM
    end_time = Column(String(10))   # HH:MM
    
    department = relationship("Department")
