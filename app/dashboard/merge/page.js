"use client";

import { GitMerge } from "lucide-react";

export default function MergeNotebooksPage() {
  return (
    <div className="max-w-[1240px]">
      <div className="text-[13px] text-gray-500 mb-1 flex items-center gap-2">
        <span>Notebooks</span>
        <span className="text-gray-300">/</span>
        <span className="text-gray-900 font-medium">Merge Notebooks</span>
      </div>
      <h1 className="text-[36px] font-bold text-gray-900 tracking-tight mb-8">Merge Notebooks</h1>
      
      <div className="mb-6">
        <h2 className="text-[20px] font-bold text-gray-900 mb-1">Merge Notebooks</h2>
        <p className="text-[15px] font-medium text-gray-500">Select notebooks to merge into a new notebook.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-6 mb-8 mt-6">
         <div className="flex-1">
            <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2">New Notebook Name</label>
            <input 
              type="text" 
              placeholder="e.g. My Merged Notebook" 
              className="w-full bg-white border border-gray-200 rounded-lg px-4 py-3 text-[14px] font-medium focus:outline-none focus:border-memora-primary focus:ring-1 focus:ring-memora-primary shadow-sm placeholder-gray-300 transition-colors"
            />
         </div>
         <div className="flex-1 max-w-md">
            <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2">Search Notebooks</label>
            <div className="flex items-center gap-4">
              <div className="relative flex-1">
                <input 
                  type="text" 
                  placeholder="Filter notebooks..." 
                  className="w-full bg-white border border-gray-200 rounded-lg pl-10 pr-4 py-3 text-[14px] font-medium focus:outline-none focus:border-memora-primary focus:ring-1 focus:ring-memora-primary shadow-sm placeholder-gray-300 transition-colors"
                />
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300 text-lg">⚲</span>
              </div>
              <label className="flex items-center gap-2 text-[13px] font-bold text-gray-600 cursor-pointer whitespace-nowrap">
                <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-memora-primary focus:ring-memora-primary" />
                Delete originals
              </label>
              <button className="bg-gray-400 hover:bg-gray-500 text-white font-bold text-[14px] px-6 py-3 rounded-lg shadow-sm transition-colors whitespace-nowrap">
                Merge
              </button>
            </div>
         </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
         <table className="w-full text-left text-[14px]">
            <thead className="bg-gray-50/50 text-[11px] tracking-widest font-bold text-gray-400 uppercase border-b border-gray-200">
               <tr>
                  <th className="px-5 py-4 w-12 text-center">
                     <div className="w-4 h-4 bg-memora-primary rounded flex items-center justify-center mx-auto cursor-pointer shadow-sm">
                       <div className="w-2 h-0.5 bg-white rounded-full"></div>
                     </div>
                  </th>
                  <th className="px-4 py-4">Notebook Name</th>
                  <th className="px-4 py-4 w-32 text-right">Sources</th>
               </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
               {[
                 { name: "Cook or Be Cooked: Removing the Human Business Bottleneck", sources: "1 source", active: false },
                 { name: "Iris Analysis: Unlocking Human Potential Through Biometric Brain Mapping", sources: "1 source", active: true },
                 { name: "Scaling a $6M AI Children's Book Empire via Paid Media", sources: "1 source", active: false },
                 { name: "Scaling Digital Products: From Startup to $141 Million Revenue", sources: "1 source", active: false },
                 { name: "Starter Story: Profitable Micro-SaaS and Online Course Strategies", sources: "9 sources", active: false },
                 { name: "The Chatbase Blueprint: Scaling to $8 Million ARR", sources: "5 sources", active: false },
                 { name: "The Creator Playbook for Viral App Distribution", sources: "2 sources", active: false },
                 { name: "The New App Economy and B2B Video Playbooks", sources: "2 sources", active: false },
                 { name: "The YouTube Search Playbook for Scaling Micro-SaaS Revenue", sources: "1 source", active: false },
                 { name: "Untitled", sources: "0 sources", active: true },
                 { name: "Untitled", sources: "0 sources", active: true },
               ].map((item, i) => (
                 <tr key={i} className="hover:bg-gray-50/50 transition-colors select-none">
                   <td className="px-5 py-4 text-center">
                     <input type="checkbox" checked={item.active} readOnly className="w-4 h-4 rounded border-gray-300 text-memora-primary focus:ring-memora-primary bg-gray-50" />
                   </td>
                   <td className="px-4 py-4 font-bold text-gray-700">{item.name}</td>
                   <td className="px-4 py-4 text-gray-400 font-medium text-right text-[13px]">{item.sources}</td>
                 </tr>
               ))}
            </tbody>
         </table>
      </div>

    </div>
  );
}
