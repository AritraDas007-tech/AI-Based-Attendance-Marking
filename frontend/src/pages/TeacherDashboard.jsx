import React, { useState, useEffect } from 'react';
import { 
  Users, 
  ChevronRight, 
  Search,
  CheckCircle,
  TrendingUp,
  X,
  ArrowLeft,
  User,
  AlertTriangle,
  LayoutDashboard,
  Trash2
} from 'lucide-react';
import api from '../api/api';

const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-[#1e293b] border border-[#334155] rounded-2xl w-full max-w-lg shadow-2xl animate-in zoom-in duration-300">
        <div className="flex items-center justify-between p-6 border-b border-[#334155]">
          <h3 className="text-xl font-semibold text-white">{title}</h3>
          <button onClick={onClose} className="p-2 hover:bg-[#334155] rounded-full text-[#94a3b8] transition-colors">
            <X size={20} />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
};

const TeacherDashboard = () => {
  // Navigation State
  const [view, setView] = useState('dashboard'); // 'dashboard', 'years', 'students', 'reports'
  const [selectedDept, setSelectedDept] = useState(null);
  const [selectedYear, setSelectedYear] = useState(null);
  
  // Data State
  const [departments, setDepartments] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [studentStats, setStudentStats] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);

  // Report Filters
  const [reportFilter, setReportFilter] = useState({ dept: '', year: '' });
  const [reportData, setReportData] = useState([]);

  const years = ["1st Year", "2nd Year", "3rd Year", "4th Year"];
  const deptOptions = ["CSE", "Data Science", "Civil", "Electrical"];

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      const resp = await api.get('/departments-list');
      setDepartments(resp.data);
    } catch (err) { console.error(err); }
  };

  const fetchStudents = async (dept, year) => {
    setLoading(true);
    try {
      const resp = await api.get(`/students-list?department=${dept}&year=${year}`);
      setStudents(resp.data);
      setView('students');
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const fetchStudentStats = async (id) => {
    try {
      const resp = await api.get(`/students/${id}/stats`);
      setStudentStats(resp.data);
      setSelectedStudent(id);
    } catch (err) { console.error(err); }
  };

  const fetchReport = async () => {
    setLoading(true);
    try {
      const resp = await api.get(`/attendance/report?department=${reportFilter.dept}&year=${reportFilter.year}`);
      setReportData(resp.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleDeleteStudent = async (id, name) => {
    if (window.confirm(`Are you sure you want to delete ${name}? This will remove all their attendance and face records permanently.`)) {
      try {
        await api.delete(`/students/${id}`);
        // Refresh the list
        fetchStudents(selectedDept.name, selectedYear);
      } catch (err) {
        console.error('Deletion failed:', err);
        alert(err.response?.data?.detail || 'Failed to delete student');
      }
    }
  };

  useEffect(() => {
    if (view === 'reports') fetchReport();
  }, [reportFilter, view]);

  const handleDeptClick = (dept) => {
    setSelectedDept(dept);
    setView('years');
  };

  const handleYearClick = (year) => {
    setSelectedYear(year);
    // Drill-down uses full dept names from departments-list
    fetchStudents(selectedDept.name, year);
  };

  const resetNav = () => {
    setView('dashboard');
    setSelectedDept(null);
    setSelectedYear(null);
    setStudents([]);
    setSearchTerm('');
  };

  const filteredStudents = students.filter(s => 
    s.full_name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.roll_number.includes(searchTerm)
  );

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-500">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white">Teacher Dashboard</h1>
          <nav className="flex items-center space-x-2 text-[#94a3b8] mt-2 text-sm">
            <button onClick={resetNav} className="hover:text-white transition-colors flex items-center space-x-1 outline-none">
              <LayoutDashboard size={14} />
              <span>Overview</span>
            </button>
            {selectedDept && (
              <>
                <ChevronRight size={14} />
                <button onClick={() => setView('years')} className="hover:text-white transition-colors outline-none">{selectedDept.name}</button>
              </>
            )}
            {selectedYear && (
              <>
                <ChevronRight size={14} />
                <span className="text-blue-400 font-medium">{selectedYear}</span>
              </>
            )}
            {view === 'reports' && (
              <>
                <ChevronRight size={14} />
                <span className="text-purple-400 font-medium">Attendance Reports</span>
              </>
            )}
          </nav>
        </div>
      </header>

      {view === 'dashboard' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <h2 className="text-xl font-semibold text-white">Select Department</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {departments.map((dept) => (
                <button 
                  key={dept.id}
                  onClick={() => handleDeptClick(dept)}
                  className="card group hover:border-blue-500/50 transition-all text-left flex items-center justify-between p-6 bg-[#1e293b]/50 border-[#334155] rounded-2xl outline-none"
                >
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-blue-500/10 text-blue-500 rounded-xl group-hover:bg-blue-500 group-hover:text-white transition-colors shadow-lg">
                      <Users size={24} />
                    </div>
                    <span className="text-lg font-medium text-white line-clamp-1">{dept.name}</span>
                  </div>
                  <ChevronRight className="text-[#334155] group-hover:text-blue-500 transition-colors shrink-0" />
                </button>
              ))}
            </div>
          </div>
          
          <div className="card space-y-4 bg-[#1e293b]/50 border-[#334155] rounded-2xl p-6 h-fit">
            <h2 className="text-xl font-semibold text-white">Quick Actions</h2>
            <p className="text-sm text-[#94a3b8]">Manage institutional data and track student performance.</p>
            <div className="space-y-3">
              <button 
                onClick={() => setView('dashboard')}
                className="w-full py-4 bg-blue-600/10 text-blue-500 border border-blue-500/20 rounded-xl hover:bg-blue-500 hover:text-white transition-all font-semibold flex items-center justify-center space-x-3 outline-none"
              >
                <Users size={20} />
                <span>Manage Departments</span>
              </button>
              <button 
                onClick={() => setView('reports')}
                className="w-full py-4 bg-purple-600 text-white rounded-xl hover:bg-purple-500 transition-all font-semibold flex items-center justify-center space-x-3 shadow-lg shadow-purple-500/20 active:scale-95 outline-none"
              >
                <TrendingUp size={20} />
                <span>Attendance Reports</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {view === 'years' && (
        <div className="space-y-6">
          <div className="flex items-center space-x-4">
            <button onClick={resetNav} className="p-2 hover:bg-[#1e293b] rounded-lg text-[#94a3b8] transition-colors outline-none">
              <ArrowLeft size={20} />
            </button>
            <h2 className="text-xl font-semibold text-white">Select Year <span className="text-[#94a3b8] font-normal mx-2">—</span> {selectedDept.name}</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {years.map((year) => (
              <button 
                key={year}
                onClick={() => handleYearClick(year)}
                className="card group hover:border-purple-500/50 transition-all text-left p-8 text-center bg-[#1e293b]/50 border-[#334155] rounded-2xl outline-none"
              >
                <p className="text-3xl font-bold text-white mb-2 group-hover:scale-110 transition-transform">{year.split(' ')[0]}</p>
                <p className="text-[#94a3b8] group-hover:text-purple-400 transition-colors font-medium">Academic Year</p>
                <div className="mt-4 pt-4 border-t border-[#334155]/50 flex justify-between items-center text-xs text-[#94a3b8]">
                  <span>Students Available</span>
                  <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {view === 'students' && (
        <div className="card space-y-6 bg-[#1e293b]/50 border-[#334155] rounded-2xl p-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="flex items-center space-x-4">
              <button onClick={() => setView('years')} className="p-2 hover:bg-[#1e293b] rounded-lg text-[#94a3b8] transition-colors outline-none">
                <ArrowLeft size={20} />
              </button>
              <div>
                <h2 className="text-xl font-semibold text-white">{selectedDept?.name}</h2>
                <p className="text-sm text-[#94a3b8]">{selectedYear} Batch</p>
              </div>
            </div>
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94a3b8] group-focus-within:text-blue-500 transition-colors" size={16} />
              <input 
                type="text" 
                placeholder="Search by name or roll number..."
                className="bg-[#0f172a] border border-[#334155] rounded-xl pl-10 pr-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none w-full lg:w-80 transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-[#334155] text-[#94a3b8] text-xs uppercase tracking-wider font-bold">
                  <th className="px-6 py-4">Student Name</th>
                  <th className="px-6 py-4">Roll Number</th>
                  <th className="px-6 py-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#334155]/50">
                {filteredStudents.map(s => (
                  <tr key={s.id} className="hover:bg-blue-500/5 transition-colors group">
                    <td className="px-6 py-5 font-medium text-white">{s.full_name}</td>
                    <td className="px-6 py-5 text-[#94a3b8] font-mono">{s.roll_number}</td>
                    <td className="px-6 py-5 text-center flex items-center justify-center space-x-2">
                      <button 
                        onClick={() => fetchStudentStats(s.id)}
                        className="px-6 py-2 bg-blue-500/10 text-blue-500 rounded-xl hover:bg-blue-500 hover:text-white transition-all text-xs font-bold shadow-sm outline-none"
                      >
                        View Details
                      </button>
                      <button 
                        onClick={() => handleDeleteStudent(s.id, s.full_name)}
                        className="p-2 bg-red-500/10 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all outline-none"
                        title="Delete Student"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredStudents.length === 0 && (
              <div className="py-24 text-center text-[#94a3b8] italic">No students found matching your search.</div>
            )}
          </div>
        </div>
      )}

      {view === 'reports' && (
        <div className="card space-y-6 bg-[#1e293b]/50 border-[#334155] rounded-2xl p-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 border-b border-[#334155] pb-6">
            <div className="flex items-center space-x-4">
              <button onClick={resetNav} className="p-2 hover:bg-[#1e293b] rounded-lg text-[#94a3b8] transition-colors outline-none">
                <ArrowLeft size={20} />
              </button>
              <h2 className="text-xl font-semibold text-white">Attendance Reports</h2>
            </div>
            <div className="flex flex-wrap gap-4">
              <select 
                className="bg-[#0f172a] border border-[#334155] rounded-xl px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 text-white"
                value={reportFilter.dept}
                onChange={(e) => setReportFilter({...reportFilter, dept: e.target.value})}
              >
                <option value="">All Departments</option>
                {deptOptions.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
              <select 
                className="bg-[#0f172a] border border-[#334155] rounded-xl px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 text-white"
                value={reportFilter.year}
                onChange={(e) => setReportFilter({...reportFilter, year: e.target.value})}
              >
                <option value="">All Years</option>
                {years.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-[#334155] text-[#94a3b8] text-xs uppercase tracking-wider font-bold">
                  <th className="px-6 py-4">Student</th>
                  <th className="px-6 py-4">Dept</th>
                  <th className="px-6 py-4">Year</th>
                  <th className="px-6 py-4 text-center">Date</th>
                  <th className="px-6 py-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#334155]/50">
                {reportData.map(r => (
                  <tr key={r.id} className="hover:bg-purple-500/5 transition-colors group">
                    <td className="px-6 py-5">
                      <p className="font-medium text-white">{r.name}</p>
                      <p className="text-xs text-[#94a3b8] font-mono">{r.roll_no}</p>
                    </td>
                    <td className="px-6 py-5 text-sm text-[#94a3b8]">{r.department}</td>
                    <td className="px-6 py-5 text-sm text-[#94a3b8]">{r.class_year}</td>
                    <td className="px-6 py-5 text-center text-sm text-[#94a3b8]">{r.date}</td>
                    <td className="px-6 py-5 text-center">
                      <span className="px-3 py-1 bg-green-500/10 text-green-500 rounded-full text-[10px] font-black uppercase">
                        {r.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {reportData.length === 0 && (
              <div className="py-24 text-center text-[#94a3b8] italic">No records found for the selected filters.</div>
            )}
          </div>
        </div>
      )}

      {/* Student Details Modal */}
      <Modal 
        isOpen={!!selectedStudent && !!studentStats} 
        onClose={() => { setSelectedStudent(null); setStudentStats(null); }}
        title="Student Information"
      >
        {studentStats && (
          <div className="space-y-6">
            <div className="flex items-center space-x-5 p-5 bg-[#0f172a] rounded-2xl border border-[#334155]">
              <div className="p-4 bg-blue-500/20 text-blue-500 rounded-xl shadow-inner">
                <User size={40} />
              </div>
              <div className="overflow-hidden">
                <h4 className="text-2xl font-extrabold text-white truncate">{studentStats.full_name}</h4>
                <p className="text-sm text-blue-400 font-mono font-bold">{studentStats.roll_number}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-5 bg-[#0f172a] rounded-2xl border border-[#334155]">
                <p className="text-[10px] text-[#94a3b8] uppercase font-black mb-1 letter-spacing-widest">Attendance Status</p>
                <div className={`flex items-center space-x-2 font-black text-sm uppercase ${studentStats.status === 'Defaulter' ? 'text-red-500' : 'text-green-500'}`}>
                  {studentStats.status === 'Defaulter' ? <AlertTriangle size={16} /> : <CheckCircle size={16} />}
                  <span>{studentStats.status}</span>
                </div>
              </div>
              <div className="p-5 bg-[#0f172a] rounded-2xl border border-[#334155]">
                <p className="text-[10px] text-[#94a3b8] uppercase font-black mb-1">Percentage</p>
                <p className="text-2xl font-black text-white">{studentStats.attendance_percentage}%</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-5 bg-green-500/5 rounded-2xl border border-green-500/20">
                <p className="text-[10px] text-green-500 uppercase font-black mb-1">Present Days</p>
                <div className="flex items-baseline space-x-1">
                  <p className="text-3xl font-black text-white">{studentStats.total_present}</p>
                  <p className="text-xs text-green-500/60 font-bold uppercase">Days</p>
                </div>
              </div>
              <div className="p-5 bg-red-500/5 rounded-2xl border border-red-500/20">
                <p className="text-[10px] text-red-500 uppercase font-black mb-1">Absent Days</p>
                <div className="flex items-baseline space-x-1">
                  <p className="text-3xl font-black text-white">{studentStats.total_absent}</p>
                  <p className="text-xs text-red-500/60 font-bold uppercase">Days</p>
                </div>
              </div>
            </div>

            <div className="space-y-3 text-sm text-[#94a3b8] pt-6 border-t border-[#334155]/50">
              <div className="flex justify-between items-center bg-[#0f172a]/50 p-3 rounded-lg">
                <span className="font-bold text-[11px] uppercase tracking-tighter">Department</span>
                <span className="text-white font-bold">{studentStats.department}</span>
              </div>
              <div className="flex justify-between items-center bg-[#0f172a]/50 p-3 rounded-lg">
                <span className="font-bold text-[11px] uppercase tracking-tighter">Academic Year</span>
                <span className="text-white font-bold">{studentStats.year}</span>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default TeacherDashboard;
