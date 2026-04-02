"use client";

import { 
  ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight,
  Download, FolderInput, Trash2, ChevronDown, FolderPlus, 
  Search, Filter, RotateCw, Square, Star, Folder, Tag
} from "lucide-react";

export default function SourcesPage() {
  return (
    <div className="w-full max-w-full">
      {/* Breadcrumbs */}
      <div className="text-[13px] text-gray-500 mb-2 flex items-center gap-1">
        <span>Notebooks</span>
        <span className="text-gray-300">›</span>
        <span className="text-gray-900 font-medium">Sources</span>
      </div>
      
      {/* Page Title */}
      <h1 className="text-[32px] md:text-[36px] font-bold text-gray-900 tracking-tight mb-4">All Sources</h1>
      
      {/* Badges / Filters */}
      <div className="flex items-center gap-3 mb-6">
        <button className="flex items-center gap-2 px-3 py-1.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 shadow-sm transition-colors">
          <ChevronLeft size={16} className="text-gray-400" />
          <span>All Sources / <span className="text-gray-900 font-bold">All</span></span>
        </button>
        <div className="px-3 py-1.5 rounded-full bg-green-100/50 text-memora-primary border border-green-100 text-xs font-bold tracking-wide uppercase">
          0 TOTAL
        </div>
      </div>
      
      <p className="text-sm font-medium text-gray-500 mb-4">Showing every folder</p>
      
      <hr className="border-gray-200 mb-5" />
      
      {/* Toolbar */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 mb-4">
        {/* Left Actions */}
        <div className="flex items-center gap-6">
          <button className="flex items-center gap-2 text-sm font-semibold text-gray-300 cursor-not-allowed">
            <Download size={16} strokeWidth={2.5} /> Download
          </button>
          <button className="flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-gray-900 transition-colors">
            <FolderInput size={16} strokeWidth={2.5} /> Move to Folder
          </button>
          <button className="flex items-center gap-2 text-sm font-semibold text-[#f87171] hover:text-red-500 transition-colors">
            <Trash2 size={16} strokeWidth={2.5} /> Delete
          </button>
        </div>
        
        {/* Right Actions */}
        <div className="flex flex-wrap items-center gap-3 pb-1">
          <button className="flex items-center justify-between gap-4 px-3 py-2 border border-gray-200 rounded-lg text-sm font-semibold text-gray-800 bg-white hover:bg-gray-50 shadow-[0_1px_2px_rgba(0,0,0,0.02)] min-w-[130px] transition-colors">
            All Folders <ChevronDown size={16} className="text-gray-400" />
          </button>
          <button className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-lg text-sm font-semibold text-gray-800 bg-white hover:bg-gray-50 shadow-[0_1px_2px_rgba(0,0,0,0.02)] transition-colors">
            <FolderPlus size={16} className="text-gray-400" /> New Folder
          </button>
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search artifacts..." 
              className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm font-medium placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-memora-primary/20 focus:border-memora-primary w-[220px] shadow-[0_1px_2px_rgba(0,0,0,0.02)] transition-shadow"
            />
          </div>
          <button className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-lg text-sm font-semibold text-gray-800 bg-white hover:bg-gray-50 shadow-[0_1px_2px_rgba(0,0,0,0.02)] transition-colors">
            <Filter size={16} className="text-gray-800" /> Filter
          </button>
          <button className="p-2 border border-gray-200 rounded-lg text-gray-400 hover:text-gray-600 bg-white hover:bg-gray-50 shadow-[0_1px_2px_rgba(0,0,0,0.02)] transition-colors">
            <RotateCw size={16} />
          </button>
        </div>
      </div>
      
      {/* Table Area */}
      <div className="border border-gray-200 rounded-xl bg-white overflow-hidden flex flex-col shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
        {/* Table Header */}
        <div className="flex flex-col md:flex-row md:items-center border-b border-gray-200 bg-white text-xs font-semibold text-gray-400">
          <div className="flex">
            <div className="w-[50px] p-4 flex items-center justify-center border-r border-gray-200">
              <Square size={16} className="text-gray-200 hover:text-gray-400 cursor-pointer transition-colors" />
            </div>
            <div className="w-[50px] p-4 flex items-center justify-center border-r border-gray-200">
              <Star size={16} className="text-gray-300" />
            </div>
          </div>
          <div className="flex-[2] min-w-[200px] p-4 flex items-center gap-2 md:border-r border-gray-200 px-6">
            <span className="text-[10px] font-bold text-gray-400 tracking-tighter">AA</span> Name
          </div>
          <div className="flex-1 min-w-[150px] p-4 flex items-center gap-2 border-t md:border-t-0 md:border-r border-gray-200">
            <Folder size={14} className="text-gray-300" /> Notebook
          </div>
          <div className="flex-1 min-w-[150px] p-4 flex items-center gap-2 border-t md:border-t-0 md:border-r border-gray-200">
            <Tag size={14} className="text-gray-300" /> Tags
          </div>
          <div className="flex-1 min-w-[150px] p-4 flex items-center gap-2 border-t md:border-t-0">
            Last edited time
          </div>
        </div>
        
        {/* Table Empty Body */}
        <div className="p-12 flex flex-col items-center justify-center text-center min-h-[460px]">
          <div className="w-[64px] h-[64px] bg-[#E8F5EE] rounded-[16px] flex items-center justify-center text-memora-dark mb-6">
            <Folder size={32} strokeWidth={2.5} />
          </div>
          <h3 className="text-[20px] font-bold text-gray-900 mb-2">No Sources Yet</h3>
          <p className="text-gray-500 font-medium text-[14px]">
            You haven&apos;t imported any documents, links, or media yet.
          </p>
        </div>
      </div>
      
      {/* Pagination Footer */}
      <div className="flex flex-col md:flex-row items-center justify-between mt-6 text-xs font-bold text-gray-500">
        <div className="mb-4 md:mb-0">0 of 0 row(s) selected.</div>
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-2">
            <span>Rows per page</span>
            <button className="flex items-center gap-1 text-gray-900 font-bold">
              10 <ChevronDown size={14} />
            </button>
          </div>
          <div>Page 1 of 1</div>
          <div className="flex items-center gap-3 text-gray-300">
            <ChevronsLeft size={16} strokeWidth={2.5} className="cursor-not-allowed" />
            <ChevronLeft size={16} strokeWidth={2.5} className="cursor-not-allowed" />
            <ChevronRight size={16} strokeWidth={2.5} className="cursor-not-allowed" />
            <ChevronsRight size={16} strokeWidth={2.5} className="cursor-not-allowed" />
          </div>
        </div>
      </div>
    </div>
  );
}
