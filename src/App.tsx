import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import RegisterForm from './components/RegisterForm';
import LoginForm from './components/LoginForm';
import Header from './components/Header';
import LendBooks from './components/LendBooks';
import RequestBooks from './components/RequestBooks';
import LandingHeader from './components/LandingHeader';
import { useAuth } from './context/AuthContext';

function App() {
  const { token } = useAuth();
  const [refetchCounter, setRefetchCounter] = useState(0);

  return (
    <Router>
      <div className="App">
        <Header />
        {token ? (
          <Routes>
            {/* Routes for logged-in users */}
            <Route path="/lend-books" element={<LendBooks token={token} setRefetchCounter={setRefetchCounter} refetchCounter={refetchCounter} />} />
            <Route path="/request-books" element={<RequestBooks token={token} />} />
            {/* Redirect any other path to "/lend-books" */}
            <Route path="*" element={<Navigate replace to="/lend-books" />} />
          </Routes>
        ) : (
          <>
            {/* Routes for non-logged-in users */}
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
