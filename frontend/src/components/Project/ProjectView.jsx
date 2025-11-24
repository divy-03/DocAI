import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import useProjectStore from '../../store/projectStore';
import { generationApi } from '../../api/generation';
import Editor from '../Editor/Editor';

const ProjectView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentProject, loading, fetchProject } = useProjectStore();
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchProject(id);
  }, [id, fetchProject]);

  const handleGenerateContent = async () => {
    setGenerating(true);
    setError('');

    try {
      await generationApi.generateProject(id);
      await fetchProject(id);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to generate content');
    } finally {
      setGenerating(false);
    }
  };

  const hasContent = currentProject?.sections?.some(s => s.content);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="spinner mb-4"></div>
          <p className="text-gray-600">Loading project...</p>
        </div>
      </div>
    );
  }

  if (!currentProject) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">📭</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Project not found</h3>
          <button
            onClick={() => navigate('/dashboard')}
            className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-semibold transition duration-200"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => navigate('/dashboard')}
              className="flex items-center text-gray-600 hover:text-gray-900 transition duration-200"
            >
              <span className="mr-2">←</span>
              <span className="font-medium">Back to Dashboard</span>
            </button>
            
            {!hasContent && (
              <button
                onClick={handleGenerateContent}
                disabled={generating}
                className="flex items-center space-x-2 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-semibold transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {generating ? (
                  <>
                    <div className="spinner w-5 h-5 border-2"></div>
                    <span>Generating...</span>
                  </>
                ) : (
                  <>
                    <span>✨</span>
                    <span>Generate Content</span>
                  </>
                )}
              </button>
            )}
          </div>

          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{currentProject.title}</h1>
              <p className="mt-1 text-sm text-gray-600">{currentProject.topic}</p>
            </div>
            <span className="px-4 py-2 text-sm font-semibold text-primary-700 bg-primary-50 rounded-full">
              {currentProject.document_type.toUpperCase()}
            </span>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex justify-between items-center">
            <span>{error}</span>
            <button onClick={() => setError('')} className="text-red-900 font-bold">✕</button>
          </div>
        </div>
      )}

      {/* Editor or Empty State */}
      <div className="flex-1">
        {!hasContent && !generating ? (
          <div className="flex items-center justify-center h-full p-8">
            <div className="bg-white rounded-xl shadow-sm border-2 border-dashed border-gray-300 p-12 text-center max-w-2xl">
              <div className="text-6xl mb-6">🚀</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Ready to Generate Content</h3>
              <p className="text-gray-600 mb-8">
                Click "Generate Content" to use AI to create professional content for all {currentProject.sections.length} {currentProject.document_type === 'docx' ? 'sections' : 'slides'}
              </p>
              <button
                onClick={handleGenerateContent}
                className="inline-flex items-center space-x-2 px-8 py-4 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-semibold transition duration-200 text-lg"
              >
                <span>✨</span>
                <span>Generate Content</span>
              </button>
            </div>
          </div>
        ) : (
          <Editor 
            project={currentProject} 
            onUpdate={() => fetchProject(id)}
          />
        )}
      </div>
    </div>
  );
};

export default ProjectView;

