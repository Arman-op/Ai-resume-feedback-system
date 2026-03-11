import { useState, useRef } from 'react';
import { Navbar } from '@/components/Navbar';
import { HeroSection } from '@/sections/HeroSection';
import { UploadSection } from '@/sections/UploadSection';
import { ResultsSection } from '@/sections/ResultsSection';
import { DashboardSection } from '@/sections/DashboardSection';
import { AuthProvider } from '@/hooks/useAuth';
import { ResumeProvider, useResume } from '@/hooks/useResume';
import type { Resume } from '@/types';
import { Toaster } from '@/components/ui/sonner';

type ViewState = 'landing' | 'upload' | 'results' | 'dashboard';

function AppContent() {
  const [view, setView] = useState<ViewState>('landing');
  const { currentResume, isAnalyzing } = useResume();
  const uploadRef = useRef<HTMLDivElement>(null);

  const handleGetStarted = () => {
    setView('upload');
    setTimeout(() => {
      uploadRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleAnalysisComplete = () => {
    if (currentResume && !isAnalyzing) {
      setView('results');
    }
  };

  const handleViewHistory = () => {
    setView('dashboard');
  };

  const handleSelectResume = (resume: Resume) => {
    setView('results');
  };

  const handleUploadNew = () => {
    setView('upload');
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      {view === 'landing' && (
        <HeroSection onGetStarted={handleGetStarted} />
      )}

      {view === 'upload' && (
        <>
          <div ref={uploadRef}>
            <UploadSection onAnalysisComplete={handleAnalysisComplete} />
          </div>
          {currentResume && !isAnalyzing && (
            <ResultsSection onViewHistory={handleViewHistory} />
          )}
        </>
      )}

      {view === 'results' && currentResume && (
        <ResultsSection onViewHistory={handleViewHistory} />
      )}

      {view === 'dashboard' && (
        <DashboardSection
          onUploadNew={handleUploadNew}
          onSelectResume={handleSelectResume}
        />
      )}

      <Toaster />
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <ResumeProvider>
        <AppContent />
      </ResumeProvider>
    </AuthProvider>
  );
}

export default App;
