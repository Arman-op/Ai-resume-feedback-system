import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { ScoreGauge } from '@/components/ScoreGauge';
import { ScoreBreakdown } from '@/components/ScoreBreakdown';
import { AnalysisResults } from '@/components/AnalysisResults';
import { SideBySideView } from '@/components/SideBySideView';
import { ResumeHistory } from '@/components/ResumeHistory';
import { useResume } from '@/hooks/useResume';
import { Download, RefreshCw, Layout, History, FileSearch } from 'lucide-react';

interface ResultsSectionProps {
  onViewHistory: () => void;
}

export function ResultsSection({ onViewHistory }: ResultsSectionProps) {
  const { currentResume, selectResume } = useResume();

  if (!currentResume) {
    return null;
  }

  const handleBackToHistory = () => {
    selectResume(null);
    onViewHistory();
  };

  return (
    <section className="py-12 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">
              Analysis Results
            </h2>
            <p className="text-slate-600">
              {currentResume.filename} • Analyzed on{' '}
              {new Date(currentResume.created_at).toLocaleDateString()}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={handleBackToHistory}>
              <History className="w-4 h-4 mr-2" />
              View History
            </Button>
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Export Report
            </Button>
          </div>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-grid">
            <TabsTrigger value="overview">
              <FileSearch className="w-4 h-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="detailed">
              <Layout className="w-4 h-4 mr-2" />
              Detailed Analysis
            </TabsTrigger>
            <TabsTrigger value="compare">
              <RefreshCw className="w-4 h-4 mr-2" />
              Compare
            </TabsTrigger>
            <TabsTrigger value="history">
              <History className="w-4 h-4 mr-2" />
              History
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-1">
                <CardHeader>
                  <CardTitle className="text-lg">Overall Score</CardTitle>
                </CardHeader>
                <CardContent className="flex justify-center py-6">
                  <ScoreGauge score={currentResume.ats_score} size={220} />
                </CardContent>
              </Card>

              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="text-lg">Score Breakdown</CardTitle>
                </CardHeader>
                <CardContent>
                  <ScoreBreakdown
                    keywordScore={currentResume.keyword_score}
                    formattingScore={currentResume.formatting_score}
                    impactScore={currentResume.impact_score}
                    completenessScore={currentResume.completeness_score}
                  />
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">AI Recommendations</CardTitle>
              </CardHeader>
              <CardContent>
                <AnalysisResults analysis={currentResume.analysis_result} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="detailed">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Detailed Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <AnalysisResults analysis={currentResume.analysis_result} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="compare">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Side-by-Side Comparison</CardTitle>
              </CardHeader>
              <CardContent>
                <SideBySideView resume={currentResume} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history">
            <ResumeHistory onSelectResume={selectResume} />
          </TabsContent>
        </Tabs>
      </div>
    </section>
  );
}
