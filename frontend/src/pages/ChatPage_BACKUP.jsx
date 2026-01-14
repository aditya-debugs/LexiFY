import { useEffect, useState } from "react";
import { useParams } from "react-router";
import useAuthUser from "../hooks/useAuthUser";
import { useQuery } from "@tanstack/react-query";
import { getStreamToken, translateMessage } from "../lib/api";

import {
  Channel,
  ChannelHeader,
  Chat,
  MessageInput,
  MessageList,
  Thread,
  Window,
  MessageSimple,
} from "stream-chat-react";
import { StreamChat } from "stream-chat";
import toast from "react-hot-toast";

import ChatLoader from "../components/ChatLoader";
import CallButton from "../components/CallButton";
import TranslationModal from "../components/TranslationModal";
import { translationCache } from "../lib/translationCache";
import { Languages } from "lucide-react";

const STREAM_API_KEY = import.meta.env.VITE_STREAM_API_KEY;

/**
 * Custom Message Component with Translation Button
 * Renders each message with a translate button that appears on hover (desktop) or is always visible (mobile)
 */
const CustomMessage = (props) => {
  const { authUser } = useAuthUser();
  const [showTranslateBtn, setShowTranslateBtn] = useState(false);
  const [longPressTimer, setLongPressTimer] = useState(null);

  const messageText = props.message?.text || "";
  const messageId = props.message?.id;

  // Handle translation button click
  const handleTranslate = (e) => {
    e.stopPropagation();
    if (props.onTranslate && messageText) {
      props.onTranslate(messageText, messageId);
    }
  };

  // Mobile long-press detection
  const handleTouchStart = () => {
    const timer = setTimeout(() => {
      setShowTranslateBtn(true);
    }, 500); // 500ms long press
    setLongPressTimer(timer);
  };

  const handleTouchEnd = () => {
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      setLongPressTimer(null);
    }
  };

  return (
    <div
      className="relative group"
      onMouseEnter={() => setShowTranslateBtn(true)}
      onMouseLeave={() => setShowTranslateBtn(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <MessageSimple {...props} />
      
      {/* Translate Button */}
      {messageText && (
        <button
          onClick={handleTranslate}
          className={`absolute -top-2 right-2 btn btn-xs btn-circle btn-ghost bg-base-200/90 backdrop-blur-sm border border-base-300/50 shadow-lg hover:bg-primary hover:text-primary-content hover:border-primary transition-all z-10 ${
            showTranslateBtn || window.innerWidth < 768
              ? "opacity-100 scale-100"
              : "opacity-0 scale-75 pointer-events-none"
          } sm:group-hover:opacity-100 sm:group-hover:scale-100 sm:group-hover:pointer-events-auto`}
          title="Translate message"
          aria-label="Translate message"
        >
          <Languages className="h-3 w-3" />
        </button>
      )}
    </div>
  );
};

const ChatPage = () => {
  const { id: targetUserId } = useParams();

  const [chatClient, setChatClient] = useState(null);
  const [channel, setChannel] = useState(null);
  const [loading, setLoading] = useState(true);

  // Translation state
  const [translationModal, setTranslationModal] = useState({
    isOpen: false,
    originalText: "",
    translatedText: null,
    isLoading: false,
    error: null,
  });

  const { authUser } = useAuthUser();

  const { data: tokenData } = useQuery({
    queryKey: ["streamToken"],
    queryFn: getStreamToken,
    enabled: !!authUser, // this will run only when authUser is available
  });

  useEffect(() => {
    const initChat = async () => {
      if (!tokenData?.token || !authUser) return;

      try {
        console.log("Initializing stream chat client...");

        // Disconnect previous client if exists
        if (chatClient) {
          await chatClient.disconnectUser();
        }

        const client = StreamChat.getInstance(STREAM_API_KEY);

        await client.connectUser(
          {
            id: authUser._id,
            name: authUser.fullName,
            image: authUser.profilePic,
          },
          tokenData.token
        );

        //
        const channelId = [authUser._id, targetUserId].sort().join("-");

        // you and me
        // if i start the chat => channelId: [myId, yourId]
        // if you start the chat => channelId: [yourId, myId]  => [myId,yourId]

        const currChannel = client.channel("messaging", channelId, {
          members: [authUser._id, targetUserId],
        });

        await currChannel.watch();

        setChatClient(client);
        setChannel(currChannel);

        // Track chat history in localStorage for Friends page
        const chatHistory = JSON.parse(localStorage.getItem('chatHistory') || '[]');
        if (!chatHistory.includes(targetUserId)) {
          chatHistory.push(targetUserId);
          localStorage.setItem('chatHistory', JSON.stringify(chatHistory));
        }
      } catch (error) {
        console.error("Error initializing chat:", error);
        toast.error("Could not connect to chat. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    // Reset loading state when dependencies change
    setLoading(true);
    initChat();
  }, [tokenData, authUser, targetUserId]);

  // Cleanup effect to disconnect Stream client on unmount
  useEffect(() => {
    return () => {
      if (chatClient) {
        chatClient.disconnectUser();
      }
    };
  }, [chatClient]);

  const handleVideoCall = () => {
    if (channel) {
      const callUrl = `${window.location.origin}/call/${channel.id}`;

      channel.sendMessage({
        text: `I've started a video call. Join me here: ${callUrl}`,
      });

      toast.success("Video call link sent successfully!");
    }
  };

  /**
   * Handle translation of a message
   * @param {string} text - The message text to translate
   * @param {string} messageId - The unique message ID (for debugging)
   */
  const handleTranslateMessage = async (text, messageId) => {
    const targetLanguage = authUser?.nativeLanguage || "English";

    // Check cache first
    const cachedTranslation = translationCache.get(text, targetLanguage);
    
    if (cachedTranslation) {
      // Use cached translation
      setTranslationModal({
        isOpen: true,
        originalText: text,
        translatedText: cachedTranslation,
        isLoading: false,
        error: null,
      });
      return;
    }

    // Open modal with loading state
    setTranslationModal({
      isOpen: true,
      originalText: text,
      translatedText: null,
      isLoading: true,
      error: null,
    });

    try {
      // Call translation API
      const response = await translateMessage(text, targetLanguage);
      const translatedText = response.translatedText;

      // Cache the translation
      translationCache.set(text, targetLanguage, translatedText);

      // Update modal with translated text
      setTranslationModal({
        isOpen: true,
        originalText: text,
        translatedText,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      console.error("Translation error:", error);
      
      const errorMessage = error.response?.data?.message || 
                          error.message || 
                          "Failed to translate message. Please try again.";

      setTranslationModal({
        isOpen: true,
        originalText: text,
        translatedText: null,
        isLoading: false,
        error: errorMessage,
      });

      toast.error(errorMessage);
    }
  };

  /**
   * Close translation modal
   */
  const closeTranslationModal = () => {
    setTranslationModal({
      isOpen: false,
      originalText: "",
      translatedText: null,
      isLoading: false,
      error: null,
    });
  };

  if (loading || !chatClient || !channel) return <ChatLoader />;

  return (
    <div className="min-h-screen bg-base-100 text-base-content overflow-hidden">
      <div className="h-[calc(100vh-4rem)] flex flex-col bg-base-100">
        <Chat client={chatClient}>
          <Channel channel={channel}>
            <Window>
              <div className="h-full flex flex-col">
                {/* Fixed Header with Call Button */}
                <div className="flex-shrink-0 bg-base-200/80 backdrop-blur-md border-b border-base-300/50 relative">
                  <div className="absolute top-3 right-3 sm:top-4 sm:right-4 z-10">
                    <CallButton handleVideoCall={handleVideoCall} />
                  </div>
                  <ChannelHeader />
                </div>

                {/* Scrollable Messages Area */}
                <div className="flex-1 min-h-0 overflow-hidden">
                  <MessageList />
                </div>

                {/* Fixed Message Input */}
                <div className="flex-shrink-0 bg-base-200/80 backdrop-blur-md border-t border-base-300/50 p-3 sm:p-4">
                  <MessageInput focus />
                </div>
              </div>
            </Window>
            <Thread />
          </Channel>
        </Chat>
      </div>
    </div>
  );
};
export default ChatPage;