import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Sparkles, Mail, Lock, User, GraduationCap, ArrowRight, Eye, EyeOff } from 'lucide-react';

export default function AuthPage() {
  const [isSignup, setIsSignup] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, signup } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    fullName: '',
    email: '',
    password: '',
    college: '',
    branch: 'CSE',
    year: 3,
  });

  // Clear stale tokens on auth page load
  useEffect(() => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isSignup) {
        await signup({
          email: form.email,
          password: form.password,
          fullName: form.fullName,
          college: form.college,
          branch: form.branch,
          year: form.year,
          preferredLanguage: 'en',
        });
      } else {
        await login(form.email, form.password);
      }
      navigate('/dashboard');
    } catch (err) {
      const msg = err.message;
      if (msg.includes('already exists')) {
        setError('Email already registered. Switch to login.');
      } else if (msg.includes('Invalid email or password')) {
        setError('Invalid email or password. Check your credentials.');
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  const update = (key, val) => setForm(prev => ({ ...prev, [key]: val }));

  return (
    <div className="min-h-screen bg-darkBg flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute top-1/4 left-10 w-96 h-96 bg-sarthiPrimary/15 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-10 w-96 h-96 bg-sarthiPink/15 rounded-full blur-3xl pointer-events-none"></div>

      <div className="relative w-full max-w-md">
        {/* Back to home */}
        <Link to="/" className="inline-flex items-center gap-2 text-sarthiMuted hover:text-white text-sm mb-6 transition-colors">
          &larr; Back to Vividya
        </Link>

        <div className="bg-darkSurface rounded-2xl border border-white/15 shadow-2xl p-8">
          {/* Logo */}
          <div className="text-center mb-6">
            <div className="w-14 h-14 rounded-2xl bg-primary-gradient p-[1.5px] flex items-center justify-center mx-auto shadow-xl mb-4">
              <div className="w-full h-full bg-darkBg rounded-[14px] flex items-center justify-center">
                <Sparkles className="w-7 h-7 text-sarthiPink" />
              </div>
            </div>
            <h1 className="font-headline font-extrabold text-2xl text-white">
              {isSignup ? 'Create Account' : 'Welcome Back'}
            </h1>
            <p className="text-sm text-sarthiMuted mt-1">
              {isSignup ? 'Join 10,000+ Indian students' : 'Login to your Vividya account'}
            </p>
          </div>

          {error && (
            <div className="bg-red-500/15 border border-red-500/30 text-red-400 text-xs p-3 rounded-xl mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignup && (
              <div className="space-y-1">
                <label className="text-sarthiMuted text-xs font-mono">Full Name</label>
                <div className="relative">
                  <User className="w-4 h-4 text-sarthiMuted absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    value={form.fullName}
                    onChange={(e) => update('fullName', e.target.value)}
                    placeholder="Priya Sharma"
                    className="w-full pl-10 pr-3 py-2.5 bg-darkBg border border-white/10 focus:border-sarthiPurple rounded-xl text-white text-sm placeholder-sarthiMuted/60 outline-none transition-colors"
                  />
                </div>
              </div>
            )}

            <div className="space-y-1">
              <label className="text-sarthiMuted text-xs font-mono">Email</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-sarthiMuted absolute left-3 top-3" />
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => update('email', e.target.value)}
                  placeholder="student@college.edu"
                  className="w-full pl-10 pr-3 py-2.5 bg-darkBg border border-white/10 focus:border-sarthiPurple rounded-xl text-white text-sm placeholder-sarthiMuted/60 outline-none transition-colors"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-sarthiMuted text-xs font-mono">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-sarthiMuted absolute left-3 top-3" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={8}
                  value={form.password}
                  onChange={(e) => update('password', e.target.value)}
                  placeholder="Min 8 characters"
                  className="w-full pl-10 pr-10 py-2.5 bg-darkBg border border-white/10 focus:border-sarthiPurple rounded-xl text-white text-sm placeholder-sarthiMuted/60 outline-none transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-sarthiMuted hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {isSignup && (
              <>
                <div className="space-y-1">
                  <label className="text-sarthiMuted text-xs font-mono">College</label>
                  <div className="relative">
                    <GraduationCap className="w-4 h-4 text-sarthiMuted absolute left-3 top-3" />
                    <input
                      type="text"
                      value={form.college}
                      onChange={(e) => update('college', e.target.value)}
                      placeholder="IIT Bombay / Tier-2 College"
                      className="w-full pl-10 pr-3 py-2.5 bg-darkBg border border-white/10 focus:border-sarthiPurple rounded-xl text-white text-sm placeholder-sarthiMuted/60 outline-none transition-colors"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-sarthiMuted text-xs font-mono">Branch</label>
                    <select
                      value={form.branch}
                      onChange={(e) => update('branch', e.target.value)}
                      className="w-full px-3 py-2.5 bg-darkBg border border-white/10 focus:border-sarthiPurple rounded-xl text-white text-sm outline-none"
                    >
                      <option value="CSE">CSE / IT</option>
                      <option value="ECE">ECE / EEE</option>
                      <option value="MECH">Mechanical / Civil</option>
                      <option value="BCOM">B.Com / BBA</option>
                      <option value="BSC">B.Sc / BCA</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-sarthiMuted text-xs font-mono">Year</label>
                    <select
                      value={form.year}
                      onChange={(e) => update('year', parseInt(e.target.value))}
                      className="w-full px-3 py-2.5 bg-darkBg border border-white/10 focus:border-sarthiPurple rounded-xl text-white text-sm outline-none"
                    >
                      {[1, 2, 3, 4].map(y => (
                        <option key={y} value={y}>Year {y}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-primary-gradient text-white font-headline font-bold rounded-xl shadow-xl shadow-sarthiPrimary/30 hover:shadow-sarthiPrimary/60 hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <span className="animate-pulse">Please wait...</span>
              ) : (
                <>
                  <span>{isSignup ? 'Create Account' : 'Login'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="text-center mt-6">
            <button
              onClick={() => { setIsSignup(!isSignup); setError(''); }}
              className="text-sarthiMuted hover:text-sarthiPink text-sm transition-colors"
            >
              {isSignup ? 'Already have an account? Login' : "Don't have an account? Sign up"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
