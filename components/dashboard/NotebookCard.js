import { MoreHorizontal, FileText, Layers, Users, ArrowRight, Plus } from "lucide-react";

export default function NotebookCard({ title, icon, tags, sources, cards, members, health, updated, isNew }) {
  if (isNew) {
    return (
      <button className="h-[240px] w-full bg-white rounded-xl border-2 border-dashed border-memora-border p-6 flex flex-col items-center justify-center gap-4 hover:bg-memora-light transition-colors group cursor-pointer shadow-sm">
         <div className="w-14 h-14 rounded-full bg-memora-light border border-memora-primary/30 flex items-center justify-center text-memora-primary group-hover:scale-110 transition-transform">
           <Plus size={28} className="stroke-[3]" />
         </div>
         <div className="text-center">
            <h4 className="font-bold text-lg text-memora-text mb-1">New Notebook</h4>
            <p className="text-sm font-medium text-gray-400">Start fresh or import content</p>
         </div>
      </button>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-memora-border p-5 shadow-[0_2px_12px_rgba(34,197,94,0.04)] hover:shadow-lg hover:border-memora-primary hover:-translate-y-1 transition-all duration-300 flex flex-col h-[240px]">
      
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          <span className="text-2xl drop-shadow-sm">{icon}</span>
          <h4 className="font-bold text-[16px] text-memora-text truncate max-w-[140px]">{title}</h4>
        </div>
        <button className="text-gray-300 hover:text-gray-600 p-1">
          <MoreHorizontal size={20} />
        </button>
      </div>

      {/* Tags */}
      <div className="flex flex-wrap gap-2 mb-4">
        {tags.map((tag, i) => (
           <span key={i} className="bg-memora-light text-memora-dark px-2 py-0.5 rounded text-[11px] font-bold tracking-wide">
             #{tag}
           </span>
        ))}
      </div>

      {/* Stats */}
      <div className="flex items-center gap-3 text-xs text-gray-500 font-medium mb-6">
         <span className="flex items-center gap-1"><FileText size={12} /> {sources}</span> &middot; 
         <span className="flex items-center gap-1"><Layers size={12} /> {cards}</span> &middot; 
         <span className="flex items-center gap-1"><Users size={12} /> {members}</span>
      </div>

      <div className="mt-auto">
         {/* Progress Bar */}
         <div className="mb-4">
           <div className="flex justify-between text-[11px] font-bold tracking-wide text-gray-400 uppercase mb-1.5">
             <span>Knowledge Health</span>
             <span className="text-memora-primary">{health}%</span>
           </div>
           <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
             <div className="h-full bg-memora-primary rounded-full" style={{ width: `${health}%` }}></div>
           </div>
         </div>

         {/* Footer */}
         <div className="flex justify-between items-center pt-2">
            <span className="text-[11px] font-medium text-gray-400">Updated {updated}</span>
            <button className="border border-memora-border hover:border-memora-primary hover:bg-memora-light text-memora-dark text-xs font-bold px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1">
              Open <ArrowRight size={12} />
            </button>
         </div>
      </div>
    </div>
  );
}
