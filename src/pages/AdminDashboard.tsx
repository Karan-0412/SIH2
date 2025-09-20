import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useProfile } from '@/hooks/useProfile';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Users, UserCheck, BookOpen, Calendar, Settings, BarChart3 } from 'lucide-react';
import { Link } from 'react-router-dom';

interface DashboardStats {
  totalFaculty: number;
  verifiedFaculty: number;
  totalStudents: number;
  totalAssignments: number;
}

const AdminDashboard = () => {
  const { profile } = useProfile();
  const { toast } = useToast();
  const [stats, setStats] = useState<DashboardStats>({
    totalFaculty: 0,
    verifiedFaculty: 0,
    totalStudents: 0,
    totalAssignments: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);

      // Fetch faculty stats
      const { data: faculty, error: facultyError } = await supabase
        .from('faculty')
        .select('is_verified');

      if (facultyError) throw facultyError;

      // Fetch student stats
      const { data: students, error: studentsError } = await supabase
        .from('profiles')
        .select('id')
        .eq('role', 'student');

      if (studentsError) throw studentsError;

      // Fetch assignment stats
      const { data: assignments, error: assignmentsError } = await supabase
        .from('student_mentor_assignments')
        .select('id');

      if (assignmentsError) throw assignmentsError;

      setStats({
        totalFaculty: faculty?.length || 0,
        verifiedFaculty: faculty?.filter(f => f.is_verified).length || 0,
        totalStudents: students?.length || 0,
        totalAssignments: assignments?.length || 0
      });

    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      toast({
        title: 'Error',
        description: 'Failed to load dashboard statistics',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Total Faculty',
      value: stats.totalFaculty,
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      link: '/admin/faculty'
    },
    {
      title: 'Verified Faculty',
      value: stats.verifiedFaculty,
      icon: UserCheck,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      link: '/admin/faculty'
    },
    {
      title: 'Total Students',
      value: stats.totalStudents,
      icon: BookOpen,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      link: '/'
    },
    {
      title: 'Active Assignments',
      value: stats.totalAssignments,
      icon: Calendar,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      link: '/admin/assignments'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Admin Dashboard
          </h1>
          <p className="text-gray-600">
            Welcome back, {profile?.full_name}! Here's what's happening with your system.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Link key={index} to={stat.link}>
                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600 mb-1">
                          {stat.title}
                        </p>
                        <p className="text-3xl font-bold text-gray-900">
                          {loading ? '...' : stat.value}
                        </p>
                      </div>
                      <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                        <Icon className={`h-6 w-6 ${stat.color}`} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Link to="/admin/faculty">
                  <Button className="w-full justify-start" variant="outline">
                    <Users className="h-4 w-4 mr-2" />
                    Manage Faculty
                  </Button>
                </Link>
                <Link to="/admin/assignments">
                  <Button className="w-full justify-start" variant="outline">
                    <Calendar className="h-4 w-4 mr-2" />
                    Manage Assignments
                  </Button>
                </Link>
                <Button className="w-full justify-start" variant="outline" disabled>
                  <Settings className="h-4 w-4 mr-2" />
                  System Settings
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <p className="text-sm text-gray-600">
                    System initialized successfully
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <p className="text-sm text-gray-600">
                    Admin portal is now active
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                  <p className="text-sm text-gray-600">
                    Ready for faculty and student management
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Debug Info */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Debug Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <p><strong>Current User:</strong> {profile?.full_name}</p>
                <p><strong>Role:</strong> {profile?.role}</p>
                <p><strong>Email:</strong> {profile?.email}</p>
              </div>
              <div>
                <p><strong>Database Status:</strong> Connected</p>
                <p><strong>Admin Access:</strong> {profile?.role === 'admin' ? '✅ Granted' : '❌ Denied'}</p>
                <p><strong>Debug Page:</strong> <Link to="/admin-debug" className="text-blue-600 hover:underline">View Debug Info</Link></p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
