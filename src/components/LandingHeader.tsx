import '../App.css'; // Import the App.css for styling

function LandingHeader() {
    return (
        <header className="App-header">
            <h1>Other's Covers: A Neighborhood Book Sharing App</h1>
            <h2>Because good pensives make good neighbors.</h2>
            <img src={process.env.PUBLIC_URL + '/libraries.png'} alt="Library" style={{ width: '80%', marginTop: '1rem' }} />
        </header>
    );
}

export default LandingHeader;
