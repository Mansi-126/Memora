"use client";

import { Plus, Search, Settings2, MoreHorizontal, Book } from "lucide-react";

export default function DashboardHome() {
  const notebooks = [
    { title: "Cook or Be Cooked: Removing the Human Business Bottleneck", sources: 1, type: "Standard" },
    { title: "Iris Analysis: Unlocking Human Potential", sources: 1, type: "Standard" },
    { title: "Scaling a $6M AI Children's Book Empire", sources: 1, type: "Standard" },
    { title: "Scaling Digital Products: From Startup to $141 Million", sources: 1, type: "Standard" },
    { title: "Starter Story: Profitable Micro-SaaS", sources: 9, type: "Standard" },
    { title: "The Chatbase Blueprint", sources: 5, type: "Standard" },
    { title: "The Creator Playbook for Viral App", sources: 2, type: "Research" },
    { title: "The New App Economy", sources: 2, type: "Standard" },
    { title: "Untitled", sources: 0, type: "Draft" },
  ];

  return (
    <div className="max-w-[1240px]">
      <div className="text-[13px] text-gray-500 mb-1 flex items-center gap-2">
        <span>Views</span>
        <span className="text-gray-300">/</span>
        <span className="text-gray-900 font-medium">Notebooks</span>
      </div>
      <h1 className="text-[36px] font-bold text-gray-900 tracking-tight mb-8">All Notebooks</h1>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
         <div className="flex items-center gap-2">
            <button className="bg-gray-900 hover:bg-black text-white px-4 py-2 rounded-lg text-[13px] font-bold shadow-sm transition-all focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 flex items-center gap-1.5">
              <span className="text-lg leading-none">+</span> New Notebook
            </button>
            <button className="flex items-center gap-2 px-3 py-2 text-[13px] font-bold text-gray-700 bg-white border border-gray-200 rounded-lg shadow-sm hover:bg-gray-50 transition-colors">
              <Book size={14} className="text-gray-500" /> Templates
            </button>
         </div>
         
         <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative">
              <select className="appearance-none pl-3 pr-8 py-2 text-[13px] font-bold text-gray-700 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:border-memora-primary min-w-[120px]">
                 <option>All Types</option>
                 <option>Standard</option>
                 <option>Research</option>
              </select>
            </div>
            <div className="relative flex-1 md:w-[240px]">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input type="text" placeholder="Search notebooks..." className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-[13px] font-medium placeholder-gray-400 focus:outline-none focus:border-memora-primary focus:bg-white transition-colors" />
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
                  <th className="px-4 py-3">Notebook Name</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3 text-right">Sources</th>
                  <th className="px-4 py-3 w-12 text-center"></th>
               </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
               {notebooks.map((nb, i) => (
                 <tr key={i} className="hover:bg-gray-50/50 transition-colors group cursor-pointer">
                   <td className="px-4 py-4 text-center">
                     <input type="checkbox" className="rounded border-gray-300 text-memora-primary focus:ring-memora-primary" />
                   </td>
                   <td className="px-4 py-4 font-bold text-gray-900">{nb.title}</td>
                   <td className="px-4 py-4">
                     <span className="inline-flex items-center text-[11px] font-bold px-2 py-0.5 border border-gray-200 text-gray-600 bg-white rounded-md">
                       {nb.type}
                     </span>
                   </td>
                   <td className="px-4 py-4 text-gray-500 font-medium text-right">{nb.sources} source{nb.sources !== 1 ? 's' : ''}</td>
                   <td className="px-4 py-4 text-center text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">
                     <button className="p-1 hover:bg-gray-100 rounded text-gray-500"><MoreHorizontal size={16} /></button>
                   </td>
                 </tr>
               ))}
            </tbody>
         </table>
         <div className="px-4 py-3 border-t border-gray-200 bg-gray-50/50 text-xs text-gray-500 font-medium flex justify-between items-center">
           <span>0 of {notebooks.length} row(s) selected.</span>
           <div className="flex items-center gap-4">
              <span>Rows per page 10 ▾</span>
              <span>Page 1 of 1</span>
              <div className="flex gap-1">
                <button className="p-1 hover:bg-gray-200 rounded text-gray-400 cursor-not-allowed">{'<<'}</button>
                <button className="p-1 hover:bg-gray-200 rounded text-gray-400 cursor-not-allowed">{'<'}</button>
                <button className="p-1 hover:bg-gray-200 rounded text-gray-400 cursor-not-allowed">{'>'}</button>
                <button className="p-1 hover:bg-gray-200 rounded text-gray-400 cursor-not-allowed">{'>>'}</button>
              </div>
           </div>
         </div>
      </div>
    </div>
  );
}
