// Admin Chat Dashboard - Staff chat management with proper Realtime
import React, { useState, useEffect, useRef, useCallback } from "react";
import { useAuth } from "../../context/AuthContext";
import {
  chatService,
  ChatRoom,
  ChatMessage,
} from "../../services/chat.service";
import { supabase } from "../../lib/supabase";
import {
  MessageCircle,
  Send,
  User,
  Phone,
  Mail,
  Clock,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Inbox,
  MessageSquare,
  ChevronRight,
  Smile,
  History,
  Search,
  Calendar,
  AlertTriangle,
} from "lucide-react";

type TabType = "waiting" | "active" | "history";

export const AdminChatDashboard: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>("waiting");
  const [waitingRooms, setWaitingRooms] = useState<ChatRoom[]>([]);
  const [activeRooms, setActiveRooms] = useState<ChatRoom[]>([]);
  const [historyRooms, setHistoryRooms] = useState<ChatRoom[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<ChatRoom | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [showQuickReplies, setShowQuickReplies] = useState(false);
  const [historySearch, setHistorySearch] = useState("");
  const [historyDateFilter, setHistoryDateFilter] = useState("");
  const [showCloseModal, setShowCloseModal] = useState<
    "resolved" | "closed" | null
  >(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Focus input when room selected
  useEffect(() => {
    if (selectedRoom && inputRef.current) {
      inputRef.current.focus();
    }
  }, [selectedRoom]);

  // Load rooms
  const loadRooms = useCallback(async () => {
    if (!user) return;

    try {
      const [waiting, active] = await Promise.all([
        chatService.getWaitingRooms(),
        chatService.getStaffRooms(user.id),
      ]);
      setWaitingRooms(waiting);
      // Filter active rooms (only ACTIVE status)
      setActiveRooms(active.filter((r) => r.status === "ACTIVE"));
    } catch (error) {
      console.error("Error loading rooms:", error);
    }
  }, [user]);

  // Load chat history (resolved/closed rooms)
  const loadHistory = useCallback(async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("ChatRoom")
        .select(
          `
          *,
          customer:User!ChatRoom_customerId_fkey(id, fullName, avatarUrl, email),
          staff:User!ChatRoom_staffId_fkey(id, fullName)
        `
        )
        .in("status", ["RESOLVED", "CLOSED"])
        .order("updatedAt", { ascending: false })
        .limit(100);

      if (!error && data) {
        setHistoryRooms(data);
      }
    } catch (error) {
      console.error("Error loading history:", error);
    }
  }, [user]);

  useEffect(() => {
    loadRooms();
  }, [loadRooms]);

  // Load history when tab switches to history
  useEffect(() => {
    if (activeTab === "history") {
      loadHistory();
    }
  }, [activeTab, loadHistory]);

  // ✅ REALTIME: Subscribe to ChatRoom changes
  useEffect(() => {
    if (!user) return;

    console.log("🔌 [ADMIN CHAT] Setting up realtime subscriptions...");

    const roomChannel = supabase
      .channel("admin-chat-rooms")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "ChatRoom",
        },
        (payload) => {
          console.log("📨 [ADMIN CHAT] Room change:", payload.eventType);

          if (payload.eventType === "INSERT") {
            const newRoom = payload.new as ChatRoom;
            if (newRoom.status === "WAITING") {
              // Reload to get customer info
              loadRooms();
            }
          } else if (payload.eventType === "UPDATE") {
            const updatedRoom = payload.new as ChatRoom;

            // Update waiting rooms
            setWaitingRooms((prev) =>
              prev.filter((r) => r.id !== updatedRoom.id)
            );

            // Update active rooms
            if (
              updatedRoom.status === "ACTIVE" &&
              updatedRoom.staffId === user.id
            ) {
              loadRooms(); // Reload to get full data
            } else if (
              updatedRoom.status === "RESOLVED" ||
              updatedRoom.status === "CLOSED"
            ) {
              setActiveRooms((prev) =>
                prev.filter((r) => r.id !== updatedRoom.id)
              );
              if (selectedRoom?.id === updatedRoom.id) {
                setSelectedRoom(null);
              }
            }
          }
        }
      )
      .subscribe();

    return () => {
      console.log("🔌 [ADMIN CHAT] Cleaning up room subscription");
      supabase.removeChannel(roomChannel);
    };
  }, [user, loadRooms, selectedRoom]);

  // ✅ REALTIME: Subscribe to messages for selected room
  useEffect(() => {
    if (!selectedRoom) return;

    console.log(
      "🔌 [ADMIN CHAT] Subscribing to messages for room:",
      selectedRoom.id
    );

    const messageChannel = supabase
      .channel(`admin-chat-messages-${selectedRoom.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "ChatMessage",
          filter: `roomId=eq.${selectedRoom.id}`,
        },
        async (payload) => {
          console.log("📨 [ADMIN CHAT] New message received");
          const newMsg = payload.new as ChatMessage;

          // Fetch sender info
          if (newMsg.senderId) {
            const { data: sender } = await supabase
              .from("User")
              .select("id, fullName, avatarUrl")
              .eq("id", newMsg.senderId)
              .single();
            if (sender) {
              newMsg.sender = sender;
            }
          }

          setMessages((prev) => {
            // Check for duplicate by real ID
            if (prev.some((m) => m.id === newMsg.id)) return prev;

            // Check if we have optimistic message with same content from same sender
            const tempIdx = prev.findIndex(
              (m) =>
                m.id.startsWith("temp-") &&
                m.senderId === newMsg.senderId &&
                m.content === newMsg.content
            );

            if (tempIdx >= 0) {
              // Replace temp message with real one
              const updated = [...prev];
              updated[tempIdx] = newMsg;
              return updated;
            }

            return [...prev, newMsg];
          });

          // Mark as read
          if (user && newMsg.senderId !== user.id) {
            chatService.markMessagesAsRead(selectedRoom.id, user.id);
          }
        }
      )
      .subscribe();

    return () => {
      console.log("🔌 [ADMIN CHAT] Cleaning up message subscription");
      supabase.removeChannel(messageChannel);
    };
  }, [selectedRoom, user]);

  // Load messages when room selected
  useEffect(() => {
    if (!selectedRoom) {
      setMessages([]);
      return;
    }

    const loadMessages = async () => {
      setLoading(true);
      try {
        const msgs = await chatService.getMessages(selectedRoom.id);
        setMessages(msgs);
        // Mark as read
        if (user) {
          await chatService.markMessagesAsRead(selectedRoom.id, user.id);
        }
      } catch (error) {
        console.error("Error loading messages:", error);
      } finally {
        setLoading(false);
      }
    };

    loadMessages();
  }, [selectedRoom, user]);

  // Accept room
  const handleAcceptRoom = async (room: ChatRoom) => {
    if (!user) return;

    try {
      const accepted = await chatService.acceptRoom(room.id, user.id);
      // Move from waiting to active
      setWaitingRooms((prev) => prev.filter((r) => r.id !== room.id));
      setActiveRooms((prev) => [accepted, ...prev]);
      setSelectedRoom(accepted);
      setActiveTab("active");
    } catch (error) {
      console.error("Error accepting room:", error);
      alert("Không thể tiếp nhận cuộc trò chuyện này.");
    }
  };

  // Close room
  const handleCloseRoom = async (resolved: boolean = true) => {
    if (!selectedRoom) return;

    try {
      await chatService.closeRoom(
        selectedRoom.id,
        resolved ? "RESOLVED" : "CLOSED"
      );
      // Remove from active list
      setActiveRooms((prev) => prev.filter((r) => r.id !== selectedRoom.id));
      setSelectedRoom(null);
      setMessages([]);
    } catch (error) {
      console.error("Error closing room:", error);
      alert("Không thể đóng cuộc trò chuyện.");
    }
  };

  // Send message with optimistic update
  const handleSend = async () => {
    if (!newMessage.trim() || !selectedRoom || !user || sending) return;

    setSending(true);
    const content = newMessage.trim();
    setNewMessage("");

    // Create optimistic message
    const tempId = `temp-${Date.now()}`;
    const optimisticMessage: ChatMessage = {
      id: tempId,
      roomId: selectedRoom.id,
      senderId: user.id,
      content,
      type: "TEXT",
      isRead: false,
      createdAt: new Date().toISOString(),
      sender: {
        id: user.id,
        fullName: user.fullName,
        avatarUrl: user.avatarUrl,
      },
    };

    // Add message immediately
    setMessages((prev) => [...prev, optimisticMessage]);

    try {
      const msg = await chatService.sendMessage({
        roomId: selectedRoom.id,
        senderId: user.id,
        content,
        type: "TEXT",
      });

      // Replace temp message with real one
      setMessages((prev) =>
        prev.map((m) =>
          m.id === tempId ? { ...msg, sender: optimisticMessage.sender } : m
        )
      );
    } catch (error) {
      console.error("Error sending message:", error);
      // Remove failed message and restore input
      setMessages((prev) => prev.filter((m) => m.id !== tempId));
      setNewMessage(content);
      alert("Không thể gửi tin nhắn.");
    } finally {
      setSending(false);
    }
  };

  // Handle Enter
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Quick reply
  const handleQuickReply = (text: string) => {
    setNewMessage(text);
    setShowQuickReplies(false);
    inputRef.current?.focus();
  };

  // Refresh
  const handleRefresh = async () => {
    setRefreshing(true);
    await loadRooms();
    setRefreshing(false);
  };

  // Format time
  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();

    if (diff < 60000) return "Vừa xong";
    if (diff < 3600000) return `${Math.floor(diff / 60000)} phút trước`;
    if (diff < 86400000)
      return date.toLocaleTimeString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
      });
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
    });
  };

  // Get status badge
  const getStatusBadge = (status: string) => {
    const badges: Record<string, { bg: string; text: string; label: string }> =
      {
        WAITING: {
          bg: "bg-amber-100",
          text: "text-amber-700",
          label: "Chờ tiếp nhận",
        },
        ACTIVE: {
          bg: "bg-emerald-100",
          text: "text-emerald-700",
          label: "Đang chat",
        },
        RESOLVED: {
          bg: "bg-blue-100",
          text: "text-blue-700",
          label: "Đã giải quyết",
        },
        CLOSED: { bg: "bg-gray-100", text: "text-gray-700", label: "Đã đóng" },
      };

    const badge = badges[status];
    if (!badge) return null;

    return (
      <span
        className={`px-2 py-0.5 text-xs font-medium rounded-full ${badge.bg} ${badge.text}`}
      >
        {badge.label}
      </span>
    );
  };

  // Room card render function (not a component to avoid key prop issue)
  const renderRoomCard = (room: ChatRoom, showAccept: boolean = false) => {
    const isSelected = selectedRoom?.id === room.id;
    const customer = room.customer;

    return (
      <div
        onClick={() => !showAccept && setSelectedRoom(room)}
        className={`group p-4 border-b border-gray-100 cursor-pointer transition-all duration-200 ${
          isSelected
            ? "bg-gradient-to-r from-amber-50 to-orange-50 border-l-4 border-l-amber-500"
            : "hover:bg-gray-50"
        }`}
      >
        <div className="flex items-start gap-3">
          {/* Avatar */}
          <div className="relative flex-shrink-0">
            <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center overflow-hidden shadow-sm">
              {customer?.avatarUrl ? (
                <img
                  src={customer.avatarUrl}
                  alt=""
                  className="w-12 h-12 rounded-full object-cover"
                />
              ) : (
                <User className="w-6 h-6 text-white" />
              )}
            </div>
            {room.status === "ACTIVE" && (
              <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full"></span>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <h4 className="font-semibold text-gray-900 truncate">
                {customer?.fullName || "Khách hàng"}
              </h4>
              {getStatusBadge(room.status)}
            </div>

            <div className="flex items-center gap-2 text-xs text-gray-500">
              <Clock className="w-3 h-3" />
              <span>{formatTime(room.createdAt)}</span>
            </div>

            {room.orderCode && (
              <div className="mt-1 text-xs text-amber-600 font-medium">
                🛒 Đơn hàng: {room.orderCode}
              </div>
            )}
          </div>

          {/* Arrow */}
          {!showAccept && (
            <ChevronRight
              className={`w-5 h-5 text-gray-400 flex-shrink-0 transition-transform group-hover:translate-x-1 ${
                isSelected ? "text-amber-500" : ""
              }`}
            />
          )}
        </div>

        {/* Accept button */}
        {showAccept && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleAcceptRoom(room);
            }}
            className="mt-3 w-full py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl hover:from-amber-600 hover:to-orange-600 transition-all duration-200 text-sm font-semibold shadow-sm hover:shadow-md flex items-center justify-center gap-2"
          >
            <MessageCircle className="w-4 h-4" />
            Tiếp nhận hỗ trợ
          </button>
        )}
      </div>
    );
  };

  // Message bubble render function
  const renderMessageBubble = (msg: ChatMessage) => {
    const isOwn = msg.senderId === user?.id;
    const isSystem = msg.type === "SYSTEM";

    if (isSystem) {
      return (
        <div key={msg.id} className="flex justify-center my-3">
          <span className="text-xs text-gray-500 bg-gray-100 px-4 py-1.5 rounded-full">
            {msg.content}
          </span>
        </div>
      );
    }

    return (
      <div
        key={msg.id}
        className={`flex mb-4 ${isOwn ? "justify-end" : "justify-start"}`}
      >
        {/* Avatar for others */}
        {!isOwn && (
          <div className="w-8 h-8 bg-gradient-to-br from-gray-300 to-gray-400 rounded-full flex items-center justify-center mr-2 flex-shrink-0">
            {msg.sender?.avatarUrl ? (
              <img
                src={msg.sender.avatarUrl}
                alt=""
                className="w-8 h-8 rounded-full"
              />
            ) : (
              <User className="w-4 h-4 text-white" />
            )}
          </div>
        )}

        <div className={`max-w-[70%]`}>
          {!isOwn && msg.sender && (
            <span className="text-xs text-gray-500 mb-1 block ml-1">
              {msg.sender.fullName}
            </span>
          )}
          <div
            className={`px-4 py-2.5 rounded-2xl shadow-sm ${
              isOwn
                ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-br-md"
                : "bg-white text-gray-800 rounded-bl-md border border-gray-100"
            }`}
          >
            <p className="text-sm whitespace-pre-wrap leading-relaxed">
              {msg.content}
            </p>
          </div>
          <span
            className={`text-xs text-gray-400 mt-1 block ${
              isOwn ? "text-right mr-1" : "ml-1"
            }`}
          >
            {formatTime(msg.createdAt)}
          </span>
        </div>
      </div>
    );
  };

  // Empty state
  const EmptyState = ({
    icon: Icon,
    title,
    subtitle,
  }: {
    icon: React.FC<{ className?: string }>;
    title: string;
    subtitle: string;
  }) => (
    <div className="flex flex-col items-center justify-center h-full text-gray-400 py-12">
      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
        <Icon className="w-8 h-8" />
      </div>
      <p className="font-medium text-gray-600">{title}</p>
      <p className="text-sm mt-1">{subtitle}</p>
    </div>
  );

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden h-[calc(100vh-180px)] min-h-[600px] border border-gray-100">
      <div className="flex h-full">
        {/* Left Panel - Room List */}
        <div className="w-80 border-r border-gray-100 flex flex-col bg-white flex-shrink-0">
          {/* Header */}
          <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-amber-500 to-orange-500">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-white flex items-center gap-2">
                <MessageCircle className="w-5 h-5" />
                Chat hỗ trợ
              </h2>
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors text-white"
                title="Làm mới"
              >
                <RefreshCw
                  className={`w-5 h-5 ${refreshing ? "animate-spin" : ""}`}
                />
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-gray-100 bg-gray-50">
            <button
              onClick={() => setActiveTab("waiting")}
              className={`flex-1 py-3 text-xs font-medium relative transition-colors ${
                activeTab === "waiting"
                  ? "text-amber-600 bg-white"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <div className="flex items-center justify-center gap-1">
                <Inbox className="w-4 h-4" />
                <span>Chờ</span>
                {waitingRooms.length > 0 && (
                  <span className="ml-0.5 px-1.5 py-0.5 text-xs bg-amber-500 text-white rounded-full min-w-[18px]">
                    {waitingRooms.length}
                  </span>
                )}
              </div>
              {activeTab === "waiting" && (
                <span className="absolute bottom-0 left-2 right-2 h-0.5 bg-amber-500 rounded-full"></span>
              )}
            </button>
            <button
              onClick={() => setActiveTab("active")}
              className={`flex-1 py-3 text-xs font-medium relative transition-colors ${
                activeTab === "active"
                  ? "text-amber-600 bg-white"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <div className="flex items-center justify-center gap-1">
                <MessageSquare className="w-4 h-4" />
                <span>Chat</span>
                {activeRooms.length > 0 && (
                  <span className="ml-0.5 px-1.5 py-0.5 text-xs bg-emerald-500 text-white rounded-full min-w-[18px]">
                    {activeRooms.length}
                  </span>
                )}
              </div>
              {activeTab === "active" && (
                <span className="absolute bottom-0 left-2 right-2 h-0.5 bg-amber-500 rounded-full"></span>
              )}
            </button>
            <button
              onClick={() => setActiveTab("history")}
              className={`flex-1 py-3 text-xs font-medium relative transition-colors ${
                activeTab === "history"
                  ? "text-amber-600 bg-white"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <div className="flex items-center justify-center gap-1">
                <History className="w-4 h-4" />
                <span>Lịch sử</span>
              </div>
              {activeTab === "history" && (
                <span className="absolute bottom-0 left-2 right-2 h-0.5 bg-amber-500 rounded-full"></span>
              )}
            </button>
          </div>

          {/* Room List */}
          <div className="flex-1 overflow-y-auto">
            {activeTab === "waiting" &&
              (waitingRooms.length > 0 ? (
                waitingRooms.map((room) => (
                  <React.Fragment key={`waiting-${room.id}`}>
                    {renderRoomCard(room, true)}
                  </React.Fragment>
                ))
              ) : (
                <EmptyState
                  icon={Inbox}
                  title="Không có yêu cầu mới"
                  subtitle="Các cuộc chat mới sẽ hiển thị ở đây"
                />
              ))}
            {activeTab === "active" &&
              (activeRooms.length > 0 ? (
                activeRooms.map((room) => (
                  <React.Fragment key={`active-${room.id}`}>
                    {renderRoomCard(room, false)}
                  </React.Fragment>
                ))
              ) : (
                <EmptyState
                  icon={MessageSquare}
                  title="Chưa có cuộc chat nào"
                  subtitle="Tiếp nhận yêu cầu từ tab Chờ"
                />
              ))}
            {activeTab === "history" && (
              <>
                {/* Search & Filter */}
                <div className="p-3 border-b border-gray-100 space-y-2 bg-white sticky top-0 z-10">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Tìm theo tên khách..."
                      value={historySearch}
                      onChange={(e) => setHistorySearch(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <input
                      type="date"
                      value={historyDateFilter}
                      onChange={(e) => setHistoryDateFilter(e.target.value)}
                      className="flex-1 px-2 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                    {historyDateFilter && (
                      <button
                        onClick={() => setHistoryDateFilter("")}
                        className="text-xs text-gray-500 hover:text-gray-700"
                      >
                        Xóa
                      </button>
                    )}
                  </div>
                </div>

                {/* History List */}
                {(() => {
                  const filtered = historyRooms.filter((room) => {
                    const nameMatch = historySearch
                      ? room.customer?.fullName
                          ?.toLowerCase()
                          .includes(historySearch.toLowerCase())
                      : true;
                    const dateMatch = historyDateFilter
                      ? room.updatedAt.startsWith(historyDateFilter)
                      : true;
                    return nameMatch && dateMatch;
                  });

                  return filtered.length > 0 ? (
                    filtered.map((room) => (
                      <React.Fragment key={`history-${room.id}`}>
                        {renderRoomCard(room, false)}
                      </React.Fragment>
                    ))
                  ) : (
                    <EmptyState
                      icon={History}
                      title="Không có lịch sử"
                      subtitle={
                        historySearch || historyDateFilter
                          ? "Thử điều chỉnh bộ lọc"
                          : "Chưa có cuộc chat nào đã kết thúc"
                      }
                    />
                  );
                })()}
              </>
            )}
          </div>
        </div>

        {/* Right Panel - Chat Area */}
        <div className="flex-1 flex flex-col bg-gradient-to-b from-gray-50 to-gray-100 min-w-0">
          {selectedRoom ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-gray-100 bg-white shadow-sm flex-shrink-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="relative flex-shrink-0">
                      <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center overflow-hidden shadow">
                        {selectedRoom.customer?.avatarUrl ? (
                          <img
                            src={selectedRoom.customer.avatarUrl}
                            alt=""
                            className="w-12 h-12 rounded-full object-cover"
                          />
                        ) : (
                          <User className="w-6 h-6 text-white" />
                        )}
                      </div>
                      {selectedRoom.status === "ACTIVE" && (
                        <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full"></span>
                      )}
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-semibold text-gray-900 truncate">
                        {selectedRoom.customer?.fullName || "Khách hàng"}
                      </h3>
                      <div className="flex items-center gap-4 text-xs text-gray-500 flex-wrap">
                        {(selectedRoom.customer as any)?.email && (
                          <span className="flex items-center gap-1">
                            <Mail className="w-3 h-3 flex-shrink-0" />
                            <span className="truncate">
                              {(selectedRoom.customer as any).email}
                            </span>
                          </span>
                        )}
                        {(selectedRoom.customer as any)?.phone && (
                          <span className="flex items-center gap-1">
                            <Phone className="w-3 h-3 flex-shrink-0" />
                            {(selectedRoom.customer as any).phone}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {selectedRoom.status === "ACTIVE" && (
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button
                        onClick={() => setShowCloseModal("resolved")}
                        className="px-4 py-2 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 transition-colors text-sm font-medium flex items-center gap-2 shadow-sm"
                        title="Đánh dấu vấn đề đã được giải quyết, lưu vào lịch sử"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span className="hidden sm:inline">Đã giải quyết</span>
                      </button>
                      <button
                        onClick={() => setShowCloseModal("closed")}
                        className="px-4 py-2 bg-gray-500 text-white rounded-xl hover:bg-gray-600 transition-colors text-sm font-medium flex items-center gap-2 shadow-sm"
                        title="Kết thúc cuộc trò chuyện (khách hàng không phản hồi)"
                      >
                        <XCircle className="w-4 h-4" />
                        <span className="hidden sm:inline">Kết thúc</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4">
                {loading ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="animate-spin rounded-full h-10 w-10 border-4 border-amber-500 border-t-transparent"></div>
                  </div>
                ) : messages.length > 0 ? (
                  <>
                    {messages.map((msg) => renderMessageBubble(msg))}
                    <div ref={messagesEndRef} />
                  </>
                ) : (
                  <EmptyState
                    icon={MessageCircle}
                    title="Chưa có tin nhắn"
                    subtitle="Bắt đầu cuộc trò chuyện ngay"
                  />
                )}
              </div>

              {/* Quick Replies */}
              {selectedRoom.status === "ACTIVE" && showQuickReplies && (
                <div className="px-4 py-3 border-t border-gray-100 bg-white flex-shrink-0">
                  <p className="text-xs text-gray-500 mb-2 font-medium">
                    Trả lời nhanh:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {chatService.quickReplies.map((reply, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleQuickReply(reply)}
                        className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-xs hover:bg-amber-100 hover:text-amber-700 transition-colors border border-gray-200"
                      >
                        {reply}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Input */}
              {selectedRoom.status === "ACTIVE" && (
                <div className="p-4 border-t border-gray-100 bg-white flex-shrink-0">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setShowQuickReplies(!showQuickReplies)}
                      className={`p-2.5 rounded-xl transition-colors flex-shrink-0 ${
                        showQuickReplies
                          ? "bg-amber-100 text-amber-600"
                          : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                      }`}
                      title="Trả lời nhanh"
                    >
                      <Smile className="w-5 h-5" />
                    </button>
                    <input
                      ref={inputRef}
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Nhập tin nhắn..."
                      className="flex-1 px-4 py-2.5 bg-gray-100 border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white transition-all min-w-0"
                      disabled={sending}
                    />
                    <button
                      onClick={handleSend}
                      disabled={!newMessage.trim() || sending}
                      className="w-11 h-11 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl flex items-center justify-center hover:from-amber-600 hover:to-orange-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md flex-shrink-0"
                    >
                      {sending ? (
                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                      ) : (
                        <Send className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* Closed Room Notice */}
              {(selectedRoom.status === "RESOLVED" ||
                selectedRoom.status === "CLOSED") && (
                <div className="p-4 border-t border-gray-100 bg-gray-50 text-center flex-shrink-0">
                  <div
                    className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl ${
                      selectedRoom.status === "RESOLVED"
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {selectedRoom.status === "RESOLVED" ? (
                      <CheckCircle2 className="w-5 h-5" />
                    ) : (
                      <XCircle className="w-5 h-5" />
                    )}
                    <span className="font-medium">
                      Cuộc trò chuyện đã{" "}
                      {selectedRoom.status === "RESOLVED"
                        ? "được giải quyết"
                        : "đóng"}
                    </span>
                  </div>
                </div>
              )}
            </>
          ) : (
            // No room selected
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <div className="w-24 h-24 bg-gradient-to-br from-amber-100 to-orange-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                  <MessageCircle className="w-12 h-12 text-amber-500" />
                </div>
                <h3 className="font-semibold text-gray-800 text-lg">
                  Chọn một cuộc trò chuyện
                </h3>
                <p className="text-gray-500 mt-2">
                  để bắt đầu hỗ trợ khách hàng
                </p>
                <div className="mt-6 flex items-center justify-center gap-4 text-sm flex-wrap">
                  <div className="flex items-center gap-2 text-amber-600">
                    <Inbox className="w-4 h-4" />
                    <span>{waitingRooms.length} đang chờ</span>
                  </div>
                  <div className="flex items-center gap-2 text-emerald-600">
                    <MessageSquare className="w-4 h-4" />
                    <span>{activeRooms.length} đang chat</span>
                  </div>
                  <div className="flex items-center gap-2 text-blue-600">
                    <History className="w-4 h-4" />
                    <span>{historyRooms.length} lịch sử</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Confirmation Modal */}
      {showCloseModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl">
            <div
              className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${
                showCloseModal === "resolved"
                  ? "bg-emerald-100"
                  : "bg-amber-100"
              }`}
            >
              {showCloseModal === "resolved" ? (
                <CheckCircle2 className="w-8 h-8 text-emerald-600" />
              ) : (
                <AlertTriangle className="w-8 h-8 text-amber-600" />
              )}
            </div>

            <h3 className="text-xl font-bold text-center text-gray-900 mb-2">
              {showCloseModal === "resolved"
                ? "Xác nhận giải quyết"
                : "Xác nhận kết thúc"}
            </h3>

            <div className="text-center text-gray-600 mb-6">
              {showCloseModal === "resolved" ? (
                <>
                  <p className="mb-2">
                    <strong>"Đã giải quyết"</strong> nghĩa là vấn đề của khách
                    hàng đã được hỗ trợ thành công.
                  </p>
                  <ul className="text-sm text-left bg-emerald-50 p-3 rounded-lg">
                    <li className="flex items-start gap-2 mb-1">
                      <span>✅</span>
                      <span>Cuộc trò chuyện sẽ được lưu vào lịch sử</span>
                    </li>
                    <li className="flex items-start gap-2 mb-1">
                      <span>✅</span>
                      <span>Khách hàng sẽ thấy trạng thái "Đã giải quyết"</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span>✅</span>
                      <span>Đánh giá tốt cho chất lượng hỗ trợ</span>
                    </li>
                  </ul>
                </>
              ) : (
                <>
                  <p className="mb-2">
                    <strong>"Kết thúc"</strong> dùng khi khách hàng không phản
                    hồi hoặc cần đóng mà không giải quyết được.
                  </p>
                  <ul className="text-sm text-left bg-amber-50 p-3 rounded-lg">
                    <li className="flex items-start gap-2 mb-1">
                      <span>⚠️</span>
                      <span>Cuộc trò chuyện sẽ bị đánh dấu là "Đã đóng"</span>
                    </li>
                    <li className="flex items-start gap-2 mb-1">
                      <span>⚠️</span>
                      <span>Khách hàng có thể bắt đầu chat mới</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span>⚠️</span>
                      <span>Lịch sử vẫn được lưu để xem lại</span>
                    </li>
                  </ul>
                </>
              )}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowCloseModal(null)}
                className="flex-1 py-2.5 px-4 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium"
              >
                Hủy bỏ
              </button>
              <button
                onClick={() => {
                  handleCloseRoom(showCloseModal === "resolved");
                  setShowCloseModal(null);
                }}
                className={`flex-1 py-2.5 px-4 text-white rounded-xl transition-colors font-medium ${
                  showCloseModal === "resolved"
                    ? "bg-emerald-500 hover:bg-emerald-600"
                    : "bg-amber-500 hover:bg-amber-600"
                }`}
              >
                Xác nhận
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminChatDashboard;
