import { useState, useEffect, useRef } from 'react';
import RefinementPanel from './RefinementPanel';
import RefinementPreview from './RefinementPreview';
import { refinementApi } from '../../api/refinement';
import { sectionsApi } from '../../api/sections';

const SectionEditor = ({ section, documentType, onRefine, onFeedback, onManualUpdate }) => {

  // Editing states
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [isEditingContent, setIsEditingContent] = useState(false);
  const [editedTitle, setEditedTitle] = useState(section.title);
  const [editedContent, setEditedContent] = useState(section.content || '');
  const [isSaving, setIsSaving] = useState(false);

  // Refinement states
  const [isRefining, setIsRefining] = useState(false);
  const [refinementPrompt, setRefinementPrompt] = useState('');
  const [showRefinementPanel, setShowRefinementPanel] = useState(false);
  const [refinementPreview, setRefinementPreview] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [error, setError] = useState('');
  
  // Feedback states
  const [feedbackType, setFeedbackType] = useState(null);
  const [comment, setComment] = useState('');
  const [showCommentBox, setShowCommentBox] = useState(false);
  const [isSavingFeedback, setIsSavingFeedback] = useState(false);

  // Refinement history
  const [refinementHistory, setRefinementHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const titleInputRef = useRef(null);
  const contentTextareaRef = useRef(null);

  useEffect(() => {
    setEditedTitle(section.title);
    setEditedContent(section.content || '');
    loadFeedback();
    if (showHistory) {
      loadRefinementHistory();
    }
  }, [section.id]);

  useEffect(() => {
    if (isEditingTitle && titleInputRef.current) {
      titleInputRef.current.focus();
      titleInputRef.current.select();
    }
  }, [isEditingTitle]);

  useEffect(() => {
    if (isEditingContent && contentTextareaRef.current) {
      contentTextareaRef.current.focus();
    }
  }, [isEditingContent]);

  const loadFeedback = async () => {
    try {
      const feedbacks = await refinementApi.getFeedback(section.id);
      if (feedbacks.length > 0) {
        const latest = feedbacks[0];
        setFeedbackType(latest.feedback_type);
        setComment(latest.comment || '');
      }
    } catch (err) {
      console.error('Failed to load feedback:', err);
    }
  };

  const loadRefinementHistory = async () => {
    setLoadingHistory(true);
    try {
      const history = await refinementApi.getRefinements(section.id);
      setRefinementHistory(history);
    } catch (err) {
      console.error('Failed to load refinement history:', err);
    } finally {
      setLoadingHistory(false);
    }
  };

const handleSaveTitle = async () => {
  if (editedTitle.trim() === section.title) {
    setIsEditingTitle(false);
    return;
  }

  setIsSaving(true);
  try {
    await sectionsApi.updateSection(section.id, { title: editedTitle });
    setIsEditingTitle(false);
    // Call the manual update handler instead of onRefine
    if (onManualUpdate) {
      await onManualUpdate();
    }
  } catch (err) {
    setError('Failed to save title');
    setEditedTitle(section.title);
  } finally {
    setIsSaving(false);
  }
};

const handleSaveContent = async () => {
  if (editedContent === section.content) {
    setIsEditingContent(false);
    return;
  }

  setIsSaving(true);
  try {
    await sectionsApi.updateSection(section.id, { content: editedContent });
    setIsEditingContent(false);
    // Call the manual update handler instead of onRefine
    if (onManualUpdate) {
      await onManualUpdate();
    }
  } catch (err) {
    setError('Failed to save content');
    setEditedContent(section.content);
  } finally {
    setIsSaving(false);
  }
};


  const handleCancelEdit = (type) => {
    if (type === 'title') {
      setEditedTitle(section.title);
      setIsEditingTitle(false);
    } else {
      setEditedContent(section.content);
      setIsEditingContent(false);
    }
  };

  const handleRefinePreview = async () => {
    if (!refinementPrompt.trim()) {
      setError('Please enter a refinement prompt');
      return;
    }

    setIsRefining(true);
    setError('');

    try {
      const preview = await refinementApi.previewRefinement(section.id, refinementPrompt);
      setRefinementPreview(preview);
      setShowPreview(true);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to generate refinement preview');
    } finally {
      setIsRefining(false);
    }
  };

  
const handleAcceptRefinement = async () => {
  setIsSaving(true);
  try {
    await refinementApi.acceptRefinement(
      section.id,
      refinementPrompt,
      refinementPreview.refined_content
    );
    
    setEditedContent(refinementPreview.refined_content);
    setRefinementPrompt('');
    setShowRefinementPanel(false);
    setShowPreview(false);
    setRefinementPreview(null);
    
    // Call the manual update handler
    if (onManualUpdate) {
      await onManualUpdate();
    }
    
    if (showHistory) {
      await loadRefinementHistory();
    }
  } catch (err) {
    setError('Failed to accept refinement');
  } finally {
    setIsSaving(false);
  }
};

  const handleRejectRefinement = () => {
    setShowPreview(false);
    setRefinementPreview(null);
  };

  
const handleRestoreVersion = async (refinement) => {
  if (window.confirm('Restore this version? Current content will be replaced.')) {
    setIsSaving(true);
    try {
      await sectionsApi.updateSection(section.id, { 
        content: refinement.previous_content 
      });
      setEditedContent(refinement.previous_content);
      // Call the manual update handler
      if (onManualUpdate) {
        await onManualUpdate();
      }
    } catch (err) {
      setError('Failed to restore version');
    } finally {
      setIsSaving(false);
    }
  }
};

  const handleFeedbackClick = async (type) => {
    setIsSavingFeedback(true);
    try {
      await onFeedback(section.id, type);
      setFeedbackType(type);
    } catch (err) {
      setError('Failed to save feedback');
    } finally {
      setIsSavingFeedback(false);
    }
  };

  const handleCommentSave = async () => {
    if (!comment.trim()) return;

    setIsSavingFeedback(true);
    try {
      await onFeedback(section.id, feedbackType, comment);
      setShowCommentBox(false);
    } catch (err) {
      setError('Failed to save comment');
    } finally {
      setIsSavingFeedback(false);
    }
  };

  const handleHistoryToggle = () => {
    const newShowHistory = !showHistory;
    setShowHistory(newShowHistory);
    if (newShowHistory) {
      loadRefinementHistory();
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-8">
      {/* Error Message */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex justify-between items-center">
          <span>{error}</span>
          <button onClick={() => setError('')} className="text-red-900 font-bold">
            ✕
          </button>
        </div>
      )}

      {/* Refinement Preview Modal */}
      {showPreview && refinementPreview && (
        <RefinementPreview
          preview={refinementPreview}
          onAccept={handleAcceptRefinement}
          onReject={handleRejectRefinement}
          isSaving={isSaving}
        />
      )}

      {/* Main Content Card */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="border-b border-gray-200 p-6 bg-gradient-to-r from-primary-50 to-blue-50">
          <div className="flex items-center justify-between mb-3">
            <span className="px-3 py-1 text-xs font-semibold text-primary-700 bg-white rounded-full shadow-sm">
              {documentType === 'docx' ? 'Section' : 'Slide'} {section.order + 1}
            </span>
            {section.content && (
              <span className="flex items-center space-x-1 text-sm text-green-600 font-medium">
                <span>✓</span>
                <span>Generated</span>
              </span>
            )}
          </div>

          {/* Editable Title */}
          {isEditingTitle ? (
            <div className="space-y-2">
              <input
                ref={titleInputRef}
                type="text"
                value={editedTitle}
                onChange={(e) => setEditedTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSaveTitle();
                  if (e.key === 'Escape') handleCancelEdit('title');
                }}
                className="w-full text-3xl font-bold text-gray-900 bg-white border-2 border-primary-500 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-600"
              />
              <div className="flex space-x-2">
                <button
                  onClick={handleSaveTitle}
                  disabled={isSaving}
                  className="px-4 py-1.5 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                >
                  {isSaving ? 'Saving...' : 'Save'}
                </button>
                <button
                  onClick={() => handleCancelEdit('title')}
                  className="px-4 py-1.5 text-sm bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="group relative">
              <h1 className="text-3xl font-bold text-gray-900">{section.title}</h1>
              <button
                onClick={() => setIsEditingTitle(true)}
                className="absolute -right-2 top-0 opacity-0 group-hover:opacity-100 p-2 text-primary-600 hover:text-primary-700 transition-all"
                title="Edit title"
              >
                <span className="text-xl">✏️</span>
              </button>
            </div>
          )}
        </div>

        {/* Feedback Bar */}
        {section.content && (
          <div className="border-b border-gray-200 p-4 bg-gray-50">
            <div className="flex items-center space-x-3">
              <span className="text-sm font-medium text-gray-700">Quick Feedback:</span>
              
              <button
                onClick={() => handleFeedbackClick('like')}
                disabled={isSavingFeedback}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                  feedbackType === 'like'
                    ? 'bg-green-100 text-green-700 border-2 border-green-500 shadow-sm'
                    : 'bg-white text-gray-600 hover:bg-green-50 border border-gray-300'
                }`}
              >
                <span className="text-lg">👍</span>
                <span className="text-sm font-medium">Like</span>
              </button>

              <button
                onClick={() => handleFeedbackClick('dislike')}
                disabled={isSavingFeedback}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                  feedbackType === 'dislike'
                    ? 'bg-red-100 text-red-700 border-2 border-red-500 shadow-sm'
                    : 'bg-white text-gray-600 hover:bg-red-50 border border-gray-300'
                }`}
              >
                <span className="text-lg">👎</span>
                <span className="text-sm font-medium">Dislike</span>
              </button>

              <button
                onClick={() => setShowCommentBox(!showCommentBox)}
                className="flex items-center space-x-2 px-4 py-2 bg-white text-gray-600 rounded-lg hover:bg-blue-50 transition-all duration-200 border border-gray-300"
              >
                <span className="text-lg">💬</span>
                <span className="text-sm font-medium">Comment</span>
              </button>

              <button
                onClick={handleHistoryToggle}
                className="flex items-center space-x-2 px-4 py-2 bg-white text-gray-600 rounded-lg hover:bg-purple-50 transition-all duration-200 border border-gray-300 ml-auto"
              >
                <span className="text-lg">📜</span>
                <span className="text-sm font-medium">
                  History {refinementHistory.length > 0 && `(${refinementHistory.length})`}
                </span>
              </button>
            </div>

            {/* Comment Input */}
            {showCommentBox && (
              <div className="mt-4 p-4 bg-white rounded-lg border border-blue-200">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Add your comment
                </label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Share your thoughts about this section..."
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                />
                <div className="flex justify-end space-x-2 mt-3">
                  <button
                    onClick={() => setShowCommentBox(false)}
                    className="px-4 py-2 text-sm text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCommentSave}
                    disabled={!comment.trim() || isSavingFeedback}
                    className="px-6 py-2 text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSavingFeedback ? 'Saving...' : 'Save Comment'}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Content Display/Edit */}
        <div className="p-8">
          {section.content ? (
            isEditingContent ? (
              <div className="space-y-3">
                <textarea
                  ref={contentTextareaRef}
                  value={editedContent}
                  onChange={(e) => setEditedContent(e.target.value)}
                  rows={15}
                  className="w-full px-4 py-3 border-2 border-primary-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-600 font-mono text-sm"
                />
                <div className="flex space-x-2">
                  <button
                    onClick={handleSaveContent}
                    disabled={isSaving}
                    className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 font-medium"
                  >
                    {isSaving ? 'Saving...' : 'Save Changes'}
                  </button>
                  <button
                    onClick={() => handleCancelEdit('content')}
                    className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors font-medium"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="group relative">
                <div className="prose prose-lg max-w-none">
                  <div className="text-gray-800 leading-relaxed whitespace-pre-wrap">
                    {section.content}
                  </div>
                </div>
                <button
                  onClick={() => setIsEditingContent(true)}
                  className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-all shadow-md"
                  title="Edit content"
                >
                  <span className="flex items-center space-x-2">
                    <span className="text-lg">✏️</span>
                    <span className="text-sm font-medium">Edit Content</span>
                  </span>
                </button>
              </div>
            )
          ) : (
            <div className="text-center py-16 text-gray-400">
              <div className="text-6xl mb-4">📝</div>
              <p className="text-lg">No content generated yet</p>
              <p className="text-sm mt-2">Generate content for this section first</p>
            </div>
          )}
        </div>

        {/* Refinement Panel */}
        {section.content && !isEditingContent && (
          <RefinementPanel
            isOpen={showRefinementPanel}
            onToggle={() => setShowRefinementPanel(!showRefinementPanel)}
            refinementPrompt={refinementPrompt}
            onPromptChange={setRefinementPrompt}
            onRefine={handleRefinePreview}
            isRefining={isRefining}
          />
        )}
      </div>

      {/* Refinement History */}
      {showHistory && (
        <div className="mt-6 bg-white rounded-xl shadow-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <span className="text-2xl mr-2">📜</span>
            Refinement History
          </h3>
          
          {loadingHistory ? (
            <div className="flex justify-center py-8">
              <div className="spinner"></div>
            </div>
          ) : refinementHistory.length > 0 ? (
            <div className="space-y-4">
              {refinementHistory.map((refinement, index) => (
                <div
                  key={refinement.id}
                  className="border-l-4 border-primary-500 pl-4 py-3 bg-gray-50 rounded-r-lg"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-primary-700">
                      Refinement #{refinementHistory.length - index}
                    </span>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-gray-500">
                        {new Date(refinement.created_at).toLocaleString()}
                      </span>
                      <button
                        onClick={() => handleRestoreVersion(refinement)}
                        className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                        title="Restore this version"
                      >
                        Restore
                      </button>
                    </div>
                  </div>
                  <div className="mb-3">
                    <span className="text-xs font-medium text-gray-500">Prompt:</span>
                    <p className="text-sm text-gray-700 mt-1 font-medium">
                      "{refinement.prompt}"
                    </p>
                  </div>
                  <details className="text-sm">
                    <summary className="cursor-pointer text-primary-600 hover:text-primary-700 font-medium">
                      View previous content
                    </summary>
                    <div className="mt-3 p-4 bg-white rounded-lg border border-gray-200">
                      <p className="text-xs font-medium text-gray-500 mb-2">Previous Version:</p>
                      <p className="text-gray-700 whitespace-pre-wrap">
                        {refinement.previous_content}
                      </p>
                    </div>
                  </details>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-400">
              <p>No refinements yet</p>
              <p className="text-sm mt-1">Refine this section to see the history</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SectionEditor;

