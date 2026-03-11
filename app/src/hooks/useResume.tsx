import { useState, useEffect, createContext, useContext, type ReactNode } from 'react';
import type { Resume, AnalysisResult, UploadState } from '@/types';
import { mockResumes, mockAnalysisResult } from '@/lib/mockData';

interface ResumeContextType {
  resumes: Resume[];
  currentResume: Resume | null;
  uploadState: UploadState;
  isAnalyzing: boolean;
  fetchResumes: () => Promise<void>;
  uploadResume: (file: File) => Promise<void>;
  analyzeResume: (resumeId: string) => Promise<void>;
  selectResume: (resume: Resume | null) => void;
  deleteResume: (resumeId: string) => Promise<void>;
}

const ResumeContext = createContext<ResumeContextType | undefined>(undefined);

export function ResumeProvider({ children }: { children: ReactNode }) {
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [currentResume, setCurrentResume] = useState<Resume | null>(null);
  const [uploadState, setUploadState] = useState<UploadState>({
    isUploading: false,
    progress: 0,
    error: null,
  });
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    fetchResumes();
  }, []);

  const fetchResumes = async () => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    setResumes(mockResumes);
  };

  const uploadResume = async (file: File) => {
    setUploadState({ isUploading: true, progress: 0, error: null });

    try {
      for (let i = 0; i <= 100; i += 10) {
        await new Promise((resolve) => setTimeout(resolve, 200));
        setUploadState((prev) => ({ ...prev, progress: i }));
      }

      const newResume: Resume = {
        id: `resume-${Date.now()}`,
        user_id: 'user-001',
        filename: file.name,
        file_url: URL.createObjectURL(file),
        ats_score: 0,
        keyword_score: 0,
        formatting_score: 0,
        impact_score: 0,
        completeness_score: 0,
        analysis_result: mockAnalysisResult,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      setResumes((prev) => [newResume, ...prev]);
      setCurrentResume(newResume);
      setUploadState({ isUploading: false, progress: 100, error: null });

      await analyzeResume(newResume.id);
    } catch (error) {
      setUploadState({
        isUploading: false,
        progress: 0,
        error: 'Failed to upload resume. Please try again.',
      });
    }
  };

  const analyzeResume = async (resumeId: string) => {
    setIsAnalyzing(true);

    await new Promise((resolve) => setTimeout(resolve, 3000));

    const analysisResult: AnalysisResult = {
      ...mockAnalysisResult,
      keyword_analysis: {
        ...mockAnalysisResult.keyword_analysis,
        score: Math.floor(Math.random() * 30) + 60,
      },
      formatting_analysis: {
        ...mockAnalysisResult.formatting_analysis,
        score: Math.floor(Math.random() * 25) + 70,
      },
      impact_analysis: {
        ...mockAnalysisResult.impact_analysis,
        score: Math.floor(Math.random() * 35) + 55,
      },
      completeness_analysis: {
        ...mockAnalysisResult.completeness_analysis,
        score: Math.floor(Math.random() * 20) + 75,
      },
    };

    const keywordScore = analysisResult.keyword_analysis.score;
    const formattingScore = analysisResult.formatting_analysis.score;
    const impactScore = analysisResult.impact_analysis.score;
    const completenessScore = analysisResult.completeness_analysis.score;

    const atsScore = Math.round(
      keywordScore * 0.30 +
      formattingScore * 0.25 +
      impactScore * 0.25 +
      completenessScore * 0.20
    );

    setResumes((prev) =>
      prev.map((resume) =>
        resume.id === resumeId
          ? {
              ...resume,
              ats_score: atsScore,
              keyword_score: keywordScore,
              formatting_score: formattingScore,
              impact_score: impactScore,
              completeness_score: completenessScore,
              analysis_result: analysisResult,
            }
          : resume
      )
    );

    setCurrentResume((prev) =>
      prev?.id === resumeId
        ? {
            ...prev,
            ats_score: atsScore,
            keyword_score: keywordScore,
            formatting_score: formattingScore,
            impact_score: impactScore,
            completeness_score: completenessScore,
            analysis_result: analysisResult,
          }
        : prev
    );

    setIsAnalyzing(false);
  };

  const selectResume = (resume: Resume | null) => {
    setCurrentResume(resume);
  };

  const deleteResume = async (resumeId: string) => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    setResumes((prev) => prev.filter((r) => r.id !== resumeId));
    if (currentResume?.id === resumeId) {
      setCurrentResume(null);
    }
  };

  const value = {
    resumes,
    currentResume,
    uploadState,
    isAnalyzing,
    fetchResumes,
    uploadResume,
    analyzeResume,
    selectResume,
    deleteResume,
  };

  return (
    <ResumeContext.Provider value={value}>
      {children}
    </ResumeContext.Provider>
  );
}

export function useResume() {
  const context = useContext(ResumeContext);
  if (context === undefined) {
    throw new Error('useResume must be used within a ResumeProvider');
  }
  return context;
}
