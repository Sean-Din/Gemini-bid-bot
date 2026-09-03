import { FreelancerProfile, JobPosting, BotFilterConfig, GeneratedBid, JobAnalysisResult } from '../types';

export async function checkServerHealth(): Promise<{ status: string; hasApiKey: boolean }> {
  try {
    const res = await fetch('/api/health');
    if (!res.ok) throw new Error('Health check failed');
    return await res.json();
  } catch {
    return { status: 'offline', hasApiKey: false };
  }
}

export async function generateBidProposal(
  job: JobPosting,
  profile: FreelancerProfile,
  strategyConfig?: Partial<BotFilterConfig>,
  model?: string
): Promise<GeneratedBid & { modelUsed?: string }> {
  const res = await fetch('/api/generate-bid', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ job, profile, strategyConfig, model }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Failed to generate proposal' }));
    throw new Error(err.error || 'Server error');
  }

  const data = await res.json();

  const formattedBudget =
    job.budgetType === 'fixed'
      ? `$${job.minBudget} - $${job.maxBudget}`
      : `$${job.minBudget} - $${job.maxBudget}/hr`;

  return {
    id: 'bid-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
    jobId: job.id,
    jobTitle: job.title,
    platform: job.platform,
    jobCategory: job.category,
    proposalText: data.proposalText,
    hookOpening: data.hookOpening,
    bidAmount: data.bidAmount || (job.budgetType === 'fixed' ? job.maxBudget : profile.hourlyRate),
    deliveryDays: data.deliveryDays || 5,
    milestones: data.milestones || [],
    screeningAnswers: data.screeningAnswers || [],
    matchScore: data.matchScore || 85,
    matchReasoning: data.matchReasoning || 'Strong alignment with your profile skills.',
    clientPainPoints: data.clientPainPoints || [],
    redFlags: data.redFlags || [],
    status: 'draft',
    timestamp: Date.now(),
    clientCountry: job.clientCountry,
    budgetFormatted: formattedBudget,
    modelUsed: data.modelUsed || model || 'gemini-3.8-flash',
  };
}

export async function analyzeJob(
  job: JobPosting,
  profile: FreelancerProfile,
  model?: string
): Promise<JobAnalysisResult> {
  const res = await fetch('/api/analyze-job', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ job, profile, model }),
  });

  if (!res.ok) {
    throw new Error('Failed to analyze job');
  }

  return await res.json();
}

export async function rewriteProposal(
  currentProposal: string,
  jobTitle: string,
  instruction: string,
  profile: FreelancerProfile,
  model?: string
): Promise<string> {
  const res = await fetch('/api/rewrite-proposal', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ currentProposal, jobTitle, instruction, profile, model }),
  });

  if (!res.ok) {
    throw new Error('Failed to rewrite proposal');
  }

  const data = await res.json();
  return data.updatedProposal;
}

export async function optimizeProfile(
  profile: FreelancerProfile,
  targetNiche?: string
): Promise<{
  improvedTitle: string;
  improvedBio: string;
  suggestedSkills: string[];
  suggestedHooks: string[];
  actionableTips: string[];
}> {
  const res = await fetch('/api/optimize-profile', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ profile, targetNiche }),
  });

  if (!res.ok) {
    throw new Error('Failed to optimize profile');
  }

  return await res.json();
}
