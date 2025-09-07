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
              <div className="bg-white rounded-2xl p-4 shadow-md">
                <div className="text-sm text-muted-foreground">Total XP</div>
                <div className="text-2xl font-semibold mt-1">{xp}</div>
                <div className="text-xs text-muted-foreground mt-2">Overall progress</div>
              </div>
              <div className="bg-white rounded-2xl p-4 shadow-md">
                <div className="text-sm text-muted-foreground">This week</div>
                <div className="text-2xl font-semibold mt-1">+120 XP</div>
                <div className="text-xs text-muted-foreground mt-2">Keep it up!</div>
              </div>
              <div className="bg-white rounded-2xl p-4 shadow-md">
                <div className="text-sm text-muted-foreground">Today</div>
                <div className="text-2xl font-semibold mt-1">{streak} 🔥</div>
                <div className="text-xs text-muted-foreground mt-2">Current streak</div>
              </div>
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

            <Card className="rounded-2xl overflow-hidden shadow-md">
              <CardHeader>
                <CardTitle className="text-lg">Badge Feed</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentEvents.map((ev) => (
                    <div key={ev.id} className="flex items-start gap-3 border rounded p-3 bg-white">
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

          </main>

          <aside className="space-y-6">
            <div className="bg-gradient-to-b from-emerald-100 to-emerald-50 rounded-3xl p-6 shadow-lg">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 flex items-center gap-4">
                  <Avatar className="h-20 w-20">
                    <AvatarImage src={''} />
                    <AvatarFallback className="text-xl">{profile.full_name.split(' ').map(n=>n[0]).join('').slice(0,2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="text-sm text-muted-foreground">{profile.role}</div>
                    <div className="text-xl font-bold">{profile.full_name}</div>
                    <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                      <Star className="h-4 w-4 text-yellow-400" />
                      <div>4.8 • {xp} XP</div>
                    </div>
                  </div>
                </div>

                {/* Streak card similar to LeetCode */}
                <div className="col-span-2">
                  <div className="bg-white rounded-xl p-4 text-center shadow-sm">
                    <div className="text-sm font-medium">Streak</div>
                    <div className="text-4xl font-bold my-2">🔥 {streak}</div>
                    <div className="mt-2 flex items-center justify-center gap-2">
                      {(() => {
                        const days = ['M','T','W','T','F','S','S'];
                        const today = new Date().getDay(); // 0 (Sun) - 6 (Sat)
                        // map to index where 0 -> Sunday at position 6 to align Mon..Sun order
                        const monIndex = (today + 6) % 7; // convert Sunday-based to Monday-based index for today
                        const week: boolean[] = new Array(7).fill(false);
                        for (let i = 0; i < streak && i < 7; i++) {
                          const idx = (monIndex - i + 7) % 7;
                          week[idx] = true;
                        }
                        return days.map((d, i) => (
                          <div key={d} className="flex flex-col items-center text-xs">
                            <div className={`h-6 w-6 rounded-sm ${week[i] ? 'bg-emerald-300' : 'bg-emerald-50'} border ${week[i] ? 'border-emerald-400' : 'border-transparent'}`} />
                            <div className="mt-1 text-[10px] text-muted-foreground">{d}</div>
                          </div>
                        ));
                      })()}
                    </div>
                  </div>
                </div>

                <div className="bg-emerald-50 p-3 rounded-lg text-center">
                  <div className="text-xs text-muted-foreground">Solved</div>
                  <div className="text-xl font-semibold">123</div>
                </div>
                <div className="bg-emerald-50 p-3 rounded-lg text-center">
                  <div className="text-xs text-muted-foreground">Acceptance</div>
                  <div className="text-xl font-semibold">78%</div>
                </div>

                <div className="bg-emerald-50 p-3 rounded-lg text-center">
                  <div className="text-xs text-muted-foreground">Rating</div>
                  <div className="text-xl font-semibold">2200</div>
                </div>
                <div className="bg-emerald-50 p-3 rounded-lg text-center">
                  <div className="text-xs text-muted-foreground">Rank</div>
                  <div className="text-xl font-semibold">#42</div>
                </div>

                <div className="col-span-2 mt-2">
                  <h4 className="text-sm font-medium mb-2">Badges</h4>
                  <div className="flex flex-wrap gap-2">
                    {badges.map(b => (
                      <div key={b.id} className={`flex items-center gap-2 px-3 py-1 border rounded-md bg-white` }>
                        <div className={`h-6 w-6 rounded-full bg-gradient-to-br from-white/30 to-black/5 flex items-center justify-center text-xs ${b.color.split(' ')[1] || ''}`}>
                          {b.name.slice(0,1)}
                        </div>
                        <div className="text-sm font-medium">{b.name}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="col-span-2 mt-4 flex flex-col gap-2">
                  <div className="flex gap-2">
                    <Button asChild>
                      <Link to="/challenges">Challenges</Link>
                    </Button>
                    <Button variant="ghost" asChild>
                      <Link to="/settings">Settings</Link>
                    </Button>
                  </div>
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
