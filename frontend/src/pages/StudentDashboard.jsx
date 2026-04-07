import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  CheckCircle, 
  Clock, 
  Trophy,
  PieChart as PieIcon,
  Trash2,
  AlertTriangle
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import api from '../api/api';

const StudentDashboard = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const studentId = localStorage.getItem('userId');
  const userName = localStorage.getItem('userName');

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await api.get(`/attendance/history/student/${studentId}`);
        setHistory(response.data);
      } catch (err) {
        console.error('Failed to fetch history');
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, [studentId]);

  const handleDeleteAccount = async () => {
    if (window.confirm("Are you sure you want to delete your account? This action is permanent and will remove all your attendance data.")) {
      try {
        await api.delete(`/students/${studentId}`);
        alert("Your account has been deleted successfully.");
        // Cleanup local storage and redirect
        localStorage.clear();
        window.location.href = '/login';
      } catch (err) {
        console.error('Account deletion failed:', err);
        alert(err.response?.data?.detail || 'Failed to delete account');
      }
    }
  };

  const presentCount = history.length;
  const totalDays = 30; // Mock total days
  const absentCount = totalDays - presentCount;

  const pieData = [
    { name: 'Present', value: presentCount, color: '#10b981' },
    { name: 'Absent', value: absentCount, color: '#ef4444' },
  ];

  const attendancePercentage = Math.round((presentCount / totalDays) * 100);

  return (
    <div className="p-8 space-y-8 animate-in slide-in-from-bottom duration-500">
      <div className="flex items-center space-x-4">
        <div className="w-16 h-16 rounded-2xl bg-blue-600 flex items-center justify-center text-white text-3xl font-bold shadow-lg shadow-blue-600/20">
          {userName ? userName[0] : 'S'}
        </div>
        <div>
          <h1 className="text-3xl font-bold text-white">Hello, {userName}!</h1>
          <p className="text-dark-muted">Track your daily attendance performance</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="md:col-span-1 card flex flex-col items-center justify-center space-y-4">
          <h3 className="text-lg font-semibold text-dark-muted flex items-center space-x-2">
            <PieIcon size={18} />
            <span>Attendance Rate</span>
          </h3>
          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="text-center">
            <p className="text-4xl font-black text-white">{attendancePercentage}%</p>
            <p className="text-sm text-green-500 font-medium">Keep it up!</p>
          </div>
        </div>

        <div className="md:col-span-3 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="card bg-slate-800/50 flex justify-between items-center group cursor-pointer hover:bg-blue-600/10 transition-all border-blue-500/20" onClick={() => window.location.href='/attendance'}>
              <div className="space-y-1">
                <p className="text-sm text-blue-400 font-semibold uppercase tracking-wider">Active Action</p>
                <p className="text-3xl font-bold text-white">Mark Attendance</p>
                <p className="text-xs text-dark-muted">Verify your identity via AI</p>
              </div>
              <div className="bg-blue-600 p-3 rounded-xl shadow-lg shadow-blue-600/40 group-hover:scale-110 transition-transform">
                <CheckCircle size={28} className="text-white" />
              </div>
            </div>
            <div className="card bg-slate-800/50 flex justify-between items-center">
              <div className="space-y-1">
                <p className="text-sm text-dark-muted font-semibold uppercase tracking-wider">Performance</p>
                <p className="text-3xl font-bold text-white">12 Days</p>
                <p className="text-xs text-dark-muted">Current Streak</p>
              </div>
              <Trophy size={40} className="text-yellow-500/40" />
            </div>
          </div>

          <div className="card">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold flex items-center space-x-2">
                <Clock size={20} className="text-blue-500" />
                <span>Attendance History</span>
              </h2>
            </div>
            <div className="space-y-4">
              {history.slice(0, 5).map((row) => (
                <div key={row.id} className="flex items-center justify-between p-4 bg-dark-bg/60 rounded-xl border border-dark-border">
                  <div className="flex items-center space-x-4">
                    <div className="bg-blue-500/10 p-2 rounded-lg">
                      <Calendar size={18} className="text-blue-500" />
                    </div>
                    <div>
                      <p className="font-medium text-white">{row.date}</p>
                      <p className="text-xs text-dark-muted">{row.time}</p>
                    </div>
                  </div>
                  <span className="px-3 py-1 bg-green-500/10 text-green-500 rounded-full text-xs font-bold uppercase">
                    Present
                  </span>
                </div>
              ))}
              {history.length === 0 && (
                <div className="text-center py-12 text-dark-muted flex flex-col items-center space-y-2">
                  <div className="w-12 h-12 rounded-full border-2 border-dashed border-dark-border flex items-center justify-center">
                    ?
                  </div>
                  <p>No attendance records found yet.</p>
                </div>
              )}
            </div>
          </div>

          <div className="card border-red-500/20 bg-red-500/5">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold text-red-500 flex items-center space-x-2">
                  <AlertTriangle size={20} />
                  <span>Danger Zone</span>
                </h3>
                <p className="text-sm text-dark-muted">Permanently delete your account and all records.</p>
              </div>
              <button 
                onClick={handleDeleteAccount}
                className="px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all font-bold flex items-center justify-center space-x-2 shadow-lg shadow-red-600/20 outline-none"
              >
                <Trash2 size={18} />
                <span>Delete My Account</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
