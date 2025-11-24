import apiClient from './client';

export const refinementApi = {
  // Preview refinement (doesn't save)
  previewRefinement: async (sectionId, prompt) => {
    const response = await apiClient.post(`/refinement/sections/${sectionId}/refine-preview`, {
      prompt
    });
    return response.data;
  },

  // Accept and save refinement - FIXED
  acceptRefinement: async (sectionId, prompt, content) => {
    const response = await apiClient.post(
      `/refinement/sections/${sectionId}/refine-accept`,
      {
        prompt: prompt,
        content: content
      }
    );
    return response.data;
  },

  // Refine section content (existing)
  refineSection: async (sectionId, prompt) => {
    const response = await apiClient.post(`/refinement/sections/${sectionId}/refine`, {
      prompt
    });
    return response.data;
  },

  // Get refinement history
  getRefinements: async (sectionId) => {
    const response = await apiClient.get(`/refinement/sections/${sectionId}/refinements`);
    return response.data;
  },

  // Add feedback
  addFeedback: async (sectionId, feedbackType, comment = null) => {
    const response = await apiClient.post(`/refinement/sections/${sectionId}/feedback`, {
      feedback_type: feedbackType,
      comment
    });
    return response.data;
  },

  // Get feedback
  getFeedback: async (sectionId) => {
    const response = await apiClient.get(`/refinement/sections/${sectionId}/feedback`);
    return response.data;
  },

  // Get section details with refinements and feedback
  getSectionDetails: async (sectionId) => {
    const response = await apiClient.get(`/refinement/sections/${sectionId}/details`);
    return response.data;
  },
};
