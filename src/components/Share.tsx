import React from "react";

const shareApp = () => {
    if (navigator.share) {
        navigator.share({
            title: "Check out Game Lender!",
            text: "Join me in lending and borrowing board games!",
            url: window.location.href,
        })
            .then(() => console.log("✅ Shared successfully"))
            .catch((error) => console.error("❌ Error sharing:", error));
    } else {
        alert("Sharing is not supported on this browser.");
    }
};

const copyToClipboard = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url)
        .then(() => alert("✅ Link copied! Share it with friends."))
        .catch((error) => console.error("❌ Failed to copy:", error));
};

const Share: React.FC = () => {
    return (
        <div style={{ textAlign: "center", marginTop: "20px" }}>
            <button onClick={shareApp} style={{ margin: "10px", padding: "10px 15px", fontSize: "16px" }}>
                📤 Share This App
            </button>
            <button onClick={copyToClipboard} style={{ margin: "10px", padding: "10px 15px", fontSize: "16px" }}>
                📋 Copy Link
            </button>
            <a href={`https://twitter.com/intent/tweet?text=Join%20me%20on%20Game%20Lender!&url=${encodeURIComponent(window.location.href)}`} target="_blank" rel="noopener noreferrer">
                <button style={{ margin: "10px", padding: "10px 15px", fontSize: "16px" }}>🐦 Share on Twitter</button>
            </a>
        </div>
    );
};

export default Share;
