# AI-Based Student Attendance System

A full-stack student attendance system using real-time face recognition. Built with FastAPI, React, and OpenCV.

## Features
- **Face Recognition Attendance**: Mark attendance by simply looking at the camera.
- **Student Dashboard**: View attendance history and performance metrics.
- **Teacher Dashboard**: View all records, filter by name/roll, and export data to CSV.
- **Secure Authentication**: JWT-based login for students and teachers.
- **Modern UI**: Sleek dark theme with premium animations and charts.

## Tech Stack
- **Backend**: FastAPI (Python), SQLAlchemy, SQLite, face_recognition, OpenCV, Pandas.
- **Frontend**: React (Vite), Tailwind CSS, Lucide-React, Recharts, React-Webcam.

## Getting Started

### Prerequisites
- Python 3.8+
- Node.js 16+
- Webcam (for attendance marking and registration)

### Installation

#### 1. Backend Setup
1. Navigate to the `backend` folder:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
3. Run the backend server:
   ```bash
   uvicorn main:app --reload
   ```
   The API will be available at `http://localhost:8000`.

#### 2. Frontend Setup
1. Navigate to the `frontend` folder:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```
   The application will be available at `http://localhost:5173`.

## Project Structure
```
├── backend/
│   ├── main.py            # API routes and logic
│   ├── models.py          # Database models
│   ├── schemas.py         # Pydantic schemas
│   ├── face_service.py    # AI/Face Recognition logic
│   ├── auth_utils.py      # JWT & Password hashing
│   └── database.py        # SQLAlchemy configuration
├── frontend/
│   ├── src/
│   │   ├── pages/         # Dashboard, Login, Attendance pages
│   │   ├── components/    # Reusable UI components
│   │   ├── api/           # API communication layer
│   │   └── App.jsx        # Routing and Layout
│   ├── tailwind.config.js
│   └── index.html
└── README.md
```

## Usage
1. **Register as a Teacher**: Create a teacher account to access the main dashboard.
2. **Register as a Student**: Fill in details and capture 3-5 face images.
3. **Login**: Sign in with your email and password.
4. **Mark Attendance**: Click "Mark Attendance" on the sidebar (Teacher mode) or access the webcam to mark presence.
5. **View Reports**: Teachers can view all records and export them for reporting.
