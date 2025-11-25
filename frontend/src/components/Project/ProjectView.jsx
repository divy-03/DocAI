import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import useProjectStore from '../../store/projectStore';
import { generationApi } from '../../api/generation';
import { exportApi } from '../../api/export';
import toast from 'react-hot-toast';
import Editor from '../Editor/Editor';

const ProjectView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentProject, loading, fetchProject } = useProjectStore();
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');
  // Export state
  const [exporting, setExporting] = useState(false);

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

  const handleExport = async () => {
    setExporting(true);
    const toastId = toast.loading('Preparing document for download...');

    try {
      await exportApi.downloadDocument(id);
      toast.dismiss(toastId);
      toast.success('Document downloaded successfully! 📥');
    } catch (err) {
      const errorMsg = err.response?.data?.detail || 'Failed to export document';
      toast.dismiss(toastId);
      toast.error(errorMsg);
    } finally {
      setExporting(false);
    }
  };

  const hasContent = currentProject?.sections?.some(s => s.content);

  if (loading) {
    return (
      <div className="min-h-screen bg-mocha-base dark:bg-mocha-base light:bg-latte-base flex items-center justify-center">
        <div className="text-center">
          <div className="spinner mb-4"></div>
          <p className="text-mocha-subtext0 dark:text-mocha-subtext0 light:text-latte-subtext0">
            Loading project...
          </p>
        </div>
      </div>
    );
  }

  if (!currentProject) {
    return (
      <div className="min-h-screen bg-mocha-base dark:bg-mocha-base light:bg-latte-base flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">📭</div>
          <h3 className="text-xl font-semibold text-mocha-text dark:text-mocha-text light:text-latte-text mb-4">
            Project not found
          </h3>
          <button
            onClick={() => navigate('/dashboard')}
            className="px-6 py-3 bg-mocha-mauve dark:bg-mocha-mauve light:bg-latte-mauve text-mocha-crust dark:text-mocha-crust light:text-latte-base rounded-lg hover:bg-mocha-lavender dark:hover:bg-mocha-lavender light:hover:bg-latte-lavender font-semibold transition duration-200"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-mocha-base dark:bg-mocha-base light:bg-latte-base flex flex-col">
      {/* Header */}
      <div className="bg-mocha-mantle dark:bg-mocha-mantle light:bg-latte-mantle border-b border-mocha-surface0 dark:border-mocha-surface0 light:border-latte-surface0 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => navigate('/dashboard')}
              className="flex items-center text-mocha-subtext0 dark:text-mocha-subtext0 light:text-latte-subtext0 hover:text-mocha-text dark:hover:text-mocha-text light:hover:text-latte-text transition duration-200"
            >
              <span className="mr-2">←</span>
              <span className="font-medium">Back to Dashboard</span>
            </button>
            
            {!hasContent ? (
              <button
                onClick={handleGenerateContent}
                disabled={generating}
                className="flex items-center space-x-2 px-6 py-3 bg-mocha-mauve dark:bg-mocha-mauve light:bg-latte-mauve text-mocha-crust dark:text-mocha-crust light:text-latte-base rounded-lg hover:bg-mocha-lavender dark:hover:bg-mocha-lavender light:hover:bg-latte-lavender font-semibold transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
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
            ) : (
              <div className="flex items-center space-x-3">
                <button
                  onClick={handleExport}
                  disabled={exporting}
                  className="flex items-center space-x-2 px-6 py-3 bg-mocha-green dark:bg-mocha-green light:bg-latte-green text-mocha-crust dark:text-mocha-crust light:text-latte-base rounded-lg hover:bg-mocha-teal dark:hover:bg-mocha-teal light:hover:bg-latte-teal font-semibold transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
                >
                  {exporting ? (
                    <>
                      <div className="spinner w-5 h-5 border-2 border-mocha-crust dark:border-mocha-crust light:border-latte-base"></div>
                      <span>Exporting...</span>
                    </>
                  ) : (
                    <>
                      <span>📥</span>
                      <span>Download {currentProject.document_type.toUpperCase()}</span>
                    </>
                  )}
                </button>
                <div className="flex items-center space-x-2 px-4 py-2 bg-mocha-green/10 dark:bg-mocha-green/10 light:bg-latte-green/10 text-mocha-green dark:text-mocha-green light:text-latte-green rounded-lg border border-mocha-green/30 dark:border-mocha-green/30 light:border-latte-green/30">
                  <span>✓</span>
                  <span className="font-medium text-sm">Ready to Export</span>
                </div>
              </div>
            )}
          </div>

          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold text-mocha-text dark:text-mocha-text light:text-latte-text">
                {currentProject.title}
              </h1>
              <p className="mt-1 text-sm text-mocha-subtext0 dark:text-mocha-subtext0 light:text-latte-subtext0">
                {currentProject.topic}
              </p>
            </div>
            <span className="px-4 py-2 text-sm font-semibold text-mocha-mauve dark:text-mocha-mauve light:text-latte-mauve bg-mocha-mauve/10 dark:bg-mocha-mauve/10 light:bg-latte-mauve/10 rounded-full">
              {currentProject.document_type.toUpperCase()}
            </span>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">
          <div className="bg-mocha-red/10 border border-mocha-red/30 text-mocha-red dark:bg-mocha-red/10 dark:border-mocha-red/30 dark:text-mocha-red light:bg-latte-red/10 light:border-latte-red/30 light:text-latte-red px-4 py-3 rounded-lg flex justify-between items-center">
            <span>{error}</span>
            <button 
              onClick={() => setError('')} 
              className="text-mocha-text dark:text-mocha-text light:text-latte-text font-bold"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Editor or Empty State */}
      <div className="flex-1">
        {!hasContent && !generating ? (
          <div className="flex items-center justify-center h-full p-8">
            <div className="bg-mocha-mantle dark:bg-mocha-mantle light:bg-latte-mantle rounded-xl shadow-sm border-2 border-dashed border-mocha-surface1 dark:border-mocha-surface1 light:border-latte-surface1 p-12 text-center max-w-2xl">
              <div className="text-6xl mb-6">🚀</div>
              <h3 className="text-2xl font-bold text-mocha-text dark:text-mocha-text light:text-latte-text mb-3">
                Ready to Generate Content
              </h3>
              <p className="text-mocha-subtext0 dark:text-mocha-subtext0 light:text-latte-subtext0 mb-8">
                Click "Generate Content" to use AI to create professional content for all {currentProject.sections.length} {currentProject.document_type === 'docx' ? 'sections' : 'slides'}
              </p>
              <button
                onClick={handleGenerateContent}
                className="inline-flex items-center space-x-2 px-8 py-4 bg-mocha-mauve dark:bg-mocha-mauve light:bg-latte-mauve text-mocha-crust dark:text-mocha-crust light:text-latte-base rounded-lg hover:bg-mocha-lavender dark:hover:bg-mocha-lavender light:hover:bg-latte-lavender font-semibold transition duration-200 text-lg"
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
