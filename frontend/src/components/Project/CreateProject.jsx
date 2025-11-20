import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useProjectStore from '../../store/projectStore';

const CreateProject = () => {
  const navigate = useNavigate();
  const { createProject, loading } = useProjectStore();

  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    title: '',
    topic: '',
    document_type: 'docx',
    sections: []
  });
  const [currentSection, setCurrentSection] = useState('');
  const [error, setError] = useState('');

  const handleNext = () => {
    if (step === 1) {
      if (!formData.document_type) {
        setError('Please select a document type');
        return;
      }
    } else if (step === 2) {
      if (!formData.title.trim() || !formData.topic.trim()) {
        setError('Please fill in all fields');
        return;
      }
    }
    setError('');
    setStep(step + 1);
  };

  const handleBack = () => {
    setError('');
    setStep(step - 1);
  };

  const handleAddSection = () => {
    if (!currentSection.trim()) {
      setError('Section title cannot be empty');
      return;
    }

    const newSection = {
      title: currentSection,
      order: formData.sections.length
    };

    setFormData({
      ...formData,
      sections: [...formData.sections, newSection]
    });
    setCurrentSection('');
    setError('');
  };

  const handleRemoveSection = (index) => {
    const updatedSections = formData.sections
      .filter((_, i) => i !== index)
      .map((section, i) => ({ ...section, order: i }));
    
    setFormData({ ...formData, sections: updatedSections });
  };

  const handleMoveSection = (index, direction) => {
    const sections = [...formData.sections];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    
    if (newIndex < 0 || newIndex >= sections.length) return;
    
    [sections[index], sections[newIndex]] = [sections[newIndex], sections[index]];
    sections.forEach((section, i) => section.order = i);
    
    setFormData({ ...formData, sections });
  };

  const handleSubmit = async () => {
    if (formData.sections.length === 0) {
      setError('Please add at least one section');
      return;
    }

    try {
      const project = await createProject(formData);
      navigate(`/projects/${project.id}`);
    } catch (err) {
      setError('Failed to create project');
    }
  };

  const getSectionLabel = () => {
    return formData.document_type === 'docx' ? 'Section' : 'Slide';
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <button
          onClick={() => navigate('/dashboard')}
          className="mb-6 flex items-center text-gray-600 hover:text-gray-900 transition duration-200"
        >
          <span className="mr-2">←</span>
          <span className="font-medium">Back to Dashboard</span>
        </button>

        {/* Progress Steps */}
        <div className="flex justify-center mb-8 space-x-4">
          {[1, 2, 3].map((num) => (
            <div
              key={num}
              className={`flex items-center justify-center w-12 h-12 rounded-full font-semibold transition duration-200 ${
                step >= num
                  ? 'bg-primary-600 text-white'
                  : 'bg-white text-gray-400 border-2 border-gray-300'
              }`}
            >
              {num}
            </div>
          ))}
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Step 1: Document Type */}
          {step === 1 && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Select Document Type</h2>
              <p className="text-gray-600 mb-8">Choose the type of document you want to create</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <label
                  className={`relative cursor-pointer rounded-xl border-2 p-8 text-center transition duration-200 ${
                    formData.document_type === 'docx'
                      ? 'border-primary-600 bg-primary-50'
                      : 'border-gray-300 hover:border-primary-300 hover:bg-gray-50'
                  }`}
                >
                  <input
                    type="radio"
                    name="document_type"
                    value="docx"
                    checked={formData.document_type === 'docx'}
                    onChange={(e) => setFormData({ ...formData, document_type: e.target.value })}
                    className="sr-only"
                  />
                  <div className="text-5xl mb-4">📄</div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Word Document</h3>
                  <p className="text-sm text-gray-600">Create structured documents with sections</p>
                </label>

                <label
                  className={`relative cursor-pointer rounded-xl border-2 p-8 text-center transition duration-200 ${
                    formData.document_type === 'pptx'
                      ? 'border-primary-600 bg-primary-50'
                      : 'border-gray-300 hover:border-primary-300 hover:bg-gray-50'
                  }`}
                >
                  <input
                    type="radio"
                    name="document_type"
                    value="pptx"
                    checked={formData.document_type === 'pptx'}
                    onChange={(e) => setFormData({ ...formData, document_type: e.target.value })}
                    className="sr-only"
                  />
                  <div className="text-5xl mb-4">📊</div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">PowerPoint Presentation</h3>
                  <p className="text-sm text-gray-600">Create slide-based presentations</p>
                </label>
              </div>

              <button
                onClick={handleNext}
                className="w-full py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-semibold transition duration-200"
              >
                Next →
              </button>
            </div>
          )}

          {/* Step 2: Title and Topic */}
          {step === 2 && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Project Details</h2>
              <p className="text-gray-600 mb-8">Provide basic information about your document</p>

              <div className="space-y-6 mb-8">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Document Title
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., 2025 Market Analysis Report"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition duration-200"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Topic/Description
                  </label>
                  <textarea
                    placeholder="e.g., Comprehensive analysis of electric vehicle market trends in 2025"
                    value={formData.topic}
                    onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition duration-200"
                  />
                </div>
              </div>

              <div className="flex space-x-4">
                <button
                  onClick={handleBack}
                  className="flex-1 py-3 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 font-semibold transition duration-200"
                >
                  ← Back
                </button>
                <button
                  onClick={handleNext}
                  className="flex-1 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-semibold transition duration-200"
                >
                  Next →
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Structure */}
          {step === 3 && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Define Structure</h2>
              <p className="text-gray-600 mb-8">
                Add {formData.document_type === 'docx' ? 'sections' : 'slides'} to your document
              </p>

              {/* Add Section Form */}
              <div className="flex space-x-3 mb-6">
                <input
                  type="text"
                  placeholder={`${getSectionLabel()} title (e.g., Introduction)`}
                  value={currentSection}
                  onChange={(e) => setCurrentSection(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddSection()}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition duration-200"
                />
                <button
                  onClick={handleAddSection}
                  className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-semibold transition duration-200 whitespace-nowrap"
                >
                  Add {getSectionLabel()}
                </button>
              </div>

              {/* Sections List */}
              {formData.sections.length > 0 && (
                <div className="mb-8">
                  <h4 className="text-sm font-medium text-gray-700 mb-4">
                    {formData.sections.length} {getSectionLabel()}(s)
                  </h4>
                  <div className="space-y-2">
                    {formData.sections.map((section, index) => (
                      <div
                        key={index}
                        className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg border border-gray-200"
                      >
                        <div className="flex-shrink-0 w-8 h-8 bg-primary-600 text-white rounded-lg flex items-center justify-center font-semibold text-sm">
                          {index + 1}
                        </div>
                        <span className="flex-1 text-gray-900">{section.title}</span>
                        <div className="flex space-x-1">
                          <button
                            onClick={() => handleMoveSection(index, 'up')}
                            disabled={index === 0}
                            className="w-8 h-8 flex items-center justify-center bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition duration-200"
                          >
                            ↑
                          </button>
                          <button
                            onClick={() => handleMoveSection(index, 'down')}
                            disabled={index === formData.sections.length - 1}
                            className="w-8 h-8 flex items-center justify-center bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition duration-200"
                          >
                            ↓
                          </button>
                          <button
                            onClick={() => handleRemoveSection(index)}
                            className="w-8 h-8 flex items-center justify-center bg-white border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition duration-200"
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex space-x-4">
                <button
                  onClick={handleBack}
                  className="flex-1 py-3 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 font-semibold transition duration-200"
                >
                  ← Back
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={loading || formData.sections.length === 0}
                  className="flex-1 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-semibold transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="spinner w-5 h-5 border-2"></div>
                      <span>Creating...</span>
                    </div>
                  ) : (
                    'Create Project'
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreateProject;

