import { useEffect, useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';

export default function ViewAttendance() {
 const [searchParams] = useSearchParams();
 const groupId = searchParams.get('groupId');
 const navigate = useNavigate();

 const [data, setData] = useState(null);
 const [date, setDate] = useState('');
 const [studentId, setStudentId] = useState('');

 const fetchData = () => {
  if (!groupId) { navigate('/groups'); return; }
  let url = `/attendance/view?groupId=${groupId}`;
  if (date) url += `&date=${date}`;
  if (studentId) url += `&studentId=${studentId}`;
  api.get(url).then(r => setData(r.data)).catch(() => { });
 };

 useEffect(() => { fetchData(); }, [groupId]);

 const statusBadge = (s) => {
  const c = { present: 'badge-present', absent: 'badge-absent', late: 'badge-late' };
  return <span className={`badge ${c[s] || ''}`}>{s}</span>;
 };

 const handleExport = () => {
  window.open(`http://localhost:5000/api/export/pdf?groupId=${groupId}`, '_blank');
 };

 if (!data) return <div className="loading-spinner">Loading...</div>;

 return (
  <div className="page-container animate-fade-in">
   <div className="page-header">
    <div>
     <h1>Attendance Records</h1>
     <p className="text-muted">{data.group?.name}</p>
    </div>
    <div className="actions">
     <button onClick={handleExport} className="btn btn-outline">📄 Export PDF</button>
     <Link to={`/attendance/mark?groupId=${groupId}`} className="btn btn-primary">Mark Attendance</Link>
    </div>
   </div>

   <div className="card animate-slide-up" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
    <div className="form-row">
     <div className="form-group">
      <label>Filter by Date</label>
      <input type="date" value={date} onChange={e => setDate(e.target.value)} />
     </div>
     <div className="form-group">
      <label>Filter by Student</label>
      <select value={studentId} onChange={e => setStudentId(e.target.value)}>
       <option value="">All Students</option>
       {data.students?.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
      </select>
     </div>
     <div className="form-group" style={{ alignSelf: 'flex-end' }}>
      <button className="btn btn-primary" onClick={fetchData}>🔍 Filter</button>
      <button className="btn btn-outline" style={{ marginLeft: '8px' }}
       onClick={() => { setDate(''); setStudentId(''); setTimeout(fetchData, 0); }}>
       Clear
      </button>
     </div>
    </div>
   </div>

   <div className="card animate-slide-up">
    {data.attendance?.length === 0 ? (
     <div className="empty-state"><p>No attendance records found.</p></div>
    ) : (
     <div className="table-container">
      <table className="data-table">
       <thead>
        <tr><th>Student</th><th>Roll No</th><th>Date</th><th>Status</th><th>Notes</th></tr>
       </thead>
       <tbody>
        {data.attendance?.map(a => (
         <tr key={a.id}>
          <td>{a.student?.name}</td>
          <td><span className="badge">{a.student?.rollNumber}</span></td>
          <td>{new Date(a.date).toLocaleDateString()}</td>
          <td>{statusBadge(a.status)}</td>
          <td>{a.notes || '-'}</td>
         </tr>
        ))}
       </tbody>
      </table>
     </div>
    )}
   </div>
  </div>
 );
}
