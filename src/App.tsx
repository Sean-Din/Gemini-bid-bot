import React, { useState, useEffect, useRef } from 'react';
import { Navbar } from './components/Navbar';
import { LiveScanner } from './components/LiveScanner';
import { ManualBidGenerator } from './components/ManualBidGenerator';
import { BidsPipeline } from './components/BidsPipeline';
import { ProfileManager } from './components/ProfileManager';
import { BotSettings } from './components/BotSettings';
import { JobDetailModal } from './components/JobDetailModal';
import { BidDetailModal } from './components/BidDetailModal';
import {
  FreelancerProfile,
  JobPosting,
  BotFilterConfig,
  GeneratedBid,
  BotLogEntry,
} from './types';
import {
  DEFAULT_FREELANCER_PROFILE,
  DEFAULT_BOT_CONFIG,
  INITIAL_JOB_POSTINGS,
} from './data/initialData';
import { evaluateJobFit, generateRandomIncomingJob } from './utils/matching';
import { generateBidProposal, checkServerHealth } from './services/api';

const STORAGE_KEYS = {
  PROFILE: 'freelancer_bidbot_profile',
  CONFIG: 'freelancer_bidbot_config',
  BIDS: 'freelancer_bidbot_bids',
  LOGS: 'freelancer_bidbot_logs',
};

