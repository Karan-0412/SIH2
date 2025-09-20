import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Trophy, Target, Star, Award } from 'lucide-react';
import { usePlatformIntegration } from '@/hooks/usePlatformIntegration';
import { useAchievements } from '@/hooks/useAchievements';

const AchievementDemo: React.FC = () => {
  const { platforms, activityStats, activityData } = usePlatformIntegration();
  const { achievements, generatePlatformAchievements } = useAchievements();

  const connectedPlatforms = platforms.filter(p => p.isConnected);
  const codingAchievements = achievements.filter(a => a.achievement_type === 'coding_platform');

  // Debug information
  console.log('AchievementDemo - Platforms:', platforms);
  console.log('AchievementDemo - Connected Platforms:', connectedPlatforms);
  console.log('AchievementDemo - Activity Data:', activityData);
  console.log('AchievementDemo - Achievements:', achievements);

  const getAchievementStatus = (platform: any) => {
    const platformData = activityData.platforms?.[platform.id];
    if (!platformData) return { canGenerate: false, reason: 'No data available', milestones: [] };

    const { solved, rating, contests } = platformData;
    const status = {
      canGenerate: true,
      reason: 'Ready to generate achievements',
      milestones: []
    };

    // Check what achievements can be generated
    if (solved >= 100) {
      status.milestones.push({ type: 'Problem Solver', count: solved, threshold: 100, points: 50 });
    }
    if (solved >= 500) {
      status.milestones.push({ type: 'Expert', count: solved, threshold: 500, points: 100 });
    }
    if (rating >= 1500) {
      status.milestones.push({ type: 'Master', count: rating, threshold: 1500, points: 75 });
    }
    if (contests >= 10) {
      status.milestones.push({ type: 'Competitor', count: contests, threshold: 10, points: 30 });
    }

    return status;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-500" />
            Achievement Generation Demo
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold mb-2">Connected Platforms</h3>
              <div className="space-y-2">
                {connectedPlatforms.length > 0 ? (
                  connectedPlatforms.map(platform => {
                    const status = getAchievementStatus(platform);
                    const platformData = activityData.platforms?.[platform.id];
                    
                    return (
                      <div key={platform.id} className="p-3 border rounded-lg">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium">{platform.name}</div>
                            <div className="text-sm text-gray-600">
                              {platformData ? (
                                <>
                                  {platformData.solved} problems • 
                                  Rating: {platformData.rating} • 
                                  {platformData.contests} contests
                                </>
                              ) : (
                                'No data available'
                              )}
                            </div>
                          </div>
                          <Badge variant={status.canGenerate ? 'default' : 'secondary'}>
                            {status.canGenerate ? 'Ready' : 'No Data'}
                          </Badge>
                        </div>
                        
                        {status.milestones.length > 0 && (
                          <div className="mt-2 space-y-1">
                            <div className="text-xs font-medium text-green-600">Available Achievements:</div>
                            {status.milestones.map((milestone, idx) => (
                              <div key={idx} className="text-xs text-gray-600">
                                • {milestone.type}: {milestone.count}/{milestone.threshold} ({milestone.points} pts)
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })
                ) : (
                  <div className="text-gray-500">No platforms connected</div>
                )}
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Generated Achievements</h3>
              <div className="space-y-2">
                {codingAchievements.length > 0 ? (
                  codingAchievements.map(achievement => (
                    <div key={achievement.id} className="p-3 border rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium">{achievement.title}</div>
                          <div className="text-sm text-gray-600">{achievement.description}</div>
                        </div>
                        <div className="text-right">
                          <Badge variant="outline">{achievement.points} pts</Badge>
                          <div className="text-xs text-gray-500 mt-1">
                            {achievement.category}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-gray-500">No achievements generated yet</div>
                )}
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <Button 
              onClick={generatePlatformAchievements}
              disabled={connectedPlatforms.length === 0}
              className="flex items-center gap-2"
            >
              <Award className="h-4 w-4" />
              Generate Achievements
            </Button>
            <Button variant="outline" disabled>
              <Target className="h-4 w-4 mr-2" />
              View All Achievements
            </Button>
          </div>

          <div className="text-sm text-gray-600">
            <strong>How it works:</strong>
            <ul className="list-disc list-inside mt-1 space-y-1">
              <li>Connect platforms in the Integrations page</li>
              <li>Platform data is automatically fetched</li>
              <li>Achievements are generated based on milestones (100+ problems, 1500+ rating, etc.)</li>
              <li>Click "Generate Achievements" to create new ones</li>
              <li>Achievements appear in both Activities and Dashboard</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AchievementDemo;
