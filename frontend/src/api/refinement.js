import apiClient from './client';

export const refinementApi = {
  // Refine section content
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
