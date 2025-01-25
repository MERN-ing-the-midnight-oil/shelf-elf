import React, { useEffect } from 'react';
import { Html5Qrcode, Html5QrcodeCameraScanConfig } from 'html5-qrcode';

interface BarcodeScannerProps {
    onDetected: (barcode: string) => void;
    onClose: () => void;
}

const BarcodeScanner: React.FC<BarcodeScannerProps> = ({ onDetected, onClose }) => {
    let html5QrCode: Html5Qrcode | null = null;

    useEffect(() => {
        const initScanner = async () => {
            html5QrCode = new Html5Qrcode('scanner');

            try {
                // Start the scanner with rear camera
                await html5QrCode.start(
                    { facingMode: 'environment' },
                    {
                        fps: 15,
                        qrbox: { width: 200, height: 200 },
                    },
                    (decodedText) => {
                        console.log('Detected barcode:', decodedText);

                        // Stop the scanner immediately after detecting a barcode
                        stopScanner();
                        onDetected(decodedText); // Notify parent component with the detected barcode
                    },
                    (error) => {
                        if (html5QrCode && !html5QrCode.isScanning) {
                            console.debug('QR code error:', error);
                        }
                    }
                );
            } catch (err) {
                console.error('Error starting scanner:', err);
            }
        };

        initScanner();

        // Cleanup scanner on component unmount
        return () => {
            stopScanner();
        };
    }, []);

    const stopScanner = async () => {
        if (html5QrCode && html5QrCode.isScanning) { // Only stop if scanner is running
            try {
                await html5QrCode.stop();
                await html5QrCode.clear();
                console.log("Scanner stopped successfully.");
            } catch (err) {
                console.error("Error stopping scanner:", err);
            }
        } else {
            console.log("Scanner is already stopped or not running.");
        }
    };


    return (
        <div>
            <div
                id="scanner"
                style={{
                    width: '300px',
                    height: '300px',
                    border: '1px solid #ccc',
                    margin: '0 auto',
                    position: 'relative',
                }}
            ></div>
            <button
                onClick={() => {
                    stopScanner();
                    onClose();
                }}
                style={{
                    position: 'absolute',
                    top: '10px',
                    right: '10px',
                    padding: '5px 10px',
                    backgroundColor: '#f44336',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '3px',
                    cursor: 'pointer',
                    zIndex: 10,
                }}
            >
                STOP SCANNER
            </button>
        </div>
    );
};

export default BarcodeScanner;
