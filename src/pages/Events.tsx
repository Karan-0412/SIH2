import React, { useMemo, useState } from 'react';
import Navbar from '@/components/layout/Navbar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { useEvents } from '@/hooks/useEvents';
import { useProfile } from '@/hooks/useProfile';
import { Link } from 'react-router-dom';
import { Plus, Trash2, CalendarClock, MapPin, User2, Search, Filter, Flame, Sparkles } from 'lucide-react';

export default function EventsPage() {
  const { events, addEvent, removeEvent } = useEvents();
  const { profile } = useProfile();

  const isFaculty = profile?.role === 'faculty';
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    title: '',
    shortDescription: '',
    description: '',
    category: 'academic' as 'academic' | 'co_curricular' | 'outside_university',
    date: '',
    venue: '',
    organizer: '',
    bannerUrl: '',
    durationHours: 2,
  });

  // Top search bar filters
  const [q, setQ] = useState('');
  const [cat, setCat] = useState<'all' | 'academic' | 'co_curricular' | 'outside_university'>('all');
  const [dateFrom, setDateFrom] = useState<string>('');
  const [dateTo, setDateTo] = useState<string>('');
  const [loc, setLoc] = useState('');
  const [dur, setDur] = useState<[number, number]>([0, 8]);

  const filtered = useMemo(() => {
    return events.filter((e) => {
      const nameOk = !q || e.title.toLowerCase().includes(q.toLowerCase());
      const catOk = cat === 'all' || e.category === cat;
      const locOk = !loc || e.venue.toLowerCase().includes(loc.toLowerCase());
      const d = new Date(e.date).getTime();
      const fromOk = !dateFrom || d >= new Date(dateFrom).getTime();
      const toOk = !dateTo || d <= new Date(dateTo).getTime();
      const durOk = e.durationHours == null || (e.durationHours >= dur[0] && e.durationHours <= dur[1]);
      return nameOk && catOk && locOk && fromOk && toOk && durOk;
    });
  }, [events, q, cat, loc, dateFrom, dateTo, dur]);

  const featured = filtered.slice(0, Math.min(6, filtered.length));

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.shortDescription || !form.description || !form.date || !form.venue || !form.organizer) return;
    const id = addEvent({ ...form });
    setOpen(false);
    setForm({ title: '', shortDescription: '', description: '', category: 'academic', date: '', venue: '', organizer: '', bannerUrl: '', durationHours: 2 });
    window.location.href = `/events/${id}`;
  };

  const SearchBar = () => (
    <div className="rounded-2xl border bg-white p-3 shadow-sm">
      <div className="flex flex-col gap-3 md:flex-row md:items-center">
        <div className="relative md:flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input className="pl-9" placeholder="Search events by name" value={q} onChange={(e)=>setQ(e.target.value)} />
        </div>
        <div>
          <select className="w-full md:w-48 rounded-md border border-input bg-background px-3 py-2 text-sm" value={cat} onChange={(e)=>setCat(e.target.value as any)}>
            <option value="all">All Categories</option>
            <option value="academic">Academic</option>
            <option value="co_curricular">Co-Curricular</option>
            <option value="outside_university">Outside University</option>
          </select>
        </div>
        <div>
          <Input type="date" value={dateFrom} onChange={(e)=>setDateFrom(e.target.value)} />
        </div>
        <div>
          <Input type="text" placeholder="Location" value={loc} onChange={(e)=>setLoc(e.target.value)} />
        </div>
        <Button variant="secondary" className="gap-2"><Filter className="h-4 w-4" /> Filters</Button>
      </div>
    </div>
  );

  const EventCard = ({ id, bannerUrl, title, shortDescription, date, venue, organizer }: any) => (
    <Card className="group overflow-hidden border border-gray-200/70 hover:border-gray-300 transition-all duration-300 hover:shadow-xl rounded-2xl bg-white">
      <div className="relative h-40 w-full overflow-hidden">
        <img src={bannerUrl || '/placeholder.svg'} alt={title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
      </div>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold tracking-tight">{title}</CardTitle>
        <CardDescription>{shortDescription}</CardDescription>
      </CardHeader>
      <CardContent className="pt-0 space-y-3">
        <div className="flex flex-col gap-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-2"><CalendarClock className="h-4 w-4" /> {new Date(date).toLocaleString()}</div>
          <div className="flex items-center gap-2"><MapPin className="h-4 w-4" /> {venue}</div>
          <div className="flex items-center gap-2"><User2 className="h-4 w-4" /> {organizer}</div>
        </div>
        <div className="flex items-center justify-between pt-2">
          <Link to={`/events/${id}`} className="w-full">
            <Button className="w-full transition-all duration-300 hover:-translate-y-0.5">Register Now</Button>
          </Link>
        </div>
        <div className="flex items-center justify-between rounded-md border bg-gray-50 px-3 py-2">
          <div className="flex items-center gap-2 text-sm">
            <Switch id={`remind-${id}`} />
            <label htmlFor={`remind-${id}`} className="text-sm text-muted-foreground">Remind me</label>
          </div>
          <div className="w-32">
            <Slider defaultValue={[50]} max={100} step={10} aria-label="interest" />
          </div>
        </div>
        {isFaculty && (
          <Button variant="ghost" size="icon" aria-label="Delete" onClick={() => removeEvent(id)} className="text-red-600 hover:text-red-700 hover:bg-red-50">
            <Trash2 className="h-5 w-5" />
          </Button>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      <Navbar />
      <main className="max-w-7xl mx-auto p-6 space-y-10">
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1">
            <SearchBar />
          </div>
          {isFaculty && (
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2"><Plus className="h-4 w-4" /> Add Event</Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                  <DialogTitle>Add New Event</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleAdd} className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="title">Title</Label>
                      <Input id="title" value={form.title} onChange={(e)=>setForm(v=>({...v, title: e.target.value}))} required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="category">Category</Label>
                      <select id="category" className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={form.category} onChange={(e)=>setForm(v=>({...v, category: e.target.value as any}))}>
                        <option value="academic">Academic</option>
                        <option value="co_curricular">Co-Curricular</option>
                        <option value="outside_university">Outside University</option>
                      </select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="short">Short Description</Label>
                    <Input id="short" value={form.shortDescription} onChange={(e)=>setForm(v=>({...v, shortDescription: e.target.value}))} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="desc">Detailed Description</Label>
                    <Textarea id="desc" value={form.description} onChange={(e)=>setForm(v=>({...v, description: e.target.value}))} required />
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="date">Date & Time</Label>
                      <Input id="date" type="datetime-local" value={form.date} onChange={(e)=>setForm(v=>({...v, date: e.target.value}))} required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="venue">Venue</Label>
                      <Input id="venue" value={form.venue} onChange={(e)=>setForm(v=>({...v, venue: e.target.value}))} required />
                    </div>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="organizer">Organizer</Label>
                      <Input id="organizer" value={form.organizer} onChange={(e)=>setForm(v=>({...v, organizer: e.target.value}))} required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="banner">Banner Image URL</Label>
                      <Input id="banner" placeholder="https://..." value={form.bannerUrl} onChange={(e)=>setForm(v=>({...v, bannerUrl: e.target.value}))} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="duration">Duration (hours)</Label>
                    <Input id="duration" type="number" min={0.5} step={0.5} value={form.durationHours} onChange={(e)=>setForm(v=>({...v, durationHours: Number(e.target.value)}))} />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={()=>setOpen(false)}>Cancel</Button>
                    <Button type="submit">Create</Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          )}
        </div>

        {/* Hero Section */}
        <section className="relative overflow-hidden rounded-3xl bg-black text-white">
          <img src="https://images.unsplash.com/photo-1518600506278-4e8ef466b810?q=80&w=1600&auto=format&fit=crop" alt="Hero" className="absolute inset-0 h-full w-full object-cover opacity-60" />
          <div className="relative grid gap-6 p-8 sm:p-12 lg:grid-cols-2">
            <div className="space-y-4">
              <Badge variant="secondary" className="bg-white/90 text-black">Premium</Badge>
              <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">Discover World-Class Events</h1>
              <p className="text-white/90 text-lg">Curated academic and co‑curricular experiences with a luxury touch.</p>
              <a href="#explore">
                <Button size="lg" className="mt-2 bg-white text-black hover:bg-white/90 transition-all duration-300 hover:-translate-y-0.5">Register Now</Button>
              </a>
            </div>

            <div className="lg:pl-8">
              <div className="rounded-2xl bg-white p-5 shadow-2xl ring-1 ring-black/5">
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label>Event Type</Label>
                      <select className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={cat} onChange={(e)=>setCat(e.target.value as any)}>
                        <option value="all">All</option>
                        <option value="academic">Academic</option>
                        <option value="co_curricular">Co-Curricular</option>
                        <option value="outside_university">Outside University</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <Label>Location</Label>
                      <Input placeholder="City or venue" value={loc} onChange={(e)=>setLoc(e.target.value)} />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label>From</Label>
                      <Input type="date" value={dateFrom} onChange={(e)=>setDateFrom(e.target.value)} />
                    </div>
                    <div className="space-y-1">
                      <Label>To</Label>
                      <Input type="date" value={dateTo} onChange={(e)=>setDateTo(e.target.value)} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Duration</Label>
                    <Slider value={dur} onValueChange={(v)=>setDur(v as [number, number])} min={0} max={8} step={0.5} />
                    <div className="text-xs text-muted-foreground">{dur[0]}h – {dur[1]}h</div>
                  </div>
                  <Button className="w-full gap-2"><Search className="h-4 w-4" /> Search Event</Button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Limited-time Promo */}
        <section className="rounded-2xl bg-gradient-to-r from-amber-100 via-white to-amber-100 border p-6 sm:p-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <Flame className="h-6 w-6 text-amber-600" />
            <h2 className="text-2xl font-semibold tracking-tight">Early-bird registrations are live</h2>
          </div>
          <p className="text-muted-foreground max-w-xl">
            Save your spot for premium experiences. Limited seats available for select events.
          </p>
          <a href="#explore"><Button>Register Now</Button></a>
        </section>

        {/* Featured Carousel */}
        {featured.length > 0 && (
          <section aria-label="Featured events" className="relative">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-xl font-semibold tracking-tight">Featured</h3>
              <div className="text-sm text-muted-foreground">Top picks for you</div>
            </div>
            <Carousel opts={{ align: 'start' }}>
              <CarouselContent>
                {featured.map((ev) => (
                  <CarouselItem key={ev.id} className="md:basis-1/2 lg:basis-1/3">
                    <EventCard {...ev} />
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious />
              <CarouselNext />
            </Carousel>
          </section>
        )}

        {/* Explore Grid */}
        <section id="explore" className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight">Explore Events</h2>
              <p className="text-muted-foreground">Refine with filters to find your perfect match</p>
            </div>
            <div className="hidden sm:flex items-center gap-2 text-amber-600">
              <Sparkles className="h-4 w-4" /> Luxury-curated experience
            </div>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((ev) => (
              <EventCard key={ev.id} {...ev} />
            ))}
          </div>
        </section>

        {/* Bottom Promos */}
        <section className="grid gap-6 md:grid-cols-2">
          <Card className="relative overflow-hidden rounded-3xl border bg-white">
            <img src="https://images.unsplash.com/photo-1529336953121-c9e3f9a8ed3a?q=80&w=1600&auto=format&fit=crop" alt="Promo" className="absolute inset-0 h-full w-full object-cover opacity-20" />
            <CardContent className="p-6 relative">
              <Badge className="mb-3">Trending</Badge>
              <h3 className="text-xl font-semibold tracking-tight">Hands-on AI Workshop</h3>
              <p className="text-muted-foreground">Get practical with guided labs and expert mentors.</p>
              <div className="mt-4"><Button variant="secondary">Register</Button></div>
            </CardContent>
          </Card>
          <Card className="relative overflow-hidden rounded-3xl border bg-white">
            <img src="https://images.unsplash.com/photo-1483058712412-4245e9b90334?q=80&w=1600&auto=format&fit=crop" alt="Promo" className="absolute inset-0 h-full w-full object-cover opacity-20" />
            <CardContent className="p-6 relative">
              <Badge variant="destructive" className="mb-3">Hot</Badge>
              <h3 className="text-xl font-semibold tracking-tight">Cultural Night VIP</h3>
              <p className="text-muted-foreground">Exclusive seating and backstage access.</p>
              <div className="mt-4"><Button variant="secondary">Register</Button></div>
            </CardContent>
          </Card>
        </section>
      </main>
    </div>
  );
}
