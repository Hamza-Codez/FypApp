export type UserRole = 'applicant' | 'hr';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  name: string;
}

export interface ApplicantProfile extends User {
  role: 'applicant';
  phone?: string;
  skills: string[];
  experienceYears: number;
  education: string;
  portfolio?: string;
  resumeUrl?: string;
}

export interface HRProfile extends User {
  role: 'hr';
  companyName: string;
  phone?: string;
  industry: string;
  teamSize: string;
  budgetRange?: string;
}

export interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  salary: string;
  skills: string[];
  matchPercentage: number;
  postedDate: string;
  description: string;
  type: 'Full-time' | 'Part-time' | 'Contract' | 'Remote';
}

export interface Applicant {
  id: string;
  name: string;
  email: string;
  skills: string[];
  matchScore: number;
  experienceYears: number;
  education: string;
  resumeUrl?: string;
  appliedDate: string;
}

export interface ResumeAnalysis {
  overallScore: number;
  skillsMatch: number;
  experienceMatch: number;
  educationMatch: number;
  highlights: string[];
  gaps: string[];
  recommendations: string[];
}


