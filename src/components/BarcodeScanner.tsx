import React, { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";

interface BarcodeScannerProps {
    open: boolean;
    onDetected: (barcode: string) => void;
    onClose: () => void;
}

const BarcodeScanner: React.FC<BarcodeScannerProps> = ({
    open,
    onDetected,
    onClose,
}) => {
    const html5QrCodeRef = useRef<Html5Qrcode | null>(null);
    const [isScannerReady, setIsScannerReady] = useState(false);

    useEffect(() => {
        if (!open) return;

        const scannerElement = document.getElementById("scanner");
        if (!scannerElement) {
            console.error("Scanner element not found!");
            return;
        }

        if (!html5QrCodeRef.current) {
            html5QrCodeRef.current = new Html5Qrcode("scanner");
        }

        const html5QrCode = html5QrCodeRef.current;

        const startScanner = async () => {
            setIsScannerReady(true); // Mark scanner as ready immediately
            try {
                await html5QrCode.start(
                    {
                        facingMode: { exact: "environment" }, // Use rear camera with autofocus (if supported)
                    },
                    {
                        fps: 15,
                        qrbox: { width: 250, height: 250 },
                        disableFlip: true, // Disable flipping for rear camera
                    },
                    (decodedText) => {
                        console.log("Detected barcode:", decodedText);
                        stopScanner(); // Stop scanner after detection
                        onDetected(decodedText); // Notify parent component
                    },
                    (error) => {
                        console.debug("Scanning error:", error);
                    }
                );
            } catch (err) {
                console.error("Error starting scanner:", err);
                stopScanner(); // Stop the scanner gracefully if start fails
            }
        };

        startScanner();

        return () => {
            stopScanner();
        };
    }, [open]);

    const stopScanner = async () => {
        if (html5QrCodeRef.current && html5QrCodeRef.current.isScanning) {
            try {
                await html5QrCodeRef.current.stop();
                await html5QrCodeRef.current.clear();
                console.log("Scanner stopped successfully.");
            } catch (err) {
                console.error("Error stopping scanner:", err);
            }
        }
        setIsScannerReady(false); // Always reset scanner state
        onClose(); // Notify parent to close scanner
    };

    if (!open) return null;

    return (
        <div
            style={{
                position: "fixed",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                backgroundColor: "rgba(0, 0, 0, 0.9)",
                zIndex: 1300,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
            }}
        >
            <div
                id="scanner"
                style={{
                    width: "80%",
                    height: "50%",
                    backgroundColor: "#000",
                    borderRadius: "10px",
                }}
            ></div>
            {isScannerReady && (
                <button
                    style={{
                        position: "absolute", // Ensure it's positioned relative to the entire scanner container
                        bottom: "20px", // Position the button near the bottom of the screen
                        zIndex: 10, // Higher z-index to ensure it appears above the scanner
                        padding: "10px 20px",
                        fontSize: "18px",
                        backgroundColor: "red",
                        color: "#fff",
                        border: "none",
                        borderRadius: "5px",
                        cursor: "pointer",
                    }}
                    onClick={stopScanner}
                >
                    STOP SCANNING
                </button>
            )}
        </div>
    );
};

export default BarcodeScanner;
