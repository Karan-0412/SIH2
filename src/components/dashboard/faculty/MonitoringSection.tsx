import React, { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Download, AlertTriangle, BarChart3, PieChart, LineChart } from 'lucide-react';
import {
  BarChart as RBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  LineChart as RLineChart,
  Line,
  PieChart as RPieChart,
  Pie,
  Cell,
  ResponsiveContainer
} from 'recharts';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

const PLATFORM_OPTIONS = [
  { key: 'leetcode', label: 'LeetCode' },
  { key: 'codeforces', label: 'Codeforces' },
  { key: 'coursera', label: 'Coursera' },
  { key: 'youtube', label: 'YouTube' },
  { key: 'udemy', label: 'Udemy' },
  { key: 'edx', label: 'edX' }
];

interface Row {
  platform: string;
  studentId: string;
  gender: 'male' | 'female' | 'other';
  section?: string;
  klass?: string;
}

const MonitoringSection: React.FC = () => {
  const [selected, setSelected] = useState<string[]>(['leetcode']);
  const [rows, setRows] = useState<Row[]>([{ platform: 'leetcode', studentId: '', gender: 'male', section: '', klass: '' }]);
  const [filterPlatform, setFilterPlatform] = useState<string>('all');
  const [filterStudent, setFilterStudent] = useState<string>('all');
  const [genderFilter, setGenderFilter] = useState<'all' | 'male' | 'female' | 'other'>('all');
  const [sectionFilter, setSectionFilter] = useState<string>('');
  const [classFilter, setClassFilter] = useState<string>('');
  const [topFilter, setTopFilter] = useState<'top10' | 'top25' | 'top50' | 'custom'>('top10');
  const [topCustom, setTopCustom] = useState<number>(10);
  const [range, setRange] = useState<'7d' | '30d' | '90d'>('7d');
  const [metricFilter, setMetricFilter] = useState<'solved' | 'contests' | 'rating'>('solved');

  const handleTogglePlatform = (key: string, checked: boolean) => {
    setSelected((prev) => (checked ? [...new Set([...prev, key])] : prev.filter((p) => p !== key)));
    setRows((prev) => prev.map((r) => (r.platform === key ? r : r)));
  };

  const addRow = () => setRows((r) => [...r, { platform: selected[0] || 'leetcode', studentId: '', gender: 'male', section: '', klass: '' }]);

  const submitIds = () => {
    const payload = rows.filter((r) => r.studentId.trim()).filter((r) => selected.includes(r.platform));
    // Placeholder submit — replace with API call later
    console.log('Submitted IDs', { platforms: selected, range, rows: payload });
    alert('Submitted IDs for processing. Check console for payload.');
  };

  const studentsList = useMemo(() => Array.from(new Set(rows.map((r) => r.studentId).filter(Boolean))), [rows]);

  // Mock metrics derived from inputs so UI is interactive
  const metrics = useMemo(() => {
    const platforms = filterPlatform === 'all' ? selected : [filterPlatform];
    const base = rows
      .filter((r) => r.studentId.trim())
      .filter((r) => platforms.includes(r.platform))
      .filter((r) => (genderFilter === 'all' ? true : r.gender === genderFilter))
      .filter((r) => (sectionFilter ? (r.section || '').toLowerCase().includes(sectionFilter.toLowerCase()) : true))
      .filter((r) => (classFilter ? (r.klass || '').toLowerCase().includes(classFilter.toLowerCase()) : true))
      .filter((r) => (filterStudent === 'all' ? true : r.studentId === filterStudent));

    const items = base.map((r, idx) => {
      const solved = ((idx + 1) * 7) % 53 + 5; // deterministic mock
      const contests = ((idx + 2) * 3) % 20; // number of contests given/participated
      const rating = Number((( (idx * 13) % 500 ) / 100).toFixed(2)); // mock rating 0.00 - 5.00
      return ({
        platform: r.platform,
        student: r.studentId,
        uid: r.studentId,
        gender: r.gender,
        section: r.section || '',
        klass: r.klass || '',
        solved,
        contests,
        rating,
        hours: (idx % 5) + 2,
        courses: (idx % 3),
      });
    });

    const sorted = items.sort((a, b) => {
      if (metricFilter === 'solved') return b.solved - a.solved;
      if (metricFilter === 'contests') return b.contests - a.contests;
      return b.rating - a.rating;
    });

    const topN = topFilter === 'top10' ? 10 : topFilter === 'top25' ? 25 : topFilter === 'top50' ? 50 : Math.max(1, topCustom);
    const sliced = sorted.slice(0, topN);

    return sliced.length ? sliced : [{ platform: 'leetcode', student: 'demo', uid: 'demo', gender: 'male', section: '', klass: '', solved: 12, contests:0, rating:0.0, hours: 6, courses: 1 }];
  }, [rows, selected, filterPlatform, filterStudent, genderFilter, sectionFilter, classFilter, topFilter, topCustom]);

  const totals = useMemo(() => ({
    students: new Set(metrics.map((m) => m.student)).size,
    activity: metrics.reduce((s, m) => s + m.hours + m.solved + m.courses, 0),
    top: metrics.slice().sort((a, b) => b.solved - a.solved)[0],
  }), [metrics]);

  const barData = useMemo(() => metrics.map((m) => ({ name: m.student, solved: m.solved })), [metrics]);
  const lineData = useMemo(() => metrics.map((m, idx) => ({ day: idx + 1, hours: m.hours })), [metrics]);
  const pieData = useMemo(() => {
    const byPlatform: Record<string, number> = {};
    metrics.forEach((m) => { byPlatform[m.platform] = (byPlatform[m.platform] || 0) + m.solved; });
    return Object.entries(byPlatform).map(([name, value]) => ({ name, value }));
  }, [metrics]);

  const COLORS = ['#7C3AED', '#10B981', '#F59E0B', '#60A5FA', '#F472B6'];

  const exportCSV = () => {
    // include uid and key metric fields
    const headers = ['uid','platform','student','solved','contests','rating'];
    const rowsCsv = metrics.map((m) => [m.uid || m.student, m.platform, m.student, m.solved ?? 0, m.contests ?? 0, (typeof m.rating === 'number' ? (m.rating as number).toFixed(2) : (m.rating ?? ''))].join(','));
    const csv = [headers.join(','), ...rowsCsv].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `report_${metricFilter}_${topFilter}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const fileInputRef = React.useRef<HTMLInputElement | null>(null);

  const downloadTemplate = () => {
    const headers = ['platform','studentId','gender','section','class'];
    const sample = 'leetcode,student123,male,A,10';
    const csv = headers.join(',') + '\n' + sample + '\n';
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'ids-template.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const parseCSV = (text: string): Row[] => {
    const lines = text.split(/\r?\n/).filter(Boolean);
    if (!lines.length) return [];
    const headers = lines[0].split(',').map(h=>h.trim().toLowerCase());
    const idx = (name: string) => headers.indexOf(name);
    const pI = idx('platform');
    const sI = idx('studentid');
    const gI = idx('gender');
    const secI = idx('section');
    const cI = idx('class');
    const out: Row[] = [];
    for (let i=1;i<lines.length;i++){
      const cols = lines[i].split(',');
      const platform = (cols[pI] || 'leetcode').trim();
      const studentId = (cols[sI] || '').trim();
      if (!studentId) continue;
      const gender = ((cols[gI] || 'other').trim().toLowerCase() as 'male'|'female'|'other');
      const section = (cols[secI] || '').trim();
      const klass = (cols[cI] || '').trim();
      out.push({ platform, studentId, gender, section, klass });
    }
    return out;
  };

  const mergeUniqueRows = (a: Row[], b: Row[]) => {
    const map = new Map<string, Row>();
    for (const r of [...a, ...b]){
      const key = `${r.platform}|${r.studentId}`;
      if (!map.has(key)) map.set(key, r);
    }
    return Array.from(map.values());
  };

  const importCSVFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      const text = String(reader.result || '');
      const parsed = parseCSV(text);
      if (parsed.length){
        setRows((prev)=> mergeUniqueRows(prev, parsed));
      }
    };
    reader.readAsText(file);
  };

  const exportPDF = () => {
    const w = window.open('', '_blank');
    if (!w) return;
    w.document.write(`<pre>${JSON.stringify(metrics, null, 2)}</pre>`);
    w.document.close();
    w.focus();
    w.print();
  };

  const inactive = metrics.every((m) => (m.hours || 0) + (m.solved || 0) + (m.courses || 0) === 0);

  // Custom graphs state
  const [showAddGraph, setShowAddGraph] = useState(false);
  const [newGraphType, setNewGraphType] = useState<'pie'|'bar'|'line'|'histogram'>('bar');
  const [newGraphMetric, setNewGraphMetric] = useState<'solved'|'contests'|'rating'>('solved');
  const [customGraphs, setCustomGraphs] = useState<Array<{ id: string; type: string; metric: string; title: string }>>([]);

  const addGraph = () => {
    const id = String(Date.now());
    setCustomGraphs((g) => [...g, { id, type: newGraphType, metric: newGraphMetric, title: `${newGraphType.toUpperCase()} - ${newGraphMetric}` }]);
    setShowAddGraph(false);
  };

  const removeGraph = (id: string) => setCustomGraphs((g) => g.filter((x) => x.id !== id));

  const renderCustomGraph = (g: { id: string; type: string; metric: string; title: string }) => {
    if (g.type === 'pie') {
      // reuse pieData but map to metric value
      const data = pieData.map((p) => ({ name: p.name, value: p.value }));
      return (
        <ResponsiveContainer width="100%" height={220}>
          <RPieChart>
            <Pie data={data} dataKey="value" nameKey="name" outerRadius={80} innerRadius={40}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
          </RPieChart>
        </ResponsiveContainer>
      );
    }

    if (g.type === 'line') {
      return (
        <ResponsiveContainer width="100%" height={220}>
          <RLineChart data={lineData} margin={{ left: 8, right: 8 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="day" />
            <YAxis />
            <ChartTooltip />
            <Line type="monotone" dataKey={g.metric === 'rating' ? 'hours' : 'hours'} stroke="#10B981" strokeWidth={2} dot={false} />
          </RLineChart>
        </ResponsiveContainer>
      );
    }

    if (g.type === 'histogram') {
      // bin solved into ranges
      const bins: Record<string, number> = {};
      metrics.forEach((m) => {
        const v = m.solved || 0;
        const bin = Math.floor(v / 10) * 10;
        const key = `${bin}-${bin + 9}`;
        bins[key] = (bins[key] || 0) + 1;
      });
      const data = Object.entries(bins).map(([k, v]) => ({ range: k, count: v }));
      return (
        <ResponsiveContainer width="100%" height={220}>
          <RBarChart data={data} margin={{ left: 8, right: 8 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="range" />
            <YAxis />
            <ChartTooltip />
            <Bar dataKey="count" fill="#7C3AED" radius={[6,6,0,0]} />
          </RBarChart>
        </ResponsiveContainer>
      );
    }

    // default bar chart (students solved)
    return (
      <ResponsiveContainer width="100%" height={220}>
        <RBarChart data={barData} margin={{ left: 8, right: 8 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <ChartTooltip />
          <Bar dataKey={g.metric === 'rating' ? 'rating' : 'solved'} fill="#7C3AED" radius={[6,6,0,0]} />
        </RBarChart>
      </ResponsiveContainer>
    );
  };

  return (
    <div className="space-y-6">
      {/* Alerts */}
      {inactive && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Low activity</AlertTitle>
          <AlertDescription>No activity detected for the selected filters.</AlertDescription>
        </Alert>
      )}

      {/* Platform Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-bold">Platform Selection</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {PLATFORM_OPTIONS.map((opt) => (
              <label key={opt.key} className="flex items-center gap-2 rounded-lg border p-3 hover:bg-gray-50">
                <Checkbox checked={selected.includes(opt.key)} onCheckedChange={(v) => handleTogglePlatform(opt.key, Boolean(v))} />
                <span>{opt.label}</span>
              </label>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Student IDs */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-bold">Student IDs</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <input ref={fileInputRef} type="file" accept=".csv,text/csv" className="hidden" onChange={(e)=>{ const f=e.target.files?.[0]; if (f) importCSVFile(f); (e.target as HTMLInputElement).value=''; }} />
            <Button variant="outline" size="sm" onClick={()=>fileInputRef.current?.click()}>Import IDs (CSV)</Button>
            <Button variant="outline" size="sm" onClick={downloadTemplate}>Template</Button>
            <Select value={filterPlatform} onValueChange={(v: string) => setFilterPlatform(v)}>
              <SelectTrigger className="w-40"><SelectValue placeholder="Platform" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Platforms</SelectItem>
                {selected.map((p) => (
                  <SelectItem key={p} value={p}>{PLATFORM_OPTIONS.find(o=>o.key===p)?.label || p}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filterStudent} onValueChange={(v: string) => setFilterStudent(v)}>
              <SelectTrigger className="w-40"><SelectValue placeholder="Student" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Students</SelectItem>
                {studentsList.map((s) => (
                  <SelectItem key={s} value={s}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={genderFilter} onValueChange={(v: 'all'|'male'|'female'|'other') => setGenderFilter(v)}>
              <SelectTrigger className="w-36"><SelectValue placeholder="Gender" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="male">Boy</SelectItem>
                <SelectItem value="female">Girl</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>

            <Input className="w-36" placeholder="Section" value={sectionFilter} onChange={(e)=>setSectionFilter(e.target.value)} />
            <Input className="w-36" placeholder="Class" value={classFilter} onChange={(e)=>setClassFilter(e.target.value)} />

            <Select value={topFilter} onValueChange={(v: 'top10'|'top25'|'top50'|'custom') => setTopFilter(v)}>
              <SelectTrigger className="w-40"><SelectValue placeholder="Top" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="top10">Top 10</SelectItem>
                <SelectItem value="top25">Top 25</SelectItem>
                <SelectItem value="top50">Top 50</SelectItem>
                <SelectItem value="custom">Custom</SelectItem>
              </SelectContent>
            </Select>
            {topFilter === 'custom' && (
              <Input className="w-24" type="number" min={1} value={topCustom} onChange={(e)=>setTopCustom(Number(e.target.value) || 1)} />
            )}

            <Select value={metricFilter} onValueChange={(v: 'solved'|'contests'|'rating') => setMetricFilter(v)}>
              <SelectTrigger className="w-44"><SelectValue placeholder="Metric" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="solved">Problems Solved</SelectItem>
                <SelectItem value="contests">Contests Given</SelectItem>
                <SelectItem value="rating">Contest Rating</SelectItem>
              </SelectContent>
            </Select>

            <Select value={range} onValueChange={(v: '7d' | '30d' | '90d') => setRange(v)}>
              <SelectTrigger className="w-36"><SelectValue placeholder="Range" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="90d">Last 90 days</SelectItem>
              </SelectContent>
            </Select>

            <div className="ml-auto flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={exportCSV}><Download className="h-4 w-4 mr-2" />Export CSV</Button>
              <Button variant="outline" size="sm" onClick={exportPDF}><Download className="h-4 w-4 mr-2" />Export PDF</Button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {rows.map((row, idx) => (
              <div key={idx} className="grid grid-cols-1 md:grid-cols-6 gap-3 items-center">
                <Select value={row.platform} onValueChange={(v) => setRows((r) => r.map((x, i) => i === idx ? { ...x, platform: v } : x))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {selected.map((p) => (
                      <SelectItem key={p} value={p}>{PLATFORM_OPTIONS.find(o=>o.key===p)?.label || p}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input placeholder="Student ID / Handle" value={row.studentId} onChange={(e) => setRows((r) => r.map((x, i) => i === idx ? { ...x, studentId: e.target.value } : x))} />
                <Select value={row.gender} onValueChange={(v: 'male'|'female'|'other') => setRows((r)=> r.map((x,i)=> i===idx ? { ...x, gender: v } : x))}>
                  <SelectTrigger><SelectValue placeholder="Gender" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Boy</SelectItem>
                    <SelectItem value="female">Girl</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
                <Input placeholder="Section" value={row.section} onChange={(e)=> setRows((r)=> r.map((x,i)=> i===idx ? { ...x, section: e.target.value } : x))} />
                <Input placeholder="Class" value={row.klass} onChange={(e)=> setRows((r)=> r.map((x,i)=> i===idx ? { ...x, klass: e.target.value } : x))} />
                <div className="flex gap-2">
                  <Button variant="outline" className="w-full" onClick={() => setRows((r) => r.filter((_, i) => i !== idx))}>Remove</Button>
                  {idx === rows.length - 1 && (
                    <Button className="w-full" onClick={addRow}>Add Row</Button>
                  )}
                </div>
              </div>
            ))}
            {rows.length === 0 && (
              <Button variant="outline" onClick={addRow}>Add Row</Button>
            )}
          </div>

          <div className="mt-4 flex justify-end">
            <Button onClick={submitIds}>Submit</Button>
          </div>
        </CardContent>
      </Card>

      {/* Dashboard placeholders */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><BarChart3 className="h-4 w-4" /> Problems Solved</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <RBarChart data={barData} margin={{ left: 8, right: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <ChartTooltip />
                  <Bar dataKey="solved" fill="#7C3AED" radius={[6,6,0,0]} />
                </RBarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><LineChart className="h-4 w-4" /> Time Spent</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <RLineChart data={lineData} margin={{ left: 8, right: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <ChartTooltip />
                  <Line type="monotone" dataKey="hours" stroke="#10B981" strokeWidth={2} dot={false} />
                </RLineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><PieChart className="h-4 w-4" /> Platform Share</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <RPieChart>
                  <Pie data={pieData} dataKey="value" nameKey="name" outerRadius={80} innerRadius={40}>
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <ChartTooltip />
                </RPieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader><CardTitle>Total Students</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">{totals.students}</div></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Total Activity</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">{totals.activity}</div></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Top Performer</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">{totals.top ? `${totals.top.student}` : '—'}</div></CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MonitoringSection;
