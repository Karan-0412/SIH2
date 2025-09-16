import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface Profile {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  role: 'student' | 'faculty';
  faculty_level?: 'basic' | 'senior' | 'admin';
  student_id?: string;
  faculty_id?: string;
  assigned_faculty_id?: string;
  teaching_id?: string | null;
  teaching_id_verified?: boolean | null;
  created_at: string;
  updated_at: string;
}

export const useProfile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [profileError, setProfileError] = useState<any>(null);

  useEffect(() => {
    if (user) {
      fetchProfile();
    } else {
      setProfile(null);
      setLoading(false);
    }
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) {
        setProfileError(error);
        console.error('Error fetching profile:', (error as any)?.message ?? JSON.stringify(error));
      } else {
        setProfile(data);
      }
    } catch (error) {
      setProfileError(error);
      console.error('Error fetching profile:', (error as any)?.message ?? JSON.stringify(error));
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user || !profile) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('user_id', user.id);

      if (error) {
        setProfileError(error);
        console.error('Error updating profile:', (error as any)?.message ?? JSON.stringify(error));
        return { error };
      } else {
        setProfileError(null);
        setProfile({ ...profile, ...updates });
        return { error: null };
      }
    } catch (error) {
      setProfileError(error);
      console.error('Error updating profile:', (error as any)?.message ?? JSON.stringify(error));
      return { error };
    }
  };

  return {
    profile,
    loading,
    error: profileError,
    updateProfile,
    refetch: fetchProfile
  };
};
