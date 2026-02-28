import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/axios';

export default function GroupDashboard() {
 const { id } = useParams();
 const [data, setData] = useState(null);
 const [loading, setLoading] = useState(true);

 useEffect(() => {
  api.get(`/groups/${id}`)
   .then(r => setData(r.data))
   .catch(() => { })
   .finally(() => setLoading(false));
 }, [id]);

 if (loading) return <div className="loading-spinner">Loading...</div>;
 if (!data) return <div className="container"><div className="alert alert-error">Group not found.</div></div>;

 const { students = [], ...group } = data;

 return (
  <div className="container animate-fade-in">
   <div className="breadcrumb">
    <Link to="/groups" className="text-muted">My Classes</Link>
    <span className="separator"> / </span>
    <span className="active">{group.name}</span>
   </div>

   <div className="header-flex" style={{ marginTop: '1rem' }}>
    <div>
     <h1>{group.name}</h1>
     <p className="text-muted">{group.description || 'No description'}</p>
     {group.schedule?.length > 0 && (
      <div style={{ marginTop: '8px' }}>
       {group.schedule.map(d => (
        <span key={d} className="badge" style={{ marginRight: '6px' }}>{d}</span>
       ))}
      </div>
     )}
    </div>
    <div className="actions">
     <Link to={`/attendance/mark?groupId=${id}`} className="btn btn-accent">✅ Mark Attendance</Link>
     <Link to={`/students/import?groupId=${id}`} className="btn btn-outline">⬆ Import CSV</Link>
     <Link to={`/students/add?groupId=${id}`} className="btn btn-primary">+ Add Student</Link>
    </div>
   </div>

   <div className="stats-container animate-slide-up" style={{ marginTop: '2rem' }}>
    <div className="stats-card">
     <div className="stats-icon">👥</div>
     <div className="stats-info"><h3>{students.length}</h3><p>Total Students</p></div>
    </div>
    <div className="stats-card">
     <div className="stats-icon">📅</div>
     <div className="stats-info">
      <h3>{new Date(group.createdAt).toLocaleDateString()}</h3>
      <p>Class Created</p>
     </div>
    </div>
   </div>

   <section style={{ marginTop: '2.5rem' }}>
    <div className="header-flex">
     <h2>Students ({students.length})</h2>
     <Link to={`/attendance/view?groupId=${id}`} className="btn btn-outline btn-sm">
      View Attendance Records
     </Link>
    </div>
    {students.length === 0 ? (
     <div className="empty-state">
      <p>No students in this class yet.</p>
      <Link to={`/students/add?groupId=${id}`} className="btn btn-primary">Add Student</Link>
     </div>
    ) : (
     <div className="table-container" style={{ marginTop: '1rem' }}>
      <table className="data-table">
       <thead>
        <tr><th>Roll No</th><th>Name</th><th>Email</th><th>Phone</th><th>Actions</th></tr>
       </thead>
       <tbody>
        {students.map(s => (
         <tr key={s.id}>
          <td><span className="badge">{s.rollNumber}</span></td>
          <td>{s.name}</td>
          <td>{s.email}</td>
          <td>{s.phone}</td>
          <td>
           <Link to={`/students/edit/${s.id}`} className="btn-icon" title="Edit">✏️</Link>
          </td>
         </tr>
        ))}
       </tbody>
      </table>
     </div>
    )}
   </section>
  </div>
 );
}
