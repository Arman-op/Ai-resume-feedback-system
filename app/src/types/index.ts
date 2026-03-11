export interface User {
  id: string;
  email: string;
  name: string;
  avatar_url?: string;
  created_at: string;
}

export interface Resume {
  id: string;
  user_id: string;
  filename: string;
  file_url: string;
  ats_score: number;
  keyword_score: number;
  formatting_score: number;
  impact_score: number;
  completeness_score: number;
  analysis_result: AnalysisResult;
  created_at: string;
  updated_at: string;
}

export interface AnalysisResult {
  overall_feedback: string;
  keyword_analysis: {
    score: number;
    matched_keywords: string[];
    missing_keywords: string[];
    suggestions: string[];
  };
  formatting_analysis: {
    score: number;
    issues: string[];
    suggestions: string[];
  };
  impact_analysis: {
    score: number;
    quantified_results: string[];
    missing_metrics: string[];
    suggestions: string[];
  };
  completeness_analysis: {
    score: number;
    present_sections: string[];
    missing_sections: string[];
    suggestions: string[];
  };
  improvement_plan: string[];
}

export interface ScoreBreakdown {
  keyword_score: number;
  formatting_score: number;
  impact_score: number;
  completeness_score: number;
  overall_score: number;
}

export interface UploadState {
  isUploading: boolean;
  progress: number;
  error: string | null;
}
