import React, { useState } from 'react';
import {
  User,
  Sparkles,
  Plus,
  Trash2,
  CheckCircle2,
  DollarSign,
  Briefcase,
  Layers,
  Save,
  BrainCircuit,
  Award,
  Link as LinkIcon,
  Check,
} from 'lucide-react';
import { FreelancerProfile } from '../types';
import { optimizeProfile } from '../services/api';

interface ProfileManagerProps {
  profile: FreelancerProfile;
  onSaveProfile: (profile: FreelancerProfile) => void;
}

export const ProfileManager: React.FC<ProfileManagerProps> = ({ profile, onSaveProfile }) => {
  const [formData, setFormData] = useState<FreelancerProfile>(profile);
  const [newSkill, setNewSkill] = useState('');
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [optimizationResult, setOptimizationResult] = useState<any | null>(null);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Add skill
  const handleAddSkill = () => {
    if (newSkill.trim() && !formData.skills.includes(newSkill.trim())) {
      setFormData({
        ...formData,
        skills: [...formData.skills, newSkill.trim()],
      });
      setNewSkill('');
    }
  };

  // Remove skill
  const handleRemoveSkill = (skill: string) => {
    setFormData({
      ...formData,
      skills: formData.skills.filter((s) => s !== skill),
    });
  };

  // Add portfolio project
  const handleAddProject = () => {
    const newProj = {
      id: 'proj-' + Date.now(),
      title: 'New Client Project',
      description: 'Built full-stack application with clean architecture and responsive UI.',
      techStack: ['React', 'TypeScript', 'Node.js'],
      resultMetric: 'Delivered in 2 weeks with 100% client satisfaction',
      liveUrl: 'https://example.com',
    };
    setFormData({
      ...formData,
      portfolioProjects: [...formData.portfolioProjects, newProj],
    });
  };

  // Remove portfolio project
  const handleRemoveProject = (id: string) => {
    setFormData({
      ...formData,
      portfolioProjects: formData.portfolioProjects.filter((p) => p.id !== id),
    });
  };

  // Update specific portfolio project
  const handleUpdateProject = (id: string, field: string, value: any) => {
    setFormData({
      ...formData,
      portfolioProjects: formData.portfolioProjects.map((p) =>
        p.id === id ? { ...p, [field]: value } : p
      ),
    });
  };

  // Run AI Profile Optimizer
  const handleRunOptimizer = async () => {
    setIsOptimizing(true);
    try {
      const result = await optimizeProfile(formData, formData.title);
      setOptimizationResult(result);
    } catch (err) {
      console.error('Optimization error', err);
    } finally {
      setIsOptimizing(false);
    }
  };

  // Save changes
  const handleSave = () => {
    onSaveProfile(formData);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-[#161618] p-5 rounded-2xl border border-[#2a2a2d] shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <User className="w-5 h-5 text-blue-400" />
            <h2 className="text-lg font-bold text-zinc-100">Freelancer Profile & Portfolio Engine</h2>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            The Bid Bot uses your profile bio, skills, hourly rate, and portfolio metrics to tailor every generated proposal.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            id="btn-run-ai-optimizer"
            onClick={handleRunOptimizer}
            disabled={isOptimizing}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 rounded-xl text-xs font-semibold transition disabled:opacity-50"
          >
            <Sparkles className="w-3.5 h-3.5 text-blue-400" />
            <span>{isOptimizing ? 'Analyzing with Gemini...' : 'AI Profile Optimizer'}</span>
          </button>

          <button
            id="btn-save-profile"
            onClick={handleSave}
            className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold uppercase tracking-wider shadow-md shadow-blue-500/20 transition active:scale-95"
          >
            {savedSuccess ? <Check className="w-4 h-4 text-emerald-300" /> : <Save className="w-4 h-4" />}
            <span>{savedSuccess ? 'Saved!' : 'Save Profile'}</span>
          </button>
        </div>
      </div>

      {/* AI Optimization Advice Card if active */}
      {optimizationResult && (
        <div className="bg-gradient-to-br from-blue-950/40 via-[#161618] to-[#161618] border border-blue-500/30 p-5 rounded-2xl space-y-4 shadow-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BrainCircuit className="w-5 h-5 text-blue-400" />
              <h3 className="text-sm font-bold text-zinc-100">AI Optimization & Keyword Insights</h3>
            </div>
            <button
              onClick={() => {
                setFormData({
                  ...formData,
                  title: optimizationResult.improvedTitle || formData.title,
                  bio: optimizationResult.improvedBio || formData.bio,
                  skills: Array.from(new Set([...formData.skills, ...(optimizationResult.suggestedSkills || [])])),
                });
              }}
              className="text-xs px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-semibold transition"
            >
              Apply AI Recommendations
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="bg-[#0e0e10] p-3.5 rounded-xl border border-[#2a2a2d] space-y-1">
              <span className="font-bold text-blue-300 uppercase tracking-wider text-[10px]">
                High-Converting Headline:
              </span>
              <p className="text-zinc-200">{optimizationResult.improvedTitle}</p>
            </div>

            <div className="bg-[#0e0e10] p-3.5 rounded-xl border border-[#2a2a2d] space-y-1">
              <span className="font-bold text-blue-300 uppercase tracking-wider text-[10px]">
                High-Converting Bio Excerpt:
              </span>
              <p className="text-zinc-200">{optimizationResult.improvedBio}</p>
            </div>
          </div>

          {optimizationResult.actionableTips && (
            <div>
              <span className="font-bold text-zinc-400 uppercase tracking-wider text-[10px] block mb-1.5">
                Actionable Tactics to Win 3x More Jobs:
              </span>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {optimizationResult.actionableTips.map((tip: string, i: number) => (
                  <li key={i} className="p-2.5 bg-[#0e0e10] rounded-lg border border-[#2a2a2d] text-zinc-300 flex items-start gap-2">
                    <span className="text-blue-400 font-bold">•</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Main Profile Editor Form */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Basic Info (7 cols) */}
        <div className="lg:col-span-7 space-y-4 bg-[#161618] p-5 rounded-2xl border border-[#2a2a2d] shadow-xl">
          <h3 className="text-sm font-bold text-zinc-200 uppercase tracking-wider flex items-center gap-2">
            <Briefcase className="w-4 h-4 text-blue-400" />
            <span>Profile Core Information</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">Full Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 bg-[#0e0e10] border border-[#2a2a2d] rounded-lg text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-blue-500 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">Professional Title</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3 py-2 bg-[#0e0e10] border border-[#2a2a2d] rounded-lg text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-blue-500 transition"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">Hourly Rate ($/hr)</label>
              <input
                type="number"
                value={formData.hourlyRate}
                onChange={(e) => setFormData({ ...formData, hourlyRate: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-[#0e0e10] border border-[#2a2a2d] rounded-lg text-xs text-zinc-200 focus:outline-none focus:border-blue-500 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">Min Fixed Project ($)</label>
              <input
                type="number"
                value={formData.minFixedRate}
                onChange={(e) => setFormData({ ...formData, minFixedRate: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-[#0e0e10] border border-[#2a2a2d] rounded-lg text-xs text-zinc-200 focus:outline-none focus:border-blue-500 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">Years Experience</label>
              <input
                type="number"
                value={formData.yearsOfExperience}
                onChange={(e) => setFormData({ ...formData, yearsOfExperience: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-[#0e0e10] border border-[#2a2a2d] rounded-lg text-xs text-zinc-200 focus:outline-none focus:border-blue-500 transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1">Professional Bio & Value Statement</label>
            <textarea
              rows={4}
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              className="w-full px-3 py-2 bg-[#0e0e10] border border-[#2a2a2d] rounded-lg text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-blue-500 font-sans leading-relaxed transition"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1">Custom Proposal Sign-off / Signature</label>
            <textarea
              rows={2}
              value={formData.customSignature}
              onChange={(e) => setFormData({ ...formData, customSignature: e.target.value })}
              className="w-full px-3 py-2 bg-[#0e0e10] border border-[#2a2a2d] rounded-lg text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-blue-500 font-sans transition"
            />
          </div>

          {/* Unique Selling Points */}
          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1.5">
              Unique Selling Points & Warranties (Used in proposals)
            </label>
            <div className="space-y-1.5">
              {formData.uniqueSellingPoints.map((usp, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={usp}
                    onChange={(e) => {
                      const updated = [...formData.uniqueSellingPoints];
                      updated[idx] = e.target.value;
                      setFormData({ ...formData, uniqueSellingPoints: updated });
                    }}
                    className="flex-1 px-3 py-1.5 bg-[#0e0e10] border border-[#2a2a2d] rounded-lg text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-blue-500 transition"
                  />
                  <button
                    onClick={() => {
                      setFormData({
                        ...formData,
                        uniqueSellingPoints: formData.uniqueSellingPoints.filter((_, i) => i !== idx),
                      });
                    }}
                    className="p-1.5 text-zinc-500 hover:text-rose-400 transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
              <button
                onClick={() => {
                  setFormData({
                    ...formData,
                    uniqueSellingPoints: [...formData.uniqueSellingPoints, 'New competitive advantage / guarantee'],
                  });
                }}
                className="text-xs text-blue-400 hover:text-blue-300 font-medium flex items-center gap-1 mt-1 transition"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Selling Point</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right: Skills & Portfolio (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Skills Management */}
          <div className="bg-[#161618] p-5 rounded-2xl border border-[#2a2a2d] space-y-3 shadow-xl">
            <h3 className="text-sm font-bold text-zinc-200 uppercase tracking-wider flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-emerald-400" />
                <span>Skills & Tech Stack ({formData.skills.length})</span>
              </span>
            </h3>

            <div className="flex items-center gap-2">
              <input
                type="text"
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddSkill()}
                placeholder="Add skill (e.g. Next.js, Docker)..."
                className="flex-1 px-3 py-1.5 bg-[#0e0e10] border border-[#2a2a2d] rounded-lg text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-blue-500 transition"
              />
              <button
                onClick={handleAddSkill}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold transition"
              >
                Add
              </button>
            </div>

            <div className="flex flex-wrap gap-1.5 max-h-48 overflow-y-auto pr-1">
              {formData.skills.map((skill) => (
                <span
                  key={skill}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-[#0e0e10] text-zinc-200 border border-[#2a2a2d] group"
                >
                  <span>{skill}</span>
                  <button
                    onClick={() => handleRemoveSkill(skill)}
                    className="text-zinc-500 group-hover:text-rose-400 transition"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Portfolio Showcase */}
          <div className="bg-[#161618] p-5 rounded-2xl border border-[#2a2a2d] space-y-3 shadow-xl">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-zinc-200 uppercase tracking-wider flex items-center gap-2">
                <Award className="w-4 h-4 text-amber-400" />
                <span>Portfolio Case Studies</span>
              </h3>
              <button
                onClick={handleAddProject}
                className="text-xs text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-1 transition"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Case</span>
              </button>
            </div>

            <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
              {formData.portfolioProjects.map((project) => (
                <div
                  key={project.id}
                  className="p-3 bg-[#0e0e10] rounded-xl border border-[#2a2a2d] space-y-2 text-xs"
                >
                  <div className="flex items-center justify-between gap-2">
                    <input
                      type="text"
                      value={project.title}
                      onChange={(e) => handleUpdateProject(project.id, 'title', e.target.value)}
                      placeholder="Project Title"
                      className="font-bold text-zinc-200 bg-transparent border-b border-transparent hover:border-[#2a2a2d] focus:border-blue-500 focus:outline-none w-full"
                    />
                    <button
                      onClick={() => handleRemoveProject(project.id)}
                      className="text-zinc-500 hover:text-rose-400 transition shrink-0"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <textarea
                    rows={2}
                    value={project.description}
                    onChange={(e) => handleUpdateProject(project.id, 'description', e.target.value)}
                    placeholder="Short description of what you built..."
                    className="w-full px-2 py-1 bg-[#161618] border border-[#2a2a2d] rounded text-zinc-300 text-[11px] focus:outline-none"
                  />

                  <div>
                    <label className="block text-[10px] text-zinc-500 uppercase font-bold mb-0.5">
                      Quantifiable Result / Metric (Crucial for Bids):
                    </label>
                    <input
                      type="text"
                      value={project.resultMetric}
                      onChange={(e) => handleUpdateProject(project.id, 'resultMetric', e.target.value)}
                      placeholder="e.g. Reduced load time by 52%, handled 100k daily users"
                      className="w-full px-2 py-1 bg-[#161618] border border-[#2a2a2d] rounded text-emerald-400 font-medium text-[11px] focus:outline-none"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
