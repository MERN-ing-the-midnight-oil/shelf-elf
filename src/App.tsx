//App.tsx

import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import RegisterForm from './components/RegisterForm';
import LoginForm from './components/LoginForm';
import Header from './components/Header';
import LendBooks from './components/LendBooks';
import RequestBooks from './components/RequestBooks';
import LandingHeader from './components/LandingHeader';
import ManageCommunities from './components/ManageCommunities';
import { useAuth } from './context/AuthContext';

function App() {
  const { token } = useAuth();
  const [refetchCounter, setRefetchCounter] = useState(0);
  //troubleshooting state flow from available books to app.tsx, to request books to myrequestedbooks
  useEffect(() => {
    console.log("The RefetchCounter state in App.tsx just changed to:", refetchCounter);
  }, [refetchCounter]);

  return (
    <Router>
      <div className="App">
        <Header />
        {token ? (
          <Routes>
            {/* Routes for logged-in users */}
            <Route path="/lend-books" element={<LendBooks token={token} setRefetchCounter={setRefetchCounter} refetchCounter={refetchCounter} />} />
            <Route path="/request-books" element={<RequestBooks token={token} setRefetchCounter={setRefetchCounter} refetchCounter={refetchCounter} />} />
            <Route path="/manage-communities" element={<ManageCommunities token={token} setRefetchCounter={setRefetchCounter} />} />

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
