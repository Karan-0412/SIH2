import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { useProfile } from '@/hooks/useProfile';
import { Trophy, Sparkles, Zap, Check } from 'lucide-react';

const LevelRing: React.FC<{ percent: number; level: number }> = ({ percent, level }) => {
  const size = 120;
  const stroke = 10;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percent / 100) * circumference;

  return (
    <div className="flex flex-col items-center">
      <svg width={size} height={size} className="transform -rotate-90">
        <defs>
          <linearGradient id="grad" x1="1" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#7c3aed" />
            <stop offset="100%" stopColor="#06b6d4" />
          </linearGradient>
        </defs>
        <circle cx={size / 2} cy={size / 2} r={radius} strokeWidth={stroke} stroke="#eef2ff" fill="none" />
        <circle cx={size / 2} cy={size / 2} r={radius} strokeWidth={stroke} stroke="url(#grad)" strokeLinecap="round" fill="none" strokeDasharray={circumference} strokeDashoffset={offset} />
      </svg>
      <div className="-mt-28 text-center">
        <div className="text-sm text-muted-foreground">Level</div>
        <div className="text-2xl font-semibold">{level}</div>
      </div>
    </div>
  );
};

const ProfilePage: React.FC = () => {
  const { profile } = useProfile();
  const [xp, setXp] = useState(380);
  const [level, setLevel] = useState(4);
  const [streak, setStreak] = useState(5);
  const [accepted, setAccepted] = useState(false);
  const [classFilter, setClassFilter] = useState('all');
  const [batchFilter, setBatchFilter] = useState('all');

  // Mock badges and events
  const badges = useMemo(() => [
    { id: 'b1', name: 'Getting Started', color: 'bg-yellow-100 text-yellow-800' },
    { id: 'b2', name: 'Streak 7', color: 'bg-green-100 text-green-800' },
    { id: 'b3', name: 'Top Scorer', color: 'bg-purple-100 text-purple-800' },
  ], []);

  const recentEvents = useMemo(() => [
    { id: 'e1', text: 'Earned "Getting Started" badge', time: '2d ago' },
    { id: 'e2', text: 'Completed daily challenge', time: '3d ago' },
    { id: 'e3', text: 'Reached level 4', time: '1w ago' },
  ], []);

  const leaderboardData = useMemo(() => [
    { id: 'u1', name: 'Alice', class: 'A', batch: '2024', xp: 980 },
    { id: 'u2', name: 'Bob', class: 'B', batch: '2024', xp: 920 },
    { id: 'u3', name: 'Charlie', class: 'A', batch: '2023', xp: 880 },
    { id: 'u4', name: 'You', class: 'A', batch: '2024', xp: 380 },
  ], []);

  const filteredLeaderboard = useMemo(() => {
    return leaderboardData.filter((row) => {
      if (classFilter !== 'all' && row.class !== classFilter) return false;
      if (batchFilter !== 'all' && row.batch !== batchFilter) return false;
      return true;
    }).sort((a, b) => b.xp - a.xp);
  }, [leaderboardData, classFilter, batchFilter]);

  const nextLevelXp = useMemo(() => {
    // simple progression formula for demo
    const target = (level + 1) * 300;
    return target;
  }, [level]);

  const percent = Math.min(100, Math.round((xp / nextLevelXp) * 100));

  const handleAcceptChallenge = () => {
    if (accepted) return;
    setAccepted(true);
    setXp((s) => s + 40);
    setStreak((s) => s + 1);
    // level up if reached
    if (xp + 40 >= nextLevelXp) {
      setLevel((l) => l + 1);
    }
  };

  if (!profile) {
    return <div className="p-6">You need to be signed in to view your profile.</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader className="flex items-center justify-between">
              <CardTitle className="text-lg">{profile.full_name}</CardTitle>
              <div className="flex items-center gap-2">
                <Badge variant="secondary">{profile.role}</Badge>
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/events">View activity</Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row md:items-center md:gap-8">
                <div className="flex-shrink-0">
                  <LevelRing percent={percent} level={level} />
                </div>
                <div className="flex-1 mt-4 md:mt-0">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm text-muted-foreground">XP</div>
                      <div className="text-2xl font-semibold">{xp} XP</div>
                      <div className="text-xs text-muted-foreground">{xp}/{nextLevelXp} to next level</div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm text-muted-foreground">Streak</div>
                      <div className="text-2xl font-semibold">{streak} 🔥</div>
                    </div>
                  </div>

                  <div className="mt-4">
                    <div className="flex items-center gap-3">
                      <Progress value={percent} className="h-3 rounded-full flex-1" />
                      <Button size="sm" onClick={() => { setXp((s)=>Math.max(0,s-20)); }}>Spend XP</Button>
                    </div>
                    <div className="mt-3 flex items-center gap-2">
                      <Button size="sm" variant="ghost" onClick={() => { setXp((s)=>s+10); }}>+10 XP</Button>
                      <Button size="sm" variant="outline" onClick={() => { setStreak((s)=>s+1); }}>Add Streak</Button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="col-span-1">
                  <h4 className="text-sm font-medium mb-2">Badges</h4>
                  <div className="flex flex-wrap gap-2">
                    {badges.map((b) => (
                      <div key={b.id} className={`px-3 py-1 rounded-full text-sm font-medium ${b.color}`}>{b.name}</div>
                    ))}
                  </div>
                </div>

                <div className="col-span-2">
                  <h4 className="text-sm font-medium mb-2">Recent Activity</h4>
                  <div className="space-y-3">
                    {recentEvents.map((ev) => (
                      <div key={ev.id} className="flex items-center justify-between border rounded p-3">
                        <div className="flex items-center gap-3">
                          <Sparkles className="h-5 w-5 text-yellow-500" />
                          <div>
                            <div className="font-medium">{ev.text}</div>
                            <div className="text-xs text-muted-foreground">{ev.time}</div>
                          </div>
                        </div>
                        <div>
                          <Badge variant="outline">View</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-6 flex items-center gap-3">
                <Button onClick={handleAcceptChallenge} disabled={accepted} className="flex items-center gap-2">
                  {accepted ? <Check className="h-4 w-4"/> : <Zap className="h-4 w-4"/>} {accepted ? 'Accepted' : 'Accept Daily Challenge'}
                </Button>
                <Button variant="outline" asChild>
                  <Link to="/leaderboard">View Full Leaderboard</Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Badge Feed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentEvents.map((ev) => (
                  <div key={ev.id} className="flex items-start gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback>{ev.text.slice(0,2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">{ev.text}</div>
                      <div className="text-xs text-muted-foreground">{ev.time}</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <aside className="space-y-6">
          <Card>
            <CardHeader className="flex items-center justify-between">
              <CardTitle className="text-sm">Leaderboard</CardTitle>
              <div className="flex items-center gap-2">
                <select className="text-sm rounded border px-2 py-1" value={classFilter} onChange={(e)=>setClassFilter(e.target.value)}>
                  <option value="all">All classes</option>
                  <option value="A">Class A</option>
                  <option value="B">Class B</option>
                </select>
                <select className="text-sm rounded border px-2 py-1" value={batchFilter} onChange={(e)=>setBatchFilter(e.target.value)}>
                  <option value="all">All batches</option>
                  <option value="2024">2024</option>
                  <option value="2023">2023</option>
                </select>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {filteredLeaderboard.map((row, idx) => (
                  <div key={row.id} className={`flex items-center justify-between p-2 rounded ${row.name === 'You' ? 'bg-muted/40' : 'bg-transparent'}`}>
                    <div className="flex items-center gap-3">
                      <Trophy className="h-4 w-4 text-yellow-500" />
                      <div className="text-sm font-medium">{row.name}</div>
                      <div className="text-xs text-muted-foreground">{row.class} • {row.batch}</div>
                    </div>
                    <div className="text-sm font-semibold">{row.xp} XP</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-2">
                <Button asChild>
                  <Link to="/challenges">Challenges</Link>
                </Button>
                <Button variant="ghost" asChild>
                  <Link to="/settings">Settings</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  );
};

export default ProfilePage;
