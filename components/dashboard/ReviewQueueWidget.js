import { Play } from "lucide-react";

export default function ReviewQueueWidget() {
  const cards = [
    { category: "React", question: "What is useEffect...?", diff: "bg-green-500" },
    { category: "ML", question: "Define Supervised L...", diff: "bg-yellow-500" },
    { category: "Design", question: "Gestalt principles a...", diff: "bg-red-500" },
  ];

  return (
    <div className="bg-white rounded-xl border border-memora-border p-5 shadow-sm flex flex-col h-full">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
           <h3 className="text-[16px] font-bold text-memora-text">🃏 Review Queue</h3>
           <span className="bg-orange-100 text-orange-600 text-xs font-bold px-2 py-0.5 rounded shadow-sm">5 due</span>
        </div>
        <span className="text-[11px] font-bold text-orange-500 bg-orange-50 px-2 py-1 rounded-md border border-orange-100">🔥 12 day streak</span>
      </div>

      <div className="space-y-1 mb-6">
         {cards.map((c, i) => (
           <div key={i} className="flex items-center justify-between p-2 rounded-lg hover:bg-memora-bg transition-colors cursor-pointer border border-transparent hover:border-memora-border">
              <div className="flex items-center gap-3">
                 <span className="text-[10px] uppercase font-bold text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded w-14 text-center">{c.category}</span>
                 <span className="text-sm font-semibold text-gray-600 truncate max-w-[120px]">{c.question}</span>
              </div>
              <span className={`w-2 h-2 rounded-full ${c.diff}`}></span>
           </div>
         ))}
      </div>

      <div className="mt-auto pt-4 border-t border-gray-100 border-dashed">
         <button className="w-full bg-memora-primary hover:bg-memora-dark text-white text-sm font-bold py-3 rounded-xl transition-all shadow-[0_4px_12px_rgba(34,197,94,0.3)] hover:shadow-lg hover:-translate-y-[1px] flex items-center justify-center gap-2">
            <Play size={16} className="fill-white" /> Start Review Session
         </button>
         <p className="text-center text-xs font-medium text-gray-400 mt-3">5 cards &middot; ~4 min estimated</p>
      </div>
    </div>
  );
}
