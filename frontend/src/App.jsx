import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Login from './pages/Login';
import Attendance from './pages/Attendance';
import RegisterTeacher from './pages/RegisterTeacher';
import RegisterStudent from './pages/RegisterStudent';
import TeacherDashboard from './pages/TeacherDashboard';
import StudentDashboard from './pages/StudentDashboard';

const PrivateRoute = ({ children, allowedRoles }) => {
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');

  if (!token) return <Navigate to="/login" />;
  if (allowedRoles && !allowedRoles.includes(role)) return <Navigate to="/dashboard" />;

  return (
    <div className="flex bg-[#0f172a] min-h-screen">
      <Sidebar role={role} />
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
};

const DashboardRedirect = () => {
  const role = localStorage.getItem('role');
  if (role === 'teacher') return <TeacherDashboard />;
  if (role === 'student') return <StudentDashboard />;
  return <Navigate to="/login" />;
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register-teacher" element={<RegisterTeacher />} />
        <Route path="/register-student" element={<RegisterStudent />} />
        
        <Route path="/dashboard" element={
          <PrivateRoute>
            <DashboardRedirect />
          </PrivateRoute>
        } />
        
        <Route path="/attendance" element={
          <PrivateRoute allowedRoles={['student']}>
            <Attendance />
          </PrivateRoute>
        } />

        <Route path="/" element={<Navigate to="/dashboard" />} />
      </Routes>
    </Router>
  );
}

export default App;
