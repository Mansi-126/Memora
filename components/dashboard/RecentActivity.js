import { CheckCircle2, Bookmark, MessageSquare, Layers, Search, Share } from "lucide-react";

export default function RecentActivity() {
  const activities = [
    { icon: <CheckCircle2 size={14} />, color: "bg-green-100 text-green-600", title: "PDF imported", target: "Research Notes", time: "2m ago" },
    { icon: <Bookmark size={14} />, color: "bg-orange-100 text-orange-600", title: "Bookmarked", target: "Web Articles", time: "1h ago" },
    { icon: <MessageSquare size={14} />, color: "bg-blue-100 text-blue-600", title: "Chat saved", target: "AI Experiments", time: "3h ago" },
    { icon: <Layers size={14} />, color: "bg-purple-100 text-purple-600", title: "10 cards gen", target: "Work Projects", time: "5h ago" },
    { icon: <Search size={14} />, color: "bg-memora-light text-memora-primary", title: "Cross search", target: "All notebooks", time: "Yesterday" },
    { icon: <Share size={14} />, color: "bg-gray-100 text-gray-600", title: "Exported", target: "Research Notes", time: "2 days ago" },
  ];

  return (
    <div className="bg-white rounded-xl border border-memora-border p-6 shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-[18px] font-bold text-memora-text flex items-center gap-2">⚡ Recent Activity</h3>
        <button className="text-xs font-bold text-memora-primary hover:underline">View all &rarr;</button>
      </div>

      <div className="space-y-4">
        {activities.map((act, i) => (
          <div key={i} className="flex items-center justify-between pb-4 border-b border-memora-bg last:border-0 last:pb-0">
             <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${act.color}`}>
                   {act.icon}
                </div>
                <div>
                   <span className="text-sm font-bold text-gray-700">{act.title}</span>
                   <span className="text-sm text-gray-400 mx-1.5">&rarr;</span>
                   <span className="text-sm font-medium text-gray-500">{act.target}</span>
                </div>
             </div>
             <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wide shrink-0 ml-4">
                {act.time}
             </div>
          </div>
        ))}
      </div>
    </div>
  );
}
