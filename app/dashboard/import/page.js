"use client";

import { DownloadCloud, CloudLightning, FileText, Download } from "lucide-react";

export default function BulkImportPage() {
  return (
    <div className="max-w-[800px]">
      <div className="text-[13px] text-gray-500 mb-1 flex items-center gap-2">
        <span>Notebooks</span>
        <span className="text-gray-300">/</span>
        <span className="text-gray-900 font-medium">Bulk Import</span>
      </div>
      <h1 className="text-[36px] font-bold text-gray-900 tracking-tight mb-8">Bulk Import</h1>
      
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
        
        <div className="p-8 border-b border-gray-100">
           <div className="flex items-center gap-3 mb-2">
              <DownloadCloud size={24} className="text-memora-primary" />
              <h2 className="text-2xl font-bold text-gray-900">Bulk Import</h2>
           </div>
           <p className="text-[15px] font-medium text-gray-500">Import multiple sources at once from links, browser tabs, or RSS feeds</p>
        </div>

        <div className="p-8 pb-5">
           <div className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-3">Target Notebook</div>
           <div className="flex items-center gap-3 w-full">
              <button className="flex-1 flex items-center justify-between p-3.5 border border-gray-200 rounded-xl bg-white hover:border-gray-300 transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-memora-primary/20">
                 <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded bg-green-50 text-memora-dark flex items-center justify-center">
                      <FileText size={14} />
                    </div>
                    <div className="text-left leading-tight">
                       <span className="block font-bold text-gray-900 text-[15px]">Select a notebook...</span>
                       <span className="block text-xs font-medium text-gray-400">11/11 notebooks</span>
                    </div>
                 </div>
                 <span className="text-gray-400 text-xs">▼</span>
              </button>
              <button className="px-4 py-[18px] border border-gray-200 rounded-xl text-[14px] font-bold text-memora-dark bg-white hover:bg-memora-light hover:border-memora-border transition-colors shadow-sm flex items-center justify-center gap-1 shrink-0">
                + New
              </button>
           </div>
        </div>

        <div className="p-8 pt-4">
           <div className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-4">Import Method</div>
           <div className="flex border-b border-gray-200 overflow-x-auto custom-scrollbar">
              <button className="px-5 py-3 border-b-2 border-memora-primary text-gray-900 font-bold text-[14px]">Links</button>
              <button className="px-5 py-3 border-b-2 border-transparent text-gray-500 font-bold text-[14px] hover:text-gray-900">Browser Tabs</button>
              <button className="px-5 py-3 border-b-2 border-transparent text-gray-500 font-bold text-[14px] hover:text-gray-900">RSS Feed</button>
              <button className="px-5 py-3 border-b-2 border-transparent text-gray-500 font-bold text-[14px] hover:text-gray-900">CSV Upload</button>
              <button className="px-5 py-3 border-b-2 border-transparent text-gray-500 font-bold text-[14px] hover:text-gray-900">Web Crawler</button>
           </div>
           
           <div className="mt-6">
              <div className="bg-memora-light border-l-[3px] border-memora-primary p-4 rounded-r-xl mb-4 text-[14px] font-medium text-gray-700">
                Paste one URL per line. We'll automatically validate and import all valid HTTP/HTTPS links from your list.
              </div>
              <textarea 
                className="w-full h-[240px] border border-gray-200 rounded-xl p-4 font-mono text-[13px] text-gray-500 bg-gray-50 focus:bg-white focus:outline-none focus:border-memora-primary focus:ring-2 focus:ring-memora-primary/20 transition-colors shadow-inner resize-none"
                placeholder="https://example.com/article1&#10;https://example.com/article2&#10;https://example.com/article3"
              />
           </div>

           <div className="mt-6 flex justify-end gap-3">
              <button className="px-6 py-2.5 rounded-lg font-bold text-sm text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors">
                Cancel
              </button>
              <button className="px-6 py-2.5 rounded-lg font-bold text-sm text-white bg-memora-dark hover:bg-memora-primary shadow-sm transition-colors">
                Import Sources
              </button>
           </div>
        </div>
      </div>
    </div>
  );
}
