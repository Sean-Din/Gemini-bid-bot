import React, { useState } from 'react';
import {
  Settings,
  ShieldCheck,
  Zap,
  Sliders,
  Save,
  Check,
  AlertTriangle,
  RotateCcw,
  CheckCircle2,
  DollarSign,
  Clock,
  Filter,
} from 'lucide-react';
import { BotFilterConfig } from '../types';
import { DEFAULT_BOT_CONFIG } from '../data/initialData';

interface BotSettingsProps {
  botConfig: BotFilterConfig;
  onSaveBotConfig: (config: BotFilterConfig) => void;
}

export const BotSettings: React.FC<BotSettingsProps> = ({ botConfig, onSaveBotConfig }) => {
  const [config, setConfig] = useState<BotFilterConfig>(botConfig);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = () => {
    onSaveBotConfig(config);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleResetDefaults = () => {
    setConfig(DEFAULT_BOT_CONFIG);
    onSaveBotConfig(DEFAULT_BOT_CONFIG);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const togglePlatform = (platform: string) => {
    const current = config.allowedPlatforms || [];
    const updated = current.includes(platform)
      ? current.filter((p) => p !== platform)
      : [...current, platform];
    setConfig({ ...config, allowedPlatforms: updated });
  };

  const toggleCategory = (cat: string) => {
    const current = config.categoryWhitelist || [];
    const updated = current.includes(cat)
      ? current.filter((c) => c !== cat)
      : [...current, cat];
    setConfig({ ...config, categoryWhitelist: updated });
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-[#161618] p-5 rounded-2xl border border-[#2a2a2d] shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-blue-400" />
            <h2 className="text-lg font-bold text-zinc-100">Automation Rules & Bid Bot Configuration</h2>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Configure filtering thresholds, early-bird limits, pricing algorithms, and safe dry-run parameters.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleResetDefaults}
            className="flex items-center gap-1.5 px-3 py-2 bg-[#1c1c1f] hover:bg-[#2a2a2d] text-zinc-300 rounded-xl text-xs font-semibold border border-[#2a2a2d] transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Defaults</span>
          </button>

          <button
            id="btn-save-bot-rules"
            onClick={handleSave}
            className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold uppercase tracking-wider shadow-md shadow-blue-500/20 transition active:scale-95"
          >
            {savedSuccess ? <Check className="w-4 h-4 text-emerald-300" /> : <Save className="w-4 h-4" />}
            <span>{savedSuccess ? 'Rules Applied!' : 'Save Rules'}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Core Automation & Safety (7 cols) */}
        <div className="lg:col-span-7 space-y-4 bg-[#161618] p-5 rounded-2xl border border-[#2a2a2d] shadow-xl">
          <h3 className="text-sm font-bold text-zinc-200 uppercase tracking-wider flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Safety & Execution Mode</span>
          </h3>

          {/* Test Mode Switch */}
          <div className="p-4 bg-[#0e0e10] rounded-xl border border-[#2a2a2d] flex items-start justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-bold text-xs text-zinc-200">Dry-Run / Test Mode (Recommended)</span>
                {config.testMode && (
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-500/10 text-amber-300 border border-amber-500/20">
                    Safe Mode ON
                  </span>
                )}
              </div>
              <p className="text-xs text-zinc-400 leading-relaxed">
                When enabled, the bot generates complete AI proposals and saves them as drafts to your pipeline without spending live connects or submitting externally.
              </p>
            </div>
            <input
              type="checkbox"
              checked={config.testMode}
              onChange={(e) => setConfig({ ...config, testMode: e.target.checked })}
              className="w-5 h-5 rounded bg-[#161618] border-[#2a2a2d] text-blue-600 focus:ring-blue-500 cursor-pointer shrink-0 mt-1"
            />
          </div>

          {/* Verified Payment Filter */}
          <div className="p-4 bg-[#0e0e10] rounded-xl border border-[#2a2a2d] flex items-start justify-between gap-4">
            <div className="space-y-1">
              <span className="font-bold text-xs text-zinc-200">Verified Payment Methods Only</span>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Automatically skip unverified client accounts to protect against payment defaults or fake postings.
              </p>
            </div>
            <input
              type="checkbox"
              checked={config.paymentVerifiedOnly}
              onChange={(e) => setConfig({ ...config, paymentVerifiedOnly: e.target.checked })}
              className="w-5 h-5 rounded bg-[#161618] border-[#2a2a2d] text-blue-600 focus:ring-blue-500 cursor-pointer shrink-0 mt-1"
            />
          </div>

          {/* Screening Question Auto-Answering */}
          <div className="p-4 bg-[#0e0e10] rounded-xl border border-[#2a2a2d] flex items-start justify-between gap-4">
            <div className="space-y-1">
              <span className="font-bold text-xs text-zinc-200">Auto-Answer Client Screening Questions</span>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Use Gemini 3.8 Flash to craft direct, evidence-backed answers to client questions automatically.
              </p>
            </div>
            <input
              type="checkbox"
              checked={config.autoAnswerScreeningQuestions}
              onChange={(e) => setConfig({ ...config, autoAnswerScreeningQuestions: e.target.checked })}
              className="w-5 h-5 rounded bg-[#161618] border-[#2a2a2d] text-blue-600 focus:ring-blue-500 cursor-pointer shrink-0 mt-1"
            />
          </div>

          {/* Pricing Strategy */}
          <div className="p-4 bg-[#0e0e10] rounded-xl border border-[#2a2a2d] space-y-2">
            <label className="block text-xs font-bold text-zinc-200 uppercase tracking-wider">
              Optimal Bid Pricing Strategy
            </label>
            <select
              value={config.bidAmountStrategy}
              onChange={(e) => setConfig({ ...config, bidAmountStrategy: e.target.value as any })}
              className="w-full px-3 py-2 bg-[#161618] border border-[#2a2a2d] rounded-lg text-xs text-zinc-200 focus:outline-none focus:border-blue-500"
            >
              <option value="underbid_5">Competitive Snipe: 5% below median budget (Highest win rate)</option>
              <option value="underbid_10">Aggressive Snipe: 10% below median budget</option>
              <option value="exact_median">Exact Median: Exactly at client average budget</option>
              <option value="exact_max">Top Dollar: Max client budget</option>
              <option value="value_premium">Value Premium: 15% above client budget (Emphasizes elite quality)</option>
            </select>
          </div>

          {/* Submission Delay */}
          <div className="p-4 bg-[#0e0e10] rounded-xl border border-[#2a2a2d] space-y-2">
            <label className="block text-xs font-bold text-zinc-200 uppercase tracking-wider">
              Artificial Review Delay / Speed
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { sec: 0, label: 'Instant (<5s)' },
                { sec: 15, label: '15s Natural' },
                { sec: 30, label: '30s Paced' },
                { sec: 60, label: '60s Review' },
              ].map((d) => (
                <button
                  key={d.sec}
                  type="button"
                  onClick={() => setConfig({ ...config, speedDelaySeconds: d.sec })}
                  className={`px-3 py-2 rounded-lg text-xs font-medium border text-center transition ${
                    config.speedDelaySeconds === d.sec
                      ? 'bg-blue-600/20 border-blue-500 text-blue-300'
                      : 'bg-[#161618] border-[#2a2a2d] text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  {d.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Threshold Sliders & Whitelists (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Thresholds */}
          <div className="bg-[#161618] p-5 rounded-2xl border border-[#2a2a2d] space-y-4 shadow-xl">
            <h3 className="text-sm font-bold text-zinc-200 uppercase tracking-wider flex items-center gap-2">
              <Sliders className="w-4 h-4 text-blue-400" />
              <span>Filtering Thresholds</span>
            </h3>

            {/* Min Match Score Slider */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-zinc-300 font-medium">Minimum Match Score</span>
                <span className="font-mono font-bold text-blue-400">{config.minMatchScore}%</span>
              </div>
              <input
                type="range"
                min="40"
                max="95"
                step="5"
                value={config.minMatchScore}
                onChange={(e) => setConfig({ ...config, minMatchScore: Number(e.target.value) })}
                className="w-full accent-blue-500 cursor-pointer"
              />
              <p className="text-[11px] text-zinc-500 mt-0.5">Jobs scoring below this threshold are skipped.</p>
            </div>

            {/* Minimum Client Rating */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-zinc-300 font-medium">Min Client Rating</span>
                <span className="font-mono font-bold text-amber-400">{config.minClientRating.toFixed(1)} ★</span>
              </div>
              <input
                type="range"
                min="3.0"
                max="5.0"
                step="0.1"
                value={config.minClientRating}
                onChange={(e) => setConfig({ ...config, minClientRating: Number(e.target.value) })}
                className="w-full accent-amber-500 cursor-pointer"
              />
            </div>

            {/* Early Bird Proposals Cap */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-zinc-300 font-medium">Early Bird Max Proposals</span>
                <span className="font-mono font-bold text-sky-400">&lt; {config.maxProposalsCount} bids</span>
              </div>
              <input
                type="range"
                min="5"
                max="50"
                step="5"
                value={config.maxProposalsCount}
                onChange={(e) => setConfig({ ...config, maxProposalsCount: Number(e.target.value) })}
                className="w-full accent-sky-500 cursor-pointer"
              />
              <p className="text-[11px] text-zinc-500 mt-0.5">Only bid when competition is low for high visibility.</p>
            </div>

            {/* Budget Range */}
            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-[#2a2a2d]">
              <div>
                <label className="block text-xs text-zinc-400 mb-1">Min Budget ($)</label>
                <input
                  type="number"
                  value={config.minBudget}
                  onChange={(e) => setConfig({ ...config, minBudget: Number(e.target.value) })}
                  className="w-full px-3 py-1.5 bg-[#0e0e10] border border-[#2a2a2d] rounded-lg text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-blue-500 transition"
                />
              </div>

              <div>
                <label className="block text-xs text-zinc-400 mb-1">Max Budget ($)</label>
                <input
                  type="number"
                  value={config.maxBudget}
                  onChange={(e) => setConfig({ ...config, maxBudget: Number(e.target.value) })}
                  className="w-full px-3 py-1.5 bg-[#0e0e10] border border-[#2a2a2d] rounded-lg text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-blue-500 transition"
                />
              </div>
            </div>
          </div>

          {/* Platform Whitelist */}
          <div className="bg-[#161618] p-5 rounded-2xl border border-[#2a2a2d] space-y-3 shadow-xl">
            <h3 className="text-sm font-bold text-zinc-200 uppercase tracking-wider flex items-center gap-2">
              <Filter className="w-4 h-4 text-purple-400" />
              <span>Allowed Freelance Platforms</span>
            </h3>

            <div className="grid grid-cols-2 gap-2">
              {['Freelancer', 'Upwork', 'Fiverr Pro', 'Guru', 'Toptal'].map((p) => {
                const isChecked = config.allowedPlatforms?.includes(p);
                return (
                  <button
                    key={p}
                    type="button"
                    onClick={() => togglePlatform(p)}
                    className={`px-3 py-2 rounded-xl text-xs font-medium border text-left flex items-center justify-between transition ${
                      isChecked
                        ? 'bg-blue-600/20 border-blue-500 text-blue-300'
                        : 'bg-[#0e0e10] border-[#2a2a2d] text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    <span>{p}</span>
                    {isChecked && <Check className="w-3.5 h-3.5 text-blue-400" />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
