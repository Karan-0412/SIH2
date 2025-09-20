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
import EventRegistration from "./pages/EventRegistration";
import Profile from "./pages/Profile";
import Leaderboard from "./pages/Leaderboard";
import AppLayout from "./components/layout/AppLayout";
import CoursesPage from "./pages/Courses";
import FacultySchedule from "./pages/FacultySchedule";
import CommunityPage from "./pages/Community";
import StudentGoals from "./pages/StudentGoals";
import IntegrationsPage from "./pages/Integrations";
import StudentRoute from "./components/routing/StudentRoute";
import FacultyCommunity from "./pages/FacultyCommunity";
import FacultyChatHub from "./pages/FacultyChatHub";
import FacultyRoute from "./components/routing/FacultyRoute";
import IntegrationsAnalytics from "./pages/IntegrationsAnalytics";
import AdminRoute from "./components/routing/AdminRoute";
import AdminLayout from "./components/admin/AdminLayout";
import AdminDashboard from "./pages/AdminDashboard";
import AdminFaculty from "./pages/AdminFaculty";
import AdminAssignments from "./pages/AdminAssignments";
import AdminDebug from "./pages/AdminDebug";

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
            <Route path="/event-registration/:id" element={<EventRegistration />} />
            <Route path="/faculty/students/:id" element={<FacultyStudent />} />
            <Route path="/courses" element={<CoursesPage />} />
            <Route path="/schedule" element={<FacultySchedule />} />
            <Route path="/community" element={<StudentRoute><CommunityPage /></StudentRoute>} />
            <Route path="/student/goals" element={<StudentRoute><StudentGoals /></StudentRoute>} />
            <Route path="/integrations" element={<StudentRoute><IntegrationsAnalytics /></StudentRoute>} />
            <Route path="/faculty/community" element={<FacultyRoute><FacultyCommunity /></FacultyRoute>} />
            <Route path="/faculty/chat" element={<FacultyRoute><FacultyChatHub /></FacultyRoute>} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/leaderboard" element={<Leaderboard />} />
            <Route path="*" element={<NotFound />} />
          </Route>

          {/* Admin Routes */}
          <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
            <Route index element={<AdminDashboard />} />
            <Route path="faculty" element={<AdminFaculty />} />
            <Route path="assignments" element={<AdminAssignments />} />
          </Route>

          {/* Debug Route */}
          <Route path="/admin-debug" element={<AdminDebug />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
