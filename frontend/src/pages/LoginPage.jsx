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
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="bg-surface p-8 rounded-xl shadow-2xl w-full max-w-md border border-gray-800">
        <div className="flex flex-col items-center mb-8">
          <div className="bg-primary/10 p-4 rounded-full mb-4">
            <Shield className="w-12 h-12 text-primary" />
          </div>
          <h1 className="text-2xl font-bold">Secure File Vault</h1>
          <p className="text-textMuted text-sm mt-2">Zero-Trust Architecture</p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-3 rounded mb-4 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-textMuted mb-1">Email</label>
            <input
              type="email"
              className="w-full bg-background border border-gray-700 rounded px-4 py-2 focus:outline-none focus:border-primary text-textMain"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          
          <div>
            <label className="block text-sm text-textMuted mb-1">Password</label>
            <input
              type="password"
              className="w-full bg-background border border-gray-700 rounded px-4 py-2 focus:outline-none focus:border-primary text-textMain"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {!isLogin && (
            <div>
              <label className="block text-sm text-textMuted mb-1">Role</label>
              <select
                className="w-full bg-background border border-gray-700 rounded px-4 py-2 focus:outline-none focus:border-primary text-textMain"
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
            className="w-full bg-primary hover:bg-primaryDark text-white font-medium py-2 rounded flex items-center justify-center gap-2 transition-colors"
          >
            <Lock className="w-4 h-4" />
            {isLogin ? 'Authenticate' : 'Initialize Identity'}
          </button>
        </form>

        <p className="text-center text-sm text-textMuted mt-6">
          {isLogin ? "Don't have an identity?" : "Already initialized?"}{' '}
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-primary hover:underline"
          >
            {isLogin ? 'Register now' : 'Login here'}
          </button>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
