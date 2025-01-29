import React, { useState, useEffect } from "react";
import { TextField, Button, Typography, CircularProgress, Container } from "@mui/material";
import { styled } from "@mui/system";
import BarcodeScanner from "./BarcodeScanner";

const GameItem = styled("div")({
    display: "flex",
    flexDirection: "column",
    alignItems: "start",
    width: "100%",
    margin: "10px 0",
    borderBottom: "1px solid #ccc",
    paddingBottom: "10px",
});

interface LendFormGamesProps {
    token: string;
    setRefetchCounter: React.Dispatch<React.SetStateAction<number>>;
    refetchCounter: number;
}

const cleanScannerTitle = (title: string): string => {
    // Remove "Board Game", "Board", and "Game" (case-insensitive)
    return title
        .replace(/\b(Board Game|Board|Game)\b/gi, "") // Remove target words
        .trim(); // Remove extra spaces
};

const LendFormGames: React.FC<LendFormGamesProps> = ({ token, setRefetchCounter, refetchCounter }) => {
    const [isScannerOpen, setIsScannerOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [games, setGames] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isFetchingTitle, setIsFetchingTitle] = useState(false);

    useEffect(() => {
        const delayDebounce = setTimeout(() => {
            if (searchTerm) {
                console.log("Debounced search term:", searchTerm); // Add this
                handleSearch(searchTerm);
            }
        }, 500);

        return () => clearTimeout(delayDebounce);
    }, [searchTerm]);


    const handleSearch = async (title: string) => {
        console.log("handleSearch called with title:", title); // Add this
        setIsLoading(true);
        const API_URL = process.env.REACT_APP_BACKEND_URL || "http://localhost:5001";
        try {
            const response = await fetch(`${API_URL}/api/games/search?title=${title}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });
            if (!response.ok) throw new Error("Network response was not ok");

            const data = await response.json();
            console.log("Search results received from backend:", data); // Add this
            setGames(data);
        } catch (error) {
            console.error("Error searching games:", error);
        } finally {
            setIsLoading(false);
        }
    };


    const handleBarcodeDetected = async (barcode: string) => {
        console.log("Detected barcode:", barcode);

        const API_URL = process.env.REACT_APP_BACKEND_URL || "http://localhost:5001";

        try {
            setIsFetchingTitle(true);
            const response = await fetch(`${API_URL}/api/barcodes/lookup?barcode=${barcode}`, {
                method: "GET",
                headers: { "Content-Type": "application/json" },
            });

            if (!response.ok) {
                throw new Error("Failed to fetch game title");
            }

            const data = await response.json();
            if (data?.title) {
                console.log("Fetched game title:", data.title);
                setSearchTerm(data.title); // Logs search term before triggering search
            } else {
                console.warn("No title found for this barcode");
                alert("Unable to find a game for the scanned barcode. Please enter it manually.");
            }
        } catch (error) {
            console.error("Error fetching barcode information:", error);
            alert("An error occurred while looking up the barcode.");
        } finally {
            setIsFetchingTitle(false);
            setIsScannerOpen(false);
        }
    };

    const offerToLend = async (game: any) => {
        console.log("Game selected for lending:", game); // Log the game object
        const gameId = game._id || game.bggId; // Adjust based on backend expectations
        console.log("Game ID being sent to backend:", gameId);

        const API_URL = process.env.REACT_APP_BACKEND_URL || "http://localhost:5001";
        const requestOptions = {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ gameId }),
        };

        try {
            const response = await fetch(`${API_URL}/api/games/lend`, requestOptions);
            if (response.ok) {
                setRefetchCounter((prev) => prev + 1); // Refresh lending library
                setGames([]); // Clear search results
            } else {
                const errorMessage = await response.json();
                console.error("Backend error message:", errorMessage); // Log backend error
                alert(errorMessage.message);
            }
        } catch (error) {
            console.error("Error offering game to lend:", error);
        }
    };



    return (
        <Container maxWidth="sm">
            <Typography variant="h5" gutterBottom>
                Add board game titles to your lending shelf:
            </Typography>
            <TextField
                fullWidth
                label="Game Title"
                variant="outlined"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Type a game title"
                margin="normal"
            />
            {isFetchingTitle && <CircularProgress size={24} style={{ margin: "10px 0" }} />}
            <Button
                variant="contained"
                color="secondary"
                style={{ marginTop: 10, marginBottom: 20 }}
                onClick={() => setIsScannerOpen(true)}
            >
                SCAN BARCODE
            </Button>

            {isScannerOpen && (
                <BarcodeScanner
                    open={isScannerOpen}
                    onClose={() => setIsScannerOpen(false)}
                    onDetected={handleBarcodeDetected}
                />
            )}

            {isLoading && <CircularProgress />}

            {games.map((game) => {
                console.log(
                    `Game title: ${game.title}, Image URL: ${game.thumbnailUrl || "No Image Found"}`
                ); // ✅ Log each game title and its image URL

                return (
                    <GameItem key={game._id || game.bggId}>
                        {game.thumbnailUrl ? (
                            <img
                                src={game.thumbnailUrl}
                                alt={game.title}
                                style={{ maxWidth: "100%", marginBottom: "10px" }}
                            />
                        ) : (
                            <Typography variant="body2" color="error">
                                No Image Available
                            </Typography>
                        )}
                        <Typography variant="h6" component="p">
                            {game.title}
                        </Typography>
                        <Button variant="contained" color="primary" onClick={() => offerToLend(game)}>
                            Offer to Lend
                        </Button>
                    </GameItem>
                );
            })}
        </Container>
    );

};

export default LendFormGames;
