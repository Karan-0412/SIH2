import React, { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

const TAG_OPTIONS = ['Mandatory', 'Optional', 'Skill-based', 'Elective'] as const;

import { useProfile } from '@/hooks/useProfile';

const CoursesPage: React.FC = () => {
  const { toast } = useToast();
  const { profile } = useProfile();

  const [courses, setCourses] = useState<any[]>([]);
  const [loadingCourses, setLoadingCourses] = useState(false);

  const [courseName, setCourseName] = useState('');
  const [courseCode, setCourseCode] = useState('');
  const [facultyId, setFacultyId] = useState<string | null>(null);
  const [tags, setTags] = useState<string[]>([]);
  const [description, setDescription] = useState('');
  const [deadline, setDeadline] = useState('');
  const [creditHours, setCreditHours] = useState<string>('');
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const [externalLink, setExternalLink] = useState<string>('');

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const [faculties, setFaculties] = useState<Array<{ id: string; full_name: string }>>([]);

  useEffect(() => {
    // fetch faculties list
    (async () => {
      try {
        const { data, error } = await supabase.from('profiles').select('id, full_name').eq('role', 'faculty');
        if (error) {
          console.error('Error loading faculties', error);
        } else if (data) {
          setFaculties(data as any);
        }
      } catch (err) {
        console.error('Error loading faculties', err);
      }
    })();

    // fetch courses
    (async () => {
      setLoadingCourses(true);
      try {
        const { data, error } = await supabase.from('courses').select('*');
        if (error) {
          console.error('Error loading courses', error);
          toast({ title: 'Error loading courses', description: (error as any)?.message ?? JSON.stringify(error), variant: 'destructive' });
        } else if (data) {
          setCourses(data as any[]);
        }
      } catch (err) {
        console.error('Error loading courses', err);
      } finally {
        setLoadingCourses(false);
      }
    })();
  }, [toast]);

  const todayISO = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d.toISOString().split('T')[0];
  }, []);

  const toggleTag = (tag: string) => {
    setTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]));
  };

  const validate = async (effectiveFacultyId?: string | null) => {
    const e: Record<string, string> = {};
    if (!courseName.trim()) e.courseName = 'Course name is required.';
    if (!courseCode.trim()) e.courseCode = 'Course code is required.';
    const fid = effectiveFacultyId ?? facultyId;
    if (!fid) e.faculty = 'Faculty is required.';
    if (!tags.length) e.tags = 'At least one tag is required.';
    if (!deadline) e.deadline = 'Deadline is required.';
    else if (deadline < todayISO) e.deadline = 'Deadline cannot be in the past.';

    // uniqueness check for course code
    if (courseCode.trim()) {
      try {
        const { data: existing, error } = await supabase
          .from('courses')
          .select('id')
          .eq('course_code', courseCode.trim())
          .limit(1)
          .maybeSingle();
        if (error) {
          console.error('Error checking course code uniqueness', error);
        } else if (existing) {
          e.courseCode = 'Course code must be unique. A course with this code already exists.';
        }
      } catch (err) {
        console.error('Error checking course code uniqueness', err);
      }
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  };


  const handleThumbnailChange = (file?: File) => {
    if (!file) {
      setThumbnailFile(null);
      setThumbnailPreview(null);
      return;
    }
    if (!file.type.startsWith('image/')) {
      setErrors((prev) => ({ ...prev, thumbnail: 'Only image files are allowed.' }));
      setThumbnailFile(null);
      setThumbnailPreview(null);
      return;
    }
    setErrors((prev) => { const c = { ...prev }; delete c.thumbnail; return c; });
    setThumbnailFile(file);
    setThumbnailPreview(URL.createObjectURL(file));
  };

  const onSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setSubmitting(true);
    try {
      const effectiveFacultyId = facultyId ?? (profile?.role === 'faculty' ? profile.id : null);
      const ok = await validate(effectiveFacultyId);
      if (!ok) { setSubmitting(false); return; }

      // upload thumbnail if provided
      let thumbnail_url: string | null = null;
      if (thumbnailFile) {
        try {
          const filePath = `thumbnails/${courseCode.trim()}_${Date.now()}`;
          const { error: upErr } = await supabase.storage.from('course_thumbnails').upload(filePath, thumbnailFile, { upsert: false });
          if (upErr) {
            console.error('Error uploading thumbnail', upErr);
            toast({ title: 'Thumbnail upload failed', description: (upErr as any)?.message ?? 'Could not upload file', });
          } else {
            const { data } = supabase.storage.from('course_thumbnails').getPublicUrl(filePath);
            thumbnail_url = data?.publicUrl ?? null;
          }
        } catch (err) {
          console.error('Thumbnail upload error', err);
          toast({ title: 'Thumbnail upload failed', description: 'Network error while uploading thumbnail.' });
        }
      }

      // insert course
      const payload = {
        name: courseName.trim(),
        course_code: courseCode.trim(),
        faculty_id: effectiveFacultyId,
        tags,
        description: description || null,
        deadline: deadline,
        credit_hours: creditHours ? Number(creditHours) : null,
        thumbnail_url,
        external_link: externalLink || null,
      } as any;

      const { data, error } = await supabase.from('courses').insert(payload).select().maybeSingle();
      if (error) {
        // handle unique constraint race
        const msg = (error as any)?.message ?? JSON.stringify(error);
        console.error('Error creating course:', msg, error);
        if (msg.includes('duplicate key') || msg.includes('already exists')) {
          setErrors({ courseCode: 'Course code must be unique. A course with this code already exists.' });
          toast({ title: 'Validation error', description: 'Course code already exists.' });
        } else {
          toast({ title: 'Error creating course', description: msg, variant: 'destructive' });
        }
      } else {
        toast({ title: 'Course created', description: 'Course was created successfully.' });
        // reset form
        setCourseName(''); setCourseCode(''); setFacultyId(null); setTags([]); setDescription(''); setDeadline(''); setCreditHours(''); setThumbnailFile(null); setThumbnailPreview(null); setExternalLink(''); setErrors({});
        // refresh courses
        try {
          const { data: refreshed } = await supabase.from('courses').select('*');
          if (refreshed) setCourses(refreshed as any[]);
        } catch (err) {
          console.error('Error refreshing courses after create', err);
        }
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <main className="max-w-4xl mx-auto p-6">
        <h1 className="text-2xl font-bold mb-4">Courses</h1>

        {profile?.role === 'faculty' && (
        <form onSubmit={onSubmit} className="space-y-6 bg-white p-6 rounded-md shadow-sm">
          <div>
            <Label>Course Name *</Label>
            <Input value={courseName} onChange={(e)=>setCourseName(e.target.value)} placeholder="Introduction to Algorithms" />
            {errors.courseName && <p className="text-sm text-red-600 mt-1">{errors.courseName}</p>}
          </div>

          <div>
            <Label>Course Code *</Label>
            <Input value={courseCode} onChange={(e)=>setCourseCode(e.target.value)} placeholder="CS101" />
            {errors.courseCode && <p className="text-sm text-red-600 mt-1">{errors.courseCode}</p>}
          </div>

          <div>
            <Label>Faculty *</Label>
            <Select onValueChange={(v)=>setFacultyId(v)}>
              <SelectTrigger>
                <SelectValue>{faculties.find(f=>f.id===facultyId)?.full_name ?? 'Select faculty'}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                {faculties.map((f)=> (
                  <SelectItem value={f.id} key={f.id}>{f.full_name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.faculty && <p className="text-sm text-red-600 mt-1">{errors.faculty}</p>}
          </div>

          <div>
            <Label>Tags * (choose one or more)</Label>
            <div className="flex gap-4 flex-wrap mt-2">
              {TAG_OPTIONS.map((t) => (
                <label key={t} className="inline-flex items-center space-x-2">
                  <Checkbox checked={tags.includes(t)} onCheckedChange={() => toggleTag(t)} />
                  <span>{t}</span>
                </label>
              ))}
            </div>
            {errors.tags && <p className="text-sm text-red-600 mt-1">{errors.tags}</p>}
          </div>

          <div>
            <Label>Description</Label>
            <Textarea value={description} onChange={(e)=>setDescription((e.target as HTMLTextAreaElement).value)} placeholder="Optional course description..." />
          </div>

          <div>
            <Label>Deadline *</Label>
            <Input type="date" value={deadline} onChange={(e)=>setDeadline(e.target.value)} min={todayISO} />
            {errors.deadline && <p className="text-sm text-red-600 mt-1">{errors.deadline}</p>}
          </div>

          <div>
            <Label>Credit Hours</Label>
            <Input type="number" min={0} value={creditHours} onChange={(e)=>setCreditHours(e.target.value)} placeholder="e.g. 3" />
          </div>


          <div>
            <Label>Thumbnail (optional)</Label>
            <input accept="image/*" type="file" onChange={(e)=>handleThumbnailChange(e.target.files?.[0])} />
            {errors.thumbnail && <p className="text-sm text-red-600 mt-1">{errors.thumbnail}</p>}
            {thumbnailPreview && <img src={thumbnailPreview} alt="thumbnail preview" className="mt-2 h-16 w-24 object-cover rounded" />}
          </div>

          <div>
            <Label>External Link (optional)</Label>
            <Input type="url" value={externalLink} onChange={(e)=>setExternalLink(e.target.value)} placeholder="https://example.com/course" />
          </div>

          <div className="flex items-center justify-end space-x-3">
            <Button variant="ghost" onClick={() => { setCourseName(''); setCourseCode(''); setFacultyId(null); setTags([]); setDescription(''); setDeadline(''); setCreditHours(''); setThumbnailFile(null); setThumbnailPreview(null); setExternalLink(''); setErrors({}); }}>
              Reset
            </Button>
            <Button type="submit" disabled={submitting}>{submitting ? 'Saving...' : 'Create Course'}</Button>
          </div>
        </form>
        )}

        <section className="mt-8">
          <h2 className="text-lg font-semibold mb-4">Assigned Courses</h2>
          {loadingCourses ? (
            <p>Loading...</p>
          ) : (
            (() => {
              const visibleCourses = courses.filter(c => {
                if (!profile) return false;
                if (profile.role === 'faculty') return c.faculty_id === profile.id;
                const sid = (profile as any).student_id ?? (profile as any).studentId ?? null;
                if (!sid) return false;
                const assigned = (c.assigned_student_ids || c.assigned_students || c.student_ids || c.student_id || '').toString();
                return assigned.includes(String(sid));
              });

              if (!visibleCourses.length) return <p className="text-sm text-muted-foreground">No courses assigned.</p>;

              return (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {visibleCourses.map(c => (
                    <div key={c.id} className="border rounded-md bg-white p-4 flex gap-4 items-center">
                      {c.thumbnail_url ? <img src={c.thumbnail_url} alt={c.name} className="h-16 w-24 object-cover rounded" /> : <div className="h-16 w-24 bg-gray-200 rounded" />}
                      <div className="flex-1">
                        <div className="font-semibold">{c.name} <span className="text-xs text-muted-foreground ml-2">{c.course_code}</span></div>
                        <div className="text-sm text-muted-foreground">{c.description}</div>
                        {c.external_link && <a href={c.external_link} target="_blank" rel="noreferrer" className="text-sm text-primary underline">Open</a>}
                      </div>
                    </div>
                  ))}
                </div>
              );
            })()
          )}
        </section>
      </main>
    </div>
  );
};

export default CoursesPage;
