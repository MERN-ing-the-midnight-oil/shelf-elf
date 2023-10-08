import React from 'react';
import './App.css';
import RegisterForm from './components/RegisterForm'; // Adjust the path based on your file structure
import { Typography } from '@mui/material';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>Other's Covers: A Neighborhood Book Sharing App</h1>
      </header>
      
      {/* Adding Image and Sign-Up Text */}
      <img src={process.env.PUBLIC_URL + '/libraries.png'} alt="Library" style={{ width: '90%', margin: '1rem 0' }} />
 

      <main>
        <RegisterForm />
      </main>
    </div>
  );
}

export default App;
