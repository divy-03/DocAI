const EditorSidebar = ({ sections, selectedSection, onSectionSelect, documentType }) => {
  return (
    <div className="w-80 bg-white border-r border-gray-200 overflow-y-auto">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">
          {documentType === 'docx' ? 'Sections' : 'Slides'}
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          {sections.length} {sections.length === 1 ? 'item' : 'items'}
        </p>
      </div>

      <nav className="p-4">
        <ul className="space-y-2">
          {sections.map((section, index) => (
            <li key={section.id}>
              <button
                onClick={() => onSectionSelect(section.id)}
                className={`w-full text-left p-4 rounded-lg transition-all duration-200 ${
                  selectedSection === section.id
                    ? 'bg-primary-50 border-2 border-primary-500 shadow-sm'
                    : 'bg-gray-50 hover:bg-gray-100 border-2 border-transparent'
                }`}
              >
                <div className="flex items-start space-x-3">
                  <span
                    className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-sm font-semibold ${
                      section.content
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-200 text-gray-600'
                    }`}
                  >
                    {section.content ? '✓' : index + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 line-clamp-2">
                      {section.title}
                    </p>
                    {section.content && (
                      <p className="text-xs text-gray-500 mt-1">
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
