"use client";

import { Settings } from "lucide-react";

export default function ManageSpacePage() {
  return (
    <div className="max-w-[1000px]">
      <div className="text-[13px] text-gray-500 mb-1 flex items-center gap-2">
        <span>Views</span>
        <span className="text-gray-300">/</span>
        <span className="text-gray-900 font-medium">Manage Space</span>
      </div>
      <h1 className="text-[32px] font-bold text-gray-900 tracking-tight mb-8">Manage Space</h1>
      
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Settings size={18} className="text-memora-primary" />
            Storage Usage
          </h3>
          <div className="space-y-4">
             <div>
               <div className="flex justify-between text-sm mb-1.5">
                 <span className="font-medium text-gray-600">Notebooks</span>
                 <span className="font-bold text-gray-900">11 / 50</span>
               </div>
               <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                 <div className="h-full bg-memora-primary w-[22%]"></div>
               </div>
             </div>
             <div>
               <div className="flex justify-between text-sm mb-1.5">
                 <span className="font-medium text-gray-600">Artifacts</span>
                 <span className="font-bold text-gray-900">16 / 100</span>
               </div>
               <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                 <div className="h-full bg-blue-500 w-[16%]"></div>
               </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
