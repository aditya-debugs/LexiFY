import { useEffect, useState, useRef } from "react";
import { useNavigate, useParams } from "react-router";
import useAuthUser from "../hooks/useAuthUser";
import { useQuery } from "@tanstack/react-query";
import { getStreamToken } from "../lib/api";
import { ArrowLeft, Phone } from "lucide-react";

import {
  StreamVideo,
  StreamVideoClient,
  StreamCall,
  CallControls,
  SpeakerLayout,
  StreamTheme,
  CallingState,
  useCallStateHooks,
} from "@stream-io/video-react-sdk";

import "@stream-io/video-react-sdk/dist/css/styles.css";
import toast from "react-hot-toast";
import PageLoader from "../components/PageLoader";

const STREAM_API_KEY = import.meta.env.VITE_STREAM_API_KEY;

const CallPage = () => {
  const { id: callId } = useParams();
  const navigate = useNavigate();
  const [client, setClient] = useState(null);
  const [call, setCall] = useState(null);
  const [isConnecting, setIsConnecting] = useState(true);
  const hasJoined = useRef(false);

  const { authUser, isLoading } = useAuthUser();

  const { data: tokenData } = useQuery({
    queryKey: ["streamToken"],
    queryFn: getStreamToken,
    enabled: !!authUser,
  });

  useEffect(() => {
    const initCall = async () => {
      if (!tokenData?.token || !authUser || !callId || hasJoined.current)
        return;

      try {
        console.log("Initializing Stream video client...");
        hasJoined.current = true;

        const user = {
          id: authUser._id,
          name: authUser.fullName,
          image: authUser.profilePic,
        };

        const videoClient = new StreamVideoClient({
          apiKey: STREAM_API_KEY,
          user,
          token: tokenData.token,
        });

        const callInstance = videoClient.call("default", callId);

        await callInstance.join({ create: true });

        console.log("Joined call successfully");

        setClient(videoClient);
        setCall(callInstance);
      } catch (error) {
        console.error("Error joining call:", error);
        toast.error("Could not join the call. Please try again.");
        hasJoined.current = false;
      } finally {
        setIsConnecting(false);
      }
    };

    initCall();

    // Cleanup function to leave call when component unmounts
    return () => {
      if (call && client) {
        console.log("Leaving call and cleaning up...");
        call.leave().catch(console.error);
        client.disconnectUser().catch(console.error);
      }
    };
  }, [tokenData, authUser, callId]);

  const handleLeaveCall = async () => {
    try {
      if (call) {
        await call.leave();
      }
      if (client) {
        await client.disconnectUser();
      }
      toast.success("Call ended");
      navigate(-1); // Go back to previous page
    } catch (error) {
      console.error("Error leaving call:", error);
      navigate(-1);
    }
  };

  if (isLoading || isConnecting) return <PageLoader />;

  return (
    <div className="h-screen flex flex-col bg-base-300">
      {/* Header */}
      <div className="bg-base-200 p-4 flex items-center justify-between shadow-lg">
        <button
          onClick={handleLeaveCall}
          className="btn btn-ghost btn-sm gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
        <h1 className="text-lg font-semibold">Video Call</h1>
        <button
          onClick={handleLeaveCall}
          className="btn btn-error btn-sm gap-2"
        >
          <Phone className="w-4 h-4" />
          End Call
        </button>
      </div>

      {/* Call Content */}
      <div className="flex-1 relative">
        {client && call ? (
          <StreamVideo client={client}>
            <StreamCall call={call}>
              <CallContent onLeave={handleLeaveCall} />
            </StreamCall>
          </StreamVideo>
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center p-6">
              <p className="text-lg sm:text-xl mb-4">
                Could not initialize call. Please refresh or try again later.
              </p>
              <button className="btn btn-primary" onClick={() => navigate("/")}>
                Go Home
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const CallContent = ({ onLeave }) => {
  const { useCallCallingState, useParticipants } = useCallStateHooks();
  const callingState = useCallCallingState();
  const participants = useParticipants();
  const navigate = useNavigate();

  // When call ends, navigate away
  useEffect(() => {
    if (callingState === CallingState.LEFT) {
      toast.info("Call ended");
      navigate(-1);
    }
  }, [callingState, navigate]);

  return (
    <StreamTheme className="h-full">
      <div className="h-full flex flex-col">
        {/* Video Area */}
        <div className="flex-1 relative bg-base-300">
          {participants.length === 1 ? (
            // Only one participant (you) - show waiting message
            <div className="absolute inset-0 flex items-center justify-center z-10">
              <div className="text-center p-8 bg-base-200 rounded-2xl shadow-xl">
                <div className="animate-pulse mb-4">
                  <Phone className="w-16 h-16 mx-auto text-primary" />
                </div>
                <h2 className="text-2xl font-bold mb-2">
                  Waiting for others to join...
                </h2>
                <p className="text-base-content/70">
                  The call has started. Share the link for others to join.
                </p>
              </div>
            </div>
          ) : null}
          <SpeakerLayout />
        </div>

        {/* Call Controls */}
        <div className="flex-shrink-0 bg-base-200 p-4 flex justify-center">
          <CallControls onLeave={onLeave} />
        </div>
      </div>
    </StreamTheme>
  );
};

export default CallPage;
