import { Link, useLocation } from "react-router";
import useAuthUser from "../hooks/useAuthUser";
import useLogout from "../hooks/useLogout";
import { BellIcon, HomeIcon, ShipWheelIcon, UsersIcon, XIcon, LogOutIcon, PaletteIcon } from "lucide-react";
import ThemeSelector from "./ThemeSelector";
import { useState } from "react";

const Sidebar = ({ onClose }) => {
  const { authUser } = useAuthUser();
  const { logoutMutation } = useLogout();
  const location = useLocation();
  const currentPath = location.pathname;
  const [showThemeSelector, setShowThemeSelector] = useState(false);

  const handleLinkClick = () => {
    // Close mobile sidebar when link is clicked
    if (onClose) onClose();
  };

  return (
    <aside className="w-64 sm:w-72 lg:w-64 bg-base-200/95 backdrop-blur-md border-r border-base-300/50 flex flex-col h-screen lg:sticky lg:top-0 shadow-xl lg:shadow-lg animate-slide-in-left max-h-screen overflow-hidden">
      {/* Header */}
      <div className="p-4 sm:p-5 border-b border-base-300/50 flex items-center justify-between animate-fade-in">
        <Link to="/" className="flex items-center gap-2.5 hover-lift" onClick={handleLinkClick}>
          <ShipWheelIcon className="size-8 sm:size-9 text-primary animate-pulse-gentle" />
          <span className="text-2xl sm:text-3xl font-bold font-mono bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary tracking-wider animate-slide-in-left">
            Lexify
          </span>
        </Link>
        
        {/* Mobile Close Button */}
        {onClose && (
          <button 
            onClick={onClose}
            className="btn btn-ghost btn-circle btn-sm lg:hidden hover-lift animate-scale-in"
          >
            <XIcon className="h-5 w-5 transition-transform hover:rotate-90" />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 sm:p-4 space-y-2 overflow-y-auto">
        <Link
          to="/"
          onClick={handleLinkClick}
          className={`btn btn-ghost justify-start w-full gap-3 px-3 py-2 sm:py-3 normal-case text-sm sm:text-base hover-lift animate-fade-in ${
            currentPath === "/" 
              ? "btn-active bg-gradient-to-r from-primary/20 to-secondary/20 text-primary shadow-md" 
              : "hover:bg-base-300 hover:shadow-md"
          }`}
          style={{ animationDelay: '0.1s' }}
        >
          <HomeIcon className={`size-4 sm:size-5 transition-colors ${
            currentPath === "/" ? "text-primary" : "text-base-content opacity-70"
          }`} />
          <span>Home</span>
        </Link>

        <Link
          to="/friends"
          onClick={handleLinkClick}
          className={`btn btn-ghost justify-start w-full gap-3 px-3 py-2 sm:py-3 normal-case text-sm sm:text-base ${
            currentPath === "/friends" ? "btn-active bg-primary/10 text-primary" : "hover:bg-base-300"
          }`}
        >
          <UsersIcon className="size-4 sm:size-5 text-base-content opacity-70" />
          <span>Friends</span>
        </Link>

        <Link
          to="/notifications"
          onClick={handleLinkClick}
          className={`btn btn-ghost justify-start w-full gap-3 px-3 py-2 sm:py-3 normal-case text-sm sm:text-base hover-lift animate-fade-in ${
            currentPath === "/notifications" 
              ? "btn-active bg-gradient-to-r from-primary/20 to-secondary/20 text-primary shadow-md" 
              : "hover:bg-base-300 hover:shadow-md"
          }`}
          style={{ animationDelay: '0.3s' }}
        >
          <BellIcon className={`size-4 sm:size-5 transition-colors ${
            currentPath === "/notifications" ? "text-primary" : "text-base-content opacity-70"
          }`} />
          <span>Notifications</span>
        </Link>

        {/* Divider */}
        <div className="divider my-2"></div>

        {/* Theme Selector Button */}
        <button
          onClick={() => setShowThemeSelector(!showThemeSelector)}
          className="btn btn-ghost justify-start w-full gap-3 px-3 py-2 sm:py-3 normal-case text-sm sm:text-base hover-lift hover:bg-base-300 animate-fade-in"
          style={{ animationDelay: '0.4s' }}
        >
          <PaletteIcon className="size-4 sm:size-5 text-base-content opacity-70" />
          <span>Change Theme</span>
        </button>

        {/* Logout Button */}
        <button
          onClick={() => {
            logoutMutation();
            if (onClose) onClose();
          }}
          className="btn btn-ghost justify-start w-full gap-3 px-3 py-2 sm:py-3 normal-case text-sm sm:text-base hover-lift hover:bg-error/10 text-error animate-fade-in"
          style={{ animationDelay: '0.5s' }}
        >
          <LogOutIcon className="size-4 sm:size-5" />
          <span>Logout</span>
        </button>
      </nav>

      {/* USER PROFILE SECTION */}
      <div className="p-3 sm:p-4 border-t border-base-300 mt-auto bg-base-300/50">
        <div className="flex items-center gap-3">
          <div className="avatar">
            <div className="w-10 sm:w-12 h-10 sm:h-12 rounded-full ring-2 ring-primary/20">
              <img 
                src={authUser?.profilePic} 
                alt="User Avatar"
                className="w-full h-full object-cover rounded-full"
              />
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm sm:text-base truncate">
              {authUser?.fullName}
            </p>
            <p className="text-xs text-success flex items-center gap-1.5 mt-0.5">
              <span className="size-2 rounded-full bg-success inline-block animate-pulse" />
              Online
            </p>
            {authUser?.username && (
              <p className="text-xs text-base-content/60 truncate">
                @{authUser.username}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Theme Selector Modal */}
      {showThemeSelector && (
        <div className="fixed inset-0 bg-black/85 z-[200] flex items-center justify-center p-4" onClick={() => setShowThemeSelector(false)}>
          <div className="bg-base-100 rounded-2xl p-6 w-full max-w-md shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <ThemeSelector onThemeChange={() => setShowThemeSelector(false)} />
          </div>
        </div>
      )}
    </aside>
  );
};
export default Sidebar;