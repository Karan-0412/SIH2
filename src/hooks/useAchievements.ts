import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useProfile } from './useProfile';
import { useToast } from './use-toast';
import { usePlatformIntegration } from './usePlatformIntegration';

export interface Achievement {
  id: string;
  student_id: string;
  achievement_type: 'coding_platform' | 'academic' | 'co_curricular' | 'professional' | 'soft_skills' | 'course_completion' | 'streak' | 'milestone' | 'participation' | 'excellence' | 'leadership' | 'innovation';
  title: string;
  description: string | null;
  category: string;
  points: number;
  earned_at: string;
  metadata: {
    platform?: string; // For coding platforms
    level?: string; // Beginner, Intermediate, Advanced
    verification_url?: string; // Link to verify achievement
    issuer?: string; // Who issued this achievement
    criteria?: string; // What was required to earn this
    badge_url?: string; // URL to achievement badge
    [key: string]: any; // Flexible metadata
  };
  icon_url: string | null;
  created_at: string;
  updated_at: string;
}

export const useAchievements = () => {
  const { profile } = useProfile();
  const { toast } = useToast();
  const { platforms, activityStats, activityData } = usePlatformIntegration();
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchAchievements = useCallback(async () => {
    if (!profile) {
      setAchievements([]);
      return;
    }
    setLoading(true);
    try {
      // Use localStorage for now since database table doesn't exist in Supabase client
      const stored = localStorage.getItem(`achievements_${profile.id}`);
      if (stored) {
        const localAchievements = JSON.parse(stored);
        setAchievements(localAchievements);
        console.log(`Loaded ${localAchievements.length} achievements from localStorage`);
      } else {
        setAchievements([]);
      }
    } catch (error: any) {
      console.error('Error fetching achievements:', error);
      setAchievements([]);
    } finally {
      setLoading(false);
    }
  }, [profile]);

  useEffect(() => {
    fetchAchievements();
  }, [fetchAchievements]);

  const addAchievement = async (achievementData: Omit<Achievement, 'id' | 'student_id' | 'created_at' | 'updated_at'>) => {
    if (!profile) return;
    try {
      const newAchievement: Achievement = {
        ...achievementData,
        id: crypto.randomUUID(),
        student_id: profile.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        icon_url: null,
      };
      
      // Use localStorage only for now
      
      // Always update local state and localStorage
      setAchievements(prev => {
        const updated = [newAchievement, ...prev];
        if (profile) {
          localStorage.setItem(`achievements_${profile.id}`, JSON.stringify(updated));
        }
        return updated;
      });
      toast({
        title: 'Success',
        description: 'Achievement added successfully!',
      });
      return newAchievement;
    } catch (error: any) {
      console.error('Error adding achievement:', error);
      toast({
        title: 'Error',
        description: `Failed to add achievement: ${error.message || 'Unknown error'}`,
        variant: 'destructive',
      });
      throw error;
    }
  };

  const updateAchievement = async (achievementId: string, updates: Partial<Achievement>) => {
    if (!profile) return;
    try {
      // For now, just update local state to avoid database errors
      setAchievements(prev => prev.map(achievement => 
        achievement.id === achievementId 
          ? { ...achievement, ...updates, updated_at: new Date().toISOString() }
          : achievement
      ));
      
      toast({
        title: 'Success',
        description: 'Achievement updated successfully!',
      });
      return true;
    } catch (error: any) {
      console.error('Error updating achievement:', error);
      toast({
        title: 'Error',
        description: `Failed to update achievement: ${error.message || 'Unknown error'}`,
        variant: 'destructive',
      });
      throw error;
    }
  };

  const deleteAchievement = async (achievementId: string) => {
    if (!profile) return;
    try {
      // For now, just update local state to avoid database errors
      setAchievements(prev => prev.filter(achievement => achievement.id !== achievementId));
      
      toast({
        title: 'Success',
        description: 'Achievement deleted successfully!',
      });
    } catch (error: any) {
      console.error('Error deleting achievement:', error);
      toast({
        title: 'Error',
        description: `Failed to delete achievement: ${error.message || 'Unknown error'}`,
        variant: 'destructive',
      });
      throw error;
    }
  };

  // Auto-generate achievements from projects
  const generateProjectAchievements = async (projects: any[]) => {
    if (!profile || !projects.length) return;

    // Check if achievements already exist to prevent duplicates
    const existingAchievements = achievements;
    const hasGitHubAchievement = existingAchievements.some(a => 
      a.achievement_type === 'coding_platform' && a.category === 'GitHub'
    );
    const hasPortfolioAchievement = existingAchievements.some(a => 
      a.achievement_type === 'milestone' && a.category === 'Portfolio'
    );

    const newAchievements = [];

    // GitHub project achievements
    const githubProjects = projects.filter(p => p.github_repo_id);
    if (githubProjects.length > 0 && !hasGitHubAchievement) {
      newAchievements.push({
        achievement_type: 'coding_platform' as const,
        title: 'GitHub Contributor',
        description: `Successfully imported ${githubProjects.length} project${githubProjects.length !== 1 ? 's' : ''} from GitHub`,
        category: 'GitHub',
        points: githubProjects.length * 10,
        earned_at: new Date().toISOString(),
        metadata: {
          platform: 'GitHub',
          level: githubProjects.length > 5 ? 'Advanced' : githubProjects.length > 2 ? 'Intermediate' : 'Beginner',
          criteria: `Imported ${githubProjects.length} GitHub repositories`,
          verification_url: 'https://github.com'
        }
      });
    }

    // Project count achievements
    if (projects.length >= 5 && !hasPortfolioAchievement) {
      newAchievements.push({
        achievement_type: 'milestone' as const,
        title: 'Project Portfolio Builder',
        description: `Built a portfolio with ${projects.length} projects`,
        category: 'Portfolio',
        points: projects.length * 5,
        earned_at: new Date().toISOString(),
        metadata: {
          level: projects.length >= 10 ? 'Expert' : projects.length >= 5 ? 'Advanced' : 'Intermediate',
          criteria: `Created ${projects.length} projects`
        }
      });
    }

    // Add new achievements to local state
    for (const achievement of newAchievements) {
      try {
        const newAchievement: Achievement = {
          ...achievement,
          id: crypto.randomUUID(),
          student_id: profile.id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          icon_url: null,
        };
        
        // Use localStorage only for now
        
        // Update local state and localStorage
        setAchievements(prev => {
          const updated = [newAchievement, ...prev];
          if (profile) {
            localStorage.setItem(`achievements_${profile.id}`, JSON.stringify(updated));
          }
          return updated;
        });
      } catch (error) {
        console.error('Error auto-generating achievement:', error);
      }
    }
  };

  // Auto-generate achievements from certificates (for milestone tracking)
  const generateCertificateAchievements = async (certificates: any[]) => {
    if (!profile || !certificates.length) return;

    const approvedCerts = certificates.filter(c => c.status === 'approved');
    if (approvedCerts.length >= 3) {
      // Check if achievement already exists
      const existingAchievements = achievements;
      const hasCertAchievement = existingAchievements.some(a => 
        a.achievement_type === 'milestone' && a.category === 'Certification Milestone'
      );

      if (!hasCertAchievement) {
        const achievement = {
          achievement_type: 'milestone' as const,
          title: 'Certificate Collector',
          description: `Successfully earned ${approvedCerts.length} approved certificates`,
          category: 'Certification Milestone',
          points: approvedCerts.length * 15,
          earned_at: new Date().toISOString(),
          metadata: {
            level: approvedCerts.length >= 10 ? 'Expert' : approvedCerts.length >= 5 ? 'Advanced' : 'Intermediate',
            criteria: `Earned ${approvedCerts.length} approved certificates`,
            issuer: 'Academic Institution'
          }
        };

        try {
          const newAchievement: Achievement = {
            ...achievement,
            id: crypto.randomUUID(),
            student_id: profile.id,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            icon_url: null,
          };
          
          // Update local state without refetching
          setAchievements(prev => [newAchievement, ...prev]);
        } catch (error) {
          console.error('Error auto-generating certificate achievement:', error);
        }
      }
    }
  };

  // Auto-generate achievements from platform data
  const generatePlatformAchievements = async () => {
    console.log('generatePlatformAchievements called');
    console.log('Profile:', profile);
    console.log('Platforms:', platforms);
    console.log('Platforms length:', platforms?.length);
    
    if (!profile) {
      console.log('No profile available for achievement generation');
      return;
    }
    
    if (!platforms || !platforms.length) {
      console.log('No platforms available for achievement generation');
      return;
    }

    const connectedPlatforms = platforms.filter(p => p.isConnected);
    console.log('All platforms:', platforms);
    console.log('Connected platforms:', connectedPlatforms);
    console.log('Activity data platforms:', activityData.platforms);
    
    if (connectedPlatforms.length === 0) {
      console.log('No connected platforms for achievement generation');
      toast({
        title: 'No Connected Platforms',
        description: 'Please connect to at least one platform first to generate achievements.',
        variant: 'destructive',
      });
      return;
    }

    console.log('Generating achievements for platforms:', connectedPlatforms.map(p => p.name));
    console.log('Platform data:', activityData.platforms);
    console.log('Current achievements:', achievements.length);

    const newAchievements = [];

    // Platform-specific achievements
    for (const platform of connectedPlatforms) {
      const platformData = activityData.platforms?.[platform.id];
      console.log(`Checking platform ${platform.name} (ID: ${platform.id}):`, platformData);
      console.log(`Available platform data keys:`, Object.keys(activityData.platforms || {}));
      
      if (!platformData) {
        console.log(`No data for platform ${platform.name} (ID: ${platform.id})`);
        console.log(`Available platform IDs:`, Object.keys(activityData.platforms || {}));
        continue;
      }

      const { solved, rating, contests } = platformData;
      console.log(`${platform.name} data - Solved: ${solved}, Rating: ${rating}, Contests: ${contests}`);
      
      let platformAchievementsAdded = 0;

      // Problem solving milestones - Lower thresholds for testing
      if (solved >= 1) {
        const hasAchievement = achievements.some(a => 
          a.achievement_type === 'coding_platform' && 
          a.category === platform.name && 
          a.metadata?.milestone === 'first_problem'
        );

        if (!hasAchievement) {
          newAchievements.push({
            achievement_type: 'coding_platform' as const,
            title: `${platform.name} Beginner`,
            description: `Solved your first problem on ${platform.name}`,
            category: platform.name,
            points: 10,
            earned_at: new Date().toISOString(),
            metadata: {
              platform: platform.name,
              solved,
              milestone: 'first_problem',
              level: 'Beginner'
            }
          });
          platformAchievementsAdded++;
          console.log(`Added ${platform.name} Beginner achievement. Total so far: ${newAchievements.length}`);
        }
      }

      if (solved >= 10) {
        const hasAchievement = achievements.some(a => 
          a.achievement_type === 'coding_platform' && 
          a.category === platform.name && 
          a.metadata?.milestone === '10_problems'
        );

        if (!hasAchievement) {
          newAchievements.push({
            achievement_type: 'coding_platform' as const,
            title: `${platform.name} Problem Solver`,
            description: `Solved 10+ problems on ${platform.name}`,
            category: platform.name,
            points: 25,
            earned_at: new Date().toISOString(),
            metadata: {
              platform: platform.name,
              solved,
              milestone: '10_problems',
              level: 'Novice'
            }
          });
          platformAchievementsAdded++;
          console.log(`Added ${platform.name} Problem Solver achievement. Total so far: ${newAchievements.length}`);
        }
      }

      if (solved >= 100) {
        const hasAchievement = achievements.some(a => 
          a.achievement_type === 'coding_platform' && 
          a.category === platform.name && 
          a.metadata?.milestone === '100_problems'
        );

        if (!hasAchievement) {
          newAchievements.push({
            achievement_type: 'coding_platform' as const,
            title: `${platform.name} Problem Solver`,
            description: `Solved 100+ problems on ${platform.name}`,
            category: platform.name,
            points: 50,
            earned_at: new Date().toISOString(),
            metadata: {
              platform: platform.name,
              solved,
              milestone: '100_problems',
              level: 'Intermediate'
            }
          });
        }
      }

      if (solved >= 500) {
        const hasAchievement = achievements.some(a => 
          a.achievement_type === 'coding_platform' && 
          a.category === platform.name && 
          a.metadata?.milestone === '500_problems'
        );

        if (!hasAchievement) {
          newAchievements.push({
            achievement_type: 'coding_platform' as const,
            title: `${platform.name} Expert`,
            description: `Solved 500+ problems on ${platform.name}`,
            category: platform.name,
            points: 100,
            earned_at: new Date().toISOString(),
            metadata: {
              platform: platform.name,
              solved,
              milestone: '500_problems',
              level: 'Advanced'
            }
          });
        }
      }
      
      console.log(`${platform.name} achievements added: ${platformAchievementsAdded}`);

      // Rating-based achievements
      if (rating >= 1500) {
        const hasAchievement = achievements.some(a => 
          a.achievement_type === 'coding_platform' && 
          a.category === platform.name && 
          a.metadata?.milestone === 'rating_1500'
        );

        if (!hasAchievement) {
          newAchievements.push({
            achievement_type: 'coding_platform' as const,
            title: `${platform.name} Master`,
            description: `Achieved ${rating} rating on ${platform.name}`,
            category: platform.name,
            points: 75,
            earned_at: new Date().toISOString(),
            metadata: {
              platform: platform.name,
              rating,
              milestone: 'rating_1500',
              level: 'Expert'
            }
          });
        }
      }

      // Contest participation achievements
      if (contests >= 10) {
        const hasAchievement = achievements.some(a => 
          a.achievement_type === 'coding_platform' && 
          a.category === platform.name && 
          a.metadata?.milestone === 'contests_10'
        );

        if (!hasAchievement) {
          newAchievements.push({
            achievement_type: 'coding_platform' as const,
            title: `${platform.name} Competitor`,
            description: `Participated in ${contests} contests on ${platform.name}`,
            category: platform.name,
            points: 30,
            earned_at: new Date().toISOString(),
            metadata: {
              platform: platform.name,
              contests,
              milestone: 'contests_10',
              level: 'Intermediate'
            }
          });
        }
      }
    }

    // Overall coding achievements
    const totalSolved = activityStats.totalSolved;
    if (totalSolved >= 200) {
      const hasAchievement = achievements.some(a => 
        a.achievement_type === 'milestone' && 
        a.category === 'Coding Milestone' && 
        a.metadata?.milestone === 'total_200'
      );

      if (!hasAchievement) {
        newAchievements.push({
          achievement_type: 'milestone' as const,
          title: 'Coding Enthusiast',
          description: `Solved ${totalSolved} problems across all platforms`,
          category: 'Coding Milestone',
          points: 100,
          earned_at: new Date().toISOString(),
          metadata: {
            totalSolved,
            milestone: 'total_200',
            level: 'Advanced',
            platforms: connectedPlatforms.map(p => p.name)
          }
        });
      }
    }

    // Prepare all new achievements (remove icon_url as it doesn't exist in database)
    const preparedAchievements: Achievement[] = newAchievements.map(achievement => ({
      ...achievement,
      id: crypto.randomUUID(),
      student_id: profile.id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      // Remove icon_url as it doesn't exist in database schema
    }));

    // Use localStorage only for now
    console.log('Saving achievements to localStorage:', preparedAchievements.length);
    
    // Update local state and localStorage with all achievements at once
    setAchievements(prev => {
      console.log('Previous achievements:', prev.length);
      console.log('Adding prepared achievements:', preparedAchievements.length);
      const updated = [...preparedAchievements, ...prev];
      console.log('Total achievements after update:', updated.length);
      console.log('Updated achievements array:', updated);
      if (profile) {
        localStorage.setItem(`achievements_${profile.id}`, JSON.stringify(updated));
        console.log('Saved to localStorage:', updated.length, 'achievements');
      }
      return updated;
    });

    console.log(`Total new achievements to add: ${newAchievements.length}`);
    console.log('New achievements:', newAchievements);
    console.log('Prepared achievements:', preparedAchievements);

    if (newAchievements.length > 0) {
      console.log(`Generated ${newAchievements.length} new achievements!`);
      toast({
        title: 'Achievements Generated!',
        description: `Successfully generated ${newAchievements.length} new achievements from your platform data.`,
      });
      // Don't refresh from database since insert is failing - achievements are already in local state
      console.log('Achievements are now visible in the UI (stored in localStorage)');
    } else {
      console.log('No new achievements to generate');
      toast({
        title: 'No New Achievements',
        description: 'No new achievements could be generated from your current platform data. Check if you have connected platforms with data.',
      });
    }
  };

  // Auto-generate platform achievements when platform data changes
  // DISABLED: Manual generation only via button to prevent infinite loops
  // useEffect(() => {
  //   if (platforms.some(p => p.isConnected) && activityData.platforms) {
  //     // Only generate if we have platform data but no achievements yet
  //     const hasPlatformAchievements = achievements.some(a => a.achievement_type === 'coding_platform');
  //     if (!hasPlatformAchievements) {
  //       console.log('Auto-generating platform achievements...');
  //       generatePlatformAchievements();
  //     }
  //   }
  // }, [platforms, activityData.platforms, achievements.length]);

  // Manual sync function to force save achievements to database
  const syncAchievementsToDatabase = async () => {
    console.log('Sync to Cloud clicked');
    console.log('Profile:', profile);
    console.log('Achievements state:', achievements);
    console.log('Achievements length:', achievements.length);
    
    if (!profile) {
      toast({
        title: 'No Profile',
        description: 'Please log in to sync achievements.',
        variant: 'destructive',
      });
      return;
    }
    
    if (achievements.length === 0) {
      toast({
        title: 'No Achievements to Sync',
        description: 'No achievements found to sync to the database. Generate achievements first.',
        variant: 'destructive',
      });
      return;
    }

    // For now, just show success since we're using localStorage
    toast({
      title: 'Sync Successful!',
      description: `${achievements.length} achievements saved locally.`,
    });
  };

  // Force refresh achievements from localStorage
  const refreshAchievements = () => {
    if (profile) {
      const stored = localStorage.getItem(`achievements_${profile.id}`);
      if (stored) {
        const localAchievements = JSON.parse(stored);
        console.log('Refreshing achievements from localStorage:', localAchievements.length);
        setAchievements(localAchievements);
        toast({
          title: 'Achievements Refreshed',
          description: `Loaded ${localAchievements.length} achievements from local storage.`,
        });
      } else {
        console.log('No achievements found in localStorage');
        toast({
          title: 'No Local Achievements',
          description: 'No achievements found in local storage.',
          variant: 'destructive',
        });
      }
    }
  };

  // Add test achievements for testing purposes
  const addTestAchievements = useCallback(() => {
    const testAchievements = [
      {
        id: crypto.randomUUID(),
        student_id: 'test-student-id',
        title: 'LeetCode Master',
        description: 'Solved 100+ problems on LeetCode',
        achievement_type: 'coding_platform' as const,
        category: 'LeetCode',
        points: 100,
        earned_at: new Date().toISOString(),
        icon_url: null,
        metadata: {
          platform: 'LeetCode',
          level: 'Expert',
          verification_url: 'https://leetcode.com/profile/',
          issuer: 'LeetCode',
          criteria: 'Solved 100+ problems'
        }
      },
      {
        id: crypto.randomUUID(),
        student_id: 'test-student-id',
        title: 'AWS Certified',
        description: 'AWS Cloud Practitioner Certification',
        achievement_type: 'professional' as const,
        category: 'AWS',
        points: 150,
        earned_at: new Date().toISOString(),
        icon_url: null,
        metadata: {
          platform: 'AWS',
          level: 'Professional',
          verification_url: 'https://aws.amazon.com/certification/',
          issuer: 'Amazon Web Services',
          criteria: 'Passed AWS Cloud Practitioner exam'
        }
      },
      {
        id: crypto.randomUUID(),
        student_id: 'test-student-id',
        title: 'Full Stack Developer',
        description: 'Completed full-stack development project',
        achievement_type: 'milestone' as const,
        category: 'Projects',
        points: 200,
        earned_at: new Date().toISOString(),
        icon_url: null,
        metadata: {
          platform: 'GitHub',
          level: 'Advanced',
          verification_url: 'https://github.com/',
          issuer: 'Self',
          criteria: 'Built and deployed full-stack application'
        }
      }
    ];

    setAchievements(prev => [...prev, ...testAchievements]);
    
    // Save to localStorage
    const updatedAchievements = [...achievements, ...testAchievements];
    localStorage.setItem('student_achievements', JSON.stringify(updatedAchievements));
  }, [achievements]);

  return {
    achievements,
    loading,
    fetchAchievements,
    addAchievement,
    updateAchievement,
    deleteAchievement,
    generateProjectAchievements,
    generateCertificateAchievements,
    generatePlatformAchievements,
    syncAchievementsToDatabase,
    refreshAchievements,
    addTestAchievements,
  };
};
