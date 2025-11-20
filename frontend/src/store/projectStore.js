import { create } from 'zustand';
import { projectsApi } from '../api/projects';

const useProjectStore = create((set, get) => ({
  projects: [],
  currentProject: null,
  loading: false,
  error: null,

  fetchProjects: async () => {
    set({ loading: true, error: null });
    try {
      const projects = await projectsApi.getAll();
      set({ projects, loading: false });
    } catch (error) {
      set({ 
        loading: false, 
        error: error.response?.data?.detail || 'Failed to fetch projects' 
      });
    }
  },

  fetchProject: async (id) => {
    set({ loading: true, error: null });
    try {
      const project = await projectsApi.getById(id);
      set({ currentProject: project, loading: false });
      return project;
    } catch (error) {
      set({ 
        loading: false, 
        error: error.response?.data?.detail || 'Failed to fetch project' 
      });
      throw error;
    }
  },

  createProject: async (projectData) => {
    set({ loading: true, error: null });
    try {
      const newProject = await projectsApi.create(projectData);
      set({ 
        projects: [newProject, ...get().projects],
        loading: false 
      });
      return newProject;
    } catch (error) {
      set({ 
        loading: false, 
        error: error.response?.data?.detail || 'Failed to create project' 
      });
      throw error;
    }
  },

  updateProject: async (id, projectData) => {
    set({ loading: true, error: null });
    try {
      const updatedProject = await projectsApi.update(id, projectData);
      set({
        projects: get().projects.map(p => p.id === id ? updatedProject : p),
        currentProject: updatedProject,
        loading: false
      });
      return updatedProject;
    } catch (error) {
      set({ 
        loading: false, 
        error: error.response?.data?.detail || 'Failed to update project' 
      });
      throw error;
    }
  },

  deleteProject: async (id) => {
    set({ loading: true, error: null });
    try {
      await projectsApi.delete(id);
      set({
        projects: get().projects.filter(p => p.id !== id),
        loading: false
      });
    } catch (error) {
      set({ 
        loading: false, 
        error: error.response?.data?.detail || 'Failed to delete project' 
      });
      throw error;
    }
  },
}));

export default useProjectStore;
