import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useProjectStore from '../../store/projectStore';
import { generationApi } from '../../api/generation';
import { showToast } from '../../utils/toast';
import toast from 'react-hot-toast';

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
  const [aiGenerating, setAiGenerating] = useState(false);

  const handleNext = () => {
    if (step === 1) {
      if (!formData.document_type) {
        setError('Please select a document type');
        showToast.error('Please select a document type');
        return;
      }
    } else if (step === 2) {
      if (!formData.title.trim() || !formData.topic.trim()) {
        setError('Please fill in all fields');
        showToast.error('Please fill in all fields');
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

  const handleAIOutline = async () => {
    if (!formData.topic.trim()) {
      setError('Please enter a topic first');
      showToast.error('Please enter a topic first');
      return;
    }

    setAiGenerating(true);
    setError('');
    
    const toastId = showToast.loading('Generating AI outline...');
    
    try {
      const result = await generationApi.generateOutline(
        formData.topic,
        formData.document_type,
        5
      );
      
      setFormData({
        ...formData,
        sections: result.sections
      });
      
      showToast.success('AI outline generated successfully!');
      toast.dismiss(toastId);
    } catch (err) {
      setError('Failed to generate outline. Please try again.');
      showToast.error('Failed to generate outline');
      toast.dismiss(toastId);
    } finally {
      setAiGenerating(false);
    }
  };

  const handleAddSection = () => {
    if (!currentSection.trim()) {
      setError('Section title cannot be empty');
      showToast.error('Section title cannot be empty');
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
    showToast.success('Section added');
  };

  const handleRemoveSection = (index) => {
    const updatedSections = formData.sections
      .filter((_, i) => i !== index)
      .map((section, i) => ({ ...section, order: i }));
    
    setFormData({ ...formData, sections: updatedSections });
    showToast.success('Section removed');
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
      showToast.error('Please add at least one section');
      return;
    }

    try {
      const project = await createProject(formData);
      showToast.success('Project created successfully!');
      navigate(`/projects/${project.id}`);
    } catch (err) {
      setError('Failed to create project');
      showToast.error('Failed to create project');
    }
  };

  const getSectionLabel = () => {
    return formData.document_type === 'docx' ? 'Section' : 'Slide';
  };

  return (
    <div className="min-h-screen bg-mocha-base dark:bg-mocha-base light:bg-latte-base py-8 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <button
          onClick={() => navigate('/dashboard')}
          className="mb-6 flex items-center text-mocha-subtext0 dark:text-mocha-subtext0 light:text-latte-subtext0 hover:text-mocha-text dark:hover:text-mocha-text light:hover:text-latte-text transition duration-200"
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
                  ? 'bg-mocha-mauve dark:bg-mocha-mauve light:bg-latte-mauve text-mocha-crust dark:text-mocha-crust light:text-latte-base'
                  : 'bg-mocha-surface0 dark:bg-mocha-surface0 light:bg-latte-surface0 text-mocha-overlay0 dark:text-mocha-overlay0 light:text-latte-overlay0 border-2 border-mocha-surface2 dark:border-mocha-surface2 light:border-latte-surface2'
              }`}
            >
              {num}
            </div>
          ))}
        </div>

        {/* Main Card */}
        <div className="bg-mocha-mantle dark:bg-mocha-mantle light:bg-latte-mantle rounded-2xl shadow-sm border border-mocha-surface0 dark:border-mocha-surface0 light:border-latte-surface0 p-8">
          {error && (
            <div className="mb-6 bg-mocha-red/10 border border-mocha-red/30 text-mocha-red dark:bg-mocha-red/10 dark:border-mocha-red/30 dark:text-mocha-red light:bg-latte-red/10 light:border-latte-red/30 light:text-latte-red px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Step 1: Document Type */}
          {step === 1 && (
            <div>
              <h2 className="text-2xl font-bold text-mocha-text dark:text-mocha-text light:text-latte-text mb-2">
                Select Document Type
              </h2>
              <p className="text-mocha-subtext0 dark:text-mocha-subtext0 light:text-latte-subtext0 mb-8">
                Choose the type of document you want to create
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <label
                  className={`relative cursor-pointer rounded-xl border-2 p-8 text-center transition duration-200 ${
                    formData.document_type === 'docx'
                      ? 'border-mocha-mauve dark:border-mocha-mauve light:border-latte-mauve bg-mocha-mauve/10 dark:bg-mocha-mauve/10 light:bg-latte-mauve/10'
                      : 'border-mocha-surface2 dark:border-mocha-surface2 light:border-latte-surface2 hover:border-mocha-mauve/50 dark:hover:border-mocha-mauve/50 light:hover:border-latte-mauve/50 hover:bg-mocha-surface0 dark:hover:bg-mocha-surface0 light:hover:bg-latte-surface0'
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
                  <h3 className="text-lg font-semibold text-mocha-text dark:text-mocha-text light:text-latte-text mb-2">
                    Word Document
                  </h3>
                  <p className="text-sm text-mocha-subtext0 dark:text-mocha-subtext0 light:text-latte-subtext0">
                    Create structured documents with sections
                  </p>
                </label>

                <label
                  className={`relative cursor-pointer rounded-xl border-2 p-8 text-center transition duration-200 ${
                    formData.document_type === 'pptx'
                      ? 'border-mocha-mauve dark:border-mocha-mauve light:border-latte-mauve bg-mocha-mauve/10 dark:bg-mocha-mauve/10 light:bg-latte-mauve/10'
                      : 'border-mocha-surface2 dark:border-mocha-surface2 light:border-latte-surface2 hover:border-mocha-mauve/50 dark:hover:border-mocha-mauve/50 light:hover:border-latte-mauve/50 hover:bg-mocha-surface0 dark:hover:bg-mocha-surface0 light:hover:bg-latte-surface0'
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
                  <h3 className="text-lg font-semibold text-mocha-text dark:text-mocha-text light:text-latte-text mb-2">
                    PowerPoint Presentation
                  </h3>
                  <p className="text-sm text-mocha-subtext0 dark:text-mocha-subtext0 light:text-latte-subtext0">
                    Create slide-based presentations
                  </p>
                </label>
              </div>

              <button
                onClick={handleNext}
                className="w-full py-3 bg-mocha-mauve dark:bg-mocha-mauve light:bg-latte-mauve text-mocha-crust dark:text-mocha-crust light:text-latte-base rounded-lg hover:bg-mocha-lavender dark:hover:bg-mocha-lavender light:hover:bg-latte-lavender font-semibold transition duration-200"
              >
                Next →
              </button>
            </div>
          )}

          {/* Step 2: Title and Topic */}
          {step === 2 && (
            <div>
              <h2 className="text-2xl font-bold text-mocha-text dark:text-mocha-text light:text-latte-text mb-2">
                Project Details
              </h2>
              <p className="text-mocha-subtext0 dark:text-mocha-subtext0 light:text-latte-subtext0 mb-8">
                Provide basic information about your document
              </p>

              <div className="space-y-6 mb-8">
                <div>
                  <label className="block text-sm font-medium text-mocha-text dark:text-mocha-text light:text-latte-text mb-2">
                    Document Title
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., 2025 Market Analysis Report"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-3 bg-mocha-surface0 dark:bg-mocha-surface0 light:bg-latte-surface0 text-mocha-text dark:text-mocha-text light:text-latte-text border border-mocha-surface2 dark:border-mocha-surface2 light:border-latte-surface2 rounded-lg focus:ring-2 focus:ring-mocha-mauve dark:focus:ring-mocha-mauve light:focus:ring-latte-mauve focus:border-transparent transition duration-200 placeholder:text-mocha-overlay0 dark:placeholder:text-mocha-overlay0 light:placeholder:text-latte-overlay0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-mocha-text dark:text-mocha-text light:text-latte-text mb-2">
                    Topic/Description
                  </label>
                  <textarea
                    placeholder="e.g., Comprehensive analysis of electric vehicle market trends in 2025"
                    value={formData.topic}
                    onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                    rows={4}
                    className="w-full px-4 py-3 bg-mocha-surface0 dark:bg-mocha-surface0 light:bg-latte-surface0 text-mocha-text dark:text-mocha-text light:text-latte-text border border-mocha-surface2 dark:border-mocha-surface2 light:border-latte-surface2 rounded-lg focus:ring-2 focus:ring-mocha-mauve dark:focus:ring-mocha-mauve light:focus:ring-latte-mauve focus:border-transparent transition duration-200 placeholder:text-mocha-overlay0 dark:placeholder:text-mocha-overlay0 light:placeholder:text-latte-overlay0"
                  />
                </div>
              </div>

              <div className="flex space-x-4">
                <button
                  onClick={handleBack}
                  className="flex-1 py-3 bg-mocha-surface0 dark:bg-mocha-surface0 light:bg-latte-surface0 text-mocha-text dark:text-mocha-text light:text-latte-text border border-mocha-surface2 dark:border-mocha-surface2 light:border-latte-surface2 rounded-lg hover:bg-mocha-surface1 dark:hover:bg-mocha-surface1 light:hover:bg-latte-surface1 font-semibold transition duration-200"
                >
                  ← Back
                </button>
                <button
                  onClick={handleNext}
                  className="flex-1 py-3 bg-mocha-mauve dark:bg-mocha-mauve light:bg-latte-mauve text-mocha-crust dark:text-mocha-crust light:text-latte-base rounded-lg hover:bg-mocha-lavender dark:hover:bg-mocha-lavender light:hover:bg-latte-lavender font-semibold transition duration-200"
                >
                  Next →
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Structure */}
          {step === 3 && (
            <div>
              <h2 className="text-2xl font-bold text-mocha-text dark:text-mocha-text light:text-latte-text mb-2">
                Define Structure
              </h2>
              <p className="text-mocha-subtext0 dark:text-mocha-subtext0 light:text-latte-subtext0 mb-6">
                Add {formData.document_type === 'docx' ? 'sections' : 'slides'} to your document
              </p>

              {/* AI Generate Outline Button */}
              <div className="mb-6 p-4 bg-gradient-to-r from-mocha-blue/10 to-mocha-mauve/10 dark:from-mocha-blue/10 dark:to-mocha-mauve/10 light:from-latte-blue/10 light:to-latte-mauve/10 border border-mocha-blue/30 dark:border-mocha-blue/30 light:border-latte-blue/30 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="text-lg">✨</span>
                      <h4 className="text-sm font-semibold text-mocha-blue dark:text-mocha-blue light:text-latte-blue">
                        AI Suggestion
                      </h4>
                    </div>
                    <p className="text-xs text-mocha-subtext0 dark:text-mocha-subtext0 light:text-latte-subtext0">
                      Let AI suggest a professional outline based on your topic
                    </p>
                  </div>
                  <button
                    onClick={handleAIOutline}
                    disabled={aiGenerating || !formData.topic}
                    className="ml-4 px-4 py-2 text-sm bg-mocha-blue dark:bg-mocha-blue light:bg-latte-blue text-mocha-crust dark:text-mocha-crust light:text-latte-base rounded-lg hover:bg-mocha-sapphire dark:hover:bg-mocha-sapphire light:hover:bg-latte-sapphire font-medium transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                  >
                    {aiGenerating ? (
                      <div className="flex items-center space-x-2">
                        <div className="spinner w-4 h-4 border-2"></div>
                        <span>Generating...</span>
                      </div>
                    ) : (
                      'Generate Outline'
                    )}
                  </button>
                </div>
              </div>

              {/* Add Section Form */}
              <div className="flex space-x-3 mb-6">
                <input
                  type="text"
                  placeholder={`${getSectionLabel()} title (e.g., Introduction)`}
                  value={currentSection}
                  onChange={(e) => setCurrentSection(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddSection()}
                  className="flex-1 px-4 py-3 bg-mocha-surface0 dark:bg-mocha-surface0 light:bg-latte-surface0 text-mocha-text dark:text-mocha-text light:text-latte-text border border-mocha-surface2 dark:border-mocha-surface2 light:border-latte-surface2 rounded-lg focus:ring-2 focus:ring-mocha-mauve dark:focus:ring-mocha-mauve light:focus:ring-latte-mauve focus:border-transparent transition duration-200 placeholder:text-mocha-overlay0 dark:placeholder:text-mocha-overlay0 light:placeholder:text-latte-overlay0"
                />
                <button
                  onClick={handleAddSection}
                  className="px-6 py-3 bg-mocha-mauve dark:bg-mocha-mauve light:bg-latte-mauve text-mocha-crust dark:text-mocha-crust light:text-latte-base rounded-lg hover:bg-mocha-lavender dark:hover:bg-mocha-lavender light:hover:bg-latte-lavender font-semibold transition duration-200 whitespace-nowrap"
                >
                  Add {getSectionLabel()}
                </button>
              </div>

              {/* Sections List */}
              {formData.sections.length > 0 && (
                <div className="mb-8">
                  <h4 className="text-sm font-medium text-mocha-text dark:text-mocha-text light:text-latte-text mb-4">
                    {formData.sections.length} {getSectionLabel()}(s)
                  </h4>
                  <div className="space-y-2">
                    {formData.sections.map((section, index) => (
                      <div
                        key={index}
                        className="flex items-center space-x-3 p-4 bg-mocha-surface0 dark:bg-mocha-surface0 light:bg-latte-surface0 rounded-lg border border-mocha-surface1 dark:border-mocha-surface1 light:border-latte-surface1 hover:border-mocha-mauve/30 dark:hover:border-mocha-mauve/30 light:hover:border-latte-mauve/30 transition duration-200"
                      >
                        <div className="flex-shrink-0 w-8 h-8 bg-mocha-mauve dark:bg-mocha-mauve light:bg-latte-mauve text-mocha-crust dark:text-mocha-crust light:text-latte-base rounded-lg flex items-center justify-center font-semibold text-sm">
                          {index + 1}
                        </div>
                        <span className="flex-1 text-mocha-text dark:text-mocha-text light:text-latte-text">
                          {section.title}
                        </span>
                        <div className="flex space-x-1">
                          <button
                            onClick={() => handleMoveSection(index, 'up')}
                            disabled={index === 0}
                            className="w-8 h-8 flex items-center justify-center bg-mocha-mantle dark:bg-mocha-mantle light:bg-latte-mantle border border-mocha-surface2 dark:border-mocha-surface2 light:border-latte-surface2 text-mocha-text dark:text-mocha-text light:text-latte-text rounded-lg hover:bg-mocha-surface1 dark:hover:bg-mocha-surface1 light:hover:bg-latte-surface1 disabled:opacity-40 disabled:cursor-not-allowed transition duration-200"
                            title="Move up"
                          >
                            ↑
                          </button>
                          <button
                            onClick={() => handleMoveSection(index, 'down')}
                            disabled={index === formData.sections.length - 1}
                            className="w-8 h-8 flex items-center justify-center bg-mocha-mantle dark:bg-mocha-mantle light:bg-latte-mantle border border-mocha-surface2 dark:border-mocha-surface2 light:border-latte-surface2 text-mocha-text dark:text-mocha-text light:text-latte-text rounded-lg hover:bg-mocha-surface1 dark:hover:bg-mocha-surface1 light:hover:bg-latte-surface1 disabled:opacity-40 disabled:cursor-not-allowed transition duration-200"
                            title="Move down"
                          >
                            ↓
                          </button>
                          <button
                            onClick={() => handleRemoveSection(index)}
                            className="w-8 h-8 flex items-center justify-center bg-mocha-mantle dark:bg-mocha-mantle light:bg-latte-mantle border border-mocha-red/30 dark:border-mocha-red/30 light:border-latte-red/30 text-mocha-red dark:text-mocha-red light:text-latte-red rounded-lg hover:bg-mocha-red/10 dark:hover:bg-mocha-red/10 light:hover:bg-latte-red/10 transition duration-200"
                            title="Remove"
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
                  className="flex-1 py-3 bg-mocha-surface0 dark:bg-mocha-surface0 light:bg-latte-surface0 text-mocha-text dark:text-mocha-text light:text-latte-text border border-mocha-surface2 dark:border-mocha-surface2 light:border-latte-surface2 rounded-lg hover:bg-mocha-surface1 dark:hover:bg-mocha-surface1 light:hover:bg-latte-surface1 font-semibold transition duration-200"
                >
                  ← Back
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={loading || formData.sections.length === 0}
                  className="flex-1 py-3 bg-mocha-mauve dark:bg-mocha-mauve light:bg-latte-mauve text-mocha-crust dark:text-mocha-crust light:text-latte-base rounded-lg hover:bg-mocha-lavender dark:hover:bg-mocha-lavender light:hover:bg-latte-lavender font-semibold transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
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
