import '../App.css'; // Import the App.css for styling

function LandingHeader() {
    return (
        <header className="App-header">
            <h1>Bellingham Buy Nothing Books</h1>
            <h2>Where your favorite books meet new people</h2>
            <h3>It's like a 'little free library' but without all the random, weird, and outdated discards. Plus, it's up to you to lend your favorite books for a week, a month, or a year. The person borrowing them promises not to read in the tub.</h3>
            <img src={process.env.PUBLIC_URL + '/libraries.png'} alt="Library" style={{ width: '80%', marginTop: '1rem' }} />
        </header>
    );
}

export default LandingHeader;
