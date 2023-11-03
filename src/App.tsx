import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import RegisterForm from './components/RegisterForm';
import LoginForm from './components/LoginForm';
import Dashboard from './components/Dashboard';
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
            <Route path="/" element={<Dashboard />} />
            <Route path="/lend-books" element={<LendBooks token={token} setRefetchCounter={setRefetchCounter} refetchCounter={refetchCounter} />} />
            <Route path="/request-books" element={<RequestBooks token={token} />} />
          </Routes>
        )}
      </div>
    </Router>
  );
}

export default App;
