import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter } from "react-router-dom";

import ErrorBoundary from "@/components/ErrorBoundary";
import AdminDashboard from "./pages/AdminDashboard";

const AdminApp = () => (
    <BrowserRouter>
        <TooltipProvider>
            <Toaster />
            <Sonner />
            <ErrorBoundary>
                <AdminDashboard />
            </ErrorBoundary>
        </TooltipProvider>
    </BrowserRouter>
);

export default AdminApp;
