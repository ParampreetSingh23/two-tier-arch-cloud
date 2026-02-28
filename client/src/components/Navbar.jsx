import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
 const { user, logout } = useAuth();
 const navigate = useNavigate();
 const location = useLocation();

 const handleLogout = () => {
  logout();
  navigate('/login');
 };

 const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + '/');

 return (
  <nav className="navbar">
   <div className="nav-brand">
    <Link to="/">
     <span className="brand-icon">📋</span>
     <span className="brand-text">AttendTrack</span>
    </Link>
   </div>

   {user && (
    <div className="nav-links">
     <Link to="/groups" className={`nav-link ${isActive('/groups') ? 'active' : ''}`}>
      Classes
     </Link>
     <Link to="/students" className={`nav-link ${isActive('/students') ? 'active' : ''}`}>
      Students
     </Link>
    </div>
   )}

   <div className="nav-actions">
    {user ? (
     <>
      <span className="nav-user">👤 {user.name}</span>
      <button className="btn btn-outline btn-sm" onClick={handleLogout}>
       Logout
      </button>
     </>
    ) : (
     <>
      <Link to="/login" className="btn btn-outline btn-sm">Login</Link>
      <Link to="/register" className="btn btn-primary btn-sm">Register</Link>
     </>
    )}
   </div>
  </nav>
 );
}
