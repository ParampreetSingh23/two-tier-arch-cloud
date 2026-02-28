import { useEffect, useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

const STATUS_OPTIONS = ['present', 'absent', 'late'];

export default function MarkAttendance() {
 const [searchParams] = useSearchParams();
 const groupId = searchParams.get('groupId');
 const { user } = useAuth();
 const navigate = useNavigate();

 const [data, setData] = useState(null);
 const [attendance, setAttendance] = useState({});
 const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
 const [saving, setSaving] = useState(false);
 const [success, setSuccess] = useState('');

 useEffect(() => {
  if (!groupId) { navigate('/groups'); return; }
  api.get(`/attendance/mark?groupId=${groupId}`).then(r => {
   setData(r.data);
   const init = {};
   r.data.students.forEach(s => { init[s.id] = { status: 'present', notes: '' }; });
   setAttendance(init);
  });
 }, [groupId]);

 const setStatus = (id, status) => setAttendance(a => ({ ...a, [id]: { ...a[id], status } }));
 const setNotes = (id, notes) => setAttendance(a => ({ ...a, [id]: { ...a[id], notes } }));

 const handleSubmit = async (e) => {
  e.preventDefault();
  setSaving(true); setSuccess('');
  const attendanceData = Object.entries(attendance).map(([studentId, v]) => ({ studentId, ...v }));
  try {
   await api.post('/attendance/mark', { date, markedBy: user.name, attendanceData });
   setSuccess('Attendance marked successfully! ✅');
   setTimeout(() => navigate(`/groups/${groupId}`), 1500);
  } catch { alert('Failed to mark attendance'); }
  finally { setSaving(false); }
 };

 if (!data) return <div className="loading-spinner">Loading...</div>;

 const statusColor = { present: '#16a34a', absent: '#dc2626', late: '#d97706' };

 return (
  <div className="page-container animate-fade-in">
   <div className="page-header">
    <div>
     <h1>Mark Attendance</h1>
     <p className="text-muted">{data.group.name}</p>
    </div>
    <Link to={`/groups/${groupId}`} className="btn btn-outline">← Back</Link>
   </div>

   {success && <div className="alert alert-success">{success}</div>}

   <form onSubmit={handleSubmit}>
    <div className="card animate-slide-up" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
     <div className="form-group">
      <label htmlFor="date"><strong>Date</strong></label>
      <input type="date" id="date" value={date}
       onChange={e => setDate(e.target.value)}
       style={{ maxWidth: '250px' }} />
     </div>
     <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
      {STATUS_OPTIONS.map(s => (
       <button key={s} type="button" className="btn btn-sm"
        style={{ background: statusColor[s], color: 'white' }}
        onClick={() => data.students.forEach(st => setStatus(st.id, s))}>
        All {s.charAt(0).toUpperCase() + s.slice(1)}
       </button>
      ))}
     </div>
    </div>

    {data.students.length === 0 ? (
     <div className="empty-state">
      <p>No students in this class. <Link to={`/students/add?groupId=${groupId}`}>Add students first</Link></p>
     </div>
    ) : (
     <div className="card animate-slide-up">
      <div className="table-container">
       <table className="data-table">
        <thead>
         <tr><th>Roll No</th><th>Name</th><th>Status</th><th>Notes</th></tr>
        </thead>
        <tbody>
         {data.students.map(s => (
          <tr key={s.id}>
           <td><span className="badge">{s.rollNumber}</span></td>
           <td>{s.name}</td>
           <td>
            <div className="status-selector">
             {STATUS_OPTIONS.map(opt => (
              <button key={opt} type="button"
               className={`status-btn ${attendance[s.id]?.status === opt ? 'active' : ''} status-${opt}`}
               onClick={() => setStatus(s.id, opt)}>
               {opt.charAt(0).toUpperCase() + opt.slice(1)}
              </button>
             ))}
            </div>
           </td>
           <td>
            <input type="text" placeholder="Optional note"
             value={attendance[s.id]?.notes || ''}
             onChange={e => setNotes(s.id, e.target.value)}
             style={{ width: '100%', padding: '4px 8px', borderRadius: '4px', border: '1px solid var(--border-color)' }} />
           </td>
          </tr>
         ))}
        </tbody>
       </table>
      </div>
     </div>
    )}

    {data.students.length > 0 && (
     <div className="form-actions" style={{ marginTop: '1.5rem' }}>
      <Link to={`/groups/${groupId}`} className="btn btn-outline">Cancel</Link>
      <button type="submit" className="btn btn-primary" disabled={saving}>
       {saving ? 'Saving...' : '✅ Submit Attendance'}
      </button>
     </div>
    )}
   </form>
  </div>
 );
}
