"use client";

import { useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminTopbar from "@/components/admin/AdminTopbar";
import type { ProfileRow } from "@/lib/types";

interface AdminShellProps {
  profile: ProfileRow;
  newMessagesCount: number;
  children: ReactNode;
}

/** שלד ממשק הניהול: סיידבר קבוע מימין (RTL), טופבר, ותוכן מרכזי */
export default function AdminShell({ profile, newMessagesCount, children }: AdminShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-dvh bg-[#F8FAFF]">
      {/* סיידבר דסקטופ */}
      <div className="sticky top-0 hidden h-dvh shrink-0 lg:block">
        <AdminSidebar role={profile.role} newMessagesCount={newMessagesCount} />
      </div>

      {/* סיידבר מובייל */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-slate-900/40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <motion.div
              initial={{ x: 80 }}
              animate={{ x: 0 }}
              exit={{ x: 80 }}
              transition={{ type: "tween", duration: 0.2 }}
              className="absolute right-0 top-0 h-full"
              onClick={(e) => e.stopPropagation()}
            >
              <AdminSidebar
                role={profile.role}
                newMessagesCount={newMessagesCount}
                onNavigate={() => setSidebarOpen(false)}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* אזור תוכן */}
      <div className="flex min-w-0 flex-1 flex-col">
        <AdminTopbar profile={profile} onToggleSidebar={() => setSidebarOpen((v) => !v)} />
        <main className="flex-1 px-4 py-7 md:px-8">{children}</main>
      </div>
    </div>
  );
}
