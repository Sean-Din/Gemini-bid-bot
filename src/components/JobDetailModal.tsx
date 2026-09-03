import React, { useState } from 'react';
import {
  X,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  DollarSign,
  Clock,
  MapPin,
  Star,
  ShieldCheck,
  Send,
  HelpCircle,
  BrainCircuit,
  Copy,
  Check,
} from 'lucide-react';
import { JobPosting, FreelancerProfile, JobAnalysisResult, BotFilterConfig } from '../types';
import { analyzeJob } from '../services/api';

interface JobDetailModalProps {
  job: JobPosting | null;
  onClose: () => void;
  profile: FreelancerProfile;
  botConfig: BotFilterConfig;
  onGenerateBidForJob: (job: JobPosting) => void;
}

export const JobDetailModal: React.FC<JobDetailModalProps> = ({
  job,
  onClose,
  profile,
  botConfig,
  onGenerateBidForJob,
}) => {
  const [analysis, setAnalysis] = useState<JobAnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [copiedQuestionIndex, setCopiedQuestionIndex] = useState<number | null>(null);

  if (!job) return null;

  const handleRunAiAnalysis = async () => {
    setIsAnalyzing(true);
    try {
      const res = await analyzeJob(job, profile);
      setAnalysis(res);
    } catch (err) {
      console.error('Analysis failed', err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleCopyQuestion = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedQuestionIndex(idx);
    setTimeout(() => setCopiedQuestionIndex(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0a0a0b]/80 backdrop-blur-sm overflow-y-auto">
      <div
        id="job-detail-modal"
        className="relative w-full max-w-3xl bg-[#161618] border border-[#2a2a2d] rounded-2xl shadow-2xl overflow-hidden my-8"
      >
        {/* Header */}
        <div className="flex items-start justify-between p-6 bg-[#111113] border-b border-[#2a2a2d]">
          <div className="space-y-1 pr-6">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                {job.platform}
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#1c1c1f] text-zinc-300 border border-[#2a2a2d]">
                {job.category}
              </span>
              {job.urgency === 'high' || job.urgency === 'urgent' ? (
                <span className="px-2 py-0.5 rounded text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                  Urgent Requirement
                </span>
              ) : null}
            </div>
            <h2 className="text-xl font-bold text-zinc-100">{job.title}</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-zinc-200 hover:bg-[#2a2a2d] rounded-xl transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
          {/* Metadata Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-[#0e0e10] p-3 rounded-xl border border-[#2a2a2d]">
              <div className="text-xs text-zinc-400 flex items-center gap-1 mb-1">
                <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                <span>Budget</span>
              </div>
              <div className="text-sm font-bold text-zinc-100">
                {job.budgetType === 'fixed'
                  ? `$${job.minBudget} - $${job.maxBudget}`
                  : `$${job.minBudget} - $${job.maxBudget}/hr`}
              </div>
              <div className="text-[11px] text-zinc-500 capitalize">{job.budgetType} Price</div>
            </div>

            <div className="bg-[#0e0e10] p-3 rounded-xl border border-[#2a2a2d]">
              <div className="text-xs text-zinc-400 flex items-center gap-1 mb-1">
                <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                <span>Client Rating</span>
              </div>
              <div className="text-sm font-bold text-zinc-100 flex items-center gap-1">
                <span>{job.clientRating.toFixed(1)}</span>
                <span className="text-xs text-zinc-500 font-normal">({job.clientReviewsCount})</span>
              </div>
              <div className="text-[11px] text-zinc-500 flex items-center gap-1">
                {job.clientPaymentVerified && (
                  <span className="text-emerald-400 flex items-center gap-0.5">
                    <ShieldCheck className="w-3 h-3" /> Verified
                  </span>
                )}
              </div>
            </div>

            <div className="bg-[#0e0e10] p-3 rounded-xl border border-[#2a2a2d]">
              <div className="text-xs text-zinc-400 flex items-center gap-1 mb-1">
                <MapPin className="w-3.5 h-3.5 text-blue-400" />
                <span>Location</span>
              </div>
              <div className="text-sm font-bold text-zinc-100 truncate">{job.clientCountry}</div>
              <div className="text-[11px] text-zinc-500">${job.clientTotalSpent?.toLocaleString()} total spent</div>
            </div>

            <div className="bg-[#0e0e10] p-3 rounded-xl border border-[#2a2a2d]">
              <div className="text-xs text-zinc-400 flex items-center gap-1 mb-1">
                <Clock className="w-3.5 h-3.5 text-sky-400" />
                <span>Activity</span>
              </div>
              <div className="text-sm font-bold text-zinc-100">{job.proposalsCount} proposals</div>
              <div className="text-[11px] text-zinc-500">{job.postedAt}</div>
            </div>
          </div>

          {/* Description */}
          <div>
            <h3 className="text-sm font-semibold text-zinc-200 mb-2">Project Description</h3>
            <div className="p-4 rounded-xl bg-[#0e0e10] border border-[#2a2a2d] text-sm text-zinc-300 leading-relaxed whitespace-pre-line font-sans">
              {job.description}
            </div>
          </div>

          {/* Required Skills */}
          <div>
            <h3 className="text-sm font-semibold text-zinc-200 mb-2">Required Skills & Match</h3>
            <div className="flex flex-wrap gap-1.5">
              {job.skillsRequired.map((skill) => {
                const hasSkill = profile.skills.some((ps) =>
                  ps.toLowerCase().includes(skill.toLowerCase()) || skill.toLowerCase().includes(ps.toLowerCase())
                );
                return (
                  <span
                    key={skill}
                    className={`inline-flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-medium border ${
                      hasSkill
                        ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                        : 'bg-[#1c1c1f] text-zinc-400 border-[#2a2a2d]'
                    }`}
                  >
                    {hasSkill && <CheckCircle2 className="w-3 h-3 text-emerald-400" />}
                    {skill}
                  </span>
                );
              })}
            </div>
          </div>

          {/* Screening Questions */}
          {job.screeningQuestions && job.screeningQuestions.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-zinc-200 mb-2 flex items-center gap-1.5">
                <HelpCircle className="w-4 h-4 text-blue-400" />
                Client Screening Questions ({job.screeningQuestions.length})
              </h3>
              <div className="space-y-2">
                {job.screeningQuestions.map((q, idx) => (
                  <div key={idx} className="p-3 bg-[#0e0e10] rounded-xl border border-[#2a2a2d] text-xs text-zinc-300">
                    <span className="font-semibold text-blue-300 mr-1.5">Q{idx + 1}:</span>
                    {q}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* AI Deep Analysis Section */}
          <div className="border-t border-[#2a2a2d] pt-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <BrainCircuit className="w-5 h-5 text-blue-400" />
                <h3 className="text-sm font-semibold text-zinc-200">AI Win Probability & Job Intelligence</h3>
              </div>
              {!analysis && (
                <button
                  onClick={handleRunAiAnalysis}
                  disabled={isAnalyzing}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 rounded-lg text-xs font-semibold transition disabled:opacity-50"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  {isAnalyzing ? 'Analyzing with Gemini...' : 'Run Deep AI Analysis'}
                </button>
              )}
            </div>

            {isAnalyzing && (
              <div className="p-6 bg-[#0e0e10] rounded-xl border border-[#2a2a2d] text-center space-y-2">
                <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-xs text-zinc-400">Gemini 3.8 Flash is analyzing client psychology, traps, and pricing...</p>
              </div>
            )}

            {analysis && (
              <div className="space-y-4 bg-[#0e0e10] p-4 rounded-xl border border-blue-500/30">
                {/* Score & Pricing */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="bg-[#161618] p-3 rounded-lg border border-[#2a2a2d]">
                    <div className="text-xs text-zinc-400">Win Probability</div>
                    <div className="text-2xl font-black text-blue-400">{analysis.matchScore}%</div>
                  </div>
                  <div className="bg-[#161618] p-3 rounded-lg border border-[#2a2a2d]">
                    <div className="text-xs text-zinc-400">Optimal Winning Bid</div>
                    <div className="text-2xl font-black text-emerald-400">${analysis.recommendedPrice}</div>
                  </div>
                  <div className="bg-[#161618] p-3 rounded-lg border border-[#2a2a2d]">
                    <div className="text-xs text-zinc-400">Recommended Turnaround</div>
                    <div className="text-2xl font-black text-sky-400">{analysis.recommendedDays} days</div>
                  </div>
                </div>

                {/* Client Psychology */}
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1">
                    Client Mindset & Psychology
                  </h4>
                  <p className="text-xs text-zinc-300 leading-relaxed bg-[#161618] p-3 rounded-lg border border-[#2a2a2d]">
                    {analysis.clientPsychology}
                  </p>
                </div>

                {/* Red Flags if any */}
                {analysis.redFlags && analysis.redFlags.length > 0 && (
                  <div className="bg-rose-500/10 border border-rose-500/20 p-3 rounded-lg space-y-1">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-rose-400">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span>Potential Flags / Watchouts</span>
                    </div>
                    <ul className="list-disc list-inside text-xs text-rose-300/90 space-y-0.5">
                      {analysis.redFlags.map((rf, i) => (
                        <li key={i}>{rf}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Suggested Questions */}
                {analysis.suggestedQuestionsToClient && analysis.suggestedQuestionsToClient.length > 0 && (
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2">
                      High-Conversion Questions to Ask Client in Chat
                    </h4>
                    <div className="space-y-1.5">
                      {analysis.suggestedQuestionsToClient.map((q, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-2.5 bg-[#161618] rounded-lg border border-[#2a2a2d] text-xs text-zinc-300"
                        >
                          <span>"{q}"</span>
                          <button
                            onClick={() => handleCopyQuestion(q, idx)}
                            className="p-1 hover:bg-[#2a2a2d] rounded text-zinc-400 hover:text-zinc-200 transition ml-2"
                            title="Copy to clipboard"
                          >
                            {copiedQuestionIndex === idx ? (
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-[#111113] border-t border-[#2a2a2d] flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-zinc-400 hover:text-zinc-200 transition"
          >
            Close
          </button>

          <button
            id="btn-generate-bid-modal"
            onClick={() => {
              onClose();
              onGenerateBidForJob(job);
            }}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold text-sm rounded-xl shadow-lg shadow-blue-500/25 transition active:scale-95"
          >
            <Send className="w-4 h-4" />
            <span>Generate & Send Bid Proposal</span>
          </button>
        </div>
      </div>
    </div>
  );
};
