import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router";
import useAuthUser from "../hooks/useAuthUser";
import { useQuery } from "@tanstack/react-query";
import { getStreamToken, translateMessage } from "../lib/api";
import { Target } from "lucide-react";

import {
  Channel,
  ChannelHeader,
  Chat,
  MessageInput,
  MessageList,
  Thread,
  Window,
  Avatar,
} from "stream-chat-react";
import { StreamChat } from "stream-chat";
import toast from "react-hot-toast";

import ChatLoader from "../components/ChatLoader";
import CallButton from "../components/CallButton";
import TranslationModal from "../components/TranslationModal";
import { translationCache } from "../lib/translationCache";

const STREAM_API_KEY = import.meta.env.VITE_STREAM_API_KEY;

const ChatPage = () => {
  const { id: targetUserId } = useParams();
  const navigate = useNavigate();
  const messageListRef = useRef(null);

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
    enabled: !!authUser,
  });

  useEffect(() => {
    const initChat = async () => {
      if (!tokenData?.token || !authUser) return;

      try {
        console.log("Initializing stream chat client...");

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

        const channelId = [authUser._id, targetUserId].sort().join("-");

        const currChannel = client.channel("messaging", channelId, {
          members: [authUser._id, targetUserId],
        });

        await currChannel.watch();

        setChatClient(client);
        setChannel(currChannel);

        const chatHistory = JSON.parse(
          localStorage.getItem("chatHistory") || "[]"
        );
        if (!chatHistory.includes(targetUserId)) {
          chatHistory.push(targetUserId);
          localStorage.setItem("chatHistory", JSON.stringify(chatHistory));
        }
      } catch (error) {
        console.error("Error initializing chat:", error);
        toast.error("Could not connect to chat. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    setLoading(true);
    initChat();
  }, [tokenData, authUser, targetUserId]);

  useEffect(() => {
    return () => {
      if (chatClient) {
        chatClient.disconnectUser();
      }
    };
  }, [chatClient]);

  // Add translation buttons to messages after they render
  useEffect(() => {
    if (!messageListRef.current) return;

    const addTranslateButtons = () => {
      // Select ALL messages - both sent and received
      const messages = messageListRef.current.querySelectorAll(
        ".str-chat__message-simple, .str-chat__message--me, .str-chat__message--other"
      );

      messages.forEach((messageEl) => {
        // Skip if button already exists (check both class and data attribute)
        if (
          messageEl.querySelector(".translate-btn-custom") ||
          messageEl.dataset.translateAdded
        )
          return;

        // Find the text content
        const textEl = messageEl.querySelector(
          ".str-chat__message-text-inner, .str-chat__message-text"
        );
        if (!textEl || !textEl.textContent?.trim()) return;

        // Mark this message as processed
        messageEl.dataset.translateAdded = "true";

        const messageText = textEl.textContent.trim();

        // Create translate button
        const btn = document.createElement("button");
        btn.className =
          "translate-btn-custom btn btn-xs btn-circle bg-primary text-primary-content hover:bg-primary-focus shadow-lg border-2 border-primary";
        btn.style.cssText =
          "position: absolute; top: -8px; right: -8px; z-index: 10;";
        btn.title = "Translate to your native language";
        btn.innerHTML =
          '<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m5 8 6 6"/><path d="m4 14 6-6 2-3"/><path d="M2 5h12"/><path d="M7 2h1"/><path d="m22 22-5-10-5 10"/><path d="M14 18h6"/></svg>';

        btn.onclick = (e) => {
          e.stopPropagation();
          e.preventDefault();
          handleTranslateMessage(messageText, "msg-" + Date.now());
        };

        // Make message container position relative
        messageEl.style.position = "relative";

        // Find the message content wrapper and append button there
        const contentWrapper = messageEl.querySelector(
          ".str-chat__message-simple__content, .str-chat__message-bubble"
        );
        if (contentWrapper) {
          contentWrapper.style.position = "relative";
          contentWrapper.appendChild(btn);
        } else {
          messageEl.appendChild(btn);
        }

        // Show/hide on hover for desktop, always visible on mobile
        if (window.innerWidth >= 768) {
          btn.style.opacity = "0";
          btn.style.transition = "opacity 0.2s ease";

          const showBtn = () => {
            btn.style.opacity = "1";
          };
          const hideBtn = () => {
            btn.style.opacity = "0";
          };

          messageEl.addEventListener("mouseenter", showBtn);
          messageEl.addEventListener("mouseleave", hideBtn);
        } else {
          btn.style.opacity = "1";
        }
      });
    };

    // Run immediately
    addTranslateButtons();

    // Watch for new messages
    const observer = new MutationObserver(addTranslateButtons);
    observer.observe(messageListRef.current, {
      childList: true,
      subtree: true,
    });

    return () => observer.disconnect();
  }, [channel]);

  // Add Join Call buttons to video call messages
  useEffect(() => {
    if (!messageListRef.current) return;

    const addJoinCallButtons = () => {
      const messages = messageListRef.current.querySelectorAll(
        ".str-chat__message-simple, .str-chat__message--me, .str-chat__message--other"
      );

      messages.forEach((messageEl) => {
        if (messageEl.dataset.callButtonAdded) return;

        const textEl = messageEl.querySelector(
          ".str-chat__message-text-inner, .str-chat__message-text"
        );
        if (!textEl) return;

        const messageText = textEl.textContent || "";

        // Check if message contains video call link
        if (
          messageText.includes("📹 Video call started") &&
          messageText.includes("/call/")
        ) {
          messageEl.dataset.callButtonAdded = "true";

          // Extract call ID from message
          const urlMatch = messageText.match(/\/call\/([^\s]+)/);
          if (!urlMatch) return;

          const callId = urlMatch[1];

          // Create join button
          const joinBtn = document.createElement("button");
          joinBtn.className = "btn btn-primary btn-sm mt-2 gap-2";
          joinBtn.innerHTML =
            '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path><path d="M14.05 2a9 9 0 0 1 8 7.94"></path><path d="M14.05 6A5 5 0 0 1 18 10"></path></svg> Join Video Call';
          joinBtn.onclick = (e) => {
            e.stopPropagation();
            navigate(`/call/${callId}`);
          };

          // Append button after text
          const contentWrapper = messageEl.querySelector(
            ".str-chat__message-simple__content, .str-chat__message-bubble, .str-chat__message-text"
          );
          if (contentWrapper) {
            contentWrapper.appendChild(joinBtn);
          }
        }
      });
    };

    addJoinCallButtons();

    const observer = new MutationObserver(addJoinCallButtons);
    observer.observe(messageListRef.current, {
      childList: true,
      subtree: true,
    });

    return () => observer.disconnect();
  }, [channel, navigate]);

  const handleVideoCall = () => {
    if (channel) {
      const callUrl = `/call/${channel.id}`;

      // Navigate to call page directly
      navigate(callUrl);

      // Send message with call link
      channel.sendMessage({
        text: `📹 Video call started. Click to join: ${window.location.origin}${callUrl}`,
      });

      toast.success("Starting video call...");
    }
  };

  const handleCreateGoal = () => {
    navigate(`/learning-goals/create?friendId=${targetUserId}`);
  };

  const handleTranslateMessage = async (text, messageId) => {
    const targetLanguage = authUser?.nativeLanguage || "English";

    const cachedTranslation = translationCache.get(text, targetLanguage);

    if (cachedTranslation) {
      setTranslationModal({
        isOpen: true,
        originalText: text,
        translatedText: cachedTranslation,
        isLoading: false,
        error: null,
      });
      return;
    }

    setTranslationModal({
      isOpen: true,
      originalText: text,
      translatedText: null,
      isLoading: true,
      error: null,
    });

    try {
      const response = await translateMessage(text, targetLanguage);
      const translatedText = response.translatedText;

      translationCache.set(text, targetLanguage, translatedText);

      setTranslationModal({
        isOpen: true,
        originalText: text,
        translatedText,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      console.error("Translation error:", error);

      const errorMessage =
        error.response?.data?.message ||
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
                {/* ✅ Custom Header (fixed layout, no Stream conflicts) */}
                <div className="flex-shrink-0 bg-base-200/80 backdrop-blur-md border-b border-base-300/50 px-4 py-2">
                  <div className="flex items-center justify-between">
                    {/* Left: Channel Info */}
                    <div className="flex items-center gap-3">
                      <Avatar
                        image={channel?.data?.image}
                        name={channel?.data?.name || "Chat"}
                        size={40}
                      />
                      <div>
                        <p className="font-semibold text-base-content">
                          {channel?.data?.name || "Chat"}
                        </p>
                        <p className="text-xs text-base-content/60">
                          {Object.keys(channel?.state?.members || {}).length}{" "}
                          members
                        </p>
                      </div>
                    </div>

                    {/* Right: Actions */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleCreateGoal}
                        className="btn btn-secondary btn-sm gap-1 shadow-lg transition-all hover:scale-105"
                        title="Create Learning Goal"
                      >
                        <Target className="w-4 h-4" />
                        <span className="hidden md:inline">Start a Goal</span>
                      </button>

                      <CallButton handleVideoCall={handleVideoCall} />
                    </div>
                  </div>
                </div>

                {/* Messages */}
                <div
                  ref={messageListRef}
                  className="flex-1 min-h-0 overflow-hidden"
                >
                  <MessageList />
                </div>

                {/* Input */}
                <div className="flex-shrink-0 bg-base-200/80 backdrop-blur-md border-t border-base-300/50 p-3 sm:p-4">
                  <MessageInput focus />
                </div>
              </div>
            </Window>

            <Thread />
          </Channel>
        </Chat>
      </div>

      <TranslationModal
        isOpen={translationModal.isOpen}
        onClose={closeTranslationModal}
        originalText={translationModal.originalText}
        translatedText={translationModal.translatedText}
        isLoading={translationModal.isLoading}
        error={translationModal.error}
        targetLanguage={authUser?.nativeLanguage || "English"}
      />
    </div>
  );
};

export default ChatPage;
