import { Link, useLocation } from "react-router";
import { useState } from "react";
import useAuthUser from "../hooks/useAuthUser";
import { ShipWheelIcon, MenuIcon, SearchIcon, UserIcon } from "lucide-react";
import ProfileEditModal from "./ProfileEditModal";
import SearchUsers from "./SearchUsers";

const Navbar = ({ showSidebar = false, onToggleSidebar }) => {
  const { authUser } = useAuthUser();
  const location = useLocation();
  const isChatPage = location.pathname?.startsWith("/chat");

  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  return (
    <nav className="bg-base-200/80 backdrop-blur-md border-b border-base-300/50 sticky top-0 z-30 h-16 flex items-center animate-slide-in-left">
      <div className="w-full px-3 sm:px-4 lg:px-6">
        <div className="flex items-center justify-between w-full">
          {/* Left Side - Mobile Menu & Logo */}
          <div className="flex items-center gap-3">
            {/* Mobile Menu Button */}
            {showSidebar && (
              <button 
                className="btn btn-ghost btn-circle lg:hidden hover-lift animate-scale-in"
                onClick={onToggleSidebar}
              >
                <MenuIcon className="h-5 w-5 transition-transform group-hover:rotate-90" />
              </button>
            )}

            {/* LOGO - Show on mobile and chat page */}
            {(isChatPage || window.innerWidth < 1024) && (
              <Link to="/" className="flex items-center gap-2 hover-lift animate-fade-in">
                <ShipWheelIcon className="size-6 sm:size-8 lg:size-9 text-primary animate-pulse-gentle" />
                <span className="text-lg sm:text-2xl lg:text-3xl font-bold font-mono bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary tracking-wider animate-slide-in-left">
                  Lexify
                </span>
              </Link>
            )}
          </div>

          {/* Right Side - Search & Profile */}
          <div className="flex items-center gap-2 sm:gap-3 animate-slide-in-right">
            {/* Search Button */}
            <button
              onClick={() => setIsSearchOpen(true)}
              className="btn btn-ghost btn-sm btn-circle hover:bg-primary/10 transition-all group p-0 min-h-[2.5rem] h-10 w-10"
              title="Search users"
              aria-label="Search users"
            >
              <SearchIcon className="h-5 w-5 text-base-content/70 group-hover:text-primary transition-all group-hover:scale-110" />
            </button>

            {/* Profile Avatar with Dropdown */}
            <div className="dropdown dropdown-end">
              <button 
                tabIndex={0}
                className="btn btn-ghost btn-circle btn-sm p-0 hover:scale-105 transition-all min-h-[2.5rem] h-10 w-10"
                aria-label="Profile menu"
              >
                <div className="w-9 h-9 rounded-full ring-2 ring-primary/40 hover:ring-primary/60 transition-all shadow-md hover:shadow-primary/40">
                  <img 
                    src={authUser?.profilePic} 
                    alt="User Avatar" 
                    className="w-full h-full object-cover rounded-full"
                  />
                </div>
              </button>
              
              <div
                tabIndex={0}
                className="dropdown-content mt-3 z-[100] p-5 shadow-2xl bg-base-100 rounded-3xl w-72 border-2 border-base-300/50 animate-scale-in backdrop-blur-sm"
              >
                {/* Profile Info */}
                <div className="flex items-center gap-4 mb-5 pb-5 border-b border-base-300/70">
                  <div className="avatar">
                    <div className="w-14 h-14 rounded-full ring-2 ring-primary/40 ring-offset-2 ring-offset-base-100 shadow-lg">
                      <img 
                        src={authUser?.profilePic} 
                        alt="User Avatar" 
                        className="w-full h-full object-cover rounded-full"
                      />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-base truncate text-base-content">{authUser?.fullName}</p>
                    {authUser?.username && (
                      <p className="text-sm text-base-content/60 truncate">@{authUser?.username}</p>
                    )}
                    {authUser?.bio && (
                      <p className="text-xs text-base-content/50 truncate mt-1">{authUser?.bio}</p>
                    )}
                  </div>
                </div>

                {/* Edit Profile Button */}
                <button
                  onClick={() => {
                    setIsProfileModalOpen(true);
                    document.activeElement?.blur(); // Close dropdown
                  }}
                  className="btn btn-primary w-full gap-2 shadow-lg hover:shadow-primary/50 transition-all"
                >
                  <UserIcon className="h-5 w-5" />
                  Edit Profile
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Profile Edit Modal */}
      <ProfileEditModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        initialUser={authUser}
      />

      {/* Search Modal */}
      <SearchUsers isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </nav>
  );
};

export default Navbar;