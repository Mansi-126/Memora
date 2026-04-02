"use client";

import { useState } from "react";
import { Search, ArrowRight, Zap, Copy, Bookmark, FileText } from "lucide-react";

export default function AskMemora() {
  const [query, setQuery] = useState("");
  const [isAnswered, setIsAnswered] = useState(false);

  const filterChips = ["🗂️ All Notebooks ✓", "📗 Research", "📘 Work", "📙 Personal", "+ Add filter"];

  const handleAsk = () => {
    if (query.trim()) {
      setIsAnswered(true);
    }
  };

  return (
    <div className="w-full bg-white rounded-xl border border-memora-border p-6 shadow-sm overflow-hidden">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-[18px] font-bold text-memora-text flex items-center gap-2">
           <span className="text-memora-primary"><Search size={20} className="stroke-[3]" /></span> Ask Memora
        </h3>
        <span className="text-sm text-gray-400 font-medium hidden sm:inline">Search across 12 notebooks</span>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-4 mb-2 custom-scrollbar no-scrollbar">
         {filterChips.map((chip, i) => (
           <button 
             key={i} 
             className={`whitespace-nowrap px-4 py-1.5 rounded-full text-sm font-semibold border transition-colors ${i === 0 ? 'bg-memora-light text-memora-dark border-memora-primary' : 'bg-white text-gray-500 border-gray-200 hover:border-memora-primary'}`}
           >
             {chip}
           </button>
         ))}
      </div>

      <div className="relative group mb-4">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-memora-primary z-10">
           <Search size={22} />
        </div>
        <input 
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAsk()}
          placeholder="Ask anything... e.g. 'What did I save about React hooks?'"
          className="w-full h-[52px] pl-12 pr-28 rounded-xl border-[1.5px] border-memora-border bg-gray-50/50 text-memora-text placeholder-gray-400 focus:outline-none focus:border-memora-primary focus:bg-white focus:shadow-[0_0_15px_rgba(34,197,94,0.15)] transition-all font-medium text-base shadow-inner"
        />
        <button 
          onClick={handleAsk}
          className="absolute right-2 top-2 bottom-2 bg-memora-primary hover:bg-memora-dark text-white font-bold px-4 rounded-lg flex items-center gap-1.5 transition-colors shadow-sm"
        >
          Ask <ArrowRight size={16} />
        </button>
      </div>

      {/* STATES */}
      {!isAnswered ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-6">
           {["💡 What did I save about machine learning?", "💡 Summarize my research notebooks", "💡 Find all my saved Reddit posts", "💡 What are my flashcard weak spots?"].map((s, i) => (
             <button key={i} onClick={() => { setQuery(s.replace("💡 ", "")); setIsAnswered(true); }} className="text-left bg-gray-50 border border-gray-100 hover:border-memora-border hover:bg-memora-light hover:text-memora-dark p-3 rounded-lg text-sm text-gray-600 font-medium transition-colors">
               {s}
             </button>
           ))}
        </div>
      ) : (
        <div className="mt-6 bg-gray-50 border border-gray-200 rounded-xl p-5 md:p-6 shadow-inner animate-fade-in relative overflow-hidden">
           <div className="flex justify-between items-center border-b border-gray-200 pb-4 mb-4">
              <div className="font-bold text-memora-text flex items-center gap-2">
                 <Zap className="text-memora-primary fill-memora-primary/20" size={20} /> Memora&apos;s Answer
              </div>
              <div className="flex gap-2">
                 <button className="text-gray-400 hover:text-memora-dark p-1.5 rounded bg-white border border-gray-200 shadow-sm"><Copy size={14} /></button>
                 <button className="text-gray-400 hover:text-memora-dark p-1.5 rounded bg-white border border-gray-200 shadow-sm"><Bookmark size={14} /></button>
              </div>
           </div>
           
           <p className="text-memora-text leading-relaxed tracking-wide min-h-[60px]">
             Based on your saved content, React hooks allow functional components to use state and lifecycle features. You&apos;ve saved 3 sources that cover this topic in detail...
           </p>

           <div className="mt-6 pt-4 border-t border-gray-200">
             <div className="text-[10px] font-black tracking-widest text-gray-400 uppercase mb-3">Sources Used</div>
             <div className="flex flex-wrap gap-2">
                <span className="flex items-center gap-1.5 text-xs font-bold bg-white border border-gray-200 px-3 py-1.5 rounded-full shadow-sm cursor-pointer hover:border-memora-primary"><FileText size={12} className="text-memora-primary" /> React Notes PDF &middot; pg 3</span>
                <span className="flex items-center gap-1.5 text-xs font-bold bg-white border border-gray-200 px-3 py-1.5 rounded-full shadow-sm cursor-pointer hover:border-memora-primary"><Bookmark size={12} className="text-orange-500" /> ChatGPT Chat &middot; Mar 15</span>
                <span className="flex items-center gap-1.5 text-xs font-bold bg-white border border-gray-200 px-3 py-1.5 rounded-full shadow-sm cursor-pointer hover:border-memora-primary"><ArrowRight size={12} className="text-blue-500" /> Dev.to Article &middot; Feb 28</span>
             </div>
           </div>
        </div>
      )}
    </div>
  );
}
