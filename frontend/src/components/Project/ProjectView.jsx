import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import useProjectStore from '../../store/projectStore';
import { generationApi } from '../../api/generation';

const ProjectView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentProject, loading, fetchProject } = useProjectStore();
  const [generating, setGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState({});
  const [selectedSection, setSelectedSection] = useState(null);
  const [regeneratingSection, setRegeneratingSection] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchProject(id);
  }, [id, fetchProject]);

  useEffect(() => {
    if (currentProject?.sections?.length > 0 && !selectedSection) {
      setSelectedSection(currentProject.sections[0].id);
    }
  }, [currentProject, selectedSection]);

  const handleGenerateContent = async () => {
    setGenerating(true);
    setError('');
    setGenerationProgress({});

    try {
      // Simulate progress for each section
      currentProject.sections.forEach((section, index) => {
        setTimeout(() => {
          setGenerationProgress(prev => ({
            ...prev,
            [section.id]: 'generating'
          }));
        }, index * 500);
      });

      // Call API to generate content
      const updatedProject = await generationApi.generateProject(id);
      
      // Mark all as complete
      const completedProgress = {};
      updatedProject.sections.forEach(section => {
        completedProgress[section.id] = 'complete';
      });
      setGenerationProgress(completedProgress);

      // Refresh project data
      await fetchProject(id);
      
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to generate content');
      setGenerationProgress({});
    } finally {
      setGenerating(false);
    }
  };

  const handleRegenerateSection = async (sectionId) => {
    setRegeneratingSection(sectionId);
    setError('');

    try {
      await generationApi.regenerateSection(id, sectionId);
      await fetchProject(id);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to regenerate section');
    } finally {
      setRegeneratingSection(null);
    }
  };

  const getSelectedSectionData = () => {
    return currentProject?.sections?.find(s => s.id === selectedSection);
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

  const selectedSectionData = getSelectedSectionData();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => navigate('/dashboard')}
              className="flex items-center text-gray-600 hover:text-gray-900 transition duration-200"
            >
              <span className="mr-2">←</span>
              <span className="font-medium">Back to Dashboard</span>
            </button>
            
            {!hasContent ? (
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
            ) : (
              <button
                onClick={() => navigate('/dashboard')}
                className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold transition duration-200"
              >
                ✓ Content Generated
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
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        </div>
      )}

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sticky top-24">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                {currentProject.document_type === 'docx' ? 'Sections' : 'Slides'} ({currentProject.sections.length})
              </h3>
              <ul className="space-y-1">
                {currentProject.sections.map((section, index) => (
                  <li key={section.id}>
                    <button
                      onClick={() => setSelectedSection(section.id)}
                      className={`w-full flex items-start space-x-3 p-3 rounded-lg transition duration-200 ${
                        selectedSection === section.id
                          ? 'bg-primary-50 border-2 border-primary-500'
                          : 'hover:bg-gray-50 border-2 border-transparent'
                      }`}
                    >
                      <span className={`flex-shrink-0 w-6 h-6 rounded-md flex items-center justify-center text-xs font-semibold ${
                        generationProgress[section.id] === 'generating'
                          ? 'bg-yellow-100 text-yellow-700'
                          : generationProgress[section.id] === 'complete' || section.content
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        {generationProgress[section.id] === 'generating' ? (
                          <div className="spinner w-3 h-3 border-2 border-yellow-700"></div>
                        ) : generationProgress[section.id] === 'complete' || section.content ? (
                          '✓'
                        ) : (
                          index + 1
                        )}
                      </span>
                      <span className="text-sm text-left text-gray-700 flex-1 line-clamp-2">
                        {section.title}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {!hasContent && !generating ? (
              <div className="bg-white rounded-xl shadow-sm border-2 border-dashed border-gray-300 p-12 text-center">
                <div className="text-6xl mb-6">🚀</div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">Ready to Generate Content</h3>
                <p className="text-gray-600 mb-8 max-w-md mx-auto">
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
            ) : selectedSectionData ? (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                {/* Section Header */}
                <div className="border-b border-gray-200 p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <span className="px-3 py-1 text-xs font-semibold text-gray-600 bg-gray-100 rounded-full">
                          {currentProject.document_type === 'docx' ? 'Section' : 'Slide'} {selectedSectionData.order + 1}
                        </span>
                        {selectedSectionData.content && (
                          <span className="flex items-center space-x-1 text-xs text-green-600">
                            <span>✓</span>
                            <span>Generated</span>
                          </span>
                        )}
                      </div>
                      <h2 className="text-2xl font-bold text-gray-900">
                        {selectedSectionData.title}
                      </h2>
                    </div>
                    {selectedSectionData.content && (
                      <button
                        onClick={() => handleRegenerateSection(selectedSectionData.id)}
                        disabled={regeneratingSection === selectedSectionData.id}
                        className="flex items-center space-x-2 px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition duration-200 disabled:opacity-50"
                      >
                        {regeneratingSection === selectedSectionData.id ? (
                          <>
                            <div className="spinner w-4 h-4 border-2"></div>
                            <span>Regenerating...</span>
                          </>
                        ) : (
                          <>
                            <span>🔄</span>
                            <span>Regenerate</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>

                {/* Section Content */}
                <div className="p-6">
                  {generationProgress[selectedSectionData.id] === 'generating' ? (
                    <div className="flex flex-col items-center justify-center py-20">
                      <div className="spinner mb-4"></div>
                      <p className="text-gray-600">Generating content for this {currentProject.document_type === 'docx' ? 'section' : 'slide'}...</p>
                    </div>
                  ) : selectedSectionData.content ? (
                    <div className="prose max-w-none">
                      <div className="text-gray-800 whitespace-pre-wrap leading-relaxed">
                        {selectedSectionData.content}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-20 text-gray-400">
                      <p>No content generated yet</p>
                    </div>
                  )}
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectView;

