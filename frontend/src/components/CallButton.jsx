import { VideoIcon } from "lucide-react";

function CallButton({ handleVideoCall }) {
  return (
    <button 
      onClick={handleVideoCall} 
      className="btn btn-primary hover:btn-primary-focus btn-sm sm:btn-md w-full gap-2 shadow-lg hover:shadow-primary/50 transition-all hover-lift rounded-xl"
    >
      <VideoIcon className="h-4 w-4 sm:h-5 sm:w-5" />
      <span className="hidden sm:inline">Video Call</span>
    </button>
  );
}

export default CallButton;