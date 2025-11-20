import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../../store/authStore';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="dashboard-container">
      <nav className="navbar">
        <div className="navbar-brand">
          <h1>AI Document Platform</h1>
        </div>
        <div className="navbar-user">
          <span>Welcome, {user?.username}</span>
          <button onClick={handleLogout} className="btn-secondary">
            Logout
          </button>
        </div>
      </nav>

      <div className="dashboard-content">
        <div className="dashboard-header">
          <h2>My Projects</h2>
          <button className="btn-primary">+ New Project</button>
        </div>

        <div className="projects-grid">
          <div className="empty-state">
            <h3>No projects yet</h3>
            <p>Create your first AI-powered document</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
