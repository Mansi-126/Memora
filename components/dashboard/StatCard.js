export default function StatCard({ icon: Icon, count, label, bottomText, buttonText, isOrangeBadge }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 hover:border-memora-primary/50 hover:shadow-sm transition-all flex flex-col relative overflow-hidden group">
      
      <div className="flex items-center gap-3 mb-4">
         <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-memora-dark shrink-0 border border-gray-100 group-hover:bg-memora-light group-hover:border-memora-primary/20 transition-colors">
           <Icon size={16} />
         </div>
      </div>
      
      <div className="font-heading font-bold text-3xl text-gray-900 leading-none mb-1">
        {count}
      </div>
      <div className="text-gray-500 font-medium text-[13px] mb-4">
        {label}
      </div>
      
      {bottomText && (
        <div className="text-xs text-gray-400 mt-auto font-medium">
          {bottomText}
        </div>
      )}
      {buttonText && (
        <button className="text-left text-xs font-bold text-memora-primary hover:text-memora-dark mt-auto transition-colors flex items-center gap-1 group-hover:translate-x-1 duration-300">
           {buttonText} {isOrangeBadge && <span className="bg-orange-100 text-orange-600 px-1.5 py-0.5 rounded ml-1">due</span>}
        </button>
      )}
    </div>
  );
}
