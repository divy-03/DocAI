const EditorSidebar = ({ isOpen, onToggle, sections, selectedIndex, onSelectSection, documentType }) => {
  if (!isOpen) {
    return (
      <button
        onClick={onToggle}
        className="w-12 bg-mocha-mantle dark:bg-mocha-mantle light:bg-latte-mantle border-r border-mocha-surface0 dark:border-mocha-surface0 light:border-latte-surface0 flex items-center justify-center hover:bg-mocha-surface0 dark:hover:bg-mocha-surface0 light:hover:bg-latte-surface0 transition-colors"
        title="Open sidebar"
      >
        <span className="text-xl text-mocha-text dark:text-mocha-text light:text-latte-text">→</span>
      </button>
    );
  }

  return (
    <div className="w-64 bg-mocha-mantle dark:bg-mocha-mantle light:bg-latte-mantle border-r border-mocha-surface0 dark:border-mocha-surface0 light:border-latte-surface0 flex flex-col h-full">
      {/* Header - Fixed */}
      <div className="flex-shrink-0 border-b border-mocha-surface0 dark:border-mocha-surface0 light:border-latte-surface0 p-4">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-semibold text-mocha-text dark:text-mocha-text light:text-latte-text">
            {documentType === 'docx' ? 'Sections' : 'Slides'}
          </h2>
          <button
            onClick={onToggle}
            className="text-mocha-overlay0 dark:text-mocha-overlay0 light:text-latte-overlay0 hover:text-mocha-text dark:hover:text-mocha-text light:hover:text-latte-text transition-colors"
            title="Close sidebar"
          >
            <span className="text-xl">←</span>
          </button>
        </div>
        <p className="text-sm text-mocha-subtext0 dark:text-mocha-subtext0 light:text-latte-subtext0">
          {sections.length} {sections.length === 1 ? 'item' : 'items'}
        </p>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {sections.map((section, index) => (
          <button
            key={section.id}
            onClick={() => onSelectSection(index)}
            className={`w-full text-left p-4 rounded-lg transition-all duration-200 ${
              selectedIndex === index
                ? 'bg-mocha-mauve dark:bg-mocha-mauve light:bg-latte-mauve text-mocha-crust dark:text-mocha-crust light:text-latte-base shadow-md'
                : 'bg-mocha-surface0 dark:bg-mocha-surface0 light:bg-latte-surface0 text-mocha-text dark:text-mocha-text light:text-latte-text hover:bg-mocha-surface1 dark:hover:bg-mocha-surface1 light:hover:bg-latte-surface1'
            }`}
          >
            <div className="flex items-start justify-between mb-2">
              <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                selectedIndex === index
                  ? 'bg-mocha-crust/20 dark:bg-mocha-crust/20 light:bg-latte-base/20'
                  : 'bg-mocha-mauve/20 dark:bg-mocha-mauve/20 light:bg-latte-mauve/20 text-mocha-mauve dark:text-mocha-mauve light:text-latte-mauve'
              }`}>
                {documentType === 'docx' ? 'Section' : 'Slide'} {index + 1}
              </span>
              {section.content && (
                <span className={`text-xs ${
                  selectedIndex === index
                    ? 'text-mocha-crust/80 dark:text-mocha-crust/80 light:text-latte-base/80'
                    : 'text-mocha-green dark:text-mocha-green light:text-latte-green'
                }`}>
                  ✓
                </span>
              )}
            </div>
            <h3 className={`font-semibold text-sm line-clamp-2 ${
              selectedIndex === index
                ? 'text-mocha-crust dark:text-mocha-crust light:text-latte-base'
                : ''
            }`}>
              {section.title}
            </h3>
          </button>
        ))}
      </div>
    </div>
  );
};

export default EditorSidebar;
