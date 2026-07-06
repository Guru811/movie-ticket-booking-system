import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Movie, Theatre, Show, Booking, Review, Coupon } from '../types';

interface AppContextType {
  user: User | null;
  token: string | null;
  movies: Movie[];
  theatres: Theatre[];
  selectedCity: string;
  setSelectedCity: (city: string) => void;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  register: (name: string, email: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  updateProfile: (name: string, email: string, profilePic?: string) => Promise<boolean>;
  changePassword: (oldPassword: string, newPassword: string) => Promise<{ success: boolean; message: string }>;
  toggleFavourite: (movieId: string) => Promise<void>;
  isFavourite: (movieId: string) => boolean;
  refreshData: () => Promise<void>;
  apiFetch: (endpoint: string, options?: RequestInit) => Promise<any>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('ticket_token'));
  const [movies, setMovies] = useState<Movie[]>([]);
  const [theatres, setTheatres] = useState<Theatre[]>([]);
  const [selectedCity, setSelectedCity] = useState<string>('Mumbai');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const apiFetch = async (endpoint: string, options: RequestInit = {}) => {
    const headers = {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    };

    const response = await fetch(endpoint, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.message || `API error: ${response.status}`);
    }

    return response.json();
  };

  const refreshData = async () => {
    try {
      const moviesData = await apiFetch('/api/movies');
      const theatresData = await apiFetch('/api/theatres');
      setMovies(moviesData);
      setTheatres(theatresData);
    } catch (e) {
      console.error('Failed to prefetch data', e);
    }
  };

  // Sync token & fetch profile
  useEffect(() => {
    const initAuth = async () => {
      if (token) {
        localStorage.setItem('ticket_token', token);
        try {
          const res = await apiFetch('/api/auth/profile');
          setUser(res.user);
        } catch (e) {
          console.error('Session expired or invalid', e);
          logout();
        }
      } else {
        localStorage.removeItem('ticket_token');
        setUser(null);
      }
      setIsLoading(false);
    };

    initAuth();
  }, [token]);

  // Periodic and initial data fetch
  useEffect(() => {
    refreshData();
  }, [token]);

  const login = async (email: string, password: string) => {
    try {
      const res = await apiFetch('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      setToken(res.token);
      setUser(res.user);
      return { success: true };
    } catch (error: any) {
      return { success: false, message: error.message };
    }
  };

  const register = async (name: string, email: string) => {
    try {
      // Simulate/register with a default initial password 'admin123' or custom
      const res = await apiFetch('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({ name, email, password: 'admin123' }), // Simplify registration for testing
      });
      setToken(res.token);
      setUser(res.user);
      return { success: true };
    } catch (error: any) {
      return { success: false, message: error.message };
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('ticket_token');
  };

  const updateProfile = async (name: string, email: string, profilePic?: string) => {
    try {
      const res = await apiFetch('/api/auth/profile', {
        method: 'PUT',
        body: JSON.stringify({ name, email, profilePic }),
      });
      setUser(res.user);
      return true;
    } catch (e) {
      console.error(e);
      return false;
    }
  };

  const changePassword = async (oldPassword: string, newPassword: string) => {
    try {
      const res = await apiFetch('/api/auth/password', {
        method: 'PUT',
        body: JSON.stringify({ oldPassword, newPassword }),
      });
      return { success: true, message: res.message };
    } catch (error: any) {
      return { success: false, message: error.message };
    }
  };

  const toggleFavourite = async (movieId: string) => {
    if (!user) return;
    try {
      const res = await apiFetch('/api/auth/favourites', {
        method: 'POST',
        body: JSON.stringify({ movieId }),
      });
      setUser(prev => prev ? { ...prev, favourites: res.favourites } : null);
    } catch (e) {
      console.error(e);
    }
  };

  const isFavourite = (movieId: string) => {
    return user?.favourites?.includes(movieId) || false;
  };

  return (
    <AppContext.Provider
      value={{
        user,
        token,
        movies,
        theatres,
        selectedCity,
        setSelectedCity,
        isLoading,
        login,
        register,
        logout,
        updateProfile,
        changePassword,
        toggleFavourite,
        isFavourite,
        refreshData,
        apiFetch,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
