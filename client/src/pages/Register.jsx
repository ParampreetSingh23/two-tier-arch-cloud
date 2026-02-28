import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Register() {
 const [form, setForm] = useState({ name: '', email: '', password: '', instituteType: '' });
 const [error, setError] = useState('');
 const [loading, setLoading] = useState(false);
 const { register } = useAuth();
 const navigate = useNavigate();

 const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);
  setError('');
  const result = await register(form.name, form.email, form.password, form.instituteType);
  setLoading(false);
  if (result.success) navigate('/groups');
  else setError(result.error);
 };

 return (
  <div className="auth-page animate-fade-in">
   <div className="auth-card card">
    <div className="auth-header">
     <span className="auth-icon">🎓</span>
     <h1>Create Account</h1>
     <p>Start tracking attendance for free</p>
    </div>
    {error && <div className="alert alert-error animate-shake">⚠️ {error}</div>}
    <form onSubmit={handleSubmit} className="auth-form">
     <div className="form-group">
      <label htmlFor="name">Full Name</label>
      <input type="text" id="name" required
       value={form.name}
       onChange={e => setForm({ ...form, name: e.target.value })}
       placeholder="Dr. John Doe" />
     </div>
     <div className="form-group">
      <label htmlFor="email">Email Address</label>
      <input type="email" id="email" required
       value={form.email}
       onChange={e => setForm({ ...form, email: e.target.value })}
       placeholder="you@example.com" />
     </div>
     <div className="form-group">
      <label htmlFor="password">Password</label>
      <input type="password" id="password" required minLength={8}
       value={form.password}
       onChange={e => setForm({ ...form, password: e.target.value })}
       placeholder="Min 8 characters" />
     </div>
     <div className="form-group">
      <label htmlFor="instituteType">Institute Type</label>
      <select id="instituteType"
       value={form.instituteType}
       onChange={e => setForm({ ...form, instituteType: e.target.value })}>
       <option value="">Select type (optional)</option>
       <option value="school">School</option>
       <option value="college">College</option>
       <option value="university">University</option>
       <option value="coaching">Coaching Center</option>
      </select>
     </div>
     <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
      {loading ? 'Creating account...' : 'Create Account'}
     </button>
    </form>
    <p className="auth-footer">
     Already have an account? <Link to="/login">Sign In</Link>
    </p>
   </div>
  </div>
 );
}
