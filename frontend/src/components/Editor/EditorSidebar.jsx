const EditorSidebar = ({ sections, selectedSection, onSectionSelect, documentType, isOpen, onToggle }) => {
  if (!isOpen) return null;

  return (
    <div className="w-80 bg-mocha-mantle dark:bg-mocha-mantle light:bg-latte-mantle border-r border-mocha-surface0 dark:border-mocha-surface0 light:border-latte-surface0 overflow-y-auto flex flex-col">
      <div className="p-6 border-b border-mocha-surface0 dark:border-mocha-surface0 light:border-latte-surface0 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-mocha-text dark:text-mocha-text light:text-latte-text">
            {documentType === 'docx' ? 'Sections' : 'Slides'}
          </h2>
          <p className="text-sm text-mocha-subtext0 dark:text-mocha-subtext0 light:text-latte-subtext0 mt-1">
            {sections.length} {sections.length === 1 ? 'item' : 'items'}
          </p>
        </div>
        <button
          onClick={onToggle}
          className="p-2 text-mocha-overlay0 dark:text-mocha-overlay0 light:text-latte-overlay0 hover:text-mocha-text dark:hover:text-mocha-text light:hover:text-latte-text transition-colors"
          title="Close sidebar"
        >
          <span className="text-xl">←</span>
        </button>
      </div>
      
      <nav className="p-4 flex-1">
        <ul className="space-y-2">
          {sections.map((section, index) => (
            <li key={section.id}>
              <button
                onClick={() => onSectionSelect(section.id)}
                className={`w-full text-left p-4 rounded-lg transition-all duration-200 ${
                  selectedSection === section.id
                    ? 'bg-mocha-mauve/10 dark:bg-mocha-mauve/10 light:bg-latte-mauve/10 border-2 border-mocha-mauve dark:border-mocha-mauve light:border-latte-mauve shadow-sm'
                    : 'bg-mocha-surface0 dark:bg-mocha-surface0 light:bg-latte-surface0 hover:bg-mocha-surface1 dark:hover:bg-mocha-surface1 light:hover:bg-latte-surface1 border-2 border-transparent'
                }`}
              >
                <div className="flex items-start space-x-3">
                  <span
                    className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-sm font-semibold ${
                      section.content
                        ? 'bg-mocha-green/20 dark:bg-mocha-green/20 light:bg-latte-green/20 text-mocha-green dark:text-mocha-green light:text-latte-green'
                        : 'bg-mocha-surface2 dark:bg-mocha-surface2 light:bg-latte-surface2 text-mocha-overlay0 dark:text-mocha-overlay0 light:text-latte-overlay0'
                    }`}
                  >
                    {section.content ? '✓' : index + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-mocha-text dark:text-mocha-text light:text-latte-text line-clamp-2">
                      {section.title}
                    </p>
                    {section.content && (
                      <p className="text-xs text-mocha-overlay0 dark:text-mocha-overlay0 light:text-latte-overlay0 mt-1">
                        {section.content.length} characters
                      </p>
                    )}
                  </div>
                </div>
              </button>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
};

export default EditorSidebar;
