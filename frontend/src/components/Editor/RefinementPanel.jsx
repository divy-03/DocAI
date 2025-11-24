const RefinementPanel = ({
  isOpen,
  onToggle,
  refinementPrompt,
  onPromptChange,
  onRefine,
  isRefining
}) => {
  const quickPrompts = [
    { label: 'Make it more formal', value: 'Make the content more formal and professional' },
    { label: 'Add examples', value: 'Add relevant examples to illustrate the points' },
    { label: 'Simplify language', value: 'Simplify the language and make it easier to understand' },
    { label: 'Make it more detailed', value: 'Expand the content with more details and explanations' },
    { label: 'Add statistics', value: 'Include relevant statistics and data to support the content' },
  ];

  const handleQuickPrompt = (value) => {
    onPromptChange(value);
  };

  return (
    <div className="border-t border-gray-200 bg-gradient-to-r from-purple-50 to-blue-50">
      {!isOpen ? (
        <button
          onClick={onToggle}
          className="w-full py-4 px-6 flex items-center justify-center space-x-3 text-primary-700 hover:bg-primary-50 transition-colors"
        >
          <span className="text-2xl">🔄</span>
          <span className="font-semibold text-lg">Refine This Section</span>
          <span className="text-sm text-gray-500">(AI-powered improvement)</span>
        </button>
      ) : (
        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <span className="text-2xl mr-2">✨</span>
              AI Refinement
            </h3>
            <button
              onClick={onToggle}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <span className="text-2xl">✕</span>
            </button>
          </div>

          {/* Quick Prompts */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Quick Suggestions:
            </label>
            <div className="flex flex-wrap gap-2">
              {quickPrompts.map((prompt, index) => (
                <button
                  key={index}
                  onClick={() => handleQuickPrompt(prompt.value)}
                  className="px-3 py-1.5 text-sm bg-white text-primary-700 border border-primary-300 rounded-full hover:bg-primary-50 transition-colors"
                >
                  {prompt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Custom Prompt Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Or describe your own refinement:
            </label>
            <textarea
              value={refinementPrompt}
              onChange={(e) => onPromptChange(e.target.value)}
              placeholder="e.g., Make it more concise, Add a conclusion paragraph, Use more technical language..."
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <button
              onClick={onRefine}
              disabled={isRefining || !refinementPrompt.trim()}
              className="flex-1 flex items-center justify-center space-x-2 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
            >
              {isRefining ? (
                <>
                  <div className="spinner w-5 h-5 border-2"></div>
                  <span>Refining with AI...</span>
                </>
              ) : (
                <>
                  <span className="text-xl">✨</span>
                  <span>Apply Refinement</span>
                </>
              )}
            </button>
            <button
              onClick={() => {
                onToggle();
                onPromptChange('');
              }}
              disabled={isRefining}
              className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-semibold transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
          </div>

          {/* Info Note */}
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-xs text-blue-800">
              <span className="font-semibold">💡 Tip:</span> Be specific in your refinement request for better results. The AI will maintain the overall structure while applying your improvements.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default RefinementPanel;
