
import { getScoreColor, getScoreBgColor } from '@/lib/utils';
import { Target, Layout, TrendingUp, CheckCircle } from 'lucide-react';

interface ScoreBreakdownProps {
  keywordScore: number;
  formattingScore: number;
  impactScore: number;
  completenessScore: number;
}

interface ScoreItemProps {
  icon: React.ReactNode;
  label: string;
  score: number;
  description: string;
}

function ScoreItem({ icon, label, score, description }: ScoreItemProps) {
  const colorClass = getScoreColor(score);
  const bgClass = getScoreBgColor(score);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={`p-1.5 rounded-md ${bgClass} bg-opacity-10`}>
            <div className={colorClass}>{icon}</div>
          </div>
          <span className="font-medium text-slate-700">{label}</span>
        </div>
        <span className={`font-bold ${colorClass}`}>{score}%</span>
      </div>
      <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
        <div
          className={`h-full ${bgClass} transition-all duration-500`}
          style={{ width: `${score}%` }}
        />
      </div>
      <p className="text-xs text-slate-500">{description}</p>
    </div>
  );
}

export function ScoreBreakdown({
  keywordScore,
  formattingScore,
  impactScore,
  completenessScore,
}: ScoreBreakdownProps) {
  const scores = [
    {
      icon: <Target className="w-4 h-4" />,
      label: 'Keyword Match',
      score: keywordScore,
      description: 'Industry-specific keywords and skills alignment',
    },
    {
      icon: <Layout className="w-4 h-4" />,
      label: 'Formatting',
      score: formattingScore,
      description: 'ATS-friendly structure and readability',
    },
    {
      icon: <TrendingUp className="w-4 h-4" />,
      label: 'Measurable Impact',
      score: impactScore,
      description: 'Quantified achievements and results',
    },
    {
      icon: <CheckCircle className="w-4 h-4" />,
      label: 'Completeness',
      score: completenessScore,
      description: 'Required sections and information coverage',
    },
  ];

  return (
    <div className="space-y-6">
      {scores.map((item) => (
        <ScoreItem
          key={item.label}
          icon={item.icon}
          label={item.label}
          score={item.score}
          description={item.description}
        />
      ))}
    </div>
  );
}
