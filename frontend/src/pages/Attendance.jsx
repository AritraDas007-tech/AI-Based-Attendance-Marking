import React, { useRef, useState, useCallback, useEffect } from 'react';
import Webcam from 'react-webcam';
import { Camera, RefreshCw, CheckCircle, XCircle } from 'lucide-react';
import api from '../api/api';

const Attendance = () => {
  const webcamRef = useRef(null);
  const [status, setStatus] = useState('idle'); // idle, capturing, success, error, already_marked
  const [message, setMessage] = useState('Position your face in the center of the frame');
  const [studentName, setStudentName] = useState('');

  const capture = useCallback(async () => {
    if (!webcamRef.current) return;
    
    setStatus('capturing');
    setMessage('Processing your face... Please hold still.');
    
    const imageBase64 = webcamRef.current.getScreenshot();
    
    try {
      const response = await api.post('/attendance/mark', { image: imageBase64 });
      
      if (response.data.status === 'success') {
        setStatus('success');
        setMessage(`Attendance marked for ${response.data.student_name}`);
        setStudentName(response.data.student_name);
      } else if (response.data.status === 'already_marked') {
        setStatus('already_marked');
        setMessage(`${response.data.student_name}, your attendance is already marked for today.`);
      } else {
        setStatus('error');
        setMessage(response.data.message || 'Recognition failed. Try again.');
      }
    } catch (err) {
      setStatus('error');
      setMessage('Error connecting to server. Please try again.');
    }
  }, [webcamRef]);

  // Auto-reset status after 5 seconds if success or error
  useEffect(() => {
    if (status === 'success' || status === 'error' || status === 'already_marked') {
      const timer = setTimeout(() => {
        setStatus('idle');
        setMessage('Position your face in the center of the frame');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [status]);

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Mark Attendance</h1>
        <p className="text-dark-muted">Real-time face recognition for students</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 text-white">
        <div className="lg:col-span-2 space-y-6">
          <div className="relative rounded-2xl overflow-hidden border-2 border-dark-border bg-black aspect-video flex items-center justify-center">
            <Webcam
              audio={false}
              ref={webcamRef}
              screenshotFormat="image/jpeg"
              videoConstraints={{ facingMode: 'user' }}
              className="w-full h-full object-cover"
            />
            
            {/* Guide Overlay */}
            <div className="absolute inset-0 border-[60px] border-black/40 pointer-events-none">
              <div className="w-full h-full border-2 border-white/20 rounded-3xl relative">
                {/* Recognition Indicator */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-80 border-4 border-dashed border-blue-500/50 rounded-full"></div>
              </div>
            </div>

            {/* Status Overlay */}
            {status !== 'idle' && (
              <div className={`absolute inset-0 flex items-center justify-center glass transition-opacity duration-300`}>
                <div className="text-center p-8 rounded-2xl space-y-4">
                  {status === 'capturing' && (
                    <div className="w-16 h-16 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin mx-auto"></div>
                  )}
                  {status === 'success' && (
                    <CheckCircle className="text-green-500 w-16 h-16 mx-auto" />
                  )}
                  {status === 'error' || status === 'already_marked' ? (
                    <XCircle className="text-yellow-500 w-16 h-16 mx-auto" />
                  ) : null}
                  <p className="text-xl font-semibold">{message}</p>
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-center">
            <button
              onClick={capture}
              disabled={status === 'capturing'}
              className="btn-primary flex items-center space-x-3 px-8 py-4 text-lg"
            >
              <Camera size={24} />
              <span>{status === 'capturing' ? 'Wait...' : 'Mark Attendance'}</span>
            </button>
          </div>
        </div>

        <div className="space-y-6">
          <div className="card">
            <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2">
              <RefreshCw size={20} className="text-blue-500" />
              <span>How it works</span>
            </h3>
            <ul className="space-y-4 text-sm text-dark-muted">
              <li className="flex space-x-3">
                <span className="w-5 h-5 rounded-full bg-blue-500/10 text-blue-500 flex items-center justify-center flex-shrink-0">1</span>
                <span>Look directly into the camera lens.</span>
              </li>
              <li className="flex space-x-3">
                <span className="w-5 h-5 rounded-full bg-blue-500/10 text-blue-500 flex items-center justify-center flex-shrink-0">2</span>
                <span>Ensure your face is well-lit and not covered.</span>
              </li>
              <li className="flex space-x-3">
                <span className="w-5 h-5 rounded-full bg-blue-500/10 text-blue-500 flex items-center justify-center flex-shrink-0">3</span>
                <span>Stay still while the system captures your encoding.</span>
              </li>
            </ul>
          </div>

          {status === 'success' && (
            <div className="card bg-green-500/10 border-green-500/20">
              <p className="text-green-400 font-medium">Last marked:</p>
              <p className="text-2xl font-bold">{studentName}</p>
              <p className="text-sm text-green-400/70">{new Date().toLocaleTimeString()}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Attendance;
