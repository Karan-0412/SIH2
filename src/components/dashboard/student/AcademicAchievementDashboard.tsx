import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { 
  GraduationCap, 
  Trophy, 
  Star, 
  Target, 
  Clock, 
  TrendingUp,
  Award,
  BookOpen,
  Users,
  Calendar,
  CheckCircle,
  Plus,
  BarChart3,
  Flame,
  Medal,
  Crown
} from 'lucide-react';
import DashboardService, { DashboardStats, Achievement, Badge as BadgeType, CategoryStat } from '@/services/dashboardService';
import { mockDashboardStats } from '@/services/mockDataService';
import { useProfile } from '@/hooks/useProfile';
import { useMockData } from '@/hooks/useMockData';

interface AcademicAchievementDashboardProps {
  loading?: boolean;
}

const AcademicAchievementDashboard: React.FC<AcademicAchievementDashboardProps> = ({ 
  loading: propLoading 
}) => {
  const { profile } = useProfile();
  const { mockDataEnabled } = useMockData();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      if (!profile) return;
      
      setLoading(true);
      setError(null);
      
      try {
        // Check if mock data is enabled
        if (mockDataEnabled) {
          console.log('Using mock data for testing');
          setStats(mockDashboardStats);
        } else {
          const dashboardService = DashboardService.getInstance();
          const data = await dashboardService.getDashboardStats(profile.id);
          setStats(data);
        }
      } catch (err) {
        console.error('Error fetching dashboard stats:', err);
        setError('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [profile, mockDataEnabled]);

  if (propLoading || loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="animate-pulse space-y-4">
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="h-8 bg-gray-200 rounded w-3/4"></div>
                <div className="h-2 bg-gray-200 rounded"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <div className="text-red-500 mb-2">⚠️</div>
          <p className="text-red-600">{error}</p>
        </CardContent>
      </Card>
    );
  }

  if (!stats) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <div className="text-gray-500 mb-2">📊</div>
          <p className="text-gray-600">No data available</p>
        </CardContent>
      </Card>
    );
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'certificate': return <Award className="h-4 w-4" />;
      case 'course': return <BookOpen className="h-4 w-4" />;
      case 'event': return <Calendar className="h-4 w-4" />;
      case 'competition': return <Trophy className="h-4 w-4" />;
      case 'leadership': return <Crown className="h-4 w-4" />;
      case 'volunteer': return <Users className="h-4 w-4" />;
      case 'research': return <GraduationCap className="h-4 w-4" />;
      default: return <Star className="h-4 w-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'certificate': return 'bg-green-100 text-green-800 border-green-200';
      case 'course': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'event': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'competition': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'leadership': return 'bg-pink-100 text-pink-800 border-pink-200';
      case 'volunteer': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'research': return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getBadgeRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'bg-gray-100 text-gray-800';
      case 'rare': return 'bg-blue-100 text-blue-800';
      case 'epic': return 'bg-purple-100 text-purple-800';
      case 'legendary': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getLevelTitle = (level: number) => {
    if (level >= 50) return 'Academic Legend';
    if (level >= 40) return 'Achievement Master';
    if (level >= 30) return 'Excellence Expert';
    if (level >= 20) return 'High Achiever';
    if (level >= 10) return 'Rising Star';
    return 'Beginner';
  };

  const getLevelColor = (level: number) => {
    if (level >= 50) return 'from-purple-600 to-pink-600';
    if (level >= 40) return 'from-blue-600 to-purple-600';
    if (level >= 30) return 'from-green-600 to-blue-600';
    if (level >= 20) return 'from-yellow-600 to-green-600';
    if (level >= 10) return 'from-orange-600 to-yellow-600';
    return 'from-gray-600 to-orange-600';
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="animate-pulse space-y-4">
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="h-8 bg-gray-200 rounded w-3/4"></div>
                <div className="h-2 bg-gray-200 rounded"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Achievements */}
        <Card className="bg-gradient-to-br from-green-500 to-emerald-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-medium">Total Achievements</p>
                <p className="text-3xl font-bold">{stats.totalAchievements}</p>
                <p className="text-green-100 text-xs">Keep achieving!</p>
              </div>
              <Trophy className="h-12 w-12 text-green-200" />
            </div>
          </CardContent>
        </Card>

        {/* Current Streak */}
        <Card className="bg-gradient-to-br from-orange-500 to-red-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm font-medium">Active Streak</p>
                <p className="text-3xl font-bold">{stats.currentStreak}</p>
                <p className="text-orange-100 text-xs">days active</p>
              </div>
              <Flame className="h-12 w-12 text-orange-200" />
            </div>
          </CardContent>
        </Card>

        {/* Level */}
        <Card className={`bg-gradient-to-br ${getLevelColor(stats.level)} text-white`}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/80 text-sm font-medium">Level {stats.level}</p>
                <p className="text-2xl font-bold">{getLevelTitle(stats.level)}</p>
                <p className="text-white/80 text-xs">Keep growing!</p>
              </div>
              <Crown className="h-12 w-12 text-white/80" />
            </div>
          </CardContent>
        </Card>

        {/* Total Points */}
        <Card className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium">Total Points</p>
                <p className="text-3xl font-bold">{stats.totalPoints}</p>
                <p className="text-blue-100 text-xs">Earned through activities</p>
              </div>
              <Star className="h-12 w-12 text-blue-200" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button className="h-20 flex-col gap-2 bg-green-100 text-green-800 hover:bg-green-200">
              <Award className="h-6 w-6" />
              <span className="text-sm font-medium">Upload Certificate</span>
            </Button>
            <Button className="h-20 flex-col gap-2 bg-blue-100 text-blue-800 hover:bg-blue-200">
              <BookOpen className="h-6 w-6" />
              <span className="text-sm font-medium">Add Course</span>
            </Button>
            <Button className="h-20 flex-col gap-2 bg-purple-100 text-purple-800 hover:bg-purple-200">
              <Calendar className="h-6 w-6" />
              <span className="text-sm font-medium">Log Event</span>
            </Button>
            <Button className="h-20 flex-col gap-2 bg-yellow-100 text-yellow-800 hover:bg-yellow-200">
              <Trophy className="h-6 w-6" />
              <span className="text-sm font-medium">Add Competition</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Recent Achievements */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Recent Achievements
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {stats.recentAchievements.slice(0, 5).map((achievement) => (
              <div key={achievement.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-full ${getTypeColor(achievement.type)}`}>
                    {getTypeIcon(achievement.type)}
                  </div>
                  <div>
                    <h4 className="font-medium">{achievement.title}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge className={`text-xs ${getTypeColor(achievement.type)}`}>
                        {achievement.type}
                      </Badge>
                      <span className="text-xs text-gray-500">{achievement.category}</span>
                      <Badge variant={achievement.status === 'approved' ? 'default' : 'secondary'}>
                        {achievement.status}
                      </Badge>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1 text-green-600">
                    <Star className="h-4 w-4" />
                    <span className="font-medium">+{achievement.points}</span>
                  </div>
                  <p className="text-xs text-gray-500">
                    {new Date(achievement.earnedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            )) || (
              <div className="text-center py-8 text-gray-500">
                <Trophy className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No achievements yet</p>
                <p className="text-sm">Start uploading certificates and logging activities!</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Category Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Achievement Categories
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {stats.categoryStats.map((category) => (
              <div key={category.category} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{category.category}</span>
                  <span className="text-sm text-gray-500">{category.count} achievements</span>
                </div>
                <Progress value={(category.count / stats.totalAchievements) * 100} className="h-2" />
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>{category.points} points</span>
                  <span>{Math.round((category.count / stats.totalAchievements) * 100)}%</span>
                </div>
              </div>
            )) || (
              <div className="col-span-full text-center py-8 text-gray-500">
                <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No category data available</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Badges */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Medal className="h-5 w-5" />
            Badges & Milestones
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {stats.badges.slice(0, 8).map((badgeItem) => (
              <div key={badgeItem.id} className="text-center p-4 border rounded-lg hover:shadow-md transition-shadow">
                <div className={`w-12 h-12 mx-auto mb-2 rounded-full flex items-center justify-center ${getBadgeRarityColor(badgeItem.rarity)}`}>
                  <Medal className="h-6 w-6" />
                </div>
                <h4 className="font-medium text-sm">{badgeItem.name}</h4>
                <p className="text-xs text-gray-500 mt-1">{badgeItem.description}</p>
                <p className="text-xs text-gray-400 mt-1">
                  {new Date(badgeItem.earnedAt).toLocaleDateString()}
                </p>
              </div>
            )) || (
              <div className="col-span-full text-center py-8 text-gray-500">
                <Medal className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No badges earned yet</p>
                <p className="text-sm">Complete achievements to earn badges!</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AcademicAchievementDashboard;
