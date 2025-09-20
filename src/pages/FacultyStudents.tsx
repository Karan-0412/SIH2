import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useProfile } from '@/hooks/useProfile';
import {
  Search,
  Users,
  Mail,
  Phone,
  GraduationCap,
  Calendar,
  BookOpen,
  Award,
  UserCheck,
  Filter
} from 'lucide-react';
import type { Tables } from '@/integrations/supabase/types';

type Profile = Tables<'profiles'>;
type Faculty = Tables<'faculty'>;

const FacultyStudents: React.FC = () => {
  const [students, setStudents] = useState<Profile[]>([]);
  const [faculty, setFaculty] = useState<Faculty | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const { toast } = useToast();
  const { profile } = useProfile();

  useEffect(() => {
    fetchFacultyAndStudents();
  }, [profile]);

  const fetchFacultyAndStudents = async () => {
    if (!profile) return;

    setLoading(true);
    try {
      // Get faculty info
      const { data: facultyData, error: facultyError } = await supabase
        .from('faculty')
        .select('*')
        .eq('user_id', profile.user_id)
        .single();

      if (facultyError) {
        console.error('Faculty error:', facultyError);
        toast({
          title: 'Error',
          description: 'Failed to load faculty information',
          variant: 'destructive',
        });
        return;
      }

      setFaculty(facultyData);

      // Get assigned students
      const { data: studentsData, error: studentsError } = await supabase
        .from('profiles')
        .select('*')
        .eq('assigned_faculty_code', facultyData.faculty_code)
        .eq('role', 'student')
        .order('full_name');

      if (studentsError) {
        console.error('Students error:', studentsError);
        toast({
          title: 'Error',
          description: 'Failed to load assigned students',
          variant: 'destructive',
        });
        return;
      }

      setStudents(studentsData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredStudents = students.filter(student =>
    student.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student.student_roll_number?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your assigned students...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                My Assigned Students
              </h1>
              <p className="text-gray-600">
                {faculty?.name} - {faculty?.faculty_code}
              </p>
            </div>
            <Badge className="bg-blue-100 text-blue-800 px-4 py-2">
              <Users className="w-4 h-4 mr-2" />
              {students.length} Students
            </Badge>
          </div>
        </div>

        {/* Search */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                placeholder="Search students by name, email, or roll number..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 h-12"
              />
            </div>
          </CardContent>
        </Card>

        {/* Students Grid */}
        {filteredStudents.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {searchQuery ? 'No students found' : 'No students assigned'}
              </h3>
              <p className="text-gray-600">
                {searchQuery 
                  ? 'Try adjusting your search terms'
                  : 'Contact admin to get students assigned to you'
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredStudents.map((student) => (
              <Card key={student.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-4">
                  <div className="flex items-center space-x-4">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={student.avatar_url || ''} />
                      <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                        {student.full_name?.charAt(0) || 'S'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 truncate">
                        {student.full_name}
                      </h3>
                      <p className="text-sm text-gray-600 truncate">
                        {student.student_roll_number}
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Mail className="h-4 w-4" />
                    <span className="truncate">{student.email}</span>
                  </div>
                  
                  {student.phone && (
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <Phone className="h-4 w-4" />
                      <span>{student.phone}</span>
                    </div>
                  )}

                  {student.department && (
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <BookOpen className="h-4 w-4" />
                      <span>{student.department}</span>
                    </div>
                  )}

                  {student.graduation_year && (
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <Calendar className="h-4 w-4" />
                      <span>Class of {student.graduation_year}</span>
                    </div>
                  )}

                  <div className="pt-2">
                    <Badge variant="outline" className="text-xs">
                      <UserCheck className="w-3 h-3 mr-1" />
                      Assigned Student
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FacultyStudents;
