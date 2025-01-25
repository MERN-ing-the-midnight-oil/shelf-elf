import React, { useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { Modal, Box } from '@mui/material';

interface BarcodeScannerProps {
    onDetected: (barcode: string) => void;
    onClose: () => void;
    open: boolean;
}

const BarcodeScanner: React.FC<BarcodeScannerProps> = ({ onDetected, onClose, open }) => {
    const html5QrCodeRef = useRef<Html5Qrcode | null>(null);

    useEffect(() => {
        if (!open) return;

        const timer = setTimeout(async () => {
            const scannerElement = document.getElementById('scanner');
            if (!scannerElement) {
                console.error('Scanner element not found!');
                return;
            }

            const html5QrCode = new Html5Qrcode('scanner');
            html5QrCodeRef.current = html5QrCode; // Store in ref

            try {
                await html5QrCode.start(
                    { facingMode: 'environment' },
                    { fps: 15, qrbox: { width: 250, height: 250 } },
                    (decodedText) => {
                        console.log('Detected barcode:', decodedText);
                        stopScanner();
                        onDetected(decodedText);
                    },
                    (error) => {
                        console.debug('Scanning error:', error);
                    }
                );
            } catch (err) {
                console.error('Error starting scanner:', err);
            }
        }, 100);

        return () => {
            clearTimeout(timer);
            stopScanner();
        };
    }, [open]);

    const stopScanner = async () => {
        if (html5QrCodeRef.current && html5QrCodeRef.current.isScanning) {
            try {
                await html5QrCodeRef.current.stop();
                await html5QrCodeRef.current.clear();
                console.log('Scanner stopped successfully.');
            } catch (err) {
                console.error('Error stopping scanner:', err);
            }
        }
    };

    return (
        <Modal
            open={open}
            onClose={onClose}
            aria-labelledby="barcode-scanner"
            aria-describedby="barcode-scanner-modal"
            sx={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                bgcolor: 'rgba(0, 0, 0, 0.9)',
                zIndex: 1300,
            }}
        >
            <Box
                sx={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'flex-start',
                    alignItems: 'center',
                }}
            >
                <div
                    id="scanner"
                    style={{
                        width: '80%',
                        height: '50%',
                        background: '#000',
                        marginTop: '10%',
                        borderRadius: '10px',
                    }}
                ></div>
            </Box>
        </Modal>
    );
};

export default BarcodeScanner;
