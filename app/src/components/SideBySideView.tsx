import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import type { Resume, AnalysisResult } from '@/types';
import { FileText, Lightbulb, AlertCircle, CheckCircle } from 'lucide-react';

interface SideBySideViewProps {
  resume: Resume;
}

interface Suggestion {
  id: string;
  type: 'keyword' | 'formatting' | 'impact' | 'completeness';
  original?: string;
  suggestion: string;
  priority: 'high' | 'medium' | 'low';
}

function generateSuggestions(analysis: AnalysisResult): Suggestion[] {
  const suggestions: Suggestion[] = [];
  let id = 0;

  analysis.keyword_analysis.suggestions.forEach((s) => {
    suggestions.push({
      id: `kw-${id++}`,
      type: 'keyword',
      suggestion: s,
      priority: 'high',
    });
  });

  analysis.formatting_analysis.suggestions.forEach((s) => {
    suggestions.push({
      id: `fmt-${id++}`,
      type: 'formatting',
      suggestion: s,
      priority: 'medium',
    });
  });

  analysis.impact_analysis.suggestions.forEach((s) => {
    suggestions.push({
      id: `imp-${id++}`,
      type: 'impact',
      suggestion: s,
      priority: 'high',
    });
  });

  analysis.completeness_analysis.suggestions.forEach((s) => {
    suggestions.push({
      id: `cmp-${id++}`,
      type: 'completeness',
      suggestion: s,
      priority: 'medium',
    });
  });

  return suggestions;
}

function getPriorityColor(priority: string): string {
  switch (priority) {
    case 'high':
      return 'bg-rose-100 text-rose-700 border-rose-200';
    case 'medium':
      return 'bg-amber-100 text-amber-700 border-amber-200';
    case 'low':
      return 'bg-blue-100 text-blue-700 border-blue-200';
    default:
      return 'bg-slate-100 text-slate-700 border-slate-200';
  }
}

function getTypeIcon(type: string) {
  switch (type) {
    case 'keyword':
      return <span className="w-2 h-2 bg-purple-500 rounded-full" />;
    case 'formatting':
      return <span className="w-2 h-2 bg-blue-500 rounded-full" />;
    case 'impact':
      return <span className="w-2 h-2 bg-emerald-500 rounded-full" />;
    case 'completeness':
      return <span className="w-2 h-2 bg-amber-500 rounded-full" />;
    default:
      return <span className="w-2 h-2 bg-slate-500 rounded-full" />;
  }
  }

function getTypeLabel(type: string): string {
  switch (type) {
    case 'keyword':
      return 'Keyword';
    case 'formatting':
      return 'Formatting';
    case 'impact':
      return 'Impact';
    case 'completeness':
      return 'Completeness';
    default:
      return 'General';
  }
}

export function SideBySideView({ resume }: SideBySideViewProps) {
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const suggestions = generateSuggestions(resume.analysis_result);

  const filteredSuggestions =
    activeFilter === 'all'
      ? suggestions
      : suggestions.filter((s) => s.type === activeFilter);

  const mockResumeContent = `
JOHN DOE
john.doe@email.com | (555) 123-4567 | LinkedIn: linkedin.com/in/johndoe

PROFESSIONAL SUMMARY
Experienced software engineer with 5+ years in full-stack development. 
Proficient in Python, JavaScript, and cloud technologies. Passionate 
about building scalable applications and leading high-performing teams.

WORK EXPERIENCE

Senior Software Engineer | TechCorp Inc. | 2021 - Present
• Led development of microservices architecture serving 1M+ users
• Managed team of 8 engineers using Agile methodologies
• Reduced deployment time by 40% through CI/CD implementation
• Collaborated with product team to deliver features on schedule

Software Engineer | StartupXYZ | 2019 - 2021
• Developed RESTful APIs using Python and FastAPI
• Implemented data pipelines processing 10TB daily
• Worked with cross-functional teams on product features

EDUCATION
Bachelor of Science in Computer Science
University of Technology | 2019

SKILLS
Python, JavaScript, React, Node.js, SQL, AWS, Docker, Kubernetes, 
Git, Agile, Project Management, Data Analysis
  `.trim();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[600px]">
      <Card className="h-full flex flex-col">
        <CardHeader className="pb-3 border-b">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <FileText className="w-4 h-4 text-blue-600" />
            Original Resume
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1 p-0">
          <ScrollArea className="h-full">
            <div className="p-6">
              <pre className="font-mono text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">
                {mockResumeContent}
              </pre>
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      <Card className="h-full flex flex-col">
        <CardHeader className="pb-3 border-b">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Lightbulb className="w-4 h-4 text-amber-500" />
            AI Suggestions
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1 p-0">
          <Tabs defaultValue="all" className="h-full flex flex-col">
            <div className="px-4 pt-4">
              <TabsList className="w-full grid grid-cols-5">
                <TabsTrigger
                  value="all"
                  onClick={() => setActiveFilter('all')}
                  className="text-xs"
                >
                  All
                </TabsTrigger>
                <TabsTrigger
                  value="keyword"
                  onClick={() => setActiveFilter('keyword')}
                  className="text-xs"
                >
                  Keywords
                </TabsTrigger>
                <TabsTrigger
                  value="formatting"
                  onClick={() => setActiveFilter('formatting')}
                  className="text-xs"
                >
                  Format
                </TabsTrigger>
                <TabsTrigger
                  value="impact"
                  onClick={() => setActiveFilter('impact')}
                  className="text-xs"
                >
                  Impact
                </TabsTrigger>
                <TabsTrigger
                  value="completeness"
                  onClick={() => setActiveFilter('completeness')}
                  className="text-xs"
                >
                  Complete
                </TabsTrigger>
              </TabsList>
            </div>

            <ScrollArea className="flex-1">
              <div className="p-4 space-y-3">
                {filteredSuggestions.map((suggestion) => (
                  <div
                    key={suggestion.id}
                    className="p-3 bg-slate-50 rounded-lg border border-slate-200 hover:border-blue-300 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-1">{getTypeIcon(suggestion.type)}</div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge
                            variant="outline"
                            className="text-xs px-1.5 py-0"
                          >
                            {getTypeLabel(suggestion.type)}
                          </Badge>
                          <Badge
                            variant="outline"
                            className={`text-xs px-1.5 py-0 ${getPriorityColor(
                              suggestion.priority
                            )}`}
                          >
                            {suggestion.priority}
                          </Badge>
                        </div>
                        <p className="text-sm text-slate-700">
                          {suggestion.suggestion}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
                {filteredSuggestions.length === 0 && (
                  <div className="text-center py-8 text-slate-500">
                    <CheckCircle className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p>No suggestions in this category</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
