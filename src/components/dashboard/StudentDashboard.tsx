import { useProfile } from '@/hooks/useProfile';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Upload } from 'lucide-react';
import ProfileSection from './student/ProfileSection';
import CertificatesSection from './student/CertificatesSection';
import RecommendationsSection from './student/RecommendationsSection';
import UploadCertificateSection from './student/UploadCertificateSection';
import NotificationsDropdown from './student/NotificationsDropdown';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface Certificate {
  id: string;
  title: string;
  description: string;
  category: 'academic' | 'co_curricular';
  status: 'pending' | 'approved' | 'rejected';
  file_url: string;
  file_name: string;
  uploaded_at: string;
  rejection_reason?: string;
  remark?: string;
}

const StudentDashboard = () => {
  const { profile } = useProfile();
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(false);
  const [showUploadPanel, setShowUploadPanel] = useState(false);

  useEffect(() => {
    if (profile) {
      fetchCertificates();
    }
  }, [profile]);

  const fetchCertificates = async () => {
    if (!profile) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('certificates')
        .select('*')
        .eq('student_id', profile.id)
        .order('uploaded_at', { ascending: false });

      if (error) {
        console.error('Error fetching certificates:', error);
      } else {
        setCertificates(data || []);
      }
    } catch (error) {
      console.error('Error fetching certificates:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUploadComplete = async () => {
    await fetchCertificates();
    setShowUploadPanel(false);
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  // Derived stats for visuals
  const total = certificates.length;
  const approved = certificates.filter(c=>c.status==='approved').length;
  const pending = certificates.filter(c=>c.status==='pending').length;
  const rejected = total - approved - pending;

  const last7: { day: string; count: number }[] = (() => {
    const map = new Map<string, number>();
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toLocaleDateString(undefined, { weekday: 'short' });
      map.set(key, 0);
    }
    for (const c of certificates) {
      const d = new Date(c.uploaded_at);
      const key = d.toLocaleDateString(undefined, { weekday: 'short' });
      if (map.has(key)) map.set(key, (map.get(key) || 0) + 1);
    }
    return Array.from(map.entries()).map(([day, count]) => ({ day, count }));
  })();

  const weekTotal = last7.reduce((s, x) => s + x.count, 0) || 1;
  const pct = (n: number) => Math.round((n / (total || 1)) * 100);
  const maxCount = Math.max(...last7.map(x=>x.count)) || 1;
  const avgCount = (weekTotal / (last7.length || 1));

  const CountUp: React.FC<{ to: number; duration?: number }> = ({ to, duration = 800 }) => {
    const [val, setVal] = React.useState(0);
    React.useEffect(() => {
      let raf = 0;
      const start = performance.now();
      const tick = (now: number) => {
        const p = Math.min(1, (now - start) / duration);
        setVal(Math.round(to * p));
        if (p < 1) raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
      return () => cancelAnimationFrame(raf);
    }, [to, duration]);
    return <span>{val}</span>;
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500">Welcome back, {profile?.full_name}!</p>
        </div>
        <div className="flex items-center gap-3">
          <Button size="sm" onClick={() => setShowUploadPanel((v) => !v)} className="bg-[#6D28D9] hover:bg-[#5b21b6] text-white">
            <Upload className="h-4 w-4 mr-2" />
            {showUploadPanel ? 'Close Upload' : 'Upload Certificate'}
          </Button>
          <NotificationsDropdown />
        </div>
      </div>

      {/* Row 1: 3 equal cards (12-col grid) */}
      <div className="grid grid-cols-12 gap-6 items-stretch">
        {/* Activity (col-span-4) */}
        <div className="col-span-12 md:col-span-4">
          <div className="h-full rounded-2xl bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">Activity</h3>
              <span className="text-xs px-3 py-1 rounded-full border bg-gray-50 text-gray-700">Last 7 days</span>
            </div>
            <div className="mt-3">
              <div className="text-3xl font-bold text-gray-900 leading-none"><CountUp to={weekTotal} /> <span className="text-base font-medium text-gray-500">activities</span></div>
            </div>
            <div className="relative mt-4 h-40">
              <div className="absolute left-0 right-0 border-t border-dashed border-gray-300" style={{ bottom: `${(avgCount / (maxCount || 1)) * 100}%` }} />
              <div className="absolute left-0 -translate-y-1/2 px-2 py-0.5 rounded-full bg-black text-white text-[10px]" style={{ bottom: `${(avgCount / (maxCount || 1)) * 100}%` }}>{avgCount.toFixed(1)}</div>
              <div className="absolute inset-0 flex items-end gap-3">
                {last7.map((d) => {
                  const h = (d.count / (maxCount || 1)) * 100;
                  const isMax = d.count === maxCount && maxCount > 0;
                  return (
                    <div key={d.day} className="flex-1 flex flex-col items-center">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className={`w-6 rounded-t transition-all duration-700 hover:shadow-md ${isMax ? 'bg-[#7C3AED]' : 'bg-[#E9D5FF] hover:bg-[#C4B5FD]'}`} style={{ height: `${h}%` }} />
                        </TooltipTrigger>
                        <TooltipContent>
                          <div className="text-xs">
                            <div className="font-medium">{d.day}</div>
                            <div className="text-gray-600">{d.count} activities</div>
                          </div>
                        </TooltipContent>
                      </Tooltip>
                      <span className="mt-2 text-xs text-gray-500">{d.day}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Progress Statistics (col-span-4) */}
        <div className="col-span-12 md:col-span-4">
          <div className="h-full rounded-2xl bg-white p-6 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg">
            <div className="grid md:grid-cols-2 gap-6 items-center h-full">
              <div>
                <div className="text-4xl font-bold text-gray-900 leading-tight"><CountUp to={pct(approved + pending)} />%</div>
                <div className="text-sm text-gray-500 mt-1">Total activity</div>
              </div>
              <div>
                <div className="flex w-full h-2 rounded-full overflow-hidden bg-gray-200">
                  <div className="h-full bg-[#7C3AED]" style={{ width: `${pct(approved)}%`, transition: 'width 800ms ease' }} />
                  <div className="h-full bg-[#10B981]" style={{ width: `${pct(pending)}%`, transition: 'width 800ms ease 120ms' }} />
                  <div className="h-full bg-[#F59E0B]" style={{ width: `${pct(rejected)}%`, transition: 'width 800ms ease 240ms' }} />
                </div>
                <div className="mt-4 grid grid-cols-3 gap-4 text-sm">
                  <div className="flex items-center gap-3">
                    <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[#7C3AED]/10 text-[#7C3AED] font-semibold"><CountUp to={approved} /></span>
                    <span className="text-gray-600">Completed</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[#10B981]/10 text-[#10B981] font-semibold"><CountUp to={pending} /></span>
                    <span className="text-gray-600">In progress</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[#F59E0B]/10 text-[#F59E0B] font-semibold"><CountUp to={rejected} /></span>
                    <span className="text-gray-600">Upcoming</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Course Highlight (col-span-4) */}
        <div className="col-span-12 md:col-span-4">
          <div className="h-full rounded-2xl bg-white p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-2 text-xs">
              <span className="px-2 py-0.5 rounded-full bg-green-100 text-green-700">Group course</span>
              <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">Advanced</span>
            </div>
            <h3 className="text-lg font-semibold">English punctuation made easy</h3>
            <p className="text-sm text-gray-500 mt-1">Punctuation — learn the basics without the pain. People will never laugh at your punctuation again.</p>
            <div className="mt-4 flex items-center justify-between">
              <div className="flex -space-x-2">
                {['A','B','C','D'].map((a,i)=> (
                  <div key={i} className="h-7 w-7 rounded-full bg-gray-200 flex items-center justify-center text-xs border border-white">{a}</div>
                ))}
              </div>
              <div className="flex-1 mx-4">
                <div className="text-xs text-gray-500 mb-1">Course progress</div>
                <div className="h-2 rounded-full bg-gray-200 overflow-hidden">
                  <div className="h-full bg-[#F59E0B]" style={{ width: '75%' }} />
                </div>
              </div>
            </div>
            <Button className="w-full mt-5 bg-black hover:bg-black/80 text-white">Continue learning</Button>
          </div>
        </div>
      </div>

      {/* Row 2: Left (stacked) 4 cols, Right (timeline) 8 cols */}
      <div className="grid grid-cols-12 gap-6">
        {/* Left stacked (col-span-4) */}
        <div className="col-span-12 md:col-span-4 space-y-6">
          {/* By platform */}
          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <h3 className="font-semibold text-gray-900 mb-4">By platform</h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-3">
                <span className="inline-block h-2 w-2 rounded-full bg-[#7C3AED]" />
                <span className="text-gray-700">Academic</span>
                <span className="ml-auto text-gray-500">{certificates.filter(c=>c.category==='academic').length} h</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="inline-block h-2 w-2 rounded-full bg-[#10B981]" />
                <span className="text-gray-700">Co-Curricular</span>
                <span className="ml-auto text-gray-500">{certificates.filter(c=>c.category==='co_curricular').length} h</span>
              </div>
            </div>
          </div>

          {/* Profile + optional upload */}
          <ProfileSection certificates={certificates} />
          {showUploadPanel && (
            <UploadCertificateSection onUploadComplete={handleUploadComplete} />
          )}
        </div>

        {/* Right timeline (col-span-8) */}
        <div className="col-span-12 md:col-span-8 space-y-6">
          {/* My schedule timeline - horizontal scroll */}
          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">My schedule</h3>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <button className="px-3 py-1 rounded-full bg-gray-100">Today</button>
              </div>
            </div>
            <div className="flex gap-4 overflow-x-auto pb-2 snap-x snap-mandatory">
              {[{time:'10:30 — 12:00',title:'Technical English for Beginners',tag:'Beginner',accent:'plain',mentor:'Kristin Watson'},{time:'13:00 — 14:00',title:'English punctuation made easy',tag:'Advanced',accent:'purple',mentor:'Cody Fisher',now:true},{time:'16:00 — 17:00',title:'Technical Spanish for Beginners',tag:'Beginner',accent:'plain',mentor:'Jacob Jones'},{time:'19:00 — 20:00',title:'Spoken English Club',tag:'Intermediate',accent:'plain',mentor:'Jane Cooper'}].map((c,i)=> (
                <div key={i} className={`relative min-w-[260px] sm:min-w-[300px] snap-start rounded-2xl p-4 shadow-sm border ${c.accent==='purple' ? 'bg-[#7C3AED] text-white' : 'bg-white'}`}>
                  <div className={`text-xs ${c.accent==='purple' ? 'text-white/80' : 'text-gray-500'}`}>{c.time}</div>
                  <div className="mt-1 font-semibold leading-snug">{c.title}</div>
                  <div className={`mt-2 inline-flex rounded-full px-2 py-0.5 text-xs ${c.accent==='purple' ? 'bg-white/20' : 'bg-gray-100 text-gray-700'}`}>{c.tag}</div>
                  <div className={`mt-4 text-xs ${c.accent==='purple' ? 'text-white/80' : 'text-gray-500'}`}>Mentor — {c.mentor}</div>
                  {c.now && <span className="absolute top-2 right-2 text-xs bg-orange-500 text-white rounded-full px-2 py-0.5">Now</span>}
                </div>
              ))}
            </div>
          </div>

          {/* Certificates & recommendations under timeline */}
          <CertificatesSection certificates={certificates} />
          <RecommendationsSection certificates={certificates} />
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
