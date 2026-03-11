import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { AnalysisResult } from '@/types';
import { Target, Layout, TrendingUp, CheckCircle, Lightbulb, Check } from 'lucide-react';

interface AnalysisResultsProps {
  analysis: AnalysisResult;
}

interface SuggestionListProps {
  suggestions: string[];
  icon: React.ReactNode;
  title: string;
}

function SuggestionList({ suggestions, icon, title }: SuggestionListProps) {
  const [checked, setChecked] = useState<Set<number>>(new Set());

  const toggleCheck = (index: number) => {
    const newChecked = new Set(checked);
    if (newChecked.has(index)) {
      newChecked.delete(index);
    } else {
      newChecked.add(index);
    }
    setChecked(newChecked);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-slate-700">
        {icon}
        <span className="font-semibold">{title}</span>
      </div>
      <ul className="space-y-2">
        {suggestions.map((suggestion, index) => (
          <li
            key={index}
            className={`
              flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-all
              ${checked.has(index)
                ? 'bg-emerald-50 border border-emerald-200'
                : 'bg-slate-50 border border-slate-200 hover:border-blue-300'
              }
            `}
            onClick={() => toggleCheck(index)}
          >
            <div
              className={`
                flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center mt-0.5
                ${checked.has(index)
                  ? 'bg-emerald-500 border-emerald-500'
                  : 'border-slate-300'
                }
              `}
            >
              {checked.has(index) && <Check className="w-3 h-3 text-white" />}
            </div>
            <span
              className={`text-sm ${
                checked.has(index) ? 'text-emerald-700 line-through' : 'text-slate-600'
              }`}
            >
              {suggestion}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function KeywordAnalysis({ analysis }: { analysis: AnalysisResult['keyword_analysis'] }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <h4 className="text-sm font-semibold text-emerald-600 mb-2 flex items-center gap-2">
            <Check className="w-4 h-4" />
            Matched Keywords ({analysis.matched_keywords.length})
          </h4>
          <div className="flex flex-wrap gap-2">
            {analysis.matched_keywords.map((keyword) => (
              <Badge
                key={keyword}
                variant="secondary"
                className="bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
              >
                {keyword}
              </Badge>
            ))}
          </div>
        </div>
        <div>
          <h4 className="text-sm font-semibold text-rose-600 mb-2 flex items-center gap-2">
            <Target className="w-4 h-4" />
            Missing Keywords ({analysis.missing_keywords.length})
          </h4>
          <div className="flex flex-wrap gap-2">
            {analysis.missing_keywords.map((keyword) => (
              <Badge
                key={keyword}
                variant="secondary"
                className="bg-rose-100 text-rose-700 hover:bg-rose-200"
              >
                {keyword}
              </Badge>
            ))}
          </div>
        </div>
      </div>
      <SuggestionList
        icon={<Lightbulb className="w-4 h-4 text-amber-500" />}
        title="Suggestions"
        suggestions={analysis.suggestions}
      />
    </div>
  );
}

function FormattingAnalysis({ analysis }: { analysis: AnalysisResult['formatting_analysis'] }) {
  return (
    <div className="space-y-6">
      {analysis.issues.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-rose-600 mb-2">Issues Found</h4>
          <ul className="space-y-2">
            {analysis.issues.map((issue, index) => (
              <li
                key={index}
                className="flex items-center gap-2 text-sm text-slate-600 p-2 bg-rose-50 rounded-lg"
              >
                <span className="w-1.5 h-1.5 bg-rose-500 rounded-full" />
                {issue}
              </li>
            ))}
          </ul>
        </div>
      )}
      <SuggestionList
        icon={<Layout className="w-4 h-4 text-blue-500" />}
        title="Formatting Improvements"
        suggestions={analysis.suggestions}
      />
    </div>
  );
}

function ImpactAnalysis({ analysis }: { analysis: AnalysisResult['impact_analysis'] }) {
  return (
    <div className="space-y-6">
      <div>
        <h4 className="text-sm font-semibold text-emerald-600 mb-2">
          Quantified Results ({analysis.quantified_results.length})
        </h4>
        <ul className="space-y-2">
          {analysis.quantified_results.map((result, index) => (
            <li
              key={index}
              className="flex items-center gap-2 text-sm text-slate-600 p-2 bg-emerald-50 rounded-lg"
            >
              <TrendingUp className="w-4 h-4 text-emerald-500" />
              {result}
            </li>
          ))}
        </ul>
      </div>
      {analysis.missing_metrics.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-amber-600 mb-2">
            Missing Metrics
          </h4>
          <div className="flex flex-wrap gap-2">
            {analysis.missing_metrics.map((metric) => (
              <Badge
                key={metric}
                variant="secondary"
                className="bg-amber-100 text-amber-700"
              >
                {metric}
              </Badge>
            ))}
          </div>
        </div>
      )}
      <SuggestionList
        icon={<Lightbulb className="w-4 h-4 text-amber-500" />}
        title="Impact Improvements"
        suggestions={analysis.suggestions}
      />
    </div>
  );
}

function CompletenessAnalysis({ analysis }: { analysis: AnalysisResult['completeness_analysis'] }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <h4 className="text-sm font-semibold text-emerald-600 mb-2">
            Present Sections
          </h4>
          <ul className="space-y-1">
            {analysis.present_sections.map((section) => (
              <li
                key={section}
                className="flex items-center gap-2 text-sm text-slate-600"
              >
                <Check className="w-4 h-4 text-emerald-500" />
                {section}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="text-sm font-semibold text-rose-600 mb-2">
            Missing Sections
          </h4>
          <ul className="space-y-1">
            {analysis.missing_sections.map((section) => (
              <li
                key={section}
                className="flex items-center gap-2 text-sm text-slate-600"
              >
                <span className="w-1.5 h-1.5 bg-rose-500 rounded-full" />
                {section}
              </li>
            ))}
          </ul>
        </div>
      </div>
      <SuggestionList
        icon={<CheckCircle className="w-4 h-4 text-blue-500" />}
        title="Completeness Improvements"
        suggestions={analysis.suggestions}
      />
    </div>
  );
}

export function AnalysisResults({ analysis }: AnalysisResultsProps) {
  return (
    <div className="space-y-4">
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h3 className="font-semibold text-blue-800 mb-2">Overall Feedback</h3>
        <p className="text-sm text-blue-700">{analysis.overall_feedback}</p>
      </div>

      <Tabs defaultValue="keywords" className="w-full">
        <TabsList className="grid grid-cols-4 w-full">
          <TabsTrigger value="keywords" className="text-xs">
            <Target className="w-3 h-3 mr-1" />
            Keywords
          </TabsTrigger>
          <TabsTrigger value="formatting" className="text-xs">
            <Layout className="w-3 h-3 mr-1" />
            Formatting
          </TabsTrigger>
          <TabsTrigger value="impact" className="text-xs">
            <TrendingUp className="w-3 h-3 mr-1" />
            Impact
          </TabsTrigger>
          <TabsTrigger value="completeness" className="text-xs">
            <CheckCircle className="w-3 h-3 mr-1" />
            Complete
          </TabsTrigger>
        </TabsList>

        <ScrollArea className="h-[400px] mt-4">
          <TabsContent value="keywords" className="mt-0">
            <KeywordAnalysis analysis={analysis.keyword_analysis} />
          </TabsContent>
          <TabsContent value="formatting" className="mt-0">
            <FormattingAnalysis analysis={analysis.formatting_analysis} />
          </TabsContent>
          <TabsContent value="impact" className="mt-0">
            <ImpactAnalysis analysis={analysis.impact_analysis} />
          </TabsContent>
          <TabsContent value="completeness" className="mt-0">
            <CompletenessAnalysis analysis={analysis.completeness_analysis} />
          </TabsContent>
        </ScrollArea>
      </Tabs>

      <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
        <h3 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
          <Lightbulb className="w-4 h-4 text-amber-500" />
          4-Week Improvement Plan
        </h3>
        <ul className="space-y-2">
          {analysis.improvement_plan.map((plan, index) => (
            <li
              key={index}
              className="flex items-start gap-3 text-sm text-slate-600"
            >
              <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-medium">
                {index + 1}
              </span>
              {plan}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
