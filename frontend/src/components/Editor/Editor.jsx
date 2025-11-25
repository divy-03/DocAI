import { useState, useEffect } from 'react';
import EditorSidebar from './EditorSidebar';
import SectionEditor from './SectionEditor';
import RightSidebar from './RightSidebar';
import { refinementApi } from '../../api/refinement';

const Editor = ({ project, onUpdate }) => {
  const [selectedSection, setSelectedSection] = useState(null);
  const [sections, setSections] = useState([]);
  const [leftSidebarOpen, setLeftSidebarOpen] = useState(true);
  const [rightSidebarOpen, setRightSidebarOpen] = useState(false);
  const [rightSidebarView, setRightSidebarView] = useState('refinement'); // 'refinement' or 'history'

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
      
      setSections(prevSections =>
        prevSections.map(section =>
          section.id === sectionId ? { ...section, content: updatedSection.content } : section
        )
      );
      return updatedSection;
    } catch (error) {
      throw error;
    }
  };

  const handleFeedback = async (sectionId, feedbackType, comment = null) => {
    try {
      await refinementApi.addFeedback(sectionId, feedbackType, comment);
    } catch (error) {
      throw error;
    }
  };

  const handleManualUpdate = (sectionId, updates) => {
    setSections(prevSections =>
      prevSections.map(section =>
        section.id === sectionId ? { ...section, ...updates } : section
      )
    );
  };

  const openRefinement = () => {
    setRightSidebarView('refinement');
    setRightSidebarOpen(true);
  };

  const openHistory = () => {
    setRightSidebarView('history');
    setRightSidebarOpen(true);
  };

  const selectedSectionData = sections.find(s => s.id === selectedSection);

  return (
    <div className="flex h-full bg-mocha-base dark:bg-mocha-base light:bg-latte-base">
      {/* Left Sidebar - Sections */}
      <EditorSidebar
        sections={sections}
        selectedSection={selectedSection}
        onSectionSelect={handleSectionSelect}
        documentType={project?.document_type}
        isOpen={leftSidebarOpen}
        onToggle={() => setLeftSidebarOpen(!leftSidebarOpen)}
      />

      {/* Main Editor Area */}
      <div className="flex-1 overflow-y-auto relative">
        {/* Left sidebar toggle button when closed */}
        {!leftSidebarOpen && (
          <button
            onClick={() => setLeftSidebarOpen(true)}
            className="fixed left-0 top-1/2 -translate-y-1/2 z-10 p-2 bg-mocha-surface0 dark:bg-mocha-surface0 light:bg-latte-surface0 text-mocha-text dark:text-mocha-text light:text-latte-text rounded-r-lg border border-l-0 border-mocha-surface2 dark:border-mocha-surface2 light:border-latte-surface2 hover:bg-mocha-surface1 dark:hover:bg-mocha-surface1 light:hover:bg-latte-surface1 transition-colors shadow-lg"
          >
            <span className="text-xl">→</span>
          </button>
        )}

        {/* Right sidebar toggle button when closed */}
        {!rightSidebarOpen && (
          <button
            onClick={() => setRightSidebarOpen(true)}
            className="fixed right-0 top-1/2 -translate-y-1/2 z-10 p-2 bg-mocha-surface0 dark:bg-mocha-surface0 light:bg-latte-surface0 text-mocha-text dark:text-mocha-text light:text-latte-text rounded-l-lg border border-r-0 border-mocha-surface2 dark:border-mocha-surface2 light:border-latte-surface2 hover:bg-mocha-surface1 dark:hover:bg-mocha-surface1 light:hover:bg-latte-surface1 transition-colors shadow-lg"
          >
            <span className="text-xl">←</span>
          </button>
        )}

        {selectedSectionData ? (
          <SectionEditor
            section={selectedSectionData}
            documentType={project?.document_type}
            onRefine={handleRefine}
            onFeedback={handleFeedback}
            onManualUpdate={handleManualUpdate}
            onOpenRefinement={openRefinement}
            onOpenHistory={openHistory}
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-mocha-overlay0 dark:text-mocha-overlay0 light:text-latte-overlay0">
              Select a section to start editing
            </p>
          </div>
        )}
      </div>

      {/* Right Sidebar - Refinement/History */}
      <RightSidebar
        isOpen={rightSidebarOpen}
        onToggle={() => setRightSidebarOpen(!rightSidebarOpen)}
        view={rightSidebarView}
        onViewChange={setRightSidebarView}
        section={selectedSectionData}
        onRefine={handleRefine}
        onManualUpdate={handleManualUpdate}
      />
    </div>
  );
};

export default Editor;
