import React, { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { Target, CheckCircle2, Plus, ChevronUp } from "lucide-react";

type Goal = {
  id: string;
  title: string;
  progress: number; // 0 - 100
  completed: boolean;
  createdAt: number;
};

const LOCAL_STORAGE_KEY = "student_goals_v1";

const clamp = (val: number, min = 0, max = 100) => Math.min(max, Math.max(min, val));

const StudentGoals: React.FC = () => {
  const { toast } = useToast();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [newGoal, setNewGoal] = useState("");

  useEffect(() => {
    try {
      const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (raw) setGoals(JSON.parse(raw));
    } catch {}
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(goals));
    } catch {}
  }, [goals]);

  const addGoal = () => {
    const title = newGoal.trim();
    if (!title) return;
    const g: Goal = {
      id: crypto.randomUUID(),
      title,
      progress: 0,
      completed: false,
      createdAt: Date.now(),
    };
    setGoals((prev) => [g, ...prev]);
    setNewGoal("");
    toast({ title: "Goal added", description: `“${title}” has been added.` });
  };

  const bumpProgress = (id: string, amount = 10) => {
    setGoals((prev) =>
      prev.map((g) => {
        if (g.id !== id) return g;
        const next = clamp(g.progress + amount);
        return { ...g, progress: next, completed: next >= 100 };
      })
    );
  };

  const markComplete = (id: string) => {
    setGoals((prev) => prev.map((g) => (g.id === id ? { ...g, progress: 100, completed: true } : g)));
    const goal = goals.find((g) => g.id === id);
    toast({ title: "Goal completed ✅", description: goal ? `“${goal.title}” is now complete.` : "Marked complete." });
  };

  const completionRate = useMemo(() => {
    if (!goals.length) return 0;
    const sum = goals.reduce((acc, g) => acc + g.progress, 0);
    return Math.round(sum / goals.length);
  }, [goals]);

  return (
    <div className="min-h-[calc(100vh-4rem)] w-full bg-gradient-to-b from-sky-50 via-indigo-50 to-indigo-100/60">
      <div className="container py-10">
        {/* Header */}
        <div className="rounded-3xl bg-gradient-to-r from-sky-400 via-indigo-500 to-indigo-600 p-[1px] shadow-xl">
          <div className="rounded-3xl bg-white/80 backdrop-blur px-6 py-10 sm:px-10">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-gray-900">
                  <span className="mr-2">🎯</span> Student Goal Dashboard
                </h1>
                <p className="mt-2 text-gray-600">Set goals, track progress, and celebrate achievements.</p>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-700">
                <div className="flex items-center gap-2 rounded-full bg-white/70 px-4 py-2 shadow-sm">
                  <Target className="h-4 w-4 text-indigo-600" />
                  <span>Goals: {goals.length}</span>
                </div>
                <div className="flex items-center gap-2 rounded-full bg-white/70 px-4 py-2 shadow-sm">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  <span>Avg. Progress: {completionRate}%</span>
                </div>
              </div>
            </div>

            {/* Add Goal */}
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <div className="flex-1">
                <Input
                  value={newGoal}
                  onChange={(e) => setNewGoal(e.target.value)}
                  placeholder="Enter your new goal…"
                  className="h-12 rounded-full bg-white/90 text-base shadow-sm placeholder:text-gray-400"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") addGoal();
                  }}
                />
              </div>
              <Button
                onClick={addGoal}
                className="h-12 rounded-full bg-indigo-600 hover:bg-indigo-600/90 active:scale-[0.98] transition will-change-transform shadow-lg"
              >
                <Plus className="h-5 w-5" />
                <span>Add Goal</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Goals List */}
        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {goals.length === 0 && (
            <Card className="col-span-full bg-white/70">
              <CardHeader>
                <CardTitle className="text-gray-800">No goals yet</CardTitle>
              </CardHeader>
              <CardContent className="text-gray-600">Add your first goal to get started.</CardContent>
            </Card>
          )}

          {goals.map((goal) => (
            <Card key={goal.id} className={`bg-white/90 ${goal.completed ? "ring-2 ring-emerald-400" : ""}`}>
              <CardHeader className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <CardTitle className="flex items-center gap-2 text-gray-900">
                    <span className="text-xl">🎯</span>
                    <span className="line-clamp-2">{goal.title}</span>
                  </CardTitle>
                  {goal.completed && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                      <CheckCircle2 className="h-4 w-4" /> Completed
                    </span>
                  )}
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <span>Progress</span>
                    <span className="font-medium text-gray-800">{goal.progress}%</span>
                  </div>
                  <Progress
                    value={goal.progress}
                    className="h-3 bg-indigo-100"
                  />
                </div>
              </CardHeader>
              <CardFooter className="flex items-center gap-3">
                <Button
                  variant="secondary"
                  className="rounded-full bg-indigo-50 text-indigo-700 hover:bg-indigo-100"
                  onClick={() => bumpProgress(goal.id, 10)}
                  disabled={goal.completed}
                >
                  <ChevronUp className="h-4 w-4" /> +10%
                </Button>
                <Button
                  className="rounded-full bg-emerald-600 hover:bg-emerald-600/90"
                  onClick={() => markComplete(goal.id)}
                  disabled={goal.completed}
                >
                  <CheckCircle2 className="h-4 w-4" /> Mark Complete
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StudentGoals;
