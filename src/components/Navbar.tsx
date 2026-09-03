import React from 'react';
import { Bot, Sparkles } from 'lucide-react';

interface NavbarProps {
  hasApiKey?: boolean;
}

export const Navbar: React.FC<NavbarProps> = () => {
  return (
    <header className="sticky top-0 z-40 bg-[#111113]/95 backdrop-blur-md border-b border-[#2a2a2d]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/20 ring-1 ring-white/10">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-zinc-100 tracking-tight text-lg">Freelancer Bid Bot</span>
                <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  AI v3.8
                </span>
              </div>
            </div>
          </div>

          {/* Right Status Badge */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[#161618] border border-[#2a2a2d] rounded-xl text-xs font-medium text-zinc-300">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Gemini 3.8 Flash Powered</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
