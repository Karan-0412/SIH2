import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useProfile, Profile } from '@/hooks/useProfile';
import { supabase } from '@/integrations/supabase/client';
import { Bell, Bookmark, BookmarkCheck, Moon, Sun, Send, MoreVertical } from 'lucide-react';
import { useTheme } from 'next-themes';

const DEPARTMENTS = ['CSE','ECE','EEE','Mechanical','Civil','AIML','IT','MBA','Maths','Physics','Chemistry'];
const SORT_KEYS = ['name','department','recent'] as const;

const BK_KEY = (id: string) => `fac_bookmarks_${id}`;
const BL_KEY = (id: string) => `fac_blocked_${id}`;

interface FacultyMeta { id: string; full_name: string; email: string; department?: string; sections?: string[]; subjects?: string[]; updated_at?: string; avatar_url?: string | null; }
interface MessageRow { id: string; sender_id: string; receiver_id: string; content: string; created_at: string; read_at: string | null; }

export default function FacultyCommunity(){
  const { user } = useAuth();
  const { profile } = useProfile();
  const { toast } = useToast();
  const { theme, setTheme } = useTheme();

  const myId = profile?.id ?? '';

  const [faculties, setFaculties] = useState<FacultyMeta[]>([]);
  const [search, setSearch] = useState('');
  const [filterDept, setFilterDept] = useState<string>('all');
  const [filterSection, setFilterSection] = useState<string>('');
  const [filterSubject, setFilterSubject] = useState<string>('');
  const [sortBy, setSortBy] = useState<typeof SORT_KEYS[number]>('recent');

  const [bookmarks, setBookmarks] = useState<string[]>([]);
  const [blocked, setBlocked] = useState<string[]>([]);

  const [conversations, setConversations] = useState<string[]>([]); // faculty ids
  const [activePeerId, setActivePeerId] = useState<string | null>(null);
  const [messages, setMessages] = useState<MessageRow[]>([]);
  const [newMsg, setNewMsg] = useState('');
  const [unreadCount, setUnreadCount] = useState(0);

  const chatRef = useRef<HTMLDivElement | null>(null);

  // Load bookmarks/blocked
  useEffect(()=>{
    if(!myId) return;
    try{ setBookmarks(JSON.parse(localStorage.getItem(BK_KEY(myId)) || '[]')); } catch {}
    try{ setBlocked(JSON.parse(localStorage.getItem(BL_KEY(myId)) || '[]')); } catch {}
  },[myId]);

  useEffect(()=>{ if(myId) localStorage.setItem(BK_KEY(myId), JSON.stringify(bookmarks)); },[bookmarks,myId]);
  useEffect(()=>{ if(myId) localStorage.setItem(BL_KEY(myId), JSON.stringify(blocked)); },[blocked,myId]);

  // Fetch faculties
  useEffect(()=>{
    (async()=>{
      try{
        const { data, error } = await supabase.from('profiles').select('id, full_name, email, updated_at, role').eq('role','faculty');
        if(error){ console.error('Load faculties error', error); toast({ title:'Error', description: (error as any)?.message ?? 'Unable to load faculty directory', variant:'destructive' }); return; }
        const metas: FacultyMeta[] = (data||[]).map((p:any)=>({ id:p.id, full_name:p.full_name, email:p.email, updated_at:p.updated_at }));
        setFaculties(metas);
      }catch(err){ console.error('Load faculties err', err); }
    })();
  },[toast]);

  // Conversations list (peers with whom we exchanged messages)
  useEffect(()=>{
    if(!myId) return;
    (async()=>{
      try{
        const { data, error } = await supabase.from('messages').select('sender_id, receiver_id, read_at, created_at').or(`sender_id.eq.${myId},receiver_id.eq.${myId}`).order('created_at', { ascending: false });
        if(error){ console.error('Load conv error', error); return; }
        const peers = new Set<string>();
        let unread = 0;
        (data||[]).forEach((m:any)=>{
          const other = m.sender_id === myId ? m.receiver_id : m.sender_id;
          peers.add(other);
          if(!m.read_at && m.receiver_id === myId) unread++;
        });
        setConversations(Array.from(peers));
        setUnreadCount(unread);
      }catch(err){ console.error('Load conv err', err); }
    })();
  },[myId]);

  // Load messages for active peer
  useEffect(()=>{
    if(!myId || !activePeerId) { setMessages([]); return; }
    (async()=>{
      try{
        const { data, error } = await supabase
          .from('messages')
          .select('*')
          .or(`and(sender_id.eq.${myId},receiver_id.eq.${activePeerId}),and(sender_id.eq.${activePeerId},receiver_id.eq.${myId})`)
          .order('created_at', { ascending: true });
        if(error){ console.error('Load messages error', error); return; }
        const rows = (data||[]) as MessageRow[];
        setMessages(rows);
        // mark reads
        const unreadIds = rows.filter(r=> r.receiver_id === myId && !r.read_at).map(r=> r.id);
        if(unreadIds.length){ await supabase.from('messages').update({ read_at: new Date().toISOString() }).in('id', unreadIds); }
        setUnreadCount(prev=> Math.max(0, prev - unreadIds.length));
        setTimeout(()=> chatRef.current?.scrollTo({ top: chatRef.current.scrollHeight, behavior:'smooth' }), 50);
      }catch(err){ console.error('Load messages err', err); }
    })();
  },[myId, activePeerId]);

  const peer = useMemo(()=> faculties.find(f=> f.id === activePeerId) || null, [faculties, activePeerId]);

  const filteredFaculties = useMemo(()=>{
    let list = faculties.slice();
    const q = search.toLowerCase().trim();
    if(q){ list = list.filter(f=> f.full_name.toLowerCase().includes(q) || f.email.toLowerCase().includes(q) || (f.department||'').toLowerCase().includes(q) || (f.subjects||[]).join(' ').toLowerCase().includes(q) || (f.sections||[]).join(' ').toLowerCase().includes(q)); }
    if(filterDept !== 'all'){ list = list.filter(f=> (f.department||'')===filterDept); }
    if(filterSection){ list = list.filter(f=> (f.sections||[]).some(s=> s.toLowerCase().includes(filterSection.toLowerCase()))); }
    if(filterSubject){ list = list.filter(f=> (f.subjects||[]).some(s=> s.toLowerCase().includes(filterSubject.toLowerCase()))); }
    if(sortBy==='name'){ list.sort((a,b)=> a.full_name.localeCompare(b.full_name)); }
    else if(sortBy==='department'){ list.sort((a,b)=> (a.department||'').localeCompare(b.department||'')); }
    else { list.sort((a,b)=> (b.updated_at||'').localeCompare(a.updated_at||'')); }
    return list;
  },[faculties, search, filterDept, filterSection, filterSubject, sortBy]);

  const toggleBookmark = (fid: string) => {
    setBookmarks(b=> b.includes(fid) ? b.filter(x=>x!==fid) : [fid, ...b]);
  };
  const isBookmarked = (fid: string) => bookmarks.includes(fid);

  const onMessage = (fid: string) => {
    if(blocked.includes(fid)){ toast({ title:'Blocked', description:'You have blocked this faculty. Unblock to message.', variant:'destructive' }); return; }
    setActivePeerId(fid);
  };

  const sendMessage = async () => {
    if(!myId || !activePeerId || !newMsg.trim()) return;
    if(blocked.includes(activePeerId)){ toast({ title:'Blocked', description:'Unblock this faculty to send messages.' , variant:'destructive'}); return; }
    const content = newMsg.trim();
    setNewMsg('');
    try{
      const { data, error } = await supabase.from('messages').insert({ sender_id: myId, receiver_id: activePeerId, content }).select().maybeSingle();
      if(error){ console.error('Send message error', error); toast({ title:'Send failed', description:(error as any)?.message ?? 'Could not send message', variant:'destructive' }); return; }
      setMessages(ms=> [...ms, data as any]);
      setTimeout(()=> chatRef.current?.scrollTo({ top: chatRef.current.scrollHeight, behavior:'smooth' }), 20);
    }catch(err){ console.error('Send message err', err); }
  };

  const blockPeer = (fid: string) => { if(!fid) return; setBlocked(list=> list.includes(fid)? list : [...list, fid]); toast({ title:'Blocked', description:'You will no longer receive messages from this faculty.' }); };
  const unblockPeer = (fid: string) => { setBlocked(list=> list.filter(x=> x!==fid)); toast({ title:'Unblocked' }); };
  const reportPeer = () => { toast({ title:'Reported', description:'Thanks. Our team will review misuse reports.' }); };

  const isOnline = (f: FacultyMeta) => {
    const ts = f.updated_at ? new Date(f.updated_at).getTime() : 0;
    return Date.now() - ts < 1000 * 60 * 60 * 24; // active in last 24h
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0b1020]">
      <header className="sticky top-16 z-10 bg-white/80 dark:bg-[#0b1020]/80 backdrop-blur border-b">
        <div className="max-w-7xl mx-auto p-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Input placeholder="Search by name, department, section, subject" value={search} onChange={(e)=>setSearch(e.target.value)} className="w-[340px]" />
            <Select value={filterDept} onValueChange={setFilterDept}>
              <SelectTrigger className="w-[160px]"><SelectValue placeholder="Department" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                {DEPARTMENTS.map(d=> <SelectItem key={d} value={d}>{d}</SelectItem>)}
              </SelectContent>
            </Select>
            <Input placeholder="Section" value={filterSection} onChange={(e)=>setFilterSection(e.target.value)} className="w-[140px]" />
            <Input placeholder="Subject" value={filterSubject} onChange={(e)=>setFilterSubject(e.target.value)} className="w-[180px]" />
            <Select value={sortBy} onValueChange={(v)=>setSortBy(v as any)}>
              <SelectTrigger className="w-[160px]"><SelectValue>Sort: {sortBy==='recent'?'Recently Active': sortBy==='name'?'Name':'Department'}</SelectValue></SelectTrigger>
              <SelectContent>
                <SelectItem value="recent">Recently Active</SelectItem>
                <SelectItem value="name">Name</SelectItem>
                <SelectItem value="department">Department</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" aria-label="Toggle theme" onClick={()=> setTheme(theme==='dark'?'light':'dark')}>
              {theme==='dark' ? <Sun className="h-4 w-4"/> : <Moon className="h-4 w-4"/>}
            </Button>
            <div className="relative">
              <Button variant="ghost" size="icon" aria-label="Notifications"><Bell className="h-4 w-4"/></Button>
              {unreadCount>0 && <span className="absolute -top-1 -right-1 text-[10px] bg-red-600 text-white rounded-full px-1">{unreadCount}</span>}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-4 grid grid-cols-12 gap-4">
        {/* Directory */}
        <section className="col-span-12 lg:col-span-4">
          <Card>
            <CardHeader>
              <CardTitle>Faculty Directory</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-2 gap-3">
                {filteredFaculties.map(f=> (
                  <div key={f.id} className="border rounded-md p-3 bg-white dark:bg-[#0f1530] hover:shadow transition relative">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10"><AvatarImage src={f.avatar_url||'/placeholder.svg'} alt={f.full_name}/><AvatarFallback>{f.full_name.slice(0,1)}</AvatarFallback></Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold truncate">{f.full_name}</div>
                        <div className="text-xs text-muted-foreground truncate">{f.department || '—'}{(f.subjects||[]).length? ' • ' + (f.subjects||[]).slice(0,2).join(', '): ''}</div>
                        <div className="mt-1 text-[11px] flex items-center gap-2">
                          <span className={`inline-flex items-center gap-1 ${isOnline(f)?'text-green-600':'text-gray-400'}`}>● <span>{isOnline(f)?'Online':'Offline'}</span></span>
                          {f.sections?.length ? <span className="text-muted-foreground">{f.sections.join(', ')}</span> : null}
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button size="sm" onClick={()=>onMessage(f.id)}>Message</Button>
                        <Button size="icon" variant="ghost" aria-label={isBookmarked(f.id)?'Remove bookmark':'Bookmark'} onClick={()=>toggleBookmark(f.id)}>
                          {isBookmarked(f.id)? <BookmarkCheck className="h-4 w-4 text-emerald-600"/> : <Bookmark className="h-4 w-4"/>}
                        </Button>
                      </div>
                    </div>
                    <button className="absolute inset-0" onClick={()=>onMessage(f.id)} aria-label={`Open chat with ${f.full_name}`}></button>
                  </div>
                ))}
                {!filteredFaculties.length && <div className="text-sm text-muted-foreground">No faculty found.</div>}
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Conversations */}
        <aside className="col-span-12 lg:col-span-3">
          <Card>
            <CardHeader>
              <CardTitle>Conversations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col divide-y rounded border overflow-hidden bg-white dark:bg-[#0f1530]">
                {conversations.map(pid=>{
                  const f = faculties.find(x=>x.id===pid);
                  if(!f) return null;
                  const unread = messages.filter(m=> m.sender_id===pid && !m.read_at).length; // crude per-active
                  return (
                    <button key={pid} className={`text-left p-3 hover:bg-gray-50 dark:hover:bg-[#131a3b] ${activePeerId===pid? 'bg-gray-50 dark:bg-[#131a3b]':''}`} onClick={()=> setActivePeerId(pid)}>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8"><AvatarImage src={f.avatar_url||'/placeholder.svg'} alt={f.full_name}/><AvatarFallback>{f.full_name.slice(0,1)}</AvatarFallback></Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium truncate">{f.full_name}</div>
                          <div className="text-xs text-muted-foreground truncate">{f.department || '—'}</div>
                        </div>
                        {unread>0 && <span className="text-[10px] bg-emerald-600 text-white rounded-full px-1">{unread}</span>}
                      </div>
                    </button>
                  );
                })}
                {!conversations.length && <div className="text-sm text-muted-foreground p-3">No conversations yet.</div>}
              </div>
            </CardContent>
          </Card>
        </aside>

        {/* Chat */}
        <section className="col-span-12 lg:col-span-5">
          <Card className="h-full">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>
                {peer ? peer.full_name : 'Select a conversation'}
              </CardTitle>
              {peer && (
                <div className="flex items-center gap-1">
                  {blocked.includes(peer.id) ? (
                    <Button size="sm" variant="secondary" onClick={()=>unblockPeer(peer.id)}>Unblock</Button>
                  ): (
                    <Button size="sm" variant="outline" onClick={()=>blockPeer(peer.id)}>Block</Button>
                  )}
                  <Button size="icon" variant="ghost" onClick={reportPeer} aria-label="More"><MoreVertical className="h-4 w-4"/></Button>
                </div>
              )}
            </CardHeader>
            <CardContent className="flex flex-col h-[70vh]">
              <div ref={chatRef} className="flex-1 overflow-auto space-y-2 p-2 rounded bg-gray-50 dark:bg-[#0f1530]">
                {messages.map(m=>{
                  const mine = m.sender_id === myId;
                  return (
                    <div key={m.id} className={`flex ${mine?'justify-end':''}`}>
                      <div className={`max-w-[70%] rounded px-3 py-2 text-sm shadow ${mine?'bg-blue-600 text-white':'bg-white dark:bg-[#0b1020] border'}`}>
                        <div>{m.content}</div>
                        <div className="mt-1 text-[10px] opacity-80 text-right flex items-center gap-1 justify-end">
                          <span>{new Date(m.created_at).toLocaleTimeString([], { hour:'2-digit', minute:'2-digit' })}</span>
                          <span aria-label={m.read_at? 'Read' : 'Sent'}>{m.read_at? '✓✓':'✓'}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
                {!messages.length && <div className="text-sm text-muted-foreground text-center mt-8">No messages yet.</div>}
              </div>
              <div className="mt-2 flex items-center gap-2">
                <Input placeholder={blocked.includes(activePeerId||'')? 'Blocked — unable to send' : 'Type a message...'} value={newMsg} onChange={(e)=>setNewMsg(e.target.value)} disabled={!peer || blocked.includes(activePeerId||'')} onKeyDown={(e)=>{ if(e.key==='Enter'){ e.preventDefault(); sendMessage(); } }} />
                <Button onClick={sendMessage} disabled={!peer || !newMsg.trim() || blocked.includes(activePeerId||'')} aria-label="Send"><Send className="h-4 w-4"/></Button>
              </div>
            </CardContent>
          </Card>
        </section>
      </main>
    </div>
  );
}
