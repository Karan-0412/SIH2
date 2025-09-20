import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import {
  ArrowLeft,
  Plus,
  Search,
  Filter,
  ExternalLink,
  Edit,
  Trash,
  Github,
  Code,
  BookOpen,
  Briefcase,
  Award,
  Globe,
  Lock,
  Users,
  Loader2,
  Eye,
  Star,
  Calendar,
  Trash2,
  Palette,
  GraduationCap,
  FolderOpen
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { useProjects, Project } from '@/hooks/useProjects';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import GitHubService, { GitHubRepository } from '@/services/githubService';

const MyProjectsPage: React.FC = () => {
  const { signOut } = useAuth();
  const { profile } = useProfile();
  const { projects, addProject, updateProject, deleteProject, loading, fetchProjects } = useProjects();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [isDarkMode, setIsDarkMode] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [showAddProjectDialog, setShowAddProjectDialog] = useState(false);
  const [showEditProjectDialog, setShowEditProjectDialog] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showGithubImportDialog, setShowGithubImportDialog] = useState(false);
  const [githubRepos, setGithubRepos] = useState<GitHubRepository[]>([]);
  const [selectedRepos, setSelectedRepos] = useState<Set<number>>(new Set());
  const [githubLoading, setGithubLoading] = useState(false);
  const [importLoading, setImportLoading] = useState(false);
  const [githubUser, setGithubUser] = useState<any>(null);
  const [showUsernameDialog, setShowUsernameDialog] = useState(false);
  const [githubUsername, setGithubUsername] = useState('');
  const [editProject, setEditProject] = useState<Project | null>(null);
  const [githubProjects, setGithubProjects] = useState<GitHubRepository[]>([]);

  // Form state for new project
  const [newProject, setNewProject] = useState({
    title: '',
    description: '',
    category: 'project',
    image_url: '',
    external_url: '',
    visibility: 'public' as 'public' | 'private' | 'connections_only',
    featured: false,
  });

  // Categories with icons
  const categories = {
    project: { icon: Code, color: 'bg-blue-500', label: 'Project' },
    certificate: { icon: Award, color: 'bg-green-500', label: 'Certificate' },
    achievement: { icon: Star, color: 'bg-yellow-500', label: 'Achievement' },
    experience: { icon: Briefcase, color: 'bg-purple-500', label: 'Experience' },
    creative: { icon: Palette, color: 'bg-pink-500', label: 'Creative' },
    academic: { icon: BookOpen, color: 'bg-indigo-500', label: 'Academic' }
  };

  // All projects come from the database now (including GitHub-imported ones)
  const allProjects = projects;

  // Filter projects based on search and category
  const filteredProjects = allProjects.filter(project => {
    const matchesSearch = searchTerm === '' ||
      project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.description?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = filterCategory === 'all' || project.category === filterCategory;

    const matchesTab = activeTab === 'all' ||
      (activeTab === 'featured' && project.featured) ||
      (activeTab === 'public' && project.visibility === 'public') ||
      (activeTab === 'private' && project.visibility === 'private');

    return matchesSearch && matchesCategory && matchesTab;
  });

  const getCategoryIcon = (category: string) => {
    return categories[category as keyof typeof categories]?.icon || Code;
  };

  const getCategoryColor = (category: string) => {
    return categories[category as keyof typeof categories]?.color || 'bg-gray-500';
  };

  const openEditDialog = (project: Project) => {
    setSelectedProject(project);
    setEditProject({
      id: project.id,
      student_id: project.student_id,
      title: project.title,
      description: project.description || '',
      category: project.category,
      image_url: project.image_url || '',
      external_url: project.external_url || '',
      visibility: project.visibility,
      featured: project.featured,
      github_repo_id: project.github_repo_id,
      github_data: project.github_data,
      created_at: project.created_at,
      updated_at: project.updated_at
    });
    setShowEditProjectDialog(true);
  };

  const handleAddProject = async () => {
    if (!newProject.title.trim()) {
      toast({
        title: 'Error',
        description: 'Project title is required',
        variant: 'destructive'
      });
      return;
    }

    if (!profile) {
      toast({
        title: 'Error',
        description: 'No profile found. Please refresh the page.',
        variant: 'destructive'
      });
      return;
    }

    try {
      const result = await addProject({
        title: newProject.title,
        description: newProject.description || null,
        category: newProject.category || 'project',
        image_url: newProject.image_url || null,
        external_url: newProject.external_url || null,
        visibility: newProject.visibility || 'public',
        featured: newProject.featured || false
      });

      setNewProject({
        title: '',
        description: '',
        category: 'project',
        image_url: '',
        external_url: '',
        visibility: 'public',
        featured: false
      });
      setShowAddProjectDialog(false);
      toast({
        title: 'Success',
        description: 'Project added successfully!',
      });
    } catch (error: any) {
      console.error('Error adding project:', error);
      toast({
        title: 'Error',
        description: `Failed to add project: ${error.message || 'Unknown error'}`,
        variant: 'destructive'
      });
    }
  };

  const handleEditProject = async () => {
    if (!editProject || !editProject.title.trim()) return;

    try {
      await updateProject(editProject.id, editProject);
      
      toast({
        title: 'Success',
        description: 'Project updated successfully!',
      });
      
      setShowEditProjectDialog(false);
      setSelectedProject(null);
      setEditProject(null);
    } catch (error) {
      console.error('Error updating project:', error);
      toast({
        title: 'Error',
        description: 'Failed to update project',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteProject = async (projectId: string) => {
    if (!window.confirm('Are you sure you want to delete this project?')) return;

    try {
      await deleteProject(projectId);
      
      toast({
        title: 'Success',
        description: 'Project deleted successfully!',
      });
    } catch (error) {
      console.error('Error deleting project:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete project',
        variant: 'destructive',
      });
    }
  };

  const getVisibilityIcon = (visibility: string) => {
    switch (visibility) {
      case 'public': return <Globe className="h-4 w-4" />;
      case 'private': return <Lock className="h-4 w-4" />;
      case 'connections_only': return <Users className="h-4 w-4" />;
      default: return <Globe className="h-4 w-4" />;
    }
  };

  const getVisibilityLabel = (visibility: string) => {
    switch (visibility) {
      case 'public': return 'Public';
      case 'private': return 'Private';
      case 'connections_only': return 'Connections Only';
      default: return 'Public';
    }
  };

  // GitHub integration functions
  const handleGithubConnect = () => {
    setShowUsernameDialog(true);
  };

  const handleUsernameSubmit = async () => {
    if (!githubUsername.trim()) {
      toast({
        title: 'Username Required',
        description: 'Please enter a GitHub username',
        variant: 'destructive'
      });
      return;
    }

    const githubService = GitHubService.getInstance();
    githubService.setUsername(githubUsername.trim());
    setShowUsernameDialog(false);
    
    toast({
      title: 'GitHub Connected',
      description: `Connected to @${githubUsername}`,
    });
  };

  const handleGithubImport = async () => {
    const githubService = GitHubService.getInstance();
    
    if (!githubService.isAuthenticated()) {
      toast({
        title: 'Not Connected',
        description: 'Please connect to GitHub first by entering a username.',
        variant: 'destructive'
      });
      return;
    }

    setGithubLoading(true);
    try {
      const [user, repos] = await Promise.all([
        githubService.getCurrentUser(),
        githubService.getUserRepositories({ per_page: 100 })
      ]);
      
      setGithubUser(user);
      setGithubRepos(repos);
      setShowGithubImportDialog(true);
    } catch (error: any) {
      console.error('Error fetching GitHub data:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to fetch GitHub repositories',
        variant: 'destructive'
      });
    } finally {
      setGithubLoading(false);
    }
  };

  const handleImportSelectedRepos = async () => {
    if (selectedRepos.size === 0) {
      toast({
        title: 'No Selection',
        description: 'Please select at least one repository to display',
        variant: 'destructive'
      });
      return;
    }

    setImportLoading(true);
    const reposToImport = githubRepos.filter(repo => selectedRepos.has(repo.id));
    
    try {
      // Save each GitHub repository as a project in the database
      for (const repo of reposToImport) {
        await addProject({
          title: repo.name,
          description: repo.description || `A ${repo.language || 'software'} project with ${repo.stargazers_count} stars and ${repo.forks_count} forks.`,
          category: 'project',
          image_url: null,
          external_url: repo.html_url,
          visibility: (repo.private ? 'private' : 'public') as 'public' | 'private' | 'connections_only',
          featured: repo.stargazers_count > 10 || repo.forks_count > 5,
          github_repo_id: repo.id,
          github_data: repo
        });
      }

      toast({
        title: 'Success',
        description: `Added ${reposToImport.length} project${reposToImport.length !== 1 ? 's' : ''} to your projects!`,
      });

      setShowGithubImportDialog(false);
      setSelectedRepos(new Set());
    } catch (error: any) {
      console.error('Error adding repositories:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to add repositories',
        variant: 'destructive'
      });
    } finally {
      setImportLoading(false);
    }
  };

  const toggleRepoSelection = (repoId: number) => {
    setSelectedRepos(prev => {
      const newSet = new Set(prev);
      if (newSet.has(repoId)) {
        newSet.delete(repoId);
      } else {
        newSet.add(repoId);
      }
      return newSet;
    });
  };

  const selectAllRepos = () => {
    setSelectedRepos(new Set(githubRepos.map(repo => repo.id)));
  };

  const clearSelection = () => {
    setSelectedRepos(new Set());
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-slate-800'}`}>
      <div className="max-w-7xl mx-auto p-6 space-y-8">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex-1">
            <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl">My Projects</h1>
            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-slate-600'}`}>
              Showcase your work and achievements
            </p>
          </div>
          <div className="flex space-x-3">
            <Button
              onClick={async () => {
                await fetchProjects();
                toast({
                  title: 'Refreshed',
                  description: 'Projects data updated!',
                });
              }}
              variant="outline"
              className="border-green-300 text-green-700 hover:bg-green-50"
            >
              <Eye className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            {GitHubService.getInstance().isAuthenticated() ? (
              <Button
                onClick={handleGithubImport}
                disabled={githubLoading}
                variant="outline"
                className="border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                {githubLoading ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Github className="h-4 w-4 mr-2" />
                )}
                Import from GitHub
              </Button>
            ) : (
              <Button
                onClick={handleGithubConnect}
                variant="outline"
                className="border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                <Github className="h-4 w-4 mr-2" />
                Connect GitHub
              </Button>
            )}
            <Button
              onClick={() => setShowAddProjectDialog(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Project
            </Button>
          </div>
        </div>

        {/* Search and Filter Section */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search projects..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="project">Projects</SelectItem>
                <SelectItem value="certificate">Certificates</SelectItem>
                <SelectItem value="achievement">Achievements</SelectItem>
                <SelectItem value="experience">Experience</SelectItem>
                <SelectItem value="creative">Creative</SelectItem>
                <SelectItem value="academic">Academic</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="all">All Projects</TabsTrigger>
              <TabsTrigger value="featured">Featured</TabsTrigger>
              <TabsTrigger value="public">Public</TabsTrigger>
              <TabsTrigger value="private">Private</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            <div className="col-span-full flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin" />
              <span className="ml-2">Loading projects...</span>
            </div>
          ) : filteredProjects.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <FolderOpen className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No projects found</h3>
              <p className="text-gray-500 mb-4">
                {searchTerm || filterCategory !== 'all' 
                  ? 'Try adjusting your search or filter criteria.'
                  : 'Get started by adding your first project or importing from GitHub.'
                }
              </p>
              <Button onClick={() => setShowAddProjectDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Project
              </Button>
            </div>
          ) : (
            filteredProjects.map((project) => {
              const CategoryIcon = getCategoryIcon(project.category);
              const categoryColor = getCategoryColor(project.category);
              
              return (
                <Card key={project.id} className="group hover:shadow-lg transition-shadow duration-200">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-2">
                        <div className={`p-2 rounded-lg ${categoryColor} text-white`}>
                          <CategoryIcon className="h-4 w-4" />
                        </div>
                        <div>
                          <CardTitle className="text-lg font-semibold line-clamp-1 flex items-center">
                            {project.title}
                            {project.github_repo_id && (
                              <Github className="h-4 w-4 ml-2 text-gray-500" />
                            )}
                          </CardTitle>
                          <div className="flex items-center space-x-2 mt-1">
                            <Badge variant="secondary" className="text-xs">
                              {categories[project.category as keyof typeof categories]?.label || project.category}
                            </Badge>
                            {project.featured && (
                              <Badge variant="default" className="text-xs bg-yellow-500">
                                <Star className="h-3 w-3 mr-1" />
                                Featured
                              </Badge>
                            )}
                            {project.github_repo_id && (
                              <Badge variant="outline" className="text-xs">
                                <Github className="h-3 w-3 mr-1" />
                                GitHub
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-1">
                        <div className="flex items-center text-xs text-gray-500">
                          {getVisibilityIcon(project.visibility)}
                          <span className="ml-1">{getVisibilityLabel(project.visibility)}</span>
                        </div>
                        {!project.github_repo_id && (
                          <div className="flex space-x-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openEditDialog(project)}
                              className="h-8 w-8 p-0"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteProject(project.id)}
                              className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                            >
                              <Trash className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <CardDescription className="text-sm text-gray-600 line-clamp-2 mb-4">
                      {project.description || 'No description provided.'}
                    </CardDescription>
                    
                    {project.image_url && (
                      <div className="mb-4">
                        <img
                          src={project.image_url}
                          alt={project.title}
                          className="w-full h-32 object-cover rounded-lg"
                        />
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-xs text-gray-500">
                        <Calendar className="h-3 w-3 mr-1" />
                        {new Date(project.created_at).toLocaleDateString()}
                      </div>
                      {project.external_url && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(project.external_url, '_blank')}
                          className="text-xs"
                        >
                          <ExternalLink className="h-3 w-3 mr-1" />
                          View
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>

        {/* Add Project Dialog */}
        <Dialog open={showAddProjectDialog} onOpenChange={setShowAddProjectDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Add New Project</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Project Title *</Label>
                <Input
                  id="title"
                  value={newProject.title}
                  onChange={(e) => setNewProject({ ...newProject, title: e.target.value })}
                  placeholder="Enter project title"
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newProject.description}
                  onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                  placeholder="Describe your project"
                  rows={3}
                />
              </div>
              <div>
                <Label htmlFor="category">Category</Label>
                <Select value={newProject.category} onValueChange={(value) => setNewProject({ ...newProject, category: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="project">Project</SelectItem>
                    <SelectItem value="certificate">Certificate</SelectItem>
                    <SelectItem value="achievement">Achievement</SelectItem>
                    <SelectItem value="experience">Experience</SelectItem>
                    <SelectItem value="creative">Creative</SelectItem>
                    <SelectItem value="academic">Academic</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="image_url">Image URL</Label>
                <Input
                  id="image_url"
                  value={newProject.image_url}
                  onChange={(e) => setNewProject({ ...newProject, image_url: e.target.value })}
                  placeholder="https://example.com/image.jpg"
                />
              </div>
              <div>
                <Label htmlFor="external_url">External URL</Label>
                <Input
                  id="external_url"
                  value={newProject.external_url}
                  onChange={(e) => setNewProject({ ...newProject, external_url: e.target.value })}
                  placeholder="https://github.com/username/repo"
                />
              </div>
              <div>
                <Label htmlFor="visibility">Visibility</Label>
                <Select value={newProject.visibility} onValueChange={(value: any) => setNewProject({ ...newProject, visibility: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="public">Public</SelectItem>
                    <SelectItem value="private">Private</SelectItem>
                    <SelectItem value="connections_only">Connections Only</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="featured"
                  checked={newProject.featured}
                  onCheckedChange={(checked) => setNewProject({ ...newProject, featured: !!checked })}
                />
                <Label htmlFor="featured">Featured Project</Label>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowAddProjectDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddProject}>
                Add Project
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Project Dialog */}
        <Dialog open={showEditProjectDialog} onOpenChange={setShowEditProjectDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Edit Project</DialogTitle>
            </DialogHeader>
            {editProject && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="edit-title">Project Title *</Label>
                  <Input
                    id="edit-title"
                    value={editProject.title}
                    onChange={(e) => setEditProject({ ...editProject, title: e.target.value })}
                    placeholder="Enter project title"
                  />
                </div>
                <div>
                  <Label htmlFor="edit-description">Description</Label>
                  <Textarea
                    id="edit-description"
                    value={editProject.description}
                    onChange={(e) => setEditProject({ ...editProject, description: e.target.value })}
                    placeholder="Describe your project"
                    rows={3}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-category">Category</Label>
                  <Select value={editProject.category} onValueChange={(value) => setEditProject({ ...editProject, category: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="project">Project</SelectItem>
                      <SelectItem value="certificate">Certificate</SelectItem>
                      <SelectItem value="achievement">Achievement</SelectItem>
                      <SelectItem value="experience">Experience</SelectItem>
                      <SelectItem value="creative">Creative</SelectItem>
                      <SelectItem value="academic">Academic</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="edit-image_url">Image URL</Label>
                  <Input
                    id="edit-image_url"
                    value={editProject.image_url}
                    onChange={(e) => setEditProject({ ...editProject, image_url: e.target.value })}
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
                <div>
                  <Label htmlFor="edit-external_url">External URL</Label>
                  <Input
                    id="edit-external_url"
                    value={editProject.external_url}
                    onChange={(e) => setEditProject({ ...editProject, external_url: e.target.value })}
                    placeholder="https://github.com/username/repo"
                  />
                </div>
                <div>
                  <Label htmlFor="edit-visibility">Visibility</Label>
                  <Select value={editProject.visibility} onValueChange={(value: any) => setEditProject({ ...editProject, visibility: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="public">Public</SelectItem>
                      <SelectItem value="private">Private</SelectItem>
                      <SelectItem value="connections_only">Connections Only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="edit-featured"
                    checked={editProject.featured}
                    onCheckedChange={(checked) => setEditProject({ ...editProject, featured: !!checked })}
                  />
                  <Label htmlFor="edit-featured">Featured Project</Label>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowEditProjectDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleEditProject}>
                Update Project
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* GitHub Username Dialog */}
        <Dialog open={showUsernameDialog} onOpenChange={setShowUsernameDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Connect to GitHub</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="github-username">GitHub Username</Label>
                <Input
                  id="github-username"
                  value={githubUsername}
                  onChange={(e) => setGithubUsername(e.target.value)}
                  placeholder="Enter your GitHub username"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowUsernameDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleUsernameSubmit}>
                Connect
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* GitHub Import Dialog */}
        <Dialog open={showGithubImportDialog} onOpenChange={setShowGithubImportDialog}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Import Projects from GitHub</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <p className="text-sm text-gray-600">
                  Select repositories to add to your projects display
                </p>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm" onClick={selectAllRepos}>
                    Select All
                  </Button>
                  <Button variant="outline" size="sm" onClick={clearSelection}>
                    Clear
                  </Button>
                </div>
              </div>
              
              <div className="grid gap-3 max-h-96 overflow-y-auto">
                {githubRepos.map((repo) => (
                  <div key={repo.id} className="flex items-center space-x-3 p-3 border rounded-lg">
                    <Checkbox
                      checked={selectedRepos.has(repo.id)}
                      onCheckedChange={() => toggleRepoSelection(repo.id)}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <h4 className="font-medium truncate">{repo.name}</h4>
                        {repo.private && (
                          <Lock className="h-4 w-4 text-gray-400" />
                        )}
                      </div>
                      <p className="text-sm text-gray-600 truncate">
                        {repo.description || 'No description'}
                      </p>
                      <div className="flex items-center space-x-4 text-xs text-gray-500 mt-1">
                        <span>{repo.language || 'No language'}</span>
                        <span>{repo.stargazers_count} stars</span>
                        <span>{repo.forks_count} forks</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowGithubImportDialog(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleImportSelectedRepos}
                disabled={selectedRepos.size === 0 || importLoading}
              >
                {importLoading ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : null}
                Add Selected ({selectedRepos.size})
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default MyProjectsPage;