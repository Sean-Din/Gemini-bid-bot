import React, { useState } from 'react';
import {
  X,
  Copy,
  Check,
  DollarSign,
  Clock,
  Send,
  ListChecks,
  HelpCircle,
  AlertTriangle,
  Award,
  Sparkles,
  MessageSquare,
} from 'lucide-react';
import { GeneratedBid } from '../types';

interface BidDetailModalProps {
  bid: GeneratedBid | null;
  onClose: () => void;
  onUpdateStatus: (bidId: string, status: GeneratedBid['status']) => void;
}

export const BidDetailModal: React.FC<BidDetailModalProps> = ({ bid, onClose, onUpdateStatus }) => {
  const [copied, setCopied] = useState(false);

  if (!bid) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(bid.proposalText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0a0a0b]/80 backdrop-blur-sm overflow-y-auto">
      <div
        id="bid-detail-modal"
        className="relative w-full max-w-3xl bg-[#161618] border border-[#2a2a2d] rounded-2xl shadow-2xl overflow-hidden my-8"
      >
        {/* Header */}
        <div className="flex items-start justify-between p-6 bg-[#111113] border-b border-[#2a2a2d]">
          <div className="space-y-1 pr-6">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                {bid.platform}
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Bid: ${bid.bidAmount}
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#1c1c1f] text-zinc-300 border border-[#2a2a2d]">
                Match: {bid.matchScore}%
              </span>
            </div>
            <h2 className="text-xl font-bold text-zinc-100">{bid.jobTitle}</h2>
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
          {/* Hook Opening */}
          {bid.hookOpening && (
            <div className="bg-blue-950/30 border border-blue-500/30 p-3.5 rounded-xl">
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400 block mb-0.5">
                First-Sentence Hook:
              </span>
              <p className="text-xs font-medium text-blue-100 italic">
                "{bid.hookOpening}"
              </p>
            </div>
          )}

          {/* Proposal Text */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-zinc-200">Full Proposal Text</h3>
              <button
                onClick={handleCopy}
                className="flex items-center gap-1 text-xs px-2.5 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-semibold transition shadow-md shadow-blue-500/20"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied!' : 'Copy Proposal'}</span>
              </button>
            </div>
            <div className="p-4 rounded-xl bg-[#0e0e10] border border-[#2a2a2d] text-xs text-zinc-200 leading-relaxed whitespace-pre-line font-sans select-text">
              {bid.proposalText}
            </div>
          </div>

          {/* Milestones */}
          {bid.milestones && bid.milestones.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-zinc-200 mb-2 flex items-center gap-1.5">
                <ListChecks className="w-4 h-4 text-emerald-400" />
                <span>Deliverable Milestones Breakdown</span>
              </h3>
              <div className="space-y-2">
                {bid.milestones.map((m, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-[#0e0e10] rounded-xl border border-[#2a2a2d] flex items-start justify-between gap-3 text-xs"
                  >
                    <div>
                      <span className="font-semibold text-zinc-200">{m.title}</span>
                      <p className="text-[11px] text-zinc-400 mt-0.5">{m.deliverable}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="font-bold text-emerald-400">${m.amount}</div>
                      <div className="text-[10px] text-zinc-500">{m.durationDays} days</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Screening Answers */}
          {bid.screeningAnswers && bid.screeningAnswers.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-zinc-200 mb-2 flex items-center gap-1.5">
                <HelpCircle className="w-4 h-4 text-blue-400" />
                <span>Screening Question Responses</span>
              </h3>
              <div className="space-y-2">
                {bid.screeningAnswers.map((sa, idx) => (
                  <div key={idx} className="p-3 bg-[#0e0e10] rounded-xl border border-[#2a2a2d] text-xs space-y-1">
                    <div className="font-semibold text-blue-300">Q: {sa.question}</div>
                    <div className="text-zinc-200 pl-2 border-l border-blue-500/40">{sa.answer}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-[#111113] border-t border-[#2a2a2d] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs text-zinc-400">Current Status:</span>
            <select
              value={bid.status}
              onChange={(e) => onUpdateStatus(bid.id, e.target.value as any)}
              className="px-2.5 py-1 bg-[#161618] border border-[#2a2a2d] rounded-lg text-xs text-zinc-200 focus:outline-none focus:border-blue-500"
            >
              <option value="draft">Draft</option>
              <option value="submitted">Submitted</option>
              <option value="viewed">Viewed</option>
              <option value="shortlisted">Shortlisted</option>
              <option value="interview_requested">Interview Requested</option>
              <option value="won">Won ($)</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-2 bg-[#1c1c1f] hover:bg-[#2a2a2d] text-zinc-200 rounded-xl text-xs font-semibold border border-[#2a2a2d] transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
