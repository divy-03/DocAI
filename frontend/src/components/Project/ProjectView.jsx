import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import useProjectStore from '../../store/projectStore';

const ProjectView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentProject, loading, fetchProject } = useProjectStore();

  useEffect(() => {
    fetchProject(id);
  }, [id, fetchProject]);

  if (loading) {
    return (
      <div className="loading-state">
        <div className="spinner"></div>
        <p>Loading project...</p>
      </div>
    );
  }

  if (!currentProject) {
    return (
      <div className="empty-state">
        <h3>Project not found</h3>
        <button className="btn-primary" onClick={() => navigate('/dashboard')}>
          Back to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="project-view-container">
      <div className="project-view-header">
        <button className="btn-back" onClick={() => navigate('/dashboard')}>
          ← Back to Dashboard
        </button>
        <div className="project-view-title">
          <h1>{currentProject.title}</h1>
          <p>{currentProject.topic}</p>
        </div>
      </div>

      <div className="project-view-content">
        <div className="sections-sidebar">
          <h3>
            {currentProject.document_type === 'docx' ? 'Sections' : 'Slides'}
          </h3>
          <ul>
            {currentProject.sections.map((section, index) => (
              <li key={section.id}>
                <span className="section-number">{index + 1}</span>
                <span>{section.title}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="main-content">
          <div className="content-placeholder">
            <h3>Ready for AI Generation</h3>
            <p>This project is ready for content generation on Day 3</p>
            <button className="btn-primary" disabled>
              Generate Content (Coming Soon)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectView;
