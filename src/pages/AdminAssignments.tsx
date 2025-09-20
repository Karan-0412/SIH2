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
  UserCheck,
  Users,
  GraduationCap,
  Filter
} from 'lucide-react';
import AssignmentTable from '@/components/admin/AssignmentTable';
import AssignMentorModal from '@/components/admin/AssignMentorModal';
import type { Tables } from '@/integrations/supabase/types';

type Profile = Tables<'profiles'>;
type Faculty = Tables<'faculty'>;
type StudentMentorAssignment = Tables<'student_mentor_assignments'>;

interface AssignmentWithDetails extends StudentMentorAssignment {
  student?: Profile;
  mentor?: Faculty;
}

const AdminAssignments: React.FC = () => {
  const [assignments, setAssignments] = useState<AssignmentWithDetails[]>([]);
  const [students, setStudents] = useState<Profile[]>([]);
  const [faculty, setFaculty] = useState<Faculty[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [filterDepartment, setFilterDepartment] = useState('all');
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch all assignments with student and mentor details
      const { data: assignmentsData, error: assignmentsError } = await supabase
        .from('student_mentor_assignments')
        .select(`
          *,
          student:profiles!student_mentor_assignments_student_id_fkey(*),
          mentor:faculty!student_mentor_assignments_mentor_id_fkey(*)
        `)
        .order('created_at', { ascending: false });

      if (assignmentsError) throw assignmentsError;

      // Fetch all students
      const { data: studentsData, error: studentsError } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'student')
        .order('full_name');

      if (studentsError) throw studentsError;

      // Fetch verified faculty (potential mentors)
      const { data: facultyData, error: facultyError } = await supabase
        .from('faculty')
        .select('*')
        .eq('is_verified', true)
        .order('name');

      if (facultyError) throw facultyError;

      setAssignments(assignmentsData || []);
      setStudents(studentsData || []);
      setFaculty(facultyData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch assignment data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAssignMentor = async (studentId: string, mentorId: string) => {
    try {
      // Check if assignment already exists
      const existingAssignment = assignments.find(a => a.student_id === studentId);

      if (existingAssignment) {
        // Update existing assignment
        const { error } = await supabase
          .from('student_mentor_assignments')
          .update({ mentor_id: mentorId })
          .eq('student_id', studentId);

        if (error) throw error;
      } else {
        // Create new assignment
        const { error } = await supabase
          .from('student_mentor_assignments')
          .insert([{ student_id: studentId, mentor_id: mentorId }]);

        if (error) throw error;
      }

      toast({
        title: 'Success',
        description: 'Mentor assigned successfully',
      });

      fetchData();
      setShowAssignModal(false);
    } catch (error) {
      console.error('Error assigning mentor:', error);
      toast({
        title: 'Error',
        description: 'Failed to assign mentor',
        variant: 'destructive',
      });
    }
  };

  const handleUnassignMentor = async (assignmentId: string) => {
    if (!confirm('Are you sure you want to unassign this mentor?')) return;

    try {
      const { error } = await supabase
        .from('student_mentor_assignments')
        .delete()
        .eq('id', assignmentId);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Mentor unassigned successfully',
      });

      fetchData();
    } catch (error) {
      console.error('Error unassigning mentor:', error);
      toast({
        title: 'Error',
        description: 'Failed to unassign mentor',
        variant: 'destructive',
      });
    }
  };

  const filteredAssignments = assignments.filter(assignment => {
    const student = assignment.student;
    const mentor = assignment.mentor;

    const matchesSearch = !searchQuery ||
      student?.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student?.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      mentor?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      mentor?.department?.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesSearch;
  });

  const unassignedStudents = students.filter(student =>
    !assignments.some(assignment => assignment.student_id === student.id)
  );

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading assignment data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Mentor Assignments</h1>
          <p className="text-gray-600 mt-1">Manage student-mentor relationships and assignments</p>
        </div>
        <Button onClick={() => setShowAssignModal(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Assign Mentor
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{students.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Assigned Students</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {assignments.length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unassigned Students</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {unassignedStudents.length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available Mentors</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {faculty.length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search by student name, email, or mentor name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Assignment Table */}
      <AssignmentTable
        assignments={filteredAssignments}
        onUnassign={handleUnassignMentor}
      />

      {/* Assign Mentor Modal */}
      <AssignMentorModal
        open={showAssignModal}
        onOpenChange={setShowAssignModal}
        students={unassignedStudents}
        faculty={faculty}
        onAssign={handleAssignMentor}
      />
    </div>
  );
};

export default AdminAssignments;
