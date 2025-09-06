import React, { useMemo, useState } from 'react';
import Navbar from '@/components/layout/Navbar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useEvents } from '@/hooks/useEvents';
import { useProfile } from '@/hooks/useProfile';
import { Link } from 'react-router-dom';
import { Plus, Trash2, CalendarClock, MapPin, User2 } from 'lucide-react';

export default function EventsPage() {
  const { byCategory, addEvent, removeEvent } = useEvents();
  const { profile } = useProfile();

  const isFaculty = profile?.role === 'faculty';
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    title: '',
    shortDescription: '',
    description: '',
    category: 'academic' as 'academic' | 'co_curricular',
    date: '',
    venue: '',
    organizer: '',
    bannerUrl: '',
  });

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.shortDescription || !form.description || !form.date || !form.venue || !form.organizer) return;
    const id = addEvent({ ...form });
    setOpen(false);
    setForm({ title: '', shortDescription: '', description: '', category: 'academic', date: '', venue: '', organizer: '', bannerUrl: '' });
    // redirect to detail after creating
    window.location.href = `/events/${id}`;
  };

  const Section = ({ title, items }: { title: string; items: ReturnType<typeof useEvents>['byCategory']['academic'] }) => (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold tracking-tight">{title}</h2>
      </div>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((ev) => (
          <Card key={ev.id} className="group overflow-hidden border border-gray-200/70 hover:border-gray-300 transition-all duration-300 hover:shadow-xl rounded-xl bg-white">
            <div className="relative h-40 w-full overflow-hidden">
              <img src={ev.bannerUrl || '/placeholder.svg'} alt={ev.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
            </div>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">{ev.title}</CardTitle>
              <CardDescription>{ev.shortDescription}</CardDescription>
            </CardHeader>
            <CardContent className="pt-0 space-y-3">
              <div className="flex flex-col gap-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-2"><CalendarClock className="h-4 w-4" /> {new Date(ev.date).toLocaleString()}</div>
                <div className="flex items-center gap-2"><MapPin className="h-4 w-4" /> {ev.venue}</div>
                <div className="flex items-center gap-2"><User2 className="h-4 w-4" /> {ev.organizer}</div>
              </div>
              <div className="flex items-center justify-between pt-2">
                <Link to={`/events/${ev.id}`} className="w-full">
                  <Button className="w-full transition-all duration-300 hover:-translate-y-0.5">Register Now</Button>
                </Link>
                {isFaculty && (
                  <Button variant="ghost" size="icon" aria-label="Delete" onClick={() => removeEvent(ev.id)} className="ml-2 text-red-600 hover:text-red-700 hover:bg-red-50">
                    <Trash2 className="h-5 w-5" />
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );

  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      <Navbar />
      <main className="max-w-7xl mx-auto p-6 space-y-10">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Events</h1>
            <p className="text-muted-foreground">Discover and register for upcoming events</p>
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
                  <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={()=>setOpen(false)}>Cancel</Button>
                    <Button type="submit">Create</Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          )}
        </div>

        <Section title="Academic Events" items={byCategory.academic} />
        <Section title="Co-Curricular Events" items={byCategory.co_curricular} />
      </main>
    </div>
  );
}
