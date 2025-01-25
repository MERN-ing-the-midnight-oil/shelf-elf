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

const LendFormGames: React.FC<LendFormGamesProps> = ({ token, setRefetchCounter, refetchCounter }) => {
    const [isScannerOpen, setIsScannerOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [games, setGames] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isFetchingTitle, setIsFetchingTitle] = useState(false); // NEW: Spinner for fetching game title

    useEffect(() => {
        const delayDebounce = setTimeout(() => {
            if (searchTerm) {
                handleSearch(searchTerm);
            }
        }, 500);

        return () => clearTimeout(delayDebounce);
    }, [searchTerm]);

    const handleSearch = async (title: string) => {
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
            setIsFetchingTitle(true); // Start spinner while fetching
            const response = await fetch(`${API_URL}/api/barcodes/lookup?barcode=${barcode}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                },
            });

            if (!response.ok) {
                throw new Error("Failed to fetch game title");
            }

            const data = await response.json();
            if (data?.title) {
                console.log("Fetched game title:", data.title);
                setSearchTerm(data.title); // Automatically trigger search
            } else {
                console.warn("No title found for this barcode");
                alert("Unable to find a game for the scanned barcode. Please enter it manually.");
            }
        } catch (error) {
            console.error("Error fetching barcode information:", error);
            alert("An error occurred while looking up the barcode.");
        } finally {
            setIsFetchingTitle(false); // Stop spinner
            setIsScannerOpen(false); // Close scanner
        }
    };

    const offerToLend = async (game: any) => {
        const API_URL = process.env.REACT_APP_BACKEND_URL || "http://localhost:5001";
        const requestOptions = {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ gameId: game._id }),
        };

        try {
            const response = await fetch(`${API_URL}/api/games/lend`, requestOptions);
            if (response.ok) {
                setRefetchCounter((prev) => prev + 1);
                setGames([]);
            } else {
                const errorMessage = await response.json();
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
            {isFetchingTitle && <CircularProgress size={24} style={{ margin: "10px 0" }} />} {/* Spinner for fetching title */}
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
            {games.map((game) => (
                <GameItem key={game._id}>
                    {game.thumbnailUrl && (
                        <img
                            src={game.thumbnailUrl}
                            alt={game.title}
                            style={{ maxWidth: "100%", marginBottom: "10px" }}
                        />
                    )}
                    <Typography variant="h6" component="p">
                        {game.title}
                    </Typography>
                    <Button variant="contained" color="primary" onClick={() => offerToLend(game)}>
                        Offer to Lend
                    </Button>
                </GameItem>
            ))}
        </Container>
    );
};

export default LendFormGames;
