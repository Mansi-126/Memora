"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Book, FileText, Layers, Download, Settings } from "lucide-react";

export default function BottomTabBar() {
  const pathname = usePathname();
  
  const tabs = [
    { name: "Notebooks", href: "/dashboard", icon: Book },
    { name: "Sources", href: "/dashboard/sources", icon: FileText },
    { name: "Artifacts", href: "/dashboard/artifacts", icon: Layers },
    { name: "Import", href: "/dashboard/import", icon: Download },
    { name: "Manage", href: "/dashboard/manage", icon: Settings },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-memora-border z-50 flex items-center justify-around px-2 pb-safe">
      {tabs.map((tab) => {
        const isActive = pathname === tab.href;
        return (
          <Link 
            key={tab.name} 
            href={tab.href}
            className={`flex flex-col items-center justify-center w-16 h-full transition-colors ${isActive ? 'text-memora-primary' : 'text-gray-400 hover:text-gray-600'}`}
          >
            <tab.icon size={20} className={isActive ? "stroke-2" : "stroke-[1.5]"} />
            <span className={`text-[10px] font-bold mt-1 ${isActive ? "text-memora-primary" : "hidden"}`}>{tab.name}</span>
          </Link>
        );
      })}
    </div>
  );
}
