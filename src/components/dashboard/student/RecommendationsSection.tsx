import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Lightbulb, ExternalLink, BookOpen, Trophy, Users, Star } from 'lucide-react';

interface Certificate {
  category: 'academic' | 'co_curricular';
  status: 'pending' | 'approved' | 'rejected';
}

interface RecommendationsSectionProps {
  certificates: Certificate[];
}

interface Recommendation {
  id: string;
  title: string;
  description: string;
  category: 'academic' | 'co_curricular';
  type: 'course' | 'competition' | 'certification' | 'event' | 'club' | 'volunteering';
  priority: 'high' | 'medium' | 'low';
  actionLabel: string;
  // UI fields
  timeRange?: string;
  difficulty?: 'Beginner' | 'Advanced';
  mentorName?: string;
  mentorImage?: string | null;
  isNow?: boolean;
}

const RecommendationsSection: React.FC<RecommendationsSectionProps> = ({ certificates }) => {
  // Generate recommendations based on user's certificates
  const generateRecommendations = (): Recommendation[] => {
    const approvedCertificates = certificates.filter(cert => cert.status === 'approved');
    const academicCount = approvedCertificates.filter(cert => cert.category === 'academic').length;
    const coCurricularCount = approvedCertificates.filter(cert => cert.category === 'co_curricular').length;

    const recommendations: Recommendation[] = [];

    // Build a few sample recommendations (fields include time, difficulty, mentor)
    recommendations.push({
      id: '1',
      title: 'Technical English for Beginners',
      description: 'Improve your technical vocabulary and communication skills.',
      category: 'academic',
      type: 'course',
      priority: 'high',
      actionLabel: 'Register',
    });

    recommendations.push({
      id: '2',
      title: 'English punctuation made easy',
      description: 'Punctuation basics with hands-on exercises.',
      category: 'academic',
      type: 'course',
      priority: 'high',
      actionLabel: 'Join',
    });

    recommendations.push({
      id: '3',
      title: 'Technical Spanish for Beginners',
      description: 'Learn essential Spanish for technical contexts.',
      category: 'academic',
      type: 'course',
      priority: 'medium',
      actionLabel: 'Enroll',
    });

    // Additional generic recommendations
    recommendations.push({ id: '4', title: 'Leadership Development Program', description: 'Develop leadership skills.', category: 'co_curricular', type: 'event', priority: 'medium', actionLabel: 'Apply' });
    recommendations.push({ id: '5', title: 'Inter-University Competition', description: 'Compete with peers across universities.', category: 'co_curricular', type: 'competition', priority: 'low', actionLabel: 'Participate' });

    // Enrich with UI fields and return top 6
    const mentors = ['Kristin Watson', 'Cody Fisher', 'Jacob Jones', 'Alex Johnson', 'Taylor Smith'];
    const enriched = recommendations.slice(0, 6).map((rec, i) => ({
      ...rec,
      timeRange: rec.timeRange || (i === 1 ? '13:00 — 14:00' : i === 0 ? '10:30 — 12:00' : '16:00 — 17:00'),
      difficulty: rec.difficulty || (i === 1 ? 'Advanced' : 'Beginner'),
      mentorName: rec.mentorName || mentors[i % mentors.length],
      mentorImage: rec.mentorImage || null,
      isNow: i === 1,
    }));

    return enriched;
  };

  const recommendations = generateRecommendations();

  const getCategoryIcon = (category: string) => {
    return category === 'academic' ? <BookOpen className="h-4 w-4" /> : <Trophy className="h-4 w-4" />;
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'course':
      case 'certification':
        return <BookOpen className="h-4 w-4" />;
      case 'competition':
        return <Trophy className="h-4 w-4" />;
      case 'club':
      case 'event':
        return <Users className="h-4 w-4" />;
      case 'volunteering':
        return <Star className="h-4 w-4" />;
      default:
        return <Lightbulb className="h-4 w-4" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2 text-xl font-bold">
          <Lightbulb className="h-5 w-5" />
          <span>Recommendations for You</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {recommendations.map((rec, idx) => {
            const isFeatured = idx === 1; // center card
            const cardClass = isFeatured
              ? 'rounded-3xl p-6 min-h-[220px] shadow-xl text-white'
              : 'rounded-2xl p-6 min-h-[220px] shadow-sm bg-white';

            const bgClass = isFeatured ? 'bg-[#7C3AED]' : 'bg-white';

            const mentor = rec.mentorName || 'Mentor';
            const mentorInitial = mentor.split(' ').map((n:any)=>n[0]).slice(0,2).join('');
            const timeRange = rec.timeRange || '10:30 — 12:00';
            const difficulty = rec.difficulty || 'Beginner';

            return (
              <div key={rec.id} className={`relative overflow-hidden ${cardClass} ${isFeatured ? bgClass : ''}`}>
                {/* Top row: time + optional Now badge */}
                <div className="flex items-center justify-between mb-4">
                  <div className={`${isFeatured ? 'text-white/90 text-sm' : 'text-gray-500 text-xs'}`}>{timeRange}</div>
                  {rec.isNow && (
                    <div className={`inline-flex items-center gap-2 ${isFeatured ? 'bg-amber-400 text-amber-900' : 'bg-amber-100 text-amber-800'} px-2 py-0.5 rounded-full text-xs font-medium`}>Now</div>
                  )}
                </div>

                {/* Title and tag */}
                <div className="mb-6">
                  <h3 className={`${isFeatured ? 'text-2xl font-semibold' : 'text-lg font-semibold text-gray-900'}`}>{rec.title}</h3>
                  <div className="mt-3">
                    <span className={`${isFeatured ? 'bg-white/20 text-white' : 'bg-blue-50 text-blue-700'} inline-flex px-2 py-0.5 rounded-full text-xs`}>{difficulty}</span>
                  </div>
                </div>

                {/* Bottom: mentor with image */}
                <div className="absolute left-6 bottom-6 flex items-center gap-3">
                  <div className={`relative flex h-10 w-10 items-center justify-center rounded-full ${isFeatured ? 'bg-white' : 'bg-gray-100'}`}>
                    {rec.mentorImage ? (
                      <img src={rec.mentorImage} alt={mentor} className="h-10 w-10 rounded-full object-cover" />
                    ) : (
                      <span className={`${isFeatured ? 'text-[#7C3AED]' : 'text-gray-700'} font-medium`}>{mentorInitial}</span>
                    )}
                  </div>
                  <div className={`${isFeatured ? 'text-white' : 'text-gray-900'}`}>
                    <div className="text-sm font-medium">{mentor}</div>
                    <div className={`${isFeatured ? 'text-white/80 text-xs' : 'text-gray-500 text-xs'}`}>Mentor</div>
                  </div>
                </div>

                {/* Action button */}
                <div className={`absolute right-6 bottom-6`}>
                  <Button size="sm" className={`${isFeatured ? 'bg-white text-[#7C3AED] hover:bg-white/90' : ''}`}>{rec.actionLabel}</Button>
                </div>
              </div>
            );
          })}
        </div>

        {recommendations.length === 0 && (
          <div className="text-center py-8">
            <Lightbulb className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              Upload some certificates to get personalized recommendations!
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RecommendationsSection;
