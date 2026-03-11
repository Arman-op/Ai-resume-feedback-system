import { Button } from '@/components/ui/button';
import { ArrowRight, Sparkles, Shield, Zap } from 'lucide-react';

interface HeroSectionProps {
  onGetStarted: () => void;
}

export function HeroSection({ onGetStarted }: HeroSectionProps) {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-slate-50 to-white py-20 lg:py-32">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-medium mb-6">
            <Sparkles className="w-4 h-4" />
            AI-Powered Resume Analysis
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 mb-6 leading-tight">
            Get Your Resume Past{' '}
            <span className="text-blue-600">ATS Systems</span>
          </h1>

          <p className="text-lg sm:text-xl text-slate-600 mb-8 leading-relaxed">
            Our AI analyzes your resume for keywords, formatting, measurable impact,
            and completeness. Get actionable feedback to increase your interview chances.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
            <Button
              size="lg"
              onClick={onGetStarted}
              className="bg-blue-600 hover:bg-blue-700 text-lg px-8"
            >
              Analyze My Resume
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="text-lg px-8"
            >
              View Demo
            </Button>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-8 text-sm text-slate-500">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-emerald-500" />
              <span>Bank-level Security</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-amber-500" />
              <span>Instant Results</span>
            </div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-500" />
              <span>AI-Powered Insights</span>
            </div>
          </div>
        </div>

        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <span className="text-2xl font-bold text-blue-600">30%</span>
            </div>
            <h3 className="font-semibold text-slate-800 mb-2">Keyword Weight</h3>
            <p className="text-sm text-slate-600">
              Industry-specific keywords are crucial for ATS compatibility
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center mb-4">
              <span className="text-2xl font-bold text-emerald-600">25%</span>
            </div>
            <h3 className="font-semibold text-slate-800 mb-2">Formatting</h3>
            <p className="text-sm text-slate-600">
              Clean, ATS-friendly structure ensures proper parsing
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center mb-4">
              <span className="text-2xl font-bold text-amber-600">25%</span>
            </div>
            <h3 className="font-semibold text-slate-800 mb-2">Impact Score</h3>
            <p className="text-sm text-slate-600">
              Quantified achievements demonstrate your value
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
