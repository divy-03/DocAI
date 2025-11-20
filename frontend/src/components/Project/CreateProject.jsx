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
    <div className="create-project-container">
      <div className="create-project-header">
        <button className="btn-back" onClick={() => navigate('/dashboard')}>
          ← Back to Dashboard
        </button>
        <div className="progress-steps">
          <div className={`step ${step >= 1 ? 'active' : ''}`}>1. Type</div>
          <div className={`step ${step >= 2 ? 'active' : ''}`}>2. Details</div>
          <div className={`step ${step >= 3 ? 'active' : ''}`}>3. Structure</div>
        </div>
      </div>

      <div className="create-project-card">
        {error && <div className="error-message">{error}</div>}

        {/* Step 1: Document Type */}
        {step === 1 && (
          <div className="step-content">
            <h2>Select Document Type</h2>
            <p className="step-subtitle">Choose the type of document you want to create</p>

            <div className="document-type-options">
              <label className={`type-option ${formData.document_type === 'docx' ? 'selected' : ''}`}>
                <input
                  type="radio"
                  name="document_type"
                  value="docx"
                  checked={formData.document_type === 'docx'}
                  onChange={(e) => setFormData({ ...formData, document_type: e.target.value })}
                />
                <div className="type-option-content">
                  <span className="type-icon">📄</span>
                  <h3>Word Document</h3>
                  <p>Create structured documents with sections</p>
                </div>
              </label>

              <label className={`type-option ${formData.document_type === 'pptx' ? 'selected' : ''}`}>
                <input
                  type="radio"
                  name="document_type"
                  value="pptx"
                  checked={formData.document_type === 'pptx'}
                  onChange={(e) => setFormData({ ...formData, document_type: e.target.value })}
                />
                <div className="type-option-content">
                  <span className="type-icon">📊</span>
                  <h3>PowerPoint Presentation</h3>
                  <p>Create slide-based presentations</p>
                </div>
              </label>
            </div>

            <div className="step-actions">
              <button className="btn-primary" onClick={handleNext}>
                Next →
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Title and Topic */}
        {step === 2 && (
          <div className="step-content">
            <h2>Project Details</h2>
            <p className="step-subtitle">Provide basic information about your document</p>

            <div className="form-group">
              <label>Document Title</label>
              <input
                type="text"
                placeholder="e.g., 2025 Market Analysis Report"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label>Topic/Description</label>
              <textarea
                placeholder="e.g., Comprehensive analysis of electric vehicle market trends in 2025"
                value={formData.topic}
                onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                rows={4}
              />
            </div>

            <div className="step-actions">
              <button className="btn-secondary" onClick={handleBack}>
                ← Back
              </button>
              <button className="btn-primary" onClick={handleNext}>
                Next →
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Structure */}
        {step === 3 && (
          <div className="step-content">
            <h2>Define Structure</h2>
            <p className="step-subtitle">
              Add {formData.document_type === 'docx' ? 'sections' : 'slides'} to your document
            </p>

            <div className="section-builder">
              <div className="add-section-form">
                <input
                  type="text"
                  placeholder={`${getSectionLabel()} title (e.g., Introduction)`}
                  value={currentSection}
                  onChange={(e) => setCurrentSection(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddSection()}
                />
                <button className="btn-primary" onClick={handleAddSection}>
                  Add {getSectionLabel()}
                </button>
              </div>

              {formData.sections.length > 0 && (
                <div className="sections-list">
                  <h4>{formData.sections.length} {getSectionLabel()}(s)</h4>
                  {formData.sections.map((section, index) => (
                    <div key={index} className="section-item">
                      <span className="section-number">{index + 1}</span>
                      <span className="section-title">{section.title}</span>
                      <div className="section-actions">
                        <button
                          className="btn-icon"
                          onClick={() => handleMoveSection(index, 'up')}
                          disabled={index === 0}
                        >
                          ↑
                        </button>
                        <button
                          className="btn-icon"
                          onClick={() => handleMoveSection(index, 'down')}
                          disabled={index === formData.sections.length - 1}
                        >
                          ↓
                        </button>
                        <button
                          className="btn-icon-danger"
                          onClick={() => handleRemoveSection(index)}
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="step-actions">
              <button className="btn-secondary" onClick={handleBack}>
                ← Back
              </button>
              <button 
                className="btn-primary" 
                onClick={handleSubmit}
                disabled={loading || formData.sections.length === 0}
              >
                {loading ? 'Creating...' : 'Create Project'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CreateProject;
