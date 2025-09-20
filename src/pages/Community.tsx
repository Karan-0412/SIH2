import React, { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useProfile } from '@/hooks/useProfile';
import TextType from '@/components/TextType';
import DarkVeil from '@/components/DarkVeil';
import Galaxy from '@/components/Galaxy';
import { 
  MessageSquare, 
  Users, 
  TrendingUp, 
  Search, 
  Plus, 
  ThumbsUp, 
  ThumbsDown, 
  Share2, 
  Bookmark, 
  Flag, 
  MoreVertical,
  Calendar,
  Award,
  Star,
  Hash,
  Filter,
  Sparkles,
  Heart,
  Reply,
  Send
} from 'lucide-react';

type Category = 'Academics' | 'Placements' | 'Clubs' | 'Events' | 'General';

type Comment = { id: string; authorId: string; authorName: string; content: string; createdAt: string; upvotes?: string[]; downvotes?: string[] };
type Post = {
  id: string;
  authorId: string;
  authorName: string;
  content: string;
  category: Category;
  groupId?: string | null;
  createdAt: string;
  upvotes: string[]; // user ids
  downvotes: string[];
  comments: Comment[];
  blocked?: boolean;
  reports?: number;
  bookmarked?: string[]; // user ids
};

type Group = { id: string; name: string; description?: string; members: string[]; admins: string[] };

const STORAGE_KEYS = {
  POSTS: 'community_posts_v1',
  GROUPS: 'community_groups_v1',
  BANS: 'community_bans_v1',
};

const CATEGORIES: Category[] = ['Academics', 'Placements', 'Clubs', 'Events', 'General'];

function uid(prefix = '') { return prefix + Math.random().toString(36).slice(2, 9); }

function nowIso() { return new Date().toISOString(); }

function load<T>(key: string, fallback: T): T {
  try { const v = localStorage.getItem(key); return v ? JSON.parse(v) as T : fallback; } catch { return fallback; }
}

function save(key: string, value: any) { try { localStorage.setItem(key, JSON.stringify(value)); } catch {} }

// Very small AI filter stub - replace with real moderation API if available
function aiDetectAbuse(text: string) {
  const blockWords = ['hate', 'kill', 'terror', 'slur', 'idiot'];
  const t = text.toLowerCase();
  return blockWords.some(w => t.includes(w));
}

