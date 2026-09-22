import React, { useState, useRef, useEffect } from 'react';
import { authService } from '../services/api';
import { ShieldAlert, Compass, LogIn, Mail, Key, User, ShieldCheck, Lock, CheckCircle2, FileText, Check } from 'lucide-react';
import logoImg from '../assets/logo.png';

export default function LoginView({ onLoginSuccess }) {
  const [viewMode, setViewMode] = useState('login');

  const [isSchoolHours, setIsSchoolHours] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());

  const [hasAgreedToPrivacy, setHasAgreedToPrivacy] = useState(false);

  const [formData, setFormData] = useState({
    first_name: '',
    middle_name: '',
    last_name: '',
    email: '',
    user_name: '',
    password: '',
    student_id: '',
    section_year: ''
  });

  const [otpCode, setOtpCode] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const [countdown, setCountdown] = useState(0);

  const inputRefs = useRef([]);

  useEffect(() => {
    const cachedUser = localStorage.getItem("aerofix_user");
    const cachedToken = localStorage.getItem("aerofix_token");

    if (cachedUser && cachedToken) {
      try {
        const parsedUser = JSON.parse(cachedUser);
        onLoginSuccess(parsedUser);
      } catch (e) {
        localStorage.removeItem("aerofix_user");
        localStorage.removeItem("aerofix_token");
      }
    }
  }, [onLoginSuccess]);

  useEffect(() => {
    const checkGateStatus = () => {
      const now = new Date();
      setCurrentTime(now);

      const day = now.getDay();
      const hours = now.getHours();

      const isWeekday = day >= 1 && day <= 5;
      const isDuringHours = hours >= 7 && hours < 18;
      const isOpen = isWeekday && isDuringHours;

      setIsSchoolHours(true);
    };

    checkGateStatus();
    const interval = setInterval(checkGateStatus, 1000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleOtpChange = (value, index) => {
    if (value && isNaN(value)) return;

    const updatedOtp = [...otpCode];
    updatedOtp[index] = value.substring(value.length - 1);
    setOtpCode(updatedOtp);

    if (value !== '' && index < 5) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleOtpKeyDown = (e, index) => {
    if (e.key === 'Backspace' && !otpCode[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').trim();
    if (!/^\d{6}$/.test(pastedData)) return;

    const digits = pastedData.split('');
    setOtpCode(digits);
    inputRefs.current[5].focus();
  };

  const redirectToLogin = () => {
    setIsSuccess(false);
    setHasAgreedToPrivacy(false);
    setOtpCode(['', '', '', '', '', '']);
    setFormData({
      first_name: '',
      middle_name: '',
      last_name: '',
      email: '',
      user_name: '',
      password: '',
      student_id: '',
      section_year: ''
    });
    setViewMode('login');
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!isSchoolHours) return;

    if (viewMode === 'register' && !hasAgreedToPrivacy) {
      setViewMode('privacy');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      if (viewMode === 'login') {
        const res = await authService.login({
          user_name: formData.user_name,
          password: formData.password
        });

        const { token, data } = res.data;
        localStorage.setItem('aerofix_token', token);
        localStorage.setItem('aerofix_user', JSON.stringify(data.user));
        onLoginSuccess(data.user);
      } else {
        if (!formData.email) {
          setError('An institutional email address is required to proceed.');
          setLoading(false);
          return;
        }

        await authService.sendRegistrationOtp({
          email: formData.email
        });

        setViewMode('otp');
        setCountdown(60);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Authorization network handshakes failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpVerifyAndRegister = async (e) => {
    e.preventDefault();
    if (!isSchoolHours) return;
    setLoading(true);
    setError(null);
    const codeString = otpCode.join('');

    if (codeString.length < 6) {
      setError('Please fill in the complete 6-digit security code.');
      setLoading(false);
      return;
    }

    try {
      await authService.register({
        first_name: formData.first_name,
        middle_name: formData.middle_name,
        last_name: formData.last_name,
        email: formData.email,
        user_name: formData.user_name,
        password: formData.password,
        otp: codeString,
        role: 'student',
        student_id: formData.student_id,
        section_year: formData.section_year
      });

      setIsSuccess(true);
      setTimeout(() => {
        setViewMode(currentMode => {
          if (currentMode === 'otp') redirectToLogin();
          return currentMode;
        });
      }, 3000);

    } catch (err) {
      setError(err.response?.data?.message || 'The security code entered is invalid or has expired.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (countdown > 0 || !isSchoolHours) return;
    setError(null);
    setLoading(true);
    try {
      await authService.sendRegistrationOtp({ email: formData.email });
      setOtpCode(['', '', '', '', '', '']);
      if (inputRefs.current[0]) inputRefs.current[0].focus();
      setCountdown(60);
      alert('A fresh token validation sequence has been dispatched to your email.');
    } catch (err) {
      setError(err.response?.data?.message || 'Could not dispatch renewal verification token.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-screen flex items-center justify-center bg-slate-100 p-4 font-sans relative overflow-hidden text-slate-900">

      <div className={`absolute top-1/4 left-1/4 w-96 h-96 rounded-full blur-3xl transition-colors duration-1000 ${isSchoolHours ? 'bg-emerald-500/10' : 'bg-rose-500/10'}`} />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl" />

      <div className={`w-full max-w-md bg-white border rounded-2xl shadow-xl p-6 sm:p-8 relative z-10 space-y-5 transition-all duration-500 ${isSchoolHours ? 'border-slate-200' : 'border-rose-200'} ${loading ? 'scale-[0.99] shadow-lg' : 'scale-100'}`}>

        {loading && !isSuccess && (
          <div className="absolute inset-0 bg-white/70 backdrop-blur-xs z-30 rounded-2xl flex flex-col items-center justify-center text-center space-y-3 animate-fadeIn">
            <div className="relative flex items-center justify-center">
              <div className="absolute w-12 h-12 bg-emerald-500/20 rounded-full animate-ping duration-1000" />
              <div className="p-3 bg-white rounded-full border border-emerald-500/30 text-emerald-600 shadow-md">
                <Compass className="h-6 w-6 animate-spin" />
              </div>
            </div>
            <div className="space-y-0.5">
              <h4 className="text-xs font-bold text-slate-800 tracking-wider uppercase font-mono">
                {viewMode === 'login' ? 'Authorizing Vector' : 'Verifying Security Node'}
              </h4>
              <p className="text-[10px] text-slate-500 max-w-[200px]">
                {viewMode === 'login' ? 'Syncing cryptographic handshakes...' : 'Validating key configuration matrix...'}
              </p>
            </div>
          </div>
        )}

        {isSuccess && (
          <div className="absolute inset-0 bg-white z-20 rounded-2xl p-6 flex flex-col items-center justify-center text-center space-y-4 animate-fadeIn shadow-lg">
            <div className="p-3 bg-emerald-50 rounded-full border border-emerald-200 text-emerald-600 animate-bounce">
              <CheckCircle2 className="h-12 w-12" />
            </div>
            <div className="space-y-1.5">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Verification Complete</h3>
              <p className="text-[11px] text-slate-600 max-w-xs leading-relaxed">
                Your institutional access profile has been securely written to the academy registries database configuration matrix.
              </p>
            </div>
            <div className="pt-2 w-full">
              <button
                type="button"
                onClick={redirectToLogin}
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold py-2.5 rounded-xl transition-all shadow-sm cursor-pointer"
              >
                Proceed to Sign In
              </button>
              <span className="block text-[10px] text-slate-500 font-mono mt-2 animate-pulse">
                Auto-redirecting in moments...
              </span>
            </div>
          </div>
        )}

        <div className="text-center space-y-3">
          <div className="mx-auto w-24 h-24 flex items-center justify-center">
            <img
              src={logoImg}
              alt="Academy Official Seal"
              className={`w-full h-full object-contain object-center transition-all duration-500 ${isSchoolHours ? 'drop-shadow-sm' : 'grayscale-[30%]'}`}
            />
          </div>
          <div className="space-y-1">
            <h2 className="text-base font-black text-slate-900 tracking-wider uppercase">
              National Aviation Academy of the Philippines
            </h2>
            <div className="text-[10px] text-slate-600 font-mono inline-block bg-slate-100 px-2.5 py-1 rounded-full border border-slate-200">
              System Time: {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </div>
            <p className="text-[11px] text-slate-500 max-w-xs mx-auto leading-relaxed pt-1">
              {!isSchoolHours && 'Electronic gateway locked down outside official core operations hours.'}
              {isSchoolHours && viewMode === 'login' && 'Secure electronic portal sign-in platform for academy personnel and students.'}
              {isSchoolHours && viewMode === 'register' && 'Account provisioning layout for verified academy student registration.'}
              {isSchoolHours && viewMode === 'privacy' && 'Review and accept the student data privacy policy terms to continue registration.'}
              {isSchoolHours && viewMode === 'otp' && `Verification security key sent to ${formData.email}. Complete authorization to finalize profile creation.`}
            </p>
          </div>
        </div>

        {error && isSchoolHours && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-start gap-2 animate-fadeIn">
            <ShieldAlert className="h-4 w-4 shrink-0 mt-0.5 text-rose-600" />
            <p className="font-medium">{error}</p>
          </div>
        )}

        {!isSchoolHours ? (
          <div className="space-y-4 py-2 text-center animate-fadeIn">
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl space-y-3 flex flex-col items-center">
              <div className="p-3 bg-rose-100 rounded-full border border-rose-200 text-rose-600 animate-pulse">
                <Lock className="h-5 w-5" />
              </div>
              <div className="space-y-1">
                <h3 className="text-xs font-bold text-rose-700 uppercase tracking-wider">Access Windows Restrained</h3>
                <p className="text-[11px] text-slate-600 max-w-xs leading-relaxed">
                  The infrastructure portal undergoes automated system cycles outside active operating matrices.
                </p>
              </div>
            </div>

            <div className="text-xs bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-1 text-left">
              <span className="block font-bold text-slate-500 uppercase tracking-wide text-[10px]">Portal Operating Bounds:</span>
              <div className="flex justify-between items-center text-slate-800 font-mono text-xs pt-0.5">
                <span>Active Cycle:</span>
                <span className="text-emerald-600 font-bold">07:00 AM — 06:00 PM</span>
              </div>
            </div>
          </div>
        ) : (
          <>
            {viewMode === 'privacy' ? (
              <div className="space-y-4 text-xs animate-fadeIn">
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3 max-h-48 overflow-y-auto custom-scrollbar text-slate-700 shadow-inner">
                  <h4 className="font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5 text-xs">
                    <FileText className="h-4 w-4 text-emerald-600" /> Student Data Privacy Policy
                  </h4>
                  <p className="text-[11px] leading-relaxed text-slate-600">
                    <strong>1. Collection of Student Information:</strong> The National Aviation Academy of the Philippines (NAAP) collects personal details (such as full name, student ID, section/year, and institutional email) and maintenance task telemetry strictly for academic tracking, workshop safety, and portal authentication.
                  </p>
                  <p className="text-[11px] leading-relaxed text-slate-600">
                    <strong>2. Use and Security of Records:</strong> Your data is used exclusively for managing educational workflows, lab assignments, and compliance reporting under civil aviation standards. We apply administrative and technical safeguards to prevent unauthorized access.
                  </p>
                  <p className="text-[11px] leading-relaxed text-slate-600">
                    <strong>3. Data Sharing Restrictions:</strong> Your information will not be sold or distributed to third-party entities, except when mandated by regulatory aviation bodies or legal frameworks.
                  </p>
                </div>

                <div className="flex items-start gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="privacyAgreement"
                    checked={hasAgreedToPrivacy}
                    onChange={(e) => setHasAgreedToPrivacy(e.target.checked)}
                    className="mt-0.5 h-4 w-4 rounded border-slate-300 bg-white text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                  />
                  <label htmlFor="privacyAgreement" className="text-[11px] text-slate-700 leading-tight cursor-pointer select-none">
                    I acknowledge that I have read and agree to the Student Data Privacy Policy, consenting to the collection and secure processing of my academic and profile data.
                  </label>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2">
                  <button
                    type="button"
                    onClick={redirectToLogin}
                    className="w-full bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold py-2.5 rounded-xl transition-all cursor-pointer text-xs"
                  >
                    Decline & Return
                  </button>
                  <button
                    type="button"
                    disabled={!hasAgreedToPrivacy || loading}
                    onClick={() => {
                      if (hasAgreedToPrivacy) {
                        handleFormSubmit({ preventDefault: () => {} });
                      }
                    }}
                    className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-200 disabled:text-slate-400 text-white font-bold py-2.5 rounded-xl transition-all shadow-sm flex items-center justify-center gap-1.5 cursor-pointer text-xs disabled:cursor-not-allowed"
                  >
                    <Check className="h-4 w-4" />
                    <span>Agree & Continue</span>
                  </button>
                </div>
              </div>
            ) : viewMode !== 'otp' ? (
              <form onSubmit={handleFormSubmit} className="space-y-3.5 text-xs">

                {viewMode === 'register' && (
                  <div className="space-y-3.5 animate-fadeIn">

                    <div className="space-y-1">
                      <label className="block font-bold text-slate-600 uppercase tracking-wide">Student ID</label>
                      <input type="text" name="student_id" value={formData.student_id} onChange={handleInputChange} className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-slate-900 focus:outline-none focus:border-sky-500 focus:bg-white" placeholder="2023-00001" />
                    </div>

                    <div className="space-y-1">
                      <label className="block font-bold text-slate-600 uppercase tracking-wide">Section/Year</label>
                      <input type="text" name="section_year" value={formData.section_year} onChange={handleInputChange} className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-slate-900 focus:outline-none focus:border-sky-500 focus:bg-white" placeholder="2023-2024" />
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      <div className="space-y-1">
                        <label className="block font-bold text-slate-600 uppercase tracking-wide">First Name *</label>
                        <input type="text" name="first_name" required value={formData.first_name} onChange={handleInputChange} className="w-full bg-slate-50 border border-slate-300 rounded-xl px-2 py-2.5 text-slate-900 focus:outline-none focus:border-sky-500 focus:bg-white" placeholder="John" />
                      </div>
                      <div className="space-y-1">
                        <label className="block font-bold text-slate-600 uppercase tracking-wide">Middle Name *</label>
                        <input type="text" name="middle_name" required value={formData.middle_name} onChange={handleInputChange} className="w-full bg-slate-50 border border-slate-300 rounded-xl px-2 py-2.5 text-slate-900 focus:outline-none focus:border-sky-500 focus:bg-white" placeholder="Silas" />
                      </div>
                      <div className="space-y-1">
                        <label className="block font-bold text-slate-600 uppercase tracking-wide">Last Name *</label>
                        <input type="text" name="last_name" required value={formData.last_name} onChange={handleInputChange} className="w-full bg-slate-50 border border-slate-300 rounded-xl px-2 py-2.5 text-slate-900 focus:outline-none focus:border-sky-500 focus:bg-white" placeholder="Doe" />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="block font-bold text-slate-600 uppercase tracking-wide">Email Address *</label>
                      <div className="relative text-sm">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                        <input type="email" name="email" required value={formData.email} onChange={handleInputChange} className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-900 font-mono focus:outline-none focus:border-sky-500 focus:bg-white" placeholder="name@naap.edu.ph" />
                      </div>
                    </div>
                  </div>
                )}

                <div className="space-y-1">
                  <label className="block font-bold text-slate-600 uppercase tracking-wide">Username *</label>
                  <div className="relative text-sm">
                    <User className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    <input type="text" name="user_name" required value={formData.user_name} onChange={handleInputChange} className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-900 font-mono focus:outline-none focus:border-sky-500 focus:bg-white" placeholder="johndoe123" />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block font-bold text-slate-600 uppercase tracking-wide">Password *</label>
                  <div className="relative text-sm">
                    <Key className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    <input type="password" name="password" required value={formData.password} onChange={handleInputChange} className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-900 font-mono focus:outline-none focus:border-sky-500 focus:bg-white" placeholder="••••••••" />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-300 text-white font-bold py-2.5 rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer text-xs mt-4"
                >
                  {viewMode === 'login' ? (
                    <>
                      <LogIn className="h-4 w-4" />
                      <span>Secure Sign In</span>
                    </>
                  ) : (
                    <>
                      <FileText className="h-4 w-4" />
                      <span>Review Privacy Policy</span>
                    </>
                  )}
                </button>
              </form>
            ) : (
              <form onSubmit={handleOtpVerifyAndRegister} className="space-y-5 text-xs animate-fadeIn">
                <div className="space-y-2 text-center">
                  <label className="block font-bold text-slate-600 uppercase tracking-wide">
                    Email Authentication Gateway
                  </label>

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
                        className="w-11 h-11 text-center bg-slate-50 border border-slate-300 focus:border-emerald-500 focus:bg-white text-base font-bold text-slate-900 rounded-xl focus:outline-none font-mono transition-colors shadow-xs"
                      />
                    ))}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-300 text-white font-bold py-2.5 rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer text-xs"
                >
                  <ShieldCheck className="h-4 w-4" />
                  <span>Verify Code & Create Account</span>
                </button>

                <div className="text-center">
                  <button
                    type="button"
                    disabled={countdown > 0 || loading}
                    onClick={handleResendOtp}
                    className="text-[11px] text-slate-500 hover:text-slate-800 disabled:text-slate-400 font-medium transition-colors cursor-pointer disabled:cursor-not-allowed"
                  >
                    {countdown > 0
                      ? `Resend code available in ${countdown}s`
                      : "Didn't receive the email code? Resend validation code"}
                  </button>
                </div>
              </form>
            )}

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => {
                  setError(null);
                  setHasAgreedToPrivacy(false);
                  setOtpCode(['', '', '', '', '', '']);

                  if (viewMode === 'otp' || viewMode === 'privacy') {
                    setViewMode('register');
                  } else {
                    setViewMode(viewMode === 'login' ? 'register' : 'login');
                  }
                }}
                className="text-xs text-slate-600 hover:text-emerald-600 font-medium transition-colors cursor-pointer underline"
              >
                {viewMode === 'privacy' && "Back to Registration Form"}
                {viewMode === 'otp' && "Modify account details / Return to form"}
                {viewMode === 'login' && "Don't have an institutional profile? Register here"}
                {viewMode === 'register' && "Already provisioned with campus access? Return to Login"}
              </button>
            </div>
          </>
        )}

      </div>
    </div>
  );
}