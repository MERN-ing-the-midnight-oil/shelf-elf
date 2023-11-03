import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import RegisterForm from './components/RegisterForm';
import LoginForm from './components/LoginForm';
import Header from './components/Header';
import LendBooks from './components/LendBooks';
import RequestBooks from './components/RequestBooks';
import LandingHeader from './components/LandingHeader';
import { useAuth } from './context/AuthContext';
import { useEffect } from 'react';

const NavigateToBooks = () => {
  const navigate = useNavigate();
  const { token } = useAuth();
  const [initialRedirectDone, setInitialRedirectDone] = useState(false);

  useEffect(() => {
    // If the user is logged in (has a token) and we haven't done the initial redirect, navigate to '/lend-books'
    if (token && !initialRedirectDone) {
      navigate('/lend-books');
      setInitialRedirectDone(true); // Prevent further redirects after the initial one
    }
  }, [token, navigate, initialRedirectDone]);
  return null; // This component doesn't render anything
};

function App() {
  const { token } = useAuth();
  const [refetchCounter, setRefetchCounter] = useState(0);

  return (
    <Router>
      <div className="App">
        <Header />
        <NavigateToBooks /> {/* Use the NavigateToBooks component here */}
        {!token ? (
          <>
            <LandingHeader />
            <img src={process.env.PUBLIC_URL + '/libraries.png'} alt="Library" style={{ width: '90%', margin: '1rem 0' }} />
            <RegisterForm />
            <hr style={{ margin: '2rem 0' }} />
            <LoginForm />
          </>
        ) : (
          <Routes>
            <Route path="/lend-books" element={<LendBooks token={token} setRefetchCounter={setRefetchCounter} refetchCounter={refetchCounter} />} />
            <Route path="/request-books" element={<RequestBooks token={token} />} />
            {/* Redirect all other paths to '/lend-books' */}
            <Route path="*" element={<LendBooks token={token} setRefetchCounter={setRefetchCounter} refetchCounter={refetchCounter} />} />
          </Routes>
        )}
      </div>
    </Router>
  );
}

export default App;