export default function CommunityPage() {
  const { profile } = useProfile();
  const { toast } = useToast();

  const [posts, setPosts] = useState<Post[]>(() => load<Post[]>(STORAGE_KEYS.POSTS, []));
  const [groups, setGroups] = useState<Group[]>(() => load<Group[]>(STORAGE_KEYS.GROUPS, [
    { id: 'g-general', name: 'General', description: 'General campus discussion', members: [], admins: [] },
  ]));
  const [bans, setBans] = useState<Record<string, number>>(() => load(STORAGE_KEYS.BANS, {}));

  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [trendingFilter, setTrendingFilter] = useState<'All' | Category>('All');

  const [creatingGroup, setCreatingGroup] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupDesc, setNewGroupDesc] = useState('');

  const [newPostContent, setNewPostContent] = useState('');
  const [newPostCategory, setNewPostCategory] = useState<Category>('Academics');

  // selected post for comments view
  const [openPostId, setOpenPostId] = useState<string | null>(null);
  const openPost = posts.find(p => p.id === openPostId) || null;

  useEffect(() => { save(STORAGE_KEYS.POSTS, posts); }, [posts]);
  useEffect(() => { save(STORAGE_KEYS.GROUPS, groups); }, [groups]);
  useEffect(() => { save(STORAGE_KEYS.BANS, bans); }, [bans]);

  // convenience
  const myId = profile?.id ?? 'anon_' + (profile?.email ?? 'guest');
  const myName = profile?.full_name ?? 'Anonymous';

  const myBanExpires = bans[myId] ?? 0;
  const amBanned = myBanExpires > Date.now();
  const banRemaining = Math.max(0, Math.ceil((myBanExpires - Date.now()) / 1000));

  const joinedGroups = groups.filter(g => g.members.includes(myId));

  // Compute profile stats for banner
  const profileStats = useMemo(() => {
    const userPosts = posts.filter(p => p.authorId === myId && !p.blocked);
    const upvotesReceived = userPosts.reduce((sum, p) => sum + p.upvotes.length, 0);
    const downvotesReceived = userPosts.reduce((sum, p) => sum + p.downvotes.length, 0);
    return {
      postsCount: userPosts.length,
      groupsCount: joinedGroups.length,
      upvotesReceived,
      downvotesReceived,
    };
  }, [posts, myId, joinedGroups]);

  // Avatar overrides from local profile edits
  const avatarOverrides = useMemo(() => {
    try { return JSON.parse(localStorage.getItem('profile_overrides_v1') || '{}'); } catch { return {}; }
  }, []);
  const getAvatarFor = (userId: string) => {
    if (userId === myId) return avatarOverrides?.avatarDataUrl || '';
    return '';
  };

  const visiblePosts = useMemo(() => {
    let base = posts.slice().sort((a,b) => b.createdAt.localeCompare(a.createdAt));
    if (selectedGroup) base = base.filter(p => (p.groupId || 'g-general') === selectedGroup);
    if (query) base = base.filter(p => p.content.toLowerCase().includes(query.toLowerCase()));
    return base;
  }, [posts, selectedGroup, query]);

  // posting flow
  const onCreatePost = () => {
    if (!profile) { toast({ title: 'Sign in required', description: 'You must be signed in to post.' }); return; }
    if (amBanned) { toast({ title: 'You are temporarily banned', description: `You are banned for abusive content. Try again in ${banRemaining}s`, variant: 'destructive' }); return; }
    if (!newPostContent.trim()) { toast({ title: 'Empty post', description: 'Please write something.' }); return; }

    // Respectful reminder popup - simple confirm
    if (!confirm('Be respectful. Abusive content leads to a temporary ban. Proceed?')) return;

    // AI moderation
    const abusive = aiDetectAbuse(newPostContent);
    if (abusive) {
      // block post and ban user 1 hour
      const expires = Date.now() + 60 * 60 * 1000;
      setBans(bl => ({ ...bl, [myId]: expires }));
      toast({ title: 'Content blocked', description: 'Abusive content detected. You are temporarily banned for 1 hour.', variant: 'destructive' });
      // create a blocked post entry
      const p: Post = { id: uid('p_'), authorId: myId, authorName: myName, content: newPostContent, category: newPostCategory, groupId: selectedGroup ?? 'g-general', createdAt: nowIso(), upvotes: [], downvotes: [], comments: [], blocked: true, reports: 1, bookmarked: [] };
      setPosts(ps => [p, ...ps]);
      setNewPostContent('');
      return;
    }

    const p: Post = { id: uid('p_'), authorId: myId, authorName: myName, content: newPostContent, category: newPostCategory, groupId: selectedGroup ?? 'g-general', createdAt: nowIso(), upvotes: [], downvotes: [], comments: [], blocked: false, reports: 0, bookmarked: [] };
    setPosts(ps => [p, ...ps]);
    setNewPostContent('');
    toast({ title: 'Posted', description: 'Your post was added.' });
  };

  const toggleVote = (postId: string, type: 'up'|'down') => {
    setPosts(ps => ps.map(p => {
      if (p.id !== postId) return p;
      const up = new Set(p.upvotes);
      const down = new Set(p.downvotes);
      const hasUp = up.has(myId);
      const hasDown = down.has(myId);
      if (type === 'up') {
        if (hasUp) up.delete(myId); else { up.add(myId); down.delete(myId); }
      } else {
        if (hasDown) down.delete(myId); else { down.add(myId); up.delete(myId); }
      }
      return { ...p, upvotes: Array.from(up), downvotes: Array.from(down) };
    }));
  };

  const toggleCommentVote = (postId: string, commentId: string, type: 'up'|'down') => {
    setPosts(ps => ps.map(p => {
      if (p.id !== postId) return p;
      const comments = p.comments.map(c => {
        if (c.id !== commentId) return c;
        const up = new Set(c.upvotes || []);
        const down = new Set(c.downvotes || []);
        const hasUp = up.has(myId);
        const hasDown = down.has(myId);
        if (type === 'up') {
          if (hasUp) up.delete(myId); else { up.add(myId); down.delete(myId); }
        } else {
          if (hasDown) down.delete(myId); else { down.add(myId); up.delete(myId); }
        }
        return { ...c, upvotes: Array.from(up), downvotes: Array.from(down) };
      });
      return { ...p, comments };
    }));
  };

  const addComment = (postId: string, text: string) => {
    if (!text.trim()) return;
    if (!profile) { toast({ title: 'Sign in required' }); return; }
    const comment: Comment = { id: uid('c_'), authorId: myId, authorName: myName, content: text, createdAt: nowIso(), upvotes: [], downvotes: [] };
    setPosts(ps => ps.map(p => p.id === postId ? { ...p, comments: [...p.comments, comment] } : p));
    toast({ title: 'Replied' });
  };

  const reportPost = (postId: string) => {
    setPosts(ps => ps.map(p => p.id === postId ? { ...p, reports: (p.reports||0) + 1 } : p));
    toast({ title: 'Reported', description: 'Thanks — moderators will review.' });
  };

  const bookmarkPost = (postId: string) => {
    setPosts(ps => ps.map(p => p.id === postId ? { ...p, bookmarked: p.bookmarked?.includes(myId) ? p.bookmarked.filter(id=>id!==myId) : [...(p.bookmarked||[]), myId] } : p));
  };

  const createGroup = () => {
    if (!newGroupName.trim()) return toast({ title: 'Name required' });
    const id = uid('g_');
    const g: Group = { id, name: newGroupName.trim(), description: newGroupDesc.trim(), members: [myId], admins: [myId] };
    setGroups(gs => [g, ...gs]);
    setNewGroupName(''); setNewGroupDesc(''); setCreatingGroup(false);
    toast({ title: 'Group created' });
  };

  const joinGroup = (gid: string) => {
    setGroups(gs => gs.map(g => g.id === gid ? { ...g, members: g.members.includes(myId) ? g.members : [...g.members, myId] } : g));
    toast({ title: 'Joined group' });
  };

  const leaveGroup = (gid: string) => {
    setGroups(gs => gs.map(g => g.id === gid ? { ...g, members: g.members.filter(id=>id!==myId) } : g));
    if (selectedGroup === gid) setSelectedGroup(null);
  };

  const deletePost = (postId: string) => {
    setPosts(ps => ps.filter(p => p.id !== postId));
    toast({ title: 'Post removed' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-black" style={{ minHeight: 260 }}>
        <Galaxy 
          mouseRepulsion={true}
          mouseInteraction={true}
          density={1.5}
          glowIntensity={0.5}
          saturation={0.8}
          hueShift={240}
        />
        <div className="relative z-10 text-white">
          <div className="max-w-7xl mx-auto px-6 py-12">
            <div className="grid grid-cols-12 gap-6 items-center">
              <div className="col-span-12 lg:col-span-7 text-center lg:text-left">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur border border-white/20 mb-4">
                  <Sparkles className="w-4 h-4 text-yellow-300" />
                  <span className="text-sm">Welcome {profile?.full_name ? profile.full_name.split(' ')[0] : 'Student'}</span>
                </div>
                <h1 className="text-4xl font-bold mb-1 flex items-center justify-center lg:justify-start gap-3">
                  <MessageSquare className="w-10 h-10" />
                  <TextType 
                    text={["Campus Community", "Ask Questions", "Share Ideas", "Connect with Peers"]}
                    typingSpeed={75}
                    pauseDuration={1500}
                    showCursor={true}
                    cursorCharacter="|"
                    className="inline-block"
                  />
                </h1>
                <p className="text-lg text-blue-100 max-w-2xl mx-auto lg:mx-0">Connect, share, and grow together with your peers. Use upvotes to highlight helpful posts and downvotes to keep the feed clean.</p>
                <div className="mt-6 flex items-center justify-center lg:justify-start gap-3 flex-wrap">
                  <Badge variant="secondary" className="bg-white/20 text-white">
                    <Users className="w-4 h-4 mr-2" />
                    {posts.length} Posts
                  </Badge>
                  <Badge variant="secondary" className="bg-white/20 text-white">
                    <Users className="w-4 h-4 mr-2" />
                    {groups.length} Groups
                  </Badge>
                </div>
              </div>

              {/* Profile summary card */}
              <div className="col-span-12 lg:col-span-5">
                <div className="relative rounded-2xl p-5 bg-transparent backdrop-blur-sm backdrop-saturate-150 border border-white/5 ring-1 ring-white/5">
                  <div className="flex items-center gap-4">
                    <Avatar className="w-14 h-14 ring-2 ring-white/30">
                      <AvatarImage src={(avatarOverrides?.avatarDataUrl || '') || '/placeholder.svg'} alt={profile?.full_name || 'You'} />
                      <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                        {(profile?.full_name || 'U').slice(0,1)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="font-semibold">{profile?.full_name || 'Anonymous User'}</div>
                      <div className="text-sm text-blue-100">Your community snapshot</div>
                    </div>
                  </div>
                  <div className="mt-4 grid grid-cols-4 gap-3">
                    <div className="text-center rounded-xl p-3 bg-transparent border border-white/5">
                      <div className="text-xs text-blue-100">Posts</div>
                      <div className="text-xl font-semibold">{profileStats.postsCount}</div>
                    </div>
                    <div className="text-center rounded-xl p-3 bg-transparent border border-white/5">
                      <div className="text-xs text-blue-100">Groups</div>
                      <div className="text-xl font-semibold">{profileStats.groupsCount}</div>
                    </div>
                    <div className="text-center rounded-xl p-3 bg-transparent border border-white/5">
                      <div className="text-xs text-blue-100 flex items-center justify-center gap-1"><ThumbsUp className="w-3 h-3" /> Upvotes</div>
                      <div className="text-xl font-semibold">{profileStats.upvotesReceived}</div>
                    </div>
                    <div className="text-center rounded-xl p-3 bg-transparent border border-white/5">
                      <div className="text-xs text-blue-100 flex items-center justify-center gap-1"><ThumbsDown className="w-3 h-3" /> Downvotes</div>
                      <div className="text-xl font-semibold">{profileStats.downvotesReceived}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto p-6 grid grid-cols-12 gap-6">
        {/* Left sidebar: groups */}
        <aside className="col-span-12 lg:col-span-3">
          <div className="sticky top-24 space-y-6">
            {/* Groups Card */}
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Hash className="w-5 h-5 text-black" />
                  Groups
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  variant={selectedGroup === null ? "default" : "ghost"}
                  className={`w-full justify-start ${selectedGroup === null ? 'bg-black text-white' : 'hover:bg-black/5'}`}
                  onClick={() => setSelectedGroup(null)}
                >
                  <Users className="w-4 h-4 mr-2" />
                  All Posts
                </Button>
                {groups.map(g => (
                  <div key={g.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 transition-colors">
                    <Button
                      variant={selectedGroup === g.id ? "default" : "ghost"}
                      className={`flex-1 justify-start ${selectedGroup === g.id ? 'bg-black text-white' : 'hover:bg-black/5'}`}
                      onClick={() => setSelectedGroup(g.id)}
                    >
                      <Hash className="w-4 h-4 mr-2" />
                      {g.name}
                    </Button>
                    {g.members.includes(myId) ? (
                      <Button size="sm" variant="outline" onClick={() => leaveGroup(g.id)} className="ml-2">
                        Leave
                      </Button>
                    ) : (
                      <Button size="sm" onClick={() => joinGroup(g.id)} className="ml-2">
                        Join
                      </Button>
                    )}
                  </div>
                ))}
                <Button 
                  variant="outline" 
                  className="w-full mt-4 border-dashed border-2 border-black/30 hover:border-black hover:bg-black/5"
                  onClick={() => setCreatingGroup(true)}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create Group
                </Button>
              </CardContent>
            </Card>

            {/* Search Card */}
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Search className="w-5 h-5 text-green-600" />
                  Search
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input 
                    value={query} 
                    onChange={(e) => setQuery(e.target.value)} 
                    placeholder="Search posts..." 
                    className="pl-10 border-2 focus:border-blue-500"
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </aside>

        {/* Center: feed */}
        <section className="col-span-12 lg:col-span-6">
          {/* Create Post Card */}
            <Card className="shadow-lg border-0 bg-white/90 backdrop-blur-sm mb-6">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-purple-600" />
                Share Something
              </CardTitle>
            </CardHeader>
            <CardContent>
              {amBanned ? (
                <div className="text-center p-6 bg-red-50 rounded-lg border border-red-200">
                  <Flag className="w-8 h-8 text-red-500 mx-auto mb-2" />
                  <p className="text-red-700 font-medium">You are temporarily banned from posting</p>
                  <p className="text-red-600 text-sm">Try again in {banRemaining} seconds</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={getAvatarFor(myId) || '/placeholder.svg'} alt={myName} />
                      <AvatarFallback>{myName.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <Textarea 
                        value={newPostContent} 
                        onChange={(e) => setNewPostContent(e.target.value)} 
                        className="min-h-[100px] resize-none border-2 focus:border-black"
                        placeholder="What's on your mind? Share your thoughts, ask questions, or start a discussion..."
                      />
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <select 
                        value={newPostCategory} 
                        onChange={(e) => setNewPostCategory(e.target.value as Category)}
                        className="border-2 rounded-lg px-3 py-2 focus:border-black"
                      >
                        {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                      <select 
                        value={selectedGroup ?? ''} 
                        onChange={(e) => setSelectedGroup(e.target.value || null)}
                        className="border-2 rounded-lg px-3 py-2 focus:border-black"
                      >
                        <option value="">General</option>
                        {groups.map(g => <option value={g.id} key={g.id}>{g.name}</option>)}
                      </select>
                    </div>
                    <Button 
                      onClick={onCreatePost}
                      className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                      disabled={!newPostContent.trim()}
                    >
                      <Send className="w-4 h-4 mr-2" />
                      Post
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="space-y-4">
            {visiblePosts.map(post => (
              <Card key={post.id} className={`shadow-lg border-0 bg-white/90 backdrop-blur-sm hover:shadow-xl transition-all duration-300 ${post.blocked ? 'opacity-60' : ''}`}>
                <CardContent className="p-6">
                  <header className="flex items-start gap-4 mb-4">
                    <Avatar className="w-12 h-12 ring-2 ring-black/20">
                      <AvatarImage src={getAvatarFor(post.authorId) || '/placeholder.svg'} alt={post.authorName} />
                      <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold">
                        {(post.authorName || 'U').slice(0,1)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <h3 className="font-semibold text-gray-900">{post.authorName}</h3>
                          <Badge variant="secondary" className="bg-black text-white">
                            {post.category}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <Calendar className="w-4 h-4" />
                          {new Date(post.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                      <div id={`post-${post.id}`} className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                        {post.content}
                      </div>
                    </div>
                  </header>

                  {/* Action Buttons */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <div className="flex items-center gap-6">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleVote(post.id, 'up')}
                        className={`flex items-center gap-2 ${post.upvotes.includes(myId) ? 'text-green-600 bg-green-50' : 'text-gray-600 hover:text-green-600'}`}
                      >
                        <ThumbsUp className="w-4 h-4" />
                        <span>{post.upvotes.length}</span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleVote(post.id, 'down')}
                        className={`flex items-center gap-2 ${post.downvotes.includes(myId) ? 'text-red-600 bg-red-50' : 'text-gray-600 hover:text-red-600'}`}
                      >
                        <ThumbsDown className="w-4 h-4" />
                        <span>{post.downvotes.length}</span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setOpenPostId(post.id)}
                        className="flex items-center gap-2 text-gray-600 hover:text-black"
                      >
                        <Reply className="w-4 h-4" />
                        <span>{post.comments.length}</span>
                      </Button>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => { navigator.clipboard?.writeText(window.location.href + '#post-' + post.id); toast({ title: 'Link copied' }); }}
                        className="text-gray-600 hover:text-black"
                      >
                        <Share2 className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => bookmarkPost(post.id)}
                        className={`${(post.bookmarked || []).includes(myId) ? 'text-yellow-600' : 'text-gray-600 hover:text-yellow-600'}`}
                      >
                        <Bookmark className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => reportPost(post.id)}
                        className="text-gray-600 hover:text-red-600"
                      >
                        <Flag className="w-4 h-4" />
                      </Button>
                      {groups.find(g => g.id === post.groupId)?.admins.includes(myId) && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deletePost(post.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Comments Section */}
                  {openPostId === post.id && (
                    <div className="mt-6 pt-6 border-t border-gray-100">
                      <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <MessageSquare className="w-4 h-4" />
                        Comments ({post.comments.length})
                      </h4>
                      <div className="space-y-4">
                        {post.comments.map(c => (
                          <div key={c.id} className="flex gap-3 p-4 bg-gray-50 rounded-lg">
                            <Avatar className="w-8 h-8">
                              <AvatarImage src={getAvatarFor(c.authorId) || '/placeholder.svg'} alt={c.authorName} />
                              <AvatarFallback className="text-xs">{c.authorName.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-medium text-sm">{c.authorName}</span>
                                <span className="text-xs text-gray-500">•</span>
                                <span className="text-xs text-gray-500">{new Date(c.createdAt).toLocaleDateString()}</span>
                              </div>
                              <p className="text-sm text-gray-700 mb-2">{c.content}</p>
                              <div className="flex items-center gap-4">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => toggleCommentVote(post.id, c.id, 'up')}
                                  className={`text-xs ${(c.upvotes || []).includes(myId) ? 'text-green-600' : 'text-gray-500 hover:text-green-600'}`}
                                >
                                  <ThumbsUp className="w-3 h-3 mr-1" />
                                  {(c.upvotes || []).length}
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => toggleCommentVote(post.id, c.id, 'down')}
                                  className={`text-xs ${(c.downvotes || []).includes(myId) ? 'text-red-600' : 'text-gray-500 hover:text-red-600'}`}
                                >
                                  <ThumbsDown className="w-3 h-3 mr-1" />
                                  {(c.downvotes || []).length}
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                      <CommentBox postId={post.id} onAdd={addComment} />
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Right sidebar */}
        <aside className="col-span-12 lg:col-span-3">
          <div className="sticky top-24 space-y-6">
            {/* Trending Posts */}
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <TrendingUp className="w-5 h-5 text-orange-600" />
                  Trending
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 mb-4">
                  <Filter className="w-4 h-4 text-gray-500" />
                  <select 
                    value={trendingFilter} 
                    onChange={(e) => setTrendingFilter(e.target.value as any)} 
                    className="border-2 rounded-lg px-3 py-1 text-sm focus:border-orange-500"
                  >
                    <option value="All">All Categories</option>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="space-y-3">
                  {(() => {
                    const filtered = posts.filter(p => !p.blocked && (trendingFilter === 'All' || p.category === trendingFilter));
                    const sorted = filtered.sort((a, b) => (b.upvotes.length - b.downvotes.length) - (a.upvotes.length - a.downvotes.length) || b.createdAt.localeCompare(a.createdAt));
                    return sorted.slice(0, 5).map((p, i) => (
                      <div key={p.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center text-white font-bold text-sm">
                          {i + 1}
                        </div>
                        <a 
                          href={`#post-${p.id}`} 
                          className="flex-1 text-sm text-gray-700 hover:text-blue-600 transition-colors line-clamp-2"
                        >
                          {p.content.slice(0, 80)}{p.content.length > 80 ? '...' : ''}
                        </a>
                      </div>
                    ));
                  })()}
                </div>
              </CardContent>
            </Card>

            {/* Suggested Groups */}
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Users className="w-5 h-5 text-green-600" />
                  Suggested Groups
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {groups.filter(g => !g.members.includes(myId)).slice(0, 4).map(g => (
                    <div key={g.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-blue-500 flex items-center justify-center text-white font-semibold">
                          {g.name.charAt(0)}
                        </div>
                        <div>
                          <div className="font-medium text-sm">{g.name}</div>
                          <div className="text-xs text-gray-500">{g.members.length} members</div>
                        </div>
                      </div>
                      <Button size="sm" onClick={() => joinGroup(g.id)} className="bg-green-600 hover:bg-green-700">
                        Join
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Leaderboard */}
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Award className="w-5 h-5 text-yellow-600" />
                  Top Contributors
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(posts.reduce((acc, p) => { 
                    acc[p.authorName] = (acc[p.authorName] || 0) + (p.upvotes.length - p.downvotes.length); 
                    return acc; 
                  }, {} as Record<string, number>)).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([name, score], i) => (
                    <div key={name} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center text-white font-bold text-sm">
                          {i + 1}
                        </div>
                        <div>
                          <div className="font-medium text-sm">{name}</div>
                          <div className="text-xs text-gray-500">{score} points</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-500" />
                        <span className="text-sm font-medium">{score}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </aside>
      </main>

      {/* Group creation modal */}
      {creatingGroup && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4 shadow-2xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="w-5 h-5 text-blue-600" />
                Create New Group
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="group-name">Group Name</Label>
                <Input 
                  id="group-name"
                  value={newGroupName} 
                  onChange={(e) => setNewGroupName(e.target.value)} 
                  placeholder="Enter group name" 
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="group-desc">Description (Optional)</Label>
                <Textarea 
                  id="group-desc"
                  value={newGroupDesc} 
                  onChange={(e) => setNewGroupDesc(e.target.value)} 
                  placeholder="Brief description of the group" 
                  className="mt-1"
                />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <Button variant="outline" onClick={() => setCreatingGroup(false)}>
                  Cancel
                </Button>
                <Button onClick={createGroup} className="bg-blue-600 hover:bg-blue-700">
                  Create Group
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Post comment modal using openPostId handled above */}

    </div>
  );
}

function CommentBox({ postId, onAdd }: { postId: string; onAdd: (id: string, text: string) => void }) {
  const [text, setText] = useState('');
  return (
    <div className="mt-4 p-4 bg-white rounded-lg border border-gray-200">
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-sm">
          U
        </div>
        <div className="flex-1">
          <Textarea 
            value={text} 
            onChange={(e) => setText(e.target.value)} 
            className="min-h-[80px] resize-none border-2 focus:border-blue-500"
            placeholder="Write a thoughtful reply..."
          />
          <div className="flex justify-end mt-3">
            <Button 
              onClick={() => { onAdd(postId, text); setText(''); }}
              disabled={!text.trim()}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Send className="w-4 h-4 mr-2" />
              Reply
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
