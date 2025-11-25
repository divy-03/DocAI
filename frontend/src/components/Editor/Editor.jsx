import { useState } from 'react';
import EditorSidebar from './EditorSidebar.jsx';
import SectionEditor from './SectionEditor';
import RightSidebar from './RightSidebar';
import { refinementApi } from '../../api/refinement';

const Editor = ({ project, onUpdate }) => {
  const [selectedSectionIndex, setSelectedSectionIndex] = useState(0);
  const [isLeftSidebarOpen, setIsLeftSidebarOpen] = useState(true);
  const [isRightSidebarOpen, setIsRightSidebarOpen] = useState(false);
  const [rightSidebarView, setRightSidebarView] = useState('refinement');

  const selectedSection = project?.sections?.[selectedSectionIndex];

  const handleSectionSelect = (index) => {
    setSelectedSectionIndex(index);
  };

  const handleFeedback = async (sectionId, feedbackType, comment = '') => {
    try {
      await refinementApi.submitFeedback(sectionId, feedbackType, comment);
      if (onUpdate) onUpdate();
    } catch (err) {
      console.error('Failed to submit feedback:', err);
      throw err;
    }
  };

  const handleManualUpdate = (sectionId, updates) => {
    if (onUpdate) onUpdate();
  };

  const handleOpenRefinement = () => {
    setRightSidebarView('refinement');
    setIsRightSidebarOpen(true);
  };

  const handleOpenHistory = () => {
    setRightSidebarView('history');
    setIsRightSidebarOpen(true);
  };

  const handleOpenComments = () => {
    setRightSidebarView('comments');
    setIsRightSidebarOpen(true);
  };

  return (
    <div className="flex h-[calc(99dvh-theme(spacing.36))]">
      {/* Left Sidebar */}
      <EditorSidebar
        isOpen={isLeftSidebarOpen}
        onToggle={() => setIsLeftSidebarOpen(!isLeftSidebarOpen)}
        sections={project?.sections || []}
        selectedIndex={selectedSectionIndex}
        onSelectSection={handleSectionSelect}
        documentType={project?.document_type}
      />

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto bg-mocha-base dark:bg-mocha-base light:bg-latte-base">
        {selectedSection ? (
          <SectionEditor
            section={selectedSection}
            documentType={project?.document_type}
            onFeedback={handleFeedback}
            onManualUpdate={handleManualUpdate}
            onOpenRefinement={handleOpenRefinement}
            onOpenHistory={handleOpenHistory}
            onOpenComments={handleOpenComments}
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-mocha-overlay0 dark:text-mocha-overlay0 light:text-latte-overlay0">
              No section selected
            </p>
          </div>
        )}
      </div>

      {/* Right Sidebar */}
      <RightSidebar
        isOpen={isRightSidebarOpen}
        onToggle={() => setIsRightSidebarOpen(!isRightSidebarOpen)}
        view={rightSidebarView}
        onViewChange={setRightSidebarView}
        section={selectedSection}
        onManualUpdate={handleManualUpdate}
      />
    </div>
  );
};

export default Editor;

