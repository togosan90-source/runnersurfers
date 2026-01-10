import { useState, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { PermissionRequest } from "@/components/PermissionRequest";
import { Capacitor } from "@capacitor/core";
import LandingPage from "./pages/LandingPage";
import AuthPage from "./pages/AuthPage";
import RunPage from "./pages/RunPage";
import StatsPage from "./pages/StatsPage";
import LeaderboardPage from "./pages/LeaderboardPage";
import ShopPage from "./pages/ShopPage";
import ProfilePage from "./pages/ProfilePage";
import InstallPage from "./pages/InstallPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => {
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [showPermissionRequest, setShowPermissionRequest] = useState(false);

  useEffect(() => {
    // Only show permission request on native platforms at app start
    if (Capacitor.isNativePlatform()) {
      setShowPermissionRequest(true);
    } else {
      // On web, skip the initial prompt (will be requested when starting a run)
      setPermissionGranted(true);
    }
  }, []);

  const handlePermissionGranted = () => {
    setPermissionGranted(true);
    setShowPermissionRequest(false);
  };

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          
          {/* Show permission request on native platforms */}
          {showPermissionRequest && !permissionGranted && (
            <PermissionRequest 
              onPermissionGranted={handlePermissionGranted}
              onPermissionDenied={() => {
                // Still allow app usage, but GPS features won't work
                setShowPermissionRequest(false);
              }}
            />
          )}
          
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/auth" element={<AuthPage />} />
              <Route path="/run" element={
                <ProtectedRoute>
                  <RunPage />
                </ProtectedRoute>
              } />
              <Route path="/stats" element={
                <ProtectedRoute>
                  <StatsPage />
                </ProtectedRoute>
              } />
              <Route path="/leaderboard" element={
                <ProtectedRoute>
                  <LeaderboardPage />
                </ProtectedRoute>
              } />
              <Route path="/shop" element={
                <ProtectedRoute>
                  <ShopPage />
                </ProtectedRoute>
              } />
              <Route path="/profile" element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              } />
              <Route path="/install" element={<InstallPage />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
