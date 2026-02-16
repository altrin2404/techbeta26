import { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "./hooks/use-theme";
import { Loader2 } from "lucide-react";

// Dynamic Imports
const Index = lazy(() => import("./pages/Index"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const NotFound = lazy(() => import("./pages/NotFound"));

const PageLoader = () => (
  <div className="min-h-screen flex flex-col items-center justify-center bg-background text-primary">
    <Loader2 className="h-10 w-10 animate-spin mb-4" />
    <p className="text-sm font-bold uppercase tracking-widest animate-pulse">Loading TechBeta...</p>
  </div>
);

import ErrorBoundary from "@/components/ErrorBoundary";

// ... existing code ...

const App = () => (
  <ThemeProvider defaultTheme="light" storageKey="techbeta-theme">
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <ErrorBoundary>
        <BrowserRouter>
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/admin" element={<AdminDashboard />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </ErrorBoundary>
    </TooltipProvider>
  </ThemeProvider>
);

export default App;
