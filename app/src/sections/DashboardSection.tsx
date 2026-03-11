import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ResumeHistory } from '@/components/ResumeHistory';
import { useResume } from '@/hooks/useResume';
import { useAuth } from '@/hooks/useAuth';
import { Upload, TrendingUp, Award, FileText } from 'lucide-react';
import type { Resume } from '@/types';

interface DashboardSectionProps {
  onUploadNew: () => void;
  onSelectResume: (resume: Resume) => void;
}

export function DashboardSection({ onUploadNew, onSelectResume }: DashboardSectionProps) {
  const { user } = useAuth();
  const { resumes } = useResume();

  const bestScore = Math.max(...resumes.map((r) => r.ats_score), 0);
  const latestResume = resumes[0];
  const totalAnalyses = resumes.length;

  return (
    <section className="py-12 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-800">
            Welcome back, {user?.name?.split(' ')[0]}
          </h1>
          <p className="text-slate-600 mt-1">
            Manage your resumes and track your improvement over time.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">Total Resumes</p>
                  <p className="text-3xl font-bold text-slate-800">{totalAnalyses}</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-lg">
                  <FileText className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">Best Score</p>
                  <p className="text-3xl font-bold text-emerald-600">{bestScore}</p>
                </div>
                <div className="p-3 bg-emerald-100 rounded-lg">
                  <Award className="w-6 h-6 text-emerald-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">Latest Score</p>
                  <p className="text-3xl font-bold text-blue-600">
                    {latestResume?.ats_score || 0}
                  </p>
                </div>
                <div className="p-3 bg-blue-100 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-blue-600 border-blue-600">
            <CardContent className="p-6">
              <div className="flex flex-col items-center justify-center h-full text-center">
                <Button
                  onClick={onUploadNew}
                  variant="secondary"
                  className="w-full"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Upload New
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card className="h-full">
              <CardHeader>
                <CardTitle>Resume History</CardTitle>
                <CardDescription>
                  View all your uploaded resumes and their scores
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResumeHistory onSelectResume={onSelectResume} />
              </CardContent>
            </Card>
          </div>

          <div>
            <Card className="h-full">
              <CardHeader>
                <CardTitle>Quick Tips</CardTitle>
                <CardDescription>
                  Improve your resume with these recommendations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-200">
                    <h4 className="font-medium text-emerald-800 mb-2">
                      Use Keywords
                    </h4>
                    <p className="text-sm text-emerald-700">
                      Include industry-specific keywords from the job description
                      to improve ATS matching.
                    </p>
                  </div>

                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <h4 className="font-medium text-blue-800 mb-2">
                      Quantify Results
                    </h4>
                    <p className="text-sm text-blue-700">
                      Use numbers and percentages to demonstrate your impact.
                      Example: "Increased sales by 25%"
                    </p>
                  </div>

                  <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                    <h4 className="font-medium text-amber-800 mb-2">
                      Keep It Simple
                    </h4>
                    <p className="text-sm text-amber-700">
                      Use standard section headers and avoid tables, images, or
                      complex formatting.
                    </p>
                  </div>

                  <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                    <h4 className="font-medium text-purple-800 mb-2">
                      Include All Sections
                    </h4>
                    <p className="text-sm text-purple-700">
                      Make sure to include Contact, Summary, Experience,
                      Education, and Skills sections.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}
