# Debug Course Fetching Guide 🔍

This guide helps you debug why courses are not fetching properly in the student dashboard.

## **Quick Debug Steps** 🚀

### **Step 1: Run Database Diagnostic**
Execute `debug_course_fetching.sql` in Supabase SQL Editor to check:
- ✅ Courses exist in database
- ✅ Students are assigned to courses
- ✅ Data types are correct
- ✅ Query logic works

### **Step 2: Test Frontend Fetching**
1. **Open browser console** (F12)
2. **Go to student courses page**
3. **Run the test script** from `test_frontend_fetching.js`
4. **Check console output** for errors

### **Step 3: Check Component Logic**
The updated `StudentCourses.tsx` now has:
- ✅ Better error handling
- ✅ More detailed logging
- ✅ Refresh button for testing
- ✅ Proper useEffect dependencies

## **Common Issues & Solutions** 🔧

### **Issue 1: Profile Not Loaded**
**Symptoms:** No courses show, console shows "No profile or not a student"
**Solution:** The useEffect now waits for profile to load

### **Issue 2: RLS Blocking Access**
**Symptoms:** Console shows permission errors
**Solution:** Run the RLS fix script

### **Issue 3: Data Type Mismatch**
**Symptoms:** Courses exist but filtering doesn't work
**Solution:** Check that student IDs are properly converted to strings

### **Issue 4: No Course Assignments**
**Symptoms:** "No Courses Assigned" message
**Solution:** Run the course assignment script

## **Debugging Checklist** ✅

- [ ] **Database has courses** - Run SQL query to verify
- [ ] **Students are assigned** - Check `assigned_student_ids` field
- [ ] **RLS allows access** - Verify policies are permissive
- [ ] **Profile is loaded** - Check console for profile data
- [ ] **No console errors** - Look for JavaScript errors
- [ ] **Network requests succeed** - Check DevTools Network tab
- [ ] **Filtering logic works** - Check console logs for comparisons

## **Expected Console Output** 📊

When working correctly, you should see:
```
Fetching courses for student: [student-id] [student-name]
All courses fetched: [number]
Course: [course-name] assigned_student_ids: [array]
Comparing: [assigned-id] with [student-id] matches: true/false
Assigned courses: [array of courses]
```

## **Manual Testing** 🧪

1. **Login as a student**
2. **Go to student courses page**
3. **Open browser console** (F12)
4. **Click the "Refresh" button**
5. **Check console output**
6. **Look for any error messages**

## **If Still Not Working** 🚨

1. **Check the database directly** using SQL queries
2. **Verify you're logged in as a student**
3. **Check if courses have `assigned_student_ids` populated**
4. **Look for JavaScript errors in console**
5. **Check network requests in DevTools**

## **Quick Fix Commands** ⚡

```sql
-- Check current state
SELECT name, assigned_student_ids FROM courses;

-- Assign a student to a course
UPDATE courses 
SET assigned_student_ids = ARRAY['student-id-here']
WHERE id = 'course-id-here';

-- Fix RLS policies
ALTER TABLE courses DISABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all operations on courses" ON courses FOR ALL USING (true) WITH CHECK (true);
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
```

---

**Ready to debug!** Follow these steps to identify and fix the course fetching issue! 🎯
