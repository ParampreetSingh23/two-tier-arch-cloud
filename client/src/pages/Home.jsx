import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

export default function Home() {
 const { user } = useAuth();
 const [stats, setStats] = useState(null);
 const [groups, setGroups] = useState([]);

 useEffect(() => {
  if (user) {
   api.get('/attendance/stats').then(r => setStats(r.data.stats)).catch(() => { });
   api.get('/groups').then(r => setGroups(r.data.slice(0, 3))).catch(() => { });
  }
 }, [user]);

 return (
  <div className="page-container animate-fade-in">
   <div className="hero-section">
    <h1>Student Attendance System</h1>
    <p className="hero-sub">Track, manage, and analyze attendance effortlessly</p>
    {!user && (
     <div className="hero-actions">
      <Link to="/register" className="btn btn-primary btn-lg">Get Started Free</Link>
      <Link to="/login" className="btn btn-outline btn-lg">Sign In</Link>
     </div>
    )}
   </div>

   {user && stats && (
    <div className="stats-container animate-slide-up">
     <div className="stats-card">
      <div className="stats-icon">👥</div>
      <div className="stats-info">
       <h3>{stats.totalStudents}</h3>
       <p>Total Students</p>
      </div>
     </div>
     <div className="stats-card">
      <div className="stats-icon present">✅</div>
      <div className="stats-info">
       <h3>{stats.present}</h3>
       <p>Present Today</p>
      </div>
     </div>
     <div className="stats-card">
      <div className="stats-icon absent">❌</div>
      <div className="stats-info">
       <h3>{stats.absent}</h3>
       <p>Absent Today</p>
      </div>
     </div>
     <div className="stats-card">
      <div className="stats-icon late">⏰</div>
      <div className="stats-info">
       <h3>{stats.late}</h3>
       <p>Late Today</p>
      </div>
     </div>
    </div>
   )}

   {user && groups.length > 0 && (
    <div className="animate-slide-up" style={{ marginTop: '2rem' }}>
     <div className="header-flex">
      <h2>Recent Classes</h2>
      <Link to="/groups" className="btn btn-outline btn-sm">View All</Link>
     </div>
     <div className="grid-container" style={{ marginTop: '1rem' }}>
      {groups.map(g => (
       <Link key={g.id} to={`/groups/${g.id}`} className="card group-card">
        <div className="card-header"><h3>{g.name}</h3></div>
        <div className="card-body">
         <p>{g.description || 'No description'}</p>
         <span className="badge">{g.studentCount || 0} students</span>
        </div>
       </Link>
      ))}
     </div>
    </div>
   )}

   {!user && (
    <div className="features-grid animate-slide-up">
     {[
      { icon: '📊', title: 'Real-time Tracking', desc: 'Mark and view attendance instantly' },
      { icon: '📧', title: 'Email Alerts', desc: 'Auto-notify students on absence' },
      { icon: '📁', title: 'CSV Import', desc: 'Bulk upload student data' },
      { icon: '📄', title: 'PDF Reports', desc: 'Export professional reports' }
     ].map((f, i) => (
      <div key={i} className="feature-card card">
       <span className="feature-icon">{f.icon}</span>
       <h3>{f.title}</h3>
       <p>{f.desc}</p>
      </div>
     ))}
    </div>
   )}
  </div>
 );
}
