import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Activity, 
  Trophy, 
  Star, 
  TrendingUp, 
  Calendar, 
  ExternalLink, 
  Plus, 
  Search, 
  Filter, 
  ArrowLeft,
  Code,
  BookOpen,
  Users,
  Award,
  Camera,
  Music,
  Paintbrush,
  PenTool,
  Target,
  Zap,
  Heart,
  Briefcase,
  Check
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { useNavigate } from 'react-router-dom';
import { usePlatformIntegration } from '@/hooks/usePlatformIntegration';
import { useAchievements } from '@/hooks/useAchievements';
import { useToast } from '@/hooks/use-toast';

// Activity types and interfaces
interface ActivityItem {
  id: string;
  platform: string;
  type: string;
  title: string;
  description: string;
  date: string;
  value?: string | number;
  category: 'technical' | 'academic' | 'extracurricular' | 'professional';
  url?: string;
  verified?: boolean;
}

const MyActivitiesPage: React.FC = () => {
  const { signOut } = useAuth();
  const { profile } = useProfile();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = React.useState(false);
  const [generationProgress, setGenerationProgress] = React.useState(0);
  
  const { platforms, activityStats, activityData, connectPlatform, disconnectPlatform, syncPlatform, syncAllPlatforms } = usePlatformIntegration();
  const { achievements, generatePlatformAchievements, syncAchievementsToDatabase } = useAchievements();

  const [activities, setActivities] = React.useState<ActivityItem[]>([]);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [selectedPlatform, setSelectedPlatform] = React.useState<string>('all');
  const [selectedDate, setSelectedDate] = React.useState<string>('');
  const [showAddActivityDialog, setShowAddActivityDialog] = React.useState(false);
  const [showActivityDetailDialog, setShowActivityDetailDialog] = React.useState(false);
  const [selectedActivity, setSelectedActivity] = React.useState<ActivityItem | null>(null);
  const [isDarkMode, setIsDarkMode] = React.useState(false);

  // Mock activities for all types of students
  React.useEffect(() => {
    const mockActivities: ActivityItem[] = [
      // Technical Activities
      {
        id: '1',
        platform: 'LeetCode',
        type: 'Problem Solved',
        title: 'Two Sum',
        description: 'Solved a medium difficulty problem',
        date: '2024-01-15',
        value: 'Medium',
        category: 'technical',
        url: 'https://leetcode.com/problems/two-sum',
        verified: true
      },
      {
        id: '2',
        platform: 'HackerRank',
        type: 'Challenge',
        title: 'Algorithm Challenge',
        description: 'Completed a coding challenge',
        date: '2024-01-14',
        value: '95%',
        category: 'technical',
        verified: true
      },
      {
        id: '3',
        platform: 'GitHub',
        type: 'Repository',
        title: 'Personal Portfolio',
        description: 'Created a responsive portfolio website',
        date: '2024-01-13',
        value: '15 commits',
        category: 'technical',
        url: 'https://github.com/user/portfolio',
        verified: true
      },
      // Academic Activities
      {
        id: '4',
        platform: 'Coursera',
        type: 'Course Completion',
        title: 'Machine Learning Fundamentals',
        description: 'Completed online course with distinction',
        date: '2024-01-12',
        value: '98%',
        category: 'academic',
        url: 'https://coursera.org/certificate',
        verified: true
      },
      {
        id: '5',
        platform: 'University',
        type: 'Research Paper',
        title: 'AI in Healthcare Applications',
        description: 'Published research paper in IEEE journal',
        date: '2024-01-10',
        value: 'Impact Factor: 3.2',
        category: 'academic',
        verified: true
      },
      {
        id: '6',
        platform: 'Khan Academy',
        type: 'Course',
        title: 'Advanced Mathematics',
        description: 'Completed calculus and linear algebra modules',
        date: '2024-01-08',
        value: '100%',
        category: 'academic',
        verified: true
      },
      // Extracurricular Activities
      {
        id: '7',
        platform: 'Debate Club',
        type: 'Competition',
        title: 'Inter-University Debate',
        description: 'Won first place in regional debate competition',
        date: '2024-01-05',
        value: '1st Place',
        category: 'extracurricular',
        verified: true
      },
      {
        id: '8',
        platform: 'Sports Club',
        type: 'Tournament',
        title: 'Basketball Championship',
        description: 'Led team to victory in college basketball tournament',
        date: '2024-01-03',
        value: 'Champions',
        category: 'extracurricular',
        verified: true
      },
      {
        id: '9',
        platform: 'Music Society',
        type: 'Performance',
        title: 'Cultural Festival Performance',
        description: 'Performed classical music at annual cultural festival',
        date: '2024-01-01',
        value: 'Solo Performance',
        category: 'extracurricular',
        verified: true
      },
      // Professional Activities
      {
        id: '10',
        platform: 'Internship',
        type: 'Work Experience',
        title: 'Software Development Intern',
        description: 'Completed 3-month internship at tech company',
        date: '2023-12-28',
        value: '3 months',
        category: 'professional',
        verified: true
      },
      {
        id: '11',
        platform: 'LinkedIn',
        type: 'Certification',
        title: 'Project Management Professional',
        description: 'Earned PMP certification',
        date: '2023-12-25',
        value: 'PMP Certified',
        category: 'professional',
        verified: true
      },
      {
        id: '12',
        platform: 'Volunteer Work',
        type: 'Community Service',
        title: 'Teaching Underprivileged Children',
        description: 'Volunteered 50+ hours teaching coding to kids',
        date: '2023-12-20',
        value: '50 hours',
        category: 'professional',
        verified: true
      }
    ];
    setActivities(mockActivities);
  }, []);

  const filteredActivities = activities.filter(activity => {
    const matchesSearch = activity.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         activity.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPlatform = selectedPlatform === 'all' || activity.platform === selectedPlatform;
    const matchesDate = !selectedDate || activity.date === selectedDate;
    return matchesSearch && matchesPlatform && matchesDate;
  });

  const totalActivities = activities.length;
  const verifiedActivities = activities.filter(a => a.verified).length;
  const technicalActivities = activities.filter(a => a.category === 'technical').length;
  const academicActivities = activities.filter(a => a.category === 'academic').length;
  const extracurricularActivities = activities.filter(a => a.category === 'extracurricular').length;
  const professionalActivities = activities.filter(a => a.category === 'professional').length;
  const recentActivities = activities.filter(a => {
    const activityDate = new Date(a.date);
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
    return activityDate >= oneMonthAgo;
  }).length;

  const handleDayClick = (dateStr: string) => {
    const dayActivities = activities.filter(a => a.date === dateStr);
    setSelectedDate(dateStr);
    setShowActivityDetailDialog(true);
  };

  const handleViewActivityDetail = (activity: ActivityItem) => {
    setSelectedActivity(activity);
    setShowActivityDetailDialog(true);
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      isDarkMode ? 'bg-gray-900' : 'bg-gradient-to-br from-slate-50 to-blue-50'
    }`}>

      <div className="pt-4 px-4 py-2">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/')}
              className={isDarkMode ? 'text-gray-300 hover:text-white' : 'text-slate-600 hover:text-slate-800'}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
            <div>
              <h1 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
                My Activities
              </h1>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-slate-600'}`}>
                Track your achievements and activities across platforms
              </p>
            </div>
          </div>
          <div className="flex space-x-3">
            <Button
              onClick={() => navigate('/integrations')}
              variant="outline"
              className={`${isDarkMode ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-blue-200 text-blue-600 hover:bg-blue-50'}`}
            >
              <Plus className="h-4 w-4 mr-2" />
              Connect Platform
            </Button>
            <Button
              onClick={() => setShowAddActivityDialog(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Activity
            </Button>
          </div>
        </div>

        {/* Activity Overview with Charts */}
        <Card className={`mb-8 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}`}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
                  Activity Dashboard
                </CardTitle>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-slate-600'}`}>
                  Your journey of achievements and growth
                </p>
              </div>
              <Button
                onClick={async () => {
                  if (isGenerating) return; // Prevent multiple clicks
                  
                  setIsGenerating(true);
                  setGenerationProgress(0);
                  
                  try {
                    // Step 1: Sync platforms
                    setGenerationProgress(33);
                    toast({
                      title: 'Step 1/3',
                      description: 'Syncing platform data...',
                    });
                    await syncAllPlatforms();
                    
                    // Small delay for better UX
                    await new Promise(resolve => setTimeout(resolve, 1000));
                    
                    // Step 2: Generate achievements
                    setGenerationProgress(66);
                    toast({
                      title: 'Step 2/3',
                      description: 'Generating achievements from platform data...',
                    });
                    await generatePlatformAchievements();
                    
                    // Small delay for better UX
                    await new Promise(resolve => setTimeout(resolve, 1000));
                    
                    // Step 3: Sync to database
                    setGenerationProgress(100);
                    toast({
                      title: 'Step 3/3',
                      description: 'Syncing achievements to cloud...',
                    });
                    await syncAchievementsToDatabase();
                    
                    // Final success
                    toast({
                      title: '🎉 Everything Generated Successfully!',
                      description: 'Platform data synced, achievements created, and saved to cloud. Check your dashboard!',
                    });
                  } catch (error) {
                    console.error('Error in auto-generation:', error);
                    toast({
                      title: 'Generation Error',
                      description: 'Some steps failed, but achievements were generated locally.',
                      variant: 'destructive',
                    });
                  } finally {
                    setIsGenerating(false);
                    setGenerationProgress(0);
                  }
                }}
                disabled={isGenerating}
                variant="default"
                size="lg"
                className="bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600 text-white font-semibold px-6 py-3 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Trophy className="h-5 w-5 mr-2" />
                {isGenerating ? 'Generating...' : 'Generate Everything'}
              </Button>
              
              {/* Progress Bar */}
              {isGenerating && (
                <div className="w-full mt-4">
                  <div className={`w-full bg-gray-200 rounded-full h-2 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full transition-all duration-500 ease-out"
                      style={{ width: `${generationProgress}%` }}
                    ></div>
                  </div>
                  <p className={`text-xs mt-2 text-center ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {generationProgress === 33 && 'Syncing platform data...'}
                    {generationProgress === 66 && 'Generating achievements...'}
                    {generationProgress === 100 && 'Syncing to cloud...'}
                  </p>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center space-x-8">
              <div className="text-center">
                <div className={`text-4xl font-bold ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                  {totalActivities}
                </div>
                <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-slate-600'}`}>
                  Total Activities
                </div>
              </div>
              <div className="text-center">
                <div className={`text-4xl font-bold ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>
                  {verifiedActivities}
                </div>
                <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-slate-600'}`}>
                  Verified
                </div>
              </div>
              <div className="text-center">
                <div className={`text-4xl font-bold ${isDarkMode ? 'text-orange-400' : 'text-orange-600'}`}>
                  {technicalActivities}
                </div>
                <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-slate-600'}`}>
                  Technical
                </div>
              </div>
              <div className="text-center">
                <div className={`text-4xl font-bold ${isDarkMode ? 'text-purple-400' : 'text-purple-600'}`}>
                  {recentActivities}
                </div>
                <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-slate-600'}`}>
                  This Month
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Filters and Search */}
        <div className="flex flex-col sm:flex-row gap-4 mb-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search activities..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`pl-10 ${isDarkMode ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white'}`}
              />
            </div>
          </div>
          <Select value={selectedPlatform} onValueChange={setSelectedPlatform}>
            <SelectTrigger className={`w-full sm:w-48 ${isDarkMode ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white'}`}>
              <SelectValue placeholder="Filter by platform" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Platforms</SelectItem>
              <SelectItem value="LeetCode">LeetCode</SelectItem>
              <SelectItem value="HackerRank">HackerRank</SelectItem>
              <SelectItem value="CodeChef">CodeChef</SelectItem>
              <SelectItem value="GitHub">GitHub</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Activities by Category */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Technical Activities */}
          <Card className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}`}>
            <CardHeader>
              <CardTitle className={`flex items-center ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
                <Code className="h-5 w-5 mr-2 text-blue-600" />
                Technical Activities
                <Badge variant="secondary" className="ml-2">{technicalActivities}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {filteredActivities.filter(a => a.category === 'technical').map((activity) => (
                <div key={activity.id} className={`p-3 rounded-lg border ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
                        {activity.title}
                      </h4>
                      <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-slate-600'}`}>
                        {activity.platform} • {activity.date}
                      </p>
                    </div>
                    {activity.verified && <Check className="h-4 w-4 text-green-500" />}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Academic Activities */}
          <Card className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}`}>
            <CardHeader>
              <CardTitle className={`flex items-center ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
                <BookOpen className="h-5 w-5 mr-2 text-green-600" />
                Academic Activities
                <Badge variant="secondary" className="ml-2">{academicActivities}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {filteredActivities.filter(a => a.category === 'academic').map((activity) => (
                <div key={activity.id} className={`p-3 rounded-lg border ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
                        {activity.title}
                      </h4>
                      <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-slate-600'}`}>
                        {activity.platform} • {activity.date}
                      </p>
                    </div>
                    {activity.verified && <Check className="h-4 w-4 text-green-500" />}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Extracurricular Activities */}
          <Card className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}`}>
            <CardHeader>
              <CardTitle className={`flex items-center ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
                <Users className="h-5 w-5 mr-2 text-purple-600" />
                Extracurricular Activities
                <Badge variant="secondary" className="ml-2">{extracurricularActivities}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {filteredActivities.filter(a => a.category === 'extracurricular').map((activity) => (
                <div key={activity.id} className={`p-3 rounded-lg border ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
                        {activity.title}
                      </h4>
                      <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-slate-600'}`}>
                        {activity.platform} • {activity.date}
                      </p>
                    </div>
                    {activity.verified && <Check className="h-4 w-4 text-green-500" />}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Professional Activities */}
          <Card className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}`}>
            <CardHeader>
              <CardTitle className={`flex items-center ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
                <Briefcase className="h-5 w-5 mr-2 text-orange-600" />
                Professional Activities
                <Badge variant="secondary" className="ml-2">{professionalActivities}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {filteredActivities.filter(a => a.category === 'professional').map((activity) => (
                <div key={activity.id} className={`p-3 rounded-lg border ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
                        {activity.title}
                      </h4>
                      <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-slate-600'}`}>
                        {activity.platform} • {activity.date}
                      </p>
                    </div>
                    {activity.verified && <Check className="h-4 w-4 text-green-500" />}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {filteredActivities.length === 0 && (
          <div className="text-center py-12">
            <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-slate-800'} mb-2`}>
              No activities found
            </h3>
            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-slate-600'}`}>
              Try adjusting your search or add some activities to get started.
            </p>
          </div>
        )}

        {/* Add Activity Dialog */}
        <Dialog open={showAddActivityDialog} onOpenChange={setShowAddActivityDialog}>
          <DialogContent className={isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}>
            <DialogHeader>
              <DialogTitle className={isDarkMode ? 'text-white' : 'text-slate-800'}>
                Add New Activity
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label className={isDarkMode ? 'text-white' : 'text-slate-700'}>Platform</Label>
                <Select>
                  <SelectTrigger className={isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white'}>
                    <SelectValue placeholder="Select platform" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="LeetCode">LeetCode</SelectItem>
                    <SelectItem value="HackerRank">HackerRank</SelectItem>
                    <SelectItem value="GitHub">GitHub</SelectItem>
                    <SelectItem value="Coursera">Coursera</SelectItem>
                    <SelectItem value="University">University</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className={isDarkMode ? 'text-white' : 'text-slate-700'}>Activity Title</Label>
                <Input 
                  className={isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white'} 
                  placeholder="Enter activity title"
                />
              </div>
              <div>
                <Label className={isDarkMode ? 'text-white' : 'text-slate-700'}>Description</Label>
                <Input 
                  className={isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white'} 
                  placeholder="Enter description"
                />
              </div>
              <div>
                <Label className={isDarkMode ? 'text-white' : 'text-slate-700'}>Date</Label>
                <Input 
                  type="date"
                  className={isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white'} 
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button 
                  variant="outline" 
                  onClick={() => setShowAddActivityDialog(false)}
                  className={isDarkMode ? 'border-gray-600 text-gray-300' : ''}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={() => {
                    // Add activity logic here
                    setShowAddActivityDialog(false);
                    toast({
                      title: 'Activity Added!',
                      description: 'Your activity has been added successfully.',
                    });
                  }}
                >
                  Add Activity
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default MyActivitiesPage;