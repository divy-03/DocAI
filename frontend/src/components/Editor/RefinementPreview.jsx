const RefinementPreview = ({ preview, onAccept, onReject, isSaving }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary-600 to-blue-600 text-white p-6">
          <h2 className="text-2xl font-bold flex items-center">
            <span className="text-3xl mr-3">🔄</span>
            Review AI Refinement
          </h2>
          <p className="text-primary-100 mt-2">
            Compare the changes and decide whether to accept or reject
          </p>
        </div>

        {/* Content Comparison */}
        <div className="grid grid-cols-2 divide-x divide-gray-300 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 200px)' }}>
          {/* Original Content */}
          <div className="p-6 bg-red-50">
            <div className="flex items-center space-x-2 mb-4">
              <span className="px-3 py-1 bg-red-200 text-red-800 rounded-full text-sm font-semibold">
                Original
              </span>
              <span className="text-sm text-gray-600">
                {preview.original_content.length} characters
              </span>
            </div>
            <div className="prose prose-sm max-w-none">
              <div className="text-gray-800 whitespace-pre-wrap leading-relaxed bg-white p-4 rounded-lg border-2 border-red-200">
                {preview.original_content}
              </div>
            </div>
          </div>

          {/* Refined Content */}
          <div className="p-6 bg-green-50">
            <div className="flex items-center space-x-2 mb-4">
              <span className="px-3 py-1 bg-green-200 text-green-800 rounded-full text-sm font-semibold">
                AI Refined
              </span>
              <span className="text-sm text-gray-600">
                {preview.refined_content.length} characters
              </span>
            </div>
            <div className="prose prose-sm max-w-none">
              <div className="text-gray-800 whitespace-pre-wrap leading-relaxed bg-white p-4 rounded-lg border-2 border-green-200">
                {preview.refined_content}
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex justify-between items-center">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <span>💡</span>
            <span>Review the changes carefully before accepting</span>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={onReject}
              disabled={isSaving}
              className="px-6 py-3 bg-white text-gray-700 border-2 border-gray-300 rounded-lg hover:bg-gray-100 font-semibold transition-colors disabled:opacity-50"
            >
              ✕ Reject Changes
            </button>
            <button
              onClick={onAccept}
              disabled={isSaving}
              className="px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold transition-colors disabled:opacity-50 shadow-lg hover:shadow-xl flex items-center space-x-2"
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

export default RefinementPreview;
