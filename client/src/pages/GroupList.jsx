import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';

export default function GroupList() {
 const [groups, setGroups] = useState([]);
 const [loading, setLoading] = useState(true);
 const [error, setError] = useState('');

 const fetchGroups = async () => {
  try {
   const res = await api.get('/groups');
   setGroups(res.data);
  } catch (err) {
   setError('Failed to load classes');
  } finally {
   setLoading(false);
  }
 };

 useEffect(() => { fetchGroups(); }, []);

 const handleDelete = async (id, name) => {
  if (!window.confirm(`Delete "${name}"? All students in this class will be deleted.`)) return;
  try {
   await api.delete(`/groups/${id}`);
   setGroups(groups.filter(g => g.id !== id));
  } catch {
   alert('Failed to delete class');
  }
 };

 if (loading) return <div className="loading-spinner">Loading...</div>;

 return (
  <div className="container animate-fade-in">
   <div className="header-flex">
    <h1>My Classes</h1>
    <div className="actions">
     <Link to="/students/import" className="btn btn-outline">⬆ Import Students</Link>
     <Link to="/groups/create" className="btn btn-primary">+ Create New Class</Link>
    </div>
   </div>

   {error && <div className="alert alert-error">{error}</div>}

   {groups.length === 0 ? (
    <div className="empty-state animate-slide-up">
     <div className="empty-icon">📚</div>
     <h3>No Classes Yet</h3>
     <p>Create your first class to start managing students.</p>
     <Link to="/groups/create" className="btn btn-primary">Create Class</Link>
    </div>
   ) : (
    <div className="grid-container animate-slide-up">
     {groups.map((group, index) => (
      <div className="card group-card" key={group.id} style={{ animationDelay: `${index * 0.1}s` }}>
       <div className="card-header">
        <h3>{group.name}</h3>
        {group.schedule?.length > 0 && (
         <span className="badge">{group.schedule.join(', ')}</span>
        )}
       </div>
       <div className="card-body">
        {group.description && <p className="description">{group.description}</p>}
        <div className="stats-row">
         <div className="stat">
          <span>👥 {group.studentCount || 0} Students</span>
         </div>
        </div>
       </div>
       <div className="card-footer">
        <Link to={`/groups/${group.id}`} className="btn btn-outline btn-block">
         View Dashboard
        </Link>
        <button
         className="btn btn-danger btn-sm btn-block"
         style={{ marginTop: '8px' }}
         onClick={() => handleDelete(group.id, group.name)}
        >
         Delete
        </button>
       </div>
      </div>
     ))}
    </div>
   )}
  </div>
 );
}
