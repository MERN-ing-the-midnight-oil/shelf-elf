import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import RegisterForm from './components/RegisterForm';
import LoginForm from './components/LoginForm';
import Header from './components/Header';
import LendBooks from './components/LendBooks';
import RequestBooks from './components/RequestBooks';
import ManageCommunities from './components/ManageCommunities';
import LandingHeader from './components/LandingHeader';
import Messages from './components/Messages'; // Added import for Messages component
import { useAuth } from './context/AuthContext';
import CommunitiesTable from './components/CommunitiesTable';
import AdminDashboard from './components/AdminDashboard';


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
            <Route path="/messages" element={<Messages token={token} />} />
            <Route path="/admin/communities" element={<CommunitiesTable />} /> {/* Moved to main Routes */}
            <Route path="*" element={<Navigate replace to="/manage-communities" />} />
            <Route path="/admin-dashboard" element={<AdminDashboard />} />
          </Routes>

        ) : (
          <div className="landing-container">
            <LandingHeader />
            <LoginForm />
            <RegisterForm />
          </div>
        )}
      </div>
    </Router>
  );
}

export default App;
