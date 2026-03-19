import React, { useState, useRef, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Webcam from 'react-webcam';
import { User, Mail, Lock, BookOpen, Hash, Phone, Camera, Check } from 'lucide-react';
import api from '../api/api';

const RegisterStudent = () => {
  const [formData, setFormData] = useState({
    full_name: '',
    roll_number: '',
    department: '',
    class_name: '',
    mobile_number: '',
    email: '',
    password: ''
  });
  const [faceImages, setFaceImages] = useState([]);
  const [capturing, setCapturing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const webcamRef = useRef(null);
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const captureImage = useCallback(() => {
    const imageBase64 = webcamRef.current.getScreenshot();
    if (imageBase64) {
      setFaceImages((prev) => [...prev.slice(-4), imageBase64]); // Keep last 5 images
    }
  }, [webcamRef]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (faceImages.length < 3) {
      setError('Please capture at least 3 face images for better accuracy.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Get encodings for each captured image
      const encodings = [];
      for (let i = 0; i < faceImages.length; i++) {
        const img = faceImages[i];
        try {
          const resp = await api.post('/face/encoding', { image: img });
          if (resp.data.status === 'success') {
            encodings.push(resp.data.encoding);
          } else {
            console.warn(`Face not detected in image ${i + 1}: ${resp.data.message}`);
          }
        } catch (encodingErr) {
          console.error(`Error encoding image ${i + 1}:`, encodingErr);
        }
      }
      
      if (encodings.length === 0) {
        setError('No faces could be detected in any of the captured images. Please ensure your face is clearly visible and well-lit.');
        setLoading(false);
        return;
      }

      if (encodings.length < 3) {
        setError(`Only ${encodings.length} face(s) detected. Please recapture images where your face is clearly visible (minimum 3 required).`);
        setLoading(false);
        return;
      }

      console.log(`Registering with ${encodings.length} face encodings...`);
      await api.post('/register/student', {
        ...formData,
        face_encodings: encodings
      });

      console.log('Registration successful!');
      navigate('/login');
    } catch (err) {
      console.error('Registration submission error:', err);
      const detail = err.response?.data?.detail;
      const message = typeof detail === 'string' ? detail : (err.response?.data?.message || 'Registration failed. Please check your network connection and try again.');
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="card space-y-6">
          <h1 className="text-2xl font-bold text-white">Student Registration</h1>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs text-dark-muted flex items-center space-x-1">
                  <User size={12} /> <span>Full Name</span>
                </label>
                <input name="full_name" onChange={handleInputChange} className="input-field py-1" required />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-dark-muted flex items-center space-x-1">
                  <Hash size={12} /> <span>Roll Number</span>
                </label>
                <input name="roll_number" onChange={handleInputChange} className="input-field py-1" required />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs text-dark-muted flex items-center space-x-1">
                  <BookOpen size={12} /> <span>Department</span>
                </label>
                <input name="department" onChange={handleInputChange} className="input-field py-1" required />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-dark-muted flex items-center space-x-1">
                  <BookOpen size={12} /> <span>Class/Year</span>
                </label>
                <input name="class_name" onChange={handleInputChange} className="input-field py-1" required />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs text-dark-muted flex items-center space-x-1">
                <Phone size={12} /> <span>Mobile Number</span>
              </label>
              <input name="mobile_number" onChange={handleInputChange} className="input-field py-1" required />
            </div>

            <div className="space-y-1">
              <label className="text-xs text-dark-muted flex items-center space-x-1">
                <Mail size={12} /> <span>Email</span>
              </label>
              <input name="email" type="email" onChange={handleInputChange} className="input-field py-1" required />
            </div>

            <div className="space-y-1">
              <label className="text-xs text-dark-muted flex items-center space-x-1">
                <Lock size={12} /> <span>Password</span>
              </label>
              <input name="password" type="password" onChange={handleInputChange} className="input-field py-1" required />
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full py-3 mt-4">
              {loading ? 'Registering...' : 'Complete Registration'}
            </button>
          </form>
        </div>

        <div className="card space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Face Capture</h2>
            <span className="text-sm px-3 py-1 bg-blue-500/10 text-blue-500 rounded-full">
              {faceImages.length} / 5 Captured
            </span>
          </div>

          <div className="relative rounded-xl overflow-hidden aspect-video bg-black border border-dark-border">
            <Webcam
              audio={false}
              ref={webcamRef}
              screenshotFormat="image/jpeg"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-48 h-48 border-2 border-dashed border-white/30 rounded-full"></div>
            </div>
          </div>

          <button 
            type="button"
            onClick={captureImage}
            className="w-full py-4 border-2 border-dashed border-dark-border hover:border-blue-500 hover:bg-blue-500/5 rounded-xl transition-all flex flex-col items-center space-y-2"
          >
            <Camera className="text-dark-muted group-hover:text-blue-500" />
            <span className="text-sm font-medium">Click to capture frame</span>
          </button>

          <div className="flex space-x-2 overflow-x-auto py-2">
            {faceImages.map((img, i) => (
              <div key={i} className="relative w-16 h-16 rounded-md overflow-hidden flex-shrink-0 border border-dark-border">
                <img src={img} className="w-full h-full object-cover" />
                <div className="absolute top-0 right-0 bg-green-500 p-0.5">
                  <Check size={10} className="text-white" />
                </div>
              </div>
            ))}
          </div>

          {error && <p className="text-red-400 text-sm italic">{error}</p>}
        </div>
      </div>
    </div>
  );
};

export default RegisterStudent;
