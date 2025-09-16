import React, { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { useProfile } from '@/hooks/useProfile';

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
    <div className="min-h-screen bg-gray-100">
      <main className="max-w-7xl mx-auto p-6 grid grid-cols-12 gap-6">
        {/* Left sidebar: groups */}
        <aside className="col-span-12 lg:col-span-3">
          <div className="sticky top-24 space-y-4">
            <div className="bg-white p-4 rounded shadow">
              <Label>Groups</Label>
              <div className="mt-3 flex flex-col gap-2">
                <button className={`text-left px-2 py-1 rounded ${selectedGroup===null ? 'bg-primary text-white' : 'hover:bg-gray-100'}`} onClick={()=>setSelectedGroup(null)}>All</button>
                {groups.map(g=> (
                  <div key={g.id} className="flex items-center justify-between">
                    <button className={`text-left px-2 py-1 rounded ${selectedGroup===g.id ? 'bg-primary text-white' : 'hover:bg-gray-100'}`} onClick={()=>setSelectedGroup(g.id)}>{g.name}</button>
                    {g.members.includes(myId) ? <button className="text-xs text-muted-foreground ml-2" onClick={()=>leaveGroup(g.id)}>Leave</button> : <button className="text-xs text-muted-foreground ml-2" onClick={()=>joinGroup(g.id)}>Join</button>}
                  </div>
                ))}
              </div>
              <div className="mt-3">
                <Button variant="outline" size="sm" onClick={()=>setCreatingGroup(true)}>Create Group</Button>
              </div>
            </div>

            <div className="bg-white p-4 rounded shadow">
              <Label>Search</Label>
              <Input value={query} onChange={(e)=>setQuery(e.target.value)} placeholder="Search posts" />
            </div>
          </div>
        </aside>

        {/* Center: feed */}
        <section className="col-span-12 lg:col-span-6">
          <div className="bg-white p-4 rounded shadow mb-4">
            {amBanned ? (
              <div className="text-center text-sm text-muted-foreground">You are temporarily banned from posting. Try again later.</div>
            ) : (
              <>
                <Label>New post</Label>
                <textarea value={newPostContent} onChange={(e)=>setNewPostContent(e.target.value)} className="w-full mt-2 p-3 border rounded min-h-[80px] resize-vertical" placeholder="Ask a question, share an idea... (text only)" />
                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-center gap-2">
                    <select value={newPostCategory} onChange={(e)=>setNewPostCategory(e.target.value as Category)} className="border rounded px-2 py-1">
                      {CATEGORIES.map(c=> <option key={c} value={c}>{c}</option>)}
                    </select>
                    <select value={selectedGroup ?? ''} onChange={(e)=>setSelectedGroup(e.target.value || null)} className="border rounded px-2 py-1">
                      <option value="">General</option>
                      {groups.map(g=> <option value={g.id} key={g.id}>{g.name}</option>)}
                    </select>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button onClick={onCreatePost}>Post</Button>
                  </div>
                </div>
              </>
            )}
          </div>

          <div className="space-y-3">
            {visiblePosts.map(post => (
              <article key={post.id} aria-labelledby={`post-${post.id}`} className={`bg-white p-4 rounded shadow ${post.blocked ? 'opacity-60' : ''}`}>
                <header className="flex items-start gap-3">
                  <Avatar className="w-9 h-9"><AvatarImage src="/placeholder.svg" alt={post.authorName} /><AvatarFallback>{(post.authorName || 'U').slice(0,1)}</AvatarFallback></Avatar>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-medium">{post.authorName} <span className="text-xs text-muted-foreground ml-2">{post.category}</span></div>
                      <div className="text-xs text-muted-foreground">{new Date(post.createdAt).toLocaleString()}</div>
                    </div>
                    <div id={`post-${post.id}`} className="mt-2 text-sm leading-relaxed">{post.content}</div>
                    <div className="mt-3 flex items-center gap-3 text-sm">
                      <button onClick={()=>toggleVote(post.id,'up')} aria-pressed={post.upvotes.includes(myId)} className={`${post.upvotes.includes(myId) ? 'text-green-600' : 'text-green-700 hover:text-green-800'} flex items-center gap-1`}>▲ <span>{post.upvotes.length}</span></button>
                      <button onClick={()=>toggleVote(post.id,'down')} aria-pressed={post.downvotes.includes(myId)} className={`${post.downvotes.includes(myId) ? 'text-red-600' : 'text-red-700 hover:text-red-800'} flex items-center gap-1`}>▼ <span>{post.downvotes.length}</span></button>
                      <button onClick={()=>setOpenPostId(post.id)}>Comment ({post.comments.length})</button>
                      <button onClick={()=>{ navigator.clipboard?.writeText(window.location.href + '#post-' + post.id); toast({ title: 'Link copied' }); }}>Share</button>
                      <button onClick={()=>bookmarkPost(post.id)}>{(post.bookmarked||[]).includes(myId) ? 'Bookmarked' : 'Bookmark'}</button>
                      <button onClick={()=>reportPost(post.id)}>Report</button>
                      {groups.find(g=>g.id===post.groupId)?.admins.includes(myId) && (
                        <button onClick={()=>deletePost(post.id)} className="text-red-600">Delete</button>
                      )}
                    </div>
                  </div>
                </header>

                {/* comments section (expandable) */}
                {openPostId === post.id && (
                  <div className="mt-3 border-t pt-3">
                    <div className="space-y-2">
                      {post.comments.map(c => (
                        <div key={c.id} className="text-sm">
                          <div className="text-xs text-muted-foreground">{c.authorName} • {new Date(c.createdAt).toLocaleString()}</div>
                          <div className="mt-1">{c.content}</div>
                          <div className="mt-1 flex items-center gap-3 text-xs">
                            <button onClick={()=>toggleCommentVote(post.id, c.id, 'up')} aria-pressed={(c.upvotes||[]).includes(myId)} className={`${(c.upvotes||[]).includes(myId) ? 'text-green-600' : 'text-green-700 hover:text-green-800'} flex items-center gap-1`}>▲ <span>{(c.upvotes||[]).length}</span></button>
                            <button onClick={()=>toggleCommentVote(post.id, c.id, 'down')} aria-pressed={(c.downvotes||[]).includes(myId)} className={`${(c.downvotes||[]).includes(myId) ? 'text-red-600' : 'text-red-700 hover:text-red-800'} flex items-center gap-1`}>▼ <span>{(c.downvotes||[]).length}</span></button>
                          </div>
                        </div>
                      ))}
                    </div>
                    <CommentBox postId={post.id} onAdd={addComment} />
                  </div>
                )}
              </article>
            ))}
          </div>
        </section>

        {/* Right sidebar */}
        <aside className="col-span-12 lg:col-span-3">
          <div className="sticky top-24 space-y-4">
            <div className="bg-white p-4 rounded shadow">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Trending</h3>
                <select value={trendingFilter} onChange={(e)=>setTrendingFilter(e.target.value as any)} className="border rounded px-2 py-1 text-sm">
                  <option value="All">All</option>
                  {CATEGORIES.map(c=> <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="mt-3 space-y-2">
                {(() => {
                  const filtered = posts.filter(p=> !p.blocked && (trendingFilter==='All' || p.category===trendingFilter));
                  const sorted = filtered.sort((a,b)=> (b.upvotes.length - b.downvotes.length) - (a.upvotes.length - a.downvotes.length) || b.createdAt.localeCompare(a.createdAt));
                  return sorted.slice(0,5).map((p, i)=> (
                    <div key={p.id} className="text-sm flex items-start gap-3">
                      <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-gray-100 text-gray-700 text-xs font-semibold">{i+1}</span>
                      <a href={`#post-${p.id}`} className="underline flex-1">{p.content.slice(0,60)}{p.content.length>60? '...':''}</a>
                    </div>
                  ));
                })()}
              </div>
            </div>

            <div className="bg-white p-4 rounded shadow">
              <h3 className="font-semibold">Suggested groups</h3>
              <div className="mt-3 space-y-2">
                {groups.filter(g=> !g.members.includes(myId)).slice(0,4).map(g=> (
                  <div key={g.id} className="flex items-center justify-between">
                    <div>{g.name}</div>
                    <Button size="sm" onClick={()=>joinGroup(g.id)}>Join</Button>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white p-4 rounded shadow">
              <h3 className="font-semibold">Leaderboard</h3>
              <div className="mt-3 space-y-2">
                {/* top contributors by upvotes */}
                {Object.entries(posts.reduce((acc, p) => { acc[p.authorName] = (acc[p.authorName]||0) + (p.upvotes.length - p.downvotes.length); return acc; }, {} as Record<string, number>)).sort((a,b)=> b[1]-a[1]).slice(0,5).map(([name,score])=> (
                  <div key={name} className="flex items-center justify-between text-sm"><div>{name}</div><div className="text-xs text-muted-foreground">{score}</div></div>
                ))}
              </div>
            </div>
          </div>
        </aside>
      </main>

      {/* Group creation modal */}
      {creatingGroup && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
          <div className="bg-white p-4 rounded w-full max-w-md">
            <h3 className="font-semibold mb-2">Create Group</h3>
            <Input value={newGroupName} onChange={(e)=>setNewGroupName(e.target.value)} placeholder="Group name" />
            <Input value={newGroupDesc} onChange={(e)=>setNewGroupDesc(e.target.value)} placeholder="Short description" className="mt-2" />
            <div className="flex justify-end gap-2 mt-3">
              <Button variant="outline" onClick={()=>setCreatingGroup(false)}>Cancel</Button>
              <Button onClick={createGroup}>Create</Button>
            </div>
          </div>
        </div>
      )}

      {/* Post comment modal using openPostId handled above */}

    </div>
  );
}

function CommentBox({ postId, onAdd }: { postId: string; onAdd: (id:string, text:string)=>void }){
  const [text, setText] = useState('');
  return (
    <div className="mt-2">
      <textarea value={text} onChange={(e)=>setText(e.target.value)} className="w-full p-2 border rounded" placeholder="Write a reply..."></textarea>
      <div className="flex justify-end mt-2">
        <Button onClick={()=>{ onAdd(postId, text); setText(''); }}>Reply</Button>
      </div>
    </div>
  );
}
