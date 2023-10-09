import React from 'react';
import LendForm from './components/LendForm';

import './App.css';
import RegisterForm from './components/RegisterForm'; // Adjust the path based on your file structure
import { Typography } from '@mui/material';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>Other's Covers: A Neighborhood Book Sharing App</h1>
        <h2>Because good pensives make good neighbors.</h2>
      </header>
      
      {/* Adding Image and Sign-Up Text */}
      <img src={process.env.PUBLIC_URL + '/libraries.png'} alt="Library" style={{ width: '90%', margin: '1rem 0' }} />

      <main>
        {/* You can conditionally render these based on user navigation or other logic */}
        <h3>Sign Up:</h3>
        <RegisterForm />

        <hr style={{ margin: '2rem 0' }} /> {/* Add a divider or style as needed */}
        
        <h3>Lend a Book:</h3>
        <LendForm />
      </main>
    </div>
  );
}



export default App;
