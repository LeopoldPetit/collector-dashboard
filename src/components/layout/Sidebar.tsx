import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Activity,
  FolderKanban,
  GitBranch,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
  Zap,
  ShieldCheck,
} from "lucide-react";
import { clsx } from "clsx";

interface NavItem {
  label: string;
  path: string;
  icon: React.ReactNode;
}

const navItems: NavItem[] = [
  { label: "Dashboard", path: "/", icon: <LayoutDashboard size={20} /> },
  { label: "Technical", path: "/technical", icon: <Activity size={20} /> },
  { label: "Projects", path: "/projects", icon: <FolderKanban size={20} /> },
  { label: "DevOps", path: "/devops", icon: <GitBranch size={20} /> },
  { label: "Business", path: "/business", icon: <BarChart3 size={20} /> },
  { label: "Collector", path: "/collector", icon: <ShieldCheck size={20} /> },
];

const bottomItems: NavItem[] = [
  { label: "Settings", path: "/settings", icon: <Settings size={20} /> },
];

export const Sidebar: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={clsx(
        "flex flex-col h-screen bg-gray-900 text-white transition-all duration-300 ease-in-out shrink-0",
        collapsed ? "w-16" : "w-60",
      )}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 h-16 border-b border-gray-700/50">
        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-violet-600 shrink-0">
          <Zap size={16} className="text-white" />
        </div>
        {!collapsed && (
          <span className="font-semibold text-sm tracking-wide truncate">
            Collector.shop
          </span>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === "/"}
            className={({ isActive }) =>
              clsx(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors duration-150 group",
                isActive
                  ? "bg-violet-600 text-white"
                  : "text-gray-400 hover:bg-gray-800 hover:text-white",
              )
            }
          >
            <span className="shrink-0">{item.icon}</span>
            {!collapsed && <span className="truncate">{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Bottom */}
      <div className="py-4 px-2 border-t border-gray-700/50 space-y-1">
        {bottomItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              clsx(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors duration-150",
                isActive
                  ? "bg-violet-600 text-white"
                  : "text-gray-400 hover:bg-gray-800 hover:text-white",
              )
            }
          >
            <span className="shrink-0">{item.icon}</span>
            {!collapsed && <span className="truncate">{item.label}</span>}
          </NavLink>
        ))}

        {/* Collapse toggle */}
        <button
          type="button"
          onClick={() => setCollapsed((c) => !c)}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-gray-400 hover:bg-gray-800 hover:text-white transition-colors duration-150"
        >
          <span className="shrink-0">
            {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
          </span>
          {!collapsed && <span>Collapse</span>}
        </button>
      </div>
    </aside>
  );
};
