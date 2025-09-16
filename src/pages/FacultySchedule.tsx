import React, { useMemo, useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

type EventItem = {
  id: string;
  course_name: string;
  start: string; // ISO
  end: string; // ISO
  room?: string;
  tags?: string[];
  syllabus_url?: string | null;
  students_count?: number;
  notes?: string;
  color?: string;
};

const HOURS_START = 8;
const HOURS_END = 20; // 8pm

const daysOfWeek = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];

function clamp(v:number, a:number, b:number){ return Math.max(a, Math.min(b, v)); }

const FacultySchedule: React.FC = () => {
  const { toast } = useToast();
  const [viewMode, setViewMode] = useState<'weekly'|'monthly'>('weekly');
  const [anchorDate, setAnchorDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(true);

  // fetch schedule from DB (if exists)
  useEffect(()=>{
    let mounted = true;
    (async()=>{
      setLoading(true);
      try{
        const { data, error } = await supabase.from('schedule').select('*');
        if(error){
          console.error('Error loading schedule', error);
        } else if(data && mounted){
          // map to EventItem
          const mapped = (data as any[]).map(d=>({
            id: String(d.id),
            course_name: d.course_name,
            start: d.start,
            end: d.end,
            room: d.room,
            tags: d.tags || [],
            syllabus_url: d.syllabus_url ?? null,
            students_count: d.students_count ?? 0,
            notes: d.notes ?? '',
            color: d.color ?? undefined,
          }));
          setEvents(mapped);
        }
      }catch(err){
        console.error('Error loading schedule', err);
      }finally{ setLoading(false); }
    })();
    return ()=>{ mounted=false };
  },[]);

  const weekStartDate = useMemo(()=>{
    // anchorDate is YYYY-MM-DD
    const d = new Date(anchorDate + 'T00:00:00');
    // find Monday
    const day = d.getDay(); // 0 Sun
    const diff = (day === 0 ? -6 : 1 - day);
    const monday = new Date(d);
    monday.setDate(d.getDate() + diff);
    monday.setHours(0,0,0,0);
    return monday;
  },[anchorDate]);

  const weekDays = useMemo(()=>{
    return Array.from({length:7}).map((_,i)=>{
      const dt = new Date(weekStartDate);
      dt.setDate(weekStartDate.getDate()+i);
      return dt;
    });
  },[weekStartDate]);

  const eventsThisWeek = useMemo(()=>{
    const start = new Date(weekStartDate);
    const end = new Date(weekStartDate);
    end.setDate(end.getDate()+7);
    return events.filter(ev=>{
      const s = new Date(ev.start);
      return s >= start && s < end;
    });
  },[events, weekStartDate]);

  const positionForEvent = (ev: EventItem, dayIndex: number) => {
    const start = new Date(ev.start);
    const end = new Date(ev.end);
    const startHour = start.getHours() + start.getMinutes()/60;
    const endHour = end.getHours() + end.getMinutes()/60;
    const topPercent = ((clamp(startHour, HOURS_START, HOURS_END) - HOURS_START) / (HOURS_END - HOURS_START)) * 100;
    const heightPercent = ((clamp(endHour, HOURS_START, HOURS_END) - clamp(startHour, HOURS_START, HOURS_END)) / (HOURS_END - HOURS_START)) * 100;
    const leftPercent = (dayIndex / 7) * 100;
    const widthPercent = (1/7) * 100;
    return { topPercent, heightPercent, leftPercent, widthPercent };
  };

  const importFile = async (file?: File) => {
    if(!file){ toast({ title: 'No file selected' }); return; }
    const text = await file.text();
    if(file.type === 'application/pdf'){ toast({ title: 'PDF uploaded', description: 'PDF received. Manual entry supported.' }); return; }
    // parse CSV: expected headers: course_name,start,end,room,tags,students_count,notes,color
    const lines = text.split(/\r?\n/).filter(Boolean);
    if(lines.length < 2){ toast({ title: 'CSV invalid' }); return; }
    const headers = lines[0].split(',').map(h=>h.trim().toLowerCase());
    const out: EventItem[] = [];
    for(let i=1;i<lines.length;i++){
      const cols = lines[i].split(',');
      const m:any = {};
      headers.forEach((h,idx)=> m[h]= (cols[idx] || '').trim());
      if(!m.course_name || !m.start || !m.end) continue;
      out.push({ id: String(Date.now())+i, course_name: m.course_name, start: m.start, end: m.end, room: m.room, tags: m.tags? m.tags.split('|') : [], students_count: Number(m.students_count)||0, notes: m.notes||'', color: m.color|| undefined });
    }
    setEvents(prev => {
      const merged = [...prev, ...out];
      toast({ title: 'Imported', description: `Imported ${out.length} events` });
      return merged;
    });
  };

  const exportCSV = () => {
    const headers = ['course_name','start','end','room','tags','students_count','notes','color'];
    const rows = events.map(e=> [e.course_name, e.start, e.end, e.room||'', (e.tags||[]).join('|'), String(e.students_count||0), e.notes||'', e.color||''].map(v=>`"${String(v).replace(/"/g,'""')}"`).join(',') );
    const csv = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'schedule_export.csv'; a.click(); URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <main className="max-w-6xl mx-auto p-6">
        <header className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">My Teaching Schedule</h1>
            <p className="text-sm text-muted-foreground">Weekly overview of your teaching commitments</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Label className="whitespace-nowrap">View</Label>
              <Select onValueChange={(v)=>setViewMode(v as any)}>
                <SelectTrigger className="w-40"><SelectValue>{viewMode === 'weekly' ? 'Weekly' : 'Monthly'}</SelectValue></SelectTrigger>
                <SelectContent>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <Label>Go to</Label>
              <Input type="date" value={anchorDate} onChange={(e)=>setAnchorDate(e.target.value)} />
            </div>

            <div className="flex items-center space-x-3">
              <Button variant="ghost" onClick={()=>{ const d = new Date(anchorDate+'T00:00:00'); d.setDate(d.getDate()-7); setAnchorDate(d.toISOString().split('T')[0]); }}>Prev</Button>
              <Button variant="ghost" onClick={()=>{ const d = new Date(); setAnchorDate(d.toISOString().split('T')[0]); }}>Today</Button>
              <Button variant="ghost" onClick={()=>{ const d = new Date(anchorDate+'T00:00:00'); d.setDate(d.getDate()+7); setAnchorDate(d.toISOString().split('T')[0]); }}>Next</Button>
            </div>

            <div className="flex items-center gap-3">
              <Avatar className="w-10 h-10"><AvatarImage src="/placeholder.svg" alt="faculty" /><AvatarFallback>F</AvatarFallback></Avatar>
              <div className="text-right">
                <div className="font-medium">Faculty Name</div>
                <div className="text-sm text-muted-foreground">Department</div>
              </div>
            </div>
          </div>
        </header>

        <section className="grid grid-cols-12 gap-6">
          <aside className={`col-span-3 ${filtersOpen? '':'hidden'} lg:block`}>
            <Card>
              <CardHeader>
                <CardTitle>Filters</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <Label>Course</Label>
                    <Input placeholder="Filter by course" />
                  </div>
                  <div>
                    <Label>Batch</Label>
                    <Input placeholder="Filter by batch" />
                  </div>
                  <div>
                    <Label>Room</Label>
                    <Input placeholder="Room" />
                  </div>
                  <div>
                    <Label>Type</Label>
                    <Select>
                      <SelectTrigger className="w-full"><SelectValue>Any</SelectValue></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="any">Any</SelectItem>
                        <SelectItem value="lecture">Lecture</SelectItem>
                        <SelectItem value="lab">Lab</SelectItem>
                        <SelectItem value="seminar">Seminar</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex justify-between pt-4">
                    <Button variant="ghost" onClick={()=>setFiltersOpen(f=>!f)}>{filtersOpen? 'Hide':'Show'} Filters</Button>
                    <Button onClick={()=>{ setEvents([]); toast({ title: 'Cleared', description: 'Cleared local schedule (not persisted).' }) }}>Clear</Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="mt-4">
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-2">
                  <label className="text-sm">Import CSV / PDF</label>
                  <input type="file" accept="text/csv,application/pdf" onChange={(e)=>importFile(e.target.files?.[0])} />
                  <div className="flex gap-2 mt-3">
                    <Button onClick={exportCSV}>Export CSV</Button>
                    <Button variant="ghost">Sync Calendar</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </aside>

          <div className="col-span-12 lg:col-span-9">
            <Card>
              <CardHeader>
                <CardTitle>{viewMode === 'weekly' ? 'Weekly View' : 'Monthly View'}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className={`transition-all duration-300 ${viewMode === 'weekly' ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'}`} aria-live="polite">
                {viewMode === 'weekly' ? (
                  <div className="w-full overflow-auto border rounded-md bg-white" style={{ height: '720px' }}>
                    <div className="grid grid-cols-8 sticky top-0 bg-white z-10">
                      <div className="border-r p-2 text-sm text-muted-foreground">Time</div>
                      {weekDays.map((d,idx)=> (
                        <div key={idx} className="border-r p-2 text-center font-medium">{daysOfWeek[idx]} <div className="text-xs text-muted-foreground">{d.toLocaleDateString()}</div></div>
                      ))}
                    </div>

                    <div className="relative" style={{ height: '100%', minHeight: '640px' }}>
                      {/* time grid */}
                      <div className="absolute left-0 top-0 right-0 bottom-0 grid grid-cols-8">
                        <div className="border-r" />
                        {Array.from({length:7}).map((_,i)=> <div key={i} className="border-r" />)}
                      </div>

                      <div className="absolute left-0 top-0 right-0 bottom-0 grid grid-cols-1" style={{ pointerEvents: 'none' }}>
                        <div className="h-12 grid grid-cols-1"></div>
                        {/* hours rows */}
                        <div className="flex flex-col">
                          {Array.from({length: (HOURS_END-HOURS_START)}).map((_,hi)=> (
                            <div key={hi} className="flex">
                              <div className="w-1/8 hidden md:block border-t text-xs text-muted-foreground" style={{ width: '12%' }}>{HOURS_START+hi}:00</div>
                              <div className="flex-1 border-t" style={{ minHeight: '54px' }} />
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* events layer */}
                      <div className="absolute left-0 top-0 right-0 bottom-0">
                        {weekDays.map((d, dayIdx)=> (
                          <div key={dayIdx} className="absolute" style={{ left: `${(dayIdx/7)*100}%`, width: `${100/7}%`, top: '0', bottom: 0 }}>
                            {eventsThisWeek.filter(ev => new Date(ev.start).getDate() === d.getDate()).map(ev=>{
                              const pos = positionForEvent(ev, dayIdx);
                              return (
                                <div key={ev.id} role="button" tabIndex={0} onKeyDown={(e)=>{ if(e.key==='Enter' || e.key===' ') { e.preventDefault(); toast({ title: ev.course_name, description: `${new Date(ev.start).toLocaleTimeString()} - ${new Date(ev.end).toLocaleTimeString()} ${ev.room? ' • '+ev.room: ''}`, }); } }} aria-label={`${ev.course_name} from ${new Date(ev.start).toLocaleTimeString()} to ${new Date(ev.end).toLocaleTimeString()} in ${ev.room || 'unknown'}`} className="absolute rounded-md p-2 text-sm text-white shadow-md focus:outline-none focus:ring-2 focus:ring-offset-1" style={{ top: `${pos.topPercent}%`, height: `${pos.heightPercent}%`, left: '4%', width: '92%', background: ev.color || '#3b82f6', transition: 'transform 180ms ease, opacity 180ms ease' }} title={`${ev.course_name} - ${new Date(ev.start).toLocaleTimeString()} - ${ev.room||''}`}>
                                  <div className="font-semibold">{ev.course_name}</div>
                                  <div className="text-xs">{new Date(ev.start).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - {new Date(ev.end).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
                                  <div className="text-xs">{ev.room}</div>
                                </div>
                              )
                            })}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="w-full overflow-auto bg-white border rounded-md p-4">
                    {/* Monthly grid */}
                    <div className="grid grid-cols-7 gap-2">
                      {Array.from({length:42}).map((_,i)=>{
                        const day = new Date(weekStartDate);
                        day.setDate(weekStartDate.getDate() + i - (weekStartDate.getDay() === 0 ? 6 : weekStartDate.getDay()-1));
                        const dayEvents = events.filter(ev => new Date(ev.start).toDateString() === day.toDateString());
                        return (
                          <div key={i} className="border p-2 min-h-[80px]">
                            <div className="text-xs font-medium mb-2">{day.getDate()}</div>
                            <div className="flex flex-col gap-1">
                              {dayEvents.slice(0,3).map(ev=> (
                                <div key={ev.id} role="button" tabIndex={0} onKeyDown={(e)=>{ if(e.key==='Enter'||e.key===' '){ e.preventDefault(); toast({ title: ev.course_name, description: `${new Date(ev.start).toLocaleTimeString()} - ${new Date(ev.end).toLocaleTimeString()}` }); } }} aria-label={`${ev.course_name} at ${new Date(ev.start).toLocaleTimeString()}`} className="rounded px-2 py-1 text-xs text-white focus:outline-none focus:ring-2" style={{ background: ev.color || '#06b6d4' }}>
                                  <div className="font-semibold">{ev.course_name}</div>
                                  <div className="text-[11px]">{new Date(ev.start).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
                                </div>
                              ))}
                              {dayEvents.length>3 && <div className="text-xs text-muted-foreground">+{dayEvents.length-3} more</div>}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>
    </div>
  );
};

export default FacultySchedule;
