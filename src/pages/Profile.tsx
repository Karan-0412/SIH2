import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { useProfile } from '@/hooks/useProfile';
import { Trophy, Sparkles, Zap, Check, Star } from 'lucide-react';

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
  const [showAllMonths, setShowAllMonths] = useState(false);

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
    { id: 'u4', name: 'You', class: 'A', batch: '2024', xp: xp },
  ], [xp]);

  const filteredLeaderboard = useMemo(() => {
    return leaderboardData.filter((row) => {
      if (classFilter !== 'all' && row.class !== classFilter) return false;
      if (batchFilter !== 'all' && row.batch !== batchFilter) return false;
      return true;
    }).sort((a, b) => b.xp - a.xp);
  }, [leaderboardData, classFilter, batchFilter]);

  const nextLevelXp = (level + 1) * 300;
  const percent = Math.min(100, Math.round((xp / nextLevelXp) * 100));
  const currentMonthName = new Date().toLocaleString('default', { month: 'short' });

  const handleAcceptChallenge = () => {
    if (accepted) return;
    setAccepted(true);
    setXp((s) => s + 40);
    setStreak((s) => s + 1);
    if (xp + 40 >= nextLevelXp) setLevel((l) => l + 1);
  };

  if (!profile) return <div className="p-6">You need to be signed in to view your profile.</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top hero */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg -mt-6 mb-6 grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          <div className="md:col-span-2">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={''} />
                <AvatarFallback className="text-xl">{profile.full_name.split(' ').map(n=>n[0]).join('').slice(0,2).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div>
                <div className="text-sm text-muted-foreground">Hi {profile.full_name.split(' ')[0]},</div>
                <h1 className="text-3xl font-bold tracking-tight">Welcome back!</h1>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end">
            <div className="w-full md:w-72">
              <Input placeholder="Search for content, challenges..." />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <main className="lg:col-span-3 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="rounded-2xl p-4 shadow-md">
                <div className="text-sm text-muted-foreground">Total XP</div>
                <div className="text-2xl font-semibold mt-1">{xp}</div>
                <div className="text-xs text-muted-foreground mt-2">Overall progress</div>
              </Card>
              <Card className="rounded-2xl p-4 shadow-md">
                <div className="text-sm text-muted-foreground">This week</div>
                <div className="text-2xl font-semibold mt-1">+120 XP</div>
                <div className="text-xs text-muted-foreground mt-2">Keep it up!</div>
              </Card>
              <Card className="rounded-2xl p-4 shadow-md">
                <div className="text-sm text-muted-foreground">Today</div>
                <div className="text-2xl font-semibold mt-1">{streak} 🔥</div>
                <div className="text-xs text-muted-foreground mt-2">Current streak</div>
              </Card>
            </div>

            <Card className="rounded-2xl overflow-hidden shadow-md">
              <CardHeader>
                <CardTitle className="text-lg">Progress & Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col md:flex-row md:items-center gap-6">
                  <div className="flex-shrink-0">
                    <LevelRing percent={percent} level={level} />
                  </div>
                  <div className="flex-1">
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
                      <Progress value={percent} className="h-3 rounded-full" />
                      <div className="mt-3 flex items-center gap-3">
                        <Button size="sm" onClick={handleAcceptChallenge} disabled={accepted} className="flex items-center gap-2">
                          {accepted ? <Check className="h-4 w-4"/> : <Zap className="h-4 w-4"/>} {accepted ? 'Accepted' : 'Accept Challenge'}
                        </Button>
                        <Button variant="outline" asChild>
                          <Link to="/leaderboard">View Leaderboard</Link>
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white rounded-xl p-3 shadow-sm">
                    <h4 className="text-sm font-medium mb-2">Badges</h4>
                    <div className="flex flex-wrap gap-2">
                      {badges.map(b => (
                        <div key={b.id} className={`px-3 py-1 rounded-full text-sm font-medium ${b.color}`}>{b.name}</div>
                      ))}
                    </div>
                  </div>
                  <div className="bg-white rounded-xl p-3 shadow-sm">
                    <h4 className="text-sm font-medium mb-2">Recent Activity</h4>
                    <div className="space-y-3">
                      {recentEvents.map(ev => (
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
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-2xl overflow-hidden shadow-md bg-white">
              <CardHeader>
                <div className="w-full flex items-center justify-between">
                  <div>
                    <div className="text-sm text-muted-foreground">Badges</div>
                    <div className="text-3xl font-bold">{badges.length}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-muted-foreground">Most Recent Badge</div>
                    <div className="text-sm font-semibold">{badges[0]?.name || '—'}</div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4 flex-wrap">
                  {badges.map((b) => (
                    <div key={b.id} className="flex flex-col items-center w-24 p-2 bg-gray-50 rounded-lg">
                      <div className="h-12 w-12 rounded-md bg-gradient-to-br from-white to-gray-100 flex items-center justify-center border">
                        {/* placeholder badge icon */}
                        <div className="text-sm font-bold">{b.name.slice(0,2)}</div>
                      </div>
                      <div className="text-xs mt-2 text-center">{b.name}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

          </main>

          <aside className="space-y-6">
            <div className="bg-white rounded-3xl p-3 shadow-lg">
              <div className="flex flex-col items-center">
                <div className="text-3xl font-bold">{currentMonthName}</div>

                {/* Current month streak grid (Mon-Sun). View more reveals previous months */}
                <div className="w-full mt-4">
                  {(() => {
                    const today = new Date();
                    const month = today.getMonth();
                    const year = today.getFullYear();
                    const monthName = today.toLocaleString('default', { month: 'short' });
                    const daysInMonth = new Date(year, month + 1, 0).getDate();
                    const firstDay = new Date(year, month, 1).getDay(); // 0 Sun..6 Sat
                    const offset = (firstDay + 6) % 7; // convert to Mon=0
                    const daysArray: number[] = [];
                    const daysPassed = today.getDate();
                    const markedDaysCount = Math.min(streak, daysPassed);

                    // build array with placeholders for offset
                    for (let i = 0; i < offset; i++) daysArray.push(0);
                    for (let d = 1; d <= daysInMonth; d++) daysArray.push(d);

                    return (
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <div className="text-sm font-medium">{monthName}</div>
                          <div className="text-xs text-muted-foreground">{markedDaysCount} days</div>
                        </div>

                        <div className="grid grid-cols-7 gap-1">
                          {daysArray.map((d, i) => {
                            if (d === 0) return <div key={i} className="h-4 rounded bg-transparent" />;
                            const isPastOrToday = d <= daysPassed;
                            const isMarked = isPastOrToday && (daysPassed - d) < markedDaysCount;
                            return (
                              <div key={i} className={`flex items-center justify-center h-5 text-[11px] rounded ${isMarked ? 'bg-emerald-400 border border-emerald-600 text-white' : 'bg-white border border-gray-100 text-gray-600'}`}>
                                {d}
                              </div>
                            );
                          })}
                        </div>

                        <div className="mt-2 text-right">
                          <button onClick={() => setShowAllMonths((s) => !s)} className="text-sm text-primary underline">{showAllMonths ? 'Hide' : 'View more'}</button>
                        </div>

                        {showAllMonths && (
                          <div className="mt-3 space-y-2">
                            {Array.from({ length: 3 }).map((_, idx) => {
                              const d = new Date();
                              d.setMonth(month - (idx + 1));
                              const mName = d.toLocaleString('default', { month: 'short' });
                              const dim = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
                              const arr: boolean[] = new Array(dim).fill(false);
                              // spread streak across past months roughly
                              const pastFilled = Math.max(0, streak - daysPassed - idx * dim);
                              const fillCount = Math.min(dim, Math.max(0, pastFilled));
                              for (let f = 0; f < fillCount; f++) arr[dim - 1 - f] = true;
                              return (
                                <div key={mName} className="bg-emerald-50 rounded-lg p-3">
                                  <div className="flex items-center justify-between">
                                    <div className="text-sm font-medium">{mName}</div>
                                    <div className="text-xs text-muted-foreground">{arr.filter(Boolean).length} days</div>
                                  </div>
                                  <div className="mt-2 grid grid-cols-7 gap-1">
                                    {arr.map((a, i2) => (
                                      <div key={i2} className={`h-3 rounded ${a ? 'bg-emerald-400' : 'bg-emerald-100'} border ${a ? 'border-emerald-600' : 'border-transparent'}`} />
                                    ))}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </div>

                <div className="w-full mt-4 flex flex-col gap-2">
                  <Button asChild>
                    <Link to="/challenges">Challenges</Link>
                  </Button>
                  <Button variant="ghost" asChild>
                    <Link to="/settings">Settings</Link>
                  </Button>
                </div>
              </div>
            </div>

            <Card className="rounded-2xl shadow-md overflow-hidden">
              <CardHeader>
                <CardTitle className="text-sm">Leaderboard Snippet</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {filteredLeaderboard.slice(0,3).map((row) => (
                    <div key={row.id} className={`flex items-center justify-between p-2 rounded ${row.name === 'You' ? 'bg-muted/40' : ''}`}>
                      <div className="flex items-center gap-3">
                        <Trophy className="h-4 w-4 text-yellow-500" />
                        <div className="text-sm font-medium">{row.name}</div>
                      </div>
                      <div className="text-sm font-semibold">{row.xp} XP</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-2xl shadow-md overflow-hidden">
              <CardHeader>
                <CardTitle className="text-sm">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-2">
                  <Button asChild>
                    <Link to="/profile">View Profile</Link>
                  </Button>
                  <Button variant="ghost" asChild>
                    <Link to="/leaderboard">Open Leaderboard</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

          </aside>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
