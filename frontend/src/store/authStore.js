import { create } from 'zustand';
import apiClient from '../api/client';

const useAuthStore = create((set) => ({
  user: null,
  token: localStorage.getItem('access_token') || null,
  loading: false,
  error: null,

  register: async (userData) => {
    set({ loading: true, error: null });
    try {
      const response = await apiClient.post('/auth/register', userData);
      set({ loading: false });
      return response.data;
    } catch (error) {
      set({ 
        loading: false, 
        error: error.response?.data?.detail || 'Registration failed' 
      });
      throw error;
    }
  },

  login: async (username, password) => {
    set({ loading: true, error: null });
    try {
      const formData = new FormData();
      formData.append('username', username);
      formData.append('password', password);

      const response = await apiClient.post('/auth/login', formData, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });

      const { access_token } = response.data;
      localStorage.setItem('access_token', access_token);
      
      // Fetch user data
      const userResponse = await apiClient.get('/auth/me');
      
      set({ 
        token: access_token, 
        user: userResponse.data, 
        loading: false 
      });
      
      return response.data;
    } catch (error) {
      set({ 
        loading: false, 
        error: error.response?.data?.detail || 'Login failed' 
      });
      throw error;
    }
  },

  logout: () => {
    localStorage.removeItem('access_token');
    set({ user: null, token: null });
  },

  fetchUser: async () => {
    const token = localStorage.getItem('access_token');
    if (!token) return;

    set({ loading: true });
    try {
      const response = await apiClient.get('/auth/me');
      set({ user: response.data, loading: false });
    } catch (error) {
      set({ loading: false });
      localStorage.removeItem('access_token');
    }
  },
}));

export default useAuthStore;
