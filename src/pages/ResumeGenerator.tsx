import React, { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Download, Settings2, ArrowLeft } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { useStudent } from "@/hooks/useStudent";
import { supabase } from "@/integrations/supabase/client";

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

  const [selectedTemplate, setSelectedTemplate] = useState<"modern" | "minimal">("modern");
  const [isEditable, setIsEditable] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showNotificationsDropdown, setShowNotificationsDropdown] = useState(false);
  const [certificates, setCertificates] = useState<any[]>([]);
  const navigate = useNavigate();
  
  // Fetch certificates
  useEffect(() => {
    const fetchCertificates = async () => {
      if (!profile) return;
      
      try {
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
        overview: profile.bio || prev.overview,
        education: [{
          degree: profile.department || "B.Tech in Computer Science",
          institution: profile.college || "University Name",
          year: profile.graduation_year ? `${profile.graduation_year - 4}-${profile.graduation_year}` : "2020-2024",
        }],
      }));
    }
  }, [profile]);

  // Update projects from portfolio
  useEffect(() => {
    if (portfolio.length > 0) {
      const portfolioProjects = portfolio.map(project => ({
        name: project.title,
        description: project.description || "A project showcasing technical skills and creativity.",
        details: [
          `Category: ${project.category}`,
          project.external_url ? `Live Demo: ${project.external_url}` : "Project details available upon request",
        ],
      }));

      setResumeData(prev => ({
        ...prev,
        projects: portfolioProjects,
      }));
    }
  }, [portfolio]);

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
      if (achievement.title.toLowerCase().includes('react')) skills.add('React');
      if (achievement.title.toLowerCase().includes('javascript')) skills.add('JavaScript');
      if (achievement.title.toLowerCase().includes('python')) skills.add('Python');
      if (achievement.title.toLowerCase().includes('java')) skills.add('Java');
      if (achievement.title.toLowerCase().includes('aws')) skills.add('AWS');
      if (achievement.title.toLowerCase().includes('machine learning')) skills.add('Machine Learning');
    });

    // Add skills from projects
    portfolio.forEach(project => {
      if (project.description?.toLowerCase().includes('react')) skills.add('React');
      if (project.description?.toLowerCase().includes('typescript')) skills.add('TypeScript');
      if (project.description?.toLowerCase().includes('node')) skills.add('Node.js');
      if (project.description?.toLowerCase().includes('python')) skills.add('Python');
      if (project.description?.toLowerCase().includes('javascript')) skills.add('JavaScript');
    });

    // Add default skills if none found
    if (skills.size === 0) {
      skills.add('Problem Solving');
      skills.add('Team Collaboration');
      skills.add('Project Management');
    }

    setResumeData(prev => ({
      ...prev,
      skills: Array.from(skills),
    }));
  }, [achievements, portfolio]);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDarkMode]);

  const handleChange = (field: keyof ResumeData, value: any) =>
    setResumeData({ ...resumeData, [field]: value });

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
          </h1>
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
                    <label className="block text-sm mb-1">Overview</label>
                    <textarea
                      className="w-full border rounded-lg px-3 py-2"
                      rows={3}
                      value={resumeData.overview}
                      onChange={(e) => handleChange("overview", e.target.value)}
                    />
                  </div>

                  {/* Skills */}
                  <div>
                    <label className="block text-sm mb-1">Skills (comma separated)</label>
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
