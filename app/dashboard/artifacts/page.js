"use client";

import { Download, Search, Settings2, Trash2, ExternalLink, Eye, Mic } from "lucide-react";

export default function ArtifactsPage() {
  return (
    <div className="max-w-[1240px]">
      <div className="text-[13px] text-gray-500 mb-1 flex items-center gap-2">
        <span>Notebooks</span>
        <span className="text-gray-300">/</span>
        <span className="text-gray-900 font-medium">All Artifacts</span>
      </div>
      <h1 className="text-[36px] font-bold text-gray-900 tracking-tight mb-8">All Artifacts</h1>
      
      <div className="flex items-center gap-2 text-[13px] font-medium text-gray-500 mb-6 bg-gray-50 w-max px-3 py-1.5 rounded-lg border border-gray-200 cursor-pointer hover:bg-gray-100 transition-colors">
         <span className="text-gray-400">{'<'}</span> 
         <span>All Artifacts</span>
         <span className="text-gray-300">/</span>
         <span className="text-gray-900 font-semibold">All</span>
      </div>

      <div className="mb-6">
        <span className="inline-flex items-center bg-green-50 text-memora-primary border border-green-200 text-xs font-bold px-2.5 py-1 rounded-full">
          5 remaining
        </span>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
         <div className="flex items-center gap-2">
            <button className="flex items-center gap-2 px-3 py-2 text-[13px] font-bold text-gray-500 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <Download size={14} className="text-gray-400" />
              Download
            </button>
            <button className="flex items-center gap-2 px-3 py-2 text-[13px] font-bold text-gray-500 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <Download size={14} className="rotate-180 text-gray-400" />
              Move to Folder
            </button>
            <button className="flex items-center gap-2 px-3 py-2 text-[13px] font-bold text-red-500 border border-red-100 bg-red-50 rounded-lg hover:bg-red-100 transition-colors">
              <Trash2 size={14} />
              Delete
            </button>
         </div>
         
         <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative">
              <select className="appearance-none pl-3 pr-8 py-2 text-[13px] font-bold text-gray-700 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:border-memora-primary min-w-[120px]">
                 <option>All Folders</option>
              </select>
            </div>
            <button className="px-3 py-2 text-[13px] font-bold text-gray-700 bg-white border border-gray-200 rounded-lg shadow-sm hover:bg-gray-50 flex items-center gap-1.5 transition-colors">
              <span className="text-lg leading-none">+</span> New Folder
            </button>
            <div className="relative flex-1 md:w-[240px]">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input type="text" placeholder="Search artifacts..." className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-[13px] font-medium placeholder-gray-400 focus:outline-none focus:border-memora-primary focus:bg-white transition-colors" />
            </div>
            <button className="flex items-center gap-1.5 px-3 py-2 text-[13px] font-bold text-gray-700 bg-white border border-gray-200 rounded-lg shadow-sm hover:bg-gray-50 transition-colors">
              <Settings2 size={14} className="text-gray-500" /> Filter
            </button>
         </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
         <table className="w-full text-left text-[13px]">
            <thead className="bg-gray-50/50 text-gray-500 font-semibold border-b border-gray-200">
               <tr>
                  <th className="px-4 py-3 w-10 text-center"><input type="checkbox" className="rounded border-gray-300 text-memora-primary focus:ring-memora-primary" /></th>
                  <th className="px-4 py-3">Aa Name</th>
                  <th className="px-4 py-3">Notebook</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3 text-right">Actions</th>
               </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
               {[1,2,3,4,5].map((i) => (
                 <tr key={i} className="hover:bg-gray-50/50 transition-colors group">
                   <td className="px-4 py-4 text-center">
                     <input type="checkbox" className="rounded border-gray-300 text-memora-primary focus:ring-memora-primary" />
                   </td>
                   <td className="px-4 py-4 font-bold text-gray-900 flex items-center gap-2">
                     Sample Artifact Playbook
                     {i % 2 !== 0 && <span className="text-[10px] font-bold px-1.5 py-0.5 border border-red-200 text-red-600 bg-red-50 rounded">NEW</span>}
                   </td>
                   <td className="px-4 py-4 text-gray-500 font-medium">Research Notes</td>
                   <td className="px-4 py-4">
                     <span className="inline-flex items-center text-[11px] font-bold px-2.5 py-1 border border-green-200 text-green-700 bg-green-50 rounded-full">
                       Video Overview
                     </span>
                   </td>
                   <td className="px-4 py-4 text-right flex items-center justify-end gap-3 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">
                     <ExternalLink size={16} className="cursor-pointer hover:text-gray-700" />
                     <Eye size={16} className="cursor-pointer hover:text-gray-700" />
                     <Download size={16} className="cursor-pointer hover:text-gray-700" />
                     <Mic size={16} className="cursor-pointer hover:text-gray-700" />
                   </td>
                 </tr>
               ))}
            </tbody>
         </table>
         <div className="px-4 py-3 border-t border-gray-200 bg-gray-50/50 text-xs text-gray-500 font-medium flex justify-between items-center">
           <span>0 of 16 row(s) selected.</span>
           <div className="flex items-center gap-4">
              <span>Rows per page 10 ▾</span>
              <span>Page 1 of 2</span>
              <div className="flex gap-1">
                <button className="p-1 hover:bg-gray-200 rounded">{'<<'}</button>
                <button className="p-1 hover:bg-gray-200 rounded">{'<'}</button>
                <button className="p-1 hover:bg-gray-200 rounded">{'>'}</button>
                <button className="p-1 hover:bg-gray-200 rounded">{'>>'}</button>
              </div>
           </div>
         </div>
      </div>
    </div>
  );
}
