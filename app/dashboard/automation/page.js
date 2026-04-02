"use client";

import { Zap } from "lucide-react";

export default function AutomationWorkflowsPage() {
  return (
    <div className="max-w-[1000px]">
      <div className="text-[13px] text-gray-500 mb-1 flex items-center gap-2">
        <span>Organize / Tools</span>
        <span className="text-gray-300">/</span>
        <span className="text-gray-900 font-medium">Automation Workflows</span>
      </div>
      <h1 className="text-[32px] font-bold text-gray-900 tracking-tight mb-8">Automation Workflows</h1>
      
      <div className="bg-white border border-gray-200 rounded-xl p-12 flex flex-col items-center justify-center text-center min-h-[400px] shadow-sm">
        <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-400 mb-4 border border-gray-100">
          <Zap size={28} />
        </div>
        <h3 className="text-lg font-bold text-gray-900 mb-2">No automation workflows found</h3>
        <p className="text-gray-500 text-sm max-w-[300px]">
          This feature module is clean and ready. Organize your content to streamline your workflows.
        </p>
      </div>
    </div>
  );
}
