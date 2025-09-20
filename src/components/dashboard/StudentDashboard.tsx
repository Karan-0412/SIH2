import React, { useEffect, useState } from 'react';
import { useProfile } from '@/hooks/useProfile';
import { useStudent } from '@/hooks/useStudent';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload } from 'lucide-react';
import ProfileSection from './student/ProfileSection';
import CertificatesSection from './student/CertificatesSection';
import RecommendationsSection from './student/RecommendationsSection';
import UploadCertificateSection from './student/UploadCertificateSection';
import NotificationsDropdown from './student/NotificationsDropdown';
import StudentProgressCard from './student/StudentProgressCard';
import StudentAchievementsCard from './student/StudentAchievementsCard';
import StudentGoalsCard from './student/StudentGoalsCard';
import AcademicAchievementDashboard from './student/AcademicAchievementDashboard';
import QuickUpload from './student/QuickUpload';
import SocialActivityFeed from './student/SocialActivityFeed';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TrendingUp, FolderOpen, Github, ExternalLink, FileText, Award } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Certificate {
  id: string;
  title: string;
  description: string;
  category: 'academic' | 'co_curricular';
  status: 'pending' | 'approved' | 'rejected';
  file_url: string;
  file_name: string;
  uploaded_at: string;
  rejection_reason?: string;
  remark?: string;
}

