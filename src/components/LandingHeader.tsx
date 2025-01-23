import '../App.css'; // Import the App.css for styling

function LandingHeader() {
    return (
        <header className="App-header landing-header">
            <img
                src={process.env.PUBLIC_URL + '/ElfTitle.png'}
                alt="Library"
                className="landing-title-img"
            />
            <h2 className="landing-heading">
                Where your books and games can meet new friends.
            </h2>
            <h3 className="landing-subheading">
                Shelf Elf is an easy way for trusted friends to browse each other's game and book libraries.
                It's useful for bookclubs, game nights, church coffee hours, or any other regular meetup.
            </h3>
            <img
                src={process.env.PUBLIC_URL + '/BlordGameOxes.png'}
                alt="Library"
                className="landing-image"
            />
        </header>
    );
}

// Export the LandingHeader as the default export
export default LandingHeader;
