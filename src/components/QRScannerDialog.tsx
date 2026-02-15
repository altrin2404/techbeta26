
import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Camera, RefreshCcw } from "lucide-react";

interface QRScannerDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onScan: (decodedText: string) => void;
}

const QRScannerDialog = ({ isOpen, onClose, onScan }: QRScannerDialogProps) => {
    const scannerRef = useRef<Html5Qrcode | null>(null);
    const [scanError, setScanError] = useState<string | null>(null);
    const [isScanning, setIsScanning] = useState(false);
    const [facingMode, setFacingMode] = useState<"environment" | "user">("environment");

    useEffect(() => {
        let isMounted = true;

        const initScanner = async () => {
            // Wait for dialog animation and DOM readiness
            await new Promise(r => setTimeout(r, 300));

            if (!isOpen || !isMounted) return;

            const startScanning = async (mode: "user" | "environment") => {
                try {
                    console.log(`Requesting camera access (${mode})...`);
                    const config = { fps: 10, qrbox: { width: 250, height: 250 } };

                    // Should ensure elemet exists
                    if (!document.getElementById("reader")) {
                        console.error("Reader element not found!");
                        return;
                    }

                    if (!scannerRef.current) {
                        console.log("Creating new Html5Qrcode instance");
                        scannerRef.current = new Html5Qrcode("reader");
                    }

                    if (scannerRef.current.isScanning) {
                        await scannerRef.current.stop();
                        setIsScanning(false);
                    }

                    console.log(`Starting scanner with mode: ${mode}...`);
                    await scannerRef.current.start(
                        { facingMode: mode },
                        config,
                        (decodedText) => {
                            console.log("QR Code scanned:", decodedText);
                            if (isMounted) {
                                onScan(decodedText);
                                onClose();
                            }
                        },
                        (errorMessage) => {
                            // ignore frame failures
                        }
                    );

                    console.log("Scanner started successfully");
                    if (isMounted) {
                        setIsScanning(true);
                        setScanError(null);
                    }

                } catch (err: any) {
                    console.error(`Error starting scanner (${mode}):`, err);

                    // Auto-fallback only on first try if environment fails
                    if (mode === "environment" && facingMode === "environment") {
                        console.log("Environment camera failed. Switching to user camera...");
                        if (isMounted) setFacingMode("user"); // This triggers effect execution
                        return;
                    }

                    if (isMounted) {
                        setScanError(err?.message || "Failed to access camera. Please ensure permissions are granted.");
                        setIsScanning(false);
                    }
                }
            };

            await startScanning(facingMode);
        };

        if (isOpen) {
            initScanner();
        } else {
            // Cleanup if dialog closes
            if (scannerRef.current && scannerRef.current.isScanning) {
                scannerRef.current.stop().catch(console.error);
                setIsScanning(false);
            }
        }

        return () => {
            isMounted = false;
            // Cleanup handled by ref check or scanning status check
            if (scannerRef.current && scannerRef.current.isScanning) {
                scannerRef.current.stop().catch(console.error);
            }
        };
    }, [isOpen, onClose, onScan, facingMode]);

    const toggleCamera = () => {
        setFacingMode(prev => prev === "environment" ? "user" : "environment");
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-md bg-white text-black">
                <DialogHeader>
                    <DialogTitle>Scan Participant Ticket</DialogTitle>
                    <DialogDescription>
                        Point your camera at the QR code.
                    </DialogDescription>
                </DialogHeader>
                <div className="flex flex-col items-center justify-center p-4">
                    <div id="reader" className="w-full h-[300px] bg-black/10 rounded-lg overflow-hidden relative">
                        {!isScanning && !scanError && (
                            <div className="absolute inset-0 flex items-center justify-center text-gray-500">
                                Starting Camera...
                            </div>
                        )}
                    </div>
                    {scanError && (
                        <div className="mt-4 text-center">
                            <p className="text-red-500 text-sm font-medium mb-2">{scanError}</p>
                            <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => {
                                    setScanError(null);
                                    // Retry with current mode
                                    setFacingMode(prev => prev);
                                }}
                            >
                                Retry
                            </Button>
                        </div>
                    )}

                    <div className="mt-4 flex gap-2">
                        <Button variant="outline" size="sm" onClick={toggleCamera}>
                            <RefreshCcw className="mr-2 h-4 w-4" /> Switch Camera ({facingMode === 'environment' ? 'Back' : 'Front'})
                        </Button>
                    </div>
                </div>
                <Button variant="ghost" onClick={onClose} className="w-full">
                    Cancel
                </Button>
            </DialogContent>
        </Dialog>
    );
};

export default QRScannerDialog;
