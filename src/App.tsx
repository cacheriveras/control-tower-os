import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { WorkspaceProvider, useWorkspace } from "@/contexts/WorkspaceContext";
import AppLayout from "@/components/AppLayout";
import Auth from "@/pages/Auth";
import Onboarding from "@/pages/Onboarding";
import CommandCenter from "@/pages/CommandCenter";
import FocusMode from "@/pages/FocusMode";
import Roadmap from "@/pages/Roadmap";
import Workstreams from "@/pages/Workstreams";
import Milestones from "@/pages/Milestones";
import Compliance from "@/pages/Compliance";
import WeeklyReview from "@/pages/WeeklyReview";
import DecisionLog from "@/pages/DecisionLog";
import Settings from "@/pages/Settings";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient({ defaultOptions: { queries: { refetchOnWindowFocus: false, staleTime: 30_000 } } });

function Gate() {
  const { session, loading: authLoading } = useAuth();
  const { workspace, loading: wsLoading } = useWorkspace();
  if (authLoading || (session && wsLoading)) {
    return <div className="min-h-screen grid place-content-center text-sm text-muted-foreground">Cargando...</div>;
  }
  if (!session) return <Auth />;
  if (!workspace) return <Onboarding />;
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<CommandCenter />} />
        <Route path="focus" element={<FocusMode />} />
        <Route path="roadmap" element={<Roadmap />} />
        <Route path="workstreams" element={<Workstreams />} />
        <Route path="milestones" element={<Milestones />} />
        <Route path="compliance" element={<Compliance />} />
        <Route path="weekly" element={<WeeklyReview />} />
        <Route path="decisions" element={<DecisionLog />} />
        <Route path="settings" element={<Settings />} />
      </Route>
      <Route path="auth" element={<Navigate to="/" replace />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <WorkspaceProvider>
            <Gate />
          </WorkspaceProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
