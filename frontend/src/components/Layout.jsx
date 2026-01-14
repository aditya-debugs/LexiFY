import { useState } from "react";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";

const Layout = ({ children, showSidebar = false }) => {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-base-100">
      <div className="flex h-screen">
        {/* Desktop Sidebar - Hidden on mobile */}
        {showSidebar && (
          <div className="hidden lg:block">
            <Sidebar />
          </div>
        )}

        {/* Mobile Sidebar Overlay */}
        {showSidebar && isMobileSidebarOpen && (
          <>
            {/* Backdrop */}
            <div 
              className="fixed inset-0 bg-black/75 z-[60] lg:hidden"
              onClick={() => setIsMobileSidebarOpen(false)}
            />
            {/* Mobile Sidebar */}
            <div className="fixed inset-y-0 left-0 z-[70] lg:hidden">
              <Sidebar onClose={() => setIsMobileSidebarOpen(false)} />
            </div>
          </>
        )}

        {/* Main Content */}
        <div className="flex-1 flex flex-col min-w-0">
          <Navbar 
            showSidebar={showSidebar}
            onToggleSidebar={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
          />

          <main className="flex-1 overflow-y-auto p-2 sm:p-4 lg:p-6">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
};
export default Layout;