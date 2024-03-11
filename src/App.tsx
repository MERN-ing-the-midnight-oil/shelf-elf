import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import RegisterForm from './components/RegisterForm';
import LoginForm from './components/LoginForm';
import Header from './components/Header';
import LendBooks from './components/LendBooks';
import RequestBooks from './components/RequestBooks';
import ManageCommunities from './components/ManageCommunities'; // Ensure this import is correct
import LandingHeader from './components/LandingHeader';
import { useAuth } from './context/AuthContext';

function App() {
  const { token } = useAuth();
  const [refetchCounter, setRefetchCounter] = useState(0);

  useEffect(() => {
    console.log("RefetchCounter state in App.tsx changed to:", refetchCounter);
  }, [refetchCounter]);

  return (
    <Router>
      <div className="App">
        <Header />
        {token ? (
          <Routes>
            <Route path="/lend-books" element={<LendBooks token={token} setRefetchCounter={setRefetchCounter} refetchCounter={refetchCounter} />} />
            <Route path="/request-books" element={<RequestBooks token={token} setRefetchCounter={setRefetchCounter} refetchCounter={refetchCounter} />} />
            <Route path="/manage-communities" element={<ManageCommunities token={token} />} />
            <Route path="*" element={<Navigate replace to="/lend-books" />} />
          </Routes>
        ) : (
          <>
            <LandingHeader />
            <LoginForm />
            <RegisterForm />
          </>
        )}
      </div>
    </Router>
  );
}

export default App;
