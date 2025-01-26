import '../App.css'; // Import the App.css for styling

function LandingHeader() {
    return (
        <header className="App-header landing-header">  <h2 className="landing-heading">
            Game Lender
        </h2>
            <img
                src={process.env.PUBLIC_URL + '/Title.webp'}
                alt="Library"
                className="landing-title-img"
            />

            <h3 className="landing-subheading">
                Making it easy for you and your friends to list, browse, and borrow games (or books!)
            </h3>
        </header>
    );
}

// Export the LandingHeader as the default export
export default LandingHeader;
