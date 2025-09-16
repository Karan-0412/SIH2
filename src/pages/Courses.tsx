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

const CoursesPage: React.FC = () => {
  const { toast } = useToast();

  const [courseName, setCourseName] = useState('');
  const [courseCode, setCourseCode] = useState('');
  const [facultyId, setFacultyId] = useState<string | null>(null);
  const [tags, setTags] = useState<string[]>([]);
  const [description, setDescription] = useState('');
  const [deadline, setDeadline] = useState('');
  const [creditHours, setCreditHours] = useState<string>('');
  const [syllabusFile, setSyllabusFile] = useState<File | null>(null);
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
  }, []);

  const todayISO = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d.toISOString().split('T')[0];
  }, []);

  const toggleTag = (tag: string) => {
    setTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]));
  };

  const validate = async () => {
    const e: Record<string, string> = {};
    if (!courseName.trim()) e.courseName = 'Course name is required.';
    if (!courseCode.trim()) e.courseCode = 'Course code is required.';
    if (!facultyId) e.faculty = 'Faculty is required.';
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

  const handleFileChange = (file?: File) => {
    if (!file) {
      setSyllabusFile(null);
      return;
    }
    if (file.type !== 'application/pdf') {
      setErrors((prev) => ({ ...prev, syllabus: 'Only PDF files are allowed.' }));
      setSyllabusFile(null);
      return;
    }
    setErrors((prev) => { const c = { ...prev }; delete c.syllabus; return c; });
    setSyllabusFile(file);
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
      const ok = await validate();
      if (!ok) { setSubmitting(false); return; }

      // upload syllabus if provided
      let syllabus_url: string | null = null;
      if (syllabusFile) {
        try {
          const filePath = `syllabi/${courseCode.trim()}_${Date.now()}.pdf`;
          const { error: upErr } = await supabase.storage.from('syllabi').upload(filePath, syllabusFile, { upsert: false });
          if (upErr) {
            console.error('Error uploading syllabus', upErr);
            toast({ title: 'Syllabus upload failed', description: (upErr as any)?.message ?? 'Could not upload file', });
          } else {
            const { data } = supabase.storage.from('syllabi').getPublicUrl(filePath);
            syllabus_url = data?.publicUrl ?? null;
          }
        } catch (err) {
          console.error('Syllabus upload error', err);
          toast({ title: 'Syllabus upload failed', description: 'Network error while uploading syllabus.' });
        }
      }

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
        faculty_id: facultyId,
        tags,
        description: description || null,
        deadline: deadline,
        credit_hours: creditHours ? Number(creditHours) : null,
        syllabus_url,
        thumbnail_url,
        external_link: externalLink || null,
      } as any;

      const { data, error } = await supabase.from('courses').insert(payload).select().maybeSingle();
      if (error) {
        // handle unique constraint race
        const msg = (error as any)?.message ?? '';
        if (msg.includes('duplicate key') || msg.includes('already exists')) {
          setErrors({ courseCode: 'Course code must be unique. A course with this code already exists.' });
          toast({ title: 'Validation error', description: 'Course code already exists.' });
        } else {
          console.error('Error creating course', error);
          toast({ title: 'Error', description: 'Could not create course.' });
        }
      } else {
        toast({ title: 'Course created', description: 'Course was created successfully.' });
        // reset form
        setCourseName(''); setCourseCode(''); setFacultyId(null); setTags([]); setDescription(''); setDeadline(''); setCreditHours(''); setSyllabusFile(null); setErrors({});
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <main className="max-w-4xl mx-auto p-6">
        <h1 className="text-2xl font-bold mb-4">Create Course</h1>
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
            <Label>Upload Syllabus (PDF)</Label>
            <input accept="application/pdf" type="file" onChange={(e)=>handleFileChange(e.target.files?.[0])} />
            {errors.syllabus && <p className="text-sm text-red-600 mt-1">{errors.syllabus}</p>}
            {syllabusFile && <p className="text-sm text-muted-foreground mt-1">Selected: {syllabusFile.name}</p>}
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
            <Button variant="ghost" onClick={() => { setCourseName(''); setCourseCode(''); setFacultyId(null); setTags([]); setDescription(''); setDeadline(''); setCreditHours(''); setSyllabusFile(null); setErrors({}); }}>
              Reset
            </Button>
            <Button type="submit" disabled={submitting}>{submitting ? 'Saving...' : 'Create Course'}</Button>
          </div>
        </form>
      </main>
    </div>
  );
};

export default CoursesPage;
