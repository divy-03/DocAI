import { useState, useEffect } from 'react';
import EditorSidebar from './EditorSidebar';
import SectionEditor from './SectionEditor';
import { refinementApi } from '../../api/refinement';

const Editor = ({ project, onUpdate }) => {
  const [selectedSection, setSelectedSection] = useState(null);
  const [sections, setSections] = useState([]);

  useEffect(() => {
    if (project?.sections) {
      setSections(project.sections);
      if (!selectedSection && project.sections.length > 0) {
        setSelectedSection(project.sections[0].id);
      }
    }
  }, [project]);

  const handleSectionSelect = (sectionId) => {
    setSelectedSection(sectionId);
  };

  const handleRefine = async (sectionId, prompt) => {
    try {
      const updatedSection = await refinementApi.refineSection(sectionId, prompt);
      
      // Update sections with new content
      setSections(prevSections =>
        prevSections.map(section =>
          section.id === sectionId ? { ...section, content: updatedSection.content } : section
        )
      );

      if (onUpdate) {
        onUpdate();
      }

      return updatedSection;
    } catch (error) {
      throw error;
    }
  };

  const handleFeedback = async (sectionId, feedbackType, comment = null) => {
    try {
      await refinementApi.addFeedback(sectionId, feedbackType, comment);
      
      if (onUpdate) {
        onUpdate();
      }
    } catch (error) {
      throw error;
    }
  };

  // NEW: Handle manual updates (title/content edits)
  const handleManualUpdate = async () => {
    // Just trigger a refresh
    if (onUpdate) {
      await onUpdate();
    }
  };

  const selectedSectionData = sections.find(s => s.id === selectedSection);

  return (
    <div className="flex h-full bg-gray-50">
      {/* Sidebar */}
      <EditorSidebar
        sections={sections}
        selectedSection={selectedSection}
        onSectionSelect={handleSectionSelect}
        documentType={project?.document_type}
      />

      {/* Main Editor Area */}
      <div className="flex-1 overflow-y-auto">
        {selectedSectionData ? (
          <SectionEditor
            section={selectedSectionData}
            documentType={project?.document_type}
            onRefine={handleRefine}
            onFeedback={handleFeedback}
            onManualUpdate={handleManualUpdate}
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-500">Select a section to start editing</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Editor;

