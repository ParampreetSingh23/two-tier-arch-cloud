import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import api from '../api/axios';

const SEMESTERS = [1, 2, 3, 4, 5, 6, 7, 8];

export default function AddStudent() {
 const [groups, setGroups] = useState([]);
 const [errors, setErrors] = useState([]);
 const [loading, setLoading] = useState(false);
 const [searchParams] = useSearchParams();
 const navigate = useNavigate();
 const [form, setForm] = useState({
  rollNumber: '', name: '', email: '', phone: '', course: '',
  semester: '', groupId: searchParams.get('groupId') || ''
 });

 useEffect(() => {
  api.get('/groups').then(r => setGroups(r.data));
 }, []);

 const handleSubmit = async (e) => {
  e.preventDefault();
  setErrors([]);
  setLoading(true);
  try {
   await api.post('/students', form);
   navigate(form.groupId ? `/groups/${form.groupId}` : '/students');
  } catch (err) {
   setErrors(err.response?.data?.errors || [err.response?.data?.error || 'Failed to add student']);
  } finally {
   setLoading(false);
  }
 };

 const f = (field) => ({ value: form[field], onChange: e => setForm({ ...form, [field]: e.target.value }) });

 return (
  <div className="page-container animate-fade-in">
   <div className="page-header">
    <h1>Add New Student</h1>
    <Link to="/students" className="btn btn-outline">← Back to List</Link>
   </div>
   {errors.length > 0 && (
    <div className="alert alert-error animate-shake">
     <ul>{errors.map((e, i) => <li key={i}>{e}</li>)}</ul>
    </div>
   )}
   <div className="card form-card animate-slide-up">
    <form onSubmit={handleSubmit} className="student-form">
     <div className="form-group">
      <label>Class / Group *</label>
      <select required {...f('groupId')}>
       <option value="" disabled>Select Class</option>
       {groups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
      </select>
     </div>
     <div className="form-row">
      <div className="form-group">
       <label>Roll Number *</label>
       <input type="text" required placeholder="e.g. CS2023001" {...f('rollNumber')} />
      </div>
      <div className="form-group">
       <label>Full Name *</label>
       <input type="text" required placeholder="Student's full name" {...f('name')} />
      </div>
     </div>
     <div className="form-row">
      <div className="form-group">
       <label>Email Address *</label>
       <input type="email" required {...f('email')} />
      </div>
      <div className="form-group">
       <label>Phone Number *</label>
       <input type="tel" required {...f('phone')} />
      </div>
     </div>
     <div className="form-row">
      <div className="form-group">
       <label>Course *</label>
       <input type="text" required placeholder="e.g. B.Tech CSE" {...f('course')} />
      </div>
      <div className="form-group">
       <label>Semester *</label>
       <select required {...f('semester')}>
        <option value="" disabled>Select Semester</option>
        {SEMESTERS.map(s => <option key={s} value={s}>Semester {s}</option>)}
       </select>
      </div>
     </div>
     <div className="form-actions">
      <button type="reset" className="btn btn-outline">Reset</button>
      <button type="submit" className="btn btn-primary" disabled={loading}>
       {loading ? 'Saving...' : '💾 Save Student'}
      </button>
     </div>
    </form>
   </div>
  </div>
 );
}
