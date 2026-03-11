import { useEffect, useState, useRef } from 'react';
import { getScoreColor, getScoreLabel } from '@/lib/utils';

interface ScoreGaugeProps {
  score: number;
  size?: number;
  strokeWidth?: number;
  showLabel?: boolean;
  animated?: boolean;
}

export function ScoreGauge({
  score,
  size = 200,
  strokeWidth = 16,
  showLabel = true,
  animated = true,
}: ScoreGaugeProps) {
  const [animatedScore, setAnimatedScore] = useState(0);
  const animationRef = useRef<number | null>(null);

  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (animatedScore / 100) * circumference;

  useEffect(() => {
    if (!animated) {
      setAnimatedScore(score);
      return;
    }

    const duration = 1500;
    const startTime = performance.now();
    const startValue = 0;

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      const currentScore = Math.round(startValue + (score - startValue) * easeOutQuart);

      setAnimatedScore(currentScore);

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      }
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [score, animated]);

  const scoreColor = getScoreColor(score);
  const scoreLabel = getScoreLabel(score);

  return (
    <div className="relative flex flex-col items-center">
      <div className="relative" style={{ width: size, height: size }}>
        <svg
          width={size}
          height={size}
          className="transform -rotate-90"
        >
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            className="text-slate-200"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className={`${scoreColor} transition-all duration-100`}
            style={{
              filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))',
            }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`text-5xl font-bold ${scoreColor}`}>
            {animatedScore}
          </span>
          <span className="text-sm text-slate-500 mt-1">/ 100</span>
        </div>
      </div>
      {showLabel && (
        <div className="mt-4 text-center">
          <span className={`text-lg font-semibold ${scoreColor}`}>
            {scoreLabel}
          </span>
        </div>
      )}
    </div>
  );
}
