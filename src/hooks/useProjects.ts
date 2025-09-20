import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useProfile } from './useProfile';
import { useToast } from './use-toast';

export interface Project {
  id: string;
  student_id: string;
  title: string;
  description: string | null;
  category: string;
  image_url: string | null;
  external_url: string | null;
  visibility: 'public' | 'private' | 'connections_only';
  featured: boolean;
  github_repo_id?: number;
  github_data?: any;
  created_at: string;
  updated_at: string;
}

export const useProjects = () => {
  const { profile } = useProfile();
  const { toast } = useToast();
  
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch projects
  const fetchProjects = async () => {
    if (!profile) {
      console.log('No profile available for fetchProjects');
      return;
    }
    
    console.log('Fetching projects for profile:', profile.id);
    setLoading(true);
    
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('student_id', profile.id)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Supabase error in fetchProjects:', error);
        throw error;
      }
      
      console.log('Fetched projects data:', data);
      setProjects(data || []);
    } catch (error) {
      console.error('Error fetching projects:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch projects',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Add project
  const addProject = async (projectData: Omit<Project, 'id' | 'student_id' | 'created_at' | 'updated_at'>) => {
    if (!profile) return;
    
    try {
      console.log('Adding project with data:', {
        ...projectData,
        student_id: profile.id,
      });
      
      const { data, error } = await supabase
        .from('projects')
        .insert({
          ...projectData,
          student_id: profile.id,
        })
        .select()
        .single();
      
      if (error) {
        console.error('Supabase error details:', error);
        throw error;
      }
      
      console.log('Successfully inserted project:', data);
      
      // Refresh projects list
      await fetchProjects();
      
      toast({
        title: 'Success',
        description: 'Project added successfully!',
      });
      
      return data;
    } catch (error: any) {
      console.error('Error adding project:', error);
      toast({
        title: 'Error',
        description: `Failed to add project: ${error.message || 'Unknown error'}`,
        variant: 'destructive',
      });
      throw error;
    }
  };

  // Update project
  const updateProject = async (projectId: string, updates: Partial<Project>) => {
    if (!profile) return;
    
    try {
      const { data, error } = await supabase
        .from('projects')
        .update(updates)
        .eq('id', projectId)
        .eq('student_id', profile.id)
        .select()
        .single();
      
      if (error) throw error;
      
      // Refresh projects list
      await fetchProjects();
      
      toast({
        title: 'Success',
        description: 'Project updated successfully!',
      });
      
      return data;
    } catch (error) {
      console.error('Error updating project:', error);
      toast({
        title: 'Error',
        description: 'Failed to update project',
        variant: 'destructive',
      });
    }
  };

  // Delete project
  const deleteProject = async (projectId: string) => {
    if (!profile) return;
    
    try {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', projectId)
        .eq('student_id', profile.id);
      
      if (error) throw error;
      
      // Refresh projects list
      await fetchProjects();
      
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

  // Load projects when profile changes
  useEffect(() => {
    if (profile) {
      fetchProjects();
    }
  }, [profile]);

  return {
    projects,
    loading,
    fetchProjects,
    addProject,
    updateProject,
    deleteProject,
  };
};
