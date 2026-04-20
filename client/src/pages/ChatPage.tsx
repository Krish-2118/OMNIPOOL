import React, { useEffect, useState, useRef } from "react";
import { useLocation } from "react-router-dom";
import useStore from "../store/useStore";
import type { ChatConversation, ChatMessage } from "../store/useStore";
import Button from "../components/ui/Button";
import Modal from "../components/ui/Modal";
import {
  getConversations,
  getChatMessages,
  clearRequestChat,
  deleteRequestConversation,
  updateRequestStatus,
} from "../api/client";
import { connectSocket, joinChat, sendMessage } from "../api/socket";

const ChatPage: React.FC = () => {
  const { user, conversations, setConversations } = useStore();
  const [activeConversationId, setActiveConversationId] = useState<
    string | null
  >(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [messageInput, setMessageInput] = useState("");
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [isDeletingChat, setIsDeletingChat] = useState(false);
  const [isChatCleared, setIsChatCleared] = useState(false);
  const [isChatActionsOpen, setIsChatActionsOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<
    | { type: "clear"; title: string; message: string }
    | { type: "delete"; title: string; message: string }
    | null
  >(null);
  const location = useLocation();

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const chatActionsRef = useRef<HTMLDivElement>(null);
  const previousMessageCountRef = useRef(0);
  const forceScrollToBottomRef = useRef(false);

  const isNearBottom = () => {
    const container = messagesContainerRef.current;
    if (!container) return true;
    const distanceFromBottom =
      container.scrollHeight - container.scrollTop - container.clientHeight;
    return distanceFromBottom < 120;
  };

  const normalizeConversationList = (items: unknown): ChatConversation[] =>
    Array.isArray(items) ? (items as ChatConversation[]) : [];

  const normalizeMessageList = (items: unknown): ChatMessage[] =>
    Array.isArray(items) ? (items as ChatMessage[]) : [];

  // Initialize socket and fetch conversations
  useEffect(() => {
    if (user) {
      connectSocket(user._id);
      fetchConversations();
    }
  }, [user]);

  useEffect(() => {
    if (!user) return;

    const interval = window.setInterval(() => {
      fetchConversations();
      if (activeConversationId) {
        fetchMessages(activeConversationId);
      }
    }, 10000);

    return () => window.clearInterval(interval);
  }, [user, activeConversationId]);

  // Handle query parameter ?request_id=xxx
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const reqId = params.get("request_id");
    if (reqId) {
      setActiveConversationId(reqId);
    }
  }, [location]);

  useEffect(() => {
    if (!conversations.length) {
      return;
    }

    const activeExists = activeConversationId
      ? conversations.some(
          (conversation) => conversation._id === activeConversationId,
        )
      : false;

    if (!activeConversationId || !activeExists) {
      const fallbackConversation = conversations[0];
      if (
        fallbackConversation &&
        fallbackConversation._id !== activeConversationId
      ) {
        setActiveConversationId(fallbackConversation._id);
      }
    }
  }, [activeConversationId, conversations]);

  // Load messages when an active conversation is selected
  useEffect(() => {
    if (activeConversationId) {
      setIsChatActionsOpen(false);
      forceScrollToBottomRef.current = true;
      joinChat(activeConversationId);
      fetchMessages(activeConversationId);
      setIsChatCleared(false);

      // Clear unread count for this conversation
      const updatedConversations = conversations.map((c) =>
        c._id === activeConversationId ? { ...c, unread_count: 0 } : c,
      );
      setConversations(updatedConversations);
    }
  }, [activeConversationId]);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;

    const distanceFromBottom =
      container.scrollHeight - container.scrollTop - container.clientHeight;
    const shouldStickToBottom = distanceFromBottom < 120;
    const hasNewMessages = messages.length > previousMessageCountRef.current;

    if (
      forceScrollToBottomRef.current ||
      (hasNewMessages && shouldStickToBottom)
    ) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }

    forceScrollToBottomRef.current = false;
    previousMessageCountRef.current = messages.length;
  }, [messages]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isChatActionsOpen &&
        chatActionsRef.current &&
        !chatActionsRef.current.contains(event.target as Node)
      ) {
        setIsChatActionsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isChatActionsOpen]);

  // Add socket listener for incoming messages
  useEffect(() => {
    const socket = connectSocket(user ? user._id : "");

    const handleNewMessage = (msg: ChatMessage) => {
      // If it belongs to currently active chat, append it
      if (msg.request_id === activeConversationId) {
        const senderId =
          msg.sender_id &&
          typeof msg.sender_id === "object" &&
          "_id" in msg.sender_id
            ? msg.sender_id._id
            : msg.sender_id;

        forceScrollToBottomRef.current =
          senderId === user?._id || isNearBottom();
        setMessages((prev) => [...prev, msg]);
      } else {
        // Otherwise inc unread count
        setConversations((prev) =>
          prev.map((c) =>
            c._id === msg.request_id
              ? { ...c, unread_count: (c.unread_count || 0) + 1 }
              : c,
          ),
        );
      }
    };

    const handleRequestUpdate = (updatedRequest: ChatConversation) => {
      setConversations((prev) =>
        prev.map((c) =>
          c._id === updatedRequest._id
            ? {
                ...c,
                status: updatedRequest.status ?? c.status,
                updatedAt: updatedRequest.updatedAt ?? c.updatedAt,
              }
            : c,
        ),
      );
    };

    const handleNewRequest = (newRequest: ChatConversation) => {
      setConversations((prev) => {
        const withoutExisting = prev.filter(
          (conv) => conv._id !== newRequest._id,
        );
        return [newRequest, ...withoutExisting].sort(
          (a, b) =>
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
        );
      });

      if (activeConversationId === newRequest._id) {
        fetchMessages(newRequest._id);
      }
    };

    const handleConversationDeleted = (payload: { request_id: string }) => {
      setConversations((prev) => {
        const remaining = prev.filter(
          (conv) => conv._id !== payload.request_id,
        );

        if (activeConversationId === payload.request_id) {
          const nextConversation = remaining[0];
          setActiveConversationId(nextConversation?._id ?? null);
          setMessages([]);
          setIsChatCleared(false);
        }

        return remaining;
      });
    };

    const handleChatCleared = (payload: { request_id: string }) => {
      if (activeConversationId === payload.request_id) {
        setMessages([]);
        setIsChatCleared(true);
      }
      setConversations((prev) =>
        prev.map((conv) =>
          conv._id === payload.request_id
            ? { ...conv, updatedAt: new Date().toISOString(), unread_count: 0 }
            : conv,
        ),
      );
    };

    socket.on("new_request", handleNewRequest);
    socket.on("new_message", handleNewMessage);
    socket.on("request_update", handleRequestUpdate);
    socket.on("conversation_deleted", handleConversationDeleted);
    socket.on("chat_cleared", handleChatCleared);

    return () => {
      socket.off("new_request", handleNewRequest);
      socket.off("new_message", handleNewMessage);
      socket.off("request_update", handleRequestUpdate);
      socket.off("conversation_deleted", handleConversationDeleted);
      socket.off("chat_cleared", handleChatCleared);
    };
  }, [activeConversationId, user]);

  const fetchConversations = async () => {
    try {
      const { data } = await getConversations();
      const conversationItems = normalizeConversationList(data?.data);
      setConversations(conversationItems);
      // Auto-select first if none selected and no query param used
      if (!activeConversationId && conversationItems.length > 0) {
        const params = new URLSearchParams(location.search);
        if (!params.get("request_id")) {
          setActiveConversationId(conversationItems[0]._id);
        }
      }
    } catch (e) {
      console.error("Failed to fetch conversations", e);
    }
  };

  const fetchMessages = async (reqId: string) => {
    try {
      const { data } = await getChatMessages(reqId);
      const incomingMessages = normalizeMessageList(data?.data);
      setMessages((prev) => {
        if (
          prev.length === incomingMessages.length &&
          prev[0]?._id === incomingMessages[0]?._id &&
          prev[prev.length - 1]?._id ===
            incomingMessages[incomingMessages.length - 1]?._id
        ) {
          return prev;
        }

        return incomingMessages;
      });
    } catch (e) {
      console.error("Failed to fetch messages", e);
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim() || !activeConversationId || !user) return;

    const activeConv = conversations.find(
      (c) => c._id === activeConversationId,
    );
    if (!activeConv) return;

    const isRequester =
      activeConv.requester_id &&
      typeof activeConv.requester_id === "object" &&
      "_id" in activeConv.requester_id
        ? activeConv.requester_id._id === user._id
        : activeConv.requester_id === user._id;

    // The receiver is the OTHER person in the request
    const receiverId = isRequester
      ? activeConv.owner_id &&
        typeof activeConv.owner_id === "object" &&
        "_id" in activeConv.owner_id
        ? activeConv.owner_id._id
        : activeConv.owner_id
      : activeConv.requester_id &&
          typeof activeConv.requester_id === "object" &&
          "_id" in activeConv.requester_id
        ? activeConv.requester_id._id
        : activeConv.requester_id;

    const msgData = {
      request_id: activeConversationId,
      sender_id: user._id,
      receiver_id: receiverId,
      message: messageInput.trim(),
    };

    // Emit via socket
    sendMessage(msgData);
    forceScrollToBottomRef.current = true;
    setMessageInput("");
  };

  const getUserId = (userValue: string | { _id: string } | null | undefined) =>
    userValue && typeof userValue === "object" && "_id" in userValue
      ? userValue._id
      : userValue;

  const handleStatusUpdate = async (
    status: "accepted" | "rejected" | "completed",
  ) => {
    if (!currentConversation || isUpdatingStatus) return;

    setIsUpdatingStatus(true);
    try {
      const { data } = await updateRequestStatus(currentConversation._id, {
        status,
      });
      const updatedConversation = data?.data as ChatConversation | undefined;
      if (!updatedConversation?._id) {
        throw new Error("Unexpected request update response");
      }
      const updatedConversations = conversations.map((conv) =>
        conv._id === updatedConversation._id
          ? {
              ...conv,
              status: updatedConversation.status ?? conv.status,
              updatedAt: updatedConversation.updatedAt ?? conv.updatedAt,
            }
          : conv,
      );
      setConversations(updatedConversations);
      fetchMessages(updatedConversation._id);
    } catch (e) {
      console.error("Failed to update request status", e);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleDeleteChat = async () => {
    if (!currentConversation || isDeletingChat) return;

    if (currentConversation.status === "accepted") {
      setPendingAction({
        type: "delete",
        title: "Delete disabled",
        message:
          "Accepted requests cannot be deleted from chat. Complete or reject the request first.",
      });
      return;
    }

    setPendingAction({
      type: "delete",
      title: "Delete chat",
      message:
        "Delete this chat and all of its messages? This cannot be undone.",
    });
  };

  const confirmDeleteChat = async () => {
    if (!currentConversation || isDeletingChat) return;

    setIsDeletingChat(true);
    try {
      await deleteRequestConversation(currentConversation._id);
      const remainingConversations = conversations.filter(
        (conv) => conv._id !== currentConversation._id,
      );
      setConversations(remainingConversations);
      setMessages([]);
      setIsChatCleared(false);

      const nextConversation = remainingConversations[0];
      if (nextConversation) {
        setActiveConversationId(nextConversation._id);
      } else {
        setActiveConversationId(null);
      }
      fetchConversations();
      setPendingAction(null);
    } catch (e) {
      const errorMessage =
        (e as any)?.response?.data?.error || "Failed to delete conversation";
      setPendingAction({
        type: "delete",
        title: "Delete failed",
        message: errorMessage,
      });
      console.error("Failed to delete conversation", e);
    } finally {
      setIsDeletingChat(false);
    }
  };

  const handleClearChat = async () => {
    if (!currentConversation || isDeletingChat) return;

    setPendingAction({
      type: "clear",
      title: "Clear chat",
      message:
        "Clear this chat history? The thread will stay active so you can chat again later.",
    });
  };

  const confirmClearChat = async () => {
    if (!currentConversation || isDeletingChat) return;

    setIsDeletingChat(true);
    try {
      await clearRequestChat(currentConversation._id);
      setMessages([]);
      setIsChatCleared(true);
      setConversations((prev) =>
        prev.map((conv) =>
          conv._id === currentConversation._id
            ? {
                ...conv,
                updatedAt: new Date().toISOString(),
                unread_count: 0,
              }
            : conv,
        ),
      );
      fetchConversations();
      setPendingAction(null);
    } catch (e) {
      const errorMessage =
        (e as any)?.response?.data?.error || "Failed to clear chat";
      setPendingAction({
        type: "clear",
        title: "Clear failed",
        message: errorMessage,
      });
      console.error("Failed to clear chat", e);
    } finally {
      setIsDeletingChat(false);
    }
  };

  const currentConversation = conversations.find(
    (c) => c._id === activeConversationId,
  );
  const isCurrentUserOwner = currentConversation
    ? getUserId(currentConversation.owner_id) === user?._id
    : false;
  const isCurrentUserParticipant = currentConversation
    ? getUserId(currentConversation.owner_id) === user?._id ||
      getUserId(currentConversation.requester_id) === user?._id
    : false;
  const otherUser = currentConversation
    ? currentConversation.requester_id &&
      typeof currentConversation.requester_id === "object" &&
      "_id" in currentConversation.requester_id &&
      currentConversation.requester_id._id === user?._id
      ? currentConversation.owner_id
      : currentConversation.requester_id
    : null;

  return (
    <div className="min-h-screen pt-20 pb-0 flex flex-col bg-bg-primary">
      <div className="flex-1 flex max-w-7xl mx-auto w-full border-x border-border-default h-[calc(100vh-80px)]">
        {/* Left Sidebar: Conversations List */}
        <div className="w-1/3 min-w-75 border-r border-border-default bg-bg-secondary/30 flex flex-col">
          <div className="p-4 border-b border-border-default">
            <h2 className="text-xl font-bold text-text-primary">Messages</h2>
          </div>

          <div className="flex-1 overflow-y-auto">
            {conversations.length === 0 ? (
              <div className="p-8 text-center text-text-muted text-sm">
                No active conversations. Start one by requesting hardware in the
                Registry.
              </div>
            ) : (
              conversations.map((conv) => {
                const isRequester =
                  conv.requester_id &&
                  typeof conv.requester_id === "object" &&
                  "_id" in conv.requester_id
                    ? conv.requester_id._id === user?._id
                    : conv.requester_id === user?._id;
                const contact = isRequester ? conv.owner_id : conv.requester_id;
                const contactObject =
                  contact && typeof contact === "object"
                    ? contact
                    : { name: "Unknown User" };
                const hwItem =
                  conv.hardware_id && typeof conv.hardware_id === "object"
                    ? conv.hardware_id
                    : { name: "Hardware" };

                return (
                  <button
                    key={conv._id}
                    onClick={() => setActiveConversationId(conv._id)}
                    className={`w-full text-left p-4 border-b border-border-default/50 hover:bg-bg-tertiary transition-colors flex items-center justify-between ${
                      activeConversationId === conv._id
                        ? "bg-bg-tertiary/80 border-l-4 border-l-accent-indigo"
                        : ""
                    }`}
                  >
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div className="w-10 h-10 rounded-full bg-accent-indigo text-white flex items-center justify-center font-bold shrink-0">
                        {contactObject.name?.charAt(0).toUpperCase()}
                      </div>
                      <div className="overflow-hidden">
                        <div className="font-semibold text-text-primary truncate">
                          {contactObject.name}
                        </div>
                        <div className="text-xs text-text-muted truncate">
                          Re: {hwItem.name}
                        </div>
                      </div>
                    </div>
                    {conv.unread_count ? (
                      <div className="bg-accent-rose text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full shrink-0">
                        {conv.unread_count}
                      </div>
                    ) : null}
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right Area: Chat Window */}
        <div className="flex-1 flex flex-col bg-bg-primary">
          {activeConversationId && currentConversation ? (
            <>
              {/* Chat Header */}
              <div className="h-16 border-b border-border-default px-6 flex justify-between items-center bg-bg-secondary/10 shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-accent-indigo text-white flex items-center justify-center font-bold">
                    {otherUser &&
                    typeof otherUser === "object" &&
                    "name" in otherUser &&
                    otherUser.name
                      ? otherUser.name.charAt(0).toUpperCase()
                      : "?"}
                  </div>
                  <div>
                    <h3 className="font-semibold text-text-primary truncate">
                      {otherUser &&
                      typeof otherUser === "object" &&
                      "name" in otherUser
                        ? otherUser.name
                        : "User"}
                    </h3>
                    <div className="text-xs text-text-muted truncate">
                      {currentConversation.hardware_id &&
                      typeof currentConversation.hardware_id === "object" &&
                      "name" in currentConversation.hardware_id
                        ? currentConversation.hardware_id.name
                        : "Item"}{" "}
                      (Qty: {currentConversation.quantity_requested})
                    </div>
                  </div>
                </div>
                {/* Status Badge */}
                <div className="flex flex-col items-end gap-2">
                  <span
                    className={`text-xs sm:text-sm px-4 py-1.5 rounded-full font-semibold tracking-wide border ${
                      currentConversation.status === "accepted"
                        ? "bg-accent-emerald/15 text-accent-emerald border-accent-emerald/30"
                        : currentConversation.status === "rejected"
                          ? "bg-accent-rose/15 text-accent-rose border-accent-rose/30"
                          : currentConversation.status === "completed"
                            ? "bg-bg-glass text-text-muted border-border-default"
                            : "bg-accent-amber/15 text-accent-amber border-accent-amber/30"
                    }`}
                  >
                    {String(
                      currentConversation.status ?? "pending",
                    ).toUpperCase()}
                  </span>
                  <div className="flex flex-wrap justify-end gap-2">
                    {isCurrentUserOwner &&
                    currentConversation.status === "pending" ? (
                      <>
                        <Button
                          type="button"
                          size="lg"
                          onClick={() => handleStatusUpdate("accepted")}
                          isLoading={isUpdatingStatus}
                          className="min-w-32"
                        >
                          Accept Request
                        </Button>
                        <Button
                          type="button"
                          size="lg"
                          variant="danger"
                          onClick={() => handleStatusUpdate("rejected")}
                          isLoading={isUpdatingStatus}
                          className="min-w-32"
                        >
                          Reject Request
                        </Button>
                      </>
                    ) : null}

                    {isCurrentUserParticipant &&
                    currentConversation.status === "accepted" ? (
                      <Button
                        type="button"
                        size="lg"
                        variant="secondary"
                        onClick={() => handleStatusUpdate("completed")}
                        isLoading={isUpdatingStatus}
                        className="min-w-36"
                      >
                        Mark Completed
                      </Button>
                    ) : null}

                    <div className="relative" ref={chatActionsRef}>
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={() => setIsChatActionsOpen((prev) => !prev)}
                        className="h-9 w-9 p-0 min-w-0 rounded-lg"
                        title="More chat actions"
                        disabled={isDeletingChat}
                      >
                        <svg
                          className="w-5 h-5"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                          aria-hidden="true"
                        >
                          <circle cx="6" cy="12" r="1.8" />
                          <circle cx="12" cy="12" r="1.8" />
                          <circle cx="18" cy="12" r="1.8" />
                        </svg>
                      </Button>

                      {isChatActionsOpen ? (
                        <div className="absolute right-0 mt-2 w-48 rounded-xl border border-border-default bg-bg-secondary shadow-2xl z-20 p-1.5 space-y-1">
                          <button
                            type="button"
                            onClick={() => {
                              setIsChatActionsOpen(false);
                              handleClearChat();
                            }}
                            className="w-full text-left px-2.5 py-2 rounded-lg text-base text-text-primary hover:bg-bg-tertiary transition-colors"
                          >
                            Clear chat history
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              if (currentConversation.status === "accepted") {
                                return;
                              }
                              setIsChatActionsOpen(false);
                              handleDeleteChat();
                            }}
                            disabled={currentConversation.status === "accepted"}
                            className="w-full text-left px-2.5 py-2 rounded-lg text-base text-accent-rose hover:bg-bg-tertiary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            title={
                              currentConversation.status === "accepted"
                                ? "Accepted requests cannot be deleted"
                                : "Delete this conversation"
                            }
                          >
                            Delete chat
                          </button>
                        </div>
                      ) : null}
                    </div>
                  </div>
                </div>
              </div>

              {/* Messages Area */}
              <div
                ref={messagesContainerRef}
                className="flex-1 overflow-y-auto p-6 space-y-4"
              >
                {messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-text-muted">
                    <p>
                      {isChatCleared ? "Chat cleared." : "No messages yet."}
                    </p>
                    <p className="text-sm">
                      {isChatCleared
                        ? "Send a new message to continue this thread later."
                        : "Send a message to start the conversation."}
                    </p>
                  </div>
                ) : (
                  messages.map((msg) => {
                    const isMe =
                      (msg.sender_id &&
                      typeof msg.sender_id === "object" &&
                      "_id" in msg.sender_id
                        ? msg.sender_id._id
                        : msg.sender_id) === user?._id;
                    return (
                      <div
                        key={msg._id}
                        className={`flex ${isMe ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`max-w-[70%] rounded-2xl px-4 py-2 text-sm ${
                            isMe
                              ? "bg-accent-indigo text-white rounded-br-sm"
                              : "bg-bg-tertiary text-text-primary rounded-bl-sm"
                          }`}
                        >
                          <p className="whitespace-pre-line">{msg.message}</p>
                          <span
                            className={`text-[10px] block mt-1 ${isMe ? "text-indigo-200" : "text-text-muted"}`}
                          >
                            {new Date(msg.createdAt).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <form
                onSubmit={handleSend}
                className="p-4 border-t border-border-default bg-bg-secondary/10 shrink-0"
              >
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 bg-bg-tertiary border border-border-default rounded-xl px-4 py-3 text-text-primary focus:outline-none focus:border-accent-indigo transition-all"
                  />
                  <button
                    type="submit"
                    disabled={!messageInput.trim()}
                    className="bg-accent-indigo hover:bg-accent-violet disabled:opacity-50 text-white rounded-xl px-6 py-3 font-medium transition-all flex items-center justify-center gap-2"
                  >
                    Send
                  </button>
                </div>
              </form>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-text-muted flex-col gap-4">
              <svg
                className="w-16 h-16 opacity-50"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
              <p>Select a conversation to start chatting</p>
            </div>
          )}
        </div>
      </div>

      <Modal
        isOpen={Boolean(pendingAction)}
        onClose={() => setPendingAction(null)}
        title={pendingAction?.title}
        size="sm"
      >
        <div className="space-y-5">
          <p className="text-sm text-text-secondary leading-relaxed">
            {pendingAction?.message}
          </p>
          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setPendingAction(null)}
            >
              Cancel
            </Button>
            {pendingAction?.type === "clear" ? (
              <Button
                type="button"
                onClick={confirmClearChat}
                isLoading={isDeletingChat}
              >
                Clear Chat
              </Button>
            ) : pendingAction?.title === "Delete disabled" ? (
              <Button
                type="button"
                variant="danger"
                onClick={() => setPendingAction(null)}
              >
                Close
              </Button>
            ) : (
              <Button
                type="button"
                variant="danger"
                onClick={confirmDeleteChat}
                isLoading={isDeletingChat}
                disabled={currentConversation?.status === "accepted"}
              >
                Delete Chat
              </Button>
            )}
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ChatPage;
