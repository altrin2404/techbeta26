
import { useEffect, useRef, useState } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface QRScannerDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onScan: (decodedText: string) => void;
}

const QRScannerDialog = ({ isOpen, onClose, onScan }: QRScannerDialogProps) => {
    const scannerRef = useRef<Html5QrcodeScanner | null>(null);
    const [scanError, setScanError] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen) {
            // Small timeout to ensure DOM is ready
            const timeoutId = setTimeout(() => {
                if (!scannerRef.current) {
                    const scanner = new Html5QrcodeScanner(
                        "reader",
                        {
                            fps: 10,
                            qrbox: { width: 250, height: 250 },
                            aspectRatio: 1.0
                        },
                        /* verbose= */ false
                    );

                    scanner.render(
                        (decodedText) => {
                            onScan(decodedText);
                            onClose(); // Close dialog on success
                        },
                        (errorMessage) => {
                            // Ignore scan errors as they happen every frame no code is detected
                            console.log(errorMessage);
                        }
                    );
                    scannerRef.current = scanner;
                }
            }, 100);

            return () => clearTimeout(timeoutId);
        } else {
            // Cleanup when dialog closes
            if (scannerRef.current) {
                scannerRef.current.clear().catch(console.error);
                scannerRef.current = null;
            }
        }
    }, [isOpen, onScan, onClose]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (scannerRef.current) {
                scannerRef.current.clear().catch(console.error);
            }
        };
    }, []);

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Scan Participant Ticket</DialogTitle>
                    <DialogDescription>
                        Point your camera at the QR code on the participant's ticket or email.
                    </DialogDescription>
                </DialogHeader>
                <div className="flex flex-col items-center justify-center p-4">
                    <div id="reader" className="w-full h-[300px] bg-black/5 rounded-lg overflow-hidden"></div>
                    {scanError && <p className="text-red-500 text-sm mt-2">{scanError}</p>}
                </div>
                <Button variant="outline" onClick={onClose} className="w-full">
                    Cancel
                </Button>
            </DialogContent>
        </Dialog>
    );
};

export default QRScannerDialog;
