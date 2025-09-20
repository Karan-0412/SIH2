import React, { useState, useEffect } from 'react';
import { useAchievements } from '@/hooks/useAchievements';
import { useProjects } from '@/hooks/useProjects';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { 
  Award, 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  Filter, 
  Github, 
  BookOpen, 
  Trophy, 
  Star, 
  Target, 
  Users, 
  Zap,
  ExternalLink,
  CheckCircle,
  Clock,
  TrendingUp
} from 'lucide-react';

const AchievementsPage: React.FC = () => {
  const { 
    achievements, 
    loading, 
    addAchievement, 
    updateAchievement, 
    deleteAchievement,
    generateProjectAchievements,
    generateCertificateAchievements
  } = useAchievements();
  const { projects } = useProjects();
  const { toast } = useToast();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingAchievement, setEditingAchievement] = useState<any>(null);
  const [certificates, setCertificates] = useState<any[]>([]);

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    achievement_type: 'academic' as const,
    category: '',
    points: 10,
    metadata: {
      platform: '',
      level: 'Beginner',
      verification_url: '',
      issuer: '',
      criteria: ''
    }
  });

  // Fetch certificates for auto-generation
  useEffect(() => {
    const fetchCertificates = async () => {
      try {
        const { data, error } = await supabase
          .from('certificates')
          .select('*')
          .order('uploaded_at', { ascending: false });
        
        if (error) throw error;
        setCertificates(data || []);
      } catch (error) {
        console.error('Error fetching certificates:', error);
      }
    };
    
    fetchCertificates();
  }, []);

  // Auto-generate achievements when projects change (only once)
  useEffect(() => {
    if (projects.length > 0) {
      generateProjectAchievements(projects);
    }
  }, [projects.length]); // Only depend on projects.length to prevent infinite loops

  // Auto-generate achievements when certificates change (only once)
  useEffect(() => {
    if (certificates.length > 0) {
      generateCertificateAchievements(certificates);
    }
  }, [certificates.length]); // Only depend on certificates.length to prevent infinite loops

  const getAchievementIcon = (type: string) => {
    switch (type) {
      case 'coding_platform':
        return <Github className="h-5 w-5" />;
      case 'academic':
        return <BookOpen className="h-5 w-5" />;
      case 'co_curricular':
        return <Users className="h-5 w-5" />;
      case 'professional':
        return <Trophy className="h-5 w-5" />;
      case 'soft_skills':
        return <Star className="h-5 w-5" />;
      case 'course_completion':
        return <BookOpen className="h-5 w-5" />;
      case 'streak':
        return <Zap className="h-5 w-5" />;
      case 'milestone':
        return <Target className="h-5 w-5" />;
      case 'participation':
        return <Users className="h-5 w-5" />;
      case 'excellence':
        return <Star className="h-5 w-5" />;
      default:
        return <Award className="h-5 w-5" />;
    }
  };

  const getAchievementColor = (type: string) => {
    switch (type) {
      case 'coding_platform':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'academic':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'co_curricular':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'professional':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'soft_skills':
        return 'bg-pink-100 text-pink-800 border-pink-200';
      case 'course_completion':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'streak':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'milestone':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'participation':
        return 'bg-pink-100 text-pink-800 border-pink-200';
      case 'excellence':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const filteredAchievements = achievements.filter(achievement => {
    const matchesSearch = achievement.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         achievement.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         achievement.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === 'all' || achievement.achievement_type === filterType;
    return matchesSearch && matchesFilter;
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingAchievement) {
        await updateAchievement(editingAchievement.id, formData);
        setEditingAchievement(null);
      } else {
        await addAchievement({
          ...formData,
          earned_at: new Date().toISOString(),
          icon_url: null
        });
      }
      setShowAddDialog(false);
      resetForm();
    } catch (error) {
      console.error('Error saving achievement:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      achievement_type: 'academic',
      category: '',
      points: 10,
      metadata: {
        platform: '',
        level: 'Beginner',
        verification_url: '',
        issuer: '',
        criteria: ''
      }
    });
  };

  const handleEdit = (achievement: any) => {
    setEditingAchievement(achievement);
    setFormData({
      title: achievement.title,
      description: achievement.description || '',
      achievement_type: achievement.achievement_type,
      category: achievement.category,
      points: achievement.points,
      metadata: achievement.metadata || {}
    });
    setShowAddDialog(true);
  };

  const handleDelete = async (achievementId: string) => {
    if (window.confirm('Are you sure you want to delete this achievement?')) {
      try {
        await deleteAchievement(achievementId);
      } catch (error) {
        console.error('Error deleting achievement:', error);
      }
    }
  };

  const totalPoints = achievements.reduce((sum, achievement) => sum + achievement.points, 0);
  const achievementTypes = [...new Set(achievements.map(a => a.achievement_type))];

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading achievements...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">My Achievements</h1>
          <p className="text-gray-600">Track and manage your academic and professional achievements</p>
        </div>
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button onClick={() => { resetForm(); setEditingAchievement(null); }}>
              <Plus className="h-4 w-4 mr-2" />
              Add Achievement
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingAchievement ? 'Edit Achievement' : 'Add New Achievement'}
              </DialogTitle>
            </DialogHeader>
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
                    onValueChange={(value) => setFormData({ ...formData, achievement_type: value as any })}
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

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="platform">Platform (for coding achievements)</Label>
                  <Input
                    id="platform"
                    value={formData.metadata.platform}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      metadata: { ...formData.metadata, platform: e.target.value }
                    })}
                    placeholder="e.g., LeetCode, GitHub, Codeforces"
                  />
                </div>
                <div>
                  <Label htmlFor="level">Level</Label>
                  <Select
                    value={formData.metadata.level}
                    onValueChange={(value) => setFormData({ 
                      ...formData, 
                      metadata: { ...formData.metadata, level: value }
                    })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Beginner">Beginner</SelectItem>
                      <SelectItem value="Intermediate">Intermediate</SelectItem>
                      <SelectItem value="Advanced">Advanced</SelectItem>
                      <SelectItem value="Expert">Expert</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setShowAddDialog(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  {editingAchievement ? 'Update' : 'Add'} Achievement
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Award className="h-8 w-8 text-primary" />
              <div>
                <p className="text-2xl font-bold">{achievements.length}</p>
                <p className="text-sm text-gray-600">Total Achievements</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-2xl font-bold">{totalPoints}</p>
                <p className="text-sm text-gray-600">Total Points</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Trophy className="h-8 w-8 text-yellow-600" />
              <div>
                <p className="text-2xl font-bold">{achievementTypes.length}</p>
                <p className="text-sm text-gray-600">Categories</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-2xl font-bold">
                  {achievements.filter(a => a.achievement_type === 'milestone').length}
                </p>
                <p className="text-sm text-gray-600">Milestones</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search achievements..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-full sm:w-48">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
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

      {/* Achievements Grid */}
      {filteredAchievements.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Award className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No achievements found</h3>
            <p className="text-gray-600 mb-4">
              {searchTerm || filterType !== 'all' 
                ? 'Try adjusting your search or filter criteria'
                : 'Start by adding your first achievement or importing projects from GitHub'
              }
            </p>
            {!searchTerm && filterType === 'all' && (
              <Button onClick={() => setShowAddDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Achievement
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAchievements.map((achievement) => (
            <Card key={achievement.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${getAchievementColor(achievement.achievement_type)}`}>
                      {getAchievementIcon(achievement.achievement_type)}
                    </div>
                    <div>
                      <CardTitle className="text-lg">{achievement.title}</CardTitle>
                      <Badge variant="outline" className="mt-1">
                        {achievement.category}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex space-x-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(achievement)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(achievement.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                {achievement.description && (
                  <p className="text-sm text-gray-600 mb-3">{achievement.description}</p>
                )}
                
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Points:</span>
                    <span className="text-sm font-bold text-primary">{achievement.points}</span>
                  </div>
                  
                  {achievement.metadata?.level && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Level:</span>
                      <Badge variant="secondary" className="text-xs">
                        {achievement.metadata.level}
                      </Badge>
                    </div>
                  )}
                  
                  {achievement.metadata?.platform && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Platform:</span>
                      <span className="text-sm text-gray-600">{achievement.metadata.platform}</span>
                    </div>
                  )}
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Earned:</span>
                    <span className="text-sm text-gray-600">
                      {new Date(achievement.earned_at).toLocaleDateString()}
                    </span>
                  </div>
                  
                  {achievement.metadata?.verification_url && (
                    <div className="pt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        asChild
                        className="w-full"
                      >
                        <a
                          href={achievement.metadata.verification_url}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <ExternalLink className="h-3 w-3 mr-2" />
                          Verify
                        </a>
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default AchievementsPage;
