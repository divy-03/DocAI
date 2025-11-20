import apiClient from './client';

export const generationApi = {
  // Generate content for entire project
  generateProject: async (projectId) => {
    const response = await apiClient.post(`/generation/projects/${projectId}/generate`);
    return response.data;
  },

  // Regenerate content for specific section
  regenerateSection: async (projectId, sectionId) => {
    const response = await apiClient.post(
      `/generation/projects/${projectId}/generate/${sectionId}`
    );
    return response.data;
  },

  // Generate outline using AI
  generateOutline: async (topic, documentType, sectionCount = 5) => {
    const response = await apiClient.post('/generation/outline/generate', null, {
      params: { topic, document_type: documentType, section_count: sectionCount }
    });
    return response.data;
  },
};
