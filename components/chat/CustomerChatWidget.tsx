// Customer Chat Widget - Floating chat button and window
import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../../context/AuthContext";
import {
  chatService,
  ChatRoom,
  ChatMessage,
} from "../../services/chat.service";
import {
  subscribeToChatMessages,
  unsubscribeFromChat,
} from "../../lib/realtime";

// Icons
const ChatIcon = () => (
  <svg
    className="w-6 h-6"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
    />
  </svg>
);

const CloseIcon = () => (
  <svg
    className="w-5 h-5"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M6 18L18 6M6 6l12 12"
    />
  </svg>
);

const SendIcon = () => (
  <svg
    className="w-5 h-5"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
    />
  </svg>
);

const MinimizeIcon = () => (
  <svg
    className="w-5 h-5"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M20 12H4"
    />
  </svg>
);

export const CustomerChatWidget: React.FC = () => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [room, setRoom] = useState<ChatRoom | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [hasNewMessage, setHasNewMessage] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showHistory, setShowHistory] = useState(false);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when messages change
  const scrollToBottom = (force: boolean = false) => {
    if (force) {
      // Immediate scroll without animation
      messagesEndRef.current?.scrollIntoView({ behavior: "auto" });
    } else {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Scroll to bottom when chat opens
  useEffect(() => {
    if (isOpen && !isMinimized && messages.length > 0) {
      // Use setTimeout to ensure DOM is updated
      setTimeout(() => scrollToBottom(true), 100);
      // Clear new message indicator
      setHasNewMessage(false);
      setUnreadCount(0);
    }
  }, [isOpen, isMinimized]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen && !isMinimized && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen, isMinimized]);

  // Load existing room immediately when user logs in (to subscribe to realtime)
  useEffect(() => {
    if (!user) return;

    const loadActiveRoom = async () => {
      try {
        const rooms = await chatService.getCustomerRooms(user.id);
        const activeRoom = rooms.find(
          (r) => r.status === "WAITING" || r.status === "ACTIVE"
        );

        if (activeRoom) {
          setRoom(activeRoom);
          // Count unread messages (messages from staff that are not read)
          const msgs = await chatService.getMessages(activeRoom.id);
          const unread = msgs.filter(
            (m) => m.senderId !== user.id && !m.isRead
          ).length;
          if (unread > 0) {
            setUnreadCount(unread);
            setHasNewMessage(true);
          }
        }
      } catch (error) {
        console.error("Error loading active room:", error);
      }
    };

    loadActiveRoom();
  }, [user]);

  // Load messages when chat opens
  useEffect(() => {
    if (!user || !isOpen || !room) return;

    const loadMessages = async () => {
      setLoading(true);
      try {
        const msgs = await chatService.getMessages(room.id);
        setMessages(msgs);
        // Mark messages as read when opening chat
        await chatService.markMessagesAsRead(room.id, user.id);
        // Clear unread count
        setUnreadCount(0);
        setHasNewMessage(false);
      } catch (error) {
        console.error("Error loading messages:", error);
      } finally {
        setLoading(false);
      }
    };

    loadMessages();
  }, [user, isOpen]);

  // Subscribe to realtime messages
  useEffect(() => {
    if (!room) return;

    const unsubscribe = subscribeToChatMessages(room.id, (newMsg) => {
      setMessages((prev) => {
        // Avoid duplicates - check both real ID and temp ID pattern
        if (prev.some((m) => m.id === newMsg.id)) return prev;
        // Also check if we already have this message via optimistic update (compare content + sender + approximate time)
        const isDuplicate = prev.some(
          (m) =>
            m.id.startsWith("temp-") &&
            m.senderId === newMsg.senderId &&
            m.content === newMsg.content
        );
        if (isDuplicate) {
          // Replace temp message with real one
          return prev.map((m) =>
            m.id.startsWith("temp-") &&
            m.senderId === newMsg.senderId &&
            m.content === newMsg.content
              ? newMsg
              : m
          );
        }
        return [...prev, newMsg];
      });

      // If message from staff and chat is minimized/closed, show notification
      if (user && newMsg.senderId !== user.id) {
        if (!isOpen || isMinimized) {
          setHasNewMessage(true);
          setUnreadCount((prev) => prev + 1);
          // Play notification sound (optional)
          try {
            const audio = new Audio("/notification.mp3");
            audio.volume = 0.3;
            audio.play().catch(() => {});
          } catch {}
        }
        chatService.markMessagesAsRead(room.id, user.id);
      }
    });

    return () => {
      unsubscribeFromChat(room.id);
    };
  }, [room, user]);

  // Start new chat
  const startChat = async () => {
    if (!user) {
      alert("Vui lòng đăng nhập để sử dụng chat!");
      return;
    }

    setLoading(true);
    try {
      const newRoom = await chatService.createRoom(user.id);
      setRoom(newRoom);

      // Send initial message
      const welcomeMsg = await chatService.sendMessage({
        roomId: newRoom.id,
        senderId: user.id,
        content: "Xin chào! Tôi cần hỗ trợ.",
        type: "TEXT",
      });
      setMessages([welcomeMsg]);
    } catch (error) {
      console.error("Error starting chat:", error);
      alert("Không thể bắt đầu cuộc trò chuyện. Vui lòng thử lại!");
    } finally {
      setLoading(false);
    }
  };

  // Send message with optimistic update
  const handleSend = async () => {
    if (!newMessage.trim() || !room || !user || sending) return;

    setSending(true);
    const messageContent = newMessage.trim();
    setNewMessage("");

    // Create optimistic message (hiển thị ngay lập tức)
    const tempId = `temp-${Date.now()}`;
    const optimisticMessage: ChatMessage = {
      id: tempId,
      roomId: room.id,
      senderId: user.id,
      content: messageContent,
      type: "TEXT",
      isRead: false,
      createdAt: new Date().toISOString(),
      sender: {
        id: user.id,
        fullName: user.fullName,
        avatarUrl: user.avatarUrl,
      },
    };

    // Add message immediately to UI
    setMessages((prev) => [...prev, optimisticMessage]);

    try {
      const msg = await chatService.sendMessage({
        roomId: room.id,
        senderId: user.id,
        content: messageContent,
        type: "TEXT",
      });

      // Replace temp message with real one (có real ID từ server)
      setMessages((prev) =>
        prev.map((m) =>
          m.id === tempId ? { ...msg, sender: optimisticMessage.sender } : m
        )
      );
    } catch (error) {
      console.error("Error sending message:", error);
      // Remove failed message and restore input
      setMessages((prev) => prev.filter((m) => m.id !== tempId));
      setNewMessage(messageContent);
      alert("Không thể gửi tin nhắn. Vui lòng thử lại!");
    } finally {
      setSending(false);
    }
  };

  // Handle Enter key
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Close chat
  const handleClose = () => {
    setIsOpen(false);
    setIsMinimized(false);
  };

  // Format time
  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Get status text
  const getStatusText = () => {
    if (!room) return "";
    switch (room.status) {
      case "WAITING":
        return "Đang chờ nhân viên...";
      case "ACTIVE":
        return room.staff?.fullName
          ? `Đang chat với ${room.staff.fullName}`
          : "Đang hoạt động";
      case "RESOLVED":
        return "Đã giải quyết";
      case "CLOSED":
        return "Đã đóng";
      default:
        return "";
    }
  };

  // Render message
  const renderMessage = (msg: ChatMessage) => {
    const isOwn = msg.senderId === user?.id;
    const isSystem = msg.type === "SYSTEM";

    if (isSystem) {
      return (
        <div key={msg.id} className="flex justify-center my-2">
          <span className="text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
            {msg.content}
          </span>
        </div>
      );
    }

    return (
      <div
        key={msg.id}
        className={`flex mb-3 ${isOwn ? "justify-end" : "justify-start"}`}
      >
        <div className={`max-w-[80%] ${isOwn ? "order-2" : "order-1"}`}>
          {!isOwn && msg.sender && (
            <span className="text-xs text-gray-500 mb-1 block">
              {msg.sender.fullName}
            </span>
          )}
          <div
            className={`px-4 py-2 rounded-2xl ${
              isOwn
                ? "bg-amber-600 text-white rounded-br-sm"
                : "bg-gray-100 text-gray-800 rounded-bl-sm"
            }`}
          >
            <p className="text-sm whitespace-pre-wrap break-words">
              {msg.content}
            </p>
          </div>
          <span
            className={`text-xs text-gray-400 mt-1 block ${
              isOwn ? "text-right" : ""
            }`}
          >
            {formatTime(msg.createdAt)}
            {isOwn && msg.isRead && " ✓"}
          </span>
        </div>
      </div>
    );
  };

  // Show login prompt for guests
  const renderGuestPrompt = () => (
    <div className="flex flex-col items-center justify-center h-full text-center p-6">
      <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mb-4">
        <ChatIcon />
      </div>
      <h4 className="font-semibold text-gray-800 mb-2">Chào bạn!</h4>
      <p className="text-sm text-gray-500 mb-4">
        Vui lòng đăng nhập để sử dụng tính năng chat hỗ trợ.
        <br />
        Chúng tôi sẽ phản hồi bạn nhanh nhất có thể!
      </p>
      <a
        href="/login"
        className="bg-amber-600 text-white px-6 py-2 rounded-full hover:bg-amber-700 transition-colors font-medium"
      >
        Đăng nhập ngay
      </a>
    </div>
  );

  return (
    <>
      {/* Floating Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className={`fixed bottom-6 right-6 z-50 w-14 h-14 bg-amber-600 text-white rounded-full shadow-lg hover:bg-amber-700 transition-all duration-300 hover:scale-110 flex items-center justify-center group ${
            hasNewMessage ? "animate-bounce" : ""
          }`}
          title="Chat với chúng tôi"
        >
          <ChatIcon />
          {/* Notification badge */}
          {(hasNewMessage || unreadCount > 0) && (
            <span className="absolute -top-1 -right-1 min-w-[20px] h-5 px-1 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center animate-pulse">
              {unreadCount > 0 ? (unreadCount > 9 ? "9+" : unreadCount) : "!"}
            </span>
          )}
          {/* Tooltip */}
          <span className="absolute right-full mr-3 bg-gray-800 text-white text-sm px-3 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
            {hasNewMessage ? "Có tin nhắn mới!" : "Chat hỗ trợ"}
          </span>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div
          className={`fixed bottom-6 right-6 z-50 bg-white rounded-2xl shadow-2xl overflow-hidden transition-all duration-300 ${
            isMinimized ? "w-72 h-14" : "w-96 h-[500px] sm:h-[550px]"
          }`}
          style={{ maxHeight: "calc(100vh - 100px)" }}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-amber-600 to-amber-700 text-white p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <ChatIcon />
              </div>
              <div>
                <h3 className="font-semibold">Hỗ trợ trực tuyến</h3>
                {room && !isMinimized && (
                  <p className="text-xs text-amber-100">{getStatusText()}</p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="p-1 hover:bg-white/20 rounded transition-colors"
                title={isMinimized ? "Mở rộng" : "Thu nhỏ"}
              >
                <MinimizeIcon />
              </button>
              <button
                onClick={handleClose}
                className="p-1 hover:bg-white/20 rounded transition-colors"
                title="Đóng"
              >
                <CloseIcon />
              </button>
            </div>
          </div>

          {/* Body */}
          {!isMinimized && (
            <>
              {/* Messages Area */}
              <div
                ref={chatContainerRef}
                className="h-[calc(100%-150px)] overflow-y-auto p-4 bg-gray-50"
              >
                {loading ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600"></div>
                  </div>
                ) : !user ? (
                  // Guest view
                  renderGuestPrompt()
                ) : !room ? (
                  // Start Chat View
                  <div className="flex flex-col items-center justify-center h-full text-center">
                    <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mb-4">
                      <ChatIcon />
                    </div>
                    <h4 className="font-semibold text-gray-800 mb-2">
                      Chào bạn, {user.fullName}!
                    </h4>
                    <p className="text-sm text-gray-500 mb-4">
                      Bạn cần hỗ trợ về sản phẩm hoặc đơn hàng?
                      <br />
                      Nhân viên sẽ phản hồi trong thời gian sớm nhất.
                    </p>

                    {/* Show chat history if exists */}
                    {chatHistory.length > 0 && (
                      <button
                        onClick={() => setShowHistory(!showHistory)}
                        className="text-amber-600 hover:text-amber-700 text-sm mb-3 underline"
                      >
                        {showHistory
                          ? "Ẩn lịch sử chat"
                          : `Xem lịch sử chat (${chatHistory.length} tin nhắn)`}
                      </button>
                    )}

                    {showHistory && chatHistory.length > 0 && (
                      <div className="w-full max-h-40 overflow-y-auto mb-4 text-left bg-white rounded-lg p-3 border">
                        {chatHistory.map(renderMessage)}
                      </div>
                    )}

                    <button
                      onClick={startChat}
                      disabled={loading}
                      className="bg-amber-600 text-white px-6 py-2 rounded-full hover:bg-amber-700 transition-colors font-medium"
                    >
                      Bắt đầu trò chuyện mới
                    </button>
                  </div>
                ) : (
                  // Messages View
                  <>
                    {messages.length === 0 ? (
                      <div className="text-center text-gray-500 text-sm py-8">
                        Bắt đầu cuộc trò chuyện...
                      </div>
                    ) : (
                      messages.map(renderMessage)
                    )}
                    <div ref={messagesEndRef} />
                  </>
                )}
              </div>

              {/* Input Area */}
              {room &&
                (room.status === "WAITING" || room.status === "ACTIVE") && (
                  <div className="absolute bottom-0 left-0 right-0 bg-white border-t p-3">
                    <div className="flex items-center gap-2">
                      <input
                        ref={inputRef}
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Nhập tin nhắn..."
                        className="flex-1 px-4 py-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm"
                        disabled={sending}
                      />
                      <button
                        onClick={handleSend}
                        disabled={!newMessage.trim() || sending}
                        className="w-10 h-10 bg-amber-600 text-white rounded-full flex items-center justify-center hover:bg-amber-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {sending ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                        ) : (
                          <SendIcon />
                        )}
                      </button>
                    </div>
                  </div>
                )}

              {/* Closed Room Message */}
              {room &&
                (room.status === "RESOLVED" || room.status === "CLOSED") && (
                  <div className="absolute bottom-0 left-0 right-0 bg-gray-100 border-t p-4 text-center">
                    <p className="text-sm text-gray-600 mb-2">
                      {room.status === "RESOLVED"
                        ? "✅ Cuộc trò chuyện đã được giải quyết."
                        : "Cuộc trò chuyện đã kết thúc."}
                    </p>
                    <button
                      onClick={() => {
                        // Save current messages to history before clearing
                        if (messages.length > 0) {
                          setChatHistory(messages);
                        }
                        setRoom(null);
                        setMessages([]);
                      }}
                      className="text-amber-600 hover:text-amber-700 text-sm font-medium"
                    >
                      Bắt đầu cuộc trò chuyện mới
                    </button>
                  </div>
                )}
            </>
          )}
        </div>
      )}
    </>
  );
};

export default CustomerChatWidget;
