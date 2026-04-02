"use client";

import { useState } from "react";
import TopNavbar from "@/components/dashboard/TopNavbar";
import Sidebar from "@/components/dashboard/Sidebar";
import BottomTabBar from "@/components/dashboard/BottomTabBar";

export default function DashboardLayout({ children }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="flex h-screen bg-memora-bg font-sans text-memora-text overflow-hidden">
      
      {/* Desktop Sidebar (fixed left) */}
      <div className="hidden md:flex flex-col w-[260px] shrink-0 border-r border-memora-border bg-white z-40 sticky top-0 h-screen">
          <Sidebar isOpen={true} />
      </div>
      
      {/* Mobile Sidebar overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/40 z-[55] md:hidden" 
          onClick={() => setIsMobileMenuOpen(false)} 
        />
      )}
      <div className={`md:hidden fixed inset-y-0 left-0 z-[60] w-[260px] bg-white transform transition-transform duration-300 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
         <Sidebar isOpen={true} />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Top Navbar sits inside the scrolling main area but stays fixed at top relatively or absolute, actually we can just make it sticky or fixed */}
        <div className="shrink-0">
          <TopNavbar onMenuClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} />
        </div>
        
        {/* Actual content */}
        <main className="flex-1 p-6 md:p-10 overflow-auto">
          <div className="max-w-[1240px] mx-auto pb-24 md:pb-8">
            {children}
          </div>
        </main>
      </div>

      <div className="md:hidden">
        <BottomTabBar />
      </div>
    </div>
  );
}
