'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  FolderOpen, 
  LogOut, 
  ChevronLeft, 
  ChevronRight,
  LayoutDashboard
} from "lucide-react";
import { Tooltip } from "@nextui-org/react";
import { useState } from "react";

const navItems = [
  { href: "/panel/realizations", label: "Realizacje", icon: LayoutDashboard },
  { href: "/panel/files", label: "Pliki", icon: FolderOpen },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside 
      className={`
        fixed left-0 top-0 h-screen bg-gradient-to-b from-slate-900 to-slate-800
        transition-all duration-300 z-50 flex flex-col
        ${collapsed ? "w-16" : "w-64"}
      `}
    >
      <div className="p-4 border-b border-slate-700/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary-500 flex items-center justify-center">
            <h1 className="font-bold text-white text-5xl truncate">C</h1>
          </div>
          {!collapsed && (
            <div className="overflow-hidden">
              <h1 className="font-bold text-white text-lg truncate">Carmitsu</h1>
              <p className="text-xs text-slate-400">Panel Admina</p>
            </div>
          )}
        </div>
      </div>

      <nav className="flex-1 py-4 px-2 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          const Icon = item.icon;
          
          return (
            <Tooltip 
              key={item.href} 
              content={item.label} 
              placement="right" 
              isDisabled={!collapsed}
            >
              <Link
                href={item.href}
                className={`
                  flex items-center gap-3 px-3 py-2.5 rounded-xl
                  transition-all duration-200 group
                  ${isActive 
                    ? "bg-primary-500/20 text-primary-400" 
                    : "text-slate-400 hover:text-white hover:bg-slate-700/50"
                  }
                `}
              >
                <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? "text-primary-400" : ""}`} />
                {!collapsed && (
                  <span className="font-medium truncate">{item.label}</span>
                )}
                {isActive && !collapsed && (
                  <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary-400" />
                )}
              </Link>
            </Tooltip>
          );
        })}
      </nav>

      <div className="p-2 border-t border-slate-700/50 space-y-1">
        <Tooltip content="Strona główna" placement="right" isDisabled={!collapsed}>
          <button
            onClick={() => {
              sessionStorage.removeItem('panel_token');
              window.location.href = '/';
            }}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl
              text-slate-400 hover:text-white hover:bg-slate-700/50
              transition-all duration-200"
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            {!collapsed && <span className="font-medium">Wyjdź</span>}
          </button>
        </Tooltip>
        
        <Tooltip content={collapsed ? "Rozwiń" : "Zwiń"} placement="right">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl
              text-slate-400 hover:text-white hover:bg-slate-700/50
              transition-all duration-200"
          >
            {collapsed ? (
              <ChevronRight className="w-5 h-5" />
            ) : (
              <>
                <ChevronLeft className="w-5 h-5" />
                <span className="font-medium">Zwiń</span>
              </>
            )}
          </button>
        </Tooltip>
      </div>
    </aside>
  );
}
