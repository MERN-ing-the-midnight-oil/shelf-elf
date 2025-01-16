import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

interface User {
  _id: string;
  username: string;
  role?: string; // Add role for admin detection
}

interface AuthContextProps {
  token: string | null;
  setToken: React.Dispatch<React.SetStateAction<string | null>>;
  user: User | null;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  isAdmin: boolean; // Derived flag to check if user is admin
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(localStorage.getItem('userToken'));
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      if (token) {
        try {
          const API_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5001';
          const config = { headers: { Authorization: `Bearer ${token}` } };
          const response = await axios.get(`${API_URL}/api/users/me`, config);
          setUser(response.data); // Ensure server response includes user role
        } catch (error) {
          console.error('Error fetching user data:', error);
          setToken(null);
          localStorage.removeItem('userToken');
        }
      }
    };

    fetchUser();
  }, [token]);

  const isAdmin = user?.role === 'admin';

  return (
    <AuthContext.Provider value={{ token, setToken, user, setUser, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextProps => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
