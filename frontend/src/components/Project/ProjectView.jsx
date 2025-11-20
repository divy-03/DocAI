import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import useProjectStore from '../../store/projectStore';
import { generationApi } from '../../api/generation';
import { refinementApi } from '../../api/refinement';

const ProjectView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentProject, loading, fetchProject } = useProjectStore();

  const [generating, setGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState({});
  const [selectedSection, setSelectedSection] = useState(null);
  const [regeneratingSection, setRegeneratingSection] = useState(null);
  const [error, setError] = useState('');

  // Refinement states
  const [refining, setRefining] = useState(false);
  const [refinementPrompt, setRefinementPrompt] = useState('');
  const [showRefinementInput, setShowRefinementInput] = useState(false);
  const [refinementHistory, setRefinementHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
 
  // Feedback states
  const [feedback, setFeedback] = useState({});
  const [comment, setComment] = useState('');
  const [showCommentInput, setShowCommentInput] = useState(false);

  useEffect(() => {
    fetchProject(id);
  }, [id, fetchProject]);

  useEffect(() => {
    if (currentProject?.sections?.length > 0 && !selectedSection) {
      setSelectedSection(currentProject.sections[0].id);
    }
  }, [currentProject, selectedSection]);

  useEffect(() => {
    if (selectedSection) {
      loadRefinements();
      loadFeedback();
    }
  }, [selectedSection]);

  const loadRefinements = async () => {
    try {
      const data = await refinementApi.getRefinements(selectedSection);
      setRefinementHistory(data);
    } catch (err) {
      console.error('Failed to load refinements:', err);
    }
  };

  const loadFeedback = async () => {
    try {
      const data = await refinementApi.getFeedback(selectedSection);
      if (data.length > 0) {
        const latestFeedback = data[0];
        setFeedback({
          [selectedSection]: {
            type: latestFeedback.feedback_type,
            comment: latestFeedback.comment
          }
        });
      }
    } catch (err) {
      console.error('Failed to load feedback:', err);
    }
  };

  const handleGenerateContent = async () => {
    setGenerating(true);
    setError('');
    setGenerationProgress({});

    try {
      currentProject.sections.forEach((section, index) => {
        setTimeout(() => {
          setGenerationProgress(prev => ({
            ...prev,
            [section.id]: 'generating'
          }));
        }, index * 500);
      });

      const updatedProject = await generationApi.generateProject(id);

      const completedProgress = {};
      updatedProject.sections.forEach(section => {
        completedProgress[section.id] = 'complete';
      });
      setGenerationProgress(completedProgress);

      await fetchProject(id);

    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to generate content');
      setGenerationProgress({});
    } finally {
      setGenerating(false);
    }
  };

  const handleRefine = async () => {
    if (!refinementPrompt.trim()) {
      setError('Please enter a refinement prompt');
      return;
    }

    setRefining(true);
    setError('');

    try {
      await refinementApi.refineSection(selectedSection, refinementPrompt);
      await fetchProject(id);
      await loadRefinements();
      setRefinementPrompt('');
      setShowRefinementInput(false);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to refine section');
    } finally {
      setRefining(false);
    }
  };

  const handleFeedback = async (type) => {
    try {
      await refinementApi.addFeedback(selectedSection, type);
      setFeedback({
        ...feedback,
        [selectedSection]: { type, comment: null }
      });
      await loadFeedback();
    } catch (err) {
      setError('Failed to save feedback');
    }
  };

  const handleAddComment = async () => {
    if (!comment.trim()) return;

    try {
      await refinementApi.addFeedback(selectedSection, null, comment);
      setFeedback({
        ...feedback,
        [selectedSection]: { 
          ...feedback[selectedSection],
          comment 
        }
      });
      setComment('');
      setShowCommentInput(false);
      await loadFeedback();
    } catch (err) {
      setError('Failed to save comment');
    }
  };

  const getSelectedSectionData = () => {
    return currentProject?.sections?.find(s => s.id === selectedSection);
  };

  const hasContent = currentProject?.sections?.some(s => s.content);
  const selectedSectionData = getSelectedSectionData();
  const sectionFeedback = feedback[selectedSection];

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
            ) : null}
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

          {/* Main Editor */}
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
              <div className="space-y-4">
                {/* Section Content Card */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                  {/* Section Header */}
                  <div className="border-b border-gray-200 p-6">
                    <div className="flex items-start justify-between mb-4">
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
                    </div>

                    {/* Feedback Buttons */}
                    {selectedSectionData.content && (
                      <div className="flex items-center space-x-3">
                        <button
                          onClick={() => handleFeedback('like')}
                          className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition duration-200 ${
                            sectionFeedback?.type === 'like'
                              ? 'bg-green-100 text-green-700 border-2 border-green-500'
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                        >
                          <span className="text-lg">👍</span>
                          <span className="text-sm font-medium">Like</span>
                        </button>

                        <button
                          onClick={() => handleFeedback('dislike')}
                          className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition duration-200 ${
                            sectionFeedback?.type === 'dislike'
                              ? 'bg-red-100 text-red-700 border-2 border-red-500'
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                        >
                          <span className="text-lg">👎</span>
                          <span className="text-sm font-medium">Dislike</span>
                        </button>

                        <button
                          onClick={() => setShowCommentInput(!showCommentInput)}
                          className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition duration-200"
                        >
                          <span className="text-lg">💬</span>
                          <span className="text-sm font-medium">Comment</span>
                        </button>

                        <button
                          onClick={() => setShowHistory(!showHistory)}
                          className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition duration-200 ml-auto"
                        >
                          <span className="text-lg">📜</span>
                          <span className="text-sm font-medium">History ({refinementHistory.length})</span>
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Comment Input */}
                  {showCommentInput && (
                    <div className="border-b border-gray-200 p-6 bg-blue-50">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Add Comment
                      </label>
                      <div className="flex space-x-3">
                        <textarea
                          value={comment}
                          onChange={(e) => setComment(e.target.value)}
                          placeholder="Share your thoughts about this section..."
                          rows={3}
                          className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        />
                        <button
                          onClick={handleAddComment}
                          disabled={!comment.trim()}
                          className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-semibold transition duration-200 disabled:opacity-50"
                        >
                          Save
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Section Content */}
                  <div className="p-6">
                    {generationProgress[selectedSectionData.id] === 'generating' ? (
                      <div className="flex flex-col items-center justify-center py-20">
                        <div className="spinner mb-4"></div>
                        <p className="text-gray-600">Generating content...</p>
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

                  {/* Refinement Section */}
                  {selectedSectionData.content && (
                    <div className="border-t border-gray-200 p-6 bg-gray-50">
                      {!showRefinementInput ? (
                        <button
                          onClick={() => setShowRefinementInput(true)}
                          className="w-full flex items-center justify-center space-x-2 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-semibold transition duration-200"
                        >
                          <span>🔄</span>
                          <span>Refine This Section</span>
                        </button>
                      ) : (
                        <div className="space-y-3">
                          <label className="block text-sm font-medium text-gray-700">
                            How would you like to improve this section?
                          </label>
                          <textarea
                            value={refinementPrompt}
                            onChange={(e) => setRefinementPrompt(e.target.value)}
                            placeholder="e.g., Make it more formal, Add more examples, Simplify the language..."
                            rows={3}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                          />
                          <div className="flex space-x-3">
                            <button
                              onClick={handleRefine}
                              disabled={refining || !refinementPrompt.trim()}
                              className="flex-1 flex items-center justify-center space-x-2 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-semibold transition duration-200 disabled:opacity-50"
                            >
                              {refining ? (
                                <>
                                  <div className="spinner w-5 h-5 border-2"></div>
                                  <span>Refining...</span>
                                </>
                              ) : (
                                <>
                                  <span>✨</span>
                                  <span>Apply Refinement</span>
                                </>
                              )}
                            </button>
                            <button
                              onClick={() => {
                                setShowRefinementInput(false);
                                setRefinementPrompt('');
                              }}
                              className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-semibold transition duration-200"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Refinement History */}
                {showHistory && refinementHistory.length > 0 && (
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Refinement History
                    </h3>
                    <div className="space-y-4">
                      {refinementHistory.map((refinement, index) => (
                        <div key={refinement.id} className="border-l-4 border-primary-500 pl-4 py-2">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-semibold text-gray-500">
                              Refinement #{refinementHistory.length - index}
                            </span>
                            <span className="text-xs text-gray-400">
                              {new Date(refinement.created_at).toLocaleString()}
                            </span>
                          </div>
                          <p className="text-sm font-medium text-gray-700 mb-2">
                            Prompt: "{refinement.prompt}"
                          </p>
                          <details className="text-sm text-gray-600">
                            <summary className="cursor-pointer text-primary-600 hover:text-primary-700">
                              View changes
                            </summary>
                            <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                              <p className="text-xs text-gray-500 mb-1">Before:</p>
                              <p className="line-clamp-3">{refinement.previous_content}</p>
                            </div>
                          </details>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectView;

