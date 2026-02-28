import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';

export default function StudentList() {
 const [students, setStudents] = useState([]);
 const [search, setSearch] = useState('');
 const [loading, setLoading] = useState(true);
 const [toDelete, setToDelete] = useState(null);

 useEffect(() => {
  api.get('/students').then(r => setStudents(r.data)).finally(() => setLoading(false));
 }, []);

 const handleDelete = async () => {
  try {
   await api.delete(`/students/${toDelete.id}`);
   setStudents(students.filter(s => s.id !== toDelete.id));
   setToDelete(null);
  } catch { alert('Failed to delete student'); }
 };

 const filtered = students.filter(s =>
  s.name.toLowerCase().includes(search.toLowerCase()) ||
  s.rollNumber.toLowerCase().includes(search.toLowerCase())
 );

 if (loading) return <div className="loading-spinner">Loading...</div>;

 return (
  <div className="page-container animate-fade-in">
   <div className="page-header">
    <h1>Student List</h1>
    <Link to="/students/add" className="btn btn-primary">+ Add New Student</Link>
   </div>

   <div className="card student-list-card animate-slide-up">
    <div className="search-container">
     <div className="search-input">
      <span>🔍</span>
      <input type="text" placeholder="Search students..."
       value={search} onChange={e => setSearch(e.target.value)} />
     </div>
    </div>
    <div className="table-container">
     <table className="data-table">
      <thead>
       <tr>
        <th>Roll No</th><th>Name</th><th>Course</th><th>Sem</th>
        <th>Email</th><th>Phone</th><th>Actions</th>
       </tr>
      </thead>
      <tbody>
       {filtered.length > 0 ? filtered.map(s => (
        <tr key={s.id}>
         <td>{s.rollNumber}</td>
         <td>{s.name}</td>
         <td>{s.course}</td>
         <td>{s.semester}</td>
         <td>{s.email}</td>
         <td>{s.phone}</td>
         <td className="actions">
          <Link to={`/students/edit/${s.id}`} className="action-btn edit-btn" title="Edit">✏️</Link>
          <button className="action-btn delete-btn" title="Delete"
           onClick={() => setToDelete(s)}>🗑️</button>
         </td>
        </tr>
       )) : (
        <tr><td colSpan="7" className="no-data">No students found</td></tr>
       )}
      </tbody>
     </table>
    </div>
   </div>

   {toDelete && (
    <div className="modal show" onClick={e => e.target === e.currentTarget && setToDelete(null)}>
     <div className="modal-content animate-pop-in">
      <div className="modal-header">
       <h3>Confirm Deletion</h3>
       <button className="close-btn" onClick={() => setToDelete(null)}>✕</button>
      </div>
      <div className="modal-body">
       <p>Delete <strong>{toDelete.name}</strong>? This cannot be undone.</p>
      </div>
      <div className="modal-footer">
       <button className="btn btn-outline" onClick={() => setToDelete(null)}>Cancel</button>
       <button className="btn btn-danger" onClick={handleDelete}>Delete</button>
      </div>
     </div>
    </div>
   )}
  </div>
 );
}
