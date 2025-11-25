import { useState, useEffect } from 'react';
import RefinementPanel from './RefinementPanel';
import { refinementApi } from '../../api/refinement';
import { sectionsApi } from '../../api/sections';

const RightSidebar = ({ isOpen, onToggle, view, onViewChange, section, onRefine, onManualUpdate }) => {
  const [refinementPrompt, setRefinementPrompt] = useState('');
  const [isRefining, setIsRefining] = useState(false);
  const [refinementPreview, setRefinementPreview] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // History
  const [refinementHistory, setRefinementHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  useEffect(() => {
    if (isOpen && view === 'history' && section) {
      loadRefinementHistory();
    }
  }, [isOpen, view, section?.id]);

  const loadRefinementHistory = async () => {
    if (!section) return;
    
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

  const handleRefinePreview = async () => {
    if (!refinementPrompt.trim() || !section) {
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
    if (!section) return;
    
    setIsSaving(true);
    try {
      await refinementApi.acceptRefinement(
        section.id,
        refinementPrompt,
        refinementPreview.refined_content
      );
      
      if (onManualUpdate) {
        onManualUpdate(section.id, { content: refinementPreview.refined_content });
      }
      
      setRefinementPrompt('');
      setShowPreview(false);
      setRefinementPreview(null);
      
      if (view === 'history') {
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
    if (!section || !window.confirm('Restore this version? Current content will be replaced.')) {
      return;
    }
    
    setIsSaving(true);
    try {
      await sectionsApi.updateSection(section.id, { 
        content: refinement.previous_content 
      });
      
      if (onManualUpdate) {
        onManualUpdate(section.id, { content: refinement.previous_content });
      }
      
      await loadRefinementHistory();
    } catch (err) {
      setError('Failed to restore version');
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Preview Modal */}
      {showPreview && refinementPreview && (
        <RefinementPreview
          preview={refinementPreview}
          onAccept={handleAcceptRefinement}
          onReject={handleRejectRefinement}
          isSaving={isSaving}
        />
      )}

      <div className="w-96 bg-mocha-mantle dark:bg-mocha-mantle light:bg-latte-mantle border-l border-mocha-surface0 dark:border-mocha-surface0 light:border-latte-surface0 flex flex-col">
        {/* Tab Header */}
        <div className="border-b border-mocha-surface0 dark:border-mocha-surface0 light:border-latte-surface0">
          <div className="flex">
            <button
              onClick={() => onViewChange('refinement')}
              className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                view === 'refinement'
                  ? 'text-mocha-mauve dark:text-mocha-mauve light:text-latte-mauve border-b-2 border-mocha-mauve dark:border-mocha-mauve light:border-latte-mauve bg-mocha-mauve/5 dark:bg-mocha-mauve/5 light:bg-latte-mauve/5'
                  : 'text-mocha-subtext0 dark:text-mocha-subtext0 light:text-latte-subtext0 hover:text-mocha-text dark:hover:text-mocha-text light:hover:text-latte-text hover:bg-mocha-surface0 dark:hover:bg-mocha-surface0 light:hover:bg-latte-surface0'
              }`}
            >
              ✨ Refine
            </button>
            <button
              onClick={() => onViewChange('history')}
              className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                view === 'history'
                  ? 'text-mocha-mauve dark:text-mocha-mauve light:text-latte-mauve border-b-2 border-mocha-mauve dark:border-mocha-mauve light:border-latte-mauve bg-mocha-mauve/5 dark:bg-mocha-mauve/5 light:bg-latte-mauve/5'
                  : 'text-mocha-subtext0 dark:text-mocha-subtext0 light:text-latte-subtext0 hover:text-mocha-text dark:hover:text-mocha-text light:hover:text-latte-text hover:bg-mocha-surface0 dark:hover:bg-mocha-surface0 light:hover:bg-latte-surface0'
              }`}
            >
              📜 History {refinementHistory.length > 0 && `(${refinementHistory.length})`}
            </button>
            <button
              onClick={onToggle}
              className="px-3 text-mocha-overlay0 dark:text-mocha-overlay0 light:text-latte-overlay0 hover:text-mocha-text dark:hover:text-mocha-text light:hover:text-latte-text transition-colors"
              title="Close sidebar"
            >
              <span className="text-xl">→</span>
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="m-4 p-3 bg-mocha-red/10 border border-mocha-red/30 text-mocha-red dark:bg-mocha-red/10 dark:border-mocha-red/30 dark:text-mocha-red light:bg-latte-red/10 light:border-latte-red/30 light:text-latte-red rounded-lg text-sm flex justify-between items-center">
            <span>{error}</span>
            <button onClick={() => setError('')} className="font-bold">✕</button>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          {view === 'refinement' ? (
            <RefinementPanel
              isOpen={true}
              onToggle={onToggle}
              refinementPrompt={refinementPrompt}
              onPromptChange={setRefinementPrompt}
              onRefine={handleRefinePreview}
              isRefining={isRefining}
            />
          ) : (
            <div className="h-full overflow-y-auto p-4">
              <h3 className="text-lg font-semibold text-mocha-text dark:text-mocha-text light:text-latte-text mb-4 flex items-center">
                <span className="text-2xl mr-2">📜</span>
                Refinement History
              </h3>
              
              {loadingHistory ? (
                <div className="flex justify-center py-8">
                  <div className="spinner"></div>
                </div>
              ) : refinementHistory.length > 0 ? (
                <div className="space-y-3">
                  {refinementHistory.map((refinement, index) => (
                    <div
                      key={refinement.id}
                      className="border-l-4 border-mocha-mauve dark:border-mocha-mauve light:border-latte-mauve pl-3 py-3 bg-mocha-surface0 dark:bg-mocha-surface0 light:bg-latte-surface0 rounded-r-lg"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-semibold text-mocha-mauve dark:text-mocha-mauve light:text-latte-mauve">
                          #{refinementHistory.length - index}
                        </span>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs text-mocha-overlay0 dark:text-mocha-overlay0 light:text-latte-overlay0">
                            {new Date(refinement.created_at).toLocaleString()}
                          </span>
                          <button
                            onClick={() => handleRestoreVersion(refinement)}
                            disabled={isSaving}
                            className="px-2 py-1 text-xs bg-mocha-blue dark:bg-mocha-blue light:bg-latte-blue text-mocha-crust dark:text-mocha-crust light:text-latte-base rounded hover:bg-mocha-sapphire dark:hover:bg-mocha-sapphire light:hover:bg-latte-sapphire transition-colors disabled:opacity-50"
                            title="Restore this version"
                          >
                            Restore
                          </button>
                        </div>
                      </div>
                      <div className="mb-2">
                        <span className="text-xs font-medium text-mocha-overlay0 dark:text-mocha-overlay0 light:text-latte-overlay0">
                          Prompt:
                        </span>
                        <p className="text-sm text-mocha-text dark:text-mocha-text light:text-latte-text mt-1">
                          "{refinement.prompt}"
                        </p>
                      </div>
                      <details className="text-sm">
                        <summary className="cursor-pointer text-mocha-mauve dark:text-mocha-mauve light:text-latte-mauve hover:text-mocha-lavender dark:hover:text-mocha-lavender light:hover:text-latte-lavender font-medium">
                          View previous content
                        </summary>
                        <div className="mt-2 p-3 bg-mocha-mantle dark:bg-mocha-mantle light:bg-latte-mantle rounded-lg border border-mocha-surface1 dark:border-mocha-surface1 light:border-latte-surface1">
                          <p className="text-xs font-medium text-mocha-overlay0 dark:text-mocha-overlay0 light:text-latte-overlay0 mb-2">
                            Previous Version:
                          </p>
                          <p className="text-mocha-text dark:text-mocha-text light:text-latte-text whitespace-pre-wrap text-xs">
                            {refinement.previous_content}
                          </p>
                        </div>
                      </details>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-mocha-overlay0 dark:text-mocha-overlay0 light:text-latte-overlay0">
                  <p>No refinements yet</p>
                  <p className="text-sm mt-1">Refine this section to see the history</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

// Refinement Preview Modal Component
const RefinementPreview = ({ preview, onAccept, onReject, isSaving }) => {
  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-mocha-mantle dark:bg-mocha-mantle light:bg-latte-mantle rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden border border-mocha-surface0 dark:border-mocha-surface0 light:border-latte-surface0">
        {/* Header */}
        <div className="bg-gradient-to-r from-mocha-mauve to-mocha-blue dark:from-mocha-mauve dark:to-mocha-blue light:from-latte-mauve light:to-latte-blue text-mocha-crust dark:text-mocha-crust light:text-latte-base p-6">
          <h2 className="text-2xl font-bold flex items-center">
            <span className="text-3xl mr-3">🔄</span>
            Review AI Refinement
          </h2>
          <p className="text-mocha-text/80 dark:text-mocha-text/80 light:text-latte-text/80 mt-2">
            Compare the changes and decide whether to accept or reject
          </p>
        </div>
        
        {/* Content Comparison */}
        <div className="grid grid-cols-2 divide-x divide-mocha-surface0 dark:divide-mocha-surface0 light:divide-latte-surface0 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 200px)' }}>
          {/* Original Content */}
          <div className="p-6 bg-mocha-red/5 dark:bg-mocha-red/5 light:bg-latte-red/5">
            <div className="flex items-center space-x-2 mb-4">
              <span className="px-3 py-1 bg-mocha-red/20 dark:bg-mocha-red/20 light:bg-latte-red/20 text-mocha-red dark:text-mocha-red light:text-latte-red rounded-full text-sm font-semibold">
                Original
              </span>
              <span className="text-sm text-mocha-subtext0 dark:text-mocha-subtext0 light:text-latte-subtext0">
                {preview.original_content.length} characters
              </span>
            </div>
            <div className="prose prose-sm max-w-none">
              <div className="text-mocha-text dark:text-mocha-text light:text-latte-text whitespace-pre-wrap leading-relaxed bg-mocha-mantle dark:bg-mocha-mantle light:bg-latte-mantle p-4 rounded-lg border-2 border-mocha-red/30 dark:border-mocha-red/30 light:border-latte-red/30">
                {preview.original_content}
              </div>
            </div>
          </div>
          
          {/* Refined Content */}
          <div className="p-6 bg-mocha-green/5 dark:bg-mocha-green/5 light:bg-latte-green/5">
            <div className="flex items-center space-x-2 mb-4">
              <span className="px-3 py-1 bg-mocha-green/20 dark:bg-mocha-green/20 light:bg-latte-green/20 text-mocha-green dark:text-mocha-green light:text-latte-green rounded-full text-sm font-semibold">
                AI Refined
              </span>
              <span className="text-sm text-mocha-subtext0 dark:text-mocha-subtext0 light:text-latte-subtext0">
                {preview.refined_content.length} characters
              </span>
            </div>
            <div className="prose prose-sm max-w-none">
              <div className="text-mocha-text dark:text-mocha-text light:text-latte-text whitespace-pre-wrap leading-relaxed bg-mocha-mantle dark:bg-mocha-mantle light:bg-latte-mantle p-4 rounded-lg border-2 border-mocha-green/30 dark:border-mocha-green/30 light:border-latte-green/30">
                {preview.refined_content}
              </div>
            </div>
          </div>
        </div>
        
        {/* Actions */}
        <div className="bg-mocha-surface0 dark:bg-mocha-surface0 light:bg-latte-surface0 px-6 py-4 border-t border-mocha-surface1 dark:border-mocha-surface1 light:border-latte-surface1 flex justify-between items-center">
          <div className="flex items-center space-x-2 text-sm text-mocha-subtext0 dark:text-mocha-subtext0 light:text-latte-subtext0">
            <span>💡</span>
            <span>Review the changes carefully before accepting</span>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={onReject}
              disabled={isSaving}
              className="px-6 py-3 bg-mocha-mantle dark:bg-mocha-mantle light:bg-latte-mantle text-mocha-text dark:text-mocha-text light:text-latte-text border-2 border-mocha-surface2 dark:border-mocha-surface2 light:border-latte-surface2 rounded-lg hover:bg-mocha-surface0 dark:hover:bg-mocha-surface0 light:hover:bg-latte-surface0 font-semibold transition-colors disabled:opacity-50"
            >
              ✕ Reject
            </button>
            <button
              onClick={onAccept}
              disabled={isSaving}
              className="px-8 py-3 bg-mocha-green dark:bg-mocha-green light:bg-latte-green text-mocha-crust dark:text-mocha-crust light:text-latte-base rounded-lg hover:bg-mocha-teal dark:hover:bg-mocha-teal light:hover:bg-latte-teal font-semibold transition-colors disabled:opacity-50 shadow-lg hover:shadow-xl flex items-center space-x-2"
            >
              {isSaving ? (
                <>
                  <div className="spinner w-5 h-5 border-2"></div>
                  <span>Accepting...</span>
                </>
              ) : (
                <>
                  <span>✓</span>
                  <span>Accept & Apply</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RightSidebar;
