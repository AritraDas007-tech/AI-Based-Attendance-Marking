import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Calendar, 
  Download, 
  TrendingUp, 
  Search,
  CheckCircle,
  XCircle,
  Clock
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import api from '../api/api';

const TeacherDashboard = () => {
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchAttendance();
  }, []);

  const fetchAttendance = async () => {
    try {
      const response = await api.get('/attendance/all');
      setAttendance(response.data);
    } catch (err) {
      console.error('Failed to fetch attendance');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      const response = await api.get('/attendance/export');
      const blob = new Blob([response.data.csv], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `attendance_report_${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
    } catch (err) {
      alert('Export failed');
    }
  };

  // Mock stats for chart (Attendance by day)
  const chartData = [
    { name: 'Mon', count: 42 },
    { name: 'Tue', count: 38 },
    { name: 'Wed', count: 45 },
    { name: 'Thu', count: 40 },
    { name: 'Fri', count: 35 },
  ];

  const filteredAttendance = attendance.filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.roll_no.includes(searchTerm)
  );

  const stats = [
    { label: 'Total Students', value: '156', icon: <Users />, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { label: 'Present Today', value: attendance.filter(a => a.date === new Date().toISOString().split('T')[0]).length || '0', icon: <CheckCircle />, color: 'text-green-500', bg: 'bg-green-500/10' },
    { label: 'Avg. Attendance', value: '88%', icon: <TrendingUp />, color: 'text-purple-500', bg: 'bg-purple-500/10' },
  ];

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white">Teacher Dashboard</h1>
          <p className="text-[#94a3b8]">Overview of student attendance and reports</p>
        </div>
        <button 
          onClick={handleExport}
          className="btn-primary flex items-center space-x-2 bg-slate-700 hover:bg-slate-600"
        >
          <Download size={18} />
          <span>Export CSV</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="card flex items-center space-x-4">
            <div className={`p-4 rounded-xl ${stat.bg} ${stat.color}`}>
              {stat.icon}
            </div>
            <div>
              <p className="text-sm text-[#94a3b8] font-medium uppercase tracking-wider">{stat.label}</p>
              <p className="text-2xl font-bold text-white">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold">Weekly Attendance</h2>
            <div className="flex items-center space-x-2 text-xs text-[#94a3b8]">
              <Calendar size={14} />
              <span>Mar 13 - Mar 19</span>
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                <XAxis dataKey="name" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                  itemStyle={{ color: '#60a5fa' }}
                />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#3b82f6' : '#60a5fa'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card space-y-4">
          <h2 className="text-xl font-semibold">Quick Actions</h2>
          <button className="w-full py-3 bg-blue-500/10 text-blue-500 rounded-lg hover:bg-blue-500/20 transition-all font-medium text-left px-4 flex items-center space-x-3">
            <Users size={20} />
            <span>Manage Departments</span>
          </button>
          <button className="w-full py-3 bg-purple-500/10 text-purple-500 rounded-lg hover:bg-purple-500/20 transition-all font-medium text-left px-4 flex items-center space-x-3">
            <Clock size={20} />
            <span>Set Class Schedule</span>
          </button>
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">Recent Attendance</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94a3b8]" size={16} />
            <input 
              type="text" 
              placeholder="Search by name or roll..."
              className="bg-[#0f172a] border border-[#334155] rounded-lg pl-10 pr-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none w-64"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-[#334155] text-[#94a3b8] text-sm uppercase tracking-wider">
                <th className="px-4 py-4 font-medium">Student Name</th>
                <th className="px-4 py-4 font-medium">Roll No</th>
                <th className="px-4 py-4 font-medium">Department</th>
                <th className="px-4 py-4 font-medium">Date</th>
                <th className="px-4 py-4 font-medium">Time</th>
                <th className="px-4 py-4 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#334155]">
              {filteredAttendance.map((row) => (
                <tr key={row.id} className="hover:bg-[#0f172a]/50 transition-colors">
                  <td className="px-4 py-4 font-medium text-white">{row.name}</td>
                  <td className="px-4 py-4 text-[#94a3b8]">{row.roll_no}</td>
                  <td className="px-4 py-4 text-[#94a3b8]">{row.department}</td>
                  <td className="px-4 py-4 text-[#94a3b8]">{row.date}</td>
                  <td className="px-4 py-4 text-[#94a3b8]">{row.time}</td>
                  <td className="px-4 py-4">
                    <span className="px-3 py-1 bg-green-500/10 text-green-500 rounded-full text-xs font-semibold uppercase">
                      {row.status}
                    </span>
                  </td>
                </tr>
              ))}
              {filteredAttendance.length === 0 && (
                <tr>
                  <td colSpan="6" className="text-center py-8 text-[#94a3b8] italic">No records found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TeacherDashboard;
