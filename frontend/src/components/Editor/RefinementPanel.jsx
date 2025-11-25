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
    <div className="h-full flex flex-col bg-mocha-mantle dark:bg-mocha-mantle light:bg-latte-mantle">
      {/* Header */}
      <div className="p-4 border-b border-mocha-surface0 dark:border-mocha-surface0 light:border-latte-surface0">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-xl">✨</span>
            <h3 className="text-lg font-semibold text-mocha-text dark:text-mocha-text light:text-latte-text">
              AI Refinement
            </h3>
          </div>
          <button
            onClick={onToggle}
            className="p-1 text-mocha-overlay0 dark:text-mocha-overlay0 light:text-latte-overlay0 hover:text-mocha-text dark:hover:text-mocha-text light:hover:text-latte-text transition-colors"
          >
            <span className="text-xl">✕</span>
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Quick Prompts */}
        <div>
          <label className="block text-sm font-medium text-mocha-text dark:text-mocha-text light:text-latte-text mb-2">
            Quick Suggestions:
          </label>
          <div className="flex flex-wrap gap-2">
            {quickPrompts.map((prompt, index) => (
              <button
                key={index}
                onClick={() => handleQuickPrompt(prompt.value)}
                className="px-3 py-1.5 text-sm bg-mocha-surface0 dark:bg-mocha-surface0 light:bg-latte-surface0 text-mocha-mauve dark:text-mocha-mauve light:text-latte-mauve border border-mocha-mauve/30 dark:border-mocha-mauve/30 light:border-latte-mauve/30 rounded-full hover:bg-mocha-mauve/10 dark:hover:bg-mocha-mauve/10 light:hover:bg-latte-mauve/10 transition-colors"
              >
                {prompt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Custom Prompt Input */}
        <div>
          <label className="block text-sm font-medium text-mocha-text dark:text-mocha-text light:text-latte-text mb-2">
            Or describe your own refinement:
          </label>
          <textarea
            value={refinementPrompt}
            onChange={(e) => onPromptChange(e.target.value)}
            placeholder="e.g., Make it more concise, Add a conclusion paragraph, Use more technical language..."
            rows={6}
            className="w-full px-4 py-3 bg-mocha-surface0 dark:bg-mocha-surface0 light:bg-latte-surface0 text-mocha-text dark:text-mocha-text light:text-latte-text border border-mocha-surface2 dark:border-mocha-surface2 light:border-latte-surface2 rounded-lg focus:ring-2 focus:ring-mocha-mauve dark:focus:ring-mocha-mauve light:focus:ring-latte-mauve focus:border-transparent resize-none placeholder:text-mocha-overlay0 dark:placeholder:text-mocha-overlay0 light:placeholder:text-latte-overlay0"
          />
        </div>

        {/* Info Note */}
        <div className="p-3 bg-mocha-blue/10 dark:bg-mocha-blue/10 light:bg-latte-blue/10 border border-mocha-blue/30 dark:border-mocha-blue/30 light:border-latte-blue/30 rounded-lg">
          <p className="text-xs text-mocha-blue dark:text-mocha-blue light:text-latte-blue">
            <span className="font-semibold">💡 Tip:</span> Be specific in your refinement request for better results. The AI will maintain the overall structure while applying your improvements.
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="p-4 border-t border-mocha-surface0 dark:border-mocha-surface0 light:border-latte-surface0 space-y-2">
        <button
          onClick={onRefine}
          disabled={isRefining || !refinementPrompt.trim()}
          className="w-full flex items-center justify-center space-x-2 px-6 py-3 bg-mocha-mauve dark:bg-mocha-mauve light:bg-latte-mauve text-mocha-crust dark:text-mocha-crust light:text-latte-base rounded-lg hover:bg-mocha-lavender dark:hover:bg-mocha-lavender light:hover:bg-latte-lavender font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
        >
          {isRefining ? (
            <>
              <div className="spinner w-5 h-5 border-2"></div>
              <span>Refining...</span>
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
          className="w-full px-6 py-2 bg-mocha-surface0 dark:bg-mocha-surface0 light:bg-latte-surface0 text-mocha-text dark:text-mocha-text light:text-latte-text rounded-lg hover:bg-mocha-surface1 dark:hover:bg-mocha-surface1 light:hover:bg-latte-surface1 font-semibold transition-colors disabled:opacity-50"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default RefinementPanel;
