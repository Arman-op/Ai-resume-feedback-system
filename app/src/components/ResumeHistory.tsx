import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useResume } from '@/hooks/useResume';
import { useAuth } from '@/hooks/useAuth';
import type { Resume } from '@/types';
import { FileText, Calendar, TrendingUp, Trash2, Eye, Award } from 'lucide-react';
import { formatDate, getScoreColor, getScoreBgColor } from '@/lib/utils';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface ResumeHistoryProps {
  onSelectResume: (resume: Resume) => void;
}

export function ResumeHistory({ onSelectResume }: ResumeHistoryProps) {
  const { resumes, deleteResume, selectResume } = useResume();
  const { user } = useAuth();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [resumeToDelete, setResumeToDelete] = useState<Resume | null>(null);

  const handleDelete = async () => {
    if (resumeToDelete) {
      await deleteResume(resumeToDelete.id);
      setDeleteDialogOpen(false);
      setResumeToDelete(null);
    }
  };

  const confirmDelete = (resume: Resume) => {
    setResumeToDelete(resume);
    setDeleteDialogOpen(true);
  };

  const handleView = (resume: Resume) => {
    selectResume(resume);
    onSelectResume(resume);
  };

  const sortedResumes = [...resumes].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  const chartData = sortedResumes
    .slice()
    .reverse()
    .map((resume) => ({
      date: formatDate(resume.created_at),
      score: resume.ats_score,
    }));

  const bestScore = Math.max(...resumes.map((r) => r.ats_score), 0);
  const averageScore = resumes.length
    ? Math.round(resumes.reduce((sum, r) => sum + r.ats_score, 0) / resumes.length)
    : 0;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Total Resumes</p>
                <p className="text-2xl font-bold">{resumes.length}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <FileText className="w-5 h-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Best Score</p>
                <p className={`text-2xl font-bold ${getScoreColor(bestScore)}`}>
                  {bestScore}
                </p>
              </div>
              <div className="p-3 bg-emerald-100 rounded-lg">
                <Award className="w-5 h-5 text-emerald-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Average Score</p>
                <p className={`text-2xl font-bold ${getScoreColor(averageScore)}`}>
                  {averageScore}
                </p>
              </div>
              <div className="p-3 bg-amber-100 rounded-lg">
                <TrendingUp className="w-5 h-5 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {chartData.length > 1 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-700">
              Score Progression
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 12 }}
                    stroke="#64748b"
                  />
                  <YAxis
                    domain={[0, 100]}
                    tick={{ fontSize: 12 }}
                    stroke="#64748b"
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#fff',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="score"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    dot={{ fill: '#3b82f6', strokeWidth: 2 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-slate-700">
            Resume History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[300px]">
            <div className="space-y-3">
              {sortedResumes.map((resume) => (
                <div
                  key={resume.id}
                  className="flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white rounded-lg shadow-sm">
                      <FileText className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-slate-700 text-sm">
                        {resume.filename}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <Calendar className="w-3 h-3" />
                        {formatDate(resume.created_at)}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      className={`${getScoreBgColor(resume.ats_score)} text-white`}
                    >
                      {resume.ats_score}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handleView(resume)}
                    >
                      <Eye className="w-4 h-4 text-slate-500" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => confirmDelete(resume)}
                    >
                      <Trash2 className="w-4 h-4 text-rose-500" />
                    </Button>
                  </div>
                </div>
              ))}
              {resumes.length === 0 && (
                <div className="text-center py-8 text-slate-500">
                  <FileText className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p>No resumes uploaded yet</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Resume</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{resumeToDelete?.filename}"? This
              action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
