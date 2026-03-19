import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, Mail, Lock, UserPlus } from 'lucide-react';
import api from '../api/api';

const RegisterTeacher = () => {
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await api.post('/register/teacher', formData);
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.detail || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="card w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white mb-2">Teacher Registration</h1>
          <p className="text-dark-muted">Create an account to manage your class attendance</p>
        </div>

        {error && <p className="text-red-400 text-sm text-center">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-1">
            <label className="text-sm font-medium text-dark-muted flex items-center space-x-2">
              <User size={16} /> <span>Full Name</span>
            </label>
            <input name="full_name" onChange={handleInputChange} className="input-field" required />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-dark-muted flex items-center space-x-2">
              <Mail size={16} /> <span>Email Address</span>
            </label>
            <input name="email" type="email" onChange={handleInputChange} className="input-field" required />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-dark-muted flex items-center space-x-2">
              <Lock size={16} /> <span>Password</span>
            </label>
            <input name="password" type="password" onChange={handleInputChange} className="input-field" required />
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full py-3 flex items-center justify-center space-x-2">
            <UserPlus size={20} />
            <span>{loading ? 'Creating Account...' : 'Register as Teacher'}</span>
          </button>
        </form>

        <p className="text-center text-sm text-dark-muted">
          Already have an account? <Link to="/login" className="text-blue-500 hover:underline">Sign In</Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterTeacher;
