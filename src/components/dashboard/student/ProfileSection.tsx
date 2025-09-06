import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useProfile, Profile } from '@/hooks/useProfile';
import { useToast } from '@/hooks/use-toast';
import { Edit, GraduationCap, Award, TrendingUp, Github, Linkedin, Link as LinkIcon, Download } from 'lucide-react';

interface ProfileSectionProps {
  certificates: Array<{
    id: string;
    status: 'pending' | 'approved' | 'rejected';
  }>;
}

const ProfileSection: React.FC<ProfileSectionProps> = ({ certificates }) => {
  const { profile, updateProfile } = useProfile();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [githubUrl, setGithubUrl] = useState('');
  const [customLinks, setCustomLinks] = useState<Array<{ label: string; url: string }>>([]);
  const [newCustomLabel, setNewCustomLabel] = useState('');
  const [newCustomUrl, setNewCustomUrl] = useState('');
  const [editForm, setEditForm] = useState({
    full_name: profile?.full_name || '',
    email: profile?.email || '',
  });
  const [extras, setExtras] = useState({ avatarUrl: '', linkedin: '', github: '', twitter: '', website: '' });
  const [pendingExtras, setPendingExtras] = useState({ avatarUrl: '', linkedin: '', github: '', twitter: '', website: '' });

  const totalCertificates = certificates.length;
  const approvedCertificates = certificates.filter(cert => cert.status === 'approved').length;
  const pendingCertificates = certificates.filter(cert => cert.status === 'pending').length;
  const progressPercentage = totalCertificates > 0 ? Math.round((approvedCertificates / totalCertificates) * 100) : 0;

  useEffect(() => {
    if (!profile) return;
    try {
      const saved = localStorage.getItem(`profileExtras:${profile.id}`);
      if (saved) {
        const parsed = JSON.parse(saved);
        setExtras({
          avatarUrl: parsed.avatarUrl || '',
          linkedin: parsed.linkedin || '',
          github: parsed.github || '',
          twitter: parsed.twitter || '',
          website: parsed.website || ''
        });
      } else {
        setExtras({ avatarUrl: '', linkedin: '', github: '', twitter: '', website: '' });
      }
    } catch {}
  }, [profile?.id]);

  useEffect(() => {
    if (isEditing) {
      setPendingExtras(extras);
    }
  }, [isEditing, extras]);

  const handleSaveProfile = async () => {
    if (!profile) return;

    const { error } = await updateProfile({ full_name: editForm.full_name, email: editForm.email });
    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to update profile',
        variant: 'destructive',
      });
    } else {
      try {
        localStorage.setItem(`profileExtras:${profile.id}`, JSON.stringify(pendingExtras));
        setExtras(pendingExtras);
      } catch {}
      toast({
        title: 'Success',
        description: 'Profile updated successfully',
      });
      setIsEditing(false);
    }
  };

  if (!profile) return null;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-6">
        <CardTitle className="text-xl font-bold">Profile Overview</CardTitle>
        <div className="flex items-center gap-2">
          <Button size="sm" onClick={() => setIsProfileOpen(true)}>PROFILE</Button>
          <Dialog open={isEditing} onOpenChange={setIsEditing}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Edit className="h-4 w-4 mr-2" />
                Edit Profile
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit Profile</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="full_name">Full Name</Label>
                  <Input
                    id="full_name"
                    value={editForm.full_name}
                    onChange={(e) => setEditForm({ ...editForm, full_name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={editForm.email}
                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Profile Photo</Label>
                  <div className="flex items-center gap-4">
                    <Avatar className="h-16 w-16">
                      <AvatarImage src={pendingExtras.avatarUrl} alt={editForm.full_name} />
                      <AvatarFallback>
                        {profile.full_name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        const reader = new FileReader();
                        reader.onload = () => setPendingExtras({ ...pendingExtras, avatarUrl: String(reader.result) });
                        reader.readAsDataURL(file);
                      }}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Social Links</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <Input placeholder="LinkedIn URL" value={pendingExtras.linkedin} onChange={(e)=>setPendingExtras({ ...pendingExtras, linkedin: e.target.value })} />
                    <Input placeholder="GitHub URL" value={pendingExtras.github} onChange={(e)=>setPendingExtras({ ...pendingExtras, github: e.target.value })} />
                    <Input placeholder="Twitter URL" value={pendingExtras.twitter} onChange={(e)=>setPendingExtras({ ...pendingExtras, twitter: e.target.value })} />
                    <Input placeholder="Website URL" value={pendingExtras.website} onChange={(e)=>setPendingExtras({ ...pendingExtras, website: e.target.value })} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Student ID</Label>
                  <Input value={profile.student_id || 'Not assigned'} disabled />
                  <p className="text-sm text-muted-foreground">Student ID cannot be modified</p>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setIsEditing(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleSaveProfile}>
                    Save Changes
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center space-x-4">
          <Avatar className="h-20 w-20">
            <AvatarImage src={extras.avatarUrl} alt={profile.full_name} />
            <AvatarFallback className="text-lg">
              {profile.full_name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <h3 className="text-lg font-semibold">{profile.full_name}</h3>
            <p className="text-muted-foreground">{profile.email}</p>
            <div className="flex items-center space-x-2 mt-1">
              <Badge variant="secondary">
                <GraduationCap className="h-3 w-3 mr-1" />
                {profile.role}
              </Badge>
              {profile.student_id && (
                <Badge variant="outline">ID: {profile.student_id}</Badge>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-4 bg-muted/30 rounded-lg">
            <div className="text-2xl font-bold text-primary">{totalCertificates}</div>
            <p className="text-sm text-muted-foreground">Total Certificates</p>
          </div>
          <div className="text-center p-4 bg-muted/30 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{approvedCertificates}</div>
            <p className="text-sm text-muted-foreground">Verified</p>
          </div>
          <div className="text-center p-4 bg-muted/30 rounded-lg">
            <div className="text-2xl font-bold text-yellow-600">{pendingCertificates}</div>
            <p className="text-sm text-muted-foreground">Pending</p>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Progress</span>
            <span className="text-sm text-muted-foreground">{progressPercentage}%</span>
          </div>
          <Progress value={progressPercentage} className="h-2" />
        </div>
      </CardContent>

      <Dialog open={isProfileOpen} onOpenChange={setIsProfileOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle>Profile Details</DialogTitle>
              <Button size="sm" onClick={() => {
                const normalize = (u:string) => (u && !/^https?:\/\//i.test(u) ? `https://${u}` : u);
                const links = [
                  ...(extras.linkedin ? [{ label: 'LinkedIn', url: normalize(extras.linkedin) }] : []),
                  ...(extras.github ? [{ label: 'GitHub', url: normalize(extras.github) }] : []),
                  ...(extras.twitter ? [{ label: 'Twitter', url: normalize(extras.twitter) }] : []),
                  ...(extras.website ? [{ label: 'Website', url: normalize(extras.website) }] : []),
                  ...customLinks.map(l => ({ label: l.label, url: normalize(l.url) })),
                ];
                const doc = window.open('', '_blank');
                if (!doc) return;
                const styles = `body{font-family:system-ui,-apple-system,Segoe UI,Roboto,Ubuntu,Cantarell,Noto Sans,sans-serif;padding:24px;color:#111} h1{margin:0 0 4px} h2{margin:24px 0 8px;font-size:16px} .kpis{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:12px} .kpi{padding:12px;border:1px solid #e5e7eb;border-radius:8px;text-align:center} table{width:100%;border-collapse:collapse;margin-top:8px} th,td{border:1px solid #e5e7eb;padding:8px;text-align:left} .muted{color:#6b7280}`;
                const kpiHtml = `
                  <div class="kpis">
                    <div class="kpi"><div class="muted">Total</div><div><strong>${totalCertificates}</strong></div></div>
                    <div class="kpi"><div class="muted">Approved</div><div><strong>${approvedCertificates}</strong></div></div>
                    <div class="kpi"><div class="muted">Pending</div><div><strong>${pendingCertificates}</strong></div></div>
                    <div class="kpi"><div class="muted">Rejected</div><div><strong>${totalCertificates - approvedCertificates - pendingCertificates}</strong></div></div>
                    <div class="kpi"><div class="muted">Progress</div><div><strong>${progressPercentage}%</strong></div></div>
                  </div>`;
                const linksHtml = links.length ? `<ul>${links.map(l=>`<li><a href="${l.url}" target="_blank" rel="noreferrer noopener">${l.label}: ${l.url}</a></li>`).join('')}</ul>` : '<p class="muted">No links provided</p>';
                const certsHtml = certificates.length ? `<table><thead><tr><th>ID</th><th>Status</th></tr></thead><tbody>${certificates.map(c=>`<tr><td>${c.id}</td><td>${c.status}</td></tr>`).join('')}</tbody></table>` : '<p class="muted">No certificates yet</p>';
                doc.document.write(`<!doctype html><html><head><meta charset="utf-8"/><title>Resume - ${profile.full_name}</title><style>${styles}</style></head><body>
                  <h1>${profile.full_name}</h1>
                  <div class="muted">${profile.email}${profile.student_id ? ' • ' + profile.student_id : ''}</div>
                  <h2>Links</h2>
                  ${linksHtml}
                  <h2>Summary</h2>
                  ${kpiHtml}
                  <h2>Certificates</h2>
                  ${certsHtml}
                </body></html>`);
                doc.document.close();
                doc.focus();
                doc.print();
              }}>
                <Download className="h-4 w-4 mr-2" /> Download PDF
              </Button>
            </div>
          </DialogHeader>
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <Avatar className="h-24 w-24">
                <AvatarImage src={extras.avatarUrl} alt={profile.full_name} />
                <AvatarFallback className="text-xl">
                  {profile.full_name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="text-xl font-semibold">{profile.full_name}</h3>
                <p className="text-sm text-muted-foreground">{profile.email}</p>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="secondary">{profile.role}</Badge>
                  {profile.student_id && <Badge variant="outline">ID: {profile.student_id}</Badge>}
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="text-sm font-medium">Links</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="linkedin">LinkedIn</Label>
                  <div className="flex gap-2">
                    <div className="inline-flex items-center px-2 border rounded-md text-sm text-muted-foreground"><Linkedin className="h-4 w-4 mr-1" />/</div>
                    <Input id="linkedin" placeholder="linkedin.com/in/username" value={extras.linkedin} disabled readOnly />
                  </div>
                </div>
                <div className="space-y-1">
                  <Label htmlFor="github">GitHub</Label>
                  <div className="flex gap-2">
                    <div className="inline-flex items-center px-2 border rounded-md text-sm text-muted-foreground"><Github className="h-4 w-4 mr-1" />/</div>
                    <Input id="github" placeholder="github.com/username" value={extras.github} disabled readOnly />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Custom Links</Label>
                <div className="flex gap-2">
                  <Input placeholder="Label (e.g., Portfolio)" value={newCustomLabel} disabled readOnly />
                  <Input placeholder="https://example.com" value={newCustomUrl} disabled readOnly />
                  <Button type="button" disabled>Add</Button>
                </div>
                {customLinks.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-1">
                    {customLinks.map((l, idx) => (
                      <Button key={idx} variant="secondary" size="sm" asChild>
                        <a href={/^https?:\/\//i.test(l.url) ? l.url : `https://${l.url}`} target="_blank" rel="noreferrer noopener"><LinkIcon className="h-3 w-3 mr-1" />{l.label}</a>
                      </Button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-4 bg-muted/30 rounded-lg">
                <div className="text-2xl font-bold text-primary">{totalCertificates}</div>
                <p className="text-sm text-muted-foreground">Total Certificates</p>
              </div>
              <div className="text-center p-4 bg-muted/30 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{approvedCertificates}</div>
                <p className="text-sm text-muted-foreground">Approved</p>
              </div>
              <div className="text-center p-4 bg-muted/30 rounded-lg">
                <div className="text-2xl font-bold text-yellow-600">{pendingCertificates}</div>
                <p className="text-sm text-muted-foreground">Pending</p>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Progress</span>
                <span className="text-sm text-muted-foreground">{progressPercentage}%</span>
              </div>
              <Progress value={progressPercentage} className="h-2" />
            </div>

            <div className="space-y-3 max-h-96 overflow-auto">
              {certificates.length === 0 ? (
                <div className="text-center py-6 text-muted-foreground">No certificates yet</div>
              ) : (
                certificates.map((cert) => (
                  <div key={cert.id} className="flex items-center justify-between border rounded p-3">
                    <div className="space-y-1">
                      <div className="font-medium">Certificate #{cert.id.slice(0,6)}</div>
                      <div className="text-sm text-muted-foreground">Status: {cert.status}</div>
                    </div>
                    <Badge variant={cert.status==='approved' ? 'default' : cert.status==='pending' ? 'secondary' : 'destructive'} className={cert.status==='pending' ? 'bg-yellow-100 text-yellow-800' : ''}>
                      {cert.status}
                    </Badge>
                  </div>
                ))
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default ProfileSection;
