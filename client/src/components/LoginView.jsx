import React, { useState, useRef, useEffect } from 'react';
import { authService } from '../services/api';
import { ShieldAlert, Compass, LogIn, Mail, Key, User, ShieldCheck } from 'lucide-react';
import logoImg from '../assets/logo.png'; // Referencing the verbatim filename for your asset

export default function LoginView({ onLoginSuccess }) {
  // Navigation State switching between 'login', 'register', and 'otp' modes
  const [viewMode, setViewMode] = useState('login'); 

  // Combined Form States matching the backend user schema criteria
  const [formData, setFormData] = useState({
    student_id: '',
    first_name: '',
    middle_name: '',
    last_name: '',
    email: '',
    user_name: '',
    password: ''
  });

  // State to hold the 6-digit OTP code entry strings
  const [otpCode, setOtpCode] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Countdown timer for anti-spam code re-transmission
  const [countdown, setCountdown] = useState(0);

  // References to handle keyboard focus shifts programmatically
  const inputRefs = useRef([]);

  // Side-effect to handle the visual countdown timer ticks cleanly
  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Handles character insertion and forward auto-focus
  const handleOtpChange = (value, index) => {
    // Force strict numerical validations
    if (value && isNaN(value)) return;

    const updatedOtp = [...otpCode];
    updatedOtp[index] = value.substring(value.length - 1); // target last typed character
    setOtpCode(updatedOtp);

    // Shift focus forward automatically if typing a digit
    if (value !== '' && index < 5) {
      inputRefs.current[index + 1].focus();
    }
  };

  // Handles backspaces to step backward comfortably
  const handleOtpKeyDown = (e, index) => {
    if (e.key === 'Backspace' && !otpCode[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  // Allows pasting a whole 6-digit code into the gateway cells instantly
  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').trim();
    if (!/^\d{6}$/.test(pastedData)) return; // check for explicit 6-digit number match

    const digits = pastedData.split('');
    setOtpCode(digits);
    inputRefs.current[5].focus(); // Drop final target focus to tail index block
  };

  // Dispatch an initial OTP to verify the email exists prior to account generation
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      if (viewMode === 'login') {
        const res = await authService.login({ 
          user_name: formData.user_name, 
          password: formData.password 
        });
        
        const { token, data } = res.data;
        localStorage.setItem('system_token', token);
        localStorage.setItem('system_user', JSON.stringify(data.user));
        onLoginSuccess(data.user);
      } else {
        // PRE-REGISTRATION FLOW INTERCEPT
        if (!formData.email) {
          setError('An institutional email address is required to proceed.');
          setLoading(false);
          return;
        }

        // Trigger code dispatch from Express/Sequelize infrastructure
        await authService.sendRegistrationOtp({
          email: formData.email
        });

        // Advance cleanly to screen intercept verification state
        setViewMode('otp');
        setCountdown(60); // Set a 60-second cool-down window
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Authorization network handshakes failed.');
    } finally {
      setLoading(false);
    }
  };

  // Verifies OTP and completes the registration form database write inside a single request transaction
  const handleOtpVerifyAndRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const codeString = otpCode.join('');

    if (codeString.length < 6) {
      setError('Please fill in the complete 6-digit security code.');
      setLoading(false);
      return;
    }

    try {
      // Send the cached registration state along with verification token directly to final write gateway
      const res = await authService.register({
        student_id: formData.student_id || null, 
        first_name: formData.first_name,
        middle_name: formData.middle_name,
        last_name: formData.last_name,
        email: formData.email,
        user_name: formData.user_name,
        password: formData.password,
        otp: codeString, // Embedded validation parameter context validation
        role: 'student' 
      });

      const { token, data } = res.data;
      localStorage.setItem('system_token', token);
      localStorage.setItem('system_user', JSON.stringify(data.user));
      onLoginSuccess(data.user);
    } catch (err) {
      setError(err.response?.data?.message || 'The security code entered is invalid or has expired.');
    } finally {
      setLoading(false);
    }
  };

  // Helper function to re-issue validation tokens safely
  const handleResendOtp = async () => {
    if (countdown > 0) return;
    setError(null);
    setLoading(true);
    try {
      await authService.sendRegistrationOtp({ email: formData.email });
      setOtpCode(['', '', '', '', '', '']); // Flush old code entries
      if (inputRefs.current[0]) inputRefs.current[0].focus(); // Reset focus to start
      setCountdown(60); // Reset countdown timer frame
      alert('A fresh token validation sequence has been dispatched to your email.');
    } catch (err) {
      setError(err.response?.data?.message || 'Could not dispatch renewal verification token.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-screen flex items-center justify-center bg-slate-950 p-4 font-sans relative overflow-hidden">
      
      {/* Background ambient radial glow panels matching the theme colors */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl" />

      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 sm:p-8 relative z-10 space-y-5">
        
        {/* Branding Title Header updated for National Aviation Academy of the Philippines */}
        <div className="text-center space-y-3">
          <div className="mx-auto w-24 h-24 flex items-center justify-center">
            <img 
              src={logoImg} 
              alt="Academy Official Seal" 
              className="w-full h-full object-contain object-center drop-shadow-[0_0_10px_rgba(52,211,153,0.2)]"
            />
          </div>
          <div className="space-y-1">
            <h2 className="text-base font-black text-white tracking-wider uppercase">
              National Aviation Academy of the Philippines
            </h2>
            <p className="text-[11px] text-slate-400 max-w-xs mx-auto leading-relaxed">
              {viewMode === 'login' && 'Secure electronic portal sign-in platform for academy personnel and students.'}
              {viewMode === 'register' && 'Account provisioning layout for verified academy student registration.'}
              {viewMode === 'otp' && `Verification security key sent to ${formData.email}. Complete authorization to finalize profile creation.`}
            </p>
          </div>
        </div>

        {error && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs rounded-xl flex items-start gap-2 animate-fadeIn">
            <ShieldAlert className="h-4 w-4 shrink-0 mt-0.5" />
            <p className="font-medium">{error}</p>
          </div>
        )}

        {/* CONDITIONALLY RENDER CORE FORMS VS OTP PANEL */}
        {viewMode !== 'otp' ? (
          <form onSubmit={handleFormSubmit} className="space-y-3.5 text-xs">
            
            {/* REGISTRATION FIELDS INTERCEPT BLOCK */}
            {viewMode === 'register' && (
              <>
                <div className="space-y-1">
                  <label className="block font-bold text-slate-400 uppercase tracking-wide">Academy Student ID (Optional)</label>
                  <input type="text" name="student_id" value={formData.student_id} onChange={handleInputChange} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-sky-500 font-mono" placeholder="NAAP-XXXXX" />
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div className="space-y-1">
                    <label className="block font-bold text-slate-400 uppercase tracking-wide">First Name *</label>
                    <input type="text" name="first_name" required value={formData.first_name} onChange={handleInputChange} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2 py-2.5 text-white focus:outline-none focus:border-sky-500" placeholder="John" />
                  </div>
                  <div className="space-y-1">
                    <label className="block font-bold text-slate-400 uppercase tracking-wide">Middle Name *</label>
                    <input type="text" name="middle_name" required value={formData.middle_name} onChange={handleInputChange} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2 py-2.5 text-white focus:outline-none focus:border-sky-500" placeholder="Silas" />
                  </div>
                  <div className="space-y-1">
                    <label className="block font-bold text-slate-400 uppercase tracking-wide">Last Name *</label>
                    <input type="text" name="last_name" required value={formData.last_name} onChange={handleInputChange} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2 py-2.5 text-white focus:outline-none focus:border-sky-500" placeholder="Doe" />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block font-bold text-slate-400 uppercase tracking-wide">Email Address *</label>
                  <div className="relative text-sm">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                    <input type="email" name="email" required value={formData.email} onChange={handleInputChange} className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-sky-500" placeholder="name@naap.edu.ph" />
                  </div>
                </div>
              </>
            )}

            {/* BASIC SECURITY IDENTITY INPUTS */}
            <div className="space-y-1">
              <label className="block font-bold text-slate-400 uppercase tracking-wide">Username *</label>
              <div className="relative text-sm">
                <User className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                <input type="text" name="user_name" required value={formData.user_name} onChange={handleInputChange} className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-sky-500" placeholder="johndoe123" />
              </div>
            </div>

            <div className="space-y-1">
              <label className="block font-bold text-slate-400 uppercase tracking-wide">Password *</label>
              <div className="relative text-sm">
                <Key className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                <input type="password" name="password" required value={formData.password} onChange={handleInputChange} className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-sky-500" placeholder="••••••••" />
              </div>
            </div>

            {/* Submit Trigger */}
            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-800 text-white font-bold py-2.5 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer text-xs mt-4"
            >
              {loading ? (
                <>
                  <Compass className="h-4 w-4 animate-spin" />
                  <span>Validating Registration Route...</span>
                </>
              ) : viewMode === 'login' ? (
                <>
                  <LogIn className="h-4 w-4" />
                  <span>Secure Sign In</span>
                </>
              ) : (
                <>
                  <Mail className="h-4 w-4" />
                  <span>Send Verification Code</span>
                </>
              )}
            </button>
          </form>
        ) : (
          /* OTP VERIFICATION VIEW AREA INTERCEPT CONTAINER */
          <form onSubmit={handleOtpVerifyAndRegister} className="space-y-5 text-xs">
            <div className="space-y-2 text-center">
              <label className="block font-bold text-slate-400 uppercase tracking-wide">
                Email Authentication Gateway
              </label>
              
              {/* Boxed individual digit layout slots */}
              <div className="flex justify-center gap-2 pt-2" onPaste={handleOtpPaste}>
                {otpCode.map((data, index) => (
                  <input
                    key={index}
                    type="text"
                    maxLength="1"
                    value={data}
                    ref={(el) => (inputRefs.current[index] = el)}
                    onChange={(e) => handleOtpChange(e.target.value, index)}
                    onKeyDown={(e) => handleOtpKeyDown(e, index)}
                    onFocus={(e) => e.target.select()}
                    className="w-11 h-11 text-center bg-slate-950 border border-slate-800 focus:border-emerald-500 text-base font-bold text-white rounded-xl focus:outline-none font-mono transition-colors"
                  />
                ))}
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-800 text-white font-bold py-2.5 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer text-xs"
            >
              {loading ? (
                <>
                  <Compass className="h-4 w-4 animate-spin" />
                  <span>Provisioning Safe Profile...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="h-4 w-4" />
                  <span>Verify Code & Create Account</span>
                </>
              )}
            </button>
            
            <div className="text-center">
              <button
                type="button"
                disabled={countdown > 0 || loading}
                onClick={handleResendOtp}
                className="text-[11px] text-slate-500 hover:text-slate-300 disabled:text-slate-600 font-medium transition-colors cursor-pointer disabled:cursor-not-allowed"
              >
                {countdown > 0 
                  ? `Resend code available in ${countdown}s` 
                  : "Didn't receive the email code? Resend validation code"}
              </button>
            </div>
          </form>
        )}

        {/* Navigation Switcher Footer */}
        <div className="text-center pt-2">
          <button
            type="button"
            onClick={() => {
              setError(null);
              setOtpCode(['', '', '', '', '', '']); // Clean code arrays
              
              // Handle routing transitions cleanly
              if (viewMode === 'otp') {
                setViewMode('register');
              } else {
                setViewMode(viewMode === 'login' ? 'register' : 'login');
              }
            }}
            className="text-xs text-slate-400 hover:text-emerald-400 font-medium transition-colors cursor-pointer underline"
          >
            {viewMode === 'otp' && "Modify account details / Return to form"}
            {viewMode === 'login' && "Don't have an institutional profile? Register here"}
            {viewMode === 'register' && "Already provisioned with campus access? Return to Login"}
          </button>
        </div>

      </div>
    </div>
  );
}