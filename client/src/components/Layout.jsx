import React from "react";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

export default function Layout({ children }) {
  return (
    <div className="min-h-screen">
      <div className="py-6 px-4 app-container">
        <div className="flex gap-6">
          <aside className="app-sidebar">
            <Sidebar />
          </aside>

          <div className="flex-1">
            <div className="mb-4">
              <Topbar />
            </div>

            <main>{children}</main>
          </div>
        </div>
      </div>
    </div>
  );
}