const StudentDashboard = () => {
  const { profile } = useProfile();
  const { 
    progress, 
    achievements, 
    activities, 
    goals, 
    connections, 
    portfolio, 
    recommendations, 
    milestones, 
    loading: studentLoading 
  } = useStudent();
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(false);
  const [showUploadPanel, setShowUploadPanel] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [certsOpen, setCertsOpen] = useState(false);

  useEffect(() => {
    if (profile) {
      fetchCertificates();
    }
  }, [profile]);

  const fetchCertificates = async () => {
    if (!profile) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('certificates')
        .select('*')
        .eq('student_id', profile.id)
        .order('uploaded_at', { ascending: false });
      if (error) throw error;
      setCertificates((data as any) || []);
    } catch (error) {
      console.error('Error fetching certificates:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUploadComplete = async () => {
    await fetchCertificates();
    setShowUploadPanel(false);
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  // Derived stats for visuals
  const total = certificates.length;
  const approved = certificates.filter(c=>c.status==='approved').length;
  const pending = certificates.filter(c=>c.status==='pending').length;
  const rejected = total - approved - pending;

  const last7: { day: string; count: number }[] = (() => {
    const map = new Map<string, number>();
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toLocaleDateString(undefined, { weekday: 'short' });
      map.set(key, 0);
    }
    for (const c of certificates) {
      const d = new Date(c.uploaded_at);
      const key = d.toLocaleDateString(undefined, { weekday: 'short' });
      if (map.has(key)) map.set(key, (map.get(key) || 0) + 1);
    }
    return Array.from(map.entries()).map(([day, count]) => ({ day, count }));
  })();

  const weekTotal = last7.reduce((s, x) => s + x.count, 0) || 1;
  const pct = (n: number) => Math.round((n / (total || 1)) * 100);
  const maxCount = Math.max(...last7.map(x=>x.count)) || 1;
  const avgCount = (weekTotal / (last7.length || 1));

  const CountUp: React.FC<{ to: number; duration?: number }> = ({ to, duration = 800 }) => {
    const [val, setVal] = useState(0);
    useEffect(() => {
      let raf = 0;
      const start = performance.now();
      const tick = (now: number) => {
        const p = Math.min(1, (now - start) / duration);
        setVal(Math.round(to * p));
        if (p < 1) raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
      return () => cancelAnimationFrame(raf);
    }, [to, duration]);
    return <span>{val}</span>;
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Student Dashboard</h1>
          <div className="inline-flex items-center gap-3 bg-white rounded-full px-3 py-1 shadow-sm">
            <span className="text-gray-600 text-sm">Welcome back, {profile?.full_name}!</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={() => setProfileOpen(true)}>Profile</Button>
          <Button variant="outline" size="sm" onClick={() => setCertsOpen(true)}>My Certificates</Button>
          <Button size="sm" onClick={() => setShowUploadPanel((v) => !v)} className="bg-[#6D28D9] hover:bg-[#5b21b6] text-white">
            <Upload className="h-4 w-4 mr-2" />
            {showUploadPanel ? 'Close Upload' : 'Upload Certificate'}
          </Button>
          <NotificationsDropdown />
        </div>
      </div>


      {/* Main Dashboard Tabs */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="progress">Progress</TabsTrigger>
          <TabsTrigger value="goals">Goals</TabsTrigger>
          <TabsTrigger value="achievements">Achievements</TabsTrigger>
          <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Academic Achievement Dashboard */}
          <AcademicAchievementDashboard loading={studentLoading} />
          
          {/* Quick Upload Section */}
          <QuickUpload 
            onUploadStart={(type) => console.log('Upload started:', type)}
            onUploadComplete={handleUploadComplete}
          />
          
          {/* Progress and Goals */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <StudentProgressCard progress={progress} loading={studentLoading} />
            <StudentGoalsCard goals={goals} loading={studentLoading} />
          </div>
          
          {/* Social Activity Feed */}
          <SocialActivityFeed loading={studentLoading} />
        </TabsContent>

        {/* Progress Tab */}
        <TabsContent value="progress" className="space-y-6">
          <StudentProgressCard progress={progress} loading={studentLoading} />
          <SocialActivityFeed loading={studentLoading} />
        </TabsContent>

        {/* Goals Tab */}
        <TabsContent value="goals" className="space-y-6">
          <StudentGoalsCard goals={goals} loading={studentLoading} />
        </TabsContent>

        {/* Achievements Tab */}
        <TabsContent value="achievements" className="space-y-6">
          <AcademicAchievementDashboard loading={studentLoading} />
        </TabsContent>

        {/* Portfolio Tab */}
        <TabsContent value="portfolio" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Projects Section */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <FolderOpen className="h-5 w-5" />
                    My Projects
                  </CardTitle>
                  <Link to="/my-projects">
                    <Button variant="outline" size="sm">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Manage
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                {portfolio.length === 0 ? (
                  <div className="text-center py-8">
                    <FolderOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 mb-4">No projects yet</p>
                    <Link to="/my-projects">
                      <Button>Add Your First Project</Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {portfolio.slice(0, 3).map((project) => (
                      <div key={project.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                            <FolderOpen className="h-4 w-4 text-blue-600" />
                          </div>
                          <div>
                            <p className="font-medium">{project.title}</p>
                            <p className="text-sm text-gray-600">{project.category}</p>
                          </div>
                        </div>
                        {project.external_url && (
                          <Button variant="ghost" size="sm" asChild>
                            <a href={project.external_url} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="h-4 w-4" />
                            </a>
                          </Button>
                        )}
                      </div>
                    ))}
                    {portfolio.length > 3 && (
                      <div className="text-center pt-2">
                        <Link to="/my-projects">
                          <Button variant="outline" size="sm">
                            View All {portfolio.length} Projects
                          </Button>
                        </Link>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* GitHub Integration */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Github className="h-5 w-5" />
                  GitHub Projects
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Github className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-4">Connect your GitHub to showcase your repositories</p>
                  <Link to="/my-projects">
                    <Button>
                      <Github className="h-4 w-4 mr-2" />
                      Import from GitHub
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Link to="/my-projects">
                  <Button variant="outline" className="w-full h-20 flex flex-col items-center justify-center gap-2">
                    <FolderOpen className="h-6 w-6" />
                    <span>Manage Projects</span>
                  </Button>
                </Link>
                <Link to="/resume-generator">
                  <Button variant="outline" className="w-full h-20 flex flex-col items-center justify-center gap-2">
                    <FileText className="h-6 w-6" />
                    <span>Generate Resume</span>
                  </Button>
                </Link>
                <Link to="/academic-achievements">
                  <Button variant="outline" className="w-full h-20 flex flex-col items-center justify-center gap-2">
                    <Award className="h-6 w-6" />
                    <span>View Achievements</span>
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Activity Tab */}
        <TabsContent value="activity" className="space-y-6">
          <SocialActivityFeed loading={studentLoading} />
        </TabsContent>
      </Tabs>

      {/* Upload Panel */}
      {showUploadPanel && (
        <div className="mt-6">
          <UploadCertificateSection onUploadComplete={handleUploadComplete} />
        </div>
      )}

      {/* Popups */}
      <Dialog open={profileOpen} onOpenChange={setProfileOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>My Profile</DialogTitle>
          </DialogHeader>
          <ProfileSection certificates={certificates} />
        </DialogContent>
      </Dialog>

      <Dialog open={certsOpen} onOpenChange={setCertsOpen}>
        <DialogContent className="sm:max-w-3xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>My Certificates</DialogTitle>
          </DialogHeader>
          <CertificatesSection certificates={certificates} />
        </DialogContent>
      </Dialog>

    </div>
  );
};

export default StudentDashboard;
