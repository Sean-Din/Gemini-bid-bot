import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Zap,
  Copy,
  Check,
  Send,
  Sliders,
  DollarSign,
  Clock,
  HelpCircle,
  BrainCircuit,
  RefreshCw,
  Edit3,
  BookmarkPlus,
  AlertCircle,
  FileText,
  ListChecks,
  ChevronRight,
  ShieldCheck,
  ArrowRight,
  Code2,
  CheckCircle2,
  Cpu,
  Info,
} from 'lucide-react';
import { JobPosting, FreelancerProfile, BotFilterConfig, GeneratedBid } from '../types';
import { generateBidProposal, rewriteProposal } from '../services/api';
import confetti from 'canvas-confetti';

export const AI_MODELS = [
  {
    id: 'gemini-3.8-flash',
    name: 'Gemini 3.8 Flash',
    tag: 'Recommended',
    tagColor: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
    description: 'Balanced speed, reasoning & winning proposal formatting',
  },
  {
    id: 'gemini-3.1-flash-lite',
    name: 'Gemini 3.1 Flash Lite',
    tag: 'High Capacity (No 503)',
    tagColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    description: 'Ultra-fast & resilient (great if experiencing 503 high demand)',
  },
  {
    id: 'gemini-flash-latest',
    name: 'Gemini Flash Latest',
    tag: 'Latest Stable',
    tagColor: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
    description: 'General purpose production Flash release',
  },
  {
    id: 'gemini-3.1-pro-preview',
    name: 'Gemini 3.1 Pro',
    tag: 'Deep Reasoning',
    tagColor: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    description: 'Highest intelligence for complex technical proposals',
  },
];

interface ManualBidGeneratorProps {
  profile: FreelancerProfile;
  botConfig: BotFilterConfig;
  initialJob?: JobPosting | null;
  onSaveToPipeline: (bid: GeneratedBid) => void;
}

