import type { User, Resume, AnalysisResult } from '@/types';

export const mockUser: User = {
  id: 'user-001',
  email: 'john.doe@example.com',
  name: 'John Doe',
  avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=john',
  created_at: '2024-01-15T10:30:00Z',
};

export const mockAnalysisResult: AnalysisResult = {
  overall_feedback: 'Your resume demonstrates solid professional experience with measurable achievements. The formatting is clean but could benefit from more ATS-friendly section headers. Consider adding more industry-specific keywords and quantifying additional accomplishments.',
  keyword_analysis: {
    score: 78,
    matched_keywords: ['Project Management', 'Agile', 'Team Leadership', 'Strategic Planning', 'Data Analysis', 'Python', 'SQL'],
    missing_keywords: ['Stakeholder Management', 'Risk Assessment', 'Budget Oversight', 'KPI Tracking', 'Cross-functional Collaboration'],
    suggestions: [
      'Add "Stakeholder Management" to your experience section',
      'Include "Budget Oversight" if you have managed project budgets',
      'Mention "KPI Tracking" in relation to performance metrics',
    ],
  },
  formatting_analysis: {
    score: 85,
    issues: ['Inconsistent date formatting', 'Section headers use special characters'],
    suggestions: [
      'Standardize date format to MM/YYYY throughout',
      'Replace special characters in headers with plain text',
      'Ensure single-column layout for better ATS parsing',
      'Use standard section titles: Experience, Education, Skills',
    ],
  },
  impact_analysis: {
    score: 72,
    quantified_results: [
      'Increased team productivity by 25%',
      'Reduced project delivery time by 15%',
      'Managed team of 8 engineers',
    ],
    missing_metrics: [
      'Revenue impact of your projects',
      'Cost savings achieved',
      'User/customer growth metrics',
    ],
    suggestions: [
      'Add dollar amounts or percentages for budget management',
      'Include customer satisfaction scores if available',
      'Quantify the scale of systems or teams you managed',
    ],
  },
  completeness_analysis: {
    score: 90,
    present_sections: ['Contact Information', 'Professional Summary', 'Work Experience', 'Education', 'Skills'],
    missing_sections: ['Certifications', 'Projects', 'Publications'],
    suggestions: [
      'Add a Certifications section if you have any professional certifications',
      'Include a Projects section to showcase specific achievements',
      'Consider adding Publications if applicable to your field',
    ],
  },
  improvement_plan: [
    'Week 1: Add missing keywords and standardize formatting',
    'Week 2: Quantify 3 more achievements with metrics',
    'Week 3: Add Certifications and Projects sections',
    'Week 4: Review and optimize for specific job descriptions',
  ],
};

export const mockResumes: Resume[] = [
  {
    id: 'resume-001',
    user_id: 'user-001',
    filename: 'John_Doe_Resume_2024.pdf',
    file_url: '/uploads/resume-001.pdf',
    ats_score: 81,
    keyword_score: 78,
    formatting_score: 85,
    impact_score: 72,
    completeness_score: 90,
    analysis_result: mockAnalysisResult,
    created_at: '2024-01-20T14:30:00Z',
    updated_at: '2024-01-20T14:30:00Z',
  },
  {
    id: 'resume-002',
    user_id: 'user-001',
    filename: 'John_Doe_Resume_v2.pdf',
    file_url: '/uploads/resume-002.pdf',
    ats_score: 76,
    keyword_score: 70,
    formatting_score: 82,
    impact_score: 68,
    completeness_score: 85,
    analysis_result: {
      ...mockAnalysisResult,
      overall_feedback: 'Good foundation with room for improvement in keyword optimization.',
    },
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-15T10:00:00Z',
  },
  {
    id: 'resume-003',
    user_id: 'user-001',
    filename: 'John_Doe_Resume_Old.pdf',
    file_url: '/uploads/resume-003.pdf',
    ats_score: 68,
    keyword_score: 62,
    formatting_score: 75,
    impact_score: 58,
    completeness_score: 80,
    analysis_result: {
      ...mockAnalysisResult,
      overall_feedback: 'Significant improvements needed. Focus on quantifying achievements and adding relevant keywords.',
    },
    created_at: '2024-01-10T09:15:00Z',
    updated_at: '2024-01-10T09:15:00Z',
  },
];

export const scoreHistory = [
  { date: 'Jan 10', score: 68 },
  { date: 'Jan 15', score: 76 },
  { date: 'Jan 20', score: 81 },
];
