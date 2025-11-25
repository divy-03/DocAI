import { useState, useEffect, useRef } from 'react';
import { refinementApi } from '../../api/refinement';
import { sectionsApi } from '../../api/sections';

const SectionEditor = ({ section, documentType, onRefine, onFeedback, onManualUpdate, onOpenRefinement, onOpenHistory }) => {
  // Editing states
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [isEditingContent, setIsEditingContent] = useState(false);
  const [editedTitle, setEditedTitle] = useState(section.title);
  const [editedContent, setEditedContent] = useState(section.content || '');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  
  // Feedback states
  const [feedbackType, setFeedbackType] = useState(null);
  const [comment, setComment] = useState('');
  const [showCommentBox, setShowCommentBox] = useState(false);
  const [isSavingFeedback, setIsSavingFeedback] = useState(false);

  const titleInputRef = useRef(null);
  const contentTextareaRef = useRef(null);

  // Reset states when section changes
  useEffect(() => {
    setEditedTitle(section.title);
    setEditedContent(section.content || '');
    
    setFeedbackType(null);
    setComment('');
    setShowCommentBox(false);
    
    loadFeedback();
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
      } else {
        setFeedbackType(null);
        setComment('');
      }
    } catch (err) {
      console.error('Failed to load feedback:', err);
      setFeedbackType(null);
      setComment('');
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
      
      if (onManualUpdate) {
        onManualUpdate(section.id, { title: editedTitle });
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
      
      if (onManualUpdate) {
        onManualUpdate(section.id, { content: editedContent });
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

  return (
    <div className="max-w-5xl mx-auto p-8">
      {/* Error Message */}
      {error && (
        <div className="mb-6 bg-mocha-red/10 border border-mocha-red/30 text-mocha-red dark:bg-mocha-red/10 dark:border-mocha-red/30 dark:text-mocha-red light:bg-latte-red/10 light:border-latte-red/30 light:text-latte-red px-4 py-3 rounded-lg flex justify-between items-center">
          <span>{error}</span>
          <button onClick={() => setError('')} className="font-bold">✕</button>
        </div>
      )}

      {/* Main Content Card */}
      <div className="bg-mocha-mantle dark:bg-mocha-mantle light:bg-latte-mantle rounded-xl shadow-lg border border-mocha-surface0 dark:border-mocha-surface0 light:border-latte-surface0 overflow-hidden">
        {/* Header */}
        <div className="border-b border-mocha-surface0 dark:border-mocha-surface0 light:border-latte-surface0 p-6 bg-gradient-to-r from-mocha-mauve/10 to-mocha-blue/10 dark:from-mocha-mauve/10 dark:to-mocha-blue/10 light:from-latte-mauve/10 light:to-latte-blue/10">
          <div className="flex items-center justify-between mb-3">
            <span className="px-3 py-1 text-xs font-semibold text-mocha-mauve dark:text-mocha-mauve light:text-latte-mauve bg-mocha-mantle dark:bg-mocha-mantle light:bg-latte-mantle rounded-full shadow-sm border border-mocha-mauve/30 dark:border-mocha-mauve/30 light:border-latte-mauve/30">
              {documentType === 'docx' ? 'Section' : 'Slide'} {section.order + 1}
            </span>
            {section.content && (
              <span className="flex items-center space-x-1 text-sm text-mocha-green dark:text-mocha-green light:text-latte-green font-medium">
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
                className="w-full text-3xl font-bold text-mocha-text dark:text-mocha-text light:text-latte-text bg-mocha-surface0 dark:bg-mocha-surface0 light:bg-latte-surface0 border-2 border-mocha-mauve dark:border-mocha-mauve light:border-latte-mauve rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-mocha-lavender dark:focus:ring-mocha-lavender light:focus:ring-latte-lavender"
              />
              <div className="flex space-x-2">
                <button
                  onClick={handleSaveTitle}
                  disabled={isSaving}
                  className="px-4 py-1.5 text-sm bg-mocha-green dark:bg-mocha-green light:bg-latte-green text-mocha-crust dark:text-mocha-crust light:text-latte-base rounded-lg hover:bg-mocha-teal dark:hover:bg-mocha-teal light:hover:bg-latte-teal transition-colors disabled:opacity-50"
                >
                  {isSaving ? 'Saving...' : 'Save'}
                </button>
                <button
                  onClick={() => handleCancelEdit('title')}
                  className="px-4 py-1.5 text-sm bg-mocha-surface0 dark:bg-mocha-surface0 light:bg-latte-surface0 text-mocha-text dark:text-mocha-text light:text-latte-text rounded-lg hover:bg-mocha-surface1 dark:hover:bg-mocha-surface1 light:hover:bg-latte-surface1 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="group relative">
              <h1 className="text-3xl font-bold text-mocha-text dark:text-mocha-text light:text-latte-text">
                {section.title}
              </h1>
              <button
                onClick={() => setIsEditingTitle(true)}
                className="absolute -right-2 top-0 opacity-0 group-hover:opacity-100 p-2 text-mocha-mauve dark:text-mocha-mauve light:text-latte-mauve hover:text-mocha-lavender dark:hover:text-mocha-lavender light:hover:text-latte-lavender transition-all"
                title="Edit title"
              >
                <span className="text-xl">✏️</span>
              </button>
            </div>
          )}
        </div>

        {/* Feedback Bar */}
        {section.content && (
          <div className="border-b border-mocha-surface0 dark:border-mocha-surface0 light:border-latte-surface0 p-4 bg-mocha-surface0/50 dark:bg-mocha-surface0/50 light:bg-latte-surface0/50">
            <div className="flex items-center space-x-3">
              <span className="text-sm font-medium text-mocha-text dark:text-mocha-text light:text-latte-text">
                Quick Feedback:
              </span>
              
              <button
                onClick={() => handleFeedbackClick('like')}
                disabled={isSavingFeedback}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                  feedbackType === 'like'
                    ? 'bg-mocha-green/20 dark:bg-mocha-green/20 light:bg-latte-green/20 text-mocha-green dark:text-mocha-green light:text-latte-green border-2 border-mocha-green dark:border-mocha-green light:border-latte-green shadow-sm'
                    : 'bg-mocha-mantle dark:bg-mocha-mantle light:bg-latte-mantle text-mocha-subtext0 dark:text-mocha-subtext0 light:text-latte-subtext0 hover:bg-mocha-green/10 dark:hover:bg-mocha-green/10 light:hover:bg-latte-green/10 border border-mocha-surface2 dark:border-mocha-surface2 light:border-latte-surface2'
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
                    ? 'bg-mocha-red/20 dark:bg-mocha-red/20 light:bg-latte-red/20 text-mocha-red dark:text-mocha-red light:text-latte-red border-2 border-mocha-red dark:border-mocha-red light:border-latte-red shadow-sm'
                    : 'bg-mocha-mantle dark:bg-mocha-mantle light:bg-latte-mantle text-mocha-subtext0 dark:text-mocha-subtext0 light:text-latte-subtext0 hover:bg-mocha-red/10 dark:hover:bg-mocha-red/10 light:hover:bg-latte-red/10 border border-mocha-surface2 dark:border-mocha-surface2 light:border-latte-surface2'
                }`}
              >
                <span className="text-lg">👎</span>
                <span className="text-sm font-medium">Dislike</span>
              </button>

              <button
                onClick={() => setShowCommentBox(!showCommentBox)}
                className="flex items-center space-x-2 px-4 py-2 bg-mocha-mantle dark:bg-mocha-mantle light:bg-latte-mantle text-mocha-subtext0 dark:text-mocha-subtext0 light:text-latte-subtext0 rounded-lg hover:bg-mocha-blue/10 dark:hover:bg-mocha-blue/10 light:hover:bg-latte-blue/10 transition-all duration-200 border border-mocha-surface2 dark:border-mocha-surface2 light:border-latte-surface2"
              >
                <span className="text-lg">💬</span>
                <span className="text-sm font-medium">Comment</span>
              </button>

              <button
                onClick={onOpenHistory}
                className="flex items-center space-x-2 px-4 py-2 bg-mocha-mantle dark:bg-mocha-mantle light:bg-latte-mantle text-mocha-subtext0 dark:text-mocha-subtext0 light:text-latte-subtext0 rounded-lg hover:bg-mocha-mauve/10 dark:hover:bg-mocha-mauve/10 light:hover:bg-latte-mauve/10 transition-all duration-200 border border-mocha-surface2 dark:border-mocha-surface2 light:border-latte-surface2 ml-auto"
              >
                <span className="text-lg">📜</span>
                <span className="text-sm font-medium">History</span>
              </button>

              <button
                onClick={onOpenRefinement}
                className="flex items-center space-x-2 px-4 py-2 bg-mocha-mauve dark:bg-mocha-mauve light:bg-latte-mauve text-mocha-crust dark:text-mocha-crust light:text-latte-base rounded-lg hover:bg-mocha-lavender dark:hover:bg-mocha-lavender light:hover:bg-latte-lavender transition-all duration-200 shadow-sm"
              >
                <span className="text-lg">✨</span>
                <span className="text-sm font-medium">Refine</span>
              </button>
            </div>

            {/* Comment Input */}
            {showCommentBox && (
              <div className="mt-4 p-4 bg-mocha-mantle dark:bg-mocha-mantle light:bg-latte-mantle rounded-lg border border-mocha-blue/30 dark:border-mocha-blue/30 light:border-latte-blue/30">
                <label className="block text-sm font-medium text-mocha-text dark:text-mocha-text light:text-latte-text mb-2">
                  Add your comment
                </label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Share your thoughts about this section..."
                  rows={3}
                  className="w-full px-4 py-3 bg-mocha-surface0 dark:bg-mocha-surface0 light:bg-latte-surface0 text-mocha-text dark:text-mocha-text light:text-latte-text border border-mocha-surface2 dark:border-mocha-surface2 light:border-latte-surface2 rounded-lg focus:ring-2 focus:ring-mocha-mauve dark:focus:ring-mocha-mauve light:focus:ring-latte-mauve focus:border-transparent resize-none placeholder:text-mocha-overlay0 dark:placeholder:text-mocha-overlay0 light:placeholder:text-latte-overlay0"
                />
                <div className="flex justify-end space-x-2 mt-3">
                  <button
                    onClick={() => setShowCommentBox(false)}
                    className="px-4 py-2 text-sm text-mocha-text dark:text-mocha-text light:text-latte-text bg-mocha-surface0 dark:bg-mocha-surface0 light:bg-latte-surface0 rounded-lg hover:bg-mocha-surface1 dark:hover:bg-mocha-surface1 light:hover:bg-latte-surface1 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCommentSave}
                    disabled={!comment.trim() || isSavingFeedback}
                    className="px-6 py-2 text-sm bg-mocha-mauve dark:bg-mocha-mauve light:bg-latte-mauve text-mocha-crust dark:text-mocha-crust light:text-latte-base rounded-lg hover:bg-mocha-lavender dark:hover:bg-mocha-lavender light:hover:bg-latte-lavender transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
                  className="w-full px-4 py-3 bg-mocha-surface0 dark:bg-mocha-surface0 light:bg-latte-surface0 text-mocha-text dark:text-mocha-text light:text-latte-text border-2 border-mocha-mauve dark:border-mocha-mauve light:border-latte-mauve rounded-lg focus:outline-none focus:ring-2 focus:ring-mocha-lavender dark:focus:ring-mocha-lavender light:focus:ring-latte-lavender font-mono text-sm"
                />
                <div className="flex space-x-2">
                  <button
                    onClick={handleSaveContent}
                    disabled={isSaving}
                    className="px-6 py-2 bg-mocha-green dark:bg-mocha-green light:bg-latte-green text-mocha-crust dark:text-mocha-crust light:text-latte-base rounded-lg hover:bg-mocha-teal dark:hover:bg-mocha-teal light:hover:bg-latte-teal transition-colors disabled:opacity-50 font-medium"
                  >
                    {isSaving ? 'Saving...' : 'Save Changes'}
                  </button>
                  <button
                    onClick={() => handleCancelEdit('content')}
                    className="px-6 py-2 bg-mocha-surface0 dark:bg-mocha-surface0 light:bg-latte-surface0 text-mocha-text dark:text-mocha-text light:text-latte-text rounded-lg hover:bg-mocha-surface1 dark:hover:bg-mocha-surface1 light:hover:bg-latte-surface1 transition-colors font-medium"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="group relative">
                <div className="prose prose-lg max-w-none">
                  <div className="text-mocha-text dark:text-mocha-text light:text-latte-text leading-relaxed whitespace-pre-wrap">
                    {section.content}
                  </div>
                </div>
                <button
                  onClick={() => setIsEditingContent(true)}
                  className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 px-4 py-2 bg-mocha-mauve dark:bg-mocha-mauve light:bg-latte-mauve text-mocha-crust dark:text-mocha-crust light:text-latte-base rounded-lg hover:bg-mocha-lavender dark:hover:bg-mocha-lavender light:hover:bg-latte-lavender transition-all shadow-md"
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
            <div className="text-center py-16 text-mocha-overlay0 dark:text-mocha-overlay0 light:text-latte-overlay0">
              <div className="text-6xl mb-4">📝</div>
              <p className="text-lg">No content generated yet</p>
              <p className="text-sm mt-2">Generate content for this section first</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SectionEditor;
