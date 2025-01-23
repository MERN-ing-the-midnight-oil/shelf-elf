import React, { useEffect } from 'react';
import { Html5Qrcode, Html5QrcodeCameraScanConfig } from 'html5-qrcode';

interface BarcodeScannerProps {
    onDetected: (barcode: string) => void;
    onClose: () => void;
}

const BarcodeScanner: React.FC<BarcodeScannerProps> = ({ onDetected, onClose }) => {
    let html5QrCode: Html5Qrcode | null = null;
    let isRunning = false;

    useEffect(() => {
        const initScanner = async () => {
            html5QrCode = new Html5Qrcode('scanner');

            const cameraConfig: Html5QrcodeCameraScanConfig = {
                fps: 10,
                qrbox: { width: 250, height: 250 },
            };

            try {
                isRunning = true;
                // Request the rear-facing camera
                await html5QrCode.start(
                    { facingMode: 'environment' }, // Rear-facing camera
                    cameraConfig,
                    (decodedText) => {
                        if (!isRunning) return;
                        isRunning = false;
                        onDetected(decodedText);
                        stopScanner();
                    },
                    (error) => {
                        console.debug('QR code error:', error);
                    }
                );
            } catch (err) {
                console.error('Error starting scanner:', err);
            }
        };

        initScanner();

        return () => {
            stopScanner();
        };
    }, []);

    const stopScanner = async () => {
        if (html5QrCode && isRunning) {
            try {
                isRunning = false;
                await html5QrCode.stop();
                await html5QrCode.clear();
                console.log('Scanner stopped successfully.');
            } catch (err) {
                console.error('Error stopping scanner:', err);
            }
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
