import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Shield, Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const LoginPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('Student');
  const [error, setError] = useState('');

  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (isLogin) {
        await login(email, password);
      } else {
        await register(email, password, role);
      }
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Authentication failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background relative overflow-hidden">
      {/* The one bold moment: a vault-dial motif behind the form */}
      <div className="absolute inset-0 vault-rings pointer-events-none" />
      <div
        className="absolute -top-32 left-1/2 -translate-x-1/2 w-[640px] h-[640px] rounded-full pointer-events-none"
        style={{ border: '1px solid rgba(184,135,74,0.12)' }}
      />
      <div
        className="absolute -top-32 left-1/2 -translate-x-1/2 w-[480px] h-[480px] rounded-full pointer-events-none"
        style={{ border: '1px solid rgba(184,135,74,0.08)' }}
      />

      <div className="relative bg-surface p-8 rounded-md border border-border w-full max-w-md">
        <div className="flex flex-col items-center mb-6 pb-6 border-b border-border">
          <div className="bg-primary/10 p-3 rounded-full border border-primary/25 mb-4">
            <Shield className="w-7 h-7 text-primary" />
          </div>
          <h1 className="text-xl font-display font-semibold tracking-tight text-textMain">Vault</h1>
          <p className="text-sm text-textMuted mt-1">Sign in to your secure file exchange</p>
        </div>

        {error && (
          <div className="bg-danger/10 border border-danger/30 text-danger-soft p-3 rounded mb-4 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-textMuted mb-1.5">Email</label>
            <input
              type="email"
              className="w-full bg-background border border-border rounded px-3 py-2.5 focus:outline-none focus:border-primary text-textMain text-sm transition-colors"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-sm text-textMuted mb-1.5">Passphrase</label>
            <input
              type="password"
              className="w-full bg-background border border-border rounded px-3 py-2.5 focus:outline-none focus:border-primary text-textMain text-sm transition-colors"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {!isLogin && (
            <div>
              <label className="block text-sm text-textMuted mb-1.5">Role</label>
              <select
                className="w-full bg-background border border-border rounded px-3 py-2.5 focus:outline-none focus:border-primary text-textMain text-sm"
                value={role}
                onChange={(e) => setRole(e.target.value)}
              >
                <option value="Student">Student</option>
                <option value="Professor">Professor</option>
              </select>
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-primary hover:bg-primaryDark text-background font-semibold py-2.5 rounded flex items-center justify-center gap-2 transition-colors uppercase text-xs tracking-wide"
          >
            <Lock className="w-4 h-4" />
            {isLogin ? 'Authenticate Identity' : 'Register New Key'}
          </button>
        </form>

        <div className="mt-6 pt-5 border-t border-border text-center">
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-sm text-textMuted hover:text-primary-soft transition-colors"
          >
            {isLogin ? "Don't have access? Register" : 'Already have access? Sign in'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
