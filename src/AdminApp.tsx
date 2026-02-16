import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter } from "react-router-dom";
import { ThemeProvider } from "./hooks/use-theme";
import ErrorBoundary from "@/components/ErrorBoundary";
import AdminDashboard from "./pages/AdminDashboard";

const AdminApp = () => (
    <BrowserRouter>
        <ThemeProvider defaultTheme="light" storageKey="techbeta-admin-theme">
            <TooltipProvider>
                <Toaster />
                <Sonner />
                <ErrorBoundary>
                    <AdminDashboard />
                </ErrorBoundary>
            </TooltipProvider>
        </ThemeProvider>
    </BrowserRouter>
);

export default AdminApp;
