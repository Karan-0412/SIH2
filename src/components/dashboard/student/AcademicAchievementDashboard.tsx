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
import { useProfile } from '@/hooks/useProfile';
import { useAchievements } from '@/hooks/useAchievements';
import { usePlatformIntegration } from '@/hooks/usePlatformIntegration';

interface AcademicAchievementDashboardProps {
  loading?: boolean;
}

const AcademicAchievementDashboard: React.FC<AcademicAchievementDashboardProps> = ({ 
  loading: propLoading 
}) => {
  const { profile } = useProfile();
  const { achievements, loading: achievementsLoading, generatePlatformAchievements } = useAchievements();
  const { platforms, activityStats } = usePlatformIntegration();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Calculate stats from real achievement data
  console.log('AcademicAchievementDashboard - achievements:', achievements);
  console.log('AcademicAchievementDashboard - achievementsLoading:', achievementsLoading);
  
  const totalAchievements = achievements.length;
  const totalPoints = achievements.reduce((sum, achievement) => sum + achievement.points, 0);
  const recentAchievements = achievements
    .sort((a, b) => new Date(b.earned_at).getTime() - new Date(a.earned_at).getTime())
    .slice(0, 5);
  
  const achievementTypes = [...new Set(achievements.map(a => a.achievement_type))];
  const platformAchievements = achievements.filter(a => a.achievement_type === 'coding_platform');
  const academicAchievements = achievements.filter(a => a.achievement_type === 'academic');
  const coCurricularAchievements = achievements.filter(a => a.achievement_type === 'co_curricular');
  
  // Calculate category stats from real data
  const categoryStats = achievementTypes.map(type => {
    const typeAchievements = achievements.filter(a => a.achievement_type === type);
    return {
      category: type,
      count: typeAchievements.length,
      points: typeAchievements.reduce((sum, a) => sum + a.points, 0)
    };
  });

  // Create badges from achievements
  const badges = achievements.slice(0, 8).map(achievement => ({
    id: achievement.id,
    name: achievement.title,
    description: achievement.description || `Earned ${achievement.points} points`,
    rarity: achievement.points >= 100 ? 'legendary' : achievement.points >= 50 ? 'epic' : achievement.points >= 25 ? 'rare' : 'common',
    earnedAt: achievement.earned_at
  }));

  if (propLoading || achievementsLoading) {
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

  // No need to check for stats since we're using real data

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
      case 'certificate': return 'bg-green-50 text-green-600 border-green-100';
      case 'course': return 'bg-sky-50 text-sky-600 border-sky-100';
      case 'event': return 'bg-violet-50 text-violet-600 border-violet-100';
      case 'competition': return 'bg-amber-50 text-amber-600 border-amber-100';
      case 'leadership': return 'bg-rose-50 text-rose-600 border-rose-100';
      case 'volunteer': return 'bg-orange-50 text-orange-600 border-orange-100';
      case 'research': return 'bg-indigo-50 text-indigo-600 border-indigo-100';
      default: return 'bg-gray-50 text-gray-600 border-gray-100';
    }
  };

  const getBadgeRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'bg-gray-50 text-gray-600';
      case 'rare': return 'bg-sky-50 text-sky-600';
      case 'epic': return 'bg-violet-50 text-violet-600';
      case 'legendary': return 'bg-amber-50 text-amber-600';
      default: return 'bg-gray-50 text-gray-600';
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
    if (level >= 50) return 'from-violet-400 to-rose-400';
    if (level >= 40) return 'from-sky-400 to-violet-400';
    if (level >= 30) return 'from-green-400 to-sky-400';
    if (level >= 20) return 'from-amber-400 to-green-400';
    if (level >= 10) return 'from-orange-400 to-amber-400';
    return 'from-gray-400 to-orange-400';
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
        <Card className="bg-gradient-to-br from-green-100 to-emerald-100 text-green-800 border-green-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-600 text-sm font-medium">Total Achievements</p>
                <p className="text-3xl font-bold text-green-700">{totalAchievements}</p>
                <p className="text-green-600 text-xs">Keep achieving!</p>
              </div>
              <Trophy className="h-12 w-12 text-green-500" />
            </div>
          </CardContent>
        </Card>

        {/* Current Streak */}
        <Card className="bg-gradient-to-br from-orange-100 to-red-100 text-orange-800 border-orange-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-600 text-sm font-medium">Active Streak</p>
                <p className="text-3xl font-bold text-orange-700">{activityStats?.currentStreak || 0}</p>
                <p className="text-orange-600 text-xs">days active</p>
              </div>
              <Flame className="h-12 w-12 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        {/* Level */}
        <Card className={`bg-gradient-to-br ${getLevelColor(Math.floor(totalPoints / 10))} text-white`}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/80 text-sm font-medium">Level {Math.floor(totalPoints / 10)}</p>
                <p className="text-2xl font-bold">{getLevelTitle(Math.floor(totalPoints / 10))}</p>
                <p className="text-white/80 text-xs">Keep growing!</p>
              </div>
              <Crown className="h-12 w-12 text-white/80" />
            </div>
          </CardContent>
        </Card>

        {/* Total Points */}
        <Card className="bg-gradient-to-br from-sky-100 to-indigo-100 text-sky-800 border-sky-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sky-600 text-sm font-medium">Total Points</p>
                <p className="text-3xl font-bold text-sky-700">{totalPoints}</p>
                <p className="text-sky-600 text-xs">Earned through activities</p>
              </div>
              <Star className="h-12 w-12 text-sky-500" />
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
            <Button className="h-20 flex-col gap-2 bg-green-50 text-green-600 hover:bg-green-100 border border-green-200">
              <Award className="h-6 w-6" />
              <span className="text-sm font-medium">Upload Certificate</span>
            </Button>
            <Button className="h-20 flex-col gap-2 bg-sky-50 text-sky-600 hover:bg-sky-100 border border-sky-200">
              <BookOpen className="h-6 w-6" />
              <span className="text-sm font-medium">Add Course</span>
            </Button>
            <Button className="h-20 flex-col gap-2 bg-violet-50 text-violet-600 hover:bg-violet-100 border border-violet-200">
              <Calendar className="h-6 w-6" />
              <span className="text-sm font-medium">Log Event</span>
            </Button>

            <Button 
              className="h-20 flex-col gap-2 bg-amber-50 text-amber-600 hover:bg-amber-100 border border-amber-200"
              onClick={generatePlatformAchievements}
            >
              <Trophy className="h-6 w-6" />
              <span className="text-sm font-medium">Generate Achievements</span>
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
            {recentAchievements.length > 0 ? recentAchievements.map((achievement) => (
              <div key={achievement.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-full ${getTypeColor(achievement.achievement_type)}`}>
                    {getTypeIcon(achievement.achievement_type)}
                  </div>
                  <div>
                    <h4 className="font-medium">{achievement.title}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge className={`text-xs ${getTypeColor(achievement.achievement_type)}`}>
                        {achievement.achievement_type}
                      </Badge>
                      <span className="text-xs text-gray-500">{achievement.category}</span>
                      <Badge variant="default">
                        Verified
                      </Badge>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1 text-green-500">
                    <Star className="h-4 w-4" />
                    <span className="font-medium">+{achievement.points}</span>
                  </div>
                  <p className="text-xs text-gray-500">
                    {new Date(achievement.earned_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            )) : (
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
            {categoryStats.map((category) => (
              <div key={category.category} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{category.category}</span>
                  <span className="text-sm text-gray-500">{category.count} achievements</span>
                </div>
                <Progress value={totalAchievements > 0 ? (category.count / totalAchievements) * 100 : 0} className="h-2" />
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>{category.points} points</span>
                  <span>{totalAchievements > 0 ? Math.round((category.count / totalAchievements) * 100) : 0}%</span>
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
            {badges.map((badgeItem) => (
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
