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
                Where your favorite books and games meet new people.
            </h2>
            <h3 className="landing-subheading">
                Shelf Elf is an easy way for your social group to borrow and lend favorite books and games.
                It's great for bookclubs, regular game nights, church coffee hours, or any other social group
                that meets up on a regular basis.
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
