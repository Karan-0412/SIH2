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
    if (!user) { setLoading(false); return; }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .limit(1)
        .maybeSingle();

      if (error) {
        setProfileError(error);
        console.error('Error fetching profile:', (error as any)?.message ?? JSON.stringify(error));
      } else {
        if (!data) {
          // No profile row exists for this user — create a default one from auth metadata
          try {
            const meta = (user as any)?.user_metadata ?? {};
            const full_name = meta.full_name ?? user.email ?? '';
            const role = meta.role === 'faculty' ? 'faculty' : 'student';

            const { data: created, error: createError } = await supabase
              .from('profiles')
              .insert({ user_id: user.id, full_name, email: user.email, role })
              .select()
              .single();

            if (createError) {
              setProfileError(createError);
              console.error('Error creating profile:', (createError as any)?.message ?? JSON.stringify(createError));
            } else {
              setProfile(created ?? null);
            }
          } catch (err) {
            setProfileError(err);
            console.error('Error creating profile:', (err as any)?.message ?? JSON.stringify(err));
          }
        } else {
          setProfile(data ?? null);
        }
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
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', profile.id)
        .select()
        .single();

      if (error) {
        setProfileError(error);
        console.error('Error updating profile:', (error as any)?.message ?? JSON.stringify(error));
        return { error };
      } else {
        setProfile({ ...(data as Profile) });
        setProfileError(null);
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
