// src/App.tsx
import './App.css';
import RegisterForm from './components/RegisterForm';
import LoginForm from './components/LoginForm';
import Dashboard from './components/Dashboard';
import LandingHeader from './components/LandingHeader';
import { useAuth } from './context/AuthContext';

function App() {
  const { token } = useAuth();
  console.log('Token in App component:', token);
  return (
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
        <>
          <Dashboard />
          <hr style={{ margin: '2rem 0' }} />
        </>
      )}
    </div>
  );

}

export default App;
