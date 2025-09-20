import React, { useEffect, useState } from 'react';
import { useProfile } from '@/hooks/useProfile';
import { useStudent } from '@/hooks/useStudent';
import { useProjects } from '@/hooks/useProjects';
import { useAchievements } from '@/hooks/useAchievements';
import { usePlatformIntegration } from '@/hooks/usePlatformIntegration';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
import { TrendingUp, FolderOpen, Github, ExternalLink, FileText, Award, Trophy, Plus, Edit, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

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

// Simple Achievement Form Component
const AchievementForm: React.FC<{
  achievement?: any;
  onSave: (data: any) => void;
  onCancel: () => void;
}> = ({ achievement, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    title: achievement?.title || '',
    description: achievement?.description || '',
    achievement_type: achievement?.achievement_type || 'academic',
    category: achievement?.category || '',
    points: achievement?.points || 10,
    metadata: {
      platform: achievement?.metadata?.platform || '',
      level: achievement?.metadata?.level || 'Beginner',
      verification_url: achievement?.metadata?.verification_url || '',
      issuer: achievement?.metadata?.issuer || '',
      criteria: achievement?.metadata?.criteria || ''
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...formData,
      earned_at: new Date().toISOString(),
      icon_url: null
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="title">Title *</Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
          />
        </div>
        <div>
          <Label htmlFor="achievement_type">Type *</Label>
          <Select
            value={formData.achievement_type}
            onValueChange={(value) => setFormData({ ...formData, achievement_type: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="coding_platform">Coding Platform</SelectItem>
              <SelectItem value="academic">Academic</SelectItem>
              <SelectItem value="co_curricular">Co-curricular</SelectItem>
              <SelectItem value="professional">Professional</SelectItem>
              <SelectItem value="soft_skills">Soft Skills</SelectItem>
              <SelectItem value="course_completion">Course Completion</SelectItem>
              <SelectItem value="streak">Streak</SelectItem>
              <SelectItem value="milestone">Milestone</SelectItem>
              <SelectItem value="participation">Participation</SelectItem>
              <SelectItem value="excellence">Excellence</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="category">Category *</Label>
          <Input
            id="category"
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            placeholder="e.g., LeetCode, Coursera, Hackathon"
            required
          />
        </div>
        <div>
          <Label htmlFor="points">Points</Label>
          <Input
            id="points"
            type="number"
            value={formData.points}
            onChange={(e) => setFormData({ ...formData, points: parseInt(e.target.value) || 0 })}
            min="0"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          rows={3}
        />
      </div>

      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          {achievement ? 'Update' : 'Add'} Achievement
        </Button>
      </div>
    </form>
  );
};

const StudentDashboard = () => {
  const { profile } = useProfile();
  const { 
    progress, 
    activities, 
    goals, 
    connections, 
    portfolio, 
    recommendations, 
    milestones, 
    loading: studentLoading 
  } = useStudent();
  const { projects, loading: projectsLoading } = useProjects();
  const { 
    achievements, 
    loading: achievementsLoading, 
    addAchievement, 
    updateAchievement, 
    deleteAchievement,
    generatePlatformAchievements
  } = useAchievements();
  const { platforms, activityStats } = usePlatformIntegration();
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(false);
  const [showUploadPanel, setShowUploadPanel] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [certsOpen, setCertsOpen] = useState(false);
  const [showAddAchievementDialog, setShowAddAchievementDialog] = useState(false);
  const [editingAchievement, setEditingAchievement] = useState<any>(null);

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
        .order('created_at', { ascending: false });
      if (error) throw error;
      setCertificates((data as any) || []);
    } catch (error) {
      console.error('Error fetching certificates:', error);
    } finally {
      setLoading(false);
    }
  };

  // Add sample certificates for testing
  const addSampleCertificates = async () => {
    if (!profile) return;

    const sampleCertificates = [
      {
        student_id: profile.id,
        title: 'AWS Cloud Practitioner',
        description: 'Amazon Web Services Cloud Practitioner certification',
        category: 'academic' as const,
        issuing_organization: 'Amazon Web Services',
        issue_date: new Date().toISOString().split('T')[0],
        expiry_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        certificate_url: 'https://aws.amazon.com/certification/',
        file_name: 'aws-cloud-practitioner.pdf',
        file_url: 'https://example.com/certificates/aws-cloud-practitioner.pdf',
        file_size: 1024000,
        status: 'approved' as const,
        remark: 'Excellent performance in cloud computing fundamentals'
      },
      {
        student_id: profile.id,
        title: 'Google Data Analytics Professional Certificate',
        description: 'Google Career Certificate in Data Analytics',
        category: 'academic' as const,
        issuing_organization: 'Google',
        issue_date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        certificate_url: 'https://www.coursera.org/professional-certificates/google-data-analytics',
        file_name: 'google-data-analytics.pdf',
        file_url: 'https://example.com/certificates/google-data-analytics.pdf',
        file_size: 2048000,
        status: 'approved' as const,
        remark: 'Comprehensive data analysis skills demonstrated'
      },
      {
        student_id: profile.id,
        title: 'Hackathon Winner - TechFest 2024',
        description: 'First place in university hackathon competition',
        category: 'co_curricular' as const,
        issuing_organization: 'University TechFest',
        issue_date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        certificate_url: 'https://university.edu/techfest2024',
        file_name: 'hackathon-winner.pdf',
        file_url: 'https://example.com/certificates/hackathon-winner.pdf',
        file_size: 512000,
        status: 'approved' as const,
        remark: 'Outstanding innovation and teamwork'
      }
    ];

    try {
      console.log('Adding sample certificates:', sampleCertificates);
      const { data, error } = await supabase
        .from('certificates')
        .insert(sampleCertificates);

      if (error) {
        console.error('Error adding sample certificates:', error);
        toast({
          title: 'Error',
          description: `Failed to add sample certificates: ${error.message}`,
          variant: 'destructive',
        });
      } else {
        console.log('Sample certificates added successfully:', data);
        await fetchCertificates(); // Refresh the certificates list
        toast({
          title: 'Sample Certificates Added!',
          description: '3 sample certificates have been added to your profile.',
        });
      }
    } catch (error) {
      console.error('Error adding sample certificates:', error);
      toast({
        title: 'Error',
        description: `Failed to add sample certificates: ${error}`,
        variant: 'destructive',
      });
    }
  };

  const handleUploadComplete = async () => {
    await fetchCertificates();
    setShowUploadPanel(false);
  };

  const handleEditAchievement = (achievement: any) => {
    setEditingAchievement(achievement);
    setShowAddAchievementDialog(true);
  };

  const handleDeleteAchievement = async (achievementId: string) => {
    if (window.confirm('Are you sure you want to delete this achievement?')) {
      try {
        await deleteAchievement(achievementId);
      } catch (error) {
        console.error('Error deleting achievement:', error);
      }
    }
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
          {/* Achievements Overview */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Total Achievements */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <Award className="h-8 w-8 text-yellow-600" />
                  <div>
                    <p className="text-2xl font-bold">{achievements.length}</p>
                    <p className="text-sm text-gray-600">Total Achievements</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Total Points */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <TrendingUp className="h-8 w-8 text-blue-600" />
                  <div>
                    <p className="text-2xl font-bold">
                      {achievements.reduce((sum, achievement) => sum + achievement.points, 0)}
                    </p>
                    <p className="text-sm text-gray-600">Total Points</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Categories */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <Trophy className="h-8 w-8 text-purple-600" />
                  <div>
                    <p className="text-2xl font-bold">
                      {[...new Set(achievements.map(a => a.achievement_type))].length}
                    </p>
                    <p className="text-sm text-gray-600">Categories</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Platform Integration Status */}
            <Card>
              <CardContent className="p-6">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Github className="h-5 w-5 text-blue-600" />
                    <span className="text-sm font-medium">Platform Integration</span>
                  </div>
                  <div className="text-lg font-bold text-blue-600 mb-1">
                    {platforms.filter(p => p.isConnected).length}
                  </div>
                  <p className="text-xs text-gray-600 mb-3">
                    Connected Platforms
                  </p>
                  <Button 
                    onClick={generatePlatformAchievements}
                    variant="outline"
                    size="sm"
                    className="w-full"
                  >
                    <Github className="h-3 w-3 mr-2" />
                    Sync Achievements
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Platform Integration Info */}
          {platforms.filter(p => p.isConnected).length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Github className="h-5 w-5" />
                  Platform Integration
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <p className="text-sm text-gray-600">
                    You have {platforms.filter(p => p.isConnected).length} coding platform(s) connected. 
                    Achievements are automatically generated based on your progress.
                  </p>
                  <div className="flex gap-2">
                    <Link to="/integrations">
                      <Button variant="outline" size="sm">
                        <Github className="h-3 w-3 mr-2" />
                        Manage Platforms
                      </Button>
                    </Link>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={generatePlatformAchievements}
                    >
                      <TrendingUp className="h-3 w-3 mr-2" />
                      Sync Now
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* All Achievements */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5" />
                My Achievements
              </CardTitle>
            </CardHeader>
            <CardContent>
              {achievementsLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto mb-2"></div>
                  <p className="text-sm text-gray-600">Loading achievements...</p>
                </div>
              ) : achievements.length === 0 ? (
                <div className="text-center py-8">
                  <Award className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-4">No achievements yet</p>
                  <Button onClick={() => setShowAddAchievementDialog(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Your First Achievement
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {achievements.map((achievement) => {
                    const isPlatformAchievement = achievement.achievement_type === 'coding_platform';
                    const platformName = achievement.metadata?.platform;
                    
                    return (
                      <div key={achievement.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                              isPlatformAchievement 
                                ? 'bg-blue-100' 
                                : achievement.achievement_type === 'milestone'
                                ? 'bg-purple-100'
                                : 'bg-yellow-100'
                            }`}>
                              {isPlatformAchievement ? (
                                <Github className="h-4 w-4 text-blue-600" />
                              ) : achievement.achievement_type === 'milestone' ? (
                                <Trophy className="h-4 w-4 text-purple-600" />
                              ) : (
                                <Award className="h-4 w-4 text-yellow-600" />
                              )}
                            </div>
                            <div>
                              <h3 className="font-medium text-sm">{achievement.title}</h3>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge variant="outline" className="text-xs">
                                  {achievement.category}
                                </Badge>
                                {isPlatformAchievement && platformName && (
                                  <Badge variant="secondary" className="text-xs">
                                    {platformName}
                                  </Badge>
                                )}
                                {achievement.metadata?.level && (
                                  <Badge variant="outline" className="text-xs">
                                    {achievement.metadata.level}
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditAchievement(achievement)}
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteAchievement(achievement.id)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                        
                        {achievement.description && (
                          <p className="text-xs text-gray-600 mb-3">{achievement.description}</p>
                        )}
                        
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-bold text-primary">{achievement.points} pts</span>
                          <span className="text-xs text-gray-500">
                            {new Date(achievement.earned_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Portfolio Tab */}
        <TabsContent value="portfolio" className="space-y-6">
          {/* Portfolio Overview */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Projects Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FolderOpen className="h-5 w-5" />
                  My Projects
                </CardTitle>
              </CardHeader>
              <CardContent>
                {projectsLoading ? (
                  <div className="text-center py-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto mb-2"></div>
                    <p className="text-sm text-gray-600">Loading projects...</p>
                  </div>
                ) : projects.length === 0 ? (
                  <div className="text-center py-6">
                    <FolderOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 mb-4">No projects yet</p>
                    <Link to="/my-projects">
                      <Button size="sm">Add Your First Project</Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-2xl font-bold text-primary">{projects.length}</span>
                      <span className="text-sm text-gray-600">Total Projects</span>
                    </div>
                    {projects.slice(0, 3).map((project) => (
                      <div key={project.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                            {project.github_repo_id ? (
                              <Github className="h-4 w-4 text-gray-600" />
                            ) : (
                              <FolderOpen className="h-4 w-4 text-blue-600" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-sm">{project.title}</p>
                            <p className="text-xs text-gray-600 capitalize">{project.category}</p>
                          </div>
                        </div>
                        {project.external_url && (
                          <Button variant="ghost" size="sm" asChild>
                            <a href={project.external_url} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          </Button>
                        )}
                      </div>
                    ))}
                    {projects.length > 3 && (
                      <div className="text-center pt-2">
                        <Link to="/my-projects">
                          <Button variant="outline" size="sm">
                            View All {projects.length} Projects
                          </Button>
                        </Link>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Achievements Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5" />
                  Achievements
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-6">
                  <Award className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
                  <div className="text-2xl font-bold text-yellow-600 mb-2">{achievements.length}</div>
                  <p className="text-sm text-gray-600 mb-4">Total Achievements</p>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      // Switch to achievements tab
                      const achievementsTab = document.querySelector('[value="achievements"]') as HTMLElement;
                      if (achievementsTab) achievementsTab.click();
                    }}
                  >
                    View Achievements
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Certificates Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Certificates
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-6">
                  <FileText className="h-12 w-12 text-green-500 mx-auto mb-4" />
                  <div className="text-2xl font-bold text-green-600 mb-2">{certificates.length}</div>
                  <p className="text-sm text-gray-600 mb-4">Total Certificates</p>
                  <div className="space-y-2">
                    <Button variant="outline" size="sm" onClick={() => setCertsOpen(true)} className="w-full">
                      View Certificates
                    </Button>
                    <Button 
                      variant="secondary" 
                      size="sm" 
                      onClick={addSampleCertificates}
                      className="w-full"
                    >
                      Add Sample Certificates (Test)
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Portfolio Generation Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Portfolio Generation
              </CardTitle>
              <p className="text-sm text-gray-600">Generate a professional portfolio from your projects and achievements</p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Link to="/my-projects">
                  <Button variant="outline" className="w-full h-24 flex flex-col items-center justify-center gap-2">
                    <FolderOpen className="h-6 w-6" />
                    <span className="text-sm">Manage Projects</span>
                    <span className="text-xs text-gray-500">{projects.length} projects</span>
                  </Button>
                </Link>
                <Link to="/resume-generator">
                  <Button variant="outline" className="w-full h-24 flex flex-col items-center justify-center gap-2">
                    <FileText className="h-6 w-6" />
                    <span className="text-sm">Generate Resume</span>
                    <span className="text-xs text-gray-500">PDF Export</span>
                  </Button>
                </Link>
                <Button variant="outline" className="w-full h-24 flex flex-col items-center justify-center gap-2">
                  <ExternalLink className="h-6 w-6" />
                  <span className="text-sm">Portfolio Website</span>
                  <span className="text-xs text-gray-500">Coming Soon</span>
                </Button>
                <Button variant="outline" className="w-full h-24 flex flex-col items-center justify-center gap-2">
                  <Award className="h-6 w-6" />
                  <span className="text-sm">Share Portfolio</span>
                  <span className="text-xs text-gray-500">Public Link</span>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Portfolio Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {activities.slice(0, 5).map((activity) => (
                  <div key={activity.id} className="flex items-center gap-3 p-3 border rounded-lg">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Award className="h-4 w-4 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-sm">{activity.title}</p>
                      <p className="text-xs text-gray-600">{activity.description}</p>
                    </div>
                    <span className="text-xs text-gray-500">
                      {new Date(activity.created_at).toLocaleDateString()}
                    </span>
                  </div>
                ))}
                {activities.length === 0 && (
                  <div className="text-center py-8">
                    <Award className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No recent activity</p>
                  </div>
                )}
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

      {/* Add/Edit Achievement Dialog */}
      <Dialog open={showAddAchievementDialog} onOpenChange={setShowAddAchievementDialog}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingAchievement ? 'Edit Achievement' : 'Add New Achievement'}
            </DialogTitle>
          </DialogHeader>
          <AchievementForm 
            achievement={editingAchievement}
            onSave={async (achievementData) => {
              try {
                if (editingAchievement) {
                  await updateAchievement(editingAchievement.id, achievementData);
                } else {
                  await addAchievement(achievementData);
                }
                setShowAddAchievementDialog(false);
                setEditingAchievement(null);
              } catch (error) {
                console.error('Error saving achievement:', error);
              }
            }}
            onCancel={() => {
              setShowAddAchievementDialog(false);
              setEditingAchievement(null);
            }}
          />
        </DialogContent>
      </Dialog>

    </div>
  );
};

export default StudentDashboard;
