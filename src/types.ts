export interface FreelancerProfile {
  name: string;
  title: string;
  bio: string;
  hourlyRate: number;
  minFixedRate: number;
  skills: string[];
  portfolioProjects: Array<{
    id: string;
    title: string;
    description: string;
    techStack: string[];
    resultMetric: string;
    liveUrl?: string;
  }>;
  tone: 'professional' | 'conversational' | 'technical' | 'high_impact';
  yearsOfExperience: number;
  availabilityHoursPerWeek: number;
  customSignature: string;
  uniqueSellingPoints: string[];
}

export interface JobPosting {
  id: string;
  title: string;
  description: string;
  platform: 'Freelancer' | 'Upwork' | 'Fiverr Pro' | 'Guru' | 'Toptal';
  category: string;
  budgetType: 'fixed' | 'hourly';
  minBudget: number;
  maxBudget: number;
  clientCountry: string;
  clientRating: number;
  clientReviewsCount: number;
  clientPaymentVerified: boolean;
  clientTotalSpent: number;
  skillsRequired: string[];
  proposalsCount: number;
  postedAt: string; // ISO or relative
  postedTimestamp: number;
  screeningQuestions?: string[];
  urgency: 'low' | 'normal' | 'high' | 'urgent';
  clientName?: string;
}

export interface BotFilterConfig {
  autoBidEnabled: boolean;
  testMode: boolean; // Dry-run mode
  minMatchScore: number; // 0 - 100
  minBudget: number;
  maxBudget: number;
  paymentVerifiedOnly: boolean;
  minClientRating: number; // 0 - 5
  maxProposalsCount: number; // e.g. only bid if proposals < 20
  speedDelaySeconds: number; // 0, 15, 30, 60, 120
  bidAmountStrategy: 'underbid_10' | 'underbid_5' | 'exact_median' | 'exact_max' | 'value_premium';
  autoAnswerScreeningQuestions: boolean;
  allowedPlatforms: string[];
  categoryWhitelist: string[];
}

export interface MilestoneItem {
  title: string;
  amount: number;
  durationDays: number;
  deliverable: string;
}

export interface ScreeningAnswer {
  question: string;
  answer: string;
}

export interface GeneratedBid {
  id: string;
  jobId: string;
  jobTitle: string;
  platform: string;
  jobCategory: string;
  proposalText: string;
  hookOpening: string;
  bidAmount: number;
  deliveryDays: number;
  milestones: MilestoneItem[];
  screeningAnswers: ScreeningAnswer[];
  matchScore: number;
  matchReasoning: string;
  clientPainPoints: string[];
  redFlags: string[];
  status: 'draft' | 'queued' | 'submitted' | 'viewed' | 'shortlisted' | 'interview_requested' | 'won' | 'rejected';
  timestamp: number;
  clientCountry: string;
  budgetFormatted: string;
}

export interface BotLogEntry {
  id: string;
  timestamp: number;
  type: 'scan' | 'filter_pass' | 'filter_reject' | 'bid_generated' | 'bid_submitted' | 'client_interaction' | 'alert';
  message: string;
  details?: {
    jobTitle?: string;
    jobId?: string;
    score?: number;
    reason?: string;
    bidAmount?: number;
    platform?: string;
  };
}

export interface JobAnalysisResult {
  matchScore: number;
  matchReasons: string[];
  missingSkills: string[];
  clientPsychology: string;
  budgetCompetitiveness: string;
  recommendedPrice: number;
  recommendedDays: number;
  redFlags: string[];
  suggestedQuestionsToClient: string[];
}
