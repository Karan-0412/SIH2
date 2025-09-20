import React, { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import AnalyticsCards from "@/components/certificates/AnalyticsCards";
import ActionBar from "@/components/certificates/ActionBar";
import CertificateCard from "@/components/certificates/CertificateCard";
import UploadCertificateForm from "@/components/certificates/UploadCertificateForm";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { ArrowLeft, Award, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Certificate } from "@/types";
import { supabase } from "@/integrations/supabase/client";

// Sample certificates matching actual database schema
const sampleCertificates = [
  {
    title: "AWS Cloud Practitioner",
    description: "Amazon Web Services Cloud Practitioner certification",
    category: "academic",
    file_name: "aws-cloud-practitioner.pdf",
    file_url: "https://example.com/certificates/aws-cloud-practitioner.pdf",
    status: "approved",
    remark: "Excellent performance in cloud computing fundamentals"
  },
  {
    title: "Google Data Analytics Professional Certificate",
    description: "Google Career Certificate in Data Analytics",
    category: "academic",
    file_name: "google-data-analytics.pdf",
    file_url: "https://example.com/certificates/google-data-analytics.pdf",
    status: "approved",
    remark: "Comprehensive data analysis skills demonstrated"
  },
  {
    title: "Hackathon Winner - TechFest 2024",
    description: "First place in university hackathon competition",
    category: "co_curricular",
    file_name: "hackathon-winner.pdf",
    file_url: "https://example.com/certificates/hackathon-winner.pdf",
    status: "approved",
    remark: "Outstanding innovation and teamwork"
  }
];

const CertificateManagement: React.FC = () => {
  const { toast } = useToast();
  const { signOut } = useAuth();
  const { profile } = useProfile();

  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showNotificationsDropdown, setShowNotificationsDropdown] = useState(false);

  // Keep dark mode in sync with document
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDarkMode]);

  // Fetch certificates from database
  useEffect(() => {
    if (profile) {
      fetchCertificates();
    }
  }, [profile]);

  const fetchCertificates = async () => {
    if (!profile) return;

    setLoading(true);
    try {
      console.log('Fetching certificates for student_id:', profile.id);
      const { data, error } = await supabase
        .from('certificates')
        .select('*')
        .eq('student_id', profile.id)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Database error fetching certificates:', error);
        throw error;
      }
      
      console.log('Fetched certificates:', data);
      setCertificates((data as unknown as Certificate[]) || []);
    } catch (error) {
      console.error('Error fetching certificates:', error);
      toast({
        title: 'Certificate Fetch Error',
        description: 'Failed to fetch certificates. Check console for details.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Calculate analytics data
  const totalCertificates = certificates.length;
  const verifiedCertificates = certificates.filter((cert) => cert.status === "approved").length;
  const pendingCertificates = certificates.filter((cert) => cert.status === "pending").length;
  const rejectedCertificates = certificates.filter((cert) => cert.status === "rejected").length;

  const handleUploadClick = () => {
    setIsUploadModalOpen(true);
  };

  const handleFindReviewersClick = () => {
    toast({
      title: "Find Reviewers",
      description: "Redirecting to reviewer directory...",
    });
    // TODO: Implement navigation to reviewer directory
  };

  const handleExportClick = () => {
    toast({
      title: "Export Certificates",
      description: "Preparing certificate export...",
    });
    // TODO: Implement export functionality
  };

  // Add sample certificates for testing
  const addSampleCertificates = async () => {
    if (!profile) return;

    try {
      console.log('Adding sample certificates:', sampleCertificates);
      const { data, error } = await supabase
        .from('certificates')
        .insert(sampleCertificates.map(cert => ({
          ...cert,
          student_id: profile.id
        })));

      if (error) {
        console.error('Error adding sample certificates:', error);
        toast({
          title: 'Error',
          description: `Failed to add sample certificates: ${error.message}`,
          variant: 'destructive',
        });
      } else {
        console.log('Sample certificates added successfully:', data);
        await fetchCertificates(); // Refresh the certificates list
        toast({
          title: 'Sample Certificates Added!',
          description: '3 sample certificates have been added to your profile.',
        });
      }
    } catch (error) {
      console.error('Error adding sample certificates:', error);
      toast({
        title: 'Error',
        description: `Failed to add sample certificates: ${error}`,
        variant: 'destructive',
      });
    }
  };

  const handleCertificateSubmit = async (certificateData: any) => {
    if (!profile) return;

    try {
      console.log('Certificate data received:', certificateData);
      console.log('Profile ID:', profile.id);
      
      // Create certificate matching the actual database schema
      const singleCertificate = {
        title: certificateData.title,
        description: certificateData.description || null,
        category: certificateData.category,
        file_name: certificateData.file?.name || 'certificate.pdf',
        file_url: `https://placeholder.com/certificates/${certificateData.file?.name || 'certificate.pdf'}`,
        status: 'pending' as const, // Use 'pending' since it's the default
        remark: certificateData.remark || null
      };

      console.log('Single certificate to be inserted:', singleCertificate);

      // Use the exact same method as sample certificates
      const { data, error } = await supabase
        .from('certificates')
        .insert([{
          ...singleCertificate,
          student_id: profile.id
        }]);

      if (error) {
        console.error('Error adding certificate:', error);
        toast({
          title: 'Error',
          description: `Failed to add certificate: ${error.message}`,
          variant: 'destructive',
        });
      } else {
        console.log('Certificate added successfully:', data);
        await fetchCertificates(); // Refresh the certificates list
        toast({
          title: 'Certificate Added!',
          description: 'Your certificate has been submitted for review.',
        });
      }
    } catch (error) {
      console.error('Error adding certificate:', error);
      toast({
        title: 'Error',
        description: 'Failed to add certificate. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleViewCertificate = (certificate: Certificate) => {
    toast({
      title: "View Certificate",
      description: `Opening ${certificate.title}...`,
    });
    // TODO: Implement view functionality
  };

  const handleEditCertificate = (certificate: Certificate) => {
    toast({
      title: "Edit Certificate",
      description: `Editing ${certificate.title}...`,
    });
    // TODO: Implement edit functionality
  };

  const navigate = useNavigate();

  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${isDarkMode ? "bg-gray-900 text-white" : "bg-gradient-to-br from-slate-50 to-blue-50 text-slate-900"
        }`}
    >
      {/* 🔹 Top Navigation Bar */}



      {/* 🔹 Main Container */}
      <div className="w-full mx-auto space-y-4 px-2 sm:px-3 md:px-8 py-4">
        {/* 🔹 Page Header */}
        <div className="flex items-center gap-4 mb-2 py-5">
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
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Award className="w-6 h-6 text-blue-500" />
            Certificate Management
          </h1>
        </div>
        {/* Analytics Section */}
        <AnalyticsCards
          totalCertificates={totalCertificates}
          verifiedCertificates={verifiedCertificates}
          pendingCertificates={pendingCertificates}
          approvedCertificates={rejectedCertificates}
        />

        {/* Action Bar */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <ActionBar
            onUploadClick={handleUploadClick}
            onFindReviewersClick={handleFindReviewersClick}
            onExportClick={handleExportClick}
          />
          <Button
            onClick={addSampleCertificates}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Sample Certificates (Test)
          </Button>
        </div>

        {/* Recent Certificates Section */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Recent Certificates
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                Your uploaded certificates and their review status
              </p>
            </div>
            <div className="text-sm text-gray-500">
              {certificates.length} certificate
              {certificates.length !== 1 ? "s" : ""}
            </div>
          </div>

          {loading ? (
            <div className="text-center py-10">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading certificates...</p>
            </div>
          ) : certificates.length === 0 ? (
            <div className="text-center py-10">
              <div className="text-5xl mb-3">📄</div>
              <h3 className="text-base font-medium text-gray-900 mb-2">
                No certificates yet
              </h3>
              <p className="text-gray-600 mb-3">
                Upload your first certificate to get started with tracking your
                achievements.
              </p>
              <div className="flex flex-col sm:flex-row gap-2 justify-center">
                <button
                  onClick={handleUploadClick}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-md font-medium transition-colors duration-200"
                >
                  Upload Certificate
                </button>
                <button
                  onClick={addSampleCertificates}
                  className="bg-gray-600 hover:bg-gray-700 text-white px-5 py-2 rounded-md font-medium transition-colors duration-200"
                >
                  Add Sample Certificates (Test)
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {certificates.map((certificate) => (
                <CertificateCard
                  key={certificate.id}
                  certificate={certificate}
                  onViewClick={handleViewCertificate}
                  onEditClick={handleEditCertificate}
                />
              ))}
            </div>
          )}
        </div>

        {/* Upload Certificate Modal */}
        <UploadCertificateForm
          isOpen={isUploadModalOpen}
          onClose={() => setIsUploadModalOpen(false)}
          onSubmit={handleCertificateSubmit}
        />
      </div>

    </div>
  );
};

export default CertificateManagement;
