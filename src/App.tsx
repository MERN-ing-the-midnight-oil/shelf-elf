import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import RegisterForm from './components/RegisterForm';
import LoginForm from './components/LoginForm';
import Share from "./components/Share"; // ✅ Import the Share component


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
  const { user, token } = useAuth(); // Now, user and token are available
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

            <Route
              path="/lend-books"
              element={
                <LendBooks
                  token={token}
                  setRefetchCounter={setRefetchCounter}
                  refetchCounter={refetchCounter}
                />
              }
            />
            <Route
              path="/request-books"
              element={
                <RequestBooks
                  token={token}
                  setRefetchCounter={setRefetchCounter}
                  refetchCounter={refetchCounter}
                />
              }
            />
            <Route
              path="/manage-communities"
              element={<ManageCommunities token={token!} userId={user?._id || ''} />}
            />



            <Route
              path="/messages"
              element={<Messages token={token} />}
            />
            <Route
              path="/admin/communities"
              element={<AdminDashboard token={token} />}
            />
            <Route
              path="/admin-dashboard"
              element={<AdminDashboard token={token} />}
            />
            <Route
              path="*"
              element={<Navigate replace to="/manage-communities" />}
            />
          </Routes>


        ) : (
          <div className="landing-container">
            <LandingHeader />
            <RegisterForm />
            <LoginForm />
            <p style={{ fontSize: '18px', fontWeight: 'bold', marginTop: '10px', color: '#333' }}>
              ⬇️ You are here ⬇️
            </p>
            <img
              src="/GameLenderQR.png"
              alt="Game Lender QR Code"
              style={{ display: 'block', margin: '20px auto', maxWidth: '100%', height: 'auto' }}
            />
            <p style={{ fontSize: '18px', fontWeight: 'bold', marginTop: '10px', color: '#333' }}>
              ⬆️ Scan to Share ⬆️
            </p>
            <Share />
          </div>

        )}
      </div>
    </Router>
  );
}

export default App;
