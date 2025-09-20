import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import {
  Plus,
  Search,
  Edit,
  Trash2,
  UserCheck,
  UserX,
  Filter
} from 'lucide-react';
import FacultyForm from '@/components/admin/FacultyForm';
import FacultyTable from '@/components/admin/FacultyTable';
import type { Tables } from '@/integrations/supabase/types';

type Faculty = Tables<'faculty'>;

const AdminFaculty: React.FC = () => {
  const [faculty, setFaculty] = useState<Faculty[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingFaculty, setEditingFaculty] = useState<Faculty | null>(null);
  const [filterVerified, setFilterVerified] = useState<'all' | 'verified' | 'unverified'>('all');
  const { toast } = useToast();

  useEffect(() => {
    fetchFaculty();
  }, []);

  const fetchFaculty = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('faculty')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setFaculty(data || []);
    } catch (error) {
      console.error('Error fetching faculty:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch faculty data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyFaculty = async (facultyId: string, isVerified: boolean) => {
    try {
      const { error } = await supabase
        .from('faculty')
        .update({ is_verified: isVerified })
        .eq('id', facultyId);

      if (error) throw error;

      setFaculty(prev => prev.map(f =>
        f.id === facultyId ? { ...f, is_verified: isVerified } : f
      ));

      toast({
        title: 'Success',
        description: `Faculty ${isVerified ? 'verified' : 'unverified'} successfully`,
      });
    } catch (error) {
      console.error('Error updating faculty:', error);
      toast({
        title: 'Error',
        description: 'Failed to update faculty verification status',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteFaculty = async (facultyId: string) => {
    if (!confirm('Are you sure you want to delete this faculty member?')) return;

    try {
      const { error } = await supabase
        .from('faculty')
        .delete()
        .eq('id', facultyId);

      if (error) throw error;

      setFaculty(prev => prev.filter(f => f.id !== facultyId));
      toast({
        title: 'Success',
        description: 'Faculty member deleted successfully',
      });
    } catch (error) {
      console.error('Error deleting faculty:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete faculty member',
        variant: 'destructive',
      });
    }
  };

  const filteredFaculty = faculty.filter(f => {
    const matchesSearch = f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         f.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         f.department.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesFilter = filterVerified === 'all' ||
                         (filterVerified === 'verified' && f.is_verified) ||
                         (filterVerified === 'unverified' && !f.is_verified);

    return matchesSearch && matchesFilter;
  });

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading faculty data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Faculty Management</h1>
          <p className="text-gray-600 mt-1">Manage faculty members and their verification status</p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Faculty
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Faculty</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{faculty.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Verified Faculty</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {faculty.filter(f => f.is_verified).length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Verification</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {faculty.filter(f => !f.is_verified).length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search faculty by name, email, or department..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="flex gap-2">
              <Button
                variant={filterVerified === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterVerified('all')}
              >
                All
              </Button>
              <Button
                variant={filterVerified === 'verified' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterVerified('verified')}
              >
                <UserCheck className="h-4 w-4 mr-1" />
                Verified
              </Button>
              <Button
                variant={filterVerified === 'unverified' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterVerified('unverified')}
              >
                <UserX className="h-4 w-4 mr-1" />
                Unverified
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Faculty Table */}
      <FacultyTable
        faculty={filteredFaculty}
        onEdit={(faculty) => {
          setEditingFaculty(faculty);
          setShowForm(true);
        }}
        onDelete={handleDeleteFaculty}
        onVerify={handleVerifyFaculty}
      />

      {/* Faculty Form Modal */}
      <FacultyForm
        open={showForm}
        onOpenChange={setShowForm}
        faculty={editingFaculty}
        onSave={() => {
          setShowForm(false);
          setEditingFaculty(null);
          fetchFaculty();
        }}
      />
    </div>
  );
};

export default AdminFaculty;
