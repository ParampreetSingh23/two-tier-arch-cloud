import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../api/axios';

export default function ImportStudents() {
 const [groups, setGroups] = useState([]);
 const [groupId, setGroupId] = useState('');
 const [file, setFile] = useState(null);
 const [result, setResult] = useState(null);
 const [error, setError] = useState('');
 const [loading, setLoading] = useState(false);
 const [searchParams] = useSearchParams();

 useEffect(() => {
  api.get('/groups').then(r => setGroups(r.data));
  const gId = searchParams.get('groupId');
  if (gId) setGroupId(gId);
 }, []);

 const handleSubmit = async (e) => {
  e.preventDefault();
  if (!groupId) return setError('Please select a class');
  if (!file) return setError('Please upload a CSV file');
  setLoading(true); setError(''); setResult(null);

  const formData = new FormData();
  formData.append('groupId', groupId);
  formData.append('file', file);

  try {
   const res = await api.post('/students/import', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
   });
   setResult(res.data);
  } catch (err) {
   setError(err.response?.data?.error || 'Import failed');
  } finally {
   setLoading(false);
  }
 };

 return (
  <div className="page-container animate-fade-in">
   <div className="page-header">
    <h1>Import Students</h1>
    <Link to="/students" className="btn btn-outline">← Back to List</Link>
   </div>
   {error && <div className="alert alert-error">{error}</div>}
   {result && (
    <div className="alert alert-success">
     ✅ {result.message}
     {result.errors?.length > 0 && (
      <ul style={{ marginTop: '8px' }}>{result.errors.map((e, i) => <li key={i}>{e}</li>)}</ul>
     )}
    </div>
   )}
   <div className="card form-card animate-slide-up">
    <div className="import-guide" style={{ marginBottom: '1.5rem', padding: '1rem', background: 'var(--bg-secondary)', borderRadius: '8px' }}>
     <h3>📋 CSV Format Guide</h3>
     <p>Required columns: <code>roll number</code>, <code>name</code>, <code>email</code></p>
     <p>Optional: <code>phone</code>, <code>course</code>, <code>semester</code></p>
    </div>
    <form onSubmit={handleSubmit} className="student-form">
     <div className="form-group">
      <label>Select Class *</label>
      <select required value={groupId} onChange={e => setGroupId(e.target.value)}>
       <option value="" disabled>Choose a class</option>
       {groups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
      </select>
     </div>
     <div className="form-group">
      <label>CSV File *</label>
      <input type="file" accept=".csv" required
       onChange={e => setFile(e.target.files[0])} />
     </div>
     <div className="form-actions">
      <button type="submit" className="btn btn-primary" disabled={loading}>
       {loading ? 'Importing...' : '⬆ Import Students'}
      </button>
     </div>
    </form>
   </div>
  </div>
 );
}
