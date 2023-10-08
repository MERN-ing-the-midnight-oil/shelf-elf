import React from 'react';
import './App.css';
import RegisterForm from './components/RegisterForm'; // Adjust the path based on your file structure

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>Others-Covers: Good Neighbors sharing Good Reads!</h1>
      </header>
      <main>
        <RegisterForm />
      </main>
    </div>
  );
}

export default App;
