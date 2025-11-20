import apiClient from './client';

export const projectsApi = {
  // Get all projects
  getAll: async () => {
    const response = await apiClient.get('/projects');
    return response.data;
  },

  // Get single project
  getById: async (id) => {
    const response = await apiClient.get(`/projects/${id}`);
    return response.data;
  },

  // Create project
  create: async (projectData) => {
    const response = await apiClient.post('/projects', projectData);
    return response.data;
  },

  // Update project
  update: async (id, projectData) => {
    const response = await apiClient.put(`/projects/${id}`, projectData);
    return response.data;
  },

  // Delete project
  delete: async (id) => {
    const response = await apiClient.delete(`/projects/${id}`);
    return response.data;
  },
};
