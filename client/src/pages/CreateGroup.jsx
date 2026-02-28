import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export default function CreateGroup() {
 const [form, setForm] = useState({ name: '', description: '', schedule: [] });
 const [error, setError] = useState('');
 const [loading, setLoading] = useState(false);
 const navigate = useNavigate();

 const toggleDay = (day) => {
  setForm(f => ({
   ...f,
   schedule: f.schedule.includes(day)
    ? f.schedule.filter(d => d !== day)
    : [...f.schedule, day]
  }));
 };

 const handleSubmit = async (e) => {
  e.preventDefault();
  setError('');
  setLoading(true);
  try {
   await api.post('/groups', form);
   navigate('/groups');
  } catch (err) {
   setError(err.response?.data?.error || 'Failed to create class');
  } finally {
   setLoading(false);
  }
 };

 return (
  <div className="page-container animate-fade-in">
   <div className="page-header">
    <h1>Create New Class</h1>
    <Link to="/groups" className="btn btn-outline">← Back</Link>
   </div>
   {error && <div className="alert alert-error">{error}</div>}
   <div className="card form-card animate-slide-up">
    <form onSubmit={handleSubmit} className="student-form">
     <div className="form-group">
      <label htmlFor="name">Class Name *</label>
      <input type="text" id="name" required
       value={form.name}
       onChange={e => setForm({ ...form, name: e.target.value })}
       placeholder="e.g. Computer Science A" />
     </div>
     <div className="form-group">
      <label htmlFor="description">Description</label>
      <textarea id="description" rows={3}
       value={form.description}
       onChange={e => setForm({ ...form, description: e.target.value })}
       placeholder="Optional class description" />
     </div>
     <div className="form-group">
      <label>Schedule (select days)</label>
      <div className="day-selector">
       {DAYS.map(day => (
        <button key={day} type="button"
         className={`day-btn ${form.schedule.includes(day) ? 'active' : ''}`}
         onClick={() => toggleDay(day)}>
         {day}
        </button>
       ))}
      </div>
     </div>
     <div className="form-actions">
      <Link to="/groups" className="btn btn-outline">Cancel</Link>
      <button type="submit" className="btn btn-primary" disabled={loading}>
       {loading ? 'Creating...' : '💾 Create Class'}
      </button>
     </div>
    </form>
   </div>
  </div>
 );
}
