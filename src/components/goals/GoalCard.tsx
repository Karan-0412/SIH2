import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import SyncStatusBadge from './SyncStatusBadge';
import type { Goal } from './types';
import { Pause, CheckCircle2, Pencil, Plus, PlusCircle } from 'lucide-react';

interface Props {
  goal: Goal;
  onBump: (id: string, delta: number) => void;
  onComplete: (id: string) => void;
  onTogglePause: (id: string) => void;
  onEdit: (g: Goal) => void;
  onOpenDetail: (g: Goal) => void;
}

function Sparkline({ points }: { points: Array<{t:number;v:number}> }){
  const path = useMemo(()=>{
    const maxV = Math.max(1, ...points.map(p=>p.v));
    const lastN = points.slice(-20);
    if (!lastN.length) return 'M0,12 L120,12';
    const stepX = 120 / Math.max(1,lastN.length-1);
    const coords = lastN.map((p,i)=>{
      const x = i*stepX;
      const y = 24 - (p.v/maxV)*24;
      return `${x},${y}`;
    }).join(' L');
    return `M${coords}`;
  },[points]);
  return (
    <svg width="120" height="24" viewBox="0 0 120 24" className="opacity-70">
      <path d={path} fill="none" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

const GoalCard: React.FC<Props> = ({ goal, onBump, onComplete, onTogglePause, onEdit, onOpenDetail }) => {
  const pct = Math.round((goal.progress/Math.max(1,goal.target))*100);
  return (
    <Card className={`bg-white/95 ${goal.completed ? 'ring-2 ring-emerald-400' : ''}`}>
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <span className="text-xl">🎯</span>
            <button className="hover:underline text-left" onClick={()=>onOpenDetail(goal)}>{goal.title}</button>
          </CardTitle>
          <SyncStatusBadge status={goal.syncStatus || 'idle'} lastSyncAt={goal.lastSyncAt} />
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between text-sm">
          <div className="text-muted-foreground">{goal.platform.toUpperCase()} · {goal.account}</div>
          <div className="font-medium">{goal.progress}/{goal.target} {goal.unit}</div>
        </div>
        <Progress value={pct} className="h-2 bg-indigo-100" />
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">Due {new Date(goal.endDate+'T00:00:00').toLocaleDateString()}</div>
          <div className="text-sm font-medium">{pct}%</div>
        </div>
        <div className="flex items-center justify-between">
          <Sparkline points={goal.activity || []} />
          <div className="flex items-center gap-2">
            <Button variant="secondary" className="rounded-full" onClick={()=>onBump(goal.id, 1)}><Plus className="h-4 w-4" /> +1</Button>
            <Button variant="secondary" className="rounded-full" onClick={()=>onBump(goal.id, Math.max(1, Math.round(goal.target*0.1)))}><PlusCircle className="h-4 w-4" /> +10%</Button>
            <Button variant="ghost" onClick={()=>onEdit(goal)}><Pencil className="h-4 w-4" /> Edit</Button>
            <Button variant="ghost" onClick={()=>onTogglePause(goal.id)}><Pause className="h-4 w-4" /> {goal.paused ? 'Resume' : 'Pause'}</Button>
            <Button className="rounded-full bg-emerald-600 hover:bg-emerald-600/90" onClick={()=>onComplete(goal.id)}><CheckCircle2 className="h-4 w-4" /> Complete</Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default GoalCard;