export default function App() {
  // Navigation State - default to manual bid generator for instant typing and generation
  const [activeTab, setActiveTab] = useState<'scanner' | 'manual' | 'pipeline' | 'profile' | 'settings'>('manual');

  // Freelancer Profile
  const [profile, setProfile] = useState<FreelancerProfile>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PROFILE);
      return saved ? JSON.parse(saved) : DEFAULT_FREELANCER_PROFILE;
    } catch {
      return DEFAULT_FREELANCER_PROFILE;
    }
  });

  // Bot Configuration
  const [botConfig, setBotConfig] = useState<BotFilterConfig>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CONFIG);
      return saved ? JSON.parse(saved) : DEFAULT_BOT_CONFIG;
    } catch {
      return DEFAULT_BOT_CONFIG;
    }
  });

  // Jobs Feed
  const [jobs, setJobs] = useState<JobPosting[]>(INITIAL_JOB_POSTINGS);

  // Bids Pipeline
  const [bids, setBids] = useState<GeneratedBid[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.BIDS);
      if (saved) return JSON.parse(saved);
      // Seed an initial sample bid
      return [
        {
          id: 'bid-seed-1',
          jobId: 'job-101',
          jobTitle: 'Build Modern AI-Powered Dashboard with Next.js & Tailwind CSS',
          platform: 'Upwork',
          jobCategory: 'Web Development',
          proposalText: `Hi,\n\nI reviewed your dashboard requirements and noticed you need an expert in Next.js 14 App Router and LLM API streaming. I recently built a lead intelligence dashboard processing 50k+ events/month with sub-second response times.\n\nHere is what I will deliver:\n- Clean, type-safe Next.js components matching your Figma design with 100% precision\n- Robust API endpoints with caching and zero frontend latency\n- Daily staging deployment previews and video walk-throughs\n\nI am available to start today. Let's schedule a brief 5-minute call!\n\nBest regards,\nAlex Rivera | Senior Full-Stack & AI Engineer`,
          hookOpening: 'I noticed your requirement for Next.js App Router and can deliver a pixel-perfect, high-performance dashboard within 10 days.',
          bidAmount: 1450,
          deliveryDays: 10,
          milestones: [
            {
              title: 'Phase 1: Architecture & UI Setup',
              amount: 500,
              durationDays: 3,
              deliverable: 'Figma to React conversion with mock data',
            },
            {
              title: 'Phase 2: LLM API Integration & State',
              amount: 650,
              durationDays: 5,
              deliverable: 'Live streaming API hooks and analytics charts',
            },
            {
              title: 'Phase 3: QA, Handover & Docs',
              amount: 300,
              durationDays: 2,
              deliverable: 'Production deployment and clean documentation',
            },
          ],
          screeningAnswers: [
            {
              question: 'Can you share 1-2 live links of dashboards you have built?',
              answer: 'Yes! You can check demo-leadflow.app and demo-shopmetrics.io for live interactive previews.',
            },
            {
              question: 'How soon can you start?',
              answer: 'I can start today and commit up to 40 hours/week.',
            },
          ],
          matchScore: 94,
          matchReasoning: 'Exact tech stack match (Next.js, Tailwind, TypeScript, APIs).',
          clientPainPoints: ['Needs fast delivery without sacrificing code quality'],
          redFlags: [],
          status: 'interview_requested',
          timestamp: Date.now() - 3600000,
          clientCountry: 'United States',
          budgetFormatted: '$1,200 - $1,800',
        },
      ];
    } catch {
      return [];
    }
  });

  // Bot Engine Logs
  const [logs, setLogs] = useState<BotLogEntry[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.LOGS);
      if (saved) return JSON.parse(saved);
      return [
        {
          id: 'log-1',
          timestamp: Date.now() - 600000,
          type: 'scan',
          message: 'Scanned 6 active postings across Upwork, Freelancer, and Toptal',
        },
        {
          id: 'log-2',
          timestamp: Date.now() - 500000,
          type: 'filter_pass',
          message: 'Matched "Build Modern AI-Powered Dashboard" (94% score)',
        },
        {
          id: 'log-3',
          timestamp: Date.now() - 400000,
          type: 'bid_generated',
          message: 'AI generated tailored 160-word proposal with 3 milestones',
        },
        {
          id: 'log-4',
          timestamp: Date.now() - 250000,
          type: 'bid_submitted',
          message: 'Bid dispatched to client ($1,450, 10 days)',
        },
        {
          id: 'log-5',
          timestamp: Date.now() - 100000,
          type: 'client_interaction',
          message: 'Client viewed proposal and invited you to an interview!',
        },
      ];
    } catch {
      return [];
    }
  });

  // UI state
  const [isScanning, setIsScanning] = useState(false);
  const [isGeneratingBid, setIsGeneratingBid] = useState(false);
  const [generatingJobId, setGeneratingJobId] = useState<string | null>(null);
  const [selectedJobForModal, setSelectedJobForModal] = useState<JobPosting | null>(null);
  const [selectedBidForModal, setSelectedBidForModal] = useState<GeneratedBid | null>(null);
  const [manualPresetJob, setManualPresetJob] = useState<JobPosting | null>(null);
  const [hasApiKey, setHasApiKey] = useState(true);

  // Server health check
  useEffect(() => {
    checkServerHealth().then((res) => {
      setHasApiKey(res.hasApiKey);
    });
  }, []);

  // Persistence effects
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
    } catch (e) {
      console.error(e);
    }
  }, [profile]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(botConfig));
    } catch (e) {
      console.error(e);
    }
  }, [botConfig]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.BIDS, JSON.stringify(bids));
    } catch (e) {
      console.error(e);
    }
  }, [bids]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(logs.slice(0, 50)));
    } catch (e) {
      console.error(e);
    }
  }, [logs]);

  // Append a log entry
  const addLog = (
    type: BotLogEntry['type'],
    message: string,
    details?: BotLogEntry['details']
  ) => {
    const newLog: BotLogEntry = {
      id: 'log-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
      timestamp: Date.now(),
      type,
      message,
      details,
    };
    setLogs((prev) => [newLog, ...prev.slice(0, 49)]);
  };

  // Manual Trigger: Scan for new incoming jobs
  const handleTriggerScan = () => {
    setIsScanning(true);
    addLog('scan', 'Running live multi-platform scan across Freelancer, Upwork, and Toptal...');

    setTimeout(() => {
      const newJob = generateRandomIncomingJob();
      setJobs((prev) => [newJob, ...prev]);

      const evalResult = evaluateJobFit(newJob, profile, botConfig);
      if (evalResult.passed) {
        addLog('filter_pass', `New project passed criteria: "${newJob.title.slice(0, 40)}..."`, {
          score: evalResult.score,
          jobTitle: newJob.title,
        });
      } else {
        addLog('filter_reject', `Filtered out: "${newJob.title.slice(0, 35)}..."`, {
          score: evalResult.score,
          reason: evalResult.rejectionReasons[0] || 'Did not meet criteria',
        });
      }

      setIsScanning(false);
    }, 1200);
  };

  // 1-Click Instant AI Bid Generation
  const handleInstantGenerateBid = async (job: JobPosting) => {
    setIsGeneratingBid(true);
    setGeneratingJobId(job.id);
    addLog('scan', `Generating AI proposal for "${job.title.slice(0, 35)}..."`);

    try {
      const generated = await generateBidProposal(job, profile, botConfig);
      const targetStatus: GeneratedBid['status'] = botConfig.testMode ? 'draft' : 'submitted';
      const finalBid: GeneratedBid = {
        ...generated,
        status: targetStatus,
      };

      setBids((prev) => [finalBid, ...prev]);

      addLog(
        'bid_generated',
        `AI proposal crafted (${generated.proposalText.split(/\s+/).length} words, Match: ${generated.matchScore}%)`,
        { bidAmount: generated.bidAmount }
      );

      if (targetStatus === 'submitted') {
        addLog('bid_submitted', `Bid submitted to ${job.platform} for $${generated.bidAmount}`, {
          platform: job.platform,
        });
      } else {
        addLog('bid_submitted', `Draft created in pipeline ($${generated.bidAmount}) - Dry Run`, {
          platform: job.platform,
        });
      }
    } catch (err: any) {
      console.error(err);
      addLog('alert', `Bid generation failed: ${err.message || 'Error'}`);
    } finally {
      setIsGeneratingBid(false);
      setGeneratingJobId(null);
    }
  };

  // Handle saving proposal from Manual Generator
  const handleSaveBidToPipeline = (bid: GeneratedBid) => {
    setBids((prev) => {
      const existing = prev.findIndex((b) => b.id === bid.id);
      if (existing >= 0) {
        const updated = [...prev];
        updated[existing] = bid;
        return updated;
      }
      return [bid, ...prev];
    });

    addLog('bid_submitted', `Bid added to pipeline: "${bid.jobTitle.slice(0, 35)}..." ($${bid.bidAmount})`);
  };

  // Update Bid Status in Pipeline
  const handleUpdateBidStatus = (bidId: string, status: GeneratedBid['status']) => {
    setBids((prev) =>
      prev.map((b) => (b.id === bidId ? { ...b, status } : b))
    );
    addLog('client_interaction', `Bid status changed to [${status.toUpperCase()}]`);
  };

  // Delete Bid
  const handleDeleteBid = (bidId: string) => {
    setBids((prev) => prev.filter((b) => b.id !== bidId));
  };

  // Background Auto-Bidding Loop
  useEffect(() => {
    if (!botConfig.autoBidEnabled) return;

    addLog('scan', 'Auto-Bid engine started. Scanning live project streams...');

    const interval = setInterval(async () => {
      // 1. Generate or pick a fresh incoming job
      const incomingJob = generateRandomIncomingJob();
      setJobs((prev) => [incomingJob, ...prev.slice(0, 29)]);

      const evaluation = evaluateJobFit(incomingJob, profile, botConfig);

      if (evaluation.passed) {
        addLog('filter_pass', `Target found: "${incomingJob.title.slice(0, 40)}..." (Match: ${evaluation.score}%)`);

        // Wait delay if configured
        const delay = (botConfig.speedDelaySeconds || 0) * 1000;
        if (delay > 0) {
          await new Promise((r) => setTimeout(r, Math.min(delay, 4000)));
        }

        try {
          const bid = await generateBidProposal(incomingJob, profile, botConfig);
          const finalStatus: GeneratedBid['status'] = botConfig.testMode ? 'draft' : 'submitted';
          const newBid: GeneratedBid = {
            ...bid,
            status: finalStatus,
          };

          setBids((prev) => [newBid, ...prev]);

          addLog(
            'bid_generated',
            `Crafted proposal for $${newBid.bidAmount} in ${newBid.deliveryDays} days`,
            { bidAmount: newBid.bidAmount }
          );

          if (finalStatus === 'submitted') {
            addLog('bid_submitted', `Dispatched bid to ${incomingJob.platform} (Proposals: ${incomingJob.proposalsCount + 1})`);
          } else {
            addLog('bid_submitted', `Saved as draft (Safe Dry-Run Mode)`);
          }

          // Random chance for simulated client engagement
          if (Math.random() > 0.6) {
            setTimeout(() => {
              setBids((bidsList) =>
                bidsList.map((b) =>
                  b.id === newBid.id ? { ...b, status: 'interview_requested' } : b
                )
              );
              addLog('client_interaction', `Client for "${incomingJob.title.slice(0, 30)}..." sent an interview message!`);
            }, 12000);
          }
        } catch (err: any) {
          console.error('Auto-bid generation error', err);
          addLog('alert', `Failed to generate bid: ${err.message || 'Error'}`);
        }
      } else {
        addLog('filter_reject', `Filtered out: "${incomingJob.title.slice(0, 35)}..." (${evaluation.rejectionReasons[0] || 'Failed criteria'})`);
      }
    }, 22000);

    return () => clearInterval(interval);
  }, [botConfig.autoBidEnabled, botConfig.testMode, botConfig.minMatchScore, profile]);

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-[#e0e0e0] flex flex-col font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Top Navigation */}
      <Navbar hasApiKey={hasApiKey} />

      {/* Main Workspace Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <ManualBidGenerator
          profile={profile}
          botConfig={botConfig}
          initialJob={manualPresetJob}
          onSaveToPipeline={handleSaveBidToPipeline}
        />
      </main>

      {/* Job Detail / AI Intelligence Modal */}
      {selectedJobForModal && (
        <JobDetailModal
          job={selectedJobForModal}
          onClose={() => setSelectedJobForModal(null)}
          profile={profile}
          botConfig={botConfig}
          onGenerateBidForJob={(job) => {
            setManualPresetJob(job);
            setActiveTab('manual');
          }}
        />
      )}

      {/* Bid Details Modal */}
      {selectedBidForModal && (
        <BidDetailModal
          bid={selectedBidForModal}
          onClose={() => setSelectedBidForModal(null)}
          onUpdateStatus={handleUpdateBidStatus}
        />
      )}
    </div>
  );
}
