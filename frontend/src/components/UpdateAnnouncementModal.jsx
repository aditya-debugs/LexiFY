import React from "react";
import { X, Sparkles, Languages, Trophy, MessageCircle } from "lucide-react";

const UpdateAnnouncementModal = ({ isOpen, onClose, userName = "Friend", isNewUser = false }) => {
  if (!isOpen) return null;

  const features = [
    {
      icon: <Sparkles className="h-6 w-6 text-primary" />,
      title: "Daily Word Feature",
      description: "Share a new word you learned every day with your friends and track your learning journey!",
      badge: "New"
    },
    {
      icon: <Trophy className="h-6 w-6 text-warning" />,
      title: "Streak System",
      description: "Build your learning streak by consistently sharing words. Challenge yourself to maintain your streak!",
      badge: "New"
    },
    {
      icon: <Languages className="h-6 w-6 text-success" />,
      title: "Instant Translation",
      description: "Translate any message or Daily Word to your native language with just one click. Break language barriers effortlessly!",
      badge: "New"
    },
    {
      icon: <MessageCircle className="h-6 w-6 text-info" />,
      title: "Enhanced Chat",
      description: "Chat with friends with improved translation features. Communicate in any language, understand in yours!",
      badge: "Improved"
    }
  ];

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/85 z-[200] animate-fade-in"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-[201] flex items-center justify-center p-4 overflow-y-auto">
        <div
          className="bg-gradient-to-br from-base-100 to-base-200 rounded-3xl shadow-2xl max-w-3xl w-full my-8 animate-scale-in border-2 border-primary/20 flex flex-col max-h-[85vh]"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header with gradient */}
          <div className="relative bg-gradient-to-r from-primary to-secondary p-6 sm:p-8 text-primary-content overflow-hidden flex-shrink-0">
            {/* Decorative circles */}
            <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -mr-20 -mt-20" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full -ml-16 -mb-16" />
            
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3 flex-1">
                  <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm flex-shrink-0">
                    <Sparkles className="h-6 w-6 sm:h-8 sm:w-8" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h2 className="text-2xl sm:text-3xl font-bold mb-1">
                      {isNewUser ? `Welcome to Lexify, ${userName}! 👋` : `Welcome Back, ${userName}! 🎉`}
                    </h2>
                    <p className="text-primary-content/90 text-xs sm:text-sm">
                      {isNewUser ? "Let's start your language learning journey!" : "Check out what's new in Lexify"}
                    </p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="btn btn-ghost btn-sm btn-circle text-white hover:bg-white/20"
                  aria-label="Close announcement"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 sm:p-8 overflow-y-auto flex-1">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className="card bg-base-200/50 backdrop-blur-sm hover:bg-base-300/50 transition-all duration-300 hover:scale-105 hover:shadow-xl"
                >
                  <div className="card-body p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div className="p-2 bg-base-100 rounded-lg shadow-sm">
                        {feature.icon}
                      </div>
                      <span className={`badge badge-sm ${
                        feature.badge === 'New' ? 'badge-primary' : 'badge-accent'
                      }`}>
                        {feature.badge}
                      </span>
                    </div>
                    <h3 className="font-bold text-lg mb-2 text-base-content">
                      {feature.title}
                    </h3>
                    <p className="text-sm text-base-content/70 leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Call to action */}
            <div className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-2xl p-6 border-2 border-primary/20">
              <div className="flex items-center gap-4">
                <div className="flex-shrink-0">
                  <div className="p-3 bg-primary rounded-full">
                    <Sparkles className="h-6 w-6 text-primary-content" />
                  </div>
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-lg mb-1">Ready to explore?</h4>
                  <p className="text-sm text-base-content/70">
                    Start sharing your Daily Word, build your streak, and connect with learners worldwide!
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 sm:p-6 bg-base-200/50 backdrop-blur-sm border-t border-base-300 flex flex-col sm:flex-row items-center justify-between gap-4 flex-shrink-0">
            <div className="text-sm text-base-content/60">
              <span className="font-semibold">Version 2.0</span> • December 2025
            </div>
            <button
              onClick={onClose}
              className="btn btn-primary btn-md px-8 shadow-lg hover:shadow-primary/50 transition-all"
            >
              Get Started
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default UpdateAnnouncementModal;
