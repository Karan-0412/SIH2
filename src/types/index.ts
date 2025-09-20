// Global type definitions for the application

export interface User {
  id: string;
  email: string;
  full_name: string;
  role: 'student' | 'faculty';
  created_at: string;
  updated_at: string;
}

export interface Profile extends User {
  faculty_level?: 'basic' | 'senior' | 'admin';
  student_id?: string;
  faculty_id?: string;
  assigned_faculty_id?: string;
  department?: string;
  avatar_url?: string;
  bio?: string;
  linkedin_url?: string;
  github_url?: string;
  website_url?: string;
  location?: string;
  graduation_year?: number;
}

// Updated Certificate interface to match database schema
export interface Certificate {
  id: string;
  student_id: string;
  title: string;
  description?: string;
  category: 'academic' | 'co_curricular' | 'professional' | 'achievement';
  issuing_organization: string;
  issue_date: string;
  expiry_date?: string;
  certificate_url?: string;
  file_name: string;
  file_url: string;
  file_size?: number;
  status: 'pending' | 'approved' | 'rejected';
  rejection_reason?: string;
  verified_by?: string;
  verified_at?: string;
  remark?: string;
  created_at: string;
  updated_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: string;
  created_at: string;
  read_at?: string;
}

// Re-export commonly used types
export type { User, Profile, Certificate, Notification };
