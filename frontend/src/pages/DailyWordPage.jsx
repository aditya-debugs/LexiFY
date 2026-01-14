import React from "react";
import DailyWordComposer from "../components/DailyWordComposer";
import DailyWordFeed from "../components/DailyWordFeed";

const DailyWordPage = () => {
  return (
    <div className="min-h-screen bg-base-100">
      <div className="container mx-auto px-3 sm:px-4 lg:px-6 xl:px-8 py-4 sm:py-6 lg:py-8 space-y-6 sm:space-y-8 max-w-7xl">
        {/* Header */}
        <div className="animate-slide-in-left">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-base-content">
            📚 Daily Word
          </h1>
          <p className="text-sm sm:text-base text-base-content/60 mt-2">
            Share a word you learned today and build your streak!
          </p>
        </div>

        {/* Composer */}
        <div className="animate-slide-in-right">
          <DailyWordComposer />
        </div>

        {/* Feed */}
        <div className="animate-fade-in">
          <DailyWordFeed />
        </div>
      </div>
    </div>
  );
};

export default DailyWordPage;
