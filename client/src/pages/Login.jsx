import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
 const [form, setForm] = useState({ email: '', password: '' });
 const [error, setError] = useState('');
 const [loading, setLoading] = useState(false);
 const { login } = useAuth();
 const navigate = useNavigate();

 const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);
  setError('');
  const result = await login(form.email, form.password);
  setLoading(false);
  if (result.success) navigate('/groups');
  else setError(result.error);
 };

 return (
  <div className="auth-page animate-fade-in">
   <div className="auth-card card">
    <div className="auth-header">
     <span className="auth-icon">📋</span>
     <h1>Welcome Back</h1>
     <p>Sign in to your account</p>
    </div>
    {error && <div className="alert alert-error animate-shake">⚠️ {error}</div>}
    <form onSubmit={handleSubmit} className="auth-form">
     <div className="form-group">
      <label htmlFor="email">Email Address</label>
      <input
       type="email" id="email" required
       value={form.email}
       onChange={e => setForm({ ...form, email: e.target.value })}
       placeholder="you@example.com"
      />
     </div>
     <div className="form-group">
      <label htmlFor="password">Password</label>
      <input
       type="password" id="password" required
       value={form.password}
       onChange={e => setForm({ ...form, password: e.target.value })}
       placeholder="••••••••"
      />
     </div>
     <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
      {loading ? 'Signing in...' : 'Sign In'}
     </button>
    </form>
    <p className="auth-footer">
     Don't have an account? <Link to="/register">Register</Link>
    </p>
   </div>
  </div>
 );
}
