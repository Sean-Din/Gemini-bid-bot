import React, { useState } from 'react';
import {
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Sparkles,
  Zap,
  Terminal,
  ShieldCheck,
  Star,
  MapPin,
  Clock,
  ArrowRight,
  Send,
  Eye,
  Trash2,
  SlidersHorizontal,
  Flame,
} from 'lucide-react';
import { JobPosting, FreelancerProfile, BotFilterConfig, BotLogEntry, GeneratedBid } from '../types';
import { evaluateJobFit } from '../utils/matching';

interface LiveScannerProps {
  jobs: JobPosting[];
  profile: FreelancerProfile;
  botConfig: BotFilterConfig;
  logs: BotLogEntry[];
  onClearLogs: () => void;
  onOpenJobDetail: (job: JobPosting) => void;
  onInstantGenerateBid: (job: JobPosting) => void;
  isGeneratingBid: boolean;
  generatingJobId: string | null;
  onOpenManualWithJob: (job: JobPosting) => void;
}

export const LiveScanner: React.FC<LiveScannerProps> = ({
  jobs,
  profile,
  botConfig,
  logs,
  onClearLogs,
  onOpenJobDetail,
  onInstantGenerateBid,
  isGeneratingBid,
  generatingJobId,
  onOpenManualWithJob,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPlatform, setSelectedPlatform] = useState<string>('all');
  const [filterMode, setFilterMode] = useState<'all' | 'passed_only' | 'high_match'>('all');

  const filteredJobs = jobs.filter((job) => {
    // Search query filter
    const matchesSearch =
      job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.skillsRequired.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesSearch) return false;

    // Platform filter
    if (selectedPlatform !== 'all' && job.platform !== selectedPlatform) {
      return false;
    }

    // Evaluation
    const evalResult = evaluateJobFit(job, profile, botConfig);
    if (filterMode === 'passed_only' && !evalResult.passed) {
      return false;
    }
    if (filterMode === 'high_match' && evalResult.score < 80) {
      return false;
    }

    return true;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner / Strategy Summary */}
      <div className="bg-[#161618] border border-[#2a2a2d] p-5 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <h2 className="text-lg font-bold text-zinc-100">Live Project Radar & Multi-Platform Scanner</h2>
          </div>
          <p className="text-xs text-zinc-400 mt-1 max-w-2xl leading-relaxed">
            Continuously analyzing job postings across Freelancer.com, Upwork, Fiverr Pro & Toptal. Matching client requirements against your profile skills, budget thresholds, and win probability in real-time.
          </p>
        </div>

        <div className="flex items-center gap-3 bg-[#1c1c1f] p-2.5 rounded-xl border border-[#2a2a2d] text-xs font-mono">
          <div>
            <span className="text-zinc-500 block text-[10px] uppercase font-semibold">Min Match</span>
            <span className="text-blue-400 font-bold">{botConfig.minMatchScore}%</span>
          </div>
          <div className="h-6 w-px bg-[#2a2a2d]" />
          <div>
            <span className="text-zinc-500 block text-[10px] uppercase font-semibold">Budget Min</span>
            <span className="text-emerald-400 font-bold">${botConfig.minBudget}</span>
          </div>
          <div className="h-6 w-px bg-[#2a2a2d]" />
          <div>
            <span className="text-zinc-500 block text-[10px] uppercase font-semibold">Verified Only</span>
            <span className={botConfig.paymentVerifiedOnly ? 'text-emerald-400 font-bold' : 'text-zinc-400 font-bold'}>
              {botConfig.paymentVerifiedOnly ? 'YES' : 'OFF'}
            </span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-[#161618] p-3 rounded-xl border border-[#2a2a2d]">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search keywords, tech stack (e.g. Next.js, Python, Scraper, AI)..."
            className="w-full pl-9 pr-4 py-2 bg-[#0e0e10] border border-[#2a2a2d] rounded-lg text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-blue-500 transition"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          {/* Platform Pills */}
          <div className="flex items-center gap-1 bg-[#0e0e10] p-1 rounded-lg border border-[#2a2a2d] text-xs">
            {['all', 'Freelancer', 'Upwork', 'Fiverr Pro', 'Toptal'].map((platform) => (
              <button
                key={platform}
                onClick={() => setSelectedPlatform(platform)}
                className={`px-2.5 py-1 rounded-md font-medium capitalize transition whitespace-nowrap ${
                  selectedPlatform === platform
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                {platform}
              </button>
            ))}
          </div>

          {/* Filter Mode */}
          <select
            value={filterMode}
            onChange={(e) => setFilterMode(e.target.value as any)}
            className="px-3 py-2 bg-[#0e0e10] border border-[#2a2a2d] rounded-lg text-xs text-zinc-300 focus:outline-none focus:border-blue-500"
          >
            <option value="all">All Jobs ({jobs.length})</option>
            <option value="passed_only">Passed Auto-Bid Criteria</option>
            <option value="high_match">High Win Rate (&gt;80%)</option>
          </select>
        </div>
      </div>

      {/* Main Grid: Left Jobs List + Right Activity Terminal */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Job Postings Feed */}
        <div className="lg:col-span-8 space-y-4">
          <div className="flex items-center justify-between text-xs text-zinc-400 px-1">
            <span>Showing {filteredJobs.length} live project opportunities</span>
            <span>Sorted by newest arrival</span>
          </div>

          {filteredJobs.length === 0 ? (
            <div className="p-12 text-center bg-[#161618] border border-[#2a2a2d] rounded-2xl space-y-3">
              <Filter className="w-8 h-8 text-zinc-600 mx-auto" />
              <p className="text-sm text-zinc-300 font-medium">No projects match the current filter criteria</p>
              <p className="text-xs text-zinc-500">Try loosening the budget, minimum match score, or search term.</p>
            </div>
          ) : (
            filteredJobs.map((job) => {
              const evalResult = evaluateJobFit(job, profile, botConfig);
              const isPassed = evalResult.passed;
              const isWorkingOnThis = isGeneratingBid && generatingJobId === job.id;

              return (
                <div
                  key={job.id}
                  className={`relative p-5 rounded-2xl border transition-all duration-200 ${
                    isPassed
                      ? 'bg-[#161618] border-[#2a2a2d] hover:border-blue-500/50 shadow-md shadow-black/30'
                      : 'bg-[#161618]/60 border-[#2a2a2d]/60 opacity-75 hover:opacity-100'
                  }`}
                >
                  {/* Top Line: Platform, Match Score, Status Tag */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                        {job.platform}
                      </span>
                      <span className="text-xs text-zinc-400 font-medium">{job.category}</span>
                      <span className="text-zinc-700">•</span>
                      <span className="text-xs text-zinc-500 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {job.postedAt}
                      </span>
                    </div>

                    {/* Match Score Badge */}
                    <div className="flex items-center gap-2">
                      {isPassed ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                          Passed Auto-Bid
                        </span>
                      ) : (
                        <span
                          className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-300 border border-amber-500/20"
                          title={evalResult.rejectionReasons.join('; ')}
                        >
                          <XCircle className="w-3.5 h-3.5 text-amber-400" />
                          Filtered Out
                        </span>
                      )}

                      <div
                        className={`px-2.5 py-0.5 rounded-lg text-xs font-bold font-mono border ${
                          evalResult.score >= 85
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                            : evalResult.score >= 70
                            ? 'bg-blue-500/10 text-blue-400 border-blue-500/30'
                            : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                        }`}
                      >
                        {evalResult.score}% Fit
                      </div>
                    </div>
                  </div>

                  {/* Title */}
                  <h3
                    onClick={() => onOpenJobDetail(job)}
                    className="text-base font-bold text-zinc-100 hover:text-blue-300 cursor-pointer transition line-clamp-1 mb-2"
                  >
                    {job.title}
                  </h3>

                  {/* Description Excerpt */}
                  <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed mb-3">
                    {job.description}
                  </p>

                  {/* Skills tags */}
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {job.skillsRequired.map((skill) => {
                      const isMatched = evalResult.matchedSkills.includes(skill);
                      return (
                        <span
                          key={skill}
                          className={`px-2 py-0.5 rounded text-[11px] font-medium border ${
                            isMatched
                              ? 'bg-blue-500/10 text-blue-300 border-blue-500/20 font-semibold'
                              : 'bg-[#1c1c1f] text-zinc-400 border-[#2a2a2d]'
                          }`}
                        >
                          {skill}
                        </span>
                      );
                    })}
                  </div>

                  {/* Metadata Row & Actions */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-[#2a2a2d]">
                    <div className="flex items-center gap-4 text-xs text-zinc-400 flex-wrap">
                      <div className="font-semibold text-zinc-200">
                        {job.budgetType === 'fixed'
                          ? `$${job.minBudget} - $${job.maxBudget}`
                          : `$${job.minBudget} - $${job.maxBudget}/hr`}
                      </div>

                      <div className="flex items-center gap-1">
                        <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                        <span>{job.clientRating.toFixed(1)}</span>
                        {job.clientPaymentVerified && (
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 ml-1" title="Payment Verified" />
                        )}
                      </div>

                      <div className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-zinc-500" />
                        <span>{job.clientCountry}</span>
                      </div>

                      <div className="text-zinc-500">
                        {job.proposalsCount} proposals
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-auto">
                      <button
                        onClick={() => onOpenJobDetail(job)}
                        className="px-3 py-1.5 text-xs text-zinc-300 hover:text-white bg-[#1c1c1f] hover:bg-[#2a2a2d] rounded-lg border border-[#2a2a2d] transition flex items-center gap-1"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Inspect</span>
                      </button>

                      <button
                        onClick={() => onOpenManualWithJob(job)}
                        className="px-3 py-1.5 text-xs text-blue-300 hover:text-blue-200 bg-blue-950/40 hover:bg-blue-900/50 rounded-lg border border-blue-800/40 transition flex items-center gap-1"
                      >
                        <SlidersHorizontal className="w-3.5 h-3.5" />
                        <span>Customize Bid</span>
                      </button>

                      <button
                        id={`btn-instant-bid-${job.id}`}
                        onClick={() => onInstantGenerateBid(job)}
                        disabled={isWorkingOnThis}
                        className="px-3.5 py-1.5 text-xs font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 rounded-lg shadow-sm shadow-blue-500/20 transition active:scale-95 disabled:opacity-50 flex items-center gap-1.5"
                      >
                        {isWorkingOnThis ? (
                          <>
                            <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            <span>Crafting...</span>
                          </>
                        ) : (
                          <>
                            <Zap className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
                            <span>1-Click AI Bid</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Right: Real-time Terminal Log & Stats */}
        <div className="lg:col-span-4 space-y-4 lg:sticky lg:top-24">
          {/* Bot Activity Console */}
          <div className="bg-[#000000] border border-[#2a2a2d] rounded-2xl overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between px-4 py-3 bg-[#111113] border-b border-[#2a2a2d]">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-bold text-zinc-200 uppercase tracking-wider">
                  Bot Engine Activity
                </span>
              </div>
              <button
                onClick={onClearLogs}
                title="Clear console logs"
                className="text-zinc-500 hover:text-zinc-300 transition"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Terminal Body */}
            <div className="p-3.5 font-mono text-[11px] leading-relaxed max-h-[420px] overflow-y-auto space-y-2">
              {logs.length === 0 ? (
                <div className="text-zinc-600 italic py-4 text-center">
                  Waiting for bot stream events...
                </div>
              ) : (
                logs.map((log) => {
                  let badgeColor = 'text-zinc-400';
                  if (log.type === 'scan') badgeColor = 'text-blue-400';
                  if (log.type === 'filter_pass') badgeColor = 'text-emerald-400';
                  if (log.type === 'filter_reject') badgeColor = 'text-amber-400';
                  if (log.type === 'bid_generated') badgeColor = 'text-purple-400';
                  if (log.type === 'bid_submitted') badgeColor = 'text-emerald-300 font-bold';
                  if (log.type === 'client_interaction') badgeColor = 'text-violet-300 font-bold';

                  const timeStr = new Date(log.timestamp).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                  });

                  return (
                    <div key={log.id} className="flex items-start gap-2 border-b border-zinc-900 pb-1.5">
                      <span className="text-zinc-600 text-[10px] shrink-0">{timeStr}</span>
                      <div className="space-y-0.5">
                        <span className={`uppercase font-bold text-[10px] mr-1.5 ${badgeColor}`}>
                          [{log.type}]
                        </span>
                        <span className="text-zinc-300">{log.message}</span>
                        {log.details?.reason && (
                          <div className="text-[10px] text-zinc-500 pl-2">↳ {log.details.reason}</div>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Winning Tactics Box */}
          <div className="bg-[#161618] p-4 rounded-2xl border border-[#2a2a2d] space-y-2 shadow-lg">
            <div className="flex items-center gap-1.5 text-xs font-bold text-blue-400 uppercase tracking-wider">
              <Flame className="w-4 h-4 text-amber-400" />
              <span>Auto-Bid Advantage</span>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Freelancers who submit custom, non-templated proposals within the first <strong className="text-zinc-200">10 minutes</strong> of project posting win <strong className="text-emerald-400">4.2x more client interviews</strong>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
