"use client";

import { MessageSquare, Plus, Download, FileUp } from "lucide-react";

export default function PromptsLibraryPage() {
  return (
    <div className="max-w-[1240px]">
      <div className="text-[13px] text-gray-500 mb-1 flex items-center gap-2">
        <span>Notebooks</span>
        <span className="text-gray-300">/</span>
        <span className="text-gray-900 font-medium">Prompts Library</span>
      </div>
      <h1 className="text-[36px] font-bold text-gray-900 tracking-tight mb-8">Prompts Library</h1>
      
      <div className="grid md:grid-cols-12 gap-8">
        
        {/* LEfT COL: Folders */}
        <div className="md:col-span-3">
          <div className="border border-gray-200 rounded-xl bg-white overflow-hidden shadow-sm">
             <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                <span className="font-bold text-[13px] text-gray-900">Folders</span>
                <button className="text-gray-400 hover:text-gray-900 border border-gray-200 rounded p-0.5 shadow-sm">
                  <Plus size={14} />
                </button>
             </div>
             <div className="p-2 space-y-0.5">
                <button className="w-full flex items-center justify-between px-3 py-2 text-[13px] font-bold rounded-lg bg-red-50 text-gray-900 transition-colors">
                  <span>All Prompts</span>
                  <span className="text-red-500 font-medium font-mono text-xs">0</span>
                </button>
                <button className="w-full flex items-center justify-between px-3 py-2 text-[13px] font-bold rounded-lg hover:bg-gray-50 text-gray-600 transition-colors">
                  <span>Favorites</span>
                  <span className="text-memora-primary font-medium font-mono text-xs">0</span>
                </button>
             </div>
          </div>
        </div>

        {/* RIGHT COL: Prompts List */}
        <div className="md:col-span-9 flex flex-col min-h-[500px]">
          <div className="flex items-center justify-between mb-4">
             <div>
                <h2 className="font-bold text-gray-900">Prompts</h2>
                <div className="text-[13px] text-gray-500 font-medium">All Prompts</div>
             </div>
             <div className="flex items-center gap-2">
                <button className="bg-gray-900 hover:bg-black text-white px-4 py-2 rounded-lg text-[13px] font-bold shadow-sm transition-all focus:ring-2 focus:ring-offset-2 focus:ring-gray-900">
                  New Prompt
                </button>
                <button className="flex items-center gap-1.5 bg-white border border-gray-200 px-3 py-2 rounded-lg text-[13px] font-bold text-gray-700 hover:bg-gray-50 shadow-sm transition-all">
                  <FileUp size={14} className="text-gray-500" /> Import
                </button>
                <button className="flex items-center gap-1.5 bg-white border border-gray-200 px-3 py-2 rounded-lg text-[13px] font-bold text-gray-700 hover:bg-gray-50 shadow-sm transition-all">
                  <FileUp size={14} className="text-gray-500" /> Sample CSV
                </button>
                <button className="flex items-center gap-1.5 bg-white border border-gray-200 px-3 py-2 rounded-lg text-[13px] font-bold text-gray-700 hover:bg-gray-50 shadow-sm transition-all">
                  <Download size={14} className="text-gray-500" /> Backup
                </button>
                <input type="text" placeholder="Search prompts..." className="w-[200px] border border-gray-200 rounded-lg px-3 py-2 text-[13px] font-medium outline-none focus:border-memora-primary focus:ring-1 focus:ring-memora-primary ml-2 bg-gray-50 focus:bg-white transition-all shadow-sm placeholder-gray-400" />
             </div>
          </div>

          <div className="flex-1 border border-gray-200 rounded-xl bg-white shadow-sm flex flex-col items-center justify-center p-8">
             <div className="w-16 h-12 bg-gray-50 border border-gray-200 rounded-lg flex items-center justify-center mb-4">
               <div className="w-6 h-1 bg-gray-300 rounded-full"></div>
             </div>
             <p className="text-sm font-medium text-gray-500">No prompts found.</p>
          </div>
        </div>
      </div>

    </div>
  );
}
