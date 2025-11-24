import apiClient from './client';

export const sectionsApi = {
  // Update section manually
  updateSection: async (sectionId, data) => {
    const response = await apiClient.put(`/sections/${sectionId}`, data);
    return response.data;
  },
};