export const ManualBidGenerator: React.FC<ManualBidGeneratorProps> = ({
  profile,
  botConfig,
  initialJob,
  onSaveToPipeline,
}) => {
  // Input fields
  const [jobDescription, setJobDescription] = useState<string>(
    initialJob?.description ||
      `We are looking for a senior developer to build an analytics & team billing dashboard for our B2B SaaS platform.\n\nRequirements:\n- Next.js 14/15 App Router, TypeScript, Tailwind CSS\n- Stripe Customer Portal & Webhook integration for billing tiers\n- Clean responsive design based on Figma\n- High performance and clean TypeScript code\n\nPlease share relevant examples of past work and your estimated timeline.`
  );
  const [jobTitle, setJobTitle] = useState(
    initialJob?.title || 'Build Modern SaaS Dashboard with Next.js 14, Tailwind & Stripe'
  );
  const [platform, setPlatform] = useState<string>(initialJob?.platform || 'Upwork');
  const [category, setCategory] = useState<string>(initialJob?.category || 'Web Development');
  const [budgetType, setBudgetType] = useState<'fixed' | 'hourly'>(initialJob?.budgetType || 'fixed');
  const [minBudget, setMinBudget] = useState<number>(initialJob?.minBudget || 800);
  const [maxBudget, setMaxBudget] = useState<number>(initialJob?.maxBudget || 1500);
  const [clientCountry, setClientCountry] = useState<string>(initialJob?.clientCountry || 'United States');
  const [skillsInput, setSkillsInput] = useState<string>(
    initialJob?.skillsRequired?.join(', ') || 'Next.js, React, TypeScript, Tailwind CSS, Stripe'
  );
  const [screeningQuestionsText, setScreeningQuestionsText] = useState<string>(
    initialJob?.screeningQuestions?.join('\n') ||
      'Have you built dashboards with Next.js App Router and Stripe subscriptions before?\nHow many hours per week can you dedicate?'
  );

  // Model Selection
  const [selectedModel, setSelectedModel] = useState<string>('gemini-3.8-flash');

  // Strategy & Tone
  const [selectedTone, setSelectedTone] = useState<FreelancerProfile['tone']>(profile.tone || 'high_impact');
  const [pricingStrategy, setPricingStrategy] = useState<string>('underbid_5');
  const [customPromptNote, setCustomPromptNote] = useState<string>('');
  const [showAdvancedParams, setShowAdvancedParams] = useState<boolean>(false);

  // Generated state
  const [generatedBid, setGeneratedBid] = useState<(GeneratedBid & { modelUsed?: string }) | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatingStep, setGeneratingStep] = useState<string>('Analyzing requirements...');
  const [isRewriting, setIsRewriting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isEditingProposal, setIsEditingProposal] = useState(false);
  const [customRefineInstruction, setCustomRefineInstruction] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);

  // Synchronize when initialJob changes
  useEffect(() => {
    if (initialJob) {
      setJobTitle(initialJob.title);
      setPlatform(initialJob.platform);
      setCategory(initialJob.category);
      setBudgetType(initialJob.budgetType);
      setMinBudget(initialJob.minBudget);
      setMaxBudget(initialJob.maxBudget);
      setClientCountry(initialJob.clientCountry);
      setSkillsInput(initialJob.skillsRequired?.join(', ') || '');
      setScreeningQuestionsText(initialJob.screeningQuestions?.join('\n') || '');
      setJobDescription(initialJob.description);
    }
  }, [initialJob]);

  // Handle generation
  const handleGenerateProposal = async () => {
    if (!jobDescription.trim()) return;

    setIsGenerating(true);
    setErrorMessage(null);
    setSavedSuccess(false);

    // Dynamic step messages
    const currentModelInfo = AI_MODELS.find((m) => m.id === selectedModel) || AI_MODELS[0];
    const stepInterval = setInterval(() => {
      setGeneratingStep((prev) => {
        if (prev.includes('Analyzing')) return 'Extracting key deliverables & tech stack...';
        if (prev.includes('Extracting')) return 'Formulating winning first-sentence hook...';
        if (prev.includes('Formulating')) return 'Writing tailored proposal & milestone schedule...';
        return `Finalizing bid with ${currentModelInfo.name}...`;
      });
    }, 1000);

    const questionsArray = screeningQuestionsText
      .split('\n')
      .map((q) => q.trim())
      .filter((q) => q.length > 0);

    const skillsArray = skillsInput
      .split(',')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    const effectiveTitle = jobTitle.trim() || jobDescription.slice(0, 50) + '...';

    const jobPayload: JobPosting = {
      id: initialJob?.id || 'manual-' + Date.now(),
      title: effectiveTitle,
      description: jobDescription + (customPromptNote ? `\n[Special Freelancer Note: ${customPromptNote}]` : ''),
      platform: platform as any,
      category,
      budgetType,
      minBudget,
      maxBudget,
      clientCountry,
      clientRating: initialJob?.clientRating || 4.9,
      clientReviewsCount: initialJob?.clientReviewsCount || 24,
      clientPaymentVerified: true,
      clientTotalSpent: initialJob?.clientTotalSpent || 25000,
      skillsRequired: skillsArray.length > 0 ? skillsArray : ['Web Development', 'TypeScript'],
      proposalsCount: initialJob?.proposalsCount || 8,
      postedAt: 'Just now',
      postedTimestamp: Date.now(),
      screeningQuestions: questionsArray,
      urgency: 'high',
    };

    const tempProfile = {
      ...profile,
      tone: selectedTone,
    };

    try {
      const bid = await generateBidProposal(
        jobPayload,
        tempProfile,
        {
          bidAmountStrategy: pricingStrategy as any,
        },
        selectedModel
      );
      setGeneratedBid(bid);

      // Trigger light confetti
      confetti({
        particleCount: 40,
        spread: 60,
        origin: { y: 0.5 },
      });
    } catch (err: any) {
      console.error('Failed to generate proposal', err);
      const errMsg = err.message || '';
      if (errMsg.includes('503') || errMsg.includes('high demand') || errMsg.includes('UNAVAILABLE')) {
        setErrorMessage(
          'Google AI is currently experiencing high demand on this model. We recommend switching to "Gemini 3.1 Flash Lite" in the AI Model selector below and clicking Generate again!'
        );
      } else {
        setErrorMessage(err.message || 'Generation failed. Please try again.');
      }
    } finally {
      clearInterval(stepInterval);
      setIsGenerating(false);
      setGeneratingStep('Analyzing requirements...');
    }
  };

  // 1-Click Copy
  const handleCopyProposal = () => {
    if (!generatedBid) return;
    navigator.clipboard.writeText(generatedBid.proposalText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // AI Refinements
  const handleQuickRefine = async (instruction: string) => {
    if (!generatedBid) return;
    setIsRewriting(true);
    try {
      const updatedText = await rewriteProposal(
        generatedBid.proposalText,
        generatedBid.jobTitle,
        instruction,
        profile,
        selectedModel
      );
      setGeneratedBid({
        ...generatedBid,
        proposalText: updatedText,
      });
    } catch (err) {
      console.error('Refinement failed', err);
    } finally {
      setIsRewriting(false);
    }
  };

  // Submit/Save to Pipeline
  const handleSave = (status: GeneratedBid['status']) => {
    if (!generatedBid) return;
    const finalBid: GeneratedBid = {
      ...generatedBid,
      status,
    };
    onSaveToPipeline(finalBid);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);

    if (status === 'submitted') {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
    }
  };

  return (
    <div className="space-y-6">
      {errorMessage && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-xl flex items-center gap-3 text-rose-300 text-xs">
          <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Main Two-Column Layout: Left (Input Project Post) + Right (Created Bid Output) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Project Post & Controls (5 cols) */}
        <div className="lg:col-span-5 space-y-4 bg-[#161618] p-5 rounded-2xl border border-[#2a2a2d] shadow-xl">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-zinc-200 uppercase tracking-wider flex items-center gap-2">
              <FileText className="w-4 h-4 text-blue-400" />
              <span>Project Post Input</span>
            </h3>
            <span className="text-[11px] text-zinc-500 font-mono">
              {jobDescription.length} chars
            </span>
          </div>

          {/* 1. Primary Project Post / Job Description Textarea */}
          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1.5">
              Project Post / Job Description <span className="text-blue-400">*</span>
            </label>
            <textarea
              id="input-project-description"
              rows={7}
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Paste or type the client's project post here (e.g. 'Looking for a developer to build an e-commerce dashboard with Stripe, budget $1500...')"
              className="w-full p-3.5 bg-[#0e0e10] border border-[#2a2a2d] rounded-xl text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-blue-500 font-sans leading-relaxed transition"
            />
          </div>

          {/* Quick Tone & Strategy Pills */}
          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1.5">Proposal Tone</label>
            <div className="grid grid-cols-2 gap-1.5">
              {[
                { id: 'high_impact', label: '🔥 High Impact' },
                { id: 'professional', label: '👔 Professional' },
                { id: 'conversational', label: '💬 Friendly' },
                { id: 'technical', label: '⚡ Deep Technical' },
              ].map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setSelectedTone(t.id as any)}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-medium border text-center transition ${
                    selectedTone === t.id
                      ? 'bg-blue-600/20 border-blue-500 text-blue-200 font-semibold'
                      : 'bg-[#0e0e10] border-[#2a2a2d] text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* AI Model Selector */}
          <div className="pt-2 border-t border-[#2a2a2d] space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-zinc-300 flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5 text-indigo-400" />
                <span>AI Model</span>
              </label>
              <span className="text-[10px] text-zinc-500">Choose model or switch if high demand</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
              {AI_MODELS.map((modelItem) => {
                const isSelected = selectedModel === modelItem.id;
                return (
                  <button
                    key={modelItem.id}
                    type="button"
                    onClick={() => setSelectedModel(modelItem.id)}
                    className={`p-2.5 rounded-xl border text-left transition flex flex-col justify-between gap-1 cursor-pointer ${
                      isSelected
                        ? 'bg-gradient-to-br from-indigo-950/40 to-blue-950/40 border-indigo-500/80 shadow-md shadow-indigo-500/10'
                        : 'bg-[#0e0e10] border-[#2a2a2d] hover:border-zinc-700 opacity-80 hover:opacity-100'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className={`text-xs font-semibold ${isSelected ? 'text-indigo-200 font-bold' : 'text-zinc-300'}`}>
                        {modelItem.name}
                      </span>
                      <span className={`text-[9px] px-1.5 py-0.5 rounded font-mono border ${modelItem.tagColor}`}>
                        {modelItem.tag}
                      </span>
                    </div>
                    <p className="text-[10px] text-zinc-500 leading-tight">
                      {modelItem.description}
                    </p>
                  </button>
                );
              })}
            </div>

            {selectedModel === 'gemini-3.1-flash-lite' && (
              <div className="flex items-center gap-2 p-2 bg-emerald-950/20 border border-emerald-500/20 rounded-lg text-[11px] text-emerald-300">
                <ShieldCheck className="w-3.5 h-3.5 shrink-0 text-emerald-400" />
                <span>High availability mode active: Bypasses 503 peak traffic spikes with instant turnaround.</span>
              </div>
            )}
          </div>

          {/* Advanced / Optional Fields Toggle */}
          <div className="pt-2 border-t border-[#2a2a2d]">
            <button
              type="button"
              onClick={() => setShowAdvancedParams(!showAdvancedParams)}
              className="text-xs text-zinc-400 hover:text-zinc-200 flex items-center gap-1 font-medium transition"
            >
              <Sliders className="w-3.5 h-3.5 text-blue-400" />
              <span>{showAdvancedParams ? 'Hide Optional Job Details' : 'Configure Title, Budget & Platform (Optional)'}</span>
            </button>

            {showAdvancedParams && (
              <div className="mt-3 space-y-3 pt-3 border-t border-[#2a2a2d]/60">
                {/* Project Title */}
                <div>
                  <label className="block text-[11px] font-medium text-zinc-400 mb-1">Project Title</label>
                  <input
                    type="text"
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                    placeholder="e.g. Next.js SaaS Web App"
                    className="w-full px-3 py-1.5 bg-[#0e0e10] border border-[#2a2a2d] rounded-lg text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-blue-500"
                  />
                </div>

                {/* Platform & Category */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-medium text-zinc-400 mb-1">Platform</label>
                    <select
                      value={platform}
                      onChange={(e) => setPlatform(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-[#0e0e10] border border-[#2a2a2d] rounded-lg text-xs text-zinc-200 focus:outline-none focus:border-blue-500"
                    >
                      <option value="Upwork">Upwork</option>
                      <option value="Freelancer">Freelancer</option>
                      <option value="Fiverr Pro">Fiverr Pro</option>
                      <option value="Toptal">Toptal</option>
                      <option value="Guru">Guru</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-zinc-400 mb-1">Category</label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-[#0e0e10] border border-[#2a2a2d] rounded-lg text-xs text-zinc-200 focus:outline-none focus:border-blue-500"
                    >
                      <option value="Web Development">Web Development</option>
                      <option value="Automation & Scraping">Automation & Scraping</option>
                      <option value="AI & Machine Learning">AI & Machine Learning</option>
                      <option value="Mobile Apps">Mobile Apps</option>
                    </select>
                  </div>
                </div>

                {/* Budget Range */}
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-[11px] font-medium text-zinc-400 mb-1">Type</label>
                    <select
                      value={budgetType}
                      onChange={(e) => setBudgetType(e.target.value as any)}
                      className="w-full px-2 py-1.5 bg-[#0e0e10] border border-[#2a2a2d] rounded-lg text-xs text-zinc-200"
                    >
                      <option value="fixed">Fixed</option>
                      <option value="hourly">Hourly</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-zinc-400 mb-1">Min ($)</label>
                    <input
                      type="number"
                      value={minBudget}
                      onChange={(e) => setMinBudget(Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 bg-[#0e0e10] border border-[#2a2a2d] rounded-lg text-xs text-zinc-200"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-zinc-400 mb-1">Max ($)</label>
                    <input
                      type="number"
                      value={maxBudget}
                      onChange={(e) => setMaxBudget(Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 bg-[#0e0e10] border border-[#2a2a2d] rounded-lg text-xs text-zinc-200"
                    />
                  </div>
                </div>

                {/* Skills & Screening Questions */}
                <div>
                  <label className="block text-[11px] font-medium text-zinc-400 mb-1">Key Tech Skills</label>
                  <input
                    type="text"
                    value={skillsInput}
                    onChange={(e) => setSkillsInput(e.target.value)}
                    placeholder="React, Next.js, TypeScript, etc."
                    className="w-full px-2.5 py-1.5 bg-[#0e0e10] border border-[#2a2a2d] rounded-lg text-xs text-zinc-200"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-zinc-400 mb-1">Screening Questions (1 per line)</label>
                  <textarea
                    rows={2}
                    value={screeningQuestionsText}
                    onChange={(e) => setScreeningQuestionsText(e.target.value)}
                    placeholder="Questions from client..."
                    className="w-full px-2.5 py-1.5 bg-[#0e0e10] border border-[#2a2a2d] rounded-lg text-xs text-zinc-200 font-sans"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-zinc-400 mb-1">Custom Highlight / Extra Note</label>
                  <input
                    type="text"
                    value={customPromptNote}
                    onChange={(e) => setCustomPromptNote(e.target.value)}
                    placeholder="e.g. Mention 100% refund guarantee or same-day start"
                    className="w-full px-2.5 py-1.5 bg-[#0e0e10] border border-[#2a2a2d] rounded-lg text-xs text-zinc-200"
                  />
                </div>
              </div>
            )}
          </div>

          {/* PRIMARY GENERATE BUTTON */}
          <button
            id="btn-trigger-ai-generate"
            onClick={handleGenerateProposal}
            disabled={isGenerating || !jobDescription.trim()}
            className="w-full py-3.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-sm uppercase tracking-wider rounded-xl shadow-lg shadow-blue-500/25 transition active:scale-[0.99] disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
          >
            {isGenerating ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span className="text-xs">{generatingStep}</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>Generate Winning Bid</span>
              </>
            )}
          </button>
        </div>

        {/* Right Column: Generated Bid Display (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {!generatedBid ? (
            <div className="bg-[#161618] border border-[#2a2a2d] rounded-2xl p-12 text-center space-y-4 shadow-xl flex flex-col items-center justify-center min-h-[380px]">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600/20 to-indigo-600/20 text-blue-400 flex items-center justify-center mx-auto border border-blue-500/30">
                <Zap className="w-7 h-7 text-amber-400" />
              </div>
              <div className="space-y-2 max-w-md mx-auto">
                <h3 className="text-base font-bold text-zinc-100">Ready to Create Your Bid</h3>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Type or paste your project post on the left, then click <strong className="text-blue-400">Generate Winning Bid</strong>.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Proposal Header Card */}
              <div className="bg-[#161618] border border-[#2a2a2d] p-5 rounded-2xl space-y-3 shadow-xl">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      Bid Created ({generatedBid.matchScore}% Match)
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                      Bid: ${generatedBid.bidAmount} • {generatedBid.deliveryDays} Days
                    </span>
                    {generatedBid.modelUsed && (
                      <span className="px-2 py-0.5 rounded-full text-[11px] font-mono text-zinc-400 bg-zinc-800/80 border border-zinc-700/60 flex items-center gap-1">
                        <Cpu className="w-3 h-3 text-indigo-400" />
                        {AI_MODELS.find((m) => m.id === generatedBid.modelUsed)?.name || generatedBid.modelUsed}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setIsEditingProposal(!isEditingProposal)}
                      className="px-2.5 py-1 text-xs text-zinc-300 bg-[#1c1c1f] hover:bg-[#2a2a2d] rounded-lg border border-[#2a2a2d] transition flex items-center gap-1"
                    >
                      <Edit3 className="w-3 h-3" />
                      <span>{isEditingProposal ? 'Done Editing' : 'Edit'}</span>
                    </button>

                    <button
                      id="btn-copy-proposal"
                      onClick={handleCopyProposal}
                      className="px-3.5 py-1 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg shadow-md shadow-blue-500/20 transition flex items-center gap-1 active:scale-95"
                    >
                      {copied ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copied ? 'Copied!' : 'Copy Proposal'}</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Proposal Text Card */}
              <div className="bg-[#161618] border border-[#2a2a2d] p-5 rounded-2xl space-y-3 shadow-xl">
                <div className="flex items-center justify-between text-xs text-zinc-400">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-zinc-200">Full Proposal Letter</span>
                    {(() => {
                      const letterCount = generatedBid.proposalText.length;
                      const isTarget = letterCount >= 1200 && letterCount <= 1400;
                      return (
                        <span
                          className={`px-2 py-0.5 rounded text-[11px] font-mono font-medium border ${
                            isTarget
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                              : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                          }`}
                        >
                          {letterCount} letters {isTarget ? '✓ (Target: 1200~1400)' : '(Target: 1200~1400)'}
                        </span>
                      );
                    })()}
                  </div>
                  <span>{generatedBid.proposalText.split(/\s+/).filter(Boolean).length} words</span>
                </div>

                {isEditingProposal ? (
                  <textarea
                    rows={12}
                    value={generatedBid.proposalText}
                    onChange={(e) =>
                      setGeneratedBid({
                        ...generatedBid,
                        proposalText: e.target.value,
                      })
                    }
                    className="w-full p-4 bg-[#0e0e10] border border-blue-500/50 rounded-xl text-xs text-zinc-200 font-sans leading-relaxed focus:outline-none"
                  />
                ) : (
                  <div className="p-4 bg-[#0e0e10] border border-[#2a2a2d] rounded-xl text-xs text-zinc-200 font-sans leading-relaxed whitespace-pre-line select-text">
                    {generatedBid.proposalText}
                  </div>
                )}

                {/* Quick AI Refine Pills */}
                <div className="pt-2 border-t border-[#2a2a2d] space-y-2">
                  <span className="text-[11px] font-semibold text-zinc-400 block">
                    AI 1-Click Refinements:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      { label: '🎯 Tune to 1,200~1,400 letters', prompt: 'Ensure the proposal is comprehensive, highly persuasive, structured with clean bullet points, and strictly between 1,200 and 1,400 letters in total length.' },
                      { label: '⚡ More Technical', prompt: 'Add deeper technical architecture insights and clean code principles, keeping length between 1,200 and 1,400 letters.' },
                      { label: '🛡️ Add 100% Guarantee', prompt: 'Emphasize 100% money back guarantee and 30 days of free bug fix support, keeping length between 1,200 and 1,400 letters.' },
                      { label: '🚀 High Urgency / Ready Now', prompt: 'Emphasize immediate availability to start today and daily staging updates, keeping length between 1,200 and 1,400 letters.' },
                    ].map((btn, i) => (
                      <button
                        key={i}
                        disabled={isRewriting}
                        onClick={() => handleQuickRefine(btn.prompt)}
                        className="px-2.5 py-1 bg-[#1c1c1f] hover:bg-[#2a2a2d] text-zinc-300 rounded-lg text-xs font-medium border border-[#2a2a2d] transition active:scale-95 disabled:opacity-50"
                      >
                        {btn.label}
                      </button>
                    ))}
                  </div>

                  {/* Custom Refine Prompt Input */}
                  <div className="flex items-center gap-2 pt-1">
                    <input
                      type="text"
                      value={customRefineInstruction}
                      onChange={(e) => setCustomRefineInstruction(e.target.value)}
                      placeholder="Custom instruction (e.g. 'Add mention of AWS deployment and Redis')..."
                      className="flex-1 px-3 py-1.5 bg-[#0e0e10] border border-[#2a2a2d] rounded-lg text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-blue-500"
                    />
                    <button
                      onClick={() => {
                        if (customRefineInstruction) {
                          handleQuickRefine(customRefineInstruction);
                          setCustomRefineInstruction('');
                        }
                      }}
                      disabled={isRewriting || !customRefineInstruction}
                      className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold disabled:opacity-50 cursor-pointer"
                    >
                      {isRewriting ? 'Refining...' : 'Refine'}
                    </button>
                  </div>
                </div>
              </div>

              {/* Screening Answers */}
              {generatedBid.screeningAnswers && generatedBid.screeningAnswers.length > 0 && (
                <div className="bg-[#161618] border border-[#2a2a2d] p-5 rounded-2xl space-y-3 shadow-xl">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-1.5">
                    <HelpCircle className="w-4 h-4 text-blue-400" />
                    <span>Screening Question Responses</span>
                  </h4>

                  <div className="space-y-2.5">
                    {generatedBid.screeningAnswers.map((item, idx) => (
                      <div key={idx} className="p-3 bg-[#0e0e10] rounded-xl border border-[#2a2a2d] text-xs space-y-1">
                        <div className="font-semibold text-blue-300">Q: {item.question}</div>
                        <div className="text-zinc-200 leading-relaxed pl-2 border-l border-blue-500/40">
                          {item.answer}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-between gap-3 pt-2">
                <button
                  onClick={() => handleSave('draft')}
                  className="flex items-center gap-2 px-4 py-2.5 bg-[#1c1c1f] hover:bg-[#2a2a2d] text-zinc-200 rounded-xl text-xs font-semibold border border-[#2a2a2d] transition active:scale-95"
                >
                  <BookmarkPlus className="w-4 h-4 text-blue-400" />
                  <span>{savedSuccess ? 'Saved to Pipeline!' : 'Save as Draft'}</span>
                </button>

                <button
                  onClick={() => handleSave('submitted')}
                  className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs font-bold uppercase tracking-wider shadow-lg shadow-emerald-500/20 transition active:scale-95"
                >
                  <Send className="w-4 h-4" />
                  <span>Submit & Add to Pipeline</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
