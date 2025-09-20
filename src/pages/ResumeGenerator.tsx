import React, { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Download, Settings2, ArrowLeft } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { useStudent } from "@/hooks/useStudent";
import { supabase } from "@/integrations/supabase/client";
import AITextService, { AIGenerationRequest } from "@/services/aiTextService";

// Templates
import MinimalTemplate, { ResumeData } from "@/components/ResumeTemplates/MinimalTemplate";
import ModernTemplate from "@/components/ResumeTemplates/ModernTemplate";

import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useNavigate } from "react-router-dom";



import html2pdf from "html2pdf.js";


const ResumeGenerator: React.FC = () => {
  const ref = useRef<HTMLDivElement>(null);
  const { signOut } = useAuth();
  const { profile } = useProfile();
  const { portfolio, achievements, progress } = useStudent();

  // Debug log to verify component is loading
  console.log('🤖 ResumeGenerator component loaded with AI features!');

  const [selectedTemplate, setSelectedTemplate] = useState<"modern" | "minimal">("modern");
  const [isEditable, setIsEditable] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showNotificationsDropdown, setShowNotificationsDropdown] = useState(false);
  const [certificates, setCertificates] = useState<any[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [selectedProjects, setSelectedProjects] = useState<Set<string>>(new Set());
  const [showProjectSelector, setShowProjectSelector] = useState(false);
  const [aiGenerating, setAiGenerating] = useState<string | null>(null);
  const [aiService] = useState(() => AITextService.getInstance());
  const navigate = useNavigate();
  
  // Fetch certificates
  useEffect(() => {
    const fetchCertificates = async () => {
      if (!profile) return;
      
      try {
        setDataLoading(true);
        const { data, error } = await supabase
          .from('certificates')
          .select('*')
          .eq('student_id', profile.id)
          .eq('status', 'approved')
          .order('uploaded_at', { ascending: false });
        
        if (error) throw error;
        setCertificates(data || []);
      } catch (error) {
        console.error('Error fetching certificates:', error);
      } finally {
        setDataLoading(false);
      }
    };
    
    fetchCertificates();
  }, [profile]);

  // Initialize resume data with real student information
  const [resumeData, setResumeData] = useState<ResumeData>({
    name: profile?.full_name || "Student Name",
    email: profile?.email || "student@example.com",
    phone: profile?.phone || "+91 98765 43210",
    overview: profile?.bio || "Aspiring professional with strong academic background and practical experience in various projects and achievements.",
    education: [
      {
        degree: profile?.department || "B.Tech in Computer Science",
        institution: profile?.college || "University Name",
        year: profile?.graduation_year ? `${profile.graduation_year - 4}-${profile.graduation_year}` : "2020-2024",
      },
    ],
    experience: [], // Will be populated from portfolio if any
    projects: [], // Will be populated from portfolio
    skills: [], // Will be populated from achievements and projects
    certificates: [], // Will be populated from real certificates
  });

  // Update resume data when profile or portfolio changes
  useEffect(() => {
    if (profile) {
      setResumeData(prev => ({
        ...prev,
        name: profile.full_name || prev.name,
        email: profile.email || prev.email,
        phone: profile.phone || prev.phone,
        overview: profile.bio || `Aspiring ${profile.department || 'Computer Science'} professional with strong academic background and practical experience in various projects and achievements. Passionate about technology and continuous learning.`,
        education: [{
          degree: profile.department || "B.Tech in Computer Science",
          institution: profile.college || "University Name",
          year: profile.graduation_year ? `${profile.graduation_year - 4}-${profile.graduation_year}` : "2020-2024",
        }],
      }));
    }
  }, [profile]);

  // Add experience from portfolio (if any projects are marked as experience)
  useEffect(() => {
    const experienceProjects = portfolio.filter(project => 
      project.category === 'experience' || 
      project.category === 'internship' ||
      project.title.toLowerCase().includes('intern') ||
      project.title.toLowerCase().includes('work')
    );

    if (experienceProjects.length > 0) {
      const experience = experienceProjects.map(project => ({
        role: project.title,
        company: project.external_url ? new URL(project.external_url).hostname : "Company Name",
        duration: "Duration not specified",
        details: [
          project.description || "Worked on various projects and gained valuable experience",
          project.external_url ? `Project: ${project.external_url}` : "",
        ].filter(Boolean),
      }));

      setResumeData(prev => ({
        ...prev,
        experience: experience,
      }));
    }
  }, [portfolio]);

  // Update projects from portfolio
  useEffect(() => {
    if (portfolio.length > 0) {
      // Initialize selected projects if not set
      if (selectedProjects.size === 0) {
        // Select all projects by default
        const allProjectIds = new Set(portfolio.map(p => p.id));
        setSelectedProjects(allProjectIds);
      }

      // Filter projects based on selection
      const selectedPortfolioProjects = portfolio.filter(project => selectedProjects.has(project.id));
      
      const portfolioProjects = selectedPortfolioProjects.map(project => ({
        name: project.title,
        description: project.description || "A project showcasing technical skills and creativity.",
        details: [
          `Category: ${project.category}`,
          project.external_url ? `Live Demo: ${project.external_url}` : "Project details available upon request",
          project.featured ? "Featured Project" : "",
        ].filter(Boolean),
      }));

      setResumeData(prev => ({
        ...prev,
        projects: portfolioProjects,
      }));

      // Cache the portfolio data in localStorage
      localStorage.setItem('resume_portfolio_cache', JSON.stringify(portfolio));
    } else {
      // Check if we have cached data
      const cachedPortfolio = localStorage.getItem('resume_portfolio_cache');
      if (cachedPortfolio) {
        try {
          const cached = JSON.parse(cachedPortfolio);
          if (cached.length > 0) {
            // Initialize selected projects for cached data
            if (selectedProjects.size === 0) {
              const allProjectIds = new Set(cached.map((p: any) => p.id));
              setSelectedProjects(allProjectIds);
            }

            // Filter cached projects based on selection
            const selectedCachedProjects = cached.filter((project: any) => selectedProjects.has(project.id));
            
            const portfolioProjects = selectedCachedProjects.map((project: any) => ({
              name: project.title,
              description: project.description || "A project showcasing technical skills and creativity.",
              details: [
                `Category: ${project.category}`,
                project.external_url ? `Live Demo: ${project.external_url}` : "Project details available upon request",
                project.featured ? "Featured Project" : "",
              ].filter(Boolean),
            }));

            setResumeData(prev => ({
              ...prev,
              projects: portfolioProjects,
            }));
            return;
          }
        } catch (error) {
          console.error('Error parsing cached portfolio:', error);
        }
      }

      // If no portfolio projects and no cache, show a message
      setResumeData(prev => ({
        ...prev,
        projects: [{
          name: "No projects yet",
          description: "Add projects to your portfolio to see them here.",
          details: ["Go to My Projects to add your first project"],
        }],
      }));
    }
  }, [portfolio, selectedProjects]);

  // Update certificates from real data
  useEffect(() => {
    if (certificates.length > 0) {
      const certificateTitles = certificates.map(cert => cert.title);
      setResumeData(prev => ({
        ...prev,
        certificates: certificateTitles,
      }));
    }
  }, [certificates]);

  // Update skills from achievements and projects
  useEffect(() => {
    const skills = new Set<string>();
    
    // Add skills from achievements
    achievements.forEach(achievement => {
      const title = achievement.title.toLowerCase();
      if (title.includes('react')) skills.add('React');
      if (title.includes('javascript')) skills.add('JavaScript');
      if (title.includes('python')) skills.add('Python');
      if (title.includes('java')) skills.add('Java');
      if (title.includes('aws')) skills.add('AWS');
      if (title.includes('machine learning')) skills.add('Machine Learning');
      if (title.includes('typescript')) skills.add('TypeScript');
      if (title.includes('node')) skills.add('Node.js');
      if (title.includes('sql')) skills.add('SQL');
      if (title.includes('git')) skills.add('Git');
      if (title.includes('html')) skills.add('HTML');
      if (title.includes('css')) skills.add('CSS');
    });

    // Add skills from projects
    portfolio.forEach(project => {
      const desc = (project.description || '').toLowerCase();
      if (desc.includes('react')) skills.add('React');
      if (desc.includes('typescript')) skills.add('TypeScript');
      if (desc.includes('node')) skills.add('Node.js');
      if (desc.includes('python')) skills.add('Python');
      if (desc.includes('javascript')) skills.add('JavaScript');
      if (desc.includes('html')) skills.add('HTML');
      if (desc.includes('css')) skills.add('CSS');
      if (desc.includes('sql')) skills.add('SQL');
      if (desc.includes('git')) skills.add('Git');
      if (desc.includes('aws')) skills.add('AWS');
    });

    // Add skills from certificates
    certificates.forEach(cert => {
      const title = cert.title.toLowerCase();
      if (title.includes('react')) skills.add('React');
      if (title.includes('javascript')) skills.add('JavaScript');
      if (title.includes('python')) skills.add('Python');
      if (title.includes('java')) skills.add('Java');
      if (title.includes('aws')) skills.add('AWS');
      if (title.includes('machine learning')) skills.add('Machine Learning');
      if (title.includes('data science')) skills.add('Data Science');
      if (title.includes('web development')) skills.add('Web Development');
    });

    // Add default skills if none found
    if (skills.size === 0) {
      skills.add('Problem Solving');
      skills.add('Team Collaboration');
      skills.add('Project Management');
    }

    setResumeData(prev => ({
      ...prev,
      skills: Array.from(skills).sort(),
    }));
  }, [achievements, portfolio, certificates]);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDarkMode]);

  // Debug: Log current resume data
  useEffect(() => {
    console.log('Resume Data Updated:', {
      name: resumeData.name,
      email: resumeData.email,
      projects: resumeData.projects.length,
      skills: resumeData.skills.length,
      certificates: resumeData.certificates.length,
      experience: resumeData.experience.length,
      portfolio: portfolio.length,
      achievements: achievements.length,
      certificatesData: certificates.length,
      portfolioData: portfolio
    });
  }, [resumeData, portfolio, achievements, certificates]);

  // Force refresh portfolio data when component mounts or when switching back
  useEffect(() => {
    if (profile && portfolio.length === 0) {
      console.log('Portfolio is empty, fetching data...');
      // Trigger a refresh of portfolio data
      const refreshData = async () => {
        try {
          const { data, error } = await supabase
            .from('student_portfolio')
            .select('*')
            .eq('student_id', profile.id)
            .order('created_at', { ascending: false });
          
          if (error) throw error;
          console.log('Fetched portfolio data:', data);
        } catch (error) {
          console.error('Error fetching portfolio:', error);
        }
      };
      refreshData();
    }
  }, [profile, portfolio.length]);

  const handleChange = (field: keyof ResumeData, value: any) =>
    setResumeData({ ...resumeData, [field]: value });

  // Project selection functions
  const toggleProjectSelection = (projectId: string) => {
    setSelectedProjects(prev => {
      const newSet = new Set(prev);
      if (newSet.has(projectId)) {
        newSet.delete(projectId);
      } else {
        newSet.add(projectId);
      }
      return newSet;
    });
  };

  const selectAllProjects = () => {
    if (portfolio.length > 0) {
      setSelectedProjects(new Set(portfolio.map(p => p.id)));
    }
  };

  const clearProjectSelection = () => {
    setSelectedProjects(new Set());
  };

  // AI Generation functions
  const generateAIContent = async (type: 'overview' | 'skills' | 'project_description', projectData?: any) => {
    if (!profile) return;

    setAiGenerating(type);
    try {
      const request: AIGenerationRequest = {
        type,
        userProfile: {
          name: profile.full_name,
          role: profile.role,
          experience: 'Student',
          education: 'University'
        },
        projectData,
        existingContent: type === 'overview' ? resumeData.overview : undefined,
        context: type === 'project_description' ? projectData?.title : undefined
      };

      const response = await aiService.generateText(request);
      
      if (type === 'overview') {
        handleChange('overview', response.content);
      } else if (type === 'skills') {
        const skills = response.content.split(',').map(s => s.trim()).filter(s => s);
        handleChange('skills', skills);
      } else if (type === 'project_description' && projectData) {
        // This would be used for individual project descriptions
        console.log('Generated project description:', response.content);
      }

      // Show success message
      console.log(`AI generated ${type}:`, response.content);
    } catch (error) {
      console.error('AI generation error:', error);
    } finally {
      setAiGenerating(null);
    }
  };

  const generateProjectDescription = async (project: any) => {
    await generateAIContent('project_description', project);
  };

  const updateArrayItem = <T,>(array: T[], index: number, newItem: T, field: keyof ResumeData) => {
    const updatedArray = [...array];
    updatedArray[index] = newItem;
    setResumeData({ ...resumeData, [field]: updatedArray });
  };

  const addArrayItem = <T,>(item: T, field: keyof ResumeData) => {
    const updatedArray = [...(resumeData[field] as T[]), item];
    setResumeData({ ...resumeData, [field]: updatedArray });
  };

  const removeArrayItem = (index: number, field: keyof ResumeData) => {
    const updatedArray = [...(resumeData[field] as any[])];
    updatedArray.splice(index, 1);
    setResumeData({ ...resumeData, [field]: updatedArray });
  };

  


  const handleDownloadPDF = () => {
  if (ref.current) {
    const element = ref.current;

    const opt = {
      margin:       0,
      filename:     `${resumeData.name.replace(" ", "_")}_Resume.pdf`,
      image:        { type: "jpeg", quality: 0.98 },
      html2canvas:  { scale: 2, useCORS: true },
      jsPDF:        { unit: "px", format: [794, 1123], orientation: "portrait" }
    };

    html2pdf().set(opt).from(element).save();
  }
};



