import { Link2, Copy, Bookmark, FileUp, ArrowRight } from "lucide-react";

export default function QuickImportWidget() {
  return (
    <div className="bg-white rounded-xl border border-memora-border p-5 shadow-sm">
      <h3 className="text-[16px] font-bold text-memora-text flex items-center gap-2 mb-1">
         📥 Quick Import
      </h3>
      <p className="text-xs font-medium text-gray-400 mb-5">Add content in seconds</p>

      <div className="space-y-2 mb-5">
        <button className="w-full flex items-center justify-between bg-white border border-memora-primary/30 hover:border-memora-primary hover:bg-memora-light px-4 py-2.5 rounded-lg text-sm font-bold text-memora-dark transition-all group">
           <span className="flex items-center gap-2.5"><Link2 size={16} /> Paste Share URL</span>
           <ArrowRight size={14} className="text-gray-300 group-hover:text-memora-primary group-hover:translate-x-1 transition-all" />
        </button>
        <button className="w-full flex items-center justify-between bg-white border border-memora-primary/30 hover:border-memora-primary hover:bg-memora-light px-4 py-2.5 rounded-lg text-sm font-bold text-memora-dark transition-all group">
           <span className="flex items-center gap-2.5"><Copy size={16} /> Copy & Paste Text</span>
           <ArrowRight size={14} className="text-gray-300 group-hover:text-memora-primary group-hover:translate-x-1 transition-all" />
        </button>
        <button className="w-full flex items-center justify-between bg-white border border-memora-primary/30 hover:border-memora-primary hover:bg-memora-light px-4 py-2.5 rounded-lg text-sm font-bold text-memora-dark transition-all group">
           <span className="flex items-center gap-2.5"><Bookmark size={16} /> Use Bookmark</span>
           <ArrowRight size={14} className="text-gray-300 group-hover:text-memora-primary group-hover:translate-x-1 transition-all" />
        </button>
      </div>

      <div className="flex items-center gap-3 mb-5">
        <div className="h-px bg-gray-100 flex-1"></div>
        <div className="text-[10px] font-bold text-gray-300 uppercase tracking-wider">or drop file</div>
        <div className="h-px bg-gray-100 flex-1"></div>
      </div>

      <button className="w-full h-[80px] rounded-xl border-2 border-dashed border-memora-border bg-gray-50 flex items-center justify-center gap-2 text-gray-400 hover:text-memora-dark hover:border-memora-primary hover:bg-memora-light transition-colors text-sm font-bold cursor-pointer">
        <FileUp size={18} />
        Drop PDF / TXT / DOCX
      </button>
    </div>
  );
}
