import api from './api';

// Types
export interface RegisterData {
  name: string;
  email: string;
  phone: string;
  password: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface User {
  _id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  address?: string;
  teams?: string[];
  favoriteLocations?: string[];
  createdAt: string;
}

// Auth service functions
const authService = {
  // Register a new user
  register: async (userData: RegisterData) => {
    try {
      const response = await api.post('/auth/register', userData);
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.data || response.data.user));
      }
      return {
        token: response.data.token,
        user: response.data.data || response.data.user
      };
    } catch (error: any) {
      console.error('Registration error:', error.response?.data || error.message);
      throw error;
    }
  },

  // Login user
  login: async (userData: LoginData) => {
    try {
      const response = await api.post('/auth/login', userData);
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.data || response.data.user));
      }
      return {
        token: response.data.token,
        user: response.data.data || response.data.user
      };
    } catch (error: any) {
      console.error('Login error:', error.response?.data || error.message);
      throw error;
    }
  },

  // Logout user
  logout: async () => {
    const res = await api.get('/auth/logout'); // send token first
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    return res;
  },

  // Get current user
  getCurrentUser: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },

  // Update user details
  updateDetails: async (userData: Partial<User>) => {
    const response = await api.put('/auth/updatedetails', userData);
    if (response.data.user) {
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  // Update password
  updatePassword: async (passwordData: { currentPassword: string; newPassword: string }) => {
    const response = await api.put('/auth/updatepassword', passwordData);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
    }
    return response.data;
  },

  // Check if user is logged in
  isLoggedIn: () => {
    return localStorage.getItem('token') !== null;
  },

  // Get user from local storage
  getUser: (): User | null => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },
};

export default authService;