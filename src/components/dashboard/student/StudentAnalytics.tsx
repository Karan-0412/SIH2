import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp, 
  Award, 
  Target, 
  BookOpen, 
  Calendar, 
  BarChart3, 
  PieChart, 
  Activity,
  Users,
  Clock,
  Star
} from 'lucide-react';
import { StudentProgress } from '@/hooks/useStudent';

interface StudentAnalyticsProps {
  progress: StudentProgress | null;
  loading?: boolean;
  achievements?: any[];
  projects?: any[];
  certificates?: any[];
}

const StudentAnalytics: React.FC<StudentAnalyticsProps> = ({ 
  progress, 
  loading, 
  achievements = [], 
  projects = [], 
  certificates = [] 
}) => {
  // Create progress data from available information if progress is null
  const progressData = progress || {
    id: 'mock',
    student_id: 'mock',
    total_certificates: certificates.length,
    approved_certificates: certificates.filter(c => c.status === 'approved').length,
    pending_certificates: certificates.filter(c => c.status === 'pending').length,
    rejected_certificates: certificates.filter(c => c.status === 'rejected').length,
    courses_enrolled: Math.max(1, Math.floor(projects.length / 2)), // Estimate based on projects
    courses_completed: Math.max(0, Math.floor(projects.length / 3)), // Estimate based on projects
    current_streak_days: Math.max(1, Math.floor(achievements.length / 2)), // Estimate based on achievements
    longest_streak_days: Math.max(7, achievements.length), // Estimate based on achievements
    total_activities: achievements.length + projects.length + certificates.length,
    last_activity_date: new Date().toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Analytics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-8 bg-gray-200 rounded"></div>
            <div className="grid grid-cols-2 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-16 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Calculate analytics data
  const totalCertificates = progressData.total_certificates;
  const approvedCertificates = progressData.approved_certificates;
  const pendingCertificates = progressData.pending_certificates;
  const rejectedCertificates = progressData.rejected_certificates;
  const completionRate = totalCertificates > 0 ? Math.round((approvedCertificates / totalCertificates) * 100) : 0;
  
  // Certificate status distribution for pie chart
  const certificateData = [
    { label: 'Approved', value: approvedCertificates, color: 'bg-green-500', percentage: totalCertificates > 0 ? Math.round((approvedCertificates / totalCertificates) * 100) : 0 },
    { label: 'Pending', value: pendingCertificates, color: 'bg-amber-500', percentage: totalCertificates > 0 ? Math.round((pendingCertificates / totalCertificates) * 100) : 0 },
    { label: 'Rejected', value: rejectedCertificates, color: 'bg-red-500', percentage: totalCertificates > 0 ? Math.round((rejectedCertificates / totalCertificates) * 100) : 0 },
  ];

  // Project categories distribution
  const projectCategories = projects.reduce((acc: any, project: any) => {
    const category = project.category || 'Other';
    acc[category] = (acc[category] || 0) + 1;
    return acc;
  }, {});

  const projectData = Object.entries(projectCategories).map(([category, count]) => ({
    label: category,
    value: count as number,
    color: `bg-${['blue', 'purple', 'indigo', 'pink', 'teal'][Object.keys(projectCategories).indexOf(category) % 5]}-500`
  }));

  // Achievement points distribution
  const totalPoints = achievements.reduce((sum, achievement) => sum + (achievement.points || 0), 0);
  const averagePoints = achievements.length > 0 ? Math.round(totalPoints / achievements.length) : 0;

  // Activity streak visualization
  const currentStreak = progressData.current_streak_days;
  const longestStreak = progressData.longest_streak_days;
  const streakPercentage = longestStreak > 0 ? Math.round((currentStreak / longestStreak) * 100) : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          Analytics
        </CardTitle>
        <p className="text-sm text-muted-foreground">Comprehensive view of your academic progress and achievements</p>
      </CardHeader>
      <CardContent className="space-y-6">
        
        {/* Key Metrics Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-xl border border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-700">Approved Certificates</p>
                <p className="text-2xl font-bold text-green-800">{approvedCertificates}</p>
              </div>
              <Award className="h-8 w-8 text-green-600" />
            </div>
            <div className="mt-2">
              <div className="flex items-center gap-2">
                <div className="w-full bg-green-200 rounded-full h-2">
                  <div 
                    className="bg-green-500 h-2 rounded-full transition-all duration-500" 
                    style={{ width: `${completionRate}%` }}
                  ></div>
                </div>
                <span className="text-xs font-medium text-green-700">{completionRate}%</span>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-xl border border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-700">Total Projects</p>
                <p className="text-2xl font-bold text-blue-800">{projects.length}</p>
              </div>
              <BookOpen className="h-8 w-8 text-blue-600" />
            </div>
            <div className="mt-2">
              <Badge variant="secondary" className="text-xs">
                {Object.keys(projectCategories).length} Categories
              </Badge>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-xl border border-purple-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-700">Achievement Points</p>
                <p className="text-2xl font-bold text-purple-800">{totalPoints}</p>
              </div>
              <Star className="h-8 w-8 text-purple-600" />
            </div>
            <div className="mt-2">
              <Badge variant="secondary" className="text-xs">
                Avg: {averagePoints} pts
              </Badge>
            </div>
          </div>

          <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-4 rounded-xl border border-orange-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-700">Current Streak</p>
                <p className="text-2xl font-bold text-orange-800">{currentStreak}</p>
              </div>
              <Calendar className="h-8 w-8 text-orange-600" />
            </div>
            <div className="mt-2">
              <div className="flex items-center gap-2">
                <div className="w-full bg-orange-200 rounded-full h-2">
                  <div 
                    className="bg-orange-500 h-2 rounded-full transition-all duration-500" 
                    style={{ width: `${streakPercentage}%` }}
                  ></div>
                </div>
                <span className="text-xs font-medium text-orange-700">{streakPercentage}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Certificate Status Pie Chart */}
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <PieChart className="h-5 w-5" />
                Certificate Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {certificateData.map((item, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-4 h-4 rounded-full ${item.color}`}></div>
                      <span className="text-sm font-medium">{item.label}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold">{item.value}</span>
                      <Badge variant="outline" className="text-xs">
                        {item.percentage}%
                      </Badge>
                    </div>
                  </div>
                ))}
                
                {/* Visual Pie Representation */}
                <div className="mt-4 flex justify-center">
                  <div className="relative w-24 h-24">
                    <div className="absolute inset-0 rounded-full border-8 border-gray-200"></div>
                    {certificateData.map((item, index) => {
                      const startAngle = certificateData.slice(0, index).reduce((sum, d) => sum + (d.percentage * 3.6), 0);
                      const endAngle = startAngle + (item.percentage * 3.6);
                      return (
                        <div
                          key={index}
                          className={`absolute inset-0 rounded-full border-8 ${item.color} opacity-80`}
                          style={{
                            clipPath: `polygon(50% 50%, ${50 + 50 * Math.cos((startAngle - 90) * Math.PI / 180)}% ${50 + 50 * Math.sin((startAngle - 90) * Math.PI / 180)}%, ${50 + 50 * Math.cos((endAngle - 90) * Math.PI / 180)}% ${50 + 50 * Math.sin((endAngle - 90) * Math.PI / 180)}%)`
                          }}
                        ></div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Project Categories Bar Chart */}
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Project Categories
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {projectData.length > 0 ? projectData.map((item, index) => {
                  const maxValue = Math.max(...projectData.map(d => d.value));
                  const percentage = (item.value / maxValue) * 100;
                  return (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">{item.label}</span>
                        <span className="text-sm font-bold">{item.value}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div 
                          className={`h-3 rounded-full transition-all duration-500 ${item.color}`}
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                }) : (
                  <div className="text-center py-4 text-muted-foreground">
                    <BookOpen className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No projects yet</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Additional Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gradient-to-r from-slate-50 to-slate-100 p-4 rounded-xl border border-slate-200">
            <div className="flex items-center gap-3">
              <Activity className="h-6 w-6 text-slate-600" />
              <div>
                <p className="text-sm font-medium text-slate-700">Total Activities</p>
                <p className="text-xl font-bold text-slate-800">{progressData.total_activities}</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-indigo-50 to-indigo-100 p-4 rounded-xl border border-indigo-200">
            <div className="flex items-center gap-3">
              <Users className="h-6 w-6 text-indigo-600" />
              <div>
                <p className="text-sm font-medium text-indigo-700">Courses Enrolled</p>
                <p className="text-xl font-bold text-indigo-800">{progressData.courses_enrolled}</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-emerald-50 to-emerald-100 p-4 rounded-xl border border-emerald-200">
            <div className="flex items-center gap-3">
              <Clock className="h-6 w-6 text-emerald-600" />
              <div>
                <p className="text-sm font-medium text-emerald-700">Longest Streak</p>
                <p className="text-xl font-bold text-emerald-800">{longestStreak} days</p>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity Timeline */}
        {progressData.last_activity_date && (
          <div className="bg-gradient-to-r from-violet-50 to-purple-50 p-4 rounded-xl border border-violet-200">
            <div className="flex items-center gap-3">
              <Target className="h-6 w-6 text-violet-600" />
              <div>
                <p className="text-sm font-medium text-violet-700">Last Activity</p>
                <p className="text-lg font-bold text-violet-800">
                  {new Date(progressData.last_activity_date).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default StudentAnalytics;
