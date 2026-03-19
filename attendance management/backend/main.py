from fastapi import FastAPI, Depends, HTTPException, status, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from datetime import datetime
import json
import pandas as pd
import io
from typing import List, Optional

import models, schemas, database, auth_utils, face_service
from database import engine, get_db

# Create tables
models.Base.metadata.create_all(bind=engine)

def log_debug(message):
    with open("reg_debug.log", "a") as f:
        f.write(f"[{datetime.now()}] {message}\n")

app = FastAPI(title="Student Attendance System API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "Student Attendance System API is running"}

# --- AUTH ENDPOINTS ---

@app.post("/register/teacher")
def register_teacher(teacher: schemas.TeacherCreate, db: Session = Depends(get_db)):
    db_user = db.query(models.Teacher).filter(models.Teacher.email == teacher.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    hashed_password = auth_utils.get_password_hash(teacher.password)
    db_teacher = models.Teacher(
        full_name=teacher.full_name,
        email=teacher.email,
        hashed_password=hashed_password
    )
    db.add(db_teacher)
    db.commit()
    db.refresh(db_teacher)
    return {"message": "Teacher registered successfully"}

@app.post("/register/student")
def register_student(student: schemas.StudentCreate, db: Session = Depends(get_db)):
    db_user = db.query(models.Student).filter(models.Student.email == student.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    log_debug(f"Registering student {student.email} with {len(student.face_encodings)} encodings")
    log_debug(f"DEBUG: Internal Password Length: {len(student.password)}")
    if len(student.password) > 0:
        log_debug(f"DEBUG: Password Prefix: {student.password[:10]}...")
    try:
        hashed_password = auth_utils.get_password_hash(student.password)
        db_student = models.Student(
            full_name=student.full_name,
            roll_number=student.roll_number,
            department=student.department,
            class_name=student.class_name,
            mobile_number=student.mobile_number,
            email=student.email,
            hashed_password=hashed_password
        )
        db.add(db_student)
        db.commit()
        db.refresh(db_student)
        
        # Store face encodings
        for encoding_list in student.face_encodings:
            db_encoding = models.FaceEncoding(
                student_id=db_student.id,
                encoding=json.dumps(encoding_list)
            )
            db.add(db_encoding)
        
        db.commit()
        log_debug(f"Student {student.email} registered successfully")
        return {"message": "Student registered successfully"}
    except Exception as e:
        log_debug(f"ERR: Registration failed for {student.email}: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/login")
def login(user_credentials: schemas.UserLogin, db: Session = Depends(get_db)):
    # Check if teacher
    user = db.query(models.Teacher).filter(models.Teacher.email == user_credentials.email).first()
    role = "teacher"
    
    if not user:
        # Check if student
        user = db.query(models.Student).filter(models.Student.email == user_credentials.email).first()
        role = "student"
        
    if not user or not auth_utils.verify_password(user_credentials.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token = auth_utils.create_access_token(data={"sub": user.email, "role": role})
    return {
        "access_token": access_token, 
        "token_type": "bearer", 
        "role": role, 
        "user_id": user.id,
        "name": user.full_name
    }

# --- ATTENDANCE ENDPOINTS ---

@app.post("/attendance/mark")
async def mark_attendance(image_data: dict, db: Session = Depends(get_db)):
    # image_data expected: {"image": "base64_string"}
    base64_image = image_data.get("image")
    if not base64_image:
        raise HTTPException(status_code=400, detail="No image provided")
        
    captured_encodings = face_service.get_face_encodings_from_base64(base64_image)
    if not captured_encodings:
        return {"status": "error", "message": "No face detected"}
    
    # Only process the first face for simplicity
    captured_encoding = captured_encodings[0]
    
    # Get all students and their encodings
    students = db.query(models.Student).all()
    
    for student in students:
        db_encodings = db.query(models.FaceEncoding).filter(models.FaceEncoding.student_id == student.id).all()
        known_encodings = [json.loads(enc.encoding) for enc in db_encodings]
        
        if face_service.compare_faces(known_encodings, captured_encoding):
            # Found a match!
            today = datetime.now().strftime("%Y-%m-%d")
            
            # Check if already marked today
            existing = db.query(models.Attendance).filter(
                models.Attendance.student_id == student.id,
                models.Attendance.date == today
            ).first()
            
            if existing:
                return {"status": "already_marked", "student_name": student.full_name}
            
            # Mark attendance
            now = datetime.now()
            new_attendance = models.Attendance(
                student_id=student.id,
                date=today,
                time=now.strftime("%H:%M:%S"),
                status="Present"
            )
            db.add(new_attendance)
            db.commit()
            
            return {
                "status": "success", 
                "student_name": student.full_name,
                "roll_number": student.roll_number
            }
            
    return {"status": "error", "message": "Face not recognized"}

# --- DASHBOARD ENDPOINTS ---

@app.get("/attendance/history/student/{student_id}")
def get_student_history(student_id: int, db: Session = Depends(get_db)):
    records = db.query(models.Attendance).filter(models.Attendance.student_id == student_id).all()
    return records

@app.get("/attendance/all")
def get_all_attendance(db: Session = Depends(get_db)):
    # Simple join to get student info
    results = db.query(models.Attendance, models.Student).join(models.Student).all()
    
    report = []
    for att, stu in results:
        report.append({
            "id": att.id,
            "student_id": stu.id,
            "name": stu.full_name,
            "roll_no": stu.roll_number,
            "department": stu.department,
            "date": att.date,
            "time": att.time,
            "status": att.status
        })
    return report

@app.get("/attendance/export")
def export_attendance(db: Session = Depends(get_db)):
    results = db.query(models.Attendance, models.Student).join(models.Student).all()
    
    data = []
    for att, stu in results:
        data.append({
            "Student Name": stu.full_name,
            "Roll Number": stu.roll_number,
            "Department": stu.department,
            "Class": stu.class_name,
            "Date": att.date,
            "Time": att.time,
            "Status": att.status
        })
    
    df = pd.DataFrame(data)
    stream = io.StringIO()
    df.to_csv(stream, index=False)
    
    # In a real app, returning a FileResponse would be better
    return {"csv": stream.getvalue()}

@app.post("/face/encoding")
async def get_face_encoding(image_data: dict):
    # image_data expected: {"image": "base64_string"}
    base64_image = image_data.get("image")
    if not base64_image:
        log_debug("No image provided in /face/encoding")
        raise HTTPException(status_code=400, detail="No image provided")
        
    try:
        captured_encodings = face_service.get_face_encodings_from_base64(base64_image)
        if not captured_encodings:
            log_debug("No face detected in /face/encoding")
            return {"status": "error", "message": "No face detected"}
        
        log_debug(f"Face detected, encoding length: {len(captured_encodings[0])}")
        return {"status": "success", "encoding": captured_encodings[0]}
    except Exception as e:
        log_debug(f"ERR: /face/encoding failed: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
