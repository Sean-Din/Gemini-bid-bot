import React, { useState } from 'react';
import {
  Layers,
  DollarSign,
  TrendingUp,
  Award,
  Clock,
  Eye,
  MessageSquare,
  CheckCircle2,
  XCircle,
  Download,
  Trash2,
  Copy,
  Check,
  ChevronRight,
  ExternalLink,
  Sparkles,
} from 'lucide-react';
import { GeneratedBid } from '../types';
import confetti from 'canvas-confetti';

interface BidsPipelineProps {
  bids: GeneratedBid[];
  onUpdateBidStatus: (bidId: string, status: GeneratedBid['status']) => void;
  onDeleteBid: (bidId: string) => void;
  onViewBidDetails: (bid: GeneratedBid) => void;
}

export const BidsPipeline: React.FC<BidsPipelineProps> = ({
  bids,
  onUpdateBidStatus,
  onDeleteBid,
  onViewBidDetails,
}) => {
  const [viewMode, setViewMode] = useState<'kanban' | 'table'>('kanban');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const totalValue = bids.reduce((s, b) => s + (b.bidAmount || 0), 0);
  const wonBids = bids.filter((b) => b.status === 'won');
  const wonValue = wonBids.reduce((s, b) => s + (b.bidAmount || 0), 0);
  const winRate = bids.length > 0 ? Math.round((wonBids.length / bids.length) * 100) : 0;
  const activeInterviews = bids.filter((b) => b.status === 'interview_requested').length;

  const handleCopyProposal = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleStatusChangeWithCelebration = (bidId: string, newStatus: GeneratedBid['status']) => {
    onUpdateBidStatus(bidId, newStatus);
    if (newStatus === 'won') {
      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.5 },
      });
    }
  };

  const exportAsJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(bids, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `freelancer_bids_pipeline_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const columns: Array<{ id: GeneratedBid['status']; label: string; color: string }> = [
    { id: 'draft', label: 'Drafts', color: 'border-[#2a2a2d] bg-[#161618] text-zinc-400' },
    { id: 'submitted', label: 'Submitted', color: 'border-blue-500/30 bg-blue-950/20 text-blue-400' },
    { id: 'viewed', label: 'Viewed by Client', color: 'border-sky-500/30 bg-sky-950/20 text-sky-400' },
    { id: 'shortlisted', label: 'Shortlisted', color: 'border-amber-500/30 bg-amber-950/20 text-amber-400' },
    { id: 'interview_requested', label: 'Interview Scheduled', color: 'border-purple-500/30 bg-purple-950/20 text-purple-400' },
    { id: 'won', label: 'Won / Hired ($)', color: 'border-emerald-500/30 bg-emerald-950/20 text-emerald-400' },
  ];

  return (
    <div className="space-y-6">
      {/* Top Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-[#161618] border border-[#2a2a2d] p-4 rounded-2xl shadow-xl">
          <div className="text-xs text-zinc-400 flex items-center justify-between mb-1">
            <span>Total Pipeline Value</span>
            <DollarSign className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-black text-zinc-100">${totalValue.toLocaleString()}</div>
          <div className="text-[11px] text-zinc-500">{bids.length} total proposals</div>
        </div>

        <div className="bg-[#161618] border border-[#2a2a2d] p-4 rounded-2xl shadow-xl">
          <div className="text-xs text-zinc-400 flex items-center justify-between mb-1">
            <span>Closed Won Revenue</span>
            <Award className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-emerald-400">${wonValue.toLocaleString()}</div>
          <div className="text-[11px] text-emerald-500/80">{wonBids.length} contracts signed</div>
        </div>

        <div className="bg-[#161618] border border-[#2a2a2d] p-4 rounded-2xl shadow-xl">
          <div className="text-xs text-zinc-400 flex items-center justify-between mb-1">
            <span>Win Rate %</span>
            <TrendingUp className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-2xl font-black text-sky-400">{winRate}%</div>
          <div className="text-[11px] text-zinc-500">Industry avg ~ 8-12%</div>
        </div>

        <div className="bg-[#161618] border border-[#2a2a2d] p-4 rounded-2xl shadow-xl">
          <div className="text-xs text-zinc-400 flex items-center justify-between mb-1">
            <span>Active Interviews</span>
            <MessageSquare className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-black text-purple-400">{activeInterviews}</div>
          <div className="text-[11px] text-zinc-500">Direct client discussions</div>
        </div>
      </div>

      {/* Control Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-[#161618] p-3 rounded-xl border border-[#2a2a2d]">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-zinc-300">View Layout:</span>
          <div className="flex items-center bg-[#0e0e10] p-1 rounded-lg border border-[#2a2a2d] text-xs">
            <button
              onClick={() => setViewMode('kanban')}
              className={`px-3 py-1 rounded-md font-medium transition ${
                viewMode === 'kanban' ? 'bg-blue-600 text-white' : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Kanban Board
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-1 rounded-md font-medium transition ${
                viewMode === 'table' ? 'bg-blue-600 text-white' : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Detailed Table
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <button
            onClick={exportAsJson}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1c1c1f] hover:bg-[#2a2a2d] text-zinc-200 rounded-lg text-xs font-medium border border-[#2a2a2d] transition"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export JSON</span>
          </button>
        </div>
      </div>

      {/* Kanban Board View */}
      {viewMode === 'kanban' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 items-start overflow-x-auto pb-4">
          {columns.map((col) => {
            const colBids = bids.filter((b) => b.status === col.id);

            return (
              <div
                key={col.id}
                className="bg-[#161618] border border-[#2a2a2d] rounded-2xl p-3 space-y-3 min-w-[240px] shadow-lg"
              >
                {/* Column Header */}
                <div className="flex items-center justify-between px-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-zinc-200">{col.label}</span>
                    <span className="text-[11px] font-mono px-1.5 py-0.2 rounded-full bg-[#1c1c1f] text-zinc-400 border border-[#2a2a2d]">
                      {colBids.length}
                    </span>
                  </div>
                </div>

                {/* Column Items */}
                <div className="space-y-3 min-h-[150px]">
                  {colBids.length === 0 ? (
                    <div className="text-[11px] text-zinc-600 text-center py-6 border border-dashed border-[#2a2a2d] rounded-xl">
                      No bids in this stage
                    </div>
                  ) : (
                    colBids.map((bid) => (
                      <div
                        key={bid.id}
                        className="bg-[#0e0e10] border border-[#2a2a2d] hover:border-blue-500/40 p-3.5 rounded-xl space-y-2.5 shadow-sm transition"
                      >
                        <div className="flex items-center justify-between gap-1">
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                            {bid.platform}
                          </span>
                          <span className="text-xs font-mono font-bold text-emerald-400">
                            ${bid.bidAmount}
                          </span>
                        </div>

                        <h4
                          onClick={() => onViewBidDetails(bid)}
                          className="text-xs font-bold text-zinc-200 hover:text-blue-300 cursor-pointer line-clamp-2"
                        >
                          {bid.jobTitle}
                        </h4>

                        <div className="text-[11px] text-zinc-400 flex items-center justify-between">
                          <span>Match: {bid.matchScore}%</span>
                          <span>{bid.deliveryDays} days</span>
                        </div>

                        {/* Interactive Status Transition Dropdown */}
                        <div className="pt-2 border-t border-[#2a2a2d] flex items-center justify-between">
                          <select
                            value={bid.status}
                            onChange={(e) =>
                              handleStatusChangeWithCelebration(bid.id, e.target.value as any)
                            }
                            className="px-2 py-1 bg-[#161618] border border-[#2a2a2d] rounded text-[10px] text-zinc-300 focus:outline-none focus:border-blue-500"
                          >
                            <option value="draft">Draft</option>
                            <option value="submitted">Submitted</option>
                            <option value="viewed">Viewed</option>
                            <option value="shortlisted">Shortlisted</option>
                            <option value="interview_requested">Interview</option>
                            <option value="won">Won ($)</option>
                            <option value="rejected">Rejected</option>
                          </select>

                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleCopyProposal(bid.proposalText, bid.id)}
                              title="Copy proposal copy"
                              className="p-1 hover:bg-[#1c1c1f] rounded text-zinc-400 hover:text-zinc-200 transition"
                            >
                              {copiedId === bid.id ? (
                                <Check className="w-3.5 h-3.5 text-emerald-400" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                            </button>
                            <button
                              onClick={() => onDeleteBid(bid.id)}
                              title="Delete bid"
                              className="p-1 hover:bg-[#1c1c1f] rounded text-zinc-500 hover:text-rose-400 transition"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Detailed Table View */
        <div className="bg-[#161618] border border-[#2a2a2d] rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-zinc-300">
              <thead className="bg-[#0e0e10] text-zinc-400 uppercase font-semibold border-b border-[#2a2a2d]">
                <tr>
                  <th className="p-4">Project Title</th>
                  <th className="p-4">Platform</th>
                  <th className="p-4">Bid Amount</th>
                  <th className="p-4">Match %</th>
                  <th className="p-4">Delivery</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2a2a2d]">
                {bids.map((bid) => (
                  <tr key={bid.id} className="hover:bg-[#1c1c1f] transition">
                    <td className="p-4 font-semibold text-zinc-200 max-w-xs truncate">
                      {bid.jobTitle}
                    </td>
                    <td className="p-4">
                      <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-[#1c1c1f] text-zinc-300 border border-[#2a2a2d]">
                        {bid.platform}
                      </span>
                    </td>
                    <td className="p-4 font-mono font-bold text-emerald-400">${bid.bidAmount}</td>
                    <td className="p-4 font-mono text-blue-400">{bid.matchScore}%</td>
                    <td className="p-4">{bid.deliveryDays} days</td>
                    <td className="p-4">
                      <select
                        value={bid.status}
                        onChange={(e) =>
                          handleStatusChangeWithCelebration(bid.id, e.target.value as any)
                        }
                        className="px-2.5 py-1 bg-[#0e0e10] border border-[#2a2a2d] rounded text-xs text-zinc-200"
                      >
                        <option value="draft">Draft</option>
                        <option value="submitted">Submitted</option>
                        <option value="viewed">Viewed</option>
                        <option value="shortlisted">Shortlisted</option>
                        <option value="interview_requested">Interview Requested</option>
                        <option value="won">Won ($)</option>
                        <option value="rejected">Rejected</option>
                      </select>
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => onViewBidDetails(bid)}
                        className="px-2.5 py-1 bg-[#1c1c1f] hover:bg-[#2a2a2d] text-zinc-200 rounded text-xs mr-2 border border-[#2a2a2d]"
                      >
                        View
                      </button>
                      <button
                        onClick={() => onDeleteBid(bid.id)}
                        className="p-1 hover:bg-[#1c1c1f] text-zinc-500 hover:text-rose-400 rounded"
                      >
                        <Trash2 className="w-4 h-4 inline" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
