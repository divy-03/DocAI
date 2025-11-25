import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../../store/authStore';
import useProjectStore from '../../store/projectStore';
import { showToast } from '../../utils/toast';

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

  const handleDeleteProject = async (projectId) => {
    if (deleteConfirm === projectId) {
      try {
        await deleteProject(projectId);
        showToast.success('Project deleted successfully');
        setDeleteConfirm(null);
      } catch (error) {
        showToast.error('Failed to delete project');
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
    <div className="min-h-screen bg-mocha-base dark:bg-mocha-base light:bg-latte-base">
      {/* Navbar */}
      <nav className="bg-mocha-mantle dark:bg-mocha-mantle light:bg-latte-mantle shadow-sm border-b border-mocha-surface0 dark:border-mocha-surface0 light:border-latte-surface0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-mocha-mauve dark:bg-mocha-mauve light:bg-latte-mauve rounded-xl flex items-center justify-center">
                <span className="text-2xl">📝</span>
              </div>
              <h1 className="text-xl font-bold text-mocha-text dark:text-mocha-text light:text-latte-text">
                AI Document Platform
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-mocha-subtext0 dark:text-mocha-subtext0 light:text-latte-subtext0">
                Welcome, <span className="font-semibold text-mocha-text dark:text-mocha-text light:text-latte-text">{user?.username}</span>
              </span>
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-sm font-medium text-mocha-text dark:text-mocha-text light:text-latte-text bg-mocha-surface0 dark:bg-mocha-surface0 light:bg-latte-surface0 border border-mocha-surface2 dark:border-mocha-surface2 light:border-latte-surface2 rounded-lg hover:bg-mocha-surface1 dark:hover:bg-mocha-surface1 light:hover:bg-latte-surface1 transition duration-200"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-bold text-mocha-text dark:text-mocha-text light:text-latte-text">
              My Projects
            </h2>
            <p className="mt-1 text-sm text-mocha-subtext0 dark:text-mocha-subtext0 light:text-latte-subtext0">
              {projects.length} {projects.length === 1 ? 'project' : 'projects'}
            </p>
          </div>
          <button
            onClick={handleCreateProject}
            className="flex items-center space-x-2 px-6 py-3 bg-mocha-mauve dark:bg-mocha-mauve light:bg-latte-mauve text-mocha-crust dark:text-mocha-crust light:text-latte-base rounded-lg hover:bg-mocha-lavender dark:hover:bg-mocha-lavender light:hover:bg-latte-lavender font-semibold transition duration-200 shadow-sm hover:shadow-md"
          >
            <span className="text-xl">+</span>
            <span>New Project</span>
          </button>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="spinner"></div>
            <p className="mt-4 text-mocha-subtext0 dark:text-mocha-subtext0 light:text-latte-subtext0">
              Loading projects...
            </p>
          </div>
        ) : projects.length === 0 ? (
          /* Empty State */
          <div className="text-center py-20 bg-mocha-mantle dark:bg-mocha-mantle light:bg-latte-mantle rounded-2xl border-2 border-dashed border-mocha-surface1 dark:border-mocha-surface1 light:border-latte-surface1">
            <div className="text-6xl mb-4">📝</div>
            <h3 className="text-xl font-semibold text-mocha-text dark:text-mocha-text light:text-latte-text mb-2">
              No projects yet
            </h3>
            <p className="text-mocha-subtext0 dark:text-mocha-subtext0 light:text-latte-subtext0 mb-6">
              Create your first AI-powered document
            </p>
            <button
              onClick={handleCreateProject}
              className="inline-flex items-center space-x-2 px-6 py-3 bg-mocha-mauve dark:bg-mocha-mauve light:bg-latte-mauve text-mocha-crust dark:text-mocha-crust light:text-latte-base rounded-lg hover:bg-mocha-lavender dark:hover:bg-mocha-lavender light:hover:bg-latte-lavender font-semibold transition duration-200"
            >
              <span className="text-xl">+</span>
              <span>Get Started</span>
            </button>
          </div>
        ) : (
          /* Projects Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <div
                key={project.id}
                className="bg-mocha-mantle dark:bg-mocha-mantle light:bg-latte-mantle rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200 border border-mocha-surface0 dark:border-mocha-surface0 light:border-latte-surface0 overflow-hidden"
              >
                {/* Card Header */}
                <div className="p-6 border-b border-mocha-surface0 dark:border-mocha-surface0 light:border-latte-surface0">
                  <div className="flex justify-between items-start mb-4">
                    <span className="text-4xl">{getDocumentIcon(project.document_type)}</span>
                    <span className="px-3 py-1 text-xs font-semibold text-mocha-mauve dark:text-mocha-mauve light:text-latte-mauve bg-mocha-mauve/10 dark:bg-mocha-mauve/10 light:bg-latte-mauve/10 rounded-full">
                      {project.document_type.toUpperCase()}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-mocha-text dark:text-mocha-text light:text-latte-text mb-2 line-clamp-2">
                    {project.title}
                  </h3>
                  <p className="text-sm text-mocha-subtext0 dark:text-mocha-subtext0 light:text-latte-subtext0 line-clamp-2 mb-4">
                    {project.topic}
                  </p>
                  <div className="flex justify-between text-xs text-mocha-overlay0 dark:text-mocha-overlay0 light:text-latte-overlay0">
                    <span className="bg-mocha-surface0 dark:bg-mocha-surface0 light:bg-latte-surface0 px-2 py-1 rounded">
                      {project.section_count} {project.section_count === 1 ? 'section' : 'sections'}
                    </span>
                    <span>{formatDate(project.created_at)}</span>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="p-4 bg-mocha-surface0/50 dark:bg-mocha-surface0/50 light:bg-latte-surface0/50 flex space-x-2">
                  <button
                    onClick={() => handleViewProject(project.id)}
                    className="flex-1 px-4 py-2 text-sm font-medium text-mocha-mauve dark:text-mocha-mauve light:text-latte-mauve bg-mocha-mantle dark:bg-mocha-mantle light:bg-latte-mantle border border-mocha-mauve/30 dark:border-mocha-mauve/30 light:border-latte-mauve/30 rounded-lg hover:bg-mocha-mauve/10 dark:hover:bg-mocha-mauve/10 light:hover:bg-latte-mauve/10 transition duration-200"
                  >
                    Open
                  </button>
                  <button
                    onClick={() => handleDeleteProject(project.id)}
                    className={`px-4 py-2 text-sm font-medium rounded-lg transition duration-200 ${
                      deleteConfirm === project.id
                        ? 'bg-mocha-red dark:bg-mocha-red light:bg-latte-red text-mocha-crust dark:text-mocha-crust light:text-latte-base hover:bg-mocha-maroon dark:hover:bg-mocha-maroon light:hover:bg-latte-maroon'
                        : 'text-mocha-red dark:text-mocha-red light:text-latte-red bg-mocha-mantle dark:bg-mocha-mantle light:bg-latte-mantle border border-mocha-red/30 dark:border-mocha-red/30 light:border-latte-red/30 hover:bg-mocha-red/10 dark:hover:bg-mocha-red/10 light:hover:bg-latte-red/10'
                    }`}
                  >
                    {deleteConfirm === project.id ? 'Confirm?' : 'Delete'}
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
