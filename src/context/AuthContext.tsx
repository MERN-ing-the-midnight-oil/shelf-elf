// Importing necessary React hooks and context API functions
import React, { createContext, useContext, useState } from 'react';

// Define an interface for a User object. You can extend this interface to include other user properties as necessary
interface User {
  id: string;
  username: string;
  // ...add any other user properties you need
}

// Define the shape of the context with an interface. This interface now includes both token and user, along with their respective setter functions
interface AuthContextProps {
  token: string | null; // The current auth token, or null if not logged in
  setToken: React.Dispatch<React.SetStateAction<string | null>>; // Function to update the auth token
  user: User | null; // The current user object, or null if not logged in
  setUser: React.Dispatch<React.SetStateAction<User | null>>; // Function to update the user object
}

// Create the context with the defined interface. The context will be undefined outside of the AuthProvider
const AuthContext = createContext<AuthContextProps | undefined>(undefined);

// AuthProvider component to wrap around parts of the app that need access to the auth context
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(null); // State to hold the auth token
  const [user, setUser] = useState<User | null>(null); // State to hold the user object

  // Provide the auth context values (token, setToken, user, setUser) to children components
  return (
    <AuthContext.Provider value={{ token, setToken, user, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the auth context. This hook can be used in any functional component that needs access to the auth context
export const useAuth = (): AuthContextProps => {
  const context = useContext(AuthContext); // Access the context
  // Throw an error if the context is not accessible (i.e., the component using the hook is not wrapped with AuthProvider)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  // Return the context so it can be used by the component
  return context;
};
