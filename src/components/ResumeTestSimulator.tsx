import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const ResumeTestSimulator = () => {
  const [selectedDiscipline, setSelectedDiscipline] = useState<string>('');

  const disciplines = [
    { id: 'computer-science', name: 'Computer Science', department: 'Computer Science Engineering' },
    { id: 'business', name: 'Business Administration', department: 'Business Management' },
    { id: 'commerce', name: 'Commerce', department: 'Commerce & Accounting' },
    { id: 'mechanical', name: 'Mechanical Engineering', department: 'Mechanical Engineering' },
    { id: 'medicine', name: 'Medicine', department: 'Medical Sciences' },
    { id: 'psychology', name: 'Psychology', department: 'Psychology' },
    { id: 'english', name: 'English Literature', department: 'English Literature' },
    { id: 'physics', name: 'Physics', department: 'Physics' },
    { id: 'design', name: 'Graphic Design', department: 'Graphic Design' },
    { id: 'marketing', name: 'Marketing', department: 'Marketing' },
  ];

  const testSkills = {
    'computer-science': ['JavaScript', 'React', 'Node.js', 'Python', 'SQL', 'Git', 'AWS', 'Problem Solving'],
    'business': ['Business Management', 'Strategic Planning', 'Financial Analysis', 'Leadership', 'Project Management'],
    'commerce': ['Accounting', 'Financial Reporting', 'Tax Planning', 'Auditing', 'Excel', 'QuickBooks'],
    'mechanical': ['Mechanical Engineering', 'CAD Design', 'Manufacturing', 'Project Management', 'AutoCAD'],
    'medicine': ['Medical Knowledge', 'Patient Care', 'Clinical Research', 'Healthcare Management', 'Anatomy'],
    'psychology': ['Behavioral Analysis', 'Research Methods', 'Data Interpretation', 'Counseling', 'Statistics'],
    'english': ['Creative Writing', 'Content Creation', 'Research & Analysis', 'Communication', 'Literature'],
    'physics': ['Physics', 'Mathematical Modeling', 'Laboratory Techniques', 'Data Analysis', 'Calculus'],
    'design': ['Graphic Design', 'Visual Communication', 'Adobe Creative Suite', 'Brand Design', 'UI/UX'],
    'marketing': ['Digital Marketing', 'Brand Management', 'Market Research', 'Social Media Marketing', 'Analytics'],
  };

  const testProjects = {
    'computer-science': [
      { title: 'E-commerce Website', category: 'Web Development', description: 'Full-stack e-commerce platform with React and Node.js' },
      { title: 'Mobile App', category: 'Mobile Development', description: 'Cross-platform mobile application using React Native' }
    ],
    'business': [
      { title: 'Market Analysis Report', category: 'Business Research', description: 'Comprehensive market analysis for retail industry' },
      { title: 'Business Plan', category: 'Strategic Planning', description: 'Startup business plan with financial projections' }
    ],
    'commerce': [
      { title: 'Financial Audit', category: 'Accounting', description: 'Complete financial audit for small business' },
      { title: 'Tax Planning', category: 'Finance', description: 'Tax optimization strategy for corporate clients' }
    ],
    'mechanical': [
      { title: 'CAD Design Project', category: 'Engineering Design', description: 'Mechanical component design using AutoCAD' },
      { title: 'Manufacturing Process', category: 'Industrial Engineering', description: 'Optimized manufacturing workflow design' }
    ],
    'medicine': [
      { title: 'Clinical Research', category: 'Medical Research', description: 'Study on patient outcomes in emergency medicine' },
      { title: 'Health Campaign', category: 'Public Health', description: 'Community health awareness initiative' }
    ],
    'psychology': [
      { title: 'Behavioral Study', category: 'Research', description: 'Study on cognitive development in adolescents' },
      { title: 'Therapy Program', category: 'Clinical Practice', description: 'Group therapy program for anxiety management' }
    ],
    'english': [
      { title: 'Literary Analysis', category: 'Research', description: 'Critical analysis of contemporary literature' },
      { title: 'Creative Writing', category: 'Writing', description: 'Collection of short stories and poetry' }
    ],
    'physics': [
      { title: 'Lab Experiment', category: 'Research', description: 'Quantum mechanics experiment with data analysis' },
      { title: 'Mathematical Model', category: 'Theoretical Physics', description: 'Mathematical model for wave propagation' }
    ],
    'design': [
      { title: 'Brand Identity', category: 'Graphic Design', description: 'Complete brand identity design for startup' },
      { title: 'UI/UX Design', category: 'Digital Design', description: 'User interface design for mobile application' }
    ],
    'marketing': [
      { title: 'Digital Campaign', category: 'Digital Marketing', description: 'Social media marketing campaign with 50% engagement increase' },
      { title: 'Market Research', category: 'Research', description: 'Consumer behavior analysis for new product launch' }
    ],
  };

  const handleTestDiscipline = (discipline: any) => {
    setSelectedDiscipline(discipline.id);
    
    // Simulate updating profile data
    console.log('Testing with discipline:', discipline.name);
    console.log('Department:', discipline.department);
    console.log('Expected skills:', testSkills[discipline.id as keyof typeof testSkills]);
    console.log('Sample projects:', testProjects[discipline.id as keyof typeof testProjects]);
    
    // You can add logic here to temporarily update the profile for testing
    alert(`Testing ${discipline.name} discipline!\n\nCheck the console for expected skills and projects.\n\nNow go to Resume Generator and test the AI generation.`);
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Resume Generator Test Simulator</CardTitle>
        <p className="text-sm text-gray-600">
          Test how the resume generator adapts to different academic disciplines
        </p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {disciplines.map((discipline) => (
            <Button
              key={discipline.id}
              variant={selectedDiscipline === discipline.id ? "default" : "outline"}
              onClick={() => handleTestDiscipline(discipline)}
              className="h-auto p-4 flex flex-col items-center text-center"
            >
              <div className="font-medium text-sm">{discipline.name}</div>
              <div className="text-xs text-gray-500 mt-1">{discipline.department}</div>
            </Button>
          ))}
        </div>
        
        {selectedDiscipline && (
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold mb-2">Expected Skills for {disciplines.find(d => d.id === selectedDiscipline)?.name}:</h3>
            <div className="flex flex-wrap gap-2">
              {testSkills[selectedDiscipline as keyof typeof testSkills]?.map((skill, index) => (
                <Badge key={index} variant="secondary">{skill}</Badge>
              ))}
            </div>
            
            <h3 className="font-semibold mb-2 mt-4">Sample Projects:</h3>
            <div className="space-y-2">
              {testProjects[selectedDiscipline as keyof typeof testProjects]?.map((project, index) => (
                <div key={index} className="text-sm">
                  <strong>{project.title}</strong> - {project.category}
                  <div className="text-gray-600">{project.description}</div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h3 className="font-semibold text-blue-800 mb-2">How to Test:</h3>
          <ol className="text-sm text-blue-700 space-y-1">
            <li>1. Click on a discipline above to see expected skills and projects</li>
            <li>2. Go to Resume Generator page</li>
            <li>3. Enable "Editable Mode"</li>
            <li>4. Click "AI Generate" for Overview, Skills, or Project Description</li>
            <li>5. Observe how the AI adapts content to the selected discipline</li>
          </ol>
        </div>
      </CardContent>
    </Card>
  );
};

export default ResumeTestSimulator;
