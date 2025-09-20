import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Eye, Edit, FileText, User } from 'lucide-react';
import { Certificate } from '@/types';

interface CertificateCardProps {
  certificate: Certificate;
  onViewClick: (certificate: Certificate) => void;
  onEditClick: (certificate: Certificate) => void;
}

const CertificateCard: React.FC<CertificateCardProps> = ({
  certificate,
  onViewClick,
  onEditClick,
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'approved':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'academic':
        return '🎓';
      case 'co_curricular':
        return '🏆';
      case 'professional':
        return '🏢';
      case 'achievement':
        return '🏅';
      default:
        return '📜';
    }
  };

  return (
    <Card className="hover:shadow-lg transition-shadow duration-300 border-gray-200 bg-white">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{getCategoryIcon(certificate.category)}</span>
            <div>
              <CardTitle className="text-lg font-semibold text-gray-900 line-clamp-2">
                {certificate.title}
              </CardTitle>
              <CardDescription className="text-sm text-gray-600 mt-1">
                {certificate.category}
                {certificate.issuing_organization && ` • ${certificate.issuing_organization}`}
              </CardDescription>
            </div>
          </div>
          <Badge className={`text-xs font-medium px-2 py-1 rounded-full border ${getStatusColor(certificate.status)}`}>
            {certificate.status}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="space-y-3">
          {certificate.verified_by && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <User className="h-4 w-4" />
              <span>Verified by: {certificate.verified_by}</span>
            </div>
          )}

          <div className="flex items-center gap-2 text-sm text-gray-500">
            <FileText className="h-4 w-4" />
            <span>Issued: {new Date(certificate.issue_date).toLocaleDateString()}</span>
          </div>

          {certificate.description && (
            <p className="text-sm text-gray-700 line-clamp-2">
              {certificate.description}
            </p>
          )}

          <div className="flex gap-2 pt-2">
            <Button
              onClick={() => onViewClick(certificate)}
              variant="outline"
              size="sm"
              className="flex-1 border-blue-300 text-blue-700 hover:bg-blue-50 transition-colors duration-200"
            >
              <Eye className="h-4 w-4 mr-2" />
              View
            </Button>
            <Button
              onClick={() => onEditClick(certificate)}
              variant="outline"
              size="sm"
              className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors duration-200"
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CertificateCard;
