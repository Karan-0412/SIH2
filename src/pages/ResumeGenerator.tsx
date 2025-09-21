import React, { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Download, Settings2, ArrowLeft } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { useStudent } from "@/hooks/useStudent";
import { useProjects } from "@/hooks/useProjects";
import { useAchievements } from "@/hooks/useAchievements";
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
  const { projects, loading: projectsLoading } = useProjects();
  const { loading: achievementsLoading } = useAchievements();

  // Debug log to verify component is loading
  console.log('ResumeGenerator component loaded with AI features!');

  const [selectedTemplate, setSelectedTemplate] = useState<"modern" | "minimal">("modern");
  const [isEditable, setIsEditable] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showNotificationsDropdown, setShowNotificationsDropdown] = useState(false);
  const [certificates, setCertificates] = useState<any[]>([]);
  const [dataLoading, setDataLoading] = useState(false);
  const [selectedProjects, setSelectedProjects] = useState<Set<string>>(new Set());
  const [showProjectSelector, setShowProjectSelector] = useState(false);
  const [aiGenerating, setAiGenerating] = useState<string | null>(null);
  const [aiService] = useState(() => AITextService.getInstance());
  const [dataError, setDataError] = useState<string | null>(null);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
      const navigate = useNavigate();
  
  // Fetch certificates with improved error handling
  useEffect(() => {
    const fetchCertificates = async () => {
      if (!profile) return;
      
      try {
        setDataError(null);
        const { data, error } = await supabase
          .from('certificates')
          .select('*')
          .eq('student_id', profile.id)
          .eq('status', 'approved')
          .order('uploaded_at', { ascending: false });
        
        if (error) {
          console.error('Error fetching certificates:', error);
          setDataError('Failed to load certificates');
          return;
        }
        
        setCertificates(data || []);
        console.log('Certificates loaded:', data?.length || 0);
      } catch (error) {
        console.error('Error fetching certificates:', error);
        setDataError('Failed to load certificates');
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
        degree: profile?.department ? `B.Tech in ${profile.department}` : "B.Tech in Computer Science",
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
          degree: profile.department ? `B.Tech in ${profile.department}` : "B.Tech in Computer Science",
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

  // Update projects from projects data
  useEffect(() => {
    if (projects.length > 0) {
      // Initialize selected projects if not set
      if (selectedProjects.size === 0) {
        // Select all projects by default
        const allProjectIds = new Set(projects.map(p => p.id));
        setSelectedProjects(allProjectIds);
      }

      // Filter projects based on selection
      const selectedProjectsData = projects.filter(project => selectedProjects.has(project.id));
      
      const portfolioProjects = selectedProjectsData.map(project => {
        const details = [];
        
        // Add category information
        if (project.category) {
          details.push(`Category: ${project.category}`);
        }
        
        // Add external URL if available
        if (project.external_url) {
          details.push(`Live Demo: ${project.external_url}`);
        }
        
        // Add GitHub URL if available
        if (project.github_url) {
          details.push(`GitHub: ${project.github_url}`);
        }
        
        // Add featured status
        if (project.featured) {
          details.push("Featured Project");
        }
        
        // Add visibility status
        if (project.visibility) {
          details.push(`Visibility: ${project.visibility}`);
        }
        
        // Add creation date
        if (project.created_at) {
          const date = new Date(project.created_at);
          details.push(`Created: ${date.toLocaleDateString()}`);
        }
        
        return {
          name: project.title,
          description: project.description || "A project showcasing technical skills and creativity.",
          details: details.length > 0 ? details : ["Project details available upon request"],
        };
      });

      setResumeData(prev => ({
        ...prev,
        projects: portfolioProjects,
      }));

      // Cache the projects data in localStorage
      localStorage.setItem('resume_projects_cache', JSON.stringify(projects));
    } else {
      // Check if we have cached data
      const cachedProjects = localStorage.getItem('resume_projects_cache');
      if (cachedProjects) {
        try {
          const cached = JSON.parse(cachedProjects);
          if (cached.length > 0) {
            // Initialize selected projects for cached data
            if (selectedProjects.size === 0) {
              const allProjectIds = new Set(cached.map((p: any) => p.id));
              setSelectedProjects(allProjectIds);
            }

            // Filter cached projects based on selection
            const selectedCachedProjects = cached.filter((project: any) => selectedProjects.has(project.id));
            
            const portfolioProjects = selectedCachedProjects.map((project: any) => {
              const details = [];
              
              // Add category information
              if (project.category) {
                details.push(`Category: ${project.category}`);
              }
              
              // Add external URL if available
              if (project.external_url) {
                details.push(`Live Demo: ${project.external_url}`);
              }
              
              // Add GitHub URL if available
              if (project.github_url) {
                details.push(`GitHub: ${project.github_url}`);
              }
              
              // Add featured status
              if (project.featured) {
                details.push("Featured Project");
              }
              
              // Add visibility status
              if (project.visibility) {
                details.push(`Visibility: ${project.visibility}`);
              }
              
              // Add creation date
              if (project.created_at) {
                const date = new Date(project.created_at);
                details.push(`Created: ${date.toLocaleDateString()}`);
              }
              
              return {
                name: project.title,
                description: project.description || "A project showcasing technical skills and creativity.",
                details: details.length > 0 ? details : ["Project details available upon request"],
              };
            });

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
  }, [projects, selectedProjects]);

  // Update certificates from real data
  useEffect(() => {
    if (certificates.length > 0) {
      // Only include approved certificates
      const approvedCertificates = certificates
        .filter(cert => cert.status === 'approved')
        .map(cert => {
          // Create a more descriptive certificate title
          let title = cert.title;
          if (cert.issuing_organization) {
            title = `${cert.title} - ${cert.issuing_organization}`;
          }
          return title;
        });
      
      setResumeData(prev => ({
        ...prev,
        certificates: approvedCertificates,
      }));
    }
  }, [certificates]);

  // Update skills from all available data sources
  useEffect(() => {
    const skills = new Set<string>();
    
    // Add skills from achievements with more comprehensive detection
    achievements.forEach(achievement => {
      const title = achievement.title.toLowerCase();
      const description = (achievement.description || '').toLowerCase();
      const combined = `${title} ${description}`;
      
      // Technical Skills
      if (combined.includes('react')) skills.add('React');
      if (combined.includes('javascript')) skills.add('JavaScript');
      if (combined.includes('typescript')) skills.add('TypeScript');
      if (combined.includes('python')) skills.add('Python');
      if (combined.includes('java')) skills.add('Java');
      if (combined.includes('c++')) skills.add('C++');
      if (combined.includes('c#')) skills.add('C#');
      if (combined.includes('go')) skills.add('Go');
      if (combined.includes('rust')) skills.add('Rust');
      if (combined.includes('php')) skills.add('PHP');
      if (combined.includes('ruby')) skills.add('Ruby');
      if (combined.includes('swift')) skills.add('Swift');
      if (combined.includes('kotlin')) skills.add('Kotlin');
      
      // Web Technologies
      if (combined.includes('html')) skills.add('HTML');
      if (combined.includes('css')) skills.add('CSS');
      if (combined.includes('sass') || combined.includes('scss')) skills.add('SASS/SCSS');
      if (combined.includes('bootstrap')) skills.add('Bootstrap');
      if (combined.includes('tailwind')) skills.add('Tailwind CSS');
      if (combined.includes('jquery')) skills.add('jQuery');
      if (combined.includes('angular')) skills.add('Angular');
      if (combined.includes('vue')) skills.add('Vue.js');
      if (combined.includes('next')) skills.add('Next.js');
      if (combined.includes('nuxt')) skills.add('Nuxt.js');
      
      // Backend & Databases
      if (combined.includes('node')) skills.add('Node.js');
      if (combined.includes('express')) skills.add('Express.js');
      if (combined.includes('django')) skills.add('Django');
      if (combined.includes('flask')) skills.add('Flask');
      if (combined.includes('spring')) skills.add('Spring Boot');
      if (combined.includes('laravel')) skills.add('Laravel');
      if (combined.includes('rails')) skills.add('Ruby on Rails');
      if (combined.includes('sql')) skills.add('SQL');
      if (combined.includes('mysql')) skills.add('MySQL');
      if (combined.includes('postgresql') || combined.includes('postgres')) skills.add('PostgreSQL');
      if (combined.includes('mongodb')) skills.add('MongoDB');
      if (combined.includes('redis')) skills.add('Redis');
      if (combined.includes('firebase')) skills.add('Firebase');
      
      // Cloud & DevOps
      if (combined.includes('aws')) skills.add('AWS');
      if (combined.includes('azure')) skills.add('Azure');
      if (combined.includes('gcp') || combined.includes('google cloud')) skills.add('Google Cloud');
      if (combined.includes('docker')) skills.add('Docker');
      if (combined.includes('kubernetes')) skills.add('Kubernetes');
      if (combined.includes('jenkins')) skills.add('Jenkins');
      if (combined.includes('gitlab')) skills.add('GitLab');
      if (combined.includes('github')) skills.add('GitHub');
      if (combined.includes('git')) skills.add('Git');
      
      // Data Science & AI
      if (combined.includes('machine learning')) skills.add('Machine Learning');
      if (combined.includes('deep learning')) skills.add('Deep Learning');
      if (combined.includes('data science')) skills.add('Data Science');
      if (combined.includes('tensorflow')) skills.add('TensorFlow');
      if (combined.includes('pytorch')) skills.add('PyTorch');
      if (combined.includes('pandas')) skills.add('Pandas');
      if (combined.includes('numpy')) skills.add('NumPy');
      if (combined.includes('scikit-learn')) skills.add('Scikit-learn');
      if (combined.includes('matplotlib')) skills.add('Matplotlib');
      if (combined.includes('seaborn')) skills.add('Seaborn');
      
      // Mobile Development
      if (combined.includes('react native')) skills.add('React Native');
      if (combined.includes('flutter')) skills.add('Flutter');
      if (combined.includes('xamarin')) skills.add('Xamarin');
      if (combined.includes('ionic')) skills.add('Ionic');
      
      // Other Technologies
      if (combined.includes('blockchain')) skills.add('Blockchain');
      if (combined.includes('ethereum')) skills.add('Ethereum');
      if (combined.includes('solidity')) skills.add('Solidity');
      if (combined.includes('web3')) skills.add('Web3');
      if (combined.includes('graphql')) skills.add('GraphQL');
      if (combined.includes('rest api')) skills.add('REST API');
      if (combined.includes('microservices')) skills.add('Microservices');
      if (combined.includes('kubernetes')) skills.add('Kubernetes');
      
      // Soft Skills
      if (combined.includes('leadership')) skills.add('Leadership');
      if (combined.includes('teamwork')) skills.add('Teamwork');
      if (combined.includes('communication')) skills.add('Communication');
      if (combined.includes('problem solving')) skills.add('Problem Solving');
      if (combined.includes('project management')) skills.add('Project Management');
      if (combined.includes('agile')) skills.add('Agile');
      if (combined.includes('scrum')) skills.add('Scrum');
    });

    // Add skills from projects with enhanced detection
    projects.forEach(project => {
      const title = project.title.toLowerCase();
      const description = (project.description || '').toLowerCase();
      const category = project.category.toLowerCase();
      const combined = `${title} ${description} ${category}`;
      
      // Use the same comprehensive skill detection as achievements
      if (combined.includes('react')) skills.add('React');
      if (combined.includes('javascript')) skills.add('JavaScript');
      if (combined.includes('typescript')) skills.add('TypeScript');
      if (combined.includes('python')) skills.add('Python');
      if (combined.includes('java')) skills.add('Java');
      if (combined.includes('html')) skills.add('HTML');
      if (combined.includes('css')) skills.add('CSS');
      if (combined.includes('node')) skills.add('Node.js');
      if (combined.includes('sql')) skills.add('SQL');
      if (combined.includes('git')) skills.add('Git');
      if (combined.includes('aws')) skills.add('AWS');
      if (combined.includes('machine learning')) skills.add('Machine Learning');
      if (combined.includes('data science')) skills.add('Data Science');
      if (combined.includes('web development')) skills.add('Web Development');
      if (combined.includes('mobile development')) skills.add('Mobile Development');
      if (combined.includes('full stack')) skills.add('Full Stack Development');
    });

    // Add skills from certificates
    certificates.forEach(cert => {
      const title = cert.title.toLowerCase();
      const description = (cert.description || '').toLowerCase();
      const combined = `${title} ${description}`;
      
      if (combined.includes('react')) skills.add('React');
      if (combined.includes('javascript')) skills.add('JavaScript');
      if (combined.includes('python')) skills.add('Python');
      if (combined.includes('java')) skills.add('Java');
      if (combined.includes('aws')) skills.add('AWS');
      if (combined.includes('machine learning')) skills.add('Machine Learning');
      if (combined.includes('data science')) skills.add('Data Science');
      if (combined.includes('web development')) skills.add('Web Development');
      if (combined.includes('cloud computing')) skills.add('Cloud Computing');
      if (combined.includes('cybersecurity')) skills.add('Cybersecurity');
      if (combined.includes('devops')) skills.add('DevOps');
    });

    // Add skills based on profile department - Comprehensive for all academic disciplines
    if (profile?.department) {
      const dept = profile.department.toLowerCase();
      
      // Technical & Engineering Fields
      if (dept.includes('computer') || dept.includes('software')) {
        skills.add('Computer Science');
        skills.add('Software Engineering');
        skills.add('Algorithm Design');
      }
      if (dept.includes('information') || dept.includes('it')) {
        skills.add('Information Technology');
        skills.add('Systems Analysis');
        skills.add('Database Management');
      }
      if (dept.includes('data') || dept.includes('analytics')) {
        skills.add('Data Analysis');
        skills.add('Statistics');
        skills.add('Data Visualization');
      }
      if (dept.includes('cyber') || dept.includes('security')) {
        skills.add('Cybersecurity');
        skills.add('Network Security');
        skills.add('Risk Assessment');
      }
      if (dept.includes('mechanical')) {
        skills.add('Mechanical Engineering');
        skills.add('CAD Design');
        skills.add('Manufacturing');
      }
      if (dept.includes('civil')) {
        skills.add('Civil Engineering');
        skills.add('Structural Design');
        skills.add('Project Planning');
      }
      if (dept.includes('electrical')) {
        skills.add('Electrical Engineering');
        skills.add('Circuit Design');
        skills.add('Power Systems');
      }
      if (dept.includes('chemical')) {
        skills.add('Chemical Engineering');
        skills.add('Process Design');
        skills.add('Quality Control');
      }
      
      // Business & Commerce Fields
      if (dept.includes('business') || dept.includes('management')) {
        skills.add('Business Management');
        skills.add('Strategic Planning');
        skills.add('Financial Analysis');
        skills.add('Leadership');
      }
      if (dept.includes('commerce') || dept.includes('accounting')) {
        skills.add('Accounting');
        skills.add('Financial Reporting');
        skills.add('Tax Planning');
        skills.add('Auditing');
      }
      if (dept.includes('marketing')) {
        skills.add('Digital Marketing');
        skills.add('Brand Management');
        skills.add('Market Research');
        skills.add('Social Media Marketing');
      }
      if (dept.includes('finance')) {
        skills.add('Financial Analysis');
        skills.add('Investment Planning');
        skills.add('Risk Management');
        skills.add('Portfolio Management');
      }
      if (dept.includes('economics')) {
        skills.add('Economic Analysis');
        skills.add('Market Research');
        skills.add('Policy Analysis');
        skills.add('Statistical Modeling');
      }
      
      // Arts & Humanities
      if (dept.includes('english') || dept.includes('literature')) {
        skills.add('Creative Writing');
        skills.add('Content Creation');
        skills.add('Research & Analysis');
        skills.add('Communication');
      }
      if (dept.includes('history')) {
        skills.add('Historical Research');
        skills.add('Critical Analysis');
        skills.add('Documentation');
        skills.add('Cultural Studies');
      }
      if (dept.includes('psychology')) {
        skills.add('Behavioral Analysis');
        skills.add('Research Methods');
        skills.add('Data Interpretation');
        skills.add('Counseling');
      }
      if (dept.includes('sociology')) {
        skills.add('Social Research');
        skills.add('Data Analysis');
        skills.add('Community Development');
        skills.add('Policy Research');
      }
      if (dept.includes('political') || dept.includes('politics')) {
        skills.add('Policy Analysis');
        skills.add('Research');
        skills.add('Public Speaking');
        skills.add('Critical Thinking');
      }
      
      // Science Fields
      if (dept.includes('physics')) {
        skills.add('Physics');
        skills.add('Mathematical Modeling');
        skills.add('Laboratory Techniques');
        skills.add('Data Analysis');
      }
      if (dept.includes('chemistry')) {
        skills.add('Chemistry');
        skills.add('Laboratory Analysis');
        skills.add('Quality Control');
        skills.add('Research Methods');
      }
      if (dept.includes('biology')) {
        skills.add('Biology');
        skills.add('Laboratory Techniques');
        skills.add('Research');
        skills.add('Data Collection');
      }
      if (dept.includes('mathematics')) {
        skills.add('Mathematics');
        skills.add('Statistical Analysis');
        skills.add('Problem Solving');
        skills.add('Mathematical Modeling');
      }
      
      // Medical & Health Fields
      if (dept.includes('medicine') || dept.includes('medical')) {
        skills.add('Medical Knowledge');
        skills.add('Patient Care');
        skills.add('Clinical Research');
        skills.add('Healthcare Management');
      }
      if (dept.includes('pharmacy')) {
        skills.add('Pharmaceutical Sciences');
        skills.add('Drug Development');
        skills.add('Quality Assurance');
        skills.add('Regulatory Affairs');
      }
      if (dept.includes('nursing')) {
        skills.add('Patient Care');
        skills.add('Healthcare Management');
        skills.add('Clinical Skills');
        skills.add('Emergency Response');
      }
      if (dept.includes('public health')) {
        skills.add('Public Health');
        skills.add('Epidemiology');
        skills.add('Health Policy');
        skills.add('Community Health');
      }
      
      // Design & Creative Fields
      if (dept.includes('design') || dept.includes('graphic')) {
        skills.add('Graphic Design');
        skills.add('Visual Communication');
        skills.add('Adobe Creative Suite');
        skills.add('Brand Design');
      }
      if (dept.includes('architecture')) {
        skills.add('Architecture');
        skills.add('CAD Design');
        skills.add('Project Management');
        skills.add('Space Planning');
      }
      if (dept.includes('fashion')) {
        skills.add('Fashion Design');
        skills.add('Trend Analysis');
        skills.add('Textile Knowledge');
        skills.add('Brand Development');
      }
      
      // Education Fields
      if (dept.includes('education') || dept.includes('teaching')) {
        skills.add('Teaching');
        skills.add('Curriculum Development');
        skills.add('Educational Technology');
        skills.add('Student Assessment');
      }
      
      // Agriculture & Environmental
      if (dept.includes('agriculture') || dept.includes('farming')) {
        skills.add('Agricultural Sciences');
        skills.add('Crop Management');
        skills.add('Sustainability');
        skills.add('Rural Development');
      }
      if (dept.includes('environmental')) {
        skills.add('Environmental Science');
        skills.add('Sustainability');
        skills.add('Climate Studies');
        skills.add('Conservation');
      }
    }

    // Add essential soft skills if none found
    if (skills.size === 0) {
      skills.add('Problem Solving');
      skills.add('Team Collaboration');
      skills.add('Project Management');
      skills.add('Communication');
    }

    setResumeData(prev => ({
      ...prev,
      skills: Array.from(skills).sort(),
    }));
  }, [achievements, projects, certificates, profile]);

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
      projectsData: projects.length,
      achievements: achievements.length,
      certificatesData: certificates.length,
      projectsData: projects
    });
  }, [resumeData, projects, achievements, certificates]);

  // Initialize loading state when component mounts
  useEffect(() => {
    if (profile) {
      setDataLoading(true);
    }
  }, [profile]);

  // Track when all data is loaded
  useEffect(() => {
    if (profile) {
      // Check if we have any data loaded
      const hasProjects = projects.length > 0;
      const hasAchievements = achievements.length > 0;
      const hasCertificates = certificates.length > 0;
      
      // Consider data loaded if we have at least some data OR if loading is complete
      const allDataLoaded = (!projectsLoading && !achievementsLoading) || hasProjects || hasAchievements || hasCertificates;
      
      setDataLoaded(allDataLoaded);
      
      if (allDataLoaded) {
        setDataLoading(false);
        console.log('All data loaded successfully!', {
          projects: projects.length,
          achievements: achievements.length,
          certificates: certificates.length,
          projectsLoading,
          achievementsLoading
        });
        setSuccessMessage('All data loaded successfully!');
        // Clear success message after 3 seconds
        setTimeout(() => setSuccessMessage(null), 3000);
      }
    }
  }, [profile, projectsLoading, achievementsLoading, projects.length, achievements.length, certificates.length]);

  // Timeout to prevent infinite loading
  useEffect(() => {
    if (profile && dataLoading) {
      const timeout = setTimeout(() => {
        console.log('⏰ Loading timeout reached, marking as loaded');
        setDataLoaded(true);
        setDataLoading(false);
        setDataError('Loading took longer than expected, but data may still be loading...');
      }, 10000); // 10 second timeout

      return () => clearTimeout(timeout);
    }
  }, [profile, dataLoading]);

  // Auto-clear success messages
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  // Force refresh projects data when component mounts or when switching back
  useEffect(() => {
    if (profile && projects.length === 0 && !projectsLoading) {
      console.log('Projects is empty, fetching data...');
      // Trigger a refresh of projects data
      const refreshData = async () => {
        try {
          const { data, error } = await supabase
            .from('projects')
            .select('*')
            .eq('student_id', profile.id)
            .order('created_at', { ascending: false });
          
          if (error) throw error;
          console.log('Fetched projects data:', data);
        } catch (error) {
          console.error('Error fetching projects:', error);
        }
      };
      refreshData();
    }
  }, [profile, projects.length, projectsLoading]);

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
    if (projects.length > 0) {
      setSelectedProjects(new Set(projects.map(p => p.id)));
    }
  };

  const clearProjectSelection = () => {
    setSelectedProjects(new Set());
  };

  // AI Generation functions with enhanced context
  const generateAIContent = async (type: 'overview' | 'skills' | 'project_description', projectData?: any) => {
    if (!profile) return;

    setAiGenerating(type);
    try {
      // Build comprehensive context for AI
      const context = {
        profile: {
          name: profile.full_name,
          department: profile.department,
          graduation_year: profile.graduation_year,
          bio: profile.bio
        },
        projects: projects.slice(0, 5).map(p => ({
          title: p.title,
          description: p.description,
          category: p.category,
          technologies: p.github_data?.languages || []
        })),
        achievements: achievements.slice(0, 5).map(a => ({
          title: a.title,
          description: a.description,
          type: a.achievement_type
        })),
        certificates: certificates.slice(0, 5).map(c => ({
          title: c.title,
          organization: c.issuing_organization
        }))
      };

      const request: AIGenerationRequest = {
        type,
        userProfile: {
          name: profile.full_name,
          role: profile.role,
          experience: 'Student',
          education: profile.department || 'University',
          department: profile.department,
          graduation_year: profile.graduation_year
        },
        projectData,
        existingContent: type === 'overview' ? resumeData.overview : undefined,
        context: type === 'project_description' ? projectData?.title : undefined,
        additionalContext: context
      };

      const response = await aiService.generateText(request);
      
      if (type === 'overview') {
        handleChange('overview', response.content);
        setSuccessMessage('AI generated professional overview');
        console.log('AI generated professional overview');
      } else if (type === 'skills') {
        const skills = response.content.split(',').map(s => s.trim()).filter(s => s);
        handleChange('skills', skills);
        setSuccessMessage(`AI generated ${skills.length} relevant skills`);
        console.log('AI generated relevant skills:', skills.length);
      } else if (type === 'project_description' && projectData) {
        setSuccessMessage('AI generated project description');
        console.log('AI generated project description:', response.content);
      }

      // Show success message
      console.log(`AI generated ${type}:`, response.content);
    } catch (error) {
      console.error('AI generation error:', error);
      setDataError('AI generation failed. Please try again.');
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

      // Show loading state
      setDataLoading(true);
      
      // Enhanced PDF options for professional output
    const opt = {
        margin: [10, 10, 10, 10],
        filename: `${resumeData.name.replace(/\s+/g, "_")}_Resume_${new Date().toISOString().split('T')[0]}.pdf`,
        image: { 
          type: "jpeg", 
          quality: 0.98 
        },
        html2canvas: { 
          scale: 2, 
          useCORS: true,
          letterRendering: true,
          allowTaint: true,
          backgroundColor: '#ffffff'
        },
        jsPDF: { 
          unit: "mm", 
          format: "a4", 
          orientation: "portrait",
          compress: true
        },
        pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
      };

      html2pdf()
        .set(opt)
        .from(element)
        .save()
        .then(() => {
          console.log('PDF downloaded successfully');
          setSuccessMessage('PDF downloaded successfully!');
          setDataLoading(false);
        })
        .catch((error) => {
          console.error('❌ PDF download failed:', error);
          setDataError('Failed to download PDF. Please try again.');
          setDataLoading(false);
        });
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate("/")}
            className="hover:bg-white/50 text-slate-600 hover:text-slate-800 border border-slate-200 hover:border-slate-300"
                    >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
                    </Button>
          <div className="flex-1">
            <h1 className="text-4xl font-bold text-slate-800 flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-xl">
                <FileText className="w-8 h-8 text-blue-600" />
              </div>
            Resume Generator
              {dataLoading && (
                <div className="flex items-center gap-2 text-sm text-slate-500 ml-4">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                  Loading your data...
                </div>
              )}
          </h1>
            <p className="text-slate-600 mt-2">Create a professional resume with AI-powered content generation</p>
          </div>
        </div>

        {/* AI Features Section */}
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h2 className="text-lg font-semibold text-blue-800">AI-Powered Resume Generation</h2>
          <p className="text-sm text-blue-700">Use AI to automatically generate professional content for your resume. Enable "Editable Mode" to access AI features.</p>
        </div>

        {/* Data Status Indicator */}
        <div className="mb-6 p-6 bg-gradient-to-r from-slate-50 to-blue-50 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-slate-800">Resume Data Status</h3>
              <p className="text-sm text-slate-600">
                {dataLoaded ? 'All data loaded successfully' : 'Loading your data...'}
              </p>
              {dataError && (
                <p className="text-sm text-red-600 mt-1">Error: {dataError}</p>
              )}
              {successMessage && (
                <p className="text-sm text-green-600 mt-1">{successMessage}</p>
              )}
            </div>
            <div className="flex gap-2">
              {dataLoaded && (
                <div className="flex items-center gap-2 text-sm text-green-600">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  Ready
                </div>
              )}
              <Button 
                variant="outline" 
                size="sm" 
                onClick={async () => {
                  console.log('Manual refresh triggered');
                  setDataLoading(true);
                  setDataError(null);
                  setSuccessMessage(null);
                  
                  try {
                    // Clear cache
                    localStorage.removeItem('resume_projects_cache');
                    
                    // Force refresh of all data sources
                    if (profile) {
                      // Refresh projects
                      const { data: projectsData, error: projectsError } = await supabase
                        .from('projects')
                        .select('*')
                        .eq('student_id', profile.id)
                        .order('created_at', { ascending: false });
                      
                      if (projectsError) throw projectsError;
                      console.log('Fresh projects data:', projectsData);
                      
                      // Refresh certificates
                      const { data: certificatesData, error: certificatesError } = await supabase
                        .from('certificates')
                        .select('*')
                        .eq('student_id', profile.id)
                        .eq('status', 'approved')
                        .order('uploaded_at', { ascending: false });
                      
                      if (certificatesError) throw certificatesError;
                      console.log('Fresh certificates data:', certificatesData);
                      
                      setCertificates(certificatesData || []);
                    }
                    
                    setSuccessMessage('✅ Data refreshed successfully!');
                    setDataLoading(false);
                  } catch (error) {
                    console.error('Error refreshing data:', error);
                    setDataError('Failed to refresh data');
                    setDataLoading(false);
                  }
                }}
                className="text-blue-600 hover:text-blue-700 border-blue-200 hover:border-blue-300"
                disabled={dataLoading}
              >
                {dataLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600 mr-1"></div>
                    Refreshing...
                  </>
                ) : (
                  'Refresh Data'
                )}
              </Button>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-sm">
            <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-slate-100">
              <div className={`w-4 h-4 rounded-full ${projects.length > 0 ? 'bg-green-500' : 'bg-gray-300'}`}></div>
              <div>
                <div className="font-medium text-slate-700">Projects</div>
                <div className="text-slate-500">{selectedProjects.size}/{projects.length} selected</div>
                {projects.length > 0 && (
                  <div className="text-xs text-slate-400">
                    {projects.filter(p => p.featured).length} featured
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-slate-100">
              <div className={`w-4 h-4 rounded-full ${certificates.length > 0 ? 'bg-green-500' : 'bg-gray-300'}`}></div>
              <div>
                <div className="font-medium text-slate-700">Certificates</div>
                <div className="text-slate-500">{certificates.filter(c => c.status === 'approved').length} approved</div>
                {certificates.length > 0 && (
                  <div className="text-xs text-slate-400">
                    {certificates.filter(c => c.status === 'pending').length} pending
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-slate-100">
              <div className={`w-4 h-4 rounded-full ${achievements.length > 0 ? 'bg-green-500' : 'bg-gray-300'}`}></div>
              <div>
                <div className="font-medium text-slate-700">Achievements</div>
                <div className="text-slate-500">{achievements.length} earned</div>
                {achievements.length > 0 && (
                  <div className="text-xs text-slate-400">
                    {achievements.reduce((sum, a) => sum + (a.points || 0), 0)} total points
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-slate-100">
              <div className={`w-4 h-4 rounded-full ${resumeData.skills.length > 0 ? 'bg-green-500' : 'bg-gray-300'}`}></div>
              <div>
                <div className="font-medium text-slate-700">Skills</div>
                <div className="text-slate-500">{resumeData.skills.length} identified</div>
                {resumeData.skills.length > 0 && (
                  <div className="text-xs text-slate-400">
                    {resumeData.skills.slice(0, 3).join(', ')}
                    {resumeData.skills.length > 3 && '...'}
                  </div>
                )}
              </div>
            </div>
          </div>
          {aiGenerating && (
            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center gap-3 text-blue-800">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                <span className="font-medium">
                  AI is generating {aiGenerating} content...
                </span>
              </div>
            </div>
          )}
          {projects.length === 0 && (
            <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 text-amber-600">⚠️</div>
                <div>
                  <p className="font-medium text-amber-800">No projects found</p>
                  <p className="text-sm text-amber-700">
                    Add projects to your portfolio to see them in your resume. 
                    <a href="/my-projects" className="text-blue-600 hover:underline ml-1 font-medium">Go to My Projects</a>
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Settings Panel */}
          <Card className="shadow-xl rounded-2xl max-h-[85vh] overflow-y-auto border-0 bg-white">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-2xl border-b border-slate-100">
              <CardTitle className="flex items-center gap-3 text-slate-800">
                <Settings2 className="h-6 w-6 text-blue-600" /> 
                Resume Settings
              </CardTitle>
              <p className="text-sm text-slate-600 mt-1">Customize your resume content and appearance</p>
            </CardHeader>
            <CardContent className="space-y-6 p-6">
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200">
                <div>
                  <label className="flex items-center gap-3 text-sm font-medium text-slate-700">
                <input
                  type="checkbox"
                  checked={isEditable}
                  onChange={() => setIsEditable(!isEditable)}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                Editable Mode
              </label>
                  <p className="text-xs text-slate-500 mt-1">Enable to edit resume content and access AI features</p>
                </div>
              </div>

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
                          'AI Generate'
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
                          'AI Generate'
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
                          disabled={projects.length === 0}
                        >
                          Select All
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={clearProjectSelection}
                          disabled={projects.length === 0}
                        >
                          Clear All
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setShowProjectSelector(!showProjectSelector)}
                          disabled={projects.length === 0}
                        >
                          {showProjectSelector ? 'Hide' : 'Show'} Projects ({selectedProjects.size})
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            // Generate AI content for all selected projects
                            selectedProjects.forEach(projectId => {
                              const project = projects.find(p => p.id === projectId);
                              if (project) {
                                generateProjectDescription(project);
                              }
                            });
                          }}
                          disabled={selectedProjects.size === 0 || aiGenerating !== null}
                          className="text-green-600 hover:text-green-700"
                        >
                          Generate All Descriptions
                        </Button>
                      </div>
                      
                      {showProjectSelector && projects.length > 0 && (
                        <div className="max-h-48 overflow-y-auto border rounded-lg p-3 space-y-2">
                          {projects.map((project) => (
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
                                  'AI'
                                )}
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                      
                      {projects.length === 0 && (
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

          {/* Resume Preview */}
          <Card className="lg:col-span-2 shadow-xl rounded-2xl border-0 bg-white">
            <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-t-2xl border-b border-slate-100">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-3 text-slate-800">
                    <FileText className="h-6 w-6 text-indigo-600" /> 
                    Resume Preview
              </CardTitle>
                  <p className="text-sm text-slate-600 mt-1">Live preview of your resume with real-time updates</p>
                </div>
                <Button 
                  variant="outline" 
                  className="flex items-center gap-2 bg-white hover:bg-slate-50 border-slate-200 hover:border-slate-300 text-slate-700" 
                  onClick={handleDownloadPDF}
                  disabled={dataLoading || !dataLoaded}
                >
                  {dataLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-slate-600"></div>
                      Generating PDF...
                    </>
                  ) : (
                    <>
                      <Download className="h-4 w-4" /> 
                      Download PDF
                    </>
                  )}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div
                ref={ref}
                className="p-6 rounded-xl border-2 border-slate-200 bg-white shadow-inner overflow-y-auto max-h-[85vh] a4-page"
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
