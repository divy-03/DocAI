import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../../store/authStore';
import useProjectStore from '../../store/projectStore';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { projects, loading, fetchProjects, deleteProject } = useProjectStore();
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleCreateProject = () => {
    navigate('/projects/create');
  };

  const handleViewProject = (projectId) => {
    navigate(`/projects/${projectId}`);
  };

  const handleDeleteProject = async (projectId, projectTitle) => {
    if (deleteConfirm === projectId) {
      try {
        await deleteProject(projectId);
        setDeleteConfirm(null);
      } catch (error) {
        alert('Failed to delete project');
      }
    } else {
      setDeleteConfirm(projectId);
      setTimeout(() => setDeleteConfirm(null), 3000);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getDocumentIcon = (type) => {
    return type === 'docx' ? '📄' : '📊';
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
          <div>
            <h2>My Projects</h2>
            <p className="dashboard-subtitle">
              {projects.length} {projects.length === 1 ? 'project' : 'projects'}
            </p>
          </div>
          <button className="btn-primary" onClick={handleCreateProject}>
            + New Project
          </button>
        </div>

        {loading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Loading projects...</p>
          </div>
        ) : projects.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📝</div>
            <h3>No projects yet</h3>
            <p>Create your first AI-powered document</p>
            <button className="btn-primary" onClick={handleCreateProject}>
              Get Started
            </button>
          </div>
        ) : (
          <div className="projects-grid">
            {projects.map((project) => (
              <div key={project.id} className="project-card">
                <div className="project-card-header">
                  <span className="project-icon">
                    {getDocumentIcon(project.document_type)}
                  </span>
                  <span className="project-type">
                    {project.document_type.toUpperCase()}
                  </span>
                </div>
                
                <div className="project-card-body">
                  <h3>{project.title}</h3>
                  <p className="project-topic">{project.topic}</p>
                  <div className="project-meta">
                    <span className="project-sections">
                      {project.section_count} {project.section_count === 1 ? 'section' : 'sections'}
                    </span>
                    <span className="project-date">
                      {formatDate(project.created_at)}
                    </span>
                  </div>
                </div>

                <div className="project-card-actions">
                  <button 
                    className="btn-primary-outline"
                    onClick={() => handleViewProject(project.id)}
                  >
                    Open
                  </button>
                  <button 
                    className={`btn-danger ${deleteConfirm === project.id ? 'confirm' : ''}`}
                    onClick={() => handleDeleteProject(project.id, project.title)}
                  >
                    {deleteConfirm === project.id ? 'Confirm Delete?' : 'Delete'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;

