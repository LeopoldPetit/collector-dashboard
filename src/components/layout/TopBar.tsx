import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import { Bell, Search, ChevronDown, User } from "lucide-react";
import { useNotifications } from "@/hooks/useNotifications";

const severityDot: Record<string, string> = {
  ok: "bg-emerald-500",
  critical: "bg-red-500",
  info: "bg-violet-500",
  warning: "bg-amber-500",
};

const routeTitles: Record<string, string> = {
  "/": "Dashboard",
  "/technical": "Technical Overview",
  "/projects": "Projects",
  "/devops": "DevOps",
  "/business": "Business",
  "/settings": "Settings",
};

export const TopBar: React.FC = () => {
  const { pathname } = useLocation();
  const title = routeTitles[pathname] ?? "StreamFlow";
  const [notifOpen, setNotifOpen] = useState(false);
  const { data: notifData } = useNotifications();

  const notifications = notifData?.notifications ?? [];
  const unreadCount = notifData?.unreadCount ?? 0;

  return (
    <header className="flex items-center justify-between h-16 px-6 bg-white border-b border-gray-100 shrink-0">
      {/* Left: page title */}
      <div>
        <h1 className="text-lg font-semibold text-gray-900">{title}</h1>
        <p className="text-xs text-gray-400">
          {new Date().toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </p>
      </div>

      {/* Right: search + actions */}
      <div className="flex items-center gap-3">
        {/* Search */}
        <div className="hidden md:flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-50 border border-gray-200 text-sm text-gray-400 w-52 hover:border-violet-400 focus-within:border-violet-500 focus-within:ring-2 focus-within:ring-violet-100 transition-all">
          <Search size={15} />
          <input
            type="text"
            placeholder="Search..."
            className="bg-transparent outline-none w-full text-gray-700 placeholder-gray-400 text-sm"
          />
        </div>

        {/* Notifications */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setNotifOpen((v) => !v)}
            className="relative flex items-center justify-center w-9 h-9 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
          >
            <Bell size={18} />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500" />
            )}
          </button>

          {notifOpen && (
            <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-lg border border-gray-100 z-50">
              <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                <p className="font-semibold text-sm text-gray-800">
                  Notifications
                </p>
                {unreadCount > 0 && (
                  <span className="text-xs font-medium text-white bg-red-500 rounded-full px-1.5 py-0.5">
                    {unreadCount}
                  </span>
                )}
              </div>
              <ul className="divide-y divide-gray-50">
                {notifications.map((n) => (
                  <li
                    key={n.id}
                    className="flex items-start gap-3 px-4 py-3 hover:bg-gray-50 cursor-pointer"
                  >
                    <span
                      className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${
                        severityDot[n.severity] ?? "bg-gray-400"
                      }`}
                    />
                    <div>
                      <p className="text-sm text-gray-700">{n.text}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{n.time}</p>
                    </div>
                  </li>
                ))}
              </ul>
              <div className="px-4 py-2.5 text-center">
                <button
                  type="button"
                  className="text-xs text-violet-600 hover:underline font-medium"
                >
                  View all notifications
                </button>
              </div>
            </div>
          )}
        </div>

        {/* User avatar */}
        <button
          type="button"
          className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-violet-100 text-violet-700">
            <User size={16} />
          </div>
          <div className="hidden md:block text-left">
            <p className="text-sm font-medium text-gray-800 leading-none">
              Admin
            </p>
            <p className="text-xs text-gray-400 mt-0.5">StreamFlow</p>
          </div>
          <ChevronDown size={14} className="text-gray-400 hidden md:block" />
        </button>
      </div>
    </header>
  );
};
