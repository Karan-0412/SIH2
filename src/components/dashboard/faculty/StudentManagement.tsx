import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useFaculty } from '@/hooks/useFaculty';
import { useProfile } from '@/hooks/useProfile';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Users, UserPlus, UserMinus, Search, Filter } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface Student {
  id: string;
  full_name: string;
  email: string;
  student_id?: string;
  department?: string;
  assigned_faculty_id?: string;
}

const StudentManagement: React.FC = () => {
  const { profile } = useProfile();
  const { assignedStudents, assignStudent, unassignStudent, loading } = useFaculty();
  const { toast } = useToast();
  
  const [allStudents, setAllStudents] = useState<Student[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [assignedFilter, setAssignedFilter] = useState('all');
  const [loadingStudents, setLoadingStudents] = useState(false);

  // Fetch all students
  const fetchAllStudents = async () => {
    if (!profile || profile.role !== 'faculty') return;

    try {
      setLoadingStudents(true);
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          id,
          full_name,
          email,
          student_id,
          department,
          assigned_faculty_id
        `)
        .eq('role', 'student')
        .order('full_name');

      if (error) {
        console.error('Error fetching students:', error);
        toast({
          title: 'Error',
          description: 'Failed to fetch students',
          variant: 'destructive',
        });
      } else {
        setAllStudents(data || []);
      }
    } catch (err) {
      console.error('Error fetching students:', err);
      toast({
        title: 'Error',
        description: 'Failed to fetch students',
        variant: 'destructive',
      });
    } finally {
      setLoadingStudents(false);
    }
  };

  // Handle assign/unassign student
  const handleStudentAction = async (studentId: string, action: 'assign' | 'unassign') => {
    try {
      const result = action === 'assign' 
        ? await assignStudent(studentId)
        : await unassignStudent(studentId);

      if (result?.error) {
        toast({
          title: 'Error',
          description: `Failed to ${action} student`,
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Success',
          description: `Student ${action === 'assign' ? 'assigned' : 'unassigned'} successfully`,
        });
        // Refresh all students to update assignment status
        await fetchAllStudents();
      }
    } catch (err) {
      console.error(`Error ${action}ing student:`, err);
      toast({
        title: 'Error',
        description: `Failed to ${action} student`,
        variant: 'destructive',
      });
    }
  };

  // Filter students based on search and filters
  const filteredStudents = allStudents.filter(student => {
    const matchesSearch = student.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (student.student_id && student.student_id.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesDepartment = departmentFilter === 'all' || student.department === departmentFilter;
    
    const matchesAssigned = assignedFilter === 'all' || 
                           (assignedFilter === 'assigned' && student.assigned_faculty_id) ||
                           (assignedFilter === 'unassigned' && !student.assigned_faculty_id);

    return matchesSearch && matchesDepartment && matchesAssigned;
  });

  // Get unique departments
  const departments = Array.from(new Set(allStudents.map(s => s.department).filter(Boolean)));

  // Load students on component mount
  useEffect(() => {
    fetchAllStudents();
  }, []);

  // Check if student is assigned to current faculty
  const isAssignedToCurrentFaculty = (student: Student) => {
    return student.assigned_faculty_id === profile?.id;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Student Management
          </CardTitle>
          <CardDescription>
            Manage student assignments and view student information
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex flex-wrap gap-4 mb-6">
            <div className="flex-1 min-w-[200px]">
              <Label htmlFor="search">Search Students</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="search"
                  placeholder="Search by name, email, or student ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="min-w-[150px]">
              <Label htmlFor="department">Department</Label>
              <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Departments" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Departments</SelectItem>
                  {departments.map(dept => (
                    <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="min-w-[150px]">
              <Label htmlFor="assigned">Assignment Status</Label>
              <Select value={assignedFilter} onValueChange={setAssignedFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Students" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Students</SelectItem>
                  <SelectItem value="assigned">Assigned to Me</SelectItem>
                  <SelectItem value="unassigned">Unassigned</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Students Table */}
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Student ID</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loadingStudents ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      Loading students...
                    </TableCell>
                  </TableRow>
                ) : filteredStudents.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      No students found matching your criteria
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredStudents.map((student) => (
                    <TableRow key={student.id}>
                      <TableCell className="font-medium">{student.full_name}</TableCell>
                      <TableCell>{student.email}</TableCell>
                      <TableCell>{student.student_id || 'N/A'}</TableCell>
                      <TableCell>{student.department || 'N/A'}</TableCell>
                      <TableCell>
                        {isAssignedToCurrentFaculty(student) ? (
                          <Badge variant="default">Assigned to You</Badge>
                        ) : student.assigned_faculty_id ? (
                          <Badge variant="secondary">Assigned to Other</Badge>
                        ) : (
                          <Badge variant="outline">Unassigned</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {isAssignedToCurrentFaculty(student) ? (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleStudentAction(student.id, 'unassign')}
                            disabled={loading}
                          >
                            <UserMinus className="h-4 w-4 mr-1" />
                            Unassign
                          </Button>
                        ) : (
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => handleStudentAction(student.id, 'assign')}
                            disabled={loading || !!student.assigned_faculty_id}
                          >
                            <UserPlus className="h-4 w-4 mr-1" />
                            {student.assigned_faculty_id ? 'Already Assigned' : 'Assign'}
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Summary */}
          <div className="mt-4 flex justify-between text-sm text-gray-600">
            <span>
              Showing {filteredStudents.length} of {allStudents.length} students
            </span>
            <span>
              {assignedStudents.length} assigned to you
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StudentManagement;


