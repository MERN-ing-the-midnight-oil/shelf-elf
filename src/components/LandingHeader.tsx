import '../App.css'; // Import the App.css for styling

function LandingHeader() {
    return (
        <header className="App-header">
            <h1>Shelf Elf</h1>
            <h2>Where your favorite books and games meet new people.</h2>
            <h3>Shelf Elf is an easy way for your social group to borrow and lend favorite books and games. It's great for bookclubs, regular game nights, church coffee hours, or any other social group that meets up on a regular basis.</h3>
            <img src={process.env.PUBLIC_URL + '/BlordGameOxes.png'} alt="Library" style={{ width: '80%', marginTop: '1rem' }} />
        </header>
    );
}

export default LandingHeader;
