import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import api from '../api/axios';

const SEMESTERS = [1, 2, 3, 4, 5, 6, 7, 8];

export default function EditStudent() {
 const { id } = useParams();
 const navigate = useNavigate();
 const [groups, setGroups] = useState([]);
 const [errors, setErrors] = useState([]);
 const [loading, setLoading] = useState(false);
 const [form, setForm] = useState(null);

 useEffect(() => {
  Promise.all([api.get(`/students/${id}`), api.get('/groups')]).then(([sr, gr]) => {
   const s = sr.data;
   setForm({
    rollNumber: s.rollNumber, name: s.name, email: s.email,
    phone: s.phone, course: s.course, semester: String(s.semester),
    groupId: s.groupId
   });
   setGroups(gr.data);
  });
 }, [id]);

 const handleSubmit = async (e) => {
  e.preventDefault();
  setErrors([]);
  setLoading(true);
  try {
   await api.put(`/students/${id}`, form);
   navigate('/students');
  } catch (err) {
   setErrors(err.response?.data?.errors || [err.response?.data?.error || 'Failed to update']);
  } finally {
   setLoading(false);
  }
 };

 if (!form) return <div className="loading-spinner">Loading...</div>;

 const f = (field) => ({ value: form[field], onChange: e => setForm({ ...form, [field]: e.target.value }) });

 return (
  <div className="page-container animate-fade-in">
   <div className="page-header">
    <h1>Edit Student</h1>
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
      <label>Class / Group </label>
      <select required {...f('groupId')}>
       <option value="" disabled>Select Class</option>
       {groups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
      </select>
     </div>
     <div className="form-row">
      <div className="form-group">
       <label>Roll Number *</label>
       <input type="text" required {...f('rollNumber')} />
      </div>
      <div className="form-group">
       <label>Full Name *</label>
       <input type="text" required {...f('name')} />
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
       <input type="text" required {...f('course')} />
      </div>
      <div className="form-group">
       <label>Semester *</label>
       <select required {...f('semester')}>
        <option value="" disabled>Select Semester</option>
        {SEMESTERS.map(s => <option key={s} value={String(s)}>Semester {s}</option>)}
       </select>
      </div>
     </div>
     <div className="form-actions">
      <Link to="/students" className="btn btn-outline">Cancel</Link>
      <button type="submit" className="btn btn-primary" disabled={loading}>
       {loading ? 'Updating...' : '💾 Update Student'}
      </button>
     </div>
    </form>
   </div>
  </div>
 );
}
