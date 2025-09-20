# 🧪 Testing the Dashboard Backend

This guide will help you test if the dashboard backend is working correctly with real data.

## 🚀 Quick Start

### Method 1: Using the Web Interface (Recommended)

1. **Start the development server:**
   ```bash
   npm run dev
   ```

2. **Navigate to the test page:**
   ```
   http://localhost:5173/test-data
   ```

3. **Click "Populate Data"** to add mock data to your database

4. **Test the dashboard** by logging in as one of the test students

### Method 2: Using Command Line

1. **Run the populate script:**
   ```bash
   npm run populate-mock-data
   ```

2. **Check the console output** for success/error messages

## 📊 Mock Data Included

The script will populate your database with:

- **2 Students:**
  - John Doe (ID: `550e8400-e29b-41d4-a716-446655440001`)
  - Jane Smith (ID: `550e8400-e29b-41d4-a716-446655440002`)

- **4 Certificates:**
  - 3 Approved certificates
  - 1 Pending certificate

- **5 Achievements:**
  - First Certificate (50 points)
  - Certificate Collector (100 points)
  - Week Warrior (75 points)
  - Course Master (150 points)

- **7 Activity Records:**
  - Certificate uploads
  - Achievement earned
  - Course completions

- **3 Goals:**
  - Complete 5 Certifications
  - Maintain 30-day Streak
  - Complete Data Science Projects

- **Progress Tracking:**
  - Current streaks
  - Total points
  - Course enrollments

## 🔍 How to Test

### 1. Check Dashboard Data

After populating data, visit the student dashboard and verify:

- **Overview Tab:**
  - Total Achievements: 4
  - Current Streak: 7 days
  - Total Points: 375 points
  - Level: 4 (375 points ÷ 100 + 1)

- **Achievements Tab:**
  - Should show all 4 achievements
  - Points should be calculated correctly
  - Recent achievements should be displayed

- **Activity Tab:**
  - Should show social activity feed
  - Activities from both students
  - Proper timestamps and descriptions

### 2. Verify Real Data

Check that the dashboard is showing real data from the database:

- ✅ No more hardcoded values
- ✅ Data updates when you add new records
- ✅ Proper loading states
- ✅ Error handling for missing data

### 3. Test Different Scenarios

- **Empty State:** Clear data and verify empty state messages
- **Error State:** Disconnect from database and check error handling
- **Loading State:** Check loading indicators during data fetch

## 🧹 Clean Up

When you're done testing:

1. **Using Web Interface:**
   - Go to `/test-data`
   - Click "Clear Data"

2. **Using Command Line:**
   - Delete the test records manually from Supabase dashboard

## 🐛 Troubleshooting

### Common Issues:

1. **"Missing Supabase environment variables"**
   - Check your `.env` file
   - Ensure `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are set

2. **"Error inserting data"**
   - Check Supabase connection
   - Verify table schemas match the mock data
   - Check RLS policies

3. **"Dashboard shows no data"**
   - Verify data was inserted successfully
   - Check browser console for errors
   - Ensure user is logged in with correct student ID

### Debug Steps:

1. **Check Supabase Dashboard:**
   - Go to your Supabase project
   - Check the Tables section
   - Verify data exists in all tables

2. **Check Browser Console:**
   - Open Developer Tools
   - Look for error messages
   - Check Network tab for failed requests

3. **Check Database Logs:**
   - Go to Supabase Logs
   - Look for any error messages

## 📈 Expected Results

After successful testing, you should see:

- **Real-time data** from your Supabase database
- **Accurate calculations** for points, streaks, and levels
- **Proper error handling** and loading states
- **Smooth user experience** with cached data
- **Scalable architecture** that works with any amount of data

## 🎯 Next Steps

Once testing is complete:

1. **Remove test data** using the clear function
2. **Add real student data** through your application
3. **Monitor performance** with larger datasets
4. **Implement additional features** based on testing results

---

**Happy Testing! 🚀**
