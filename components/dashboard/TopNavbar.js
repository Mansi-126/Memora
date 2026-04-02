"use client";

import { Search, Menu } from "lucide-react";
import Image from "next/image";

export default function TopNavbar({ onMenuClick }) {
  return (
    <nav className="h-[72px] bg-white border-b border-memora-border flex items-center justify-between px-6 md:px-8">
      
      {/* LEFT SECTION */}
      <div className="flex items-center gap-4 w-full max-w-[500px]">
        <button onClick={onMenuClick} className="md:hidden text-memora-dark hover:bg-memora-light p-1.5 rounded-md">
          <Menu size={24} />
        </button>
        
        {/* SEARCH BAR */}
        <div className="relative w-full group hidden md:block">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search size={18} className="text-gray-400" />
          </div>
          <input 
            type="text" 
            placeholder="Search everything..."
            className="w-full h-11 pl-12 pr-12 rounded-full border border-gray-200 bg-gray-50/50 text-[15px] focus:outline-none focus:border-memora-primary focus:bg-white transition-all font-medium text-memora-text placeholder-gray-400"
          />
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <span className="text-xs font-bold text-gray-400 bg-white border border-gray-200 px-2 py-0.5 rounded-md">/</span>
          </div>
        </div>
      </div>

      {/* RIGHT SECTION */}
      <div className="flex items-center gap-4">
        {/* Theme/Settings and Language */}
        <div className="hidden sm:flex items-center gap-3 pr-4 border-r border-gray-200">
           <button className="text-gray-400 hover:text-memora-dark transition-colors p-2 rounded-lg hover:bg-gray-50 border border-transparent hover:border-gray-200">
             <Image src="/dark-mode-icon.svg" width={18} height={18} alt="Theme" className="opacity-0 hidden" />
             {/* Simple placeholder for icons shown in ref */}
             <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="3" y1="9" x2="21" y2="9"></line><line x1="9" y1="21" x2="9" y2="9"></line></svg>
           </button>
           <button className="text-gray-400 hover:text-memora-dark transition-colors p-2 rounded-lg hover:bg-gray-50 border border-transparent hover:border-gray-200">
             <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="2" x2="12" y2="22"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>
           </button>
           <button className="flex items-center gap-1.5 text-sm font-bold text-gray-600 hover:text-memora-dark transition-colors p-1.5 rounded-lg hover:bg-gray-50">
             🇺🇸 English ▾
           </button>
        </div>

        {/* Bell / Artifacts */}
        <button className="p-2 text-gray-400 hover:text-memora-dark rounded-lg hover:bg-gray-50 border border-transparent hover:border-gray-200 transition-colors hidden sm:block">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"></path></svg>
        </button>
        
        {/* Star Action */}
        <button className="hidden sm:flex items-center justify-center bg-memora-dark hover:bg-memora-primary text-white w-9 h-9 rounded-lg transition-colors shadow-sm">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
        </button>

      </div>

    </nav>
  );
}