const [sectionTextSizes, setSectionTextSizes] = useState({
  header: 20,      // Name
  overview: 14,
  education: 14,
  experience: 14,
  projects: 14,
  skills: 14,
  certificates: 14,
});


const handleSectionTextSizeChange = (section: keyof typeof sectionTextSizes, value: number) => {
  setSectionTextSizes({ ...sectionTextSizes, [section]: value });
};





  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${
        isDarkMode
          ? "bg-gray-900 text-white"
          : "bg-gradient-to-br from-slate-50 to-blue-50 text-slate-900"
      }`}
    >
      {/* 🔹 Top Navigation Bar */}

      <div className="p-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate("/")}
                        className={`hover:bg-opacity-80 ${isDarkMode
                                ? "text-gray-300 hover:bg-gray-700"
                                : "text-gray-600 hover:bg-gray-100"
                            }`}
                    >
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <FileText className="w-8 h-8 text-blue-500" />
            Resume Generator
            {dataLoading && (
              <div className="flex items-center gap-2 text-sm text-gray-600 ml-4">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                Loading your data...
              </div>
            )}
          </h1>
        </div>

        {/* AI FEATURES TEST - VISIBLE CHANGE */}
        <div className="mb-6 p-4 bg-green-100 border border-green-300 rounded-lg">
          <h2 className="text-lg font-semibold text-green-800">🤖 AI Features Added!</h2>
          <p className="text-sm text-green-700">Look for "🤖 AI Generate" buttons in the settings panel below. Enable "Editable Mode" to see them.</p>
        </div>

        {/* Data Status Indicator */}
        <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-blue-900">Resume Data Status</h3>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={async () => {
                console.log('Manual refresh triggered');
                setDataLoading(true);
                try {
                  // Clear cache and refetch data
                  localStorage.removeItem('resume_portfolio_cache');
                  
                  // Fetch fresh portfolio data
                  if (profile) {
                    const { data, error } = await supabase
                      .from('student_portfolio')
                      .select('*')
                      .eq('student_id', profile.id)
                      .order('created_at', { ascending: false });
                    
                    if (error) throw error;
                    console.log('Fresh portfolio data:', data);
                  }
                  
                  // Force a re-render by updating a dummy state
                  setDataLoading(false);
                } catch (error) {
                  console.error('Error refreshing data:', error);
                  setDataLoading(false);
                }
              }}
              className="text-blue-600 hover:text-blue-700"
            >
              Refresh Data
            </Button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${portfolio.length > 0 ? 'bg-green-500' : 'bg-gray-300'}`}></div>
              <span>Projects: {selectedProjects.size}/{portfolio.length}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${certificates.length > 0 ? 'bg-green-500' : 'bg-gray-300'}`}></div>
              <span>Certificates: {certificates.length}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${achievements.length > 0 ? 'bg-green-500' : 'bg-gray-300'}`}></div>
              <span>Achievements: {achievements.length}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${resumeData.skills.length > 0 ? 'bg-green-500' : 'bg-gray-300'}`}></div>
              <span>Skills: {resumeData.skills.length}</span>
            </div>
          </div>
          {aiGenerating && (
            <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center gap-2 text-blue-800">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                <span className="text-sm font-medium">
                  AI is generating {aiGenerating} content...
                </span>
              </div>
            </div>
          )}
          {portfolio.length === 0 && (
            <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                <strong>No projects found.</strong> Add projects to your portfolio to see them in your resume. 
                <a href="/my-projects" className="text-blue-600 hover:underline ml-1">Go to My Projects</a>
              </p>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* 🔹 Settings Panel */}
          <Card className="shadow-lg rounded-2xl max-h-[85vh] overflow-y-auto">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings2 className="h-5 w-5 text-blue-600" /> Resume Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={isEditable}
                  onChange={() => setIsEditable(!isEditable)}
                />
                Editable Mode
              </label>

              {/* Editable Mode Content */}
              {isEditable ? (
                <div className="space-y-4">
                  <div className="mt-4">
  <label className="block text-sm mb-2 font-semibold">Adjust Section Text Sizes</label>
  {(Object.keys(sectionTextSizes) as (keyof typeof sectionTextSizes)[]).map((section) => (
    <div key={section} className="flex items-center gap-2 mb-2">
      <span className="capitalize w-28">{section}</span>
      <input
        type="number"
        min={10}
        max={30}
        value={sectionTextSizes[section]}
        onChange={(e) =>
          handleSectionTextSizeChange(section, parseInt(e.target.value))
        }
        className="border rounded px-2 py-1 w-20"
      />
      <span>px</span>
    </div>
  ))}
</div>

                  {/* Basic Info */}
                  {(["name", "email", "phone"] as const).map((field) => (
                    <div key={field}>
                      <label className="block text-sm mb-1">
                        {field.charAt(0).toUpperCase() + field.slice(1)}
                      </label>
                      <input
                        type="text"
                        className="w-full border rounded-lg px-3 py-2"
                        value={resumeData[field]}
                        onChange={(e) => handleChange(field, e.target.value)}
                      />
                    </div>
                  ))}

                  {/* Overview */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-sm">Overview</label>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => generateAIContent('overview')}
                        disabled={aiGenerating === 'overview'}
                        className="text-blue-600 hover:text-blue-700"
                      >
                        {aiGenerating === 'overview' ? (
                          <>
                            <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600 mr-1"></div>
                            Generating...
                          </>
                        ) : (
                          '🤖 AI Generate'
                        )}
                      </Button>
                    </div>
                    <textarea
                      className="w-full border rounded-lg px-3 py-2"
                      rows={3}
                      value={resumeData.overview}
                      onChange={(e) => handleChange("overview", e.target.value)}
                      placeholder="Professional summary highlighting your key strengths and career objectives..."
                    />
                  </div>

                  {/* Skills */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-sm">Skills (comma separated)</label>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => generateAIContent('skills')}
                        disabled={aiGenerating === 'skills'}
                        className="text-blue-600 hover:text-blue-700"
                      >
                        {aiGenerating === 'skills' ? (
                          <>
                            <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600 mr-1"></div>
                            Generating...
                          </>
                        ) : (
                          '🤖 AI Generate'
                        )}
                      </Button>
                    </div>
                    <input
                      type="text"
                      className="w-full border rounded-lg px-3 py-2"
                      value={resumeData.skills.join(", ")}
                      onChange={(e) =>
                        handleChange(
                          "skills",
                          e.target.value.split(",").map((s) => s.trim())
                        )
                      }
                      placeholder="JavaScript, React, Python, Problem Solving, Teamwork..."
                    />
                  </div>

                  {/* Certificates */}
                  <div>
                    <label className="block text-sm mb-1">Select Certificates to Show</label>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="w-full justify-between">
                          {resumeData.certificates.length > 0
                            ? `${resumeData.certificates.length} selected`
                            : "Choose certificates"}
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="w-full max-h-48 overflow-y-auto">
                        <DropdownMenuLabel>Available Certificates</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        {(profile?.certificates?.length
                          ? profile.certificates
                          : [
                              "React Basics",
                              "Advanced React",
                              "TypeScript Mastery",
                              "TailwindCSS Design",
                              "Full-Stack Development",
                              "Machine Learning with Python",
                              "AWS Cloud Practitioner",
                              "Data Structures & Algorithms",
                            ]
                        ).map((cert: string, idx: number) => (
                          <DropdownMenuCheckboxItem
                            key={idx}
                            checked={resumeData.certificates.includes(cert)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                handleChange("certificates", [
                                  ...resumeData.certificates,
                                  cert,
                                ]);
                              } else {
                                handleChange(
                                  "certificates",
                                  resumeData.certificates.filter((c) => c !== cert)
                                );
                              }
                            }}
                          >
                            {cert}
                          </DropdownMenuCheckboxItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  {/* Project Selection */}
                  <div>
                    <label className="block text-sm mb-1">Select Projects to Include</label>
                    <div className="space-y-2">
                      <div className="flex gap-2 flex-wrap">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={selectAllProjects}
                          disabled={portfolio.length === 0}
                        >
                          Select All
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={clearProjectSelection}
                          disabled={portfolio.length === 0}
                        >
                          Clear All
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setShowProjectSelector(!showProjectSelector)}
                          disabled={portfolio.length === 0}
                        >
                          {showProjectSelector ? 'Hide' : 'Show'} Projects ({selectedProjects.size})
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            // Generate AI content for all selected projects
                            selectedProjects.forEach(projectId => {
                              const project = portfolio.find(p => p.id === projectId);
                              if (project) {
                                generateProjectDescription(project);
                              }
                            });
                          }}
                          disabled={selectedProjects.size === 0 || aiGenerating !== null}
                          className="text-green-600 hover:text-green-700"
                        >
                          🤖 Generate All Descriptions
                        </Button>
                      </div>
                      
                      {showProjectSelector && portfolio.length > 0 && (
                        <div className="max-h-48 overflow-y-auto border rounded-lg p-3 space-y-2">
                          {portfolio.map((project) => (
                            <div key={project.id} className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                id={`project-${project.id}`}
                                checked={selectedProjects.has(project.id)}
                                onChange={() => toggleProjectSelection(project.id)}
                                className="rounded"
                              />
                              <label 
                                htmlFor={`project-${project.id}`}
                                className="flex-1 text-sm cursor-pointer"
                              >
                                <div className="font-medium">{project.title}</div>
                                <div className="text-gray-500 text-xs">
                                  {project.category} • {project.visibility}
                                  {project.featured && " • Featured"}
                                </div>
                              </label>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => generateProjectDescription(project)}
                                disabled={aiGenerating === `project-${project.id}`}
                                className="text-blue-600 hover:text-blue-700 p-1"
                                title="Generate AI description"
                              >
                                {aiGenerating === `project-${project.id}` ? (
                                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600"></div>
                                ) : (
                                  '🤖'
                                )}
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                      
                      {portfolio.length === 0 && (
                        <div className="text-sm text-gray-500 p-3 border rounded-lg text-center">
                          No projects available. <a href="/my-projects" className="text-blue-600 hover:underline">Add projects</a> to your portfolio first.
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Education Section */}
                  <div>
                    <label className="block text-sm text-slate-600 mb-1">Education</label>
                    <div className="space-y-3">
                      {resumeData.education.map((edu, idx) => (
                        <div key={idx} className="grid grid-cols-1 md:grid-cols-3 gap-2">
                          <input
                            type="text"
                            placeholder="Degree"
                            className="border rounded px-2 py-1 w-full"
                            value={edu.degree}
                            onChange={(e) =>
                              updateArrayItem(
                                resumeData.education,
                                idx,
                                { ...edu, degree: e.target.value },
                                "education"
                              )
                            }
                          />
                          <input
                            type="text"
                            placeholder="Institution"
                            className="border rounded px-2 py-1 w-full"
                            value={edu.institution}
                            onChange={(e) =>
                              updateArrayItem(
                                resumeData.education,
                                idx,
                                { ...edu, institution: e.target.value },
                                "education"
                              )
                            }
                          />
                          <div className="flex gap-2">
                            <input
                              type="text"
                              placeholder="Year"
                              className="border rounded px-2 py-1 w-full"
                              value={edu.year}
                              onChange={(e) =>
                                updateArrayItem(
                                  resumeData.education,
                                  idx,
                                  { ...edu, year: e.target.value },
                                  "education"
                                )
                              }
                            />
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => removeArrayItem(idx, "education")}
                            >
                              X
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                    <Button
                      onClick={() =>
                        addArrayItem({ degree: "", institution: "", year: "" }, "education")
                      }
                      className="mt-2"
                    >
                      Add Education
                    </Button>
                  </div>

                  {/* Projects Section */}
                  <div>
                    <label className="block text-sm text-slate-600 mb-1">Projects</label>
                    <div className="space-y-4">
                      {resumeData.projects.map((proj, idx) => (
                        <div key={idx} className="space-y-2 border p-3 rounded-lg">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            <input
                              type="text"
                              placeholder="Name"
                              className="border rounded px-2 py-1 w-full"
                              value={proj.name}
                              onChange={(e) =>
                                updateArrayItem(
                                  resumeData.projects,
                                  idx,
                                  { ...proj, name: e.target.value },
                                  "projects"
                                )
                              }
                            />
                            <div className="flex gap-2">
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => removeArrayItem(idx, "projects")}
                              >
                                X
                              </Button>
                            </div>
                          </div>

                          {/* 🔹 Project Details (bullet points) */}
                          <div className="space-y-2">
                            <label className="block text-xs text-slate-500">
                              Key Contributions (bullet points)
                            </label>
                            {(proj.details || []).map((detail, dIdx) => (
                              <div key={dIdx} className="flex gap-2">
                                <input
                                  type="text"
                                  placeholder={`Detail ${dIdx + 1}`}
                                  className="border rounded px-2 py-1 w-full"
                                  value={detail}
                                  onChange={(e) => {
                                    const newDetails = [...(proj.details || [])];
                                    newDetails[dIdx] = e.target.value;
                                    updateArrayItem(
                                      resumeData.projects,
                                      idx,
                                      { ...proj, details: newDetails },
                                      "projects"
                                    );
                                  }}
                                />
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  onClick={() => {
                                    const newDetails = (proj.details || []).filter(
                                      (_, i) => i !== dIdx
                                    );
                                    updateArrayItem(
                                      resumeData.projects,
                                      idx,
                                      { ...proj, details: newDetails },
                                      "projects"
                                    );
                                  }}
                                >
                                  -
                                </Button>
                              </div>
                            ))}
                            {(!proj.details || proj.details.length < 3) && (
                              <Button
                                variant="secondary"
                                size="sm"
                                onClick={() => {
                                  const newDetails = [...(proj.details || []), ""];
                                  updateArrayItem(
                                    resumeData.projects,
                                    idx,
                                    { ...proj, details: newDetails },
                                    "projects"
                                  );
                                }}
                              >
                                + Add Detail
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>

                    <Button
                      onClick={() =>
                        addArrayItem({ name: "", description: "", details: [] }, "projects")
                      }
                      className="mt-2"
                    >
                      Add Project
                    </Button>
                  </div>
                </div>
              ) : (
                <div>
                  <label className="block text-sm mb-1">Select Template</label>
                  <select
                    className="w-full border rounded-lg px-3 py-2"
                    value={selectedTemplate}
                    onChange={(e) =>
                      setSelectedTemplate(e.target.value as "modern" | "minimal")
                    }
                  >
                    <option value="modern">Modern</option>
                    <option value="minimal">Minimal</option>
                  </select>
                </div>
              )}
            </CardContent>
          </Card>

          {/* 🔹 Resume Preview */}
          <Card className="lg:col-span-2 shadow-lg rounded-2xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-indigo-600" /> Resume Preview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-end mb-4">
                <Button variant="outline" className="flex items-center" onClick={handleDownloadPDF}>
                  <Download className="h-4 w-4 mr-2" /> Download PDF
                </Button>
              </div>

              <div
                ref={ref}
                className="p-4 rounded-lg border border-slate-200 dark:border-gray-700 overflow-y-auto max-h-[85vh] a4-page"
              >
                {selectedTemplate === "minimal" ? (
    <MinimalTemplate data={resumeData} sectionTextSizes={sectionTextSizes} />
  ) : (
    <ModernTemplate data={resumeData} sectionTextSizes={sectionTextSizes} />
  )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ResumeGenerator;
