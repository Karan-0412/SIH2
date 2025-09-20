// Test Frontend Course Fetching
// Run this in browser console on the student courses page

console.log('=== TESTING FRONTEND COURSE FETCHING ===');

// Test 1: Check if we can access Supabase
console.log('1. Testing Supabase connection...');
try {
    const { data, error } = await supabase.from('courses').select('*').limit(1);
    console.log('Supabase connection test:', { data, error });
} catch (err) {
    console.error('Supabase connection failed:', err);
}

// Test 2: Check current user profile
console.log('2. Testing user profile...');
try {
    const { data: { user } } = await supabase.auth.getUser();
    console.log('Current user:', user);
    
    if (user) {
        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();
        console.log('User profile:', { profile, profileError });
    }
} catch (err) {
    console.error('Profile fetch failed:', err);
}

// Test 3: Test the exact query from StudentCourses
console.log('3. Testing courses query...');
try {
    const { data: allCoursesData, error: allCoursesError } = await supabase
        .from('courses')
        .select('*')
        .order('name');
    
    console.log('All courses query result:', { allCoursesData, allCoursesError });
    
    if (allCoursesData) {
        console.log('Number of courses found:', allCoursesData.length);
        console.log('Sample course:', allCoursesData[0]);
        
        // Check assigned_student_ids
        allCoursesData.forEach((course, index) => {
            console.log(`Course ${index + 1}:`, {
                name: course.name,
                assigned_student_ids: course.assigned_student_ids,
                type: typeof course.assigned_student_ids,
                isArray: Array.isArray(course.assigned_student_ids),
                length: course.assigned_student_ids ? course.assigned_student_ids.length : 0
            });
        });
    }
} catch (err) {
    console.error('Courses query failed:', err);
}

// Test 4: Test filtering logic
console.log('4. Testing filtering logic...');
try {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
        const { data: allCoursesData } = await supabase
            .from('courses')
            .select('*')
            .order('name');
        
        if (allCoursesData) {
            const studentId = user.id;
            console.log('Student ID for filtering:', studentId);
            
            const assignedCourses = allCoursesData.filter(course => {
                console.log('Filtering course:', course.name, {
                    assigned_student_ids: course.assigned_student_ids,
                    studentId: studentId,
                    studentIdStr: studentId.toString(),
                    isArray: Array.isArray(course.assigned_student_ids),
                    contains: course.assigned_student_ids && course.assigned_student_ids.includes(studentId.toString())
                });
                
                return course.assigned_student_ids && 
                    Array.isArray(course.assigned_student_ids) && 
                    course.assigned_student_ids.some(id => {
                        const studentIdStr = studentId.toString();
                        const assignedIdStr = id.toString();
                        const matches = assignedIdStr === studentIdStr;
                        console.log('Comparing:', assignedIdStr, 'with', studentIdStr, 'matches:', matches);
                        return matches;
                    });
            });
            
            console.log('Filtered assigned courses:', assignedCourses);
            console.log('Number of assigned courses:', assignedCourses.length);
        }
    }
} catch (err) {
    console.error('Filtering test failed:', err);
}

console.log('=== TEST COMPLETE ===');
