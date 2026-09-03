import { FreelancerProfile, JobPosting, BotFilterConfig } from '../types';
import { MOCK_JOB_POOL } from '../data/initialData';

export interface FilterEvaluation {
  passed: boolean;
  score: number;
  rejectionReasons: string[];
  matchedSkills: string[];
  missingSkills: string[];
}

export function evaluateJobFit(
  job: JobPosting,
  profile: FreelancerProfile,
  config: BotFilterConfig
): FilterEvaluation {
  const rejectionReasons: string[] = [];
  const matchedSkills: string[] = [];
  const missingSkills: string[] = [];

  // 1. Skill overlap calculation
  const jobSkills = job.skillsRequired || [];
  const profileSkillsLower = profile.skills.map((s) => s.toLowerCase());

  jobSkills.forEach((skill) => {
    const isMatch = profileSkillsLower.some(
      (ps) => ps.includes(skill.toLowerCase()) || skill.toLowerCase().includes(ps)
    );
    if (isMatch) {
      matchedSkills.push(skill);
    } else {
      missingSkills.push(skill);
    }
  });

  const skillMatchRatio =
    jobSkills.length > 0 ? matchedSkills.length / jobSkills.length : 0.8;
  let baseScore = Math.round(skillMatchRatio * 70);

  // Bonus for high client rating & payment verified
  if (job.clientPaymentVerified) baseScore += 15;
  if (job.clientRating >= 4.8) baseScore += 10;
  if (job.proposalsCount < 10) baseScore += 5; // Early bird advantage

  const finalScore = Math.min(99, Math.max(20, baseScore));

  // 2. Filter checks
  if (finalScore < config.minMatchScore) {
    rejectionReasons.push(`Match score (${finalScore}%) is below minimum threshold (${config.minMatchScore}%)`);
  }

  if (config.paymentVerifiedOnly && !job.clientPaymentVerified) {
    rejectionReasons.push('Client payment method is unverified');
  }

  if (job.clientRating < config.minClientRating) {
    rejectionReasons.push(`Client rating (${job.clientRating.toFixed(1)}) is below minimum (${config.minClientRating})`);
  }

  if (job.budgetType === 'fixed') {
    if (job.maxBudget < config.minBudget) {
      rejectionReasons.push(`Budget ($${job.maxBudget}) is below minimum limit ($${config.minBudget})`);
    }
    if (job.minBudget > config.maxBudget) {
      rejectionReasons.push(`Budget ($${job.minBudget}) exceeds maximum threshold ($${config.maxBudget})`);
    }
  }

  if (job.proposalsCount > config.maxProposalsCount) {
    rejectionReasons.push(`Already has ${job.proposalsCount} proposals (limit: ${config.maxProposalsCount})`);
  }

  if (config.allowedPlatforms?.length > 0 && !config.allowedPlatforms.includes(job.platform)) {
    rejectionReasons.push(`Platform "${job.platform}" not enabled in bot filters`);
  }

  return {
    passed: rejectionReasons.length === 0,
    score: finalScore,
    rejectionReasons,
    matchedSkills,
    missingSkills,
  };
}

export function generateRandomIncomingJob(): JobPosting {
  const randomTemplate = MOCK_JOB_POOL[Math.floor(Math.random() * MOCK_JOB_POOL.length)];
  const id = 'job-live-' + Date.now().toString().slice(-6);
  const platforms: Array<'Freelancer' | 'Upwork' | 'Fiverr Pro' | 'Guru' | 'Toptal'> = [
    'Freelancer',
    'Upwork',
    'Fiverr Pro',
    'Guru',
    'Toptal',
  ];
  const countries = ['United States', 'Germany', 'United Kingdom', 'Canada', 'Australia', 'Netherlands', 'Sweden', 'Singapore'];

  const budgetMultiplier = (0.85 + Math.random() * 0.4);
  const minB = Math.round((randomTemplate.minBudget || 500) * budgetMultiplier);
  const maxB = Math.round((randomTemplate.maxBudget || 1200) * budgetMultiplier);

  return {
    id,
    title: randomTemplate.title || 'Custom Full Stack Application Development',
    description: randomTemplate.description || 'Looking for an experienced developer to build our application.',
    platform: platforms[Math.floor(Math.random() * platforms.length)],
    category: randomTemplate.category || 'Web Development',
    budgetType: randomTemplate.budgetType || 'fixed',
    minBudget: minB,
    maxBudget: maxB,
    clientCountry: countries[Math.floor(Math.random() * countries.length)],
    clientRating: +(4.5 + Math.random() * 0.5).toFixed(2),
    clientReviewsCount: Math.floor(Math.random() * 45) + 3,
    clientPaymentVerified: Math.random() > 0.15,
    clientTotalSpent: Math.floor(Math.random() * 50000) + 1500,
    skillsRequired: randomTemplate.skillsRequired || ['React', 'TypeScript', 'Node.js'],
    proposalsCount: Math.floor(Math.random() * 8) + 1,
    postedAt: 'Just now',
    postedTimestamp: Date.now(),
    urgency: Math.random() > 0.6 ? 'high' : 'normal',
    screeningQuestions: randomTemplate.screeningQuestions || [
      'What is your past experience in building similar projects?',
    ],
  };
}
