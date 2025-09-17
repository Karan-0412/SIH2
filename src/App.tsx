import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import AuthPage from "./components/auth/AuthPage";
import FacultyStudent from "./pages/FacultyStudent";
import EventsPage from "./pages/Events";
import EventDetail from "./pages/EventDetail";
import Profile from "./pages/Profile";
import Leaderboard from "./pages/Leaderboard";
import AppLayout from "./components/layout/AppLayout";
import CoursesPage from "./pages/Courses";
import FacultySchedule from "./pages/FacultySchedule";
import CommunityPage from "./pages/Community";
import StudentRoute from "./components/routing/StudentRoute";
import FacultyCommunity from "./pages/FacultyCommunity";
import FacultyChatHub from "./pages/FacultyChatHub";
import FacultyRoute from "./components/routing/FacultyRoute";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route element={<AppLayout />}>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/events" element={<EventsPage />} />
            <Route path="/events/:id" element={<EventDetail />} />
            <Route path="/faculty/students/:id" element={<FacultyStudent />} />
            <Route path="/courses" element={<CoursesPage />} />
            <Route path="/schedule" element={<FacultySchedule />} />
            <Route path="/community" element={<StudentRoute><CommunityPage /></StudentRoute>} />
            <Route path="/student/goals" element={<StudentRoute><StudentGoals /></StudentRoute>} />
            <Route path="/faculty/community" element={<FacultyRoute><FacultyCommunity /></FacultyRoute>} />
            <Route path="/faculty/chat" element={<FacultyRoute><FacultyChatHub /></FacultyRoute>} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="/profile" element={<Profile />} />
            <Route path="/leaderboard" element={<Leaderboard />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
